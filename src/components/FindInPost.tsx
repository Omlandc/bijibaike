import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FindInPostProps {
  /** Element to walk (the rendered article root). */
  articleRef: React.RefObject<HTMLElement | null>;
  /** Raw post text — used to compute match positions, line numbers,
   *  and snippet previews. */
  sourceText: string;
}

interface Match {
  /** Sequential 0-based index used for prev/next + data-find-idx. */
  idx: number;
  /** Absolute char offset in sourceText. */
  offset: number;
  /** 1-based line number. */
  line: number;
  /** A short context snippet for the side list. */
  snippet: string;
}

const PANEL_KEY = 'find-in-post-open';

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Walk text nodes inside `root` and wrap every match of `query` in a
 * <mark data-find-idx="N"> element. Skips <code>/<pre> blocks to avoid
 * mangling code samples. Returns total number of marks created and
 * removes any previous marks left from a prior query.
 *
 * Note: this only matches within a single text node — if a query spans
 * across formatting boundaries (e.g. `<strong>bold</strong>`), only
 * the portion inside one node is wrapped. Acceptable trade-off for v1.
 */
function highlightInDom(
  root: HTMLElement,
  query: string,
): { count: number } {
  // 1) Remove old marks we created (anything with data-find-idx).
  const oldMarks = root.querySelectorAll('mark[data-find-idx]');
  oldMarks.forEach((m) => {
    const parent = m.parentNode!;
    while (m.firstChild) parent.insertBefore(m.firstChild, m);
    parent.removeChild(m);
  });
  // Also re-merge adjacent text nodes that split pre-existing marks.
  root.normalize();

  if (!query) return { count: 0 };

  const re = new RegExp(escapeRegExp(query), 'gi');
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      const el = n.parentElement;
      if (!el) return NodeFilter.FILTER_REJECT;
      // Skip <code>/<pre> so we don't fight syntax highlight or clobber
      // inline code that the user explicitly marked as code.
      if (el.closest('pre, code')) return NodeFilter.FILTER_REJECT;
      // Skip our own UI (defensive).
      if (el.closest('[data-find-ui]')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const targets: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) targets.push(n as Text);

  let count = 0;
  for (const tn of targets) {
    const text = tn.textContent ?? '';
    re.lastIndex = 0;
    if (!re.test(text)) continue;
    re.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) {
        frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      }
      const mark = document.createElement('mark');
      mark.setAttribute('data-find-idx', String(count));
      mark.className =
        'rounded-sm bg-primary/25 px-0.5 text-fg ring-1 ring-primary/40';
      mark.textContent = m[0];
      frag.appendChild(mark);
      last = m.index + m[0].length;
      count++;
      if (m[0].length === 0) re.lastIndex++; // safety
    }
    if (last < text.length) {
      frag.appendChild(document.createTextNode(text.slice(last)));
    }
    tn.parentNode?.replaceChild(frag, tn);
  }
  return { count };
}

function makeSnippet(text: string, offset: number, len: number, radius = 30): string {
  const start = Math.max(0, offset - radius);
  const end = Math.min(text.length, offset + len + radius);
  const head = start > 0 ? '…' : '';
  const tail = end < text.length ? '…' : '';
  // Collapse newlines so the snippet fits one line.
  const middle = text
    .slice(start, end)
    .replace(/\s+/g, ' ')
    .trim();
  return head + middle + tail;
}

