import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import { Buffer } from 'buffer'
import './index.css'
import App from './App.tsx'
import { siteConfig } from '@/config/site-config'
import { I18nProvider, detectLanguage } from '@/i18n'
import { applyContentTheme, getStoredArticleTheme } from '@/lib/content-themes'

// Polyfill Node globals that gray-matter and friends need in the browser.
if (typeof window !== 'undefined' && !(window as unknown as { Buffer?: unknown }).Buffer) {
  ;(window as unknown as { Buffer: typeof Buffer }).Buffer = Buffer
}
if (typeof globalThis !== 'undefined' && !(globalThis as unknown as { Buffer?: unknown }).Buffer) {
  ;(globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer
}

// Apply default theme synchronously before paint, so users don't see
// a flash of the wrong colors when the configured defaultTheme differs
// from the browser's prefers-color-scheme default.
const THEME_STORAGE_KEY = 'obsidian-blog-theme'
;(function applyDefaultTheme() {
  if (typeof document === 'undefined') return
  const stored = (() => {
    try { return localStorage.getItem(THEME_STORAGE_KEY) } catch { return null }
  })()
  const themes = siteConfig.site.themes
  const chosen = stored && themes.includes(stored)
    ? stored
    : (themes.includes(siteConfig.site.defaultTheme) ? siteConfig.site.defaultTheme : themes[0])
  if (chosen) document.documentElement.setAttribute('data-theme', chosen)
})()

// Set <html lang> + initial title before paint.
;(function setBootLang() {
  if (typeof document === 'undefined') return
  const lang = detectLanguage()
  document.documentElement.lang = lang
  document.title = siteConfig.site.name
})()

// Apply the article content theme synchronously before paint so the
// first frame already uses the configured theme (or the user's stored
// override). localStorage choice wins over the site default.
;(function applyBootArticleTheme() {
  if (typeof document === 'undefined') return
  applyContentTheme(getStoredArticleTheme() ?? siteConfig.site.contentTheme ?? 'default')
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </I18nProvider>
  </StrictMode>,
)