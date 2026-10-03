import { Fragment } from 'react';
import { HeartHandshake, Sparkles, Zap, type LucideIcon } from 'lucide-react';
import { Reveal } from '@/components/ui/ScrollMotion';
import { pageDefaults } from '@/lib/pageContent';
import '@/styles/creator-types.css';
import { FormattedText } from '@/components/ui/FormattedText';

// Card icons stay fixed; the copy on each card comes from the Creators page content.
const ICONS: LucideIcon[] = [Zap, HeartHandshake, Sparkles];

// The blue "creator types" band on the Creators page. It stays blue in both themes.
export default function CreatorTypes({ content: c = pageDefaults('creators') }: { content?: Record<string, string> }) {
  const types = ICONS.map((Icon, i) => ({
    Icon,
    tag: c[`type${i + 1}Tag`],
    title: c[`type${i + 1}Title`],
    text: c[`type${i + 1}Text`],
  }));
  return (
    <section className="ct-band bg-blue text-white">
      <div className="container ct-inner">
        <Reveal className="ct-head">
          <div>
            <p className="ct-eyebrow"><span className="ct-eyebrow-dot" />{c.typesEyebrow}</p>
            <h2 className="display ct-title">
              {c.typesTitle}{' '}
              <span className="ct-highlight text-yellow" aria-label={c.typesHighlight}>
                {(c.typesHighlight || '').split('').map((ch, i) => (
                  <span key={i} className="ct-ch" style={{ '--i': i } as React.CSSProperties} aria-hidden="true">{ch === ' ' ? ' ' : ch}</span>
                ))}
              </span>
            </h2>
          </div>
          <p className="ct-intro"><FormattedText text={c.typesIntro} /></p>
        </Reveal>

        <div className="ct-grid">
          {types.map(({ Icon, tag, title, text }, i) => (
            <Reveal key={i} delay={i * 140}>
              <article className={`ct-card${i === 0 ? ' is-yellow' : ''}`} style={{ '--card-delay': `${i * 140}ms` } as React.CSSProperties}>
                <span className="ct-num display" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <div className="ct-card-top">
                  <span className="ct-icon"><Icon size={24} strokeWidth={2.1} /></span>
                  {tag && <p className="ct-tag">{tag}</p>}
                </div>
                <h3 className="display ct-card-title" aria-label={title}>
                  {(title || '').split(' ').map((word, w) => (
                    <Fragment key={w}>
                      {w > 0 && ' '}
                      <span className="ct-word" aria-hidden="true">
                        <span style={{ '--w': w } as React.CSSProperties}>{word}</span>
                      </span>
                    </Fragment>
                  ))}
                </h3>
                <p className="ct-card-text"><FormattedText text={text} /></p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
