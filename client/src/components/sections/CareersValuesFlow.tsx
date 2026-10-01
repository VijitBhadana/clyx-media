import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Hammer, MessageSquareQuote, TrendingUp } from 'lucide-react';
import { Label } from '@/components/ui/primitives';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const ICONS = [Hammer, MessageSquareQuote, TrendingUp];
// Tablet/desktop zigzag: heading sits top-left, cards go top-right → bottom-right → bottom-left.
const PLACEMENT = [
  'md:col-start-2 md:row-start-1 md:justify-self-end md:self-center',
  'md:col-start-2 md:row-start-2 md:justify-self-end',
  'md:col-start-1 md:row-start-2 md:justify-self-start',
];
// Arrows are scrubbed by scroll: each draws over SPAN px of scrolling, in order, as its midpoint passes
// TRIGGER (a fraction of the viewport height from the top).
const SPAN = 240;
const TRIGGER = 0.78;

type Box = { x: number; y: number; w: number; h: number };
type Arrow = { d: string; head: string; mid: number };

/** Box of `el` in `root`'s coordinates, read from layout offsets so the cards' reveal transforms don't skew it. */
function boxIn(el: HTMLElement, root: HTMLElement): Box {
  let x = 0, y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/**
 * A hand-drawn style arrow from box `a` to box `b`: a sweeping arc with one round loop at its crest and an
 * open chevron head. It leaves from the side facing `b` and is built along the x axis (y < 0 is the bow
 * side), then rotated into place; `flip` mirrors the bow and loop to the other side.
 */
function arrowBetween(a: Box, b: Box, flip: boolean): Arrow {
  const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
  const bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  const g0 = 14, g1 = 16;
  let p0, p1;
  if (Math.abs(bc.x - ac.x) > Math.abs(bc.y - ac.y)) {
    const right = bc.x > ac.x;
    p0 = { x: right ? a.x + a.w + g0 : a.x - g0, y: ac.y };
    p1 = { x: right ? b.x - g1 : b.x + b.w + g1, y: bc.y };
  } else {
    const down = bc.y > ac.y;
    p0 = { x: ac.x, y: down ? a.y + a.h + g0 : a.y - g0 };
    p1 = { x: bc.x, y: down ? b.y - g1 : b.y + b.h + g1 };
  }

  const L = Math.hypot(p1.x - p0.x, p1.y - p0.y) || 1;
  const ux = (p1.x - p0.x) / L, uy = (p1.y - p0.y) / L;
  const nx = flip ? uy : -uy, ny = flip ? -ux : ux;
  const pt = (x: number, y: number) => `${(p0.x + x * ux + y * nx).toFixed(1)} ${(p0.y + x * uy + y * ny).toFixed(1)}`;

  // Like a pen-drawn curl: the line rises over a first hump, dips into the crossing point X (height h), runs
  // once round a real circle (radius r) hanging inside the arc below X, crosses itself back out through X,
  // and rolls over a second hump into the target.
  // Short (vertical) runs keep a readable loop: the bow is sideways, so only the loop is bound by length.
  const h = Math.min(110, Math.max(44, L * 0.32)), r = Math.min(30, Math.max(14, L * 0.11)), m = r * 1.6;
  const dd = r * 1.6, alpha = Math.acos(r / dd);
  const X = { x: L / 2, y: -h };
  const cy = X.y + dd;
  const T1 = { x: X.x + r * Math.sin(alpha), y: cy - r * Math.cos(alpha) };
  const T2 = { x: X.x - r * Math.sin(alpha), y: T1.y };
  const tlen = Math.hypot(T1.x - X.x, T1.y - X.y);
  const inX = (T1.x - X.x) / tlen, inY = (T1.y - X.y) / tlen; // X → T1 heads into the loop; its mirror leaves it
  // A mirroring frame reverses the arc's turning direction on screen.
  const sweep = flip ? 0 : 1;
  const d = [
    `M ${pt(0, 0)}`,
    `C ${pt(-L * 0.02, -h * 1.2)} ${pt(X.x - inX * m, X.y - inY * m)} ${pt(T1.x, T1.y)}`,
    `A ${r.toFixed(1)} ${r.toFixed(1)} 0 1 ${sweep} ${pt(T2.x, T2.y)}`,
    `C ${pt(X.x + inX * m, X.y - inY * m)} ${pt(L * 0.85, -h * 0.55)} ${pt(L, 0)}`,
  ].join(' ');

  // Arrowhead: an open chevron swept back from the end tangent.
  const tl = Math.hypot(0.15 * L, 0.55 * h);
  const tx = (0.15 * L) / tl, ty = (0.55 * h) / tl;
  const dirX = tx * ux + ty * nx, dirY = tx * uy + ty * ny;
  const wing = (angle: number) => {
    const c = Math.cos(angle), sn = Math.sin(angle);
    return `${(p1.x - 20 * (dirX * c - dirY * sn)).toFixed(1)} ${(p1.y - 20 * (dirX * sn + dirY * c)).toFixed(1)}`;
  };
  return { d, head: `M ${wing(0.6)} L ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} L ${wing(-0.6)}`, mid: (p0.y + p1.y) / 2 };
}

/**
 * The heading's highlight: once it scrolls into view its letters rise out of per-word masks one by one.
 */
function FlowHighlight({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useScrollReveal(ref);
  let n = 0;
  const words = text.split(/\s+/).filter(Boolean).map(word => Array.from(word).map(ch => ({ ch, i: n++ })));
  return (
    <span ref={ref} className={`vf-highlight text-blue${inView ? ' is-in' : ''}`} style={{ '--n': n } as React.CSSProperties}>
      <span className="sr-only">{text}</span>
      {words.map((letters, w) => (
        <span key={w} aria-hidden="true">
          {w > 0 && ' '}
          <span className="vf-word">
            {letters.map(({ ch, i }) => <span key={i} className="vf-ch" style={{ '--i': i } as React.CSSProperties}>{ch}</span>)}
          </span>
        </span>
      ))}
    </span>
  );
}

type Props = {
  label: string;
  title: string;
  highlight: string;
  intro?: string;
  values: { title: string; text?: string }[];
};

/**
 * Draw progress (0–1) of each arrow for the current scroll position. Arrows run one after another; if the
 * page ends before the last one can finish, all spans are squeezed so it completes at the bottom.
 */
function progressFor(root: HTMLElement, mids: number[]): number[] {
  const vh = window.innerHeight;
  const top = root.getBoundingClientRect().top + window.scrollY;
  const t = window.scrollY + vh * TRIGGER - top;
  const maxT = document.documentElement.scrollHeight - vh + vh * TRIGGER - top;
  let spans: [number, number][] = [];
  let prevEnd = -Infinity;
  for (const mid of mids) {
    const start = Math.max(mid - SPAN / 2, prevEnd);
    spans.push([start, start + SPAN]);
    prevEnd = start + SPAN;
  }
  if (spans.length && prevEnd > maxT) {
    const s0 = spans[0][0];
    if (maxT <= s0) return mids.map(() => 1);
    const k = (maxT - s0) / (prevEnd - s0);
    spans = spans.map(([a, b]) => [s0 + (a - s0) * k, s0 + (b - s0) * k]);
  }
  return spans.map(([a, b]) => Math.min(1, Math.max(0, (t - a) / (b - a))));
}

export default function CareersValuesFlow({ label, title, highlight, intro, values }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(SVGPathElement | null)[]>([]);
  const tipRefs = useRef<(SVGPathElement | null)[]>([]);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const arrowsRef = useRef<Arrow[]>([]);
  arrowsRef.current = arrows;
  // Scrubbing writes straight to the DOM so scrolling never re-renders React.
  const paint = useRef(() => {});
  paint.current = () => {
    const root = rootRef.current;
    if (!root) return;
    const mids = arrowsRef.current.map(a => a.mid);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const progress = reduced ? mids.map(() => 1) : progressFor(root, mids);
    progress.forEach((p, i) => {
      const done = p >= 0.98;
      const line = lineRefs.current[i];
      if (line) line.style.strokeDashoffset = String(1 - p);
      tipRefs.current[i]?.classList.toggle('is-on', done);
      cardRefs.current[i]?.classList.toggle('is-in', done);
    });
  };

  useLayoutEffect(() => {
    const root = rootRef.current, head = headRef.current;
    if (!root || !head) return;
    const stacked = window.matchMedia('(max-width: 767px)');
    const measure = () => {
      // Stacked (phones): the first arrow drops from below the intro paragraph, not through it.
      const from = stacked.matches && introRef.current ? introRef.current : head;
      const boxes = [from, ...cardRefs.current].map(el => (el ? boxIn(el, root) : null));
      const next: Arrow[] = [];
      for (let i = 0; i < boxes.length - 1; i++) {
        const a = boxes[i], b = boxes[i + 1];
        if (a && b) next.push(arrowBetween(a, b, i === 1));
      }
      setArrows(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    ro.observe(head);
    stacked.addEventListener('change', measure);
    document.fonts?.ready.then(measure);
    return () => {
      ro.disconnect();
      stacked.removeEventListener('change', measure);
    };
  }, [values.length]);

  // Rebuilt paths start at whatever progress the current scroll position calls for.
  useLayoutEffect(() => paint.current(), [arrows]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        paint.current();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div ref={rootRef} className="values-flow relative grid gap-y-32 md:grid-cols-2 md:gap-x-24 md:gap-y-40 lg:gap-x-32 lg:gap-y-56">
      <svg className="values-flow-arrows" aria-hidden="true">
        {arrows.map((arrow, i) => (
          <g key={i}>
            <path ref={el => { lineRefs.current[i] = el; }} className="values-flow-line" d={arrow.d} pathLength={1} />
            <path ref={el => { tipRefs.current[i] = el; }} className="values-flow-head" d={arrow.head} />
          </g>
        ))}
      </svg>
      <div ref={introRef} className="md:col-start-1 md:row-start-1 md:self-center">
        <Label>{label}</Label>
        <h2 ref={headRef} className="display vf-heading w-fit text-4xl font-bold md:text-5xl lg:text-6xl">
          {title}<br /><FlowHighlight text={highlight} />
        </h2>
        {intro && <p className="mt-6 max-w-md text-base leading-7 text-muted">{intro}</p>}
      </div>
      {values.map((value, i) => {
        const Icon = ICONS[i % ICONS.length];
        return (
          <div
            key={i}
            ref={el => { cardRefs.current[i] = el; }}
            className={`value-tile values-flow-card ${PLACEMENT[i] ?? ''}`}
          >
            <div className="flex items-center">
              <span className="service-row-index"><Icon size={22} /></span>
            </div>
            <div className="mt-auto pt-5">
              <h3 className="display text-3xl font-bold md:text-4xl">{value.title}</h3>
              {value.text && <p className="mt-3 max-w-md text-sm leading-6 text-muted">{value.text}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
