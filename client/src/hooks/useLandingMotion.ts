import { useEffect, type RefObject } from 'react';

/** Keeps `state.visible` up to date for an element on (or near) the screen, so animations can skip unseen work. */
function watchVisibility(el: Element | null, onChange?: () => void) {
  const state = { visible: true };
  if (!el || typeof IntersectionObserver === 'undefined') return { state, stop: () => {} };
  const observer = new IntersectionObserver(([entry]) => {
    state.visible = entry.isIntersecting;
    onChange?.();
  }, { rootMargin: '120px 0px' });
  observer.observe(el);
  return { state, stop: () => observer.disconnect() };
}

/**
 * The homepage's pointer and scroll effects: hero clip parallax, the tilting laptop and the live chart bars.
 * Everything paints at most once per frame, pauses while off screen, and is torn down when the page unmounts.
 */
export function useLandingMotion(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cleanups: Array<() => void> = [];
    const listen = <K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void, options?: AddEventListenerOptions) => {
      window.addEventListener(type, fn, options);
      cleanups.push(() => window.removeEventListener(type, fn, options));
    };
    const frames = new Set<number>();
    cleanups.push(() => frames.forEach(cancelAnimationFrame));

    // Hero clip parallax: remember the pointer, paint once per frame.
    const stack = root.querySelector<HTMLElement>('#clipStack');
    if (stack) {
      const cards = Array.from(stack.querySelectorAll<HTMLElement>('.clip-card'));
      const depths = cards.map((card) => parseFloat(card.dataset.depth ?? '') || 0.05);
      const view = watchVisibility(stack);
      cleanups.push(view.stop);
      let pointerX = 0;
      let pointerY = 0;
      let frame = 0;
      const paint = () => {
        frames.delete(frame);
        frame = 0;
        const x = (pointerX - window.innerWidth / 2) / (window.innerWidth / 2);
        const y = (pointerY - window.innerHeight / 2) / (window.innerHeight / 2);
        cards.forEach((card, idx) => {
          const baseRot = (idx % 2 === 0 ? -1 : 1) * (idx * 3 + 2);
          card.style.transform = `translate3d(${x * depths[idx] * 70}px, ${y * depths[idx] * 70}px, 0) rotate(${baseRot}deg)`;
        });
      };
      listen('mousemove', (e) => {
        pointerX = e.clientX;
        pointerY = e.clientY;
        if (view.state.visible && !frame) frames.add((frame = requestAnimationFrame(paint)));
      }, { passive: true });
    }

    // Laptop tilt: layout is read at most once per frame and only while the section is near the screen.
    // Leaving the screen triggers one last paint so a fast scroll still lands on the end position.
    const section = root.querySelector<HTMLElement>('.kinetic-section');
    const macbook = root.querySelector<HTMLElement>('.macbook-container');
    if (section && macbook) {
      const badges = Array.from(root.querySelectorAll<HTMLElement>('.floating-badge'));
      let frame = 0;
      const paint = () => {
        frames.delete(frame);
        frame = 0;
        const rect = section.getBoundingClientRect();
        const totalDistance = section.offsetHeight - window.innerHeight;
        const progress = Math.max(0, Math.min(1, -rect.top / totalDistance));
        const rotateX = 26 * (1 - progress);
        const scale = 0.88 + 0.12 * progress;
        const translateY = (1 - progress) * 35;
        macbook.style.transform = `rotateX(${rotateX.toFixed(2)}deg) scale(${scale.toFixed(3)}) translateY(${translateY.toFixed(1)}px)`;
        badges.forEach((b, i) => {
          const dir = i % 2 === 0 ? -1 : 1;
          b.style.transform = `translate3d(${(1 - progress) * 25 * dir}px, ${(1 - progress) * 15}px, 0)`;
        });
      };
      const schedule = () => {
        if (!frame) frames.add((frame = requestAnimationFrame(paint)));
      };
      const view = watchVisibility(section, schedule);
      cleanups.push(view.stop);
      listen('scroll', () => view.state.visible && schedule(), { passive: true });
      paint();
    }

    // Live chart: each bar wobbles around its own starting height, so the weekly shape stays readable.
    // Skipped while the chart is off screen or the tab is hidden.
    const chart = root.querySelector('.chart-bars-wrap');
    if (chart) {
      const bars = Array.from(chart.querySelectorAll<HTMLElement>('.chart-bar'));
      const bases = bars.map((bar) => parseInt(bar.style.height || '70', 10));
      const view = watchVisibility(chart);
      cleanups.push(view.stop);

      // Trace line: reads the bars' rendered heights, so it rides along with their CSS height transition.
      // offset* values are used because the laptop is scaled, which would skew getBoundingClientRect.
      const svg = chart.querySelector<SVGSVGElement>('.chart-trace');
      const NS = 'http://www.w3.org/2000/svg';
      const dotGroup = svg?.querySelector('.trace-dots');
      dotGroup?.replaceChildren();
      const dots = bars.map(() => {
        const dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('r', '3.5');
        dotGroup?.appendChild(dot);
        return dot;
      });
      cleanups.push(() => dots.forEach((dot) => dot.remove()));
      const drawTrace = () => {
        if (!svg) return;
        const width = (chart as HTMLElement).offsetWidth;
        svg.setAttribute('viewBox', `0 0 ${width} ${(chart as HTMLElement).offsetHeight}`);
        const points = bars.map((bar) => {
          const group = bar.parentElement as HTMLElement;
          return {
            x: group.offsetLeft + group.offsetWidth / 2,
            y: group.offsetTop + group.offsetHeight - bar.offsetHeight,
            pct: (bar.offsetHeight / group.offsetHeight) * 100,
          };
        });
        const line = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
        svg.querySelectorAll('.trace-line, .trace-halo').forEach((el) => el.setAttribute('points', line));
        const hi = points.reduce((best, p, i) => (p.y < points[best].y ? i : best), 0);
        const lo = points.reduce((best, p, i) => (p.y > points[best].y ? i : best), 0);
        dots.forEach((dot, i) => {
          dot.setAttribute('cx', points[i].x.toFixed(1));
          dot.setAttribute('cy', points[i].y.toFixed(1));
          dot.setAttribute('class', i === hi ? 'is-hi' : i === lo ? 'is-lo' : '');
        });
        ([['hi', hi, 'H'], ['lo', lo, 'L']] as const).forEach(([kind, idx, letter]) => {
          const { y, pct } = points[idx];
          const level = svg.querySelector(`.trace-level-${kind}`);
          level?.setAttribute('x1', '0');
          level?.setAttribute('x2', `${width}`);
          level?.setAttribute('y1', y.toFixed(1));
          level?.setAttribute('y2', y.toFixed(1));
          // Price tag sits on the side away from its own bar, so it never covers the marked point.
          const tag = svg.querySelector(`.trace-tag-${kind}`);
          const text = tag?.querySelector('text');
          const rect = tag?.querySelector('rect');
          if (!text || !rect) return;
          text.textContent = `${letter} ₹${((pct * 1.5) / 100).toFixed(2)}L`;
          const tagWidth = text.getComputedTextLength() + 12;
          const cx = idx >= bars.length / 2 ? tagWidth / 2 + 2 : width - tagWidth / 2 - 2;
          text.setAttribute('x', cx.toFixed(1));
          text.setAttribute('y', y.toFixed(1));
          rect.setAttribute('x', (cx - tagWidth / 2).toFixed(1));
          rect.setAttribute('y', (y - 8).toFixed(1));
          rect.setAttribute('width', tagWidth.toFixed(1));
          rect.setAttribute('height', '16');
        });
      };
      let traceFrame = 0;
      let traceUntil = 0;
      const followBars = () => {
        frames.delete(traceFrame);
        drawTrace();
        traceFrame = performance.now() < traceUntil ? requestAnimationFrame(followBars) : 0;
        if (traceFrame) frames.add(traceFrame);
      };
      const traceFor = (ms: number) => {
        traceUntil = performance.now() + ms;
        if (!traceFrame) frames.add((traceFrame = requestAnimationFrame(followBars)));
      };
      traceFor(0);
      if (svg && typeof ResizeObserver !== 'undefined') {
        const resize = new ResizeObserver(() => traceFor(0));
        resize.observe(chart);
        cleanups.push(() => resize.disconnect());
      }

      // Market-style ticks: each bar keeps rising or falling for a few ticks before its trend flips,
      // with a pull back toward its starting height so the weekly shape never drifts away.
      const heights = [...bases];
      const trends = bases.map(() => (Math.random() < 0.5 ? -1 : 1));
      const interval = setInterval(() => {
        if (document.hidden || !view.state.visible) return;
        bars.forEach((bar, i) => {
          if (Math.random() < 0.3) trends[i] *= -1;
          const step = trends[i] * (4 + Math.random() * 8) + (bases[i] - heights[i]) * 0.2;
          heights[i] = Math.max(15, Math.min(98, heights[i] + step));
          if (heights[i] <= 15 || heights[i] >= 98) trends[i] *= -1;
          bar.style.height = `${heights[i].toFixed(1)}%`;
        });
        traceFor(1000);
      }, 1000);
      cleanups.push(() => clearInterval(interval));
    }

    return () => cleanups.forEach((fn) => fn());
  }, [rootRef]);
}
