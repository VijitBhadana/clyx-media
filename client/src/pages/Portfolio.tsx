import { usePageTitle } from '@/hooks/usePageMeta';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion';
import {
  ArrowUpRight,
  Check,
  Cpu,
  LayoutGrid,
  ShoppingBag,
  Shirt,
  Sparkles,
  TrendingUp,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import { Label, Section } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import { pageDefaults, safeHref, splitLines, usePageContent } from '@/lib/pageContent';
import { usePortfolio, type PortfolioItem } from '@/lib/portfolio';
import '@/styles/portfolio-hero.css';
import { responsiveImage } from '@/lib/images';
import { FormattedText } from '@/components/ui/FormattedText';
import DiscCascadeCarousel, { type DiscCascadeController, type DiscCascadeItem } from '@/components/ui/disc-cascade-carousel';
import { slugify } from '@/data/caseStudies';

type PortfolioImage = PortfolioItem;

// Known categories get their own icon; any new category the admin types gets a generic one.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  all: LayoutGrid,
  beauty: Sparkles,
  food: UtensilsCrossed,
  fashion: Shirt,
  tech: Cpu,
  d2c: ShoppingBag,
};

type Filter = { label: string; icon: LucideIcon };

function FilterPills({ filters, active, onChange }: { filters: Filter[]; active: string; onChange: (label: string) => void }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mb-10 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="relative flex max-w-full flex-wrap justify-center gap-3 md:gap-4"
      >
        {filters.map(({ label, icon: Icon }, index) => {
          const isActive = active === label;
          return (
            <motion.button
              key={label}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(label)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.06, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={{ scale: 0.94 }}
              className={cn(
                'group relative isolate inline-flex items-center gap-2 overflow-hidden !rounded-full border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-[color,background-color,border-color,box-shadow] duration-300 md:px-5 md:text-xs',
                isActive
                  ? 'border-transparent text-white shadow-[0_6px_16px_-8px_rgba(30,91,216,0.45)]'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] backdrop-blur-md hover:border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)] hover:text-foreground'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="portfolio-filter-active"
                  className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-[#1E5BD8] to-[#013AA3] ring-1 ring-inset ring-white/15"
                  transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                >
                  {!reduceMotion && (
                    <motion.span
                      className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                      animate={{ x: ['0%', '400%'] }}
                      transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
                    />
                  )}
                </motion.span>
              )}

              <Icon
                size={14}
                strokeWidth={2.25}
                className={cn(
                  'transition-all duration-300',
                  isActive
                    ? 'text-yellow'
                    : 'text-[var(--text-muted)] group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:text-yellow'
                )}
              />
              <span>{label}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

// Second title line: cycles through the admin's words.
const WORD_MS = 2400;

function HeroWords({ words }: { words: string[] }) {
  const reduceMotion = useReducedMotion();
  const [tick, setTick] = useState(0);
  const count = words.length;

  useEffect(() => {
    if (reduceMotion || count < 2) return;
    const id = window.setInterval(() => setTick(t => t + 1), WORD_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion, count]);

  if (!count) return null;
  const active = tick % count;
  const leaving = (active - 1 + count) % count;

  return (
    <span className="pf-words">
      <span className="sr-only">{words.join(' ')}</span>
      <span className="pf-words-track" aria-hidden="true">
        {words.map((word, i) => (
          <span key={i} className={cn('pf-word', i === active && 'is-active', count > 1 && i === leaving && 'is-leaving')}>
            {word}
          </span>
        ))}
      </span>
    </span>
  );
}

// Left column under the title: intro and stat row.
function HeroLead({ c }: { c: Record<string, string> }) {
  const stats = [1, 2, 3].map(n => ({ value: c[`heroStat${n}Value`], label: c[`heroStat${n}Label`] })).filter(s => s.value);

  return (
    <div className="pf-lead">
      {c.heroLede && <p className="pf-intro"><FormattedText text={c.heroLede} /></p>}
      {stats.length > 0 && (
        <dl className="pf-stats">
          {stats.map((s, i) => (
            <div key={i} className="pf-stat">
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

// Right column: a fanned stack of project cards that deals the next one to the front every few seconds.
const DEAL_MS = 3200;

function HeroStack({ items, note, countLabel, total }: { items: PortfolioImage[]; note: string; countLabel: string; total: number }) {
  const reduceMotion = useReducedMotion();
  const [front, setFront] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;

  useEffect(() => {
    if (reduceMotion || paused || count < 2) return;
    const id = window.setInterval(() => setFront(i => (i + 1) % count), DEAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion, paused, count]);

  return (
    <div className="pf-stack" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <span className="pf-chip">
        <span className="ih-dot" aria-hidden="true" />
        <b>{total}</b> {countLabel}
      </span>

      {note && (
        <p className="pf-note" aria-hidden="true">
          {note}
          <svg viewBox="0 0 50 40" className="pf-note-arrow">
            <path d="M4 6 C 26 4, 42 14, 40 34" />
            <path d="M32 28 L 40 36 L 47 27" />
          </svg>
        </p>
      )}

      <div className="pf-stack-cards">
        {items.map((item, i) => {
          const pos = (i - front + count) % count;
          return (
            <figure key={item.code} className="pf-card" data-pos={Math.min(pos, 3)} aria-hidden={pos !== 0}>
              <img {...responsiveImage(item.src, '320px')} alt={item.alt} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
              <figcaption>
                <span className="pf-card-tag">
                  {item.code} · {item.category}
                </span>
                <span className="pf-card-title">{item.title}</span>
                <span className="pf-card-result">
                  <TrendingUp size={14} strokeWidth={2.5} />
                  {item.result}
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>

      {count > 1 && (
        <div className="pf-stack-dots">
          {items.map((item, i) => (
            <button
              key={item.code}
              type="button"
              aria-label={`Show ${item.title}`}
              aria-pressed={i === front}
              className={cn('pf-dot', i === front && 'is-active')}
              onClick={() => setFront(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Results strip running along the bottom edge of the hero.
function HeroTicker({ items }: { items: PortfolioImage[] }) {
  if (!items.length) return null;
  return (
    <div className="pf-ticker" aria-hidden="true">
      <div className="pf-ticker-track">
        {[0, 1].map(copy => (
          <div key={copy} className="pf-ticker-group">
            {items.map((item, i) => (
              <span key={i} className="pf-ticker-item">
                <b>{item.title}</b>
                <span>{item.result}</span>
                <Sparkles size={12} className="pf-ticker-spark" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Cards per hover-expand strip; longer lists (e.g. "All") stack into several strips.
const ROW_SIZE = 6;

type ShowcaseProps = {
  items: PortfolioImage[];
  outcomeLabel: string;
  // Card to open expanded instead of each strip's first one.
  initialSlug?: string;
  // When set, opening an expanded card calls this instead of following its link (used by "All" to jump to the card's category).
  onSelect?: (item: PortfolioImage) => void;
};

function HoverExpandPortfolio({ items, className, ...rest }: ShowcaseProps & { className?: string }) {
  const rows = Array.from({ length: Math.ceil(items.length / ROW_SIZE) }, (_, i) => items.slice(i * ROW_SIZE, (i + 1) * ROW_SIZE));

  return (
    <div className={cn('relative w-full max-w-7xl mx-auto py-8 select-none space-y-4 md:space-y-6', className)}>
      {rows.map((row, i) => (
        <PortfolioRow key={i} items={row} delay={0.2 + i * 0.08} {...rest} />
      ))}
    </div>
  );
}

function PortfolioRow({ items, delay, outcomeLabel, initialSlug, onSelect }: ShowcaseProps & { delay: number }) {
  const [activeImage, setActiveImage] = useState<number | null>(() => Math.max(0, items.findIndex(item => item.slug === initialSlug)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="overflow-x-auto pb-4 pt-2"
    >
      {/* w-max + mx-auto centres the strip when it fits and lets it scroll from the first card when it doesn't. */}
      <div className="mx-auto flex w-max items-center gap-2 md:gap-3">
        {items.map((image, index) => {
          const isActive = activeImage === index;
          return (
            <motion.a
              key={image.slug}
              href={`/portfolio/${image.slug}`}
              aria-label={`${image.title} · ${image.category} · ${image.result}`}
              className="relative block cursor-pointer overflow-hidden rounded-2xl md:rounded-3xl border-2 border-[#DCEBFA] shrink-0 bg-[#DCEBFA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow"
              animate={{
                width: isActive ? '24rem' : '5rem',
                height: '24rem',
              }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
              // Hover already expands the card on desktop; on touch the first tap expands and the second opens it.
              onClick={e => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                if (isActive && !onSelect) return;
                e.preventDefault();
                if (isActive) onSelect?.(image);
                else setActiveImage(index);
              }}
              onHoverStart={() => setActiveImage(index)}
              onFocus={() => setActiveImage(index)}
            >
              <img
                {...responsiveImage(image.src, '(max-width: 767px) 85vw, 520px')}
                className="h-full w-full object-cover"
                alt={image.alt}
                loading="lazy"
                decoding="async"
              />

              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-300',
                  isActive ? 'opacity-100' : 'opacity-60'
                )}
              />

              {/* Collapsed view indicator */}
              {!isActive && (
                <div className="absolute inset-0 flex flex-col justify-between p-3 text-center pointer-events-none">
                  <span className="font-mono text-[10px] text-yellow font-bold">{image.code}</span>
                  <span className="font-bold text-xs uppercase tracking-widest text-white [writing-mode:vertical-lr] rotate-180 mx-auto">
                    {image.title}
                  </span>
                  <span className="text-[10px] text-white/60 uppercase">{image.category}</span>
                </div>
              )}

              {/* Expanded active content */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 flex flex-col justify-between p-6 z-10"
                  >
                    <div className="flex justify-between items-center">
                      <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-yellow text-dark uppercase tracking-wider">
                        {image.code} · {image.category}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white">
                        <ArrowUpRight size={16} />
                      </div>
                    </div>

                    <div>
                      <h3 className="display text-3xl font-bold text-white tracking-tight leading-none">
                        {image.title}
                      </h3>
                      <div className="mt-3 flex items-center gap-3 border-t border-white/20 pt-3">
                        <span className="text-xs uppercase tracking-widest text-white/70 font-semibold">
                          {outcomeLabel || 'Outcome'}
                        </span>
                        <span className="text-base font-bold text-yellow">{image.result}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
}

// Placement of the two floating result chips; their text is ctaStat1/ctaStat2 in the page content.
// The journey arrow runs aura (chip 2) -> kulture (chip 1) -> button.
const CTA_STATS = [
  { id: 'kulture', n: 1, className: 'left-[45%] top-14', tilt: '-rotate-3', delay: 0.35, float: 5 },
  { id: 'aura', n: 2, className: 'left-[35%] bottom-12', tilt: 'rotate-2', delay: 0.2, float: 6 },
] as const;

type Box = { x: number; y: number; w: number; h: number };
type Journey = { toCard: string; toCardHead: string; toButton: string; toButtonHead: string };

type Pt = { x: number; y: number };

const boxOf = (el: HTMLElement): Box => ({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });

const unit = (v: Pt): Pt => {
  const len = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / len, y: v.y / len };
};

type Cubic = [Pt, Pt, Pt, Pt];

const cubicAt = ([p0, p1, p2, p3]: Cubic, s: number): Pt => {
  const m = 1 - s;
  const [a, b, c, d] = [m * m * m, 3 * m * m * s, 3 * m * s * s, s * s * s];
  return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y };
};

const cubicTangent = ([p0, p1, p2, p3]: Cubic, s: number): Pt => {
  const m = 1 - s;
  const [a, b, c] = [3 * m * m, 6 * m * s, 3 * s * s];
  return unit({
    x: a * (p1.x - p0.x) + b * (p2.x - p1.x) + c * (p3.x - p2.x),
    y: a * (p1.y - p0.y) + b * (p2.y - p1.y) + c * (p3.y - p2.y),
  });
};

// Hand-drawn loop arrow: follows the cubic `base`, and around its midpoint slows down while swinging
// through one full circle towards `side` (1 = left of travel, -1 = right), so the stroke overshoots,
// curls back and crosses itself like a marker doodle. Returns the sampled path and its final tangent.
function loopArrow(base: Cubic, side: 1 | -1, steps = 140) {
  const LOOP_AT = 0.5;
  const LOOP_HALF = 0.22; // half-width of the loop window, in t
  const LOOP_SPEED = 0.25; // how slowly the base curve advances inside the window
  const chord = Math.hypot(base[3].x - base[0].x, base[3].y - base[0].y);
  const radius = Math.min(64, Math.max(34, chord * 0.14));

  // Cumulative progress along the base curve, eased down inside the loop window.
  const speed = (t: number) =>
    Math.abs(t - LOOP_AT) < LOOP_HALF ? 1 - (1 - LOOP_SPEED) * 0.5 * (1 + Math.cos((Math.PI * (t - LOOP_AT)) / LOOP_HALF)) : 1;
  const progress = [0];
  for (let i = 1; i <= steps; i++) progress.push(progress[i - 1] + (speed((i - 1) / steps) + speed(i / steps)) / 2);
  const total = progress[steps];

  const T = cubicTangent(base, progress[Math.round(LOOP_AT * steps)] / total);
  const N = { x: T.y * side, y: -T.x * side };

  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = cubicAt(base, progress[i] / total);
    const k = (t - LOOP_AT + LOOP_HALF) / (2 * LOOP_HALF);
    if (k > 0 && k < 1) {
      const angle = 2 * Math.PI * k * k * (3 - 2 * k);
      const along = radius * Math.sin(angle);
      const across = radius * (1 - Math.cos(angle));
      p.x += along * T.x + across * N.x;
      p.y += along * T.y + across * N.y;
    }
    pts.push(p);
  }

  return {
    d: pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' '),
    end: pts[steps],
    // A few samples back gives a steadier heading for the arrowhead than the last segment alone.
    control: pts[steps - 4],
  };
}

// Open hand-drawn chevron at `end`, aligned with the tangent coming from `control`.
function arrowHead(end: Pt, control: Pt): string {
  const d = unit({ x: end.x - control.x, y: end.y - control.y });
  const p = { x: -d.y, y: d.x };
  const base = { x: end.x - d.x * 15, y: end.y - d.y * 15 };
  const f = (pt: Pt) => `${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  return `M ${f({ x: base.x + p.x * 12, y: base.y + p.y * 12 })} L ${f(end)} L ${f({ x: base.x - p.x * 12, y: base.y - p.y * 12 })}`;
}

// Builds two hand-drawn loop arrows in container pixels: aura chip -> kulture chip, then kulture chip -> note.
function buildJourney(aura: Box, kulture: Box, note: Box): Journey {
  const start = { x: aura.x + aura.w * 0.5, y: aura.y - 12 };
  const into = { x: kulture.x + kulture.w * 0.45, y: kulture.y + kulture.h + 18 };
  const out = { x: kulture.x + kulture.w + 16, y: kulture.y + kulture.h * 0.5 };
  const end = { x: note.x + note.w * 0.2, y: note.y - 14 };

  // Rises from the aura chip bowing left, loops, then sweeps up-right into the kulture chip.
  const rise = { x: into.x - start.x, y: into.y - start.y };
  const toCard = loopArrow(
    [
      start,
      { x: start.x - rise.x * 0.35, y: start.y + rise.y * 0.55 },
      { x: into.x - rise.x * 0.35, y: into.y - rise.y * 0.3 },
      into,
    ],
    -1
  );

  // Arches right off the kulture chip, loops on the inside of the bend, then drops onto the note above the button.
  const drop = { x: end.x - out.x, y: end.y - out.y };
  const toButton = loopArrow(
    [
      out,
      { x: out.x + drop.x * 0.7, y: out.y },
      { x: end.x - drop.x * 0.2, y: end.y - drop.y * 0.45 },
      end,
    ],
    -1
  );

  return {
    toCard: toCard.d,
    toCardHead: arrowHead(toCard.end, toCard.control),
    toButton: toButton.d,
    toButtonHead: arrowHead(toButton.end, toButton.control),
  };
}

// Closing CTA: hand-drawn doodles (underline, loop arrow, note) draw themselves in once scrolled into view.
function CaseStudiesCta({ content: c = pageDefaults('portfolio') }: { content?: Record<string, string> }) {
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion
    ? { initial: false as const, animate: 'show' }
    : { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.4 } };

  const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    show: (delay: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: { pathLength: { delay, duration: 1.1, ease: 'easeInOut' }, opacity: { delay, duration: 0.01 } },
    }),
  };
  const pop: Variants = {
    hidden: { opacity: 0, scale: 0.4 },
    show: (delay: number) => ({ opacity: 1, scale: 1, transition: { delay, type: 'spring', stiffness: 420, damping: 18 } }),
  };
  const write: Variants = {
    hidden: { clipPath: 'inset(-40% 100% -40% -150%)' },
    show: (i: number) => ({
      clipPath: 'inset(-40% -150% -40% -150%)',
      transition: { delay: 3 + i * 0.045, duration: 0.12, ease: 'linear' },
    }),
  };
  const trace: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    show: ({ delay, duration }: { delay: number; duration: number }) => ({
      pathLength: 1,
      opacity: 1,
      transition: { pathLength: { delay, duration, ease: 'easeInOut' }, opacity: { delay, duration: 0.01 } },
    }),
  };
  const rise: Variants = {
    hidden: { opacity: 0, y: '0.6em', rotateX: -80, filter: 'blur(6px)' },
    show: (delay: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      filter: 'blur(0px)',
      transition: { delay, type: 'spring', stiffness: 380, damping: 16 },
    }),
  };
  const highlight = (c.ctaHighlight ?? '').trim();
  const underlineDelay = 0.35 + highlight.replace(/\s/g, '').length * 0.055;
  const note = c.ctaNote;
  const includes = splitLines(c.ctaIncludes);
  const noteArrowDelay = 3.1 + note.length * 0.045;
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: (delay: number) => ({ opacity: 1, y: 0, transition: { delay, duration: 0.5, ease: [0.23, 1, 0.32, 1] } }),
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLParagraphElement>(null);
  const chipRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [journey, setJourney] = useState<Journey | null>(null);

  useLayoutEffect(() => {
    const { aura, kulture } = chipRefs.current;
    const noteEl = noteRef.current;
    const container = containerRef.current;
    if (!aura || !kulture || !noteEl || !container) return;

    // Chips are display:none below xl, so offsetParent is null there and the arrow is skipped.
    const measure = () =>
      setJourney(
        aura.offsetParent && kulture.offsetParent ? buildJourney(boxOf(aura), boxOf(kulture), boxOf(noteEl)) : null
      );
    measure();
    const observer = new ResizeObserver(measure);
    [container, aura, kulture, noteEl].forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <motion.section {...reveal} className="relative isolate overflow-hidden bg-blue text-white mb-10 md:mb-14">
      {/* Soft dot grid + corner glow for depth. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full bg-[#FFDE59]/15 blur-3xl"
      />

      {/* Spinning badge tucked into the section's top-left corner (desktop only). */}
      <motion.div
        aria-hidden="true"
        variants={pop}
        custom={0.9}
        className="pointer-events-none absolute left-5 top-5 hidden lg:block"
      >
        <motion.svg
          viewBox="0 0 120 120"
          className="h-24 w-24"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        >
          <defs>
            <path id="cta-badge-ring" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
          </defs>
          <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(255,255,255,0.18)" strokeDasharray="3 6" />
          <text className="fill-white/80 text-[10.5px] font-semibold uppercase tracking-[0.32em]">
            <textPath href="#cta-badge-ring">{c.ctaBadge}</textPath>
          </text>
        </motion.svg>
        <span className="absolute inset-0 m-auto grid h-10 w-10 place-items-center rounded-full bg-yellow text-dark">
          <Sparkles size={16} strokeWidth={2.25} />
        </span>
      </motion.div>

      <div
        ref={containerRef}
        className="container relative flex flex-col gap-10 py-20 md:py-28 lg:flex-row lg:items-end lg:justify-between lg:pt-36"
      >
        {/* Journey arrows (aura -> kulture, kulture -> button), each drawn then capped with its head.
            Always mounted (hidden until measured) so they follow the section's reveal variants. */}
        <svg
          aria-hidden="true"
          className={cn('pointer-events-none absolute inset-0 h-full w-full overflow-visible', !journey && 'invisible')}
        >
          {[
            { d: journey?.toCard, head: journey?.toCardHead, delay: 0.6, duration: 1 },
            { d: journey?.toButton, head: journey?.toButtonHead, delay: 1.8, duration: 1.1 },
          ].map(arrow => (
            <g key={arrow.delay}>
              <motion.path
                d={arrow.d ?? 'M0 0'}
                fill="none"
                stroke="white"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={trace}
                custom={arrow}
              />
              <motion.path
                d={arrow.head ?? 'M0 0'}
                fill="none"
                stroke="white"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={trace}
                custom={{ delay: arrow.delay + arrow.duration, duration: 0.25 }}
              />
            </g>
          ))}
        </svg>

        {/* Top-right: what's inside a case study (desktop only). */}
        <div className="absolute right-10 top-12 hidden w-72 lg:block">
          <motion.p
            variants={fadeUp}
            custom={0.5}
            className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-yellow md:text-xs"
          >
            {c.ctaIncludesTitle}
          </motion.p>
          <ul className="space-y-2.5 border-l border-white/15 pl-4">
            {includes.map((item, i) => (
              <motion.li
                key={i}
                variants={fadeUp}
                custom={0.65 + i * 0.12}
                className="flex items-start gap-2.5 text-sm leading-snug text-white/80"
              >
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-yellow text-dark">
                  <Check size={10} strokeWidth={3.5} />
                </span>
                {item}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Floating result chips (xl+ only, where there is room for the journey). */}
        {CTA_STATS.map(stat => (
          <motion.div
            key={stat.id}
            ref={el => {
              chipRefs.current[stat.id] = el;
            }}
            aria-hidden="true"
            variants={pop}
            custom={stat.delay}
            className={cn('pointer-events-none absolute hidden xl:block', stat.className)}
          >
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: stat.float, repeat: Infinity, ease: 'easeInOut' }}
              className={cn(
                'flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.6)] backdrop-blur-md',
                stat.tilt
              )}
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-yellow text-dark">
                <TrendingUp size={16} strokeWidth={2.4} />
              </span>
              <span className="leading-tight">
                <span className="block font-display text-xl font-bold tracking-tight text-yellow">{c[`ctaStat${stat.n}Value`]}</span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">
                  {c[`ctaStat${stat.n}Label`]}
                </span>
              </span>
            </motion.div>
          </motion.div>
        ))}

        <div>
          <Label style={{ color: '#FFDE59' }}>{c.ctaLabel}</Label>
          <h2 className="display relative text-5xl font-bold md:text-7xl">
            {/* Hand-drawn sparkle doodle beside the headline. */}
            <svg
              aria-hidden="true"
              viewBox="0 0 48 48"
              className="absolute -right-12 -top-7 hidden h-11 w-11 overflow-visible text-yellow md:block"
            >
              {['M24 6 L24 18', 'M36 12 L30 21', 'M42 26 L32 27'].map((d, i) => (
                <motion.path
                  key={d}
                  d={d}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  variants={draw}
                  custom={0.9 + i * 0.12}
                />
              ))}
            </svg>
            {c.ctaTitle}
            <br />
            <span className="relative inline-block text-yellow">
              <span className="sr-only">{highlight}</span>
              {/* Letters flip up one by one, then a hand-drawn underline sweeps under the words. */}
              <span aria-hidden="true" className="[perspective:600px]">
                {highlight.split(' ').map((word, w, words) => {
                  const start = words.slice(0, w).join('').length;
                  return (
                    <span key={w}>
                      {w > 0 && ' '}
                      <span className="inline-block whitespace-nowrap">
                        {Array.from(word).map((ch, i) => (
                          <motion.span
                            key={i}
                            className="inline-block origin-bottom"
                            variants={rise}
                            custom={0.25 + (start + i) * 0.055}
                          >
                            {ch}
                          </motion.span>
                        ))}
                      </span>
                    </span>
                  );
                })}
              </span>
              <svg
                aria-hidden="true"
                viewBox="0 0 300 20"
                preserveAspectRatio="none"
                className="pointer-events-none absolute -bottom-3 left-0 h-4 w-full overflow-visible md:-bottom-4 md:h-5"
              >
                <motion.path
                  d="M4 13 C 70 5, 150 4, 296 9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={5}
                  strokeLinecap="round"
                  variants={draw}
                  custom={underlineDelay}
                />
              </svg>
            </span>
          </h2>
        </div>

        <div className="flex flex-col items-start gap-4 lg:items-end">
          {/* Handwritten note, uncovered letter by letter like a pen stroke. */}
          <p
            ref={noteRef}
            aria-hidden="true"
            className="flex items-start gap-1 font-['Architects_Daughter',cursive] text-xl leading-none text-yellow -rotate-3 md:text-[1.38rem] lg:mr-10"
          >
            <span className="whitespace-pre">
              {note.split('').map((ch, i) => (
                <motion.span key={i} className="inline-block" variants={write} custom={i}>
                  {ch}
                </motion.span>
              ))}
            </span>
            <svg viewBox="0 0 50 40" className="mt-2 h-7 w-8 overflow-visible">
              <motion.path
                d="M4 6 C 26 4, 42 14, 40 34"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                variants={draw}
                custom={noteArrowDelay}
              />
              <motion.path
                d="M32 28 L 40 36 L 47 27"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={draw}
                custom={noteArrowDelay + 0.35}
              />
            </svg>
          </p>

          <motion.a
            href={safeHref(c.ctaButtonUrl || '/contact')}
            whileHover={reduceMotion ? undefined : { y: -3 }}
            className="group relative z-10 inline-flex items-center gap-3 bg-yellow px-6 py-4 text-sm font-semibold uppercase tracking-[.1em] text-dark shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] transition-colors hover:bg-white"
          >
            {c.ctaButton}
            <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </motion.a>
        </div>
      </div>
    </motion.section>
  );
}

// Disc art for the built-in brands, in their own colours; brands added in the admin get the carousel's default palettes.
const DISC_STYLES: Record<string, Pick<DiscCascadeItem, 'pattern' | 'palette'>> = {
  okhai: { pattern: 'sunburst', palette: ['#f6efe4', '#f19a2b', '#8a8a8a'] },
  'studio-rigu': { pattern: 'eclipse', palette: ['#111111', '#f4f1ea', '#c8a24a'] },
  'the-souled-store': { pattern: 'stripes', palette: ['#f4f3ef', '#c62a2f', '#1d1d1d'] },
  'mutha-beauty': { pattern: 'halftone', palette: ['#f7efec', '#9c6a52', '#d9b8a6'] },
  snob: { pattern: 'rings', palette: ['#f49ac1', '#f2ec6d', '#ef7d3c'] },
  savana: { pattern: 'sunburst', palette: ['#ecad32', '#2b2b2b', '#f6e3b4'] },
  'google-gemini': { pattern: 'eclipse', palette: ['#0b1020', '#4f8cff', '#f2c94c'] },
  superyou: { pattern: 'stripes', palette: ['#1f5fae', '#e0353b', '#f4f4f4'] },
  'flipkart-glam-up': { pattern: 'sunburst', palette: ['#fde3ea', '#f7c626', '#8a1c4a'] },
  kratos: { pattern: 'rings', palette: ['#141414', '#2e2e2e', '#d9d9d9'] },
  'live-wab': { pattern: 'mosaic', palette: ['#2b0a5e', '#e3127b', '#7b2ff7'] },
};

// Page scroll, in viewport heights, that moves the carousel on by one disc: half a screen for a short list,
// shrinking for a long one so the whole run stays around six screens (never under a fifth of a screen per disc).
// The section shows at most this many discs: the brand rows first, then portfolio projects fill the rest.
const MAX_DISCS = 15;

const discScrollSvh = (count: number) => Math.min(50, Math.max(20, 600 / Math.max(count - 1, 1)));

// A portfolio project as a disc: its photo is the print, its result / category / story opening are the points.
function projectDisc(item: PortfolioItem): DiscCascadeItem {
  const story = item.detail.replace(/\s+/g, ' ').trim();
  // First sentence (no lookbehind: older Safari can't parse it).
  const opening = story.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? story;
  return {
    title: item.title,
    // The disc is at most 400px across, so a phone-sized photo is plenty.
    src: /^https:\/\/images\.unsplash\.com\//.test(item.src) ? item.src.replace(/([?&])w=\d+/, '$1w=600') : item.src,
    alt: item.alt,
    points: [
      item.result,
      item.category && `${item.category} campaign`,
      opening && (opening.length > 90 ? opening.slice(0, 88).trimEnd() + '…' : opening),
    ].filter(Boolean) as string[],
  };
}

/**
 * Scroll-driven discs: the carousel is pinned inside `trackRef` while the page scrolls past it, and the
 * line follows the scroll continuously (straight to the carousel, no React render per frame), settling on
 * the nearest disc once scrolling stops. Arrows / drag call `goTo`, which scrolls the page to that disc's
 * spot, so the scroll position and the discs never disagree.
 */
function useScrollDiscs(trackRef: RefObject<HTMLDivElement | null>, count: number) {
  const controller = useRef<DiscCascadeController>(null);
  // Where the track starts and how far it scrolls, measured on resize rather than read back every frame.
  const cached = useRef<{ top: number; total: number } | null>(null);
  const measure = () => {
    const el = trackRef.current;
    if (!el) return (cached.current = null);
    const top = el.getBoundingClientRect().top + window.scrollY;
    return (cached.current = { top, total: Math.max(el.offsetHeight - window.innerHeight, 1) });
  };
  const metrics = () => cached.current ?? measure();

  useEffect(() => {
    if (count < 2) return;
    let raf = 0;
    let settle = 0;
    const update = () => {
      raf = 0;
      const m = metrics();
      if (!m) return;
      const position = Math.min(Math.max((window.scrollY - m.top) / m.total, 0), 1) * (count - 1);
      controller.current?.setPosition(position);
      window.clearTimeout(settle);
      settle = window.setTimeout(() => controller.current?.setPosition(Math.round(position)), 160);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    update();
    // Content above (images, the CMS answering) can push the track down, so re-measure when the page grows.
    const observer = new ResizeObserver(onResize);
    observer.observe(document.body);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const goTo = (i: number) => {
    const m = metrics();
    if (!m || count < 2) return;
    window.scrollTo({ top: m.top + (i / (count - 1)) * m.total, behavior: 'smooth' });
  };

  return [controller, goTo] as const;
}

// Brand discs: one "name | logo | point | point | point" row per brand from the admin.
function BrandDiscs({ c, projects }: { c: Record<string, string>; projects: PortfolioItem[] }) {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  // Memoised so each disc keeps the same item object across scroll re-renders and its art isn't rebuilt.
  const brands = useMemo<DiscCascadeItem[]>(
    () =>
      splitLines(c.brandDiscs)
        .map(line => line.split('|').map(cell => cell.trim()))
        .filter(([name]) => name)
        .map(([name, logo, ...points]) => ({
          title: name,
          logo: logo || undefined,
          points: points.filter(Boolean),
          ...DISC_STYLES[slugify(name)],
        }))
        .slice(0, MAX_DISCS),
    [c.brandDiscs]
  );
  // Portfolio projects not already listed as a brand above follow them, in portfolio order, up to MAX_DISCS in all.
  const withProjects = c.brandsWithProjects !== 'No';
  const projectDiscs = useMemo(() => {
    if (!withProjects) return [];
    const listed = new Set(brands.map(b => slugify(b.title)));
    return projects.filter(p => p.title && !listed.has(slugify(p.title))).slice(0, Math.max(0, MAX_DISCS - brands.length));
  }, [withProjects, brands, projects]);
  const items = useMemo(() => [...brands, ...projectDiscs.map(projectDisc)], [brands, projectDiscs]);
  const [controller, goTo] = useScrollDiscs(trackRef, items.length);
  if (!items.length) return null;

  return (
    <section id="brands" className="pf-discs pb-16 md:pb-24">
      <div className="container">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="mb-8 md:mb-10"
        >
          {c.brandsLabel && <Label className="!mb-4">{c.brandsLabel}</Label>}
          <h2 className="display text-4xl font-bold md:text-6xl">
            {c.brandsTitle} <span className="text-blue dark:text-yellow">{c.brandsHighlight}</span>
          </h2>
        </motion.div>
      </div>

      {/* Tall track: the carousel stays pinned while the page scrolls one disc per discScrollSvh(),
          then the track ends and the page carries on to the footer. */}
      <div
        ref={trackRef}
        className="pf-discs-track"
        style={{ height: `calc(100svh + ${(items.length - 1) * discScrollSvh(items.length)}svh)` }}
      >
        <div className="pf-discs-pin container">
          <DiscCascadeCarousel
            items={items}
            className="pf-discs-stage"
            height="100%"
            discSize="clamp(200px, min(46vmin, 34vw), 400px)"
            controllerRef={controller}
            defaultIndex={0}
            onIndexChange={goTo}
            // Clicking the chosen project disc opens that project, as its card does.
            onSelect={(_, i) => {
              const project = projectDiscs[i - brands.length];
              if (project) window.location.href = `/portfolio/${project.slug}`;
            }}
            duration={0.55}
            bounce={0.12}
            spin={0}
            reviews={false}
            indexLabel={c.brandsIndexLabel}
            hint={c.brandsHint}
            background="var(--bg-secondary)"
            color="var(--foreground)"
            serif="var(--font-display)"
            sans="var(--font-body)"
            display="var(--font-display)"
            ariaLabel={c.brandsLabel || 'Brands'}
          />
        </div>
      </div>
    </section>
  );
}

export default function Portfolio() {
  usePageTitle('Portfolio | CLYX Media');
  const c = usePageContent('portfolio');
  const portfolioImages = usePortfolio();
  const allLabel = c.heroFilterAllLabel || 'All';
  const filters: Filter[] = [allLabel, ...Array.from(new Set(portfolioImages.map(item => item.category).filter(Boolean)))].map(label => ({
    label,
    icon: CATEGORY_ICONS[label.toLowerCase()] ?? TrendingUp,
  }));
  const [filter, setFilter] = useState(allLabel);
  const [openSlug, setOpenSlug] = useState<string>();
  const changeFilter = (label: string) => {
    setOpenSlug(undefined);
    setFilter(label);
  };
  const isAll = filter === allLabel;
  const filtered = isAll ? portfolioImages.slice(0, ROW_SIZE) : portfolioImages.filter(item => item.category === filter);
  // The hero stack deals the first project of up to four categories, so it shows some range.
  const seen = new Set<string>();
  const heroPicks = portfolioImages.filter(item => !seen.has(item.category) && Boolean(seen.add(item.category))).slice(0, 4);

  return (
    <PageShell
      heroClass="pf-hero"
      eyebrow={c.heroTag}
      title={
        <>
          {c.heroHeadline}
          <br />
          <HeroWords words={splitLines(c.heroWords)} />
        </>
      }
      intro=""
      lead={<HeroLead c={c} />}
      aside={heroPicks.length > 0 && <HeroStack items={heroPicks} note={c.heroNote} countLabel={c.heroCountLabel} total={portfolioImages.length} />}
      heroDecor={<HeroTicker items={portfolioImages} />}
    >
      <Section className="py-12 !pt-4 md:!pt-6">
        {/* Category Filter Pills */}
        <FilterPills filters={filters} active={filter} onChange={changeFilter} />

        {/* Hover-Expand Animated Showcase (remounted per filter so each strip opens on its first card).
            In "All", clicking a card opens its category with that card expanded; there a click opens the project page. */}
        <HoverExpandPortfolio
          key={filter}
          items={filtered}
          outcomeLabel={c.outcomeLabel}
          initialSlug={openSlug}
          onSelect={
            isAll
              ? item => {
                  // An uncategorised project has no tab to open, so go straight to its page.
                  if (!item.category) return void (window.location.href = `/portfolio/${item.slug}`);
                  setOpenSlug(item.slug);
                  setFilter(item.category);
                }
              : undefined
          }
        />
      </Section>

      <CaseStudiesCta content={c} />

      <BrandDiscs c={c} projects={portfolioImages} />
    </PageShell>
  );
}
