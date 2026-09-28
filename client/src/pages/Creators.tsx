import { motion, MotionValue, useInView, useMotionValue, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import PageShell from '@/components/layout/PageShell';
import CreatorTypes from '@/components/sections/CreatorTypes';
import CreatorsHeroArt from '@/components/sections/CreatorsHeroArt';
import { useCollection } from '@/lib/siteContent';
import { pageDefaults, safeHref, splitLines, usePageContent } from '@/lib/pageContent';

const defaultCreatorImages = [
  'https://zghkkgvsohtaqrkykycu.supabase.co/storage/v1/object/public/site-images/uploads/2026-09/8392ef01-517a-417a-a19d-7396fc756362.webp',
  'https://zghkkgvsohtaqrkykycu.supabase.co/storage/v1/object/public/site-images/uploads/2026-09/cf3317b5-03ff-4b9e-a882-3c073f9ca1ad.webp',
  'https://zghkkgvsohtaqrkykycu.supabase.co/storage/v1/object/public/site-images/uploads/2026-09/850cec7a-f3b6-4876-81d1-164884c50320.webp',
  'https://zghkkgvsohtaqrkykycu.supabase.co/storage/v1/object/public/site-images/uploads/2026-09/3dded1ef-3fb0-4bfd-a931-d7f107a51a05.webp',
  'https://zghkkgvsohtaqrkykycu.supabase.co/storage/v1/object/public/site-images/uploads/2026-09/69f632c0-f844-4fa4-9507-32293bdd0650.webp',
  'https://zghkkgvsohtaqrkykycu.supabase.co/storage/v1/object/public/site-images/uploads/2026-09/3dded1ef-3fb0-4bfd-a931-d7f107a51a05.webp',
  'https://zghkkgvsohtaqrkykycu.supabase.co/storage/v1/object/public/site-images/uploads/2026-09/804c4bf4-1fcc-4c74-90ee-a60bcec5c1e6.webp',
  'https://zghkkgvsohtaqrkykycu.supabase.co/storage/v1/object/public/site-images/uploads/2026-09/ba22219d-7aee-45a5-87e0-59534c9439c0.webp',
  'https://zghkkgvsohtaqrkykycu.supabase.co/storage/v1/object/public/site-images/uploads/2026-09/39a7a90b-5803-4a54-b133-bfa5f593e1c2.webp',
  'https://zghkkgvsohtaqrkykycu.supabase.co/storage/v1/object/public/site-images/uploads/2026-09/86eec45f-2c6e-4f2d-9627-2c298610eda1.webp',
];

// Stock photos for the intro video cards that have no poster set; the Creators list only feeds the gallery.
const defaultFeaturePosters = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
];

type ColumnProps = {
  images: string[];
  y: MotionValue<number>;
};

const Column = ({ images, y }: ColumnProps) => {
  return (
    <motion.div
      className="relative -top-[30%] flex h-full w-1/4 min-w-[180px] sm:min-w-[220px] flex-col gap-[1.5vw] first:top-[-30%] [&:nth-child(2)]:top-[-65%] [&:nth-child(3)]:top-[-30%] [&:nth-child(4)]:top-[-50%] will-change-transform"
      style={{ y, translateZ: 0 }}
    >
      {images.map((src, i) => (
        <div key={i} className="relative h-full w-full overflow-hidden rounded-2xl border border-grid shadow-md">
          <img
            src={src}
            alt="CLYX creator"
            loading="lazy"
            decoding="async"
            className="pointer-events-none h-full w-full object-cover"
          />
        </div>
      ))}
    </motion.div>
  );
};

