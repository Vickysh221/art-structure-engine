import { extractStructure } from "./extract";
import { generateMarkdownFiles } from "./markdown";

async function test() {
  const testText = "这是一段关于 Jan van Eyck 的北方文艺复兴时期艺术作品的描述，现藏于 Uffizi 美术馆。";

  console.log("=== 测试结构抽取 ===");
  const extraction = await extractStructure(testText);
  console.log(JSON.stringify(extraction, null, 2));

  console.log("\n=== 测试 Markdown 生成 ===");
  const files = generateMarkdownFiles(testText, extraction);
  console.log("笔记文件:", files.note.filename);
  console.log(files.note.content);
  console.log("\n实体文件:");
  files.entities.forEach((entity) => {
    console.log(`- ${entity.type}: ${entity.filename}`);
    console.log(entity.content);
  });
}

test().catch(console.error);
