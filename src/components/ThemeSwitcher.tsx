import { useEffect, useState } from 'react';
import { Sun, Moon, BookOpen, Zap, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ThemeId = 'light' | 'dark' | 'sepia' | 'cyberpunk';

const THEMES: {
  id: ThemeId;
  label: string;
  icon: typeof Sun;
  preview: { bg: string; fg: string; primary: string };
}[] = [
  {
    id: 'light',
    label: '明亮',
    icon: Sun,
    preview: { bg: '#ffffff', fg: '#0a0a0a', primary: '#6366f1' },
  },
  {
    id: 'dark',
    label: '暗夜',
    icon: Moon,
    preview: { bg: '#0a0e1a', fg: '#f0f6fc', primary: '#818cf8' },
  },
  {
    id: 'sepia',
    label: '护眼',
    icon: BookOpen,
    preview: { bg: '#f4ecd8', fg: '#3d2f1f', primary: '#b45309' },
  },
  {
    id: 'cyberpunk',
    label: '赛博',
    icon: Zap,
    preview: { bg: '#050514', fg: '#e8e8ff', primary: '#00f0ff' },
  },
];

const STORAGE_KEY = 'obsidian-blog-theme';

function applyTheme(theme: ThemeId) {
  // Briefly disable transitions so colors don't "flash" through
  // intermediate values during the swap.
  document.documentElement.classList.add('theme-switching');
  document.documentElement.setAttribute('data-theme', theme);
  // Force a reflow so the transition-disabling rule is applied before
  // we remove the class.
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  document.documentElement.offsetHeight;
  window.setTimeout(() => {
    document.documentElement.classList.remove('theme-switching');
  }, 50);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage may be disabled — non-fatal
  }
}

function readInitialTheme(): ThemeId {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (stored && THEMES.some((t) => t.id === stored)) return stored;
  } catch {
    // ignore
  }
  return 'light';
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>(() => readInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];
  const CurrentIcon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          aria-label="切换主题"
        >
          <CurrentIcon className="size-3.5" />
          <span className="hidden sm:inline">{current.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {THEMES.map((t) => {
          const Icon = t.icon;
          return (
            <DropdownMenuItem
              key={t.id}
              onSelect={() => setTheme(t.id)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span
                className="flex size-6 items-center justify-center rounded-md border"
                style={{
                  background: t.preview.bg,
                  color: t.preview.fg,
                  borderColor: t.preview.primary,
                }}
              >
                <Icon className="size-3" style={{ color: t.preview.primary }} />
              </span>
              <span className="flex-1 text-sm">{t.label}</span>
              {theme === t.id ? (
                <Check className="size-3.5 text-primary" />
              ) : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
