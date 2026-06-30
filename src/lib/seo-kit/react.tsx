/**
 * <SEOHead /> — the main React component.
 *
 * Applies meta tags to document.head **imperatively** via the applyMeta
 * helper in meta.ts. We deliberately do NOT render <meta>/<title> as
 * React children, because:
 *
 *   1. React 19's automatic hoisting can crash on unmount with
 *      "Cannot read properties of null (reading 'removeChild')" if a
 *      navigation tears down a SEOHead whose meta nodes have been
 *      re-inserted by an effect.
 *   2. SSR vs CSR meta tags can desync if the same node is rendered
 *      twice (once on server, once on client).
 *   3. Imperative applyMeta() works identically in SSR-incompatible
 *      environments — it's framework-agnostic.
 *
 * Usage:
 *   // Site-wide defaults, mounted in the route shell so it survives
 *   // navigation:
 *   <SEOHead config={siteSEO} path={location.pathname} />
 *
 *   // Per-page overrides — wrap a route component or pass a page
 *   // prop with overrides. The component re-runs on each navigation
 *   // so meta tags always reflect the current route.
 *   <SEOHead config={siteSEO} page={pageSEO({...})} path={pathname} />
 */
import { useEffect, useRef } from 'react';
import type { PageSEO, SiteSEO } from './config.ts';
import { resolveSEO } from './merge.ts';
import { applyMeta } from './meta.ts';

export interface SEOHeadProps {
  config: SiteSEO;
  page?: PageSEO;
  path?: string | null;
}

export function SEOHead({ config, page, path }: SEOHeadProps) {
  // Resolve once per (config, page, path) tuple. useMemo prevents
  // resolveSEO from re-running on every parent re-render.
  const resolved = useRef<ReturnType<typeof resolveSEO> | null>(null);
  const cacheKey = JSON.stringify({ config, page, path });
  const lastKey = useRef<string>('');
  if (resolved.current === null || lastKey.current !== cacheKey) {
    resolved.current = resolveSEO(config, page, { path: path ?? undefined });
    lastKey.current = cacheKey;
  }
  const seo = resolved.current;

  // Apply meta to document.head after every render. React 19's
  // automatic metadata hoisting is bypassed entirely here.
  useEffect(() => {
    applyMeta(seo);
  }, [seo]);

  // Intentionally render nothing — SEO is applied imperatively.
  // This avoids the "removeChild of null" crash that React 19
  // throws when it tries to unmount hoisted meta tags whose DOM
  // nodes have been moved by an effect.
  return null;
}