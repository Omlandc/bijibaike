import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolve a `LocalizedString` against the current site language.
 * Falls back to the first available translation, then to the
 * raw string, then to the optional fallback. Used by NavItem /
 * FooterLink rendering so `_config.md` can override i18n labels
 * per-language or with a single string.
 */
export function resolveLocalized(
  value: string | Partial<Record<string, string>> | null | undefined,
  currentLang: string,
  fallback?: string,
): string {
  if (value == null) return fallback ?? '';
  if (typeof value === 'string') return value;
  // Try the current language, then its base (e.g. en-US -> en),
  // then any other available value.
  if (value[currentLang]) return value[currentLang]!;
  const base = currentLang.split('-')[0];
  if (base && value[base]) return value[base]!;
  // Walk remaining keys in declaration order until we find a value.
  for (const v of Object.values(value)) {
    if (typeof v === 'string' && v) return v;
  }
  return fallback ?? '';
}
