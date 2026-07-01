import { Link, NavLink, Outlet, useLocation } from 'react-router';
import {
  Home,
  BookOpen,
  Tags,
  Network,
  FileText,
  Search,
  X,
  Layers,
  FolderTree,
  Tag as TagIcon,
  History,
  Scale,
  type LucideIcon,
} from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileMenu } from './MobileMenu';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useEffect, useMemo, useState } from 'react';
import { getAllPosts, getAllTags, getPostsByTag, getPostsByPillar } from '@/lib/content';
import { cn, resolveLocalized } from '@/lib/utils';
import { SEOHead, pageSEO, AdsHead } from '@/lib/seo-kit';
import { siteSEO, SITE_FOOTER_COPYRIGHT, SITE_FOOTER_LINKS, SITE_SOCIAL } from '@/seo.config';
import { siteAds } from '@/ads.config';
import { CookieConsent, useConsent } from './CookieConsent';
import { useTranslation, type TranslationKey } from '@/i18n';
import { siteConfig } from '@/config/site-config';

const ICONS: Record<string, LucideIcon> = {
  Home,
  BookOpen,
  Tags,
  Tag: TagIcon,
  Network,
  FileText,
  Layers,
  FolderTree,
  History,
  Scale,
};

/**
 * Map nav icon-string → i18n key. The siteConfig.nav.label is the
 * fallback Chinese label so the build still works if a key is missing.
 */
const NAV_LABEL_KEYS: Record<string, TranslationKey> = {
  '/': 'nav.home',
  '/blog': 'nav.posts',
  '/topics': 'nav.topics',
  '/tags': 'nav.tags',
  '/graph': 'nav.graph',
  '/resources': 'nav.resources',
  '/changelog': 'nav.changelog',
  '/pricing': 'nav.pricing',
};

// Build the nav array from siteConfig.nav, resolving each icon string
// against the ICONS map. Defaults to FileText when icon is unknown.
// The `configLabel` is the raw `label` from _config.md (string or
// per-language object) — it takes priority over the i18n key so
// users can override the visible menu text without touching the
// source.
const NAV = siteConfig.nav.map((n) => {
  // `fallbackLabel` was historically the i18n fallback when the
  // config didn't set a label. We keep it as a single string for
  // accessibility (the <a title="…"> attribute), computed as the
  // first available value of the per-language object if any.
  const cfg = n.label;
  const fallbackLabel =
    typeof cfg === 'string'
      ? cfg
      : cfg
        ? (Object.values(cfg).find((v) => typeof v === 'string' && v) ?? '')
        : '';
  return {
    to: n.to,
    labelKey: NAV_LABEL_KEYS[n.to],
    fallbackLabel,
    configLabel: n.label,
    icon: ICONS[n.icon] ?? FileText,
    end: n.to === '/',
  };
});

/**
 * Per-route SEO meta. Reads the current location and produces the right
 * page config — title, description, ogType, JSON-LD, etc.
 *
 * Lives in SiteLayout (the shared route shell) so it re-runs on every
 * navigation and there's no duplicate SEOHead in the tree.
 */
