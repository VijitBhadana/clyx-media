/**
 * Case studies: the cards on /case-studies and the full write-up on /case-studies/<slug>.
 * The cards themselves come from the CMS ("Case studies" in the admin); the long-form write-up for each brand
 * lives here, matched by the brand name's slug. A brand added in the admin without a write-up here still gets
 * a detail page, built from its card copy.
 */

export interface CaseStudyItem {
  id: string;
  slug: string;
  code: string;
  brand: string;
  category: string;
  headline: string;
  result: string;
  detail: string;
  src: string;
  alt: string;
  accent: string;
}

export interface CaseMetric {
  value: string;
  label: string;
  /** Short context line, e.g. "from 2.4x in month one". */
  note?: string;
}

export interface CaseStep {
  title: string;
  text: string;
}

export interface CaseStudyStory {
  /** Quick facts shown in the hero card. */
  facts: { label: string; value: string }[];
  services: string[];
  overview: string;
  challenge: string;
  painPoints: string[];
  goals: string[];
  strategy: CaseStep[];
  execution: string;
  executionPoints: string[];
  metrics: CaseMetric[];
  resultsSummary: string;
  quote?: { text: string; author: string };
  learnings: CaseStep[];
}

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');

export const defaultCaseStudies: CaseStudyItem[] = [
  {
    id: 'kulture-skin',
    slug: 'kulture-skin',
    code: '01',
    brand: 'Kulture Skin',
    category: 'Beauty / Creator commerce',
    headline: 'From organic proof to paid growth.',
    result: '3.4x ROAS',
    detail: 'A creator-led testing system that found the hooks worth scaling, then turned them into a repeatable paid engine.',
    src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1400&q=85',
    alt: 'Kulture Skin Campaign',
    accent: '#FFDE59',
  },
  {
    id: 'nova-nutrition',
    slug: 'nova-nutrition',
    code: '02',
    brand: 'Nova Nutrition',
    category: 'Food / Performance',
    headline: 'More signal. Less spend.',
    result: '42% lower CPA',
    detail: 'A creative refresh and landing-page loop built around clearer proof, sharper offers, and faster iteration.',
    src: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1400&q=85',
    alt: 'Nova Nutrition Campaign',
    accent: '#003AA3',
  },
  {
    id: 'mutha-beauty',
    slug: 'mutha-beauty',
    code: '03',
    brand: 'Mutha Beauty',
    category: 'Fashion / Social',
    headline: 'Make the feed feel like the brand.',
    result: '10M+ impressions',
    detail: 'A culture-first content system that kept the brand recognizable while expanding reach across paid channels.',
    src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=85',
    alt: 'Mutha Beauty Campaign',
    accent: '#FFDE59',
  },
  {
    id: 'orbit-labs',
    slug: 'orbit-labs',
    code: '04',
    brand: 'Orbit Labs',
    category: 'Tech / Conversion CRO',
    headline: 'Speed is a creative feature.',
    result: '+28% CVR lift',
    detail: 'Sub-second mobile checkout experiences and friction-free shopping architectures that capture lost demand.',
    src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=85',
    alt: 'Orbit Labs Campaign',
    accent: '#003AA3',
  },
];

