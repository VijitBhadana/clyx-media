import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useLocation } from 'wouter';
import { API_URL } from '@/lib/api';

/** Public content as served by GET /api/public/content (hidden cards already removed). */
export type SiteContent = {
  blocks: Record<string, Record<string, any>>;
  collections: Record<string, Array<Record<string, any>>>;
};

// `savedAt` (ms) is when the copy was taken from the backend; copies saved before it existed count as oldest.
type SavedContent = SiteContent & { savedAt?: number };

/**
 * The part of the site content one page renders: whole blocks, and for each list either every field (`null`) or
 * only the fields the page shows. The backend sends exactly this, so a page never downloads copy it does not use.
 */
type Scope = { blocks: readonly string[]; collections: Readonly<Record<string, readonly string[] | null>> };

// Header, footer, cookie bar and WhatsApp button: on every page.
const GLOBAL = ['page_global'];
// The "talk to the team" CTA only prints first names.
const TEAM_NAMES = { team: ['name'] } as const;

const SCOPES: Record<string, Scope> = {
  home: {
    blocks: [...GLOBAL, 'page_home', 'hero', 'page_services'],
    collections: {
      campaigns: ['client', 'category', 'roas', 'desc', 'img', 'ctaText', 'ctaUrl'],
      team: ['name', 'role', 'img'],
      testimonials: ['name', 'quote', 'role', 'brand', 'metrics', 'metric'],
    },
  },
  about: { blocks: [...GLOBAL, 'page_about'], collections: { team: ['name', 'role', 'badge', 'bio', 'img'] } },
  services: { blocks: [...GLOBAL, 'page_services'], collections: TEAM_NAMES },
  portfolio: { blocks: [...GLOBAL, 'page_portfolio'], collections: { portfolio: ['title', 'category', 'result', 'image'] } },
  portfolioDetail: {
    blocks: [...GLOBAL, 'page_portfolio', 'page_services'],
    collections: { portfolio: null, caseStudies: ['brand'], ...TEAM_NAMES },
  },
  caseStudies: { blocks: [...GLOBAL, 'page_caseStudies'], collections: { caseStudies: null } },
  caseStudyDetail: { blocks: [...GLOBAL, 'page_caseStudies', 'page_services'], collections: { caseStudies: null, ...TEAM_NAMES } },
  creators: { blocks: [...GLOBAL, 'page_creators'], collections: { creators: ['name', 'handle', 'platform', 'reach', 'image'] } },
  // The article list shows cards only; the full text is fetched on the article's own page.
  blog: { blocks: [...GLOBAL, 'page_blog'], collections: { blog: ['title', 'tag', 'date', 'readTime', 'image', 'style'] } },
  blogPost: { blocks: [...GLOBAL, 'page_blog'], collections: { blog: null } },
  // Cards plus the full details for their "See description" popup.
  careers: { blocks: [...GLOBAL, 'page_careers'], collections: { careers: null } },
  // Cards plus everything the details popup and the purchase chat need.
  courses: { blocks: [...GLOBAL, 'page_courses'], collections: { courses: null } },
  contact: { blocks: [...GLOBAL, 'page_contact'], collections: {} },
  // Legal pages, 404 and anything else with the site header and footer.
  other: { blocks: GLOBAL, collections: {} },
};

