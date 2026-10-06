import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowUpRight, Banknote, ChevronDown, ChevronLeft, ChevronRight, CircleCheck, CirclePlay, Compass, Facebook, Instagram,
  Linkedin, LockOpen, MonitorPlay, Play, Plus, ShoppingCart, Sparkles, TrendingUp, Twitter, X, Youtube, type LucideIcon,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { CookieBar, WhatsAppButton } from '@/components/layout/Footer';
import CoursePeek from '@/components/sections/CoursePeek';
import BrandLogo from '@/components/ui/BrandLogo';
import { FormattedText } from '@/components/ui/FormattedText';
import { usePageTitle } from '@/hooks/usePageMeta';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { responsiveImage } from '@/lib/images';
import { parsePairs, splitLines, usePageContent } from '@/lib/pageContent';
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

type Copy = Record<string, string>;
const nn = (n: number) => String(n).padStart(2, '0');
/** "a | b | c" -> ['a', 'b', 'c'], for list fields with more than two parts per line. */
const parts = (text: string | undefined) => splitLines(text).map((line) => line.split('|').map((s) => s.trim()));

/**
 * Courses sales page: hero, the problem, the course cards, curriculum, certificate, student videos, brands, mentor,
 * FAQ and a closing call to action, with an enroll bar pinned to the bottom once the hero is out of view.
 * Every "Enroll" button opens the purchase chat (with the course already picked when there is only one).
 * The page keeps its own navy / cream / lime look in both site themes.
 */
export default function Courses() {
  const c = usePageContent('courses');
  const g = usePageContent('global');
  usePageTitle(c.pageTitle || 'Courses | CLYX Media');
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
  const enroll = useCallback(() => buy(courses.length === 1 ? courses[0] : undefined), [buy, courses]);
  const closeChat = useCallback(() => setChatOpen(false), []);
  // Arriving from the peeking guide on another page (/courses?enroll=1): open the purchase chat straight away.
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('enroll')) return;
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.hash);
    buy();
  }, [buy]);

  // Numbered sections ("01 — The problem"); a section the admin left empty drops out and the rest renumber.
  const numbered: [string, (n: number) => ReactNode][] = [];
  if (c.problemLine1 || splitLines(c.problemPoints).length) numbered.push(['problem', (n) => <Problem key="problem" n={n} c={c} />]);
  numbered.push(['courses', (n) => <CourseList key="courses" n={n} c={c} courses={courses} onDetails={setDetails} onBuy={buy} onEnroll={enroll} />]);
  if (parsePairs(c.currModules).length) numbered.push(['curriculum', (n) => <Curriculum key="curriculum" n={n} c={c} />]);
  if (c.certTitle) numbered.push(['certificate', (n) => <Certificate key="certificate" n={n} c={c} logo={g.logoImage} onEnroll={enroll} />]);
  if (c.testTitle || parts(c.testimonials).length) numbered.push(['testimonials', (n) => <Testimonials key="testimonials" n={n} c={c} />]);
  if (c.mentorTitle) numbered.push(['mentor', (n) => <Mentor key="mentor" n={n} c={c} />]);
  if (parsePairs(c.faqs).length) numbered.push(['faq', (n) => <Faq key="faq" n={n} c={c} />]);

  return (
    <div className="cr-page">
      <Header />
      <main>
        <Hero c={c} onEnroll={enroll} />
        {numbered.map(([id, render], i) => {
          // The brands strip sits between the student videos and the mentor, outside the numbering.
          const node = render(i + 1);
          return id === 'mentor' ? <Brands key="brands" c={c} after={node} /> : node;
        })}
        {!c.mentorTitle && <Brands c={c} />}
        <CtaBand c={c} onEnroll={enroll} />
      </main>
      <CourseFooter c={c} />
      <EnrollBar c={c} course={courses[0]} onEnroll={enroll} hidden={chatOpen || details !== null} />
      <CoursePeek text={g.peekText} button={g.peekButton} onEnroll={enroll} hidden={chatOpen || details !== null} />
      <WhatsAppButton />
      <CookieBar />

      {lastDetails.current && (
        <Suspense fallback={null}>
          <CourseDetailsDialog open={details !== null} onOpenChange={(o) => !o && setDetails(null)} course={lastDetails.current} onBuy={() => buy(lastDetails.current!)} content={c} />
        </Suspense>
      )}
      {chatMounted && (
        <Suspense fallback={null}>
          <CourseChat open={chatOpen} onClose={closeChat} courses={courses} preferredId={preferred} content={c} logo={g.logoImage} />
        </Suspense>
      )}
    </div>
  );
}

