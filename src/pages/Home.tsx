import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Sparkles, Search, Calendar, TrendingUp, Tag as TagIcon, Clock, Pin, FileText, FolderTree, Network, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getAllPosts, getAllTags, getAllPillars } from '@/lib/content';
import { useTranslation } from '@/i18n';

const PALETTE = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#a855f7',
];

function hashIndex(tag: string): number {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
  return h % PALETTE.length;
}

function GraphPreviewMini() {
  const posts = useMemo(() => getAllPosts().slice(0, 24), []);
  const W = 360;
  const H = 180;
  const positions = useMemo(() => {
    const n = posts.length;
    return posts.map((_, i) => {
      const angle = (i / Math.max(1, n)) * Math.PI * 2;
      const rx = W / 2 - 30;
      const ry = H / 2 - 20;
      return {
        cx: W / 2 + Math.cos(angle) * rx,
        cy: H / 2 + Math.sin(angle) * ry * 0.8,
      };
    });
  }, [posts]);
  const edges = useMemo(() => {
    const out: { a: number; b: number }[] = [];
    for (let i = 0; i < posts.length; i++) {
      const a = posts[i]!;
      for (const t of a.links) {
        const j = posts.findIndex((p) => p.slug === t);
        if (j > i) out.push({ a: i, b: j });
      }
    }
    return out;
  }, [posts]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-full w-full" aria-hidden="true">
      <g stroke="currentColor" strokeOpacity={0.25}>
        {edges.map((e, i) => {
          const a = positions[e.a];
          const b = positions[e.b];
          if (!a || !b) return null;
          return (
            <line key={i} x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy} strokeWidth={0.6} />
          );
        })}
      </g>
      <g>
        {posts.map((p, i) => {
          const pos = positions[i];
          if (!pos) return null;
          const tag = p.tags[0];
          return (
            <circle
              key={p.slug}
              cx={pos.cx}
              cy={pos.cy}
              r={4 + Math.min(3, Math.sqrt(p.links.length))}
              fill={tag ? PALETTE[hashIndex(tag)] : '#6366f1'}
              fillOpacity={0.85}
              stroke="var(--color-bg-elevated)"
              strokeWidth={1}
            />
          );
        })}
      </g>
      <text
        x={W / 2}
        y={H - 8}
        textAnchor="middle"
        fontSize={9}
        fill="currentColor"
        fillOpacity={0.4}
      >
        {posts.length} 个节点 · {edges.length} 条 wiki link
      </text>
    </svg>
  );
}

