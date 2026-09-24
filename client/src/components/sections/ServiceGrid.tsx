import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Megaphone, TrendingUp, Share2, Clapperboard, Code2, ShoppingCart, type LucideIcon } from 'lucide-react';
import { services } from '../../data/home';

// Each service gets a matching pictogram plus its own idle motion (see .sc-icon--* in landing-v1.css).
// Also used by the Services page.
export const ICONS: Record<string, { Icon: LucideIcon; motion: string }> = {
  'Influencer Marketing': { Icon: Megaphone, motion: 'ring' },
  'Performance Marketing': { Icon: TrendingUp, motion: 'climb' },
  'Social Media Management': { Icon: Share2, motion: 'pulse' },
  'UGC Videos': { Icon: Clapperboard, motion: 'clap' },
  'Website Development': { Icon: Code2, motion: 'sway' },
  'Shopify Store CRO': { Icon: ShoppingCart, motion: 'roll' },
};

function ServiceCard({ title, text, index }: { title: string; text: string; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const icon = ICONS[title];

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.2, rootMargin: '0px 0px -6% 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={ref}
      className={`service-card sc-reveal${visible ? ' is-visible' : ''}`}
      style={{ '--sc-delay': `${(index % 3) * 130}ms` } as CSSProperties}
    >
      <div className="service-icon">
        {icon && <icon.Icon size={26} strokeWidth={1.75} className={`sc-icon sc-icon--${icon.motion}`} aria-hidden="true" />}
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

export default function ServiceGrid() {
  return (
    <div className="service-grid">
      {services.map((service, index) => (
        <ServiceCard key={service.title} title={service.title} text={service.text} index={index} />
      ))}
    </div>
  );
}
