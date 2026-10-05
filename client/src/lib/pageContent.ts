import { useMemo } from 'react';
import { useBlockData } from '@/lib/siteContent';
import { services } from '@/data/home';

/**
 * Every piece of page copy the admin panel can edit, grouped by website page and section.
 * `default` is what the page shows until the admin saves something else.
 * Each page is stored in the backend as the block `page_<id>`; a section with `block` saves to that block instead.
 * Field keys ending in "Image" hold image URLs, keys ending in "Url" hold links and keys ending in "Links" hold
 * one "Label | link" per line (the backend checks all three).
 */
export type FieldType = 'text' | 'textarea' | 'richtext' | 'image' | 'url' | 'select';
export type FieldDef = { key: string; label: string; type?: FieldType; default: string; hint?: string; options?: string[] };
export type SectionDef = { id: string; title: string; description?: string; block?: string; fields: FieldDef[] };
export type CollectionName =
  | 'campaigns'
  | 'caseStudies'
  | 'team'
  | 'testimonials'
  | 'blog'
  | 'careers'
  | 'creators'
  | 'stats'
  | 'portfolio'
  | 'courses';
export type PageId = 'global' | 'home' | 'about' | 'services' | 'portfolio' | 'caseStudies' | 'creators' | 'blog' | 'careers' | 'courses' | 'contact';
export type PageDef = {
  id: PageId;
  label: string;
  route: string;
  blurb: string;
  sections: SectionDef[];
  collections: CollectionName[];
};

const t = (key: string, label: string, value: string, hint?: string): FieldDef => ({ key, label, default: value, hint });
/** Free text the site shows exactly as typed: line breaks, blank-line gaps, indents and bullet / numbered points. */
const long = (key: string, label: string, value: string, hint?: string): FieldDef => ({ key, label, type: 'richtext', default: value, hint });
/** Plain multi-line text the site splits up itself (one item per line, "Label | link", heading lines...). */
const list = (key: string, label: string, value: string, hint?: string): FieldDef => ({ key, label, type: 'textarea', default: value, hint });
const img = (key: string, label: string, value: string, hint?: string): FieldDef => ({ key, label, type: 'image', default: value, hint });
const link = (key: string, label: string, value: string, hint?: string): FieldDef => ({ key, label, type: 'url', default: value, hint });
const pick = (key: string, label: string, value: string, options: string[], hint?: string): FieldDef => ({ key, label, type: 'select', default: value, options, hint });

/** The hero at the top of every inner page (eyebrow, two-line title, intro card). */
const pageHero = (eyebrow: string, title: string, highlight: string, intro: string | null): SectionDef => ({
  id: 'hero',
  title: 'Hero banner',
  description: 'The first thing visitors see at the top of the page.',
  fields: [
    t('heroEyebrow', 'Eyebrow label', eyebrow),
    t('heroTitle', 'Title (first line)', title),
    t('heroHighlight', 'Title highlight (yellow second line)', highlight),
    ...(intro === null ? [] : [long('heroIntro', 'Intro paragraph', intro)]),
  ],
});

const LINES = 'Press Enter for a line break.';
const ONE_PER_LINE = 'One per line.';
const LINKS = 'One link per line, written as: Label | /page (or https://…, mailto:…, #section).';
const PAIRS = (shape: string) => `One per line, written as: ${shape}.`;

/** Adds extra fields to a section built by a helper such as pageHero. */
const withFields = (section: SectionDef, fields: FieldDef[]): SectionDef => ({ ...section, fields: [...section.fields, ...fields] });

/** `count` numbered copies of a group of fields, e.g. "Card 1 · title", "Card 2 · title", … */
const numbered = <T,>(items: T[], build: (item: T, n: number) => FieldDef[]) => items.flatMap((item, i) => build(item, i + 1));

// Six service sections on the Services page; the homepage book and the Services hero read the same fields.
const serviceSections: SectionDef[] = services.map((s, i) => {
  const n = i + 1;
  return {
    id: `service${n}`,
    title: `Service ${n} · ${s.title}`,
    description: `Shown on the Services page list, the Services hero cards, the homepage services book and its own page at /services/${s.slug}. The icon and page address stay the same.`,
    fields: [
      t(`service${n}Title`, 'Name', s.title),
      long(`service${n}Text`, 'Description', s.text),
      list(`service${n}Points`, '“What’s included” points (homepage book and service page)', s.points.join('\n'), ONE_PER_LINE),
      t(`service${n}Short`, 'Short name (Services hero tab)', s.short),
      t(`service${n}Line`, 'One-liner (Services hero card and service page)', s.line),
      t(`service${n}Tags`, 'Tags (Services hero card and service page)', s.tags.join(', '), 'Separate with commas.'),
      long(`service${n}Overview`, 'Service page · overview', s.overview),
      list(`service${n}Process`, 'Service page · how it works', s.process.map(([title, text]) => `${title} | ${text}`).join('\n'), PAIRS('Step title | step text')),
      list(`service${n}Faqs`, 'Service page · FAQs', s.faqs.map(([q, a]) => `${q} | ${a}`).join('\n'), PAIRS('Question | answer')),
    ],
  };
});

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * One section per spread of the homepage services book, shown on the Home page in the admin. They save to the
 * Services page block: name, description and points are the very same fields as the Services page (so both editors
 * always agree), and the `book<n>…` fields only change the book. Read by ServiceBook through `useServiceBook`.
 */
const bookChapterSections: SectionDef[] = services.map((s, i) => {
  const n = i + 1;
  const last = n === services.length;
  return {
    id: `bookChapter${n}`,
    title: `Services book · Chapter ${n}`,
    description: `The open spread for ${s.title}: chapter opener on the left page, details on the right. Name, description and points are shared with the Services page.`,
    block: 'page_services',
    fields: [
      t(`service${n}Title`, 'Name', s.title, 'Also changes the Services page.'),
      long(`service${n}Text`, 'Description', s.text, 'Also changes the Services page.'),
      list(`service${n}Points`, '“What’s included” points', s.points.join('\n'), `${ONE_PER_LINE} Also changes the service page.`),
      pick(`book${n}Icon`, 'Icon', s.title, services.map((x) => x.title), 'Each option is the icon of that original service.'),
      img(`book${n}IconImage`, 'Custom icon image (optional)', '', 'Replaces the icon above on both pages. A square PNG with a transparent background works best.'),
      t(`book${n}Number`, 'Chapter number', pad2(n), 'The big outlined number, the “Chapter” labels and the caption under the book.'),
      t(`book${n}LeftFolio`, 'Left page number', String(n * 2)),
      t(`book${n}RightFolio`, 'Right page number', String(n * 2 + 1)),
      ...(last
        ? []
        : [t(`book${n}Footer`, 'Footer text (right page)', '', 'Leave blank to use the shared footer hint from “Services book” above.')]),
    ],
  };
});

