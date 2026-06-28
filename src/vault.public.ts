/**
 * Browser-safe vault config — only the bits that need to ship with the
 * client bundle. No node: imports here, so Vite can inline it freely.
 *
 * Keep this in sync with src/vault.config.ts (the build-time version
 * that knows about localPath + repo + auth). Anything that the React
 * app needs at runtime lives here.
 */
export const vaultPublicConfig = {
  /**
   * Public URL prefix attachments get copied to. Final URL is
   * `<publicAttachmentsPath>/<filename>` (e.g. `/attachments/logo.svg`).
   * Must NOT have a leading slash in the path component.
   */
  publicAttachmentsPath: 'attachments',
};

export type VaultPublicConfig = typeof vaultPublicConfig;