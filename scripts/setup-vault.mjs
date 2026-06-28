#!/usr/bin/env node
/**
 * Vault sync script — clones or pulls the configured vault into
 * ./vault so Vite's `import.meta.glob` can pick it up at build time.
 *
 *   npm run vault:pull          # clone if missing, pull if present
 *   npm run vault:clone         # always clone (overwrites localPath)
 *   npm run vault:status        # print current state, no side effects
 *
 * Idempotent and safe to run in CI. Uses Node's built-in child_process
 * — no extra deps.
 */
import { spawn } from 'node:child_process';
import { existsSync, statSync, readdirSync, rmSync } from 'node:fs';
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
}

async function pull({ localPath, branch, repo }) {
  console.log(`[vault] pulling latest (branch=${branch}) into ${localPath}`);
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
    return;
  }

  if (mode === 'clone' || !existsSync(cfg.localPath)) {
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
