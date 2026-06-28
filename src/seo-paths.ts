/**
 * Sitemap dynamic paths — kept separate from seo.config.ts so the config
 * file can be loaded by plain Node (without Vite's import.meta.glob).
 *
 * Uses Node's fs to read the content/ directory directly.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import type { SitemapEntry } from 'seo-kit';

const CONTENT_DIR = join(process.cwd(), 'content');

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
  const files = await listMdFiles(CONTENT_DIR);
  const entries: SitemapEntry[] = [];
  for (const rel of files) {
    const fullPath = join(CONTENT_DIR, rel);
    const raw = await readFile(fullPath, 'utf-8');
    const { data } = matter(raw);
    const slug = slugify(rel.split('/').pop() ?? rel);
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
  }
  return entries;
}