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
export type FieldType = 'text' | 'textarea' | 'image' | 'url';
export type FieldDef = { key: string; label: string; type?: FieldType; default: string; hint?: string };
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
  | 'portfolio';
export type PageId = 'global' | 'home' | 'about' | 'services' | 'portfolio' | 'caseStudies' | 'creators' | 'blog' | 'careers' | 'contact';
export type PageDef = {
  id: PageId;
  label: string;
  route: string;
  blurb: string;
  sections: SectionDef[];
  collections: CollectionName[];
};

const t = (key: string, label: string, value: string, hint?: string): FieldDef => ({ key, label, default: value, hint });
const long = (key: string, label: string, value: string, hint?: string): FieldDef => ({ key, label, type: 'textarea', default: value, hint });
const img = (key: string, label: string, value: string, hint?: string): FieldDef => ({ key, label, type: 'image', default: value, hint });
const link = (key: string, label: string, value: string, hint?: string): FieldDef => ({ key, label, type: 'url', default: value, hint });

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
      long(`service${n}Points`, '“What’s included” points (homepage book and service page)', s.points.join('\n'), ONE_PER_LINE),
      t(`service${n}Short`, 'Short name (Services hero tab)', s.short),
      t(`service${n}Line`, 'One-liner (Services hero card and service page)', s.line),
      t(`service${n}Tags`, 'Tags (Services hero card and service page)', s.tags.join(', '), 'Separate with commas.'),
      long(`service${n}Overview`, 'Service page · overview', s.overview),
      long(`service${n}Process`, 'Service page · how it works', s.process.map(([title, text]) => `${title} | ${text}`).join('\n'), PAIRS('Step title | step text')),
      long(`service${n}Faqs`, 'Service page · FAQs', s.faqs.map(([q, a]) => `${q} | ${a}`).join('\n'), PAIRS('Question | answer')),
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
          long('navLinks', 'Menu links', 'Home | /\nAbout | /about\nServices | /services\nPortfolio | /portfolio\nCase Studies | /case-studies\nCreators | /creators\nBlog | /blog\nCareers | /careers', LINKS),
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
          long('footerCol1Links', 'Column 1 · links', 'About | /about\nCreators | /creators\nCareers | /careers', LINKS),
          t('footerCol2Title', 'Column 2 · heading', 'Work'),
          long('footerCol2Links', 'Column 2 · links', 'Services | /services\nPortfolio | /portfolio\nCase studies | /case-studies', LINKS),
          t('footerCol3Title', 'Column 3 · heading', 'Contact'),
          long('footerCol3Links', 'Column 3 · links', 'work@clyxmedia.com | mailto:work@clyxmedia.com\nWhatsApp | https://wa.me/919671430111\nCalendly | /contact#contact-form', LINKS),
        ],
      },
      {
        id: 'footerBottom',
        title: 'Footer · bottom bar',
        fields: [
          t('footerCopyright', 'Copyright text', 'CLYX Media. All rights reserved.', '“© <current year>” is added in front automatically.'),
          long('footerLegalLinks', 'Small links', 'Privacy | /privacy\nTerms | /terms\nAdmin | /admin', LINKS),
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
          long('heroRotating', 'Phrases', 'winning ads.\nrevenue engines.\nloyal customers.\nreal growth.', `${ONE_PER_LINE} Leave empty to turn the typing effect off.`),
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
          long('marqueeItems', 'Marquee items', '50+ D2C BRANDS SCALED\n₹45CR+ AD SPEND MANAGED\n3.4X AVG ROAS LIFT\n250+ CREATORS IN NETWORK\nCREATOR WHITELISTING ENGINE', 'One item per line.'),
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
          long('dashChartDays', 'Chart · day labels', 'Mon\nTue\nWed\nThu\nFri\nSat\nSun', ONE_PER_LINE),
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
        description: 'The six services themselves (names, descriptions, “What’s included” points) are edited on the Services page.',
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
      {
        id: 'methodology',
        title: 'Methodology',
        fields: [
          t('howEyebrow', 'Eyebrow label', 'The CLYX Methodology'),
          long('howTitle', 'Heading', "A one-off post doesn't sell.\nA whitelisted ad, run on data, does.", LINES),
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
          link('ctaSecondaryUrl', 'Secondary button link', 'mailto:hello@clyxmedia.com?subject=Growth Consultation - CLYX Media'),
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
          long('heroPillars', 'Hanging cards (right side)', 'Creator instinct | Ideas that feel native to the feed\nPaid distribution | Media that finds the right people\nRepeatable systems | Testing loops that turn wins into process', 'Up to three cards, one per line, written as: Title | short line.'),
        ],
      },
      {
        id: 'intro',
        title: 'Intro statement',
        fields: [
          t('introLabel', 'Label', 'Built for the brave'),
          long('introTitle', 'Heading', 'The ad should feel like culture. The result should feel like math.'),
          long('introText', 'Body text', 'Most agencies choose between creative and performance. We do not. CLYX connects the instinct that makes people stop with the systems that make brands grow.'),
        ],
      },
      {
        id: 'values',
        title: 'Principles band (yellow)',
        fields: [
          t('valuesEyebrow', 'Eyebrow label', 'How we work'),
          long('valuesTitle', 'Heading', 'Three principles.\nZero fluff.', LINES),
          long('valuesIntro', 'Intro text', 'The rules every brief, creative and campaign at CLYX runs on, from the first call to the tenth scaled ad.'),
          t('value1Tag', 'Card 1 · tag', 'How we talk'),
          t('value1Title', 'Card 1 · title', 'Directness'),
          long('value1Text', 'Card 1 · text', 'Senior partners, clear thinking, no unnecessary layers.'),
          t('value2Tag', 'Card 2 · tag', 'How we create'),
          t('value2Title', 'Card 2 · title', 'Instinct'),
          long('value2Text', 'Card 2 · text', 'Creative that earns attention before it asks for action.'),
          t('value3Tag', 'Card 3 · tag', 'How we scale'),
          t('value3Title', 'Card 3 · title', 'Iteration'),
          long('value3Text', 'Card 3 · text', 'Every winning hook becomes a system, not a one-off.'),
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
          long('opCore', 'Loop centre text', 'Growth\ncompounds', LINES),
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
          t('chatHeaderText', 'Name shown above the status', '{name} from CLYX', '{name} becomes the first name of the first team member.'),
          t('chatStatus', 'Status under the name', 'Usually replies same day'),
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
          long('heroWords', 'Rotating words (yellow second line)', 'sells\nscales\nconverts\nsticks', ONE_PER_LINE),
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
          long('ctaIncludes', 'Checklist items', 'The brief & starting numbers\nCreative that moved the metric\nSpend, ROAS & next steps', ONE_PER_LINE),
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
          long('patternTitle', 'Heading', 'Find the signal\nScale the signal', LINES),
          long('patternText', 'Body text', 'The best results rarely come from one perfect post. They come from building a system that knows what to keep, what to cut, and what to try next.'),
          t('patternStep1Tag', 'Card 1 · tag', 'Keep'),
          t('patternStep1Title', 'Card 1 · title', 'Double down on what holds.'),
          long('patternStep1Text', 'Card 1 · text', 'Hooks that stop the scroll and convert cheaply earn more budget, fast.'),
          t('patternStep2Tag', 'Card 2 · tag', 'Cut'),
          t('patternStep2Title', 'Card 2 · title', 'Retire what stalls.'),
          long('patternStep2Text', 'Card 2 · text', 'Creative that loses attention in the first seconds stops spending money.'),
          t('patternStep3Tag', 'Card 3 · tag', 'Try next'),
          t('patternStep3Title', 'Card 3 · title', 'Seed the next angle.'),
          long('patternStep3Text', 'Card 3 · text', 'Every winner spins off new variations, so the testing pipeline never runs dry.'),
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
        long('heroCloudLeft', 'Left cloud notes', 'say cheese!\nhold that pose…\nthat’s the one!', `${ONE_PER_LINE} The two clouds take turns showing their next note each time the camera flashes.`),
        long('heroCloudRight', 'Right cloud notes', 'real voices only\nmade for the feed\none more take', ONE_PER_LINE),
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
          long('journalTopics', 'Scrolling topics strip', 'Creator culture, Performance creative, Hook rate, Conversion, Landing pages, Testing loops, Creator briefs, Scaling', 'Comma separated.'),
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
    blurb: 'How the team works, open roles and the three team values.',
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
          link('applyUrl', 'Footer link (Get in touch)', 'mailto:work@clyxmedia.com?subject=Careers'),
          t('rolesDescButton', '"See description" button (on each card)', 'See description'),
          t('rolesDescLabel', 'Label (description popup)', 'About the role'),
          t('rolesDescApply', 'Apply button (description popup)', 'Apply for this role'),
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
        id: 'values',
        title: 'Team values',
        fields: [
          t('valuesLabel', 'Label', 'What we value'),
          t('valuesTitle', 'Heading', 'Three rules we'),
          t('valuesHighlight', 'Heading highlight', 'actually live by'),
          long('valuesIntro', 'Intro', 'Not a poster on the wall. These are the standards we hire for, review against, and hold each other to every week.'),
          t('value1', 'Value 1', 'Do the work.'),
          long('value1Text', 'Value 1 · text', 'No shortcuts dressed up as strategy. We ship, measure, and let the results do the talking.'),
          t('value2', 'Value 2', 'Say the thing.'),
          long('value2Text', 'Value 2 · text', 'Candour over comfort. If an idea is weak or a number is off, we say it early and kindly.'),
          t('value3', 'Value 3', 'Make it better.'),
          long('value3Text', 'Value 3 · text', 'Every brief leaves sharper than it arrived. Good is the starting line, not the finish.'),
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
