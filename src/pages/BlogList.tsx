import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Clock, Tag as TagIcon, Calendar } from 'lucide-react';
import { getAllPosts, getAllTags } from '@/lib/content';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';

export default function BlogList() {
  const posts = getAllPosts();
  const tags = getAllTags();
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const { t } = useTranslation();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (
        activeTags.length > 0 &&
        !activeTags.every((tag) => p.tags.includes(tag))
      )
        return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        p.raw.toLowerCase().includes(q)
      );
    });
  }, [posts, query, activeTags]);

  const toggleTag = (tag: string) =>
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag],
    );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-fg">{t('blog.title')}</h1>
        <p className="text-fg-muted">{t('blog.subtitle')} · 共 {posts.length} 篇</p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
          <Input
            placeholder={t('site.searchPlaceholder')}
            className="pl-9 pr-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-fg-muted hover:bg-bg-subtle"
              aria-label="Clear"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
        {activeTags.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={() => setActiveTags([])}>
            {t('tags.allTag')}
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
              to={`/blog/${encodeURIComponent(p.slug)}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-bg-elevated transition-all hover:border-primary/40 hover:shadow-elevated"
            >
              {p.cover ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <img
                    src={p.cover}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col gap-2 p-4">
                {p.tags[0] ? (
                  <span className="inline-flex w-fit items-center rounded-full border border-border bg-bg-subtle px-2 py-0.5 text-[10px] font-medium text-fg-muted">
                    {p.tags[0]}
                  </span>
                ) : null}
                <h3 className="line-clamp-2 text-base font-semibold text-fg group-hover:text-primary">
                  {p.title}
                </h3>
                <p className="line-clamp-2 text-sm text-fg-muted">
                  {p.frontmatter.description
                    ? String(p.frontmatter.description)
                    : p.excerpt}
                </p>
                <div className="mt-auto flex items-center justify-between pt-2 text-xs text-fg-subtle">
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
                {p.tags.length > 1 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-border bg-bg px-1.5 py-0 text-[10px] text-fg-muted"
                      >
                        {t}
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
