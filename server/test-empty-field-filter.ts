import { sanitizeExtractionResult } from "./extract";
import { generateMarkdownFiles } from "./markdown";
import type { ExtractionResult } from "./types";

type TestCase = {
  name: string;
  input: Partial<ExtractionResult>;
  expected: {
    styles: string[];
    artists: string[];
    periods: string[];
    museums: string[];
    entityCount: number;
    forbiddenNames: string[];
  };
};

function assertEqualArray(actual: string[], expected: string[]): boolean {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function runCase(testCase: TestCase): { pass: boolean; details: string[] } {
  const sanitized = sanitizeExtractionResult(testCase.input);
  const files = generateMarkdownFiles("测试文本", sanitized);
  const entityNames = files.entities.map((e) => e.filename.replace(/\.md$/i, ""));

  const details: string[] = [];
  let pass = true;

  if (!assertEqualArray(sanitized.styles, testCase.expected.styles)) {
    pass = false;
    details.push(`styles mismatch: actual=${JSON.stringify(sanitized.styles)}`);
  }
  if (!assertEqualArray(sanitized.artists, testCase.expected.artists)) {
    pass = false;
    details.push(`artists mismatch: actual=${JSON.stringify(sanitized.artists)}`);
  }
  if (!assertEqualArray(sanitized.periods, testCase.expected.periods)) {
    pass = false;
    details.push(`periods mismatch: actual=${JSON.stringify(sanitized.periods)}`);
  }
  if (!assertEqualArray(sanitized.museums, testCase.expected.museums)) {
    pass = false;
    details.push(`museums mismatch: actual=${JSON.stringify(sanitized.museums)}`);
  }
  if (files.entities.length !== testCase.expected.entityCount) {
    pass = false;
    details.push(`entityCount mismatch: actual=${files.entities.length}`);
  }

  testCase.expected.forbiddenNames.forEach((name) => {
    const hasForbidden = entityNames.some((entityName) => entityName.includes(name.toLowerCase()));
    if (hasForbidden) {
      pass = false;
      details.push(`forbidden entity generated: ${name}`);
    }
  });

  if (pass) {
    details.push(
      `sanitized=${JSON.stringify({
        styles: sanitized.styles,
        artists: sanitized.artists,
        periods: sanitized.periods,
        museums: sanitized.museums,
      })}, entityCount=${files.entities.length}`
    );
  }

  return { pass, details };
}

function main(): void {
  const testCases: TestCase[] = [
    {
      name: "placeholder-and-empty-values-are-filtered",
      input: {
        styles: ["印象派", "未提及", " ", "unknown", "印象派"],
        artists: ["Claude Monet", "未知艺术家", ""],
        periods: ["19世纪", "N/A", "未说明"],
        museums: ["橘园美术馆", "暂无", "null"],
        relationships: [],
      },
      expected: {
        styles: ["印象派"],
        artists: ["Claude Monet"],
        periods: ["19世纪"],
        museums: ["橘园美术馆"],
        entityCount: 4,
        forbiddenNames: ["unknown", "未提及", "未知", "n-a", "null"],
      },
    },
    {
      name: "all-empty-fields-generate-no-entity-nodes",
      input: {
        styles: ["未提及", " "],
        artists: ["未知", ""],
        periods: ["N/A"],
        museums: ["null", "暂无"],
        relationships: [],
      },
      expected: {
        styles: [],
        artists: [],
        periods: [],
        museums: [],
        entityCount: 0,
        forbiddenNames: ["unknown", "未提及", "未知", "n-a", "null"],
      },
    },
    {
      name: "specific-not-mentioned-placeholders-are-normalized-and-removed",
      input: {
        styles: ["未提及具体风格", "{未知}"],
        artists: ["未提及具体艺术家", "  未知  "],
        periods: ["未提及具体时期"],
        museums: ["未提及具体博物馆\\ 未提及具体艺术家"],
        relationships: [
          {
            type: "direct",
            from: { type: "artist", name: "未提及具体艺术家" },
            to: { type: "style", name: "未提及具体风格" },
            description: "占位关系",
          },
        ],
      },
      expected: {
        styles: [],
        artists: [],
        periods: [],
        museums: [],
        entityCount: 0,
        forbiddenNames: ["unknown", "未提及", "未知", "null", "具体博物馆", "具体艺术家"],
      },
    },
  ];

  console.log("Empty field filter test results:");
  let passed = 0;
  testCases.forEach((testCase) => {
    const result = runCase(testCase);
    if (result.pass) {
      passed += 1;
    }
    console.log(`- ${result.pass ? "PASS" : "FAIL"} ${testCase.name}`);
    result.details.forEach((detail) => console.log(`  ${detail}`));
  });

  console.log(`Summary: ${passed}/${testCases.length} passed.`);
  if (passed !== testCases.length) {
    process.exit(1);
  }
}

main();
