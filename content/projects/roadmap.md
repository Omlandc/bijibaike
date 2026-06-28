---
title: 路线图
date: 2026-06-20
tags: [project, meta, planning]
description: 接下来要做的事。
---

# 路线图

> [!note] 状态
> 当前的 v0.1 已经能让 webapp-building 读 Obsidian vault。下面是 v0.2+ 的计划。

## 已做 ✅

- `webapp-building` 的 `0-origin` 模板接入
- Obsidian frontmatter 解析(基于 `gray-matter`)
- `[[双链]]` 解析(`remarkWikiLink` 自定义插件)
- 6 种 callout 样式
- 标签聚合 + 标签页
- 自动 backlinks
- 简单的 SVG 关系图

## 在做 🚧

> [!warning] 待补
> 1. 嵌入语法 `![[image]]` 实际渲染(目前显示为 chip)
> 2. 全文搜索(Fuse.js 或 MiniSearch)
> 3. RSS / Atom feed
> 4. Sitemap.xml

## 之后 💭

- Mermaid 代码块渲染(react-markdown 里 custom code renderer)
- LaTeX 公式(`remark-math` + `rehype-katex`,依赖已装,需要挂上 `MarkdownView`)
- Graph view 升级为力导向(`d3-force` 替换现在的圆形布局)
- 多语言 frontmatter(`lang: en` 切语言)
- 部署到 GitHub Pages / Vercel 的一键脚本

## 引用

- [[notes/welcome]] — 概览
- [[notes/getting-started]] — 接入步骤
- 一个未来的笔记:[[未发布的 v0.2 发布说明]]
