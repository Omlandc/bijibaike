---
title: 从这里开始
date: 2026-06-25
tags: [meta, tutorial]
description: 三步把你的 Obsidian vault 接入这个博客。
---

# 30 秒接入

把 Obsidian vault 的内容放进 `content/` 目录,这个应用就把它当数据源。

## 第一步:放文件

```
content/
├── notes/
│   ├── welcome.md
│   └── getting-started.md
└── projects/
    └── roadmap.md
```

任何 `.md` 文件都会被自动识别。子目录会被保留为分类(目前只影响 URL 的 source path,不会出现在路由里)。

## 第二步:写 frontmatter

```yaml
---
title: 我的文章标题
date: 2026-06-20
tags: [tech, daily]
description: 一句话简介
pinned: false
draft: false
---
```

- `title` 缺省时,会用文件名(去掉 `.md` 和日期前缀)
- `date` 缺省时,会从文件名里抽 `YYYY-MM-DD`
- `pinned: true` 会在首页置顶
- `draft: true` 在生产构建里隐藏(本地 dev 仍可见)

## 第三步:用 Obsidian 语法写

参考 [[notes/welcome]] 里的例子。基本规则:

| 语法 | 效果 |
|---|---|
| `[[target]]` | 内部链接(虚线表示目标不存在) |
| `[[target\|alias]]` | 自定义链接文字 |
| `[[target#heading]]` | 跳转到指定标题 |
| `![[image.png]]` | 嵌入(渲染为 chip,后续可扩展为图片) |
| `> [!type]` | callout 框 |

## 看看 [[projects/roadmap]] 的计划

> [!example] 跑通后
> 跑通 `npm run dev` 你应该看到首页有 hero section + 几篇示例文章。`npm run build` 会产出可部署的 `dist/`。

参考 [[notes/welcome#它支持什么]] 了解支持范围。
