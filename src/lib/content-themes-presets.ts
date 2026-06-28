/**
 * 内容主题（Content Themes）—— 文章正文的排版样式
 *
 * 区别于 lib/theme/ 的 UI 控件主题（按钮/背景色）
 * 这里的主题作用在 **文章正文** 上：h1/h2/p/code/blockquote/table 等
 *
 * 灵感来源：WeMD (tenngoxars/WeMD) —— 微信公众号 Markdown 编辑器
 * 它定义了 15+ 套 #wemd 容器内的 CSS 主题，这里选 6 套最经典的
 * 重新目标到 .blog-article 类，让普通博客也能用
 */

export interface ContentTheme {
  /** 唯一 id（用于 className 后缀） */
  slug: string;
  /** 显示名 */
  name: string;
  /** 英文名 */
  nameEn: string;
  /** 简短描述 */
  description: string;
  /** 主题分类（用于 picker 分组） */
  category: 'minimal' | 'classic' | 'decorative' | 'experimental';
  /** 是否为系统预设（不可删除） */
  builtin: boolean;
  /** 主题预览色（用于 picker 缩略图） */
  preview: {
    bg: string;
    fg: string;
    accent: string;
  };
  /** 实际 CSS（注入 <style> 标签） */
  css: string;
}

/* ========================================================================
 * 1. default —— 基础简洁（默认）
 * ====================================================================== */
const defaultTheme: ContentTheme = {
  slug: 'default',
  name: '简洁',
  nameEn: 'Default',
  description: '干净的排版，适合技术写作和日常博客',
  category: 'minimal',
  builtin: true,
  preview: { bg: '#ffffff', fg: '#1a1a1a', accent: '#3b82f6' },
  css: `
.blog-article.blog-article--default {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 17px;
  line-height: 1.8;
  color: var(--color-fg, #1a1a1a);
  word-break: break-word;
}
.blog-article.blog-article--default h1,
.blog-article.blog-article--default h2,
.blog-article.blog-article--default h3,
.blog-article.blog-article--default h4,
.blog-article.blog-article--default h5,
.blog-article.blog-article--default h6 {
  margin: 1.6em 0 0.6em;
  font-weight: 700;
  color: var(--color-fg, #1a1a1a);
  line-height: 1.3;
}
.blog-article.blog-article--default h1 { font-size: 2em; border-bottom: 1px solid var(--color-border, #e5e7eb); padding-bottom: 0.3em; }
.blog-article.blog-article--default h2 { font-size: 1.5em; }
.blog-article.blog-article--default h3 { font-size: 1.25em; }
.blog-article.blog-article--default h4 { font-size: 1.1em; }
.blog-article.blog-article--default p { margin: 0 0 1em; }
.blog-article.blog-article--default a {
  color: var(--color-primary, #3b82f6);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}
.blog-article.blog-article--default a:hover { border-bottom-color: currentColor; }
.blog-article.blog-article--default blockquote {
  margin: 1em 0;
  padding: 0.5em 1em;
  border-left: 4px solid var(--color-primary, #3b82f6);
  background: var(--color-bg-subtle, #f8fafc);
  color: var(--color-fg-muted, #475569);
  border-radius: 0 6px 6px 0;
}
.blog-article.blog-article--default blockquote > :first-child { margin-top: 0; }
.blog-article.blog-article--default blockquote > :last-child { margin-bottom: 0; }
.blog-article.blog-article--default code {
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  font-size: 0.9em;
  padding: 0.15em 0.4em;
  background: var(--color-bg-subtle, #f1f5f9);
  border-radius: 4px;
  color: #db2777;
}
.blog-article.blog-article--default pre {
  margin: 1em 0;
  padding: 1em;
  background: #1e293b;
  color: #e2e8f0;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.9em;
  line-height: 1.6;
}
.blog-article.blog-article--default pre code {
  background: transparent;
  padding: 0;
  color: inherit;
  font-size: inherit;
}
.blog-article.blog-article--default ul,
.blog-article.blog-article--default ol { margin: 0 0 1em; padding-left: 1.6em; }
.blog-article.blog-article--default li { margin: 0.3em 0; }
.blog-article.blog-article--default table {
  border-collapse: collapse;
  margin: 1em 0;
  width: 100%;
}
.blog-article.blog-article--default th,
.blog-article.blog-article--default td {
  border: 1px solid var(--color-border, #e5e7eb);
  padding: 0.5em 0.8em;
  text-align: left;
}
.blog-article.blog-article--default th {
  background: var(--color-bg-subtle, #f8fafc);
  font-weight: 600;
}
.blog-article.blog-article--default img {
  max-width: 100%;
  border-radius: 6px;
  margin: 1em 0;
}
.blog-article.blog-article--default hr {
  border: none;
  border-top: 1px dashed var(--color-border, #e5e7eb);
  margin: 2em 0;
}
`,
};

/* ========================================================================
 * 2. academic —— 学术论文
 * ====================================================================== */
const academicTheme: ContentTheme = {
  slug: 'academic',
  name: '学术',
  nameEn: 'Academic',
  description: '衬线字体 + 宋体，适合论文、严肃长文',
  category: 'classic',
  builtin: true,
  preview: { bg: '#fdfcf7', fg: '#1a1a1a', accent: '#7c1d1d' },
  css: `
.blog-article.blog-article--academic {
  font-family: 'Times New Roman', 'Songti SC', 'STSong', 'SimSun', '宋体', serif;
  font-size: 17px;
  line-height: 1.85;
  color: #1a1a1a;
  padding: 1em 0.5em;
  word-break: break-word;
}
.blog-article.blog-article--academic h1 {
  text-align: center;
  margin: 2em 0 1.2em;
  font-size: 1.6em;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.blog-article.blog-article--academic h2 {
  margin: 1.8em 0 0.8em;
  font-size: 1.3em;
  font-weight: 700;
  border-bottom: 1.5px solid #1a1a1a;
  padding-bottom: 0.3em;
}
.blog-article.blog-article--academic h3 {
  margin: 1.4em 0 0.6em;
  font-size: 1.1em;
  font-weight: 700;
  color: #7c1d1d;
}
.blog-article.blog-article--academic h4 { margin: 1.2em 0 0.4em; font-size: 1em; font-weight: 700; font-style: italic; }
.blog-article.blog-article--academic p {
  margin: 0 0 1em;
  text-align: justify;
  text-indent: 0;
}
.blog-article.blog-article--academic a {
  color: #7c1d1d;
  text-decoration: underline;
  text-decoration-color: rgba(124, 29, 29, 0.3);
}
.blog-article.blog-article--academic a:hover { text-decoration-color: currentColor; }
.blog-article.blog-article--academic blockquote {
  margin: 1.2em 1em;
  padding: 0.5em 1.2em;
  border-left: 3px solid #1a1a1a;
  color: #4a4a4a;
  font-style: italic;
}
.blog-article.blog-article--academic code {
  font-family: 'Courier New', 'Courier', monospace;
  font-size: 0.9em;
  padding: 0.1em 0.4em;
  background: rgba(124, 29, 29, 0.08);
  border-radius: 2px;
  color: #7c1d1d;
}
.blog-article.blog-article--academic pre {
  margin: 1em 0;
  padding: 1em 1.2em;
  background: #f5f1e8;
  color: #1a1a1a;
  border: 1px solid #d4cdb8;
  border-left: 3px solid #7c1d1d;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  line-height: 1.6;
  overflow-x: auto;
}
.blog-article.blog-article--academic pre code { background: transparent; padding: 0; color: inherit; }
.blog-article.blog-article--academic ul,
.blog-article.blog-article--academic ol { margin: 0 0 1em; padding-left: 2em; }
.blog-article.blog-article--academic table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.2em 0;
  font-size: 0.95em;
}
.blog-article.blog-article--academic th,
.blog-article.blog-article--academic td {
  border-top: 1px solid #1a1a1a;
  border-bottom: 1px solid #1a1a1a;
  padding: 0.5em 0.8em;
  text-align: left;
}
.blog-article.blog-article--academic th { border-top: 2px solid; border-bottom: 2px solid; font-weight: 700; }
.blog-article.blog-article--academic img { max-width: 100%; margin: 1em auto; display: block; }
.blog-article.blog-article--academic hr {
  border: none;
  text-align: center;
  margin: 2em 0;
}
.blog-article.blog-article--academic hr::after {
  content: '※ ※ ※';
  letter-spacing: 1em;
  color: #4a4a4a;
}
`,
};

