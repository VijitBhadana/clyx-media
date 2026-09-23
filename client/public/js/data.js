/**
 * CLYX MEDIA - DATA STORE
 * Centralized case studies, leadership roster, and verified client testimonials
 */
const CLYX_DATA = {
  hero: {
    eyebrow: "Performance marketing • Creator ads • Web",
    line1: "We turn organic clips",
    line2: "scaled accounts.",
    sub: "CLYX Media runs the creator whitelisting + performance engine behind brands that sell — Meta & Google ads, content, branding, and websites built for one job: conversion."
  },
  stats: [
    { target: 45, prefix: "₹", suffix: "Cr+", label: "Ad Spend Managed", detail: "Across Meta & Google ad accounts" },
    { target: 3.4, decimals: 1, prefix: "", suffix: "X", label: "Average ROAS Lift", detail: "Whitelisted vs Standard brand ads" },
    { target: 250, prefix: "", suffix: "+", label: "Active Creators", detail: "Fashion, Beauty, Food, Tech benches" },
    { target: 180, prefix: "₹", suffix: "Cr+", label: "Revenue Generated", detail: "Delivered for high-growth D2C brands" }
  ],
  portfolio: [
    {
      id: "lumina-skin",
      title: "LUMINA SKINCARE",
      category: "beauty",
      categoryName: "Beauty & Wellness",
      deliverables: "Creator Whitelisting + Meta Ads Scale",
      heroImg: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000&auto=format&fit=crop",
      results: { roas: "4.4X", revenue: "+265%", cpa: "-38%", reach: "4.2M" },
      summary: "Scaled a clean skincare startup from ₹8L/mo to ₹48L/mo in 90 days by pairing 18 dermatologist UGC hooks with creator whitelisting.",
      problem: "Traditional studio product ads were suffering from severe ad fatigue, driving CAC over ₹1,400 with diminishing returns on Meta.",
      strategy: "Recruited 12 micro-creators with hyper-engaged skin-enthusiast audiences. Whitelisted raw unboxing & 7-day before/after routines directly through creator ad accounts."
    },
    {
      id: "aethel-apparel",
      title: "AETHEL LUXURY STREETWEAR",
      category: "fashion",
      categoryName: "Fashion & Apparel",
      deliverables: "Reels UGC + Influencer Seeding + CRO",
      heroImg: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
      results: { roas: "3.9X", revenue: "+310%", cpa: "-44%", reach: "6.8M" },
      summary: "Generated ₹1.2Cr in collection drops within 48 hours using viral streetwear transition reels and automated checkout countdowns.",
      problem: "High drop-off on product detail page and low organic engagement on new silhouette drops.",
      strategy: "Seeded 40 fashion tastemakers with unreleased archive jackets. Ran synchronized whitelisted teaser ads 72 hours prior to drop."
    },
    {
      id: "nutra-boost",
      title: "APEX PERFORMANCE NUTRITION",
      category: "food",
      categoryName: "Food & Supplements",
      deliverables: "Performance Ads + Sub-second Web Checkout",
      heroImg: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1000&auto=format&fit=crop",
      results: { roas: "3.6X", revenue: "+185%", cpa: "-29%", reach: "3.5M" },
      summary: "Transformed a sports electrolyte blend into a top-selling morning ritual product via fitness creator taste-tests.",
      problem: "Customers viewed electrolyte powders as medicinal rather than an everyday lifestyle necessity.",
      strategy: "Positioned the product as 'clean morning focus without the coffee crash' across CrossFit and running influencers."
    },
    {
      id: "volt-audio",
      title: "VOLT HI-FI AUDIO",
      category: "tech",
      categoryName: "Consumer Tech & Audio",
      deliverables: "High-Production 3D Ads + Whitelisting",
      heroImg: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop",
      results: { roas: "5.1X", revenue: "+420%", cpa: "-52%", reach: "9.1M" },
      summary: "Scaled premium noise-canceling headphones to #1 trending tech product on Instagram Reels via audiophile blind tests.",
      problem: "Competing against legacy audio giants with 100x bigger marketing budgets.",
      strategy: "Leveraged audio engineer creators doing blind sound tests vs Sony and Bose. Ads were published under creator handles."
    },
    {
      id: "kura-matcha",
      title: "KURA BOTANICAL MATCHA",
      category: "food",
      categoryName: "Food & Beverage",
      deliverables: "Creator Whitelisting + Amazon Attribution",
      heroImg: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=1000&auto=format&fit=crop",
      results: { roas: "4.8X", revenue: "+340%", cpa: "-41%", reach: "5.4M" },
      summary: "Scaled ceremonial grade matcha brand via Japanese culinary & morning routine influencer whitelisted reels.",
      problem: "High acquisition cost on Meta ads due to low trust in premium organic powders.",
      strategy: "Whitelisted candid morning matcha prep routines from wellness chefs, driving directly to high-converting bundle funnels."
    },
    {
      id: "solstice-fit",
      title: "SOLSTICE ACTIVEWEAR",
      category: "fashion",
      categoryName: "Fashion & Athletics",
      deliverables: "Viral Reels Ads + Meta Whitelisting",
      heroImg: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1000&auto=format&fit=crop",
      results: { roas: "3.8X", revenue: "+280%", cpa: "-35%", reach: "7.1M" },
      summary: "Executed high-intensity gym wear transition ads with 25 Hyrox & fitness creators generating ₹85L drop in 7 days.",
      problem: "High competition in activewear with low repeat purchasing and high return rates.",
      strategy: "Featured squat-proof and sweat-wicking stress tests on camera by verified athletic creators, scaling winning hooks."
    },
    {
      id: "nova-optics",
      title: "NOVA SMART EYEWEAR",
      category: "tech",
      categoryName: "Consumer Tech & Wearables",
      deliverables: "3D Motion Ads + Creator Whitelisting",
      heroImg: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000&auto=format&fit=crop",
      results: { roas: "4.2X", revenue: "+220%", cpa: "-46%", reach: "4.8M" },
      summary: "Turned open-ear bluetooth audio frames into a viral lifestyle everyday carry staple with day-in-the-life creator vlogs.",
      problem: "Consumer skepticism around battery life and sound bleed on open-ear audio glasses.",
      strategy: "Paired city commuters and digital nomad creators recording real-world calls and cafe work sessions."
    }
  ],

  team: [
    {
      name: "Arjun Verma",
      role: "Managing Partner & Growth Lead",
      bio: "Ex-D2C Performance Lead. Scaled ₹80Cr+ in Meta ad spend across 40+ brands.",
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
      monogram: "AV",
      badge: "₹80Cr+ Scaled"
    },
    {
      name: "Sanya Malhotra",
      role: "Head of Creator Strategy & UGC",
      bio: "Directs 200+ creator relationships and content production frameworks that convert.",
      img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
      monogram: "SM",
      badge: "200+ Creators"
    },
    {
      name: "Karan Johar",
      role: "Head of Conversion Tech & CRO",
      bio: "Full-stack engineer specialized in Next.js, sub-second Shopify stores, and A/B funnels.",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
      monogram: "KJ",
      badge: "0.4s Sub-Second Web"
    }
  ],

  testimonials: [
    {
      quote: "CLYX completely replaced our internal creative bottleneck. Their creator whitelisting pipeline drove our ROAS from 2.1x to 4.4x in just six weeks.",
      author: "Aarav Kapoor",
      role: "Founder & CEO",
      brand: "Lumina Skincare",
      metrics: "+265% Revenue · ₹1.2Cr Added"
    },
    {
      quote: "Most agencies give you fluff reports and vanity metrics. CLYX treats our ad budget like their own money. The blend of UGC + performance buying is deadly.",
      author: "Natasha Roy",
      role: "Head of Growth",
      brand: "Aethel Streetwear",
      metrics: "3.9x ROAS · ₹40L/month Scale"
    },
    {
      quote: "The landing page they built loaded in 0.4 seconds. Coupled with their whitelisted creator ads, our checkout conversion rate jumped from 1.8% to 4.8%.",
      author: "Devang Patel",
      role: "Co-Founder",
      brand: "Volt Audio",
      metrics: "5.1x Peak ROAS · 0.4s Page Speed"
    }
  ],

  blog: [
    {
      id: "creator-whitelisting-playbook",
      title: "The Creator Whitelisting Playbook: How to Cut Meta CAC by 40%",
      category: "Performance Ads",
      readTime: "5 min read",
      date: "Sep 2026",
      summary: "Why running ads directly through creator handles consistently beats brand page ads in CTR, CPM, and ROAS.",
      img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: "why-studio-ads-die",
      title: "Why Studio Product Ads Die in 2026 (And What Actually Scales on Reels)",
      category: "Creative Strategy",
      readTime: "4 min read",
      date: "Aug 2026",
      summary: "The 3-second hook framework that converted over ₹12Cr in direct-to-consumer sales for emerging lifestyle brands.",
      img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: "sub-second-checkout",
      title: "The 0.4-Second Checkout: How Sub-Second Speed Lifts Shopify ROAS",
      category: "CRO & Tech",
      readTime: "6 min read",
      date: "Jul 2026",
      summary: "Every 100ms delay costs 7% in checkout conversions. How headless Next.js storefronts supercharge Meta traffic.",
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
    }
  ],

  careers: [
    {
      title: "Senior Performance Media Buyer (Meta & Google)",
      type: "Full-Time",
      location: "Remote / Hybrid (Mumbai)",
      compensation: "₹18L - ₹28L + Performance Bonus",
      description: "Manage ₹5Cr+ in monthly ad spend across high-growth D2C brands. Lead creative testing frameworks and scaling strategies.",
      tag: "Paid Media"
    },
    {
      title: "Creator Partnerships & UGC Lead",
      type: "Full-Time",
      location: "Remote (Delhi / Bangalore)",
      compensation: "Competitive + Incentives",
      description: "Scout, negotiate, and orchestrate high-converting creator pipelines. Nurture relationships with 200+ tier-1 lifestyle creators.",
      tag: "Creator Ops"
    },
    {
      title: "Full-Stack CRO & Shopify Engineer",
      type: "Full-Time",
      location: "Remote",
      compensation: "Competitive Salary",
      description: "Build ultra-fast Next.js / Shopify landing pages, custom A/B checkout funnels, and sub-second web experiences.",
      tag: "Engineering"
    }
  ]
};