export default function Home() {
  const allPosts = getAllPosts();
  const allTags = getAllTags();
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string>('');
  const [sort, setSort] = useState<'latest' | 'hot'>('latest');

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
  const { t } = useTranslation();

  return (
    <div className="space-y-12">
      <section className="bg-glow relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-bg-elevated to-bg p-8 sm:p-12">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-elevated px-3 py-1 text-xs text-fg-muted">
            <Sparkles className="size-3 text-primary" />
            <span>Obsidian 兼容</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-fg sm:text-4xl md:text-5xl">
            <span className="text-primary">融通东西方，笔记天下事</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-fg-muted sm:text-lg">
            公众号笔记百科和这个东西的官方博客与工具箱，不断进化的文化内容与五明之学承载地，一站式精心打造的系统性个人成长与修身平台
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/blog">
                {t('home.browseAll')} <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/graph">{t('home.viewGraph')}</Link>
            </Button>
          </div>
          <div className="mt-6 text-xs text-fg-muted">
            {t('home.stats', {
              posts: allPosts.length,
              tags: allTags.length,
              links: allPosts.reduce((acc, p) => acc + p.links.length, 0),
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-bg-elevated p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-fg">
              <FolderTree className="size-4 text-primary" />
              <h2 className="text-base font-semibold">{t('topics.title')}</h2>
            </div>
            <Link to="/topics" className="inline-flex items-center gap-0.5 text-xs text-fg-muted hover:text-primary">
              {t('topics.browse')}
              <ChevronRight className="size-3" />
            </Link>
          </div>
          {getAllPillars().length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-bg p-6 text-center text-xs text-fg-muted">
              还没有主题簇 — 在 vault 里创建子目录
            </div>
          ) : (
            <ul className="space-y-1.5">
              {getAllPillars().map((pillar) => (
                <li key={pillar.slug}>
                  <Link
                    to={`/topics/${encodeURIComponent(pillar.slug)}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-transparent px-3 py-2 text-sm transition-colors hover:border-border hover:bg-bg"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-fg">{pillar.name}</div>
                      {pillar.description ? (
                        <div className="line-clamp-1 text-xs text-fg-muted">{pillar.description}</div>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-xs text-fg-subtle">{pillar.postCount} 篇</div>
                    <ChevronRight className="size-3.5 shrink-0 text-fg-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link
          to="/graph"
          className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-elevated transition-all hover:border-primary/40 hover:shadow-elevated"
        >
          <div className="flex items-center justify-between border-b border-border bg-bg-subtle px-5 py-3">
            <div className="flex items-center gap-2 text-fg">
              <Network className="size-4 text-primary" />
              <h2 className="text-base font-semibold">{t('graph.title')}</h2>
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs text-fg-muted group-hover:text-primary">
              {t('home.viewGraph')}
              <ArrowRight className="size-3" />
            </span>
          </div>
          <div className="relative flex-1 p-3" style={{ minHeight: '200px' }}>
            <GraphPreviewMini />
          </div>
        </Link>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
          <Input
            placeholder={t('home.searchPosts')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border bg-bg-elevated p-0.5">
          <button
            type="button"
            onClick={() => setSort('latest')}
            className={cn('flex items-center gap-1 rounded px-3 py-1 text-xs transition-colors', sort === 'latest' ? 'bg-primary text-primary-foreground' : 'text-fg-muted hover:text-fg')}
          >
            <Calendar className="size-3" />
            {t('home.filter.latest')}
          </button>
          <button
            type="button"
            onClick={() => setSort('hot')}
            className={cn('flex items-center gap-1 rounded px-3 py-1 text-xs transition-colors', sort === 'hot' ? 'bg-primary text-primary-foreground' : 'text-fg-muted hover:text-fg')}
          >
            <TrendingUp className="size-3" />
            {t('home.filter.popular')}
          </button>
        </div>
      </div>

      {allTags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <TagIcon className="size-4 text-fg-muted" />
          <button
            type="button"
            onClick={() => setActiveTag('')}
            className={cn('rounded-full border px-3 py-1 text-xs transition-colors', !activeTag ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-fg-muted hover:text-fg')}
          >
            {t('home.filter.all')}
          </button>
          {allTags.map((tag) => (
            <button
              key={tag.name}
              type="button"
              onClick={() => setActiveTag(tag.name === activeTag ? '' : tag.name)}
              className={cn('rounded-full border px-3 py-1 text-xs transition-colors', activeTag === tag.name ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-fg-muted hover:text-fg')}
            >
              {tag.name} <span className="opacity-60">({tag.count})</span>
            </button>
          ))}
        </div>
      ) : null}

      {featured ? (
        <Link
          to={`/blog/${encodeURIComponent(featured.slug)}`}
          className="group block overflow-hidden rounded-2xl border border-border bg-bg-elevated transition-all hover:border-primary/40 hover:shadow-elevated"
        >
          <div className="grid gap-6 p-6 sm:grid-cols-[1fr_2fr] sm:p-8">
            <FeaturedCover post={featured} />
            <div className="flex min-w-0 flex-col justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                  {featured.frontmatter.pinned ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                      <Pin className="size-3" />精选
                    </span>
                  ) : null}
                  {featured.tags[0] ? (
                    <span className="rounded-full border border-border px-2 py-0.5">{featured.tags[0]}</span>
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
                  <p className="mt-3 text-fg-muted">{String(featured.frontmatter.description)}</p>
                ) : (
                  <p className="mt-3 line-clamp-3 text-fg-muted">{featured.excerpt}</p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-fg-muted">
                <span>
                  {new Date(featured.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="inline-flex items-center gap-1 text-primary transition-all group-hover:gap-2">
                  阅读全文 <ArrowRight className="size-3.5" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      ) : null}

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
  const cover = post.cover;
  if (cover) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl sm:aspect-square">
        <img src={cover} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
      </div>
    );
  }
  return (
    <div className="relative flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-br from-bg-elevated to-bg-subtle p-6 sm:aspect-square">
      <FileText className="size-10 text-fg-subtle/50" strokeWidth={1.5} />
      {post.tags[0] ? (
        <span className="rounded-full border border-border bg-bg/60 px-3 py-1 text-xs text-fg-muted">{post.tags[0]}</span>
      ) : null}
    </div>
  );
}

function PostGridCard({ post }: { post: ReturnType<typeof getAllPosts>[number] }) {
  const cover = post.cover;
  const readingMinutes = Math.max(1, Math.round(post.raw.length / 600));
  const description = typeof post.frontmatter.description === 'string' ? post.frontmatter.description : post.excerpt;
  return (
    <Link
      to={`/blog/${encodeURIComponent(post.slug)}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-bg-elevated transition-all hover:border-primary/40 hover:shadow-elevated"
    >
      {cover ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <img src={cover} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {post.tags[0] ? (
          <span className="inline-flex w-fit items-center rounded-full border border-border bg-bg-subtle px-2 py-0.5 text-[10px] font-medium text-fg-muted">{post.tags[0]}</span>
        ) : null}
        <h3 className="line-clamp-2 text-base font-semibold text-fg group-hover:text-primary">{post.title}</h3>
        {description ? <p className="line-clamp-2 text-sm text-fg-muted">{description}</p> : null}
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-fg-subtle">
          <span className="inline-flex items-center gap-1"><Clock className="size-3" />{readingMinutes} 分钟</span>
          <span>{new Date(post.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </Link>
  );
}