/* ========================================================================
 * 3. cyberpunk —— 赛博朋克（霓虹）
 * ====================================================================== */
const cyberpunkTheme: ContentTheme = {
  slug: 'cyberpunk',
  name: '赛博朋克',
  nameEn: 'Cyberpunk',
  description: '深色 + 霓虹辉光，科技、未来感',
  category: 'experimental',
  builtin: true,
  preview: { bg: '#0a0e1a', fg: '#f0f6fc', accent: '#00f0ff' },
  css: `
.blog-article.blog-article--cyberpunk {
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  font-size: 16px;
  line-height: 1.8;
  color: #f0f6fc;
  background: linear-gradient(180deg, #0a0e1a 0%, #0f1524 100%);
  padding: 1.5em 1.2em;
  border: 1px solid #00f0ff44;
  border-radius: 4px;
  word-break: break-word;
  position: relative;
}
.blog-article.blog-article--cyberpunk::before {
  content: '';
  position: absolute;
  top: -1px; left: -1px; right: -1px; bottom: -1px;
  border-radius: 4px;
  background: linear-gradient(135deg, #00f0ff, #ff00aa, #00f0ff);
  opacity: 0.15;
  z-index: -1;
}
.blog-article.blog-article--cyberpunk h1,
.blog-article.blog-article--cyberpunk h2,
.blog-article.blog-article--cyberpunk h3,
.blog-article.blog-article--cyberpunk h4 {
  font-family: 'Orbitron', 'JetBrains Mono', sans-serif;
  color: #00f0ff;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 1.6em 0 0.6em;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.2);
}
.blog-article.blog-article--cyberpunk h1 {
  font-size: 1.8em;
  border-bottom: 1px solid #00f0ff66;
  padding-bottom: 0.3em;
}
.blog-article.blog-article--cyberpunk h2 { font-size: 1.4em; color: #ff00aa; text-shadow: 0 0 8px rgba(255, 0, 170, 0.4); }
.blog-article.blog-article--cyberpunk h3 { font-size: 1.2em; color: #fffb00; text-shadow: 0 0 8px rgba(255, 251, 0, 0.4); }
.blog-article.blog-article--cyberpunk h4 { font-size: 1.05em; color: #f0f6fc; }
.blog-article.blog-article--cyberpunk p { margin: 0 0 1em; }
.blog-article.blog-article--cyberpunk a {
  color: #00f0ff;
  text-decoration: none;
  border-bottom: 1px dashed #00f0ff88;
}
.blog-article.blog-article--cyberpunk a:hover { text-shadow: 0 0 6px currentColor; }
.blog-article.blog-article--cyberpunk blockquote {
  margin: 1em 0;
  padding: 0.8em 1em;
  border-left: 3px solid #ff00aa;
  background: rgba(255, 0, 170, 0.08);
  color: #f0f6fc;
  font-style: italic;
}
.blog-article.blog-article--cyberpunk code {
  font-family: inherit;
  font-size: 0.9em;
  padding: 0.1em 0.4em;
  background: rgba(0, 240, 255, 0.12);
  color: #00f0ff;
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 2px;
}
.blog-article.blog-article--cyberpunk pre {
  margin: 1em 0;
  padding: 1em;
  background: #06080f;
  color: #f0f6fc;
  border: 1px solid #00f0ff44;
  border-left: 3px solid #00f0ff;
  font-size: 0.88em;
  line-height: 1.5;
  overflow-x: auto;
  position: relative;
}
.blog-article.blog-article--cyberpunk pre::before {
  content: '> TERMINAL';
  display: block;
  color: #00f0ff;
  font-size: 0.7em;
  margin-bottom: 0.5em;
  letter-spacing: 0.2em;
  opacity: 0.6;
}
.blog-article.blog-article--cyberpunk pre code { background: transparent; padding: 0; border: none; color: inherit; }
.blog-article.blog-article--cyberpunk ul,
.blog-article.blog-article--cyberpunk ol { margin: 0 0 1em; padding-left: 1.6em; }
.blog-article.blog-article--cyberpunk li::marker { color: #00f0ff; }
.blog-article.blog-article--cyberpunk table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  border: 1px solid #00f0ff44;
}
.blog-article.blog-article--cyberpunk th,
.blog-article.blog-article--cyberpunk td {
  border: 1px solid #00f0ff33;
  padding: 0.5em 0.8em;
}
.blog-article.blog-article--cyberpunk th {
  background: rgba(0, 240, 255, 0.1);
  color: #00f0ff;
  text-transform: uppercase;
  font-size: 0.9em;
}
.blog-article.blog-article--cyberpunk img { max-width: 100%; border: 1px solid #00f0ff44; }
.blog-article.blog-article--cyberpunk hr {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00f0ff, transparent);
  margin: 2em 0;
}
`,
};

/* ========================================================================
 * 4. receipt —— 小票（终端风）
 * ====================================================================== */
