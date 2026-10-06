import { useEffect, useState, type CSSProperties } from 'react';
import { ArrowRight, X } from 'lucide-react';
import '@/styles/peek.css';

const CLOSED_KEY = 'clyx-course-peek-closed';
// He comes in the moment the visitor scrolls; this is only for someone who never scrolls.
const SHOW_AFTER_MS = 5000;

const wasClosed = () => {
  try {
    return sessionStorage.getItem(CLOSED_KEY) === '1';
  } catch {
    return false;
  }
};

/**
 * A cartoon guide who leans in from the left edge as soon as the visitor scrolls (or after a few seconds),
 * waves, and asks whether they have enrolled yet. Closing him keeps him away for the rest of the visit
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
      /* private mode: he just comes back next time */
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
      <div className="cr-peek-guy">
        <PeekGuy />
      </div>
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

/** Drawn in-house in a soft 3D style: shaded skin, glossy eyes, framed glasses, swept hair, grey suit and tie, waving. */
function PeekGuy() {
  return (
    <svg viewBox="0 0 200 270" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="cp-face" cx="0.4" cy="0.36" r="0.72">
          <stop offset="0" stopColor="#FFE3CC" />
          <stop offset="0.55" stopColor="#F5C3A0" />
          <stop offset="1" stopColor="#D8946C" />
        </radialGradient>
        <radialGradient id="cp-ear" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#F2BC97" />
          <stop offset="1" stopColor="#CF8862" />
        </radialGradient>
        <linearGradient id="cp-neck" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C9825C" />
          <stop offset="0.45" stopColor="#E7AC86" />
          <stop offset="1" stopColor="#EDB590" />
        </linearGradient>
        <radialGradient id="cp-hand" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#FFDCC2" />
          <stop offset="0.6" stopColor="#F0B892" />
          <stop offset="1" stopColor="#D28D66" />
        </radialGradient>
        <linearGradient id="cp-hair" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#8C5A31" />
          <stop offset="0.5" stopColor="#6A4022" />
          <stop offset="1" stopColor="#3F2512" />
        </linearGradient>
        <linearGradient id="cp-hair-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B07A48" />
          <stop offset="1" stopColor="#7A4B27" />
        </linearGradient>
        <radialGradient id="cp-iris" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#8A5A30" />
          <stop offset="0.7" stopColor="#4A2A12" />
          <stop offset="1" stopColor="#24130A" />
        </radialGradient>
        <linearGradient id="cp-frame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A3D44" />
          <stop offset="1" stopColor="#111216" />
        </linearGradient>
        {/* One shading for jacket and sleeve, so the arm blends into the shoulder */}
        <linearGradient id="cp-suit" gradientUnits="userSpaceOnUse" x1="60" y1="150" x2="110" y2="300">
          <stop offset="0" stopColor="#7E8693" />
          <stop offset="0.5" stopColor="#5E6672" />
          <stop offset="1" stopColor="#3E444E" />
        </linearGradient>
        <linearGradient id="cp-lapel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#555C67" />
          <stop offset="1" stopColor="#353A42" />
        </linearGradient>
        <linearGradient id="cp-shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#D5DCE4" />
        </linearGradient>
        <linearGradient id="cp-tie" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3A404A" />
          <stop offset="1" stopColor="#14171C" />
        </linearGradient>
        <radialGradient id="cp-sheen" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cp-blush" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#F07A66" stopOpacity="0.45" />
          <stop offset="1" stopColor="#F07A66" stopOpacity="0" />
        </radialGradient>
        <filter id="cp-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <clipPath id="cp-neck-clip"><path d="M84 138 L116 138 L116 170 C108 176 92 176 84 170 Z" /></clipPath>
        <clipPath id="cp-lens-l"><rect x="64" y="88" width="34" height="28" rx="9" /></clipPath>
        <clipPath id="cp-lens-r"><rect x="102" y="88" width="34" height="28" rx="9" /></clipPath>
      </defs>

      {/* Neck with the shadow under the jaw (drawn first so the collar overlaps it) */}
      <path d="M84 138 L116 138 L116 170 C108 176 92 176 84 170 Z" fill="url(#cp-neck)" />
      <g clipPath="url(#cp-neck-clip)">
        <ellipse cx="100" cy="142" rx="22" ry="9" fill="#9E5B3A" opacity="0.5" filter="url(#cp-soft)" />
      </g>

      {/* Body sits a little higher than drawn so the neck stays short */}
      <g transform="translate(0 -16)">
      {/* Suit, shirt and tie */}
      <path d="M8 300 C8 226 40 192 100 182 C160 192 192 226 192 300 Z" fill="url(#cp-suit)" />
      <ellipse cx="58" cy="214" rx="30" ry="18" fill="url(#cp-sheen)" />
      <ellipse cx="146" cy="214" rx="24" ry="14" fill="url(#cp-sheen)" opacity="0.6" />
      <path d="M79 184 L100 240 L121 184 Z" fill="url(#cp-shirt)" />
      <path d="M93 190 L107 190 L104.5 201 L95.5 201 Z" fill="url(#cp-tie)" />
      <path d="M95.5 201 L104.5 201 L110 242 L100 254 L90 242 Z" fill="url(#cp-tie)" />
      <path d="M99 204 L96 240" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="2" strokeLinecap="round" />
      <path d="M79 182 L91 203 L100 189 Z" fill="url(#cp-shirt)" stroke="#BCC5CF" strokeWidth="0.8" />
      <path d="M121 182 L109 203 L100 189 Z" fill="url(#cp-shirt)" stroke="#BCC5CF" strokeWidth="0.8" />
      <path d="M78 184 L100 246 L68 214 L77 201 L64 191 Z" fill="url(#cp-lapel)" />
      <path d="M122 184 L100 246 L132 214 L123 201 L136 191 Z" fill="url(#cp-lapel)" />
      <path d="M78 184 L100 246 M122 184 L100 246" stroke="#FFFFFF" strokeOpacity="0.14" strokeWidth="1.2" />
      <path d="M134 224 L150 220 L146 229 Z" fill="#F4F6F8" />
      <circle cx="100" cy="259" r="2.8" fill="#24282F" />

      {/* Waving arm */}
      <g className="cr-peek-wave">
        <path d="M138 262 C154 220 166 188 170 158 L189 162 C193 196 192 232 188 266 Z" fill="url(#cp-suit)" />
        <path d="M150 232 C156 226 160 222 164 214" stroke="#2F343C" strokeOpacity="0.45" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M176 214 C178 198 179 184 179 170" stroke="#FFFFFF" strokeOpacity="0.14" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M167 153 L191 157 L189 167 L166 163 Z" fill="url(#cp-shirt)" />
        <g fill="url(#cp-hand)">
          <rect x="164" y="104" width="7" height="22" rx="3.5" transform="rotate(-16 167 115)" />
          <rect x="172" y="99" width="7" height="25" rx="3.5" transform="rotate(-5 175 111)" />
          <rect x="180" y="99" width="7" height="25" rx="3.5" transform="rotate(5 183 111)" />
          <rect x="187.5" y="105" width="6.5" height="20" rx="3.25" transform="rotate(15 190 115)" />
          <ellipse cx="179" cy="136" rx="14" ry="16" />
          <rect x="157" y="126" width="16" height="7" rx="3.5" transform="rotate(-36 165 129)" />
        </g>
        <path d="M172 127 L172 133 M179 126 L179 133 M186 127 L186 133" stroke="#C98560" strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
        <ellipse cx="176" cy="132" rx="6" ry="7" fill="#FFFFFF" opacity="0.18" />
      </g>
      </g>

      {/* Ears */}
      <ellipse cx="56" cy="106" rx="9.5" ry="13.5" fill="url(#cp-ear)" />
      <path d="M58 98 C53 100 52 108 56 114" stroke="#B9714C" strokeWidth="2" strokeLinecap="round" fill="none" />
      <ellipse cx="144" cy="106" rx="9.5" ry="13.5" fill="url(#cp-ear)" />
      <path d="M142 98 C147 100 148 108 144 114" stroke="#B9714C" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Face */}
      <ellipse cx="100" cy="100" rx="44" ry="52" fill="url(#cp-face)" />
      <ellipse cx="74" cy="124" rx="11" ry="8" fill="url(#cp-blush)" />
      <ellipse cx="126" cy="124" rx="11" ry="8" fill="url(#cp-blush)" />
      <ellipse cx="100" cy="146" rx="9" ry="3.5" fill="#FFFFFF" opacity="0.18" />

      {/* Hair: dark base, lighter swept quiff, highlight strands */}
      <path d="M56 106 C50 68 66 40 98 36 C128 32 149 52 148 82 C148 94 147 101 145 107 C141 88 133 76 121 70 C108 78 84 82 66 76 C61 84 58 94 56 106 Z" fill="url(#cp-hair)" />
      <path d="M58 66 C62 34 102 16 134 32 C148 40 153 58 148 76 C140 56 124 48 104 50 C89 52 74 58 58 66 Z" fill="url(#cp-hair-top)" />
      <path d="M72 54 C88 40 112 36 130 44" stroke="#C99161" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M80 60 C94 50 114 47 132 52" stroke="#C99161" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M66 70 C74 62 86 58 98 58" stroke="#3A2210" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M57 104 C56 96 57 90 60 86 L62 104 Z M143 104 C144 96 143 90 140 86 L138 104 Z" fill="#4A2C17" />

      {/* Brows */}
      <path d="M66 84 C73 76 85 75 93 80 C85 79 75 80 67 87 Z" fill="#4A2C17" />
      <path d="M134 84 C127 76 115 75 107 80 C115 79 125 80 133 87 Z" fill="#4A2C17" />

      {/* Eyes */}
      <g className="cr-peek-eyes">
        <ellipse cx="81" cy="103" rx="8.5" ry="7.5" fill="#FFFFFF" />
        <ellipse cx="119" cy="103" rx="8.5" ry="7.5" fill="#FFFFFF" />
        <circle cx="82.5" cy="103.5" r="5.3" fill="url(#cp-iris)" />
        <circle cx="120.5" cy="103.5" r="5.3" fill="url(#cp-iris)" />
        <circle cx="82.5" cy="103.5" r="2.4" fill="#0E0805" />
        <circle cx="120.5" cy="103.5" r="2.4" fill="#0E0805" />
        <circle cx="84.5" cy="101.2" r="1.7" fill="#FFFFFF" />
        <circle cx="122.5" cy="101.2" r="1.7" fill="#FFFFFF" />
        <circle cx="80.6" cy="106" r="0.8" fill="#FFFFFF" opacity="0.8" />
        <circle cx="118.6" cy="106" r="0.8" fill="#FFFFFF" opacity="0.8" />
        <path d="M72 101 C76 94 86 94 90 100" stroke="#2E1B0E" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M110 100 C114 94 124 94 128 101" stroke="#2E1B0E" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </g>

      {/* Glasses with lens reflections */}
      <g clipPath="url(#cp-lens-l)">
        <rect x="64" y="88" width="34" height="28" fill="#CFE3FF" opacity="0.14" />
        <path d="M66 116 L82 86 L88 86 L72 116 Z" fill="#FFFFFF" opacity="0.28" />
      </g>
      <g clipPath="url(#cp-lens-r)">
        <rect x="102" y="88" width="34" height="28" fill="#CFE3FF" opacity="0.14" />
        <path d="M104 116 L120 86 L126 86 L110 116 Z" fill="#FFFFFF" opacity="0.28" />
      </g>
      <g fill="none" stroke="url(#cp-frame)" strokeWidth="4">
        <rect x="64" y="88" width="34" height="28" rx="9" />
        <rect x="102" y="88" width="34" height="28" rx="9" />
      </g>
      <path d="M66 90 C72 88 82 88 90 89" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="1" fill="none" />
      <path d="M104 90 C110 88 120 88 128 89" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="1" fill="none" />
      <path d="M98 99 C99.5 95.5 100.5 95.5 102 99" stroke="#1A1C20" strokeWidth="3.4" fill="none" />
      <path d="M64 96 L54 93 M136 96 L146 93" stroke="#1A1C20" strokeWidth="3" strokeLinecap="round" />

      {/* Nose */}
      <path d="M101 108 C97.5 117 96.5 122 99.5 125 C95.5 125.5 93.5 122 95.5 117 Z" fill="#C9805A" opacity="0.45" />
      <ellipse cx="103" cy="118" rx="2.4" ry="5" fill="#FFFFFF" opacity="0.22" />
      <ellipse cx="96.5" cy="125.5" rx="2.2" ry="1.3" fill="#A9603D" opacity="0.7" />
      <ellipse cx="105.5" cy="125.5" rx="2.2" ry="1.3" fill="#A9603D" opacity="0.7" />

      {/* Smile */}
      <path d="M83 134 C91 148 111 148 118 133 C109 139 92 140 83 134 Z" fill="#7A2620" />
      <path d="M86.5 135.2 C94 139.5 107 139.5 114.5 134.6 L113.6 138 C106.5 142 94.5 142 87.6 138.4 Z" fill="#FFFFFF" />
      <path d="M93 143.5 C98 145.5 104 145.5 109 143.5 C104 146.8 98 146.8 93 143.5 Z" fill="#E07A6C" />
      <path d="M81 132 C82 134 82.5 135 82 137 M120 131 C119 133 118.6 134 119 136" stroke="#C9805A" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}
