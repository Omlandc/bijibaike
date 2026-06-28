# Obsidian Blog

A static React blog that reads your **Obsidian vault** directly. Built on top
of the [`webapp-building`](https://github.com/Omlandc/ai-dev-framework)
`0-origin` template, with an added markdown-processing layer that handles
Obsidian's special syntax.

## ✨ What works out of the box

- **Vault swap** — point the build at any git-hosted Obsidian vault via a single config file. No code changes needed.
- `[[双链]]` / `[[alias|target]]` / `[[file#heading]]` — wiki-links resolved to internal routes, with broken-link detection (dashed underline, like Obsidian)
- `![[image]]` / `![[note]]` — embeds rendered as inline images, attachment links, or chips
- `> [!note] / [!tip] / [!warning] / [!danger] / [!quote] / [!info] / [!example]` — callouts with matching colored boxes
- YAML frontmatter (`title`, `date`, `tags`, `description`, `cover`, `pinned`, `draft`, …)
- Auto cover detection: `frontmatter.cover` → first body image → gradient fallback
- Auto backlinks — every post shows which posts link to it
- **Pillar/Cluster topic pages** — top-level vault dir = Pillar, subdir = Cluster. `/topics` lists all pillars; `/topics/<pillar>` shows a pillar's posts + clusters; `/topics/<pillar>/<cluster>` drills into a cluster.
- **Git-aware article dates** — file first-commit timestamp is used as a fallback when frontmatter has no `date`.
- D3 force-directed **relationship graph** — pan, zoom, drag, click to highlight neighbors, search-focus, orphan toggle, fullscreen.
- 4 themes: **明亮 / 暗夜 / 护眼 / 赛博朋克** with smooth crossfade switching
- ⌘K / Ctrl+K global search
- **AdSense-ready** with config-driven Auto Ads and GDPR cookie consent.
- **SEO**: `<title>` + meta + Open Graph + Twitter + canonical + JSON-LD, with `sitemap.xml` / `robots.txt` / `ads.txt` generated at build time.
- Mobile-friendly: graph, nav, and cards all adapt down to 375px viewport.

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

## 🔁 Swap your vault

The vault is **a separate git repo** cloned into `vault/` at build time. To point at
your own vault:

1. Edit `src/vault.config.ts`:

   ```ts
   export const vaultConfig = {
     repo: 'your-org/your-vault',
     branch: 'main',
     // Optional: pin to a commit for reproducible builds
     // ref: 'abc123',
     publicAttachmentsPath: '/attachments',
   };
   ```

2. Make the token available (any of these env vars work):

   ```bash
   export VAULT_TOKEN=ghp_xxx    # preferred
   # or
   export GITHUB_TOKEN=ghp_xxx
   export GH_TOKEN=ghp_xxx
   ```

   The token is injected per-invocation via `git -c url.<auth>.insteadOf=...`
   so it never lands in `.git/config`.

3. Run `npm run vault:pull`. If the network blip fails, `vault:offline` will
   reuse whatever is already in `vault/` — so the build always succeeds.

The vault repo is gitignored. Slugs encode the full vault-relative path so two
posts in different folders can share a basename without clashing.

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

MIT — use freely.
