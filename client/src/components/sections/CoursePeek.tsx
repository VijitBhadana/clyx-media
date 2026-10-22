import { useEffect, useState, type CSSProperties } from 'react';
import { ArrowRight, X } from 'lucide-react';
import '@/styles/peek.css';

const CLOSED_KEY = 'clyx-course-peek-closed';
// It comes in the moment the visitor scrolls; this is only for someone who never scrolls.
const SHOW_AFTER_MS = 5000;

const wasClosed = () => {
  try {
    return sessionStorage.getItem(CLOSED_KEY) === '1';
  } catch {
    return false;
  }
};

/**
 * A speech bubble that pops up in the bottom-left corner as soon as the visitor scrolls (or after a few seconds)
 * and asks whether they have enrolled yet. Closing it keeps it away for the rest of the visit
 * on every page. `low` is for pages without the course enroll bar.
 */
export default function CoursePeek({ text, button, onEnroll, hidden = false, low = false }: { text: string; button?: string; onEnroll: () => void; hidden?: boolean; low?: boolean }) {
  const [ready, setReady] = useState(false);
  const [closed, setClosed] = useState(wasClosed);
  const [lift, setLift] = useState(0);

  useEffect(() => {
    if (closed || ready) return;
    const show = () => setReady(true);
    const onScroll = () => window.scrollY > 8 && show();
    const timer = window.setTimeout(show, SHOW_AFTER_MS);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // a page restored mid-way counts as scrolled
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [closed, ready]);

  // On phones the cookie notice sits in the same corner: stand on top of it until it is answered.
  useEffect(() => {
    if (!ready || closed) return;
    const measure = () => {
      const notice = document.querySelector<HTMLElement>('.cookie-consent');
      setLift(notice && window.innerWidth < 640 ? notice.offsetHeight + 12 : 0);
    };
    measure();
    const id = window.setInterval(measure, 1000);
    return () => window.clearInterval(id);
  }, [ready, closed]);

  const close = () => {
    setClosed(true);
    try {
      sessionStorage.setItem(CLOSED_KEY, '1');
    } catch {
      /* private mode: it just comes back next time */
    }
  };
  const enroll = () => {
    close();
    onEnroll();
  };

  if (!text) return null;
  const shown = ready && !closed && !hidden;
  return (
    <aside
      className={`cr-peek${low ? ' is-low' : ''}${shown ? ' is-in' : ''}`}
      style={{ '--peek-lift': `${lift}px` } as CSSProperties}
      aria-hidden={!shown || undefined}
    >
      <div className="cr-peek-bubble" role="status">
        <button type="button" className="cr-peek-close" onClick={close} aria-label="Close" tabIndex={shown ? undefined : -1}>
          <X size={14} />
        </button>
        <button type="button" className="cr-peek-text" onClick={enroll} tabIndex={shown ? undefined : -1}>
          {text}
        </button>
        {button && (
          <button type="button" className="cr-peek-btn" onClick={enroll} tabIndex={shown ? undefined : -1}>
            {button} <ArrowRight size={14} />
          </button>
        )}
      </div>
    </aside>
  );
}
