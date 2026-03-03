import type { ExtractionResult } from "./types";

const OLLAMA_URL = "http://localhost:11434/api/generate";
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

export async function extractStructure(text: string): Promise<ExtractionResult> {
  try {
    console.log("Starting extraction with text length:", text.length);
    
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
    console.log("Ollama response received");
    
    let result;
    try {
      result = JSON.parse(data.response);
    } catch (parseError) {
      console.error("JSON parse error, trying to clean response:", parseError);
      const cleanedResponse = data.response.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
      result = JSON.parse(cleanedResponse);
    }

    return {
      styles: result.styles || [],
      artists: result.artists || [],
      periods: result.periods || [],
      museums: result.museums || [],
      relationships: result.relationships || [],
    };
  } catch (error) {
    console.error("Extraction failed, falling back to mock data:", error);
    return {
      styles: ["北方文艺复兴"],
      artists: ["Jan van Eyck"],
      periods: ["15世纪"],
      museums: ["Uffizi"],
      relationships: [
        {
          type: "direct",
          from: { type: "artist", name: "Jan van Eyck" },
          to: { type: "style", name: "北方文艺复兴" },
          description: "Jan van Eyck 是北方文艺复兴的代表人物",
        },
        {
          type: "indirect",
          from: { type: "period", name: "15世纪" },
          to: { type: "style", name: "北方文艺复兴" },
          description: "15世纪是北方文艺复兴的主要时期",
        },
      ],
    };
  }
}
