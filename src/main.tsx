import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import { Buffer } from 'buffer'
import './index.css'
import App from './App.tsx'

// Polyfill Node globals that gray-matter and friends need in the browser.
if (typeof window !== 'undefined' && !(window as unknown as { Buffer?: unknown }).Buffer) {
  ;(window as unknown as { Buffer: typeof Buffer }).Buffer = Buffer
}
if (typeof globalThis !== 'undefined' && !(globalThis as unknown as { Buffer?: unknown }).Buffer) {
  ;(globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)