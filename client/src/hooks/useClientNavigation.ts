import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { prefetchPageContent } from '@/lib/siteContent';

// Every history entry gets a key in history.state; its scroll position is kept under that key in sessionStorage,
// so Back/Forward and reloads land where the visitor was, even though pages render after the URL changes.
const KEY_FIELD = '__clyxKey';
const POSITIONS_KEY = 'clyx-scroll-positions';
const MAX_POSITIONS = 50;
// A freshly shown page may still be loading or growing; keep trying to reach the target for this long.
const SETTLE_MS = 2000;
const SAVE_DELAY_MS = 150;

const newKey = () => Math.random().toString(36).slice(2, 10);

function readPositions(): Record<string, number> {
  try {
    return JSON.parse(sessionStorage.getItem(POSITIONS_KEY) || '{}');
  } catch {
    return {};
  }
}

function savePosition(key: string, top: number) {
  const positions = readPositions();
  delete positions[key];
  positions[key] = top;
  const keys = Object.keys(positions);
  for (const old of keys.slice(0, Math.max(0, keys.length - MAX_POSITIONS))) delete positions[old];
  try {
    sessionStorage.setItem(POSITIONS_KEY, JSON.stringify(positions));
  } catch {
    // storage unavailable: Back/Forward just start at the top
  }
}

/** The current history entry's key, giving it one if it has none yet (first load, in-page #anchor jumps). */
function entryKey(): string {
  const state = history.state && typeof history.state === 'object' ? history.state : {};
  if (typeof state[KEY_FIELD] === 'string') return state[KEY_FIELD];
  const key = newKey();
  history.replaceState({ ...state, [KEY_FIELD]: key }, '');
  return key;
}

const jump = (top: number) => window.scrollTo({ top, left: 0, behavior: 'instant' as ScrollBehavior });

/**
 * Brings the page to where this history entry should be: its saved position (Back/Forward, reload), else the
 * #section in the URL, else the top (a fresh navigation). Retries for a moment while the page renders.
 * Returns a function that stops the retries.
 */
function settleScroll({ toTopByDefault }: { toTopByDefault: boolean }) {
  const saved = readPositions()[entryKey()];
  const hash = decodeURIComponent(window.location.hash.slice(1));
  const target = saved === undefined && /^[\w-]+$/.test(hash) ? hash : null;
  if (saved === undefined && !target) {
    if (toTopByDefault) jump(0);
    return () => {};
  }

  const until = performance.now() + SETTLE_MS;
  let frame = 0;
  const attempt = () => {
    if (target) {
      const el = document.getElementById(target);
      if (el) return el.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior });
    } else if (document.documentElement.scrollHeight - window.innerHeight >= saved!) {
      return jump(saved!);
    }
    if (performance.now() < until) frame = requestAnimationFrame(attempt);
    else if (saved !== undefined) jump(saved);
  };
  if (toTopByDefault && target) jump(0);
  attempt();
  // The visitor scrolling or clicking takes over from the automatic scroll.
  const stop = () => cancelAnimationFrame(frame);
  window.addEventListener('wheel', stop, { once: true, passive: true });
  window.addEventListener('touchstart', stop, { once: true, passive: true });
  return () => {
    stop();
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchstart', stop);
  };
}

/**
 * Makes plain same-site <a href> links (Header, Footer, CMS copy, …) switch pages without reloading the document,
 * and handles scrolling the way a full page load would.
 */
export function useClientNavigation() {
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const isFirst = useRef(true);

  // Pointing at, touching or tabbing to an internal link starts loading that page's content, so by the click
  // it is usually there already. Each page only asks for its own part of the content, so this stays small.
  useEffect(() => {
    let last = '';
    const onIntent = (e: Event) => {
      const link = (e.target as Element | null)?.closest?.('a');
      if (!(link instanceof HTMLAnchorElement) || !link.hasAttribute('href') || link.href === last) return;
      last = link.href;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      if (url.pathname.startsWith('/admin')) return;
      prefetchPageContent(queryClient, url.pathname).catch(() => {});
    };
    document.addEventListener('pointerover', onIntent, { passive: true });
    document.addEventListener('touchstart', onIntent, { passive: true });
    document.addEventListener('focusin', onIntent);
    return () => {
      document.removeEventListener('pointerover', onIntent);
      document.removeEventListener('touchstart', onIntent);
      document.removeEventListener('focusin', onIntent);
    };
  }, [queryClient]);

  // Internal link clicks become client-side navigations.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a');
      if (!(link instanceof HTMLAnchorElement) || !link.hasAttribute('href')) return;
      if ((link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || !/^https?:$/.test(url.protocol)) return;

      const samePage = url.pathname === window.location.pathname && url.search === window.location.search;
      if (samePage && url.hash) return; // an in-page #section: the browser handles it
      e.preventDefault();
      if (samePage) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      savePosition(entryKey(), window.scrollY);
      navigate(url.pathname + url.search + url.hash, { state: { [KEY_FIELD]: newKey() } });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate]);

  // Scroll positions are restored by settleScroll, not by the browser (it would restore before the page renders).
  useEffect(() => {
    if (!('scrollRestoration' in history)) return;
    const previous = history.scrollRestoration;
    history.scrollRestoration = 'manual';

    let timer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      const key = entryKey();
      clearTimeout(timer);
      timer = setTimeout(() => savePosition(key, window.scrollY), SAVE_DELAY_MS);
    };
    // Back/Forward between two entries of the same page (e.g. after an in-page #section jump) does not change
    // the route, so it is handled here instead of in the route effect below.
    let lastPath = window.location.pathname;
    const onPopState = () => {
      if (window.location.pathname === lastPath) settleScroll({ toTopByDefault: false });
      lastPath = window.location.pathname;
    };
    const onPushOrReplace = () => { lastPath = window.location.pathname; };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('popstate', onPopState);
    window.addEventListener('pushState', onPushOrReplace);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('pushState', onPushOrReplace);
      history.scrollRestoration = previous;
    };
  }, []);

  // Every page change: saved position, #section or top. The very first render keeps the browser's own position
  // unless there is a saved one or a #section the lazy page could not be scrolled to yet.
  useEffect(() => {
    const first = isFirst.current;
    isFirst.current = false;
    return settleScroll({ toTopByDefault: !first });
  }, [location]);
}
