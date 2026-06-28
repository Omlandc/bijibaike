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
  type LucideIcon,
} from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useEffect, useMemo, useState } from 'react';
import { getAllPosts, getAllTags } from '@/lib/content';
import { cn } from '@/lib/utils';
import { SEOHead, pageSEO, AdsHead } from 'seo-kit';
import { siteSEO, SITE_FOOTER_COPYRIGHT, SITE_FOOTER_LINKS, SITE_SOCIAL } from '@/seo.config';
import { siteAds } from '@/ads.config';
import { CookieConsent, useConsent } from './CookieConsent';
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
};

// Build the nav array from siteConfig.nav, resolving each icon string
// against the ICONS map. Defaults to FileText when icon is unknown.
const NAV = siteConfig.nav.map((n) => ({
  to: n.to,
  label: n.label,
  icon: ICONS[n.icon] ?? FileText,
  end: n.to === '/',
}));

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
          tags: post.tags,
          section: post.tags[0],
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
            },
          ],
        })}
      />
    );
  }

  // Pillar detail page: /topics/:slug (no further segment)
  if (segs[0] === 'topics' && segs.length === 2) {
    const pillarName = segs[1]!;
    return (
      <SEOHead
        config={siteSEO}
        path={pathname}
        page={pageSEO({
          title: pillarName,
          description: `${pillarName} 主题下的所有文章与子主题`,
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
          description: `${pillarName} 主题下的子主题 ${clusterName}`,
        })}
      />
    );
  }

  // Per-route static meta
  const staticMeta: Record<string, { title: string; description: string }> = {
    '/': {
      title: siteConfig.site.tagline || siteConfig.site.shortName,
      description: siteSEO.description ?? '',
    },
    '/blog': {
      title: '所有文章',
      description: '浏览所有 Obsidian 风格的博客文章',
    },
    '/topics': {
      title: '主题簇',
      description: '按 Obsidian 文件夹结构组织的主题门户:每个顶层目录是 Pillar,往下细分 Cluster',
    },
    '/tags': {
      title: '标签',
      description: '按标签浏览所有文章',
    },
    '/graph': {
      title: '关系图',
      description: '文章之间的 wiki-link 关系可视化',
    },
    '/resources': {
      title: '资源',
      description: `${siteConfig.site.shortName} 推荐的工具、参考与外部链接`,
    },
    '/about': {
      title: '关于本站',
      description: '本站的技术栈、理念与开源地址',
    },
    '/privacy': {
      title: '隐私政策',
      description: '本站如何处理 Cookie、广告与个人数据',
    },
    '/contact': {
      title: '联系我们',
      description: '反馈 bug、提建议、申请数据删除',
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
              Obsidian Blog
            </span>
          </Link>
          <nav className="flex items-center gap-0.5 sm:gap-1">
            {NAV.map((n) => {
              const Icon = n.icon;
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
                  title={n.label}
                >
                  <Icon className="size-4 sm:size-3.5" />
                  <span className="hidden sm:inline">{n.label}</span>
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
              <span>搜索</span>
              <kbd className="rounded border border-border bg-bg px-1 text-[10px] text-fg-subtle">
                ⌘K
              </kbd>
            </button>
            <span className="hidden text-xs text-fg-muted lg:inline">
              {stats.posts} 篇 · {stats.tags} 标签
            </span>
            <ThemeSwitcher />
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
            {SITE_FOOTER_COPYRIGHT || (
              <>© {new Date().getFullYear()} · 静态部署</>
            )}
          </span>
          <nav className="flex flex-wrap items-center gap-3">
            {SITE_FOOTER_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-fg">
                {l.label}
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
  const posts = getAllPosts();
  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return posts.slice(0, 6);
    return posts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.excerpt.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query)),
      )
      .slice(0, 8);
  }, [q, posts]);
  return (
    <div className="mx-auto max-w-6xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
        <Input
          autoFocus
          placeholder="搜索文章、标签..."
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
          aria-label="关闭"
        >
          <X className="size-3.5" />
        </button>
      </div>
      {results.length > 0 ? (
        <ul className="mt-2 max-h-72 divide-y divide-border overflow-y-auto rounded-md border border-border bg-bg-elevated">
          {results.map((p) => (
            <li key={p.slug}>
              <Link
                to={`/blog/${encodeURIComponent(p.slug)}`}
                onClick={onClose}
                className="flex items-center justify-between gap-4 px-3 py-2 transition-colors hover:bg-bg-subtle"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm text-fg">{p.title}</div>
                  <div className="truncate text-xs text-fg-muted">
                    {p.excerpt}
                  </div>
                </div>
                {p.tags.length > 0 ? (
                  <span className="shrink-0 text-xs text-fg-subtle">
                    #{p.tags[0]}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
