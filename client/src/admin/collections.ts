import {
  BarChart3,
  BookOpen,
  Briefcase,
  Film,
  GraduationCap,
  LayoutGrid,
  MessageSquareQuote,
  Star,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { CollectionName, RowColumn } from '@/lib/pageContent';

export type ItemFieldType = 'text' | 'textarea' | 'richtext' | 'image' | 'url' | 'select' | 'color' | 'rows';
export type ItemField = {
  key: string;
  label: string;
  type?: ItemFieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  default?: string;
  wide?: boolean;
  /** Help text under the input. */
  hint?: string;
  /** Starts a new titled group in the edit panel (repeat-free: only set on the group's first field). */
  section?: string;
  /** 'rows' only: the columns of each row (saved as "a | b | c" lines) and what one row is called. */
  columns?: RowColumn[];
  item?: string;
};

/** How each repeating list is edited in the admin. Field keys match the backend schema for that list. */
export type CollectionDef = {
  name: CollectionName;
  label: string;
  singular: string;
  icon: LucideIcon;
  description: string;
  /** New cards go to the top ("start") or the bottom ("end") of the list. */
  position: 'start' | 'end';
  titleKey?: string;
  /** Card title when there is no titleKey or it is empty, numbered by position (e.g. "Photo 3"). */
  fallbackTitle?: string;
  subtitleKey?: string;
  badgeKey?: string;
  imageKey?: string;
  fields: ItemField[];
};

export const COLLECTIONS: Record<CollectionName, CollectionDef> = {
  campaigns: {
    name: 'campaigns',
    label: 'Campaigns',
    singular: 'campaign',
    icon: Target,
    description: 'Cards in the "Featured campaigns" carousel on the homepage.',
    position: 'start',
    titleKey: 'client',
    subtitleKey: 'roas',
    badgeKey: 'category',
    imageKey: 'img',
    fields: [
      { key: 'client', label: 'Client / brand', required: true, placeholder: 'KULTURE SKIN' },
      { key: 'category', label: 'Category tag', placeholder: 'CREATOR COMMERCE' },
      { key: 'roas', label: 'Headline result', placeholder: '3.4X ROAS SCALE' },
      { key: 'spend', label: 'Monthly spend', placeholder: '₹5L / mo' },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Scaling', 'Optimizing', 'Completed'], default: 'Scaling' },
      { key: 'desc', label: 'Description', type: 'richtext', wide: true },
      { key: 'img', label: 'Cover image', type: 'image', wide: true },
      { key: 'ctaText', label: 'Button text', placeholder: 'View Case Study' },
      { key: 'ctaUrl', label: 'Button link', type: 'url', placeholder: '/case-studies' },
    ],
  },
  stats: {
    name: 'stats',
    label: 'Proof stats',
    singular: 'stat',
    icon: BarChart3,
    description: 'Headline numbers used in the homepage proof counters.',
    position: 'end',
    titleKey: 'value',
    subtitleKey: 'label',
    fields: [
      { key: 'value', label: 'Number', required: true, placeholder: '5X+' },
      { key: 'label', label: 'Label', placeholder: 'Average ROAS Lift' },
      { key: 'detail', label: 'Detail', wide: true, placeholder: 'Whitelisted vs standard brand ads' },
    ],
  },
  team: {
    name: 'team',
    label: 'Team',
    singular: 'team member',
    icon: Users,
    description: 'Leadership and team shown on the homepage and the About page. Founders/CEOs appear as large cards.',
    position: 'end',
    titleKey: 'name',
    subtitleKey: 'role',
    badgeKey: 'badge',
    imageKey: 'img',
    fields: [
      { key: 'name', label: 'Full name', required: true },
      { key: 'role', label: 'Role', placeholder: 'Founder & CEO' },
      { key: 'badge', label: 'Badge', placeholder: '200+ Creators' },
      { key: 'img', label: 'Photo', type: 'image' },
      { key: 'bio', label: 'Short bio', type: 'richtext', wide: true },
    ],
  },
  testimonials: {
    name: 'testimonials',
    label: 'Testimonials',
    singular: 'testimonial',
    icon: MessageSquareQuote,
    description: 'Founder quotes in the homepage testimonials marquee.',
    position: 'end',
    titleKey: 'name',
    subtitleKey: 'quote',
    badgeKey: 'brand',
    fields: [
      { key: 'quote', label: 'Quote', type: 'richtext', required: true, wide: true },
      { key: 'name', label: 'Name', required: true },
      { key: 'role', label: 'Role', placeholder: 'Founder & CEO' },
      { key: 'brand', label: 'Brand' },
      { key: 'metrics', label: 'Result line', placeholder: '3.9x ROAS · ₹40L/month Scale' },
    ],
  },
  caseStudies: {
    name: 'caseStudies',
    label: 'Case studies',
    singular: 'case study',
    icon: Film,
    description:
      'Cards on the Case Studies page. Each card opens its own page (/case-studies/<brand>) with the full story below. Empty fields hide their part of the page.',
    position: 'start',
    titleKey: 'brand',
    subtitleKey: 'headline',
    badgeKey: 'result',
    imageKey: 'image',
    fields: [
      { key: 'brand', label: 'Client / brand', required: true, section: 'Card', hint: 'Also sets the page address, e.g. "Urban Loom" → /case-studies/urban-loom.' },
      { key: 'category', label: 'Category', placeholder: 'Skincare D2C / Meta Ads' },
      { key: 'headline', label: 'Headline (on the card)', wide: true, placeholder: 'Scaled Meta spend 6x without breaking ROAS.' },
      { key: 'result', label: 'Headline result', placeholder: '3.4x ROAS', hint: 'The yellow badge on the card.' },
      { key: 'accent', label: 'Accent colour', type: 'color', default: '#FFDE59' },
      { key: 'image', label: 'Cover image', type: 'image', wide: true },
      {
        key: 'detail',
        label: 'Short summary',
        type: 'richtext',
        wide: true,
        section: 'Case study page · overview',
        placeholder: 'Two or three lines: where the client started, what we did, what changed.',
      },
      {
        key: 'highlights',
        label: 'Key points (one per line)',
        type: 'textarea',
        wide: true,
        placeholder: 'Meta spend scaled from ₹3L to ₹18L a month\nBlended ROAS doubled from 1.6x to 3.4x',
        hint: 'Shown beside the cover image, appearing one by one. Three to five short points work best.',
      },
      { key: 'industry', label: 'Industry', placeholder: 'D2C skincare' },
      { key: 'market', label: 'Market', placeholder: 'India, metro-first' },
      { key: 'duration', label: 'Engagement', placeholder: '6 months' },
      { key: 'adSpend', label: 'Ad spend', placeholder: '₹3L → ₹18L / month' },
      { key: 'channels', label: 'Channels', wide: true, placeholder: 'Meta Ads, Google Search, YouTube' },
      { key: 'services', label: 'What we did (comma separated)', wide: true, placeholder: 'Meta Ads management, Creative strategy, Landing page CRO' },
      {
        key: 'requirement',
        label: 'Client requirement / brief',
        type: 'richtext',
        wide: true,
        section: 'The brief',
        placeholder: 'What the client came to us with and what they asked for.',
      },
      { key: 'goals', label: 'Goals (one per line)', type: 'textarea', wide: true, placeholder: 'Scale Meta spend to ₹15L a month\nHold ROAS above 3x' },
      {
        key: 'challenges',
        label: 'Issues we faced',
        type: 'rows',
        item: 'Issue',
        columns: [
          { label: 'Issue', kind: 'text', placeholder: 'Broken tracking' },
          { label: 'What happened', kind: 'text', placeholder: 'Meta saw only 60% of real purchases.' },
        ],
        section: 'Issues & how we handled them',
      },
      {
        key: 'approach',
        label: 'How we handled it',
        type: 'rows',
        item: 'Step',
        columns: [
          { label: 'Step', kind: 'text', placeholder: 'Fix the data first' },
          { label: 'What we did', kind: 'text', placeholder: 'Set up the Conversions API with server-side events.' },
        ],
      },
      {
        key: 'execution',
        label: 'How the work ran',
        type: 'richtext',
        wide: true,
        section: 'Our work',
        placeholder: 'The weekly rhythm, the team, how decisions were made.',
      },
      { key: 'deliverables', label: 'Deliverables (one per line)', type: 'textarea', wide: true, placeholder: '180+ ad creatives\nConversions API setup' },
      {
        key: 'work',
        label: 'Work photos',
        type: 'rows',
        item: 'Photo',
        columns: [
          { label: 'Photo', kind: 'image' },
          { label: 'Caption', kind: 'text', placeholder: 'Creator shoot for the hook tests' },
        ],
        hint: 'Shoots, ads, dashboards, landing pages: anything that shows the work. Three or four look best.',
      },
      {
        key: 'metrics',
        label: 'Key numbers',
        type: 'rows',
        item: 'Number',
        columns: [
          { label: 'Value', kind: 'text', placeholder: '3.4x' },
          { label: 'Label', kind: 'text', placeholder: 'Blended ROAS' },
          { label: 'Note', kind: 'text', placeholder: 'up from 1.6x' },
        ],
        section: 'Results',
        hint: 'The first four also show under the cover image.',
      },
      {
        key: 'comparison',
        label: 'Before vs after',
        type: 'rows',
        item: 'Row',
        columns: [
          { label: 'Metric', kind: 'text', placeholder: 'Blended ROAS' },
          { label: 'Before', kind: 'text', placeholder: '1.6x' },
          { label: 'After', kind: 'text', placeholder: '3.4x' },
        ],
      },
      { key: 'resultsSummary', label: 'Results summary', type: 'richtext', wide: true },
      { key: 'quote', label: 'Client response (quote)', type: 'richtext', wide: true, section: 'Client response', hint: 'Leave empty to hide the quote.' },
      { key: 'quoteName', label: 'Quote by', placeholder: 'Co-founder' },
      { key: 'quoteRole', label: 'Company / role', placeholder: 'Kulture Skin' },
      {
        key: 'learnings',
        label: 'Key takeaways',
        type: 'rows',
        item: 'Takeaway',
        columns: [
          { label: 'Takeaway', kind: 'text', placeholder: 'Fix tracking before touching budget' },
          { label: 'Why it mattered', kind: 'text', placeholder: 'Better signal improved CPA by 18%.' },
        ],
        section: 'Takeaways',
      },
    ],
  },
  portfolio: {
    name: 'portfolio',
    label: 'Projects',
    singular: 'project',
    icon: LayoutGrid,
    description: 'Project cards on the Portfolio page; each card opens its own page. Categories become the filter buttons automatically.',
    position: 'end',
    titleKey: 'title',
    subtitleKey: 'result',
    badgeKey: 'category',
    imageKey: 'image',
    fields: [
      { key: 'title', label: 'Project name', required: true },
      { key: 'category', label: 'Category', placeholder: 'Beauty' },
      { key: 'result', label: 'Outcome', placeholder: '3.4x ROAS', wide: true },
      { key: 'image', label: 'Image', type: 'image', wide: true },
      {
        key: 'detail',
        label: 'Project story (on the project’s own page)',
        type: 'richtext',
        wide: true,
        placeholder: 'Leave empty to use the standard write-up for this category.',
      },
    ],
  },
  creators: {
    name: 'creators',
    label: 'Creators',
    singular: 'creator',
    icon: Star,
    description: 'Photos in the parallax creator gallery.',
    position: 'end',
    fallbackTitle: 'Photo',
    imageKey: 'image',
    fields: [
      { key: 'image', label: 'Photo', type: 'image', wide: true },
    ],
  },
  blog: {
    name: 'blog',
    label: 'Articles',
    singular: 'article',
    icon: BookOpen,
    description: 'Article cards on the Blog page.',
    position: 'start',
    titleKey: 'title',
    subtitleKey: 'readTime',
    badgeKey: 'tag',
    imageKey: 'image',
    fields: [
      { key: 'title', label: 'Title', required: true, wide: true },
      { key: 'image', label: 'Cover image', type: 'image', wide: true },
      { key: 'tag', label: 'Topic tag', placeholder: 'Performance' },
      { key: 'date', label: 'Date', placeholder: '12.09.25' },
      { key: 'readTime', label: 'Read time', placeholder: '4 min read' },
      { key: 'style', label: 'Card colour (used when no image is set)', type: 'select', options: ['yellow', 'blue', 'soft'], default: 'yellow' },
      { key: 'excerpt', label: 'Intro (under the article title)', type: 'richtext', wide: true },
      {
        key: 'body',
        label: 'Article text',
        type: 'richtext',
        wide: true,
        placeholder: 'Blank line between paragraphs. "## " starts a heading, "- " a bullet, "> " a quote. Leave empty to keep the built-in text.',
      },
    ],
  },
  careers: {
    name: 'careers',
    label: 'Open roles',
    singular: 'role',
    icon: Briefcase,
    description: 'Job cards on the Careers page. Each card opens a "See description" popup with the full details below.',
    position: 'end',
    titleKey: 'title',
    subtitleKey: 'detail',
    badgeKey: 'type',
    fields: [
      { key: 'title', label: 'Role title', required: true, wide: true, section: 'Card', placeholder: 'Short-form Video Editor' },
      {
        key: 'type',
        label: 'Job type / location',
        placeholder: 'Full-time / Mumbai or Remote',
        wide: true,
        hint: 'Job type first, then each location after a "/". Each part becomes a chip on the card.',
      },
      { key: 'detail', label: 'Short description (on the card)', type: 'richtext', wide: true, placeholder: 'One or two lines about the role.' },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: ['Open', 'Hiring urgently', 'Closing soon'],
        default: 'Open',
        hint: '"Hiring urgently" and "Closing soon" show a badge on the card. Use Hide to take a role down.',
      },
      { key: 'department', label: 'Team / department', placeholder: 'Creative' },
      { key: 'experience', label: 'Experience', placeholder: '2–4 years', section: 'Job details' },
      { key: 'salary', label: 'Salary / pay', placeholder: '₹6–9 LPA' },
      { key: 'openings', label: 'Openings', placeholder: '2' },
      { key: 'applyBy', label: 'Apply by', placeholder: '31 Oct 2026' },
      { key: 'skills', label: 'Skills (comma separated)', wide: true, placeholder: 'Premiere Pro, After Effects, CapCut' },
      {
        key: 'description',
        label: 'About the role',
        type: 'richtext',
        wide: true,
        section: 'Full description',
        placeholder: 'Blank line between paragraphs. "## " starts a heading, "- " a bullet. Leave everything here empty to show the short description.',
      },
      {
        key: 'responsibilities',
        label: 'What you will do (one point per line)',
        type: 'textarea',
        wide: true,
        placeholder: 'Edit 15–20 Reels a week from raw creator footage\nCut hook variations for ad testing',
      },
      {
        key: 'requirements',
        label: 'What we are looking for (one point per line)',
        type: 'textarea',
        wide: true,
        placeholder: '2+ years editing short-form video\nA portfolio of Reels or ads',
      },
      { key: 'niceToHave', label: 'Nice to have (one point per line)', type: 'textarea', wide: true },
      {
        key: 'perks',
        label: 'Perks / what you get (one point per line)',
        type: 'textarea',
        wide: true,
        placeholder: 'Direct founder access\nFlexible hours',
      },
    ],
  },
  courses: {
    name: 'courses',
    label: 'Courses',
    singular: 'course',
    icon: GraduationCap,
    description: 'Course cards on the Courses page. Buyers pay by UPI in the purchase chat; their orders show under "Course orders".',
    position: 'end',
    titleKey: 'title',
    subtitleKey: 'tagline',
    badgeKey: 'badge',
    imageKey: 'image',
    fields: [
      { key: 'title', label: 'Course name', required: true, wide: true, placeholder: 'Creator Ads Masterclass' },
      { key: 'tagline', label: 'Short description (on the card)', type: 'richtext', wide: true, placeholder: 'One or two lines about what buyers will learn.' },
      { key: 'price', label: 'Price in ₹ (numbers only)', placeholder: '29', hint: 'The purchase chat asks for exactly this amount in the UPI QR.' },
      { key: 'originalPrice', label: 'Original price in ₹ (optional)', placeholder: '999', hint: 'Shown struck through next to the price.' },
      { key: 'image', label: 'Card image', type: 'image', wide: true },
      { key: 'badge', label: 'Badge (optional)', placeholder: 'Live batch' },
      { key: 'format', label: 'Format', placeholder: 'Live classes', hint: 'Shown in the details popup.' },
      { key: 'duration', label: 'Duration', placeholder: '4 weeks', section: 'Course details' },
      { key: 'level', label: 'Level', placeholder: 'Beginner' },
      { key: 'schedule', label: 'Schedule', wide: true, placeholder: 'Weekend live sessions, 7 PM IST' },
      { key: 'highlights', label: 'What you will learn (one point per line)', type: 'textarea', wide: true, placeholder: 'Write hooks that stop the scroll\nScript and brief creators for ads' },
      { key: 'includes', label: 'What you get (one point per line)', type: 'textarea', wide: true, placeholder: 'Live classes\nClass recordings to rewatch' },
      {
        key: 'description',
        label: 'About this course (optional)',
        type: 'richtext',
        wide: true,
        placeholder: 'Blank line between paragraphs. "## " starts a heading, "- " a bullet.',
      },
    ],
  },
};
