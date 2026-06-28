/**
 * Browser-safe vault config — only the bits that need to ship with the
 * client bundle. Derived from `siteConfig.vault`. No node: imports
 * here, so Vite can inline it freely.
 *
 * Keep this in sync with src/vault.config.ts (the build-time version
 * that knows about localPath + repo + auth).
 */
import { siteConfig } from '@/config/site-config';

export const vaultPublicConfig = {
  publicAttachmentsPath: siteConfig.vault.publicAttachmentsPath.replace(/^\/+/, ''),
};

export type VaultPublicConfig = typeof vaultPublicConfig;
