import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ICONS as SERVICE_ICONS } from '@/components/sections/ServiceGrid';
import type { ServiceContent } from '@/lib/pageContent';
import '@/styles/services-hero-engine.css';
import { FormattedText } from '@/components/ui/FormattedText';

// Hero-sized summary of each service (short name, one-liner, tags), edited per service on the Services page.
export default function ServicesHeroEngine({ items, note }: { items: ServiceContent[]; note: string }) {
  const [active, setActive] = useState(0);
  // Bumped on every change so the progress bar restarts, even when a tab is clicked twice.
  const [turn, setTurn] = useState(0);
  const count = items.length;
  const show = (i: number) => { setActive(i); setTurn(t => t + 1); };
  const next = () => show((active + 1) % count);

  return (
    <div className="she">
      {note && <p className="she-note" aria-hidden="true">
        <span className="she-note-text">
          {note.split('').map((ch, i) => <span key={i} style={{ '--i': i } as React.CSSProperties}>{ch}</span>)}
        </span>
        <svg viewBox="0 0 50 40" style={{ '--n': note.length } as React.CSSProperties}><path pathLength={1} d="M4 6 C 26 4, 42 14, 40 34" /><path pathLength={1} d="M32 28 L 40 36 L 47 27" /></svg>
      </p>}

      {/* Stack of service cards; the front one auto-advances when its tab's progress bar fills. */}
      <div className="she-stack" onClick={next} aria-live="polite">
        {items.map((service, i) => {
          const offset = (i - active + count) % count;
          const Icon = SERVICE_ICONS[service.iconKey]?.Icon;
          return (
            <article
              key={service.iconKey}
              className={`she-card is-pos-${offset === count - 1 ? 'out' : Math.min(offset, 3)}`}
              style={{ '--i': i } as React.CSSProperties}
              aria-hidden={offset !== 0}
            >
              <div className="she-card-top">
                <span className="she-card-icon">{Icon ? <Icon size={22} strokeWidth={2} aria-hidden="true" /> : service.index}</span>
                <span className="she-card-num">{String(i + 1).padStart(2, '0')}<small>/{String(count).padStart(2, '0')}</small></span>
              </div>
              <h3 className="she-card-title">{service.title}</h3>
              <p className="she-card-line"><FormattedText text={service.line || service.text} /></p>
              <div className="she-card-foot">
                <ul className="she-tags">{service.tags.map((tag, j) => <li key={j}>{tag}</li>)}</ul>
                <ArrowUpRight className="she-card-arrow" size={20} aria-hidden="true" />
              </div>
            </article>
          );
        })}
      </div>

      <div className="she-tabs">
        {items.map((service, i) => {
          const Icon = SERVICE_ICONS[service.iconKey]?.Icon;
          const isActive = i === active;
          return (
            <button
              key={service.iconKey}
              type="button"
              className={`she-tab${isActive ? ' is-active' : ''}`}
              style={{ '--i': i } as React.CSSProperties}
              onClick={() => show(i)}
              aria-label={service.title}
              aria-pressed={isActive}
            >
              {Icon ? <Icon size={16} strokeWidth={2.1} aria-hidden="true" /> : service.index}
              <span className="she-tab-label">{service.short}</span>
              {isActive && <i key={turn} className={`she-tab-progress${turn === 0 ? ' is-first' : ''}`} onAnimationEnd={next} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
