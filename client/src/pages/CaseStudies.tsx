import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import CasePattern from '@/components/sections/CasePattern';
import CaseHeroArt from '@/components/sections/CaseHeroArt';
import { RevealWords } from '@/components/ui/ScrollMotion';
import { cn } from '@/lib/utils';
import { useCollection } from '@/lib/siteContent';
import { safeHref, usePageContent } from '@/lib/pageContent';
import '@/styles/case-studies-hero.css';

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

interface CaseCardProps {
  item: CaseStudyItem;
  index: number;
  href: string;
  buttonText: string;
  featured?: boolean;
}

function CaseCard({ item, index, href, buttonText, featured = false }: CaseCardProps) {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: featured ? 0 : index * 0.08, ease: [0.25, 1, 0.5, 1] }}
      className={cn(
        'group relative flex overflow-hidden rounded-3xl border border-slate-200 bg-white backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]',
        'shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)] transition-all duration-500 dark:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)]',
        'hover:-translate-y-1.5 hover:border-yellow/60 hover:shadow-[0_30px_80px_-30px_rgba(255,222,89,0.35)] dark:hover:shadow-[0_30px_80px_-30px_rgba(255,222,89,0.35)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow',
        featured ? 'flex-col lg:flex-row' : 'flex-col'
      )}
    >
      {/* Image */}
      <div
        className={cn(
          'relative shrink-0 overflow-hidden',
          featured ? 'aspect-[16/10] lg:aspect-auto lg:w-[58%]' : 'aspect-[16/11]'
        )}
      >
        <img
          src={item.src}
          alt={item.alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5" style={{ background: item.accent }} />

        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
          <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
            {item.category}
          </span>
          <span className="font-mono text-xs font-bold text-yellow drop-shadow">#{item.code}</span>
        </div>

        <div className="absolute bottom-4 left-4 rounded-2xl bg-yellow px-4 py-2 shadow-lg">
          <span className="display block text-lg font-bold leading-none text-dark md:text-xl">{item.result}</span>
        </div>
      </div>

      {/* Body */}
      <div className={cn('flex flex-1 flex-col', featured ? 'p-6 md:p-8 lg:p-10' : 'p-6')}>
        <h3 className="font-['Poppins',sans-serif] text-[26px] font-normal leading-tight tracking-normal text-slate-900 dark:text-white">
          {item.brand}
        </h3>
        <h4 className="mt-3 font-['Poppins',sans-serif] text-lg font-medium leading-snug tracking-normal text-slate-800 dark:text-white/90">
          {item.headline}
        </h4>
        <p className="mt-1.5 font-['Poppins',sans-serif] text-lg font-normal leading-[1.65] tracking-normal text-slate-600 dark:text-white/70">
          {item.detail}
        </p>

        {featured && (
          <span className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-yellow px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-dark transition-colors group-hover:bg-blue group-hover:text-white">
            {buttonText} <ArrowUpRight size={15} />
          </span>
        )}
      </div>
    </motion.a>
  );
}

function CaseCards({
  items,
  className,
  buttonText,
  buttonUrl,
}: {
  items: CaseStudyItem[];
  className?: string;
  buttonText: string;
  buttonUrl: string;
}) {
  const href = safeHref(buttonUrl || '/contact');
  const [featured, ...rest] = items;
  if (!featured) return null;

  return (
    <div className={cn('relative mx-auto w-full max-w-6xl px-4 py-8', className)}>
      <CaseCard item={featured} index={0} href={href} buttonText={buttonText} featured />

      {rest.length > 0 && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((item, i) => (
            <CaseCard
              key={item.id}
              item={item}
              index={i}
              href={href}
              buttonText={buttonText}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CaseStudies() {
  const c = usePageContent('caseStudies');
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
      heroClass="cs-hero"
      eyebrow={c.heroEyebrow}
      title={
        <>
          <RevealWords text={c.heroTitle} delay={150} step={50} />
          <br />
          <RevealWords
            text={c.heroHighlight}
            className="cs-hl"
            delay={150 + c.heroTitle.replace(/\s/g, '').length * 50}
            step={50}
          />
        </>
      }
      lead={
        <>
          {c.heroIntro && <p className="ih-intro">{c.heroIntro}</p>}
          <div className="cs-proof">
            {caseStudies.slice(0, 3).map((item) => (
              <span key={item.id} className="cs-chip">
                <strong>{item.result}</strong>
                {item.brand}
              </span>
            ))}
          </div>
        </>
      }
      intro={c.heroIntro}
      aside={<CaseHeroArt />}
    >
      <CaseCards items={caseStudies} buttonText={c.caseButton} buttonUrl={c.caseButtonUrl} />

      <CasePattern content={c} />
    </PageShell>
  );
}
