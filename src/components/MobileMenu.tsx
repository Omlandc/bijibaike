/**
 * MobileMenu —— mobile (<lg) 上的 hamburger 抽屉菜单
 *
 * 在桌面端 (≥lg) 不渲染 — 桌面端使用 SiteLayout 里的横向 nav。
 *
 * 行为:
 * - 点击汉堡按钮 → 打开全屏抽屉,里面是所有 nav 项 + ThemeSwitcher + LanguageSwitcher
 * - 抽屉打开时禁止 body 滚动
 * - 路由变化时自动关闭
 * - Esc 键关闭
 */
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import {
  Menu,
  X,
  Home as HomeIcon,
  BookOpen as BookOpenIcon,
  FileText as FileTextIcon,
  Layers as LayersIcon,
  FolderTree as FolderTreeIcon,
  Tag as TagIcon,
  Tags as TagsIcon,
  Network as NetworkIcon,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation, type TranslationKey } from '@/i18n';
import { siteConfig } from '@/config/site-config';
import { cn, resolveLocalized } from '@/lib/utils';

const ICON_MAP: Record<string, LucideIcon> = {
  Home: HomeIcon,
  BookOpen: BookOpenIcon,
  FileText: FileTextIcon,
  Layers: LayersIcon,
  FolderTree: FolderTreeIcon,
  Tag: TagIcon,
  Tags: TagsIcon,
  Network: NetworkIcon,
};

const NAV_LABEL_KEYS: Record<string, TranslationKey> = {
  '/': 'nav.home',
  '/blog': 'nav.posts',
  '/topics': 'nav.topics',
  '/tags': 'nav.tags',
  '/graph': 'nav.graph',
  '/resources': 'nav.resources',
};

const NAV = siteConfig.nav.map((n) => {
  const cfg = n.label;
  const fallbackLabel =
    typeof cfg === 'string'
      ? cfg
      : cfg
        ? (Object.values(cfg).find((v) => typeof v === 'string' && v) ?? '')
        : '';
  return {
    to: n.to,
    labelKey: NAV_LABEL_KEYS[n.to] ?? 'nav.home',
    fallbackLabel,
    configLabel: n.label,
    icon: ICON_MAP[n.icon] ?? HomeIcon,
    end: n.to === '/',
  };
});

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { t, lang } = useTranslation();
  const close = () => setOpen(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {/* Hamburger button — only visible <lg */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 lg:hidden"
        onClick={() => setOpen(true)}
        aria-label={t('mobileMenu.open')}
        aria-expanded={open}
      >
        <Menu className="size-4" />
        <span className="hidden sm:inline">{t('mobileMenu.menu')}</span>
      </Button>

      {/* Drawer */}
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('mobileMenu.menu')}
          className="fixed inset-0 z-50 lg:hidden"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label={t('mobileMenu.close')}
            onClick={close}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          {/* Sheet */}
          <aside
            className={cn(
              'absolute inset-y-0 right-0 flex w-[min(85vw,360px)] flex-col bg-bg shadow-2xl',
              'border-l border-border',
              'animate-in slide-in-from-right-full duration-200',
            )}
          >
            <header className="flex h-14 items-center justify-between border-b border-border px-4">
              <span className="text-sm font-semibold text-fg">
                {siteConfig.site.shortName}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={close}
                aria-label={t('mobileMenu.close')}
              >
                <X className="size-4" />
              </Button>
            </header>
            <nav className="flex-1 overflow-y-auto p-3">
              <ul className="space-y-1">
                {NAV.map((n) => {
                  const Icon = n.icon;
                  const configLabel = resolveLocalized(n.configLabel, lang);
                  const label = configLabel || t(n.labelKey);
                  return (
                    <li key={n.to}>
                      <NavLink
                        to={n.to}
                        end={n.end}
                        onClick={close}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                            isActive
                              ? 'bg-primary/10 font-medium text-primary'
                              : 'text-fg hover:bg-bg-subtle',
                          )
                        }
                      >
                        <Icon className="size-4" />
                        <span>{label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <footer className="flex items-center justify-between gap-2 border-t border-border p-3">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </footer>
          </aside>
        </div>
      ) : null}
    </>
  );
}
