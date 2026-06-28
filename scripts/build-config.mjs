#!/usr/bin/env node
/**
 * build-config.mjs —— 把 vault/_config.md 编译成 src/config/site-config.ts
 *
 * 两个来源合并:
 *   1. YAML frontmatter (扁平 "dotted.key" 字面量键,Obsidian Properties
 *      面板能直接编辑每行)
 *   2. markdown body 里的 ```yaml 代码块 (复杂结构: nav / footer /
 *      pillars / resources),按出现顺序合并,后者覆盖前者。
 *
 * 字段类型推断:
 *   - "true" / "false" (不区分大小写) → boolean
 *   - 逗号分隔字符串 (在 ARRAY_KEYS 里登记的) → string[]
 *   - 其他 → 原样 string
 *
 * 跑法:
 *   - npm run build 前自动调用
 *   - 也可独立跑 `npm run build:config`
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const CONFIG_MD = join(ROOT, 'vault', '_config.md');
const OUT_TS = join(ROOT, 'src', 'config', 'site-config.ts');
const OUT_JSON = join(ROOT, 'src', 'config', 'site-config.json');

if (!existsSync(CONFIG_MD)) {
  console.error(`✗ build-config: vault/_config.md not found at ${CONFIG_MD}`);
  console.error(`  请先跑 \`npm run vault:pull\` 把 vault 拉下来。`);
  process.exit(1);
}

// ----------------------------------------------------------------------------
// 字段类型注册
// ----------------------------------------------------------------------------

/** Comma-separated strings that should be split into string arrays. */
const ARRAY_KEYS = new Set([
  'site.themes',
  'site.languages',
  'seo.keywords',
  'ads.consent.categories',
]);

/** String booleans that should be coerced into real booleans. */
const BOOL_KEYS = new Set([
  'ads.enabled',
  'ads.verification',
  'ads.autoAds',
  'ads.consent.required',
]);

/** Convert a raw frontmatter scalar to its proper JS type. */
function coerceScalar(key, raw) {
  if (raw === undefined || raw === null) return raw;
  if (BOOL_KEYS.has(key)) {
    if (typeof raw === 'boolean') return raw;
    return String(raw).toLowerCase() === 'true';
  }
  if (ARRAY_KEYS.has(key)) {
    if (Array.isArray(raw)) return raw;
    return String(raw)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return raw;
}

/**
 * Take the flat `{ "site.name": "...", "site.author.name": "..." }` map
 * (gray-matter keeps the literal-dotted keys as strings) and unflatten
 * it into a nested object, coercing types per the registered keys.
 */
function unflattenFrontmatter(flat) {
  const out = {};
  for (const [key, raw] of Object.entries(flat)) {
    const parts = key.split('.');
    let cur = out;
    for (let i = 0; i < parts.length - 1; i++) {
      const seg = parts[i];
      if (typeof cur[seg] !== 'object' || cur[seg] === null || Array.isArray(cur[seg])) {
        cur[seg] = {};
      }
      cur = cur[seg];
    }
    cur[parts[parts.length - 1]] = coerceScalar(key, raw);
  }
  return out;
}

/**
 * Deep-merge b into a (arrays + objects in b replace those in a,
 * primitives in b replace those in a).
 */
function deepMerge(a, b) {
  if (b === undefined || b === null) return a;
  if (typeof a !== 'object' || a === null || Array.isArray(a)) return b;
  if (typeof b !== 'object' || Array.isArray(b)) return b;
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) {
    out[k] = k in out ? deepMerge(out[k], v) : v;
  }
  return out;
}

/**
 * Extract every ```yaml fenced block from the markdown body, in order.
 * Returns parsed YAML objects (or null on parse error).
 */
