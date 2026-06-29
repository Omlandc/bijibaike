#!/usr/bin/env node
/**
 * Node-side loader for the SEO config.
 *
 * `src/seo.config.ts` is what the Vite/browser side imports, but it
 * pulls in `seo-kit` and uses the `@/...` Vite alias — neither works
 * under Node's --experimental-strip-types. The build script needs a
 * plain JS object that can be stringified into sitemap.xml /
 * robots.txt without dragging the whole React + seo-kit chain in.
 *
 * This file is plain ESM, no TS, no aliases, no node_modules imports
 * other than the local `site-config.json` produced by build-config.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

/**
 * Mirrors the small slice of `siteConfig` that `seo.config.ts` uses
 * to build `siteSEO`. Keep the fields in sync if you add SEO-relevant
 * entries to SiteConfig.
 */
export function loadSiteConfig() {
  const cfgPath = resolve(root, 'src', 'config', 'site-config.json');
  const cfg = JSON.parse(readFileSync(cfgPath, 'utf-8'));
  const { site: siteInfo, seo, footer } = cfg;
  return {
    site: siteInfo,
    seo,
    footer,
    pillars: cfg.pillars ?? [],
  };
}
