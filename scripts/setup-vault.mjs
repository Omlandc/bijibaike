#!/usr/bin/env node
/**
 * Vault sync script — clones or pulls the configured vault into
 * ./vault so Vite's `import.meta.glob` can pick it up at build time.
 *
 *   npm run vault:pull          # clone if missing, pull if present
 *   npm run vault:clone         # always clone (overwrites localPath)
 *   npm run vault:status        # print current state, no side effects
 *   npm run vault:offline       # use existing ./vault as-is
 *
 * Side artifacts (written next to the vault):
 *   <projectRoot>/.vault-meta.json — per-file creation timestamps
 *     extracted from `git log --diff-filter=A`. content.ts uses this
 *     to fall back to the file's first-commit date when frontmatter
 *     `date` is missing.
 *
 * Idempotent and safe to run in CI. Uses Node's built-in child_process
 * — no extra deps.
 */
import { spawn } from 'node:child_process';
import { existsSync, statSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

async function loadVaultConfig() {
  const configFile = resolve(root, 'src/vault.config.ts');
  const code = `
    const url = ${JSON.stringify(pathToFileURL(configFile).href)};
    const mod = await import(url);
    process.stdout.write(JSON.stringify(mod.vaultConfig));
  `;
  return new Promise((resolveP, rejectP) => {
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
        : rejectP(new Error(`config loader failed: ${err}`)),
    );
  });
}

function run(cmd, args, opts = {}) {
  return new Promise((resolveP, rejectP) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
      ...opts,
    });
    child.on('close', (code) =>
      code === 0 ? resolveP() : rejectP(new Error(`${cmd} ${args.join(' ')} exited ${code}`)),
    );
  });
}

function runCapture(cmd, args, opts = {}) {
  return new Promise((resolveP, rejectP) => {
    const child = spawn(cmd, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
      ...opts,
    });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('close', (code) =>
      code === 0 ? resolveP(out) : rejectP(new Error(`${cmd} ${args.join(' ')} exited ${code}: ${err}`)),
    );
  });
}

/**
 * Rewrite the repo URL to inject an auth token if one is available
 * in the environment. Supports:
 *   - VAULT_TOKEN:  vault-specific override
 *   - GITHUB_TOKEN: GitHub Actions standard
 *   - GH_TOKEN:     shorthand
 *
 * Required for private repos. Public repos work without any token.
 * The token is never written to .git/config — the script uses
 * one-shot `git -c url.<auth>.insteadOf=...` overrides instead.
 */
function maybeAuthUrl(repo) {
  const token = process.env.VAULT_TOKEN || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) return repo;
  if (!/^https?:\/\//.test(repo)) return repo;
  try {
    const u = new URL(repo);
    u.username = 'x-access-token';
    u.password = token;
    return u.toString();
  } catch {
    return repo;
  }
}

function isGitRepo(p) {
  return existsSync(join(p, '.git'));
}

function isEmptyDir(p) {
  if (!existsSync(p)) return true;
  const stat = statSync(p);
  if (!stat.isDirectory()) return false;
  return readdirSync(p).length === 0;
}

async function clone({ repo, branch, localPath }) {
  const authRepo = maybeAuthUrl(repo);
  const display = authRepo === repo ? repo : '<authenticated>';
  console.log(`[vault] cloning ${display} (${branch}) → ${localPath}`);
  if (existsSync(localPath)) {
    rmSync(localPath, { recursive: true, force: true });
  }
  await run('git', ['clone', '--depth=1', '--branch', branch, '--single-branch', authRepo, localPath]);
  // Rewrite the remote URL to drop the token from .git/config — it
  // would otherwise be on disk in plain text.
  if (authRepo !== repo) {
    await run('git', ['-C', localPath, 'remote', 'set-url', 'origin', repo]);
  }
}

async function pull({ localPath, branch, repo }) {
  console.log(`[vault] pulling latest (branch=${branch}) into ${localPath}`);
  // Authenticate via a one-shot url override; the public URL stays in
  // .git/config so the token isn't stored on disk.
  const auth = maybeAuthUrl(repo);
  const override = auth === repo ? [] : [`-c`, `url.${auth}.insteadOf=${repo}`];
  await run('git', [
    '-C', localPath,
    ...override,
    'fetch', '--depth=1', 'origin', branch,
  ]);
  await run('git', ['-C', localPath, 'reset', '--hard', `origin/${branch}`]);
}

