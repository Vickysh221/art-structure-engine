# Art Structure Engine (ASE)

一个本地运行的艺术史结构生成工具。

## 功能

将用户输入的艺术相关文本 → 抽取结构实体 → 生成符合规范的 Obsidian Markdown 文件。

## 技术栈

- 前端：React + TypeScript + Vite + Tailwind
- 后端：Node + Express + TypeScript
- 模型：Ollama + llama3

## 文档

- [PRD](./docs/PRD.md) - 产品需求文档
- [STRUCTURE_CONTRACT](./docs/STRUCTURE_CONTRACT.md) - 数据结构契约
- [SKILL](./docs/SKILL.md) - 项目构建原则

## 导出到 Obsidian 的排障与系统测试

当你看到前端提示 `❌ 导入失败: Failed to export to Obsidian vault` 且浏览器 Console 报 `500` 时，优先判断为**后端文件写入失败**，常见原因：

- `vaultPath` 指向后端机器不可访问路径（例如前端在本机、后端在容器/远程环境时，`/Users/...` 对后端并不存在）
- 目录权限不足（`EACCES` / `EPERM`）
- 目标是只读文件系统（`EROFS`）

### 建议的系统测试流程

1. **基础健康检查**

```bash
curl -s http://localhost:3001/connectivity
```

2. **导出成功用例（使用后端本机可写目录）**

```bash
mkdir -p /tmp/ase-vault
curl -s -X POST http://localhost:3001/export \
  -H 'Content-Type: application/json' \
  -d '{"text":"印象派画家莫奈与巴黎橘园美术馆","vaultPath":"/tmp/ase-vault"}'
```

3. **导出失败用例（不可写目录）**

```bash
curl -s -X POST http://localhost:3001/export \
  -H 'Content-Type: application/json' \
  -d '{"text":"测试","vaultPath":"/root/forbidden-vault"}'
```

预期返回包含 `error / code / details / suggestion`，可快速定位失败原因。
