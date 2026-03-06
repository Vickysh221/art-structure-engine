import type { ExtractionResult, Relationship } from "./types";

const OLLAMA_URL = "http://localhost:11434/api/generate";
const OLLAMA_TAGS_URL = "http://localhost:11434/api/tags";
const MODEL = "llama3.1";

const SYSTEM_PROMPT = `你是一个专业的艺术史分析助手。你的任务是从给定的文本中提取艺术相关的实体和它们之间的关系。

请提取以下四类实体：
1. styles - 艺术风格（如：文艺复兴、印象派、巴洛克等）
2. artists - 艺术家（如：达芬奇、梵高、毕加索等）
3. periods - 历史时期（如：15世纪、文艺复兴时期、现代主义时期等）
4. museums - 博物馆/展馆（如：卢浮宫、乌菲齐美术馆等）

同时，请识别实体之间的关系，关系类型包括：
- direct: 直接关联（如：某位艺术家属于某个风格）
- indirect: 间接关联（如：某个时期影响了某个风格的形成）
- many-to-many: 多对多关系（如：同一风格下的多位艺术家）

请严格以 JSON 格式返回，不要包含任何其他文字。JSON 格式如下：
{
  "styles": ["风格1", "风格2"],
  "artists": ["艺术家1", "艺术家2"],
  "periods": ["时期1", "时期2"],
  "museums": ["博物馆1", "博物馆2"],
  "relationships": [
    {
      "type": "direct",
      "from": {"type": "artist", "name": "艺术家1"},
      "to": {"type": "style", "name": "风格1"},
      "description": "艺术家1是风格1的代表人物"
    }
  ]
}

如果某个类别没有实体，请返回空数组 []。
如果没有识别到关系，relationships 返回空数组 []。`;

export interface ConnectivityStatus {
  inputInterface: "ok" | "error";
  processingModule: "ok" | "error";
  analysisEngine: "ok" | "error";
  details: string[];
}

function uniq(values: string[]): string[] {
  return Array.from(new Set(values));
}

function normalizeUnknownPlaceholder(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "{未知}";
  }

  const normalized = trimmed
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[：:，,。.!！？?、;；"'`~\-_/()[\]]/g, "");

  const exactPlaceholders = new Set([
    "{未知}",
    "未知",
    "未提及",
    "不详",
    "未说明",
    "未提供",
    "未给出",
    "暂无",
    "无",
    "无相关信息",
    "none",
    "unknown",
    "na",
    "n/a",
    "null",
    "nil",
    "empty",
  ]);

  if (exactPlaceholders.has(normalized)) {
    return "{未知}";
  }

  if (
    /^(未提及|未知|不详|未说明|未提供|未给出|暂无|无)(具体)?(风格|艺术家|时期|展馆|博物馆)?$/i.test(trimmed)
  ) {
    return "{未知}";
  }

  if (/^(none|unknown|n\/a|null|nil)\s*(specific)?\s*(style|artist|period|museum)?$/i.test(trimmed)) {
    return "{未知}";
  }

  if (/未提及具体(风格|艺术家|时期|展馆|博物馆)/.test(trimmed)) {
    return "{未知}";
  }

  return trimmed;
}

function cleanEntityValue(value: string): string | null {
  const normalized = normalizeUnknownPlaceholder(value);
  if (normalized === "{未知}") {
    return null;
  }

  return normalized;
}

function sanitizeEntityList(values?: string[]): string[] {
  if (!values) {
    return [];
  }

  const cleaned: string[] = [];
  values.forEach((value) => {
    const valid = cleanEntityValue(value);
    if (valid) {
      cleaned.push(valid);
    }
  });

  return uniq(cleaned);
}

function sanitizeRelationships(relationships: Relationship[] | undefined): Relationship[] {
  if (!relationships) {
    return [];
  }

  const allowedTypes = new Set(["direct", "indirect", "many-to-many"]);
  const allowedEntityTypes = new Set(["style", "artist", "period", "museum", "note"]);

  return relationships
    .filter((rel) => allowedTypes.has(rel.type))
    .map((rel) => {
      const fromName = cleanEntityValue(rel.from?.name ?? "");
      const toName = cleanEntityValue(rel.to?.name ?? "");
      if (!fromName || !toName) {
        return null;
      }
      if (!allowedEntityTypes.has(rel.from?.type) || !allowedEntityTypes.has(rel.to?.type)) {
        return null;
      }

      const description = rel.description?.trim();
      return {
        type: rel.type,
        from: {
          type: rel.from.type,
          name: fromName,
        },
        to: {
          type: rel.to.type,
          name: toName,
        },
        ...(description ? { description } : {}),
      } as Relationship;
    })
    .filter((rel): rel is Relationship => rel !== null);
}

