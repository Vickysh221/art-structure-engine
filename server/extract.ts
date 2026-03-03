import type { ExtractionResult } from "./types";

export async function extractStructure(text: string): Promise<ExtractionResult> {
  const prompt = `你是艺术史结构抽取器。请从输入文本中抽取如下字段，并仅返回 JSON：
{
  "styles": string[],
  "artists": string[],
  "periods": string[],
  "museums": string[]
}

要求：
1) 仅输出 JSON，不要额外说明。
2) 不确定时返回空数组。
3) 去重，保持简洁。

文本：\n${text}`;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3",
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status}`);
    }

    const data = (await response.json()) as { response?: string };
    const raw = data.response?.trim();

    if (!raw) {
      throw new Error("Ollama empty response");
    }

    const jsonText = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/, "")
      .trim();

    const parsed = JSON.parse(jsonText) as Partial<ExtractionResult>;

    return {
      styles: Array.isArray(parsed.styles) ? parsed.styles : [],
      artists: Array.isArray(parsed.artists) ? parsed.artists : [],
      periods: Array.isArray(parsed.periods) ? parsed.periods : [],
      museums: Array.isArray(parsed.museums) ? parsed.museums : [],
    };
  } catch (error) {
    console.warn("Falling back to mock extraction:", error);
    return {
      styles: ["北方文艺复兴"],
      artists: ["Jan van Eyck"],
      periods: ["15世纪"],
      museums: ["Uffizi"],
    };
  }
}
