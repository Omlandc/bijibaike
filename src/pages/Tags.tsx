import { Link, useParams } from 'react-router';
import { getAllTags, getPostsByTag } from '@/lib/content';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Tag as TagIcon } from 'lucide-react';

export function TagsIndex() {
  const tags = getAllTags();
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <TagIcon className="size-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-fg">标签</h1>
        </div>
        <p className="text-fg-muted">共 {tags.length} 个标签 · 按出现次数排序</p>
      </header>
      {tags.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-fg-muted">
            还没有任何标签。在文章里写 <code className="rounded bg-bg-subtle px-1 text-fg">#tag</code> 就会自动出现。
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((t, idx) => (
            <div
              key={t.name}
              className="animate-in fade-in"
              style={{ animationDelay: `${idx * 15}ms` }}
            >
              <Link
                to={`/tags/${encodeURIComponent(t.name)}`}
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-3.5 py-1.5 text-sm transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-soft"
              >
                <span className="font-medium text-fg group-hover:text-primary">
                  {t.name}
                </span>
                <span className="rounded-full bg-bg-subtle px-2 py-0.5 text-xs text-fg-muted group-hover:bg-primary/10 group-hover:text-primary">
                  {t.count}
                </span>
              </Link>
            </div>
          ))}
        </div>
      )}
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
        <p className="text-fg-muted">没有标签为 {decoded} 的文章。</p>
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
      <header className="space-y-1.5">
        <h1 className="inline-flex items-center gap-2 text-3xl font-bold tracking-tight text-fg">
          <TagIcon className="size-6 text-primary" />
          {decoded}
        </h1>
        <p className="text-fg-muted">共 {posts.length} 篇</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {posts.map((p) => (
          <Link
            key={p.slug}
            to={`/blog/${encodeURIComponent(p.slug)}`}
            className="rounded-2xl border border-border bg-bg-elevated p-4 transition-colors hover:border-primary/40"
          >
            <h2 className="font-semibold text-fg">{p.title}</h2>
            <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{p.excerpt}</p>
            <div className="mt-2 text-xs text-fg-subtle">
              {new Date(p.date).toLocaleDateString('zh-CN')}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}