function extractYamlBlocks(body) {
  const re = /```ya?ml\n([\s\S]*?)```/g;
  const blocks = [];
  let m;
  while ((m = re.exec(body)) !== null) {
    try {
      const parsed = yaml.load(m[1]);
      if (parsed && typeof parsed === 'object') blocks.push(parsed);
    } catch (err) {
      console.warn(`⚠ build-config: failed to parse a yaml block in body: ${err.message}`);
    }
  }
  return blocks;
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

const raw = readFileSync(CONFIG_MD, 'utf-8');
const { data, content } = matter(raw);

// 1) Frontmatter (flat dotted keys → nested)
const fmConfig = unflattenFrontmatter(data || {});

// 2) Body code blocks, merged
const bodyConfigs = extractYamlBlocks(content);
let bodyConfig = {};
for (const b of bodyConfigs) bodyConfig = deepMerge(bodyConfig, b);

// 3) Body wins over frontmatter for the same keys
const merged = deepMerge(fmConfig, bodyConfig);

// 4) Normalize to the SiteConfig shape with defaults
const site = merged.site ?? {};
const seo = merged.seo ?? {};
const ads = merged.ads ?? {};
const vault = merged.vault ?? {};
const nav = Array.isArray(merged.nav) ? merged.nav : [];
const footer = merged.footer ?? {};
const pillars = Array.isArray(merged.pillars) ? merged.pillars : [];
const resources = merged.resources ?? {};

const siteConfig = {
  site: {
    name: site.name ?? 'Obsidian Blog',
    shortName: site.shortName ?? site.name ?? 'Obsidian Blog',
    tagline: site.tagline ?? '',
    description: site.description ?? '',
    defaultTheme: site.defaultTheme ?? 'light',
    themes: Array.isArray(site.themes) && site.themes.length > 0
      ? site.themes
      : ['light', 'dark'],
    locale: site.locale ?? 'zh_CN',
    defaultLanguage: site.defaultLanguage ?? 'zh',
    languages: Array.isArray(site.languages) && site.languages.length > 0
      ? site.languages
      : ['zh', 'en'],
    contentTheme: site.contentTheme ?? 'default',
    author: {
      name: site.author?.name ?? '',
      url: site.author?.url ?? '',
    },
    social: {
      github: site.social?.github ?? '',
      twitter: site.social?.twitter ?? '',
      email: site.social?.email ?? '',
    },
  },
  seo: {
    siteUrl: seo.siteUrl ?? 'https://example.com',
    ogImage: seo.ogImage ?? '/og-image.svg',
    keywords: Array.isArray(seo.keywords) ? seo.keywords : [],
    twitter: seo.twitter ?? '',
  },
  ads: {
    enabled: !!ads.enabled,
    publisherId: ads.publisherId ?? '',
    verification: ads.verification !== false,
    autoAds: ads.autoAds !== false,
    consent: {
      required: ads.consent?.required !== false,
      categories: Array.isArray(ads.consent?.categories) ? ads.consent.categories : ['necessary', 'marketing'],
    },
  },
  vault: {
    repo: vault.repo ?? '',
    branch: vault.branch ?? 'main',
    ref: vault.ref ?? '',
    publicAttachmentsPath: vault.publicAttachmentsPath ?? '/attachments',
  },
  nav,
  footer: {
    copyright: footer.copyright ?? '',
    links: Array.isArray(footer.links) ? footer.links : [],
  },
  pillars,
  resources: {
    sections: Array.isArray(resources.sections) ? resources.sections : [],
  },
};

// 简短的字段警告
const warn = (msg) => console.warn(`⚠ build-config: ${msg}`);
if (!siteConfig.site.name) warn('site.name is missing');
if (!siteConfig.vault.repo) warn('vault.repo is missing (vault:pull will fall back to default)');
if (siteConfig.nav.length === 0) warn('nav is empty — header will have no links');

// ----------------------------------------------------------------------------
// 写 src/config/site-config.ts
// ----------------------------------------------------------------------------

mkdirSync(dirname(OUT_TS), { recursive: true });

const ts = `// ⚠ AUTO-GENERATED by scripts/build-config.mjs
//   Source: vault/_config.md (frontmatter + body yaml code blocks)
//   Do not edit this file directly — run \`npm run build:config\` after editing the vault config.

import type { SiteConfig } from './site-config.types';

export const siteConfig: SiteConfig = ${JSON.stringify(siteConfig, null, 2)} as const;
`;

writeFileSync(OUT_TS, ts, 'utf-8');
writeFileSync(OUT_JSON, JSON.stringify(siteConfig, null, 2), 'utf-8');

console.log(`✓ build-config: wrote ${OUT_TS.replace(ROOT + '/', '')} + ${OUT_JSON.replace(ROOT + '/', '')}`);
console.log(`  site.name=${siteConfig.site.name} | nav=${siteConfig.nav.length} | pillars=${siteConfig.pillars.length} | resources.sections=${siteConfig.resources.sections.length}`);
