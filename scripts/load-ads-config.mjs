#!/usr/bin/env node
/**
 * Node-side loader for the AdSense config. See the SEO sibling
 * (scripts/load-seo-config.mjs) for why this is plain ESM rather
 * than reusing src/ads.config.ts.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

export function loadAdsConfig() {
  const cfgPath = resolve(root, 'src', 'config', 'site-config.json');
  const cfg = JSON.parse(readFileSync(cfgPath, 'utf-8'));
  return {
    ads: cfg.ads ?? {
      enabled: false,
      publisherId: 'ca-pub-0000000000000000',
      verification: true,
      autoAds: true,
      consent: { required: true, categories: ['necessary', 'marketing'] },
    },
  };
}
