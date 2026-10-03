import { useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react';
import { useParams } from 'wouter';
import PageShell from '@/components/layout/PageShell';
import { Label, Section } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/ScrollMotion';
import ServicesCTA from '@/components/sections/ServicesCTA';
import { useCaseStudies } from '@/lib/caseStudies';
import { safeHref, usePageContent } from '@/lib/pageContent';
import { projectStory, resultPoints, usePortfolio } from '@/lib/portfolio';
import { useSiteContent } from '@/lib/siteContent';
import NotFound from './NotFound';
import '@/styles/service-detail.css';
import '@/styles/case-study-detail.css';
import '@/styles/portfolio-detail.css';
import { responsiveImage } from '@/lib/images';
import { FormattedText } from '@/components/ui/FormattedText';

const pad = (n: number) => String(n).padStart(2, '0');

/** One project's own page (/portfolio/<slug>), opened from a card on the Portfolio page. */
export default function PortfolioDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const c = usePageContent('portfolio');
  const services = usePageContent('services');
  const items = usePortfolio();
  const caseStudies = useCaseStudies();
  const { data, isFetching } = useSiteContent();
  const at = items.findIndex((item) => item.slug === slug);
  const item = items[at];

  useEffect(() => {
    if (!item) return;
    const previous = document.title;
    document.title = `${item.title} | Portfolio | CLYX Media`;
    return () => { document.title = previous; };
  }, [item?.title]);

  // A project added in the CMS is only known once the list has loaded; until then the page stays blank.
  if (!item) return data?.collections?.portfolio || !isFetching ? <NotFound /> : <div className="min-h-screen" />;

  const story = projectStory(item);
  const points = resultPoints(item.result);
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
          {points.map((point) => <li key={point} className="csd-hero-result">{point}</li>)}
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
            {points.length > 0 && (
              <div>
                <dt>{c.detailOutcomeLabel}</dt>
                <dd>
                  {points.length > 1 ? (
                    <ul className="pfd-fact-points">{points.map((point) => <li key={point}>{point}</li>)}</ul>
                  ) : points[0]}
                </dd>
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
      <Section className="csd-intro pfd-intro">
        <a href="/portfolio" className="sd-back"><ArrowLeft size={16} aria-hidden="true" /> {c.detailBackLabel}</a>

        {/* Story on the left, the project's image (kept compact) on the right, outcome and services cards below. */}
        <div className="pfd-intro-grid">
          <div className="pfd-intro-details">
            <Reveal>
              <Label>{c.detailOverviewLabel}</Label>
              <p className="pfd-story"><FormattedText text={story.overview} /></p>
            </Reveal>
          </div>

          <Reveal delay={80} className="pfd-intro-media">
            <figure className="csd-cover pfd-cover">
              <img {...responsiveImage(item.src, '(max-width: 1023px) 92vw, 460px')} alt={item.alt} decoding="async" />
              <figcaption>
                <span className="csd-cover-brand">{item.title}</span>
              </figcaption>
            </figure>
          </Reveal>

          {/* Outcome and services side by side, each in its own card, across the full width of the intro. */}
          <div className="pfd-intro-cards">
            {points.length > 0 && (
              <Reveal delay={100}>
                <div className="pfd-mini-card pfd-points">
                  <p className="sd-included-title">{c.detailOutcomeLabel}</p>
                  <ul>
                    {points.map((point) => (
                      <li key={point}><span className="sd-check" aria-hidden="true"><Check size={14} strokeWidth={2.6} /></span>{point}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}
            <Reveal delay={150}>
              <div className="pfd-mini-card sd-included">
                <p className="sd-included-title">{c.detailServicesLabel}</p>
                <ul>
                  {story.services.map((service) => (
                    <li key={service}><span className="sd-check" aria-hidden="true"><Check size={14} strokeWidth={2.6} /></span>{service}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
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
            {points.length === 1 && <p className="csd-results-value display pfd-result-value">{points[0]}</p>}
            {points.length > 1 && (
              <ul className="pfd-result-points">
                {points.map((point) => <li key={point} className="display">{point}</li>)}
              </ul>
            )}
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
                  <img {...responsiveImage(other.src, '(max-width: 767px) 92vw, 400px')} alt="" loading="lazy" decoding="async" />
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
