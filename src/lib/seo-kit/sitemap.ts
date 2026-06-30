/**
 * sitemap.xml generator.
 *
 * Usage:
 *   import { generateSitemap, buildSitemapEntries } from 'seo-kit/sitemap';
 *
 *   const xml = generateSitemap({
 *     siteUrl: 'https://example.com',
 *     entries: [
 *       { loc: '/', changefreq: 'daily', priority: 1 },
 *       ...buildSitemapEntries(posts.map(p => ({
 *         loc: `/blog/${p.slug}`,
 *         lastmod: p.updatedAt,
 *         priority: 0.7,
 *       }))),
 *     ],
 *   });
 *   // → <?xml version="1.0" ...><urlset ...>...</urlset>
 *
 * Or run at build time with `npx seo-kit sitemap --config=seo.config.ts`.
 */
import type { SitemapConfig, SitemapEntry } from './config.ts';

export interface SitemapOptions {
  /** Site origin, e.g. "https://example.com". No trailing slash. */
  siteUrl: string;
  /** All entries (static + dynamic already merged). */
  entries: SitemapEntry[];
}

const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const XHTML_NS = 'http://www.w3.org/1999/xhtml';

export interface BuildOptions {
  defaultChangefreq?: SitemapEntry['changefreq'];
  defaultPriority?: number;
}

/** Fill in defaults for any entries missing lastmod/changefreq/priority. */
export function buildSitemapEntries(
  entries: SitemapEntry[],
  options: BuildOptions = {},
): SitemapEntry[] {
  const today = new Date().toISOString().slice(0, 10);
  return entries.map((e) => ({
    lastmod: e.lastmod ?? today,
    changefreq: e.changefreq ?? options.defaultChangefreq ?? 'monthly',
    priority: e.priority ?? options.defaultPriority ?? 0.5,
    ...e,
  }));
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function joinUrl(siteUrl: string, loc: string): string {
  if (/^https?:\/\//i.test(loc)) return loc;
  const base = siteUrl.replace(/\/$/, '');
  const path = loc.startsWith('/') ? loc : `/${loc}`;
  return `${base}${path}`;
}

export function generateSitemap(options: SitemapOptions): string {
  const { siteUrl, entries } = options;
  const urls = entries
    .map((e) => {
      const loc = escapeXml(joinUrl(siteUrl, e.loc));
      const parts = [`    <loc>${loc}</loc>`];
      if (e.lastmod) parts.push(`    <lastmod>${escapeXml(e.lastmod)}</lastmod>`);
      if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`);
      if (e.priority !== undefined) {
        parts.push(`    <priority>${e.priority.toFixed(1)}</priority>`);
      }
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="${SITEMAP_NS}" xmlns:xhtml="${XHTML_NS}">
${urls}
</urlset>
`;
}

/**
 * Convenience: resolve a SitemapConfig into an XML string.
 * Calls the dynamicPaths function if provided and merges with staticPaths.
 */
export async function resolveSitemap(
  config: SitemapConfig | undefined,
  siteUrl: string,
): Promise<string | null> {
  if (!config || !config.enabled) return null;
  const statics = config.staticPaths ?? [];
  const dynamics = config.dynamicPaths ? await config.dynamicPaths() : [];
  const entries = buildSitemapEntries([...statics, ...dynamics], {
    defaultChangefreq: config.defaultChangefreq,
    defaultPriority: config.defaultPriority,
  });
  return generateSitemap({ siteUrl, entries });
}