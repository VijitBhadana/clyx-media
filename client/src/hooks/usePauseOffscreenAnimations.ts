import { useEffect } from 'react';

const OFFSCREEN = 'is-offscreen';

/**
 * Pauses the CSS animations inside any section or footer that is off screen (see `.is-offscreen` in index.css) and
 * lets them carry on from the same frame when it comes back. Several looping effects (pulsing dots, the book's foil
 * shimmer, marquees) animate properties such as box-shadow that the browser recomputes on the main thread every
 * frame, even while nobody can see them; the footer's pulse alone did that on every page, all the time.
 */
export function usePauseOffscreenAnimations() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || typeof MutationObserver === 'undefined') return;
    const root = document.getElementById('root');
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle(OFFSCREEN, !e.isIntersecting)),
      { rootMargin: '150px 0px' },
    );
    const watched = new WeakSet<Element>();
    const scan = () => {
      root.querySelectorAll('section, footer').forEach((el) => {
        if (watched.has(el)) return;
        watched.add(el);
        io.observe(el);
      });
    };
    let timer = 0;
    // Pages and sections mount after navigation and data loads, so new ones are picked up as they appear.
    // Text-only updates (typewriter, counters) are ignored.
    const mo = new MutationObserver((records) => {
      if (timer || !records.some((r) => Array.from(r.addedNodes).some((n) => n.nodeType === 1))) return;
      timer = window.setTimeout(() => { timer = 0; scan(); }, 200);
    });
    scan();
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      clearTimeout(timer);
      mo.disconnect();
      io.disconnect();
    };
  }, []);
}
