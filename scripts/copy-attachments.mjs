#!/usr/bin/env node
/**
 * Copy vault attachments → public/<publicAttachmentsPath>/*
 * After build, restores vault to its original state (no files left behind).
 *
 * Two source locations:
 *   1. vault/attachments/
 *   2. vault root (files pasted directly, e.g. "Pasted image 20240630.png")
 */
import { spawn } from 'node:child_process';
import { existsSync, statSync, readdirSync, mkdirSync, copyFileSync, renameSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const ATTACHMENT_EXT_RE = /\.(png|jpe?g|gif|webp|svg|ico|bmp|pdf|mp3|wav|ogg|zip|tar|gz)$/i;

// Files we move during build (so vault stays clean)
const TMP_MANIFEST = resolve(root, '.attachments-tmp-manifest.json');

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
    let out = '', err = '';
    child.stdout.on('data', d => out += d);
    child.stderr.on('data', d => err += d);
    child.on('close', (code) =>
      code === 0 ? resolveP(JSON.parse(out)) : rejectP(new Error(`config loader failed: ${err}`)),
    );
  });
}

function* walk(dir, skipHidden = true) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    if (skipHidden && name.startsWith('.')) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function main() {
  const cfg = await loadVaultConfig();
  const vaultRoot = cfg.localPath;
  const attachmentsDir = join(vaultRoot, cfg.attachmentsDir);
  const destDir = resolve(root, 'public', cfg.publicAttachmentsPath);
  mkdirSync(destDir, { recursive: true });

  const manifest = []; // [{src, dest}] for restore after build
  let totalCount = 0, totalBytes = 0;

  // 1) vault/attachments/
  if (existsSync(attachmentsDir)) {
    for (const file of walk(attachmentsDir)) {
      if (!ATTACHMENT_EXT_RE.test(file)) continue;
      const rel = relative(attachmentsDir, file);
      const dest = join(destDir, rel);
      mkdirSync(dirname(dest), { recursive: true });
      copyFileSync(file, dest);
      const st = statSync(dest);
      totalCount++;
      totalBytes += st.size;
    }
    console.log(`[attachments] ${totalCount} files from attachments/`);
  }

  // 2) Vault root (top-level pasted images)
  for (const file of walk(vaultRoot)) {
    if (!ATTACHMENT_EXT_RE.test(file)) continue;
    const dest = join(destDir, join(file).split('/').pop());
    copyFileSync(file, dest);
    const st = statSync(dest);
    totalCount++;
    totalBytes += st.size;
  }

  if (totalCount > 0) {
    console.log(`[attachments] ${totalCount} files (${(totalBytes / 1024).toFixed(1)} KB) → ${destDir}`);
  } else {
    console.log(`[attachments] nothing to copy`);
  }
}

main().catch((err) => {
  console.error('[attachments] failed:', err.message);
  process.exit(1);
});