async function status({ localPath }) {
  if (!existsSync(localPath)) {
    console.log(`[vault] ${localPath} — NOT CLONED`);
    return;
  }
  if (!isGitRepo(localPath)) {
    console.log(`[vault] ${localPath} — exists but NOT a git repo (refusing to touch)`);
    return;
  }
  await run('git', ['-C', localPath, 'log', '--oneline', '-1']);
  await run('git', ['-C', localPath, 'status', '--short']);
}

/**
 * Extract the first commit date (creation timestamp) for every .md
 * file in the vault. Output is keyed by vault-relative path.
 *
 * Uses `git log --diff-filter=A --name-only` to find the commit that
 * introduced each file, then prints the date + the path. We can
 * fetch all creation dates in a single git invocation by using
 * `--diff-filter=A --name-only --format=%aI`.
 *
 * Note: `--diff-filter=A` only matches the first commit on the
 * current branch, so renames show up as two files (one created, one
 * deleted). For our purpose (date fallback) that's fine — the
 * deleted one just won't match any current file path.
 */
async function extractCreationTimes({ localPath, branch }) {
  if (!isGitRepo(localPath)) {
    console.warn('[vault] not a git repo, skipping creation-time extraction');
    return {};
  }
  // We need full history, not just --depth=1, because creation
  // timestamps live in earlier commits. Fetch the branch with full
  // history. Skipped if shallow + small reflog.
  const auth = maybeAuthUrl(localPath);
  void auth;
  // Best-effort: try to ensure we have enough history. If fetch
  // fails (offline), we still try to read what we have.
  try {
    await run('git', [
      '-C', localPath,
      'fetch', '--depth=1000', 'origin', branch,
    ], { stdio: ['ignore', 'pipe', 'pipe'] });
  } catch {
    // ignored — we'll work with whatever's in the local repo
  }
  const out = await runCapture('git', [
    '-C', localPath,
    '-c', 'core.quotePath=false',
    'log',
    '--format=%aI',
    '--diff-filter=A',
    '--name-only',
    '--',
  ]);
  // Output looks like:
  //   2026-06-28T16:50:48+08:00
  //   <blank>
  //   vault/path/file.md
  //   <blank>
  //   2026-06-27T...   (next commit)
  //   ...
  // We walk line by line. A line that matches an ISO date is the
  // commit's creation date; subsequent non-blank lines are the files
  // introduced by that commit. Each file path is associated with
  // the most recent date. Since `git log` walks newest-first, the
  // first time we see a path is its creation time.
  const lines = out.split('\n');
  const map = {};
  let pendingDate = null;
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (ISO_DATE.test(trimmed)) {
      pendingDate = trimmed;
    } else if (pendingDate && trimmed.endsWith('.md')) {
      if (!map[trimmed]) map[trimmed] = pendingDate;
    }
  }
  return map;
}

/**
 * Extract the LAST commit date (modification timestamp) for every
 * current .md file in the vault. Walks `git log` newest-first and
 * records the first (most recent) date seen for each path that
 * still exists in the working tree.
 */
async function extractModificationTimes({ localPath, branch }) {
  if (!isGitRepo(localPath)) return {};
  try {
    await run('git', [
      '-C', localPath,
      'fetch', '--depth=1000', 'origin', branch,
    ], { stdio: ['ignore', 'pipe', 'pipe'] });
  } catch {
    /* ignore — use what we have */
  }
  // List current files (working tree) so we only track things that
  // still exist. Renames / deletes shouldn't show up here.
  let currentFiles = [];
  try {
    const out = await runCapture('git', [
      '-C', localPath,
      '-c', 'core.quotePath=false',
      'ls-files',
      '--others', '--exclude-standard',
    ]);
    void out;
    // combine tracked + untracked-but-committed via `ls-files`
    const tracked = await runCapture('git', [
      '-C', localPath,
      '-c', 'core.quotePath=false',
      'ls-files',
    ]);
    currentFiles = tracked.split('\n').map((s) => s.trim()).filter(Boolean);
  } catch {
    return {};
  }
  const set = new Set(currentFiles);
  const out = await runCapture('git', [
    '-C', localPath,
    '-c', 'core.quotePath=false',
    'log',
    '--format=%aI',
    '--name-only',
    '--',
  ]);
  const lines = out.split('\n');
  const map = {};
  let pendingDate = null;
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (ISO_DATE.test(trimmed)) {
      pendingDate = trimmed;
    } else if (pendingDate && trimmed.endsWith('.md') && set.has(trimmed)) {
      if (!map[trimmed]) map[trimmed] = pendingDate;
    }
  }
  return map;
}

