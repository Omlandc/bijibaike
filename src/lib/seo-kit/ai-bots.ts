/**
 * Curated list of AI training crawlers.
 *
 * Reference: https://github.com/ai-robots-txt/ai.robots.txt
 *
 * These are the bots that scrape the open web to train / ground LLMs:
 *  - GPTBot, ChatGPT-User       → OpenAI (training + browsing)
 *  - ClaudeBot, Claude-Web, anthropic-ai → Anthropic
 *  - PerplexityBot              → Perplexity (training + answer citations)
 *  - Google-Extended            → Google Gemini training
 *  - CCBot                      → Common Crawl (feeds many models)
 *  - Applebot-Extended          → Apple Intelligence training
 *  - Bytespider                 → ByteDance / TikTok
 *  - Meta-ExternalAgent         → Meta AI training
 *  - Diffbot                    → Knowledge graph used by many
 *  - DeepSeekBot, DeepSeek-User  → DeepSeek
 *
 * Notable non-training bots (search engine crawlers) — NOT blocked in any
 * preset because they bring traffic:
 *  - Googlebot, Bingbot, DuckDuckBot, Slurp, Baiduspider, YandexBot
 */
export interface AiBot {
  userAgent: string;
  owner: string;
  purpose: string;
  docsUrl?: string;
}

export const AI_BOTS: AiBot[] = [
  { userAgent: 'GPTBot', owner: 'OpenAI', purpose: 'training', docsUrl: 'https://platform.openai.com/docs/gptbot' },
  { userAgent: 'ChatGPT-User', owner: 'OpenAI', purpose: 'browsing (ChatGPT browse mode)' },
  { userAgent: 'OAI-SearchBot', owner: 'OpenAI', purpose: 'search results' },
  { userAgent: 'ClaudeBot', owner: 'Anthropic', purpose: 'training' },
  { userAgent: 'Claude-Web', owner: 'Anthropic', purpose: 'on-demand fetch (Claude.ai)' },
  { userAgent: 'anthropic-ai', owner: 'Anthropic', purpose: 'training' },
  { userAgent: 'Claude-SearchBot', owner: 'Anthropic', purpose: 'search results' },
  { userAgent: 'PerplexityBot', owner: 'Perplexity', purpose: 'training + answer citations' },
  { userAgent: 'Perplexity-User', owner: 'Perplexity', purpose: 'on-demand fetch' },
  { userAgent: 'Google-Extended', owner: 'Google', purpose: 'Gemini / Vertex AI training' },
  { userAgent: 'CCBot', owner: 'Common Crawl', purpose: 'training corpus for many LLMs' },
  { userAgent: 'Applebot-Extended', owner: 'Apple', purpose: 'Apple Intelligence training' },
  { userAgent: 'Bytespider', owner: 'ByteDance', purpose: 'training' },
  { userAgent: 'Meta-ExternalAgent', owner: 'Meta', purpose: 'Llama training' },
  { userAgent: 'Meta-ExternalFetcher', owner: 'Meta', purpose: 'on-demand fetch' },
  { userAgent: 'DeepSeekBot', owner: 'DeepSeek', purpose: 'training' },
  { userAgent: 'Diffbot', owner: 'Diffbot', purpose: 'knowledge graph for LLMs' },
  { userAgent: 'DuckAssistBot', owner: 'DuckDuckGo', purpose: 'DuckAssist answer generation' },
  { userAgent: 'cohere-ai', owner: 'Cohere', purpose: 'training' },
  { userAgent: 'cohere-training-data-crawler', owner: 'Cohere', purpose: 'training' },
  { userAgent: 'YouBot', owner: 'You.com', purpose: 'training' },
  { userAgent: 'ImgBot', owner: 'ImgBot', purpose: 'image training' },
  { userAgent: 'Kangaroo Bot', owner: 'Kangaroo LLM', purpose: 'training' },
  { userAgent: 'Webzio', owner: 'Webzio', purpose: 'article extraction for AI' },
  { userAgent: 'Amazonbot', owner: 'Amazon', purpose: 'training + Alexa' },
  { userAgent: 'SemrushBot-OCOB', owner: 'Semrush', purpose: 'content optimization for AI' },
  { userAgent: 'SemrushBot-SI', owner: 'Semrush', purpose: 'content optimization for AI' },
  { userAgent: 'TurnitinBot', owner: 'Turnitin', purpose: 'plagiarism / AI detection' },
];

/**
 * Set of user-agent strings for fast lookup.
 */
export const AI_BOT_USER_AGENTS: ReadonlySet<string> = new Set(AI_BOTS.map((b) => b.userAgent));