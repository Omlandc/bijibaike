#!/usr/bin/env node
/**
 * Prebuild script: load src/seo.config.ts and emit dist/sitemap.xml +
 * dist/robots.txt using seo-kit generators.
 *
 * Uses Node 22's --experimental-strip-types flag so we don't need
 * tsx/ts-node as a dev dependency.
 *
 * Wired into package.json's `build` script:
 *   "build": "node scripts/generate-seo-files.mjs && tsc -b && vite build"
 */
import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const configPath = resolve(root, 'src/seo.config.ts');
const distDir = resolve(root, 'public');
const cachePath = resolve(distDir, '.seo-config-cache.json');

async function loadConfig() {
  
  const configUrl = pathToFileURL(configPath).href;
  const code = `
    import { pathToFileURL } from 'node:url';
    import { writeFileSync } from 'node:fs';
    const url = ${JSON.stringify(configUrl)};
    const cachePath = ${JSON.stringify(cachePath)};
    const mod = await import(url);
    if (!mod.siteSEO) {
      console.error('src/seo.config.ts does not export siteSEO');
      process.exit(1);
    }
    writeFileSync(cachePath, JSON.stringify(mod.siteSEO));
  `;
  await new Promise((resolveP, rejectP) => {
    const child = spawn(
      process.execPath,
      ['--experimental-strip-types', '--no-warnings', '--input-type=module', '-e', code],
      { stdio: 'inherit' },
    );
    child.on('close', (code) =>
      code === 0 ? resolveP() : rejectP(new Error(`config loader exited with ${code}`)),
    );
  });
  return JSON.parse(await readFile(cachePath, 'utf-8'));
}

async function main() {
  const siteSEO = await loadConfig();

  const { resolveSitemap, buildSitemapEntries } = await import('seo-kit/sitemap');
  const { generateRobotsTxt } = await import('seo-kit/robots');
  // Use a subprocess with strip-types to load the .ts paths file.
  const { spawn } = await import('node:child_process');
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
  // Combine staticPaths (from config) + dynamic blog posts (from fs).
  const dynamicEntries = blogSitemapPaths;
  const sitemapConfig = siteSEO.sitemap ?? {};
  const staticEntries = sitemapConfig.staticPaths ?? [];
  const entries = buildSitemapEntries(
    [...staticEntries, ...dynamicEntries],
    {
      defaultChangefreq: sitemapConfig.defaultChangefreq ?? 'weekly',
      defaultPriority: sitemapConfig.defaultPriority ?? 0.5,
    },
  );

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
  const robots = generateRobotsTxt({
    siteUrl: siteSEO.siteUrl,
    aiPolicy: siteSEO.aiPolicy,
    customBots: siteSEO.customBots,
    disallowPaths: ['/admin', '/login'],
  });
  await writeFile(resolve(distDir, 'robots.txt'), robots, 'utf-8');
  console.log(`[generate-seo-files] wrote robots.txt (${robots.length} bytes)`);

  // ── Cleanup temp cache ───────────────────────────────────────────
  await rm(cachePath, { force: true });
}

main().catch((err) => {
  console.error('[generate-seo-files] failed:', err);
  process.exit(1);
});