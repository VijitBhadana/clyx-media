import { useEffect } from 'react';
import SEO_PAGES from '@/data/seo.json';

export const SITE_URL = 'https://www.clyxmedia.com';

/**
 * Title and search-snippet text for every fixed page. The same file feeds scripts/seo-pages.mjs, which writes them
 * into each page's HTML at build time (for crawlers and link previews that do not run JavaScript) and the sitemap.
 */
export type SeoPath = keyof typeof SEO_PAGES;
export const pageSeo = (path: string) => (SEO_PAGES as Record<string, { title: string; description: string }>)[path];

/** Admin-written text as one plain line, cut at a word to fit a Google snippet (~155 characters). */
export function snippet(text: string | undefined, max = 155) {
  const plain = (text ?? '').replace(/^[ \t]*([•\-*–▪◦●]|\d{1,3}[.)])[ \t]+/gm, '').replace(/\s+/g, ' ').trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 20)).replace(/[\s,.;:]+$/, '')}…`;
}

// The description is repeated in the Open Graph / Twitter tags, so a shared link shows the page it points to.
const DESCRIPTION_TAGS = ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]'];
const TITLE_TAGS = ['meta[property="og:title"]', 'meta[name="twitter:title"]'];

/** Sets `content` on each tag and returns a function that puts the old values back. */
function setTags(selectors: string[], content: string) {
  const tags = selectors.map((s) => document.querySelector<HTMLMetaElement>(s)).filter((t): t is HTMLMetaElement => !!t);
  const previous = tags.map((t) => t.content);
  tags.forEach((t) => { t.content = content; });
  return () => tags.forEach((t, i) => { t.content = previous[i]; });
}

/**
 * Sets the browser tab title (also the title Google shows) and, when given, the search-snippet description while
 * this page is open. Nothing happens while `title` is undefined (a CMS page still loading). `noindex` keeps the page
 * out of search.
 */
export function usePageTitle(title: string | undefined, { noindex = false, description }: { noindex?: boolean; description?: string } = {}) {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = title;
    const restoreTitle = setTags(TITLE_TAGS, title);
    const restoreDescription = description ? setTags(DESCRIPTION_TAGS, description) : undefined;
    // index.html already has a robots tag (index, follow); a second one would leave Google two answers to combine.
    let added: HTMLMetaElement | undefined;
    let restoreRobots: (() => void) | undefined;
    if (noindex) {
      if (document.querySelector('meta[name="robots"]')) restoreRobots = setTags(['meta[name="robots"]'], 'noindex');
      else {
        added = document.createElement('meta');
        added.name = 'robots';
        added.content = 'noindex';
        document.head.appendChild(added);
      }
    }
    return () => {
      document.title = previous;
      restoreTitle();
      restoreDescription?.();
      restoreRobots?.();
      added?.remove();
    };
  }, [title, noindex, description]);
}

/** usePageTitle with the title and description listed for `path` in data/seo.json. */
export function usePageSeo(path: SeoPath) {
  const { title, description } = SEO_PAGES[path];
  usePageTitle(title, { description });
}

/**
 * Points Google at the one address for the current page. index.html has none because it is served for every address
 * without its own file (detail pages, the homepage): a fixed canonical there would mark them all as copies of the
 * homepage. The fixed pages get theirs in their HTML too (scripts/seo-pages.mjs); this sets the same value.
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
    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (ogUrl) ogUrl.content = link.href;
  }, [path]);
}
