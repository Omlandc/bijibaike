/**
 * FilterBar — reusable filter + sort toolbar for /blog and similar
 * list pages.
 *
 * URL params (driven by useSearchParams):
 *   sort = newest | oldest | updated | most-linked | longest | title
 *   tag  = comma-separated tag list  (AND semantics)
 *   year = comma-separated year list  (OR semantics)
 *   theme = comma-separated theme list (OR semantics)
 *
 * Active filters are echoed back as removable chips so the reader
 * always knows what's filtering their view.
 */
import { useMemo } from 'react';
import {
  ArrowUpDown,
  Tag as TagIcon,
  Calendar,
  Palette,
  X,
  Pin,
  ChevronDown,
  ListFilter,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';

export type SortKey = 'newest' | 'oldest' | 'updated' | 'most-linked' | 'longest' | 'title';

interface FilterBarProps {
  /** Current sort key (controlled). */
  sort: SortKey;
  /** Active tag filters. */
  tags: string[];
  /** Active year filters. */
  years: string[];
  /** Active content-theme filters. */
  themes: string[];
  /** All tags with counts (for the picker). */
  allTags: { name: string; count: number }[];
  /** All years with counts (for the picker). */
  allYears: { year: string; count: number }[];
  /** All content themes with counts (for the picker). */
  allThemes: { name: string; count: number }[];
  /** Total visible / total. */
  visibleCount: number;
  totalCount: number;
  /** Show the "pinned first" toggle. */
  showPinned?: boolean;
  /** Whether to show only pinned posts. */
  pinnedOnly?: boolean;
  /** Setters. */
  onSortChange: (sort: SortKey) => void;
  onTagsChange: (tags: string[]) => void;
  onYearsChange: (years: string[]) => void;
  onThemesChange: (themes: string[]) => void;
  onPinnedOnlyChange?: (v: boolean) => void;
  onClearAll: () => void;
}

export function FilterBar({
  sort,
  tags,
  years,
  themes,
  allTags,
  allYears,
  allThemes,
  visibleCount,
  totalCount,
  showPinned = true,
  pinnedOnly = false,
  onSortChange,
  onTagsChange,
  onYearsChange,
  onThemesChange,
  onPinnedOnlyChange,
  onClearAll,
}: FilterBarProps) {
  const { t } = useTranslation();
  const hasActive = tags.length > 0 || years.length > 0 || themes.length > 0 || pinnedOnly;

  const totalOptions = useMemo(
    () => ({
      tags: allTags.length,
      years: allYears.length,
      themes: allThemes.length,
    }),
    [allTags, allYears, allThemes],
  );

  return (
    <div className="space-y-3 rounded-xl border border-border bg-bg-elevated/40 p-3 sm:p-4">
      {/* Top row: sort + clear */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-fg-muted">
          <ListFilter className="size-3.5" />
          <span>
            {visibleCount} / {totalCount} {t('filter.postsUnit')}
          </span>
          {hasActive ? (
            <button
              type="button"
              onClick={onClearAll}
              className="ml-2 inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-fg-muted hover:border-primary/50 hover:text-fg"
            >
              <X className="size-3" />
              {t('filter.clearAll')}
            </button>
          ) : null}
        </div>

        <SortDropdown sort={sort} onChange={onSortChange} />
      </div>

      {/* Filter groups — each is a chip with a dropdown trigger */}
      <div className="flex flex-wrap gap-2">
        {totalOptions.tags > 0 ? (
          <FilterChip
            label={t('filter.tagsLabel')}
            count={tags.length}
            icon={<TagIcon className="size-3.5" />}
            options={allTags.map((t) => ({ value: t.name, label: t.name, hint: String(t.count) }))}
            selected={tags}
            onChange={onTagsChange}
            placeholder={t('filter.tagPlaceholder')}
          />
        ) : null}
        {totalOptions.years > 0 ? (
          <FilterChip
            label={t('filter.yearLabel')}
            count={years.length}
            icon={<Calendar className="size-3.5" />}
            options={allYears.map((y) => ({ value: y.year, label: y.year, hint: String(y.count) }))}
            selected={years}
            onChange={onYearsChange}
            placeholder={t('filter.yearPlaceholder')}
          />
        ) : null}
        {totalOptions.themes > 0 ? (
          <FilterChip
            label={t('filter.themeLabel')}
            count={themes.length}
            icon={<Palette className="size-3.5" />}
            options={allThemes.map((th) => ({
              value: th.name,
              label: th.name === '(default)' ? t('filter.themeDefault') : th.name,
              hint: String(th.count),
            }))}
            selected={themes}
            onChange={onThemesChange}
            placeholder={t('filter.themePlaceholder')}
          />
        ) : null}
        {showPinned && onPinnedOnlyChange ? (
          <button
            type="button"
            onClick={() => onPinnedOnlyChange(!pinnedOnly)}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors',
              pinnedOnly
                ? 'border-primary bg-primary text-primary-fg'
                : 'border-border text-fg-muted hover:border-primary/40 hover:text-fg',
            )}
            aria-pressed={pinnedOnly}
            title={t('filter.pinnedOnlyHint')}
          >
            <Pin className="size-3.5" />
            {t('filter.pinnedOnly')}
          </button>
        ) : null}
      </div>

      {/* Active filter chips */}
      {hasActive ? (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/50 pt-2">
          <span className="text-[11px] text-fg-subtle">{t('filter.activeLabel')}</span>
          {tags.map((tag) => (
            <ActiveChip key={`tag-${tag}`} label={tag} onRemove={() => onTagsChange(tags.filter((x) => x !== tag))} />
          ))}
          {years.map((year) => (
            <ActiveChip key={`year-${year}`} label={year} onRemove={() => onYearsChange(years.filter((x) => x !== year))} />
          ))}
          {themes.map((theme) => (
            <ActiveChip
              key={`theme-${theme}`}
              label={theme === '(default)' ? t('filter.themeDefault') : theme}
              onRemove={() => onThemesChange(themes.filter((x) => x !== theme))}
            />
          ))}
          {pinnedOnly ? (
            <ActiveChip label={t('filter.pinnedOnly')} onRemove={() => onPinnedOnlyChange?.(false)} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SortDropdown({ sort, onChange }: { sort: SortKey; onChange: (s: SortKey) => void }) {
  const { t } = useTranslation();
  const options: Array<{ value: SortKey; label: string }> = [
    { value: 'newest', label: t('filter.sortNewest') },
    { value: 'oldest', label: t('filter.sortOldest') },
    { value: 'updated', label: t('filter.sortUpdated') },
    { value: 'most-linked', label: t('filter.sortMostLinked') },
    { value: 'longest', label: t('filter.sortLongest') },
    { value: 'title', label: t('filter.sortTitle') },
  ];
  const current = options.find((o) => o.value === sort) ?? options[0];
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="size-3.5 text-fg-muted" />
      <span className="text-xs text-fg-muted">{t('filter.sortLabel')}</span>
      <div className="relative">
        <select
          value={sort}
          onChange={(e) => onChange(e.target.value as SortKey)}
          className="h-7 appearance-none rounded-md border border-border bg-bg pl-2 pr-7 text-xs text-fg focus:border-primary focus:outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 size-3.5 -translate-y-1/2 text-fg-muted" />
      </div>
      <span className="hidden text-xs text-fg-muted sm:inline">· {current.label}</span>
    </div>
  );
}

function FilterChip({
  label,
  count,
  icon,
  options,
  selected,
  onChange,
  placeholder,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  options: Array<{ value: string; label: string; hint?: string }>;
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const isActive = selected.length > 0;
  return (
    <details className="group relative">
      <summary
        className={cn(
          'inline-flex cursor-pointer list-none items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors [&::-webkit-details-marker]:hidden',
          isActive
            ? 'border-primary bg-primary text-primary-fg'
            : 'border-border text-fg-muted hover:border-primary/40 hover:text-fg',
        )}
      >
        {icon}
        <span>{label}</span>
        {count > 0 ? (
          <Badge
            variant={isActive ? 'outline' : 'secondary'}
            className={cn(
              'ml-1 h-4 min-w-4 rounded-full px-1 text-[10px]',
              isActive && 'bg-primary-fg/20 text-primary-fg',
            )}
          >
            {count}
          </Badge>
        ) : null}
        <ChevronDown className="size-3 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute left-0 top-full z-30 mt-1 w-56 max-h-72 overflow-auto rounded-lg border border-border bg-bg p-1 shadow-lg">
        <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-fg-subtle">
          {placeholder}
        </div>
        {options.length === 0 ? (
          <div className="px-2 py-1 text-xs text-fg-muted">—</div>
        ) : (
          options.map((o) => {
            const checked = selected.includes(o.value);
            return (
              <label
                key={o.value}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs hover:bg-bg-subtle"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    onChange(
                      e.target.checked
                        ? [...selected, o.value]
                        : selected.filter((s) => s !== o.value),
                    );
                  }}
                  className="size-3.5 accent-primary"
                />
                <span className="flex-1 truncate text-fg">{o.label}</span>
                {o.hint ? (
                  <span className="text-fg-subtle">{o.hint}</span>
                ) : null}
              </label>
            );
          })
        )}
        {selected.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange([])}
            className="mt-1 w-full rounded px-2 py-1 text-left text-xs text-fg-muted hover:bg-bg-subtle hover:text-fg"
          >
            Clear
          </button>
        ) : null}
      </div>
    </details>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 hover:bg-primary/20"
        aria-label={`Remove ${label}`}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}