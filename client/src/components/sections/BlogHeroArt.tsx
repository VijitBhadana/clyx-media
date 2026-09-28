import { useRef, useState } from 'react';
import { Sparkles, TrendingUp, Users, Zap } from 'lucide-react';
import '@/styles/blog-hero-art.css';

// Icons stay fixed by position; their tag/title/meta text is heroCard1..3 in the page content.
const ICONS = [Users, Zap, TrendingUp];

// Blog hero art: a small stack of floating note cards that tilt toward the pointer, replacing the old intro card.
export default function BlogHeroArt({ content: c }: { content: Record<string, string> }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cards = ICONS.map((Icon, i) => ({
    tag: c[`heroCard${i + 1}Tag`],
    title: c[`heroCard${i + 1}Title`],
    meta: c[`heroCard${i + 1}Meta`],
    Icon,
  })).filter((card) => card.tag || card.title);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -12, y: px * 16 });
  };

  return (
    <div className="bha" ref={stageRef} onMouseMove={handleMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })} aria-hidden="true">
      <div className="bha-glow" />
      <div className="bha-stage" style={{ transform: `rotateX(${8 + tilt.x}deg) rotateY(${-10 + tilt.y}deg)` }}>
        {cards.map(({ tag, title, Icon, meta }, i) => (
          <div key={tag} className={`bha-slot bha-slot-${i}`}>
            <div className={`bha-card bha-float-${i}`}>
              <div className="bha-card-top">
                <span className="bha-card-tag">{tag}</span>
              </div>
              <p className="bha-card-title">{title}</p>
              <div className="bha-card-lines">
                <span />
                <span />
                <span className="is-short" />
              </div>
              <div className="bha-card-foot">
                <Icon size={13} />
                <span>{meta}</span>
              </div>
            </div>
          </div>
        ))}
        {c.heroBadge1 && (
          <div className="bha-badge bha-badge-a">
            <Sparkles size={13} /> {c.heroBadge1}
          </div>
        )}
        {c.heroBadge2 && (
          <div className="bha-badge bha-badge-b">
            <TrendingUp size={13} /> {c.heroBadge2}
          </div>
        )}
      </div>
    </div>
  );
}
