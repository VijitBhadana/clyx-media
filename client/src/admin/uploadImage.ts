import { API_URL, adminToken } from '@/lib/api';

/** Uploads an image to the backend (which stores it in Supabase Storage) and returns its public URL. */
export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch(`${API_URL}/api/admin/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken.get() ?? ''}` },
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Upload failed (${res.status})`);
  return json.url as string;
}
