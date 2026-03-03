import type { ExtractionResult, GeneratedFiles, EntityType, Relationship } from "./types";

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

function getRelationshipLabel(type: Relationship["type"]): string {
  const labels: Record<Relationship["type"], string> = {
    direct: "直接关联",
    indirect: "间接关联",
    "many-to-many": "多对多关联",
  };
  return labels[type];
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

  if (extraction.relationships.length > 0) {
    content += "\n## 实体关系\n\n";
    extraction.relationships.forEach((rel) => {
      content += `- **${getRelationshipLabel(rel.type)}**：`;
      content += `[[${rel.from.name}]] → [[${rel.to.name}]]`;
      if (rel.description) {
        content += ` (${rel.description})`;
      }
      content += "\n";
    });
  }

  return content;
}

function generateEntityContent(
  name: string,
  type: Exclude<EntityType, "note">,
  noteFilename: string,
  extraction: ExtractionResult
): string {
  const noteLink = noteFilename.replace(".md", "");
  let content = `# ${name}

## 类型
${type}

## 关联笔记
- [[${noteLink}]]
`;

  const relatedEntities: Array<{ type: EntityType; name: string; relType: Relationship["type"]; description?: string }> = [];

  extraction.relationships.forEach((rel) => {
    if (rel.from.name === name) {
      relatedEntities.push({
        type: rel.to.type,
        name: rel.to.name,
        relType: rel.type,
        description: rel.description,
      });
    }
    if (rel.to.name === name) {
      relatedEntities.push({
        type: rel.from.type,
        name: rel.from.name,
        relType: rel.type,
        description: rel.description,
      });
    }
  });

  if (relatedEntities.length > 0) {
    content += "\n## 关联实体\n";
    relatedEntities.forEach((entity) => {
      content += `- [[${entity.name}]] (${getRelationshipLabel(entity.relType)})`;
      if (entity.description) {
        content += ` - ${entity.description}`;
      }
      content += "\n";
    });
  }

  return content;
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
        noteFilename,
        extraction
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
