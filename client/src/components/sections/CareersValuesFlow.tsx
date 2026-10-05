import { useRef } from 'react';
import { ArrowUpRight, Hammer, MonitorPlay, TrendingUp } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { FormattedText } from '@/components/ui/FormattedText';
import DustHeading from '@/components/ui/DustHeading';

const ICONS = [MonitorPlay, Hammer, TrendingUp];

/** Cards light up softly under the pointer: the cursor position is written to CSS vars, no re-render. */
function trackPointer(e: React.PointerEvent<HTMLElement>) {
  const el = e.currentTarget, r = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - r.left}px`);
  el.style.setProperty('--my', `${e.clientY - r.top}px`);
}

type Props = {
  label: string;
  title: string;
  highlight: string;
  intro?: string;
  values: { title: string; text?: string }[];
  /** "View courses" button inside the main card. */
  cta?: { label: string; href: string };
};

/**
 * Courses teaser at the end of the Careers page: a two-card bento. The large card carries the pitch and the
 * button to the Courses page; the side card lists what a course gives you.
 */
export default function CareersValuesFlow({ label, title, highlight, intro, values, cta }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useScrollReveal(rootRef);
  const points = values.filter(v => v.title);
  return (
    <div ref={rootRef} className={`learn-bento grid gap-4 lg:grid-cols-12 lg:gap-5${inView ? ' is-in' : ''}`}>
      <div className="learn-card learn-card-main lg:col-span-7" onPointerMove={trackPointer}>
        <div className="learn-card-grid" aria-hidden="true" />
        <div className="learn-card-glow" aria-hidden="true" />
        <div className="relative z-[1] flex h-full flex-col">
          <span className="learn-pill"><span className="learn-pill-dot" aria-hidden="true" />{label}</span>
          <DustHeading
            title={title}
            highlight={highlight}
            highlightClassName="learn-highlight"
            className="display vf-heading mt-7 text-4xl font-bold text-white sm:text-5xl lg:text-6xl"
          />
          {intro && <p className="mt-6 max-w-lg text-base leading-7 text-white/70"><FormattedText text={intro} /></p>}
          {cta && (
            <div className="mt-10 lg:mt-auto lg:pt-12">
              <a href={cta.href} className="learn-cta">
                {cta.label}
                <span className="learn-cta-icon" aria-hidden="true"><ArrowUpRight size={18} strokeWidth={2.4} /></span>
              </a>
            </div>
          )}
        </div>
      </div>

      {points.length > 0 && (
        <div className="learn-card learn-card-side lg:col-span-5" onPointerMove={trackPointer}>
          <ul className="relative z-[1] flex h-full flex-col">
            {points.map((point, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <li key={i} className="learn-point" style={{ '--d': `${200 + i * 110}ms` } as React.CSSProperties}>
                  <span className="learn-point-icon"><Icon size={20} strokeWidth={2} /></span>
                  <div className="min-w-0">
                    <h3 className="display vf-heading text-xl font-bold md:text-2xl">{point.title}</h3>
                    {point.text && <p className="mt-2 text-sm leading-6 text-muted"><FormattedText text={point.text} /></p>}
                  </div>
                  <span className="learn-point-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
