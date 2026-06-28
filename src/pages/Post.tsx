import { useParams, Link, Navigate } from 'react-router';
import { getPostBySlug, getBacklinks, getAllPosts } from '@/lib/content';
import { MarkdownView } from '@/components/MarkdownView';
import { ReadingProgress } from '@/components/ReadingProgress';
import { TableOfContents } from '@/components/TableOfContents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  CalendarDays,
  ArrowLeft,
  Link2,
  Clock,
  Tag as TagIcon,
} from 'lucide-react';

export default function Post() {
  // With the splat route `/blog/*`, the full slug is in the `*` key.
  // It may span multiple path segments (e.g. "中医/黄帝内经素问遗篇-1").
  const { '*': slugSplat } = useParams<{ '*': string }>();
  const slug = slugSplat ? decodeURIComponent(slugSplat) : null;
  const post = slug ? getPostBySlug(slug) : undefined;
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
      <div className="mx-auto flex max-w-6xl gap-8">
        <article className="mx-auto w-full max-w-3xl flex-1 space-y-8">
          <header className="space-y-4">
        <div className="flex items-center justify-between text-sm text-fg-muted">
          <Button asChild variant="ghost" size="sm">
            <Link to="/blog">
              <ArrowLeft className="mr-1 size-3.5" />
              返回列表
            </Link>
          </Button>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {new Date(post.date).toLocaleDateString('zh-CN', {
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
            {readingMinutes} 分钟
          </span>
          {post.tags.length > 0 ? (
            <span className="inline-flex items-center gap-1">
              <TagIcon className="size-3" />
              {post.tags.length} 个标签
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

      <Separator />

      {backlinks.length > 0 ? (
        <section className="space-y-3">
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-fg">
            <Link2 className="size-4 text-primary" />
            引用了这篇文章 ({backlinks.length})
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
            <div className="text-xs text-fg-muted">← 上一篇</div>
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
            <div className="text-xs text-fg-muted">下一篇 →</div>
            <div className="line-clamp-1 font-medium text-fg group-hover:text-primary">
              {next.title}
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </nav>
        </article>
        <TableOfContents scope="[data-md-root]" />
      </div>
    </>
  );
}
