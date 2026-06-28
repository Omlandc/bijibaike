/**
 * Single source of truth for the site's SEO.
 *
 * Imported by:
 *  - main.tsx (root <SEOHead /> for site-wide defaults + Organization JSON-LD)
 *  - pages/Post.tsx (per-page overrides via pageSEO(...))
 *  - scripts/generate-seo-files.mjs (build-time sitemap.xml + robots.txt)
 */
import { defineSEO, jsonld, pageSEO } from 'seo-kit';
import type { SitemapConfig } from 'seo-kit';

const SITE_URL = 'https://obsidian-blog-webapp.example.com';

export const siteSEO = defineSEO({
  siteUrl: SITE_URL,
  siteName: 'Obsidian Blog',
  description:
    '把 Obsidian vault 直接喂给 React 博客。支持 [[双链]]、callout、frontmatter、inline #tag、自动 backlinks 与 4 套主题切换。',
  defaultTitle: 'Obsidian Blog',
  titleTemplate: '{title} · {site}',
  locale: 'zh_CN',
  defaultOgImage: '/og-image.jpg',
  author: 'Omlandc',
  aiPolicy: 'open', // AI 搜索可以引用,有助于扩散

  organization: {
    name: 'Obsidian Blog',
    url: SITE_URL,
  },

  defaultJsonLd: [
    jsonld.organization({
      name: 'Obsidian Blog',
      url: SITE_URL,
      sameAs: ['https://github.com/Omlandc/obsidian-blog-webapp'],
    }),
    jsonld.website({
      name: 'Obsidian Blog',
      url: SITE_URL,
      description:
        '把 Obsidian vault 直接喂给 React 博客。支持 [[双链]]、callout、frontmatter。',
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
      { loc: '/#/tags', priority: 0.7, changefreq: 'weekly' },
      { loc: '/#/graph', priority: 0.5, changefreq: 'weekly' },
    ],
    // Dynamic paths (blog posts etc.) are computed at build time by
    // scripts/generate-seo-files.mjs — NOT here, so the browser bundle
    // doesn't pull in node:fs via this file.
  } satisfies SitemapConfig,

  customBots: undefined,
});

export { pageSEO };