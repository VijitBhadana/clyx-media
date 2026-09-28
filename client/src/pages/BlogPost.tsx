import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { ArrowLeft, ArrowUpRight, Clock3 } from 'lucide-react';
import { useParams } from 'wouter';
import Header from '@/components/layout/Header';
import { CookieBar, Footer, WhatsAppButton } from '@/components/layout/Footer';
import { Reveal } from '@/components/ui/ScrollMotion';
import { parseBody, useBlogPosts } from '@/lib/blog';
import { useSiteContent } from '@/lib/siteContent';
import { safeHref, usePageContent } from '@/lib/pageContent';
import NotFound from './NotFound';
import '@/styles/blog-article.css';

/**
 * Articles always read on the light theme, whatever the visitor picked elsewhere. The saved choice is left alone,
 * so the next page's Header puts dark mode back.
 */
function useForceLightTheme() {
  // Before the first paint, so there is no dark flash…
  useLayoutEffect(() => { document.documentElement.classList.remove('dark'); }, []);
  // …and again after Header's own theme effect, which runs first because children's effects run before parents'.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    return () => {
      try {
        if (localStorage.getItem('clyx-theme') === 'dark') root.classList.add('dark');
      } catch {
        // storage unavailable: the next Header decides
      }
    };
  }, []);
}

/** Thin yellow bar across the top that fills as the article is read. */
function ReadingProgress({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = target.current;
      if (!el || !bar.current) return;
      const { top, height } = el.getBoundingClientRect();
      const total = height - window.innerHeight * 0.6;
      const progress = total > 0 ? Math.min(1, Math.max(0, -top / total)) : 1;
      bar.current.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [target]);
  return <div className="ba-progress" aria-hidden="true"><div ref={bar} className="ba-progress-bar" /></div>;
}

export default function BlogPost() {
  const { slug = '' } = useParams<{ slug: string }>();
  const posts = useBlogPosts();
  const { data } = useSiteContent();
  const c = usePageContent('blog');
  const post = posts.find((p) => p.slug === slug);
  const blocks = useMemo(() => parseBody(post?.body ?? ''), [post?.body]);
  const headings = blocks.filter((b) => b.kind === 'h2');
  const more = posts.filter((p) => p.slug !== slug).slice(0, 3);
  const articleRef = useRef<HTMLElement>(null);
  useForceLightTheme();

  useEffect(() => {
    if (!post) return;
    const previous = document.title;
    document.title = `${post.title} | CLYX Journal`;
    return () => { document.title = previous; };
  }, [post?.title]);

  // A post added in the CMS is only known once the content has loaded; until then the page stays blank.
  if (!post) return data?.collections ? <NotFound /> : <div className="blog-article min-h-screen" />;

  return (
    <div className="blog-article min-h-screen">
      <ReadingProgress target={articleRef} />
      <Header />
      <main>
        <header className="ba-hero">
          <div className="ba-hero-glow" aria-hidden="true" />
          <div className="container ba-hero-inner">
            <Reveal>
              <a href="/blog" className="ba-back"><ArrowLeft size={16} aria-hidden="true" /> {c.articleBackLabel || 'All articles'}</a>
              <div className="ba-meta">
                {post.tag && <span className="ba-tag">{post.tag}</span>}
                {post.readTime && <span className="ba-read"><Clock3 size={14} aria-hidden="true" />{post.readTime}</span>}
              </div>
              <h1 className="ba-title">{post.title}</h1>
              {post.excerpt && <p className="ba-lede">{post.excerpt}</p>}
              <p className="ba-byline"><span className="ba-byline-mark" aria-hidden="true">C</span>{c.articleByline || 'CLYX Media · Journal'}</p>
            </Reveal>
          </div>
        </header>

        <div className="container ba-layout">
          <article ref={articleRef} className="ba-body">
            {blocks.map((b, i) => {
              if (b.kind === 'h2') return <h2 key={i} id={b.id}>{b.text}</h2>;
              if (b.kind === 'quote') return <blockquote key={i}>{b.text}</blockquote>;
              if (b.kind === 'list') return <ul key={i}>{b.items.map((item, j) => <li key={j}>{item}</li>)}</ul>;
              return <p key={i}>{b.text}</p>;
            })}
          </article>

          <aside className="ba-aside">
            <div className="ba-aside-sticky">
              {headings.length > 1 && (
                <nav className="ba-toc" aria-label={c.articleTocLabel || 'On this page'}>
                  <p className="ba-aside-label">{c.articleTocLabel || 'On this page'}</p>
                  <ol>{headings.map((h) => <li key={h.id}><a href={`#${h.id}`}>{h.text}</a></li>)}</ol>
                </nav>
              )}
              <div className="ba-cta">
                <p className="ba-cta-title">{c.articleCtaTitle || 'Want this working for your brand?'}</p>
                <p className="ba-cta-text">{c.articleCtaText || 'We run the creator ads, the testing loop and the pages that convert.'}</p>
                <a href={safeHref(c.articleCtaUrl || '/contact')} className="ba-cta-btn">{c.articleCtaButton || 'Talk to CLYX'} <ArrowUpRight size={16} aria-hidden="true" /></a>
              </div>
            </div>
          </aside>
        </div>

        {more.length > 0 && (
          <section className="ba-more">
            <div className="container">
              <div className="ba-more-head">
                <h2>{c.articleMoreTitle || 'Keep reading'}</h2>
                <a href="/blog" className="ba-more-all">{c.articleBackLabel || 'All articles'} <ArrowUpRight size={16} aria-hidden="true" /></a>
              </div>
              <div className="ba-more-grid">
                {more.map((p) => (
                  <a key={p.slug} href={`/blog/${p.slug}`} className="ba-more-card">
                    <div className="ba-more-top">
                      <span>{p.tag}</span>
                      <ArrowUpRight size={18} className="ba-more-arrow" aria-hidden="true" />
                    </div>
                    <h3>{p.title}</h3>
                    {p.readTime && <p className="ba-more-read">{p.readTime}</p>}
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
      <WhatsAppButton />
      <CookieBar />
    </div>
  );
}
