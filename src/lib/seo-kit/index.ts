/**
 * seo-kit — main entry point.
 *
 * Configurable, framework-agnostic SEO toolkit for React apps.
 *
 * @example
 *   // seo.config.ts (single source of truth)
 *   import { defineSEO, jsonld } from 'seo-kit';
 *
 *   export const siteSEO = defineSEO({
 *     siteUrl: 'https://myblog.com',
 *     siteName: 'My Blog',
 *     description: 'Notes on engineering, design, and craft.',
 *     locale: 'en_US',
 *     defaultOgImage: '/og-image.jpg',
 *     twitterHandle: 'myblog',
 *     author: 'Jane Doe',
 *     aiPolicy: 'strict',
 *     organization: {
 *       name: 'My Blog',
 *       url: 'https://myblog.com',
 *       logo: '/logo.png',
 *       sameAs: [
 *         'https://twitter.com/myblog',
 *         'https://github.com/myblog',
 *       ],
 *     },
 *     defaultJsonLd: [
 *       jsonld.organization({
 *         name: 'My Blog',
 *         url: 'https://myblog.com',
 *         logo: '/logo.png',
 *       }),
 *       jsonld.website({
 *         name: 'My Blog',
 *         url: 'https://myblog.com',
 *         enableSearch: true,
 *       }),
 *     ],
 *     sitemap: {
 *       enabled: true,
 *       staticPaths: [
 *         { loc: '/', priority: 1.0, changefreq: 'daily' },
 *         { loc: '/about', priority: 0.6, changefreq: 'monthly' },
 *       ],
 *       dynamicPaths: async () => {
 *         const posts = await getAllPosts();
 *         return posts.map(p => ({
 *           loc: `/blog/${p.slug}`,
 *           lastmod: p.updatedAt,
 *           changefreq: 'monthly',
 *           priority: 0.7,
 *         }));
 *       },
 *     },
 *   });
 *
 *   // App.tsx
 *   import { SEOHead } from 'seo-kit/react';
 *   import { siteSEO } from './seo.config';
 *
 *   function App() {
 *     return (
 *       <>
 *         <SEOHead config={siteSEO} />
 *         <Routes>...</Routes>
 *       </>
 *     );
 *   }
 *
 *   // Per-page
 *   import { useLocation } from 'react-router-dom';
 *   import { SEOHead, pageSEO } from 'seo-kit';
 *
 *   function PostPage({ post }) {
 *     const { pathname } = useLocation();
 *     return (
 *       <>
 *         <SEOHead
 *           config={siteSEO}
 *           path={pathname}
 *           page={pageSEO({
 *             title: post.title,
 *             description: post.excerpt,
 *             ogType: 'article',
 *             publishedTime: post.date,
 *             jsonLd: jsonld.article({
 *               headline: post.title,
 *               url: `${siteSEO.siteUrl}/blog/${post.slug}`,
 *               datePublished: post.date,
 *               author: post.author,
 *             }),
 *           })}
 *         />
 *         ...
 *       </>
 *     );
 *   }
 */

// ─── Re-exports ───────────────────────────────────────────────────────

export type {
  BotRule,
  JsonLdValue,
  PageSEO,
  ResolvedSEO,
  SiteSEO,
  SitemapConfig,
  SitemapEntry,
} from './config.ts';

export type {
  AdsSeller,
  ConsentConfig,
  GoogleAdsConfig,
  SiteAds,
} from './config-ads.ts';

export { resolveSEO, pageSEO } from './merge.ts';

export { applyMeta, clearMeta } from './meta.ts';
export { generateRobotsTxt, robotsTxtFromSite } from './robots.ts';
export { generateSitemap, buildSitemapEntries, resolveSitemap } from './sitemap.ts';

export { AI_BOTS, AI_BOT_USER_AGENTS } from './ai-bots.ts';
export type { AiBot } from './ai-bots.ts';

export { jsonld } from './jsonld.ts';

// AdSense module (ads.txt + verification meta + Auto Ads snippet)
export {
  defineAds,
  isAdsEnabled,
  generateAdsTxt,
  generateAutoAdsScript,
  generateAdsenseVerificationMeta,
  googleAdsenseSeller,
} from './ads.ts';

// Re-export the React component from the React subpath
// (avoid pulling in React when only the non-React bits are needed)
export { SEOHead } from './react.tsx';
export type { SEOHeadProps } from './react.tsx';
export { AdsHead } from './react-ads.tsx';
export type { AdsHeadProps } from './react-ads.tsx';

// Type-only re-exports for use in defineSEO<T extends SiteSEO> below
export type { SiteSEO as _SiteSEO } from './config.ts';

/**
 * Identity helper that just returns the input. Useful for type inference
 * + IDE auto-complete on the config object.
 *
 * @example
 *   export const siteSEO = defineSEO({
 *     siteUrl: 'https://...',
 *     // ... full IDE support
 *   });
 */
export function defineSEO<T extends import('./config.ts').SiteSEO>(config: T): T {
  return config;
}