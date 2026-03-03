const API_BASE = "http://localhost:3001";

export interface ExtractionResult {
  styles: string[];
  artists: string[];
  periods: string[];
  museums: string[];
}

export interface GeneratedFiles {
  note: {
    filename: string;
    content: string;
  };
  entities: Array<{
    type: string;
    filename: string;
    content: string;
  }>;
}

export interface ExtractResponse {
  extraction: ExtractionResult;
  files: GeneratedFiles;
}

export interface ExportResponse extends ExtractResponse {
  exported: {
    vaultPath: string;
    notePath: string;
    entities: Array<{
      type: string;
      filename: string;
      content: string;
      path: string;
      status: "created" | "updated";
    }>;
  };
}

export async function extractText(text: string): Promise<ExtractResponse> {
  const response = await fetch(`${API_BASE}/extract`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("Failed to extract text");
  }

  return response.json();
}

export async function exportToObsidian(
  text: string,
  vaultPath: string
): Promise<ExportResponse> {
  const response = await fetch(`${API_BASE}/export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, vaultPath }),
  });

  if (!response.ok) {
    throw new Error("Failed to export to Obsidian vault");
  }

  return response.json();
}

export function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
