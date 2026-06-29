import { useMemo } from 'react';
import { Link } from 'react-router';
import {
  History,
  ArrowLeft,
  Sparkles,
  Wrench,
  Wand2,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { siteConfig } from '@/config/site-config';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';
import type { ChangelogEntry } from '@/config/site-config.types';

const TYPE_ICON: Record<NonNullable<ChangelogEntry['type']>, typeof Sparkles> = {
  feature: Sparkles,
  fix: Wrench,
  improvement: Wand2,
  breaking: AlertTriangle,
};

const TYPE_I18N: Record<NonNullable<ChangelogEntry['type']>, string> = {
  feature: 'changelog.typeFeature',
  fix: 'changelog.typeFix',
  improvement: 'changelog.typeImprovement',
  breaking: 'changelog.typeBreaking',
};

const TYPE_STYLE: Record<NonNullable<ChangelogEntry['type']>, string> = {
  feature: 'border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300',
  fix: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300',
  improvement: 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300',
  breaking: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300',
};

function formatDate(d: string): string {
  // Accept "2026-06-29" or full ISO. Display YYYY-MM-DD as-is.
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return d;
  return `${m[1]}-${m[2]}-${m[3]}`;
}

export default function Changelog() {
  const { t } = useTranslation();

  const entries = useMemo(() => {
    // Sort newest first by `date`. Stable for entries with the same date —
    // config order is the tie-breaker.
    const list = [...(siteConfig.changelog?.entries ?? [])];
    list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return list;
  }, []);

  const latestDate = entries[0]?.date;

  return (
    <div className="space-y-8">
      {/* Header — same look as other content pages */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <History className="size-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-fg">{t('changelog.title')}</h1>
          </div>
          <p className="mt-1 text-fg-muted">{t('changelog.subtitle')}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link to="/">
            <ArrowLeft className="size-3.5" />
            {t('changelog.back')}
          </Link>
        </Button>
      </header>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-fg-muted">
            {t('changelog.empty')}
          </CardContent>
        </Card>
      ) : (
        <ol className="relative space-y-6 border-l-2 border-border/60 pl-6 sm:pl-8">
          {entries.map((entry, idx) => {
            const Icon = entry.type ? TYPE_ICON[entry.type] : Calendar;
            const typeClass = entry.type ? TYPE_STYLE[entry.type] : '';
            const typeLabel = entry.type
              ? t(TYPE_I18N[entry.type] as 'changelog.typeFeature')
              : null;
            const isLatest = entry.date === latestDate && idx === 0;
            return (
              <li key={`${entry.date}-${entry.version}-${idx}`} className="relative">
                {/* dot on the timeline */}
                <span
                  className={cn(
                    'absolute -left-[33px] sm:-left-[41px] top-1.5 grid size-4 place-items-center rounded-full border-2 border-bg',
                    isLatest
                      ? 'bg-primary text-primary-fg'
                      : 'bg-bg-elevated text-fg-muted',
                  )}
                  aria-hidden="true"
                >
                  <span className="size-1.5 rounded-full bg-current" />
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <time
                    dateTime={entry.date}
                    className="font-mono text-sm font-medium text-fg"
                  >
                    {formatDate(entry.date)}
                  </time>
                  {entry.version ? (
                    <Badge variant="secondary" className="rounded-full font-mono text-xs">
                      {entry.version}
                    </Badge>
                  ) : null}
                  {typeLabel ? (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
                        typeClass,
                      )}
                    >
                      <Icon className="size-3" />
                      {typeLabel}
                    </span>
                  ) : null}
                  {isLatest ? (
                    <Badge className="rounded-full bg-primary/15 text-primary">
                      {t('changelog.latest')}
                    </Badge>
                  ) : null}
                </div>

                <Card className="mt-3">
                  <CardContent className="space-y-2 p-4 sm:p-5">
                    <h3 className="text-base font-semibold text-fg">{entry.title}</h3>
                    {entry.description ? (
                      <p className="text-sm text-fg-muted">{entry.description}</p>
                    ) : null}
                    {entry.items && entry.items.length > 0 ? (
                      <ul className="ml-5 list-disc space-y-1 text-sm text-fg-muted marker:text-fg-subtle">
                        {entry.items.map((it, j) => (
                          <li key={j}>{it.text}</li>
                        ))}
                      </ul>
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
