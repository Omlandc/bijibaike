/**
 * Vault configuration — single source of truth for which Obsidian
 * folder gets compiled into the site.
 *
 * The vault itself is **git-ignored**; we fetch it at build time via
 * `scripts/setup-vault.mjs` (or `npm run vault:pull`).
 *
 * Swap vault by changing `repo` + `branch` and re-running the pull.
 *
 *   private repos: prefix with the token in CI, e.g.
 *     https://x-access-token:${GITHUB_TOKEN}@github.com/...
 *   but in development, use ssh keys or `gh auth setup-git`.
 *
 * This file uses node:path so it can be loaded by build scripts.
 * For code that runs in the browser bundle, import from
 * `vault.public.ts` instead — that one has no Node-only deps.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

export const vaultConfig = {
  /**
   * Git URL of the vault repo. Can be https (with token embedded) or
   * ssh (uses your local SSH agent). Examples:
   *  - 'https://github.com/Omlandc/obsidian-test-article.git'
   *  - 'git@github.com:Omlandc/obsidian-test-article.git'
   */
  repo: 'https://github.com/Omlandc/obsidian-test-article.git',

  /** Branch to track. */
  branch: 'main',

  /**
   * Where to clone the vault locally. Default is `./vault` (project
   * root). This directory is git-ignored. Absolute paths are fine too.
   */
  localPath: path.resolve(root, 'vault'),

  /**
   * Vault subdirectory containing attachments (images, PDFs, etc.).
   * Files here are copied to `publicAttachmentsPath` at build time so
   * Vite serves them as static assets.
   */
  attachmentsDir: 'attachments',

  /**
   * Public URL prefix attachments get copied to. Final URL is
   * `<publicAttachmentsPath>/<filename>` (e.g. `/attachments/logo.svg`).
   * Must NOT have a leading slash in the path component.
   */
  publicAttachmentsPath: 'attachments',
};

export type VaultConfig = typeof vaultConfig;