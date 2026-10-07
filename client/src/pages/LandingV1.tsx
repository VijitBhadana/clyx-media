import { usePageTitle } from '@/hooks/usePageMeta';
import React, { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Header from '../components/layout/Header';
import { Footer, WhatsAppButton, CookieBar } from '../components/layout/Footer';
import CoverFlowCarousel, { clyxCampaigns, type CampaignItem } from '../components/sections/CoverFlowCarousel';
import ServiceBook from '../components/sections/ServiceBook';
import HowSteps from '../components/sections/HowSteps';
import ChannelStrip from '../components/sections/ChannelStrip';
import HeroTypewriter from '../components/sections/HeroTypewriter';
import TeamMarquee from '../components/sections/TeamMarquee';
import TestimonialMarquee from '../components/sections/TestimonialMarquee';
import { useBlock, useCollection } from '@/lib/siteContent';
import { safeHref, sectionDefaults, splitLines, usePageContent } from '@/lib/pageContent';
import { Lines } from '@/components/ui/Lines';
import { markIntroLoaderPlayed, shouldPlayIntroLoader } from '@/lib/introLoader';
import { useLandingMotion } from '@/hooks/useLandingMotion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { API_URL } from '@/lib/api';
import '../styles/landing-v1.css';
import { FormattedText } from '@/components/ui/FormattedText';

type NewsletterStatus = { kind: 'idle' | 'sending' | 'done' } | { kind: 'error'; message: string };

const COUNT_MS = 1800;
const NUMBER = /^(\D*?)(\d+(?:\.\d+)?)(.*)$/;

// "₹30 Lakh" counts up from zero (prefix "₹", target 30, suffix " Lakh") the first time it scrolls into view.
// The span is keyed by the value, so edited copy mounts a fresh span and counts again.
function Counter({ value, className, style }: { value: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isNumber = NUMBER.test(value);

  useEffect(() => {
    const el = ref.current;
    const parts = NUMBER.exec(value);
    if (!el || !parts || typeof IntersectionObserver === 'undefined') return;
    const [, prefix, number, suffix] = parts;
    const target = parseFloat(number);
    const decimals = (number.split('.')[1] || '').length;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = (now: number) => {
        if (!start) start = now;
        const p = Math.min((now - start) / COUNT_MS, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${prefix}${(p < 1 ? target * eased : target).toFixed(decimals)}${suffix}`;
        if (p < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }, { threshold: 0.25 });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  if (!isNumber) return <span className={className} style={style}>{value}</span>;
  return (
    <span key={value} ref={ref} className={className ? `${className} counter` : 'counter'} style={style}>
      {value}
    </span>
  );
}

// Starting height (%) of each day's bar in the laptop chart; the mobile ring uses the same values.
const CHART_HEIGHTS = [42, 58, 72, 66, 86, 96, 90];
// Same scale as the chart's H / L price tags: a 100% bar is ₹1.5L.
const dayRevenue = (pct: number) => `₹${((pct * 1.5) / 100).toFixed(2)}L`;
const RING_R = 78;
const RING_C = 2 * Math.PI * RING_R;
const RING_GAP = 4;
// Low days lean blue, high days lean yellow, like the bars' blue-to-yellow gradient.
const RING_LOW = [37, 99, 235];
const RING_HIGH = [255, 222, 89];
const ringColor = (t: number) => `rgb(${RING_LOW.map((lo, i) => Math.round(lo + (RING_HIGH[i] - lo) * t)).join(',')})`;

type DashStat = { label: string; value: string; note: string };

// Mobile stand-in for the laptop dashboard: a ring of the week's revenue by day, 30-day revenue in the middle
// and the other stats below. Segments sweep in the first time the card scrolls into view.
function EngineRing({ c, days, stats }: { c: Record<string, string>; days: string[]; stats: DashStat[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useScrollReveal(ref);
  const total = CHART_HEIGHTS.reduce((sum, h) => sum + h, 0);
  const min = Math.min(...CHART_HEIGHTS);
  const max = Math.max(...CHART_HEIGHTS);
  const hi = CHART_HEIGHTS.indexOf(max);
  const lo = CHART_HEIGHTS.indexOf(min);
  let start = 0;
  const segments = CHART_HEIGHTS.map((h, i) => {
    const length = (h / total) * RING_C;
    const segment = { i, offset: -start, length: Math.max(0, length - RING_GAP), color: ringColor((h - min) / (max - min || 1)) };
    start += length;
    return segment;
  });
  const [center, ...rest] = [stats[1], stats[0], stats[2], stats[3]];

  return (
    <div ref={ref} className={`engine-ring${visible ? ' is-visible' : ''}`}>
      <div className="engine-ring-head">
        <div className="dash-nav-brand">
          <span style={{ color: "var(--clyx-yellow)" }}>CLYX</span> {c.dashTitle}
        </div>
        {c.dashLive && <span className="dash-nav-pill">● {c.dashLive}</span>}
      </div>
      <p className="engine-ring-title">{c.dashChartTitle}</p>

      <div className="engine-ring-chart">
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <circle className="engine-ring-track" cx="100" cy="100" r={RING_R} />
          {segments.map((s) => (
            <circle
              key={s.i}
              className="engine-ring-seg"
              cx="100"
              cy="100"
              r={RING_R}
              stroke={s.color}
              strokeDasharray={`${visible ? s.length : 0} ${RING_C}`}
              strokeDashoffset={s.offset}
              style={{ transitionDelay: `${s.i * 90}ms` }}
            />
          ))}
        </svg>
        <div className="engine-ring-center">
          <span className="lbl">{center?.label}</span>
          <Counter value={center?.value ?? ''} className="val" />
          <span className="change">{center?.note}</span>
        </div>
      </div>

      <ul className="engine-ring-legend">
        {segments.map((s) => (
          <li key={s.i}>
            <span className="dot" style={{ background: s.color }} />
            <span className="day">{days[s.i] ?? ''}</span>
            <span className="amt">{dayRevenue(CHART_HEIGHTS[s.i])}</span>
            {s.i === hi && <span className="tag tag-hi">H</span>}
            {s.i === lo && <span className="tag tag-lo">L</span>}
          </li>
        ))}
      </ul>

      <div className="engine-ring-stats">
        {rest.filter(Boolean).map((stat, i) => (
          <div key={i} className="dash-stat-box">
            <div className="lbl">{stat.label}</div>
            <Counter value={stat.value} className="val" style={i === 0 ? { color: "var(--clyx-yellow)" } : undefined} />
            <div className="change">{stat.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Parallax depth of each hero clip card (read by useLandingMotion).
const CLIP_DEPTHS = ['0.04', '0.07', '0.10', '0.06', '0.09'];
// How long the intro loader stays before sliding away.
const LOADER_MS = 1450;
const HERO_DEFAULTS = sectionDefaults('home', 'hero');

export default function LandingV1() {
  usePageTitle('CLYX Media — Performance Creative & Creator Ads');
  const rootRef = useRef<HTMLDivElement>(null);
  const [showLoader] = useState(shouldPlayIntroLoader);
  const [loaderDone, setLoaderDone] = useState(false);
  const [newsletter, setNewsletter] = useState<NewsletterStatus>({ kind: 'idle' });
  const c = usePageContent('home');
  const hero = useBlock('hero', HERO_DEFAULTS);
  // "We turn organic clips into scaled accounts." -> first line, then "into" + the highlighted (typed) phrase.
  const [heroLine1, ...heroRest] = String(hero.headline || '').split(/\s+into\s+/i);
  const heroLine2 = heroRest.join(' into ');
  const heroPhrases = useMemo(() => splitLines(c.heroRotating), [c.heroRotating]);
  const marquee = splitLines(c.marqueeItems);
  const clips = CLIP_DEPTHS.map((depth, i) => ({
    depth,
    image: c[`clip${i + 1}Image`],
    label: c[`clip${i + 1}Label`],
    metric: c[`clip${i + 1}Metric`],
  }));
  const dashStats = [1, 2, 3, 4].map((n) => ({ label: c[`dashStat${n}Label`], value: c[`dashStat${n}Value`], note: c[`dashStat${n}Note`] }));
  const chartDays = splitLines(c.dashChartDays);

  const campaigns = useCollection<CampaignItem>('campaigns', clyxCampaigns, (item) => ({
    tag: item.category ? `#${String(item.category).toUpperCase()}` : '',
    titleLine1: item.client,
    titleLine2: item.roas,
    desc: item.desc,
    img: item.img,
    ctaText: item.ctaText,
    ctaUrl: item.ctaUrl,
  }));

  useLandingMotion(rootRef);

  useEffect(() => {
    markIntroLoaderPlayed();
    if (!showLoader) return;
    const progress = document.querySelector('.loader-progress') as HTMLElement | null;
    const frame = requestAnimationFrame(() => {
      if (progress) progress.style.width = '100%';
    });
    const timer = setTimeout(() => setLoaderDone(true), LOADER_MS);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [showLoader]);

  const onNewsletterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setNewsletter({ kind: 'sending' });
    try {
      const res = await fetch(`${API_URL}/api/public/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || c.newsletterError);
      form.reset();
      setNewsletter({ kind: 'done' });
    } catch (err) {
      setNewsletter({ kind: 'error', message: err instanceof Error && err.message !== 'Failed to fetch' ? err.message : c.newsletterNetworkError });
    }
  };

  return (
    <>
      <Header />
      <div ref={rootRef} className="v1-landing-wrapper bg-[color:var(--background)] text-foreground min-h-screen transition-colors">
        {showLoader && (
          <div id="loader" className={loaderDone ? 'loaded' : undefined} role="status" aria-label="Loading CLYX">
            <div className="loader-mark">{(c.loaderWordmark || 'CLYX').replace(/\.$/, '')}</div>
            <div className="loader-bar" aria-hidden="true"><span className="loader-progress" /></div>
          </div>
        )}
        <main>
        {/* Copied from backup_v1 */}
        
    {/*  HERO SECTION  */}
    <section className="hero" id="hero">
      <div className="hero-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="hero-inner">
        <p className="eyebrow">{hero.eyebrow || HERO_DEFAULTS.eyebrow}</p>
        <h1 className="hero-title">
          <span className="hero-line">{heroLine1 || 'We turn organic clips'}</span>
          {heroLine2 && <><br /><span className="hero-line">into <HeroTypewriter base={heroLine2} phrases={heroPhrases} /></span></>}
        </h1>
        <p className="hero-sub"><FormattedText text={hero.sub || HERO_DEFAULTS.sub} /></p>
        <div className="hero-cta">
          <a href={safeHref(c.heroPrimaryUrl || '/contact')} className="btn btn-primary btn-large">{c.heroPrimaryText}</a>
          {c.heroSecondaryText && <a href={safeHref(c.heroSecondaryUrl || '#engine')} className="btn btn-ghost btn-large">{c.heroSecondaryText}</a>}
        </div>
      </div>

      {/*  Floating Parallax Clip Stack (The Whitelisting Metaphor)  */}
      <div className="clip-stack" id="clipStack">
        {clips.map((clip, i) => (
          <div key={i} className={`clip-card${clip.metric ? ' whitelisted' : ''}`} data-depth={clip.depth}>
            <div className="clip-thumb" style={clip.image ? { backgroundImage: `url(${JSON.stringify(clip.image)})` } : undefined}></div>
            <div className="clip-overlay"></div>
            <div className="clip-tag">{clip.label}{clip.metric && <>{clip.label && ' · '}<Counter value={clip.metric} /></>}</div>
          </div>
        ))}
      </div>
    </section>

    {/*  Infinite Marquee Strip  */}
    <div className="marquee-strip">
      <div className="marquee-track">
        {/* Listed twice so the scroll loops without a gap. */}
        {[...marquee, ...marquee].map((item, i) => (
          <React.Fragment key={i}>
            <span>{item}</span><span className="dot">·</span>
          </React.Fragment>
        ))}
      </div>
    </div>

    {/*  3D KINETIC MACBOOK PERSPECTIVE SCROLL (Hacker Villa Inspo)  */}
    <section className="kinetic-section" id="engine">
      {/* The heading scrolls away normally; only the laptop is pinned, so it can use the full viewport height. */}
      <div className="kinetic-header">
        <p className="eyebrow" style={{ marginBottom: "8px" }}>{c.engineEyebrow}</p>
        <h2>{c.engineTitle} <span className="kinetic-accent">{c.engineHighlight}</span></h2>
        <p><FormattedText text={c.engineText} /></p>
      </div>

      <div className="kinetic-sticky-wrap">

        <div className="macbook-container">
          
          <div className="floating-badge badge-left">
            <span style={{ fontSize: "1.1rem" }}>🟡</span>
            <div>
              <div style={{ fontSize: "0.65rem", color: "#94A3B8" }}>{c.badge1Label}</div>
              <div><Counter value={c.badge1Value} /> {c.badge1Text}</div>
            </div>
          </div>

          <div className="floating-badge badge-right">
            <span style={{ fontSize: "1.1rem" }}>🔵</span>
            <div>
              <div style={{ fontSize: "0.65rem", color: "#94A3B8" }}>{c.badge2Label}</div>
              <div><Counter value={c.badge2Value} /> {c.badge2Text}</div>
            </div>
          </div>

          <div className="macbook-screen-lid">
            <div className="macbook-camera"></div>
            
            <div className="macbook-display">
              <div className="dash-nav">
                <div className="dash-nav-brand">
                  <span style={{ color: "var(--clyx-yellow)" }}>CLYX</span> {c.dashTitle}
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  {c.dashLive && <span className="dash-nav-pill">● {c.dashLive}</span>}
                  <span>{c.dashConnected}</span>
                </div>
              </div>

              <div className="dash-body">
                <div className="dash-stats-row">
                  {dashStats.map((stat, i) => (
                    <div key={i} className="dash-stat-box">
                      <div className="lbl">{stat.label}</div>
                      <Counter value={stat.value} className="val" style={i === 0 ? { color: "var(--clyx-yellow)" } : undefined} />
                      <div className="change">{stat.note}</div>
                    </div>
                  ))}
                </div>

                <div className="dash-chart-card">
                  <div className="dash-chart-head">
                    <strong style={{ fontSize: "0.85rem", color: "#FFF" }}>{c.dashChartTitle}</strong>
                    <span style={{ fontSize: "0.75rem", color: "var(--clyx-yellow)" }}>{c.dashChartNote}</span>
                  </div>
                  <div className="chart-bars-wrap">
                    {CHART_HEIGHTS.map((h, i) => (
                      <div key={i} className="chart-bar-group"><div className="chart-bar" style={{ height: `${h}%` }}></div><span className="chart-label">{chartDays[i] ?? ''}</span></div>
                    ))}
                    {/* Trading-style trace over the bar tops, drawn by useLandingMotion. */}
                    <svg className="chart-trace" aria-hidden="true">
                      <line className="trace-level trace-level-hi" />
                      <line className="trace-level trace-level-lo" />
                      <polyline className="trace-halo" />
                      <polyline className="trace-line" />
                      <g className="trace-dots" />
                      <g className="trace-tag trace-tag-hi"><rect rx="4" /><text /></g>
                      <g className="trace-tag trace-tag-lo"><rect rx="4" /><text /></g>
                    </svg>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="macbook-base">
            <div className="macbook-notch"></div>
          </div>

        </div>

        {/* Mobile only (CSS): the laptop is hidden and this ring takes its place. */}
        <EngineRing c={c} days={chartDays} stats={dashStats} />

      </div>
    </section>

    {/*  CHANNELS WE SCALE ON  */}
    <ChannelStrip content={c} />

    {/*  SERVICES  */}
    <section className="section services" id="services">
      <div className="section-head">
        <p className="eyebrow">{c.servicesEyebrow}</p>
        <h2>{c.servicesTitle}</h2>
      </div>
      <ServiceBook content={c} />
    </section>

    {/*  WHITELISTING EXPLAINER  */}
    <section className="section how" id="how">
      <div className="how-grid">
        <div className="how-copy">
          <p className="eyebrow">{c.howEyebrow}</p>
          <h2><Lines text={c.howTitle} /></h2>
          <p className="how-text"><FormattedText text={c.howText} /></p>
        </div>
        <HowSteps content={c} />
      </div>
    </section>

    {/* Campaigns section: the rest of the original homepage remains unchanged. */}
    <CoverFlowCarousel id="portfolio" sectionLabel={c.campaignsLabel} items={campaigns} />

    {/*  ABOUT / LEADERSHIP SECTION  */}
    <section className="section team" id="about">
      <div className="section-head">
        <p className="eyebrow">{c.teamEyebrow}</p>
        <h2>{c.teamTitle}</h2>
        <p style={{ marginTop: "10px", maxWidth: "600px", color: "var(--text-secondary)" }}><FormattedText text={c.teamText} /></p>
      </div>
      <TeamMarquee />
    </section>

    {/*  TESTIMONIALS MARQUEE (15S INFINITE LOOP)  */}
    <section className="section testimonials" id="testimonials">
      <div className="section-head" style={{ textAlign: "center" }}>
        <p className="eyebrow">{c.testimonialsEyebrow}</p>
        <h2>{c.testimonialsTitle}</h2>
      </div>
      <TestimonialMarquee />
    </section>

    {/*  NEWSLETTER STRIP  */}
    <section className="newsletter" id="newsletter">
      <div className="newsletter-inner">
        <p className="eyebrow">{c.newsletterEyebrow}</p>
        <h3>{c.newsletterTitle}</h3>
        <p><FormattedText text={c.newsletterText} /></p>
        {newsletter.kind === 'done' ? (
          <p role="status" className="newsletter-status newsletter-status--ok">{c.newsletterSuccess}</p>
        ) : (
          <form id="newsletterForm" className="newsletter-form" onSubmit={onNewsletterSubmit}>
            <input name="email" type="email" placeholder={c.newsletterPlaceholder} required maxLength={200} autoComplete="email" aria-label={c.newsletterPlaceholder} />
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="newsletter-honeypot" />
            <button type="submit" className="btn btn-primary" disabled={newsletter.kind === 'sending'}>
              {newsletter.kind === 'sending' ? c.newsletterSending : c.newsletterButton}
            </button>
          </form>
        )}
        {newsletter.kind === 'error' && <p role="alert" className="newsletter-status newsletter-status--error">{newsletter.message}</p>}
      </div>
    </section>

    {/*  CONVERSION CTA BAND  */}
    <section className="cta-band" id="contact">
      <div className="cta-copy">
        <p className="cta-eyebrow">
          <span className="cta-dot" aria-hidden="true" />
          {c.ctaEyebrow}
        </p>
        <h2>{c.ctaTitle} <span>{c.ctaHighlight}</span></h2>
        <p className="cta-subtext"><FormattedText text={c.ctaText} /></p>
      </div>
      <div className="cta-actions">
        <a href={safeHref(c.ctaPrimaryUrl)} target="_blank" rel="noreferrer" className="btn btn-primary cta-btn">{c.ctaPrimaryText} <span aria-hidden="true">↗</span></a>
        <a href={safeHref(c.ctaSecondaryUrl)} className="btn cta-btn cta-btn-founders">{c.ctaSecondaryText}</a>
      </div>
    </section>
  
      </main>
      
      

  {/* Shared footer, social icons, WhatsApp button, and consent UI. */}
  <Footer />
  <WhatsAppButton />
    </div>
    <CookieBar />
    </>
  );
}
