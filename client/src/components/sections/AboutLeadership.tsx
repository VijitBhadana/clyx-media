import { useState, type CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/ui/ScrollMotion';
import { pageDefaults, safeHref } from '@/lib/pageContent';
import '@/styles/about-leadership.css';

export type TeamMember = { name: string; role: string; bio?: string; metric?: string; img?: string };

// Avatars shown in the header stack before collapsing into a "+N" chip.
const STACK_MAX = 6;

const isFounder = (m: TeamMember) => /founder|ceo/i.test(m.role || '');

const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');

// Photo with a monogram fallback for members without an image (or with a broken link).
function Portrait({ member, className }: { member: TeamMember; className: string }) {
  const [failed, setFailed] = useState(false);
  if (!member.img || failed) {
    return <div className={`${className} lead-monogram`} aria-hidden="true">{initialsOf(member.name)}</div>;
  }
  return <img src={member.img} alt={member.name} className={className} loading="lazy" onError={() => setFailed(true)} />;
}

export default function AboutLeadership({
  members,
  content: c = pageDefaults('about'),
}: {
  members: TeamMember[];
  content?: Record<string, string>;
}) {
  const founders = members.filter(isFounder);
  const team = members.filter((m) => !isFounder(m));

  return (
    <section id="team" className="section-shell lead-section py-20 md:py-28">
      <div className="container">
        <div className="lead-head">
          <Reveal className="lead-head-main">
            {/* Illustrative chat thread above the heading: a client asks, the founder answers directly. */}
            <div className="lead-chat" aria-hidden="true">
              <div className="lead-chat-row">
                <span className="lead-chat-avatar lead-chat-you">You</span>
                <p className="lead-chat-bubble">Can we tweak the hook on reel 3 before it goes live?</p>
              </div>
              <div className="lead-chat-row lead-chat-row-reply">
                <p className="lead-chat-bubble lead-chat-bubble-reply">
                  <span className="lead-chat-name">{founders[0]?.name.split(/\s+/)[0] || 'Founder'} · Founder</span>
                  On it. New cut in your inbox tonight.
                </p>
                {founders[0]
                  ? <Portrait member={founders[0]} className="lead-chat-avatar" />
                  : <span className="lead-chat-avatar lead-monogram">CX</span>}
              </div>
              <div className="lead-chat-typing"><span /><span /><span /></div>
            </div>
            <div>
              <p className="lead-eyebrow">{c.leadEyebrow}</p>
              <h2 className="display text-4xl font-bold md:text-6xl">
                {c.leadTitle}<br /><span className="lead-accent-text">{c.leadHighlight}</span>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={200} className="lead-head-side">
            <div className="lead-access">
              <div className="lead-access-top">
                <div className="lead-stack" aria-label={`${members.length} people on the CLYX team`}>
                  {members.slice(0, STACK_MAX).map((m, i) => (
                    <Portrait key={`${m.name}-${i}`} member={m} className="lead-stack-img" />
                  ))}
                  {members.length > STACK_MAX && <span className="lead-stack-more">+{members.length - STACK_MAX}</span>}
                </div>
                {c.leadLive && <span className="lead-access-live"><span className="lead-access-dot" />{c.leadLive}</span>}
              </div>
              <p className="lead-access-title">{c.leadCardTitle}</p>
              <p className="lead-access-text">
                {(c.leadAccessText || 'No account-manager relay. {foundersPhrase} {count}-person core team, one conversation.')
                  .replace(/\{foundersPhrase\}/g, founders.length > 0 ? `${founders.length} founders and a` : 'A')
                  .replace(/\{count\}/g, String(members.length))}
              </p>
              <a href={safeHref(c.leadCardButtonUrl || '/contact')} className="lead-access-cta">{c.leadCardButton} <ArrowUpRight size={16} /></a>
            </div>
          </Reveal>
        </div>

        {team.length > 0 && (
          <div className="lead-subhead">
            <p className="lead-eyebrow">{c.leadTeamLabel}</p>
            {c.leadJoinText && <a href={safeHref(c.leadJoinUrl || '/careers')} className="lead-join">{c.leadJoinText} <ArrowUpRight size={14} /></a>}
          </div>
        )}

        {founders.length > 0 && (
          <div className="lead-flank">
            <div className="lead-founders" style={{ '--lead-cols': Math.min(founders.length, 3) } as CSSProperties}>
              {founders.map((m, i) => (
                <Reveal key={`${m.name}-${i}`} delay={i * 140}>
                  <div className="lead-founder">
                    <div className="lead-founder-media">
                      <Portrait member={m} className="lead-founder-img" />
                      {m.metric && <span className="lead-badge">{m.metric}</span>}
                      <div className="lead-founder-caption">
                        <h3 className="display">{m.name}</h3>
                        <p>{m.role}</p>
                      </div>
                    </div>
                    {m.bio && <p className="lead-founder-bio">{m.bio}</p>}
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Whole team in one grid next to the founder: six across. */}
            <div className="lead-flank-col">
              {team.map((m, i) => (
                <Reveal key={`${m.name}-${i}`} delay={(i % 6) * 90}>
                  <div className="lead-flank-member">
                    <Portrait member={m} className="lead-flank-img" />
                    <div className="lead-flank-info">
                      <h3>{m.name}</h3>
                      <p className="lead-member-role">{m.role}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
