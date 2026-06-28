/**
 * Content themes —— 文章正文排版主题
 *
 * 14 套预设主题(从 Omlandc/blog-system 同步),作用于文章正文
 * (h1/h2/p/code/blockquote/table/img/...) 的排版,不改变站点壳
 * (header / button / background)的颜色。
 *
 * 工作方式:
 *   - 所有主题 CSS 编译进一个 <style id="content-themes-sheet">
 *   - 选择器形如 `.blog-article--{slug} h1 { ... }`,作用域严格
 *   - 切换主题 = 给文章根加 class `blog-article blog-article--{slug}`
 *   - 用户选择存 localStorage,覆盖站点默认
 *
 * 站点默认主题在 vault/_config.md 的 `site.contentTheme` 字段配置。
 */
import { PRESET_CONTENT_THEMES, type ContentTheme } from './content-themes-presets';

export type { ContentTheme };
export { PRESET_CONTENT_THEMES };

const STYLE_ID = 'content-themes-sheet';
const STORAGE_KEY = 'obsidian-blog-article-theme';

export const CONTENT_THEMES: ContentTheme[] = PRESET_CONTENT_THEMES;
export const DEFAULT_THEME_SLUG = 'default';

export function getContentTheme(slug: string): ContentTheme | undefined {
  return CONTENT_THEMES.find((t) => t.slug === slug);
}

export function getStoredArticleTheme(): string | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v && getContentTheme(v) ? v : null;
  } catch {
    return null;
  }
}

export function setStoredArticleTheme(slug: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, slug);
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/*  CSS 注入:把全部主题的 CSS 一次性塞进 <head>                       */
/*  选择器已经自带 .blog-article--{slug} 作用域,不会互相打架            */
/* ------------------------------------------------------------------ */

let cssInjected = false;

function buildAllCSS(): string {
  return CONTENT_THEMES.map((t) => t.css).join('\n');
}

export function ensureContentThemesSheet(): void {
  if (typeof document === 'undefined') return;
  if (cssInjected) return;
  const existing = document.getElementById(STYLE_ID);
  if (existing) existing.remove();
  const style = document.createElement('style');
  style.id = STYLE_ID;
  // Use textContent (safer than innerHTML) — all the theme CSS is
  // hand-written so no HTML escaping concerns.
  style.textContent = buildAllCSS();
  document.head.appendChild(style);
  cssInjected = true;
}

/**
 * Apply a theme to the document. The CSS variables + .blog-article--{slug}
 * class land on <html>, so ANY container (post article, settings preview,
 * markdown-view in /tags, etc.) gets the theme for free. Theme CSS uses
 * `.blog-article--{slug} <selector>` so it only matches descendants of
 * a node carrying that class.
 */
export function applyContentTheme(slug: string): void {
  if (typeof document === 'undefined') return;
  ensureContentThemesSheet();
  const html = document.documentElement;
  // Remove any previous theme class (set of `blog-article--*`)
  for (const cls of Array.from(html.classList)) {
    if (cls.startsWith('blog-article--')) html.classList.remove(cls);
  }
  if (slug && slug !== DEFAULT_THEME_SLUG) {
    html.classList.add(`blog-article--${slug}`);
  }
  // `default` is the base style — no class needed.
  // We always set data-article-theme for inspector/debugging.
  html.setAttribute('data-article-theme', slug);
}
