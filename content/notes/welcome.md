---
title: 欢迎来到 Obsidian Blog
date: 2026-06-28
tags: [meta, obsidian]
description: 这个博客可以直接读取你的 Obsidian vault,保留双链、callout、frontmatter。
pinned: true
---

# 欢迎 👋

这是一个**完全用 Obsidian 风格写的文章** —— 放在 `content/` 文件夹下,被 React 应用直接打包。

> [!info] 这是什么
> 这个博客由 `webapp-building` 框架的 `0-origin` 模板 + 一层 Obsidian 兼容层构建。
> 你看到的 wiki-link、callout、frontmatter 都是真实的 Obsidian 语法。

## 它支持什么

> [!tip] 兼容的特性
> - `[[双链]]` 解析(支持 `[[A|B]]` 别名、`[[A#H]]` 标题锚点)
> - `![[embed]]` 内嵌引用(渲染为 chip 样式)
> - `> [!note] / [!warning] / [!tip] / [!danger] / [!quote]` 等 callout
> - YAML frontmatter(`title` / `date` / `tags` / `description` / `pinned` / `draft`)
> - 行内 `#tag` 自动聚合
> - 自动计算 **backlinks**(看 [[projects/roadmap]] 也引用了这篇)

## 试试点这些链接

- 这是另一个笔记:[[notes/getting-started]]
- 同一个笔记,带别名:[[notes/getting-started|从这里开始]]
- 项目页:[[projects/roadmap]]
- 一个还不存在的笔记(虚线样式):[[未创建的笔记]]
- 当前笔记的某个章节:[[notes/welcome#它支持什么]]

## 一段代码

```ts
import { remarkWikiLink } from './lib/remark-wikilink';

function parseVault(md: string) {
  // [[Wiki Link]] → AST link node
  return remarkWikiLink.processSync(md);
}
```

## 引用块 callout

> [!warning] 注意
> 草稿(`draft: true`)在生产构建里不会出现在列表中,但本地开发会显示。

> [!quote] "我把所有笔记都连起来了。"
> — 某个 Obsidian 重度用户

试试在 [[notes/getting-started]] 看看另一个例子,或者去 [[graph]] 看完整关系图。
