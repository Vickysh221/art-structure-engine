# 产品 Skill（项目构建原则）

## Skill 1：Preflight 原则

写代码前必须确认：

* PRD 明确
* 结构契约明确
* 非目标明确
* 文件结构固定

## Skill 2：单一职责

* 前端只负责 UI
* 后端只负责结构生成
* Obsidian 只负责渲染

## Skill 3：纯函数设计

核心逻辑：

```ts
text → extraction → markdown
```

不依赖 UI。
不依赖 Vault 路径。

## Skill 4：不可变结构

V1 不允许新增实体类型。

## Skill 5：小步提交

每完成一个功能：

* git commit
* message 清晰
