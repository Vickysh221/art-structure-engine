# 数据结构契约

## 3.1 实体类型

固定五类：

```ts
type EntityType =
  | "style"
  | "artist"
  | "period"
  | "museum"
  | "note"
```

## 3.2 Vault 目录结构

```plaintext
vault/
  styles/
  artists/
  periods/
  museums/
  notes/
```

## 3.3 实体文件模板

例如：

```markdown
# 北方文艺复兴

## 类型
style

## 关联笔记
- [[2026-03-18-xxxx]]
```

## 3.4 笔记模板

```markdown
# 导入笔记

## 原始文本
...

## 结构信息
- 风格：
  - [[北方文艺复兴]]
- 艺术家：
  - [[Jan van Eyck]]
- 时期：
  - [[15世纪]]
- 展馆：
  - [[Uffizi]]
```

## 规则

1. 实体文件永不覆盖
2. 只追加关联笔记
3. 所有链接使用 [[双括号]]
4. 文件名使用 kebab-case

## 抽取结果 JSON 结构

```json
{
  "styles": [],
  "artists": [],
  "periods": [],
  "museums": [],
  "relationships": [
    {
      "type": "direct",
      "from": { "type": "artist", "name": "Jan van Eyck" },
      "to": { "type": "style", "name": "北方文艺复兴" },
      "description": "Jan van Eyck是北方文艺复兴艺术家的代表人物"
    }
  ]
}
```

## 连通性检测

- `GET /connectivity`：检测文本输入接口、数据处理模块、分析引擎三部分是否可联通。
- `POST /extract` 与 `POST /export`：先执行连通性检测，再执行抽取。
