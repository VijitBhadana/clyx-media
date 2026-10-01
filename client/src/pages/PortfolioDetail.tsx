import { useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react';
import { useParams } from 'wouter';
import PageShell from '@/components/layout/PageShell';
import { Label, Section } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/ScrollMotion';
import ServicesCTA from '@/components/sections/ServicesCTA';
import { useCaseStudies } from '@/lib/caseStudies';
import { safeHref, usePageContent } from '@/lib/pageContent';
import { projectStory, usePortfolio } from '@/lib/portfolio';
import NotFound from './NotFound';
import '@/styles/service-detail.css';
import '@/styles/case-study-detail.css';
import '@/styles/portfolio-detail.css';

const pad = (n: number) => String(n).padStart(2, '0');

/** One project's own page (/portfolio/<slug>), opened from a card on the Portfolio page. */
export default function PortfolioDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const c = usePageContent('portfolio');
  const services = usePageContent('services');
  const items = usePortfolio();
  const caseStudies = useCaseStudies();
  const at = items.findIndex((item) => item.slug === slug);
  const item = items[at];

  useEffect(() => {
    if (!item) return;
    const previous = document.title;
    document.title = `${item.title} | Portfolio | CLYX Media`;
    return () => { document.title = previous; };
  }, [item?.title]);

  if (!item) return <NotFound />;

  const story = projectStory(item);
  const caseStudy = caseStudies.find((study) => study.slug === item.slug);
  const requestHref = safeHref(c.detailButtonUrl || '/contact');
  // Projects from the same category first (following this one, wrapping round), then the rest, three in all.
  const following = [...items.slice(at + 1), ...items.slice(0, at)];
  const others = [
    ...following.filter((other) => other.category === item.category),
    ...following.filter((other) => other.category !== item.category),
  ].slice(0, 3);

  return (
    <PageShell
      eyebrow={`${c.detailEyebrow} · ${item.code}`}
      title={item.title}
      intro=""
      lead={
        <ul className="sd-hero-tags">
          {item.category && <li>{item.category}</li>}
          {item.result && <li className="csd-hero-result">{item.result}</li>}
        </ul>
      }
      aside={
        <div className="ih-card">
          <dl className="csd-facts">
            {item.category && (
              <div>
                <dt>{c.detailCategoryLabel}</dt>
                <dd>{item.category}</dd>
              </div>
            )}
            {item.result && (
              <div>
                <dt>{c.detailOutcomeLabel}</dt>
                <dd>{item.result}</dd>
              </div>
            )}
            <div>
              <dt>{c.detailServicesFactLabel}</dt>
              <dd>{story.services.slice(0, 3).join(' · ')}</dd>
            </div>
          </dl>
          {c.detailButton && (
            <div className="ih-actions">
              <a href={requestHref} className="ih-btn ih-btn-primary">{c.detailButton} <ArrowUpRight size={16} /></a>
            </div>
          )}
        </div>
      }
    >
      <Section className="csd-intro">
        <a href="/portfolio" className="sd-back"><ArrowLeft size={16} aria-hidden="true" /> {c.detailBackLabel}</a>

        <Reveal>
          <figure className="csd-cover">
            <img src={item.src} alt={item.alt} decoding="async" />
            <figcaption>
              {item.result && <span className="csd-cover-result">{item.result}</span>}
              <span className="csd-cover-brand">{item.title}</span>
            </figcaption>
          </figure>
        </Reveal>

        <div className="sd-overview-grid csd-overview">
          <Reveal>
            <Label>{c.detailOverviewLabel}</Label>
            <p className="sd-overview-text">{story.overview}</p>
          </Reveal>
          <Reveal delay={150}>
            <div className="sd-included">
              <p className="sd-included-title">{c.detailServicesLabel}</p>
              <ul>
                {story.services.map((service) => (
                  <li key={service}><span className="sd-check" aria-hidden="true"><Check size={14} strokeWidth={2.6} /></span>{service}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section className="pfd-process">
        <div className="sd-head">
          <Label>{c.detailProcessLabel}</Label>
          <h2 className="display text-4xl font-bold md:text-6xl">{c.detailProcessTitle}</h2>
        </div>
        <ol className="sd-steps">
          {story.steps.map((step, i) => (
            <li key={step.title}>
              <Reveal delay={i * 120} className="sd-step">
                <span className="sd-step-num">{pad(i + 1)}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>

      <Section className="pfd-result">
        <div className="csd-results-panel pfd-result-panel">
          <div>
            <Label className="csd-results-label">{c.detailResultLabel}</Label>
            <h2 className="display text-4xl font-bold md:text-6xl">{c.detailResultTitle}</h2>
            {item.result && <p className="csd-results-value display pfd-result-value">{item.result}</p>}
            {caseStudy && (
              <a href={`/case-studies/${caseStudy.slug}`} className="pfd-case-link">
                {c.detailCaseStudyLink} <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            )}
          </div>
          <div className="pfd-deliverables">
            <p className="pfd-deliverables-title">{c.detailDeliverablesLabel}</p>
            <ul>
              {story.deliverables.map((deliverable) => (
                <li key={deliverable}><Check size={16} strokeWidth={2.6} aria-hidden="true" />{deliverable}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {others.length > 0 && (
        <Section className="csd-more">
          <div className="sd-head">
            <Label>{c.detailMoreLabel}</Label>
            <h2 className="display text-4xl font-bold md:text-6xl">{c.detailMoreTitle}</h2>
          </div>
          <div className="csd-more-grid">
            {others.map((other) => (
              <a key={other.slug} href={`/portfolio/${other.slug}`} className="csd-more-card">
                <span className="csd-more-media">
                  <img src={other.src} alt="" loading="lazy" decoding="async" />
                  {other.result && <span className="csd-more-result">{other.result}</span>}
                </span>
                <span className="csd-more-body">
                  <span className="csd-more-category">{other.category}</span>
                  <span className="csd-more-title">{other.title}</span>
                </span>
                <ArrowUpRight size={20} className="csd-more-arrow" aria-hidden="true" />
              </a>
            ))}
          </div>
        </Section>
      )}

      <ServicesCTA content={services} />
    </PageShell>
  );
}
