import { MessagesSquare, RefreshCw, Sparkles, type LucideIcon } from 'lucide-react';
import { Reveal } from '@/components/ui/ScrollMotion';
import { Lines } from '@/components/ui/Lines';
import { pageDefaults } from '@/lib/pageContent';
import '@/styles/about-values.css';
import { FormattedText } from '@/components/ui/FormattedText';

// Card icons stay fixed; the copy on each card comes from the About page content.
const ICONS: LucideIcon[] = [MessagesSquare, Sparkles, RefreshCw];

// The yellow "principles" band on the About page. It stays yellow in both themes.
export default function AboutValues({ content = pageDefaults('about') }: { content?: Record<string, string> }) {
  const c = content;
  const values = ICONS.map((Icon, i) => ({
    Icon,
    title: c[`value${i + 1}Title`],
    text: c[`value${i + 1}Text`],
    tag: c[`value${i + 1}Tag`],
  }));
  return (
    <section className="bg-yellow text-dark values-band">
      <div className="container values-inner">
        <Reveal className="values-head">
          <div>
            <p className="values-eyebrow"><span className="values-eyebrow-dot" />{c.valuesEyebrow}</p>
            <div className="values-title-row">
              <h2 className="display values-title"><Lines text={c.valuesTitle} /></h2>
              {/* Hand-drawn arrow with one curl, leaving the heading and turning down at the cards. Draws in on reveal. */}
              <svg className="values-arrow" viewBox="0 0 124 150" fill="none" aria-hidden="true">
                <path
                  className="values-arrow-line"
                  pathLength={1}
                  d="M6 34C34 22 70 20 88 40C104 58 92 82 72 76C54 70 62 44 82 50C104 56 108 84 104 136"
                />
                <path className="values-arrow-head" pathLength={1} d="M91 123L104 138L117 124" />
              </svg>
            </div>
          </div>
          <p className="values-intro"><FormattedText text={c.valuesIntro} /></p>
        </Reveal>

        <div className="values-grid">
          {values.map(({ title, text, tag, Icon }, i) => (
            <Reveal key={i} delay={i * 140}>
              <div className="values-card">
                <span className="values-num display" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <div className="values-card-top">
                  <span className="values-icon"><Icon size={19} strokeWidth={2.2} /></span>
                  <p className="values-tag">{tag}</p>
                </div>
                <h3 className="display values-card-title">{title}</h3>
                <p className="values-card-text"><FormattedText text={text} /></p>
                <span className="values-bar" aria-hidden="true" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