const receiptTheme: ContentTheme = {
  slug: 'receipt',
  name: '小票',
  nameEn: 'Receipt',
  description: '等宽字体 + 虚线分隔，像超市小票一样',
  category: 'decorative',
  builtin: true,
  preview: { bg: '#faf6f0', fg: '#2a2a2a', accent: '#8b4513' },
  css: `
.blog-article.blog-article--receipt {
  font-family: 'Courier New', 'Courier', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #2a2a2a;
  background: #faf6f0;
  padding: 1.5em;
  border: 1px dashed #8b451366;
  border-radius: 2px;
  max-width: 600px;
  margin: 0 auto;
  word-break: break-word;
}
.blog-article.blog-article--receipt::before {
  content: '★ ★ ★  RECEIPT  ★ ★ ★';
  display: block;
  text-align: center;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #8b4513;
  margin-bottom: 1em;
  border-bottom: 1px dashed #8b451366;
  padding-bottom: 0.8em;
}
.blog-article.blog-article--receipt h1,
.blog-article.blog-article--receipt h2,
.blog-article.blog-article--receipt h3,
.blog-article.blog-article--receipt h4 {
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #8b4513;
  margin: 1.2em 0 0.6em;
  border-bottom: 1px dashed #8b451366;
  padding-bottom: 0.3em;
}
.blog-article.blog-article--receipt h1 { font-size: 1.3em; text-align: center; border-bottom: 2px dashed #8b4513; }
.blog-article.blog-article--receipt h2 { font-size: 1.15em; }
.blog-article.blog-article--receipt h3 { font-size: 1.05em; }
.blog-article.blog-article--receipt p { margin: 0 0 0.8em; }
.blog-article.blog-article--receipt a { color: #8b4513; text-decoration: underline; }
.blog-article.blog-article--receipt blockquote {
  margin: 1em 0;
  padding: 0.6em 1em;
  border-left: 2px dashed #8b4513;
  background: rgba(139, 69, 19, 0.04);
}
.blog-article.blog-article--receipt code {
  font-family: inherit;
  background: rgba(139, 69, 19, 0.1);
  padding: 0.05em 0.3em;
  font-size: 0.9em;
}
.blog-article.blog-article--receipt pre {
  margin: 1em 0;
  padding: 0.8em;
  background: #2a2a2a;
  color: #f0f0f0;
  font-size: 0.85em;
  line-height: 1.5;
  border-radius: 2px;
  overflow-x: auto;
}
.blog-article.blog-article--receipt pre code { background: transparent; padding: 0; color: inherit; }
.blog-article.blog-article--receipt ul,
.blog-article.blog-article--receipt ol { margin: 0 0 0.8em; padding-left: 1.6em; }
.blog-article.blog-article--receipt li::marker { color: #8b4513; }
.blog-article.blog-article--receipt table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  font-size: 0.9em;
}
.blog-article.blog-article--receipt th,
.blog-article.blog-article--receipt td {
  border-bottom: 1px dashed #8b451366;
  padding: 0.3em 0.5em;
  text-align: left;
}
.blog-article.blog-article--receipt th { border-bottom: 1px dashed #8b4513; font-weight: 700; }
.blog-article.blog-article--receipt img { max-width: 100%; border: 1px dashed #8b451366; }
.blog-article.blog-article--receipt hr {
  border: none;
  border-top: 1px dashed #8b451366;
  margin: 1.5em 0;
}
`,
};

/* ========================================================================
 * 5. sunset —— 日落胶片
 * ====================================================================== */
const sunsetTheme: ContentTheme = {
  slug: 'sunset',
  name: '日落',
  nameEn: 'Sunset',
  description: '暖色渐变 + 衬线标题，复古胶片感',
  category: 'decorative',
  builtin: true,
  preview: { bg: '#fff5e6', fg: '#4a2818', accent: '#d97706' },
  css: `
.blog-article.blog-article--sunset {
  font-family: 'Georgia', 'Songti SC', 'Source Han Serif SC', serif;
  font-size: 17px;
  line-height: 1.9;
  color: #4a2818;
  background: linear-gradient(180deg, #fff5e6 0%, #ffe4c4 100%);
  padding: 1.5em 1.2em;
  border-radius: 8px;
  word-break: break-word;
}
.blog-article.blog-article--sunset h1,
.blog-article.blog-article--sunset h2,
.blog-article.blog-article--sunset h3,
.blog-article.blog-article--sunset h4 {
  font-family: 'Playfair Display', 'Georgia', 'Songti SC', serif;
  color: #8b3a0c;
  margin: 1.6em 0 0.6em;
  font-weight: 700;
  letter-spacing: 0.01em;
}
.blog-article.blog-article--sunset h1 {
  font-size: 2em;
  text-align: center;
  background: linear-gradient(135deg, #d97706 0%, #db2777 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  margin-top: 1em;
  padding: 0.2em 0;
}
.blog-article.blog-article--sunset h2 {
  font-size: 1.5em;
  border-bottom: 1px solid #d9770644;
  padding-bottom: 0.3em;
}
.blog-article.blog-article--sunset h3 { font-size: 1.2em; color: #c2410c; }
.blog-article.blog-article--sunset h4 { font-size: 1.05em; font-style: italic; }
.blog-article.blog-article--sunset p { margin: 0 0 1em; }
.blog-article.blog-article--sunset a {
  color: #c2410c;
  text-decoration: none;
  border-bottom: 1px solid #d9770644;
  transition: border-color 0.2s;
}
.blog-article.blog-article--sunset a:hover { border-bottom-color: currentColor; }
.blog-article.blog-article--sunset blockquote {
  margin: 1.2em 0;
  padding: 0.8em 1.2em;
  background: linear-gradient(90deg, rgba(217, 119, 6, 0.08) 0%, transparent 100%);
  border-left: 3px solid #d97706;
  font-style: italic;
  color: #6b3a0c;
  border-radius: 0 6px 6px 0;
}
.blog-article.blog-article--sunset code {
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  font-size: 0.88em;
  padding: 0.1em 0.4em;
  background: rgba(217, 119, 6, 0.12);
  color: #8b3a0c;
  border-radius: 3px;
}
.blog-article.blog-article--sunset pre {
  margin: 1.2em 0;
  padding: 1em;
  background: #2a1810;
  color: #f5e6d3;
  border-radius: 6px;
  font-size: 0.88em;
  line-height: 1.6;
  overflow-x: auto;
  border: 1px solid #8b3a0c;
}
.blog-article.blog-article--sunset pre code { background: transparent; padding: 0; color: inherit; }
.blog-article.blog-article--sunset ul,
.blog-article.blog-article--sunset ol { margin: 0 0 1em; padding-left: 1.8em; }
.blog-article.blog-article--sunset li::marker { color: #d97706; }
.blog-article.blog-article--sunset table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.2em 0;
  background: rgba(255, 245, 230, 0.5);
  border-radius: 6px;
  overflow: hidden;
}
.blog-article.blog-article--sunset th,
.blog-article.blog-article--sunset td {
  padding: 0.5em 0.8em;
  border-bottom: 1px solid #d9770633;
  text-align: left;
}
.blog-article.blog-article--sunset th {
  background: rgba(217, 119, 6, 0.15);
  color: #8b3a0c;
  font-weight: 700;
}
.blog-article.blog-article--sunset img {
  max-width: 100%;
  border-radius: 6px;
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(139, 58, 12, 0.15);
}
.blog-article.blog-article--sunset hr {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, #d97706, transparent);
  margin: 2em 0;
}
`,
};

/* ========================================================================
 * 6. aurora —— 极光玻璃
 * ====================================================================== */
