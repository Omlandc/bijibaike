/**
 * Single source of truth for the site's SEO.
 *
 * All values are derived from `siteConfig` (which is generated from
 * `vault/_config.md` by scripts/build-config.mjs). Edit that file —
 * not this one — to change SEO behavior.
 *
 * Imported by:
 *  - main.tsx (root <SEOHead /> for site-wide defaults + Organization JSON-LD)
 *  - pages/Post.tsx (per-page overrides via pageSEO(...))
 *  - scripts/generate-seo-files.mjs (build-time sitemap.xml + robots.txt)
 */
import { defineSEO, jsonld, pageSEO } from '@/lib/seo-kit';
import type { SitemapConfig } from '@/lib/seo-kit';
import { siteConfig } from '@/config/site-config';

const { site: siteInfo, seo, footer } = siteConfig;
const SITE_URL = seo.siteUrl;
const SITE_NAME = siteInfo.name;

export const siteSEO = defineSEO({
  siteUrl: SITE_URL,
  siteName: SITE_NAME,
  description: siteInfo.description,
  defaultTitle: SITE_NAME,
  titleTemplate: '{title} · {site}',
  locale: siteInfo.locale,
  defaultOgImage: seo.ogImage,
  author: siteInfo.author.name || undefined,
  // Default keywords shown on every page; pages can append their own
  // (e.g. post tags) via pageSEO({ keywords: [...] }).
  keywords: seo.keywords,
  twitterHandle: seo.twitter || undefined,
  aiPolicy: 'open', // AI 搜索可以引用,有助于扩散

  organization: {
    name: SITE_NAME,
    url: SITE_URL,
  },

  defaultJsonLd: [
    jsonld.organization({
      name: SITE_NAME,
      url: SITE_URL,
      sameAs: siteInfo.social.github ? [siteInfo.social.github] : [],
    }),
    jsonld.website({
      name: SITE_NAME,
      url: SITE_URL,
      description: siteInfo.description,
      enableSearch: true,
    }),
  ],

  sitemap: {
    enabled: true,
    defaultChangefreq: 'weekly',
    defaultPriority: 0.6,
    staticPaths: [
      { loc: '/', priority: 1.0, changefreq: 'daily' },
      { loc: '/#/blog', priority: 0.9, changefreq: 'daily' },
      { loc: '/#/topics', priority: 0.85, changefreq: 'weekly' },
      { loc: '/#/tags', priority: 0.7, changefreq: 'weekly' },
      { loc: '/#/graph', priority: 0.5, changefreq: 'weekly' },
      // Resources page
      { loc: '/#/resources', priority: 0.5, changefreq: 'weekly' },
      // Required by Google AdSense for site-credibility review
      { loc: '/#/about', priority: 0.5, changefreq: 'monthly' },
      { loc: '/#/privacy', priority: 0.4, changefreq: 'monthly' },
      { loc: '/#/contact', priority: 0.4, changefreq: 'monthly' },
    ],
    // Dynamic paths (blog posts etc.) are computed at build time by
    // scripts/generate-seo-files.mjs — NOT here, so the browser bundle
    // doesn't pull in node:fs via this file.
  } satisfies SitemapConfig,

  customBots: undefined,
});

export { pageSEO };

// Re-export footer copyright so layouts can show it.
export const SITE_FOOTER_COPYRIGHT = footer.copyright;
export const SITE_FOOTER_LINKS = footer.links;
export const SITE_TAGLINE = siteInfo.tagline;
export const SITE_SOCIAL = siteInfo.social;
