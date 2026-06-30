#!/usr/bin/env node
/**
 * Prebuild script: emit public/sitemap.xml + public/robots.txt +
 * public/ads.txt using seo-kit generators.
 *
 * We don't `import` src/seo.config.ts or src/ads.config.ts because
 * both pull in the `@/...` Vite alias and the seo-kit chain (which
 * is fine in the Vite/browser build but not in plain Node). Instead
 * we read the small slice we need from src/config/site-config.json
 * (already produced by build-config) via the load-*-config.mjs
 * helpers, and we call the pure seo-kit generator functions
 * directly.
 *
 * The dynamic blog-paths file (src/seo-paths.ts) is still loaded via
 * Node's --experimental-strip-types because it lives entirely in
 * Node APIs (fs, gray-matter) and is the cleanest place for that
 * logic to live.
 *
 * Wired into package.json's `build` script:
 *   "build": "node scripts/generate-seo-files.mjs && tsc -b && vite build"
 */
import { spawn } from 'node:child_process';
import { writeFile, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadSiteConfig } from './load-seo-config.mjs';
import { loadAdsConfig } from './load-ads-config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const distDir = resolve(root, 'public');

/**
 * Build the `siteSEO` shape that `src/seo.config.ts` exposes to the
 * browser. We mirror the relevant fields here because the build-time
 * tools only need the SEO/ads/footer/pillars slices — there's no
 * point pulling in the React tree to generate static files.
 */
function buildSiteSEO(cfg) {
  const { site: siteInfo, seo, footer, pillars } = cfg;
  const SITE_URL = seo.siteUrl;
  const SITE_NAME = siteInfo.name;
  return {
    siteUrl: SITE_URL,
    siteName: SITE_NAME,
    defaultTitle: SITE_NAME,
    titleTemplate: `%s · ${SITE_NAME}`,
    defaultDescription: siteInfo.description ?? siteInfo.tagline ?? SITE_NAME,
    defaultOgImage: seo.ogImage ?? '/og-image.svg',
    locale: siteInfo.locale ?? 'zh_CN',
    organization: {
      name: SITE_NAME,
      url: SITE_URL,
      logo: '/og-image.svg',
      sameAs: [
        siteInfo.social?.github,
        siteInfo.social?.twitter,
      ]
        .filter(Boolean)
        .map((u) => (u.startsWith('http') ? u : `https://${u}`)),
    },
    sitemap: {
      // Static pages — these are also reachable from the React Router
      // but we list them explicitly so a cold sitemap.xml still
      // references them before the dynamic blog paths are scanned.
      staticPaths: [
        { loc: '/', priority: 1.0, changefreq: 'weekly' },
        { loc: '/blog', priority: 0.9, changefreq: 'weekly' },
        { loc: '/topics', priority: 0.8, changefreq: 'weekly' },
        { loc: '/tags', priority: 0.7, changefreq: 'weekly' },
        { loc: '/graph', priority: 0.6, changefreq: 'monthly' },
        { loc: '/resources', priority: 0.6, changefreq: 'monthly' },
        { loc: '/changelog', priority: 0.5, changefreq: 'weekly' },
        { loc: '/pricing', priority: 0.7, changefreq: 'monthly' },
        { loc: '/about', priority: 0.5, changefreq: 'monthly' },
        { loc: '/privacy', priority: 0.3, changefreq: 'yearly' },
        { loc: '/contact', priority: 0.5, changefreq: 'yearly' },
      ].concat(
        (pillars ?? []).map((p) => ({
          loc: `/topics/${encodeURIComponent(p.name)}`,
          priority: 0.7,
          changefreq: 'weekly',
        })),
      ),
      defaultChangefreq: 'weekly',
      defaultPriority: 0.5,
    },
    robots: {
      allow: ['/'],
      disallow: ['/admin', '/login'],
    },
    footerCopyright: footer?.copyright ?? '',
    keywords: seo.keywords ?? [],
    twitter: seo.twitter ?? '',
    author: siteInfo.author ?? { name: '', url: '' },
  };
}

