import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight, MessageCircle, RotateCcw } from 'lucide-react';
import { leaders as defaultLeaders } from '@/data/home';
import { useCollection } from '@/lib/siteContent';
import { pageDefaults, safeHref } from '@/lib/pageContent';
import '@/styles/services-cta.css';
import { hasRevealed, revealThresholds } from '@/lib/reveal';
import { FormattedText } from '@/components/ui/FormattedText';

const initials = (name: string) => name.split(' ').map(part => part[0]).join('').slice(0, 2);
const firstName = (name: string) => name.split(' ')[0];
// Only the first three team members are shown, matching the three avatar tones.
const MAX_PEOPLE = 3;

export default function ServicesCTA({ content: c = pageDefaults('services') }: { content?: Record<string, string> }) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (hasRevealed(entry, 0.3)) { setInView(true); io.disconnect(); }
    }, { threshold: revealThresholds(0.3) });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (picked === null) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTyping(true);
    const t = window.setTimeout(() => setTyping(false), reduced ? 0 : 1100);
    return () => window.clearTimeout(t);
  }, [picked]);

  // Quick replies for the mini chat. Each one gets a short, human answer from the team.
  const topics = [1, 2, 3, 4].map(n => ({ label: c[`topic${n}Label`], reply: c[`topic${n}Reply`] })).filter(t => t.label);
  const topic = picked === null ? null : topics[picked] ?? null;
  const leaders = useCollection<{ name: string }>('team', defaultLeaders, item => ({ name: String(item.name || '') }))
    .filter(l => l.name)
    .slice(0, MAX_PEOPLE);
  const team = leaders.map(l => firstName(l.name));
  const teamLine = team.length > 1 ? `${team.slice(0, -1).join(', ')} & ${team[team.length - 1]}` : team[0] ?? '';
  const host = team[0] ?? 'CLYX';
  const highlightWords = (c.ctaHighlight ?? '').split(' ').filter(Boolean);
  const wordStarts = highlightWords.map((_, w) => highlightWords.slice(0, w).join('').length);
  const whatsapp = safeHref(c.ctaWhatsappUrl);
  // Prefilled WhatsApp text only works on wa.me style links.
  const waHref = topic && /^https?:\/\//.test(whatsapp)
    ? `${whatsapp}${whatsapp.includes('?') ? '&' : '?'}text=${encodeURIComponent((c.chatWhatsappMessage || 'Hi CLYX! {topic}. Can we talk?').replace(/\{topic\}/g, topic.label))}`
    : whatsapp;

  return (
    <div className="svc-cta-wrap container">
      <section ref={ref} className={`svc-cta${inView ? ' is-in' : ''}`} aria-labelledby="svc-cta-title">
        <div className="svc-cta-glow" aria-hidden="true" />

        <div className="svc-cta-copy">
          <p className="svc-cta-eyebrow"><span className="svc-cta-dot" aria-hidden="true" />{c.ctaEyebrow}</p>
          <h2 id="svc-cta-title" className="svc-cta-title display">
            {c.ctaTitle}<br />
            <span className="svc-cta-mark">
              <span className="sr-only">{c.ctaHighlight}</span>
              {/* Letters rise in one by one once the card is in view. */}
              {highlightWords.map((word, w) => (
                <Fragment key={w}>
                  {w > 0 && ' '}
                  <span className="svc-cta-word" aria-hidden="true">
                    {Array.from(word).map((ch, i) => (
                      <span key={i} className="svc-cta-char" style={{ '--i': wordStarts[w] + i } as CSSProperties}>{ch}</span>
                    ))}
                  </span>
                </Fragment>
              ))}
            </span>
          </h2>
          <p className="svc-cta-lede"><FormattedText text={c.ctaText} /></p>

          {leaders.length > 0 && <div className="svc-cta-people">
            <div className="svc-cta-avatars" aria-hidden="true">
              {leaders.map((l, i) => <span key={`${l.name}-${i}`} className={`svc-cta-avatar tone-${i % 3}`}>{initials(l.name)}</span>)}
            </div>
            <p><strong>{teamLine}</strong><br />{c.ctaTeamNote}</p>
          </div>}

          <div className="svc-cta-actions">
            <a href={safeHref(c.ctaButtonUrl || '/contact#contact-form')} className="svc-cta-btn is-primary">{c.ctaButton} <ArrowUpRight size={16} /></a>
            {c.ctaWhatsappText && <a href={whatsapp} target="_blank" rel="noreferrer" className="svc-cta-btn is-ghost"><MessageCircle size={16} /> {c.ctaWhatsappText}</a>}
          </div>
        </div>

        <div className="svc-cta-chat-col">
          <p className={`svc-cta-scribble${topic ? ' is-hidden' : ''}`} aria-hidden="true">
            {c.chatScribble}
            <svg viewBox="0 0 60 50"><path d="M6 6 C 30 4, 48 16, 44 40" /><path d="M36 33 L 44 42 L 52 32" /></svg>
          </p>

          <div className="svc-cta-chat" role="group" aria-label="Chat with the CLYX team">
            <div className="svc-cta-chat-head">
              <span className="svc-cta-avatar tone-0 is-sm" aria-hidden="true">{initials(leaders[0]?.name ?? 'CLYX')}<i /></span>
              <p className="svc-cta-chat-name">{host}</p>
            </div>

            <div className="svc-cta-thread" aria-live="polite">
              <p className="svc-cta-bubble is-them" style={{ '--d': '0.2s' } as React.CSSProperties}>{c.chatGreeting.replace(/\{name\}/g, host)}</p>
              <p className="svc-cta-bubble is-them" style={{ '--d': '0.7s' } as React.CSSProperties}>{c.chatQuestion}</p>
              {topic && <p key={`q${picked}`} className="svc-cta-bubble is-me">{topic.label}</p>}
              {topic && typing && <p className="svc-cta-bubble is-them is-typing" aria-label="Typing"><span /><span /><span /></p>}
              {topic && !typing && <p key={`a${picked}`} className="svc-cta-bubble is-them"><FormattedText text={topic.reply} /></p>}
            </div>

            {topic === null ? (
              <div className="svc-cta-replies">
                {topics.map((t, i) => <button key={i} type="button" onClick={() => setPicked(i)}>{t.label}</button>)}
              </div>
            ) : (
              <div className={`svc-cta-next${typing ? '' : ' is-ready'}`}>
                <a href={waHref} target="_blank" rel="noreferrer">{c.chatContinue} <ArrowUpRight size={14} /></a>
                <button type="button" onClick={() => setPicked(null)}><RotateCcw size={13} /> {c.chatAgain}</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
