import { useEffect, useLayoutEffect, useRef } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

/**
 * A heading made of sand. When it scrolls into view the grains blow in from the left and settle into the
 * letters; hovering (or tapping) a word blows just that word away to the right as dust, then it gathers
 * again while the rest of the heading stays put.
 *
 * The real text stays in the DOM (each word just transparent while its canvas copy plays), so it is
 * selectable, readable by screen readers and shown as-is with reduced motion. The canvas copy is drawn from
 * each word's own box and computed font, then sampled into grains.
 */

// Room around the heading the dust may fly into (CSS px).
const PAD = { l: 60, t: 140, r: 260, b: 80 };
const ASSEMBLE_MS = 1000; // one grain settling
const DISSOLVE_MS = 1150; // one grain blowing away
const SWEEP_MS = 650; // how long the wave takes to cross the heading
const WORD_SWEEP_MS = 280; // how long it takes to cross a single word
const START_DELAY_MS = 250; // lets the card's own entrance get going first
const REFORM_DELAY_MS = 350; // pause between blowing away and gathering again

// xn: position across the whole heading, xw: across its own word (both 0..1); w: index of its word.
type Grain = { x: number; y: number; xn: number; xw: number; w: number; c: number; r1: number; r2: number; r3: number };
type Mode = 'hidden' | 'assembling' | 'solid' | 'dissolving';
// wide: timed as part of the whole-heading sweep rather than on its own.
type Word = { el: HTMLElement; mode: Mode; start: number; wide: boolean; timer: number };

type Props = { title: string; highlight: string; className?: string; highlightClassName?: string };

export default function DustHeading({ title, highlight, className = '', highlightClassName = '' }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useScrollReveal(ref);
  const api = useRef<{ show(): void; hide(): void } | null>(null);

  // Hide the text before the first paint so it doesn't flash before the sand arrives.
  useLayoutEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    ref.current?.querySelectorAll('.dust-word').forEach(el => el.classList.add('is-dust'));
  }, [title, highlight]);

  useEffect(() => {
    const h = ref.current, canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const list: Word[] = h ? Array.from(h.querySelectorAll<HTMLElement>('.dust-word'), el => ({ el, mode: 'hidden' as Mode, start: 0, wide: true, timer: 0 })) : [];
    if (!h || !canvas || !ctx || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      list.forEach(wd => wd.el.classList.remove('is-dust'));
      return;
    }
    let grains: Grain[] = [], colors: string[] = [], size = 2, dpr = 1, w = 0, ht = 0;
    let ready = false, wanted = false, raf = 0, timer = 0;

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
      const boxes = list.map(({ el }) => {
        const cs = getComputedStyle(el);
        const text = el.textContent || '';
        fs = parseFloat(cs.fontSize) || fs;
        o.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        if ('letterSpacing' in o) (o as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
        o.fillStyle = cs.color;
        const m = o.measureText(text);
        const asc = m.fontBoundingBoxAscent ?? fs * 0.8, desc = m.fontBoundingBoxDescent ?? fs * 0.2;
        const r = el.getBoundingClientRect(); // words never wrap, so this is one line box
        const x = r.left - base.left + PAD.l, y = r.top - base.top + PAD.t;
        o.fillText(text, x, y + (r.height - asc - desc) / 2 + asc);
        return { x, y, w: Math.max(1, r.width), h: r.height };
      });
      // The word a grain belongs to: the box it sits in, or the nearest one for ink that overhangs its box.
      const wordAt = (cx: number, cy: number) => {
        let best = 0, bestD = Infinity;
        boxes.forEach((b, i) => {
          const dx = Math.max(b.x - cx, 0, cx - b.x - b.w), dy = Math.max(b.y - cy, 0, cy - b.y - b.h);
          const d = dx * dx + dy * dy;
          if (d < bestD) { bestD = d; best = i; }
        });
        return best;
      };
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
          const wi = wordAt(cx, cy), b = boxes[wi];
          next.push({
            x: cx, y: cy, w: wi, c,
            xn: Math.min(1, Math.max(0, (cx - PAD.l) / span)),
            xw: Math.min(1, Math.max(0, (cx - b.x) / b.w)),
            r1: Math.random(), r2: Math.random(), r3: Math.random(),
          });
        }
      }
      next.sort((a, b) => a.c - b.c); // fewer fillStyle switches per frame
      grains = next;
      ready = grains.length > 0;
    };

    const clear = () => { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, ht); };

    const frame = (now: number) => {
      clear();
      // Only words mid-animation are drawn on the canvas; solid words show as their real text.
      const busy = list.map(wd => wd.mode === 'assembling' || wd.mode === 'dissolving');
      const done = list.map(() => true);
      let cur = -1;
      for (const g of grains) {
        if (!busy[g.w]) continue;
        const wd = list[g.w];
        const assembling = wd.mode === 'assembling';
        const delay = wd.wide ? g.xn * SWEEP_MS + g.r3 * 260 : g.xw * WORD_SWEEP_MS + g.r3 * 160;
        let k = (now - wd.start - delay) / (assembling ? ASSEMBLE_MS : DISSOLVE_MS);
        if (k < 1) done[g.w] = false;
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
      let running = false;
      list.forEach((wd, i) => {
        if (!busy[i]) return;
        if (!done[i]) { running = true; return; }
        if (wd.mode === 'assembling') {
          wd.mode = 'solid';
          wd.el.classList.remove('is-dust');
        } else {
          wd.mode = 'hidden';
          wd.timer = window.setTimeout(() => wanted && run([wd], 'assembling', false), REFORM_DELAY_MS);
        }
      });
      if (running) { raf = requestAnimationFrame(frame); return; }
      raf = 0;
      clear();
    };

    const run = (targets: Word[], m: 'assembling' | 'dissolving', wide: boolean) => {
      if (!ready) return;
      const now = performance.now();
      for (const wd of targets) {
        clearTimeout(wd.timer);
        wd.mode = m;
        wd.start = now;
        wd.wide = wide;
        wd.el.classList.add('is-dust');
      }
      if (!raf) raf = requestAnimationFrame(frame);
    };

    api.current = {
      show() {
        wanted = true;
        if (!list.every(wd => wd.mode === 'hidden')) return;
        clearTimeout(timer);
        timer = window.setTimeout(() => run(list, 'assembling', true), START_DELAY_MS);
      },
      hide() {
        wanted = false;
        clearTimeout(timer);
        cancelAnimationFrame(raf);
        raf = 0;
        for (const wd of list) {
          clearTimeout(wd.timer);
          wd.mode = 'hidden';
          wd.el.classList.add('is-dust');
        }
        clear();
      },
    };

    // Each word blows away on its own when the pointer reaches it.
    const enters = list.map(wd => {
      const onEnter = () => { if (wd.mode === 'solid') run([wd], 'dissolving', false); };
      wd.el.addEventListener('pointerenter', onEnter);
      return onEnter;
    });

    // Sample once the heading font is in, and again whenever the heading reflows.
    const resample = () => {
      sample();
      if (wanted) api.current?.show();
    };
    const ro = new ResizeObserver(() => { if (!raf) resample(); });
    ro.observe(h);
    document.fonts?.addEventListener?.('loadingdone', resample);
    (document.fonts?.ready ?? Promise.resolve()).then(resample);

    return () => {
      ro.disconnect();
      document.fonts?.removeEventListener?.('loadingdone', resample);
      list.forEach((wd, i) => { wd.el.removeEventListener('pointerenter', enters[i]); clearTimeout(wd.timer); });
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
