import {
  BarChart3,
  BookOpen,
  Briefcase,
  Film,
  LayoutGrid,
  MessageSquareQuote,
  Star,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { CollectionName } from '@/lib/pageContent';

export type ItemFieldType = 'text' | 'textarea' | 'image' | 'url' | 'select' | 'color';
export type ItemField = {
  key: string;
  label: string;
  type?: ItemFieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  default?: string;
  wide?: boolean;
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
  titleKey: string;
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
      { key: 'desc', label: 'Description', type: 'textarea', wide: true },
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
      { key: 'bio', label: 'Short bio', type: 'textarea', wide: true },
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
      { key: 'quote', label: 'Quote', type: 'textarea', required: true, wide: true },
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
    description: 'The expanding case-study panels on the Case Studies page.',
    position: 'start',
    titleKey: 'brand',
    subtitleKey: 'headline',
    badgeKey: 'result',
    imageKey: 'image',
    fields: [
      { key: 'brand', label: 'Brand', required: true },
      { key: 'category', label: 'Category', placeholder: 'Beauty / Creator commerce' },
      { key: 'headline', label: 'Headline', wide: true },
      { key: 'result', label: 'Result', placeholder: '3.4x ROAS' },
      { key: 'accent', label: 'Accent colour', type: 'color', default: '#FFDE59' },
      { key: 'detail', label: 'Story', type: 'textarea', wide: true },
      { key: 'image', label: 'Image', type: 'image', wide: true },
    ],
  },
  portfolio: {
    name: 'portfolio',
    label: 'Projects',
    singular: 'project',
    icon: LayoutGrid,
    description: 'Project cards on the Portfolio page. Categories become the filter buttons automatically.',
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
    ],
  },
  creators: {
    name: 'creators',
    label: 'Creators',
    singular: 'creator',
    icon: Star,
    description: 'Photos in the parallax creator gallery.',
    position: 'end',
    titleKey: 'name',
    subtitleKey: 'handle',
    badgeKey: 'platform',
    imageKey: 'image',
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'handle', label: 'Handle', placeholder: '@creator' },
      { key: 'platform', label: 'Platform', placeholder: 'Instagram' },
      { key: 'reach', label: 'Reach', placeholder: '500K' },
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
    fields: [
      { key: 'title', label: 'Title', required: true, wide: true },
      { key: 'tag', label: 'Topic tag', placeholder: 'Performance' },
      { key: 'date', label: 'Date', placeholder: '12.09.25' },
      { key: 'readTime', label: 'Read time', placeholder: '4 min read' },
      { key: 'style', label: 'Card colour', type: 'select', options: ['yellow', 'blue', 'soft'], default: 'yellow' },
      { key: 'excerpt', label: 'Intro (under the article title)', type: 'textarea', wide: true },
      {
        key: 'body',
        label: 'Article text',
        type: 'textarea',
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
    description: 'Open positions listed on the Careers page.',
    position: 'end',
    titleKey: 'title',
    subtitleKey: 'detail',
    badgeKey: 'type',
    fields: [
      { key: 'title', label: 'Role title', required: true, wide: true },
      { key: 'type', label: 'Type / location', placeholder: 'Full-time / Remote', wide: true },
      { key: 'detail', label: 'Short description', type: 'textarea', wide: true },
    ],
  },
};
