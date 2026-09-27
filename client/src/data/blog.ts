// Built-in Journal articles. Used before the CMS has answered, and as the article text for any CMS post whose
// `body` is still empty (matched by slug, so the six seeded posts always open with full copy).
// Body format: blank line between paragraphs, "## " for a heading, "- " for a bullet, "> " for a pull quote.
export type BlogArticle = {
  title: string;
  tag: string;
  date: string;
  readTime: string;
  excerpt: string;
  body: string;
};

export const defaultArticles: BlogArticle[] = [
  {
    title: 'Why the best creator ads do not feel like ads',
    tag: 'Creator economy',
    date: '12.09.25',
    readTime: '4 min read',
    excerpt: 'People scroll past anything that looks like an ad. The creator ads that win borrow the language of the feed, not the language of the brand.',
    body: `Open any social app and watch your own thumb. It slows down for a friend's story, a joke, a strange fact, a face talking straight to camera. It speeds up the moment something looks produced, polished and sold. That reflex is the single biggest force working against every paid social budget.

The best creator ads are built around that reflex instead of fighting it. They look like the content people already chose to watch, and they earn the sale inside that format.

## The feed has its own grammar

Every platform teaches its users what "normal" looks like: the framing, the pacing, the captions, the sound. Native content follows that grammar without thinking about it. Traditional ads break it, and viewers notice within a second.

A creator who posts every day knows the grammar better than any brand team. That is the real reason creator ads work. It is not the follower count. It is fluency.

> If the first second looks like an ad, the next nine seconds are never watched.

## What a native creator ad gets right

- It opens on a person, a problem or a surprising moment, never a logo.
- It is shot the way the creator normally shoots: handheld, close, real light.
- The product shows up as part of a story, not as the story.
- The claim is specific and personal: "I stopped doing X" beats "the best X on the market".
- The call to action sounds like advice, not like a banner.

## Where brands get in the way

Most creator ads fail before they are filmed. The brief is too long, the script is too tight, and every line has been through three rounds of approvals. The creator ends up reading brand copy in their own bedroom, and the audience can hear it.

Give creators the outcome, the proof points and the few things that cannot be said. Then let them find the words. You will get fewer "perfect" takes and far more ads that people actually finish.

## How we brief for native

At CLYX we brief around three things: the moment in the viewer's day the product fits into, the one belief we need to shift, and the proof that makes the shift believable. Everything else, from the hook to the sign-off, is the creator's call.

We then test several creators and several hooks on the same brief. The feed decides which version feels most native, and the budget follows that answer.

## The takeaway

An ad that does not feel like an ad is not a trick. It is respect for how people use their feed. Earn the attention the same way creators do, and the conversion becomes the easy part.`,
  },
  {
    title: 'The performance creative loop, explained',
    tag: 'Performance',
    date: '04.09.25',
    readTime: '6 min read',
    excerpt: 'Winning creative is not a lucky shot. It is the output of a loop: launch, read, cut, double down and brief again, every single week.',
    body: `Ask a brand why an ad worked and you usually hear a story about a great idea. Ask a strong performance team and you hear about a process. The idea mattered, but the process is what found it, proved it and scaled it.

We call that process the performance creative loop. It has five steps, and it never stops running.

## 1. Launch with range

A loop needs options to choose between. Every round starts with a set of creatives that are genuinely different from each other: different hooks, different creators, different angles on why someone should care.

Five versions of the same idea with different music is not range. It is one test that costs five times as much.

## 2. Read the right signals

Early data is noisy, so we read it in layers. The first three seconds tell us whether the hook stops the scroll. Hold rate tells us whether the story keeps people. Click-through and cost per purchase tell us whether the promise converts.

- Weak hook, strong hold: the idea works, the opening does not. Re-cut the first second.
- Strong hook, weak hold: the promise is interesting but the middle drags. Tighten the story.
- Strong watch, weak conversion: the ad entertains but does not sell. Fix the offer or the landing page.

> Every metric is a question about one part of the ad. Read them separately before you judge the whole.

## 3. Cut quickly

Creative that loses attention in the first seconds should stop spending money. Waiting for "more data" on a clear loser is the most common way performance budgets leak.

We set cut rules before launch, so the decision is not emotional when the numbers arrive.

## 4. Double down on what holds

When something works, it earns more budget fast. It also earns attention from the creative team. What exactly is working: the creator, the first line, the format, the proof point? Once we know, we can repeat it on purpose.

## 5. Brief the next round from the data

This is the step most teams skip. The winners and losers from this round become the brief for the next one. New hooks on the winning angle. New creators on the winning script. A new angle that answers the objection the comments keep raising.

That is how the testing pipeline never runs dry, and why results compound instead of plateauing.

## Why a loop beats a campaign

A campaign has a launch date and an end date. A loop has a rhythm. Ad fatigue, platform changes and new competitors all hit campaigns hard, because the plan was fixed months ago. A loop absorbs those changes, because every week it is already asking what to keep, what to cut and what to try next.`,
  },
  {
    title: 'From scroll-stopping hook to scalable system',
    tag: 'Growth',
    date: '28.08.25',
    readTime: '5 min read',
    excerpt: 'One viral ad is a moment. A library of hooks, formats and creators that keeps producing winners is a growth system.',
    body: `Every brand has had the ad that "just took off". Spend doubled, costs dropped, the team celebrated. Then, a few weeks later, performance faded and nobody could quite explain how to do it again.

The problem was never the ad. The problem was that it was treated as a one-off, not as the first data point in a system.

## Start by taking the winner apart

A winning ad is a bundle of decisions. To repeat its success you need to know which decisions did the work. We break every winner into its parts:

- The hook: the first line, first frame and first sound.
- The angle: the reason to care, such as saving time, looking better or avoiding a mistake.
- The format: talking head, demo, reaction, before and after, list.
- The creator: their energy, their audience fit and their credibility on the topic.
- The proof: the moment that makes the claim believable.

## Turn parts into variables

Once the parts are named, each one becomes something you can test on its own. Keep the angle and change the hook. Keep the hook and change the creator. Keep the creator and try a new format.

> You do not need a new big idea every week. You need a steady supply of small, deliberate variations on the ideas that already work.

## Build the library

Every test result goes into a shared library: which hooks stopped the scroll, which angles converted, which creators held attention, for which audience. Over a few months this library becomes the most valuable creative asset the brand owns.

New briefs start from the library instead of a blank page. New creators are briefed with examples of what has already worked. New team members learn in a day what took the brand a year to discover.

## Scale with guardrails

Scaling a system means more creators, more variations and more spend, without losing what made it work. A few guardrails keep it honest:

- Every new variation has a clear hypothesis: what is being tested and why.
- Budget follows results, not opinions or seniority.
- Fatigue is watched weekly, so winners are refreshed before they collapse.

## The shift in mindset

The goal is not to find the perfect ad. It is to build a machine that keeps finding good ones. When that machine is running, a viral hit is a welcome bonus, not a lifeline.`,
  },
  {
    title: 'The page is part of the ad',
    tag: 'CRO',
    date: '19.08.25',
    readTime: '3 min read',
    excerpt: 'The ad makes a promise. The landing page either keeps it or breaks it, and the conversion rate shows which one happened.',
    body: `A great ad can earn a click. It cannot earn a purchase on its own. The moment someone taps, the landing page takes over the conversation, and too often it starts a completely different one.

## The promise has to carry over

If the ad says "the serum that cleared my skin in two weeks", the page should open on that exact result, not on a generic homepage banner about the brand's mission. People clicked for a specific reason. Show them that reason immediately.

> Every click is a question. The first screen of the page has to answer it.

## The most common breaks

- Different look: the ad feels personal and native, the page feels corporate.
- Different message: the ad is about one benefit, the page lists twelve.
- Different offer: the discount in the ad is missing, or hidden at checkout.
- Slow load: on a mobile connection, every extra second loses buyers.

## What a matched page looks like

The first screen repeats the hook from the ad, shows the product in use and puts the main action within thumb reach. Proof comes next: reviews, creator clips, before and after. Objections are answered in plain words further down, for the people who need convincing.

Where it makes sense, the same creator from the ad appears on the page. The viewer feels they have followed a recommendation, not landed in a shop.

## Test the page like you test the ad

We treat the page as part of the creative loop. Different ad angles often need different landing pages, and a page change can move conversion as much as a new hook can. Measure it, cut what does not work and double down on what does.

The ad and the page are one experience. Design them together, and the budget stops leaking at the moment it matters most.`,
  },
  {
    title: 'What to do when everything is working a little',
    tag: 'Strategy',
    date: '11.08.25',
    readTime: '5 min read',
    excerpt: 'No disasters, no breakthroughs, just steady average results. That comfortable middle is often the most expensive place for a brand to be.',
    body: `Some accounts are clearly broken, and those are easy to fix: something is off, you find it, you change it. The harder situation is the account where everything is working a little. Every campaign is "fine". Every ad is "okay". Nothing is urgent, so nothing changes.

Months pass, and the brand spends a lot of money to stay exactly where it is.

## Why "a little" is dangerous

When results are spread evenly, budget is spread evenly too. Money that could scale one strong idea is split across ten average ones. The learning is thin, because no single test gets enough spend to say anything clearly.

> Average results across the board usually mean nobody has made a real decision in a while.

## Step 1: Force a ranking

Take every active creative, audience and campaign and rank them on one metric that matters to the business, usually cost per acquisition or return on ad spend. Not "which ones are good", but "which one is first, which one is last".

The ranking almost always shows a gap. A small number of items carry most of the results, and a long tail quietly drains budget.

## Step 2: Cut the bottom

Pause the bottom third. It feels risky, but average spend is not safe spend. It just fails slowly. The freed budget becomes fuel for the next steps.

## Step 3: Push the top

Give the top performers enough budget to show their real ceiling. Many "okay" ads turn out to be strong ads that were never funded properly.

## Step 4: Make one bold bet

With the saved budget, run one test that is genuinely different: a new angle, a new creator type, a new offer or a new format. Not a small tweak. Something that could fail clearly or win clearly.

## Step 5: Set a decision date

Agree in advance when you will judge the results and what counts as a win. Without a date, "let's see how it goes" slowly becomes the strategy again.

## The takeaway

Working a little is not a stable state. It is slow decline disguised as comfort. Rank, cut, push and take one real swing, and the account starts moving again.`,
  },
  {
    title: 'Briefing for a voice, not a demographic',
    tag: 'Creators',
    date: '02.08.25',
    readTime: '4 min read',
    excerpt: 'Age, gender and city tell you who to reach. They do not tell you who people will believe. The right creator voice does.',
    body: `Most creator briefs start with a demographic: women, 25 to 34, metro cities, interested in skincare. It is a useful targeting note. It is a weak creative brief.

Two creators can fit that description exactly and produce ads that perform completely differently. The difference is not who they are on paper. It is how they sound, and who trusts that sound.

## Voice beats profile

A voice is the combination of tone, energy, expertise and point of view that makes a creator believable on a topic. The calm expert. The funny friend who tells it straight. The sceptic who was converted. The busy parent who has no time for nonsense.

Audiences do not buy from a demographic. They buy from a voice they already trust.

> Target the audience with the media plan. Win them over with the voice.

## How to brief for a voice

- Describe the person the viewer should feel they are hearing from, not only who the viewer is.
- Name the belief that voice can shift. A sceptic's approval moves sceptics; an expert's explanation moves researchers.
- Share examples of the tone you want, from any category, not only from your own brand.
- List the proof points, but let the creator decide how to say them in their own words.

## Cast several voices on one brief

We rarely bet on a single creator. For each brief we cast a few different voices against the same message, then let performance show which voice the audience believes. Often the winner is not the creator the brand expected.

Those results feed straight back into casting. Over time the brand learns which voices convert for which products, which is far more useful than a demographic profile.

## Keep the voice intact

Once you have chosen a creator for their voice, protect it. Heavy scripting, brand phrases and endless revisions flatten every creator into the same generic presenter. The viewer can tell, and the ad stops working.

## The takeaway

Demographics decide where your ads are shown. Voice decides whether anyone listens. Brief for the voice, test more than one, and let the audience tell you who they believe.`,
  },
];
