import { useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Quote } from 'lucide-react';
import { useParams } from 'wouter';
import PageShell from '@/components/layout/PageShell';
import { Label, Section } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/ScrollMotion';
import ServicesCTA from '@/components/sections/ServicesCTA';
import { storyFor } from '@/data/caseStudies';
import { useCaseStudies } from '@/lib/caseStudies';
import { safeHref, usePageContent } from '@/lib/pageContent';
import { useSiteContent } from '@/lib/siteContent';
import NotFound from './NotFound';
import '@/styles/service-detail.css';
import '@/styles/case-study-detail.css';
import { responsiveImage } from '@/lib/images';

const pad = (n: number) => String(n).padStart(2, '0');

/** One case study's own page (/case-studies/<slug>), opened from a card on the Case Studies page. */
export default function CaseStudyDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const c = usePageContent('caseStudies');
  const services = usePageContent('services');
  const items = useCaseStudies();
  const { data, isFetching } = useSiteContent();
  const at = items.findIndex((item) => item.slug === slug);
  const item = items[at];

  useEffect(() => {
    if (!item) return;
    const previous = document.title;
    document.title = `${item.brand} Case Study | CLYX Media`;
    return () => { document.title = previous; };
  }, [item?.brand]);

  // A project added in the CMS is only known once the list has loaded; until then the page stays blank.
  if (!item) return data?.collections?.caseStudies || !isFetching ? <NotFound /> : <div className="min-h-screen" />;

  const story = storyFor(item);
  const requestHref = safeHref(c.caseButtonUrl || '/contact');
  // The case studies that follow this one, wrapping round, so each page suggests a different next read.
  const others = [...items.slice(at + 1), ...items.slice(0, at)].slice(0, 3);

  return (
    <PageShell
      eyebrow={`${c.heroEyebrow} · ${item.code}`}
      title={item.brand}
      intro=""
      lead={
        <>
          {item.headline && <p className="sd-hero-line">{item.headline}</p>}
          <ul className="sd-hero-tags">
            {item.category && <li>{item.category}</li>}
            {item.result && <li className="csd-hero-result">{item.result}</li>}
          </ul>
        </>
      }
      aside={
        <div className="ih-card">
          <dl className="csd-facts">
            {story.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
          {c.caseButton && (
            <div className="ih-actions">
              <a href={requestHref} className="ih-btn ih-btn-primary">{c.caseButton} <ArrowUpRight size={16} /></a>
            </div>
          )}
        </div>
      }
    >
      <Section className="csd-intro">
        <a href="/case-studies" className="sd-back"><ArrowLeft size={16} aria-hidden="true" /> {c.detailBackLabel}</a>

        <Reveal>
          <figure className="csd-cover">
            <img {...responsiveImage(item.src, '(max-width: 1023px) 100vw, 1100px')} alt={item.alt} decoding="async" />
            <span className="csd-cover-accent" style={{ background: item.accent }} aria-hidden="true" />
            <figcaption>
              <span className="csd-cover-result">{item.result}</span>
              <span className="csd-cover-brand">{item.brand}</span>
            </figcaption>
          </figure>
        </Reveal>

        {story.metrics.length > 0 && (
          <ul className="csd-metrics">
            {story.metrics.map((metric, i) => (
              <li key={metric.label}>
                <Reveal delay={i * 90} className="csd-metric">
                  <span className="csd-metric-value display">{metric.value}</span>
                  <span className="csd-metric-label">{metric.label}</span>
                  {metric.note && <span className="csd-metric-note">{metric.note}</span>}
                </Reveal>
              </li>
            ))}
          </ul>
        )}

        <div className="sd-overview-grid csd-overview">
          <Reveal>
            <Label>{c.detailOverviewLabel}</Label>
            <p className="sd-overview-text">{story.overview}</p>
          </Reveal>
          {story.services.length > 0 && (
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
          )}
        </div>
      </Section>

      <Section className="csd-challenge">
        <div className="csd-split">
          <Reveal>
            <Label>{c.detailChallengeLabel}</Label>
            <p className="csd-lede">{story.challenge}</p>
            {story.painPoints.length > 0 && (
              <ul className="csd-pains">
                {story.painPoints.map((point) => <li key={point}>{point}</li>)}
              </ul>
            )}
          </Reveal>
          {story.goals.length > 0 && (
            <Reveal delay={150}>
              <div className="csd-goals">
                <p className="sd-included-title">{c.detailGoalsLabel}</p>
                <ol>
                  {story.goals.map((goal, i) => (
                    <li key={goal}><span className="csd-goal-num">{pad(i + 1)}</span>{goal}</li>
                  ))}
                </ol>
              </div>
            </Reveal>
          )}
        </div>
      </Section>

      {story.strategy.length > 0 && (
        <Section className="csd-strategy">
          <div className="sd-head">
            <Label>{c.detailStrategyLabel}</Label>
            <h2 className="display text-4xl font-bold md:text-6xl">{c.detailStrategyTitle}</h2>
          </div>
          <ol className="sd-steps">
            {story.strategy.map((step, i) => (
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
      )}

      {story.execution && (
        <Section className="csd-execution">
          <div className="sd-overview-grid">
            <Reveal>
              <Label>{c.detailExecutionLabel}</Label>
              <p className="csd-lede">{story.execution}</p>
            </Reveal>
            {story.executionPoints.length > 0 && (
              <Reveal delay={150}>
                <div className="sd-included">
                  <ul>
                    {story.executionPoints.map((point) => (
                      <li key={point}><span className="sd-check" aria-hidden="true"><Check size={14} strokeWidth={2.6} /></span>{point}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}
          </div>
        </Section>
      )}

      <Section className="csd-results">
        <div className="csd-results-panel">
          <div className="sd-head">
            <Label className="csd-results-label">{c.detailResultsLabel}</Label>
            <h2 className="display text-4xl font-bold md:text-6xl">{c.detailResultsTitle}</h2>
          </div>
          {story.metrics.length > 0 && (
            <ul className="csd-results-grid">
              {story.metrics.map((metric, i) => (
                <li key={metric.label}>
                  <Reveal delay={i * 90}>
                    <span className="csd-results-value display">{metric.value}</span>
                    <span className="csd-results-name">{metric.label}</span>
                    {metric.note && <span className="csd-results-note">{metric.note}</span>}
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
          {story.resultsSummary && <p className="csd-results-summary">{story.resultsSummary}</p>}
        </div>
      </Section>

      {story.quote && (
        <Section className="csd-quote-section">
          <Reveal>
            <blockquote className="csd-quote">
              <Quote size={36} className="csd-quote-icon" aria-hidden="true" />
              <p>{story.quote.text}</p>
              <footer>{story.quote.author}</footer>
            </blockquote>
          </Reveal>
        </Section>
      )}

      {story.learnings.length > 0 && (
        <Section className="csd-learnings">
          <div className="sd-head">
            <Label>{c.detailLearningsLabel}</Label>
            <h2 className="display text-4xl font-bold md:text-6xl">{c.detailLearningsTitle}</h2>
          </div>
          <ol className="csd-learning-grid">
            {story.learnings.map((learning, i) => (
              <li key={learning.title}>
                <Reveal delay={i * 120} className="sd-step">
                  <span className="sd-step-num">{pad(i + 1)}</span>
                  <h3>{learning.title}</h3>
                  <p>{learning.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {others.length > 0 && (
        <Section className="csd-more">
          <div className="sd-head">
            <Label>{c.detailMoreLabel}</Label>
            <h2 className="display text-4xl font-bold md:text-6xl">{c.detailMoreTitle}</h2>
          </div>
          <div className="csd-more-grid">
            {others.map((other) => (
              <a key={other.id} href={`/case-studies/${other.slug}`} className="csd-more-card">
                <span className="csd-more-media">
                  <img {...responsiveImage(other.src, '(max-width: 767px) 92vw, 400px')} alt="" loading="lazy" decoding="async" />
                  <span className="csd-more-result">{other.result}</span>
                </span>
                <span className="csd-more-body">
                  <span className="csd-more-category">{other.category}</span>
                  <span className="csd-more-title">{other.brand}</span>
                  <span className="csd-more-line">{other.headline}</span>
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
