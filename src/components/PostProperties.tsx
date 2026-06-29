/**
 * PostProperties — a structured panel showing a post's frontmatter,
 * similar to Obsidian's "Properties" view.
 *
 * Renders known fields (created / updated / tags / contentTheme /
 * cover / pinned / draft) with appropriate icons and types, then
 * falls back to a "Custom properties" grid for any other frontmatter
 * keys the author added.
 *
 * Designed to be visually quiet (collapsible) but informative —
 * one screen-glance should answer "when was this written, who
 * touched it last, what tags does it carry, what theme does it
 * suggest, and is there anything weird in the metadata?".
 */
import { Link } from 'react-router';
import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  CalendarClock,
  Tag as TagIcon,
  Palette,
  Image as ImageIcon,
  Pin,
  EyeOff,
  Hash,
  FileCode,
  History,
  Pencil,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Post } from '@/lib/content';
import type { ContentTheme } from '@/lib/content-themes';
import { useTranslation } from '@/i18n';

interface PostPropertiesProps {
  post: Post;
  themes: ContentTheme[];
}

interface CustomProp {
  key: string;
  value: unknown;
}

const KNOWN_KEYS = new Set([
  'title',
  'date',
  'created',
  'updated',
  'modified',
  'tags',
  'author',
  'description',
  'cover',
  'draft',
  'pinned',
  'contentTheme',
]);

function formatDateTime(iso: string): string {
  if (!iso || iso === new Date(0).toISOString()) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.valueOf())) return '—';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function relativeTime(iso: string): string {
  if (!iso || iso === new Date(0).toISOString()) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.valueOf())) return '';
  const diff = Date.now() - d.getTime();
  const min = 60_000;
  const hr = 60 * min;
  const day = 24 * hr;
  if (diff < min) return 'just now';
  if (diff < hr) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hr)}h ago`;
  if (diff < 30 * day) return `${Math.floor(diff / day)}d ago`;
  return d.toLocaleDateString();
}

function renderValue(v: unknown): React.ReactNode {
  if (v === null || v === undefined) return <span className="text-fg-subtle">—</span>;
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (Array.isArray(v)) return v.map(String).join(', ');
  if (typeof v === 'object') return <code className="text-xs">{JSON.stringify(v)}</code>;
  if (typeof v === 'string' && /^https?:\/\//.test(v)) {
    return (
      <a
        href={v}
        target="_blank"
        rel="noreferrer"
        className="break-all text-primary hover:underline"
      >
        {v}
      </a>
    );
  }
  return String(v);
}

export function PostProperties({ post, themes }: PostPropertiesProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const fm = post.frontmatter ?? {};
  const customProps: CustomProp[] = Object.entries(fm)
    .filter(([k, v]) => !KNOWN_KEYS.has(k) && v !== undefined && v !== null && v !== '')
    .map(([key, value]) => ({ key, value }));

  const theme = typeof fm.contentTheme === 'string' ? fm.contentTheme : null;
  const themeObj = theme ? themes.find((th) => th.slug === theme) : null;
  const hasTags = post.tags.length > 0;
  const isPinned = fm.pinned === true;
  const isDraft = fm.draft === true;
  const hasCover = !!post.cover;
  const hasAuthor = typeof fm.author === 'string' && fm.author.trim() !== '';

  return (
    <Card
      data-md-ignore
      className="border-dashed bg-bg-elevated/50 text-sm"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-fg-muted hover:text-fg"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2 font-medium">
          <FileCode className="size-3.5 text-primary" />
          {t('properties.title')}
        </span>
        <span className="flex items-center gap-3 text-xs text-fg-subtle">
          {isPinned ? (
            <span className="inline-flex items-center gap-1" title={t('properties.pinned')}>
              <Pin className="size-3" /> {t('properties.pinned')}
            </span>
          ) : null}
          {isDraft ? (
            <span className="inline-flex items-center gap-1" title={t('properties.draft')}>
              <EyeOff className="size-3" /> {t('properties.draft')}
            </span>
          ) : null}
          {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        </span>
      </button>
      {open ? (
        <CardContent className="space-y-3 border-t border-border/50 px-4 py-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Prop
              icon={<Calendar className="size-3.5" />}
              label={t('properties.created')}
              value={formatDateTime(post.createdAt)}
              hint={relativeTime(post.createdAt)}
            />
            <Prop
              icon={<History className="size-3.5" />}
              label={t('properties.updated')}
              value={formatDateTime(post.updatedAt)}
              hint={relativeTime(post.updatedAt)}
            />
            {hasAuthor ? (
              <Prop
                icon={<Pencil className="size-3.5" />}
                label={t('properties.author')}
                value={String(fm.author)}
              />
            ) : null}
            {hasCover ? (
              <Prop
                icon={<ImageIcon className="size-3.5" />}
                label={t('properties.cover')}
                value={
                  <span className="truncate font-mono text-xs">{post.cover}</span>
                }
              />
            ) : null}
            {themeObj ? (
              <Prop
                icon={<Palette className="size-3.5" />}
                label={t('properties.theme')}
                value={
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="inline-block size-3 rounded-full border border-current/20"
                      style={{
                        background: themeObj.preview.bg,
                        borderColor: themeObj.preview.accent,
                      }}
                    />
                    {themeObj.name}
                    <span className="font-mono text-[10px] text-fg-subtle">
                      {themeObj.slug}
                    </span>
                  </span>
                }
                hint={t('properties.themeHint')}
              />
            ) : null}
            {hasTags ? (
              <div className="col-span-1 sm:col-span-2">
                <div className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted">
                  <TagIcon className="size-3.5" />
                  {t('properties.tags')}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/tags/${encodeURIComponent(tag)}`}
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary transition-colors hover:bg-primary/20"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {customProps.length > 0 ? (
            <div className="space-y-1.5 border-t border-border/40 pt-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted">
                <Hash className="size-3.5" />
                {t('properties.custom')}
              </div>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2">
                {customProps.map((p) => (
                  <div key={p.key} className="flex items-baseline gap-2">
                    <dt className="font-mono text-fg-muted">{p.key}</dt>
                    <dd className="min-w-0 flex-1 truncate text-fg">
                      {renderValue(p.value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-2 text-[11px] text-fg-subtle">
            <span className="inline-flex items-center gap-1 font-mono">
              <CalendarClock className="size-3" />
              {post.sourcePath}
            </span>
            <span>{post.slug}</span>
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}

function Prop({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted">
        {icon}
        {label}
      </div>
      <div className="text-sm text-fg">{value}</div>
      {hint ? <div className="mt-0.5 text-[11px] text-fg-subtle">{hint}</div> : null}
    </div>
  );
}
