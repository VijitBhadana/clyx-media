import { usePageTitle } from '@/hooks/usePageMeta';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import CasePattern from '@/components/sections/CasePattern';
import CaseHeroArt from '@/components/sections/CaseHeroArt';
import { RevealWords } from '@/components/ui/ScrollMotion';
import { cn } from '@/lib/utils';
import { useCaseStudies } from '@/lib/caseStudies';
import type { CaseStudyItem } from '@/data/caseStudies';
import { safeHref, usePageContent } from '@/lib/pageContent';
import '@/styles/case-studies-hero.css';
import { responsiveImage } from '@/lib/images';
import { FormattedText } from '@/components/ui/FormattedText';

interface CaseCardProps {
  item: CaseStudyItem;
  index: number;
  requestHref: string;
  requestText: string;
  detailsText: string;
  featured?: boolean;
}

function CaseCard({ item, index, requestHref, requestText, detailsText, featured = false }: CaseCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: featured ? 0 : index * 0.08, ease: [0.25, 1, 0.5, 1] }}
      className={cn(
        'group relative flex overflow-hidden rounded-3xl border border-slate-200 bg-white backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]',
        'shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)] transition-all duration-500 dark:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)]',
        'hover:-translate-y-1.5 hover:border-yellow/60 hover:shadow-[0_30px_80px_-30px_rgba(255,222,89,0.35)] dark:hover:shadow-[0_30px_80px_-30px_rgba(255,222,89,0.35)]',
        'has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-yellow',
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
          {...responsiveImage(item.src, featured ? '(max-width: 1023px) 92vw, 680px' : '(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 420px')}
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
          <FormattedText text={item.detail} />
        </p>

        <div className={cn('flex flex-wrap items-center gap-3', featured ? 'mt-8' : 'mt-auto pt-6')}>
          {/* The details link stretches over the whole card, so clicking anywhere opens the full case study. */}
          <a
            href={`/case-studies/${item.slug}`}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-yellow px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-dark transition-colors after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-hover:bg-blue group-hover:text-white"
            aria-label={`${detailsText}: ${item.brand}`}
          >
            {detailsText} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </a>
          {featured && requestText && (
            <a
              href={requestHref}
              className="relative z-10 inline-flex w-fit items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-800 transition-colors hover:border-yellow hover:bg-yellow hover:text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow dark:border-white/25 dark:text-white"
            >
              {requestText} <ArrowUpRight size={15} />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function CaseCards({
  items,
  className,
  requestText,
  requestUrl,
  detailsText,
}: {
  items: CaseStudyItem[];
  className?: string;
  requestText: string;
  requestUrl: string;
  detailsText: string;
}) {
  const requestHref = safeHref(requestUrl || '/contact');
  const [featured, ...rest] = items;
  if (!featured) return null;
  const shared = { requestHref, requestText, detailsText: detailsText || 'More details' };

  return (
    <div className={cn('relative mx-auto w-full max-w-6xl px-4 py-8', className)}>
      <CaseCard item={featured} index={0} {...shared} featured />

      {rest.length > 0 && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((item, i) => (
            <CaseCard key={item.id} item={item} index={i} {...shared} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CaseStudies() {
  usePageTitle('Case Studies | CLYX Media');
  const c = usePageContent('caseStudies');
  const caseStudies = useCaseStudies();

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
          {c.heroIntro && <p className="ih-intro"><FormattedText text={c.heroIntro} /></p>}
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
      <CaseCards
        items={caseStudies}
        requestText={c.caseButton}
        requestUrl={c.caseButtonUrl}
        detailsText={c.caseDetailsButton}
      />

      <CasePattern content={c} />
    </PageShell>
  );
}
