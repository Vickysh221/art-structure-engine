# 📘 PRD — Art Structure Engine V1.0

---

# 1️⃣ 产品定义

## 产品名称（工作名）

Art Structure Engine (ASE)

---

## 产品定位

一个本地运行的结构生成工具。

功能：

> 将用户输入的艺术相关文本 → 抽取结构实体 → 生成符合规范的 Obsidian Markdown 文件。

本系统是：

* 结构引擎（Structure Engine）
* 非笔记软件
* 非艺术百科
* 非知识图谱

---

## 产品目标

### 核心目标

跑通以下闭环：

```
文本输入
   ↓
结构抽取
   ↓
Markdown生成
   ↓
Obsidian渲染
```

---

## 非目标（V1 不做）

* 不做图谱可视化
* 不做多视角并置
* 不做母题抽取
* 不做置信度评分
* 不做去重算法
* 不做在线同步
* 不做 SaaS
* 不做 UI 优化

---

# 2️⃣ 产品功能范围

---

## 功能 1：文本提交

* 前端提供文本输入框
* 点击提交
* 调用后端 /extract

---

## 功能 2：结构抽取

使用 Ollama 本地模型：

抽取：

* styles
* artists
* periods
* museums

返回固定 JSON：

```json
{
  "styles": [],
  "artists": [],
  "periods": [],
  "museums": []
}
```

---

## 功能 3：Markdown 生成

根据抽取结果生成：

* 一篇 notes/ 下的笔记文件
* 若实体不存在，则生成实体文件

---

## 功能 4：Markdown 下载

前端提供：

* 下载按钮
* 复制按钮

---

# 3️⃣ 数据结构契约（核心）

必须写入 STRUCTURE_CONTRACT.md

---

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

---

## 3.2 Vault 目录结构

```plaintext
vault/
  styles/
  artists/
  periods/
  museums/
  notes/
```

---

## 3.3 实体文件模板

例如：

```markdown
# 北方文艺复兴

## 类型
style

## 关联笔记
- [[2026-03-18-xxxx]]
```

---

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

---

## 规则

1. 实体文件永不覆盖
2. 只追加关联笔记
3. 所有链接使用 [[双括号]]
4. 文件名使用 kebab-case

---

# 4️⃣ 项目架构设计

---

## 技术栈

前端：

* React
* TypeScript
* Vite
* Tailwind

后端：

* Node
* Express
* TypeScript

模型：

* Ollama + llama3

---

## 目录结构

```plaintext
art-structure-engine/

  client/
    src/
      App.tsx
      api.ts
      components/
        TextInput.tsx
        ResultViewer.tsx

  server/
    index.ts
    extract.ts
    markdown.ts
    types.ts

  docs/
    PRD.md
    STRUCTURE_CONTRACT.md
    SKILL.md

  README.md
```

---

# 5️⃣ 产品 Skill（项目构建原则）

这个部分非常重要。

写进 SKILL.md。

---

## Skill 1：Preflight 原则

写代码前必须确认：

* PRD 明确
* 结构契约明确
* 非目标明确
* 文件结构固定

---

## Skill 2：单一职责

* 前端只负责 UI
* 后端只负责结构生成
* Obsidian 只负责渲染

---

## Skill 3：纯函数设计

核心逻辑：

```ts
text → extraction → markdown
```

不依赖 UI。
不依赖 Vault 路径。

---

## Skill 4：不可变结构

V1 不允许新增实体类型。

---

## Skill 5：小步提交

每完成一个功能：

* git commit
* message 清晰

---

# 6️⃣ 依赖和插件

---

## 前端

```bash
npm create vite@latest client -- --template react-ts
cd client
npm install
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 后端

```bash
mkdir server
npm init -y
npm install express cors
npm install -D typescript ts-node @types/express
```

---

## 模型

```bash
brew install ollama
ollama pull llama3
```

---

# 7️⃣ GitHub 建仓流程

---

## Step 1：创建仓库

在 GitHub 上：

* New Repository
* 名称：art-structure-engine
* 不要勾选 README（我们本地生成）

---

## Step 2：本地初始化

```bash
git init
git add .
git commit -m "initial commit: project scaffold"
```

---

## Step 3：连接远程仓库

```bash
git remote add origin `https://github.com/你的用户名/art-structure-engine.git`
git branch -M main
git push -u origin main
```

---

# 8️⃣ V1 开发顺序（必须按顺序）

1. 写 STRUCTURE_CONTRACT.md
2. 写 extract.ts（可先 mock）
3. 写 markdown.ts
4. 测试生成 Markdown 字符串
5. 前端做输入框
6. 接通接口
7. 下载文件

不要乱跳。

---

# 9️⃣ trae 使用方式（关键）

每次让 trae 写代码时：

先贴：

* PRD.md
* STRUCTURE_CONTRACT.md
* 当前目录结构

然后说：

> 请严格遵守结构契约，不要新增实体类型。

这会避免 AI 乱扩展。

---
