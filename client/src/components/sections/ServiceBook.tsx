import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { services } from '../../data/home';
import { ICONS } from './ServiceGrid';
import { pageDefaults, safeHref, useServices, usePageContent, type ServiceContent } from '@/lib/pageContent';
import BrandLogo from '@/components/ui/BrandLogo';
import '../../styles/service-book.css';

// Scroll-driven flip book for the homepage services (see service-book.css).
// Leaf 0 is the CLYX Media cover; leaf k is service k. Each leaf's front is the right-hand page and its back becomes
// the left-hand page once turned, so every open spread is one service: chapter opener on the left, full detail on the right.
// The last leaf never turns, so there is one turn per service.
const TURNS = services.length;
const LEAVES = services.length + 1;
// Inside each turn's scroll segment the page rests, turns, then rests again so every spread holds still long enough to read.
const TURN_START = 0.2;
const TURN_LENGTH = 0.65;
const SCROLL_PER_TURN_VH = 80;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const pad = (n: number) => String(n).padStart(2, '0');

type Service = ServiceContent;
type Copy = Record<string, string>;

// Icons are looked up by the service's original name, so renaming a service in the admin keeps its icon.
function ServiceIcon({ iconKey, size }: { iconKey: string; size: number }) {
  const icon = ICONS[iconKey];
  if (!icon) return null;
  return <icon.Icon size={size} strokeWidth={1.6} className={`sc-icon sc-icon--${icon.motion}`} aria-hidden="true" />;
}

function Cover({ c, items, logoSrc }: { c: Copy; items: Service[]; logoSrc?: string }) {
  return (
    <div className="sb-cover">
      <span className="sb-cover-frame" aria-hidden="true" />
      <span className="sb-cover-ribbon" aria-hidden="true" />
      <header className="sb-cover-kicker"><BrandLogo size={48} src={logoSrc} className="sb-cover-logo" /><span>{c.bookKicker}</span><span>{c.bookVolume}</span></header>
      <div className="sb-cover-title">
        <span className="sb-cover-clyx">{c.bookCoverBrand || 'CLYX'}<span className="sb-cover-dot">.</span></span>
        <span className="sb-cover-media">{c.bookCoverBrandSuffix || 'Media'}</span>
        <p className="sb-cover-sub">{c.bookCoverText} <em>{c.bookCoverHighlight}</em></p>
      </div>
      <ol className="sb-cover-index">
        {items.map((service, i) => (
          <li key={service.iconKey}><span>{pad(i + 1)}</span>{service.title}</li>
        ))}
      </ol>
    </div>
  );
}

// One loop of the wire spiral, drawn around the spine (x = 28): punched holes on either side of the gutter and a wire
// that leaves the right-hand hole and wraps back around the spine. The left hole only shows once the book is open.
function Coil() {
  const wire = 'M40 6.5 H13 A5 5 0 0 0 13 16.5 H40';
  return (
    <svg className="sb-coil" viewBox="0 0 56 24" aria-hidden="true">
      <rect className="sb-coil-hole sb-coil-hole--left" x="11" y="4.5" width="7" height="14" rx="1.8" />
      <path d={wire} className="sb-coil-shadow" transform="translate(1 1.6)" />
      <path d={wire} className="sb-coil-wire" />
      <path d={wire} className="sb-coil-shine" transform="translate(0 -0.7)" />
      {/* Drawn over the wire's ends so the wire reads as passing through the page. */}
      <rect className="sb-coil-hole" x="37" y="4.5" width="7" height="14" rx="1.8" />
    </svg>
  );
}

const COIL_PITCH = 30;

// Left-hand page: decorative chapter opener. Everything on it is repeated on the detail page, so it is hidden from
// assistive tech and simply not shown on mobile, where the book is a single page wide.
function ChapterOpener({ service, chapter, c }: { service: Service; chapter: number; c: Copy }) {
  return (
    <div className="sb-page sb-page--left sb-opener" aria-hidden="true">
      <span className="sb-running">{c.bookChapterLabel || 'Chapter'} {pad(chapter)}</span>
      <div className="sb-opener-num">{pad(chapter)}</div>
      <div className="sb-opener-icon"><ServiceIcon iconKey={service.iconKey} size={40} /></div>
      <p className="sb-opener-title">{service.title}</p>
      <span className="sb-folio">{chapter * 2}</span>
    </div>
  );
}

function ServicePage({ service, chapter, c }: { service: Service; chapter: number; c: Copy }) {
  const last = chapter === services.length;
  return (
    <article className="sb-page sb-detail">
      <header className="sb-running">
        <span>{c.bookRunningHead || 'CLYX Media'}</span>
        <span>{c.bookChapterLabel || 'Chapter'} {pad(chapter)} / {pad(services.length)}</span>
      </header>
      <div className="sb-detail-head">
        <span className="sb-chip"><ServiceIcon iconKey={service.iconKey} size={22} /></span>
        <h3>{service.title}</h3>
      </div>
      <p className="sb-detail-text">{service.text}</p>
      {service.points.length > 0 && <p className="sb-label">{c.bookIncludedLabel}</p>}
      <ul className="sb-points">
        {service.points.map((point, i) => (
          <li key={i}><Check size={15} strokeWidth={2.4} aria-hidden="true" />{point}</li>
        ))}
      </ul>
      <footer className="sb-detail-foot">
        <span className="sb-folio">{chapter * 2 + 1}</span>
        {last
          ? <a className="sb-cta" href={safeHref(c.bookCtaUrl || '/contact')}>{c.bookCtaText} <ArrowUpRight size={14} aria-hidden="true" /></a>
          : <span className="sb-next">{c.bookNextText}</span>}
      </footer>
    </article>
  );
}