function RouteSeo() {
  const { pathname } = useLocation();
  const posts = useMemo(() => getAllPosts(), []);
  const { t } = useTranslation();

  // Resolve the current page's SEO from the pathname.
  // Pattern matches the HashRouter routes in App.tsx.
  // useLocation().pathname returns the raw path with % escapes for
  // non-ASCII characters; we decode each segment so it matches the
  // decoded post.slug we build in content.ts.
  const segs = pathname.split('/').filter(Boolean).map(decodeURIComponent);
  // Slug can span multiple segments (e.g. "中医/黄帝内经素问遗篇-1")
  // because the post slug encodes the full vault-relative path.
  const slug = segs[0] === 'blog' ? segs.slice(1).join('/') : null;
  const post = slug ? posts.find((p) => p.slug === slug) : null;

  if (post) {
    return (
      <SEOHead
        config={siteSEO}
        path={pathname}
        page={pageSEO({
          title: post.title,
          description: post.frontmatter.description
            ? String(post.frontmatter.description)
            : post.excerpt,
          ogType: 'article',
          publishedTime: post.date,
          author: post.frontmatter.author
            ? String(post.frontmatter.author)
            : undefined,
          // Post tags become `<meta name="keywords">` (seo-kit's merge
          // appends page keywords to site.keywords, dedupes, and emits
          // the meta tag). They also flow into the JSON-LD Article.keywords
          // below. Capped at 10 to keep the meta tag within sensible length.
          keywords: post.tags.slice(0, 10),
          tags: post.tags,
          // Pillar = top-level vault dir. Read from sourcePath (the original
          // vault-relative filename) because slugify strips "/" from slugs.
          section: (() => {
            const parts = post.sourcePath.replace(/\.md$/i, '').split('/');
            return parts.length > 1 ? parts[0]! : post.tags[0];
          })(),
          jsonLd: [
            {
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: post.title,
              url: `${siteSEO.siteUrl}/#/blog/${post.slug}`,
              datePublished: post.date,
              author: post.frontmatter.author
                ? String(post.frontmatter.author)
                : siteSEO.author,
              description: post.frontmatter.description
                ? String(post.frontmatter.description)
                : post.excerpt,
              keywords: post.tags.join(', '),
              articleSection: (() => {
                const parts = post.sourcePath.replace(/\.md$/i, '').split('/');
                return parts.length > 1 ? parts[0]! : undefined;
              })(),
            },
          ],
        })}
      />
    );
  }

  // Pillar detail page: /topics/:slug (no further segment)
  if (segs[0] === 'topics' && segs.length === 2) {
    const pillarName = segs[1]!;
    // Pillar page's keywords = pillar name + most common tags in pillar
    const pillarPosts = getPostsByPillar(pillarName);
    const tagCounts = new Map<string, number>();
    pillarPosts.forEach((p) => p.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)));
    const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map((e) => e[0]);
    return (
      <SEOHead
        config={siteSEO}
        path={pathname}
        page={pageSEO({
          title: pillarName,
          description: t('topics.postsInCluster', { cluster: pillarName }) + ` (${pillarPosts.length})`,
          keywords: [pillarName, ...topTags],
        })}
      />
    );
  }
  // Cluster detail page: /topics/:pillar/:cluster
  if (segs[0] === 'topics' && segs.length >= 3) {
    const pillarName = segs[1]!;
    const clusterName = segs.slice(2).join('/');
    return (
      <SEOHead
        config={siteSEO}
        path={pathname}
        page={pageSEO({
          title: `${clusterName} · ${pillarName}`,
          description: t('topics.postsInCluster', { cluster: clusterName }),
          keywords: [clusterName, pillarName],
        })}
      />
    );
  }
  // Tag detail page: /tags/:tag
  if (segs[0] === 'tags' && segs.length === 2) {
    const tag = decodeURIComponent(segs[1]!);
    const tagPosts = getPostsByTag(tag);
    // Co-occurring tags are useful SEO keywords for tag landing pages
    const coTags = new Map<string, number>();
    tagPosts.forEach((p) => p.tags.filter((tt) => tt !== tag).forEach((tt) => coTags.set(tt, (coTags.get(tt) ?? 0) + 1)));
    const topCo = [...coTags.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map((e) => e[0]);
    return (
      <SEOHead
        config={siteSEO}
        path={pathname}
        page={pageSEO({
          title: tag,
          description: t('tags.postsWith', { tag, count: tagPosts.length }),
          keywords: [tag, ...topCo],
        })}
      />
    );
  }

  // Per-route static meta
  const staticMeta: Record<string, { title: string; description: string }> = {
    '/': {
      // Read from vault _config.md (siteConfig) instead of hardcoded i18n
      title: siteConfig.site.tagline || siteConfig.site.name || '笔记百科',
      description: siteConfig.site.description || '',
    },
    '/blog': {
      title: t('blog.title'),
      description: t('blog.subtitle'),
    },
    '/topics': {
      title: t('topics.title'),
      description: t('topics.subtitle', { concepts: '' }),
    },
    '/tags': {
      title: t('tags.title'),
      description: t('tags.subtitle'),
    },
    '/graph': {
      title: t('graph.title'),
      description: t('graph.subtitle'),
    },
    '/resources': {
      title: t('resources.title'),
      description: t('resources.subtitle'),
    },
    '/about': {
      title: t('about.title'),
      description: '',
    },
    '/privacy': {
      title: t('privacy.title'),
      description: '',
    },
    '/contact': {
      title: t('contact.title'),
      description: '',
    },
  };
  // pathname is URL-encoded by HashRouter — decode once so it matches the
  // unescaped keys we declared in staticMeta (e.g. '/topics/中医').
  const decodedPath = (() => {
    try { return decodeURI(pathname); } catch { return pathname; }
  })();
  const routeMeta = staticMeta[decodedPath] ?? { title: '', description: '' };
  return (
    <SEOHead
      config={siteSEO}
      path={pathname}
      page={pageSEO({
        title: routeMeta.title,
        description: routeMeta.description,
        ogType: 'website',
      })}
    />
  );
}

