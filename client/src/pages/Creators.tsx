import { ArrowUpRight } from 'lucide-react';
import { motion, MotionValue, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import PageShell from '@/components/layout/PageShell';
import { Label, Section } from '@/components/ui/primitives';
import { useCollection } from '@/lib/siteContent';

const defaultCreatorImages = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
];

const creatorTypes = [
  ['01', 'The Hook', 'Creators who know how to stop the scroll in the first two seconds.'],
  ['02', 'The Trust', 'Authentic voices with genuine relationships to their audiences.'],
  ['03', 'The Proof', 'Creative minds who make your product look organic, lived-in, and irresistible.'],
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

export function ParallaxCreatorGallery() {
  const creatorImages = useCollection<string>('creators', defaultCreatorImages, item => item.image).filter(Boolean);
  // Always fill four columns: repeat the images when there are few, split them evenly when there are many.
  const source = creatorImages.length ? creatorImages : defaultCreatorImages;
  const filled = Array.from({ length: Math.max(12, source.length) }, (_, i) => source[i % source.length]);
  const perColumn = Math.ceil(filled.length / 4);
  const columns = [0, 1, 2, 3].map(k => filled.slice(k * perColumn, (k + 1) * perColumn));
  const gallery = useRef<HTMLDivElement>(null);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  const { scrollYProgress } = useScroll({
    target: gallery,
    offset: ['start end', 'end start'],
  });

  const { height } = dimension;
  const y = useTransform(scrollYProgress, [0, 1], [0, height * 0.8]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, height * 1.3]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, height * 0.55]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, height * 1.1]);

  useEffect(() => {
    const resize = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', resize);
    resize();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="w-full bg-[color:var(--background)] text-foreground transition-colors overflow-hidden border-b border-grid">
      <div className="flex flex-col items-center justify-center pt-16 pb-8 text-center">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-blue dark:text-yellow">
          Creator Bench in Motion
        </span>
        <h3 className="display text-3xl md:text-5xl font-bold mt-2">
          The Faces Behind Scaled Accounts
        </h3>
        <p className="text-sm text-muted mt-3 max-w-md">
          Scroll through our multi-column parallax talent gallery.
        </p>
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

export default function Creators() {
  return (
    <PageShell
      eyebrow="Creators"
      title={
        <>
          People make
          <br />
          <span className="text-yellow">the difference.</span>
        </>
      }
      intro="Our creator network is built for relevance, not reach alone. We match the right voice to the right category, then give the best content room to travel."
    >
      {/* Intro Feature */}
      <Section>
        <div className="grid gap-12 md:grid-cols-[1.1fr_.9fr] md:items-center">
          <div className="relative aspect-[4/3] overflow-hidden bg-yellow p-8 text-dark rounded-3xl">
            <p className="font-mono text-xs font-bold tracking-widest text-dark/70">CREATOR / CLYX</p>
            <h2 className="display absolute bottom-8 left-8 right-8 text-4xl sm:text-6xl md:text-7xl font-bold leading-[0.92]">
              The feed is a conversation.
            </h2>
          </div>
          <div>
            <Label>Why creators work with us</Label>
            <h2 className="display text-4xl sm:text-5xl md:text-6xl font-bold">
              No vanity metrics.
              <br />
              <span className="text-blue dark:text-yellow">Just better work.</span>
            </h2>
            <p className="mt-6 text-sm sm:text-base leading-7 text-muted">
              We protect the creator voice while making the brief, usage rights, production, and paid distribution clear from day one.
            </p>
            <a
              href="/contact"
              className="mt-8 inline-flex items-center gap-3 bg-blue px-6 py-4 text-sm font-semibold uppercase tracking-[.1em] text-white hover:bg-yellow hover:text-dark transition-colors rounded-full"
            >
              Join the network <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </Section>

      {/* Skiper30 Parallax_002 Gallery */}
      <ParallaxCreatorGallery />

      {/* Creator Types Section */}
      <section className="bg-blue text-white">
        <div className="container grid gap-8 py-20 md:grid-cols-3 md:py-28">
          {creatorTypes.map((item) => (
            <div key={item[0]} className="border-t border-white/25 pt-6">
              <p className="font-mono text-xs text-yellow">{item[0]}</p>
              <h3 className="display mt-10 text-3xl md:text-4xl font-semibold">{item[1]}</h3>
              <p className="mt-4 text-sm leading-6 text-white/70">{item[2]}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
