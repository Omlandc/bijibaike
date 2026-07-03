import { Link } from 'react-router';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Pin } from 'lucide-react';
import type { Post } from '@/lib/content';
import { cn } from '@/lib/utils';
import { PostCoverFallback } from '@/components/PostCoverFallback';

interface PostCardProps {
  post: Post;
  featured?: boolean;
  className?: string;
}

export function PostCard({ post, featured, className }: PostCardProps) {
  return (
    <Card
      className={cn(
        'group h-full overflow-hidden transition-all hover:border-primary/40 hover:shadow-md',
        featured && 'border-primary/30 bg-primary/5',
        className,
      )}
    >
      {post.cover ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <img
            src={post.cover}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <PostCoverFallback post={post} aspect="aspect-[16/9]" showTag={false} />
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-lg group-hover:text-primary">
            <Link to={`/blog/${encodeURIComponent(post.slug)}`} className="after:absolute after:inset-0">
              {post.frontmatter.pinned ? (
                <Pin className="mr-1 inline size-4 align-text-bottom text-primary" />
              ) : null}
              {post.title}
            </Link>
          </CardTitle>
        </div>
        {post.frontmatter.description ? (
          <CardDescription className="line-clamp-2">
            {String(post.frontmatter.description)}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {post.frontmatter.pinned ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            <Pin className="size-3" />
            <span>已置顶</span>
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="size-3.5" />
          {new Date(post.date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
        {post.tags.slice(0, 3).map((t) => (
          <Badge
            key={t}
            variant="secondary"
            className="rounded-full px-2 py-0 text-[10px] font-normal"
          >
            {t}
          </Badge>
        ))}
      </CardFooter>
    </Card>
  );
}
