/**
 * SiteConfig 类型定义
 *
 * 运行时实例由 scripts/build-config.mjs 从 vault/_config.md 生成，
 * 这里只定义 shape，便于 IDE 提示和类型校验。
 */

export interface SiteAuthor {
  name: string;
  url: string;
}

export interface SiteFeature {
  text: string;
  /** lucide-react icon name. Falls back to Sparkles when unknown. */
  icon?: string;
}

export interface SiteSocial {
  github?: string;
  twitter?: string;
  email?: string;
}

export interface SiteSection {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  defaultTheme: 'light' | 'dark' | 'sepia' | 'cyberpunk' | string;
  themes: string[];
  locale: string;
  /** BCP-47 locale (e.g. "zh-CN") for the OG locale tag. */
  defaultLanguage: 'zh' | 'en' | string;
  languages: ('zh' | 'en' | string)[];
  /** Default article-content theme (see lib/content-themes.ts). */
  contentTheme: string;
  author: SiteAuthor;
  social: SiteSocial;
  /** Pill badges shown next to the Home H1 ("Obsidian 兼容" etc.).
   *  Empty array hides the badge row entirely. */
  features?: SiteFeature[];
}

export interface SeoSection {
  siteUrl: string;
  ogImage: string;
  keywords: string[];
  twitter: string;
}

export interface AdsSection {
  enabled: boolean;
  publisherId: string;
  verification: boolean;
  autoAds: boolean;
  consent: {
    required: boolean;
    categories: string[];
  };
}

export interface VaultSection {
  repo: string;
  branch: string;
  ref?: string;
  publicAttachmentsPath: string;
}

/**
 * A label that can be either a plain string (used for every
 * language) or a per-language map (used when the site has
 * multiple `site.languages` declared).
 *
 *   label: "Home"                  // simple — same text everywhere
 *   label: { zh: "首页", en: "Home" }  // per-language
 */
export type LocalizedString = string | Partial<Record<string, string>>;

export interface NavItem {
  label: LocalizedString;
  to: string;
  icon: string;
  end?: boolean;
  /** Set true to hide this entry from the rendered top nav. */
  hidden?: boolean;
}

export interface FooterLink {
  label: LocalizedString;
  to: string;
  /** Set true to hide this entry from the rendered footer link list. */
  hidden?: boolean;
}

export interface FooterSection {
  copyright: LocalizedString;
  links: FooterLink[];
  /** Set false to hide the GitHub entry in the footer
   *  (even if site.social.github is non-empty). Defaults to true. */
  showGithub?: boolean;
}

export interface PillarSection {
  name: string;
  description?: string;
  cover?: string;
}

export interface ResourceItem {
  title: string;
  url: string;
  description?: string;
}

export interface ResourceSection {
  title: string;
  description?: string;
  items: ResourceItem[];
}

export interface ResourcesSection {
  sections: ResourceSection[];
  /** Optional override for the page header subtitle (replaces the
   *  built-in i18n string `resources.subtitle`). Strings or
   *  `{ zh, en }` per-language. */
  subtitle?: LocalizedString;
  /** Optional override for the trailing config-hint paragraph
   *  (the bit that says where the data lives). */
  configNote?: LocalizedString;
}

export interface ChangelogItem {
  /** Bullet point under the entry's description. */
  text: string;
}

export interface ChangelogEntry {
  /** ISO date — display label as-is. */
  date: string;
  /** Release label, e.g. v1.2.0 (free-form, used as a chip). */
  version: string;
  /** Short title for the entry. */
  title: string;
  /** Short description under the title. */
  description?: string;
  /** Optional bullet list. */
  items?: ChangelogItem[];
  /** Optional changelog type: feature | fix | improvement | breaking. */
  type?: 'feature' | 'fix' | 'improvement' | 'breaking';
}

export interface ChangelogSection {
  entries: ChangelogEntry[];
}

export interface SiteConfig {
  site: SiteSection;
  seo: SeoSection;
  ads: AdsSection;
  vault: VaultSection;
  nav: NavItem[];
  footer: FooterSection;
  pillars: PillarSection[];
  resources: ResourcesSection;
  changelog: ChangelogSection;
}
