import { lazy, Suspense, useCallback, useRef, useState } from 'react';
import { ArrowUpRight, BarChart3, Clock, MessageCircle, MonitorPlay, QrCode, ReceiptText, MousePointerClick, ShoppingCart, type LucideIcon } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import { Label } from '@/components/ui/primitives';
import { RevealWords } from '@/components/ui/ScrollMotion';
import { FormattedText } from '@/components/ui/FormattedText';
import { usePageTitle } from '@/hooks/usePageMeta';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { responsiveImage } from '@/lib/images';
import { parsePairs, usePageContent } from '@/lib/pageContent';
import { useCollection } from '@/lib/siteContent';
import { coursePrice, defaultCourses, formatRupees, toCourse, type Course } from '@/data/courses';
import '@/styles/courses.css';

// The popup and the chat (with the QR encoder) are only downloaded once a visitor points at or picks a course.
const loadDetails = () => import('@/components/sections/CourseDetailsDialog');
const CourseDetailsDialog = lazy(loadDetails);
const loadChat = () => import('@/components/sections/CourseChat');
const CourseChat = lazy(loadChat);
const preload = () => {
  loadDetails();
  loadChat();
};

const STEP_ICONS: LucideIcon[] = [MousePointerClick, QrCode, ReceiptText, MessageCircle];

export default function Courses() {
  usePageTitle('Courses | CLYX Media');
  const c = usePageContent('courses');
  const courses = useCollection<Course>('courses', defaultCourses, toCourse);
  const [details, setDetails] = useState<Course | null>(null);
  const lastDetails = useRef<Course | null>(null);
  if (details) lastDetails.current = details;
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMounted, setChatMounted] = useState(false);
  const [preferred, setPreferred] = useState<string | undefined>();
  const buy = useCallback((course?: Course) => {
    setDetails(null);
    setPreferred(course?.id);
    setChatMounted(true);
    setChatOpen(true);
  }, []);
  const closeChat = useCallback(() => setChatOpen(false), []);
  const whatsapp = (c.whatsappNumber || '').replace(/\D/g, '');
  const helpHref = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hi CLYX! I have a question about your courses.')}` : '/contact';

  return (
    <PageShell
      eyebrow={c.heroEyebrow}
      title={<>{c.heroTitle}<br /><RevealWords className="text-yellow" text={c.heroHighlight} delay={450} /></>}
      intro=""
      lead={c.heroIntro ? <p className="crs-lead"><FormattedText text={c.heroIntro} /></p> : undefined}
      aside={<HeroCard c={c} />}
    >
      <StepsStrip c={c} />
      <section id="course-list" className="crs-list scroll-mt-24">
        <div className="container">
          <div className="crs-list-head">
            <Label className="!mb-3">{c.listLabel}</Label>
            <h2 className="display crs-list-title">{c.listTitle} <span className="crs-hl">{c.listHighlight}</span></h2>
          </div>
          {courses.length === 0 ? (
            <p className="crs-empty">{c.emptyText}</p>
          ) : (
            <div className={`crs-grid${courses.length === 1 ? ' is-single' : ''}`}>
              {courses.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} c={c} onDetails={() => setDetails(course)} onBuy={() => buy(course)} />
              ))}
            </div>
          )}
          {c.helpText && (
            <div className="crs-help">
              <p><FormattedText text={c.helpText} /></p>
              <a href={helpHref} target={whatsapp ? '_blank' : undefined} rel="noreferrer">
                {c.helpLink} <ArrowUpRight size={14} />
              </a>
            </div>
          )}
        </div>
      </section>

      {lastDetails.current && (
        <Suspense fallback={null}>
          <CourseDetailsDialog open={details !== null} onOpenChange={(o) => !o && setDetails(null)} course={lastDetails.current} onBuy={() => buy(lastDetails.current!)} content={c} />
        </Suspense>
      )}
      {chatMounted && (
        <Suspense fallback={null}>
          <CourseChat open={chatOpen} onClose={closeChat} courses={courses} preferredId={preferred} content={c} />
        </Suspense>
      )}
    </PageShell>
  );
}

