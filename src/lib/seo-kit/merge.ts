/**
 * Merge site + page configs into a resolved config.
 *
 * Strategy:
 *  - Page fields override site fields when both present
 *  - `keywords` / `tags` are concatenated (page-specific on top)
 *  - `canonical` falls back to `${siteUrl}${path}` if not set
 *  - Title goes through the site's titleTemplate
 *  - JSON-LD blocks are concatenated (site defaults first, then page)
 */
import type {
  JsonLdValue,
  PageSEO,
  ResolvedSEO,
  SiteSEO,
} from './config.ts';

export interface ResolveOptions {
  /**
   * The path for the current page, used to derive the canonical URL
   * when one isn't explicitly set. Should start with `/`, no host.
   * Pass `null` if the page doesn't have a path (404, error pages).
   */
  path?: string | null;
}

function defaultTitleTemplate(site: string, page: string): string {
  // Match what the most common SEO docs recommend: "{page} | {site}"
  return page === site ? site : `${page} | ${site}`;
}

function joinUrl(siteUrl: string, pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = siteUrl.replace(/\/$/, '');
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function resolveSEO(
  site: SiteSEO,
  page: PageSEO = {},
  options: ResolveOptions = {},
): ResolvedSEO {
  if (page.enabled === false) {
    // Caller opted out — return a minimal resolved that consumers should skip
    return {
      siteUrl: site.siteUrl,
      siteName: site.siteName,
      title: '',
      description: '',
      keywords: [],
      canonical: site.siteUrl,
      ogType: 'website',
      ogImage: '',
      ogLocale: site.locale ?? 'en_US',
      robots: 'noindex, nofollow',
      noai: true,
      twitterHandle: site.twitterHandle,
      organization: site.organization,
      jsonLd: [],
    };
  }

  // Title
  const rawTitle = page.title ?? site.defaultTitle ?? site.siteName;
  let title: string;
  if (typeof site.titleTemplate === 'function') {
    title = site.titleTemplate(site.siteName, rawTitle);
  } else if (typeof site.titleTemplate === 'string') {
    title = site.titleTemplate.replace('{title}', rawTitle).replace('{site}', site.siteName);
  } else {
    title = defaultTitleTemplate(site.siteName, rawTitle);
  }

  // Description
  const description = page.description ?? site.description ?? '';

  // Keywords (concat + dedupe)
  const keywords = uniq([...(site.keywords ?? []), ...(page.keywords ?? [])]);

  // Canonical
  const canonicalRaw = page.canonical ?? (options.path ? options.path : '/');
  const canonical = joinUrl(site.siteUrl, canonicalRaw);

  // OG image
  const ogImage = page.ogImage ?? site.defaultOgImage ?? '';
  const ogImageUrl = ogImage ? joinUrl(site.siteUrl, ogImage) : '';

  // Robots
  let robots: string;
  if (page.robots) {
    robots = page.robots;
  } else if (page.noai) {
    robots = 'index, follow, noai, noimageai';
  } else {
    robots = 'index, follow';
  }
  const noai = page.noai === true || (site.aiPolicy === 'strict');

  // JSON-LD
  const jsonLd: JsonLdValue[] = [];
  if (site.defaultJsonLd) jsonLd.push(...site.defaultJsonLd);
  if (page.jsonLd) {
    if (Array.isArray(page.jsonLd)) jsonLd.push(...page.jsonLd);
    else jsonLd.push(page.jsonLd);
  }

  return {
    siteUrl: site.siteUrl,
    siteName: site.siteName,
    title,
    description,
    keywords,
    canonical,
    ogType: page.ogType ?? 'website',
    ogImage: ogImageUrl,
    ogLocale: page.ogLocale ?? site.locale ?? 'en_US',
    author: page.author ?? site.author,
    publishedTime: page.publishedTime,
    modifiedTime: page.modifiedTime,
    section: page.section,
    tags: page.tags,
    robots,
    noai,
    twitterHandle: site.twitterHandle,
    organization: site.organization,
    jsonLd,
  };
}

/** Helper for callers that want to start with site defaults and override. */
export function pageSEO(overrides: PageSEO): PageSEO {
  return overrides;
}