export function SiteLayout() {
  const stats = useMemo(
    () => ({
      posts: getAllPosts().length,
      tags: getAllTags().length,
    }),
    [],
  );
  const useLoc = useLocation();
  // pathname is intentionally unused at this level — the per-route SEO
  // lives in <RouteSeo /> below.
  void useLoc.pathname;
  const [searchOpen, setSearchOpen] = useState(false);
  const consent = useConsent();
  const { t, lang } = useTranslation();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/" className="flex items-center gap-2 text-fg">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <FileText className="size-3.5" />
            </span>
            <span className="hidden font-semibold tracking-tight sm:inline">
              {siteConfig.site.shortName}
            </span>
          </Link>
          {/* Desktop nav: hidden on mobile (the hamburger menu takes over) */}
          <nav className="hidden items-center gap-0.5 lg:flex lg:gap-1">
            {NAV.map((n) => {
              const Icon = n.icon;
              // Resolution chain:
              //   1. Per-language label from _config.md  (string object)
              //   2. Plain string from _config.md         (single label, every language)
              //   3. i18n key match on the route          (built-in nav.*)
              //   4. Empty string (the route renders but has no text)
              const configLabel = resolveLocalized(n.configLabel, lang);
              const label =
                configLabel ||
                (n.labelKey ? t(n.labelKey) : n.fallbackLabel);
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors sm:gap-1.5 sm:px-2.5',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-fg-muted hover:bg-bg-subtle hover:text-fg',
                    )
                  }
                  title={label}
                >
                  <Icon className="size-4 sm:size-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </NavLink>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="hidden items-center gap-2 rounded-md border border-border bg-bg-elevated px-2.5 py-1.5 text-xs text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg md:inline-flex"
            >
              <Search className="size-3.5" />
              <span>{t('site.search')}</span>
              <kbd className="rounded border border-border bg-bg px-1 text-[10px] text-fg-subtle">
                ⌘K
              </kbd>
            </button>
            <span className="hidden text-xs text-fg-muted lg:inline">
              {t('site.postsAndTags', { posts: stats.posts, tags: stats.tags })}
            </span>
            <LanguageSwitcher />
            <ThemeSwitcher />
            <MobileMenu />
          </div>
        </div>
        {searchOpen ? (
          <div className="border-t border-border bg-bg px-4 py-3">
            <SearchBar onClose={() => setSearchOpen(false)} />
          </div>
        ) : null}
      </header>

        <RouteSeo />
      <AdsHead config={siteAds} consented={consent === 'all'} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-12">
        <Outlet />
      </main>

      <footer className="mt-12 border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-fg-muted sm:flex-row">
          <span>
            {(() => {
              const cr = resolveLocalized(SITE_FOOTER_COPYRIGHT, lang);
              return cr || <>© {new Date().getFullYear()} · 静态部署</>;
            })()}
          </span>
          <nav className="flex flex-wrap items-center gap-3">
            {SITE_FOOTER_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-fg">
                {resolveLocalized(l.label, lang)}
              </Link>
            ))}
            {SITE_SOCIAL.github ? (
              <a
                href={SITE_SOCIAL.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-fg"
              >
                GitHub
              </a>
            ) : null}
          </nav>
        </div>
        <Separator className="opacity-0" />
      </footer>
      <CookieConsent value={consent} onChange={() => { /* re-render via useConsent */ }} />
    </div>
  );
}

