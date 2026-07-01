import path from "path"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    inspectAttr(),
    react(),
    {
      // Inject the real site name + description from vault/_config.md
      // (via the build-config step that runs before vite) into the
      // static <title>/<meta> tags. React's SeoHead still runs at
      // runtime to override per-route, but this gives crawlers and
      // pre-hydration paint a meaningful fallback.
      name: 'inject-site-meta',
      transformIndexHtml(html) {
        const configPath = resolve(__dirname, 'src/config/site-config.json')
        const cfg = JSON.parse(readFileSync(configPath, 'utf-8'))
        const name = cfg.site?.name ?? 'My Obsidian Blog'
        const desc = (cfg.site?.description ?? cfg.site?.tagline ?? name)
          .replace(/"/g, '&quot;')
        const lang = cfg.site?.defaultLanguage ?? 'zh'
        return html
          .replace(/<title>.*?<\/title>/, `<title>${name}</title>`)
          .replace(/<html lang="[^"]*">/, `<html lang="${lang}">`)
          .replace(
            /<\/head>/,
            `    <meta name="description" content="${desc}" />\n  </head>`,
          )
      },
    },
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Force a single React copy even when seo-kit (linked via file:)
    // has its own node_modules/react. Without this, hooks fail with
    // "Cannot read properties of null (reading 'useEffect')".
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
});