export function ParallaxCreatorGallery({ content: c = pageDefaults('creators') }: { content?: Record<string, string> }) {
  const creatorImages = useCollection<string>('creators', defaultCreatorImages, item => item.image).filter(Boolean);
  // Each photo shows once: split them across the four columns as evenly as possible, earlier columns taking the extras.
  const source = creatorImages.length ? creatorImages : defaultCreatorImages;
  const base = Math.floor(source.length / 4);
  const extra = source.length % 4;
  const columns = [0, 1, 2, 3].map(k => {
    const start = k * base + Math.min(k, extra);
    return source.slice(start, start + base + (k < extra ? 1 : 0));
  });
  const gallery = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const { scrollYProgress } = useScroll({
    target: gallery,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, height * 0.8]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, height * 1.3]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, height * 0.55]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, height * 1.1]);

  // Only the viewport height drives the parallax. Resize events fire in bursts (and on mobile whenever the
  // address bar slides while scrolling), so they are coalesced to one per frame and ignored unless the height changed.
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      setHeight(window.innerHeight);
    };
    const resize = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    window.addEventListener('resize', resize);
    measure();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="w-full bg-[color:var(--background)] text-foreground transition-colors overflow-hidden border-b border-grid">
      <div className="flex flex-col items-center justify-center px-5 pt-16 pb-8 text-center md:px-8">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-blue dark:text-yellow">
          {c.galleryEyebrow}
        </span>
        <h3 className="display text-3xl md:text-5xl font-bold mt-2">{c.galleryTitle}</h3>
        <p className="text-sm text-muted mt-3 max-w-md">{c.galleryText}</p>
      </div>

      <div
        ref={gallery}
        className="relative box-border flex h-[140vh] md:h-[160vh] gap-[2vw] overflow-hidden bg-transparent p-[2vw]"
      >
        <Column images={columns[0]} y={y} />
        <Column images={columns[1]} y={y2} />
        <Column images={columns[2]} y={y3} />
        <Column images={columns[3]} y={y4} />
      </div>
    </div>
  );
}

// How far the pinned glass card sits from the top of the screen (clears the floating header).
const FEATURE_PIN_TOP = 84;
// Pinned-scroll timeline (0 → 1): the headline slides away over exactly the stretch in which the six video cards rise
// one by one, so the last card lands as the lines vanish; then "See more".
const LINES_OUT: [number, number] = [0, 0.78];
const CARDS_IN: [number, number] = [0, 0.78];
const BUTTON_IN: [number, number] = [0.8, 0.9];
const FEATURE_CARDS = 6;
// Resting tilt of each card, like a hand-laid row of phone screens.
const CARD_TILT = [-3, 2.5, -1.5, 2, -2.5, 3];

/** One headline line: slides off to the left or right and fades as `progress` runs across [from, to]. */
function ExitLine({ progress, from, to, toLeft, className, children }: { progress: MotionValue<number>; from: number; to: number; toLeft?: boolean; className: string; children: string }) {
  const x = useTransform(progress, [from, to], ['0vw', toLeft ? '-110vw' : '110vw']);
  const opacity = useTransform(progress, [from, from + (to - from) * 0.6, to], [1, 0.5, 0]);
  return (
    <motion.span className={`cf-line ${className}`} style={{ x, opacity }}>
      <span className="cf-line-in">{children}</span>
    </motion.span>
  );
}

type FeatureCard = { video: string; poster: string };

/** A creator video card that rises from below the stage in its slot of the timeline; the video plays only while shown. */
function RiseCard({ progress, i, card }: { progress: MotionValue<number>; i: number; card: FeatureCard }) {
  // Each card rises over 1.4 steps and starts one step after the previous, so the last one ends exactly at CARDS_IN[1].
  const step = (CARDS_IN[1] - CARDS_IN[0]) / (FEATURE_CARDS - 1 + 1.4);
  const start = CARDS_IN[0] + i * step;
  const end = start + step * 1.4;
  const tilt = CARD_TILT[i % CARD_TILT.length];
  const y = useTransform(progress, [start, end], ['115%', '0%']);
  const rotate = useTransform(progress, [start, end], [tilt * 4, tilt]);
  const opacity = useTransform(progress, [start, start + step * 0.5], [0, 1]);
  const video = useRef<HTMLVideoElement>(null);
  const shown = useInView(video, { amount: 0.3 });

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (shown) el.play().catch(() => {});
    else el.pause();
  }, [shown]);

  return (
    <motion.figure className="cf-card" style={{ y, rotate, opacity, zIndex: i + 1 }}>
      {card.poster && <img src={card.poster} alt="" loading="lazy" decoding="async" className="cf-card-media" />}
      {card.video && <video ref={video} className="cf-card-media" src={card.video} poster={card.poster || undefined} muted loop playsInline preload="metadata" />}
    </motion.figure>
  );
}

/**
 * Intro Feature: a stage that washes from white to baby blue while it is in view; the headline rises in with the blue.
 * The glass card then pins below the header and, as soon as the visitor keeps scrolling, all three lines slide off together
 * (line 1 right, line 2 left, line 3 right) and fade out while creator video cards rise from the bottom one by one, and a
 * "See more" button lands in the middle before the page scrolls on. Cards without a poster use the stock photos.
 */
