import { BookOpen, Briefcase, Film, Globe, GraduationCap, Home, Info, Layers, LayoutGrid, Mail, Star, type LucideIcon } from 'lucide-react';
import type { PageId } from '@/lib/pageContent';

/** Sidebar icon for each website page (same order as the site's navbar). */
export const PAGE_ICONS: Record<PageId, LucideIcon> = {
  global: Globe,
  home: Home,
  about: Info,
  services: Layers,
  portfolio: LayoutGrid,
  caseStudies: Film,
  creators: Star,
  blog: BookOpen,
  careers: Briefcase,
  courses: GraduationCap,
  contact: Mail,
};