// Maps content from the backend (GET /api/public/content) onto CLYX_DATA, the shape main.js renders.
// Called by the React landing page before main.js starts and again whenever fresh content arrives.
function parseStatValue(raw) {
  const text = String(raw == null ? '' : raw).trim();
  const m = text.match(/^([^\d.]*)(\d+(?:\.\d+)?)(.*)$/);
  if (!m) return { isNumeric: false, text };
  return { isNumeric: true, target: parseFloat(m[2]), decimals: (m[2].split('.')[1] || '').length, prefix: m[1], suffix: m[3] };
}

function initialsOf(name) {
  return String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'CM';
}

window.clyxApplyRemoteContent = function (remote) {
  if (!remote) return;
  const blocks = remote.blocks || {};
  const lists = remote.collections || {};

  if (blocks.hero) {
    // "We turn organic clips into scaled accounts." -> line1 / line2 around the word "into"
    const parts = String(blocks.hero.headline || '').split(/\s+into\s+/i);
    CLYX_DATA.hero = {
      ...CLYX_DATA.hero,
      line1: parts[0] || CLYX_DATA.hero.line1,
      line2: parts.length > 1 ? parts.slice(1).join(' into ') : '',
      sub: blocks.hero.sub || CLYX_DATA.hero.sub,
    };
  }
  if (Array.isArray(lists.stats)) {
    CLYX_DATA.stats = lists.stats.map((s) => ({ ...parseStatValue(s.value), label: s.label, detail: s.detail }));
  }
  if (Array.isArray(lists.team)) {
    CLYX_DATA.team = lists.team.map((m) => ({
      name: m.name, role: m.role, bio: m.bio, img: m.img, badge: m.badge, monogram: initialsOf(m.name),
    }));
  }
  if (Array.isArray(lists.testimonials)) {
    CLYX_DATA.testimonials = lists.testimonials.map((t) => ({
      quote: t.quote, author: t.name, role: t.role, brand: t.brand, metrics: t.metrics,
    }));
  }
};

window.CLYX_DATA = CLYX_DATA;
