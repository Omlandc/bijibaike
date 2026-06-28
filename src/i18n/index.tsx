/**
 * Lightweight i18n for the blog.
 *
 * - Two languages out of the box: zh (default) and en.
 * - Detection order:
 *   1. localStorage `obsidian-blog-lang` (user's explicit choice)
 *   2. browser `navigator.language`
 *   3. `siteConfig.site.defaultLanguage`
 * - Persists user choice to localStorage and emits a CustomEvent so
 *   components can re-render when language flips.
 * - Missing translations in `en.ts` fall back to `zh.ts` so partial
 *   translations never show empty strings.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { zh, type TranslationKey } from './zh';
export type { TranslationKey };
import { en } from './en';
import { siteConfig } from '@/config/site-config';

export type Language = 'zh' | 'en';

/**
 * All languages the site advertises. Each entry maps a config key to
 * the matching dictionary. The first entry is the fallback when a key
 * is missing from the current language.
 */
const DICTIONARIES: Record<Language, Partial<Record<TranslationKey, string>>> = {
  zh, // zh is always full — fall back here
  en,
};

const STORAGE_KEY = 'obsidian-blog-lang';
const LANG_EVENT = 'obsidian-blog-lang-change';

function isSupportedLanguage(value: string | null | undefined): value is Language {
  return value === 'zh' || value === 'en';
}

/** Read the desired language. SSR-safe (returns default when no window). */
export function detectLanguage(): Language {
  if (typeof window === 'undefined') {
    const def = siteConfig.site.defaultLanguage;
    return isSupportedLanguage(def) ? def : 'zh';
  }
  // 1. explicit user choice
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isSupportedLanguage(stored)) return stored;
  } catch {
    /* localStorage disabled */
  }
  // 2. browser language
  const browser = (navigator.language || '').toLowerCase();
  if (browser.startsWith('en')) return 'en';
  // 3. config default
  const def = siteConfig.site.defaultLanguage;
  return isSupportedLanguage(def) ? def : 'zh';
}

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Apply simple `{name}` substitutions. Falls back to the Chinese
 * version when the current language doesn't have the key.
 */
function translate(
  lang: Language,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  const value = DICTIONARIES[lang]?.[key] ?? DICTIONARIES.zh[key] ?? key;
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (m, name) => {
    const v = vars[name];
    return v === undefined ? m : String(v);
  });
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(detectLanguage);

  useEffect(() => {
    // Sync <html lang> attribute for screen readers + browser features
    document.documentElement.lang = lang;
  }, [lang]);

  // Listen for language change events from elsewhere (LanguageSwitcher)
  useEffect(() => {
    function onChange(e: Event) {
      const next = (e as CustomEvent<Language>).detail;
      if (isSupportedLanguage(next)) setLangState(next);
    }
    window.addEventListener(LANG_EVENT, onChange);
    return () => window.removeEventListener(LANG_EVENT, onChange);
  }, []);

  const setLang = useCallback((next: Language) => {
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
    setLangState(next);
    // Broadcast so multiple LanguageSwitcher instances stay in sync
    window.dispatchEvent(new CustomEvent<Language>(LANG_EVENT, { detail: next }));
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => translate(lang, key, vars),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used inside <I18nProvider>');
  return ctx;
}

export { DICTIONARIES };
export const SUPPORTED_LANGUAGES: Language[] = ['zh', 'en'];
