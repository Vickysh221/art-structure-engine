const API_BASE = "http://localhost:3001";


async function buildApiError(response: Response, fallbackMessage: string): Promise<Error> {
  try {
    const data = (await response.json()) as {
      error?: string;
      code?: string;
      details?: string;
      suggestion?: string;
    };

    const parts = [data.error, data.code ? `code=${data.code}` : undefined, data.details, data.suggestion]
      .filter(Boolean)
      .join(" | ");

    return new Error(parts || `${fallbackMessage} (HTTP ${response.status})`);
  } catch {
    return new Error(`${fallbackMessage} (HTTP ${response.status})`);
  }
}

export type EntityType = "style" | "artist" | "period" | "museum" | "note";

export interface Relationship {
  type: "direct" | "indirect" | "many-to-many";
  from: {
    type: EntityType;
    name: string;
  };
  to: {
    type: EntityType;
    name: string;
  };
  description?: string;
}

export interface ExtractionResult {
  styles: string[];
  artists: string[];
  periods: string[];
  museums: string[];
  relationships: Relationship[];
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

export interface ValidateVaultPathResponse {
  ok: boolean;
  vaultPath: string;
  message: string;
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
    throw await buildApiError(response, "Failed to extract text");
  }

  return response.json();
}



export async function validateVaultPath(vaultPath: string): Promise<ValidateVaultPathResponse> {
  const response = await fetch(`${API_BASE}/export/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ vaultPath }),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("后端暂不支持路径自检接口 /export/validate（404）。请重启并更新后端服务到最新版本。你仍可直接点击“导入到 Obsidian”。");
    }

    throw await buildApiError(response, "Failed to validate vault path");
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
    throw await buildApiError(response, "Failed to export to Obsidian vault");
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

export function getRelationshipLabel(type: Relationship["type"]): string {
  const labels: Record<Relationship["type"], string> = {
    direct: "直接关联",
    indirect: "间接关联",
    "many-to-many": "多对多关联",
  };
  return labels[type];
}
