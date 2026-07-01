import { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Input } from '@/components/ui/input';
import {
  Search,
  X,
  Clock,
  Calendar,
  Pin,
  FolderTree,
  ChevronRight,
} from 'lucide-react';
import {
  getAllPosts,
  getAllTags,
  getAllThemes,
  getPostYears,
  getBacklinkCounts,
  getAllPillars,
} from '@/lib/content';
import { useTranslation } from '@/i18n';
import { FilterBar, type SortKey } from '@/components/FilterBar';

type ViewMode = 'cards' | 'list' | 'tree';
const VALID_VIEWS: ViewMode[] = ['cards', 'list', 'tree'];

function parseView(v: string | null): ViewMode {
  return VALID_VIEWS.includes(v as ViewMode) ? (v as ViewMode) : 'cards';
}

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
  // View mode (cards | list | tree). Persisted in URL so reloads
  // and shared links keep the user's choice.
  const view: ViewMode = parseView(searchParams.get('view'));
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

  // Group filtered posts by pillar / cluster for the tree view.
  // We start from the full pillar tree (so empty pillars still show
  // their structure) and intersect with `sorted` to know what to keep.
  // Posts whose sourcePath is a root-level file (no pillar) go into
  // a synthetic "未分类" pillar so they still surface in the tree.
  const tree = useMemo(() => {
    const sortedSlugs = new Set(sorted.map((p) => p.slug));
    const pillars = getAllPillars().map((pillar) => {
      const directPosts = pillar.posts.filter((p) => sortedSlugs.has(p.slug));
      const clusters = pillar.clusters
        .map((c) => ({
          ...c,
          posts: c.posts.filter((p) => sortedSlugs.has(p.slug)),
        }))
        .filter((c) => c.posts.length > 0);
      return { ...pillar, posts: directPosts, clusters };
    });
    // Pull out the root-level posts (no pillar) into a separate group
    // so the user can still see them.
    const pillarDirSet = new Set(
      getAllPillars().flatMap((p) => [
        p.slug,
        ...p.clusters.map((c) => `${p.slug}/${c.name}`),
      ]),
    );
    const orphanPosts = sorted.filter((p) => {
      const dir = p.sourcePath.split('/').slice(0, -1).join('/');
      return !pillarDirSet.has(dir);
    });
    return { pillars, orphanPosts };
  }, [sorted]);

  // Shared date + reading-time helper, used by both list and tree.
  const fmtPost = (p: (typeof sorted)[number]) => {
    const date = p.createdAt && p.createdAt !== new Date(0).toISOString()
      ? new Date(p.createdAt)
      : new Date(p.date);
    const locale = typeof navigator !== 'undefined' && navigator.language.startsWith('zh') ? 'zh-CN' : 'en-US';
    const dateLabel = date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
    const readingMinutes = Math.max(1, Math.round(p.raw.length / 600));
    const isPinned = p.frontmatter?.pinned === true;
    return { dateLabel, readingMinutes, isPinned };
  };

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
        view={view}
        onViewChange={(v) => setParam('view', v === 'cards' ? null : v)}
      />

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-fg-muted">
          {posts.length === 0 ? t('blog.empty') : t('blog.noMatch')}
        </div>
      ) : view === 'cards' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((p) => {
              const { dateLabel, readingMinutes, isPinned } = fmtPost(p);
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
        ) : view === 'list' ? (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-bg-elevated">
            {sorted.map((p) => {
              const { dateLabel, readingMinutes, isPinned } = fmtPost(p);
              return (
                <li key={p.slug}>
                  <Link
                    to={`/blog/${encodeURIComponent(p.slug)}`}
                    className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-subtle"
                  >
                    {isPinned ? (
                      <Pin className="size-3.5 shrink-0 text-primary" />
                    ) : (
                      <span className="size-3.5 shrink-0" />
                    )}
                    <span className="line-clamp-1 min-w-0 flex-1 text-sm font-medium text-fg group-hover:text-primary">
                      {p.title}
                    </span>
                    {p.tags[0] ? (
                      <span className="hidden shrink-0 rounded-full border border-border bg-bg-subtle px-2 py-0.5 text-[10px] text-fg-muted md:inline">
                        {p.tags[0]}
                      </span>
                    ) : null}
                    <span className="hidden w-24 shrink-0 text-right text-xs text-fg-subtle sm:inline">
                      {dateLabel}
                    </span>
                    <span className="hidden w-16 shrink-0 text-right text-xs text-fg-subtle lg:inline">
                      {readingMinutes} 分钟
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-fg-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          // Tree view: pillar → optional clusters → posts.
          // Only branches that contain filtered posts are shown.
          <div className="space-y-6">
            {tree.pillars.map((pillar) => {
              const pillarTotal = pillar.posts.length + pillar.clusters.reduce((s, c) => s + c.posts.length, 0);
              if (pillarTotal === 0) return null;
              return (
                <section key={pillar.slug}>
                  <header className="mb-2 flex items-baseline gap-2 border-b border-border pb-1.5">
                    <FolderTree className="size-4 text-primary" />
                    <h3 className="text-base font-semibold text-fg">{pillar.name}</h3>
                    <span className="text-xs text-fg-subtle">{pillarTotal} 篇</span>
                  </header>
                  <ul className="space-y-1">
                    {pillar.posts.map((p) => {
                      const { dateLabel, isPinned } = fmtPost(p);
                      return (
                        <li key={p.slug}>
                          <Link
                            to={`/blog/${encodeURIComponent(p.slug)}`}
                            className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-bg-subtle"
                          >
                            {isPinned ? <Pin className="size-3 shrink-0 text-primary" /> : <span className="size-3 shrink-0" />}
                            <span className="flex-1 truncate text-fg group-hover:text-primary">{p.title}</span>
                            <span className="hidden text-xs text-fg-subtle sm:inline">{dateLabel}</span>
                            <ChevronRight className="size-3.5 shrink-0 text-fg-muted group-hover:text-primary" />
                          </Link>
                        </li>
                      );
                    })}
                    {pillar.clusters.map((c) => (
                      <li key={c.slug} className="mt-2">
                        <div className="mb-1 flex items-baseline gap-1.5 pl-2 text-xs font-medium uppercase tracking-wide text-fg-muted">
                          <FolderTree className="size-3" />
                          {c.name}
                          <span className="font-normal normal-case tracking-normal text-fg-subtle">({c.posts.length})</span>
                        </div>
                        <ul className="space-y-1 pl-4">
                          {c.posts.map((p) => {
                            const { dateLabel, isPinned } = fmtPost(p);
                            return (
                              <li key={p.slug}>
                                <Link
                                  to={`/blog/${encodeURIComponent(p.slug)}`}
                                  className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-bg-subtle"
                                >
                                  {isPinned ? <Pin className="size-3 shrink-0 text-primary" /> : <span className="size-3 shrink-0" />}
                                  <span className="flex-1 truncate text-fg group-hover:text-primary">{p.title}</span>
                                  <span className="hidden text-xs text-fg-subtle sm:inline">{dateLabel}</span>
                                  <ChevronRight className="size-3.5 shrink-0 text-fg-muted group-hover:text-primary" />
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
            {tree.orphanPosts.length > 0 ? (
              <section>
                <header className="mb-2 flex items-baseline gap-2 border-b border-border pb-1.5">
                  <FolderTree className="size-4 text-fg-muted" />
                  <h3 className="text-base font-semibold text-fg-muted">未分类</h3>
                  <span className="text-xs text-fg-subtle">{tree.orphanPosts.length} 篇</span>
                </header>
                <ul className="space-y-1">
                  {tree.orphanPosts.map((p) => {
                    const { dateLabel, isPinned } = fmtPost(p);
                    return (
                      <li key={p.slug}>
                        <Link
                          to={`/blog/${encodeURIComponent(p.slug)}`}
                          className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-bg-subtle"
                        >
                          {isPinned ? <Pin className="size-3 shrink-0 text-primary" /> : <span className="size-3 shrink-0" />}
                          <span className="flex-1 truncate text-fg group-hover:text-primary">{p.title}</span>
                          <span className="hidden text-xs text-fg-subtle sm:inline">{dateLabel}</span>
                          <ChevronRight className="size-3.5 shrink-0 text-fg-muted group-hover:text-primary" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}
          </div>
        )}
    </div>
  );
}