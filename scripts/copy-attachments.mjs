#!/usr/bin/env node
/**
 * Copy vault/attachments/* → public/<publicAttachmentsPath>/* so
 * Vite's static handler serves them. Run by the prebuild hook.
 *
 * If the vault isn't cloned yet, this is a no-op (the pull step is
 * the prerequisite).
 */
import { spawn } from 'node:child_process';
import { existsSync, statSync, readdirSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
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

function* walk(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function main() {
  const cfg = await loadVaultConfig();
  const srcDir = join(cfg.localPath, cfg.attachmentsDir);
  const destDir = resolve(root, 'public', cfg.publicAttachmentsPath);

  if (!existsSync(srcDir)) {
    console.log(`[attachments] no vault/attachments dir at ${srcDir} — skipping`);
    return;
  }

  mkdirSync(destDir, { recursive: true });
  let count = 0;
  let totalBytes = 0;
  for (const file of walk(srcDir)) {
    const rel = relative(srcDir, file);
    const target = join(destDir, rel);
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(file, target);
    const st = statSync(target);
    count++;
    totalBytes += st.size;
  }
  console.log(
    `[attachments] copied ${count} files (${(totalBytes / 1024).toFixed(1)} KB) → ${destDir}`,
  );
}

main().catch((err) => {
  console.error('[attachments] failed:', err.message);
  process.exit(1);
});
