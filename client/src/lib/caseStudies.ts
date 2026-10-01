import { useCollection } from '@/lib/siteContent';
import { defaultCaseStudies, slugify, type CaseStudyItem } from '@/data/caseStudies';

/** The case-study cards from the CMS, shared by the Case Studies page and each case study's own page. */
export function useCaseStudies() {
  return useCollection<CaseStudyItem>('caseStudies', defaultCaseStudies, (item, i) => ({
    id: item.id,
    slug: slugify(String(item.brand || item.id)),
    code: String(i + 1).padStart(2, '0'),
    brand: item.brand,
    category: item.category,
    headline: item.headline,
    result: item.result,
    detail: item.detail,
    src: item.image,
    alt: `${item.brand} Campaign`,
    accent: item.accent || '#FFDE59',
  }));
}
