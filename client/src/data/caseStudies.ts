/**
 * Case studies: the cards on /case-studies and the full write-up on /case-studies/<slug>.
 * Everything, the card and its page, is edited in the admin ("Case studies"). The records below are the built-in
 * copy (the same as the backend's seed content), shown until the CMS answers. A saved case study that predates a
 * field (e.g. from before the write-up fields existed) borrows that field from the built-in record of the same brand.
 */

/** One case study as the CMS stores it. List fields hold one entry per line, "A | B | C" lines are split into columns. */
export interface CaseStudyRecord {
  brand: string;
  category: string;
  headline: string;
  result: string;
  accent: string;
  image: string;
  /** Short summary, shown under the title on the case study's page. */
  detail: string;
  /** Key points beside the cover image, one per line. */
  highlights: string;
  industry: string;
  market: string;
  duration: string;
  channels: string;
  adSpend: string;
  /** Comma separated. */
  services: string;
  requirement: string;
  goals: string;
  /** "Issue | what happened" per line. */
  challenges: string;
  /** "Step | what we did" per line. */
  approach: string;
  execution: string;
  deliverables: string;
  /** "Image URL | caption" per line. */
  work: string;
  /** "Value | Label | Note" per line. */
  metrics: string;
  /** "Metric | Before | After" per line. */
  comparison: string;
  resultsSummary: string;
  quote: string;
  quoteName: string;
  quoteRole: string;
  /** "Takeaway | explanation" per line. */
  learnings: string;
}

export interface CaseMetric {
  value: string;
  label: string;
  /** Short context line, e.g. "up from 1.6x". */
  note?: string;
}

export interface CaseStep {
  title: string;
  text: string;
}

export type CaseFactKey = 'industry' | 'market' | 'duration' | 'channels' | 'adSpend';

export interface CaseStudyStory {
  facts: Record<CaseFactKey, string>;
  services: string[];
  overview: string;
  highlights: string[];
  requirement: string;
  goals: string[];
  challenges: CaseStep[];
  approach: CaseStep[];
  execution: string;
  deliverables: string[];
  work: { src: string; caption: string }[];
  metrics: CaseMetric[];
  comparison: { label: string; before: string; after: string }[];
  resultsSummary: string;
  quote?: { text: string; name: string; role: string };
  learnings: CaseStep[];
}

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
  story: CaseStudyStory;
}

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');

