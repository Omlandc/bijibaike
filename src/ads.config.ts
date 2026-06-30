/**
 * AdSense configuration for the blog.
 *
 * Derived from `siteConfig.ads` (vault/_config.md → scripts/build-config.mjs).
 * Edit the vault config to change AdSense behavior — not this file.
 *
 * Imported by:
 *  - SiteLayout (mounts <AdsHead /> for verification meta + Auto Ads)
 *  - scripts/generate-seo-files.mjs (writes public/ads.txt at build time)
 */
import { defineAds, googleAdsenseSeller } from '@/lib/seo-kit';
import { siteConfig } from '@/config/site-config';

const { ads } = siteConfig;
const PUB_ID = ads.publisherId || 'ca-pub-0000000000000000';

export const siteAds = defineAds({
  google: {
    publisherId: PUB_ID,
    autoAds: ads.autoAds,
    sellers: ads.enabled
      ? [googleAdsenseSeller(PUB_ID)]
      : [],
  },
  consent: {
    required: ads.consent.required,
    policyUrl: '/#/privacy',
    cookieName: 'blog-consent',
    categories: ads.consent.categories,
  },
});
