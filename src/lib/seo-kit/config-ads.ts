/**
 * AdSense configuration types — kept separate from `config.ts` so the
 * SEO-only bundle stays slim for projects that don't monetize.
 *
 * `SiteAds` is an extension of site config, NOT a replacement. It's
 * exported independently and consumed only by pages / generators that
 * opt in.
 */

/**
 * One authorized seller row in ads.txt. Each row is 3-4 comma-separated
 * fields per IAB spec:
 *
 *   <domain>, <publisherId>, <relationship>, [certAuthorityId]
 *
 * `subdomain` is the optional 5th field for "subdomain=www.example.com"
 * declarations needed when the canonical host is on a www subdomain.
 */
export interface AdsSeller {
  /** Ad system domain, e.g. "google.com". */
  domain: string;
  /** Publisher / account ID on that ad system. */
  publisherId: string;
  /** Direct sale or via reseller. */
  relationship: 'DIRECT' | 'RESELLER';
  /** Optional TAG certification authority ID (4th field). */
  certAuthorityId?: string;
  /** Optional `subdomain=...` declaration for www-style canonical hosts. */
  subdomain?: string;
}

/**
 * Google-specific config. The `autoAds` flag controls whether to inject
 * the Auto Ads script; the verification meta is always emitted when a
 * publisher ID is present.
 */
export interface GoogleAdsConfig {
  /** ca-pub-XXXXXXXXXXXXXXXX */
  publisherId: string;
  /** Inject Auto Ads script on every page (recommended for new sites). */
  autoAds?: boolean;
  /** Authorized sellers in ads.txt. */
  sellers?: AdsSeller[];
}

/**
 * Cookie / privacy consent config. When `required: true`, the Auto Ads
 * script must be blocked until the user explicitly opts in (GDPR / ePrivacy
 * for EU traffic). Implementation lives in the consuming app — this is
 * just the configuration surface.
 */
export interface ConsentConfig {
  /** Show a cookie consent banner before loading ads. */
  required: boolean;
  /** URL of the privacy policy page (referenced from the banner). */
  policyUrl?: string;
  /** Optional cookie name used by the consent storage. */
  cookieName?: string;
}

export interface SiteAds {
  google?: GoogleAdsConfig;
  consent?: ConsentConfig;
}