const auroraTheme: ContentTheme = {
  slug: 'aurora',
  name: '极光',
  nameEn: 'Aurora',
  description: '磨砂玻璃 + 极光渐变，柔和通透',
  category: 'decorative',
  builtin: true,
  preview: { bg: '#f0f4ff', fg: '#1e293b', accent: '#a78bfa' },
  css: `
.blog-article.blog-article--aurora {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 17px;
  line-height: 1.85;
  color: #1e293b;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  padding: 1.5em 1.5em;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
  position: relative;
  word-break: break-word;
}
.blog-article.blog-article--aurora::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: linear-gradient(135deg,
    rgba(167, 139, 250, 0.15) 0%,
    rgba(56, 189, 248, 0.1) 30%,
    rgba(244, 114, 182, 0.1) 60%,
    rgba(167, 139, 250, 0.15) 100%);
  z-index: -1;
}
.blog-article.blog-article--aurora h1,
.blog-article.blog-article--aurora h2,
.blog-article.blog-article--aurora h3,
.blog-article.blog-article--aurora h4 {
  font-weight: 700;
  margin: 1.6em 0 0.6em;
  letter-spacing: -0.01em;
}
.blog-article.blog-article--aurora h1 {
  font-size: 1.9em;
  background: linear-gradient(135deg, #a78bfa 0%, #38bdf8 50%, #f472b6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  text-align: center;
  padding: 0.3em 0;
}
.blog-article.blog-article--aurora h2 {
  font-size: 1.4em;
  color: #1e293b;
  border-bottom: 1px solid rgba(167, 139, 250, 0.3);
  padding-bottom: 0.3em;
}
.blog-article.blog-article--aurora h3 { font-size: 1.2em; color: #6d28d9; }
.blog-article.blog-article--aurora h4 { font-size: 1.05em; color: #0e7490; }
.blog-article.blog-article--aurora p { margin: 0 0 1em; }
.blog-article.blog-article--aurora a {
  color: #6d28d9;
  text-decoration: none;
  background: linear-gradient(120deg, rgba(167, 139, 250, 0.2) 0%, rgba(56, 189, 248, 0.2) 100%);
  padding: 0 0.2em;
  border-radius: 3px;
  transition: all 0.2s;
}
.blog-article.blog-article--aurora a:hover {
  background: linear-gradient(120deg, rgba(167, 139, 250, 0.4) 0%, rgba(56, 189, 248, 0.4) 100%);
}
.blog-article.blog-article--aurora blockquote {
  margin: 1.2em 0;
  padding: 0.8em 1.2em;
  background: linear-gradient(90deg, rgba(167, 139, 250, 0.1) 0%, rgba(56, 189, 248, 0.05) 100%);
  border-left: 3px solid;
  border-image: linear-gradient(180deg, #a78bfa, #38bdf8) 1;
  border-radius: 0 8px 8px 0;
  color: #475569;
}
.blog-article.blog-article--aurora code {
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  font-size: 0.88em;
  padding: 0.1em 0.4em;
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.15), rgba(56, 189, 248, 0.15));
  color: #6d28d9;
  border-radius: 4px;
}
.blog-article.blog-article--aurora pre {
  margin: 1.2em 0;
  padding: 1em 1.2em;
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(10px);
  color: #e2e8f0;
  border-radius: 12px;
  font-size: 0.88em;
  line-height: 1.6;
  overflow-x: auto;
  border: 1px solid rgba(167, 139, 250, 0.2);
}
.blog-article.blog-article--aurora pre code {
  background: transparent;
  padding: 0;
  color: inherit;
}
.blog-article.blog-article--aurora ul,
.blog-article.blog-article--aurora ol { margin: 0 0 1em; padding-left: 1.8em; }
.blog-article.blog-article--aurora li::marker { color: #a78bfa; }
.blog-article.blog-article--aurora table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 1.2em 0;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(167, 139, 250, 0.2);
}
.blog-article.blog-article--aurora th,
.blog-article.blog-article--aurora td {
  padding: 0.6em 0.9em;
  text-align: left;
  border-bottom: 1px solid rgba(167, 139, 250, 0.15);
}
.blog-article.blog-article--aurora th {
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.15), rgba(56, 189, 248, 0.1));
  color: #6d28d9;
  font-weight: 700;
}
.blog-article.blog-article--aurora img {
  max-width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(31, 38, 135, 0.1);
}
.blog-article.blog-article--aurora hr {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.4), rgba(56, 189, 248, 0.4), transparent);
  margin: 2em 0;
}
`,
};


/* ========================================================================
 * 7. bauhaus —— 包豪斯（几何 + 原色）
 * ====================================================================== */
const bauhausTheme: ContentTheme = {
  slug: 'bauhaus',
  name: '包豪斯',
  nameEn: 'Bauhaus',
  description: '几何块面 + 红黄蓝原色，现代主义设计',
  category: 'experimental',
  builtin: true,
  preview: { bg: '#f5f1e8', fg: '#1a1a1a', accent: '#d40000' },
  css: `
.blog-article.blog-article--bauhaus {
  font-family: 'Futura', 'Avenir Next', 'Helvetica Neue', sans-serif;
  font-size: 17px;
  line-height: 1.7;
  color: #1a1a1a;
  background: #f5f1e8;
  padding: 1.5em 1.2em;
  word-break: break-word;
}
.blog-article.blog-article--bauhaus h1 {
  font-size: 2.4em;
  font-weight: 900;
  letter-spacing: -0.02em;
  margin: 1em 0 0.5em;
  background: linear-gradient(90deg, #d40000 0%, #d40000 60%, #ffd500 60%, #ffd500 80%, #0050b5 80%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  text-transform: uppercase;
}
.blog-article.blog-article--bauhaus h2 {
  font-size: 1.5em;
  font-weight: 700;
  color: #1a1a1a;
  border-bottom: 4px solid #1a1a1a;
  padding-bottom: 0.2em;
  margin: 1.4em 0 0.5em;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.blog-article.blog-article--bauhaus h3 {
  font-size: 1.2em;
  font-weight: 700;
  color: #d40000;
  margin: 1.2em 0 0.4em;
}
.blog-article.blog-article--bauhaus h4 { font-size: 1.05em; color: #0050b5; font-weight: 700; }
.blog-article.blog-article--bauhaus p { margin: 0 0 1em; }
.blog-article.blog-article--bauhaus a {
  color: #0050b5;
  text-decoration: none;
  border-bottom: 2px solid #ffd500;
}
.blog-article.blog-article--bauhaus blockquote {
  margin: 1em 0;
  padding: 1em;
  background: #ffd500;
  color: #1a1a1a;
  border-left: 6px solid #d40000;
  font-weight: 600;
}
.blog-article.blog-article--bauhaus code {
  font-family: 'IBM Plex Mono', monospace;
  background: #1a1a1a;
  color: #ffd500;
  padding: 0.1em 0.4em;
  font-size: 0.9em;
}
.blog-article.blog-article--bauhaus pre {
  margin: 1em 0;
  padding: 1em;
  background: #1a1a1a;
  color: #f5f1e8;
  border: 3px solid #d40000;
  font-size: 0.9em;
  line-height: 1.5;
  overflow-x: auto;
}
.blog-article.blog-article--bauhaus pre code { background: transparent; padding: 0; color: inherit; }
.blog-article.blog-article--bauhaus ul, .blog-article.blog-article--bauhaus ol { margin: 0 0 1em; padding-left: 1.5em; }
.blog-article.blog-article--bauhaus li::marker { color: #d40000; font-weight: 700; }
.blog-article.blog-article--bauhaus table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  border: 3px solid #1a1a1a;
}
.blog-article.blog-article--bauhaus th, .blog-article.blog-article--bauhaus td {
  border: 2px solid #1a1a1a;
  padding: 0.5em 0.8em;
}
.blog-article.blog-article--bauhaus th { background: #1a1a1a; color: #ffd500; }
.blog-article.blog-article--bauhaus img { max-width: 100%; border: 3px solid #1a1a1a; }
.blog-article.blog-article--bauhaus hr { border: none; height: 4px; background: linear-gradient(90deg, #d40000 0 33%, #ffd500 33% 66%, #0050b5 66% 100%); margin: 2em 0; }
`,

};

