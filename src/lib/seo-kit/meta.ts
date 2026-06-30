/**
 * Runtime <head> injector.
 *
 * Useful when you can't use SSR (typical SPA): the component still injects
 * meta tags client-side, and search engines that don't run JS won't see them
 * — but at least the meta tags are correct for social-link previews that
 * fetch via SSR or use the head as-is.
 *
 * For SSR-aware frameworks (Next.js, Remix, etc.), prefer `<SEOHead />`
 * which renders the actual `<meta>` elements into the DOM tree.
 */
import type { ResolvedSEO } from './config.ts';

const META_ID_PREFIX = 'seo-kit';

function tagId(key: string): string {
  return `${META_ID_PREFIX}-${key}`;
}

function upsertMeta(
  attrs: Record<string, string>,
  idKey: string,
): void {
  const id = tagId(idKey);
  let el = document.head.querySelector<HTMLMetaElement>(`#${id}`);
  if (!el) {
    el = document.createElement('meta');
    el.id = id;
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
}

function upsertLink(rel: string, href: string, idKey: string): void {
  const id = tagId(idKey);
  let el = document.head.querySelector<HTMLLinkElement>(`#${id}`);
  if (!el) {
    el = document.createElement('link');
    el.id = id;
    document.head.appendChild(el);
  }
  el.rel = rel;
  el.href = href;
}

function removeAllMeta(): void {
  document.head.querySelectorAll(`[id^="${META_ID_PREFIX}"]`).forEach((el) => el.remove());
}

export function applyMeta(seo: ResolvedSEO): void {
  // Clear stale article-* meta from a previous article page so they
  // don't leak onto list/home pages. They get re-added below if needed.
  document
    .querySelectorAll('meta[property^="article:"]')
    .forEach((el) => el.remove());

  // Title
  document.title = seo.title;

  // Description
  upsertMeta({ name: 'description', content: seo.description }, 'description');

  // Keywords
  if (seo.keywords.length > 0) {
    upsertMeta(
      { name: 'keywords', content: seo.keywords.join(', ') },
      'keywords',
    );
  }

  // Robots
  upsertMeta({ name: 'robots', content: seo.robots }, 'robots');

  // Canonical
  upsertLink('canonical', seo.canonical, 'canonical');

  // Open Graph
  upsertMeta({ property: 'og:type', content: seo.ogType }, 'og-type');
  upsertMeta({ property: 'og:site_name', content: seo.siteName }, 'og-site-name');
  upsertMeta({ property: 'og:title', content: seo.title }, 'og-title');
  upsertMeta({ property: 'og:description', content: seo.description }, 'og-description');
  upsertMeta({ property: 'og:url', content: seo.canonical }, 'og-url');
  upsertMeta({ property: 'og:locale', content: seo.ogLocale }, 'og-locale');
  if (seo.ogImage) {
    upsertMeta({ property: 'og:image', content: seo.ogImage }, 'og-image');
  }

  // Twitter Card
  upsertMeta({ name: 'twitter:card', content: 'summary_large_image' }, 'twitter-card');
  upsertMeta({ name: 'twitter:title', content: seo.title }, 'twitter-title');
  upsertMeta({ name: 'twitter:description', content: seo.description }, 'twitter-description');
  if (seo.twitterHandle) {
    upsertMeta({ name: 'twitter:site', content: `@${seo.twitterHandle}` }, 'twitter-site');
  }
  if (seo.ogImage) {
    upsertMeta({ name: 'twitter:image', content: seo.ogImage }, 'twitter-image');
  }

  // Article-specific
  if (seo.publishedTime) {
    upsertMeta({ property: 'article:published_time', content: seo.publishedTime }, 'article-published-time');
  }
  if (seo.modifiedTime) {
    upsertMeta({ property: 'article:modified_time', content: seo.modifiedTime }, 'article-modified-time');
  }
  if (seo.author) {
    upsertMeta({ property: 'article:author', content: seo.author }, 'article-author');
  }
  if (seo.section) {
    upsertMeta({ property: 'article:section', content: seo.section }, 'article-section');
  }
  if (seo.tags) {
    seo.tags.forEach((tag, i) => {
      upsertMeta({ property: 'article:tag', content: tag }, `article-tag-${i}`);
    });
  }

  // JSON-LD
  upsertJsonLd(seo.jsonLd);
}

function upsertJsonLd(blocks: ResolvedSEO['jsonLd']): void {
  // Remove old JSON-LD blocks from this kit
  document.head
    .querySelectorAll(`script[data-seo-kit="jsonld"]`)
    .forEach((el) => el.remove());
  for (const block of blocks) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.seoKit = 'jsonld';
    script.text = JSON.stringify(block);
    document.head.appendChild(script);
  }
}

export function clearMeta(): void {
  removeAllMeta();
}