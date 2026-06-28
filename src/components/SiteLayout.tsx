import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { Home, BookOpen, Tags, Network, FileText, Search, X } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useEffect, useMemo, useState } from 'react';
import { getAllPosts, getAllTags } from '@/lib/content';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: '首页', icon: Home, end: true },
  { to: '/blog', label: '文章', icon: BookOpen },
  { to: '/tags', label: '标签', icon: Tags },
  { to: '/graph', label: '关系图', icon: Network },
];

export function SiteLayout() {
  const stats = useMemo(
    () => ({
      posts: getAllPosts().length,
      tags: getAllTags().length,
    }),
    [],
  );
  const { pathname } = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

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
            <span className="font-semibold tracking-tight">Obsidian Blog</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((n) => {
              const Icon = n.icon;
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-fg-muted hover:bg-bg-subtle hover:text-fg',
                    )
                  }
                >
                  <Icon className="size-3.5" />
                  {n.label}
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

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-12">
        <Outlet />
      </main>

      <footer className="mt-12 border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-fg-muted md:flex-row">
          <span>
            由{' '}
            <a
              href="https://github.com/Omlandc/blog-system"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg-muted hover:text-fg"
            >
              blog-system
            </a>{' '}
            的设计语言 + Obsidian 兼容层驱动 · 路径:{' '}
            <code className="rounded bg-bg-subtle px-1 text-fg">{pathname}</code>
          </span>
          <span className="text-fg-subtle">
            © {new Date().getFullYear()} · 静态部署 · 内容即仓库
          </span>
        </div>
        <Separator className="opacity-0" />
      </footer>
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
                to={`/blog/${p.slug}`}
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
