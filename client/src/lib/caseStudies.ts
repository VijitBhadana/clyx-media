import { useMemo } from 'react';
import { useCollection } from '@/lib/siteContent';
import { withUniqueSlugs } from '@/lib/slugs';
import { defaultCaseStudies, toCaseStudy, type CaseStudyItem } from '@/data/caseStudies';

/**
 * The case studies from the CMS (card + full write-up), shared by the Case Studies page and each case study's own page.
 * Two case studies for the same brand get different addresses ("-2", "-3"…).
 */
export function useCaseStudies() {
  const items = useCollection<CaseStudyItem>('caseStudies', defaultCaseStudies, toCaseStudy);
  return useMemo(() => (items === defaultCaseStudies ? items : withUniqueSlugs(items)), [items]);
}
