/**
 * robots.txt generator with AI-crawler policy.
 *
 * Usage:
 *   import { generateRobotsTxt } from 'seo-kit/robots';
 *
 *   const txt = generateRobotsTxt({
 *     siteUrl: 'https://example.com',
 *     aiPolicy: 'strict',
 *     disallowPaths: ['/admin'],
 *   });
 *
 * Three presets for `aiPolicy`:
 *  - "strict": disallow all known AI training crawlers
 *  - "open":   allow them (helps with AI search citation)
 *  - "custom": use the `customBots` array
 */
import { AI_BOTS } from './ai-bots.ts';
import type { BotRule, SiteSEO } from './config.ts';

export interface RobotsOptions {
  siteUrl: string;
  /** "strict" | "open" | "custom" */
  aiPolicy?: SiteSEO['aiPolicy'];
  /** Paths disallowed for all bots. */
  disallowPaths?: string[];
  /** Custom bot rules, only when aiPolicy === "custom". */
  customBots?: BotRule[];
  /** Extra user-agents to allow or disallow beyond the AI list. */
  extraRules?: BotRule[];
  /** Sitemap URL to advertise. Defaults to `${siteUrl}/sitemap.xml`. */
  sitemapUrl?: string;
}

const DEFAULT_DISALLOW = ['/admin', '/login', '/api/'];

export function generateRobotsTxt(options: RobotsOptions): string {
  const {
    siteUrl,
    aiPolicy = 'strict',
    disallowPaths = DEFAULT_DISALLOW,
    customBots,
    extraRules = [],
    sitemapUrl,
  } = options;

  const baseSitemap = sitemapUrl ?? `${siteUrl.replace(/\/$/, '')}/sitemap.xml`;
  const disallowBlocks = disallowPaths.map((p) => `Disallow: ${p}`).join('\n');

  // ─── Section 1: General rules (all bots) ────────────────────────────
  const general =
    `# All well-behaved crawlers\n` +
    `User-agent: *\n` +
    `${disallowBlocks}\n` +
    `Allow: /\n` +
    `\n`;

  // ─── Section 2: AI bots ─────────────────────────────────────────────
  let aiSection = '';
  if (aiPolicy === 'custom') {
    if (customBots && customBots.length > 0) {
      aiSection =
        `# Custom bot rules\n` +
        customBots.map(formatBotRule).join('\n') +
        `\n\n`;
    }
  } else if (aiPolicy === 'strict') {
    aiSection =
      `# AI training crawlers — blocked\n` +
      `# Add new ones via https://github.com/ai-robots-txt/ai.robots.txt\n` +
      AI_BOTS.map(
        (bot) =>
          `User-agent: ${bot.userAgent}\n` +
          `Disallow: /\n` +
          (bot.docsUrl ? `# docs: ${bot.docsUrl}\n` : ''),
      ).join('\n') +
      `\n`;
  } else if (aiPolicy === 'open') {
    aiSection =
      `# AI training crawlers — explicitly allowed\n` +
      `# Helps with citation in ChatGPT / Perplexity / Claude etc.\n` +
      AI_BOTS.map(
        (bot) =>
          `User-agent: ${bot.userAgent}\n` +
          `Allow: /\n` +
          (bot.docsUrl ? `# owner: ${bot.owner}\n` : ''),
      ).join('\n') +
      `\n`;
  }

  // ─── Section 3: Extra rules (from user) ─────────────────────────────
  let extraSection = '';
  if (extraRules.length > 0) {
    extraSection = `# Additional rules\n` + extraRules.map(formatBotRule).join('\n') + `\n\n`;
  }

  return `${general}${aiSection}${extraSection}Sitemap: ${baseSitemap}\n`;
}

function formatBotRule(rule: BotRule): string {
  const parts: string[] = [];
  if (rule.comment) parts.push(`# ${rule.comment}`);
  parts.push(`User-agent: ${rule.userAgent}`);
  if (rule.action === 'allow') {
    parts.push('Allow: /');
    if (rule.paths) rule.paths.forEach((p) => parts.push(`Allow: ${p}`));
  } else {
    parts.push('Disallow: /');
    if (rule.paths) rule.paths.forEach((p) => parts.push(`Disallow: ${p}`));
  }
  return parts.join('\n');
}

/** Convenience: read the AI policy from a SiteSEO config. */
export function robotsTxtFromSite(
  site: SiteSEO,
  overrides: Pick<RobotsOptions, 'disallowPaths' | 'extraRules' | 'sitemapUrl'> = {},
): string {
  return generateRobotsTxt({
    siteUrl: site.siteUrl,
    aiPolicy: site.aiPolicy,
    customBots: site.customBots,
    ...overrides,
  });
}