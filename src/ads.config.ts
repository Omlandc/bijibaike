/**
 * AdSense configuration for the blog.
 *
 * Single source of truth — same pattern as `seo.config.ts`.
 * Imported by:
 *  - SiteLayout (mounts <AdsHead /> for verification meta + Auto Ads)
 *  - scripts/generate-seo-files.mjs (writes public/ads.txt at build time)
 *
 * To activate real ads, replace the placeholder publisher ID with your
 * own `ca-pub-XXXXXXXXXXXXXXXX` (Google AdSense account → Account →
 * Account information). Everything else can stay as-is.
 */
import { defineAds, googleAdsenseSeller } from 'seo-kit';

/**
 * NOTE: this is a SAMPLE publisher ID only. Google will not serve ads
 * on it until you replace it with your own and verify ownership in
 * AdSense → Sites. Use it to verify ads.txt is served correctly, then
 * swap in your real ID before applying for review.
 */
const ADSENSE_PUB_ID = 'ca-pub-0000000000000000';

export const siteAds = defineAds({
  google: {
    publisherId: ADSENSE_PUB_ID,
    // Turn this on once you've verified ownership. The Auto Ads script
    // is gated on the consent banner below — until the user clicks
    // "Accept", no Google scripts run.
    autoAds: true,
    sellers: [
      // The minimum ads.txt entry Google requires for verification.
      googleAdsenseSeller(ADSENSE_PUB_ID),
    ],
  },
  // GDPR / ePrivacy gate. Required for any EU traffic. The banner
  // lives in `src/components/CookieConsent.tsx` and writes its decision
  // to localStorage so the Auto Ads script picks it up on next load.
  consent: {
    required: true,
    policyUrl: '/#/privacy',
    cookieName: 'blog-consent',
  },
});