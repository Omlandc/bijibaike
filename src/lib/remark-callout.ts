/**
 * remark plugin: handle :::callout[type] ... ::: container directives
 * (added by remark-directive). We rewrite the containerDirective into a
 * standard blockquote node with hProperties so react-markdown's
 * components.blockquote map can detect and re-render as <Callout>.
 *
 * directiveLabel is set to `true` on the directive's first paragraph
 * child; the actual label text lives as a text node inside that
 * paragraph. We strip that first paragraph (it would otherwise show up
 * as a leading "[type]" prefix in the rendered callout body).
 */
import type { Plugin } from 'unified';
import type { Root, Blockquote, BlockContent } from 'mdast';
import { visit } from 'unist-util-visit';
import type { ContainerDirective } from 'mdast-util-directive';

const CALLOUT_TYPES = new Set([
  'note',
  'info',
  'tip',
  'warning',
  'danger',
  'quote',
  'example',
]);

function extractLabel(node: ContainerDirective): string {
  // 1. explicit `type` attribute (:::callout{type=warning})
  const attrType = node.attributes?.type;
  if (typeof attrType === 'string') return attrType;
  // 2. the [label] text stored as the first child of the directive's
  //    first paragraph (added by remark-directive)
  const firstChild = node.children[0] as
    | (BlockContent & { children?: Array<{ type: string; value?: unknown }> })
    | undefined;
  if (firstChild && 'children' in firstChild && firstChild.children) {
    const firstText = firstChild.children.find((c) => c.type === 'text');
    if (firstText && typeof firstText.value === 'string') {
      return firstText.value;
    }
  }
  return 'note';
}

export const remarkCallout: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'containerDirective', (node: ContainerDirective, index, parent) => {
      if (node.name !== 'callout') return;
      const firstChild = node.children[0] as
        | (BlockContent & { data?: { directiveLabel?: unknown } })
        | undefined;
      const hasLabelParagraph =
        firstChild !== undefined && firstChild.data?.directiveLabel !== undefined;
      const label = extractLabel(node).toLowerCase();
      const type = CALLOUT_TYPES.has(label) ? label : 'note';
      // Drop the first paragraph if it carried a directiveLabel marker
      // — that paragraph exists only to hold the [type] text and
      // would render as a redundant "type" prefix in the callout body.
      const body = hasLabelParagraph ? node.children.slice(1) : node.children;
      const replacement: Blockquote = {
        type: 'blockquote',
        children: body as BlockContent[],
        data: {
          hProperties: {
            'data-callout': type,
            className: ['callout', `callout-${type}`, 'my-6']
              .filter(Boolean)
              .join(' '),
          },
        },
      };
      if (parent && typeof index === 'number') {
        parent.children.splice(index, 1, replacement);
        return index + 1;
      }
    });
  };
};