/* ========================================================================
 * 8. knowledge —— 知识库（Notion 风格）
 * ====================================================================== */
const knowledgeTheme: ContentTheme = {
  slug: 'knowledge',
  name: '知识库',
  nameEn: 'Knowledge',
  description: 'Notion / GitBook 风格，干净的知识文档',
  category: 'minimal',
  builtin: true,
  preview: { bg: '#ffffff', fg: '#37352f', accent: '#2383e2' },
  css: `
.blog-article.blog-article--knowledge {
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
  font-size: 16px;
  line-height: 1.65;
  color: #37352f;
  word-break: break-word;
}
.blog-article.blog-article--knowledge h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  color: #37352f;
  letter-spacing: -0.01em;
  margin: 1.8em 0 0.4em;
  line-height: 1.3;
}
.blog-article.blog-article--knowledge h1 { font-size: 2em; padding-bottom: 0.2em; }
.blog-article.blog-article--knowledge h2 { font-size: 1.5em; }
.blog-article.blog-article--knowledge h3 { font-size: 1.25em; }
.blog-article.blog-article--knowledge h4 { font-size: 1.1em; }
.blog-article.blog-article--knowledge p { margin: 0 0 0.9em; }
.blog-article.blog-article--knowledge a { color: #2383e2; text-decoration: underline; text-decoration-color: rgba(35, 131, 226, 0.3); }
.blog-article.blog-article--knowledge a:hover { text-decoration-color: currentColor; }
.blog-article.blog-article--knowledge blockquote {
  margin: 0.8em 0;
  padding: 0.4em 1em;
  border-left: 3px solid #37352f;
  color: #6f6e69;
}
.blog-article.blog-article--knowledge code {
  font-family: 'SF Mono', Menlo, monospace;
  font-size: 0.85em;
  padding: 0.15em 0.35em;
  background: #f7f6f3;
  color: #eb5757;
  border-radius: 3px;
  border: 1px solid #ebebea;
}
.blog-article.blog-article--knowledge pre {
  margin: 1em 0;
  padding: 1em 1.2em;
  background: #f7f6f3;
  color: #37352f;
  border-radius: 6px;
  font-size: 0.88em;
  line-height: 1.5;
  overflow-x: auto;
  border: 1px solid #ebebea;
}
.blog-article.blog-article--knowledge pre code { background: transparent; padding: 0; border: none; color: inherit; }
.blog-article.blog-article--knowledge ul, .blog-article.blog-article--knowledge ol { margin: 0 0 0.9em; padding-left: 1.5em; }
.blog-article.blog-article--knowledge li { margin: 0.2em 0; }
.blog-article.blog-article--knowledge table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  border: 1px solid #ebebea;
}
.blog-article.blog-article--knowledge th, .blog-article.blog-article--knowledge td {
  border: 1px solid #ebebea;
  padding: 0.5em 0.8em;
  text-align: left;
}
.blog-article.blog-article--knowledge th { background: #f7f6f3; font-weight: 600; }
.blog-article.blog-article--knowledge img { max-width: 100%; border-radius: 4px; }
.blog-article.blog-article--knowledge hr { border: none; border-top: 1px solid #ebebea; margin: 2em 0; }
.blog-article.blog-article--knowledge ::selection { background: #ffe066; }
`,

};

/* ========================================================================
 * 9. luxury —— 轻奢金（杂志 / 商务）
 * ====================================================================== */
const luxuryTheme: ContentTheme = {
  slug: 'luxury',
  name: '轻奢金',
  nameEn: 'Luxury',
  description: '衬线 + 复古金 + 大留白，杂志/商务风',
  category: 'decorative',
  builtin: true,
  preview: { bg: '#faf7f0', fg: '#222', accent: '#9e8045' },
  css: `
.blog-article.blog-article--luxury {
  font-family: 'Songti SC', 'STSong', 'Georgia', serif;
  font-size: 16px;
  line-height: 2;
  color: #222;
  padding: 1.5em 0.8em;
  word-break: break-word;
}
.blog-article.blog-article--luxury h1 {
  font-size: 1.8em;
  font-weight: normal;
  text-align: center;
  letter-spacing: 0.3em;
  color: #000;
  border-bottom: 1px solid #9e8045;
  padding-bottom: 1.2em;
  margin: 2em 0 1.5em;
}
.blog-article.blog-article--luxury h2 {
  font-size: 1.3em;
  font-weight: normal;
  text-align: center;
  color: #9e8045;
  border-top: 1px solid #9e8045;
  border-bottom: 1px solid #9e8045;
  padding: 0.6em 1.5em;
  margin: 2.2em auto 1.2em;
  display: block;
  width: fit-content;
  letter-spacing: 0.1em;
}
.blog-article.blog-article--luxury h3 {
  font-size: 1.1em;
  color: #6b5526;
  border-left: 3px solid #9e8045;
  padding-left: 0.6em;
  margin: 1.5em 0 0.6em;
}
.blog-article.blog-article--luxury h4 { font-size: 1em; color: #444; font-style: italic; margin: 1.2em 0 0.4em; }
.blog-article.blog-article--luxury p { margin: 0 0 1.5em; text-align: justify; color: #444; }
.blog-article.blog-article--luxury a { color: #9e8045; text-decoration: underline; text-decoration-color: rgba(158, 128, 69, 0.3); }
.blog-article.blog-article--luxury blockquote {
  margin: 1.5em auto;
  padding: 0.8em 1.5em;
  max-width: 90%;
  text-align: center;
  color: #6b5526;
  font-style: italic;
  border-top: 1px solid #9e804544;
  border-bottom: 1px solid #9e804544;
}
.blog-article.blog-article--luxury code {
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  background: rgba(158, 128, 69, 0.1);
  color: #6b5526;
  padding: 0.1em 0.4em;
}
.blog-article.blog-article--luxury pre {
  margin: 1.5em 0;
  padding: 1.2em;
  background: #1a1810;
  color: #d4af37;
  font-family: 'Courier New', monospace;
  font-size: 0.88em;
  line-height: 1.6;
  overflow-x: auto;
  border: 1px solid #9e8045;
}
.blog-article.blog-article--luxury pre code { background: transparent; padding: 0; color: inherit; }
.blog-article.blog-article--luxury ul, .blog-article.blog-article--luxury ol { margin: 0 0 1.2em; padding-left: 1.8em; }
.blog-article.blog-article--luxury li::marker { color: #9e8045; }
.blog-article.blog-article--luxury table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
  font-size: 0.95em;
}
.blog-article.blog-article--luxury th, .blog-article.blog-article--luxury td {
  border-bottom: 1px solid #d4af37;
  padding: 0.5em 0.8em;
  text-align: center;
}
.blog-article.blog-article--luxury th { color: #6b5526; font-weight: bold; border-bottom: 2px solid #9e8045; }
.blog-article.blog-article--luxury img { max-width: 100%; border: 1px solid #9e8045; }
.blog-article.blog-article--luxury hr {
  border: none;
  text-align: center;
  margin: 2.5em 0;
  height: 1em;
}
.blog-article.blog-article--luxury hr::after { content: '✦ ✦ ✦'; color: #9e8045; letter-spacing: 0.5em; }
`,

};

