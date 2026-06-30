/**
 * Sitemap dynamic paths — kept separate from seo.config.ts so the config
 * file can be loaded by plain Node (without Vite's import.meta.glob).
 *
 * Uses Node's fs to read the vault directory directly. The vault path
 * is read from src/vault.config.ts; if the vault isn't cloned yet
 * (e.g. in a fresh checkout before `npm run vault:pull`), we return
 * an empty list rather than crashing the build.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve as pathResolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import matter from 'gray-matter';
import type { SitemapEntry } from '@/lib/seo-kit';

async function loadVaultConfig(): Promise<{ localPath: string }> {
  // Load via strip-types so we don't need a TS toolchain.
  const file = pathResolve(
    pathResolve(fileURLToPath(import.meta.url), '..'),
    'vault.config.ts',
  );
  return new Promise((resolveP, rejectP) => {
    const code = `
      const mod = await import(${JSON.stringify(pathToFileURL(file).href)});
      process.stdout.write(JSON.stringify(mod.vaultConfig));
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
    child.on('close', (code) =>
      code === 0
        ? resolveP(JSON.parse(out))
        : rejectP(new Error(`vault.config loader failed: ${err}`)),
    );
  });
}

let cached: string | null = null;
async function getVaultDir(): Promise<string> {
  if (cached) return cached;
  const cfg = await loadVaultConfig();
  cached = cfg.localPath;
  return cached;
}

async function listMdFiles(dir: string, base = ''): Promise<string[]> {
  const out: string[] = [];
  let entries;
  try {
    entries = await readdir(join(dir, base), { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) {
      out.push(...(await listMdFiles(dir, rel)));
    } else if (e.name.endsWith('.md')) {
      out.push(rel);
    }
  }
  return out;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/\.md$/i, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{Letter}\p{Number}\-\u4e00-\u9fa5/]+/gu, '')
    .replace(/^-+|-+$/g, '');
}

export async function blogSitemapPaths(): Promise<SitemapEntry[]> {
  const vaultDir = await getVaultDir();
  if (!existsSync(vaultDir)) {
    console.warn(
      `[seo-paths] vault not found at ${vaultDir} — run \`npm run vault:pull\` first. ` +
        'Returning empty sitemap for blog posts.',
    );
    return [];
  }
  const files = await listMdFiles(vaultDir);
  const entries: SitemapEntry[] = [];
  const pillarSet = new Set<string>();
  for (const rel of files) {
    const fullPath = join(vaultDir, rel);
    const raw = await readFile(fullPath, 'utf-8');
    const { data } = matter(raw);
    // Use the full path-based slug (matches the in-app derivation).
    const noExt = rel.replace(/\.md$/i, '');
    const slug = slugify(noExt);
    let lastmod: string | undefined;
    if (data.date instanceof Date && !Number.isNaN(data.date.valueOf())) {
      lastmod = data.date.toISOString().slice(0, 10);
    } else if (typeof data.date === 'string') {
      const d = new Date(data.date);
      if (!Number.isNaN(d.valueOf())) lastmod = d.toISOString().slice(0, 10);
    }
    entries.push({
      loc: `/#/blog/${slug}`,
      changefreq: 'monthly',
      priority: 0.7,
      ...(lastmod ? { lastmod } : {}),
    });
    // Track pillar slugs so we can add /topics/<pillar> entries too.
    const parts = rel.split('/');
    if (parts.length >= 2) pillarSet.add(parts[0]!);
  }
  // Add one entry per Pillar so the topic pages show up in the sitemap.
  for (const p of pillarSet) {
    entries.push({
      loc: `/#/topics/${encodeURIComponent(p)}`,
      changefreq: 'weekly',
      priority: 0.75,
    });
  }
  return entries;
}