function SearchBar({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const { t } = useTranslation();
  const posts = getAllPosts();
  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return posts.slice(0, 6).map((p) => ({ post: p, snippet: p.excerpt, query: '' }));
    // Match against title / excerpt / tags / BODY. We lowercase once
    // here and reuse `bodyLC` for snippet extraction, so a 500KB post
    // doesn't pay the toLowerCase cost for every match.
    return posts
      .map((p) => {
        const titleHit = p.title.toLowerCase().includes(query);
        const excerptHit = p.excerpt.toLowerCase().includes(query);
        const tagHit = p.tags.some((t) => t.toLowerCase().includes(query));
        const bodyLC = p.body.toLowerCase();
        const bodyIdx = bodyLC.indexOf(query);
        if (!titleHit && !excerptHit && !tagHit && bodyIdx < 0) return null;
        // Prefer body snippet when the match is there; otherwise fall
        // back to the excerpt (which is already a clean preview).
        let snippet: string;
        if (bodyIdx >= 0) {
          const start = Math.max(0, bodyIdx - 30);
          const end = Math.min(p.body.length, bodyIdx + query.length + 50);
          const head = start > 0 ? '…' : '';
          const tail = end < p.body.length ? '…' : '';
          snippet =
            head + p.body.slice(start, end).replace(/\s+/g, ' ').trim() + tail;
        } else {
          snippet = p.excerpt;
        }
        return { post: p, snippet, query };
      })
      .filter((x): x is { post: typeof posts[number]; snippet: string; query: string } => x !== null)
      .slice(0, 12);
  }, [q, posts]);
  return (
    <div className="mx-auto max-w-6xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
        <Input
          autoFocus
          placeholder={t('site.searchPlaceholder')}
          className="pl-9 pr-9"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose();
          }}
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-fg-muted hover:bg-bg-subtle"
          aria-label={t('site.search')}
        >
          <X className="size-3.5" />
        </button>
      </div>
      {results.length > 0 ? (
        <ul className="mt-2 max-h-80 divide-y divide-border overflow-y-auto rounded-md border border-border bg-bg-elevated">
          {results.map((r) => {
            const p = r.post;
            const snippet = r.snippet;
            const qQuery = r.query;
            const link = qQuery
              ? `/blog/${encodeURIComponent(p.slug)}?q=${encodeURIComponent(qQuery)}`
              : `/blog/${encodeURIComponent(p.slug)}`;
            // Highlight the match in the title and snippet so the
            // preview reads as "this is where the hit is".
            const renderHL = (s: string) => {
              if (!qQuery) return s;
              const re = new RegExp(
                qQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                'gi',
              );
              const out: React.ReactNode[] = [];
              let last = 0;
              let m: RegExpExecArray | null;
              let i = 0;
              while ((m = re.exec(s)) !== null) {
                if (m.index > last) out.push(s.slice(last, m.index));
                out.push(
                  <mark
                    key={i++}
                    className="rounded-sm bg-primary/25 px-0.5 text-fg"
                  >
                    {m[0]}
                  </mark>,
                );
                last = m.index + m[0].length;
                if (m[0].length === 0) re.lastIndex++;
              }
              if (last < s.length) out.push(s.slice(last));
              return out;
            };
            return (
              <li key={p.slug}>
                <Link
                  to={link}
                  onClick={onClose}
                  className="flex items-center justify-between gap-4 px-3 py-2 transition-colors hover:bg-bg-subtle"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-fg">
                      {renderHL(p.title)}
                    </div>
                    {snippet ? (
                      <div className="line-clamp-2 text-xs text-fg-muted">
                        {renderHL(snippet)}
                      </div>
                    ) : null}
                  </div>
                  {p.tags.length > 0 ? (
                    <span className="shrink-0 text-xs text-fg-subtle">
                      #{p.tags[0]}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
