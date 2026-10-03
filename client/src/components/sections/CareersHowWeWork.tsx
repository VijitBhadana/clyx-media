import { Fragment, useRef, type CSSProperties } from 'react';
import { Sparkles, Target, Users, type LucideIcon } from 'lucide-react';
import { Label, Section } from '@/components/ui/primitives';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import '@/styles/careers-how.css';
import { FormattedText } from '@/components/ui/FormattedText';

// Chip icons stay fixed by position; chip text and flow steps come from the Careers page content (comma separated).
const POINT_ICONS: LucideIcon[] = [Users, Target, Sparkles];
const list = (value?: string) => (value ?? '').split(',').map((s) => s.trim()).filter(Boolean);

// "How we work" on Careers: heading with culture chips on the left, copy and a brief → result track on the right.
export default function CareersHowWeWork({ c }: { c: Record<string, string> }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useScrollReveal(ref);
  const points = list(c.howPoints);
  const steps = list(c.howFlow);
  const highlightWords = (c.howHighlight ?? '').split(/\s+/).filter(Boolean);

  return (
    <Section className="how-work">
      <span className="how-work-grid" aria-hidden="true" />
      <div ref={ref} className={`split-intro grid gap-10 md:grid-cols-2 md:items-start${visible ? ' is-visible' : ''}`}>
        <div>
          <Label>{c.howLabel}</Label>
          <h2 className="display how-work-title mt-5 max-w-2xl text-4xl font-bold md:text-6xl">{c.howTitle}<br />
            <span className="text-blue how-work-highlight">
              {highlightWords.map((word, i) => (
                <Fragment key={`${word}-${i}`}>
                  {i > 0 && ' '}
                  <span className="how-hl-word" style={{ '--i': i } as CSSProperties}>{word}</span>
                </Fragment>
              ))}
            </span>
          </h2>
          {points.length > 0 && (
            <ul className="how-points">
              {points.map((point, i) => {
                const Icon = POINT_ICONS[i % POINT_ICONS.length];
                return (
                  <li key={point} style={{ '--i': i } as CSSProperties}>
                    <Icon size={15} strokeWidth={2.2} aria-hidden="true" />
                    {point}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="space-y-6 text-base leading-7 text-muted md:pt-10">
          {c.howText1 && <p><FormattedText text={c.howText1} /></p>}
          {c.howText2 && <p><FormattedText text={c.howText2} /></p>}
          {steps.length > 1 && (
            <ol className="how-flow" style={{ '--n': steps.length } as CSSProperties}>
              {steps.map((step, i) => (
                <li key={step} style={{ '--i': i } as CSSProperties}>
                  <span className="how-flow-dot" aria-hidden="true" />
                  {step}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </Section>
  );
}
