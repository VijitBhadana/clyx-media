import { useEffect, useMemo, useRef } from 'react';
import { pageDefaults, splitLines } from '@/lib/pageContent';
import '@/styles/case-story.css';
import { FormattedText } from '@/components/ui/FormattedText';

type Chapter = { tag: string; brand: string; logo: string; points: string[] };

/** "Tag | Brand | Logo | Point 1 | Point 2" rows from the admin. */
const chaptersOf = (text: string): Chapter[] =>
  splitLines(text)
    .map((line) => line.split('|').map((cell) => cell.trim()))
    .filter(([, brand]) => brand)
    .map(([tag = '', brand, logo = '', ...points]) => ({ tag, brand, logo, points: points.filter(Boolean).slice(0, 2) }));

// Isometric glass cubes for the left card, back to front: [x of the top corner, y of the top corner, edge size].
const CUBES: [number, number, number][] = [
  [262, 92, 70],
  [92, 150, 86],
  [214, 236, 118],
  [70, 360, 74],
  [262, 420, 96],
  [140, 470, 70],
];
// Small cubes that float in front of the stack; the last one is the yellow "signal".
const FLOATERS: [number, number, number][] = [
  [52, 70, 26],
  [176, 128, 18],
  [300, 318, 22],
  [100, 300, 30],
];

const K = 0.866; // cos 30°
const pts = (list: number[][]) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

function Cube({ x, y, s, tone = 'glass' }: { x: number; y: number; s: number; tone?: 'glass' | 'signal' }) {
  const top = pts([[x, y], [x + K * s, y + s / 2], [x, y + s], [x - K * s, y + s / 2]]);
  const left = pts([[x - K * s, y + s / 2], [x, y + s], [x, y + 2 * s], [x - K * s, y + 1.5 * s]]);
  const right = pts([[x, y + s], [x + K * s, y + s / 2], [x + K * s, y + 1.5 * s], [x, y + 2 * s]]);
  return (
    <g className={`ps-cube is-${tone}`}>
      <polygon className="ps-cube-left" points={left} />
      <polygon className="ps-cube-right" points={right} />
      <polygon className="ps-cube-top" points={top} />
    </g>
  );
}

/** Left card: a stack of blue glass blocks with a few small ones floating in front. */
function GlassStack() {
  return (
    <svg className="ps-stack" viewBox="0 0 340 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="ps-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#DCE7FF" stopOpacity=".8" />
          <stop offset="1" stopColor="#7FA2F5" stopOpacity=".35" />
        </linearGradient>
        <linearGradient id="ps-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5C86F0" stopOpacity=".75" />
          <stop offset="1" stopColor="#1B47C9" stopOpacity=".45" />
        </linearGradient>
        <linearGradient id="ps-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1A3FB8" stopOpacity=".85" />
          <stop offset="1" stopColor="#061E6E" stopOpacity=".6" />
        </linearGradient>
      </defs>
      {CUBES.map(([x, y, s], i) => <Cube key={i} x={x} y={y} s={s} />)}
      {FLOATERS.map(([x, y, s], i) => (
        <g key={i} className="ps-float" style={{ '--d': `${i * -1.4}s` } as React.CSSProperties}>
          <Cube x={x} y={y} s={s} tone={i === FLOATERS.length - 1 ? 'signal' : 'glass'} />
        </g>
      ))}
    </svg>
  );
}

// How far the page scrolls for each pixel the storyline moves sideways while it is pinned.
const SCROLL_RATE = 1.15;
// Where the drawing tip of the line sits across the panel: 70% in at the start, the far edge at the end.
const TIP_START = 0.7;

