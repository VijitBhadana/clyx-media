import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import { Label } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import { useCollection } from '@/lib/siteContent';

interface CaseStudyItem {
  id: string;
  code: string;
  brand: string;
  category: string;
  headline: string;
  result: string;
  detail: string;
  src: string;
  alt: string;
  accent: string;
}

const defaultCaseStudies: CaseStudyItem[] = [
  {
    id: 'kulture-skin',
    code: '01',
    brand: 'Kulture Skin',
    category: 'Beauty / Creator commerce',
    headline: 'From organic proof to paid growth.',
    result: '3.4x ROAS',
    detail: 'A creator-led testing system that found the hooks worth scaling, then turned them into a repeatable paid engine.',
    src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1400&q=85',
    alt: 'Kulture Skin Campaign',
    accent: '#FFDE59',
  },
  {
    id: 'nova-nutrition',
    code: '02',
    brand: 'Nova Nutrition',
    category: 'Food / Performance',
    headline: 'More signal. Less spend.',
    result: '42% lower CPA',
    detail: 'A creative refresh and landing-page loop built around clearer proof, sharper offers, and faster iteration.',
    src: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1400&q=85',
    alt: 'Nova Nutrition Campaign',
    accent: '#003AA3',
  },
  {
    id: 'mutha-beauty',
    code: '03',
    brand: 'Mutha Beauty',
    category: 'Fashion / Social',
    headline: 'Make the feed feel like the brand.',
    result: '10M+ impressions',
    detail: 'A culture-first content system that kept the brand recognizable while expanding reach across paid channels.',
    src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=85',
    alt: 'Mutha Beauty Campaign',
    accent: '#FFDE59',
  },
  {
    id: 'orbit-labs',
    code: '04',
    brand: 'Orbit Labs',
    category: 'Tech / Conversion CRO',
    headline: 'Speed is a creative feature.',
    result: '+28% CVR lift',
    detail: 'Sub-second mobile checkout experiences and friction-free shopping architectures that capture lost demand.',
    src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=85',
    alt: 'Orbit Labs Campaign',
    accent: '#003AA3',
  },
];

function HoverExpand_002({
  items,
  className,
}: {
  items: CaseStudyItem[];
  className?: string;
}) {
  const [activeItem, setActiveItem] = useState<number | null>(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className={cn('relative w-full max-w-6xl mx-auto px-4 py-8 select-none', className)}
    >
      <div className="flex w-full flex-col items-center justify-center gap-3">
        {items.map((item, index) => {
          const isActive = activeItem === index;

          return (
            <motion.div
              key={item.id}
              className={cn(
                'group relative w-full cursor-pointer overflow-hidden rounded-2xl md:rounded-3xl border transition-all duration-300',
                isActive
                  ? 'border-yellow ring-1 ring-yellow/50 shadow-2xl'
                  : 'border-grid hover:border-foreground/40 bg-zinc-900/60'
              )}
              initial={{ height: '4.5rem' }}
              animate={{
                height: isActive ? '22rem' : '4.5rem',
              }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
              onClick={() => setActiveItem(index)}
              onHoverStart={() => setActiveItem(index)}
            >
              {/* Background Photo */}
              <img
                src={item.src}
                className="absolute inset-0 h-full w-full object-cover"
                alt={item.alt}
                loading="lazy"
                decoding="async"
              />

              {/* Dark Overlay Gradient */}
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/40 transition-opacity duration-300',
                  isActive ? 'opacity-95' : 'opacity-85 group-hover:opacity-75'
                )}
              />

              {/* Collapsed State Bar (Always Visible at Top) */}
              <div className="relative z-10 flex h-[4.5rem] w-full items-center justify-between px-5 md:px-8">
                <div className="flex items-center gap-4 md:gap-6">
                  <span className="font-mono text-xs md:text-sm font-bold text-yellow">
                    #{item.code}
                  </span>
                  <h3 className="display text-xl md:text-2xl font-bold text-white tracking-tight">
                    {item.brand}
                  </h3>
                  <span className="hidden sm:inline-block text-xs uppercase tracking-wider text-white/60 font-medium">
                    / {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="display text-lg md:text-xl font-bold text-yellow">
                    {item.result}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-transform group-hover:scale-110">
                    <ArrowUpRight size={16} />
                  </div>
                </div>
              </div>

              {/* Expanded State Content Area */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.25 }}
                    className="relative z-10 flex h-[calc(22rem-4.5rem)] w-full flex-col justify-between px-5 pb-6 md:px-8 md:pb-8 pt-1"
                  >
                    <div className="max-w-2xl">
                      <h4 className="display text-2xl md:text-4xl font-bold text-white leading-tight">
                        {item.headline}
                      </h4>
                      <p className="mt-3 text-sm md:text-base text-white/80 leading-relaxed font-normal max-w-xl">
                        {item.detail}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-4 border-t border-white/20 pt-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60 block">
                          Verified Scale Outcome
                        </span>
                        <span className="display text-2xl md:text-4xl font-bold text-yellow mt-0.5 block">
                          {item.result}
                        </span>
                      </div>

                      <a
                        href="/contact"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-full bg-yellow px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-dark hover:bg-blue hover:text-white transition-colors"
                      >
                        Request Case Breakdown <ArrowUpRight size={15} />
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function CaseStudies() {
  const caseStudies = useCollection<CaseStudyItem>('caseStudies', defaultCaseStudies, (item, i) => ({
    id: item.id,
    code: String(i + 1).padStart(2, '0'),
    brand: item.brand,
    category: item.category,
    headline: item.headline,
    result: item.result,
    detail: item.detail,
    src: item.image,
    alt: `${item.brand} Campaign`,
    accent: item.accent || '#FFDE59',
  }));

  return (
    <PageShell
      eyebrow="Case studies"
      title={
        <>
          The work behind
          <br />
          <span className="text-yellow">the movement.</span>
        </>
      }
      intro="Real brands, real constraints, real growth systems. Explore how CLYX turns creative instinct into measurable momentum."
    >
      {/* Skiper53 / HoverExpand_002 Expanding Accordion Showcase */}
      <HoverExpand_002 items={caseStudies} />

      <section className="bg-yellow text-dark">
        <div className="container grid gap-10 py-16 md:grid-cols-[1fr_1fr] md:items-end md:py-24">
          <div>
            <Label className="text-dark">The recurring pattern</Label>
            <h2 className="display text-4xl font-bold md:text-6xl">
              Find the signal.
              <br />
              Scale the signal.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 opacity-85">
            The best results rarely come from one perfect post. They come from building a system that knows what to keep, what to cut, and what to try next.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
