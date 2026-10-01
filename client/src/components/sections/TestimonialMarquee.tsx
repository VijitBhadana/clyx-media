import { Fragment } from 'react';
import { useCollection } from '@/lib/siteContent';

type Testimonial = { quote: string; author: string; role?: string; brand?: string; metrics?: string };

const defaultTestimonials: Testimonial[] = [
  {
    quote: 'CLYX completely replaced our internal creative bottleneck. Their creator whitelisting pipeline drove our ROAS from 2.1x to 4.4x in just six weeks.',
    author: 'Aarav Kapoor',
    role: 'Founder & CEO',
    brand: 'Lumina Skincare',
    metrics: '+265% Revenue · ₹1.2Cr Added',
  },
  {
    quote: 'Most agencies give you fluff reports and vanity metrics. CLYX treats our ad budget like their own money. The blend of UGC + performance buying is deadly.',
    author: 'Natasha Roy',
    role: 'Head of Growth',
    brand: 'Aethel Streetwear',
    metrics: '3.9x ROAS · ₹40L/month Scale',
  },
  {
    quote: 'The landing page they built loaded in 0.4 seconds. Coupled with their whitelisted creator ads, our checkout conversion rate jumped from 1.8% to 4.8%.',
    author: 'Devang Patel',
    role: 'Co-Founder',
    brand: 'Volt Audio',
    metrics: '5.1x Peak ROAS · 0.4s Page Speed',
  },
];

// The track is filled three times over so the 30s marquee never shows a gap.
const COPIES = 3;

/** The homepage testimonial marquee, fed by the Testimonials list. */
export default function TestimonialMarquee() {
  const items = useCollection<Testimonial>('testimonials', defaultTestimonials, (t) => ({
    quote: t.quote,
    author: t.name,
    role: t.role,
    brand: t.brand,
    metrics: t.metrics || t.metric,
  }));
  return (
    <div className="testimonial-marquee">
      <div className="testimonial-track" id="testimonialTrack">
        {Array.from({ length: COPIES }, (_, copy) => (
          <Fragment key={copy}>
            {items.map((t, i) => (
              <div key={i} className="testimonial-card" aria-hidden={copy > 0 || undefined}>
                <p className="testimonial-quote">“{t.quote}”</p>
                <div className="testimonial-meta">
                  <div className="author">{t.author}</div>
                  <div className="brand">
                    {[t.role, t.brand].filter(Boolean).join(', ')}
                    {t.metrics && <> · <span>{t.metrics}</span></>}
                  </div>
                </div>
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
