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

export interface NavItem {
  label: string;
  to: string;
  icon: string;
  end?: boolean;
}

export interface FooterLink {
  label: string;
  to: string;
}

export interface FooterSection {
  copyright: string;
  links: FooterLink[];
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
