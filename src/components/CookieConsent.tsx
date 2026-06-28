import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Cookie, X, Check, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteAds } from '@/ads.config';
import { cn } from '@/lib/utils';

const COOKIE_NAME = siteAds.consent?.cookieName ?? 'blog-consent';

/**
 * Type of consent the user has given.
 *  - 'all': ad cookies allowed (analytics + personalized ads)
 *  - 'essential': only the consent cookie itself, no ad scripts
 *  - null: not decided yet (banner visible)
 */
export type ConsentValue = 'all' | 'essential';

function readConsent(): ConsentValue | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(^|; )' + COOKIE_NAME + '=([^;]*)'));
  const raw = m ? decodeURIComponent(m[2]!) : '';
  if (raw === 'all' || raw === 'essential') return raw;
  // Backward compat with localStorage (older builds)
  try {
    const ls = window.localStorage.getItem(COOKIE_NAME);
    if (ls === 'all' || ls === 'essential') return ls;
  } catch {
    // ignore — Safari private mode
  }
  return null;
}

function writeConsent(value: ConsentValue) {
  // 365-day cookie — the user can revoke by clearing site data.
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; max-age=${oneYear}; path=/; SameSite=Lax`;
  try {
    window.localStorage.setItem(COOKIE_NAME, value);
  } catch {
    // ignore
  }
}

export interface CookieConsentProps {
  /** Optional override: controlled state from parent (used by <AdsHead>). */
  value?: ConsentValue | null;
  /** Notifies the parent of the user's decision so <AdsHead> can react. */
  onChange?: (v: ConsentValue) => void;
}

/**
 * Bottom-left cookie consent banner. Required for GDPR / ePrivacy if
 * the site serves EU traffic. Reads/writes a single cookie and dispatches
 * a CustomEvent so <AdsHead> can pick up the change without prop drilling.
 */
export function CookieConsent({ value: controlled, onChange }: CookieConsentProps) {
  const [internal, setInternal] = useState<ConsentValue | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setInternal(readConsent());
    setHydrated(true);
  }, []);

  // Listen for global consent changes (from custom buttons, e.g. footer
  // "Privacy settings" link).
  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent<ConsentValue>).detail;
      setInternal(detail);
    }
    window.addEventListener('cookie-consent-change', handler as EventListener);
    return () =>
      window.removeEventListener('cookie-consent-change', handler as EventListener);
  }, []);

  const current = controlled !== undefined ? controlled : internal;

  // Only show if consent is required + we haven't decided yet.
  const showBanner = hydrated && current === null && siteAds.consent?.required;
  if (!showBanner) return null;

  function decide(v: ConsentValue) {
    writeConsent(v);
    setInternal(v);
    onChange?.(v);
    window.dispatchEvent(new CustomEvent<ConsentValue>('cookie-consent-change', { detail: v }));
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie 同意"
      className={cn(
        'fixed bottom-3 left-3 right-3 z-40 mx-auto max-w-lg rounded-xl border border-border bg-bg-elevated/95 p-3.5 shadow-xl backdrop-blur-md transition-all sm:bottom-4 sm:left-4 sm:right-4 sm:p-4',
        'sm:right-auto sm:left-4',
      )}
    >
      <div className="flex items-start gap-3">
        <Cookie className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="flex-1 space-y-1.5">
          <p className="text-sm font-medium text-fg">关于 Cookie 与广告</p>
          <p className="text-xs leading-relaxed text-fg-muted">
            本站使用必需 Cookie 记住你的偏好;在你同意后,Google AdSense
            才会写入广告 Cookie 用于个性化内容。详见{' '}
            <Link
              to="/privacy"
              className="text-primary underline-offset-4 hover:underline"
            >
              隐私政策
            </Link>
            。
          </p>
          {expanded ? (
            <ul className="mt-2 space-y-1 rounded-md bg-bg-subtle p-2 text-xs text-fg-muted">
              <li className="flex items-start gap-1.5">
                <Check className="mt-0.5 size-3 shrink-0 text-primary" />
                <span>
                  <strong className="text-fg">必需</strong>: 同意状态本身(7 天)
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="mt-0.5 size-3 shrink-0 rounded-full border border-border" />
                <span>
                  <strong className="text-fg">广告</strong>:{' '}
                  AdSense 用于个性化广告(仅在你点同意后)
                </span>
              </li>
            </ul>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="-m-1 shrink-0 rounded-md p-1 text-fg-muted hover:bg-bg-subtle hover:text-fg"
          aria-label={expanded ? '收起详情' : '展开详情'}
          title={expanded ? '收起详情' : '展开详情'}
        >
          {expanded ? <X className="size-3.5" /> : <Settings2 className="size-3.5" />}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => decide('essential')}
        >
          仅必需
        </Button>
        <Button
          size="sm"
          onClick={() => decide('all')}
        >
          同意全部
        </Button>
      </div>
    </div>
  );
}

/**
 * Custom hook: tracks the current consent value and re-renders when it
 * changes (whether from this banner or another source). Use from
 * `<AdsHead>` so the Auto Ads script reacts to consent decisions.
 */
export function useConsent(): ConsentValue | null {
  const [consent, setConsent] = useState<ConsentValue | null>(null);
  useEffect(() => {
    setConsent(readConsent());
    function handler(e: Event) {
      const detail = (e as CustomEvent<ConsentValue>).detail;
      setConsent(detail);
    }
    window.addEventListener('cookie-consent-change', handler as EventListener);
    return () =>
      window.removeEventListener('cookie-consent-change', handler as EventListener);
  }, []);
  return consent;
}