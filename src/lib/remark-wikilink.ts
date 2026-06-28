/**
 * remark plugin: transform [[Wiki Link]] and ![[Embed]] text spans into
 * proper mdast link nodes annotated with data-* attributes that
 * react-markdown's `components.a` map can detect and re-route.
 *
 * The slug used in the URL (`wikilink:<slug>`) and the data attributes
 * is always the basename of the target file — without any directory
 * prefix and without `.md`. This matches how `lib/content.ts` derives
 * the slug for each post, so a `[[notes/getting-started]]` reference
 * resolves to the same slug as the actual `notes/getting-started.md`
 * post.
 */
import type { Plugin } from 'unified';
import type { Root, Text, Link, PhrasingContent, Parent } from 'mdast';
import { visit, SKIP } from 'unist-util-visit';
import { parseWikiLink, slugify } from './obsidian';

const WIKI_LINK_RE = /!?\[\[([^\[\]\n]+?)\]\]/g;

function isInsideCode(node: PhrasingContent | Text): boolean {
  return (node as { type?: string }).type === 'inlineCode';
}

function transformText(node: Text): PhrasingContent[] | null {
  const value = node.value;
  if (!value.includes('[[') && !value.includes('![[')) return null;
  const out: PhrasingContent[] = [];
  let lastIndex = 0;
  WIKI_LINK_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = WIKI_LINK_RE.exec(value)) !== null) {
    const matchStart = m.index;
    const matchEnd = matchStart + m[0].length;
    const inner = m[1] ?? '';
    const isEmbed = m[0].startsWith('!');
    if (matchStart > lastIndex) {
      out.push({ type: 'text', value: value.slice(lastIndex, matchStart) });
    }
    const parsed = parseWikiLink(inner, isEmbed);
    if (!parsed) {
      out.push({ type: 'text', value: m[0] });
    } else {
      // Use only the basename of the target file as the slug, matching
      // how lib/content.ts derives the post slug.
      const basename = parsed.file.split('/').pop() ?? parsed.file;
      const slug = slugify(basename);
      const label = parsed.alias ?? basename;
      const link: Link = {
        type: 'link',
        url: `wikilink:${slug}`,
        title: label,
        children: [{ type: 'text', value: label }],
        data: {
          hProperties: {
            'data-wikilink': 'true',
            'data-wiki-slug': slug,
            'data-wiki-heading': parsed.heading ?? '',
            'data-wiki-alias': parsed.alias ?? '',
            'data-wiki-embed': parsed.embed ? 'true' : 'false',
            'data-wiki-target': parsed.file,
            className: ['wiki-link', parsed.embed ? 'wiki-link--embed' : '']
              .filter(Boolean)
              .join(' '),
          },
        },
      };
      out.push(link);
    }
    lastIndex = matchEnd;
  }
  if (lastIndex < value.length) {
    out.push({ type: 'text', value: value.slice(lastIndex) });
  }
  if (out.length === 0) return null;
  return out;
}

export const remarkWikiLink: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'text', (node: Text, index, parent: Parent | undefined) => {
      if (!parent || typeof index !== 'number') return;
      if (isInsideCode(node)) return;
      const replaced = transformText(node);
      if (!replaced) return;
      parent.children.splice(index, 1, ...replaced);
      return [SKIP, index + replaced.length];
    });
  };
};

export { slugify };
