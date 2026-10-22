// Runs after `vite build`. Every route is the same React app, so without this every page's HTML carries the
// homepage's title and description until JavaScript runs. Crawlers and link previews (WhatsApp, LinkedIn, Bing) that
// do not run JavaScript would see the homepage everywhere. For each fixed page in client/src/data/seo.json this writes
// dist/public/_seo/<path>.html: the built index.html with that page's title, description, canonical address, link
// preview tags and breadcrumb. vercel.json rewrites each address to its file. It also writes sitemap.xml from the
// same list. The page content and design are untouched: only <head> differs.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'dist', 'public');
const SITE_URL = 'https://www.clyxmedia.com';
const pages = JSON.parse(readFileSync(path.join(root, 'client', 'src', 'data', 'seo.json'), 'utf8'));
const template = readFileSync(path.join(out, 'index.html'), 'utf8');

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Swaps one tag's content in the template, failing the build if index.html no longer has that tag. */
function setTag(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`[seo-pages] index.html is missing ${pattern}`);
  return html.replace(pattern, () => replacement);
}

/** Home > Services > UGC Videos, from the page's parent addresses that are listed too. */
function breadcrumb(route) {
  const parts = route.split('/').filter(Boolean);
  const trail = ['/', ...parts.map((_, i) => `/${parts.slice(0, i + 1).join('/')}`)].filter((p) => pages[p]);
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: pages[p].name,
      item: `${SITE_URL}${p === '/' ? '/' : p}`,
    })),
  };
}

function pageHtml(route, { title, description }) {
  const url = `${SITE_URL}${route}`;
  const t = escape(title);
  const d = escape(description);
  let html = template;
  html = setTag(html, /<title>[^<]*<\/title>/, `<title>${t}</title>`);
  html = setTag(html, /<meta name="description" content="[^"]*"\/>/, `<meta name="description" content="${d}"/>`);
  html = setTag(html, /<meta property="og:title" content="[^"]*"\/>/, `<meta property="og:title" content="${t}"/>`);
  html = setTag(html, /<meta property="og:description" content="[^"]*"\/>/, `<meta property="og:description" content="${d}"/>`);
  html = setTag(html, /<meta name="twitter:title" content="[^"]*"\/>/, `<meta name="twitter:title" content="${t}"/>`);
  html = setTag(html, /<meta name="twitter:description" content="[^"]*"\/>/, `<meta name="twitter:description" content="${d}"/>`);
  const extra = [
    `<link rel="canonical" href="${url}"/>`,
    `<meta property="og:url" content="${url}"/>`,
    `<script type="application/ld+json">${JSON.stringify(breadcrumb(route)).replace(/</g, '\\u003c')}</script>`,
  ].join('');
  return setTag(html, /<\/head>/, `${extra}</head>`);
}

const routes = Object.keys(pages);
for (const route of routes) {
  if (route === '/') continue; // "/" is index.html itself, which also serves every other address (see useCanonicalUrl)
  const file = path.join(out, '_seo', `${route.slice(1)}.html`);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, pageHtml(route, pages[route]));
}

// Blog, portfolio and case study pages come from the CMS; Google finds them through the links on their list pages.
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map((r) => `  <url><loc>${SITE_URL}${r}</loc></url>`),
  '</urlset>',
  '',
].join('\n');
writeFileSync(path.join(out, 'sitemap.xml'), sitemap);

// vercel.json and seo.json must list the same pages: a rewrite to a missing file would be a 404 on a live page.
const vercel = JSON.parse(readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const rewritten = new Map(vercel.rewrites.filter((r) => r.destination.startsWith('/_seo/')).map((r) => [r.source, r.destination]));
const problems = [];
for (const route of routes.filter((r) => r !== '/')) {
  if (rewritten.get(route) !== `/_seo${route}.html`) problems.push(`vercel.json needs { "source": "${route}", "destination": "/_seo${route}.html" }`);
}
for (const [source, destination] of rewritten) {
  if (!existsSync(path.join(out, destination))) problems.push(`vercel.json rewrites ${source} to ${destination}, which seo.json does not list`);
}
if (problems.length) throw new Error(`[seo-pages]\n  ${problems.join('\n  ')}`);

console.log(`[seo-pages] Wrote ${routes.length - 1} page heads and a sitemap with ${routes.length} addresses.`);
