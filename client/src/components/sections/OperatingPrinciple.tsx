import { BarChart3, Eye, MousePointerClick, RefreshCw, ShoppingBag } from 'lucide-react';
import { Reveal } from '@/components/ui/ScrollMotion';
import { Lines } from '@/components/ui/Lines';
import { pageDefaults } from '@/lib/pageContent';
import '@/styles/operating-principle.css';
import { FormattedText } from '@/components/ui/FormattedText';

// Four stops on the feedback loop, placed clockwise from the top. Labels come from opLoop1..4.
const LOOP = [
  { Icon: Eye, pos: 'top' },
  { Icon: MousePointerClick, pos: 'right' },
  { Icon: ShoppingBag, pos: 'bottom' },
  { Icon: BarChart3, pos: 'left' },
];

export default function OperatingPrinciple({ content: c = pageDefaults('services') }: { content?: Record<string, string> }) {
  // How the loop plays out, shown as a short numbered list under the intro.
  const steps = [1, 2, 3].map((n) => ({ title: c[`opStep${n}Title`], text: c[`opStep${n}Text`] })).filter((s) => s.title || s.text);
  const highlight = c.opHighlight;
  const note = c.opNote;
  const loop = LOOP.map((stop, i) => ({ ...stop, label: c[`opLoop${i + 1}`] }));
  return (
    <section className="op-principle bg-yellow">
      <Reveal className="op-inner container">
        <div className="op-head">
          <p className="op-eyebrow"><RefreshCw size={13} strokeWidth={2.4} aria-hidden="true" />{c.opEyebrow}</p>
          <h2 className="display op-title">{c.opTitle} <span className="op-highlight" aria-label={highlight}>
            {highlight.split('').map((ch, i) => <span key={i} className={`op-ch${ch === '.' ? ' is-dot' : ''}`} style={{ '--i': i } as React.CSSProperties} aria-hidden="true">{ch}</span>)}
          </span></h2>
        </div>

        <div className="op-body">
          <p className="op-text"><FormattedText text={c.opText} /></p>
          <ol className="op-steps">
            {steps.map((step, i) => (
              <li key={i} style={{ '--i': i } as React.CSSProperties}>
                <span className="op-step-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span><b>{step.title}</b><small>{step.text}</small></span>
              </li>
            ))}
          </ol>
        </div>

        <div className="op-loop-col">
          {note && <p className="op-note" aria-hidden="true">
            <span className="op-note-text">
              {note.split('').map((ch, i) => <span key={i} style={{ '--i': i } as React.CSSProperties}>{ch}</span>)}
            </span>
            <svg viewBox="0 0 50 40" style={{ '--n': note.length } as React.CSSProperties}><path pathLength={1} d="M4 6 C 26 4, 42 14, 40 34" /><path pathLength={1} d="M32 28 L 40 36 L 47 27" /></svg>
          </p>}
          <div className="op-loop" role="img" aria-label={`Feedback loop: ${loop.map((stop) => stop.label).join(', ')}, then repeat`}>
            <svg className="op-ring" viewBox="0 0 240 240" aria-hidden="true">
              <circle cx="120" cy="120" r="92" />
            </svg>
            <span className="op-orbit" aria-hidden="true"><i /></span>
            <div className="op-core">
              <RefreshCw size={18} strokeWidth={2.2} aria-hidden="true" />
              <span><Lines text={c.opCore} /></span>
            </div>
            {loop.map(({ label, Icon, pos }) => (
              <span key={pos} className={`op-node is-${pos}`}><Icon size={14} strokeWidth={2.2} aria-hidden="true" />{label}</span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
