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

export const MAX_VIDEO_MB = 50;
export const VIDEO_ACCEPT = 'video/mp4,video/webm,video/quicktime';

/** Uploads a video straight to storage with a one-time link from the backend; reports progress 0–1. Returns its public URL. */
export async function uploadVideo(file: File, onProgress?: (share: number) => void): Promise<string> {
  const res = await fetch(`${API_URL}/api/admin/upload-video`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken.get() ?? ''}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: file.type, size: file.size }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Upload failed (${res.status})`);
  const { uploadUrl, url } = json as { uploadUrl: string; url: string };
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Storage refused the file (${xhr.status})`)));
    xhr.onerror = () => reject(new Error('Network error while uploading'));
    xhr.send(file);
  });
  return url;
}
