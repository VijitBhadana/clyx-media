// Saves the backend's public content to client/public/content-snapshot.json, which ships with the site.
// The website falls back to it when the backend is down, so visitors never see the placeholder data.
// Runs before every build; if the backend can't be reached the existing snapshot is kept and the build goes on.
//   npm run snapshot                          (uses VITE_API_URL from the environment or .env files)
//   API=http://localhost:3011 npm run snapshot
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'client', 'public', 'content-snapshot.json');

function envFileValue(name) {
  for (const file of ['.env.production.local', '.env.local', '.env.production', '.env', '.env.development.local']) {
    try {
      const line = readFileSync(path.join(root, file), 'utf8')
        .split(/\r?\n/)
        .find((l) => l.startsWith(`${name}=`));
      if (line) return line.slice(name.length + 1).trim();
    } catch {
      // file missing
    }
  }
  return '';
}

const api = (process.env.API || process.env.VITE_API_URL || envFileValue('VITE_API_URL')).replace(/\/$/, '');

if (!api) {
  console.warn('[snapshot] No VITE_API_URL set, keeping the existing content snapshot.');
  process.exit(0);
}

try {
  // A free Render instance can take ~50s to wake up.
  const res = await fetch(`${api}/api/public/content`, { signal: AbortSignal.timeout(90_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data?.blocks || !data?.collections) throw new Error('unexpected response shape');
  writeFileSync(out, JSON.stringify({ ...data, savedAt: Date.now() }));
  console.log(`[snapshot] Saved content from ${api} (${data.collections.team?.length ?? 0} team members).`);
} catch (err) {
  console.warn(`[snapshot] Could not reach ${api} (${err.message}), keeping the existing content snapshot.`);
}
