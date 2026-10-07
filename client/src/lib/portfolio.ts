import { useMemo } from 'react';
import { useCollection } from '@/lib/siteContent';
import { slugify } from '@/data/caseStudies';

/** One project card on /portfolio, which opens its own page at /portfolio/<slug>. */
export interface PortfolioItem {
  slug: string;
  src: string;
  alt: string;
  code: string;
  category: string;
  title: string;
  result: string;
  /** Optional write-up from the admin ("Project story"); the detail page falls back to the category playbook. */
  detail: string;
}

type Raw = { title: string; category: string; result: string; image: string; detail?: string };

// Shown only until the CMS answers (e.g. backend asleep on a first visit). Mirrors the backend seed list.
const defaultRaw: Raw[] = (
  [
    ['Kulture Skin', 'Beauty', '3.4x ROAS', 'photo-1522337360788-8b13dee7a37e'],
    ['Nova Nutrition', 'Food', '42% lower CPA', 'photo-1541643600914-78b084683601'],
    ['Mutha Beauty', 'Fashion', '10M+ impressions', 'photo-1515886657613-9f3515b0c78f'],
    ['Orbit Labs', 'Tech', '+28% CVR lift', 'photo-1460925895917-afdab827c52f'],
    ['Halo Goods', 'D2C', '4.1x blended ROAS', 'photo-1496747611176-843222e1e57c'],
    ['Aura Collective', 'Fashion', '+188% CTR', 'photo-1483985988355-763728e1935b'],
    ['Glow Theory', 'Beauty', '2.8x ROAS', 'photo-1596462502278-27bfdc403348'],
    ['Fresh Fork', 'Food', '3.1x ROAS', 'photo-1504674900247-0877df9cc836'],
    ['Thread Society', 'Fashion', '3.8x ROAS', 'photo-1490481651871-ab68de25d43d'],
    ['Pixel Stack', 'Tech', '+34% CVR lift', 'photo-1518770660439-4636190af475'],
    ['Tick Theory', 'D2C', '3.6x ROAS', 'photo-1523275335684-37898b6baf30'],
    ['Dewdrop Labs', 'Beauty', '+64% repeat orders', 'photo-1571781926291-c477ebfd024b'],
    ['Slice House', 'Food', '+72% online orders', 'photo-1565299624946-b28f40a0ae38'],
    ['Luxe Lane', 'Fashion', '+96% CTR', 'photo-1445205170230-053b83016050'],
    ['DataPulse', 'Tech', '2.9x pipeline', 'photo-1551288049-bebda4e38f71'],
    ['Stride Co', 'D2C', '+140% sales', 'photo-1542291026-7eec264c27ff'],
    ['Blush & Co', 'Beauty', '6.2M views', 'photo-1512496015851-a90fb38ba796'],
    ['Green Bowl Co', 'Food', '5M+ impressions', 'photo-1512621776951-a57141f2eefd'],
    ['Muse Studio', 'Fashion', '8M+ reach', 'photo-1469334031218-e382a71b716b'],
    ['CodeCraft', 'Tech', '45% lower CPL', 'photo-1498050108023-c5249f4df085'],
    ['SoundNest', 'D2C', '29% lower CPA', 'photo-1505740420928-5e560c06d30e'],
    ['Pure Ritual', 'Beauty', '38% lower CAC', 'photo-1570172619644-dfd03ed5d881'],
    ['Harvest Kitchen', 'Food', '35% lower CPA', 'photo-1546069901-ba9599a7e63c'],
    ['Noir Atelier', 'Fashion', '31% lower CPA', 'photo-1509631179647-0177331693ae'],
    ['Nimbus Cloud', 'Tech', '+210% sign-ups', 'photo-1519389950473-47ba0277781c'],
    ['Frame & Lens', 'D2C', '4.4x ROAS', 'photo-1526170375885-4d8ecf77b99f'],
    ['Velvet Skin', 'Beauty', '+152% CTR', 'photo-1608248597279-f99d160bfcbc'],
    ['Morning Stack', 'Food', '2.6x ROAS', 'photo-1567620905732-2d1ec7ab7445'],
    ['Byte Wave', 'Tech', '3.2x ROAS', 'photo-1531297484001-80022131f5a1'],
    ['Shade Club', 'D2C', '+81% CTR', 'photo-1572635196237-14b3f281503f'],
    ['Lumen AI', 'Tech', '+186% app installs • 32% lower CPI', 'photo-1593642632823-8f785ba67e45'],
    ['Fintrail', 'Tech', '48K+ sign-ups • 41% lower CPL', 'photo-1511707171634-5f897ff02aa9'],
    ['Gridline HR', 'Tech', '3.4x pipeline • 52% lower CPL', 'photo-1517694712202-14dd9538aa97'],
    ['Axion Labs', 'Tech', '+58% demo requests • 2.2M impressions', 'photo-1581091226825-a6a2a5aee158'],
    ['Crumb & Co', 'Food', '+88% festive orders • 3.5x ROAS', 'photo-1565958011703-44f9829ba187'],
    ['Smoke Yard', 'Food', '+64% table bookings • 2.1M reach', 'photo-1555939594-58d7cb561ad1'],
    ['Dough Republic', 'Food', '+120% online orders • 33% lower CPA', 'photo-1513104890138-7c749659a591'],
    ['Brew Lab Coffee', 'Food', '4.2x ROAS • +70% subscriptions', 'photo-1495474472287-4d71bcdd2085'],
    ['Rogue Leather', 'Fashion', '4.0x ROAS • +112% CTR', 'photo-1487222477894-8943e31ef7b2'],
    ['Kaia Studio', 'Fashion', '180+ creators • 12M+ reach', 'photo-1539109136881-3be0616acf4b'],
    ['Linen Lore', 'Fashion', '+92% repeat buyers • 3.3x ROAS', 'photo-1558769132-cb1aea458c5e'],
    ['Urban Drift', 'Fashion', '6.5M views • +146% CTR', 'photo-1485968579580-b6d095142e6e'],
    ['Solestory', 'D2C', '3.9x ROAS • +118% sales', 'photo-1560343090-f0409e92791a'],
    ['Pulsewear', 'D2C', '36% lower CPA • +94% revenue', 'photo-1546868871-7041f2a55e12'],
    ['Packwell', 'D2C', '+155% sales • 4.2x ROAS', 'photo-1553062407-98eeb64c6a62'],
    ['Sipwell', 'D2C', '4.6x ROAS • 28% lower CAC', 'photo-1602143407151-7111542de6e8'],
    ['Petal & Pore', 'Beauty', '3.7x ROAS • +80% repeat orders', 'photo-1619451334792-150fd785ee74'],
    ['Kesar Skin', 'Beauty', '+210% serum sales • 9M+ views', 'photo-1576426863848-c21f53c60b19'],
    ['Clean Slate', 'Beauty', '42% lower CAC • 250+ creators', 'photo-1631729371254-42c2892f0e6e'],
    ['Silk Botanica', 'Beauty', '5.4M views • 3.2x ROAS', 'photo-1620916566398-39f1143ab7be'],
  ] as const
).map(([title, category, result, photo]) => ({
  title,
  category,
  result,
  image: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1000&q=85`,
}));

function toItem(item: Record<string, any>, i: number): PortfolioItem {
  const title = String(item.title ?? '');
  return {
    slug: slugify(title) || String(i + 1),
    src: item.image,
    alt: title,
    code: `#${String(i + 1).padStart(2, '0')}`,
    category: item.category ?? '',
    title,
    result: item.result ?? '',
    detail: item.detail ?? '',
  };
}

// Two projects with the same name would share an address, so later ones get "-2", "-3"…
function withUniqueSlugs(items: PortfolioItem[]): PortfolioItem[] {
  const seen = new Map<string, number>();
  return items.map((item) => {
    const n = (seen.get(item.slug) ?? 0) + 1;
    seen.set(item.slug, n);
    return n === 1 ? item : { ...item, slug: `${item.slug}-${n}` };
  });
}

const defaultPortfolio = withUniqueSlugs(defaultRaw.map(toItem));

/** The portfolio projects from the CMS, shared by the Portfolio page and each project's own page. */
export function usePortfolio(): PortfolioItem[] {
  const items = useCollection<PortfolioItem>('portfolio', defaultPortfolio, toItem);
  return useMemo(() => (items === defaultPortfolio ? items : withUniqueSlugs(items)), [items]);
}

export interface ProjectStep {
  title: string;
  text: string;
}

export interface ProjectStory {
  overview: string;
  services: string[];
  steps: ProjectStep[];
  deliverables: string[];
}

// How CLYX usually runs a project in each category. Used for every project in that category,
// with the project's own "Project story" from the admin replacing the overview when it is filled in.
const PLAYBOOKS: Record<string, Omit<ProjectStory, 'overview'> & { overview: (p: PortfolioItem) => string }> = {
  beauty: {
    overview: (p) =>
      `${p.title} needed beauty content that felt honest on camera and still sold. We paired creator-led storytelling with a disciplined paid testing loop, so every hook, routine and before-and-after earned its budget before we scaled it.`,
    services: ['Creator & UGC production', 'Paid social (Meta & YouTube)', 'Creative testing system', 'Landing page optimisation'],
    steps: [
      { title: 'Find the proof', text: 'Mined reviews, comments and routines to find the claims customers actually believe.' },
      { title: 'Creator sprint', text: 'Briefed creators across skin types and tones to film routines, reactions and demos.' },
      { title: 'Test and learn', text: 'Ran hooks head-to-head on small budgets and kept only the ones that moved the number.' },
      { title: 'Scale the winners', text: 'Moved proven creatives into scaling campaigns and refreshed them before fatigue set in.' },
    ],
    deliverables: ['Creator routines & reactions', 'Before/after ad sets', 'Hook library', 'Offer-led landing pages'],
  },
  food: {
    overview: (p) =>
      `${p.title} wanted people to taste the product through the screen. We built appetite-first content and tied it to sharper offers and a quicker path to order, so attention turned into baskets instead of likes.`,
    services: ['Food styling & shoots', 'Short-form video', 'Performance marketing', 'Offer & funnel design'],
    steps: [
      { title: 'Appetite audit', text: 'Pinpointed the dishes, textures and moments that make people stop scrolling.' },
      { title: 'Shoot for cravings', text: 'Produced close-up, sound-led video and stills built for Reels and Stories.' },
      { title: 'Offer engineering', text: 'Tested bundles, first-order hooks and delivery messaging against each other.' },
      { title: 'Always-on optimisation', text: 'Shifted spend daily towards the dishes, areas and times that converted best.' },
    ],
    deliverables: ['Menu & product shoots', 'Reels and Stories ads', 'First-order offers', 'Ordering funnel fixes'],
  },
  fashion: {
    overview: (p) =>
      `${p.title} had a strong look but a feed that was not selling it. We built a culture-first content system that kept the brand recognisable while giving paid media enough fresh creative to grow reach and sales.`,
    services: ['Campaign & lookbook shoots', 'Influencer partnerships', 'Paid social', 'Catalogue & retargeting ads'],
    steps: [
      { title: 'Brand world', text: 'Defined the mood, styling and voice every piece of content had to live inside.' },
      { title: 'Creator casting', text: 'Matched the brand with creators whose audience already dressed the part.' },
      { title: 'Drop-led content', text: 'Planned shoots around launches so each drop landed with a wave of fresh creative.' },
      { title: 'Full-funnel paid', text: 'Paired reach campaigns with dynamic catalogue retargeting to close the sale.' },
    ],
    deliverables: ['Lookbook & campaign visuals', 'Try-on and styling videos', 'Influencer content', 'Dynamic catalogue ads'],
  },
  tech: {
    overview: (p) =>
      `${p.title} had a great product that was hard to explain in three seconds. We turned the value into clear, demo-led creative and tightened the path from click to sign-up, so more of the traffic became pipeline.`,
    services: ['Product storytelling', 'Explainer & demo video', 'Conversion rate optimisation', 'B2B & B2C paid media'],
    steps: [
      { title: 'Message mapping', text: 'Boiled the product down to the one problem each audience cares most about.' },
      { title: 'Demo-first creative', text: 'Made screen-led videos and motion ads that show the product working, fast.' },
      { title: 'Funnel rebuild', text: 'Cut friction from landing pages and sign-up flows, then A/B tested every step.' },
      { title: 'Pipeline tracking', text: 'Connected ad spend to sign-ups and qualified leads, not just clicks.' },
    ],
    deliverables: ['Explainer & demo videos', 'Motion graphics ads', 'Landing page redesign', 'Conversion tracking setup'],
  },
  d2c: {
    overview: (p) =>
      `${p.title} needed profitable growth, not just more traffic. We connected creative, paid media and the storefront into one loop, so every rupee spent could be traced to revenue and the winners could be scaled with confidence.`,
    services: ['Performance marketing', 'UGC & product video', 'Storefront CRO', 'Retention & remarketing'],
    steps: [
      { title: 'Unit economics', text: 'Set target CAC and ROAS from real margins before a single ad went live.' },
      { title: 'Creative engine', text: 'Shipped a steady stream of UGC, unboxings and product demos every week.' },
      { title: 'Storefront fixes', text: 'Sped up product pages and checkout, and added the proof shoppers look for.' },
      { title: 'Scale and retain', text: 'Scaled the winning ads and brought buyers back with remarketing and bundles.' },
    ],
    deliverables: ['UGC & unboxing videos', 'Product demo ads', 'PDP & checkout improvements', 'Remarketing flows'],
  },
};

const GENERIC_PLAYBOOK: (typeof PLAYBOOKS)[string] = {
  overview: (p) =>
    `${p.title} came to CLYX for growth that could be measured and repeated. We combined creative built for the feed with disciplined performance marketing, and kept testing until the numbers moved.`,
  services: ['Creative strategy', 'Content production', 'Performance marketing', 'Conversion optimisation'],
  steps: [
    { title: 'Diagnose', text: 'Looked at the numbers, the audience and the competition to find the biggest lever.' },
    { title: 'Create', text: 'Produced content built around the proof and hooks most likely to convert.' },
    { title: 'Test', text: 'Ran structured tests and kept only what beat the benchmark.' },
    { title: 'Scale', text: 'Put budget behind the winners and kept creative fresh as we grew.' },
  ],
  deliverables: ['Creative strategy', 'Ad creatives', 'Campaign setup', 'Performance reporting'],
};

/**
 * The outcome split into its points: the admin can list several on one line ("2 Creators • 100K+ Views") or one per
 * line, and each becomes its own point. A single outcome comes back as one point.
 */
export function resultPoints(result: string): string[] {
  return result
    .split(/\s*(?:\n|[•·●▪|])\s*/)
    .map((point) => point.replace(/^[-*–]\s+/, '').trim())
    .filter(Boolean);
}

/** The write-up shown on a project's page. */
export function projectStory(item: PortfolioItem): ProjectStory {
  const playbook = PLAYBOOKS[item.category.trim().toLowerCase()] ?? GENERIC_PLAYBOOK;
  return {
    overview: item.detail.trim() || playbook.overview(item),
    services: playbook.services,
    steps: playbook.steps,
    deliverables: playbook.deliverables,
  };
}
