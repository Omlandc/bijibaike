/**
 * Content loader — reads all .md files under the configured vault at
 * build time, runs the Obsidian-compatible frontmatter + transform
 * pipeline, and exposes typed Post records + indexes (by tag, by
 * slug, backlinks).
 *
 * The vault is a separate git repository, cloned into ./vault by
 * scripts/setup-vault.mjs (or `npm run vault:pull`). To swap the
 * vault, edit src/vault.config.ts and re-pull.
 *
 * Uses Vite's import.meta.glob with query=raw and eager=true to inline
 * every markdown file as a string. This is the simplest path for an
 * SPA without a backend; the cost is that the entire vault ships in
 * the JS bundle. Fine for personal blogs up to a few hundred posts.
 * For larger vaults, swap this for non-eager glob and lazy-load per route.
 */
import {
  parseFrontmatter,
  type PostFrontmatter,
  extractInlineTags,
  transformCallouts,
  findWikiLinks,
  slugify,
  isAttachmentPath,
} from './obsidian';
// vaultConfig is intentionally not imported here — the vault path is
// a build-time concern enforced by Vite's static glob below.

export interface Post {
  /** URL slug derived from filename or frontmatter id */
  slug: string;
  /** Original filename relative to the vault root, e.g. "notes/hello.md" */
  sourcePath: string;
  /** Frontmatter */
  frontmatter: PostFrontmatter;
  /** Raw markdown body (after frontmatter strip) */
  raw: string;
  /** Markdown body with callouts transformed to fenced divs */
  body: string;
  /** Tags: union of frontmatter tags + inline #tags */
  tags: string[];
  /** Outgoing wiki-link targets, normalized to slugs */
  links: string[];
  /** Computed excerpt */
  excerpt: string;
  /** ISO date string */
  date: string;
  /** Title for display */
  title: string;
}

export interface Backlink {
  fromSlug: string;
  fromTitle: string;
  context: string;
}

export interface ContentIndex {
  posts: Post[];
  bySlug: Record<string, Post>;
  byTag: Record<string, Post[]>;
  backlinks: Record<string, Backlink[]>;
  tags: { name: string; count: number }[];
}

// Vite-specific: this glob is replaced at build time. The pattern must
// be a string literal (Vite scans the source), so the vault root is
// hardcoded to match `vaultConfig.localPath`. If you change the path
// in src/vault.config.ts, update this glob too.
const modules = import.meta.glob<string>('/vault/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function deriveTitle(fm: PostFrontmatter, sourcePath: string): string {
  if (typeof fm.title === 'string' && fm.title.trim()) return fm.title.trim();
  // filename without .md and without leading numeric date prefix (YYYY-MM-DD_)
  const base = sourcePath.split('/').pop() ?? sourcePath;
  const noExt = base.replace(/\.md$/i, '');
  const stripped = noExt.replace(/^\d{4}-\d{2}-\d{2}[-_ ]?/, '');
  return stripped.replace(/[-_]+/g, ' ').trim() || noExt;
}

function deriveDate(fm: PostFrontmatter, sourcePath: string): string {
  // gray-matter + js-yaml auto-parses YAML dates into Date objects.
  const rawDate = fm.date as unknown;
  if (rawDate instanceof Date && !Number.isNaN(rawDate.valueOf())) {
    return rawDate.toISOString();
  }
  if (typeof rawDate === 'string') {
    const d = new Date(rawDate);
    if (!Number.isNaN(d.valueOf())) return d.toISOString();
  }
  // try to extract a leading YYYY-MM-DD from filename
  const m = sourcePath.match(/(\d{4}-\d{2}-\d{2})/);
  if (m) {
    const d = new Date(m[1]);
    if (!Number.isNaN(d.valueOf())) return d.toISOString();
  }
  return new Date(0).toISOString();
}

function makeExcerpt(body: string, max = 180): string {
  // strip headings, blockquotes, code fences, links
  const cleaned = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^>.*$/gm, '')
    .replace(/^#+\s+.*$/gm, '')
    .replace(/\[\[([^\]]+)\]\]/g, (_, inner) => {
      const pipe = inner.indexOf('|');
      return pipe >= 0 ? inner.slice(pipe + 1) : inner;
    })
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`>#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length <= max) return cleaned;
  return cleaned.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

function buildPost(sourcePath: string, raw: string): Post | null {
  const { data, content } = parseFrontmatter<PostFrontmatter>(raw);
  if (data.draft === true && import.meta.env.PROD) return null;

  const body = transformCallouts(content);
  const fmTags = Array.isArray(data.tags) ? data.tags.map(String) : [];
  const inlineTags = extractInlineTags(content);
  const tags = Array.from(new Set([...fmTags, ...inlineTags]));
  const links = findWikiLinks(content)
    .map((l) => l.slug)
    // Drop attachment targets (logos, PDFs, etc.) from the link graph.
    // They shouldn't show up as "outgoing wiki-links" for a post.
    .filter((slug) => !isAttachmentPath(slug));
  // Slug is always the filename basename (without directory or .md)
  // so it matches what remark-wikilink generates from `[[basename]]`
  // or `[[dir/basename]]` references. This keeps wiki-links stable
  // even if the post title is renamed.
  const basename = sourcePath.split('/').pop() ?? sourcePath;
  const slug = slugify(basename);
  return {
    slug,
    sourcePath,
    frontmatter: data,
    raw: content,
    body,
    tags,
    links,
    excerpt: makeExcerpt(content),
    date: deriveDate(data, sourcePath),
    title: deriveTitle(data, sourcePath),
  };
}

function buildIndex(posts: Post[]): ContentIndex {
  const bySlug: Record<string, Post> = {};
  for (const p of posts) bySlug[p.slug] = p;

  const byTag: Record<string, Post[]> = {};
  for (const p of posts) {
    for (const t of p.tags) {
      (byTag[t] ??= []).push(p);
    }
  }

  const backlinks: Record<string, Backlink[]> = {};
  for (const p of posts) {
    for (const target of p.links) {
      const targetPost = bySlug[target];
      if (!targetPost) continue;
      (backlinks[target] ??= []).push({
        fromSlug: p.slug,
        fromTitle: p.title,
        context: p.excerpt,
      });
    }
  }

  const tags = Object.entries(byTag)
    .map(([name, list]) => ({ name, count: list.length }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return { posts, bySlug, byTag, backlinks, tags };
}

let _index: ContentIndex | null = null;

function loadAll(): ContentIndex {
  if (_index) return _index;
  const posts: Post[] = [];
  for (const [path, raw] of Object.entries(modules)) {
    if (typeof raw !== 'string') continue;
    const post = buildPost(path.replace(/^\/vault\//, ''), raw);
    if (post) posts.push(post);
  }
  posts.sort((a, b) => b.date.localeCompare(a.date));
  _index = buildIndex(posts);
  return _index;
}

export function getAllPosts(): Post[] {
  return loadAll().posts;
}

export function getPostBySlug(slug: string): Post | undefined {
  return loadAll().bySlug[slug];
}

export function getPostsByTag(tag: string): Post[] {
  return loadAll().byTag[tag] ?? [];
}

export function getBacklinks(slug: string): Backlink[] {
  return loadAll().backlinks[slug] ?? [];
}

export function getAllTags(): { name: string; count: number }[] {
  return loadAll().tags;
}

export function getContentStats() {
  const idx = loadAll();
  return {
    posts: idx.posts.length,
    tags: idx.tags.length,
    links: idx.posts.reduce((acc, p) => acc + p.links.length, 0),
  };
}