async function main() {
  const cfg = loadSiteConfig();
  const siteSEO = buildSiteSEO(cfg);
  const adsCfg = loadAdsConfig();

  // Load blogSitemapPaths from the TS file via strip-types.
  const blogSitemapPaths = await new Promise((resolveP, rejectP) => {
    const pathsFile = resolve(root, 'src/seo-paths.ts');
    const code = `
      import { pathToFileURL } from 'node:url';
      const mod = await import(${JSON.stringify(pathToFileURL(pathsFile).href)});
      const paths = await mod.blogSitemapPaths();
      process.stdout.write(JSON.stringify(paths));
    `;
    const child = spawn(
      process.execPath,
      ['--experimental-strip-types', '--no-warnings', '--input-type=module', '-e', code],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('close', (code) => {
      if (code === 0) {
        try { resolveP(JSON.parse(out)); } catch (e) { rejectP(e); }
      } else {
        rejectP(new Error('paths loader failed: ' + err));
      }
    });
  });

  // ── sitemap.xml ──────────────────────────────────────────────────
  // seo-kit now lives inside the webapp at src/lib/seo-kit/. We
  // load only the non-React submodules (sitemap / robots / ads)
  // through a strip-types subprocess — Node can't parse .tsx but
  // the React components aren't needed in a build script. To
  // keep module-level constants (e.g. DEFAULT_DISALLOW) in scope,
  // we do the FULL computation in the subprocess and return a
  // plain JSON of { entries, robots, adsTxt }.
  const computed = await new Promise((resolveP, rejectP) => {
    const code = `
      import { pathToFileURL } from 'node:url';
      const sitemap = await import(${JSON.stringify(
        pathToFileURL(resolve(root, 'src/lib/seo-kit/sitemap.ts')).href,
      )});
      const robots = await import(${JSON.stringify(
        pathToFileURL(resolve(root, 'src/lib/seo-kit/robots.ts')).href,
      )});
      const ads = await import(${JSON.stringify(
        pathToFileURL(resolve(root, 'src/lib/seo-kit/ads.ts')).href,
      )});
      const dynamicPaths = ${JSON.stringify(blogSitemapPaths)};
      const staticPaths = ${JSON.stringify(siteSEO.sitemap?.staticPaths ?? [])};
      const entries = sitemap.buildSitemapEntries(
        [...staticPaths, ...dynamicPaths],
        {
          defaultChangefreq: ${JSON.stringify(siteSEO.sitemap?.defaultChangefreq ?? 'weekly')},
          defaultPriority: ${JSON.stringify(siteSEO.sitemap?.defaultPriority ?? 0.5)},
        },
      );
      const robotsTxt = robots.generateRobotsTxt({
        siteUrl: ${JSON.stringify(siteSEO.siteUrl)},
        robots: ${JSON.stringify(siteSEO.robots ?? { allow: ['/'], disallow: ['/admin', '/login'] })},
      });
      const adsTxt = ads.generateAdsTxt(${JSON.stringify(adsCfg.ads ?? null)});
      process.stdout.write(JSON.stringify({ entries, robotsTxt, adsTxt }));
    `;
    const child = spawn(
      process.execPath,
      ['--experimental-strip-types', '--no-warnings', '--input-type=module', '-e', code],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('close', (code) => {
      if (code === 0) {
        try { resolveP(JSON.parse(out)); } catch (e) { rejectP(e); }
      } else rejectP(new Error('seo-kit loader failed: ' + err));
    });
  });
  const { entries, robotsTxt, adsTxt } = computed;
  const sitemapConfig = siteSEO.sitemap ?? {};

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries
  .map((e) => {
    const loc = e.loc.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const fullUrl = `${siteSEO.siteUrl.replace(/\/$/, '')}${e.loc.startsWith('/') ? '' : '/'}${loc.startsWith('/') ? loc : '/' + loc}`;
    const parts = [`    <loc>${fullUrl}</loc>`];
    if (e.lastmod) parts.push(`    <lastmod>${e.lastmod}</lastmod>`);
    if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`);
    if (e.priority !== undefined) parts.push(`    <priority>${e.priority.toFixed(1)}</priority>`);
    return `  <url>\n${parts.join('\n')}\n  </url>`;
  })
  .join('\n')}
</urlset>
`;

  await writeFile(resolve(distDir, 'sitemap.xml'), xml, 'utf-8');
  console.log(`[generate-seo-files] wrote sitemap.xml (${xml.length} bytes, ${entries.length} urls)`);

  // ── robots.txt ───────────────────────────────────────────────────
  await writeFile(resolve(distDir, 'robots.txt'), robotsTxt, 'utf-8');
  console.log(`[generate-seo-files] wrote robots.txt (${robotsTxt.length} bytes)`);

  // ── ads.txt (Google AdSense verification) ──────────────────────
  if (adsTxt) {
    await writeFile(resolve(distDir, 'ads.txt'), adsTxt, 'utf-8');
    console.log(`[generate-seo-files] wrote ads.txt (${adsTxt.length} bytes)`);
  }
}

main().catch((err) => {
  console.error('[generate-seo-files] failed:', err);
  process.exit(1);
});
