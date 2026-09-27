import type { CSSProperties } from 'react';
import base from '@/assets/case-hero/base.webp';
import glass from '@/assets/case-hero/glass.webp';
import hand from '@/assets/case-hero/hand.webp';
import handleEnd from '@/assets/case-hero/handle-end.webp';
import icon1 from '@/assets/case-hero/icon-1.webp';
import icon2 from '@/assets/case-hero/icon-2.webp';
import icon3 from '@/assets/case-hero/icon-3.webp';
import icon4 from '@/assets/case-hero/icon-4.webp';
import icon5 from '@/assets/case-hero/icon-5.webp';
import icon6 from '@/assets/case-hero/icon-6.webp';
import icon7 from '@/assets/case-hero/icon-7.webp';
import icon8 from '@/assets/case-hero/icon-8.webp';

// Case Studies hero illustration, built from the original artwork cut into layers:
// the base (person, face and table, with the icons and the magnifier removed), the magnifier (frame,
// handle and a see-through glass tint), the static hand drawn over the handle, and each floating icon. Layer boxes are in the original artwork's 3840 x 2180 pixels.
const ART_W = 3840;
const ART_H = 2180;

const box = (x: number, y: number, w: number, h: number): CSSProperties => ({
  left: `${(x / ART_W) * 100}%`,
  top: `${(y / ART_H) * 100}%`,
  width: `${(w / ART_W) * 100}%`,
  height: `${(h / ART_H) * 100}%`,
});

const icons = [
  { src: icon1, x: 2557, y: 197, w: 234, h: 239 },
  { src: icon2, x: 789, y: 271, w: 339, h: 354 },
  { src: icon3, x: 3246, y: 379, w: 317, h: 325 },
  { src: icon4, x: 204, y: 564, w: 231, h: 237 },
  { src: icon5, x: 2583, y: 751, w: 412, h: 388 },
  { src: icon6, x: 774, y: 930, w: 231, h: 237 },
  { src: icon7, x: 195, y: 1231, w: 412, h: 388 },
  { src: icon8, x: 3280, y: 1261, w: 284, h: 291 },
];

export default function CaseHeroArt() {
  return (
    <div className="csi" aria-hidden="true">
      <img className="csi-base" src={base} alt="" width={1600} height={908} decoding="async" />
      {icons.map(({ src, x, y, w, h }, i) => (
        <span key={i} className="csi-pop" style={{ ...box(x, y, w, h), animationDelay: `${700 + i * 90}ms` }}>
          <img
            className="csi-float"
            src={src}
            alt=""
            decoding="async"
            style={{ animationDuration: `${3.4 + (i % 4) * 0.5}s`, animationDelay: `${-i * 0.7}s` }}
          />
        </span>
      ))}
      {/* Only the magnifier moves: it turns in the static hand, around the point where the fingers grip it.
          The handle runs behind the fingers, and its end shows over the bottom of the fist. */}
      <img className="csi-glass" src={glass} alt="" decoding="async" style={{ ...box(1692, 355, 473, 722), transformOrigin: '78.34% 76.94%' }} />
      <img className="csi-hand" src={hand} alt="" decoding="async" style={box(1961, 755, 264, 299)} />
      <img className="csi-glass" src={handleEnd} alt="" decoding="async" style={{ ...box(2034, 899, 116, 151), transformOrigin: '24.61% 7.63%' }} />
    </div>
  );
}
