# Obsidian Blog — webapp-building + Obsidian compatibility layer

A static React blog that reads your **Obsidian vault** directly. Built on top of the
[`webapp-building`](https://github.com/Omlandc/ai-dev-framework) `0-origin` template,
with an added markdown-processing layer that handles Obsidian's special syntax.

## ✨ What works out of the box

- `[[双链]]` / `[[alias|target]]` / `[[file#heading]]` — wiki-links resolved to internal routes, with broken-link detection (dashed underline, like Obsidian)
- `![[image]]` / `![[note]]` — embeds rendered as chips
- `> [!note] / [!tip] / [!warning] / [!danger] / [!quote] / [!info] / [!example]` — callouts with matching colored boxes
- YAML frontmatter (`title`, `date`, `tags`, `description`, `pinned`, `draft`, …)
- Inline `#tag` aggregation (auto-extracted + deduped with frontmatter tags)
- Auto backlinks — every post shows which posts link to it
- SVG relationship graph — nodes sized by in-degree
- 4 themes: **明亮 / 暗夜 / 护眼 / 赛博朋克** with smooth crossfade switching
- ⌘K / Ctrl+K global search

## 🏗️ Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind 3.4 with **CSS-variable design tokens** (themable) |
| Components | shadcn/ui (new-york style) — 40+ primitives pre-installed |
| Router | react-router 7 (HashRouter for static-host friendliness) |
| Markdown | react-markdown 9 + unified pipeline |
| Content loading | `import.meta.glob` — entire vault inlined at build time |

## 🚀 Quick start

```bash
# Install deps
npm install

# Dev server with HMR
npm run dev

# Production build
npm run build

# Preview the build
npm run preview
```

Open <http://localhost:3000>.

## 📁 Project structure

```
src/
├── components/
│   ├── ThemeSwitcher.tsx       4-theme dropdown (light/dark/sepia/cyberpunk)
│   ├── SiteLayout.tsx          Header + nav + footer + ⌘K search
│   ├── MarkdownView.tsx        react-markdown wrapper with our plugins
│   ├── Callout.tsx             Styled callout box
│   ├── WikiLink.tsx            Internal link with broken-state detection
│   └── ui/                     shadcn primitives
├── pages/
│   ├── Home.tsx                Hero + featured post + tag cloud + grid
│   ├── Post.tsx                Single post view
│   ├── BlogList.tsx            Full list with filters
│   ├── Tags.tsx                Tag index + detail
│   └── Graph.tsx               SVG relationship graph
├── lib/
│   ├── obsidian.ts             Frontmatter / wiki-link / callout parsing
│   ├── content.ts              Vault loader + post index + backlinks
│   ├── remark-wikilink.ts      mdast plugin for [[X]] → link nodes
│   └── remark-callout.ts       mdast plugin for :::callout[X] → blockquote
├── index.css                   Design tokens + 4 themes
├── main.tsx                    Entry (with Buffer polyfill for gray-matter)
└── App.tsx                     Routes

content/                        Your Obsidian vault goes here
├── notes/
│   └── welcome.md
└── projects/
    └── roadmap.md
```

## 🎨 Theming

All visual tokens live as CSS variables on `html[data-theme="..."]`. Switch themes via
the dropdown in the header — choice is persisted in `localStorage`.

```
html[data-theme='light']      default, indigo primary
html[data-theme='dark']       deep navy + bright indigo
html[data-theme='sepia']      warm cream + burnt orange (eye-friendly)
html[data-theme='cyberpunk']  near-black + neon cyan (developer vibes)
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

## 📦 Adding your own vault

Drop your Obsidian vault into `content/`. The loader picks up every `.md` file
recursively. Filenames (basename, without `.md`) become URL slugs:

- `content/notes/hello.md` → `/blog/hello`
- `content/projects/2026-roadmap.md` → `/blog/2026-roadmap`

## 🚢 Deployment

The build output (`dist/`) is a fully static site — drop it on any static host
(GitHub Pages, Vercel, Cloudflare Pages, …). It uses HashRouter so deep links
work without server-side rewrites.

## 📜 License

MIT — use freely.