/* ========================================================================
 * 10. morandi —— 莫兰迪（低饱和绿色调）
 * ====================================================================== */
const morandiTheme: ContentTheme = {
  slug: 'morandi',
  name: '莫兰迪',
  nameEn: 'Morandi',
  description: '低饱和绿色调，柔和治愈，文艺气质',
  category: 'decorative',
  builtin: true,
  preview: { bg: '#f1f4f0', fg: '#2f3e32', accent: '#4f6f52' },
  css: `
.blog-article.blog-article--morandi {
  font-family: 'Optima', 'Georgia', 'PingFang SC', 'Microsoft YaHei', serif;
  font-size: 16px;
  line-height: 2;
  color: #2f3e32;
  background: linear-gradient(180deg, #f1f4f0 0%, #e8ebe9 100%);
  padding: 1.5em 1.2em;
  letter-spacing: 0.3px;
  word-break: break-word;
}
.blog-article.blog-article--morandi h1 {
  font-size: 1.6em;
  font-weight: normal;
  text-align: center;
  color: #1a261d;
  display: inline-block;
  padding: 0.6em 1.5em;
  border: 1px solid #739072;
  background: #f1f4f0;
  letter-spacing: 0.15em;
  margin: 1.5em auto 2em;
  width: fit-content;
  display: block;
}
.blog-article.blog-article--morandi h2 {
  font-size: 1.3em;
  font-weight: 700;
  color: #4f6f52;
  border-bottom: 1px solid #e8ebe9;
  padding-bottom: 0.5em;
  margin: 2em 0 1em;
}
.blog-article.blog-article--morandi h3 { font-size: 1.1em; color: #5a7d5d; margin: 1.5em 0 0.6em; }
.blog-article.blog-article--morandi h4 { font-size: 1em; color: #6b8a6e; font-style: italic; }
.blog-article.blog-article--morandi p { margin: 0 0 1.3em; text-align: justify; color: #3a4d39; }
.blog-article.blog-article--morandi a { color: #4f6f52; text-decoration: none; border-bottom: 1px solid rgba(79, 111, 82, 0.3); }
.blog-article.blog-article--morandi blockquote {
  margin: 1.3em 0;
  padding: 0.8em 1.2em;
  background: rgba(115, 144, 114, 0.08);
  border-left: 3px solid #739072;
  color: #4a6651;
  font-style: italic;
  border-radius: 0 4px 4px 0;
}
.blog-article.blog-article--morandi code {
  font-family: 'Courier New', monospace;
  background: #dde3d8;
  color: #3a4d39;
  padding: 0.1em 0.4em;
  font-size: 0.9em;
  border-radius: 3px;
}
.blog-article.blog-article--morandi pre {
  margin: 1.3em 0;
  padding: 1em 1.2em;
  background: #2a3527;
  color: #d8e3d9;
  border: 1px solid #4f6f52;
  font-family: 'Courier New', monospace;
  font-size: 0.88em;
  line-height: 1.6;
  overflow-x: auto;
  border-radius: 4px;
}
.blog-article.blog-article--morandi pre code { background: transparent; padding: 0; color: inherit; }
.blog-article.blog-article--morandi ul, .blog-article.blog-article--morandi ol { margin: 0 0 1.2em; padding-left: 1.8em; }
.blog-article.blog-article--morandi li::marker { color: #739072; }
.blog-article.blog-article--morandi table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.3em 0;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  overflow: hidden;
}
.blog-article.blog-article--morandi th, .blog-article.blog-article--morandi td {
  border-bottom: 1px solid #c8d3c9;
  padding: 0.5em 0.8em;
  text-align: left;
}
.blog-article.blog-article--morandi th { background: #dde3d8; color: #3a4d39; font-weight: 700; }
.blog-article.blog-article--morandi img { max-width: 100%; border-radius: 4px; filter: saturate(0.8); }
.blog-article.blog-article--morandi hr { border: none; border-top: 1px solid #c8d3c9; margin: 2em 0; }
`,

};

/* ========================================================================
 * 11. brutalism —— 新粗野主义（重边框 + 高对比）
 * ====================================================================== */
