import { useState, type CSSProperties } from 'react';
import { useCollection } from '@/lib/siteContent';

type Member = { name: string; role: string; img?: string };

const defaultTeam: Member[] = [
  { name: 'Arjun Chaudhary', role: 'Founder & CEO', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop' },
  { name: 'Dikshita', role: 'Social Media Manager', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop' },
  { name: 'Manvi', role: 'Graphic Designer', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop' },
];

// CMS photos replaced by a hand-picked file in /public, keyed by the uploaded file's id.
const photoOverrides: Record<string, string> = {
  'fee567d9-5ea8-4b8a-988e-112bb318f99e': '/team/manvi.png',
};
const photoFor = (img?: string) => {
  const id = img && Object.keys(photoOverrides).find((key) => img.includes(key));
  return id ? photoOverrides[id] : img;
};

const initialsOf =(name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'CM';

function TeamCard({ member }: { member: Member }) {
  // A missing or broken photo is dropped, leaving the initials showing underneath.
  const [broken, setBroken] = useState(false);
  return (
    <article className={`team-card${/founder|ceo/i.test(member.role) ? ' is-founder' : ''}`}>
      <div className="team-card-photo" data-initials={initialsOf(member.name)}>
        {member.img && !broken && <img src={member.img} alt={member.name} loading="lazy" decoding="async" onError={() => setBroken(true)} />}
      </div>
      <div className="team-card-info">
        <h3 className="team-card-name">{member.name}</h3>
        <p className="team-card-role">{member.role || 'CLYX Team'}</p>
      </div>
    </article>
  );
}

/** The homepage team strip: an endless marquee of photo + name + role cards from the Team list. */
export default function TeamMarquee() {
  const team = useCollection<Member>('team', defaultTeam, (m) => ({ name: String(m.name ?? ''), role: String(m.role ?? ''), img: photoFor(m.img) }));
  const cards = team.map((member, i) => <TeamCard key={`${member.name}-${i}`} member={member} />);
  return (
    <div className="team-grid" id="teamGrid">
      <div className="team-marquee-track" style={{ '--team-duration': `${Math.max(24, team.length * 6)}s` } as CSSProperties}>
        <div className="team-marquee-set">{cards}</div>
        {/* Second copy makes the loop seamless; screen readers only get the first. */}
        <div className="team-marquee-set" aria-hidden="true">{cards}</div>
      </div>
    </div>
  );
}
