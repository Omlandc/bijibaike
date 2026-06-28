import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Sparkles, Search, Calendar, TrendingUp, Tag as TagIcon, Clock, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getAllPosts, getAllTags } from '@/lib/content';

type SortKey = 'latest' | 'hot';

export default function Home() {
  const allPosts = getAllPosts();
  const allTags = getAllTags();
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string>('');
  const [sort, setSort] = useState<SortKey>('latest');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allPosts.filter((p) => {
      if (activeTag && !p.tags.includes(activeTag)) return false;
      if (q) {
        const hay = `${p.title} ${p.excerpt}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allPosts, search, activeTag]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === 'latest') {
      arr.sort((a, b) => b.date.localeCompare(a.date));
    } else {
      // hot: pinned first, then by tag count as a proxy for popularity
      arr.sort((a, b) => {
        const ap = a.frontmatter.pinned ? 1 : 0;
        const bp = b.frontmatter.pinned ? 1 : 0;
        if (ap !== bp) return bp - ap;
        return b.tags.length - a.tags.length || b.date.localeCompare(a.date);
      });
    }
    return arr;
  }, [filtered, sort]);

  const featured = sorted.find((p) => p.frontmatter.pinned) ?? sorted[0];
  const rest = sorted.filter((p) => p !== featured);
  const heroTitleLead = 'Obsidian 兼容';
  const heroTitleAccent = '即开即用博客';
  const heroSubtitle =
    '基于 webapp-building (0-origin) + 一层 Obsidian 兼容层。把你的 vault 直接放进 content/ 目录,所有 `[[双链]]`、`> [!callout]`、frontmatter、inline #tag 都被正确渲染。';

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="bg-glow relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-bg-elevated to-bg p-8 sm:p-12">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-elevated px-3 py-1 text-xs text-fg-muted">
            <Sparkles className="size-3 text-primary" />
            <span>{heroTitleLead}</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-fg sm:text-4xl md:text-5xl">
            写一次,{' '}
            <br className="sm:hidden" />
            <span className="text-primary">{heroTitleAccent}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-fg-muted sm:text-lg">
            {heroSubtitle}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/blog">
                浏览全部文章 <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/graph">查看关系图</Link>
            </Button>
          </div>
          <div className="mt-6 text-xs text-fg-muted">
            共 {allPosts.length} 篇文章 · {allTags.length} 个标签 ·{' '}
            {allPosts.reduce((acc, p) => acc + p.links.length, 0)} 条 wiki 链接
          </div>
        </div>
      </section>

      {/* Search + Sort */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
          <Input
            placeholder="搜索文章..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border bg-bg-elevated p-0.5">
          <button
            type="button"
            onClick={() => setSort('latest')}
            className={cn(
              'flex items-center gap-1 rounded px-3 py-1 text-xs transition-colors',
              sort === 'latest'
                ? 'bg-primary text-primary-foreground'
                : 'text-fg-muted hover:text-fg',
            )}
          >
            <Calendar className="size-3" />
            最新
          </button>
          <button
            type="button"
            onClick={() => setSort('hot')}
            className={cn(
              'flex items-center gap-1 rounded px-3 py-1 text-xs transition-colors',
              sort === 'hot'
                ? 'bg-primary text-primary-foreground'
                : 'text-fg-muted hover:text-fg',
            )}
          >
            <TrendingUp className="size-3" />
            热门
          </button>
        </div>
      </div>

      {/* Tag cloud */}
      {allTags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <TagIcon className="size-4 text-fg-muted" />
          <button
            type="button"
            onClick={() => setActiveTag('')}
            className={cn(
              'rounded-full border px-3 py-1 text-xs transition-colors',
              !activeTag
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-fg-muted hover:text-fg',
            )}
          >
            全部
          </button>
          {allTags.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => setActiveTag(t.name === activeTag ? '' : t.name)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                activeTag === t.name
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-fg-muted hover:text-fg',
              )}
            >
              {t.name} <span className="opacity-60">({t.count})</span>
            </button>
          ))}
        </div>
      ) : null}

      {/* Featured post (cover-style) */}
      {featured ? (
        <Link
          to={`/blog/${featured.slug}`}
          className="group block overflow-hidden rounded-2xl border border-border bg-bg-elevated transition-all hover:border-primary/40 hover:shadow-elevated"
        >
          <div className="grid gap-6 p-6 sm:grid-cols-[1fr_2fr] sm:p-8">
            <FeaturedCover post={featured} />
            <div className="flex min-w-0 flex-col justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                  {featured.frontmatter.pinned ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                      <Pin className="size-3" />
                      精选
                    </span>
                  ) : null}
                  {featured.tags[0] ? (
                    <span className="rounded-full border border-border px-2 py-0.5">
                      {featured.tags[0]}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {Math.max(1, Math.round(featured.raw.length / 600))} 分钟
                  </span>
                </div>
                <h2 className="text-balance text-2xl font-bold tracking-tight text-fg group-hover:text-primary sm:text-3xl">
                  {featured.title}
                </h2>
                {featured.frontmatter.description ? (
                  <p className="mt-3 text-fg-muted">
                    {String(featured.frontmatter.description)}
                  </p>
                ) : (
                  <p className="mt-3 line-clamp-3 text-fg-muted">
                    {featured.excerpt}
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-fg-muted">
                <span>
                  {new Date(featured.date).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span className="inline-flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
                  阅读全文 <ArrowRight className="size-3.5" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      ) : null}

      {/* Article grid */}
      {rest.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <PostGridCard key={p.slug} post={p} />
          ))}
        </div>
      ) : !featured ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-fg-muted">
          还没有文章可显示
        </div>
      ) : null}
    </div>
  );
}

function FeaturedCover({ post }: { post: ReturnType<typeof getAllPosts>[number] }) {
  // Use a deterministic gradient based on slug hash, with a large
  // initial letter (similar to editorial designs).
  const hash = post.slug
    .split('')
    .reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xffff, 7);
  const hueA = hash % 360;
  const hueB = (hash * 7) % 360;
  const initial =
    post.title
      .replace(/^#+\s*/, '')
      .trim()
      .charAt(0)
      .toUpperCase() || 'N';
  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-xl sm:aspect-square"
      style={{
        background: `linear-gradient(135deg, hsl(${hueA} 70% 60%) 0%, hsl(${hueB} 70% 50%) 100%)`,
      }}
    >
      <div className="absolute inset-0 bg-dot-grid opacity-30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-7xl font-black text-white/90 drop-shadow-lg sm:text-8xl">
          {initial}
        </span>
      </div>
    </div>
  );
}

function PostGridCard({
  post,
}: {
  post: ReturnType<typeof getAllPosts>[number];
}) {
  const hash = post.slug
    .split('')
    .reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xffff, 7);
  const hueA = hash % 360;
  const hueB = (hash * 7) % 360;
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-elevated transition-all hover:border-primary/40 hover:shadow-elevated"
    >
      <div
        className="relative aspect-[16/9] w-full overflow-hidden"
        style={{
          background: `linear-gradient(135deg, hsl(${hueA} 70% 60%) 0%, hsl(${hueB} 70% 50%) 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-dot-grid opacity-30" />
        <div className="absolute right-3 top-3 rounded-full border border-white/30 bg-black/20 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
          #{post.tags[0] ?? '笔记'}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-fg group-hover:text-primary">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-fg-muted">
          {post.frontmatter.description
            ? String(post.frontmatter.description)
            : post.excerpt}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs text-fg-subtle">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {Math.max(1, Math.round(post.raw.length / 600))} 分钟
          </span>
          <span>
            {new Date(post.date).toLocaleDateString('zh-CN', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}
