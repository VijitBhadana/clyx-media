import { useEffect, useRef, useState } from 'react';
import { BarChart3, FlaskConical, RefreshCw, Rocket, Scissors, TrendingUp, type LucideIcon } from 'lucide-react';
import { Reveal } from '@/components/ui/ScrollMotion';
import { pageDefaults } from '@/lib/pageContent';
import '@/styles/case-pattern.css';

// Card icons stay fixed; the copy on each step comes from the Case Studies page content.
const ICONS: LucideIcon[] = [TrendingUp, Scissors, FlaskConical, BarChart3, RefreshCw, Rocket];

// Noise on the left settling into a clean, growing wave on the right: "find the signal, scale the signal".
const NOISE_PATH = 'M2 34 L10 30 L16 37 L23 29 L30 36 L37 31 L44 38 L51 28 L58 35 L65 31 L72 37 L79 30 L86 34 L94 32';
const SIGNAL_PATH = 'M94 32 C104 32 108 24 118 24 S132 40 142 40 S160 16 172 16 S192 48 206 48 S228 8 244 8 S268 54 284 54 S312 4 330 4';

function SignalWave() {
  return (
    <svg className="cp-wave" viewBox="0 0 340 60" fill="none" aria-hidden="true">
      <path className="cp-wave-noise" d={NOISE_PATH} pathLength={1} />
      <path className="cp-wave-signal" d={SIGNAL_PATH} pathLength={1} />
      <circle className="cp-wave-dot" cx="330" cy="4" r="4" />
    </svg>
  );
}

// How far the page scrolls for each pixel the steps move while the panel is pinned. Above 1 the steps move
// slower than the scroll, so each one gets a little longer on screen.
const SCROLL_RATE = 1.3;

// The "recurring pattern" block on the Case Studies page. On desktop the whole panel pins below the header at a
// fixed height and page scroll moves the six steps up through the white half; after the last step it releases.
// Below 1024px it is a normal stacked block.
export default function CasePattern({ content: c = pageDefaults('caseStudies') }: { content?: Record<string, string> }) {
  const lines = c.patternTitle.split('\n').filter(Boolean);
  const steps = ICONS.map((Icon, i) => ({
    Icon,
    tag: c[`patternStep${i + 1}Tag`],
    title: c[`patternStep${i + 1}Title`],
    text: c[`patternStep${i + 1}Text`],
  })).filter((s) => s.title || s.text);

  const trackRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    const panel = panelRef.current;
    const win = windowRef.current;
    const flow = flowRef.current;
    if (!track || !panel || !win || !flow) return;
    const desktop = window.matchMedia('(min-width: 1024px)');
    const count = steps.length;
    let distance = 0;
    let frame = 0;

    // Page scroll -> progress through the pinned stretch -> how far the steps have moved and which one is active.
    const update = () => {
      frame = 0;
      if (!desktop.matches) return;
      const pinTop = parseFloat(getComputedStyle(panel).top) || 0;
      const rect = track.getBoundingClientRect();
      const travel = rect.height - panel.offsetHeight;
      const progress = travel > 0 ? Math.min(1, Math.max(0, (pinTop - rect.top) / travel)) : 0;
      flow.style.transform = `translate3d(0, ${-progress * distance}px, 0)`;
      setActive(Math.round(progress * (count - 1)));
    };
    // The track is as tall as the panel plus the scroll it takes to move every step through the white half.
    const measure = () => {
      if (!desktop.matches) {
        track.style.height = '';
        flow.style.transform = '';
        setActive(-1);
        return;
      }
      distance = Math.max(0, flow.offsetHeight - win.clientHeight);
      track.style.height = `${panel.offsetHeight + distance * SCROLL_RATE}px`;
      update();
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };

    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(flow);
    resize.observe(win);
    window.addEventListener('scroll', onScroll, { passive: true });
    desktop.addEventListener('change', measure);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('scroll', onScroll);
      desktop.removeEventListener('change', measure);
    };
  }, [steps.length]);

  return (
    <section className="cp-section bg-blue">
      <div className="container">
        <div ref={trackRef} className="cp-track">
          <div ref={panelRef} className="cp-panel">
            <Reveal className="cp-intro">
              {c.patternLabel && <p className="cp-label"><span className="cp-pulse" aria-hidden="true" />{c.patternLabel}</p>}
              <h2 className="cp-title">
                {lines.map((line, i) => (
                  <span
                    key={i}
                    className={`cp-title-line${i === lines.length - 1 && lines.length > 1 ? ' is-hl' : ''}`}
                    style={{ '--i': i } as React.CSSProperties}
                  >
                    {line}
                  </span>
                ))}
              </h2>
              {c.patternText && <p className="cp-text">{c.patternText}</p>}
              <SignalWave />
            </Reveal>

            <div ref={windowRef} className="cp-flow-window">
              <ol ref={flowRef} className="cp-flow">
                {steps.map(({ Icon, tag, title, text }, i) => (
                  <li key={i}>
                    <Reveal delay={i < 3 ? i * 100 : 0} className="cp-step-reveal">
                      <div className={`cp-step${i === active ? ' is-active' : ''}`}>
                        <span className="cp-step-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                        <div>
                          {tag && <p className="cp-step-tag"><Icon size={14} strokeWidth={2.4} aria-hidden="true" />{tag}</p>}
                          <h3 className="cp-step-title">{title}</h3>
                          {text && <p className="cp-step-text">{text}</p>}
                        </div>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
