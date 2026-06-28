/**
 * ReadingProgress —— 顶部阅读进度条
 *
 * 监听 window scroll，根据"已滚动距离 / 可滚动距离"计算百分比，
 * 用 requestAnimationFrame 平滑更新 transform，避免每帧 setState。
 * 颜色用主题 CSS 变量 (var(--color-primary))。
 */
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';

export interface ReadingProgressProps {
  /** 颜色变体：primary / accent */
  color?: 'primary' | 'accent';
  /** 高度 (px) */
  height?: number;
  className?: string;
}

export function ReadingProgress({
  color = 'primary',
  height = 3,
  className,
}: ReadingProgressProps): React.ReactElement {
  const fillRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    let rafId = 0;
    const update = (): void => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const pct = scrollHeight > 0 ? Math.min(1, Math.max(0, scrollTop / scrollHeight)) : 0;
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${pct})`;
      }
    };
    const onScroll = (): void => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        update();
      });
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      role="progressbar"
      aria-label={t('post.readingProgress')}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        'fixed left-0 right-0 top-0 z-40 bg-transparent',
        className,
      )}
      style={{ height, pointerEvents: 'none' }}
    >
      <div
        ref={fillRef}
        className={cn(
          'h-full w-full',
          color === 'primary' ? 'bg-primary' : 'bg-accent',
        )}
        style={{
          transform: 'scaleX(0)',
          transformOrigin: '0 50%',
          transition: 'transform 80ms linear',
        }}
      />
    </div>
  );
}
