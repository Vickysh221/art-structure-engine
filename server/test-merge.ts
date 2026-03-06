import { mergeEntityMarkdown } from './entity-merge';

// 模拟现有文件内容
const existingContent = `# 文艺复兴

## 类型
style

## 关联笔记
- [[2026-03-05-xp4ld069]]
- [[2026-03-05-8ge7x2mg]]
- [[2026-03-05-tr2565jy]]
- [[2026-03-06-kkzgs4a1]]
`;

// 模拟新内容
const newContent = `# 文艺复兴

## 类型
style

## 关联笔记
- [[2026-03-06-kkzgs4a1]]

## 关联实体
- [[米开朗基罗]] (直接关联) - 米开朗基罗是文艺复兴时期的杰出艺术家
`;

// 测试合并功能
const merged = mergeEntityMarkdown(existingContent, newContent);
console.log('合并后的内容:');
console.log(merged);
console.log('\n合并前内容:');
console.log(existingContent);
console.log('\n新内容:');
console.log(newContent);
