import { Link, useParams } from 'react-router';
import { getAllTags, getPostsByTag } from '@/lib/content';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Tag as TagIcon } from 'lucide-react';
import { useTranslation } from '@/i18n';

export function TagsIndex() {
  const tags = getAllTags();
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <TagIcon className="size-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-fg">{t('tags.title')}</h1>
        </div>
        <p className="text-fg-muted">{t('tags.subtitle')} · {tags.length} total</p>
      </header>
      {tags.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-fg-muted">
            {t('tags.empty')}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <div
              key={tag.name}
              className="animate-in fade-in"
              style={{ animationDelay: `${idx * 15}ms` }}
            >
              <Link
                to={`/tags/${encodeURIComponent(tag.name)}`}
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-3.5 py-1.5 text-sm transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-soft"
              >
                <span className="font-medium text-fg group-hover:text-primary">
                  {tag.name}
                </span>
                <span className="rounded-full bg-bg-subtle px-2 py-0.5 text-xs text-fg-muted group-hover:bg-primary/10 group-hover:text-primary">
                  {tag.count}
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
  const { t } = useTranslation();
  if (posts.length === 0) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/tags">
            <ArrowLeft className="mr-1 size-3.5" />
            {t('tags.title')}
          </Link>
        </Button>
        <p className="text-fg-muted">No posts tagged {decoded}.</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/tags">
          <ArrowLeft className="mr-1 size-3.5" />
          {t('tags.title')}
        </Link>
      </Button>
      <header className="space-y-1.5">
        <h1 className="inline-flex items-center gap-2 text-3xl font-bold tracking-tight text-fg">
          <TagIcon className="size-6 text-primary" />
          {decoded}
        </h1>
        <p className="text-fg-muted">{t('tags.countMany', { count: posts.length })}</p>
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
              {new Date(p.date).toLocaleDateString(
                t('lang.zh') === '中文' ? 'zh-CN' : 'en-US',
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}