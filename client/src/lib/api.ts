// In dev this is empty and requests go to /api/*, which Vite proxies to the backend on :3000.
// In production (Vercel) set VITE_API_URL to the Render backend, e.g. https://clyx-media-backend.onrender.com
export const API_URL: string = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/$/, '');

const TOKEN_KEY = 'clyx_admin_token';

// sessionStorage: the admin signs in again per browser session, and the token is gone when the tab closes.
export const adminToken = {
  get(): string | null {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch {
      // storage unavailable: the session just won't survive a reload
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  },
};

export const ADMIN_LOGOUT_EVENT = 'clyx-admin-logout';
