import { useCollection } from '@/lib/siteContent';
import { defaultCaseStudies, toCaseStudy, type CaseStudyItem } from '@/data/caseStudies';

/** The case studies from the CMS (card + full write-up), shared by the Case Studies page and each case study's own page. */
export function useCaseStudies() {
  return useCollection<CaseStudyItem>('caseStudies', defaultCaseStudies, toCaseStudy);
}
