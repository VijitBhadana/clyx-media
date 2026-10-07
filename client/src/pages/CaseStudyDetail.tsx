import { useEffect, type CSSProperties } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Quote, TriangleAlert } from 'lucide-react';
import { useParams } from 'wouter';
import PageShell from '@/components/layout/PageShell';
import { Label, Section } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/ScrollMotion';
import ServicesCTA from '@/components/sections/ServicesCTA';
import type { CaseFactKey } from '@/data/caseStudies';
import { useCaseStudies } from '@/lib/caseStudies';
import { safeHref, usePageContent } from '@/lib/pageContent';
import { useSiteContent } from '@/lib/siteContent';
import NotFound from './NotFound';
import '@/styles/service-detail.css';
import '@/styles/case-study-detail.css';
import { responsiveImage } from '@/lib/images';
import { FormattedText } from '@/components/ui/FormattedText';

const pad = (n: number) => String(n).padStart(2, '0');

// Quick facts in the hero card, in order, with the page-copy key of each label.
const FACTS: [CaseFactKey, string][] = [
  ['industry', 'factIndustryLabel'],
  ['market', 'factMarketLabel'],
  ['duration', 'factDurationLabel'],
  ['adSpend', 'factSpendLabel'],
  ['channels', 'factChannelsLabel'],
];

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

  // A case study added in the CMS is only known once the list has loaded; until then the page stays blank.
  if (!item) return data?.collections?.caseStudies || !isFetching ? <NotFound /> : <div className="min-h-screen" />;

  const { story } = item;
  const requestHref = safeHref(c.caseButtonUrl || '/contact');
  const facts = FACTS.map(([key, label]) => ({ label: c[label], value: story.facts[key] })).filter((fact) => fact.value);
  // The case studies that follow this one, wrapping round, so each page suggests a different next read.
  const others = [...items.slice(at + 1), ...items.slice(0, at)].slice(0, 3);

  return (
    <PageShell
      heroClass="csd-hero"
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
          {facts.length > 0 && (
            <dl className="csd-facts">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {c.caseButton && (
            <div className="ih-actions">
              <a href={requestHref} className="ih-btn ih-btn-primary">{c.caseButton} <ArrowUpRight size={16} /></a>
            </div>
          )}
        </div>
      }
    >
      {/* Cover, the headline numbers and the short summary. */}
      <Section className="csd-intro">
        <a href="/case-studies" className="sd-back"><ArrowLeft size={16} aria-hidden="true" /> {c.detailBackLabel}</a>

        {/* Cover image on the left, key points on the right (they slide in one by one). */}
        <div className={story.highlights.length > 0 ? 'csd-cover-row has-points' : 'csd-cover-row'}>
          <Reveal>
            <figure className="csd-cover">
              <img
                {...responsiveImage(item.src, story.highlights.length > 0 ? '(max-width: 1023px) 100vw, 620px' : '(max-width: 1023px) 100vw, 1100px')}
                alt={item.alt}
                decoding="async"
              />
              <span className="csd-cover-accent" style={{ background: item.accent }} aria-hidden="true" />
              <figcaption>
                <span className="csd-cover-result">{item.result}</span>
                <span className="csd-cover-brand">{item.brand}</span>
              </figcaption>
            </figure>
          </Reveal>
          {story.highlights.length > 0 && (
            <Reveal className="csd-glance">
              <p className="csd-glance-label">{c.detailHighlightsLabel}</p>
              <ol>
                {story.highlights.map((point, i) => (
                  <li key={point} style={{ '--i': i } as CSSProperties}>
                    <span className="csd-glance-num" aria-hidden="true">{pad(i + 1)}</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          )}
        </div>

        {story.metrics.length > 0 && (
          <ul className="csd-metrics">
            {story.metrics.slice(0, 4).map((metric, i) => (
              <li key={metric.value + metric.label}>
                <Reveal delay={i * 90} className="csd-metric">
                  <span className="csd-metric-value display">{metric.value}</span>
                  <span className="csd-metric-label">{metric.label}</span>
                  {metric.note && <span className="csd-metric-note">{metric.note}</span>}
                </Reveal>
              </li>
            ))}
          </ul>
        )}

        {(story.overview || story.services.length > 0) && (
          <div className="sd-overview-grid csd-overview">
            {story.overview && (
              <Reveal>
                <Label>{c.detailOverviewLabel}</Label>
                <p className="sd-overview-text"><FormattedText text={story.overview} /></p>
              </Reveal>
            )}
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
        )}
      </Section>

      {/* The brief: what the client asked for, and the goals we agreed on. */}
      {(story.requirement || story.goals.length > 0) && (
        <Section className="csd-brief">
          <div className="csd-split">
            <Reveal>
              <Label>{c.detailBriefLabel}</Label>
              <h2 className="display csd-h2">{c.detailBriefTitle}</h2>
              {story.requirement && <p className="csd-lede"><FormattedText text={story.requirement} /></p>}
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
      )}

      {/* Issues we ran into. */}
      {story.challenges.length > 0 && (
        <Section className="csd-issues">
          <div className="sd-head">
            <Label>{c.detailChallengeLabel}</Label>
            <h2 className="display csd-h2">{c.detailChallengeTitle}</h2>
          </div>
          <ol className="csd-issue-grid">
            {story.challenges.map((issue, i) => (
              <li key={issue.title + issue.text}>
                <Reveal delay={(i % 2) * 120} className="csd-issue">
                  <span className="csd-issue-head">
                    <span className="csd-issue-icon" aria-hidden="true"><TriangleAlert size={18} /></span>
                    <span className="csd-issue-num">{pad(i + 1)}</span>
                  </span>
                  {issue.title && <h3>{issue.title}</h3>}
                  <p>{issue.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* How we handled it. */}
      {story.approach.length > 0 && (
        <Section className="csd-strategy">
          <div className="sd-head">
            <Label>{c.detailStrategyLabel}</Label>
            <h2 className="display csd-h2">{c.detailStrategyTitle}</h2>
          </div>
          <ol className="sd-steps">
            {story.approach.map((step, i) => (
              <li key={step.title + step.text}>
                <Reveal delay={i * 120} className="sd-step">
                  <span className="sd-step-num">{pad(i + 1)}</span>
                  {step.title && <h3>{step.title}</h3>}
                  <p>{step.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* The work: how it ran, what we delivered, and photos of it. */}
      {(story.execution || story.deliverables.length > 0 || story.work.length > 0) && (
        <Section className="csd-work">
          <div className="sd-head">
            <Label>{c.detailWorkLabel}</Label>
            <h2 className="display csd-h2">{c.detailWorkTitle}</h2>
          </div>
          {(story.execution || story.deliverables.length > 0) && (
            <div className="sd-overview-grid">
              {story.execution && (
                <Reveal>
                  <p className="csd-lede"><FormattedText text={story.execution} /></p>
                </Reveal>
              )}
              {story.deliverables.length > 0 && (
                <Reveal delay={150}>
                  <div className="sd-included">
                    <p className="sd-included-title">{c.detailDeliverablesLabel}</p>
                    <ul>
                      {story.deliverables.map((point) => (
                        <li key={point}><span className="sd-check" aria-hidden="true"><Check size={14} strokeWidth={2.6} /></span>{point}</li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              )}
            </div>
          )}
          {story.work.length > 0 && (
            <div className="csd-gallery" data-count={Math.min(story.work.length, 4)}>
              {story.work.map((shot, i) => (
                <Reveal key={shot.src + i} delay={(i % 3) * 100} className="csd-shot">
                  <figure>
                    <img
                      {...responsiveImage(shot.src, i === 0 ? '(max-width: 767px) 92vw, 680px' : '(max-width: 767px) 92vw, 440px')}
                      alt={shot.caption || `${item.brand} work sample ${i + 1}`}
                      loading="lazy"
                      decoding="async"
                    />
                    {shot.caption && <figcaption>{shot.caption}</figcaption>}
                  </figure>
                </Reveal>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Results: numbers, before vs after, summary. */}
      {(story.metrics.length > 0 || story.comparison.length > 0 || story.resultsSummary) && (
        <Section className="csd-results">
          <div className="csd-results-panel">
            <div className="sd-head">
              <Label className="csd-results-label">{c.detailResultsLabel}</Label>
              <h2 className="display csd-h2">{c.detailResultsTitle}</h2>
            </div>
            {story.metrics.length > 0 && (
              <ul className="csd-results-grid">
                {story.metrics.map((metric, i) => (
                  <li key={metric.value + metric.label}>
                    <Reveal delay={i * 90}>
                      <span className="csd-results-value display">{metric.value}</span>
                      <span className="csd-results-name">{metric.label}</span>
                      {metric.note && <span className="csd-results-note">{metric.note}</span>}
                    </Reveal>
                  </li>
                ))}
              </ul>
            )}
            {story.comparison.length > 0 && (
              <div className="csd-compare">
                <p className="csd-compare-title">{c.detailCompareTitle}</p>
                <table>
                  <thead>
                    <tr>
                      <th scope="col"><span className="sr-only">Metric</span></th>
                      <th scope="col">{c.detailCompareBefore}</th>
                      <th scope="col" className="is-after">{c.detailCompareAfter}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {story.comparison.map((row) => (
                      <tr key={row.label}>
                        <th scope="row">{row.label}</th>
                        <td>{row.before}</td>
                        <td className="is-after">{row.after}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {story.resultsSummary && <p className="csd-results-summary"><FormattedText text={story.resultsSummary} /></p>}
          </div>
        </Section>
      )}

      {/* What the client said. */}
      {story.quote && (
        <Section className="csd-quote-section">
          <Reveal>
            <figure className="csd-quote">
              <Label className="csd-quote-label">{c.detailQuoteLabel}</Label>
              <Quote size={36} className="csd-quote-icon" aria-hidden="true" />
              <blockquote><p><FormattedText text={story.quote.text} /></p></blockquote>
              {(story.quote.name || story.quote.role) && (
                <figcaption>
                  {story.quote.name && <strong>{story.quote.name}</strong>}
                  {story.quote.role && <span>{story.quote.role}</span>}
                </figcaption>
              )}
            </figure>
          </Reveal>
        </Section>
      )}

      {story.learnings.length > 0 && (
        <Section className="csd-learnings">
          <div className="sd-head">
            <Label>{c.detailLearningsLabel}</Label>
            <h2 className="display csd-h2">{c.detailLearningsTitle}</h2>
          </div>
          <ol className="csd-learning-grid">
            {story.learnings.map((learning, i) => (
              <li key={learning.title + learning.text}>
                <Reveal delay={i * 120} className="sd-step">
                  <span className="sd-step-num">{pad(i + 1)}</span>
                  {learning.title && <h3>{learning.title}</h3>}
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
            <h2 className="display csd-h2">{c.detailMoreTitle}</h2>
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
