import { ArrowDown, ArrowUpRight, Asterisk, PenLine } from 'lucide-react';
import { DirectionalReveal, Reveal } from '@/components/ui/ScrollMotion';
import type { BlogPost } from '@/lib/blog';
import '@/styles/journal-hero.css';

// Blog hero: a cream magazine masthead. Title and copy on the left, the latest three posts as an
// "In this issue" index on the right, and a scrolling strip of topics along the bottom edge.
export default function JournalHero({ c, posts }: { c: Record<string, string>; posts: BlogPost[] }) {
  const latest = posts.slice(0, 3);
  const topics = (c.journalTopics || '').split(',').map((x) => x.trim()).filter(Boolean);
  // The strip scrolls by half its width, so each half repeats the topics until it is wide enough to fill the screen.
  const half = topics.length ? Array.from({ length: Math.ceil(12 / topics.length) }, () => topics).flat() : [];
  return (
    <>
      <div className="container">
        <div className="jh-mast">
          <span className="jh-mast-name">{c.journalName}</span>
          <span className="jh-mast-rule" aria-hidden="true" />
          <span className="jh-mast-meta">{c.journalCadence}</span>
        </div>

        <div className={`jh-grid${latest.length ? '' : ' is-solo'}`}>
          <Reveal className="jh-copy">
            <p className="jh-eyebrow"><PenLine size={13} aria-hidden="true" />{c.journalEyebrow}</p>
            <h1 className="jh-title">{c.journalTitle}{c.journalHighlight && <><br /><span className="jh-hl">{c.journalHighlight}</span></>}</h1>
            {c.journalIntro && <p className="jh-intro">{c.journalIntro}</p>}
          </Reveal>

          {latest.length > 0 && (
            <DirectionalReveal direction="right" delay={300}>
              <nav className="jh-index" aria-label={c.journalIndexLabel}>
                <p className="jh-index-label"><span>{c.journalIndexLabel}</span><span>{String(latest.length).padStart(2, '0')}</span></p>
                <ol>
                  {latest.map((post, i) => (
                    <li key={post.slug}>
                      <a href={`/blog/${post.slug}`} className="jh-row">
                        <span className="jh-row-num">{String(i + 1).padStart(2, '0')}</span>
                        <span className="jh-row-body">
                          {post.tag && <span className="jh-row-tag">{post.tag}</span>}
                          <span className="jh-row-title">{post.title}</span>
                        </span>
                        <span className="jh-row-end">
                          {post.readTime && <span className="jh-row-time">{post.readTime}</span>}
                          <ArrowUpRight size={16} className="jh-row-arrow" aria-hidden="true" />
                        </span>
                      </a>
                    </li>
                  ))}
                </ol>
                {c.journalIndexButton && <a href="#articles" className="jh-index-btn">{c.journalIndexButton}<ArrowDown size={15} aria-hidden="true" /></a>}
              </nav>
            </DirectionalReveal>
          )}
        </div>
      </div>

      {topics.length > 0 && (
        <div className="jh-ticker" aria-hidden="true">
          <div className="jh-ticker-track">
            {[...half, ...half].map((topic, i) => <span key={i} className="jh-ticker-item">{topic}<Asterisk size={18} strokeWidth={2.6} /></span>)}
          </div>
        </div>
      )}
    </>
  );
}
