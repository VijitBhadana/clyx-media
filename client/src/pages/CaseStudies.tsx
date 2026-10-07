import { usePageTitle } from '@/hooks/usePageMeta';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import CasePattern from '@/components/sections/CasePattern';
import CaseHeroArt from '@/components/sections/CaseHeroArt';
import { RevealWords } from '@/components/ui/ScrollMotion';
import { cn } from '@/lib/utils';
import { useCaseStudies } from '@/lib/caseStudies';
import type { CaseStudyItem } from '@/data/caseStudies';
import { usePageContent } from '@/lib/pageContent';
import '@/styles/case-studies-hero.css';
import { responsiveImage } from '@/lib/images';
import { FormattedText } from '@/components/ui/FormattedText';

/** One case study as a photo card: just enough to pick a story, the whole card opens its page. */
function CaseCard({ item, index, detailsText }: { item: CaseStudyItem; index: number; detailsText: string }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.25, 1, 0.5, 1] }}
      className="min-w-0"
    >
      <a
        href={`/case-studies/${item.slug}`}
        className={cn(
          'group relative isolate flex h-[340px] flex-col justify-between overflow-hidden rounded-[24px] bg-slate-900 p-5 md:h-[380px]',
          'shadow-[0_24px_60px_-32px_rgba(15,23,42,0.55)] transition-[transform,box-shadow] duration-500 ease-out',
          'hover:-translate-y-1.5 hover:shadow-[0_34px_80px_-34px_rgba(1,58,163,0.6)] dark:hover:shadow-[0_34px_80px_-34px_rgba(255,222,89,0.35)]',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow motion-reduce:transition-none motion-reduce:hover:translate-y-0'
        )}
      >
        <img
          {...responsiveImage(item.src, '(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 380px')}
          alt={item.alt}
          loading={index < 3 ? 'eager' : 'lazy'}
          decoding="async"
          className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5" style={{ background: item.accent }} />

        <span className="flex items-start justify-between gap-3">
          {item.category && (
            <span className="max-w-[80%] rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-md">
              {item.category}
            </span>
          )}
          <span className="ml-auto font-mono text-xs font-bold text-yellow drop-shadow">{item.code}</span>
        </span>

        <span className="block">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">{item.brand}</span>
          <span className="display mt-2 block max-w-[20ch] text-[21px] font-bold leading-[1.12] tracking-[-0.02em] text-white md:text-[23px]">
            {item.headline}
          </span>
          <span className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4">
            {item.result && (
              <span className="display rounded-full bg-yellow px-3.5 py-1 text-sm font-bold leading-tight text-dark">{item.result}</span>
            )}
            <span className="ml-auto inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
              {detailsText}
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-dark transition-colors duration-300 group-hover:bg-yellow">
                <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </span>
          </span>
        </span>
      </a>
    </motion.li>
  );
}

/** "Number | label" lines from the admin as headline stats. */
const statsOf = (text: string) =>
  text
    .split('\n')
    .map((line) => line.split('|').map((part) => part.trim()))
    .filter(([value]) => value)
    .map(([value, label = '']) => ({ value, label }));

function CaseGrid({ items, c }: { items: CaseStudyItem[]; c: Record<string, string> }) {
  if (!items.length) return null;
  const stats = statsOf(c.listStats || '');

  return (
    // Full-width section with the content centred inside, so dark mode's glass-card sections stay centred too.
    <section className="relative pb-8 pt-12 md:pb-12 md:pt-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <header className="mb-10 grid gap-8 md:mb-14 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-16">
          <div>
            {c.listLabel && (
              <p className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-white/60">
                <span aria-hidden="true" className="h-px w-8 bg-current" />
                {c.listLabel}
              </p>
            )}
            <h2 className="display text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-slate-900 md:text-6xl dark:text-white">
              <FormattedText text={c.listTitle} />
            </h2>
          </div>
          <div>
            {c.listText && (
              <p className="text-base leading-relaxed text-slate-600 md:text-lg dark:text-white/70">
                <FormattedText text={c.listText} />
              </p>
            )}
            {stats.length > 0 && (
              <dl className="mt-7 grid grid-cols-3 gap-4 border-t border-slate-200 pt-6 dark:border-white/10">
                {stats.map((stat) => (
                  <div key={stat.value + stat.label} className="min-w-0">
                    <dt className="display text-2xl font-bold tracking-[-0.02em] text-blue md:text-3xl dark:text-yellow">{stat.value}</dt>
                    <dd className="mt-1 text-xs leading-snug text-slate-500 md:text-[13px] dark:text-white/60">{stat.label}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </header>

        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {items.map((item, i) => (
            <CaseCard key={item.id} item={item} index={i} detailsText={c.caseDetailsButton || 'View case study'} />
          ))}
        </ul>
      </div>
    </section>
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
      <CaseGrid items={caseStudies} c={c} />

      <CasePattern content={c} />
    </PageShell>
  );
}
