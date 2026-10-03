import { useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Plus } from 'lucide-react';
import { useParams } from 'wouter';
import PageShell, { HeroButtons } from '@/components/layout/PageShell';
import { Label, Section } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/ScrollMotion';
import { ICONS as SERVICE_ICONS } from '@/components/sections/ServiceGrid';
import ServicesCTA from '@/components/sections/ServicesCTA';
import { usePageContent, useServices } from '@/lib/pageContent';
import NotFound from './NotFound';
import '@/styles/service-detail.css';
import { FormattedText } from '@/components/ui/FormattedText';

const pad = (n: number) => String(n).padStart(2, '0');

/** One service's own page (/services/<slug>), opened from the Services page list. */
export default function ServiceDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const c = usePageContent('services');
  const rows = useServices();
  const at = rows.findIndex((s) => s.slug === slug);
  const service = rows[at];

  useEffect(() => {
    if (!service) return;
    const previous = document.title;
    document.title = `${service.title} | CLYX Media`;
    return () => { document.title = previous; };
  }, [service?.title]);

  if (!service) return <NotFound />;

  const Icon = SERVICE_ICONS[service.iconKey]?.Icon;
  // The services that follow this one, wrapping round, so each page suggests a different next read.
  const others = [...rows.slice(at + 1), ...rows.slice(0, at)];

  return (
    <PageShell
      eyebrow={`${c.heroEyebrow} · ${pad(at + 1)}`}
      title={service.title}
      intro=""
      lead={
        <>
          {service.line && <p className="sd-hero-line">{service.line}</p>}
          {service.tags.length > 0 && <ul className="sd-hero-tags">{service.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>}
        </>
      }
      aside={
        <div className="ih-card">
          {Icon && <span className="sd-hero-icon"><Icon size={24} strokeWidth={1.8} aria-hidden="true" /></span>}
          <p className="ih-intro"><FormattedText text={service.text} /></p>
          <HeroButtons />
        </div>
      }
    >
      <Section className="sd-overview">
        <a href="/services" className="sd-back"><ArrowLeft size={16} aria-hidden="true" /> {c.detailBackLabel}</a>
        <div className="sd-overview-grid">
          <Reveal>
            <Label>{c.detailOverviewLabel}</Label>
            <p className="sd-overview-text"><FormattedText text={service.overview} /></p>
          </Reveal>
          {service.points.length > 0 && (
            <Reveal delay={150}>
              <div className="sd-included">
                <p className="sd-included-title">{c.detailIncludedLabel}</p>
                <ul>
                  {service.points.map((point) => (
                    <li key={point}><span className="sd-check" aria-hidden="true"><Check size={14} strokeWidth={2.6} /></span>{point}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}
        </div>
      </Section>

      {service.process.length > 0 && (
        <Section className="sd-process">
          <div className="sd-head">
            <Label>{c.detailProcessLabel}</Label>
            <h2 className="display text-4xl font-bold md:text-6xl">{c.detailProcessTitle}</h2>
          </div>
          <ol className="sd-steps">
            {service.process.map((step, i) => (
              <li key={i}>
                <Reveal delay={i * 120} className="sd-step">
                  <span className="sd-step-num">{pad(i + 1)}</span>
                  <h3>{step.title}</h3>
                  {step.text && <p>{step.text}</p>}
                </Reveal>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {service.faqs.length > 0 && (
        <Section className="sd-faq-section">
          <div className="sd-faq-grid">
            <div className="sd-head">
              <Label>{c.detailFaqLabel}</Label>
              <h2 className="display text-4xl font-bold md:text-6xl">{c.detailFaqTitle}</h2>
            </div>
            <div className="sd-faqs">
              {service.faqs.map((faq, i) => (
                <details key={i} className="sd-faq" open={i === 0}>
                  <summary>{faq.question}<Plus size={18} className="sd-faq-icon" aria-hidden="true" /></summary>
                  {faq.answer && <p>{faq.answer}</p>}
                </details>
              ))}
            </div>
          </div>
        </Section>
      )}

      <Section className="sd-more">
        <div className="sd-head">
          <Label>{c.detailMoreLabel}</Label>
          <h2 className="display text-4xl font-bold md:text-6xl">{c.detailMoreTitle}</h2>
        </div>
        <div className="sd-more-grid">
          {others.map((other) => {
            const OtherIcon = SERVICE_ICONS[other.iconKey]?.Icon;
            return (
              <a key={other.slug} href={`/services/${other.slug}`} className="sd-more-card">
                <span className="service-row-index">{OtherIcon ? <OtherIcon size={20} strokeWidth={1.9} aria-hidden="true" /> : other.index}</span>
                <span className="sd-more-title">{other.title}</span>
                {other.line && <span className="sd-more-line">{other.line}</span>}
                <ArrowUpRight size={20} className="sd-more-arrow" aria-hidden="true" />
              </a>
            );
          })}
        </div>
      </Section>

      <ServicesCTA content={c} />
    </PageShell>
  );
}
