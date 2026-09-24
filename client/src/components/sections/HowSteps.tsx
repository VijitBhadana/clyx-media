import { useRef, type CSSProperties } from 'react';
import { methodologySteps } from '../../data/home';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function HowSteps() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useScrollReveal(ref);

  return (
    <div ref={ref} className={`how-steps${visible ? ' is-visible' : ''}`}>
      {methodologySteps.map((step, index) => (
        <div key={step.index} className="how-step" style={{ '--hs-delay': `${index * 200}ms` } as CSSProperties}>
          <span className="how-num">{step.index}</span>
          <div>
            <h4>{step.title}</h4>
            <p>{step.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
