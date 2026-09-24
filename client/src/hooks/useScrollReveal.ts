import { useEffect, useState, type RefObject } from 'react';

// The landing page shows a full-screen #loader that slides away once main.js adds `.loaded`.
// Wait for that (plus most of its 0.85s slide) so an entrance never plays hidden behind it.
function useLoaderGone() {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const loader = document.getElementById('loader');
    const finish = () => { timer = setTimeout(() => setGone(true), 600); };
    if (!loader || loader.classList.contains('loaded')) {
      setGone(true);
      return;
    }
    const observer = new MutationObserver(() => {
      if (loader.classList.contains('loaded')) {
        observer.disconnect();
        finish();
      }
    });
    observer.observe(loader, { attributes: true, attributeFilter: ['class'] });
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);
  return gone;
}

// True while the element is on screen (and the loader has gone).
// Replays every time it scrolls back into view; resets once it is fully off-screen.
export function useScrollReveal(ref: RefObject<Element | null>) {
  const [inView, setInView] = useState(false);
  const loaderGone = useLoaderGone();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio >= 0.2) setInView(true);
      else if (!entry.isIntersecting) setInView(false);
    }, { threshold: [0, 0.2] });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return inView && loaderGone;
}
