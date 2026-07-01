import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router';
import {
  ArrowUp,
  Link2,
  Check,
  Type,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostToolbarProps {
  prev?: { slug: string; title: string } | null;
  next?: { slug: string; title: string } | null;
}

const FS_KEY = 'post-font-step';
const FS_STEPS = ['15px', '16px', '18px']; // index 0/1/2
const FS_DEFAULT = 1;

/** Set --post-fs on :root so the .prose body picks it up. */
function applyFontSize(step: number) {
  const idx = Math.max(0, Math.min(FS_STEPS.length - 1, step));
  const value = FS_STEPS[idx]!;
  document.documentElement.style.setProperty('--post-fs', value);
}

export function PostToolbar({ prev, next }: PostToolbarProps) {
  const [show, setShow] = useState(false);
  const [fsStep, setFsStep] = useState<number>(FS_DEFAULT);
  const [copied, setCopied] = useState(false);

  // Restore font size from localStorage on mount.
  useEffect(() => {
    let saved: number | null = null;
    try {
      const raw = localStorage.getItem(FS_KEY);
      if (raw != null) saved = parseInt(raw, 10);
    } catch { /* ignore */ }
    if (saved != null && !Number.isNaN(saved) && saved >= 0 && saved < FS_STEPS.length) {
      setFsStep(saved);
      applyFontSize(saved);
    } else {
      applyFontSize(FS_DEFAULT);
    }
  }, []);

  // Show after scrolling 300px; also drives a "near top" flag for
  // some future use.
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const setFont = useCallback((step: number) => {
    const idx = Math.max(0, Math.min(FS_STEPS.length - 1, step));
    setFsStep(idx);
    try {
      localStorage.setItem(FS_KEY, String(idx));
    } catch { /* ignore */ }
    applyFontSize(idx);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for very old browsers: select-and-copy via a hidden input
      const ta = document.createElement('textarea');
      ta.value = window.location.href;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, []);

  if (!show) return null;

  return (
    <div
      data-find-ui
      className={cn(
        // Hidden on small screens (mobile); the table-of-contents drawer
        // already gives readers tools on mobile.
        'pointer-events-none fixed bottom-6 right-6 z-40 hidden flex-col items-end gap-2 md:flex',
      )}
    >
      <div className="pointer-events-auto flex flex-col items-end gap-2 rounded-xl border border-border bg-bg-elevated/90 p-1.5 shadow-elevated backdrop-blur">
        {/* Prev / next */}
        {prev ? (
          <Link
            to={`/blog/${encodeURIComponent(prev.slug)}`}
            className="group inline-flex h-9 w-9 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg"
            title={`上一篇: ${prev.title}`}
            aria-label="上一篇"
          >
            <ChevronUp className="size-4" />
          </Link>
        ) : null}

        {/* Font size stepper */}
        <div className="flex flex-col items-center gap-0.5 rounded-md border border-border bg-bg/40 p-0.5">
          <button
            type="button"
            onClick={() => setFont(fsStep + 1)}
            disabled={fsStep >= FS_STEPS.length - 1}
            className="inline-flex h-6 w-7 items-center justify-center rounded text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg disabled:opacity-30"
            title="字号 +"
            aria-label="放大字号"
          >
            <Type className="size-3" />
            <span className="ml-0.5 text-[10px] font-bold">+</span>
          </button>
          <span className="text-[9px] tabular-nums text-fg-subtle" aria-live="polite">
            {FS_STEPS[fsStep]}
          </span>
          <button
            type="button"
            onClick={() => setFont(fsStep - 1)}
            disabled={fsStep <= 0}
            className="inline-flex h-6 w-7 items-center justify-center rounded text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg disabled:opacity-30"
            title="字号 -"
            aria-label="缩小字号"
          >
            <Type className="size-3.5" />
            <span className="ml-0.5 text-[10px] font-bold">-</span>
          </button>
        </div>

        {/* Copy link */}
        <button
          type="button"
          onClick={copyLink}
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg',
            copied && 'text-primary',
          )}
          title={copied ? '已复制' : '复制当前文章链接'}
          aria-label="复制链接"
        >
          {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
        </button>

        {/* Next */}
        {next ? (
          <Link
            to={`/blog/${encodeURIComponent(next.slug)}`}
            className="group inline-flex h-9 w-9 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg"
            title={`下一篇: ${next.title}`}
            aria-label="下一篇"
          >
            <ChevronDown className="size-4" />
          </Link>
        ) : null}

        {/* Back to top */}
        <div className="my-0.5 h-px w-6 bg-border" />
        <button
          type="button"
          onClick={scrollToTop}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors hover:bg-primary/20"
          title="回到顶部"
          aria-label="回到顶部"
        >
          <ArrowUp className="size-4" />
        </button>
      </div>

      {copied ? (
        <div className="pointer-events-none rounded-md border border-border bg-bg-elevated px-2 py-1 text-xs text-fg shadow-elevated">
          已复制到剪贴板
        </div>
      ) : null}
    </div>
  );
}
