import { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Input } from '@/components/ui/input';
import { Search, X, Clock, Calendar, Pin } from 'lucide-react';
import {
  getAllPosts,
  getAllTags,
  getAllThemes,
  getPostYears,
  getBacklinkCounts,
} from '@/lib/content';
import { useTranslation } from '@/i18n';
import { FilterBar, type SortKey } from '@/components/FilterBar';

function parseListParam(v: string | null): string[] {
  if (!v) return [];
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function joinListParam(arr: string[]): string {
  return arr.join(',');
}

export default function BlogList() {
  const posts = getAllPosts();
  const allTags = getAllTags();
  const allThemes = useMemo(() => getAllThemes(), []);
  const allYears = useMemo(() => getPostYears(), []);
  const backlinkCounts = useMemo(() => getBacklinkCounts(), []);

  const [searchParams, setSearchParams] = useSearchParams();

  // Read state from URL — single source of truth.
  const sort: SortKey = (searchParams.get('sort') as SortKey) || 'newest';
  const tags = parseListParam(searchParams.get('tag'));
  const years = parseListParam(searchParams.get('year'));
  const themes = parseListParam(searchParams.get('theme'));
  const pinnedOnly = searchParams.get('pinned') === '1';
  const qRaw = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(qRaw);
  // Sync query → URL after a debounce so typing doesn't thrash the history stack.
  useEffect(() => {
    const handle = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (query) next.set('q', query);
      else next.delete('q');
      if (next.toString() !== searchParams.toString()) {
        setSearchParams(next, { replace: true });
      }
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };
  const setList = (key: string, arr: string[]) => {
    if (arr.length === 0) setParam(key, null);
    else setParam(key, joinListParam(arr));
  };

  const { t } = useTranslation();

  // Filter pass
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      // Pinned only
      if (pinnedOnly && p.frontmatter?.pinned !== true) return false;
      // Tag filter (AND semantics — post must have ALL selected tags)
      if (tags.length > 0 && !tags.every((tag) => p.tags.includes(tag))) return false;
      // Year filter (OR semantics — post year must be in selected years)
      if (years.length > 0) {
        const y = p.createdAt && p.createdAt !== new Date(0).toISOString()
          ? new Date(p.createdAt).getFullYear().toString()
          : 'unknown';
        if (!years.includes(y)) return false;
      }
      // Theme filter (OR)
      if (themes.length > 0) {
        const th = typeof p.frontmatter?.contentTheme === 'string' && p.frontmatter.contentTheme.trim()
          ? p.frontmatter.contentTheme.trim()
          : '(default)';
        if (!themes.includes(th)) return false;
      }
      // Search query — matches title / excerpt / tags / frontmatter description / author
      if (q) {
        const hay = [
          p.title,
          p.excerpt,
          String(p.frontmatter?.description ?? ''),
          String(p.frontmatter?.author ?? ''),
          ...p.tags,
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [posts, tags, years, themes, pinnedOnly, query]);

  // Sort pass
  const sorted = useMemo(() => {
    const out = [...filtered];
    const pinnedFirst = (a: (typeof out)[number], b: (typeof out)[number]) => {
      const ap = a.frontmatter?.pinned === true ? 1 : 0;
      const bp = b.frontmatter?.pinned === true ? 1 : 0;
      return bp - ap;
    };
    switch (sort) {
      case 'oldest':
        return out.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || pinnedFirst(a, b));
      case 'updated':
        return out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || pinnedFirst(a, b));
      case 'most-linked':
        return out.sort(
          (a, b) =>
            (backlinkCounts[b.slug] ?? 0) + b.links.length -
              ((backlinkCounts[a.slug] ?? 0) + a.links.length) || pinnedFirst(a, b),
        );
      case 'longest':
        return out.sort((a, b) => b.raw.length - a.raw.length || pinnedFirst(a, b));
      case 'title':
        return out.sort((a, b) => a.title.localeCompare(b.title) || pinnedFirst(a, b));
      case 'newest':
      default:
        return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || pinnedFirst(a, b));
    }
  }, [filtered, sort, backlinkCounts]);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-fg">{t('blog.title')}</h1>
        <p className="text-fg-muted">{t('blog.subtitle')} · 共 {posts.length} 篇</p>
      </header>

      {/* Search row (stays above the filter bar) */}
      <div className="relative">
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

      {/* Filter + sort bar — drives everything from URL params */}
      <FilterBar
        sort={sort}
        tags={tags}
        years={years}
        themes={themes}
        pinnedOnly={pinnedOnly}
        allTags={allTags}
        allYears={allYears}
        allThemes={allThemes}
        visibleCount={sorted.length}
        totalCount={posts.length}
        onSortChange={(s) => setParam('sort', s === 'newest' ? null : s)}
        onTagsChange={(arr) => setList('tag', arr)}
        onYearsChange={(arr) => setList('year', arr)}
        onThemesChange={(arr) => setList('theme', arr)}
        onPinnedOnlyChange={(v) => setParam('pinned', v ? '1' : null)}
        onClearAll={() => {
          const next = new URLSearchParams();
          const sq = searchParams.get('q');
          if (sq) next.set('q', sq);
          setSearchParams(next, { replace: true });
        }}
      />

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-fg-muted">
          {posts.length === 0 ? t('blog.empty') : t('blog.noMatch')}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((p) => {
            const isPinned = p.frontmatter?.pinned === true;
            const readingMinutes = Math.max(1, Math.round(p.raw.length / 600));
            const date = p.createdAt && p.createdAt !== new Date(0).toISOString()
              ? new Date(p.createdAt)
              : new Date(p.date);
            const dateLabel = date.toLocaleDateString(
              typeof navigator !== 'undefined' && navigator.language.startsWith('zh')
                ? 'zh-CN'
                : 'en-US',
              { year: 'numeric', month: 'short', day: 'numeric' },
            );
            return (
              <Link
                key={p.slug}
                to={`/blog/${encodeURIComponent(p.slug)}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-bg-elevated transition-all hover:border-primary/40 hover:shadow-elevated"
              >
                {isPinned ? (
                  <span className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-bg/90 px-2 py-0.5 text-[10px] font-medium text-primary backdrop-blur">
                    <Pin className="size-3" />
                    {t('properties.pinned')}
                  </span>
                ) : null}
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
                      {dateLabel}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      {readingMinutes} 分钟
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
            );
          })}
        </div>
      )}
    </div>
  );
}