// "Product storyline" on the Case Studies page. From 768px the dark panel pins below the header and page scroll
// slides the storyline to the left; the yellow line draws ahead of it and each brand's stem grows up or down
// as the line reaches it. Below 768px it is a vertical timeline whose chapters appear as they scroll in.
export default function CaseStoryline({ content: c = pageDefaults('caseStudies') }: { content?: Record<string, string> }) {
  const chapters = useMemo(() => chaptersOf(c.storyItems || ''), [c.storyItems]);
  const lines = (c.storyTitle || '').split('\n').filter(Boolean);

  const trackRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const panel = panelRef.current;
    const strip = stripRef.current;
    const line = lineRef.current;
    const fill = fillRef.current;
    if (!track || !panel || !strip || !line || !fill) return;
    const wide = window.matchMedia('(min-width: 768px)');
    const marks = Array.from(line.querySelectorAll<HTMLElement>('.ps-mark'));
    let distance = 0;
    let lineLeft = 0;
    let lineWidth = 0;
    let markX: number[] = [];
    let frame = 0;
    let observer: IntersectionObserver | null = null;

    // Page scroll -> progress through the pinned stretch -> strip offset, drawn line length and lit chapters.
    const update = () => {
      frame = 0;
      if (!wide.matches) return;
      const pinTop = parseFloat(getComputedStyle(panel).top) || 0;
      const rect = track.getBoundingClientRect();
      const travel = rect.height - panel.offsetHeight;
      const progress = travel > 0 ? Math.min(1, Math.max(0, (pinTop - rect.top) / travel)) : 0;
      const offset = progress * distance;
      const tip = offset + panel.clientWidth * (TIP_START + (1 - TIP_START) * progress) - lineLeft;
      strip.style.transform = `translate3d(${-offset}px, 0, 0)`;
      fill.style.transform = `scaleX(${lineWidth ? Math.min(1, Math.max(0, tip / lineWidth)) : 0})`;
      marks.forEach((mark, i) => mark.classList.toggle('is-on', tip >= markX[i]));
    };

    const measure = () => {
      observer?.disconnect();
      observer = null;
      if (!wide.matches) {
        track.style.height = '';
        strip.style.transform = '';
        fill.style.transform = '';
        // Vertical timeline: each chapter lights up once it scrolls into view.
        observer = new IntersectionObserver(
          (entries) => entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-on');
              observer?.unobserve(entry.target);
            }
          }),
          { rootMargin: '0px 0px -15% 0px', threshold: 0.3 },
        );
        marks.forEach((mark) => observer?.observe(mark));
        return;
      }
      distance = Math.max(0, strip.scrollWidth - panel.clientWidth);
      lineLeft = line.offsetLeft;
      lineWidth = line.offsetWidth;
      markX = marks.map((mark) => mark.offsetLeft);
      track.style.height = `${panel.offsetHeight + distance * SCROLL_RATE}px`;
      update();
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };

    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(panel);
    resize.observe(strip);
    window.addEventListener('scroll', onScroll, { passive: true });
    wide.addEventListener('change', measure);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      resize.disconnect();
      window.removeEventListener('scroll', onScroll);
      wide.removeEventListener('change', measure);
    };
  }, [chapters]);

  if (!chapters.length) return null;

  return (
    <section className="ps-section bg-blue" aria-label={lines.join(' ') || 'Product storyline'}>
      <div className="container">
        <div ref={trackRef} className="ps-track">
          <div ref={panelRef} className="ps-panel">
            <div ref={stripRef} className="ps-strip">
              <div className="ps-visual">
                {c.storyImage ? <img src={c.storyImage} alt="" loading="lazy" decoding="async" /> : <GlassStack />}
              </div>

              <div className="ps-intro">
                {c.storyLabel && <p className="ps-label"><span aria-hidden="true" />{c.storyLabel}</p>}
                <h2 className="ps-title">
                  {lines.map((text, i) => (
                    <span key={i} className={i === lines.length - 1 && lines.length > 1 ? 'is-hl' : undefined}>{text}</span>
                  ))}
                </h2>
                {c.storyText && <p className="ps-text"><FormattedText text={c.storyText} /></p>}
                <div className="ps-range" aria-hidden="true"><i /><i /></div>
                {c.storyMeta && <p className="ps-meta">{c.storyMeta}</p>}
              </div>

              <div ref={lineRef} className="ps-line" style={{ '--n': chapters.length } as React.CSSProperties}>
                <span className="ps-axis" aria-hidden="true">
                  <span ref={fillRef} className="ps-axis-fill" />
                </span>
                <ol className="ps-marks">
                  {chapters.map((ch, i) => (
                    <li key={`${ch.brand}-${i}`} className={`ps-mark ${i % 2 ? 'is-down' : 'is-up'}`} style={{ '--i': i } as React.CSSProperties}>
                      <span className="ps-stem" aria-hidden="true" />
                      <div className="ps-card">
                        {ch.tag && <p className="ps-tag">{ch.tag}</p>}
                        <h3 className="ps-brand">
                          {ch.logo && <span className="ps-logo"><img src={ch.logo} alt="" loading="lazy" decoding="async" /></span>}
                          {ch.brand}
                        </h3>
                        {ch.points.length > 0 && (
                          <ul className="ps-points">
                            {ch.points.map((point) => <li key={point}>{point}</li>)}
                          </ul>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
