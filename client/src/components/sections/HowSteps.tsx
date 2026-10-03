import { useRef, type CSSProperties } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { pageDefaults } from '@/lib/pageContent';
import { FormattedText } from '@/components/ui/FormattedText';

export default function HowSteps({ content: c = pageDefaults('home') }: { content?: Record<string, string> }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useScrollReveal(ref);
  const steps = [1, 2, 3].map((n) => ({ title: c[`step${n}Title`], text: c[`step${n}Text`] })).filter((s) => s.title || s.text);

  return (
    <div ref={ref} className={`how-steps${visible ? ' is-visible' : ''}`}>
      {steps.map((step, index) => (
        <div key={index} className="how-step" style={{ '--hs-delay': `${index * 200}ms` } as CSSProperties}>
          <span className="how-num">{String(index + 1).padStart(2, '0')}</span>
          <div>
            <h4>{step.title}</h4>
            <p><FormattedText text={step.text} /></p>
          </div>
        </div>
      ))}
    </div>
  );
}
