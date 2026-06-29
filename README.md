# Obsidian Blog

> **License notice**: This is source-available software. Personal /
> educational / non-commercial use is free. **Commercial use requires a
> paid license** — see [LICENSE](./LICENSE) and the
> [pricing page](https://rk466g8vxdqc.space.minimaxi.com/#/pricing).

A static React blog that reads your **Obsidian vault** directly. Built on top
of the [`webapp-building`](https://github.com/Omlandc/ai-dev-framework)
`0-origin` template, with an added markdown-processing layer that handles
Obsidian's special syntax.

## ✨ What works out of the box

- **Single-vault config** — `vault/_config.md` is the only config you need to edit. Site name, default theme, SEO, AdSense, nav menu, footer, pillar order, and resources page all live in one frontmatter block.
- **Vault swap** — point the build at any git-hosted Obsidian vault via that same config file. No code changes needed.
- `[[双链]]` / `[[alias|target]]` / `[[file#heading]]` — wiki-links resolved to internal routes, with broken-link detection (dashed underline, like Obsidian)
- `![[image]]` / `![[note]]` — embeds rendered as inline images, attachment links, or chips
- `> [!note] / [!tip] / [!warning] / [!danger] / [!quote] / [!info] / [!example]` — callouts with matching colored boxes
- YAML frontmatter (`title`, `date`, `tags`, `description`, `cover`, `pinned`, `draft`, …)
- Auto cover detection: `frontmatter.cover` → first body image → gradient fallback
- Auto backlinks — every post shows which posts link to it
- **Reading progress bar** + **right-side table of contents** on every post (sticky on desktop, collapsible drawer on mobile)
- **Pillar/Cluster topic pages** — top-level vault dir = Pillar, subdir = Cluster. `/topics` lists all pillars; `/topics/<pillar>` shows a pillar's posts + clusters; `/topics/<pillar>/<cluster>` drills into a cluster.
- **Git-aware article dates** — file first-commit timestamp is used as a fallback when frontmatter has no `date`.
- D3 force-directed **relationship graph** — pan, zoom, drag, click to highlight neighbors, search-focus, orphan toggle, fullscreen.
- **Resources page** (`/resources`) — external links grouped by section, fully configurable in `_config.md`.
- Configurable themes: list any of `light / dark / sepia / cyberpunk` in `_config.md`; default applies synchronously before paint to avoid FOUC.
- ⌘K / Ctrl+K global search
- **AdSense-ready** with config-driven Auto Ads and GDPR cookie consent.
- **SEO**: `<title>` + meta + Open Graph + Twitter + canonical + JSON-LD, with `sitemap.xml` / `robots.txt` / `ads.txt` generated at build time.
- Mobile-friendly: graph, nav, cards, TOC, and reading progress all adapt down to 375px viewport.

## 🏗️ Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind 3.4 with **CSS-variable design tokens** (themable) |
| Components | shadcn/ui (new-york style) |
| Router | react-router 7 (HashRouter for static-host friendliness) |
| Markdown | react-markdown 9 + unified pipeline |
| SEO | [`seo-kit`](https://github.com/Omlandc/seo-kit) (internal package) |
| Graph | D3 7 |

## 🚀 Quick start

```bash
npm install
npm run vault:pull        # clone or update the configured vault
npm run dev               # dev server with HMR
npm run build             # production build
npm run preview           # preview the build
```

Open <http://localhost:3000>.

## 🔁 Swap your vault & configure the site (one MD file)

**All site configuration lives in `vault/_config.md`** — a single Obsidian
note in your vault root. Edit it, commit, push, rebuild. Done.

### `vault/_config.md`

The frontmatter holds all the knobs:

| 段落 | 控制什么 |
|------|---------|
| `site` | 站点名称、标语、默认主题、可用主题列表、社交链接 |
| `seo` | 站点 URL、OG image、keywords、Twitter handle |
| `ads` | AdSense 发布商 ID、自动广告开关、cookie consent |
| `vault` | vault 仓库 URL / 分支（构建用） |
| `nav` | 顶部导航菜单的项、图标、顺序 |
| `footer` | 页脚链接与版权 |
| `pillars` | 主题簇的手动顺序（不填则自动从目录发现） |
| `resources` | `/resources` 页面的分组与条目 |

A complete reference is in [`docs/_config.example.md`](./docs/_config.example.md).

```bash
# After editing vault/_config.md:
npm run build:config        # regenerate src/config/site-config.{ts,json}
npm run build               # full build
```

### Which vault repo?

`vault._config.md` also carries the `vault.repo` / `vault.branch` fields.
The build script `scripts/setup-vault.mjs` clones that repo into `vault/`
gitignored locally. To point at a private repo, expose the token via env:

```bash
export VAULT_TOKEN=ghp_xxx    # preferred
# or GITHUB_TOKEN / GH_TOKEN
```

The token is injected per-invocation via `git -c url.<auth>.insteadOf=...`
so it never lands in `.git/config`. If the network blip fails, `vault:offline`
reuses whatever's already in `vault/` — the build always succeeds.

Slugs encode the full vault-relative path so two posts in different folders
can share a basename without clashing.

### Pillar / Cluster authoring

A top-level folder in your vault is automatically a **Pillar**:

```
vault/
├── 中医/                          ← Pillar
│   ├── pillar.md                  ← optional custom description & cover
│   ├── 黄帝内经/                   ← Cluster (sub-folder)
│   │   └── 素问遗篇.md
│   └── 本草纲目.md
├── 其他/                          ← Pillar
│   ├── 子文件夹/                   ← Cluster
│   │   └── 测试.md
│   └── 杂记.md
├── standalone.md                   ← post (not in any Pillar)
└── attachments/                    ← images copied to /public/attachments/
    └── logo.svg
```

Optional `pillar.md` (or `_index.md`) inside a folder overrides the pillar's
description and cover:

```markdown
---
title: 中医
description: 中医养生、经典与临床实践
cover: "[[attachments/header.svg]]"
---
```

URLs follow this shape:

| Page | URL |
|---|---|
| Pillar index | `/#/topics` |
| Pillar detail | `/#/topics/<pillar>` |
| Cluster detail | `/#/topics/<pillar>/<cluster>` |
| Post | `/#/blog/<vault-relative-slug>` |

## 📁 Project structure

```
src/
├── components/
│   ├── ThemeSwitcher.tsx       4-theme dropdown
│   ├── SiteLayout.tsx          Header + nav + footer + RouteSeo + ⌘K search
│   ├── MarkdownView.tsx        react-markdown wrapper
│   ├── CookieConsent.tsx       GDPR banner + useConsent hook
│   ├── AdsHead.tsx             Conditional Auto Ads injection
│   ├── PostCard.tsx            Card with cover-or-gradient fallback
│   └── ui/                     shadcn primitives
├── pages/
│   ├── Home.tsx                Hero + featured post + post grid
│   ├── Post.tsx                Single post view (splat route)
│   ├── BlogList.tsx            Full list with filters
│   ├── Tags.tsx                Tag pill index
│   ├── Graph.tsx               D3 force-directed relationship graph
│   ├── Topics.tsx              Pillar index
│   ├── TopicDetail.tsx         Pillar + Cluster detail
│   ├── About.tsx / Privacy.tsx / Contact.tsx    AdSense-required pages
├── lib/
│   ├── obsidian.ts             Frontmatter / wiki-link / callout parsing
│   ├── content.ts              Vault loader + slug + post index
│   ├── remark-wikilink.ts      mdast plugin
│   └── remark-callout.ts       mdast plugin
├── ads.config.ts               AdSense config (mirror of seo.config.ts pattern)
├── seo.config.ts               SEO defaults
├── vault.config.ts             Node-only: which vault repo to clone
└── vault.public.ts             Browser-safe: attachment URL prefix

scripts/
├── setup-vault.mjs             clone/pull/offline modes, extracts git dates
├── copy-attachments.mjs        vault/attachments → public/attachments
└── generate-seo-files.mjs      sitemap.xml / robots.txt / ads.txt
```

## 🎨 Theming

All visual tokens are CSS variables on `html[data-theme="..."]`. Switch themes via
the dropdown in the header — choice is persisted in `localStorage`.

```
html[data-theme='light']       default, indigo primary
html[data-theme='dark']        deep navy + bright indigo
html[data-theme='sepia']       warm cream + burnt orange
html[data-theme='cyberpunk']   near-black + neon cyan
```

Adding a new theme = add a new `[data-theme='yourname']` block in `src/index.css`.

## 🧠 How Obsidian compatibility works

The pipeline:

```
.md file
  ↓ gray-matter (frontmatter + body)
  ↓ transformCallouts (rewrites > [!type] into :::callout[type] directives)
  ↓ remarkParse → mdast
  ↓ remarkGfm
  ↓ remarkDirective (parses :::callout[type] → containerDirective)
  ↓ remarkCallout (rewrites containerDirective → blockquote with data-callout)
  ↓ remarkWikiLink (rewrites [[X]] text spans → link nodes with wikilink: URLs)
  ↓ remarkRehype → hast
  ↓ rehypeRaw + rehypeSlug + rehypeSanitize (extended schema)
  ↓ react-markdown with custom components map
  ↓ <Callout>, <WikiLink>, <Link>, etc.
```

Three nontrivial details that took debugging:

1. **`rehype-sanitize` strips `data-callout` and `data-wiki-*` by default** — extend
   the schema in `MarkdownView.tsx` to allow them.
2. **`react-markdown` strips non-standard URL protocols** — pass a custom
   `urlTransform` that whitelists `wikilink:` (used as a marker for internal links).
3. **`hast` converts `data-x` properties to `dataX`** on the node object passed to
   custom components — look up `node.properties.dataCallout`, not `node.properties['data-callout']`.

## 💰 AdSense setup

`src/ads.config.ts` mirrors the SEO config pattern:

```ts
import { defineAds } from 'seo-kit/ads';

export const adsConfig = defineAds({
  google: {
    enabled: true,
    autoAds: true,             // Page-level Auto Ads (AdSense decides placements)
    publisherId: 'ca-pub-XXX', // your publisher ID
    verification: true,        // emits <meta name="google-adsense-account">
  },
  consent: {
    required: true,            // show cookie banner before injecting Auto Ads
    categories: ['necessary', 'marketing'],
  },
});
```

Auto Ads only inject after the user accepts the cookie consent banner — required for GDPR.

`ads.txt` is generated from your `adsConfig` at build time.

## 🚢 Deployment

The build output (`dist/`) is a fully static site — drop it on any static host
(GitHub Pages, Vercel, Cloudflare Pages, …). HashRouter means deep links work
without server-side rewrites.

```bash
npm run build
```

## 📜 License

**Source-available, not open-source.** Copyright (c) 2026 Omlandc.

| 用法 | 是否需要付费 |
|---|---|
| 个人博客 / 笔记系统 / 学习 / 改自己用 | ✅ 免费 |
| 贡献代码 / 文档 / 提 issue | ✅ 免费 |
| 商业项目 / 付费产品 / SaaS / 公司内部 / 超过 10k 月活的广告 blog | 💬 需购买商业授权 |

完整文本见 [LICENSE](./LICENSE) 文件。要做商业部署?看 [定价页](https://rk466g8vxdqc.space.minimaxi.com/#/pricing) 或邮件 omlandc [at] example.com。
