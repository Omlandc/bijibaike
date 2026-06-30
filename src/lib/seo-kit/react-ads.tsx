/**
 * <AdsHead /> — applies AdSense verification meta + Auto Ads script
 * imperatively (same pattern as <SEOHead />).
 *
 * Unlike <SEOHead />, this component is **singleton** — it should be
 * mounted once in the root layout. Re-mounts across navigation re-apply
 * the same tags, which is idempotent.
 *
 * Two behaviors, both gated on the ads config:
 *  - Verification meta: emitted whenever a Google publisher ID is set
 *    (so you can verify ownership before turning ads on).
 *  - Auto Ads script: only injected when `autoAds: true` AND consent is
 *    either not required or already granted.
 */
import { useEffect } from 'react';
import type { SiteAds } from './config-ads.ts';
import {
  generateAdsenseVerificationMeta,
  generateAutoAdsScript,
  isAdsEnabled,
} from './ads.ts';

export interface AdsHeadProps {
  /** Ads config from `defineAds(...)`. */
  config?: SiteAds;
  /**
   * Whether the user has consented to ad cookies. If `consent.required`
   * is true in the config, the Auto Ads script is blocked until this is
   * true. Verification meta is always emitted.
   */
  consented?: boolean;
}

const META_NAME = 'google-adsense-account';
const SCRIPT_ID = 'adsbygoogle-script';

export function AdsHead({ config, consented = true }: AdsHeadProps) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!isAdsEnabled(config)) return;

    // 1. Verification meta — always emit when we have a publisher ID.
    const metaTag = generateAdsenseVerificationMeta(config);
    if (metaTag) {
      // Extract content value to compare cheaply
      const m = metaTag.match(/content="([^"]+)"/);
      const value = m ? m[1] : '';
      let node = document.head.querySelector<HTMLMetaElement>(
        `meta[name="${META_NAME}"]`,
      );
      if (!node) {
        node = document.createElement('meta');
        node.setAttribute('name', META_NAME);
        document.head.appendChild(node);
      }
      if (node.getAttribute('content') !== value) {
        node.setAttribute('content', value);
      }
    }

    // 2. Auto Ads script — gated on consent + the autoAds flag.
    const wantsAuto = Boolean(config!.google!.autoAds);
    const requireConsent = Boolean(config!.consent?.required);
    const canLoad = wantsAuto && (!requireConsent || consented);

    const existing = document.getElementById(SCRIPT_ID);
    if (canLoad && !existing) {
      const html = generateAutoAdsScript(config);
      if (html) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        const script = wrapper.firstElementChild;
        if (script) {
          script.id = SCRIPT_ID;
          document.head.appendChild(script);
        }
      }
    } else if (!canLoad && existing) {
      // Strip the script if consent was revoked.
      existing.remove();
    }
  }, [config, consented]);

  return null;
}