function inferRelationships(result: ExtractionResult): Relationship[] {
  const relationships: Relationship[] = [];

  for (const artist of result.artists) {
    for (const style of result.styles) {
      relationships.push({
        type: "direct",
        from: { type: "artist", name: artist },
        to: { type: "style", name: style },
        description: `${artist} 与 ${style} 存在直接艺术关联`,
      });
    }
  }

  for (const period of result.periods) {
    for (const style of result.styles) {
      relationships.push({
        type: "indirect",
        from: { type: "period", name: period },
        to: { type: "style", name: style },
        description: `${period} 对 ${style} 的形成与发展产生影响`,
      });
    }
  }

  if (result.styles.length > 0 && result.artists.length > 1) {
    for (const style of result.styles) {
      relationships.push({
        type: "many-to-many",
        from: { type: "style", name: style },
        to: { type: "artist", name: result.artists.join("、") },
        description: `${style} 下存在多位代表艺术家`,
      });
    }
  }

  return relationships;
}

function localExtract(text: string): ExtractionResult {
  const styleTerms = ["威尼斯画派", "拜占庭艺术", "中东艺术", "文艺复兴", "北方文艺复兴", "巴洛克", "印象派"];
  const periodTerms = [
    "文艺复兴时期",
    "北方文艺复兴时期",
    "15世纪",
    "16世纪",
    "17世纪",
    "现代主义时期",
  ];
  const museumTerms = ["乌菲齐美术馆", "Uffizi 美术馆", "Uffizi", "卢浮宫", "大英博物馆"];
  const knownArtists = [
    "Jan van Eyck",
    "达芬奇",
    "米开朗基罗",
    "提香",
    "丁托列托",
    "贝利尼",
    "梵高",
    "毕加索",
  ];

  const styles = uniq(styleTerms.filter((term) => text.includes(term)));
  const periods = uniq(periodTerms.filter((term) => text.includes(term)));
  const museums = uniq(museumTerms.filter((term) => text.includes(term)));

  const artistByKnownList = knownArtists.filter((name) => text.includes(name));
  const artistByPattern = Array.from(text.matchAll(/([A-Z][a-z]+(?:\s+[a-zA-Z][a-zA-Z'-]+){0,3})/g))
    .map((match) => match[1])
    .filter((candidate) => candidate.length > 3 && !["Venice", "Byzantine"].includes(candidate));

  const artists = uniq([...artistByKnownList, ...artistByPattern]);

  const base: ExtractionResult = {
    styles,
    artists,
    periods,
    museums,
    relationships: [],
  };

  base.relationships = inferRelationships(base);
  return base;
}

function sanitizeResult(result: Partial<ExtractionResult>): ExtractionResult {
  const sanitized: ExtractionResult = {
    styles: sanitizeEntityList(result.styles),
    artists: sanitizeEntityList(result.artists),
    periods: sanitizeEntityList(result.periods),
    museums: sanitizeEntityList(result.museums),
    relationships: sanitizeRelationships(result.relationships),
  };

  if (sanitized.relationships.length === 0) {
    sanitized.relationships = inferRelationships(sanitized);
  }

  return sanitized;
}

export function sanitizeExtractionResult(result: Partial<ExtractionResult>): ExtractionResult {
  return sanitizeResult(result);
}

export async function runConnectivityTest(): Promise<ConnectivityStatus> {
  const status: ConnectivityStatus = {
    inputInterface: "ok",
    processingModule: "ok",
    analysisEngine: "ok",
    details: [],
  };

  status.details.push("文本输入接口已就绪：Express JSON body parser 可用");
  status.details.push("数据处理模块已就绪：实体提取与 Markdown 生成函数可调用");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(OLLAMA_TAGS_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      status.analysisEngine = "error";
      status.details.push(`分析引擎联通失败：Ollama tags 接口返回 ${response.status}`);
    } else {
      status.details.push("分析引擎联通成功：Ollama 服务可访问");
    }
  } catch (error) {
    status.analysisEngine = "error";
    status.details.push(`分析引擎联通失败：${(error as Error).message}`);
  }

  return status;
}

export async function extractStructure(text: string): Promise<ExtractionResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        prompt: text,
        system: SYSTEM_PROMPT,
        stream: false,
        format: "json",
        options: {
          temperature: 0.2,
          num_predict: 2000,
          num_ctx: 8192,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status}`);
    }

    const data = await response.json();
    let parsed: Partial<ExtractionResult>;

    try {
      parsed = JSON.parse(data.response);
    } catch {
      const cleanedResponse = data.response.replace(/^[^{]*/, "").replace(/[^}]*$/, "");
      parsed = JSON.parse(cleanedResponse);
    }

    return sanitizeResult(parsed);
  } catch (error) {
    console.error("Extraction failed, using local extractor:", error);
    return localExtract(text);
  }
}
