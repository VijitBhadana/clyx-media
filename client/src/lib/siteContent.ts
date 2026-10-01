import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { API_URL } from '@/lib/api';

/** Public content as served by GET /api/public/content (hidden cards already removed). */
export type SiteContent = {
  blocks: Record<string, Record<string, any>>;
  collections: Record<string, Array<Record<string, any>>>;
};

// `savedAt` (ms) is when the copy was taken from the backend; copies saved before it existed count as oldest.
type SavedContent = SiteContent & { savedAt?: number };

// The last successful response is kept so a return visit paints real content immediately,
// then refreshes in the background. It is also a fallback if the backend is asleep or down.
const CACHE_KEY = 'clyx_site_content_v1';

// Copy of the content taken at build time (scripts/snapshot-content.mjs) and served with the site itself,
// so even a first-time visitor sees the real content while the backend is down.
const SNAPSHOT_URL = '/content-snapshot.json';

function readCache(): SavedContent | undefined {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as SavedContent) : undefined;
  } catch {
    return undefined;
  }
}

async function fetchSnapshot(): Promise<SavedContent | undefined> {
  try {
    const res = await fetch(SNAPSHOT_URL);
    return res.ok ? ((await res.json()) as SavedContent) : undefined;
  } catch {
    return undefined;
  }
}

async function fetchSiteContent(): Promise<SiteContent> {
  try {
    const res = await fetch(`${API_URL}/api/public/content`);
    if (!res.ok) throw new Error(`Content request failed (${res.status})`);
    const data = (await res.json()) as SiteContent;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, savedAt: Date.now() }));
    } catch {
      // storage full or unavailable: caching is optional
    }
    return data;
  } catch (err) {
    // Backend unreachable: show the newer of this browser's saved copy and the snapshot shipped with the site.
    const cached = readCache();
    const snapshot = await fetchSnapshot();
    const newest = (snapshot?.savedAt ?? 0) >= (cached?.savedAt ?? 0) ? snapshot ?? cached : cached;
    if (newest) return newest;
    throw err;
  }
}

export function useSiteContent() {
  return useQuery({
    queryKey: ['site-content'],
    queryFn: fetchSiteContent,
    // Every page load still revalidates (the cached copy is marked stale), but switching back to the tab
    // only refetches once a minute has passed instead of on nearly every focus.
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
    initialData: readCache,
    initialDataUpdatedAt: 0,
  });
}

/**
 * A repeating list from the CMS, converted to the shape the page already renders with `map`.
 * Once the backend (or its cached copy) has answered, it is the source of truth, even when empty.
 * `fallback` is only used before any answer exists, e.g. backend unreachable on a first visit.
 */
export function useCollection<T>(
  name: string,
  fallback: T[],
  map: (item: Record<string, any>, index: number) => T,
): T[] {
  const { data } = useSiteContent();
  const raw = data?.collections?.[name];
  // `map` is a plain converter that never changes meaning between renders, so only the data is tracked.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => (raw ? raw.map(map) : fallback), [raw]);
}

/** A single record such as the homepage hero. Missing fields fall back to `fallback`. */
export function useBlock<T extends Record<string, any>>(name: string, fallback: T): T {
  const { data } = useSiteContent();
  const saved = data?.blocks?.[name];
  // `fallback` is usually an inline literal, so only the saved block is tracked.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ({ ...fallback, ...(saved ?? {}) }), [saved]);
}
