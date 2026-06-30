import { useParams, Link, Navigate } from 'react-router';
import {
  getPostBySlug,
  getBacklinks,
  getAllPosts,
  getPillarBySlug,
  getClusterBySlug,
} from '@/lib/content';
import { slugify } from '@/lib/obsidian';
import { MarkdownView } from '@/components/MarkdownView';
import { ReadingProgress } from '@/components/ReadingProgress';
import { TableOfContents } from '@/components/TableOfContents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  CalendarDays,
  FileEdit,
  ArrowLeft,
  Link2,
  Clock,
  Tag as TagIcon,
  ChevronRight,
  Home as HomeIcon,
} from 'lucide-react';
import { useTranslation } from '@/i18n';

export default function Post() {
  const { '*': slugSplat } = useParams<{ '*': string }>();
  const slug = slugSplat ? decodeURIComponent(slugSplat) : null;
  const post = slug ? getPostBySlug(slug) : undefined;
  const { t } = useTranslation();

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
        <article className="order-2 w-full min-w-0 flex-1 space-y-8 lg:order-1">
          {/* Mobile TOC */}
          <div className="lg:hidden">
            <TableOfContents scope="[data-md-root]" />
          </div>

          {/* Breadcrumb: 首页 / 主题 / [Pillar / [Cluster] ] / 文章名 */}
          <PostBreadcrumb post={post} />

          <header className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-fg-muted">
              <Button asChild variant="ghost" size="sm">
                <Link to="/blog">
                  <ArrowLeft className="mr-1 size-3.5" />
                  {t('post.backToList')}
                </Link>
              </Button>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3.5" />
                  {t('post.created')}: {new Date(post.createdAt).toLocaleDateString(
                    t('lang.zh') === '中文' ? 'zh-CN' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' },
                  )}
                </span>
                {post.updatedAt !== post.createdAt && (
                  <span className="inline-flex items-center gap-1">
                    <FileEdit className="size-3.5" />
                    {t('post.updated')}: {new Date(post.updatedAt).toLocaleDateString(
                      t('lang.zh') === '中文' ? 'zh-CN' : 'en-US',
                      { year: 'numeric', month: 'long', day: 'numeric' },
                    )}
                  </span>
                )}
              </div>
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
                {post.tags.map((tag) => (
                  <Link key={tag} to={`/tags/${encodeURIComponent(tag)}`}>
                    <Badge
                      variant="secondary"
                      className="rounded-full font-normal hover:bg-primary/15 hover:text-primary"
                    >
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : null}
          </header>

          <Separator />

          <MarkdownView body={post.body} />

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

          <nav className="flex items-center justify-between gap-4">
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
        </article>

        {/* Desktop TOC */}
        <div className="hidden lg:block lg:order-2">
          <TableOfContents scope="[data-md-root]" />
        </div>
      </div>
    </>
  );
}

/**
 * Build a path-based breadcrumb from a post's source location.
 * Example: 中医/经典探幽/达摩多罗禅经今释.md
 *   → 首页 / 主题 / 中医 / 经典探幽 / 达摩多罗禅经今释
 */
function PostBreadcrumb({ post }: { post: ReturnType<typeof getAllPosts>[number] }) {
  // Source path is something like "中医/经典探幽/file.md"
  const parts = post.sourcePath.replace(/\.md$/i, '').split('/').filter(Boolean);
  const trail: { label: string; to?: string }[] = [];

  if (parts.length >= 2) {
    const pillarName = parts[0];
    const pillarSlug = slugify(pillarName);
    const pillar = getPillarBySlug(pillarSlug);
    if (pillar) {
      trail.push({ label: pillarName, to: `/topics/${encodeURIComponent(pillarSlug)}` });
    }
    if (parts.length >= 3) {
      // Has a cluster
      const clusterName = parts[1];
      const clusterSlug = `${pillarSlug}/${slugify(clusterName)}`;
      const cluster = getClusterBySlug(pillarSlug, clusterSlug);
      if (cluster) {
        trail.push({
          label: clusterName,
          to: `/topics/${encodeURIComponent(pillarSlug)}/${encodeURIComponent(clusterSlug)}`,
        });
      }
    }
  }

  return (
    <nav
      aria-label="breadcrumb"
      className="flex flex-wrap items-center gap-1 text-xs text-fg-muted"
    >
      <Link
        to="/"
        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-bg-subtle hover:text-fg"
      >
        <HomeIcon className="size-3" />
        首页
      </Link>
      <ChevronRight className="size-3" />
      <Link
        to="/topics"
        className="rounded px-1.5 py-0.5 transition-colors hover:bg-bg-subtle hover:text-fg"
      >
        主题
      </Link>
      {trail.map((step, i) => (
        <span key={i} className="contents">
          <ChevronRight className="size-3" />
          {step.to ? (
            <Link
              to={step.to}
              className="rounded px-1.5 py-0.5 transition-colors hover:bg-bg-subtle hover:text-fg"
            >
              {step.label}
            </Link>
          ) : (
            <span className="rounded px-1.5 py-0.5">{step.label}</span>
          )}
        </span>
      ))}
      <ChevronRight className="size-3" />
      <span className="line-clamp-1 rounded bg-bg-subtle px-1.5 py-0.5 font-medium text-fg">
        {post.title}
      </span>
    </nav>
  );
}