export default function ServiceBook({ content: c = pageDefaults('home') }: { content?: Copy }) {
  const items = useServices();
  const logoSrc = usePageContent('global').logoImage;
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const leafRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [spread, setSpread] = useState(0);
  const [coils, setCoils] = useState(16);

  // Transforms are written straight to the DOM on each frame; React only re-renders when the open spread changes.
  useEffect(() => {
    let frame = 0;
    const mobile = window.matchMedia('(max-width: 768px)');

    const update = () => {
      frame = 0;
      const track = trackRef.current;
      const sticky = stickyRef.current;
      const book = bookRef.current;
      if (!track || !sticky || !book) return;

      // While pinned, the sticky panel's offset inside the track is exactly how far we've scrolled through the book.
      const distance = track.offsetHeight - sticky.offsetHeight;
      const scrolled = sticky.getBoundingClientRect().top - track.getBoundingClientRect().top;
      const progress = distance > 0 ? clamp01(scrolled / distance) * TURNS : 0;

      let turned = 0;
      let open = 0;
      leafRefs.current.forEach((leaf, i) => {
        if (!leaf) return;
        const t = i < TURNS ? easeInOut(clamp01((progress - i - TURN_START) / TURN_LENGTH)) : 0;
        if (i === 0) open = t;
        if (t >= 0.5) turned += 1;
        leaf.style.transform = `rotateY(${(-180 * t).toFixed(2)}deg)`;
        // Right pile: earlier leaves on top. Left pile: later leaves on top. A leaf mid-turn sits above both.
        leaf.style.zIndex = String(t > 0 && t < 1 ? LEAVES + 1 : t >= 0.5 ? i + 1 : LEAVES - i);
        leaf.style.setProperty('--front-shade', (Math.min(t * 2, 1) * 0.5).toFixed(3));
        leaf.style.setProperty('--back-shade', (Math.min((1 - t) * 2, 1) * 0.5).toFixed(3));
      });

      book.style.setProperty('--open', open.toFixed(3));
      // Closed, the cover is centred; opening slides the spine to the centre. Mobile is a single page, so no slide.
      book.style.transform = mobile.matches ? '' : `translateX(${(-25 * (1 - open)).toFixed(2)}%)`;
      setSpread(turned);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    // The page height depends on the viewport, so the number of spiral loops is recounted on resize.
    const onResize = () => {
      if (bookRef.current) setCoils(Math.max(8, Math.floor(bookRef.current.offsetHeight / COIL_PITCH)));
      schedule();
    };

    onResize();
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize);
    mobile.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      mobile.removeEventListener('change', schedule);
    };
  }, []);

  // Spread s is at rest when progress === s (between the previous turn ending and the next one starting).
  const goTo = useCallback((s: number) => {
    const track = trackRef.current;
    const sticky = stickyRef.current;
    if (!track || !sticky) return;
    const distance = track.offsetHeight - sticky.offsetHeight;
    const stickyTop = parseFloat(getComputedStyle(sticky).top) || 0;
    const trackTop = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: trackTop - stickyTop + (s / TURNS) * distance, behavior: 'smooth' });
  }, []);

  const current = spread > 0 ? items[spread - 1] : null;

  return (
    <div
      ref={trackRef}
      className="sb-track"
      style={{ height: `calc(100vh - 70px + ${TURNS * SCROLL_PER_TURN_VH}vh)` }}
    >
      <div ref={stickyRef} className="sb-sticky">
        <div className="sb-stage">
          <div ref={bookRef} className="sb-book">
            <div className="sb-stack">
              {Array.from({ length: LEAVES }, (_, i) => (
                <div key={i} ref={(el) => { leafRefs.current[i] = el; }} className="sb-leaf">
                  <div className="sb-face sb-face--front">
                    {i === 0 ? <Cover c={c} items={items} logoSrc={logoSrc} /> : <ServicePage service={items[i - 1]} chapter={i} c={c} />}
                  </div>
                  <div className="sb-face sb-face--back">
                    {i < services.length
                      ? <ChapterOpener service={items[i]} chapter={i + 1} c={c} />
                      : <div className="sb-page sb-page--left" aria-hidden="true" />}
                  </div>
                </div>
              ))}
              <div className="sb-binding">
                {Array.from({ length: coils }, (_, i) => <Coil key={i} />)}
              </div>
            </div>
          </div>
        </div>

        <nav className="sb-progress" aria-label="Service chapters">
          <span className="sb-caption">
            {current ? <>{pad(spread)} — {current.title}</> : (c.bookCoverLabel || 'Cover')}
          </span>
          <div className="sb-dots">
            {items.map((service, i) => (
              <button
                key={service.iconKey}
                type="button"
                className={`sb-dot${spread === i + 1 ? ' is-active' : ''}`}
                onClick={() => goTo(i + 1)}
                aria-label={`Go to ${service.title}`}
                aria-current={spread === i + 1 ? 'true' : undefined}
              />
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