/** The content scope of a URL path, e.g. "/blog/some-post" -> the article page's scope. */
export function scopeForPath(path: string): Scope {
  const [, first = '', second] = path.split(/[?#]/)[0].split('/');
  switch (first) {
    case '': return SCOPES.home;
    case 'about': return SCOPES.about;
    case 'services': return SCOPES.services;
    case 'portfolio': return second ? SCOPES.portfolioDetail : SCOPES.portfolio;
    case 'case-studies': return second ? SCOPES.caseStudyDetail : SCOPES.caseStudies;
    case 'creators': return SCOPES.creators;
    case 'blog': return second ? SCOPES.blogPost : SCOPES.blog;
    case 'careers': return SCOPES.careers;
    case 'courses': return SCOPES.courses;
    case 'contact': return SCOPES.contact;
    default: return SCOPES.other;
  }
}

/** "blocks=a,b&collections=x&fields[x]=f1,f2": the backend's query string, also used as the cache key. */
function scopeQuery(scope: Scope): string {
  const names = Object.keys(scope.collections);
  const parts = [`blocks=${scope.blocks.join(',')}`, `collections=${names.join(',')}`];
  for (const name of names) {
    const fields = scope.collections[name];
    if (fields) parts.push(`fields[${name}]=${fields.join(',')}`);
  }
  return parts.join('&');
}

/** Cuts a full (or wider) copy of the content down to `scope`. */
function pickScope(content: SiteContent, scope: Scope): SiteContent {
  const blocks: SiteContent['blocks'] = {};
  for (const key of scope.blocks) if (content.blocks?.[key]) blocks[key] = content.blocks[key];
  const collections: SiteContent['collections'] = {};
  for (const [name, fields] of Object.entries(scope.collections)) {
    const items = content.collections?.[name];
    if (!items) continue;
    collections[name] = fields
      ? items.map((item) => {
          const out: Record<string, any> = { id: item.id };
          for (const key of fields) if (key in item) out[key] = item[key];
          return out;
        })
      : items;
  }
  return { blocks, collections };
}

// ---------------------------------------------------------------------------------------------------------------
// Local copies. Each page's last answer is kept (per scope) so a return visit paints real content immediately and
// refreshes in the background; it is also the fallback while the backend is asleep or down.

const CACHE_KEY = 'clyx_site_content_v2';
const LEGACY_CACHE_KEY = 'clyx_site_content_v1';
type Entry = { scope: Scope; content: SavedContent };

function readEntries(): Record<string, Entry> {
  try {
    localStorage.removeItem(LEGACY_CACHE_KEY);
    const raw = localStorage.getItem(CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

// Also kept in memory, so pages visited this session help each other even when storage is blocked.
const entries: Record<string, Entry> = readEntries();

function saveEntry(key: string, scope: Scope, content: SavedContent) {
  entries[key] = { scope, content };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
  } catch {
    // storage full or unavailable: caching is optional
  }
}

/** Does `have` (null = every field) cover `want`? */
const covers = (have: readonly string[] | null | undefined, want: readonly string[] | null) =>
  have === null || (have !== undefined && want !== null && want.every((f) => have.includes(f)));

/**
 * The best local answer for `scope`: its own saved copy, or else the matching parts of copies saved by other pages
 * (e.g. the header text from any page). Parts nobody has yet stay missing, so they show their built-in defaults.
 */
function localContent(key: string, scope: Scope): SavedContent | undefined {
  if (entries[key]) return entries[key].content;
  const newest = Object.values(entries).sort((a, b) => (b.content.savedAt ?? 0) - (a.content.savedAt ?? 0));
  const out: SavedContent = { blocks: {}, collections: {}, savedAt: 0 };
  let found = false;
  for (const block of scope.blocks) {
    const source = newest.find((e) => e.scope.blocks.includes(block));
    if (!source) continue;
    found = true;
    if (source.content.blocks?.[block]) out.blocks[block] = source.content.blocks[block];
  }
  for (const [name, fields] of Object.entries(scope.collections)) {
    const source = newest.find((e) => covers(e.scope.collections[name], fields) && e.content.collections?.[name]);
    if (!source) continue;
    found = true;
    out.collections[name] = pickScope(source.content, { blocks: [], collections: { [name]: fields } }).collections[name];
  }
  return found ? out : undefined;
}

// Copy of the content taken at build time (scripts/snapshot-content.mjs) and served with the site itself,
// so even a first-time visitor sees the real content while the backend is down. Fetched at most once.
const SNAPSHOT_URL = '/content-snapshot.json';
let snapshot: Promise<SavedContent | undefined> | undefined;
function fetchSnapshot(): Promise<SavedContent | undefined> {
  snapshot ??= fetch(SNAPSHOT_URL)
    .then((res) => (res.ok ? (res.json() as Promise<SavedContent>) : undefined))
    .catch(() => undefined);
  return snapshot;
}

async function fetchFromApi(key: string, scope: Scope): Promise<SiteContent> {
  const res = await fetch(`${API_URL}/api/public/content?${key}`);
  if (!res.ok) throw new Error(`Content request failed (${res.status})`);
  // An older backend ignores `fields` and sends whole cards; trim them so every page sees the same shape.
  const data = pickScope((await res.json()) as SiteContent, scope);
  saveEntry(key, scope, { ...data, savedAt: Date.now() });
  return data;
}

/** The snapshot shipped with the site, cut down to `scope`. */
async function snapshotFor(scope: Scope): Promise<SavedContent | undefined> {
  const shipped = await fetchSnapshot();
  return shipped ? { ...pickScope(shipped, scope), savedAt: shipped.savedAt } : undefined;
}

// With no local copy of a page yet, the backend gets this long before the shipped snapshot is shown instead.
// (A free Render instance can take ~50s to wake up; visitors should not stare at placeholder copy meanwhile.)
const GRACE_MS = 800;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function fetchScope(key: string, scope: Scope, onLate: (data: SiteContent) => void): Promise<SiteContent> {
  const api = fetchFromApi(key, scope);
  try {
    if (entries[key]) return await api;
    // First visit to this page: whichever comes first, the backend's answer or (after the grace period) the snapshot.
    const early = wait(GRACE_MS).then(() => snapshotFor(scope));
    const first = await Promise.race([api.then((data) => ({ data, live: true })), early.then((data) => ({ data, live: false }))]);
    if (first.live || !first.data) return await api;
    api.then(onLate, () => {});
    return first.data;
  } catch (err) {
    // Backend unreachable: show the newer of this browser's saved copy and the snapshot shipped with the site.
    const cached = entries[key]?.content;
    const fromSnapshot = await snapshotFor(scope);
    const newest = (fromSnapshot?.savedAt ?? 0) >= (cached?.savedAt ?? 0) ? fromSnapshot ?? cached : cached;
    if (newest) return newest;
    throw err;
  }
}

function contentQuery(path: string, queryClient: QueryClient) {
  const scope = scopeForPath(path);
  const key = scopeQuery(scope);
  const queryKey = ['site-content', key] as const;
  const queryFn = () => fetchScope(key, scope, (data) => queryClient.setQueryData(queryKey, data));
  return { scope, key, queryKey, queryFn };
}

/** Downloads a page's content ahead of a likely visit (link hover / touch), so it opens with real copy. */
export function prefetchPageContent(queryClient: QueryClient, path: string) {
  const { scope, key, queryKey, queryFn } = contentQuery(path, queryClient);
  // Seed the local copy first (marked stale), so the page shows it while this request is still running.
  if (queryClient.getQueryData(queryKey) === undefined) {
    const local = localContent(key, scope);
    if (local) queryClient.setQueryData(queryKey, local, { updatedAt: 0 });
  }
  return queryClient.prefetchQuery({ queryKey, queryFn, staleTime: 60_000 });
}

// The longest the very first page waits for its content before showing anyway (with built-in copy).
const FIRST_PAINT_WAIT_MS = 1500;
let firstPage: Promise<void> | undefined;

/**
 * Starts loading the landing page's content at boot, alongside its code, and resolves once it is ready (or after
 * a short cap). The first page waits on this, so a first-time visitor never sees placeholder copy jump to the real
 * copy. With a saved copy in this browser it resolves at once.
 */
export function primeFirstPage(queryClient: QueryClient): Promise<void> {
  if (firstPage) return firstPage;
  const path = window.location.pathname;
  if (path.startsWith('/admin')) return (firstPage = Promise.resolve());
  const { scope, key } = contentQuery(path, queryClient);
  const loading = prefetchPageContent(queryClient, path);
  firstPage = localContent(key, scope) ? Promise.resolve() : Promise.race([loading, wait(FIRST_PAINT_WAIT_MS)]);
  return firstPage;
}

/** Resolves when the first page may render (see primeFirstPage); immediately for every later page. */
export const firstPageReady = () => firstPage ?? Promise.resolve();

function useScopedContent() {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const { scope, key, queryKey, queryFn } = useMemo(() => contentQuery(location, queryClient), [location, queryClient]);
  const query = useQuery({
    queryKey,
    queryFn,
    // Every page load still revalidates (a local copy is marked stale), but switching back to the tab
    // only refetches once a minute has passed instead of on nearly every focus.
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
    initialData: () => localContent(key, scope),
    initialDataUpdatedAt: 0,
  });
  return { ...query, scope };
}

/** A section asked for content its page does not load: it would silently show built-in text. Dev-only check. */
function warnOutOfScope(scope: Scope, kind: 'block' | 'collection', name: string) {
  if (!import.meta.env.DEV) return;
  const ok = kind === 'block' ? scope.blocks.includes(name) : name in scope.collections;
  if (!ok) console.warn(`[siteContent] "${name}" is not in this page's content scope; add it in lib/siteContent.ts (SCOPES).`);
}

/** The current page's content (only the parts that page renders). */
export function useSiteContent() {
  return useScopedContent();
}

/** One editable page block such as `page_home`; used by usePageContent. */
export function useBlockData(name: string): Record<string, any> | undefined {
  const { data, scope } = useScopedContent();
  warnOutOfScope(scope, 'block', name);
  return data?.blocks?.[name];
}

/**
 * A repeating list from the CMS, converted to the shape the page already renders with `map`.
 * Once the backend (or a saved copy) has answered, it is the source of truth, even when empty.
 * `fallback` is only used before any answer exists, e.g. backend unreachable on a first visit.
 */
export function useCollection<T>(
  name: string,
  fallback: T[],
  map: (item: Record<string, any>, index: number) => T,
): T[] {
  const { data, scope } = useScopedContent();
  warnOutOfScope(scope, 'collection', name);
  const raw = data?.collections?.[name];
  // `map` is a plain converter that never changes meaning between renders, so only the data is tracked.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => (raw ? raw.map(map) : fallback), [raw]);
}

/** A single record such as the homepage hero. Missing fields fall back to `fallback`. */
export function useBlock<T extends Record<string, any>>(name: string, fallback: T): T {
  const saved = useBlockData(name);
  // `fallback` is usually an inline literal, so only the saved block is tracked.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ({ ...fallback, ...(saved ?? {}) }), [saved]);
}
