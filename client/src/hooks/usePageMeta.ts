import { useEffect } from 'react';

export const SITE_URL = 'https://www.clyxmedia.com';

/** Sets the browser tab title (also the title Google shows) while this page is open. `noindex` keeps the page out of search. */
export function usePageTitle(title: string, { noindex = false } = {}) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    let robots: HTMLMetaElement | undefined;
    if (noindex) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      robots.content = 'noindex';
      document.head.appendChild(robots);
    }
    return () => {
      document.title = previous;
      robots?.remove();
    };
  }, [title, noindex]);
}

/**
 * Points Google at the one address for the current page. It is set here, not in index.html, because every route is
 * served the same index.html: a fixed canonical there would mark every page as a copy of the homepage.
 */
export function useCanonicalUrl(path: string) {
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    const clean = path.split(/[?#]/)[0].replace(/\/+$/, '');
    link.href = `${SITE_URL}${clean || '/'}`;
  }, [path]);
}
