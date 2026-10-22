import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

type Fields = Record<string, any>;
type ServerItem = { id: string; isHidden: boolean; sortOrder: number; data: Fields };
export type AdminContent = { blocks: Record<string, Fields>; collections: Record<string, ServerItem[]> };

/** A card as the admin screens use it: its fields, an id, and a `hidden` flag. */
export type ListItem = { id: string; hidden: boolean } & Fields;
type Updater<T> = T[] | ((prev: T[]) => T[]);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const sameFields = (a: Fields, b: Fields) => JSON.stringify(a) === JSON.stringify(b);
const errorText = (err: unknown) => (err instanceof Error ? err.message : 'Something went wrong.');

/** Loads everything the admin can edit. Only runs once the admin is signed in. */
export function useAdminContent(enabled: boolean) {
  const query = trpc.admin.content.useQuery(undefined, {
    enabled,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });
  return { content: query.data as AdminContent | undefined, refetch: query.refetch as () => Promise<unknown> };
}

/**
 * Works like `useState` for one list, but every change is also saved to the backend:
 * added cards are created, edited cards updated, removed cards deleted, and show/hide is stored.
 * `position` says whether newly added cards go to the top ("start") or the bottom ("end").
 */
export function useServerList<T extends { id: string; hidden: boolean }>(
  collection: string,
  content: AdminContent | undefined,
  refetch: () => Promise<unknown>,
  position: 'start' | 'end' = 'end',
): [T[], (value: Updater<T>) => void] {
  // Only the stable mutateAsync functions are kept: the mutation objects change on every status update, which used
  // to recreate save/setItems (and re-render every list row) each time a save started or finished.
  const { mutateAsync: createItem } = trpc.admin.createItem.useMutation();
  const { mutateAsync: updateItem } = trpc.admin.updateItem.useMutation();
  const { mutateAsync: deleteItem } = trpc.admin.deleteItem.useMutation();

  // Shown immediately while saving; cleared once the saved copy has been reloaded.
  const [optimistic, setOptimistic] = useState<ListItem[] | null>(null);
  const fromServer = useMemo<ListItem[]>(
    () => (content?.collections?.[collection] ?? []).map((row) => ({ ...row.data, id: row.id, hidden: row.isHidden })),
    [content, collection],
  );
  const items = (optimistic ?? fromServer) as unknown as T[];
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const save = useCallback(
    async (prev: T[], next: T[]) => {
      const before = new Map(prev.map((item) => [item.id, item]));
      const keptIds = new Set(next.map((item) => item.id));
      const jobs: Promise<unknown>[] = [];

      for (const item of next) {
        const { id, hidden, ...data } = item as ListItem;
        const old = before.get(id) as ListItem | undefined;
        if (!old) {
          jobs.push(
            createItem({ collection, data, position }).then((row: { id: string }) =>
              hidden ? updateItem({ id: row.id, isHidden: true }) : undefined,
            ),
          );
          continue;
        }
        if (!UUID.test(id)) continue; // still being created; the reload below brings its real id
        const { id: _id, hidden: wasHidden, ...oldData } = old;
        const changedFields = !sameFields(oldData, data);
        if (changedFields || hidden !== wasHidden) {
          jobs.push(
            updateItem({
              id,
              ...(changedFields ? { data } : {}),
              ...(hidden !== wasHidden ? { isHidden: hidden } : {}),
            }),
          );
        }
      }
      for (const old of prev) {
        if (!keptIds.has(old.id) && UUID.test(old.id)) jobs.push(deleteItem({ id: old.id }));
      }

      const results = await Promise.allSettled(jobs);
      const failed = results.find((r): r is PromiseRejectedResult => r.status === 'rejected');
      await refetch();
      setOptimistic(null);
      if (failed) toast.error(`Could not save: ${errorText(failed.reason)}`);
      else if (jobs.length) toast.success('Saved to the live website');
    },
    [collection, position, createItem, updateItem, deleteItem, refetch],
  );

  const setItems = useCallback(
    (value: Updater<T>) => {
      const prev = itemsRef.current;
      const next = typeof value === 'function' ? value(prev) : value;
      setOptimistic(next as unknown as ListItem[]);
      void save(prev, next);
    },
    [save],
  );

  return [items, setItems];
}

/** Saves one singleton block (e.g. the homepage headline). */
export function useSaveBlock(refetch: () => Promise<unknown>) {
  const { mutateAsync: saveBlock } = trpc.admin.saveBlock.useMutation();
  return useCallback(
    async (key: string, value: Fields) => {
      try {
        await saveBlock({ key, value });
        await refetch();
        return true;
      } catch (err) {
        toast.error(`Could not save: ${errorText(err)}`);
        return false;
      }
    },
    [saveBlock, refetch],
  );
}

/** Moves one card up or down in its list, then reloads. */
export function useMoveItem(refetch: () => Promise<unknown>) {
  const { mutateAsync: moveItem } = trpc.admin.moveItem.useMutation();
  return useCallback(
    async (id: string, direction: 'up' | 'down') => {
      if (!UUID.test(id)) return;
      try {
        await moveItem({ id, direction });
        await refetch();
      } catch (err) {
        toast.error(`Could not reorder: ${errorText(err)}`);
      }
    },
    [moveItem, refetch],
  );
}
