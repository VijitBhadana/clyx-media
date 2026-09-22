import { useEffect, useRef, useState, type ReactNode } from 'react';

export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`scroll-reveal ${visible ? 'is-visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

export function CountUp({ value, duration = 1500 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let started = false;
    const numeric = parseFloat(value.replace(/[^0-9.]/g, ''));
    const suffix = value.replace(/[0-9.]/g, '');
    const decimals = (value.split('.')[1] || '').replace(/[^0-9]/g, '').length;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(`${(numeric * eased).toFixed(decimals)}${suffix}`);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration]);
  return <span ref={ref}>{display}</span>;
}

export function useDirectionalReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.18 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

export function DirectionalReveal({ children, direction = 'left', className = '', delay = 0 }: { children: ReactNode; direction?: 'left' | 'right'; className?: string; delay?: number }) {
  const { ref, visible } = useDirectionalReveal<HTMLDivElement>();
  return <div ref={ref} className={`direction-reveal from-${direction} ${visible ? 'is-visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}
