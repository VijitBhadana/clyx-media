import { usePageTitle } from '@/hooks/usePageMeta';
import { ArrowUpRight } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import CasePattern from '@/components/sections/CasePattern';
import CaseStoryline from '@/components/sections/CaseStoryline';
import CaseHeroArt from '@/components/sections/CaseHeroArt';
import { RevealWords } from '@/components/ui/ScrollMotion';
import { HaloReel, type HaloReelItem } from '@/components/ui/halo-reel';
import { useCaseStudies } from '@/lib/caseStudies';
import type { CaseStudyItem } from '@/data/caseStudies';
import { usePageContent } from '@/lib/pageContent';
import '@/styles/case-studies-hero.css';
import { responsiveImage } from '@/lib/images';
import { FormattedText } from '@/components/ui/FormattedText';

/** "Number | label" lines from the admin as headline stats. */
const statsOf = (text: string) =>
  text
    .split('\n')
    .map((line) => line.split('|').map((part) => part.trim()))
    .filter(([value]) => value)
    .map(([value, label = '']) => ({ value, label }));

/** "Our work" copy beside the reel (inside it on wide screens, above it on phones). */
function ReelLabel({ title, text, hint }: { title: string; text: string; hint: string }) {
  return (
    <>
      {title && (
        <p className="display text-5xl font-bold leading-none tracking-[-0.04em] text-slate-900 md:text-7xl dark:text-white">
          {title}
          <span className="text-yellow">.</span>
        </p>
      )}
      {text && (
        <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg dark:text-white/70">
          <FormattedText text={text} />
        </p>
      )}
      {hint && (
        <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:border-white/15 dark:bg-white/5 dark:text-white/60">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-yellow" />
          {hint}
        </p>
      )}
    </>
  );
}

function CaseGrid({ items, c }: { items: CaseStudyItem[]; c: Record<string, string> }) {
  if (!items.length) return null;
  const stats = statsOf(c.listStats || '');
  const detailsText = c.caseDetailsButton || 'View case study';
  const reelItems: HaloReelItem[] = items.map((item) => ({
    ...responsiveImage(item.src, '240px'),
    alt: item.alt,
    href: `/case-studies/${item.slug}`,
    linkLabel: `${detailsText}: ${item.brand}`,
    eyebrow: item.category,
    title: item.brand,
    badge: item.result,
    cta: <>{detailsText} <ArrowUpRight size={11} aria-hidden="true" /></>,
    accent: item.accent,
  }));

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

        {/* Our work: the case studies ride a turning ring; drag to spin, click a card to open it. */}
        <div className="mx-auto mb-4 max-w-md text-center md:hidden">
          <ReelLabel title={c.reelTitle} text={c.reelText} hint={c.reelHint} />
        </div>
        <HaloReel
          items={reelItems}
          aria-label={c.reelTitle || 'Our work'}
          centerLabel={
            <div className="hidden max-w-sm md:block">
              <ReelLabel title={c.reelTitle} text={c.reelText} hint={c.reelHint} />
            </div>
          }
          cardWidth={210}
          cardHeight={280}
          cardClassName="rounded-[20px] ring-1 ring-black/5 dark:ring-white/10"
          minScale={0.42}
          radiusXRatio={0.45}
          radiusYRatio={0.36}
          spread={1.5}
          scrollToSpin
          holdDuration={1800}
          stepDuration={800}
          className="h-[500px] rounded-[28px] md:h-[600px]"
        />
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

      <CaseStoryline content={c} />
    </PageShell>
  );
}
