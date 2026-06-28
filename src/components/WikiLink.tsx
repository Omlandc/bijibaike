import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import { getPostBySlug } from '@/lib/content';

interface WikiLinkProps {
  target: string;
  slug: string;
  heading?: string | null;
  alias?: string | null;
  embed?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Internal link rendered for [[Wiki Link]] and ![[...]] embed references.
 * Resolves to /blog/:slug or /blog/:slug#heading when the target exists
 * in the content index; otherwise renders as a "broken" link styled
 * with a dashed underline (matching Obsidian's behavior).
 */
export function WikiLink({
  target,
  slug,
  heading,
  alias,
  embed,
  className,
  children,
}: WikiLinkProps) {
  const exists = Boolean(getPostBySlug(slug));
  const href = `/blog/${slug}${heading ? `#${heading.toLowerCase().replace(/\s+/g, '-')}` : ''}`;
  const label = children ?? alias ?? target;
  if (!exists) {
    return (
      <span
        className={cn(
          'wiki-link wiki-link--broken',
          'text-muted-foreground italic underline decoration-dashed underline-offset-4',
          className,
        )}
        title={`No note found: ${slug}`}
      >
        {label}
      </span>
    );
  }
  if (embed) {
    return (
      <Link
        to={href}
        className={cn(
          'wiki-link wiki-link--embed',
          'inline-flex items-center rounded border bg-muted/40 px-2 py-0.5 text-xs font-medium hover:bg-muted',
          className,
        )}
      >
        {label}
      </Link>
    );
  }
  return (
    <Link
      to={href}
      className={cn(
        'wiki-link',
        'text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary',
        className,
      )}
    >
      {label}
    </Link>
  );
}
