import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import { Buffer } from 'buffer'
import './index.css'
import App from './App.tsx'
import { siteConfig } from '@/config/site-config'

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

// Set <title> from config so first paint already has the right name.
;(function setBootTitle() {
  if (typeof document === 'undefined') return
  document.title = siteConfig.site.name
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)