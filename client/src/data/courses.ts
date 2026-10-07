/** One course on the Courses page, as edited in the admin "Courses" list (fields match the backend schema). */
export type Course = {
  id: string;
  title: string;
  tagline: string;
  price: string;
  originalPrice: string;
  image: string;
  badge: string;
  duration: string;
  format: string;
  level: string;
  schedule: string;
  highlights: string;
  includes: string;
  description: string;
};

const COURSE_KEYS = ['title', 'tagline', 'price', 'originalPrice', 'image', 'badge', 'duration', 'format', 'level', 'schedule', 'highlights', 'includes', 'description'] as const;

/** A CMS card as a Course; missing text fields become ''. */
export const toCourse = (item: Record<string, any>, i: number): Course => ({
  id: typeof item.id === 'string' ? item.id : `course-${i + 1}`,
  ...(Object.fromEntries(COURSE_KEYS.map((k) => [k, typeof item[k] === 'string' ? item[k] : ''])) as Omit<Course, 'id'>),
});

/** "29" -> 29; anything that is not a positive price -> 0. */
export const coursePrice = (course: Pick<Course, 'price'>) => {
  const n = Number(course.price);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** ₹ amount as shown to buyers: whole rupees without decimals, otherwise two places. */
export const formatRupees = (n: number) => `₹${Number.isInteger(n) ? n.toLocaleString('en-IN') : n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const u = (id: string, w = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

// Shown until the backend has its own Courses list (same as the backend seed).
export const defaultCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Creator Ads Masterclass',
    tagline: 'Turn short-form clips into ads that sell: hooks, scripts, edits and whitelisting, taught live by the CLYX team.',
    price: '29',
    originalPrice: '999',
    image: u('photo-1611926653458-09294b3142bf'),
    badge: 'Live batch',
    duration: '4 weeks',
    format: 'Live classes',
    level: 'Beginner to intermediate',
    schedule: 'Weekend live sessions, 7 PM IST',
    highlights: [
      'Write hooks that stop the scroll in the first 2 seconds',
      'Script and brief creators for ads, not just content',
      'Edit for retention: pacing, captions and pattern breaks',
      'Whitelisting basics: run creator posts as paid ads',
    ].join('\n'),
    includes: ['Live classes', 'Class recordings to rewatch', 'Hook and script templates', 'WhatsApp support from the team'].join('\n'),
    description: '',
  },
  {
    id: 'course-2',
    title: 'Meta Ads from Zero',
    tagline: 'Set up, test and scale Meta ads the way we run them for D2C brands, from first campaign to steady ROAS.',
    price: '49',
    originalPrice: '1499',
    image: u('photo-1551288049-bebda4e38f71'),
    badge: 'New',
    duration: '6 weeks',
    format: 'Live classes',
    level: 'Beginner',
    schedule: 'Weekday evening live sessions, 8 PM IST',
    highlights: [
      'Account, pixel and conversion setup done right',
      'Campaign structure that is easy to test and scale',
      'Reading the numbers: CTR, CPA, ROAS and what to change',
      'Creative testing loops that keep winners coming',
    ].join('\n'),
    includes: ['Live classes', 'Class recordings to rewatch', 'Campaign planning sheet', 'WhatsApp support from the team'].join('\n'),
    description: '',
  },
];