const brutalismTheme: ContentTheme = {
  slug: 'brutalism',
  name: '粗野',
  nameEn: 'Brutalism',
  description: '粗黑边 + 硬阴影 + 高对比，反精致设计',
  category: 'experimental',
  builtin: true,
  preview: { bg: '#fef9e7', fg: '#1a1a1a', accent: '#ff4081' },
  css: `
.blog-article.blog-article--brutalism {
  font-family: 'Space Grotesk', 'Inter', 'Helvetica Neue', sans-serif;
  font-size: 17px;
  line-height: 1.6;
  color: #1a1a1a;
  background: #fef9e7;
  padding: 1.5em;
  word-break: break-word;
}
.blog-article.blog-article--brutalism h1 {
  font-size: 2.5em;
  font-weight: 900;
  text-transform: uppercase;
  margin: 1em 0 0.6em;
  background: #1a1a1a;
  color: #fef9e7;
  padding: 0.4em 0.6em;
  box-shadow: 8px 8px 0 #ff4081;
  display: inline-block;
}
.blog-article.blog-article--brutalism h2 {
  font-size: 1.6em;
  font-weight: 900;
  text-transform: uppercase;
  color: #1a1a1a;
  background: linear-gradient(0deg, #ff4081 30%, transparent 30%);
  display: inline;
  padding: 0 0.1em;
  margin: 1.5em 0 0.5em;
}
.blog-article.blog-article--brutalism h3 {
  font-size: 1.25em;
  font-weight: 700;
  border-left: 8px solid #00bcd4;
  padding-left: 0.5em;
  margin: 1.2em 0 0.4em;
}
.blog-article.blog-article--brutalism h4 { font-size: 1.05em; color: #ff4081; font-weight: 700; }
.blog-article.blog-article--brutalism p { margin: 0 0 1em; }
.blog-article.blog-article--brutalism a {
  color: #1a1a1a;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-decoration-color: #ff4081;
}
.blog-article.blog-article--brutalism blockquote {
  margin: 1em 0;
  padding: 1em;
  background: #1a1a1a;
  color: #fef9e7;
  border: 4px solid #1a1a1a;
  box-shadow: 8px 8px 0 #00bcd4;
  font-style: italic;
}
.blog-article.blog-article--brutalism code {
  font-family: 'JetBrains Mono', monospace;
  background: #1a1a1a;
  color: #00bcd4;
  padding: 0.1em 0.4em;
  font-size: 0.9em;
  font-weight: 700;
}
.blog-article.blog-article--brutalism pre {
  margin: 1em 0;
  padding: 1em;
  background: #1a1a1a;
  color: #fef9e7;
  border: 4px solid #1a1a1a;
  box-shadow: 8px 8px 0 #ff4081;
  font-size: 0.88em;
  line-height: 1.5;
  overflow-x: auto;
  font-weight: 600;
}
.blog-article.blog-article--brutalism pre code { background: transparent; padding: 0; color: inherit; }
.blog-article.blog-article--brutalism ul, .blog-article.blog-article--brutalism ol { margin: 0 0 1em; padding-left: 1.5em; }
.blog-article.blog-article--brutalism li::marker { color: #ff4081; font-weight: 900; }
.blog-article.blog-article--brutalism table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  border: 4px solid #1a1a1a;
  box-shadow: 8px 8px 0 #ff4081;
}
.blog-article.blog-article--brutalism th, .blog-article.blog-article--brutalism td {
  border: 2px solid #1a1a1a;
  padding: 0.6em 0.8em;
}
.blog-article.blog-article--brutalism th { background: #1a1a1a; color: #fef9e7; text-transform: uppercase; }
.blog-article.blog-article--brutalism img { max-width: 100%; border: 4px solid #1a1a1a; box-shadow: 8px 8px 0 #00bcd4; }
.blog-article.blog-article--brutalism hr { border: none; height: 8px; background: #1a1a1a; margin: 2em 0; }
`,

};

/* ========================================================================
 * 12. github —— GitHub README 风格
 * ====================================================================== */
const githubTheme: ContentTheme = {
  slug: 'github',
  name: 'GitHub',
  nameEn: 'GitHub',
  description: 'GitHub README 风格，开源文档标配',
  category: 'minimal',
  builtin: true,
  preview: { bg: '#ffffff', fg: '#1f2328', accent: '#0969da' },
  css: `
.blog-article.blog-article--github {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #1f2328;
  word-break: break-word;
}
.blog-article.blog-article--github h1, .blog-article.blog-article--github h2, .blog-article.blog-article--github h3, .blog-article.blog-article--github h4, .blog-article.blog-article--github h5, .blog-article.blog-article--github h6 {
  font-weight: 600;
  margin-top: 24px;
  margin-bottom: 16px;
  line-height: 1.25;
  color: #1f2328;
}
.blog-article.blog-article--github h1 { font-size: 2em; padding-bottom: 0.3em; border-bottom: 1px solid #d1d9e0; }
.blog-article.blog-article--github h2 { font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid #d1d9e0; }
.blog-article.blog-article--github h3 { font-size: 1.25em; }
.blog-article.blog-article--github h4 { font-size: 1em; }
.blog-article.blog-article--github p { margin: 0 0 16px; }
.blog-article.blog-article--github a { color: #0969da; text-decoration: none; }
.blog-article.blog-article--github a:hover { text-decoration: underline; }
.blog-article.blog-article--github blockquote {
  margin: 0 0 16px;
  padding: 0 1em;
  color: #59636e;
  border-left: 0.25em solid #d1d9e0;
}
.blog-article.blog-article--github code {
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  font-size: 85%;
  padding: 0.2em 0.4em;
  background: rgba(175, 184, 193, 0.2);
  border-radius: 6px;
  color: #1f2328;
}
.blog-article.blog-article--github pre {
  margin: 0 0 16px;
  padding: 16px;
  background: #f6f8fa;
  color: #1f2328;
  border-radius: 6px;
  font-size: 85%;
  line-height: 1.45;
  overflow-x: auto;
}
.blog-article.blog-article--github pre code { background: transparent; padding: 0; font-size: 100%; color: inherit; }
.blog-article.blog-article--github ul, .blog-article.blog-article--github ol { margin: 0 0 16px; padding-left: 2em; }
.blog-article.blog-article--github table {
  border-collapse: collapse;
  margin: 0 0 16px;
  display: block;
  width: max-content;
  max-width: 100%;
  overflow-x: auto;
}
.blog-article.blog-article--github th, .blog-article.blog-article--github td {
  border: 1px solid #d1d9e0;
  padding: 6px 13px;
}
.blog-article.blog-article--github th { background: #f6f8fa; font-weight: 600; }
.blog-article.blog-article--github img { max-width: 100%; border-radius: 6px; }
.blog-article.blog-article--github hr { border: none; border-top: 1px solid #d1d9e0; margin: 24px 0; }
.blog-article.blog-article--github kbd {
  display: inline-block;
  padding: 3px 5px;
  font-family: monospace;
  font-size: 11px;
  line-height: 10px;
  color: #1f2328;
  vertical-align: middle;
  background: #f6f8fa;
  border: 1px solid #d1d9e0;
  border-radius: 6px;
  box-shadow: inset 0 -1px 0 #d1d9e0;
}
`,

};

/* ========================================================================
 * 13. terminal —— 终端 / 黑客风
 * ====================================================================== */
