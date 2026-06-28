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

export interface SiteConfig {
  site: SiteSection;
  seo: SeoSection;
  ads: AdsSection;
  vault: VaultSection;
  nav: NavItem[];
  footer: FooterSection;
  pillars: PillarSection[];
  resources: ResourcesSection;
}
