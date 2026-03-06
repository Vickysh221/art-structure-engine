export function parseSecondLevelSections(markdown: string): {
  headingOrder: string[];
  sections: Map<string, string[]>;
} {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const headingOrder: string[] = [];
  const sections = new Map<string, string[]>();
  let currentHeading: string | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^##\s*(.+)$/);
    if (headingMatch) {
      currentHeading = headingMatch[1].trim();
      if (!sections.has(currentHeading)) {
        headingOrder.push(currentHeading);
        sections.set(currentHeading, []);
      }
      continue;
    }

    if (!currentHeading) {
      continue;
    }

    sections.get(currentHeading)!.push(line);
  }

  return { headingOrder, sections };
}

export function mergeEntityMarkdown(existing: string, incoming: string): string {
  const existingParsed = parseSecondLevelSections(existing);
  const incomingParsed = parseSecondLevelSections(incoming);

  const title = existing.match(/^#\s+.+$/m)?.[0] ?? incoming.match(/^#\s+.+$/m)?.[0] ?? "";
  const mergedHeadingOrder = [...existingParsed.headingOrder];

  incomingParsed.headingOrder.forEach((heading) => {
    if (!existingParsed.sections.has(heading)) {
      mergedHeadingOrder.push(heading);
      existingParsed.sections.set(heading, []);
    }
  });

  mergedHeadingOrder.forEach((heading) => {
    const existingLines = existingParsed.sections.get(heading) ?? [];
    const existingSet = new Set(existingLines.map((line) => line.trim()).filter(Boolean));
    const incomingLines = incomingParsed.sections.get(heading) ?? [];

    incomingLines.forEach((line) => {
      const normalized = line.trim();
      if (!normalized || existingSet.has(normalized)) {
        return;
      }

      existingLines.push(line);
      existingSet.add(normalized);
    });

    existingParsed.sections.set(heading, existingLines);
  });

  const mergedParts: string[] = [];
  if (title) {
    mergedParts.push(title, "");
  }

  mergedHeadingOrder.forEach((heading, idx) => {
    mergedParts.push(`## ${heading}`);
    const lines = existingParsed.sections.get(heading) ?? [];
    while (lines.length > 0 && !lines[lines.length - 1].trim()) {
      lines.pop();
    }
    if (lines.length > 0) {
      mergedParts.push(...lines);
    }
    if (idx < mergedHeadingOrder.length - 1) {
      mergedParts.push("");
    }
  });

  return `${mergedParts.join("\n").trimEnd()}\n`;
}
