/**
 * Obsidian-compatible markdown utilities.
 *
 * Handles:
 *   - YAML frontmatter parsing (gray-matter)
 *   - Wiki-link syntax: [[Target]], [[Target|Alias]], [[Target#Heading]]
 *   - Embeds: ![[image.png]], ![[Note]]
 *   - Callouts: > [!note] / [!warning] / [!tip] / [!info] / [!danger] / [!quote]
 *   - Tag extraction from frontmatter and inline #tag
 *   - Slug generation compatible with Obsidian filenames
 */
import matter from 'gray-matter';

export type CalloutType =
  | 'note'
  | 'info'
  | 'tip'
  | 'warning'
  | 'danger'
  | 'quote'
  | 'example';

/** File extensions treated as attachments (not posts). */
const ATTACHMENT_EXT = /\.(png|jpe?g|gif|webp|svg|bmp|ico|pdf|mp4|webm|mov|mp3|wav|ogg|zip|tar|gz|tgz)$/i;

/**
 * Returns true if a wiki-link target points to a binary attachment
 * rather than a markdown note. Used to:
 *   - skip attachments when building the backlinks graph
 *   - resolve `![[logo.svg]]` embeds to a public URL instead of a slug
 */
export function isAttachmentPath(file: string): boolean {
  return ATTACHMENT_EXT.test(file);
}

export interface PostFrontmatter {
  title?: string;
  date?: string;
  tags?: string[];
  author?: string;
  description?: string;
  cover?: string;
  draft?: boolean;
  pinned?: boolean;
  // any other frontmatter fields pass through
  [key: string]: unknown;
}

export interface ParsedWikiLink {
  /** raw target text inside [[ ]] */
  target: string;
  /** file name part (no #heading) */
  file: string;
  /** optional #heading anchor */
  heading: string | null;
  /** optional |alias text (after stripping any size suffix) */
  alias: string | null;
  /** is this an embed ![[...]] */
  embed: boolean;
  /** slug for routing */
  slug: string;
  /**
   * Obsidian image-size hint from the embed pipe:
   *   ![[photo.png|300]]    → width = 300
   *   ![[photo.png|300x200]]→ width 300, height 200
   * Only set when the alias itself is a bare number / WxH token.
   */
  width?: number | null;
  height?: number | null;
}

export interface ParsedCallout {
  type: CalloutType;
  /** raw body lines after the [!type] marker */
  body: string;
}

const CALLOUT_TYPES: readonly CalloutType[] = [
  'note',
  'info',
  'tip',
  'warning',
  'danger',
  'quote',
  'example',
] as const;

/** Convert an Obsidian-style filename or wiki target to a URL slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/\.md$/i, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{Letter}\p{Number}\-\u4e00-\u9fa5]+/gu, '')
    .replace(/^-+|-+$/g, '');
}

/** Parse one [[wiki link]] match (without the surrounding brackets). */
export function parseWikiLink(raw: string, embed = false): ParsedWikiLink | null {
  // strip leading "!" for embeds
  const cleaned = raw.replace(/^!/, '').trim();
  if (!cleaned) return null;

  let body = cleaned;
  let alias: string | null = null;
  const pipeIdx = body.indexOf('|');
  if (pipeIdx >= 0) {
    alias = body.slice(pipeIdx + 1).trim() || null;
    body = body.slice(0, pipeIdx).trim();
  }

  let file = body;
  let heading: string | null = null;
  const hashIdx = body.indexOf('#');
  if (hashIdx >= 0) {
    file = body.slice(0, hashIdx).trim();
    heading = body.slice(hashIdx + 1).trim() || null;
  }

  // Obsidian image-size hint: the pipe-alias on a bare number / WxH
  // token is treated as a dimension (e.g. `![[photo.png|300x200]]`).
  // Anything else is left in `alias` for caption use.
  let width: number | null = null;
  let height: number | null = null;
  if (alias && /^\d+(x\d+)?$/i.test(alias)) {
    const [w, h] = alias.toLowerCase().split('x');
    width = Number(w);
    height = h ? Number(h) : null;
    alias = null;
  }

  return {
    target: body,
    file,
    heading,
    alias,
    embed,
    width,
    height,
    // Use basename only so [[notes/getting-started]] and
    // [[getting-started]] both resolve to `getting-started`. This
    // matches remark-wikilink.ts and how content.ts derives slugs.
    slug: slugify(file.split('/').pop() ?? file),
  };
}