const terminalTheme: ContentTheme = {
  slug: 'terminal',
  name: '终端',
  nameEn: 'Terminal',
  description: '纯终端风，黑底绿字，等宽字体',
  category: 'experimental',
  builtin: true,
  preview: { bg: '#0c0c0c', fg: '#cccccc', accent: '#00ff41' },
  css: `
.blog-article.blog-article--terminal {
  font-family: 'JetBrains Mono', 'Fira Code', 'Source Code Pro', Consolas, monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #cccccc;
  background: #0c0c0c;
  padding: 1.5em 1.2em;
  border: 1px solid #1a1a1a;
  word-break: break-word;
}
.blog-article.blog-article--terminal::before {
  content: '$ cat article.md';
  display: block;
  color: #666;
  font-size: 0.85em;
  margin-bottom: 1em;
  border-bottom: 1px solid #1a1a1a;
  padding-bottom: 0.6em;
}
.blog-article.blog-article--terminal h1, .blog-article.blog-article--terminal h2, .blog-article.blog-article--terminal h3, .blog-article.blog-article--terminal h4 {
  color: #00ff41;
  font-weight: 700;
  text-transform: none;
  margin: 1.4em 0 0.4em;
}
.blog-article.blog-article--terminal h1 { font-size: 1.4em; }
.blog-article.blog-article--terminal h1::before { content: '# '; color: #666; }
.blog-article.blog-article--terminal h2 { font-size: 1.2em; }
.blog-article.blog-article--terminal h2::before { content: '## '; color: #666; }
.blog-article.blog-article--terminal h3 { font-size: 1.05em; }
.blog-article.blog-article--terminal h3::before { content: '### '; color: #666; }
.blog-article.blog-article--terminal h4 { font-size: 1em; color: #ffcc00; }
.blog-article.blog-article--terminal h4::before { content: '#### '; color: #666; }
.blog-article.blog-article--terminal p { margin: 0 0 0.8em; }
.blog-article.blog-article--terminal a { color: #00bfff; text-decoration: underline; }
.blog-article.blog-article--terminal blockquote {
  margin: 1em 0;
  padding: 0.5em 1em;
  border-left: 2px solid #00ff41;
  color: #888;
  background: #0a0a0a;
}
.blog-article.blog-article--terminal code {
  font-family: inherit;
  background: #1a1a1a;
  color: #ffcc00;
  padding: 0.1em 0.4em;
  font-size: 0.9em;
  border-radius: 2px;
}
.blog-article.blog-article--terminal pre {
  margin: 1em 0;
  padding: 1em;
  background: #000;
  color: #cccccc;
  border: 1px solid #1a1a1a;
  font-size: 0.92em;
  line-height: 1.5;
  overflow-x: auto;
}
.blog-article.blog-article--terminal pre code { background: transparent; padding: 0; color: inherit; }
.blog-article.blog-article--terminal ul, .blog-article.blog-article--terminal ol { margin: 0 0 0.8em; padding-left: 1.6em; }
.blog-article.blog-article--terminal li::marker { color: #00ff41; }
.blog-article.blog-article--terminal table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  border: 1px solid #1a1a1a;
}
.blog-article.blog-article--terminal th, .blog-article.blog-article--terminal td {
  border: 1px solid #1a1a1a;
  padding: 0.4em 0.7em;
  text-align: left;
}
.blog-article.blog-article--terminal th { background: #1a1a1a; color: #00ff41; }
.blog-article.blog-article--terminal img { max-width: 100%; border: 1px solid #1a1a1a; }
.blog-article.blog-article--terminal hr { border: none; border-top: 1px dashed #1a1a1a; margin: 2em 0; }
`,

};

/* ========================================================================
 * 14. magazine —— 杂志 / 编辑设计
 * ====================================================================== */
const magazineTheme: ContentTheme = {
  slug: 'magazine',
  name: '杂志',
  nameEn: 'Magazine',
  description: '编辑设计，大标题 + drop cap + 留白',
  category: 'decorative',
  builtin: true,
  preview: { bg: '#f8f5f0', fg: '#1a1a1a', accent: '#c1272d' },
  css: `
.blog-article.blog-article--magazine {
  font-family: 'Georgia', 'Source Han Serif SC', 'Songti SC', serif;
  font-size: 17px;
  line-height: 1.8;
  color: #1a1a1a;
  background: #f8f5f0;
  padding: 1.5em;
  word-break: break-word;
}
.blog-article.blog-article--magazine h1 {
  font-size: 2.8em;
  font-weight: 700;
  text-align: center;
  margin: 1.5em 0 0.3em;
  color: #1a1a1a;
  font-family: 'Playfair Display', 'Georgia', serif;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.blog-article.blog-article--magazine h1 + p { font-size: 1.1em; font-style: italic; color: #888; text-align: center; margin-bottom: 2em; }
.blog-article.blog-article--magazine h2 {
  font-size: 1.6em;
  font-weight: 700;
  color: #c1272d;
  margin: 1.8em 0 0.6em;
  font-family: 'Playfair Display', 'Georgia', serif;
  border-bottom: 1px solid #c1272d44;
  padding-bottom: 0.3em;
}
.blog-article.blog-article--magazine h3 { font-size: 1.25em; color: #1a1a1a; margin: 1.4em 0 0.5em; font-family: 'Playfair Display', serif; }
.blog-article.blog-article--magazine h4 { font-size: 1.05em; color: #c1272d; font-style: italic; }
.blog-article.blog-article--magazine p { margin: 0 0 1.1em; }
.blog-article.blog-article--magazine p:first-of-type::first-letter {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 4em;
  font-weight: 700;
  float: left;
  line-height: 0.9;
  margin: 0.1em 0.15em 0 0;
  color: #c1272d;
}
.blog-article.blog-article--magazine a { color: #c1272d; text-decoration: none; border-bottom: 1px solid #c1272d44; }
.blog-article.blog-article--magazine blockquote {
  margin: 1.5em 0;
  padding: 1em 1.5em;
  background: rgba(193, 39, 45, 0.05);
  border-left: 4px solid #c1272d;
  font-style: italic;
  font-size: 1.1em;
  color: #1a1a1a;
}
.blog-article.blog-article--magazine code {
  font-family: 'Courier New', monospace;
  background: #1a1a1a;
  color: #f8f5f0;
  padding: 0.1em 0.4em;
  font-size: 0.85em;
}
.blog-article.blog-article--magazine pre {
  margin: 1.5em 0;
  padding: 1.2em;
  background: #1a1a1a;
  color: #f8f5f0;
  font-family: 'Courier New', monospace;
  font-size: 0.88em;
  line-height: 1.6;
  overflow-x: auto;
  border-left: 4px solid #c1272d;
}
.blog-article.blog-article--magazine pre code { background: transparent; padding: 0; color: inherit; }
.blog-article.blog-article--magazine ul, .blog-article.blog-article--magazine ol { margin: 0 0 1.2em; padding-left: 1.6em; }
.blog-article.blog-article--magazine li::marker { color: #c1272d; }
.blog-article.blog-article--magazine table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
  font-size: 0.95em;
}
.blog-article.blog-article--magazine th, .blog-article.blog-article--magazine td {
  border-bottom: 1px solid #d0c8b8;
  padding: 0.6em 0.8em;
  text-align: left;
}
.blog-article.blog-article--magazine th { border-bottom: 2px solid #c1272d; color: #c1272d; font-family: 'Playfair Display', serif; }
.blog-article.blog-article--magazine img { max-width: 100%; }
.blog-article.blog-article--magazine hr { border: none; height: 1px; background: #c1272d44; margin: 2.5em 0; }
`,

};

export const PRESET_CONTENT_THEMES: ContentTheme[] = [
  defaultTheme,
  academicTheme,
  cyberpunkTheme,
  receiptTheme,
  sunsetTheme,
  auroraTheme,
  bauhausTheme,
  knowledgeTheme,
  luxuryTheme,
  morandiTheme,
  brutalismTheme,
  githubTheme,
  terminalTheme,
  magazineTheme,
];
