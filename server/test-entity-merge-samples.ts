import fs from "node:fs/promises";
import path from "node:path";
import { mergeEntityMarkdown } from "./entity-merge";

type CaseResult = {
  caseName: string;
  pass: boolean;
  message: string;
};

function normalizeMarkdown(input: string): string {
  return input.replace(/\r\n/g, "\n").trimEnd() + "\n";
}

function unifiedDiff(expected: string, actual: string): string {
  const expectedLines = expected.split("\n");
  const actualLines = actual.split("\n");
  const max = Math.max(expectedLines.length, actualLines.length);
  const lines: string[] = [];

  for (let i = 0; i < max; i++) {
    const e = expectedLines[i];
    const a = actualLines[i];
    if (e === a) {
      continue;
    }
    if (e !== undefined) {
      lines.push(`- ${e}`);
    }
    if (a !== undefined) {
      lines.push(`+ ${a}`);
    }
  }

  return lines.join("\n");
}

async function run(): Promise<void> {
  const baseDir = path.join(__dirname, "test-samples", "obsidian-entity-merge");
  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  const caseDirs = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("case-"))
    .map((entry) => entry.name)
    .sort();

  if (caseDirs.length === 0) {
    console.log("No merge sample cases found.");
    process.exit(1);
  }

  const results: CaseResult[] = [];

  for (const caseName of caseDirs) {
    const casePath = path.join(baseDir, caseName);
    const existingDir = path.join(casePath, "existing");
    const incomingDir = path.join(casePath, "incoming");
    const expectedDir = path.join(casePath, "expected");

    const existingFiles = (await fs.readdir(existingDir)).filter((name) => name.endsWith(".md")).sort();
    const incomingFiles = (await fs.readdir(incomingDir)).filter((name) => name.endsWith(".md")).sort();
    const expectedFiles = (await fs.readdir(expectedDir)).filter((name) => name.endsWith(".md")).sort();

    if (existingFiles.length !== 1 || incomingFiles.length !== 1 || expectedFiles.length !== 1) {
      results.push({
        caseName,
        pass: false,
        message: "Each case must contain exactly one .md file in existing/incoming/expected.",
      });
      continue;
    }

    if (existingFiles[0] !== incomingFiles[0] || existingFiles[0] !== expectedFiles[0]) {
      results.push({
        caseName,
        pass: false,
        message: "Filename mismatch among existing/incoming/expected.",
      });
      continue;
    }

    const filename = existingFiles[0];
    const [existing, incoming, expected] = await Promise.all([
      fs.readFile(path.join(existingDir, filename), "utf-8"),
      fs.readFile(path.join(incomingDir, filename), "utf-8"),
      fs.readFile(path.join(expectedDir, filename), "utf-8"),
    ]);

    const actual = mergeEntityMarkdown(existing, incoming);
    const normalizedExpected = normalizeMarkdown(expected);
    const normalizedActual = normalizeMarkdown(actual);

    if (normalizedActual === normalizedExpected) {
      results.push({
        caseName,
        pass: true,
        message: `${filename} merged as expected.`,
      });
    } else {
      results.push({
        caseName,
        pass: false,
        message: `Diff:\n${unifiedDiff(normalizedExpected, normalizedActual)}`,
      });
    }
  }

  console.log("Obsidian entity merge sample test results:");
  results.forEach((result) => {
    console.log(`- ${result.pass ? "PASS" : "FAIL"} ${result.caseName}: ${result.message}`);
  });

  const failed = results.filter((result) => !result.pass);
  console.log(`Summary: ${results.length - failed.length}/${results.length} passed.`);

  if (failed.length > 0) {
    process.exit(1);
  }
}

run().catch((error) => {
  console.error("Failed to run sample tests:", error);
  process.exit(1);
});