export const PAGES: PageDef[] = [
  {
    id: 'global',
    label: 'Header & Footer',
    route: '/',
    blurb: 'Navigation bar, footer, page-top buttons, WhatsApp bubble and cookie notice, shared by every page.',
    collections: [],
    sections: [
      {
        id: 'header',
        title: 'Navigation bar',
        fields: [
          img('logoImage', 'Site logo', '/clyx-logo.png', 'Shown in the header and footer.'),
          list('navLinks', 'Menu links', 'Home | /\nAbout | /about\nServices | /services\nPortfolio | /portfolio\nCase Studies | /case-studies\nCreators | /creators\nBlog | /blog\nCareers | /careers', LINKS),
          t('headerCtaText', 'Button text', 'Start a project'),
          link('headerCtaUrl', 'Button link', '/contact'),
        ],
      },
      {
        id: 'pageHero',
        title: 'Page-top buttons',
        description: 'The two buttons in the intro card at the top of the inner pages (About, Portfolio, Blog…).',
        fields: [
          t('heroPrimaryText', 'Primary button text', 'Book a call'),
          link('heroPrimaryUrl', 'Primary button link', '/contact#contact-form'),
          t('heroSecondaryText', 'Secondary button text', 'WhatsApp us'),
          link('heroSecondaryUrl', 'Secondary button link', 'https://wa.me/919671430111'),
        ],
      },
      {
        id: 'footerTop',
        title: 'Footer · top band',
        fields: [
          t('footerEyebrow', 'Eyebrow label', 'Have a brand to grow?'),
          t('footerEmail', 'Big email address', 'work@clyxmedia.com'),
          t('footerPrimaryText', 'Primary button text', 'Book a call'),
          link('footerPrimaryUrl', 'Primary button link', '/contact#contact-form'),
          t('footerSecondaryText', 'Secondary button text', 'WhatsApp us'),
          link('footerSecondaryUrl', 'Secondary button link', 'https://wa.me/919671430111'),
        ],
      },
      {
        id: 'footerBrand',
        title: 'Footer · brand & social',
        fields: [
          long('footerTagline', 'Tagline', 'The performance creative partner for brands that want to move faster than the feed.'),
          link('instagramUrl', 'Instagram link', 'https://www.instagram.com/d2cwithclyx', 'Leave empty to hide the icon.'),
          link('linkedinUrl', 'LinkedIn link', 'https://www.linkedin.com/company/clyxmediax/', 'Leave empty to hide the icon.'),
        ],
      },
      {
        id: 'footerColumns',
        title: 'Footer · link columns',
        fields: [
          t('footerCol1Title', 'Column 1 · heading', 'Company'),
          list('footerCol1Links', 'Column 1 · links', 'About | /about\nCreators | /creators\nCareers | /careers', LINKS),
          t('footerCol2Title', 'Column 2 · heading', 'Work'),
          list('footerCol2Links', 'Column 2 · links', 'Services | /services\nPortfolio | /portfolio\nCase studies | /case-studies', LINKS),
          t('footerCol3Title', 'Column 3 · heading', 'Contact'),
          list('footerCol3Links', 'Column 3 · links', 'work@clyxmedia.com | mailto:work@clyxmedia.com\nWhatsApp | https://wa.me/919671430111\nCalendly | /contact#contact-form', LINKS),
        ],
      },
      {
        id: 'footerBottom',
        title: 'Footer · bottom bar',
        fields: [
          t('footerCopyright', 'Copyright text', 'CLYX Media. All rights reserved.', '“© <current year>” is added in front automatically.'),
          list('footerLegalLinks', 'Small links', 'Privacy | /privacy\nTerms | /terms\nAdmin | /admin', LINKS),
          t('footerTopText', '“Back to top” button', 'Back to top'),
          t('footerWordmark', 'Giant wordmark', 'CLYX'),
        ],
      },
      {
        id: 'whatsapp',
        title: 'Floating WhatsApp bubble',
        fields: [
          link('whatsappUrl', 'WhatsApp link', 'https://wa.me/919671430111', 'Leave empty to hide the bubble.'),
          t('whatsappPopupText', 'Popup message', 'Need help? Chat with us!', 'Shown in a speech bubble that pops up next to the button every so often.'),
        ],
      },
      {
        id: 'cookie',
        title: 'Cookie notice',
        fields: [
          t('cookieTitle', 'Title', 'Cookie preferences'),
          long('cookieText', 'Text', 'We use cookies to make CLYX faster and track essential performance metrics.'),
          t('cookieEssential', 'First button', 'Essential'),
          t('cookieAccept', 'Second button', 'Accept all'),
        ],
      },
    ],
  },
  {
    id: 'home',
    label: 'Home',
    route: '/',
    blurb: 'Hero, marquee, growth engine, methodology, newsletter and the closing call-to-action.',
    collections: ['campaigns', 'stats', 'team', 'testimonials'],
    sections: [
      {
        id: 'loader',
        title: 'Intro loading screen',
        description: 'Shown for under two seconds on a visitor’s first page load.',
        fields: [t('loaderWordmark', 'Wordmark', 'CLYX')],
      },
      {
        id: 'hero',
        title: 'Hero banner',
        description: 'The very first screen of the website.',
        block: 'hero',
        fields: [
          t('eyebrow', 'Eyebrow label', 'Performance marketing • Creator ads • Web'),
          t('headline', 'Headline', 'We turn organic clips into scaled accounts.', 'Everything after the word "into" becomes the highlighted second line.'),
          long('sub', 'Supporting text', 'CLYX Media runs the creator whitelisting + performance engine behind brands that sell — Meta & Google ads, content, branding, and websites built for one job: conversion.'),
        ],
      },
      {
        id: 'heroButtons',
        title: 'Hero buttons',
        fields: [
          t('heroPrimaryText', 'Primary button text', 'Book a Growth Call ↗'),
          link('heroPrimaryUrl', 'Primary button link', '/contact'),
          t('heroSecondaryText', 'Secondary button text', 'Experience 3D Engine ↓'),
          link('heroSecondaryUrl', 'Secondary button link', '#engine'),
        ],
      },
      {
        id: 'heroTyping',
        title: 'Hero typing words',
        description: 'After the highlighted headline line, these phrases are typed in one after another.',
        fields: [
          list('heroRotating', 'Phrases', 'winning ads.\nrevenue engines.\nloyal customers.\nreal growth.', `${ONE_PER_LINE} Leave empty to turn the typing effect off.`),
        ],
      },
      {
        id: 'heroClips',
        title: 'Hero floating clip cards',
        description: 'The stack of five reels on the right of the hero. A card with a result is highlighted as a scaled ad.',
        fields: numbered(
          [
            ['Organic Reel', '', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop'],
            ['Organic Reel', '', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop'],
            ['Scaled Ad', '+312% ROAS', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=600&auto=format&fit=crop'],
            ['Organic Reel', '', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=600&auto=format&fit=crop'],
            ['Scaled Ad', '+188% CTR', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop'],
          ],
          ([label, metric, image], n) => [
            img(`clip${n}Image`, `Card ${n} · image`, image),
            t(`clip${n}Label`, `Card ${n} · label`, label),
            t(`clip${n}Metric`, `Card ${n} · result`, metric, 'e.g. +312% ROAS. Numbers count up. Leave empty for a plain organic card.'),
          ],
        ),
      },
      {
        id: 'marquee',
        title: 'Scrolling marquee strip',
        fields: [
          list('marqueeItems', 'Marquee items', '50+ D2C BRANDS SCALED\n₹45CR+ AD SPEND MANAGED\n3.4X AVG ROAS LIFT\n250+ CREATORS IN NETWORK\nCREATOR WHITELISTING ENGINE', 'One item per line.'),
        ],
      },
      {
        id: 'engine',
        title: 'Growth engine (3D laptop)',
        fields: [
          t('engineEyebrow', 'Eyebrow label', 'Live Scaling Architecture ↓'),
          t('engineTitle', 'Heading', 'The engine behind'),
          t('engineHighlight', 'Heading highlight', '₹45Cr+ in revenue.'),
          long('engineText', 'Supporting text', 'Real-time creator whitelisting paired with algorithmic Meta & Google scaling.'),
        ],
      },
      {
        id: 'dashboard',
        title: 'Growth engine · laptop screen & badges',
        description: 'Numbers count up when scrolled into view, e.g. “₹30 Lakh” or “68.4%”.',
        fields: [
          t('badge1Label', 'Left badge · label', 'BENCHMARK'),
          t('badge1Value', 'Left badge · number', '3.4X'),
          t('badge1Text', 'Left badge · text', 'Avg ROAS Lift'),
          t('badge2Label', 'Right badge · label', 'NETWORK'),
          t('badge2Value', 'Right badge · number', '250+'),
          t('badge2Text', 'Right badge · text', 'Vetted Creators'),
          t('dashTitle', 'Screen title', 'GROWTH COMMAND CENTER', '“CLYX” is shown in yellow before it.'),
          t('dashLive', 'Live pill', 'LIVE ENGINE'),
          t('dashConnected', 'Connection text', 'Meta Advantage+ Connected'),
          ...numbered(
            [
              ['Blended ROAS', '3.72X', '↑ +0.6x vs target'],
              ['30-Day Revenue', '₹30 Lakh', '↑ +42% MoM'],
              ['Whitelisted Hooks', '48 Live', 'Across 18 Creators'],
              ['Avg 3-Sec Retention', '68.4%', 'Industry Avg: 38%'],
            ],
            ([label, value, note], n) => [
              t(`dashStat${n}Label`, `Stat ${n} · label`, label),
              t(`dashStat${n}Value`, `Stat ${n} · number`, value),
              t(`dashStat${n}Note`, `Stat ${n} · note`, note),
            ],
          ),
          t('dashChartTitle', 'Chart title', 'Daily Attributed Revenue vs Ad Spend (Live)'),
          t('dashChartNote', 'Chart note', 'Advantage+ Creative Optimization'),
          list('dashChartDays', 'Chart · day labels', 'Mon\nTue\nWed\nThu\nFri\nSat\nSun', ONE_PER_LINE),
        ],
      },
      {
        id: 'channels',
        title: 'Channels we scale on',
        description: 'Each channel tile keeps its icon.',
        fields: [
          t('channelsEyebrow', 'Eyebrow label', 'Channels We Scale On'),
          t('channelsTitle', 'Heading', 'Every feed your buyers scroll.'),
          t('channelsHighlight', 'Heading highlight', 'One team running it.'),
          long('channelsText', 'Body text', 'Creative, media buying and conversion under one roof, so the hook that wins on Reels becomes the ad that scales on Meta and the page that closes on Shopify.'),
          ...numbered(
            [
              ['Meta Ads', 'Advantage+ & creator whitelisting'],
              ['Instagram Reels', 'UGC hooks, Stories & collabs'],
              ['Google Ads', 'Search, PMax & Shopping'],
              ['YouTube Shorts', 'Short-form & in-stream video'],
              ['Shopify', 'Landing pages & CRO'],
              ['WhatsApp', 'Retargeting & repeat flows'],
            ],
            ([name, detail], n) => [t(`channel${n}Name`, `Channel ${n} · name`, name), t(`channel${n}Detail`, `Channel ${n} · detail`, detail)],
          ),
        ],
      },
      {
        id: 'services',
        title: 'Services book',
        description: 'Text shared by every page of the book. Each chapter’s own card is edited in the “Services book · Chapter” sections below.',
        fields: [
          t('servicesEyebrow', 'Eyebrow label', 'What We Run'),
          t('servicesTitle', 'Heading', 'Six disciplines. One growth engine.'),
          t('bookKicker', 'Cover · top-left label', 'Services'),
          t('bookVolume', 'Cover · top-right label', 'Vol. 01'),
          t('bookCoverText', 'Cover · tagline', 'Six disciplines.'),
          t('bookCoverHighlight', 'Cover · tagline highlight', 'One growth engine.'),
          t('bookIncludedLabel', 'Page · list heading', 'What’s included'),
          t('bookNextText', 'Page · footer hint', 'Scroll to turn the page'),
          t('bookCtaText', 'Last page · button text', 'Start a project'),
          link('bookCtaUrl', 'Last page · button link', '/contact'),
          t('bookCoverBrand', 'Cover · brand name', 'CLYX'),
          t('bookCoverBrandSuffix', 'Cover · brand name (second word)', 'Media'),
          t('bookRunningHead', 'Every page · running header', 'CLYX Media'),
          t('bookChapterLabel', 'Every page · "Chapter" label', 'Chapter'),
          t('bookCoverLabel', 'Nav caption before the first page turn', 'Cover'),
        ],
      },
      ...bookChapterSections,
      {
        id: 'methodology',
        title: 'Methodology',
        fields: [
          t('howEyebrow', 'Eyebrow label', 'The CLYX Methodology'),
          list('howTitle', 'Heading', "A one-off post doesn't sell.\nA whitelisted ad, run on data, does.", LINES),
          long('howText', 'Body text', "Instead of paying for a single influencer post that disappears in 24 hours, we run the creator's own organic content as a paid ad through their handle — it reads as a genuine recommendation, not a sponsored pitch, earning instant trust. From there, performance analytics decide which hooks get scaled."),
          ...numbered(
            [
              ['Creator Posts Organically', 'Real handles. Authentic audience trust. Genuine reaction.'],
              ['We Whitelist Top Clips', "Direct ads running through the creator's account with dark-post permissions."],
              ['Data Decides The Scale', 'Spend follows verified conversion rates and ROAS, not intuition.'],
            ],
            ([title, text], n) => [t(`step${n}Title`, `Step ${n} · title`, title), long(`step${n}Text`, `Step ${n} · text`, text)],
          ),
        ],
      },
      {
        id: 'campaigns',
        title: 'Featured campaigns carousel',
        description: 'The campaign cards themselves are managed in the Campaigns list below.',
        fields: [t('campaignsLabel', 'Section label', 'FEATURED CAMPAIGNS')],
      },
      {
        id: 'team',
        title: 'Leadership section',
        description: 'People are managed in the Team list below.',
        fields: [
          t('teamEyebrow', 'Eyebrow label', 'Leadership'),
          t('teamTitle', 'Heading', 'The people behind your growth.'),
          long('teamText', 'Intro text', 'You collaborate directly with senior partners who have scaled eight-figure ad spend across high-growth categories.'),
        ],
      },
      {
        id: 'testimonials',
        title: 'Testimonials section',
        description: 'Quotes are managed in the Testimonials list below.',
        fields: [t('testimonialsEyebrow', 'Eyebrow label', 'Client Results'), t('testimonialsTitle', 'Heading', 'What D2C founders say about CLYX')],
      },
      {
        id: 'newsletter',
        title: 'Newsletter strip',
        fields: [
          t('newsletterEyebrow', 'Eyebrow label', 'Stay ahead'),
          t('newsletterTitle', 'Heading', 'One email a month. No fluff.'),
          long('newsletterText', 'Body text', 'Actionable breakdowns of whitelisted creator campaigns, Meta ad teardowns, and creative frameworks that scale.'),
          t('newsletterPlaceholder', 'Email box placeholder', 'you@brand.com'),
          t('newsletterButton', 'Button text', 'Subscribe'),
          t('newsletterSending', 'Button text while sending', 'Subscribing…'),
          t('newsletterSuccess', 'Message after subscribing', "You're in! Check your inbox for a welcome email."),
          t('newsletterError', 'Error when signup fails', 'Could not subscribe you right now. Please try again.'),
          t('newsletterNetworkError', 'Error when offline', 'Could not reach our server. Check your connection and try again.'),
        ],
      },
      {
        id: 'cta',
        title: 'Closing call-to-action',
        fields: [
          t('ctaEyebrow', 'Eyebrow label', 'Growth audit'),
          t('ctaTitle', 'Heading', 'Ready to turn your creators into'),
          t('ctaHighlight', 'Heading highlight', 'scalable ad accounts?'),
          long('ctaText', 'Body text', "We'll audit your Meta/Google ad accounts and creator pipeline, then map out a 90-day scaling roadmap for your brand."),
          t('ctaPrimaryText', 'Primary button text', 'Book a Growth Call'),
          link('ctaPrimaryUrl', 'Primary button link', 'https://wa.me/919671430111'),
          t('ctaSecondaryText', 'Secondary button text', 'Email Founders'),
          link('ctaSecondaryUrl', 'Secondary button link', 'mailto:work@clyxmedia.com?subject=Growth Consultation - CLYX Media'),
        ],
      },
    ],
  },
  {
    id: 'about',
    label: 'About',
    route: '/about',
    blurb: 'Story, principles band and the leadership team.',
    collections: ['team'],
    sections: [
      {
        id: 'hero',
        title: 'Hero banner',
        description: 'The first thing visitors see at the top of the page. The two buttons are edited under "Header & Footer".',
        fields: [
          t('heroTag', 'Small label', 'About CLYX'),
          t('heroTagNote', 'Label note (after the divider)', 'Performance creative studio'),
          t('heroHeadline', 'Heading (first line)', 'Where culture'),
          t('heroHeadlineHighlight', 'Heading highlight (blue second line)', 'meets performance.'),
          long('heroSub', 'Intro paragraph', 'CLYX is a performance creative studio for brands that want to move faster than the feed. We connect creator instinct, paid distribution, and the systems that make growth repeatable.'),
          list('heroPillars', 'Hanging cards (right side)', 'Creator instinct | Ideas that feel native to the feed\nPaid distribution | Media that finds the right people\nRepeatable systems | Testing loops that turn wins into process', 'Up to three cards, one per line, written as: Title | short line.'),
        ],
      },
      {
        id: 'intro',
        title: 'Intro statement',
        fields: [
          t('introLabel', 'Label', 'Built for the brave'),
          list('introTitle', 'Heading', 'The ad should feel like culture. The result should feel like math.'),
          long('introText', 'Body text', 'Most agencies choose between creative and performance. We do not. CLYX connects the instinct that makes people stop with the systems that make brands grow.'),
        ],
      },
      {
        id: 'values',
        title: 'Principles band (yellow)',
        fields: [
          t('valuesEyebrow', 'Eyebrow label', 'How we work'),
          list('valuesTitle', 'Heading', 'Three principles.\nZero fluff.', LINES),
          long('valuesIntro', 'Intro text', 'The rules every brief, creative and campaign at CLYX runs on, from the first call to the tenth scaled ad.'),
          t('value1Tag', 'Card 1 · tag', 'How we talk'),
          t('value1Title', 'Card 1 · title', 'Directness'),
          long('value1Text', 'Point 1 · text', 'Senior partners, clear thinking, no unnecessary layers.'),
          t('value2Tag', 'Card 2 · tag', 'How we create'),
          t('value2Title', 'Card 2 · title', 'Instinct'),
          long('value2Text', 'Point 2 · text', 'Creative that earns attention before it asks for action.'),
          t('value3Tag', 'Card 3 · tag', 'How we scale'),
          t('value3Title', 'Card 3 · title', 'Iteration'),
          long('value3Text', 'Point 3 · text', 'Every winning hook becomes a system, not a one-off.'),
        ],
      },
      {
        id: 'leadership',
        title: 'Leadership section',
        description: 'People are managed in the Team list below.',
        fields: [
          t('leadEyebrow', 'Eyebrow label', 'Leadership'),
          t('leadTitle', 'Heading', 'Small team.'),
          t('leadHighlight', 'Heading highlight', 'Direct access.'),
          t('leadCardTitle', 'Access card title', 'You work with the people who build the work.'),
          t('leadLive', 'Access card live tag', 'Direct line'),
          long(
            'leadAccessText',
            'Access card body text',
            'No account-manager relay. {foundersPhrase} {count}-person core team, one conversation.',
            '{foundersPhrase} and {count} are filled in from the Team list automatically.',
          ),
          t('leadCardButton', 'Access card button', 'Talk to a founder'),
          link('leadCardButtonUrl', 'Access card button link', '/contact'),
          t('leadTeamLabel', 'Team list label', 'The team'),
          t('leadJoinText', 'Team list link text', 'Join us'),
          link('leadJoinUrl', 'Team list link', '/careers'),
        ],
      },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    route: '/services',
    blurb: 'The six disciplines, the operating principle and the services call-to-action.',
    collections: [],
    sections: [
      withFields(pageHero('Services', 'One growth engine.', 'Six disciplines', null), [
        t('heroNote', 'Handwritten note above the cards', 'all six, under one roof'),
      ]),
      {
        id: 'list',
        title: 'Services list',
        description: 'Heading above the six service rows. Each service is edited in its own section below.',
        fields: [t('listEyebrow', 'Eyebrow label', 'What we run'), t('listTitle', 'Heading', 'Strategy into systems.')],
      },
      ...serviceSections,
      {
        id: 'detail',
        title: 'Service pages · shared labels',
        description: 'Headings used on every service page (/services/…). The content of each page is edited in its service section above.',
        fields: [
          t('detailBackLabel', 'Back link', 'All services'),
          t('detailOverviewLabel', 'Overview label', 'Overview'),
          t('detailIncludedLabel', '“What’s included” heading', 'What’s included'),
          t('detailProcessLabel', 'How it works · eyebrow', 'How it works'),
          t('detailProcessTitle', 'How it works · heading', 'From brief to results.'),
          t('detailFaqLabel', 'FAQs · eyebrow', 'FAQs'),
          t('detailFaqTitle', 'FAQs · heading', 'Questions, answered.'),
          t('detailMoreLabel', 'Other services · eyebrow', 'Explore more'),
          t('detailMoreTitle', 'Other services · heading', 'The rest of the engine.'),
        ],
      },
      {
        id: 'principle',
        title: 'Operating principle (yellow)',
        fields: [
          t('opEyebrow', 'Eyebrow label', 'The operating principle'),
          t('opTitle', 'Heading', 'Make the creative'),
          t('opHighlight', 'Heading highlight', 'measurable'),
          long('opText', 'Body text', 'We build a feedback loop between what makes people stop and what makes them convert. That loop is where growth compounds.'),
          t('opStep1Title', 'Step 1 · title', 'Test hooks, not hunches.'),
          t('opStep1Text', 'Step 1 · text', 'Every creative starts as a hypothesis.'),
          t('opStep2Title', 'Step 2 · title', 'Keep what stops the scroll.'),
          t('opStep2Text', 'Step 2 · text', 'Hook rate and watch time decide what stays.'),
          t('opStep3Title', 'Step 3 · title', 'Put budget behind proof.'),
          t('opStep3Text', 'Step 3 · text', 'Spend follows ROAS, not opinions.'),
          t('opNote', 'Handwritten note', 'the whole game, really'),
          list('opCore', 'Loop centre text', 'Growth\ncompounds', LINES),
          t('opLoop1', 'Loop · top', 'Stop the scroll'),
          t('opLoop2', 'Loop · right', 'Click'),
          t('opLoop3', 'Loop · bottom', 'Convert'),
          t('opLoop4', 'Loop · left', 'Learn'),
        ],
      },
      {
        id: 'cta',
        title: 'Call-to-action card',
        description: 'Team names and initials come from the Team list (About page).',
        fields: [
          t('ctaEyebrow', 'Eyebrow label', 'Need a sharper system?'),
          t('ctaTitle', 'Heading', 'Let’s find the'),
          t('ctaHighlight', 'Heading highlight', 'next lever'),
          long('ctaText', 'Body text', 'Tell us what’s stuck: creative, spend or conversion. You’ll talk to the people who’d actually do the work, not a sales rep.'),
          t('ctaTeamNote', 'Text after the team names', 'read every message themselves.'),
          t('ctaButton', 'Button text', 'Start a project'),
          link('ctaButtonUrl', 'Button link', '/contact#contact-form'),
          t('ctaWhatsappText', 'WhatsApp button text', 'Say hi on WhatsApp'),
          link('ctaWhatsappUrl', 'WhatsApp link', 'https://wa.me/919671430111'),
        ],
      },
      {
        id: 'chat',
        title: 'Mini chat (inside the call-to-action)',
        fields: [
          t('chatScribble', 'Handwritten hint', 'psst… tap one'),
          t('chatGreeting', 'First message', 'Hey 👋 I’m {name}.', '{name} becomes the first name of the first team member.'),
          t('chatQuestion', 'Second message', 'What’s slowing your growth right now?'),
          ...numbered(
            [
              ['My ads stopped scaling', 'Usually that’s creative fatigue, not budget. We’d start by testing fresh hooks before touching spend.'],
              ['Need creators who convert', 'We’ll shortlist creators matched to your category and lock usage rights, so the best clips can run as ads.'],
              ['Site isn’t converting', 'Let’s look at speed and the first scroll together. Most leaks show up above the fold.'],
              ['Not sure yet', 'Totally fine. Hop on a 30-min call and we’ll map where the growth is hiding. No pitch deck.'],
            ],
            ([label, reply], n) => [t(`topic${n}Label`, `Quick reply ${n}`, label), long(`topic${n}Reply`, `Quick reply ${n} · answer`, reply)],
          ),
          t('chatContinue', 'Continue button', 'Continue on WhatsApp'),
          t('chatAgain', 'Restart button', 'Pick another'),
          t('chatWhatsappMessage', 'Prefilled WhatsApp message', 'Hi CLYX! {topic}. Can we talk?', '{topic} becomes the quick reply the visitor picked.'),
        ],
      },
    ],
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    route: '/portfolio',
    blurb: 'The filterable project showcase and the case-studies call-to-action.',
    collections: ['portfolio'],
    sections: [
      {
        id: 'hero',
        title: 'Hero banner',
        description: 'The first thing visitors see. The card stack on the right and the scrolling results strip use the portfolio projects.',
        fields: [
          t('heroTag', 'Eyebrow label', 'Selected work'),
          t('heroHeadline', 'Title (first line)', 'Work that'),
          list('heroWords', 'Rotating words (yellow second line)', 'sells\nscales\nconverts\nsticks', ONE_PER_LINE),
          long('heroLede', 'Intro paragraph', 'Campaigns, creators and storefronts built to turn attention into revenue. Every project below comes with the number it moved.'),
          ...numbered(
            [
              ['30+', 'Projects shipped'],
              ['5', 'Industries'],
              ['4.4x', 'Peak ROAS'],
            ],
            ([value, label], n) => [t(`heroStat${n}Value`, `Stat ${n} · number`, value), t(`heroStat${n}Label`, `Stat ${n} · label`, label)],
          ),
          t('heroNote', 'Handwritten note (next to the cards)', 'real brands, real numbers'),
          t('heroCountLabel', 'Text after the project count', 'projects & counting'),
          t('outcomeLabel', 'Label on the hover-card result', 'Outcome'),
          t('heroFilterAllLabel', '"Show everything" filter pill', 'All'),
        ],
      },
      {
        id: 'cta',
        title: 'Case-studies call-to-action (blue)',
        fields: [
          t('ctaLabel', 'Label', 'Want the long version?'),
          t('ctaTitle', 'Heading', 'See how the'),
          t('ctaHighlight', 'Heading highlight', 'work works'),
          t('ctaButton', 'Button text', 'Request case studies'),
          link('ctaButtonUrl', 'Button link', '/contact'),
          t('ctaNote', 'Handwritten note', 'the real numbers live here'),
          t('ctaBadge', 'Spinning badge text', 'case studies • real results •'),
          t('ctaIncludesTitle', 'Checklist heading', 'Inside every case study'),
          list('ctaIncludes', 'Checklist items', 'The brief & starting numbers\nCreative that moved the metric\nSpend, ROAS & next steps', ONE_PER_LINE),
          t('ctaStat1Value', 'Floating chip 1 · result', '3.4x ROAS'),
          t('ctaStat1Label', 'Floating chip 1 · brand', 'Kulture Skin'),
          t('ctaStat2Value', 'Floating chip 2 · result', '+188% CTR'),
          t('ctaStat2Label', 'Floating chip 2 · brand', 'Aura Collective'),
        ],
      },
      {
        id: 'detail',
        title: 'Project detail pages',
        description: 'The page each project card opens (/portfolio/<project name>). The story comes from the project’s “Project story”, or a write-up for its category when that is empty.',
        fields: [
          t('detailEyebrow', 'Eyebrow label', 'Portfolio'),
          t('detailBackLabel', 'Back link', 'All projects'),
          t('detailCategoryLabel', 'Hero card · category label', 'Category'),
          t('detailOutcomeLabel', 'Hero card · outcome label', 'Outcome'),
          t('detailServicesFactLabel', 'Hero card · services label', 'Services'),
          t('detailButton', 'Hero card · button text', 'Start a similar project'),
          link('detailButtonUrl', 'Hero card · button link', '/contact'),
          t('detailOverviewLabel', 'Overview · label', 'The project'),
          t('detailServicesLabel', 'What we did · heading', 'What we did'),
          t('detailProcessLabel', 'Approach · label', 'Our approach'),
          t('detailProcessTitle', 'Approach · heading', 'How we got there.'),
          t('detailResultLabel', 'Result panel · label', 'The outcome'),
          t('detailResultTitle', 'Result panel · heading', 'The number that moved.'),
          t('detailDeliverablesLabel', 'Result panel · deliverables heading', 'What we delivered'),
          t('detailCaseStudyLink', 'Case study link (when one exists)', 'Read the full case study'),
          t('detailMoreLabel', 'More projects · label', 'More work'),
          t('detailMoreTitle', 'More projects · heading', 'Keep exploring.'),
        ],
      },
    ],
  },
  {
    id: 'caseStudies',
    label: 'Case Studies',
    route: '/case-studies',
    blurb: 'Expanding case-study showcase and the recurring-pattern band.',
    collections: ['caseStudies'],
    sections: [
      pageHero('Case studies', 'The work behind', 'the movement', 'Real brands, real constraints, real growth systems. Explore how CLYX turns creative instinct into measurable momentum.'),
      {
        id: 'pattern',
        title: 'Recurring pattern (blue panel)',
        fields: [
          t('patternLabel', 'Label', 'The recurring pattern'),
          list('patternTitle', 'Heading', 'Find the signal\nScale the signal', LINES),
          long('patternText', 'Body text', 'The best results rarely come from one perfect post. They come from building a system that knows what to keep, what to cut, and what to try next.'),
          t('patternStep1Tag', 'Card 1 · tag', 'Keep'),
          t('patternStep1Title', 'Card 1 · title', 'Double down on what holds.'),
          long('patternStep1Text', 'Point 1 · text', 'Hooks that stop the scroll and convert cheaply earn more budget, fast.'),
          t('patternStep2Tag', 'Card 2 · tag', 'Cut'),
          t('patternStep2Title', 'Card 2 · title', 'Retire what stalls.'),
          long('patternStep2Text', 'Point 2 · text', 'Creative that loses attention in the first seconds stops spending money.'),
          t('patternStep3Tag', 'Card 3 · tag', 'Try next'),
          t('patternStep3Title', 'Card 3 · title', 'Seed the next angle.'),
          long('patternStep3Text', 'Point 3 · text', 'Every winner spins off new variations, so the testing pipeline never runs dry.'),
          t('patternStep4Tag', 'Card 4 · tag', 'Measure'),
          t('patternStep4Title', 'Card 4 · title', 'Track what moves the needle.'),
          long('patternStep4Text', 'Card 4 · text', 'ROAS, CPA and hook rate are checked daily, not at the end of the month.'),
          t('patternStep5Tag', 'Card 5 · tag', 'Repeat'),
          t('patternStep5Title', 'Card 5 · title', 'Feed winners back into the loop.'),
          long('patternStep5Text', 'Card 5 · text', 'Every result becomes the next test, so the system keeps compounding.'),
          t('patternStep6Tag', 'Card 6 · tag', 'Scale'),
          t('patternStep6Title', 'Card 6 · title', 'Put budget behind proof.'),
          long('patternStep6Text', 'Card 6 · text', 'Once a pattern holds across tests, spend follows it, fast.'),
          t('caseButton', 'Button inside each case study', 'Request Case Breakdown'),
          link('caseButtonUrl', 'Button link inside each case study', '/contact'),
          t('caseDetailsButton', 'Details button on each card', 'More details', 'Opens that case study’s full page.'),
        ],
      },
      {
        id: 'detail',
        title: 'Case study detail pages',
        description: 'Headings shared by every case study’s own page (/case-studies/<brand>).',
        fields: [
          t('detailBackLabel', 'Back link', 'All case studies'),
          t('detailOverviewLabel', 'Overview · label', 'Overview'),
          t('detailServicesLabel', 'Services · label', 'What we did'),
          t('detailChallengeLabel', 'Challenge · label', 'The challenge'),
          t('detailGoalsLabel', 'Goals · label', 'Goals'),
          t('detailStrategyLabel', 'Strategy · label', 'Our approach'),
          t('detailStrategyTitle', 'Strategy · heading', 'How we cracked it.'),
          t('detailExecutionLabel', 'Execution · label', 'Execution'),
          t('detailResultsLabel', 'Results · label', 'The results'),
          t('detailResultsTitle', 'Results · heading', 'Numbers that moved.'),
          t('detailLearningsLabel', 'Learnings · label', 'Key takeaways'),
          t('detailLearningsTitle', 'Learnings · heading', 'What this proved.'),
          t('detailMoreLabel', 'More case studies · label', 'More work'),
          t('detailMoreTitle', 'More case studies · heading', 'Keep reading.'),
        ],
      },
    ],
  },
  {
    id: 'creators',
    label: 'Creators',
    route: '/creators',
    blurb: 'Creator network story, the parallax talent gallery and creator types.',
    collections: ['creators'],
    sections: [
      withFields(pageHero('Creators', 'People make', 'the difference.', null), [
        list('heroCloudLeft', 'Left cloud notes', 'say cheese!\nhold that pose…\nthat’s the one!', `${ONE_PER_LINE} The two clouds take turns showing their next note each time the camera flashes.`),
        list('heroCloudRight', 'Right cloud notes', 'real voices only\nmade for the feed\none more take', ONE_PER_LINE),
      ]),
      {
        id: 'feature',
        title: 'Intro feature',
        fields: [
          t('featureLine1', 'Headline line 1 (dark)', 'Meet our'),
          t('featureLine2', 'Headline line 2 (white)', 'Creators'),
          t('featureLine3', 'Headline line 3 (dark)', 'In action'),
          ...numbered([1, 2, 3, 4, 5, 6], (_, n) => [
            link(`featureVideo${n}`, `Video card ${n} · video URL`, '', 'Direct link to an .mp4 file. Plays muted on a loop.'),
            img(`featurePoster${n}`, `Video card ${n} · poster image`, '', 'Leave empty to use a default stock photo.'),
          ]),
          t('featureSeeMore', 'See more button text', 'See more'),
          link('featureSeeMoreUrl', 'See more button link', '/portfolio'),
        ],
      },
      {
        id: 'gallery',
        title: 'Talent gallery',
        description: 'Gallery photos come from the Creators list below.',
        fields: [
          t('galleryEyebrow', 'Eyebrow label', 'Creator Bench in Motion'),
          t('galleryTitle', 'Heading', 'The Faces Behind Scaled Accounts'),
          t('galleryText', 'Supporting text', 'Scroll through our multi-column parallax talent gallery.'),
        ],
      },
      {
        id: 'types',
        title: 'Creator types (blue band)',
        fields: [
          t('typesEyebrow', 'Eyebrow label', 'Who we cast'),
          t('typesTitle', 'Heading', 'Three voices'),
          t('typesHighlight', 'Heading highlight', 'One brief'),
          long('typesIntro', 'Intro text', 'Every campaign needs attention, belief, and a reason to buy. We cast creators for each job, so the content does all three.'),
          t('type1Tag', 'Type 1 · tag', 'Attention'),
          t('type1Title', 'Type 1 · title', 'The Hook'),
          long('type1Text', 'Type 1 · text', 'Creators who know how to stop the scroll in the first two seconds.'),
          t('type2Tag', 'Type 2 · tag', 'Belief'),
          t('type2Title', 'Type 2 · title', 'The Trust'),
          long('type2Text', 'Type 2 · text', 'Authentic voices with genuine relationships to their audiences.'),
          t('type3Tag', 'Type 3 · tag', 'Desire'),
          t('type3Title', 'Type 3 · title', 'The Proof'),
          long('type3Text', 'Type 3 · text', 'Creative minds who make your product look organic, lived-in, and irresistible.'),
        ],
      },
    ],
  },
  {
    id: 'blog',
    label: 'Blog',
    route: '/blog',
    blurb: 'Journal articles and the dispatch sign-up band.',
    collections: ['blog'],
    sections: [
      {
        id: 'hero',
        title: 'Hero banner (masthead)',
        description: 'The magazine-style masthead at the top of the Blog. The "In this issue" list shows the first three posts from the Blog list.',
        fields: [
          t('journalName', 'Masthead name (top left)', 'The CLYX Journal'),
          t('journalCadence', 'Masthead note (top right)', 'New notes every week'),
          t('journalEyebrow', 'Eyebrow label', 'Field notes'),
          t('journalTitle', 'Title (first line)', 'Straight from'),
          t('journalHighlight', 'Title highlight (black box)', 'the feed.'),
          long('journalIntro', 'Intro paragraph', 'What we learn running creator ads, testing hooks and building pages that convert, written down while it is still fresh.'),
          t('journalIndexLabel', '"In this issue" heading', 'In this issue'),
          t('journalIndexButton', 'Button under the list', 'Browse all articles'),
          list('journalTopics', 'Scrolling topics strip', 'Creator culture, Performance creative, Hook rate, Conversion, Landing pages, Testing loops, Creator briefs, Scaling', 'Comma separated.'),
        ],
      },
      {
        id: 'article',
        title: 'Article page',
        description: 'Shared layout shown around every article on the Blog.',
        fields: [
          t('articleBackLabel', '"Back" link text', 'All articles'),
          t('articleByline', 'Byline under the title', 'CLYX Media · Journal'),
          t('articleTocLabel', 'Table-of-contents label', 'On this page'),
          t('articleCtaTitle', 'Sidebar card · title', 'Want this working for your brand?'),
          long('articleCtaText', 'Sidebar card · text', 'We run the creator ads, the testing loop and the pages that convert.'),
          t('articleCtaButton', 'Sidebar card · button text', 'Talk to CLYX'),
          link('articleCtaUrl', 'Sidebar card · button link', '/contact'),
          t('articleMoreTitle', '"Keep reading" heading', 'Keep reading'),
        ],
      },
      {
        id: 'dispatch',
        title: 'Dispatch band (blue)',
        fields: [
          t('dispatchLabel', 'Label', 'The CLYX dispatch'),
          t('dispatchTitle', 'Heading', 'Keep your edge.'),
          t('dispatchIntro', 'Intro', 'One sharp read every fortnight on creator ads, performance creative and what is actually working in the feed.'),
          t('dispatchPerk1', 'Chip 1', 'Every fortnight'),
          t('dispatchPerk2', 'Chip 2', '5-min read'),
          t('dispatchPerk3', 'Chip 3', 'Zero fluff'),
          t('dispatchLatest', 'Latest-post card label', 'Latest issue', 'The card shows the first post from the Blog list.'),
          t('dispatchButton', 'Button text', 'Subscribe to the dispatch'),
          link('dispatchUrl', 'Button link', '/contact'),
        ],
      },
    ],
  },
  {
    id: 'careers',
    label: 'Careers',
    route: '/careers',
    blurb: 'How the team works, open roles and the courses teaser with its “View courses” button.',
    collections: ['careers'],
    sections: [
      pageHero('Careers', 'Come build', 'the next edge.', null),
      {
        id: 'heroCard',
        title: 'Hero card',
        description: 'The yellow card on the right of the hero.',
        fields: [
          t('heroCardTitle', 'Title', 'We’re hiring'),
          long('heroCardText', 'Text', 'Small team, real ownership. Pick a seat and ship work that moves numbers.'),
          t('heroCardTags', 'Chips (comma separated)', 'Remote, Onsite, Full-time'),
        ],
      },
      {
        id: 'how',
        title: 'How we work',
        fields: [
          t('howLabel', 'Label', 'How we work'),
          t('howTitle', 'Heading', 'Small team'),
          t('howHighlight', 'Heading highlight', 'Big responsibility'),
          long('howText1', 'Paragraph 1', 'You will work close to founders, creators, and the numbers. You will see the idea through from first brief to final result.'),
          long('howText2', 'Paragraph 2', 'We care about taste, pace, candour, and doing the version that is difficult to fake.'),
          t('howPoints', 'Chips (comma separated)', 'Direct founder access, Ownership from day one, Taste over templates'),
          t('howFlow', 'Brief-to-result steps (comma separated)', 'Brief, Create, Launch, Result'),
        ],
      },
      {
        id: 'roles',
        title: 'Open roles band',
        description: 'Roles are managed in the Careers list below.',
        fields: [
          t('rolesLabel', 'Label', 'Open roles'),
          t('rolesTitle', 'Heading', 'Find your seat'),
          t('rolesHighlight', 'Heading highlight', 'at the table.'),
          long('rolesNote', 'Footer note', 'Don’t see your role? Send us the work you are proudest of anyway.'),
          t('rolesNoteLink', 'Footer link text', 'Get in touch'),
          link('applyUrl', 'Footer link (Get in touch)', 'mailto:hr@clyxmedia.com?subject=Careers'),
          t('rolesDescButton', '"See description" button (on each card)', 'See description'),
          t('rolesDescLabel', 'Label (description popup)', 'About the role'),
          t('rolesDescApply', 'Apply button (description popup)', 'Apply for this role'),
        ],
      },
      {
        id: 'roleDetails',
        title: 'Role popup headings',
        description: 'Headings in the "See description" popup. A heading only shows when that role has the matching detail filled in.',
        fields: [
          t('rolesDeptLabel', 'Team / department', 'Team'),
          t('rolesExpLabel', 'Experience', 'Experience'),
          t('rolesSalaryLabel', 'Salary / pay', 'Salary'),
          t('rolesOpeningsLabel', 'Openings', 'Openings'),
          t('rolesApplyByLabel', 'Apply by', 'Apply by'),
          t('rolesAboutTitle', 'About the role', 'About the role'),
          t('rolesDutiesTitle', 'What you will do', 'What you’ll do'),
          t('rolesReqTitle', 'What we are looking for', 'What we’re looking for'),
          t('rolesNiceTitle', 'Nice to have', 'Nice to have'),
          t('rolesPerksTitle', 'Perks', 'What you get'),
          t('rolesSkillsTitle', 'Skills', 'Skills'),
        ],
      },
      {
        id: 'apply',
        title: 'Apply dialog',
        description: 'The form that opens when a visitor picks a role or applies with no specific role in mind.',
        fields: [
          t('applyEyebrow', 'Label (form)', 'Apply now'),
          t('applySentEyebrow', 'Label (after sending)', 'Application sent'),
          t('applySentTitle', 'Title (after sending)', 'Thanks, we got it.'),
          long('applyIntroText', 'Intro text (form)', 'Share a few details and your resume. It goes straight to our hiring team.'),
          long('applySentText', 'Text (after sending)', 'Your resume is with our hiring team. If it is a fit, we will reach out on the email you shared.'),
          t('applyDoneButton', '"Done" button (after sending)', 'Done'),
          t('applyNameLabel', 'Name · label', 'Full name *'),
          t('applyNamePlaceholder', 'Name · placeholder', 'Your name'),
          t('applyEmailLabel', 'Email · label', 'Email *'),
          t('applyEmailPlaceholder', 'Email · placeholder', 'you@email.com'),
          t('applyPhoneLabel', 'Phone · label', 'Phone'),
          t('applyPhonePlaceholder', 'Phone · placeholder', '+91 98xxx xxxxx'),
          t('applyRoleLabel', 'Role · label', 'Role *'),
          t('applyResumeLabel', 'Resume · label', 'Resume *'),
          t('applyDropText', 'Resume drop-zone text', 'Drop your resume here or browse'),
          t('applyResumeHint', 'Resume drop-zone hint', 'PDF, DOC or DOCX · up to 5 MB'),
          t('applyNoteLabel', 'Note · label', 'Anything else?'),
          t('applyNoteHint', 'Note · hint (in brackets)', 'portfolio link, notice period…'),
          t('applySubmitText', 'Submit button', 'Submit application'),
          t('applySendingText', 'Submit button (while sending)', 'Sending…'),
          t('applyResumeTypeError', 'Error · wrong file type', 'Resume must be a PDF, DOC or DOCX file.'),
          t('applyResumeSizeError', 'Error · file too large', 'Resume is larger than 5 MB.'),
          t('applyResumeRequiredError', 'Error · no resume attached', 'Please attach your resume.'),
          t('applyGenericError', 'Error · server rejected it', 'Could not send your application. Please try again.'),
          t('applyNetworkError', 'Error · network/connection failed', 'Network error. Please check your connection and try again.'),
        ],
      },
      {
        id: 'learn',
        title: 'Courses teaser (two cards)',
        description: 'The last section of the Careers page: a large card with the heading and the button to the Courses page, and a side card listing three points.',
        fields: [
          t('learnLabel', 'Label', 'Learn with CLYX'),
          t('learnTitle', 'Heading', 'Learn the way'),
          t('learnHighlight', 'Heading highlight', 'we actually work'),
          long('learnIntro', 'Intro', 'Not theory from a slide deck. Our courses are taught live by the people who run creator ads and performance campaigns every single day.'),
          t('learn1', 'Point 1', 'Learn it live.'),
          long('learn1Text', 'Point 1 · text', 'Private live classes on YouTube with the CLYX team. Ask questions in the moment, rewatch the recording later.'),
          t('learn2', 'Point 2', 'Do the real work.'),
          long('learn2Text', 'Point 2 · text', 'Hooks, scripts, ad setups and reports built the way we build them for brands. No toy examples.'),
          t('learn3', 'Point 3', 'Grow your career.'),
          long('learn3Text', 'Point 3 · text', 'Skills that agencies and brands hire for, at a price that is easy to say yes to. Join in minutes with UPI.'),
          t('learnButton', 'Button text', 'View courses', 'Leave empty to hide the button.'),
          link('learnButtonUrl', 'Button link', '/courses'),
        ],
      },
    ],
  },
  {
    id: 'courses',
    label: 'Courses',
    route: '/courses',
    blurb: 'The courses sales page: hero, course cards, curriculum, certificate, student videos, mentor, FAQ, the purchase chat, UPI payment and WhatsApp settings.',
    collections: ['courses'],
    sections: [
      {
        id: 'payment',
        title: 'Payment & WhatsApp settings',
        description: 'Used by the purchase chat. No payment gateway: buyers scan a UPI QR, then send their UTR / transaction ID. Orders show under "Course orders" in this admin.',
        fields: [
          t('upiId', 'Your UPI ID', 'metadixant@okicici', 'e.g. clyxmedia@okaxis. The chat draws a QR with the exact course price for this UPI ID. Leave empty to use the QR image below instead.'),
          t('upiName', 'Name shown in the UPI app', 'CLYX Media'),
          img('qrImage', 'QR image (only if no UPI ID above)', '', 'Your UPI app’s QR code. It cannot carry the amount, so buyers type it in themselves.'),
          t('whatsappNumber', 'WhatsApp number for course buyers', '919671430111', 'Country code + number, digits only, e.g. 919876543210. Buyers land in this chat after paying.'),
        ],
      },
      {
        id: 'hero',
        title: 'Hero banner',
        description: 'The top of the Courses page. Every “Enroll” button on the page opens the purchase chat.',
        fields: [
          t('heroTitle', 'Title (first line)', 'Learn from the team'),
          t('heroHighlight', 'Title highlight (lime second line)', 'that runs the ads.'),
          list('heroPoints', 'Points under the title', 'Hooks and scripts that stop the scroll\nRun ads the way real brands do\nTurn your skills into paid work', 'One per line. The icons (compass, growth arrow, money) follow the order.'),
          t('heroButton', 'Button', 'Enroll Now'),
          list('heroStats', 'Facts row', 'Classes | Live on YouTube\nPay with | UPI in minutes\nWatch on | Any device', PAIRS('Small label | value')),
          img('heroImage', 'Image in the arch', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=85'),
          t('heroBadge', 'Lime tag under the image', 'Live classes | Recordings included', 'Leave empty to hide it.'),
        ],
      },
      {
        id: 'problem',
        title: 'The problem',
        description: 'Cream section after the hero. Leave the heading and the points empty to hide it.',
        fields: [
          t('problemLabel', 'Label', 'The problem'),
          t('problemWord1', 'Heading line 1 · red word', 'STOP'),
          t('problemLine1', 'Heading line 1 · rest', 'Guessing,'),
          t('problemWord2', 'Heading line 2 · highlighted word', 'START'),
          t('problemLine2', 'Heading line 2 · rest', 'Scaling'),
          list('problemPoints', 'Questions', 'You boost posts but never know which ad actually sold?\nYour videos get views but hardly any sales or leads?\nYou don’t know how to brief creators or scale what works?', 'One question per line.'),
        ],
      },
      {
        id: 'list',
        title: 'Course cards',
        description: 'Courses themselves are managed in the Courses list below. Clicking a card opens its details popup.',
        fields: [
          t('listLabel', 'Label', 'The courses'),
          t('listTitle', 'Heading', 'Pick your'),
          t('listHighlight', 'Heading highlight (lime)', 'next skill.'),
          t('detailsButton', 'Card · details button', 'See more details'),
          t('cardBuyButton', 'Card · buy button (opens the purchase chat)', 'Buy now'),
          t('buyButton', '“Purchase” button (in the details popup)', 'Purchase this course'),
          t('listButton', 'Button under the cards', 'Enroll Now to Unlock', 'Leave empty to hide it.'),
          t('emptyText', 'Text when no course is live', 'New batches are on the way. Message us on WhatsApp to hear first.'),
        ],
      },
      {
        id: 'curriculum',
        title: 'Curriculum',
        description: 'Image on the left, modules that open on click on the right. Leave the modules empty to hide the section.',
        fields: [
          t('currLabel', 'Label', 'The curriculum'),
          t('currTitle', 'Heading', 'What you’ll actually learn?'),
          img('currImage', 'Image', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1000&q=85'),
          list(
            'currModules',
            'Modules',
            'Hooks That Stop the Scroll | Open with a line or a frame that earns the next 3 seconds, with examples from real ads.\nScripts & Creator Briefs | Turn one product into a script and a brief a creator can shoot without a call.\nShoot & Edit for Retention | Pacing, captions and pattern breaks that keep people watching to the offer.\nMeta Ads Setup Done Right | Account, pixel, events and a campaign structure that is easy to test.\nReading the Numbers | CTR, CPA and ROAS: what each one tells you and what to change next.\nTesting & Scaling Winners | Find the ads that work and grow them without breaking performance.',
            PAIRS('Module title | what it covers'),
          ),
          t('currMore', 'Red line under the modules', '…and a LOT more!'),
        ],
      },
      {
        id: 'certificate',
        title: 'Certificate',
        description: 'Leave the heading empty to hide the section. Without an image, a sample CLYX certificate is drawn from the fields below.',
        fields: [
          t('certLabel', 'Label', 'Proof of work'),
          t('certTitle', 'Heading', 'Get Certified'),
          list('certPoints', 'Points', 'Get a certificate that shows real skills\nShare it on your profiles\nAdd it to your resume and portfolio', 'One per line.'),
          t('certButton', 'Button', 'Enroll Now'),
          img('certImage', 'Certificate image (optional)', '', 'Upload your real certificate to replace the drawn sample.'),
          t('certHeading', 'Sample · title', 'Certificate'),
          t('certSubheading', 'Sample · subtitle', 'of completion'),
          t('certLead', 'Sample · small line', 'This is to certify that:'),
          t('certName', 'Sample · name', 'Your Name'),
          t('certBody', 'Sample · text', 'has successfully completed a CLYX course, taught live by the CLYX Media team.'),
          list('certSigners', 'Sample · signatures', 'Clyx | Course Lead @CLYXMedia\nClyx | Director @CLYXMedia', PAIRS('Signature | role')),
        ],
      },
      {
        id: 'testimonials',
        title: 'Student videos',
        description: 'Vertical video cards with a play button. Hidden until you add at least one video.',
        fields: [
          t('testLabel', 'Label', 'Students'),
          t('testTitle', 'Heading', 'Testimonials'),
          list('testimonials', 'Videos', '', 'One per line, written as: Name | video link | cover image link. YouTube / Shorts links and .mp4 files play on the page; a YouTube video gets its cover automatically.'),
        ],
      },
      {
        id: 'brands',
        title: 'Brands strip',
        description: 'Scrolling row of white logo tiles above the mentor. Hidden until you add a brand.',
        fields: [
          t('brandsLabel', 'Label', 'Brands we have worked with'),
          list('brands', 'Brands', '', 'One per line, written as: Brand name | logo image link. Without a logo the name is shown.'),
        ],
      },
      {
        id: 'mentor',
        title: 'Mentor',
        description: 'Leave the heading empty to hide the section.',
        fields: [
          t('mentorLabel', 'Label', 'Your mentor'),
          t('mentorTitle', 'Heading', 'Meet your Mentors'),
          img('mentorImage', 'Photo', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=85'),
          t('mentorTag', 'Lime tag on the photo', 'The team behind the ads'),
          t('mentorName', 'Name on the photo', 'The CLYX Team'),
          t('mentorRole', 'Role on the photo', 'Course leads, CLYX Media'),
          long('mentorBio', 'Bio', 'The CLYX team runs **creator whitelisting and performance campaigns** for D2C brands every day: Meta and Google ads, content, and the systems that make growth repeatable.\n\nEvery class is taught by the people who **plan, shoot and scale** those campaigns, so you learn what is working right now, not what worked years ago.', 'Leave a blank line between paragraphs. Wrap words in **double asterisks** to make them bold.'),
          list('mentorStats', 'Numbers row', '', 'One per line, written as: platform | number | label, e.g. instagram | 4.6M+ | Followers. Platforms with an icon: youtube, instagram, facebook, linkedin, x.'),
        ],
      },
      {
        id: 'faq',
        title: 'FAQ',
        fields: [
          t('faqLabel', 'Label', 'Questions'),
          list('faqTitle', 'Heading', 'Frequently\nAsked Questions', 'Each line is a line of the heading.'),
          list(
            'faqs',
            'Questions',
            'Is this course the right fit for me? | If you are starting out in content, ads or marketing, or you run a small brand and want to do it yourself, yes. Each course lists its level in its details.\nHow are the classes taught? | Live, in private YouTube sessions with the CLYX team. You can ask questions in the live chat as we go.\nWill I get the recordings? | Yes. Recordings are shared so you can rewatch any class.\nHow do I pay? | Tap Enroll Now, pick your course and scan the UPI QR in the chat with any UPI app. No card needed.\nWhen will I get my class link? | Once you share your UTR / transaction ID, our team verifies the payment and sends your link on WhatsApp.\nDo I need a laptop? | No. You can join on your phone, tablet or laptop.\nWhat if I have more questions? | Message us on WhatsApp and the team will help you before you buy.',
            PAIRS('Question | answer'),
          ),
        ],
      },
      {
        id: 'cta',
        title: 'Closing lime band',
        description: 'Leave the heading empty to hide it.',
        fields: [
          t('ctaTitle', 'Heading', 'Start your ads journey today.'),
          t('ctaText', 'Text', 'Stop waiting for the “perfect moment”. It’s never coming.'),
          t('ctaButton', 'Button', 'Enroll Now'),
          t('ctaMeta', 'Small line under the button', 'Live classes · Recordings · Pay by UPI'),
        ],
      },
      {
        id: 'bar',
        title: 'Enroll bar (pinned to the bottom)',
        description: 'Slides up once the visitor scrolls past the hero. Leave the button empty to turn it off.',
        fields: [
          t('barTitle', 'Title', '', 'Leave empty to use the first course’s title.'),
          t('barMeta', 'Small line', 'Live classes · Enroll now'),
          img('barImage', 'Image', '', 'Leave empty to use the first course’s image.'),
          t('barButton', 'Button', 'Enroll Now'),
        ],
      },
      {
        id: 'footer',
        title: 'Footer',
        description: 'The slim footer of this page. The email address comes from Header & Footer → “Big email address”.',
        fields: [t('footerText', 'Text before the email', 'Got a question? Please reach us at')],
      },
      {
        id: 'details',
        title: 'Course details popup',
        fields: [
          t('detailsLabel', 'Label', 'Course details'),
          t('detailsDuration', 'Duration heading', 'Duration'),
          t('detailsLevel', 'Level heading', 'Level'),
          t('detailsFormat', 'Format heading', 'Format'),
          t('detailsSchedule', 'Schedule heading', 'Schedule'),
          t('detailsLearn', '“What you will learn” heading', 'What you’ll learn'),
          t('detailsIncludes', '“What you get” heading', 'What you get'),
          t('detailsAbout', 'About heading', 'About this course'),
        ],
      },
      {
        id: 'chat',
        title: 'Purchase chat',
        description: 'The chat that slides in from the right after “Purchase”. {name}, {course}, {amount} and {utr} are filled in for each buyer. The order ID is never shown to buyers; it is saved with the order (see Course orders).',
        fields: [
          t('chatTitle', 'Chat name', 'CLYX Courses'),
          t('chatStatus', 'Status under the name', 'Online · replies instantly'),
          t('chatHello', 'Message 1', 'Hi there 👋 Welcome to CLYX Courses.'),
          t('chatAskName', 'Ask for name', 'What’s your name?'),
          t('chatWelcome', 'Welcome', 'Great to meet you, {name}! 🎉'),
          t('chatWelcomeBack', 'Welcome back (returning buyer)', 'Welcome back, {name}! 👋'),
          t('chatAskCourse', 'Ask for the course', 'Which course would you like to join?'),
          t('chatPicked', 'Tag on the course they clicked', 'You picked this'),
          t('chatPay', 'Payment message', 'Scan this QR code and pay {amount} for {course}.'),
          t('chatPayMobile', 'Payment hint', 'On your phone? Tap “Pay with UPI app”, or take a screenshot of the QR and open it from your UPI app.'),
          t('chatAskUtr', 'Ask for payment details', 'Once you have paid, send your payment details here: the 12-digit UTR / UPI transaction ID from your UPI app.'),
          t('chatAskPhone', 'Ask for WhatsApp number', 'Got it ✅ Last step: your WhatsApp number, so our team can reach you.'),
          t('chatSaving', 'While saving', 'Saving your details…'),
          t('chatSaved', 'Saved', 'Thanks, {name}! Your payment details are saved.'),
          t('chatDone', 'Final message', 'For the link to your course, connect with us on WhatsApp. Our team will verify your payment and send your class link there.'),
          t('chatWhatsappButton', 'WhatsApp button', 'Connect on WhatsApp'),
          long('chatWhatsappMessage', 'Prefilled WhatsApp message', 'Hi CLYX! I have paid for {course}.\nName: {name}\nAmount: {amount}\nUTR / Transaction ID: {utr}\nPlease share my course link.'),
          t('chatNoPayment', 'When no UPI ID or QR is set', 'Online payment is being set up right now. Connect with us on WhatsApp and our team will help you pay and join.'),
          t('chatSaveError', 'When saving fails', 'We could not save your details just now, but your payment is safe. Send them to us on WhatsApp and the team will take it from here.'),
          t('chatDuplicate', 'When the UTR was already used', 'This UTR / transaction ID has already been submitted. Please check it in your UPI app and send it again.'),
          t('chatBadName', 'Name too short', 'Please type your name (at least 2 letters).'),
          t('chatBadUtrLength', 'UTR is not 12 digits', 'The UTR / UPI transaction ID must be exactly 12 digits. Please copy it from your UPI app and send it again.'),
          t('chatBadPhone', 'Phone looks wrong', 'Please enter a valid WhatsApp number, e.g. 98765 43210.'),
          t('chatNamePlaceholder', 'Input · name', 'Type your name…'),
          t('chatUtrPlaceholder', 'Input · UTR', '12-digit UTR / transaction ID'),
          t('chatPhonePlaceholder', 'Input · phone', 'WhatsApp number'),
          t('chatPickHint', 'Input · while picking a course', 'Pick a course above'),
          t('chatPayButton', '“Pay with UPI app” button', 'Pay with UPI app'),
          t('chatChange', '“Change course” button', 'Change course'),
          t('chatRestart', '“New purchase” button', 'Buy another course'),
          t('chatRetry', '“Try again” button', 'Try again'),
        ],
      },
    ],
  },
  {
    id: 'contact',
    label: 'Contact',
    route: '/contact',
    blurb: 'Contact details, enquiry form and the three-step band.',
    collections: [],
    sections: [
      pageHero('Contact', 'Let’s make', 'something move.', 'Tell us what you are building, what is stuck, and where you want to go next. We will get back to you with a sharper point of view.'),
      {
        id: 'details',
        title: 'Contact details',
        fields: [
          t('detailsLabel', 'Label', 'Start a conversation'),
          t('email', 'Email address', 'work@clyxmedia.com'),
          t('whatsappLabel', 'WhatsApp label', 'WhatsApp'),
          link('whatsappUrl', 'WhatsApp link', 'https://wa.me/919876543210'),
          t('calendlyLabel', 'Booking label', 'Calendly'),
          link('calendlyUrl', 'Booking link', '#contact-form'),
        ],
      },
      {
        id: 'form',
        title: 'Enquiry form',
        fields: [
          t('formNameLabel', 'Name box label', 'Your name'),
          t('formName', 'Name box placeholder', 'Your name'),
          t('formEmailLabel', 'Email box label', 'Email'),
          t('formEmail', 'Email box placeholder', 'Work email'),
          t('formCompanyLabel', 'Company box label', 'Company / brand (optional)'),
          t('formCompany', 'Company box placeholder', 'Company / brand'),
          t('formMessageLabel', 'Message box label', 'Your message'),
          t('formMessage', 'Message box placeholder', 'What are you trying to move?'),
          t('formButton', 'Button text', 'Send enquiry'),
          t('formSending', 'Button text while sending', 'Sending…'),
          t('formSent', 'Label above the thank-you message', 'Message sent'),
          t('formSentTitle', 'Thank-you heading', 'Thanks, we have your message.'),
          long('formSentText', 'Thank-you text', 'Our team reads every enquiry and will reply to your email within one working day.'),
          t('formSendAnother', 'Send-another button text', 'Send another message'),
          t('formError', 'Error when sending fails', 'Could not send your message. Please try again or email us directly.'),
          t('formNetworkError', 'Error when offline', 'Could not reach our server. Check your connection and try again, or email us directly.'),
        ],
      },
      {
        id: 'steps',
        title: 'Three-step band (yellow)',
        fields: [t('step1', 'Step 1', 'Clear brief.'), t('step2', 'Step 2', 'Sharp thinking.'), t('step3', 'Step 3', 'Real movement.')],
      },
    ],
  },
];

export const pageById = (id: PageId) => PAGES.find((p) => p.id === id)!;

/** The block a section saves to. */
export const sectionBlock = (page: PageDef, section: SectionDef) => section.block ?? `page_${page.id}`;

const defaultsCache = new Map<PageId, Record<string, string>>();

/**
 * Built-in copy for one page, keyed by field. Built once per page and shared (sections use it as a default prop
 * on every render), so treat the result as read-only.
 */
export function pageDefaults(id: PageId): Record<string, string> {
  let out = defaultsCache.get(id);
  if (out) return out;
  out = {};
  const page = pageById(id);
  for (const section of page.sections) {
    if (sectionBlock(page, section) !== `page_${id}`) continue;
    for (const field of section.fields) out[field.key] = field.default;
  }
  defaultsCache.set(id, out);
  return out;
}

/** Built-in copy of one section, e.g. the homepage hero that saves to its own block. */
export function sectionDefaults(pageId: PageId, sectionId: string): Record<string, string> {
  const section = pageById(pageId).sections.find((s) => s.id === sectionId);
  return Object.fromEntries((section?.fields ?? []).map((field) => [field.key, field.default]));
}

/** The page's copy: what the admin saved, and the built-in text for anything never saved. */
export function usePageContent(id: PageId): Record<string, string> {
  const saved = useBlockData(`page_${id}`);
  // Same object until the saved copy changes, so sections receiving it do not redo work on unrelated renders.
  return useMemo(() => {
    const out = { ...pageDefaults(id) };
    for (const [key, value] of Object.entries(saved ?? {})) if (typeof value === 'string') out[key] = value;
    return out;
  }, [id, saved]);
}

/** Non-empty trimmed lines of a multi-line field. */
export const splitLines = (text: string | undefined) => (text ?? '').split('\n').map((s) => s.trim()).filter(Boolean);

/** Only links a visitor can safely follow; anything else (e.g. javascript:) becomes "#". */
export const safeHref = (href: string | undefined) => {
  const value = (href ?? '').trim();
  return /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(value) ? value : '#';
};

export const isExternalHref = (href: string) => /^https?:\/\//i.test(href);

/** A "Links" field ("Label | link" per line) as { label, href } pairs. A line without "|" links to nothing. */
export function parseLinks(text: string | undefined): { label: string; href: string }[] {
  return splitLines(text).map((line) => {
    const bar = line.indexOf('|');
    if (bar === -1) return { label: line, href: '#' };
    return { label: line.slice(0, bar).trim(), href: safeHref(line.slice(bar + 1)) };
  });
}

/** A "Title | text" per line field as [title, text] pairs. A line without "|" is a title with no text. */
export function parsePairs(text: string | undefined): [string, string][] {
  return splitLines(text).map((line) => {
    const bar = line.indexOf('|');
    return bar === -1 ? [line, ''] : [line.slice(0, bar).trim(), line.slice(bar + 1).trim()];
  });
}

/**
 * The six services as edited on the Services page. `iconKey` is the original name, so a renamed service keeps its icon.
 * Used by the homepage services book, the Services page list, the Services hero cards and each service's own page.
 */
export function useServices() {
  const c = usePageContent('services');
  return useMemo(
    () =>
      services.map((s, i) => {
        const n = i + 1;
        return {
          iconKey: s.title,
          index: s.index,
          title: c[`service${n}Title`] || s.title,
          text: c[`service${n}Text`] ?? s.text,
          points: splitLines(c[`service${n}Points`]),
          short: c[`service${n}Short`] || c[`service${n}Title`] || s.short,
          line: c[`service${n}Line`] ?? s.line,
          tags: (c[`service${n}Tags`] ?? '').split(',').map((tag) => tag.trim()).filter(Boolean),
          slug: s.slug,
          overview: c[`service${n}Overview`] ?? s.overview,
          process: parsePairs(c[`service${n}Process`]).map(([title, text]) => ({ title, text })),
          faqs: parsePairs(c[`service${n}Faqs`]).map(([question, answer]) => ({ question, answer })),
        };
      }),
    [c],
  );
}

export type ServiceContent = ReturnType<typeof useServices>[number];

/** The services as laid out in the homepage book: the shared service copy plus the book-only fields of each chapter. */
export function useServiceBook(footerHint: string) {
  const items = useServices();
  const c = usePageContent('services');
  return useMemo(
    () =>
      items.map((service, i) => {
        const n = i + 1;
        return {
          ...service,
          icon: c[`book${n}Icon`] || service.iconKey,
          iconImage: c[`book${n}IconImage`] || '',
          number: c[`book${n}Number`] || pad2(n),
          leftFolio: c[`book${n}LeftFolio`] ?? String(n * 2),
          rightFolio: c[`book${n}RightFolio`] ?? String(n * 2 + 1),
          footer: c[`book${n}Footer`] || footerHint,
        };
      }),
    [items, c, footerHint],
  );
}

export type BookChapter = ReturnType<typeof useServiceBook>[number];
