import { useLocation } from 'wouter';
import { usePageContent } from '@/lib/pageContent';
import CoursePeek from './CoursePeek';

/** The peeking guide on every page except Courses (which has its own): clicking takes the visitor to Courses with the purchase chat open. */
export default function SitePeek() {
  const g = usePageContent('global');
  const [, navigate] = useLocation();
  return <CoursePeek low text={g.peekText} button={g.peekButton} onEnroll={() => navigate('/courses?enroll=1')} />;
}