function FeatureStage({ content: c }: { content: Record<string, string> }) {
  const feature = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  // Blue only while the section crosses a line 40% down the screen: on page load it sits below that line, so it starts white.
  const featureInView = useInView(feature, { margin: '-40% 0px -60% 0px' });
  // 0 = white, 1 = baby blue. Follows the scroll: it starts tinting the moment the section's top edge enters the
  // screen, is fully blue by the time that edge is halfway up, and fades back as the section's bottom leaves.
  const tint = useMotionValue(0);
  const background = useTransform(tint, [0, 1], ['#FFFFFF', '#A2D2FF']);
  // 0 when the card pins, 1 when the pinned stretch (the track's spacer) has been scrolled through.
  const progress = useMotionValue(0);
  const buttonY = useTransform(progress, BUTTON_IN, [40, 0]);
  const buttonOpacity = useTransform(progress, BUTTON_IN, [0, 1]);
  // Not clickable while it is still invisible under the cards.
  const buttonEvents = useTransform(progress, (v) => (v > BUTTON_IN[0] + 0.02 ? 'auto' : 'none'));
  const cards: FeatureCard[] = Array.from({ length: FEATURE_CARDS }, (_, i) => ({
    video: c[`featureVideo${i + 1}`] || '',
    poster: c[`featurePoster${i + 1}`] || defaultFeaturePosters[i % defaultFeaturePosters.length],
  }));

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const stage = feature.current?.getBoundingClientRect();
      if (stage) {
        const vh = window.innerHeight;
        const enter = (vh - stage.top) / (vh * 0.5);
        const exit = (stage.bottom - vh * 0.4) / (vh * 0.2);
        tint.set(Math.min(1, Math.max(0, Math.min(enter, exit))));
      }
      const el = track.current;
      const card = el?.firstElementChild as HTMLElement | null;
      if (!el || !card) return;
      const pinned = Math.max(1, el.offsetHeight - card.offsetHeight);
      const scrolled = FEATURE_PIN_TOP - el.getBoundingClientRect().top;
      progress.set(Math.min(1, Math.max(0, scrolled / pinned)));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [progress, tint]);

  return (
    <motion.div ref={feature} className={`creator-feature${featureInView ? ' is-active' : ''}`} style={{ backgroundColor: background }}>
      <motion.div className="creator-feature-orb creator-feature-orb-a" style={{ opacity: tint }} aria-hidden="true" />
      <motion.div className="creator-feature-orb creator-feature-orb-b" style={{ opacity: tint }} aria-hidden="true" />
      <div ref={track} className="creator-feature-track">
        <section className="section-shell creator-feature-glass" style={{ top: FEATURE_PIN_TOP }}>
          <h2 className="cf-title">
            <ExitLine progress={progress} from={LINES_OUT[0]} to={LINES_OUT[1]} className="cf-line-1">{c.featureLine1}</ExitLine>
            <ExitLine progress={progress} from={LINES_OUT[0]} to={LINES_OUT[1]} toLeft className="cf-line-2">{c.featureLine2}</ExitLine>
            <ExitLine progress={progress} from={LINES_OUT[0]} to={LINES_OUT[1]} className="cf-line-3">{c.featureLine3}</ExitLine>
          </h2>
          <div className="cf-cards">
            {cards.map((card, i) => <RiseCard key={i} progress={progress} i={i} card={card} />)}
          </div>
          {c.featureSeeMore && (
            <motion.a
              href={safeHref(c.featureSeeMoreUrl || '/portfolio')}
              className="cf-see-more"
              style={{ y: buttonY, opacity: buttonOpacity, pointerEvents: buttonEvents }}
            >
              {c.featureSeeMore}
            </motion.a>
          )}
        </section>
      </div>
    </motion.div>
  );
}

export default function Creators() {
  const c = usePageContent('creators');
  return (
    <PageShell
      heroClass="is-beige"
      eyebrow={c.heroEyebrow}
      title={
        <>
          {c.heroTitle}
          <br />
          <span className="text-yellow">{c.heroHighlight}</span>
        </>
      }
      intro=""
      aside={<CreatorsHeroArt left={splitLines(c.heroCloudLeft)} right={splitLines(c.heroCloudRight)} />}
    >
      <FeatureStage content={c} />

      {/* Skiper30 Parallax_002 Gallery */}
      <ParallaxCreatorGallery content={c} />

      {/* Creator Types Section */}
      <div className="mb-16 md:mb-24">
        <CreatorTypes content={c} />
      </div>
    </PageShell>
  );
}
