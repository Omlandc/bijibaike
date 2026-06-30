/**
 * MobileMenu — hamburger drawer for mobile (<lg).
 * Uses the native <dialog> element which provides Esc handling and
 * a built-in ::backdrop pseudo-element.
 */
import { useEffect, useRef, type MouseEvent } from 'react';
import { NavLink, useNavigate } from 'react-router';
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
  History as HistoryIcon,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '@/i18n';
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
  History: HistoryIcon,
};

const NAV_ITEMS = siteConfig.nav.map((n) => ({
  to: n.to,
  label: resolveLocalized(n.label, 'zh') || n.to,
  icon: ICON_MAP[n.icon] ?? HomeIcon,
}));

export function MobileMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDialogElement>(null);

  function close() {
    dialogRef.current?.close();
  }

  // Close on route change — when the user navigates somewhere via a
  // menu link, the React Router location updates and we close the
  // drawer here so the new page isn't covered by it.
  useEffect(() => {
    return () => close();
  }, [navigate]);

  // Close when the dialog itself is clicked (but not children).
  // The dialog's ::backdrop is the dimmed area outside the sheet;
  // clicking it also bubbles up here, so this covers both.
  function onDialogClick(e: MouseEvent<HTMLDialogElement>) {
    if (e.target === e.currentTarget) close();
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 lg:hidden"
        onClick={() => dialogRef.current?.showModal()}
        aria-label={t('mobileMenu.open')}
      >
        <Menu className="size-4" />
        <span className="hidden sm:inline">{t('mobileMenu.menu')}</span>
      </Button>

      <dialog
        ref={dialogRef}
        onClick={onDialogClick}
        className="m-0 h-dvh w-dvw max-w-none bg-transparent p-0 backdrop:bg-black/50"
        aria-label={t('mobileMenu.menu')}
      >
        <aside className="absolute inset-y-0 right-0 flex h-full w-[min(85vw,360px)] flex-col bg-bg shadow-2xl border-l border-border">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
            <span className="text-sm font-semibold text-fg">
              {siteConfig.site.shortName}
            </span>
            <Button variant="ghost" size="sm" onClick={close} aria-label={t('mobileMenu.close')}>
              <X className="size-4" />
            </Button>
          </header>

          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {NAV_ITEMS.map((n) => (
                <li key={n.to}>
                  <NavLink
                    to={n.to}
                    end={n.to === '/'}
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
                    <n.icon className="size-4 shrink-0" />
                    <span>{n.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-border p-3">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </footer>
        </aside>
      </dialog>
    </>
  );
}