import { useEffect, useState } from 'react';
import { Sun, Moon, BookOpen, Zap, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { siteConfig } from '@/config/site-config';
import { useTranslation, type TranslationKey } from '@/i18n';

type ThemeId = string;

/**
 * 内置主题的展示信息（图标 / 标签 / 预览色）。
 * 颜色不存进 CSS 变量——实际生效的是 index.css 里的 [data-theme=...] 块，
 * 这里只是为了下拉里能展示小色块。标签走 i18n。
 */
const THEME_META: Record<
  string,
  {
    labelKey: TranslationKey;
    icon: typeof Sun;
    preview: { bg: string; fg: string; primary: string };
  }
> = {
  light: {
    labelKey: 'theme.light',
    icon: Sun,
    preview: { bg: '#ffffff', fg: '#0a0a0a', primary: '#6366f1' },
  },
  dark: {
    labelKey: 'theme.dark',
    icon: Moon,
    preview: { bg: '#0a0e1a', fg: '#f0f6fc', primary: '#818cf8' },
  },
  sepia: {
    labelKey: 'theme.sepia',
    icon: BookOpen,
    preview: { bg: '#f4ecd8', fg: '#3d2f1f', primary: '#b45309' },
  },
  cyberpunk: {
    labelKey: 'theme.cyberpunk',
    icon: Zap,
    preview: { bg: '#050514', fg: '#e8e8ff', primary: '#00f0ff' },
  },
};

/** The themes listed in vault/_config.md → siteConfig.site.themes */
const AVAILABLE_THEMES = siteConfig.site.themes.filter((t) => THEME_META[t]);
const DEFAULT_THEME: ThemeId =
  AVAILABLE_THEMES[0] ?? siteConfig.site.defaultTheme ?? 'light';

const STORAGE_KEY = 'obsidian-blog-theme';

function applyTheme(theme: ThemeId) {
  document.documentElement.classList.add('theme-switching');
  document.documentElement.setAttribute('data-theme', theme);
  // Force reflow so the transition-disabling rule takes effect first.
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  document.documentElement.offsetHeight;
  window.setTimeout(() => {
    document.documentElement.classList.remove('theme-switching');
  }, 50);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* localStorage may be disabled — non-fatal */
  }
}

function readInitialTheme(): ThemeId {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (stored && AVAILABLE_THEMES.includes(stored)) return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_THEME;
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>(() => readInitialTheme());
  const { t } = useTranslation();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const current = AVAILABLE_THEMES.includes(theme)
    ? { id: theme, ...THEME_META[theme]! }
    : { id: DEFAULT_THEME, ...THEME_META[DEFAULT_THEME]! };
  const CurrentIcon = current.icon;
  const currentLabel = t(current.labelKey);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          aria-label={t('site.toggleTheme')}
        >
          <CurrentIcon className="size-3.5" />
          <span className="hidden sm:inline">{currentLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {AVAILABLE_THEMES.map((id) => {
          const meta = THEME_META[id];
          if (!meta) return null;
          const Icon = meta.icon;
          const label = t(meta.labelKey);
          return (
            <DropdownMenuItem
              key={id}
              onSelect={() => setTheme(id)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span
                className="flex size-6 items-center justify-center rounded-md border"
                style={{
                  background: meta.preview.bg,
                  color: meta.preview.fg,
                  borderColor: meta.preview.primary,
                }}
              >
                <Icon className="size-3" style={{ color: meta.preview.primary }} />
              </span>
              <span className="flex-1 text-sm">{label}</span>
              {theme === id ? (
                <Check className="size-3.5 text-primary" />
              ) : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
