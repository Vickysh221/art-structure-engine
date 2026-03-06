import { mergeEntityMarkdown } from './entity-merge';
import fs from 'node:fs/promises';
import path from 'node:path';

// 定义文件路径
const picassoPath = '/Users/vickyshou/Documents/Art Thinking Vault/artists/毕加索.md';

// 新内容（包含潜意识撕裂关联）
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

async function manualUpdate() {
  try {
    // 读取原文件内容
    const existingContent = await fs.readFile(picassoPath, 'utf-8');
    console.log('读取原文件内容成功');
    
    // 合并内容
    const merged = mergeEntityMarkdown(existingContent, newContent);
    console.log('合并内容成功');
    
    // 写入原文件
    await fs.writeFile(picassoPath, merged, 'utf-8');
    console.log('写入原文件成功');
    
    // 验证更新结果
    const updatedContent = await fs.readFile(picassoPath, 'utf-8');
    console.log('\n更新后的文件内容:');
    console.log(updatedContent);
  } catch (error) {
    console.error('手动更新失败:', error);
  }
}

manualUpdate();
