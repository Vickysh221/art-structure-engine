# Obsidian 实体文件合并测试样本

用于验证 `server/index.ts` 中以下逻辑：
- 不覆盖旧文件；
- 按二级标题（`## ...`）合并；
- 同标题下完全相同条目（去首尾空白后）跳过；
- 旧内容保留，新内容追加；
- 新增标题会被创建并写入。

## 目录结构

- `case-01-artist-partial-dup/`
  - `existing/claude-monet.md`
  - `incoming/claude-monet.md`
  - `expected/claude-monet.md`
- `case-02-style-all-duplicate/`
  - `existing/impressionism.md`
  - `incoming/impressionism.md`
  - `expected/impressionism.md`
- `case-03-heading-without-space/`
  - `existing/文艺复兴.md`（历史文件中二级标题写成 `##关联笔记`）
  - `incoming/文艺复兴.md`
  - `expected/文艺复兴.md`

以上每个 case 都满足：
- 同名文件（例如 `claude-monet.md`）
- 同实体类型（通过 `## 类型` 字段体现）
- 同一级标题结构下既有完全相同内容，也有不同内容

## Case 01 验证点（同名同类型 + 部分重复 + 新标题）

文件名和实体类型保持一致：`claude-monet.md` / `artist`。

预期：
- `## 关联笔记`：保留旧条目，追加新条目 `[[2026-03-06-note-b]]`；
- `## 关联实体`：重复条目 `[[Impressionism]] (直接关联)` 不重复写入；
- `## 生平要点`：重复行跳过，新增行 `晚年专注睡莲题材` 追加；
- 新增 `## 代表作品` 标题和内容。

## Case 02 验证点（同名同类型 + 全量重复）

文件名和实体类型保持一致：`impressionism.md` / `style`。

预期：
- `incoming` 中 `## 类型` 为 `  style  `（有首尾空白），应被判定为与旧值 `style` 相同；
- 合并结果与旧文件语义一致，不新增重复条目。

## Case 03 验证点（兼容无空格二级标题）

文件名和实体类型保持一致：`文艺复兴.md` / `style`。

预期：
- 旧文件中的 `##类型`、`##关联笔记` 也能被识别为二级标题；
- 新导入的 `## 关联实体` 可正确追加，不会因为标题格式差异导致漏合并。

## 使用方式（人工比对）

1. 将每个 case 的 `existing/*.md` 放到 vault 对应实体目录（如 `artists/`、`styles/`）中。
2. 触发一次导入，让系统导入该 case 的 `incoming/*.md` 对应实体内容。
3. 对比导入后的实体文件与该 case 的 `expected/*.md`，应一致。
