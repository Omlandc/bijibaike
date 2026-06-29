import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router';
import { getPostBySlug, getBacklinks, getAllPosts } from '@/lib/content';
import { cn } from '@/lib/utils';
import { MarkdownView } from '@/components/MarkdownView';
import { ReadingProgress } from '@/components/ReadingProgress';
import { TableOfContents } from '@/components/TableOfContents';
import { PostProperties } from '@/components/PostProperties';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  CalendarDays,
  ArrowLeft,
  Link2,
  Clock,
  Tag as TagIcon,
  Palette,
} from 'lucide-react';
import { useTranslation } from '@/i18n';
import { siteConfig } from '@/config/site-config';
import {
  CONTENT_THEMES,
  applyContentTheme,
  getStoredArticleTheme,
  setStoredArticleTheme,
} from '@/lib/content-themes';

export default function Post() {
  // With the splat route `/blog/*`, the full slug is in the `*` key.
  // It may span multiple path segments (e.g. "中医/黄帝内经素问遗篇-1").
  const { '*': slugSplat } = useParams<{ '*': string }>();
  const slug = slugSplat ? decodeURIComponent(slugSplat) : null;
  const post = slug ? getPostBySlug(slug) : undefined;
  const { t } = useTranslation();
  // Active article-content theme for this post. Resolution order:
  //   1. Reader's localStorage override (they personally picked it)
  //   2. Frontmatter `contentTheme` field on THIS post (author's choice)
  //   3. Site-wide default in vault/_config.md
  //   4. "default" fallback
  const [articleTheme, setArticleTheme] = useState<string>(
    () =>
      getStoredArticleTheme() ??
      (typeof post?.frontmatter?.contentTheme === 'string'
        ? (post.frontmatter.contentTheme as string)
        : null) ??
      siteConfig.site.contentTheme ??
      'default',
  );

  // Apply the active theme's CSS variables to <html> when it changes.
  useEffect(() => {
    applyContentTheme(articleTheme);
  }, [articleTheme]);

  // When the slug changes (reader navigates between posts), the
  // frontmatter contentTheme may be different. Refresh the local
  // state unless the reader has explicitly chosen a theme during
  // this session (localStorage already accounts for that case).
  useEffect(() => {
    if (!post) return;
    const stored = getStoredArticleTheme();
    if (stored) {
      setArticleTheme(stored);
      return;
    }
    const fm = post.frontmatter?.contentTheme;
    if (typeof fm === 'string') {
      setArticleTheme(fm);
    }
    // else: keep the current articleTheme (site default or previous)
  }, [post?.slug]);

  function pickTheme(slug: string) {
    setArticleTheme(slug);
    setStoredArticleTheme(slug);
  }
  if (!post) {
    return <Navigate to="/blog" replace />;
  }
  const backlinks = getBacklinks(post.slug);
  const all = getAllPosts();
  const idx = all.findIndex((p) => p.slug === post.slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  const readingMinutes = Math.max(1, Math.round(post.raw.length / 600));

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 lg:flex-row lg:gap-8">
        <article
          data-article-theme={articleTheme}
          className={cn(
            'blog-article order-2 w-full min-w-0 flex-1 space-y-8 lg:order-1',
            // Add the active theme class on the article itself so the
            // compound selector `.blog-article.blog-article--<slug>`
            // in the injected stylesheet matches.
            articleTheme !== 'default' && `blog-article--${articleTheme}`,
          )}
        >
          {/* Mobile TOC — sits at the top of the article so it never
              steals horizontal space from the reading column. Hidden
              on lg+ where the sticky right sidebar takes over. */}
          <div className="lg:hidden">
            <TableOfContents scope="[data-md-root]" />
          </div>
          <header className="space-y-4">
        <div className="flex items-center justify-between text-sm text-fg-muted">
          <Button asChild variant="ghost" size="sm">
            <Link to="/blog">
              <ArrowLeft className="mr-1 size-3.5" />
              {t('post.backToList')}
            </Link>
          </Button>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {new Date(post.date).toLocaleDateString(
              t('lang.zh') === '中文' ? 'zh-CN' : 'en-US',
              {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-fg md:text-4xl">
          {post.title}
        </h1>
        {post.frontmatter.description ? (
          <p className="text-balance text-lg text-fg-muted">
            {String(post.frontmatter.description)}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3 text-xs text-fg-muted">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {readingMinutes} {t('post.minutes')}
          </span>
          {post.tags.length > 0 ? (
            <span className="inline-flex items-center gap-1">
              <TagIcon className="size-3" />
              {t('post.tagsCount', { count: post.tags.length })}
            </span>
          ) : null}
        </div>
        {post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <Link key={t} to={`/tags/${encodeURIComponent(t)}`}>
                <Badge
                  variant="secondary"
                  className="rounded-full font-normal hover:bg-primary/15 hover:text-primary"
                >
                  {t}
                </Badge>
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      <Separator />

      <MarkdownView body={post.body} />

      {/* Post properties panel — mirrors Obsidian's "Properties" view
          and exposes the full frontmatter so readers can see the
          metadata behind a post (created / updated / theme / tags /
          custom fields). */}
      <PostProperties post={post} themes={CONTENT_THEMES} />

      <Separator />

      {backlinks.length > 0 ? (
        <section className="space-y-3">
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-fg">
            <Link2 className="size-4 text-primary" />
            {t('post.backlinks', { count: backlinks.length })}
          </h2>
          <ul className="space-y-2">
            {backlinks.map((bl) => (
              <li
                key={bl.fromSlug}
                className="rounded-md border border-border bg-bg-elevated p-3 transition-colors hover:border-primary/40"
              >
                <Link
                  to={`/blog/${encodeURIComponent(bl.fromSlug)}`}
                  className="font-medium text-fg hover:text-primary"
                >
                  {bl.fromTitle}
                </Link>
                <p className="mt-1 line-clamp-2 text-sm text-fg-muted">
                  {bl.context}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <nav className="flex items-center justify-between gap-4 pt-2">
        {prev ? (
          <Link
            to={`/blog/${encodeURIComponent(prev.slug)}`}
            className="group flex flex-1 flex-col rounded-lg border border-border p-3 transition-colors hover:border-primary/40"
          >
            <div className="text-xs text-fg-muted">← {t('post.prev')}</div>
            <div className="line-clamp-1 font-medium text-fg group-hover:text-primary">
              {prev.title}
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {next ? (
          <Link
            to={`/blog/${encodeURIComponent(next.slug)}`}
            className="group flex flex-1 flex-col rounded-lg border border-border p-3 text-right transition-colors hover:border-primary/40"
          >
            <div className="text-xs text-fg-muted">{t('post.next')} →</div>
            <div className="line-clamp-1 font-medium text-fg group-hover:text-primary">
              {next.title}
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </nav>

      {/* Article content theme picker */}
      <section
        aria-label={t('contentTheme.pickerLabel')}
        className="mt-12 space-y-3 rounded-lg border border-border bg-bg-elevated p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-fg-muted">
            <Palette className="size-4" />
            <span>{t('contentTheme.pickerLabel')}</span>
          </div>
          <p className="text-xs text-fg-subtle">{t('contentTheme.toggleHint')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {CONTENT_THEMES.map((theme) => {
            const active = theme.slug === articleTheme;
            return (
              <button
                key={theme.slug}
                type="button"
                onClick={() => pickTheme(theme.slug)}
                aria-pressed={active}
                className={
                  'group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ' +
                  (active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-fg-muted hover:border-primary/40 hover:text-fg')
                }
                title={theme.description}
              >
                <span
                  className="inline-block size-3 rounded-full border border-current/30"
                  style={{ background: theme.preview.bg, borderColor: theme.preview.accent }}
                />
                <span>{theme.name}</span>
              </button>
            );
          })}
        </div>
      </section>
        </article>
        {/* Desktop TOC — sticky right sidebar. order-1 on lg so it
            appears after the article on mobile (which renders at
            order-2). */}
        <div className="order-1 lg:order-2">
          <TableOfContents scope="[data-md-root]" />
        </div>
      </div>
    </>
  );
}