/** Match any [[...]] or ![[...]] (non-nested) inside a text node. */
const WIKI_LINK_RE = /!?\[\[([^\[\]\n]+?)\]\]/g;

export function findWikiLinks(text: string): ParsedWikiLink[] {
  const out: ParsedWikiLink[] = [];
  let m: RegExpExecArray | null;
  WIKI_LINK_RE.lastIndex = 0;
  while ((m = WIKI_LINK_RE.exec(text)) !== null) {
    const raw = m[1] ?? '';
    const embed = m[0].startsWith('!');
    const parsed = parseWikiLink(raw, embed);
    if (parsed) out.push(parsed);
  }
  return out;
}

/** Extract inline #tags from a body of markdown (excluding inside code). */
export function extractInlineTags(body: string): string[] {
  const tags = new Set<string>();
  // strip fenced code first
  const stripped = body.replace(/```[\s\S]*?```/g, '');
  const re = /(^|\s)#([\p{Letter}\p{Number}_\-\/]+)/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(stripped)) !== null) {
    const t = m[2];
    if (t) tags.add(t);
  }
  return Array.from(tags);
}

/**
 * First image reference found in a post body, in document order.
 * Handles two syntaxes:
 *   - Obsidian embed:   ![[logo.png]]  or  ![[attachments/photo.jpg]]
 *   - Standard image:   ![alt](path-or-url)
 *
 * Returns the raw target string as written in the markdown — the caller
 * resolves it to a public URL (vault attachments get rewritten to
 * /<publicAttachmentsPath>/...).
 *
 * Code fences are stripped first so images in code samples don't leak
 * through as the cover.
 */
export function extractFirstImage(body: string): { target: string; embed: boolean } | null {
  const stripped = body.replace(/```[\s\S]*?```/g, '');
  // 1) Obsidian embeds — they take priority because they survive copy/paste
  //    from Obsidian and are the most common syntax in our vault.
  const embed = stripped.match(/!\[\[([^\[\]\n|]+?)(?:\|[^\]]*)?\]\]/);
  if (embed && embed[1]) {
    return { target: embed[1].trim(), embed: true };
  }
  // 2) Standard markdown image
  const std = stripped.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
  if (std && std[1]) {
    return { target: std[1].trim(), embed: false };
  }
  return null;
}

/** Detect and split an Obsidian callout blockquote. */
export function parseCallout(lines: string[]): ParsedCallout | null {
  if (lines.length === 0) return null;
  const first = lines[0] ?? '';
  const m = first.match(/^\s*>\s*\[!(\w+)\][+-]?\s*(.*)$/);
  if (!m) return null;
  const candidate = (m[1] ?? '').toLowerCase() as CalloutType;
  if (!CALLOUT_TYPES.includes(candidate)) return null;
  const firstBody = m[2] ?? '';
  const rest = lines.slice(1).map((l) => l.replace(/^\s*>\s?/, ''));
  const body = [firstBody, ...rest].join('\n').trim();
  return { type: candidate, body };
}

/**
 * Transform an Obsidian-style blockquote callout into a fenced div
 * our react-markdown `components` map can recognize. We emit
 *
 *   :::callout[type]
 *   body...
 *   :::
 *
 * which remark-gfm / our custom plugin will turn into a div with class.
 */
export function transformCallouts(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const start = i;
    const block: string[] = [];
    // collect a contiguous blockquote (lines starting with optional spaces + ">")
    while (i < lines.length && /^\s*>/.test(lines[i] ?? '')) {
      block.push(lines[i] ?? '');
      i += 1;
    }
    if (block.length === 0) {
      out.push(lines[i] ?? '');
      i += 1;
      continue;
    }
    const parsed = parseCallout(block);
    if (parsed) {
      out.push(`:::callout[${parsed.type}]`);
      out.push(parsed.body);
      out.push(':::');
    } else {
      for (const l of block) out.push(l);
    }
    // loop guard (block was consumed)
    if (start === i) i += 1;
  }
  return out.join('\n');
}

/** Convenience: parse frontmatter and return a typed object. */
export function parseFrontmatter<T extends PostFrontmatter = PostFrontmatter>(
  raw: string,
): { data: T; content: string } {
  const parsed = matter(raw);
  return {
    data: parsed.data as T,
    content: parsed.content,
  };
}
