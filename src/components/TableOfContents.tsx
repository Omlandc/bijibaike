/**
 * TableOfContents —— 文章目录（基于 h1/h2/h3，scroll spy）
 *
 * 抓取容器内已渲染的 h1/h2/h3 元素，监听 scroll 高亮当前可见项。
 * - 桌面端：右侧 sticky 侧栏
 * - 移动端：顶部折叠抽屉
 */
import { useEffect, useMemo, useState } from 'react';
import { BookText } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TocItem {
  /** DOM id */
  id: string;
  /** 显示文本 */
  text: string;
  /** 层级（1-3） */
  level: 1 | 2 | 3;
}

export interface TableOfContentsProps {
  /** 抓取标题的容器选择器（默认 'article'） */
  scope?: string;
  /** 是否移动端折叠 */
  collapsibleOnMobile?: boolean;
  /** 顶部偏移 (px)，与 sticky 头部高度对齐 */
  scrollOffset?: number;
  className?: string;
}

function slugify(text: string, seen: Map<string, number>): string {
  // CJK-friendly slug: keep Chinese chars + ASCII alphanumerics, collapse spaces
  const base = text
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{Letter}\p{Number}-]+/gu, '');
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

export function TableOfContents({
  scope = 'article',
  collapsibleOnMobile = true,
  scrollOffset = 80,
  className,
}: TableOfContentsProps): React.ReactElement | null {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Extract headings after the article DOM is in place
  useEffect(() => {
    // wait one frame for rehype-slug to apply ids
    const id = window.requestAnimationFrame(() => {
      const root = document.querySelector(scope);
      if (!root) {
        setItems([]);
        return;
      }
      const headings = Array.from(
        root.querySelectorAll<HTMLElement>('h1, h2, h3'),
      );
      const seen = new Map<string, number>();
      const list: TocItem[] = headings.map((el) => {
        // rehype-slug already gave us an id; if missing, synthesize one
        let idStr = el.id;
        if (!idStr) {
          idStr = slugify(el.textContent ?? '', seen);
          el.id = idStr;
        } else {
          // Register the existing id so future slugs won't collide
          seen.set(idStr, (seen.get(idStr) ?? 0) + 1);
        }
        const tag = el.tagName.toLowerCase();
        const level = tag === 'h1' ? 1 : tag === 'h2' ? 2 : 3;
        return { id: idStr, text: el.textContent ?? '', level: level as 1 | 2 | 3 };
      });
      setItems(list);
      if (list.length > 0 && list[0]) setActiveId(list[0].id);
    });
    return () => cancelAnimationFrame(id);
  }, [scope]);

  // Scroll-spy
  useEffect(() => {
    if (items.length === 0) return;
    const elements = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0 && visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: `-${scrollOffset + 10}px 0px -60% 0px`,
        threshold: [0, 1],
      },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items, scrollOffset]);

  const handleClick = useMemo(
    () => (id: string): void => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - scrollOffset;
      window.scrollTo({ top, behavior: 'smooth' });
      setActiveId(id);
      setMobileOpen(false);
    },
    [scrollOffset],
  );

  if (items.length === 0) return null;

  return (
    <>
      {/* Desktop: 右侧 sticky 栏 */}
      <nav
        aria-label="文章目录"
        className={cn(
          'hidden lg:block',
          'sticky top-20 max-h-[calc(100vh-6rem)] overflow-auto',
          'w-56 shrink-0 text-sm',
          className,
        )}
      >
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-fg-muted">
          <BookText className="size-3.5" />
          目录
        </div>
        <ul className="space-y-0.5 border-l border-border">
          {items.map((item) => {
            const active = item.id === activeId;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleClick(item.id)}
                  className={cn(
                    'block w-full truncate border-l-2 py-1 pr-2 text-left transition-colors',
                    item.level === 2 ? 'pl-5' : item.level === 3 ? 'pl-8' : 'pl-3',
                    active
                      ? '-ml-px border-primary font-medium text-primary'
                      : '-ml-px border-transparent text-fg-muted hover:text-fg',
                  )}
                  title={item.text}
                >
                  {item.text}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile: 顶部折叠抽屉 */}
      {collapsibleOnMobile ? (
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="mb-2 inline-flex items-center gap-1 rounded-md border border-border bg-bg-elevated px-3 py-1.5 text-xs text-fg-muted hover:text-fg"
            aria-expanded={mobileOpen}
          >
            <BookText className="size-3.5" />
            目录 ({items.length})
          </button>
          {mobileOpen ? (
            <ul className="mb-3 max-h-64 overflow-auto rounded-md border border-border bg-bg-elevated p-2 text-sm">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleClick(item.id)}
                    className={cn(
                      'block w-full truncate rounded px-2 py-1 text-left',
                      item.level === 2 ? 'pl-4' : item.level === 3 ? 'pl-6' : 'pl-2',
                      item.id === activeId
                        ? 'bg-primary/10 text-primary'
                        : 'text-fg-muted hover:bg-bg-subtle hover:text-fg',
                    )}
                  >
                    {item.text}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
