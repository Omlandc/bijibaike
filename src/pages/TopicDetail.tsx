import { useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router';
import { ArrowLeft, FolderTree, BookOpen, Clock, ChevronRight, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  getPillarBySlug,
  getClusterBySlug,
  getPostsByPillar,
  type Post,
} from '@/lib/content';

export default function TopicDetail() {
  const { slug } = useParams<{ slug: string }>();
  const pillar = slug ? getPillarBySlug(slug) : undefined;

  const allPosts = useMemo(() => (pillar ? getPostsByPillar(pillar.slug) : []), [pillar]);

  if (!slug) return <Navigate to="/topics" replace />;
  if (!pillar) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-fg">主题不存在</h1>
        <p className="mt-2 text-fg-muted">找不到 slug 为 "{decodeURIComponent(slug)}" 的主题</p>
        <Button className="mt-4" asChild>
          <Link to="/topics">浏览全部主题</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
          <Link to="/topics">
            <ArrowLeft className="mr-1 size-3.5" />
            全部主题
          </Link>
        </Button>

        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-fg-muted">
            <Badge variant="secondary" className="rounded-full">
              <Layers className="mr-1 size-3" /> Pillar
            </Badge>
            {pillar.clusters.length > 0 ? (
              <span>
                {pillar.clusters.length} 个 Cluster · {pillar.postCount} 篇文章
              </span>
            ) : (
              <span>{pillar.postCount} 篇文章</span>
            )}
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-fg md:text-4xl">
            {pillar.name}
          </h1>
          {pillar.description ? (
            <p className="text-balance text-lg text-fg-muted">{pillar.description}</p>
          ) : null}
        </header>
      </div>

      {pillar.clusters.length > 0 ? (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-fg">子主题(Cluster)</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {pillar.clusters.map((cluster) => (
              <Link
                key={cluster.slug}
                to={`/topics/${encodeURIComponent(pillar.slug)}/${encodeURIComponent(cluster.slug)}`}
                className="group block"
              >
                <Card className="h-full transition-all hover:border-primary/40 hover:shadow-elevated">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs text-fg-subtle">
                          <FolderTree className="size-3" />
                          {cluster.slug}
                        </div>
                        <h3 className="mt-1 text-base font-medium text-fg transition-colors group-hover:text-primary">
                          {cluster.name}
                        </h3>
                        {cluster.description ? (
                          <p className="mt-1 line-clamp-2 text-xs text-fg-muted">
                            {cluster.description}
                          </p>
                        ) : null}
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-fg-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                    <div className="mt-3 text-xs text-fg-subtle">
                      {cluster.posts.length} 篇文章
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-fg">
          <BookOpen className="size-5" />
          {pillar.name}下的文章({allPosts.length})
        </h2>
        {allPosts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-fg-muted">
              该主题下还没有文章
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {allPosts.map((p, idx) => (
              <PostListItem key={p.slug} post={p} idx={idx} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function ClusterDetail() {
  // The route is `/topics/:slug/*` — `:slug` is the pillar, the
  // splat captures the cluster path (e.g. "其他/子文件夹").
  const { slug, '*': clusterPath } = useParams<{ slug: string; '*': string }>();
  if (!slug || !clusterPath) return <Navigate to="/topics" replace />;
  const clusterPathDecoded = decodeURIComponent(clusterPath);
  const cluster = getClusterBySlug(slug, clusterPathDecoded);
  if (!cluster) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-fg">子主题不存在</h1>
        <p className="mt-2 text-fg-muted">找不到 slug 为 "{decodeURIComponent(slug)}" 的子主题</p>
        <Button className="mt-4" asChild>
          <Link to="/topics">浏览全部主题</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-10">
      <div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 mb-4"
        >
          <Link to={`/topics/${encodeURIComponent(cluster.pillarSlug)}`}>
            <ArrowLeft className="mr-1 size-3.5" />
            返回 {cluster.pillarSlug}
          </Link>
        </Button>

        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-fg-muted">
            <Badge variant="secondary" className="rounded-full">
              <Layers className="mr-1 size-3" /> Pillar
            </Badge>
            <ChevronRight className="size-3" />
            <Badge variant="secondary" className="rounded-full">
              Cluster
            </Badge>
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-fg md:text-4xl">
            {cluster.name}
          </h1>
          {cluster.description ? (
            <p className="text-balance text-base text-fg-muted">{cluster.description}</p>
          ) : null}
        </header>
      </div>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-fg">
          <BookOpen className="size-5" />
          文章({cluster.posts.length})
        </h2>
        <div className="space-y-2">
          {cluster.posts.map((p, idx) => (
            <PostListItem key={p.slug} post={p} idx={idx} />
          ))}
        </div>
      </section>
    </div>
  );
}

function PostListItem({ post, idx }: { post: Post; idx: number }) {
  const readingMinutes = Math.max(1, Math.round(post.raw.length / 600));
  const inCluster = post.sourcePath.split('/').filter(Boolean).length >= 3;
  return (
    <div
      className="animate-in fade-in"
      style={{ animationDelay: `${idx * 30}ms` }}
    >
      <Link to={`/blog/${encodeURIComponent(post.slug)}`}>
        <Card className="transition-all hover:border-primary/40 hover:shadow-elevated">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {post.cover ? (
                <div className="hidden h-16 w-24 shrink-0 overflow-hidden rounded-md sm:block">
                  <img
                    src={post.cover}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-base font-semibold text-fg hover:text-primary">
                  {post.title}
                </h3>
                {post.excerpt ? (
                  <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{post.excerpt}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-fg-muted">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {readingMinutes} 分钟
                  </span>
                  <span>{new Date(post.date).toLocaleDateString('zh-CN')}</span>
                  {inCluster ? (
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {post.sourcePath.split('/').slice(1, -1).join('/')}
                    </Badge>
                  ) : null}
                  {post.tags.slice(0, 3).map((t) => (
                    <Badge key={t} variant="secondary" className="rounded-full text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