/** Intro card on the right of the hero: how joining works, and a jump to the course cards. */
function HeroCard({ c }: { c: Record<string, string> }) {
  const points = parsePairs(c.heroCardPoints);
  const icons = [MonitorPlay, QrCode, MessageCircle];
  return (
    <div className="ih-card crs-hero-card">
      {c.heroCardTitle && <p className="crs-hero-card-title">{c.heroCardTitle}</p>}
      <ul className="crs-hero-points">
        {points.map(([title, text], i) => {
          const Icon = icons[i % icons.length];
          return (
            <li key={i}>
              <span className="crs-hero-icon" aria-hidden="true"><Icon size={18} /></span>
              <span>
                <strong>{title}</strong>
                {text && <small>{text}</small>}
              </span>
            </li>
          );
        })}
      </ul>
      {c.heroCardButton && (
        <div className="ih-actions">
          <a href="#course-list" className="ih-btn ih-btn-primary" onPointerEnter={preload}>
            {c.heroCardButton} <ArrowUpRight size={16} />
          </a>
        </div>
      )}
    </div>
  );
}

/** Four numbered steps from picking a course to getting the class link. */
function StepsStrip({ c }: { c: Record<string, string> }) {
  const steps = parsePairs(c.steps);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useScrollReveal(ref);
  if (!steps.length) return null;
  return (
    <section className="crs-steps">
      <div className="container">
        {c.stepsLabel && <Label className="!mb-5">{c.stepsLabel}</Label>}
        <div ref={ref} className={`crs-steps-grid${inView ? ' is-in' : ''}`}>
          {steps.map(([title, text], i) => {
            const Icon = STEP_ICONS[i % STEP_ICONS.length];
            return (
              <div key={i} className="crs-step" style={{ '--i': i } as React.CSSProperties}>
                <span className="crs-step-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="crs-step-icon" aria-hidden="true"><Icon size={20} /></span>
                <h3 className="display">{title}</h3>
                {text && <p>{text}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CourseCard({ course, index, c, onDetails, onBuy }: { course: Course; index: number; c: Record<string, string>; onDetails: () => void; onBuy: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useScrollReveal(ref);
  const price = coursePrice(course);
  const original = Number(course.originalPrice) || 0;
  const off = original > price && price > 0 ? Math.round((1 - price / original) * 100) : 0;
  const meta = [
    [Clock, course.duration],
    [BarChart3, course.level],
  ].filter(([, value]) => value) as [LucideIcon, string][];
  return (
    // A div, not an article: the dark theme pads every <article> on inner pages, which would inset the image.
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`crs-card${inView ? ' is-in' : ''}`} style={{ '--d': `${index * 120}ms` } as React.CSSProperties} onPointerEnter={preload}>
      <div className="crs-card-media">
        {course.image ? <img {...responsiveImage(course.image, '(min-width: 1024px) 560px, (min-width: 768px) 50vw, 100vw')} alt="" loading="lazy" decoding="async" /> : <div className="crs-card-noimg" aria-hidden="true"><MonitorPlay size={40} /></div>}
        {course.badge && <span className="crs-badge">{course.badge}</span>}
        {course.format && (
          <span className="crs-format">
            <span className="crs-live-dot" aria-hidden="true" />
            {course.format}
          </span>
        )}
      </div>
      <div className="crs-card-body">
        {meta.length > 0 && (
          <p className="crs-meta">
            {meta.map(([Icon, value]) => (
              <span key={value}>
                <Icon size={13} /> {value}
              </span>
            ))}
          </p>
        )}
        <h3 className="display crs-card-title">{course.title}</h3>
        {course.tagline && <p className="crs-card-text"><FormattedText text={course.tagline} /></p>}
        <div className="crs-card-foot">
          {price > 0 && (
            <p className="crs-price">
              <strong>{formatRupees(price)}</strong>
              {original > price && <s>{formatRupees(original)}</s>}
              {off > 0 && c.offLabel && <span className="crs-off">{c.offLabel.replace('{n}', String(off))}</span>}
            </p>
          )}
          <div className="crs-actions">
            <button type="button" className="crs-btn is-ghost" onClick={onDetails} onFocus={preload}>
              {c.detailsButton}
            </button>
            <button type="button" className="crs-btn is-solid" onClick={onBuy} onFocus={preload}>
              <ShoppingCart size={15} /> {c.buyButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
