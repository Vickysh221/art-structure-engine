import type { ExtractionResult } from "./types";

export async function extractStructure(text: string): Promise<ExtractionResult> {
  return {
    styles: ["北方文艺复兴"],
    artists: ["Jan van Eyck"],
    periods: ["15世纪"],
    museums: ["Uffizi"],
  };
}
