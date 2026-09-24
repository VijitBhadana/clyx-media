import { useState, type CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/ui/ScrollMotion';
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

export default function AboutLeadership({ members }: { members: TeamMember[] }) {
  const founders = members.filter(isFounder);
  const team = members.filter((m) => !isFounder(m));

  return (
    <section id="team" className="section-shell lead-section py-20 md:py-28">
      <div className="container">
        <div className="lead-head">
          <Reveal>
            <p className="lead-eyebrow">Leadership</p>
            <h2 className="display text-4xl font-bold md:text-6xl">
              Small team.<br /><span className="lead-accent-text">Direct access.</span>
            </h2>
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
                <span className="lead-access-live"><span className="lead-access-dot" />Direct line</span>
              </div>
              <p className="lead-access-title">You work with the people who build the work.</p>
              <p className="lead-access-text">
                No account-manager relay. {founders.length > 0 ? `${founders.length} founders and a` : 'A'} {members.length}-person core team, one conversation.
              </p>
              <a href="/contact" className="lead-access-cta">Talk to a founder <ArrowUpRight size={16} /></a>
            </div>
          </Reveal>
        </div>

        {founders.length > 0 && (
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
        )}

        {team.length > 0 && (
          <>
            <div className="lead-subhead">
              <p className="lead-eyebrow">The team</p>
              <a href="/careers" className="lead-join">Join us <ArrowUpRight size={14} /></a>
            </div>
            <div className="lead-team">
              {team.map((m, i) => (
                <Reveal key={`${m.name}-${i}`} delay={i * 90}>
                  <div className="lead-member">
                    <Portrait member={m} className="lead-member-img" />
                    <div className="lead-member-info">
                      <h3>{m.name}</h3>
                      <p className="lead-member-role">{m.role}</p>
                      {m.bio && <p className="lead-member-bio">{m.bio}</p>}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
