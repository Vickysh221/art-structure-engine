import { mergeEntityMarkdown } from './entity-merge';

// 模拟现有毕加索文档内容
const existingContent = `# 毕加索

## 类型
artist

## 关联笔记
- [[2026-03-05-rh1zggda]]

## 关联实体
- [[立体主义]] (直接关联) - 毕加索是立体主义的代表人物
- [[2026-03-05-rh1zggda]]
- [[2026-03-05-w9wqjeea]]
- [[2026-03-05-livpm5bw]]
- [[2026-03-05-y6spsy36]]
- [[2026-03-05-mmhf424l]]
- [[2026-03-06-u1eezlov]]
- [[2026-03-06-plooxarh]]
`;

// 模拟新毕加索文档内容（包含潜意识撕裂关联）
const newContent = `# 毕加索

## 类型
artist

## 关联笔记
- [[2026-03-05-rh1zggda]]
- [[2026-03-06-plooxarh]]

## 关联实体
- [[立体主义]] (直接关联) - 毕加索是立体主义的代表人物
- [[潜意识撕裂]] (直接关联) - 毕加索在1929年创作的《La Nageuse》是潜意识撕裂风格的代表
`;

// 测试合并功能
const merged = mergeEntityMarkdown(existingContent, newContent);
console.log('合并后的内容:');
console.log(merged);
console.log('\n合并前内容:');
console.log(existingContent);
console.log('\n新内容:');
console.log(newContent);