/** Fades a section's content up once it scrolls into view (and again on the way back). */
function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useScrollReveal(ref);
  return <div ref={ref} className={`cr-wrap cr-reveal${inView ? ' is-in' : ''} ${className}`}>{children}</div>;
}

function Eyebrow({ n, text }: { n?: number; text: string }) {
  if (!text) return null;
  return <p className="cr-label">{n ? `${nn(n)} — ` : ''}{text}</p>;
}

function EnrollButton({ label, onClick, className = '', icon }: { label: string; onClick: () => void; className?: string; icon?: ReactNode }) {
  if (!label) return null;
  return (
    <button type="button" className={`cr-btn ${className}`} onClick={onClick} onPointerEnter={preload} onFocus={preload}>
      {icon}{label}
    </button>
  );
}

/* ---------- Hero ---------- */

const HERO_ICONS: LucideIcon[] = [Compass, TrendingUp, Banknote];

function Hero({ c, onEnroll }: { c: Copy; onEnroll: () => void }) {
  const points = splitLines(c.heroPoints);
  const stats = parsePairs(c.heroStats);
  return (
    <section className="cr-hero">
      <div className="cr-wrap cr-hero-grid">
        <div className="cr-hero-copy">
          <h1 className="cr-hero-title">
            <span>{c.heroTitle}</span>
            {c.heroHighlight && <span className="cr-hero-hl">{c.heroHighlight}</span>}
          </h1>
          {points.length > 0 && (
            <ul className="cr-hero-points">
              {points.map((point, i) => {
                const Icon = HERO_ICONS[i % HERO_ICONS.length];
                return <li key={i}><Icon size={20} strokeWidth={1.8} aria-hidden="true" />{point}</li>;
              })}
            </ul>
          )}
          <EnrollButton label={c.heroButton} onClick={onEnroll} className="cr-btn-lime cr-hero-btn" />
          {stats.length > 0 && (
            <dl className="cr-hero-stats">
              {stats.map(([label, value], i) => (
                <div key={i}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="cr-hero-art">
          <div className="cr-arch">
            <span className="cr-arch-ring" aria-hidden="true" />
            {c.heroImage && <img {...responsiveImage(c.heroImage, '(min-width: 1024px) 430px, 80vw')} alt="" fetchPriority="high" decoding="async" />}
          </div>
          {c.heroBadge && <span className="cr-hero-pill"><CirclePlay size={18} aria-hidden="true" />{c.heroBadge}</span>}
        </div>
      </div>
    </section>
  );
}

/* ---------- 01 The problem ---------- */

function Problem({ n, c }: { n: number; c: Copy }) {
  const points = splitLines(c.problemPoints);
  return (
    <section className="cr-sec cr-cream">
      <Reveal className="cr-split cr-split-problem">
        <div>
          <Eyebrow n={n} text={c.problemLabel} />
          <h2 className="cr-h2">
            {c.problemWord1 && <span className="cr-red">{c.problemWord1} </span>}{c.problemLine1}
            <br />
            {c.problemWord2 && <><mark className="cr-mark">{c.problemWord2}</mark> </>}{c.problemLine2}
          </h2>
        </div>
        {points.length > 0 && (
          <ol className="cr-lines cr-problem-list">
            {points.map((point, i) => (
              <li key={i}>
                <span className="cr-num is-red">{nn(i + 1)}</span>
                <p>{point}</p>
              </li>
            ))}
          </ol>
        )}
      </Reveal>
    </section>
  );
}

/* ---------- 02 Courses ---------- */

function CourseList({ n, c, courses, onDetails, onBuy, onEnroll }: { n: number; c: Copy; courses: Course[]; onDetails: (course: Course) => void; onBuy: (course: Course) => void; onEnroll: () => void }) {
  return (
    <section id="course-list" className="cr-sec cr-navy scroll-mt-24">
      <Reveal>
        <Eyebrow n={n} text={c.listLabel} />
        <h2 className="cr-h2">{c.listTitle} {c.listHighlight && <span className="cr-lime">{c.listHighlight}</span>}</h2>
        {courses.length === 0 ? (
          <p className="cr-empty">{c.emptyText}</p>
        ) : (
          <div className={`cr-cards${courses.length === 1 ? ' is-single' : ''}`}>
            {courses.map((course) => <CourseCard key={course.id} course={course} c={c} onDetails={() => onDetails(course)} onBuy={() => onBuy(course)} />)}
          </div>
        )}
        {courses.length > 0 && (
          <div className="cr-center">
            <EnrollButton label={c.listButton} onClick={onEnroll} className="cr-btn-lime" icon={<LockOpen size={18} aria-hidden="true" />} />
          </div>
        )}
      </Reveal>
    </section>
  );
}

/** A course card: "See more details" opens the details popup, "Buy now" opens the purchase chat with this course picked. */
function CourseCard({ course, c, onDetails, onBuy }: { course: Course; c: Copy; onDetails: () => void; onBuy: () => void }) {
  const price = coursePrice(course);
  const original = Number(course.originalPrice) || 0;
  return (
    // A div, not an article: the dark theme pads every <article> on inner pages.
    <div className="cr-card" onPointerEnter={preload}>
      <div className="cr-card-media">
        {course.image ? <img {...responsiveImage(course.image, '(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw')} alt="" loading="lazy" decoding="async" /> : <span className="cr-card-noimg" aria-hidden="true"><MonitorPlay size={40} /></span>}
        {course.badge && <span className="cr-card-badge">{course.badge}</span>}
      </div>
      <div className="cr-card-body">
        <h3 className="cr-card-title">
          <button type="button" className="cr-card-link" onClick={onDetails} onFocus={preload} tabIndex={-1}>{course.title}</button>
        </h3>
        {course.tagline && <p className="cr-card-text"><FormattedText text={course.tagline} /></p>}
        <div className="cr-card-foot">
          {original > price && <s>{formatRupees(original)}</s>}
          {price > 0 && <span className="cr-price-pill">{formatRupees(price)}</span>}
        </div>
        <div className="cr-card-actions">
          <button type="button" className="cr-card-btn is-ghost" onClick={onDetails} onFocus={preload}>
            {c.detailsButton}<ArrowUpRight size={15} aria-hidden="true" />
          </button>
          <button type="button" className="cr-card-btn is-lime" onClick={onBuy} onFocus={preload}>
            <ShoppingCart size={15} aria-hidden="true" />{c.cardBuyButton}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Accordion (curriculum + FAQ) ---------- */

function Accordion({ items, numbered, plus }: { items: [string, string][]; numbered?: boolean; plus?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="cr-lines cr-acc">
      {items.map(([title, text], i) => {
        const isOpen = open === i;
        const id = `cr-acc-${numbered ? 'm' : 'q'}-${i}`;
        return (
          <div key={i} className={`cr-acc-item${isOpen ? ' is-open' : ''}`}>
            <button type="button" className="cr-acc-btn" aria-expanded={isOpen} aria-controls={id} onClick={() => setOpen(isOpen ? null : i)} disabled={!text}>
              {numbered && <span className="cr-num">{nn(i + 1)}</span>}
              <span className="cr-acc-title">{title}</span>
              {text && (plus ? <Plus className="cr-acc-icon is-plus" size={20} strokeWidth={1.5} aria-hidden="true" /> : <ChevronDown className="cr-acc-icon" size={20} strokeWidth={1.6} aria-hidden="true" />)}
            </button>
            {text && (
              <div id={id} className="cr-acc-panel" role="region" aria-hidden={!isOpen}>
                <div><p className={numbered ? 'is-indented' : ''}><FormattedText text={text} /></p></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- 03 Curriculum ---------- */

function Curriculum({ n, c }: { n: number; c: Copy }) {
  return (
    <section className="cr-sec cr-cream">
      <Reveal>
        <Eyebrow n={n} text={c.currLabel} />
        <h2 className="cr-h2">{c.currTitle}</h2>
        <div className="cr-curr-grid">
          {c.currImage ? (
            <div className="cr-curr-media">
              <img {...responsiveImage(c.currImage, '(min-width: 1024px) 450px, 100vw')} alt="" loading="lazy" decoding="async" />
            </div>
          ) : <span />}
          <div>
            <Accordion items={parsePairs(c.currModules)} numbered plus />
            {c.currMore && <p className="cr-more">{c.currMore}</p>}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- 04 Certificate ---------- */

function Certificate({ n, c, logo, onEnroll }: { n: number; c: Copy; logo?: string; onEnroll: () => void }) {
  const points = splitLines(c.certPoints);
  const tilt = useTilt();
  return (
    <section className="cr-sec cr-navy cr-cert-sec">
      <Reveal className="cr-cert-grid">
        <div>
          <Eyebrow n={n} text={c.certLabel} />
          <h2 className="cr-h2">{c.certTitle}</h2>
          {points.length > 0 && (
            <ul className="cr-checks">
              {points.map((point, i) => <li key={i}><CircleCheck size={20} aria-hidden="true" />{point}</li>)}
            </ul>
          )}
          <EnrollButton label={c.certButton} onClick={onEnroll} className="cr-btn-lime cr-cert-btn" />
        </div>
        <div className="cr-cert-wrap" {...tilt}>
          {c.certImage ? <img className="cr-cert-img" src={c.certImage} alt="" loading="lazy" decoding="async" /> : <CertificateArt c={c} logo={logo} />}
        </div>
      </Reveal>
    </section>
  );
}

/** 3D tilt that follows the mouse: writes the angles and glare spot as CSS variables on the hovered element. */
function useTilt() {
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = e.currentTarget;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.classList.add('is-tilting');
      el.style.setProperty('--cr-ry', `${(x - 0.5) * 16}deg`);
      el.style.setProperty('--cr-rx', `${(0.5 - y) * 12}deg`);
      el.style.setProperty('--cr-mx', `${x * 100}%`);
      el.style.setProperty('--cr-my', `${y * 100}%`);
    });
  }, []);
  const onPointerLeave = useCallback((e: React.PointerEvent<HTMLElement>) => {
    cancelAnimationFrame(frame.current);
    const el = e.currentTarget;
    el.classList.remove('is-tilting');
    ['--cr-rx', '--cr-ry', '--cr-mx', '--cr-my'].forEach((v) => el.style.removeProperty(v));
  }, []);
  return { onPointerMove, onPointerLeave };
}

/** A sample CLYX certificate drawn in HTML, shown unless an image is set in the admin. Sized in container units. */
function CertificateArt({ c, logo }: { c: Copy; logo?: string }) {
  const signers = parsePairs(c.certSigners);
  return (
    <div className="cr-cert" aria-hidden="true">
      <div className="cr-cert-side">
        <BrandLogo size={56} src={logo} className="cr-cert-logo" />
        {c.certBrand && <span>{c.certBrand}</span>}
        <i className="cr-tri is-a" /><i className="cr-tri is-b" /><i className="cr-tri is-c" />
      </div>
      <div className="cr-cert-main">
        <i className="cr-tri is-d" /><i className="cr-tri is-e" />
        <span className="cr-medal"><span /></span>
        <p className="cr-cert-title">{c.certHeading}</p>
        <p className="cr-cert-sub">{c.certSubheading}</p>
        <p className="cr-cert-small">{c.certLead}</p>
        <p className="cr-cert-name">{c.certName}</p>
        <p className="cr-cert-body">{c.certBody}</p>
        {signers.length > 0 && (
          <div className="cr-cert-signs">
            {signers.map(([sign, role], i) => (
              <div key={i}>
                <span className="cr-cert-sign">{sign}</span>
                <span className="cr-cert-role">{role}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 05 Testimonials ---------- */

// `autoThumb`: YouTube's own cover, which is letterboxed, so the card zooms in past the black bars.
type Video = { name: string; url: string; thumb: string; youtube: string; autoThumb: boolean };
const youtubeId = (url: string) => /(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/.exec(url)?.[1] ?? '';
const isVideoFile = (url: string) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url);

const REEL_SPEED = 28; // px per second
const REEL_MIN_CARDS = 10; // one loop copy must be wider than the widest screen

function Testimonials({ n, c }: { n: number; c: Copy }) {
  const videos: Video[] = parts(c.testimonials).map(([name = '', url = '', thumb = '']) => {
    const youtube = youtubeId(url);
    return { name, url, youtube, thumb: thumb || (youtube ? `https://i.ytimg.com/vi/${youtube}/hqdefault.jpg` : ''), autoThumb: !thumb && !!youtube };
  });
  const reel = useRef<HTMLDivElement>(null);
  const [auto] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [edge, setEdge] = useState({ start: true, end: false });
  const [playing, setPlaying] = useState<Video | null>(null);
  const hold = useRef({ hover: false, touch: false, modal: false, until: 0 });
  hold.current.modal = !!playing;

  // Auto-play loops the cards: enough copies to fill a wide screen, then that whole set twice so the wrap is seamless.
  const count = videos.length || 5;
  const perSet = auto ? Math.ceil(REEL_MIN_CARDS / count) * count : count;
  const slots = Array.from({ length: auto ? perSet * 2 : count }, (_, i) => i);

  const update = useCallback(() => {
    const el = reel.current;
    if (el && !auto) setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  }, [auto]);
  useEffect(update, [update, videos.length]);

  // Distance after which the second copy lines up with the first.
  const period = useCallback(() => {
    const el = reel.current;
    const first = el?.children[0] as HTMLElement | undefined;
    const twin = el?.children[perSet] as HTMLElement | undefined;
    return first && twin ? twin.offsetLeft - first.offsetLeft : 0;
  }, [perSet]);

  // Drifts left to right; pauses on hover, touch, after an arrow click, while a video plays and when off screen.
  useEffect(() => {
    const el = reel.current;
    if (!auto || !el) return;
    let pos = -1;
    let last = 0;
    let frame = 0;
    let visible = false;
    const tick = (now: number) => {
      const loop = period();
      const dt = last ? Math.min(now - last, 64) / 1000 : 0;
      last = now;
      if (loop > 0) {
        if (pos < 0 || Math.abs(el.scrollLeft - pos) > 2) pos = el.scrollLeft; // the visitor scrolled it
        const h = hold.current;
        if (!h.hover && !h.touch && !h.modal && now > h.until) pos -= REEL_SPEED * dt;
        if (pos <= 0) pos += loop;
        else if (pos > loop * 1.5) pos -= loop;
        if (Math.abs(el.scrollLeft - pos) >= 0.5) el.scrollLeft = pos;
      }
      frame = visible ? requestAnimationFrame(tick) : 0;
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [auto, period]);

  const step = (dir: number) => {
    const el = reel.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const by = card.offsetWidth + 20;
    if (auto) {
      // Jump to the same spot in the other copy first, so the loop never runs out.
      const loop = period();
      if (dir < 0 && el.scrollLeft < by) el.scrollLeft += loop;
      if (dir > 0 && el.scrollLeft + by > loop * 1.5) el.scrollLeft -= loop;
      hold.current.until = performance.now() + 1500;
    }
    el.scrollBy({ left: dir * by, behavior: 'smooth' });
  };
  const play = (video: Video) => {
    if (video.youtube || isVideoFile(video.url)) setPlaying(video);
    else if (video.url) window.open(video.url, '_blank', 'noopener');
  };
  const pause = {
    onPointerEnter: (e: React.PointerEvent) => { if (e.pointerType === 'mouse') hold.current.hover = true; },
    onPointerLeave: (e: React.PointerEvent) => { if (e.pointerType === 'mouse') hold.current.hover = false; },
    onTouchStart: () => { hold.current.touch = true; },
    onTouchEnd: () => {
      hold.current.touch = false;
      hold.current.until = performance.now() + 2000;
    },
  };
  return (
    <section className="cr-sec cr-navy">
      <Reveal>
        <div className="cr-head-row">
          <div>
            <Eyebrow n={n} text={c.testLabel} />
            <h2 className="cr-h2">{c.testTitle}</h2>
          </div>
          <div className="cr-arrows">
            <button type="button" onClick={() => step(-1)} disabled={!auto && edge.start} aria-label={c.testPrev || 'Previous'}><ChevronLeft size={20} /></button>
            <button type="button" onClick={() => step(1)} disabled={!auto && edge.end} aria-label={c.testNext || 'Next'}><ChevronRight size={20} /></button>
          </div>
        </div>
        <div ref={reel} className={`cr-reel${auto ? ' is-auto' : ''}`} onScroll={update} {...pause}>
          {slots.map((slot) => {
            const copy = slot >= videos.length; // loop copies stay out of screen readers and the tab order
            const video = videos[slot % count];
            // No videos yet: placeholder cards keep the section's shape until the admin adds some.
            if (!video) {
              return (
                <div key={slot} className="cr-reel-card is-soon" aria-hidden={slot > 0 || undefined}>
                  <span className="cr-play"><Play size={22} fill="currentColor" aria-hidden="true" /></span>
                  {c.testSoon && <span className="cr-reel-name">{c.testSoon}</span>}
                </div>
              );
            }
            return (
              <button key={slot} type="button" className="cr-reel-card" onClick={() => play(video)} aria-hidden={copy || undefined} tabIndex={copy ? -1 : undefined} aria-label={video.name ? `Play ${video.name}'s video` : 'Play video'}>
                {video.thumb ? (
                  <img src={video.thumb} alt="" loading="lazy" decoding="async" className={video.autoThumb ? 'is-yt' : undefined} />
                ) : isVideoFile(video.url) && (
                  // An uploaded video without a cover shows its own first frame.
                  <video src={`${video.url}#t=0.5`} muted playsInline preload="metadata" tabIndex={-1} />
                )}
                <span className="cr-play"><Play size={22} fill="currentColor" aria-hidden="true" /></span>
                {video.name && <span className="cr-reel-name">{video.name}</span>}
              </button>
            );
          })}
        </div>
      </Reveal>
      {playing && <VideoModal video={playing} onClose={() => setPlaying(null)} />}
    </section>
  );
}

function VideoModal({ video, onClose }: { video: Video; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);
  return (
    <div className="cr-video" role="dialog" aria-modal="true" aria-label={video.name || 'Student video'} onClick={onClose}>
      <div className="cr-video-box" onClick={(e) => e.stopPropagation()}>
        {video.youtube
          ? <iframe src={`https://www.youtube-nocookie.com/embed/${video.youtube}?autoplay=1&rel=0`} title={video.name || 'Student video'} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
          : <video src={video.url} controls autoPlay playsInline />}
      </div>
      <button type="button" className="cr-video-close" onClick={onClose} aria-label="Close video"><X size={20} /></button>
    </div>
  );
}

/* ---------- Brands strip ---------- */

function Brands({ c, after }: { c: Copy; after?: ReactNode }) {
  const brands = parsePairs(c.brands);
  if (!brands.length) return <>{after}</>;
  // Enough copies to fill a wide screen, then the whole row twice so the loop is seamless.
  const row = Array.from({ length: Math.max(1, Math.ceil(10 / brands.length)) }, () => brands).flat();
  return (
    <>
      <section className={`cr-brands${after ? ' has-next' : ''}`}>
        <div className="cr-wrap">
          <p className="cr-brands-label"><span>{c.brandsLabel}</span></p>
        </div>
        <div className="cr-marquee">
          <div className="cr-marquee-track" style={{ '--cr-count': row.length } as React.CSSProperties}>
            {[0, 1].map((copy) =>
              row.map(([name, logo], i) => (
                <span key={`${copy}-${i}`} className="cr-brand" aria-hidden={copy === 1 || i >= brands.length || undefined}>
                  {/^(https?:|\/|data:image\/)/.test(logo) ? <img src={logo} alt={name} loading="lazy" decoding="async" /> : <strong>{name}</strong>}
                </span>
              )),
            )}
          </div>
        </div>
      </section>
      {after}
    </>
  );
}

/* ---------- 06 Mentor ---------- */

const SOCIAL: Record<string, [LucideIcon, string]> = {
  youtube: [Youtube, 'is-yt'],
  facebook: [Facebook, 'is-fb'],
  instagram: [Instagram, 'is-ig'],
  linkedin: [Linkedin, 'is-in'],
  twitter: [Twitter, 'is-x'],
  x: [Twitter, 'is-x'],
};

/** Paragraphs from the admin text; **double asterisks** make a phrase bold. */
function RichParagraphs({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n\s*\n/).map((para, i) => (
        <p key={i}>
          {para.split(/(\*\*[^*]+\*\*)/).map((bit, j) => (bit.startsWith('**') && bit.endsWith('**') ? <strong key={j}>{bit.slice(2, -2)}</strong> : bit))}
        </p>
      ))}
    </>
  );
}

function Mentor({ n, c }: { n: number; c: Copy }) {
  const stats = parts(c.mentorStats);
  return (
    <section className="cr-sec cr-navy cr-mentor-sec">
      <Reveal className="cr-mentor-grid">
        <div className="cr-mentor-photo">
          {c.mentorImage && <img {...responsiveImage(c.mentorImage, '(min-width: 1024px) 390px, 100vw')} alt="" loading="lazy" decoding="async" />}
          <div className="cr-mentor-cap">
            {c.mentorTag && <p className="cr-mentor-tag">{c.mentorTag}</p>}
            {c.mentorName && <p className="cr-mentor-name">{c.mentorName}</p>}
            {c.mentorRole && <p className="cr-mentor-role">{c.mentorRole}</p>}
          </div>
        </div>
        <div>
          <Eyebrow n={n} text={c.mentorLabel} />
          <h2 className="cr-h2">{c.mentorTitle}</h2>
          {c.mentorBio && <div className="cr-mentor-bio"><RichParagraphs text={c.mentorBio} /></div>}
          {stats.length > 0 && (
            <dl className="cr-mentor-stats">
              {stats.map(([platform = '', value = '', label = ''], i) => {
                const [Icon, cls] = SOCIAL[platform.toLowerCase()] ?? [Sparkles, 'is-other'];
                return (
                  <div key={i}>
                    <span className={`cr-social ${cls}`} aria-hidden="true"><Icon size={18} /></span>
                    <dd>{value}</dd>
                    <dt>{label}</dt>
                  </div>
                );
              })}
            </dl>
          )}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- 07 FAQ ---------- */

function Faq({ n, c }: { n: number; c: Copy }) {
  return (
    <section className="cr-sec cr-cream">
      <Reveal className="cr-split cr-split-faq">
        <div>
          <Eyebrow n={n} text={c.faqLabel} />
          <h2 className="cr-h2">{splitLines(c.faqTitle).map((line, i) => <span key={i} className="block">{line}</span>)}</h2>
        </div>
        <Accordion items={parsePairs(c.faqs)} />
      </Reveal>
    </section>
  );
}

/* ---------- Closing band + enroll bar ---------- */

function CtaBand({ c, onEnroll }: { c: Copy; onEnroll: () => void }) {
  if (!c.ctaTitle) return null;
  return (
    <section className="cr-cta">
      <Reveal className="cr-cta-inner">
        <h2 className="cr-cta-title">{c.ctaTitle}</h2>
        {c.ctaText && <p className="cr-cta-text">{c.ctaText}</p>}
        <EnrollButton label={c.ctaButton} onClick={onEnroll} className="cr-btn-navy" />
        {c.ctaMeta && <p className="cr-cta-meta">{c.ctaMeta}</p>}
      </Reveal>
    </section>
  );
}

/** The page's own slim footer (the reference look) instead of the site-wide blue one. */
function CourseFooter({ c }: { c: Copy }) {
  const g = usePageContent('global');
  const email = c.footerEmail || g.footerEmail || 'work@clyxmedia.com';
  const copy = (c.footerCopy || '').replace('{year}', String(new Date().getFullYear()));
  return (
    <footer className="cr-footer">
      <div className="cr-wrap cr-footer-row">
        <a href="/" className="cr-footer-brand"><BrandLogo size={36} src={g.logoImage} />{c.footerBrand}</a>
        {c.footerText && <p className="cr-footer-text">{c.footerText} <a href={`mailto:${email}`}>{email}</a></p>}
        {copy && <p className="cr-footer-copy">{copy}</p>}
      </div>
    </footer>
  );
}

/** Pinned to the bottom of the screen from the moment the page loads. */
function EnrollBar({ c, course, onEnroll, hidden }: { c: Copy; course?: Course; onEnroll: () => void; hidden: boolean }) {
  const title = c.barTitle || course?.title || '';
  const image = c.barImage || course?.image || '';
  const show = !hidden && !!title && !!c.barButton;
  // Lift the WhatsApp button above the bar on phones while it is showing.
  useEffect(() => {
    document.body.classList.toggle('cr-bar-on', show);
    return () => document.body.classList.remove('cr-bar-on');
  }, [show]);
  return (
    <div className={`cr-bar${show ? ' is-on' : ''}`}>
      {image && <img className="cr-bar-img" src={image} alt="" decoding="async" />}
      <div className="cr-bar-text">
        <strong>{title}</strong>
        {c.barMeta && <span>{c.barMeta}</span>}
      </div>
      <EnrollButton label={c.barButton} onClick={onEnroll} className="cr-btn-lime cr-bar-btn" />
    </div>
  );
}