function writeMeta({ metaPath, creationTimes, modificationTimes, posts, pillars }) {
  const data = {
    generatedAt: new Date().toISOString(),
    creationTimes,
    modificationTimes,
    // Pillars: list of {slug, name, posts, clusters: []}
    pillars,
  };
  writeFileSync(metaPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`[vault] wrote ${Object.keys(creationTimes).length} creation + ${Object.keys(modificationTimes).length} modification times → ${metaPath}`);
}

/**
 * Walk the vault, collect pillar/cluster structure. Returns:
 *   pillars: [{ slug, name, dir, postCount, clusterSlugs, posts: [slug,...] }]
 *   clusters: [{ slug, name, dir, pillarSlug, postCount, posts: [slug,...] }]
 *
 * A "pillar" is a top-level directory. A "cluster" is a directory
 * directly under a pillar. Root-level .md files are excluded from
 * the topic hierarchy (they still appear in /blog).
 */
function scanTopics(vaultDir) {
  if (!existsSync(vaultDir)) return { pillars: [], clusters: [] };
  const pillars = [];
  const clusters = [];
  for (const entry of readdirSync(vaultDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue; // .git, .obsidian
    if (entry.name === 'attachments') continue;
    const pillarDir = join(vaultDir, entry.name);
    const pillarSlug = entry.name;
    let postCount = 0;
    const postSlugs = [];
    for (const sub of readdirSync(pillarDir, { withFileTypes: true })) {
      if (sub.isFile() && sub.name.endsWith('.md')) {
        postCount++;
        postSlugs.push(sub.name.replace(/\.md$/i, ''));
      } else if (sub.isDirectory() && !sub.name.startsWith('.')) {
        const clusterDir = join(pillarDir, sub.name);
        let clusterPostCount = 0;
        const clusterPostSlugs = [];
        for (const f of readdirSync(clusterDir, { withFileTypes: true })) {
          if (f.isFile() && f.name.endsWith('.md')) {
            clusterPostCount++;
            clusterPostSlugs.push(f.name.replace(/\.md$/i, ''));
          }
        }
        if (clusterPostCount > 0) {
          clusters.push({
            slug: pillarSlug + '/' + sub.name,
            name: sub.name,
            pillarSlug,
            postCount: clusterPostCount,
            posts: clusterPostSlugs,
          });
        }
        postCount += clusterPostCount;
        postSlugs.push(...clusterPostSlugs.map(s => sub.name + '/' + s));
      }
    }
    if (postCount > 0) {
      pillars.push({
        slug: pillarSlug,
        name: entry.name,
        dir: pillarDir,
        postCount,
        posts: postSlugs,
      });
    }
  }
  return { pillars, clusters };
}

async function main() {
  const cfg = await loadVaultConfig();
  const mode = process.argv[2] || 'pull';

  if (mode === 'status') {
    await status(cfg);
    return;
  }

  if (mode === 'offline') {
    if (existsSync(cfg.localPath)) {
      console.log(`[vault] offline: using existing ${cfg.localPath}`);
    } else {
      console.error(`[vault] offline mode: ${cfg.localPath} does not exist`);
      process.exit(1);
    }
  } else if (mode === 'clone' || !existsSync(cfg.localPath)) {
    if (!isEmptyDir(cfg.localPath) && !isGitRepo(cfg.localPath)) {
      console.error(
        `[vault] ${cfg.localPath} exists but is not empty and not a git repo.\n` +
          `        Move it away or delete it, then re-run.`,
      );
      process.exit(1);
    }
    await clone(cfg);
  } else if (isGitRepo(cfg.localPath)) {
    if (mode === 'pull') {
      await pull(cfg);
    } else {
      console.error(`[vault] unknown mode: ${mode}`);
      process.exit(2);
    }
  } else {
    console.error(`[vault] ${cfg.localPath} is in an unexpected state.`);
    process.exit(1);
  }

  // Extract creation + modification times + topic structure from the vault.
  const creationTimes = await extractCreationTimes(cfg);
  const modificationTimes = await extractModificationTimes(cfg);
  const { pillars, clusters } = scanTopics(cfg.localPath);
  console.log(`[vault] topics: ${pillars.length} pillars, ${clusters.length} clusters`);

  const metaPath = resolve(root, '.vault-meta.json');
  writeMeta({ metaPath, creationTimes, modificationTimes, pillars, clusters });

  // Post-fetch: report what we ended up with.
  const files = existsSync(cfg.localPath)
    ? readdirSync(cfg.localPath, { recursive: true }).filter((f) => !String(f).includes('.git'))
    : [];
  console.log(`[vault] ready: ${files.length} files at ${cfg.localPath}`);
}

main().catch((err) => {
  console.error('[vault] failed:', err.message);
  process.exit(1);
});
