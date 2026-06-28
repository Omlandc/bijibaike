import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Clock, Tag as TagIcon, Calendar } from 'lucide-react';
import { getAllPosts, getAllTags } from '@/lib/content';
import { cn } from '@/lib/utils';

export default function BlogList() {
  const posts = getAllPosts();
  const tags = getAllTags();
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (
        activeTags.length > 0 &&
        !activeTags.every((t) => p.tags.includes(t))
      )
        return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.raw.toLowerCase().includes(q)
      );
    });
  }, [posts, query, activeTags]);

  const toggleTag = (t: string) =>
    setActiveTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-fg">所有文章</h1>
        <p className="text-fg-muted">共 {posts.length} 篇 · 按日期倒序</p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
          <Input
            placeholder="搜索标题、内容、标签…"
            className="pl-9 pr-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-fg-muted hover:bg-bg-subtle"
              aria-label="清空"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
        {activeTags.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={() => setActiveTags([])}>
            清除筛选
          </Button>
        ) : null}
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <TagIcon className="size-4 text-fg-muted" />
          {tags.map((t) => {
            const active = activeTags.includes(t.name);
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => toggleTag(t.name)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs transition-colors',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-fg-muted hover:text-fg',
                )}
              >
                #{t.name} <span className="opacity-60">({t.count})</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-fg-muted">
          没有匹配的文章
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link
              key={p.slug}
              to={`/blog/${p.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-elevated transition-all hover:border-primary/40 hover:shadow-elevated"
            >
              <div
                className="relative aspect-[16/9] w-full overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, hsl(${
                    p.slug
                      .split('')
                      .reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xffff, 7) %
                    360
                  } 70% 60%) 0%, hsl(${
                    p.slug
                      .split('')
                      .reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xffff, 7) *
                      7 %
                    360
                  } 70% 50%) 100%)`,
                }}
              >
                <div className="absolute inset-0 bg-dot-grid opacity-30" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 text-base font-semibold text-fg group-hover:text-primary">
                  {p.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-fg-muted">
                  {p.frontmatter.description
                    ? String(p.frontmatter.description)
                    : p.excerpt}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-fg-subtle">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3" />
                    {new Date(p.date).toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {Math.max(1, Math.round(p.raw.length / 600))} 分钟
                  </span>
                </div>
                {p.tags.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-border bg-bg px-1.5 py-0 text-[10px] text-fg-muted"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
