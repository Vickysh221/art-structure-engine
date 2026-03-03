import type { ExtractionResult, GeneratedFiles, EntityType } from "./types";

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateNoteFilename(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const randomStr = Math.random().toString(36).substr(2, 8);
  return `${dateStr}-${randomStr}.md`;
}

function generateNoteContent(text: string, extraction: ExtractionResult): string {
  let content = "# 导入笔记\n\n## 原始文本\n\n";
  content += text + "\n\n";
  content += "## 结构信息\n\n";

  if (extraction.styles.length > 0) {
    content += "- 风格：\n";
    extraction.styles.forEach((style) => {
      content += `  - [[${style}]]\n`;
    });
  }

  if (extraction.artists.length > 0) {
    content += "- 艺术家：\n";
    extraction.artists.forEach((artist) => {
      content += `  - [[${artist}]]\n`;
    });
  }

  if (extraction.periods.length > 0) {
    content += "- 时期：\n";
    extraction.periods.forEach((period) => {
      content += `  - [[${period}]]\n`;
    });
  }

  if (extraction.museums.length > 0) {
    content += "- 展馆：\n";
    extraction.museums.forEach((museum) => {
      content += `  - [[${museum}]]\n`;
    });
  }

  return content;
}

function generateEntityContent(
  name: string,
  type: Exclude<EntityType, "note">,
  noteFilename: string
): string {
  const noteLink = noteFilename.replace(".md", "");
  return `# ${name}

## 类型
${type}

## 关联笔记
- [[${noteLink}]]
`;
}

export function generateMarkdownFiles(
  text: string,
  extraction: ExtractionResult
): GeneratedFiles {
  const noteFilename = generateNoteFilename();
  const noteContent = generateNoteContent(text, extraction);

  const entities: GeneratedFiles["entities"] = [];

  const typeMap: Record<Exclude<EntityType, "note">, string[]> = {
    style: extraction.styles,
    artist: extraction.artists,
    period: extraction.periods,
    museum: extraction.museums,
  };

  Object.entries(typeMap).forEach(([type, names]) => {
    names.forEach((name) => {
      const filename = `${toKebabCase(name)}.md`;
      const content = generateEntityContent(
        name,
        type as Exclude<EntityType, "note">,
        noteFilename
      );
      entities.push({
        type: type as EntityType,
        filename,
        content,
      });
    });
  });

  return {
    note: {
      filename: noteFilename,
      content: noteContent,
    },
    entities,
  };
}
