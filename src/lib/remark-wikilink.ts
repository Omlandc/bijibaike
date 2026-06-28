/**
 * remark plugin: transform [[Wiki Link]] and ![[Embed]] text spans into
 * proper mdast nodes annotated with data-* attributes that
 * react-markdown's `components.a` / `components.img` maps can detect
 * and re-route.
 *
 * The slug used in the URL (`wikilink:<slug>`) and the data attributes
 * is always the basename of the target file — without any directory
 * prefix and without `.md`. This matches how `lib/content.ts` derives
 * the slug for each post, so a `[[notes/getting-started]]` reference
 * resolves to the same slug as the actual `notes/getting-started.md`
 * post.
 *
 * Two target kinds:
 *   - **Note** (`.md`): emits a Link node with url `wikilink:<slug>` so
 *     the post's React `<a>` handler can route it. Optionally anchors
 *     to a heading via `<a href="wikilink:slug#heading">`.
 *   - **Attachment** (image / pdf / etc.): emits either an Image node
 *     (`![[logo.svg]]`) or a Link to the public URL
 *     (`[[logo.svg|display]]`). The public URL is derived from
 *     `vaultConfig.publicAttachmentsPath`.
 */
import type { Plugin } from 'unified';
import type { Root, Text, Link, Image, PhrasingContent, Parent } from 'mdast';
import { visit, SKIP } from 'unist-util-visit';
import { parseWikiLink, slugify, isAttachmentPath } from './obsidian';
import { vaultPublicConfig } from '@/vault.public';

const WIKI_LINK_RE = /!?\[\[([^\[\]\n]+?)\]\]/g;

function isInsideCode(node: PhrasingContent | Text): boolean {
  return (node as { type?: string }).type === 'inlineCode';
}

function attachmentUrl(file: string): string {
  // file is the path used in the wiki-link, e.g. "logo.svg" or
  // "attachments/photo.png". The copy step puts them at
  // /<publicAttachmentsPath>/<file>.
  const base = vaultPublicConfig.publicAttachmentsPath.replace(/\/+$/, '');
  const cleaned = file.replace(/^attachments\//, '');
  return `/${base}/${cleaned}`.replace(/\/+/g, '/');
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
    } else if (isAttachmentPath(parsed.file)) {
      // ── Attachment path ──
      const url = attachmentUrl(parsed.file);
      const label = parsed.alias ?? parsed.file.split('/').pop() ?? parsed.file;
      if (isEmbed) {
        // ![[logo.svg]] → <img>
        const img: Image = {
          type: 'image',
          url,
          title: label,
          alt: label,
          data: {
            hProperties: {
              'data-wiki-embed': 'attachment',
              'data-wiki-target': parsed.file,
              className: 'wiki-embed wiki-embed--attachment',
            },
          },
        };
        out.push(img);
      } else {
        // [[logo.svg]] or [[logo.svg|label]] → <a href="/attachments/...">
        const link: Link = {
          type: 'link',
          url,
          title: label,
          children: [{ type: 'text', value: label }],
          data: {
            hProperties: {
              'data-wikilink': 'attachment',
              'data-wiki-target': parsed.file,
              target: '_blank',
              rel: 'noopener noreferrer',
              className: 'wiki-link wiki-link--attachment',
            },
          },
        };
        out.push(link);
      }
    } else {
      // ── Note path ──
      // Use the full vault-relative path so two files in different
      // folders with the same basename stay distinct in the link
      // graph. The matching slug for `[[dir/basename]]` is built
      // the same way in lib/content.ts.
      const slug = slugify(parsed.file);
      const label = parsed.alias ?? (parsed.file.split('/').pop() ?? parsed.file);
      const link: Link = {
        type: 'link',
        url: parsed.heading
          ? `wikilink:${slug}#${encodeURIComponent(parsed.heading)}`
          : `wikilink:${slug}`,
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