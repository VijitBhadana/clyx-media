import { useEffect, useId, useRef } from 'react';
import { Megaphone, Repeat, Sparkles, type LucideIcon } from 'lucide-react';
import { HeroButtons } from '@/components/layout/PageShell';
import { DirectionalReveal, Reveal } from '@/components/ui/ScrollMotion';
import { splitLines } from '@/lib/pageContent';
import '@/styles/about-hero.css';
import { FormattedText } from '@/components/ui/FormattedText';

// Card icons stay fixed; the copy comes from the About page content. The fan is built for three cards.
const ICONS: LucideIcon[] = [Sparkles, Megaphone, Repeat];

// The moving blue light behind the About hero, passed to PageShell as `heroDecor`.
export function AboutHeroGlow() {
  return (
    <div className="ab-glow" aria-hidden="true">
      <span className="ab-glow-core" />
      <span className="ab-glow-soft" />
    </div>
  );
}

// Pan-head Phillips screw: bevelled rim, brushed dome with a highlight, and a recessed cross slot.
function Screw() {
  const id = useId().replace(/:/g, '');
  return (
    <svg className="ab-screw" viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7F9FC" />
          <stop offset=".55" stopColor="#A9B1BF" />
          <stop offset="1" stopColor="#5C6474" />
        </linearGradient>
        <radialGradient id={`${id}dome`} cx=".38" cy=".32" r=".75">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".35" stopColor="#DDE2EA" />
          <stop offset=".75" stopColor="#A4ADBC" />
          <stop offset="1" stopColor="#7C8596" />
        </radialGradient>
        <linearGradient id={`${id}slot`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#262B36" />
          <stop offset="1" stopColor="#555D6D" />
        </linearGradient>
        <radialGradient id={`${id}shine`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".9" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill={`url(#${id}rim)`} />
      <circle cx="20" cy="20" r="16.2" fill={`url(#${id}dome)`} />
      <circle cx="20" cy="20" r="12.5" fill="none" stroke="#FFFFFF" strokeOpacity=".35" strokeWidth=".6" />
      <circle cx="20" cy="20" r="9" fill="none" stroke="#5C6474" strokeOpacity=".18" strokeWidth=".6" />
      <g transform="rotate(22 20 20)">
        {/* Light catching the lower edge of the recess, then the recess itself. */}
        <path d="M11 18.2h6.4l2.6-2.6 2.6 2.6H29a1.3 1.3 0 0 1 0 2.6h-6.4l-2.6 2.6-2.6-2.6H11a1.3 1.3 0 0 1 0-2.6Z" fill="#FFFFFF" fillOpacity=".7" transform="translate(0 .9)" />
        <path d="M18.7 11a1.3 1.3 0 0 1 2.6 0v6.4l2.6 2.6-2.6 2.6V29a1.3 1.3 0 0 1-2.6 0v-6.4L16.1 20l2.6-2.6Z" fill="#FFFFFF" fillOpacity=".7" transform="translate(0 .9)" />
        <path d="M11 18.2h6.4l2.6-2.6 2.6 2.6H29a1.3 1.3 0 0 1 0 2.6h-6.4l-2.6 2.6-2.6-2.6H11a1.3 1.3 0 0 1 0-2.6Z" fill={`url(#${id}slot)`} />
        <path d="M18.7 11a1.3 1.3 0 0 1 2.6 0v6.4l2.6 2.6-2.6 2.6V29a1.3 1.3 0 0 1-2.6 0v-6.4L16.1 20l2.6-2.6Z" fill={`url(#${id}slot)`} />
        <circle cx="20" cy="20" r="2.2" fill="#1C2029" />
      </g>
      <ellipse cx="14" cy="12" rx="6" ry="3.4" transform="rotate(-35 14 12)" fill={`url(#${id}shine)`} />
    </svg>
  );
}

// Scroll-driven fall: as the hero scrolls away, each card strains on the hinge, snaps off and drops, front card first.
// A fall only ever moves forward: scrolling back up never lifts a card again. A card caught half-way when the page
// scrolls up finishes falling on its own, and every fallen card is hung back on the screw shortly after it is gone.
// A re-hung card can fall again once the hero is scrolled back above the point where that card starts to go.
const FALL_START = 0.06; // hero scroll progress where the first card starts to go
const FALL_STAGGER = 0.2; // gap between one card and the next
const FALL_SPAN = 0.45; // progress one card needs from strain to gone
const FINISH_MS = 900; // time a whole fall takes when a card finishes it on its own
const RETURN_DELAY = 500; // ms a fallen card stays gone before it is hung back
type FallMode = 'armed' | 'auto' | 'gone' | 'resting';
function useFallingCards(count: number) {
  const fanRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const hero = fanRef.current?.closest<HTMLElement>('.inner-hero');
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const states = Array.from({ length: count }, () => ({ t: 0, mode: 'armed' as FallMode }));
    const timers: number[] = [];
    let frame = 0;
    let autoFrame = 0;
    let lastTick = 0;
    const progressNow = () => Math.max(0, -hero.getBoundingClientRect().top) / (hero.offsetHeight * 0.85);
    const scrollT = (progress: number, i: number) => Math.min(1, Math.max(0, (progress - FALL_START - i * FALL_STAGGER) / FALL_SPAN));
    let lastProgress = progressNow();

    const paint = (card: HTMLDivElement, t: number, i: number) => {
      const strain = Math.min(1, t / 0.2); // swings further on the hinge first
      const drop = Math.max(0, (t - 0.2) / 0.8); // then falls, accelerating like gravity
      const dir = i % 2 ? -1 : 1;
      if (t > 0) card.classList.add('is-loose');
      card.style.setProperty('--fr', `${(strain * 12 + drop * 55 * dir).toFixed(2)}deg`);
      card.style.setProperty('--fx', `${(drop * 70 * dir).toFixed(1)}px`);
      card.style.setProperty('--fy', `${(drop * drop * 900).toFixed(1)}px`);
      card.style.opacity = String(1 - Math.max(0, (drop - 0.75) / 0.25));
    };
    // Put a fallen card straight back in place (while its transition is still off, so it does not fly back up), then drop it onto the screw.
    const hangBack = (i: number) => {
      const card = cardRefs.current[i];
      const s = states[i];
      s.t = 0;
      s.mode = scrollT(progressNow(), i) === 0 ? 'armed' : 'resting';
      if (!card) return;
      card.style.setProperty('--fr', '0deg');
      card.style.setProperty('--fx', '0px');
      card.style.setProperty('--fy', '0px');
      card.style.opacity = '';
      void card.offsetWidth;
      card.classList.remove('is-loose');
      card.animate(
        [{ opacity: 0, translate: '0 -48px', scale: '0.92' }, { opacity: 1, translate: '0 0', scale: '1' }],
        { duration: 700, easing: 'cubic-bezier(.34, 1.4, .64, 1)' },
      );
    };
    const advance = (i: number, t: number) => {
      const card = cardRefs.current[i];
      const s = states[i];
      s.t = t;
      if (card) paint(card, t, i);
      if (t >= 1) {
        s.mode = 'gone';
        timers.push(window.setTimeout(() => hangBack(i), RETURN_DELAY));
      }
    };
    const tick = (now: number) => {
      autoFrame = 0;
      const dt = now - lastTick;
      lastTick = now;
      states.forEach((s, i) => { if (s.mode === 'auto') advance(i, Math.min(1, s.t + dt / FINISH_MS)); });
      if (states.some((s) => s.mode === 'auto')) autoFrame = requestAnimationFrame(tick);
    };
    const update = () => {
      frame = 0;
      const progress = progressNow();
      const scrollingUp = progress < lastProgress;
      lastProgress = progress;
      states.forEach((s, i) => {
        const target = scrollT(progress, i);
        if (s.mode === 'resting' && target === 0) s.mode = 'armed';
        if (s.mode !== 'armed') return;
        if (scrollingUp && s.t > 0) {
          s.mode = 'auto';
          if (!autoFrame) { lastTick = performance.now(); autoFrame = requestAnimationFrame(tick); }
        } else if (target > s.t) advance(i, target);
      });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(autoFrame);
      timers.forEach((id) => clearTimeout(id));
    };
  }, [count]);
  return { fanRef, cardRefs };
}

