/**
 * SEO configuration types.
 *
 * Two layers:
 *  - `SiteSEO`: site-wide defaults, lives in `seo.config.ts`
 *  - `PageSEO`: per-page overrides, passed to `<SEOHead config={...} />`
 *
 * The merge is done by `resolveSEO(site, page)`. Pages only need to specify
 * what differs from the site defaults — most fields are optional.
 */

// ─── Page-level config (what gets passed to <SEOHead />) ──────────────

export interface PageSEO {
  /** Page title. Combined with site's titleTemplate. */
  title?: string;
  /** Meta description (155 chars ideal). */
  description?: string;
  /** Targeted keywords (3-8 typical). */
  keywords?: string[];
  /** Canonical URL of this page (absolute or site-relative). */
  canonical?: string;
  /** Open Graph type. */
  ogType?: 'website' | 'article' | 'profile' | 'book';
  /** Open Graph image (absolute or site-relative). */
  ogImage?: string;
  /** Locale, e.g. 'zh_CN', 'en_US'. */
  ogLocale?: string;
  /** Article author name. */
  author?: string;
  /** ISO 8601 publish time. */
  publishedTime?: string;
  /** ISO 8601 modified time. */
  modifiedTime?: string;
  /** Article section / category. */
  section?: string;
  /** Article tags (separate from keywords). */
  tags?: string[];
  /** Override robots directive. Set to false to noindex. */
  robots?: string;
  /** Disable AI training crawlers for this page. */
  noai?: boolean;
  /** JSON-LD structured data, attached to this page. */
  jsonLd?: JsonLdValue | JsonLdValue[];
  /** Set to false to skip rendering this SEO entirely. */
  enabled?: boolean;
}

// ─── Site-level config (the file users edit) ──────────────────────────

export interface SiteSEO {
  /** Canonical site origin, e.g. "https://example.com". No trailing slash. */
  siteUrl: string;
  /** Site / brand name. */
  siteName: string;
  /** Default page title (when no per-page title is set). */
  defaultTitle?: string;
  /**
   * How to combine site + page title.
   * - "{title} | {site}" (default, OG-style)
   * - "{title} — {site}"
   * - function (site, page) => string
   */
  titleTemplate?: string | ((site: string, page: string) => string);
  /** Default description used when no per-page description is set. */
  description?: string;
  /** Default keywords. */
  keywords?: string[];
  /** Default author. */
  author?: string;
  /** Default locale (e.g. 'zh_CN'). */
  locale?: string;
  /**
   * Default OG image. Used when a page doesn't specify one.
   * Should be at least 1200x630px for best social previews.
   */
  defaultOgImage?: string;
  /**
   * Twitter card handle (without @), e.g. "yourname".
   * Used for twitter:site and twitter:creator meta tags.
   */
  twitterHandle?: string;
  /**
   * Open Graph profile — for organizations publishing content.
   */
  organization?: {
    name: string;
    url?: string;
    logo?: string;
    /** SameAs array — links to social profiles / wikipedia. */
    sameAs?: string[];
  };
  /**
   * AI crawler policy.
   *  - "strict": block all known AI training crawlers
   *  - "open":  allow them (helps with AI search citation)
   *  - "custom": use the customBots list below
   */
  aiPolicy?: 'strict' | 'open' | 'custom';
  /** Custom bot rules, only used when aiPolicy === "custom". */
  customBots?: BotRule[];
  /** Sitemap configuration. */
  sitemap?: SitemapConfig;
  /** JSON-LD default blocks (Organization / WebSite) attached to every page. */
  defaultJsonLd?: JsonLdValue[];
}

export interface BotRule {
  /** User-agent string (e.g. "GPTBot", "ClaudeBot"). */
  userAgent: string;
  /** Whether to allow or disallow. */
  action: 'allow' | 'disallow';
  /** Path patterns to restrict (optional, applies to allow/disallow). */
  paths?: string[];
  /** Optional comment line. */
  comment?: string;
}

// ─── Sitemap ──────────────────────────────────────────────────────────

export interface SitemapConfig {
  /** Whether to enable sitemap generation. */
  enabled: boolean;
  /** Paths that are always included. */
  staticPaths?: SitemapEntry[];
  /**
   * Function called at build time (or runtime for SPA) to produce
   * dynamic entries (e.g. blog posts, products).
   */
  dynamicPaths?: () => SitemapEntry[] | Promise<SitemapEntry[]>;
  /** Default changefreq when not specified per entry. */
  defaultChangefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  /** Default priority (0-1). */
  defaultPriority?: number;
}

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

// ─── JSON-LD ──────────────────────────────────────────────────────────

/**
 * JSON-LD is a graph of typed objects. We type it loosely as
 * `Record<string, unknown>` so users can pass any schema.org type
 * (Organization, Article, BreadcrumbList, WebSite, Product, …).
 *
 * For convenience we provide builders in `jsonld.ts` that produce
 * well-typed objects for the common types.
 */
export type JsonLdValue = Record<string, unknown>;

// ─── Resolved (merged) config ─────────────────────────────────────────

/**
 * The final config passed to `<SEOHead />` after merging site + page.
 * All fields are guaranteed to be defined (site defaults fill in the gaps).
 */
export interface ResolvedSEO {
  siteUrl: string;
  siteName: string;
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  ogType: 'website' | 'article' | 'profile' | 'book';
  ogImage: string;
  ogLocale: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  robots: string;
  noai: boolean;
  twitterHandle?: string;
  organization?: SiteSEO['organization'];
  jsonLd: JsonLdValue[];
}