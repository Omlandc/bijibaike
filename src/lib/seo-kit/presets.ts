/**
 * Common configuration presets.
 *
 * Pick a preset for your site type, then override specific fields:
 *
 *   import { defineSEO } from 'seo-kit';
 *   import { blogPreset } from 'seo-kit/presets';
 *
 *   export const siteSEO = defineSEO({
 *     ...blogPreset({ siteUrl: 'https://myblog.com', siteName: 'My Blog' }),
 *     description: 'A blog about TypeScript and React',
 *   });
 */
import type { SiteSEO } from './config.ts';

export interface PresetOptions {
  siteUrl: string;
  siteName: string;
  description?: string;
  defaultOgImage?: string;
  author?: string;
  locale?: string;
  twitterHandle?: string;
}

/**
 * Generic "blog / content site" preset.
 *  - aiPolicy: "strict" (default — protect original content)
 *  - defaultOgImage: og-image.jpg
 *  - locale: zh_CN
 */
export function blogPreset(opts: PresetOptions): SiteSEO {
  return {
    siteUrl: opts.siteUrl,
    siteName: opts.siteName,
    description: opts.description,
    defaultTitle: opts.siteName,
    titleTemplate: '{title} · {site}',
    author: opts.author,
    locale: opts.locale ?? 'zh_CN',
    defaultOgImage: opts.defaultOgImage ?? '/og-image.jpg',
    twitterHandle: opts.twitterHandle,
    aiPolicy: 'strict',
    organization: opts.author
      ? {
          name: opts.siteName,
          url: opts.siteUrl,
        }
      : undefined,
    defaultJsonLd: [
      // Placeholders; users should override with their own builders
    ],
    sitemap: {
      enabled: true,
      defaultChangefreq: 'weekly',
      defaultPriority: 0.7,
    },
  };
}

/**
 * "Open" preset — for sites that want to be cited by AI assistants.
 *  - aiPolicy: "open"
 *  - titleTemplate more verbose
 */
export function openBlogPreset(opts: PresetOptions): SiteSEO {
  const base = blogPreset(opts);
  return {
    ...base,
    aiPolicy: 'open',
  };
}

/**
 * "Product / landing page" preset.
 *  - Tight title template, no ai-policy assumption
 */
export function productPreset(opts: PresetOptions): SiteSEO {
  return {
    siteUrl: opts.siteUrl,
    siteName: opts.siteName,
    description: opts.description,
    defaultTitle: opts.siteName,
    titleTemplate: '{title} — {site}',
    locale: opts.locale ?? 'en_US',
    defaultOgImage: opts.defaultOgImage ?? '/og-image.jpg',
    twitterHandle: opts.twitterHandle,
    aiPolicy: 'strict',
    organization: {
      name: opts.siteName,
      url: opts.siteUrl,
    },
  };
}