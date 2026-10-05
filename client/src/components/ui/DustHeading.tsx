import { useEffect, useLayoutEffect, useRef } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

/**
 * A heading made of sand. When it scrolls into view the grains blow in from the left and settle into the
 * letters; hovering (or tapping) it blows the letters away to the right as dust, then they gather again.
 *
 * The real text stays in the DOM (just transparent while the canvas plays), so it is selectable, readable by
 * screen readers and shown as-is with reduced motion. The canvas copy is drawn from each word's own box and
 * computed font, then sampled into grains.
 */

// Room around the heading the dust may fly into (CSS px).
const PAD = { l: 60, t: 140, r: 260, b: 80 };
const ASSEMBLE_MS = 1000; // one grain settling
const DISSOLVE_MS = 1150; // one grain blowing away
const SWEEP_MS = 650; // how long the wave takes to cross the heading
const START_DELAY_MS = 250; // lets the card's own entrance get going first
const REFORM_DELAY_MS = 350; // pause between blowing away and gathering again

type Grain = { x: number; y: number; xn: number; c: number; r1: number; r2: number; r3: number };
type Mode = 'hidden' | 'assembling' | 'solid' | 'dissolving';

type Props = { title: string; highlight: string; className?: string; highlightClassName?: string };

export default function DustHeading({ title, highlight, className = '', highlightClassName = '' }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useScrollReveal(ref);
  const api = useRef<{ show(): void; hide(): void } | null>(null);

  // Hide the text before the first paint so it doesn't flash before the sand arrives.
  useLayoutEffect(() => {
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) ref.current?.classList.add('is-dust');
  }, []);

  useEffect(() => {
    const h = ref.current, canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!h || !canvas || !ctx || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      h?.classList.remove('is-dust');
      return;
    }
    let grains: Grain[] = [], colors: string[] = [], size = 2, dpr = 1, w = 0, ht = 0;
    let ready = false, wanted = false, mode: Mode = 'hidden', start = 0, raf = 0, timer = 0;

    const sample = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = h.offsetWidth + PAD.l + PAD.r;
      ht = h.offsetHeight + PAD.t + PAD.b;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(ht * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${ht}px`;
      const off = document.createElement('canvas');
      off.width = canvas.width;
      off.height = canvas.height;
      const o = off.getContext('2d', { willReadFrequently: true });
      if (!o) return;
      o.scale(dpr, dpr);
      o.textBaseline = 'alphabetic';
      const base = h.getBoundingClientRect();
      let fs = 40;
      h.querySelectorAll<HTMLElement>('.dust-word').forEach(el => {
        const cs = getComputedStyle(el);
        const text = el.textContent || '';
        fs = parseFloat(cs.fontSize) || fs;
        o.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        if ('letterSpacing' in o) (o as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
        o.fillStyle = cs.color;
        const m = o.measureText(text);
        const asc = m.fontBoundingBoxAscent ?? fs * 0.8, desc = m.fontBoundingBoxDescent ?? fs * 0.2;
        const r = el.getBoundingClientRect(); // words never wrap, so this is one line box
        o.fillText(text, r.left - base.left + PAD.l, r.top - base.top + PAD.t + (r.height - asc - desc) / 2 + asc);
      });
      // Finer grains on big type, coarser on small screens to keep the count (and the frame cost) sane.
      size = Math.max(1.25, Math.min(2.2, fs / 28));
      const step = size * dpr;
      const px = o.getImageData(0, 0, off.width, off.height).data;
      const index = new Map<string, number>();
      const next: Grain[] = [];
      colors = [];
      const span = Math.max(1, h.offsetWidth);
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          const i = ((y | 0) * off.width + (x | 0)) * 4;
          if (px[i + 3] < 128) continue;
          const key = `${px[i]},${px[i + 1]},${px[i + 2]}`;
          let c = index.get(key);
          if (c === undefined) { c = colors.length; colors.push(`rgb(${key})`); index.set(key, c); }
          const cx = x / dpr, cy = y / dpr;
          next.push({ x: cx, y: cy, xn: Math.min(1, Math.max(0, (cx - PAD.l) / span)), c, r1: Math.random(), r2: Math.random(), r3: Math.random() });
        }
      }
      next.sort((a, b) => a.c - b.c); // fewer fillStyle switches per frame
      grains = next;
      ready = grains.length > 0;
    };

    const clear = () => { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, ht); };

    const frame = (now: number) => {
      const t = now - start;
      const assembling = mode === 'assembling';
      const dur = assembling ? ASSEMBLE_MS : DISSOLVE_MS;
      clear();
      let done = true, cur = -1;
      for (const g of grains) {
        let k = (t - (g.xn * SWEEP_MS + g.r3 * 260)) / dur;
        if (k < 1) done = false;
        k = k < 0 ? 0 : k > 1 ? 1 : k;
        let x: number, y: number, a: number;
        if (assembling) {
          // Blown in from the left, easing to rest in its letter.
          const left = Math.pow(1 - k, 3);
          x = g.x - (30 + g.r1 * 150) * left;
          y = g.y + (g.r2 - 0.5) * 130 * left + Math.sin(g.r1 * 12 + k * 5) * 6 * left;
          a = Math.min(1, k * 1.8);
        } else {
          // Lifts off and drifts right and up, curling a little, fading as it goes.
          const e = k * k;
          x = g.x + (50 + g.r1 * 230) * e + Math.sin(k * 4 + g.r1 * 6) * 10 * k;
          y = g.y - (10 + g.r2 * 150) * e + (g.r3 - 0.5) * 30 * e;
          a = 1 - k;
        }
        if (a <= 0.02) continue;
        if (g.c !== cur) { cur = g.c; ctx.fillStyle = colors[cur]; }
        ctx.globalAlpha = a;
        const s = assembling ? size : size * (1 - k * 0.4);
        ctx.fillRect(x, y, s, s);
      }
      ctx.globalAlpha = 1;
      if (!done) { raf = requestAnimationFrame(frame); return; }
      raf = 0;
      clear();
      if (assembling) {
        mode = 'solid';
        h.classList.remove('is-dust');
      } else {
        mode = 'hidden';
        timer = window.setTimeout(() => wanted && run('assembling'), REFORM_DELAY_MS);
      }
    };

    const run = (m: 'assembling' | 'dissolving') => {
      if (!ready) return;
      cancelAnimationFrame(raf);
      mode = m;
      h.classList.add('is-dust');
      start = performance.now();
      raf = requestAnimationFrame(frame);
    };

    api.current = {
      show() {
        wanted = true;
        if (mode !== 'hidden') return;
        clearTimeout(timer);
        timer = window.setTimeout(() => run('assembling'), START_DELAY_MS);
      },
      hide() {
        wanted = false;
        clearTimeout(timer);
        cancelAnimationFrame(raf);
        raf = 0;
        mode = 'hidden';
        clear();
        h.classList.add('is-dust');
      },
    };

    const onEnter = () => { if (mode === 'solid') run('dissolving'); };
    h.addEventListener('pointerenter', onEnter);

    // Sample once the heading font is in, and again whenever the heading reflows.
    const resample = () => {
      sample();
      if (wanted && mode === 'hidden') api.current?.show();
    };
    const ro = new ResizeObserver(() => { if (!raf) resample(); });
    ro.observe(h);
    document.fonts?.addEventListener?.('loadingdone', resample);
    (document.fonts?.ready ?? Promise.resolve()).then(resample);

    return () => {
      ro.disconnect();
      document.fonts?.removeEventListener?.('loadingdone', resample);
      h.removeEventListener('pointerenter', onEnter);
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      api.current = null;
    };
  }, [title, highlight]);

  useEffect(() => {
    if (inView) api.current?.show();
    else api.current?.hide();
  }, [inView]);

  const words = (text: string, cls = '') => text.split(/\s+/).filter(Boolean).map((word, i) => (
    <span key={i}>{i > 0 && ' '}<span className={`dust-word ${cls}`}>{word}</span></span>
  ));
  return (
    <h2 ref={ref} className={`dust-heading ${className}`}>
      {words(title)}<br />{words(highlight, highlightClassName)}
      <canvas ref={canvasRef} className="dust-canvas" aria-hidden="true" style={{ left: -PAD.l, top: -PAD.t }} />
    </h2>
  );
}
