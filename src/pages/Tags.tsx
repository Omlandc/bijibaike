import { Link, useParams } from 'react-router';
import { getAllTags, getPostsByTag } from '@/lib/content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TagsIndex() {
  const tags = getAllTags();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-fg">标签</h1>
        <p className="text-fg-muted">共 {tags.length} 个标签</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {tags.map((t) => (
          <Link key={t.name} to={`/tags/${encodeURIComponent(t.name)}`}>
            <Card className="transition-colors hover:border-primary/40">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="inline-flex items-center gap-1">
                    <Hash className="size-3.5 text-primary" />
                    {t.name}
                  </span>
                  <Badge variant="secondary">{t.count}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-fg-muted">
                {t.count} 篇文章
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function TagDetail() {
  const { tag = '' } = useParams<{ tag: string }>();
  const decoded = decodeURIComponent(tag);
  const posts = getPostsByTag(decoded);
  if (posts.length === 0) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/tags">
            <ArrowLeft className="mr-1 size-3.5" />
            所有标签
          </Link>
        </Button>
        <p className="text-fg-muted">没有标签为 #{decoded} 的文章。</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/tags">
          <ArrowLeft className="mr-1 size-3.5" />
          所有标签
        </Link>
      </Button>
      <header>
        <h1 className="inline-flex items-center gap-2 text-3xl font-bold tracking-tight text-fg">
          <Hash className="size-6 text-primary" />
          {decoded}
        </h1>
        <p className="text-fg-muted">共 {posts.length} 篇</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {posts.map((p) => (
          <Link
            key={p.slug}
            to={`/blog/${p.slug}`}
            className="rounded-2xl border border-border bg-bg-elevated p-4 transition-colors hover:border-primary/40"
          >
            <h2 className="font-semibold text-fg">{p.title}</h2>
            <p className="mt-1 line-clamp-2 text-sm text-fg-muted">
              {p.excerpt}
            </p>
            <div className="mt-2 text-xs text-fg-subtle">
              {new Date(p.date).toLocaleDateString('zh-CN')}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
