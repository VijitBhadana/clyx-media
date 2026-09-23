import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { API_URL } from '@/lib/api';

/** Public content as served by GET /api/public/content (hidden cards already removed). */
export type SiteContent = {
  blocks: Record<string, Record<string, any>>;
  collections: Record<string, Array<Record<string, any>>>;
};

// The last successful response is kept so a return visit paints real content immediately,
// then refreshes in the background. It is also the fallback if the backend is asleep or down.
const CACHE_KEY = 'clyx_site_content_v1';

function readCache(): SiteContent | undefined {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as SiteContent) : undefined;
  } catch {
    return undefined;
  }
}

async function fetchSiteContent(): Promise<SiteContent> {
  const res = await fetch(`${API_URL}/api/public/content`);
  if (!res.ok) throw new Error(`Content request failed (${res.status})`);
  const data = (await res.json()) as SiteContent;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable: caching is optional
  }
  return data;
}

export function useSiteContent() {
  return useQuery({
    queryKey: ['site-content'],
    queryFn: fetchSiteContent,
    staleTime: 15_000,
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
  return { ...fallback, ...(data?.blocks?.[name] ?? {}) };
}
