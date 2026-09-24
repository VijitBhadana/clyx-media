import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/layout/Header';
import { Footer, WhatsAppButton, CookieBar } from '../components/layout/Footer';
import CoverFlowCarousel, { clyxCampaigns, type CampaignItem } from '../components/sections/CoverFlowCarousel';
import ServiceGrid from '../components/sections/ServiceGrid';
import HowSteps from '../components/sections/HowSteps';
import StatsCounterStrip from '../components/sections/StatsCounterStrip';
import { useCollection, useSiteContent } from '@/lib/siteContent';
import '../styles/landing-v1.css';
import '../styles/landing-v1-js-globals.css';
import '../styles/shared-footer.css';

export default function LandingV1() {
  // Hero, stats, team and testimonials are rendered by the legacy /js scripts from window.CLYX_DATA.
  // CMS content is copied into CLYX_DATA before main.js starts, and again whenever it changes.
  const { data: siteContent } = useSiteContent();
  const contentRef = useRef(siteContent);
  contentRef.current = siteContent;
  const appliedRef = useRef<typeof siteContent>(undefined);
  const [scriptsReady, setScriptsReady] = useState(false);

  const campaigns = useCollection<CampaignItem>('campaigns', clyxCampaigns, (item) => ({
    tag: item.category ? `#${String(item.category).toUpperCase()}` : '',
    titleLine1: item.client,
    titleLine2: item.roas,
    desc: item.desc,
    img: item.img,
    ctaText: item.ctaText,
    ctaUrl: item.ctaUrl,
  }));

  useEffect(() => {
    if (!scriptsReady || !siteContent || siteContent === appliedRef.current) return;
    appliedRef.current = siteContent;
    (window as any).clyxApplyRemoteContent?.(siteContent);
    (window as any).clyxRefreshAll?.();
  }, [scriptsReady, siteContent]);

  useEffect(() => {
    const progress = document.querySelector('.loader-progress') as HTMLElement | null;
    requestAnimationFrame(() => {
      if (progress) progress.style.width = '100%';
    });

    // Load data.js first
    const dataScript = document.createElement('script');
    dataScript.src = '/js/data.js';
    dataScript.async = false;
    document.body.appendChild(dataScript);

    // Load main.js after
    const script = document.createElement('script');
    script.src = '/js/main.js';
    script.async = false;
    
    dataScript.onload = () => {
      appliedRef.current = contentRef.current;
      (window as any).clyxApplyRemoteContent?.(contentRef.current);
      document.body.appendChild(script);
    };
    script.onload = () => setScriptsReady(true);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
      if (document.body.contains(dataScript)) document.body.removeChild(dataScript);
    };
  }, []);

  return (
    <>
      <Header />
      <div className="v1-landing-wrapper bg-[color:var(--background)] text-foreground min-h-screen transition-colors">
        <div id="loader" role="status" aria-label="Loading CLYX">
          <div className="loader-mark">CLYX<span>.</span></div>
          <div className="loader-bar" aria-hidden="true"><span className="loader-progress" /></div>
        </div>
        <main>
        {/* Copied from backup_v1 */}
        
    {/*  HERO SECTION  */}
    <section className="hero" id="hero">
      <div className="hero-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="hero-inner">
        <p className="eyebrow">Performance marketing &bull; Creator ads &bull; Web</p>
        <h1 className="hero-title">
          <span className="hero-line">We turn <em>organic clips</em></span><br />
          <span className="hero-line">into <em className="accent">scaled accounts.</em></span>
        </h1>
        <p className="hero-sub">
          CLYX Media runs the creator whitelisting + performance engine behind brands that sell — Meta &amp; Google ads, content, branding, and websites built for one job: conversion.
        </p>
        <div className="hero-cta">
          <a href="/contact" className="btn btn-primary btn-large">Book a Growth Call ↗</a>
          <a href="#engine" className="btn btn-ghost btn-large">Experience 3D Engine ↓</a>
        </div>
      </div>

      {/*  Floating Parallax Clip Stack (The Whitelisting Metaphor)  */}
      <div className="clip-stack" id="clipStack">
        <div className="clip-card" data-depth="0.04">
          <div className="clip-thumb fashion"></div>
          <div className="clip-overlay"></div>
          <div className="clip-tag">Organic Reel</div>
        </div>
        <div className="clip-card" data-depth="0.07">
          <div className="clip-thumb beauty"></div>
          <div className="clip-overlay"></div>
          <div className="clip-tag">Organic Reel</div>
        </div>
        <div className="clip-card whitelisted" data-depth="0.10">
          <div className="clip-thumb food"></div>
          <div className="clip-overlay"></div>
          <div className="clip-tag">Scaled Ad · <span className="counter" data-target="312" data-prefix="+" data-suffix="% ROAS">+312% ROAS</span></div>
        </div>
        <div className="clip-card" data-depth="0.06">
          <div className="clip-thumb tech"></div>
          <div className="clip-overlay"></div>
          <div className="clip-tag">Organic Reel</div>
        </div>
        <div className="clip-card whitelisted" data-depth="0.09">
          <div className="clip-thumb fashion"></div>
          <div className="clip-overlay"></div>
          <div className="clip-tag">Scaled Ad · <span className="counter" data-target="188" data-prefix="+" data-suffix="% CTR">+188% CTR</span></div>
        </div>
      </div>
    </section>

    {/*  Infinite Marquee Strip  */}
    <div className="marquee-strip">
      <div className="marquee-track">
        <span>50+ D2C BRANDS SCALED</span><span className="dot">·</span>
        <span>₹45CR+ AD SPEND MANAGED</span><span className="dot">·</span>
        <span>3.4X AVG ROAS LIFT</span><span className="dot">·</span>
        <span>250+ CREATORS IN NETWORK</span><span className="dot">·</span>
        <span>CREATOR WHITELISTING ENGINE</span><span className="dot">·</span>
        <span>50+ D2C BRANDS SCALED</span><span className="dot">·</span>
        <span>₹45CR+ AD SPEND MANAGED</span><span className="dot">·</span>
        <span>3.4X AVG ROAS LIFT</span><span className="dot">·</span>
        <span>250+ CREATORS IN NETWORK</span><span className="dot">·</span>
      </div>
    </div>

    {/*  3D KINETIC MACBOOK PERSPECTIVE SCROLL (Hacker Villa Inspo)  */}
    <section className="kinetic-section" id="engine">
      <div className="kinetic-sticky-wrap">
        
        <div className="kinetic-header">
          <p className="eyebrow" style={{ marginBottom: "8px" }}>Live Scaling Architecture ↓</p>
          <h2>The engine behind <span className="kinetic-accent">₹45Cr+ in revenue</span>.</h2>
          <p>Real-time creator whitelisting paired with algorithmic Meta &amp; Google scaling.</p>
        </div>

        <div className="macbook-container">
          
          <div className="floating-badge badge-left">
            <span style={{ fontSize: "1.1rem" }}>🟡</span>
            <div>
              <div style={{ fontSize: "0.65rem", color: "#94A3B8" }}>BENCHMARK</div>
              <div><span className="counter" data-target="3.4" data-decimals="1" data-suffix="X">3.4X</span> Avg ROAS Lift</div>
            </div>
          </div>

          <div className="floating-badge badge-right">
            <span style={{ fontSize: "1.1rem" }}>🔵</span>
            <div>
              <div style={{ fontSize: "0.65rem", color: "#94A3B8" }}>NETWORK</div>
              <div><span className="counter" data-target="250" data-suffix="+">250+</span> Vetted Creators</div>
            </div>
          </div>

          <div className="macbook-screen-lid">
            <div className="macbook-camera"></div>
            
            <div className="macbook-display">
              <div className="dash-nav">
                <div className="dash-nav-brand">
                  <span style={{ color: "var(--clyx-yellow)" }}>CLYX</span> GROWTH COMMAND CENTER
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span className="dash-nav-pill">● LIVE ENGINE</span>
                  <span>Meta Advantage+ Connected</span>
                </div>
              </div>

              <div className="dash-body">
                <div className="dash-stats-row">
                  <div className="dash-stat-box">
                    <div className="lbl">Blended ROAS</div>
                    <div className="val counter" data-target="3.72" data-decimals="2" data-suffix="X" style={{ color: "var(--clyx-yellow)" }}>3.72X</div>
                    <div className="change">↑ +0.6x vs target</div>
                  </div>
                  <div className="dash-stat-box">
                    <div className="lbl">30-Day Revenue</div>
                    <div className="val counter" data-target="30" data-prefix="₹" data-suffix=" Lakh">₹30 Lakh</div>
                    <div className="change">↑ +42% MoM</div>
                  </div>
                  <div className="dash-stat-box">
                    <div className="lbl">Whitelisted Hooks</div>
                    <div className="val counter" data-target="48" data-suffix=" Live">48 Live</div>
                    <div className="change">Across 18 Creators</div>
                  </div>
                  <div className="dash-stat-box">
                    <div className="lbl">Avg 3-Sec Retention</div>
                    <div className="val counter" data-target="68.4" data-decimals="1" data-suffix="%">68.4%</div>
                    <div className="change">Industry Avg: 38%</div>
                  </div>
                </div>

                <div className="dash-chart-card">
                  <div className="dash-chart-head">
                    <strong style={{ fontSize: "0.85rem", color: "#FFF" }}>Daily Attributed Revenue vs Ad Spend (Live)</strong>
                    <span style={{ fontSize: "0.75rem", color: "var(--clyx-yellow)" }}>Advantage+ Creative Optimization</span>
                  </div>
                  <div className="chart-bars-wrap">
                    <div className="chart-bar-group"><div className="chart-bar" style={{ height: "42%" }}></div><span className="chart-label">Mon</span></div>
                    <div className="chart-bar-group"><div className="chart-bar" style={{ height: "58%" }}></div><span className="chart-label">Tue</span></div>
                    <div className="chart-bar-group"><div className="chart-bar" style={{ height: "72%" }}></div><span className="chart-label">Wed</span></div>
                    <div className="chart-bar-group"><div className="chart-bar" style={{ height: "66%" }}></div><span className="chart-label">Thu</span></div>
                    <div className="chart-bar-group"><div className="chart-bar" style={{ height: "86%" }}></div><span className="chart-label">Fri</span></div>
                    <div className="chart-bar-group"><div className="chart-bar" style={{ height: "96%" }}></div><span className="chart-label">Sat</span></div>
                    <div className="chart-bar-group"><div className="chart-bar" style={{ height: "90%" }}></div><span className="chart-label">Sun</span></div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="macbook-base">
            <div className="macbook-notch"></div>
          </div>

        </div>

      </div>
    </section>

    {/*  KEY STATS COUNTERS (Numbers count from 0)  */}
    <StatsCounterStrip />

    {/*  SERVICES  */}
    <section className="section services" id="services">
      <div className="section-head">
        <p className="eyebrow">What We Run</p>
        <h2>Six disciplines. One growth engine.</h2>
      </div>
      <ServiceGrid />
    </section>

    {/*  WHITELISTING EXPLAINER  */}
    <section className="section how" id="how">
      <div className="how-grid">
        <div className="how-copy">
          <p className="eyebrow">The CLYX Methodology</p>
          <h2>A one-off post doesn't sell.<br />A whitelisted ad, run on data, does.</h2>
          <p className="how-text">
            Instead of paying for a single influencer post that disappears in 24 hours, we run the creator's own organic content as a paid ad through their handle — it reads as a genuine recommendation, not a sponsored pitch, earning instant trust. From there, performance analytics decide which hooks get scaled.
          </p>
        </div>
        <HowSteps />
      </div>
    </section>

    {/* Campaigns section: the rest of the original homepage remains unchanged. */}
    <CoverFlowCarousel id="portfolio" sectionLabel="FEATURED CAMPAIGNS" items={campaigns} />

    {/*  ABOUT / LEADERSHIP SECTION  */}
    <section className="section team" id="about">
      <div className="section-head">
        <p className="eyebrow">Leadership</p>
        <h2>Small team. Direct founder access.</h2>
        <p style={{ marginTop: "10px", maxWidth: "600px", color: "var(--text-secondary)" }}>
          You collaborate directly with senior partners who have scaled eight-figure ad spend across high-growth categories.
        </p>
      </div>
      <div className="team-grid" id="teamGrid"></div>
    </section>

    {/*  TESTIMONIALS MARQUEE (15S INFINITE LOOP)  */}
    <section className="section testimonials" id="testimonials">
      <div className="section-head" style={{ textAlign: "center" }}>
        <p className="eyebrow">Client Results</p>
        <h2>What D2C founders say about CLYX.</h2>
      </div>
      <div className="testimonial-marquee">
        <div className="testimonial-track" id="testimonialTrack"></div>
      </div>
    </section>

    {/*  NEWSLETTER STRIP  */}
    <section className="newsletter" id="newsletter">
      <div className="newsletter-inner">
        <p className="eyebrow">Stay ahead</p>
        <h3>One email a month. No fluff.</h3>
        <p>Actionable breakdowns of whitelisted creator campaigns, Meta ad teardowns, and creative frameworks that scale.</p>
        <form id="newsletterForm" className="newsletter-form">
          <input type="email" placeholder="you@brand.com" required />
          <button type="submit" className="btn btn-primary">Subscribe</button>
        </form>
      </div>
    </section>

    {/*  CONVERSION CTA BAND  */}
    <section className="cta-band" id="contact">
      <h2>Ready to turn your creators into scalable ad accounts?</h2>
      <p className="cta-subtext">
        Let's audit your current Meta/Google ad accounts and creator pipeline. We will map out a 90-day scaling roadmap for your brand.
      </p>
      <div className="cta-actions">
        <a href="https://wa.me/919671430111" target="_blank" className="btn btn-primary btn-large">Book a Growth Call ↗</a>
        <a href="mailto:hello@clyxmedia.com?subject=Growth Consultation - CLYX Media" className="btn cta-btn-founders btn-large">Email Founders</a>
      </div>
    </section>
  
      </main>
      
      

  {/*  Case Study Popup Modal  */}
  <div className="modal-backdrop" id="modalBackdrop">
    <div className="clyx-modal">
      <button className="modal-close-btn" id="modalClose">✕</button>
      <div id="modalMedia"></div>
      <p className="eyebrow" id="modalClient"></p>
      <h3 id="modalCampaign" style={{ fontSize: "2rem", marginBottom: "16px" }}></h3>
      <div id="modalResults"></div>
      <div id="modalMetrics"></div>
    </div>
  </div>

  {/* Shared footer, social icons, WhatsApp button, and consent UI. */}
  <Footer />
  <WhatsAppButton />
    </div>
    <CookieBar />
    </>
  );
}