export const caseStudyStories: Record<string, CaseStudyStory> = {
  'kulture-skin': {
    facts: [
      { label: 'Industry', value: 'D2C skincare' },
      { label: 'Market', value: 'India, metro-first' },
      { label: 'Engagement', value: '6 months' },
      { label: 'Channels', value: 'Meta, Instagram Reels, YouTube Shorts' },
    ],
    services: ['Creator sourcing', 'UGC production', 'Creator whitelisting', 'Paid social', 'Creative testing'],
    overview:
      'Kulture Skin had a loyal organic following and a handful of creator posts that clearly worked, but no way to turn that proof into predictable paid growth. We built a creator-led testing system that found which hooks actually sold, then scaled those winners through whitelisted ads.',
    challenge:
      'Organic creator content was driving sales, but every attempt to put money behind it produced inconsistent results. Polished brand ads underperformed, paid spend plateaued at a low daily budget, and the team could not tell which messages were doing the work.',
    painPoints: [
      'ROAS stuck around 1.6x on brand-produced creative',
      'No structured testing: new ads launched in batches with no clear learnings',
      'A small creator roster, so creative fatigued within two weeks',
      'Scaling spend beyond a fixed daily budget made results collapse',
    ],
    goals: [
      'Reach a sustainable 3x+ blended ROAS on paid social',
      'Build a creator pipeline that delivers fresh hooks every week',
      'Scale daily spend without losing efficiency',
    ],
    strategy: [
      { title: 'Audit the proof', text: 'We mapped every organic creator post against sales and saves to find the angles that already resonated: texture close-ups, before/after routines and honest "what I stopped using" confessions.' },
      { title: 'Build the roster', text: 'We onboarded 40+ micro-creators across skin types and cities, each briefed on one proven angle and three new ones to test.' },
      { title: 'Test hooks, not ads', text: 'Each week, 20–30 new hooks went live on a controlled testing budget. Only the first three seconds changed, so we learned what stopped the scroll.' },
      { title: 'Scale through whitelisting', text: 'Winning hooks were run from the creators’ own handles, borrowing their trust, then moved into scaling campaigns with broad targeting.' },
    ],
    execution:
      'The system ran on a weekly loop: brief on Monday, content in by Thursday, testing live by the weekend and results reviewed the following Monday. Creative that lost attention in the first seconds was switched off within 72 hours; winners were cut into new variations so the pipeline never ran dry.',
    executionPoints: [
      '180+ creator videos produced over six months',
      'Weekly hook tests with a fixed testing budget',
      'Whitelisted ads run from 25 creator handles',
      'Landing pages matched to each winning angle',
    ],
    metrics: [
      { value: '3.4x', label: 'Blended ROAS', note: 'up from 1.6x' },
      { value: '4.2x', label: 'Daily ad spend', note: 'scaled while holding ROAS' },
      { value: '-38%', label: 'Cost per purchase', note: 'across paid social' },
      { value: '2.3x', label: 'Hook rate', note: 'on creator vs brand creative' },
    ],
    resultsSummary:
      'By month three, creator-led whitelisted ads were outperforming brand creative on every metric. By month six, Kulture Skin was spending four times more per day at more than double the return, with a creative pipeline that no longer depended on a single hero ad.',
    quote: {
      text: 'We always knew our customers loved the product. CLYX showed us how to prove it at scale, and every week we know exactly which story to put money behind.',
      author: 'Founding team, Kulture Skin',
    },
    learnings: [
      { title: 'Organic is the brief', text: 'The best paid ads started as organic posts that already worked. Mining them first saved months of guessing.' },
      { title: 'Hooks carry the load', text: 'Changing only the first three seconds moved results more than any edit to the rest of the video.' },
      { title: 'Trust scales', text: 'Whitelisted creator ads kept efficiency as spend grew, where brand ads fell off quickly.' },
    ],
  },
  'nova-nutrition': {
    facts: [
      { label: 'Industry', value: 'Health food & supplements' },
      { label: 'Market', value: 'Pan-India, D2C' },
      { label: 'Engagement', value: '4 months' },
      { label: 'Channels', value: 'Meta, Google Search, landing pages' },
    ],
    services: ['Creative strategy', 'Performance marketing', 'Landing page CRO', 'Offer testing'],
    overview:
      'Nova Nutrition was spending more every month to acquire each customer. We rebuilt the creative around clearer proof and sharper offers, paired every ad with a matching landing page, and ran a fast iteration loop that cut cost per acquisition by 42%.',
    challenge:
      'Nova’s ads leaned on lifestyle imagery and generic health claims. Click-through was fine, but visitors bounced from a one-size-fits-all product page. As competitors crowded the same audiences, CPA kept climbing and margins were shrinking.',
    painPoints: [
      'CPA had risen roughly 60% over two quarters',
      'Ads and landing pages told different stories',
      'Offers were discount-led, which trained customers to wait for sales',
      'Creative refreshed monthly, too slow for the auction',
    ],
    goals: [
      'Cut blended CPA by at least 30%',
      'Lift landing page conversion rate',
      'Move from discount-led to value-led offers',
    ],
    strategy: [
      { title: 'Lead with proof', text: 'We replaced lifestyle shots with ingredient breakdowns, taste tests and real customer results, the proof buyers were actually looking for.' },
      { title: 'Sharpen the offer', text: 'Discounts made way for bundles, starter kits and subscribe-and-save, tested head to head for margin, not just volume.' },
      { title: 'Match ad to page', text: 'Each creative angle got its own landing page, so the promise in the ad was the first thing visitors saw after the click.' },
      { title: 'Iterate weekly', text: 'We tested 45+ hooks a week and fed every result back into the next brief.' },
    ],
    execution:
      'Creative, offers and landing pages moved as one system. Every week we reviewed hook rate, click-through and on-page conversion together, so we could tell whether a drop came from the ad, the offer or the page, and fix the right thing.',
    executionPoints: [
      '45+ new hooks tested every week',
      '6 angle-matched landing pages built and A/B tested',
      'Starter bundle replaced blanket discounts as the hero offer',
      'Search campaigns restructured around high-intent terms',
    ],
    metrics: [
      { value: '-42%', label: 'Cost per acquisition', note: 'within four months' },
      { value: '+61%', label: 'Landing page CVR', note: 'on angle-matched pages' },
      { value: '+24%', label: 'Average order value', note: 'driven by bundles' },
      { value: '2.9x', label: 'Blended ROAS', note: 'up from 1.8x' },
    ],
    resultsSummary:
      'Clearer proof and matched landing pages meant fewer wasted clicks and more buyers per rupee. Nova now acquires customers for 42% less, and bundles lifted order values enough to reinvest the savings into further growth.',
    quote: {
      text: 'We didn’t need more ads, we needed better signal. The weekly loop meant we always knew what was working and why.',
      author: 'Growth team, Nova Nutrition',
    },
    learnings: [
      { title: 'Proof beats polish', text: 'Ingredient and taste-test content outperformed studio lifestyle shots by a wide margin.' },
      { title: 'The click is half the job', text: 'Matching the landing page to the ad angle did as much for CPA as the creative itself.' },
      { title: 'Value over discount', text: 'Bundles protected margin and raised order value without training customers to wait for sales.' },
    ],
  },
  'mutha-beauty': {
    facts: [
      { label: 'Industry', value: 'Beauty & fashion' },
      { label: 'Market', value: 'India & diaspora' },
      { label: 'Engagement', value: '5 months' },
      { label: 'Channels', value: 'Instagram Reels, TikTok, Meta ads' },
    ],
    services: ['Content strategy', 'Editorial production', 'Creator partnerships', 'Paid social amplification'],
    overview:
      'Mutha Beauty had a strong visual identity that got lost the moment it met the feed. We built a culture-first content system that kept the brand instantly recognizable while scaling reach past 10 million impressions.',
    challenge:
      'To grow, the brand needed volume, but every piece of fast, trend-led content diluted its aesthetic. Paid ads looked like everyone else’s, and the brand was trading recognition for reach.',
    painPoints: [
      'Inconsistent look across creators and formats',
      'Trend content that didn’t sound like the brand',
      'Low recall: viewers engaged but didn’t remember who posted',
      'Paid and organic content run by separate teams',
    ],
    goals: [
      'Grow reach without diluting the brand',
      'Build a repeatable content format the audience recognizes',
      'Turn organic winners into paid assets',
    ],
    strategy: [
      { title: 'Codify the aesthetic', text: 'We turned the brand’s look into a simple creator playbook: palette, framing, pacing, sound and the words it never uses.' },
      { title: 'Create signature formats', text: 'Three recurring series gave the audience something to come back to and made every post recognizable in the first second.' },
      { title: 'Cast for culture', text: 'Creators were chosen for their taste and community, not follower count, so the content felt native to the feed.' },
      { title: 'Amplify what lands', text: 'Organic posts that beat engagement benchmarks were boosted and turned into paid variations within the week.' },
    ],
    execution:
      'A single team ran organic and paid together. Content was shot in monthly editorial batches, cut into platform-native edits, and released on a steady cadence, with the best performers amplified through paid social.',
    executionPoints: [
      '3 signature content series launched',
      '60+ creators briefed with one shared playbook',
      '250+ edits across Reels and TikTok',
      'Organic winners amplified within 7 days',
    ],
    metrics: [
      { value: '10M+', label: 'Impressions', note: 'across organic and paid' },
      { value: '+185%', label: 'Follower growth', note: 'over five months' },
      { value: '4.8%', label: 'Engagement rate', note: 'vs 1.9% before' },
      { value: '-31%', label: 'Cost per 1,000 reach', note: 'on amplified posts' },
    ],
    resultsSummary:
      'Mutha Beauty went past 10 million impressions without losing its look. Signature formats made the brand recognizable at a glance, and amplifying proven organic posts brought paid reach costs down by nearly a third.',
    quote: {
      text: 'For the first time, our content grew and still looked like us. People now recognize a Mutha post before they see the name.',
      author: 'Brand team, Mutha Beauty',
    },
    learnings: [
      { title: 'Consistency is reach', text: 'Recognizable formats earned repeat viewers, which the algorithms rewarded with more distribution.' },
      { title: 'Taste over followers', text: 'Creators with a strong point of view outperformed bigger accounts on both engagement and recall.' },
      { title: 'One team, one feed', text: 'Running organic and paid together meant winners were amplified in days, not months.' },
    ],
  },
  'orbit-labs': {
    facts: [
      { label: 'Industry', value: 'Consumer tech' },
      { label: 'Market', value: 'India, mobile-first' },
      { label: 'Engagement', value: '3 months' },
      { label: 'Channels', value: 'Storefront, checkout, Meta ads' },
    ],
    services: ['Conversion rate optimisation', 'Headless storefront', 'Checkout redesign', 'Analytics setup'],
    overview:
      'Orbit Labs was paying for traffic that never reached checkout. We rebuilt the mobile shopping experience for speed, with sub-second pages and a friction-free checkout, and lifted conversion rate by 28% without adding a rupee to media spend.',
    challenge:
      'Over 80% of Orbit’s traffic came from mobile, but the store was built desktop-first. Heavy product pages took more than four seconds to load, and a long, multi-step checkout lost buyers at every step.',
    painPoints: [
      'Mobile pages loading in 4+ seconds',
      'Over 70% of carts abandoned at checkout',
      'Paid traffic landing on slow, generic pages',
      'No clear view of where in the funnel buyers dropped off',
    ],
    goals: [
      'Get mobile product pages under one second',
      'Cut checkout drop-off',
      'Lift conversion rate without raising ad spend',
    ],
    strategy: [
      { title: 'Measure the leaks', text: 'We instrumented the full funnel and session recordings to find exactly where, and why, mobile buyers were leaving.' },
      { title: 'Rebuild for speed', text: 'A headless storefront with optimised images and pre-loaded product data brought page loads down to around 0.4 seconds.' },
      { title: 'Shorten checkout', text: 'Five checkout steps became one page, with express wallets, address autofill and COD shown upfront.' },
      { title: 'Test every change', text: 'Every improvement shipped as an A/B test, so the lift was measured, not assumed.' },
    ],
    execution:
      'We shipped in two-week sprints, starting with the highest-traffic product pages and the checkout. Each release was tested against the old experience on a share of traffic before rolling out to everyone.',
    executionPoints: [
      'Headless storefront rebuilt mobile-first',
      'One-page checkout with express payment options',
      'Funnel analytics and session recording set up',
      '14 A/B tests run over three months',
    ],
    metrics: [
      { value: '+28%', label: 'Conversion rate', note: 'on the same traffic' },
      { value: '0.4s', label: 'Mobile page load', note: 'down from 4.1s' },
      { value: '-35%', label: 'Checkout abandonment', note: 'after the one-page checkout' },
      { value: '+22%', label: 'Revenue per visitor', note: 'with no extra ad spend' },
    ],
    resultsSummary:
      'Speed turned out to be the best creative Orbit Labs had. The same ads, sending the same traffic, now convert 28% better, because buyers reach a page that loads instantly and a checkout that gets out of their way.',
    quote: {
      text: 'We were trying to fix conversion with better ads. CLYX showed us the problem was everything after the click.',
      author: 'Founding team, Orbit Labs',
    },
    learnings: [
      { title: 'Speed is a feature', text: 'Every second shaved off mobile load time showed up directly in conversion rate.' },
      { title: 'Fewer steps, more buyers', text: 'Collapsing checkout into one page did more than any design change to the steps themselves.' },
      { title: 'Fix the funnel first', text: 'Improving conversion made every rupee of future ad spend work harder.' },
    ],
  },
};

/** Full write-up for a case study, falling back to one built from its card copy when none is written yet. */
export function storyFor(item: CaseStudyItem): CaseStudyStory {
  const written = caseStudyStories[item.slug];
  if (written) return written;
  const [industry] = item.category.split('/').map((part) => part.trim());
  return {
    facts: [
      { label: 'Industry', value: industry || item.category },
      { label: 'Focus', value: item.category },
      { label: 'Headline result', value: item.result },
    ].filter((f) => f.value),
    services: item.category.split('/').map((part) => part.trim()).filter(Boolean),
    overview: item.detail,
    challenge: `${item.brand} came to CLYX needing growth that could be measured and repeated, not one-off wins.`,
    painPoints: [],
    goals: [],
    strategy: [],
    execution: '',
    executionPoints: [],
    metrics: item.result ? [{ value: item.result, label: 'Headline result' }] : [],
    resultsSummary: item.headline,
    learnings: [],
  };
}