export function FindInPost({ articleRef, sourceText }: FindInPostProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  // Open state: derive from URL ?q presence so deep-links auto-open.
  const urlQ = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(urlQ);
  const [activeIdx, setActiveIdx] = useState(0);
  const [marks, setMarks] = useState(0);
  // Persist "user has opened the panel this session" in localStorage so
  // they can close the panel without auto-reopening on each keystroke.
  const [userDismissed, setUserDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(PANEL_KEY) === 'closed';
    } catch {
      return false;
    }
  });

  // Build the match list (offset, line, snippet) from sourceText. The
  // DOM is the truth for what's visible, but sourceText gives us line
  // numbers + a stable offset for scrolling the active mark into view.
  const matches: Match[] = useMemo(() => {
    if (!query.trim()) return [];
    const re = new RegExp(escapeRegExp(query), 'gi');
    const out: Match[] = [];
    let m: RegExpExecArray | null;
    let i = 0;
    while ((m = re.exec(sourceText)) !== null) {
      const offset = m.index;
      const before = sourceText.slice(0, offset);
      const line = before.split('\n').length;
      out.push({
        idx: i,
        offset,
        line,
        snippet: makeSnippet(sourceText, offset, m[0].length),
      });
      i++;
      if (m[0].length === 0) re.lastIndex++;
    }
    return out;
  }, [query, sourceText]);

  // Highlight DOM after each render where matches might have changed.
  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;
    const { count } = highlightInDom(root, query);
    setMarks(count);
    setActiveIdx(0);
  }, [query, articleRef, matches.length]);

  // Whenever the active idx changes, scroll the corresponding mark
  // into view. Falls back silently if the mark is missing.
  useEffect(() => {
    if (marks === 0) return;
    const el = articleRef.current?.querySelector(
      `mark[data-find-idx="${activeIdx}"]`,
    );
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('find-active');
    const t = setTimeout(() => el.classList.remove('find-active'), 900);
    return () => clearTimeout(t);
  }, [activeIdx, marks, articleRef]);

  // When user types in the input, push to URL so the link is shareable.
  useEffect(() => {
    if (query === urlQ) return;
    const next = new URLSearchParams(searchParams);
    if (query) next.set('q', query);
    else next.delete('q');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const open = (query.length > 0 && !userDismissed) || marks > 0;
  const close = useCallback(() => {
    setQuery('');
    setUserDismissed(true);
    try {
      sessionStorage.setItem(PANEL_KEY, 'closed');
    } catch {
      /* ignore */
    }
    const next = new URLSearchParams(searchParams);
    next.delete('q');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const goPrev = useCallback(() => {
    setActiveIdx((i) => (matches.length === 0 ? 0 : (i - 1 + matches.length) % matches.length));
  }, [matches.length]);
  const goNext = useCallback(() => {
    setActiveIdx((i) => (matches.length === 0 ? 0 : (i + 1) % matches.length));
  }, [matches.length]);

  // Keyboard: Cmd/Ctrl+F focuses the input; Esc closes (when input not
  // focused). We don't hijack the browser's native Cmd+F — only add
  // shortcuts when the panel is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        close();
      } else if (e.key === 'Enter' && document.activeElement?.tagName === 'INPUT') {
        e.preventDefault();
        if (e.shiftKey) goPrev();
        else goNext();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close, goPrev, goNext]);

  if (!open) return null;

  return (
    <div
      data-find-ui
      className="sticky top-2 z-30 mb-4 rounded-lg border border-border bg-bg-elevated/95 p-2 shadow-elevated backdrop-blur"
    >
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-fg-muted" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="在文章里搜索..."
            className="h-8 pl-8 pr-3 text-sm"
            aria-label="在文章里搜索"
          />
        </div>
        <span className="shrink-0 text-xs tabular-nums text-fg-muted">
          {marks === 0 ? (
            query ? <span className="text-fg-subtle">无匹配</span> : null
          ) : (
            <>
              <span className="text-fg">{activeIdx + 1}</span>
              <span className="text-fg-subtle"> / {marks}</span>
            </>
          )}
        </span>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={goPrev}
            disabled={marks === 0}
            title="上一个 (Shift+Enter)"
            aria-label="上一个匹配"
          >
            <ChevronUp className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={goNext}
            disabled={marks === 0}
            title="下一个 (Enter)"
            aria-label="下一个匹配"
          >
            <ChevronDown className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={close}
            title="关闭 (Esc)"
            aria-label="关闭"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      {matches.length > 0 ? (
        <ul
          className={cn(
            'mt-2 max-h-40 space-y-0.5 overflow-y-auto rounded-md border border-border bg-bg p-1 text-xs',
          )}
        >
          {matches.slice(0, 50).map((m) => (
            <li key={m.idx}>
              <button
                type="button"
                onClick={() => setActiveIdx(m.idx)}
                className={cn(
                  'flex w-full items-baseline gap-2 rounded px-2 py-1 text-left transition-colors',
                  activeIdx === m.idx
                    ? 'bg-primary/15 text-fg'
                    : 'text-fg-muted hover:bg-bg-subtle hover:text-fg',
                )}
              >
                <span className="shrink-0 tabular-nums text-fg-subtle">L{m.line}</span>
                <span className="line-clamp-1 flex-1">
                  {highlightSnippet(m.snippet, query)}
                </span>
              </button>
            </li>
          ))}
          {matches.length > 50 ? (
            <li className="px-2 py-1 text-fg-subtle">… 还有 {matches.length - 50} 处</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

function highlightSnippet(snippet: string, query: string) {
  if (!query) return snippet;
  const re = new RegExp(escapeRegExp(query), 'gi');
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(snippet)) !== null) {
    if (m.index > last) parts.push(snippet.slice(last, m.index));
    parts.push(
      <mark
        key={i++}
        className="rounded-sm bg-primary/25 px-0.5 text-fg"
      >
        {m[0]}
      </mark>,
    );
    last = m.index + m[0].length;
    if (m[0].length === 0) re.lastIndex++;
  }
  if (last < snippet.length) parts.push(snippet.slice(last));
  return parts;
}
