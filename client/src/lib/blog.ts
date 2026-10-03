import { defaultArticles, type BlogArticle } from '@/data/blog';
import { useCollection } from '@/lib/siteContent';

export type BlogPost = BlogArticle & { slug: string };

/** URL part for an article, e.g. "The page is part of the ad" -> "the-page-is-part-of-the-ad". */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const withSlug = (a: BlogArticle): BlogPost => ({ ...a, slug: slugify(a.title) });
const builtIn = defaultArticles.map(withSlug);
const builtInBySlug = new Map(builtIn.map((p) => [p.slug, p]));

/** Journal posts from the CMS; an empty excerpt/body falls back to the built-in article with the same slug. */
export function useBlogPosts(): BlogPost[] {
  return useCollection('blog', builtIn, (item) => {
    const slug = slugify(String(item.title ?? ''));
    const known = builtInBySlug.get(slug);
    return {
      slug,
      title: item.title ?? '',
      tag: item.tag || known?.tag || '',
      date: item.date || known?.date || '',
      readTime: item.readTime || known?.readTime || '',
      excerpt: item.excerpt || known?.excerpt || '',
      body: item.body || known?.body || '',
      style: item.style || known?.style || 'yellow',
      image: item.image || known?.image || '',
    };
  });
}

export type BodyBlock =
  | { kind: 'p'; text: string }
  | { kind: 'h2'; text: string; id: string }
  | { kind: 'quote'; text: string }
  | { kind: 'list'; items: string[] };

/** A plain (unindented) "- ", "* " or "• " bullet line. */
const BULLET = /^[-*•][ \t]+/;

/**
 * Splits an article body (blank-line separated; "## ", "> " and bullet prefixes) into renderable blocks. Paragraph
 * and quote text keeps its line breaks, indents and bullet / numbered points for FormattedText to show as typed, and
 * each extra blank line between paragraphs adds an empty line of space.
 */
export function parseBody(body: string): BodyBlock[] {
  const blocks: BodyBlock[] = [];
  const chunks = body.replace(/\r\n?/g, '\n').replace(/^\s*\n|\s+$/g, '').split(/\n[ \t]*\n/);
  for (const chunk of chunks) {
    const lines = chunk.split('\n').map((l) => l.trimEnd());
    if (!lines.some(Boolean)) {
      if (blocks.length) blocks.push({ kind: 'p', text: ' ' });
      continue;
    }
    const first = lines[0].trim();
    if (first.startsWith('## ')) {
      const text = first.slice(3).trim();
      blocks.push({ kind: 'h2', text, id: slugify(text) });
      if (lines.length > 1) blocks.push({ kind: 'p', text: lines.slice(1).join('\n') });
    } else if (lines.every((l) => BULLET.test(l))) {
      blocks.push({ kind: 'list', items: lines.map((l) => l.replace(BULLET, '').trim()) });
    } else if (lines.every((l) => l.trimStart().startsWith('>'))) {
      blocks.push({ kind: 'quote', text: lines.map((l) => l.trimStart().replace(/^>\s?/, '')).join('\n') });
    } else {
      blocks.push({ kind: 'p', text: lines.join('\n') });
    }
  }
  return blocks;
}