// About hero: copy plus three cards hanging from one screw in their top-left corner (cards sit left of the copy on desktop).
export default function AboutHero({ content: c }: { content: Record<string, string> }) {
  const cards = splitLines(c.heroPillars).slice(0, ICONS.length).map((line) => {
    const bar = line.indexOf('|');
    return bar === -1 ? { title: line, text: '' } : { title: line.slice(0, bar).trim(), text: line.slice(bar + 1).trim() };
  });
  const { fanRef, cardRefs } = useFallingCards(cards.length);
  return (
    <div className="container ab-hero">
      <Reveal className="ab-hero-copy">
        {c.heroTag && (
          <p className="ab-tag">
            <span className="ab-tag-dot" aria-hidden="true" />
            <span className="ab-tag-label">{c.heroTag}</span>
            {c.heroTagNote && <><span className="ab-tag-sep" aria-hidden="true" /><span className="ab-tag-note">{c.heroTagNote}</span></>}
          </p>
        )}
        <h1 className="ab-title">
          {c.heroHeadline}
          {c.heroHeadlineHighlight && <><br /><span className="ab-title-hl">{c.heroHeadlineHighlight}</span></>}
        </h1>
        {c.heroSub && <p className="ab-sub"><FormattedText text={c.heroSub} /></p>}
        <HeroButtons />
      </Reveal>
      {cards.length > 0 && (
        <DirectionalReveal direction="left" delay={250} className="ab-fan-wrap">
          <div ref={fanRef} className="ab-fan">
            {/* Reversed so the first card is painted last and sits in front. */}
            {cards.map((card, i) => ({ card, i })).reverse().map(({ card, i }) => {
              const Icon = ICONS[i];
              return (
                <div key={i} ref={(el) => { cardRefs.current[i] = el; }} className={`ab-card ab-card-${i + 1}`}>
                  <span className="ab-card-icon" aria-hidden="true"><Icon size={20} /></span>
                  <div className="ab-card-body">
                    <p className="ab-card-title">{card.title}</p>
                    {card.text && <p className="ab-card-text">{card.text}</p>}
                  </div>
                </div>
              );
            })}
            <Screw />
          </div>
        </DirectionalReveal>
      )}
    </div>
  );
}
