/**
 * rehype-https-only — rewrite `http://` image URLs in markdown to
 * `https://` so they don't trigger the browser's mixed-content
 * block when the site itself is served over HTTPS.
 *
 * We only rewrite `http://` to `https://` (not the reverse). If
 * the upstream server doesn't support HTTPS, the request will
 * fail and the `onError` handler in `<img>` will surface a broken
 * icon — which is exactly the same outcome as a mixed-content
 * block, just with a different error message in DevTools.
 *
 * If you need to opt out for a specific post, set frontmatter:
 *   allowInsecureImages: true
 */
import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';

interface Options {
  /** Skip rewriting when this returns true. */
  skip?: () => boolean;
}

export function rehypeHttpsOnly(opts: Options = {}) {
  return (tree: Root) => {
    if (opts.skip?.()) return;
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'img') return;
      const src = node.properties?.src;
      if (typeof src !== 'string') return;
      if (!src.startsWith('http://')) return;
      node.properties.src = 'https://' + src.slice('http://'.length);
    });
  };
}