const u = (id: string, w = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

export const caseStudyRecords: CaseStudyRecord[] = [
  {
    brand: 'Kulture Skin',
    category: 'Skincare D2C / Meta Ads',
    headline: 'Scaled Meta spend 6x without breaking ROAS.',
    result: '3.4x ROAS',
    accent: '#FFDE59',
    image: u('photo-1612817288484-6f916006741a', 1400),
    detail: 'Kulture Skin was stuck at ₹3L a month on Meta with a 1.6x ROAS. We rebuilt the account structure, fed it creator-led creative every week and scaled spend to ₹18L a month at 3.4x blended ROAS.',
    highlights: 'Meta spend scaled from ₹3L to ₹18L a month\nBlended ROAS doubled from 1.6x to 3.4x\nPurchase tracking rebuilt with the Conversions API\n180+ creator ads tested in six months',
    industry: 'D2C skincare',
    market: 'India, metro-first',
    duration: '6 months',
    channels: 'Meta Ads, Instagram Reels, Google Search',
    adSpend: '₹3L → ₹18L / month',
    services: 'Meta Ads management, Creative strategy, UGC ad production, Landing page CRO, Tracking & attribution',
    requirement: 'Kulture Skin had a loyal organic following and a bestselling vitamin C serum, but paid growth had stalled. The founders came to us with a clear brief: scale Meta Ads past ₹15L a month without ROAS collapsing every time the budget went up, and stop relying on one hero ad that had been running for four months.',
    goals: 'Scale Meta spend from ₹3L to ₹15L+ a month\nHold a blended ROAS of 3x or better while scaling\nBuild a weekly creative pipeline so no single ad carries the account\nFix purchase tracking so decisions run on real numbers',
    challenges: 'Broken tracking | iOS signal loss and a misfiring pixel meant Meta saw only about 60% of real purchases, so the algorithm was optimising on bad data.\nCreative fatigue | One hero video drove 70% of spend. Every time its frequency crossed 3, CPA spiked and the whole account dipped.\nFragmented account | 23 ad sets with overlapping interest audiences were bidding against each other, and none of them left the learning phase.\nScaling crashes | Budget jumps of more than 20% reset learning, and ROAS fell to around 1.2x for days at a time.',
    approach: 'Fix the data first | Set up the Conversions API with server-side events and deduplication, lifting event match quality from 4.1 to 8.7 so Meta could see real buyers again.\nConsolidate the account | Collapsed 23 ad sets into one testing campaign and one broad Advantage+ scaling campaign, so budget sat where it learned fastest.\nCreative as targeting | Briefed 35 creators on proven angles (texture close-ups, 30-day routines, honest reviews) and tested 20–25 new hooks every week.\nScale on rules, not mood | Ads moved to scaling only after 3 days above target ROAS. Budgets rose 15–20% every 48 hours, with cost caps as guard rails.',
    execution: 'The account ran on a weekly loop: creative brief on Monday, new ads live by Thursday, performance review every Monday morning. Losing ads were cut within 72 hours, winners were re-cut into new hooks and formats, and every winning angle got its own landing page section so the click matched the promise.',
    deliverables: '180+ ad creatives across video, static and carousel\nConversions API and GA4 purchase tracking rebuilt\nTwo-campaign account structure (testing + Advantage+ scaling)\n4 angle-matched landing page variants\nWeekly performance report with next week\'s test plan',
    work: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=85 | Skincare routine shoot for the creator hook tests\nhttps://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85 | Weekly ROAS and CPA dashboard shared with the founders\nhttps://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=1200&q=85 | Monday creative review: choosing next week\'s hooks',
    metrics: '3.4x | Blended ROAS | up from 1.6x\n6x | Monthly ad spend | ₹3L to ₹18L\n-38% | Cost per purchase | while scaling\n2.3x | Hook rate | creator vs studio ads',
    comparison: 'Monthly ad spend | ₹3L | ₹18L\nBlended ROAS | 1.6x | 3.4x\nCost per purchase | ₹740 | ₹459\nWinning ads in rotation | 1 | 14\nMonthly revenue from Meta | ₹4.8L | ₹61L',
    resultsSummary: 'By month three, the account no longer depended on a single ad. By month six, Kulture Skin was spending six times more on Meta at more than double the return, with 14 winning ads in rotation and a creative pipeline that refreshes every week.',
    quote: 'Before CLYX, every time we raised the budget we lost money. Now we scale every month and know exactly which ad to put the money behind. The weekly reports alone changed how we run the business.',
    quoteName: 'Co-founder',
    quoteRole: 'Kulture Skin',
    learnings: 'Fix tracking before touching budget | Better signal improved CPA by 18% before a single new ad went live.\nCreative is the new targeting | With broad audiences, the hook decided who saw the ad, so creative volume became the main growth lever.\nScale in steps | 15–20% budget increases every 48 hours kept the algorithm stable, where big jumps reset it.',
  },
  {
    brand: 'Nova Nutrition',
    category: 'Supplements / Google Ads',
    headline: 'Cut CPA by 42% on Google Search and Shopping.',
    result: '-42% CPA',
    accent: '#003AA3',
    image: u('photo-1593095948071-474c5cc2989d', 1400),
    detail: 'Nova Nutrition was losing money on Google: rising CPCs, broad match waste and a Performance Max campaign eating brand searches. We rebuilt Search, Shopping and PMax around profit and cut cost per acquisition by 42% in four months.',
    highlights: '1,400+ negative keywords cut wasted search spend\nBrand searches separated from Performance Max\n120 product titles rewritten for Shopping\nMobile pages sped up from 5.2s to 1.4s',
    industry: 'Health & sports nutrition',
    market: 'Pan-India D2C',
    duration: '4 months',
    channels: 'Google Search, Shopping, Performance Max, YouTube',
    adSpend: '₹8L / month',
    services: 'Google Ads management, Product feed optimisation, Performance Max setup, Landing page CRO, Offer testing',
    requirement: 'Nova sells whey protein, plant protein and daily supplements. Google was their biggest channel, but cost per acquisition had climbed about 60% over two quarters while revenue stayed flat. They asked us to bring CPA down without cutting volume, and to tell them honestly which campaigns were making money and which were only spending it.',
    goals: 'Cut blended CPA by at least 30%\nStop paying for brand searches through Performance Max\nGet Shopping ads showing for high-margin products, not just the cheapest\nLift landing page conversion rate on mobile',
    challenges: 'Broad match waste | 38% of search spend went to irrelevant queries like "protein side effects" and "how to make protein powder at home".\nPMax eating brand searches | Performance Max was claiming brand searches people would have made anyway, which made its ROAS look far better than it really was.\nWeak product feed | Generic product titles and missing attributes kept Shopping ads out of high-intent searches like "whey isolate 2kg chocolate".\nSlow product pages | Mobile product pages took 5.2 seconds to load, and reviews sat four screens below the fold.',
    approach: 'Audit every rupee | Pulled 90 days of search terms, added 1,400+ negative keywords and moved winning queries into exact and phrase match campaigns.\nSeparate brand from prospecting | Ran brand search on its own small budget and excluded brand terms from PMax, so each campaign was judged on new customers.\nRebuild the feed | Rewrote 120 product titles with flavour, size and protein per serving, and split products into margin tiers with their own ROAS targets.\nFix the landing experience | Built faster mobile product pages with reviews, lab reports and a starter bundle above the fold.',
    execution: 'We worked in two-week sprints. The first stopped the waste (negatives and brand separation), the second rebuilt the product feed, and the third and fourth focused on landing pages and offer tests. Every change was measured against profit per order, not just ROAS.',
    deliverables: '1,400+ negative keywords and a rebuilt keyword structure\n120 rewritten product titles and a margin-tiered product feed\nSeparate brand, Search, Shopping and PMax campaigns\n3 mobile landing pages with starter bundles\nProfit-per-order reporting dashboard',
    work: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?auto=format&fit=crop&w=1200&q=85 | Product shots for the new Shopping feed and starter bundles\nhttps://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85 | Search term audit: 38% of spend was going to irrelevant queries\nhttps://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=1200&q=85 | Offer test plan: bundles vs flat discounts',
    metrics: '-42% | Cost per acquisition | within 4 months\n+61% | Landing page CVR | on mobile\n+24% | Average order value | from bundles\n2.9x | Blended ROAS | up from 1.8x',
    comparison: 'Cost per acquisition | ₹1,150 | ₹667\nWasted search spend | 38% | 7%\nMobile page load | 5.2s | 1.4s\nAverage order value | ₹1,690 | ₹2,095\nBlended ROAS | 1.8x | 2.9x',
    resultsSummary: 'Cutting wasted spend and separating brand from prospecting showed the real picture within weeks. Nova now acquires customers for 42% less on the same budget, and bundles raised order values enough to fund YouTube campaigns for new demand.',
    quote: 'CLYX was the first agency to show us where our Google money was actually going. Cutting the waste paid for their fee in the first month.',
    quoteName: 'Head of Growth',
    quoteRole: 'Nova Nutrition',
    learnings: 'Search terms tell the truth | The keyword list looked fine. The search terms report showed a third of the budget going to the wrong people.\nJudge PMax without brand | Once brand searches were excluded, PMax ROAS dropped on paper but new-customer growth went up.\nThe feed is the ad | Better product titles did more for Shopping than any bid change.',
  },
  {
    brand: 'Urban Loom',
    category: 'Fashion E-commerce / Festive sale',
    headline: '₹1.2Cr in 30 days from one festive sale.',
    result: '5.2x ROAS',
    accent: '#FFDE59',
    image: u('photo-1483985988355-763728e1935b', 1400),
    detail: 'Urban Loom\'s Diwali sale was always their biggest month, and their most chaotic. We planned it as a six-week performance campaign (warm up, launch, scale, close) and it delivered ₹1.2Cr in revenue at 5.2x ROAS.',
    highlights: 'Six-week festive plan: warm up, launch, scale, close\n42,000 WhatsApp sign-ups before the sale opened\nTiered offers kept new-season styles at full price\nStock-synced feed stopped ads on sold-out sizes',
    industry: 'Fashion & ethnic wear',
    market: 'India, tier 1 + tier 2',
    duration: '6-week festive campaign',
    channels: 'Meta Advantage+ Shopping, Catalog ads, Google PMax, WhatsApp',
    adSpend: '₹23L for the campaign',
    services: 'Campaign planning, Meta & Google Ads, Catalog ads, Creative production, WhatsApp retargeting',
    requirement: 'Urban Loom sells handloom-inspired ethnic wear to young working women. Last year\'s Diwali sale made ₹38L but ran out of steam after day three, and half the budget went into discounts the brand could not afford. They needed a festive campaign that would cross ₹1Cr in revenue while protecting margin.',
    goals: 'Cross ₹1Cr in festive-month revenue\nKeep ROAS above 4x for the whole sale, not just launch day\nGrow the WhatsApp list before the sale opened\nAvoid deep discounts on new-season styles',
    challenges: 'Sale fatigue | Last year\'s sale peaked on day one and fell sharply, because the same people saw the same "flat 40% off" ad all month.\nRising festive CPMs | Meta CPMs rise 60–80% in the weeks before Diwali, so cold prospecting during the sale is expensive.\n1,800-product catalog | Most products had a single flat-lay image, which made catalog ads look like a spreadsheet.\nStock risk | Bestsellers sold out mid-campaign last year while ads kept sending traffic to out-of-stock pages.',
    approach: 'Warm up before the rush | Started prospecting three weeks early, while CPMs were lower, and sent people to a WhatsApp early-access list instead of a sale page.\nTiered offers, not one discount | Early access got a gift with purchase, the main sale had discounts tiered by cart size, and new-season styles stayed full price.\nMake the catalog look good | Added lifestyle frames, price-drop overlays and creator try-on videos so dynamic ads felt like content.\nStock-aware ads | Synced the product feed with inventory every 6 hours, so sold-out sizes dropped out of ads automatically.',
    execution: 'The campaign ran in four phases: warm-up (weeks 1–3), early access (2 days), main sale (10 days) and last call (3 days). Each phase had its own creative, audiences and budget. A daily stand-up with the brand\'s ops team kept ads, stock and offers in sync.',
    deliverables: '6-week festive media plan with phase budgets\n90+ ad creatives, including creator try-on videos\nEnhanced catalog with lifestyle frames and price overlays\n42,000-person WhatsApp early-access list\nStock-synced product feed for Meta and Google',
    work: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85 | Store and lookbook shoot for the festive catalog\nhttps://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=85 | Tiered sale creative: cart-size offers instead of flat discounts\nhttps://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85 | New-season edit, kept at full price through the sale',
    metrics: '₹1.2Cr | Festive revenue | in 30 days\n5.2x | Campaign ROAS | across Meta and Google\n42K | WhatsApp sign-ups | before launch\n+18% | Gross margin | vs last festive sale',
    comparison: 'Festive revenue | ₹38L | ₹1.2Cr\nCampaign ROAS | 2.7x | 5.2x\nAverage order value | ₹1,450 | ₹2,180\nRevenue after day 3 | 22% of total | 61% of total\nOrders from WhatsApp list | 0 | 9,800',
    resultsSummary: 'Warming up early meant Urban Loom entered Diwali week with 42,000 people already waiting. The sale earned three times last year\'s revenue, and because new-season styles stayed full price, gross margin went up too.',
    quote: 'Last Diwali we were refreshing the dashboard and hoping. This year we had a plan for every single day, and the sale kept growing instead of dying after the first weekend.',
    quoteName: 'Founder',
    quoteRole: 'Urban Loom',
    learnings: 'Win the sale before it starts | The cheapest customers came from the warm-up weeks, before festive CPMs peaked.\nTiered offers protect margin | Cart-size tiers raised order value without discounting the whole catalog.\nOps is part of performance | Syncing stock with the feed saved budget that would have gone to sold-out products.',
  },
  {
    brand: 'SkillSprint Academy',
    category: 'EdTech / Lead generation',
    headline: 'Cost per enrolment down 61% with a webinar funnel.',
    result: '-61% cost per enrolment',
    accent: '#003AA3',
    image: u('photo-1522202176988-66273c2fd55f', 1400),
    detail: 'SkillSprint was buying leads that never picked up the phone. We replaced instant-form lead ads with a free live masterclass funnel, qualified leads before sales called them, and cut the cost of a paid enrolment by 61%.',
    highlights: 'Instant forms replaced with a live masterclass funnel\nEvery lead scored before sales picked up the phone\nCRM outcomes sent back to Meta to train bidding\nFirst call in 12 minutes instead of 26 hours',
    industry: 'EdTech, upskilling courses',
    market: 'India, working professionals',
    duration: '5 months',
    channels: 'Meta Lead Ads, YouTube, Google Search, WhatsApp',
    adSpend: '₹12L / month',
    services: 'Funnel strategy, Meta & YouTube Ads, Landing pages, Lead scoring, CRM & WhatsApp automation',
    requirement: 'SkillSprint runs a 16-week data analytics course priced at ₹45,000. Their Meta lead ads brought in cheap leads at ₹90 each, but fewer than 1% enrolled, and the sales team was burning out calling people who did not remember filling in the form. They asked us to lower the cost of an actual enrolment, not the cost of a lead.',
    goals: 'Cut cost per paid enrolment by at least 40%\nRaise lead-to-enrolment rate above 3%\nGive the sales team fewer, better leads\nTrack every enrolment back to the ad that started it',
    challenges: 'Cheap leads, no buyers | Instant forms made sign-up effortless, so many leads were students and job seekers who could not afford the course.\nNo link from ad to sale | Enrolments closed on the phone, so Meta never learned which leads became paying students.\nSlow follow-up | Leads waited 26 hours on average for a first call, by which time interest had faded.\nLong decision cycle | A ₹45,000 course takes 2–3 weeks to decide on, but ads were judged on 7-day results.',
    approach: 'Sell the masterclass, not the course | Ads offered a free 90-minute live masterclass on analytics careers, so people showed real intent by giving up an evening.\nQualify on the landing page | A short form asked about experience, salary band and start date, and scored every lead before it reached sales.\nSend sales data back to Meta | Connected the CRM through the Conversions API, so "attended", "qualified" and "enrolled" events trained the algorithm on buyers.\nFollow up within minutes | WhatsApp reminders before each masterclass, and a sales call assigned within 15 minutes of attending.',
    execution: 'Two masterclasses ran every week. Ads drove registrations, WhatsApp handled reminders, and sales only called people who attended and scored as qualified. Every Friday we reviewed cost per attendee, attendance rate and enrolments by ad, and moved budget accordingly.',
    deliverables: 'Masterclass funnel: landing page, registration flow and thank-you page\nLead scoring model inside the CRM\nOffline conversions sent to Meta and Google\nWhatsApp reminder and nurture sequences\n60+ video ads, including faculty and alumni stories',
    work: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1200&q=85 | Masterclass landing page, built and A/B tested in-house\nhttps://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=85 | Live masterclass sessions, run twice a week\nhttps://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=85 | Funnel wireframe: ad → masterclass → qualified call',
    metrics: '-61% | Cost per enrolment | in 5 months\n4.2% | Lead-to-enrolment rate | up from 0.8%\n47% | Masterclass attendance | of registrations\n12 min | Time to first call | down from 26 hours',
    comparison: 'Cost per lead | ₹90 | ₹185\nLead-to-enrolment rate | 0.8% | 4.2%\nCost per enrolment | ₹11,250 | ₹4,400\nEnrolments per month | 107 | 273\nSales calls per enrolment | 125 | 24',
    resultsSummary: 'Leads became more expensive, and that was the point. Each lead now costs ₹185 instead of ₹90, but five times more of them enrol, so the cost of a paying student fell by 61% and monthly enrolments more than doubled on the same budget.',
    quote: 'We stopped judging marketing on cost per lead. Our sales team now talks to people who actually showed up and want to learn, and our enrolments have more than doubled.',
    quoteName: 'Head of Sales',
    quoteRole: 'SkillSprint Academy',
    learnings: 'Optimise for the sale, not the lead | Cheaper leads looked good in Ads Manager and bad in the bank account.\nFriction filters | Asking people to attend a live session removed low-intent leads before sales spent time on them.\nSpeed wins deals | Calling within 15 minutes of the masterclass made the biggest single difference to enrolments.',
  },
  {
    brand: 'Aranya Homes',
    category: 'Real estate / Lead generation',
    headline: '3,200 qualified leads for a new project launch.',
    result: '-55% cost per lead',
    accent: '#FFDE59',
    image: u('photo-1600585154340-be6161a56a0c', 1400),
    detail: 'Aranya Homes needed site visits for a new 2 and 3 BHK project in Pune. We ran Google Search, Meta and YouTube into one tightly qualified funnel and delivered 3,200 qualified leads at 55% lower cost per lead than their previous launch.',
    highlights: 'Locality and commute keywords instead of city-wide terms\nBudget, timeline and loan questions in every lead form\nDrone and walkthrough videos answered questions early\n41 units sold in the launch window',
    industry: 'Real estate developer',
    market: 'Pune, Mumbai & NRI buyers',
    duration: '4-month launch',
    channels: 'Google Search, Meta Lead Ads, YouTube, WhatsApp',
    adSpend: '₹15L / month',
    services: 'Launch media plan, Google & Meta Ads, Lead qualification, Landing pages, Sales reporting',
    requirement: 'Aranya was launching a 240-unit project in Pune. Their previous launch, run through property portals and brokers, cost ₹2,900 per lead, and the sales team said most leads were "just browsing". They wanted leads who could afford an ₹85L–1.4Cr home, and site visits booked every weekend.',
    goals: 'Generate 3,000+ qualified leads in four months\nKeep cost per qualified lead under ₹2,500\nBook 60+ site visits a month\nReach NRI buyers in the Gulf and the US',
    challenges: 'Junk leads | Earlier lead ads brought in renters, brokers and people with budgets far below the project price.\nExpensive keywords | Searches like "2 BHK in Pune" cost ₹60–90 per click and were shared with every developer in the city.\nLong buying cycle | Home buyers take 3–6 months to decide, so leads had to be nurtured, not just collected.\nNo feedback loop | Sales tracked lead status in spreadsheets, so the ad platforms never knew which leads were real.',
    approach: 'Target micro-markets | Built search campaigns around specific localities, commute routes and IT parks near the project instead of generic city keywords.\nQualify inside the form | Lead forms asked about budget, timeline and home loan status, adding a step on purpose to filter out casual browsers.\nWalkthrough-first creative | Used drone footage, sample flat walkthroughs and price-per-sq-ft breakdowns, so the ad answered questions before the call.\nClose the loop | Moved sales onto a simple CRM and sent "qualified" and "site visit" events back to Google and Meta every day.',
    execution: 'Campaigns went live three weeks before the sales office opened, building a waitlist for launch pricing. After launch, weekday ads drove enquiries and weekend ads pushed site visit bookings. Our team joined the developer\'s sales review every Monday to match ad data with feedback from the ground.',
    deliverables: 'Locality-led Google Search structure with 40 ad groups\nLaunch landing page with floor plans and an EMI calculator\nDrone and walkthrough video ads for Meta and YouTube\nNRI campaigns for the UAE, Saudi Arabia and the US\nDaily CRM sync with offline conversions',
    work: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85 | Sample flat walkthrough used across Meta and YouTube ads\nhttps://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=85 | Launch-offer creative for weekend site visit bookings\nhttps://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=85 | Weekly sales review with the developer\'s team',
    metrics: '3,200 | Qualified leads | in 4 months\n-55% | Cost per lead | vs previous launch\n310 | Site visits | booked from ads\n41 | Units sold | in the launch window',
    comparison: 'Cost per lead | ₹2,900 | ₹1,300\nQualified lead rate | 31% | 70%\nCost per qualified lead | ₹9,350 | ₹1,860\nSite visits per month | 22 | 78\nUnits sold in launch window | 14 | 41',
    resultsSummary: 'Harder questions in the form cut the junk, and sending sales outcomes back to the ad platforms taught them what a real buyer looked like. Aranya sold 41 units in the launch window, almost three times their previous launch.',
    quote: 'For the first time, our sales team asked marketing for more leads instead of complaining about them. Weekend site visits have been full since the second month.',
    quoteName: 'Sales Director',
    quoteRole: 'Aranya Homes',
    learnings: 'Quality is a targeting setting | Once the platforms received qualified-lead data, cost per qualified lead fell month on month.\nLocal beats generic | Locality and commute keywords converted at twice the rate of "flats in Pune".\nShow the home before the call | Walkthrough videos produced leads who already knew the price and layout.',
  },
  {
    brand: 'FitPulse',
    category: 'Fitness app / App growth',
    headline: 'Nearly 2x paying subscribers on the same budget.',
    result: '-48% cost per subscriber',
    accent: '#003AA3',
    image: u('photo-1517836357463-d25dfeac3438', 1400),
    detail: 'FitPulse had plenty of installs but few paying subscribers. We moved app campaigns from install bidding to trial and subscription events, rebuilt creative around real workouts, and cut the cost of a paying subscriber by 48%.',
    highlights: 'Bidding moved from installs to trials and subscriptions\nSubscription tracking fixed on Android and iOS\n120+ real workout videos replaced stock footage\nInstall-to-paid rate up from 1.5% to 3.4%',
    industry: 'Health & fitness app',
    market: 'India, Android + iOS',
    duration: '5 months',
    channels: 'Google App Campaigns, Meta App Ads, Apple Search Ads',
    adSpend: '₹10L / month',
    services: 'App campaign strategy, MMP & event setup, Creative production, App store optimisation, Retention ads',
    requirement: 'FitPulse offers home and gym workout plans on a ₹299 monthly subscription. Their campaigns delivered installs at ₹28 each, but only 1.5% of people who installed ever paid. The founders wanted growth in paying subscribers, with clear data on which campaigns brought in people who stayed.',
    goals: 'Cut cost per paying subscriber by 35% or more\nOptimise campaigns for trials and subscriptions, not installs\nImprove day-30 retention of paid users\nLift app store conversion rate',
    challenges: 'Optimising for the wrong event | Campaigns bid for installs, so the platforms found people who install apps but never pay.\nMessy event tracking | The MMP and Firebase reported different numbers, and the subscription event did not fire on iOS at all.\nGeneric creative | Stock-style gym footage looked like every other fitness app, with a hook rate under 15%.\nWeak store listing | Screenshots showed features instead of results, and the store page converted only 21% of visitors.',
    approach: 'Fix the events | Rebuilt tracking in the MMP and Firebase so trial start and paid subscription fired reliably on Android and iOS.\nBid for value | Moved Google App Campaigns to target CPA on trial start, then to subscription once volume allowed. Meta followed the same path.\nReal workouts, real people | Filmed 10-minute home workouts with trainers and members, cut into 15-second "try this" hooks.\nOptimise the store page | Tested new screenshots, a preview video and results-led copy on the Play Store and App Store.',
    execution: 'We ran fortnightly creative sprints of 15–20 new videos, with a weekly look at cohort data: cost per trial, trial-to-paid rate and day-30 retention by campaign. Budget only moved towards campaigns whose subscribers were still active after 30 days.',
    deliverables: 'MMP and Firebase event setup for trial and subscription\nGoogle App, Meta and Apple Search Ads campaigns rebuilt\n120+ workout-led video ads\nNew store screenshots and preview video\nCohort dashboard with day-30 retention by campaign',
    work: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=85 | Home workout shoot for the "try this in 10 minutes" ad series\nhttps://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85 | Gym member stories filmed for retention ads\nhttps://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=85 | Cohort dashboard: subscribers still active after 30 days',
    metrics: '-48% | Cost per subscriber | in 5 months\n3.4% | Install-to-paid rate | up from 1.5%\n+43% | Store conversion rate | after listing tests\n+19% | Day-30 retention | of paid users',
    comparison: 'Cost per install | ₹28 | ₹33\nInstall-to-paid rate | 1.5% | 3.4%\nCost per paying subscriber | ₹1,870 | ₹970\nStore page conversion | 21% | 30%\nNew subscribers per month | 535 | 1,030',
    resultsSummary: 'Installs got slightly more expensive, but the people installing were far more likely to pay. FitPulse now adds almost twice as many paying subscribers each month on the same budget, and more of them are still working out after 30 days.',
    quote: 'We used to celebrate cheap installs. CLYX made us look at who actually pays and stays, and our subscriber growth has nearly doubled since.',
    quoteName: 'Co-founder',
    quoteRole: 'FitPulse',
    learnings: 'Bid for the event you are paid on | Moving from install to trial to subscription bidding changed who the algorithm found.\nShow the product working | Real workout clips beat polished brand videos on hook rate and on trial starts.\nThe store page is a landing page | Store listing tests lifted conversion on every channel at once.',
  },
];

const RECORD_KEYS = Object.keys(caseStudyRecords[0]) as (keyof CaseStudyRecord)[];
const builtIn: Record<string, CaseStudyRecord> = Object.fromEntries(caseStudyRecords.map((r) => [slugify(r.brand), r]));

/** Non-empty lines of a list field. */
const lines = (text: string) => text.replace(/\r\n?/g, '\n').split('\n').map((line) => line.trim()).filter(Boolean);
/** A "A | B | C" line as its trimmed parts. */
const columns = (line: string) => line.split('|').map((part) => part.trim());

/** "Title | text" lines; a line without a "|" becomes text with no title. */
const steps = (text: string): CaseStep[] =>
  lines(text).map((line) => {
    const [title, ...rest] = columns(line);
    return rest.length ? { title, text: rest.join(' | ') } : { title: '', text: title };
  });

function storyOf(r: CaseStudyRecord): CaseStudyStory {
  return {
    facts: { industry: r.industry, market: r.market, duration: r.duration, channels: r.channels, adSpend: r.adSpend },
    services: r.services.split(',').map((s) => s.trim()).filter(Boolean),
    overview: r.detail,
    highlights: lines(r.highlights),
    requirement: r.requirement,
    goals: lines(r.goals),
    challenges: steps(r.challenges),
    approach: steps(r.approach),
    execution: r.execution,
    deliverables: lines(r.deliverables),
    work: lines(r.work)
      .map(columns)
      .map(([src, caption = '']) => ({ src, caption }))
      .filter((shot) => shot.src),
    metrics: lines(r.metrics)
      .map(columns)
      .map(([value, label = '', note = '']) => ({ value, label, note })),
    comparison: lines(r.comparison)
      .map(columns)
      .map(([label, before = '', after = '']) => ({ label, before, after })),
    resultsSummary: r.resultsSummary,
    quote: r.quote.trim() ? { text: r.quote, name: r.quoteName, role: r.quoteRole } : undefined,
    learnings: steps(r.learnings),
  };
}

/** A CMS record (or a built-in one) as a card plus its page's story. */
export function toCaseStudy(raw: Record<string, any>, index: number): CaseStudyItem {
  const slug = slugify(String(raw.brand || raw.id || ''));
  const fallback = builtIn[slug];
  const r = Object.fromEntries(
    RECORD_KEYS.map((key) => [key, String(raw[key] ?? fallback?.[key] ?? '')]),
  ) as unknown as CaseStudyRecord;
  return {
    id: String(raw.id ?? slug),
    slug,
    code: String(index + 1).padStart(2, '0'),
    brand: r.brand,
    category: r.category,
    headline: r.headline,
    result: r.result,
    detail: r.detail,
    src: r.image,
    alt: `${r.brand} campaign`,
    accent: r.accent || '#FFDE59',
    story: storyOf(r),
  };
}

export const defaultCaseStudies: CaseStudyItem[] = caseStudyRecords.map((record, i) =>
  toCaseStudy({ ...record, id: slugify(record.brand) }, i),
);
