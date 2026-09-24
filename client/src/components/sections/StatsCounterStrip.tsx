import { useRef } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

// main.js re-renders the cards from CLYX_DATA.stats (innerHTML) and runs the count-up,
// so the reveal is toggled on the section itself, which main.js never replaces.
export default function StatsCounterStrip() {
  const ref = useRef<HTMLElement>(null);
  const visible = useScrollReveal(ref);

  return (
    <section ref={ref} className={`stats-counter-strip${visible ? ' is-visible' : ''}`}>
      <div className="stat-counter-card">
        <div className="counter-number counter" data-target="1" data-prefix="₹" data-suffix="Cr+">0</div>
        <div className="counter-label">Ad Spend Managed</div>
        <div className="counter-detail">Across Meta &amp; Google ad accounts</div>
      </div>
      <div className="stat-counter-card">
        <div className="counter-number counter" data-target="5" data-suffix="X+">0</div>
        <div className="counter-label">Average ROAS Lift</div>
        <div className="counter-detail">Whitelisted vs Standard brand ads</div>
      </div>
      <div className="stat-counter-card">
        <div className="counter-number counter" data-target="250" data-suffix="+">0</div>
        <div className="counter-label">Active Creators</div>
        <div className="counter-detail">Fashion, Beauty, Food, Tech benches</div>
      </div>
      <div className="stat-counter-card">
        <div className="counter-number counter" data-target="10" data-prefix="₹" data-suffix="Cr+">0</div>
        <div className="counter-label">Revenue Generated</div>
        <div className="counter-detail">Delivered for high-growth D2C brands</div>
      </div>
    </section>
  );
}
