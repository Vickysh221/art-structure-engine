import { mergeEntityMarkdown } from './entity-merge';
import fs from 'node:fs/promises';

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

async function generateObsidianScript() {
  try {
    // 读取原文件内容
    const existingContent = await fs.readFile(picassoPath, 'utf-8');
    console.log('读取原文件内容成功');
    
    // 合并内容
    const merged = mergeEntityMarkdown(existingContent, newContent);
    console.log('合并内容成功');
    
    // 生成 MCP Obsidian 脚本
    const script = `
# 使用 MCP Obsidian 工具更新毕加索文档

mcp
mcp_mcp-obsidian_edit-note {
  "vault": "Art Thinking Vault",
  "filename": "毕加索.md",
  "folder": "artists",
  "operation": "replace",
  "content": "${merged.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"
}

`;
    
    // 写入脚本文件
    await fs.writeFile('/Users/vickyshou/Documents/trae_projects/art-history-agent/obsidian-update.md', script, 'utf-8');
    console.log('生成 Obsidian 更新脚本成功');
    console.log('请在 Trae IDE 中打开 obsidian-update.md 文件并运行其中的 MCP 脚本');
  } catch (error) {
    console.error('生成脚本失败:', error);
  }
}

generateObsidianScript();
