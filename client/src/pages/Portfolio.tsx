import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import { Label, Section } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

interface PortfolioImage {
  src: string;
  alt: string;
  code: string;
  category: string;
  title: string;
  result: string;
}

const portfolioImages: PortfolioImage[] = [
  {
    src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=85',
    alt: 'Kulture Skin UGC Ads',
    code: '#01',
    category: 'Beauty',
    title: 'Kulture Skin',
    result: '3.4x ROAS',
  },
  {
    src: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1000&q=85',
    alt: 'Nova Nutrition Hook Scale',
    code: '#02',
    category: 'Food',
    title: 'Nova Nutrition',
    result: '42% lower CPA',
  },
  {
    src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85',
    alt: 'Mutha Editorial Feed',
    code: '#03',
    category: 'Fashion',
    title: 'Mutha Beauty',
    result: '10M+ impressions',
  },
  {
    src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=85',
    alt: 'Orbit Labs CRO Architecture',
    code: '#04',
    category: 'Tech',
    title: 'Orbit Labs',
    result: '+28% CVR lift',
  },
  {
    src: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85',
    alt: 'Halo D2C Whitelisting',
    code: '#05',
    category: 'D2C',
    title: 'Halo Goods',
    result: '4.1x blended ROAS',
  },
  {
    src: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85',
    alt: 'Aura Social Paid Pipeline',
    code: '#06',
    category: 'Fashion',
    title: 'Aura Collective',
    result: '+188% CTR',
  },
];

const filters = ['All', 'Beauty', 'Food', 'Fashion', 'Tech', 'D2C'];

function HoverExpandPortfolio({ items, className }: { items: PortfolioImage[]; className?: string }) {
  const [activeImage, setActiveImage] = useState<number | null>(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={cn('relative w-full max-w-7xl mx-auto py-8 select-none', className)}
    >
      <div className="flex w-full items-center justify-center gap-2 md:gap-3 overflow-x-auto pb-4 pt-2">
        {items.map((image, index) => {
          const isActive = activeImage === index;
          return (
            <motion.div
              key={image.title + index}
              className="relative cursor-pointer overflow-hidden rounded-2xl md:rounded-3xl border border-grid shrink-0 bg-[#050505]"
              animate={{
                width: isActive ? '24rem' : '5rem',
                height: '24rem',
              }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
              onClick={() => setActiveImage(index)}
              onHoverStart={() => setActiveImage(index)}
            >
              <img src={image.src} className="h-full w-full object-cover" alt={image.alt} />

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
                          Outcome
                        </span>
                        <span className="text-base font-bold text-yellow">{image.result}</span>
                      </div>
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

export default function Portfolio() {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? portfolioImages : portfolioImages.filter(item => item.category === filter);

  return (
    <PageShell
      eyebrow="Portfolio"
      title={
        <>
          Proof, not
          <br />
          <span className="text-yellow">promises.</span>
        </>
      }
      intro="A selection of the systems, campaigns, and storefronts we have built to turn attention into measurable growth."
    >
      <Section className="py-12">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {filters.map(item => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={cn(
                'border px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-[0.1em] transition-all',
                filter === item
                  ? 'border-blue bg-blue text-white shadow-md'
                  : 'border-grid text-muted hover:border-blue hover:text-foreground'
              )}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Hover-Expand Animated Showcase */}
        <HoverExpandPortfolio items={filtered} />
      </Section>

      <section className="bg-blue text-white">
        <div className="container flex flex-col gap-8 py-20 md:flex-row md:items-end md:justify-between md:py-28">
          <div>
            <Label style={{ color: '#FFDE59' }}>Want the long version?</Label>
            <h2 className="display text-5xl font-bold md:text-7xl">
              See how the
              <br />
              <span className="text-yellow">work works.</span>
            </h2>
          </div>
          <a
            href="/contact"
            className="inline-flex items-center gap-3 bg-yellow px-6 py-4 text-sm font-semibold uppercase tracking-[.1em] text-dark hover:bg-white transition-colors"
          >
            Request case studies <ArrowUpRight size={16} />
          </a>
        </div>
      </section>
    </PageShell>
  );
}
