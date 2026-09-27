import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Header from './Header';
import { CookieBar, Footer, WhatsAppButton } from './Footer';
import { DirectionalReveal, Reveal } from '@/components/ui/ScrollMotion';
import { isExternalHref, safeHref, usePageContent } from '@/lib/pageContent';
import '@/styles/inner-hero.css';

// The intro card's two buttons, edited under "Header & Footer" in the admin panel.
export function HeroButtons(){const c=usePageContent('global');const buttons=[{text:c.heroPrimaryText,href:safeHref(c.heroPrimaryUrl),cls:'ih-btn-primary'},{text:c.heroSecondaryText,href:safeHref(c.heroSecondaryUrl),cls:'ih-btn-ghost'}].filter(b=>b.text);if(!buttons.length)return null;return <div className="ih-actions">{buttons.map(b=><a key={b.cls} href={b.href} className={`ih-btn ${b.cls}`} {...(isExternalHref(b.href)?{target:'_blank',rel:'noreferrer'}:{})}>{b.text} <ArrowUpRight size={16}/></a>)}</div>}
// `aside` replaces the default intro card on the right of the hero; pass `false` to leave that side empty.
// `heroDecor` renders straight inside the hero section, behind the copy (e.g. the Careers heartbeat line).
// `lead` renders under the title in the left column; `heroClass` adds a class to the hero for a page-specific look.
// `hero` replaces the whole default hero layout (eyebrow, title and intro card) with a page's own.
export default function PageShell({children, eyebrow, title, intro, tone='light', aside, heroDecor, lead, heroClass, hero, grid=false}:{children:ReactNode;eyebrow:string;title:ReactNode;intro:string;tone?:'light'|'dark';aside?:ReactNode;heroDecor?:ReactNode;lead?:ReactNode;heroClass?:string;hero?:ReactNode;grid?:boolean}){return <div className="inner-page-shell min-h-screen bg-[color:var(--background)] text-foreground transition-colors duration-200"><Header/><main>
  <section className={`inner-hero${tone==='dark'?' is-dark':''}${grid?' has-grid':''}${heroClass?` ${heroClass}`:''}`}>
    <div className="ih-orb" aria-hidden="true"/>
    {heroDecor}
    {hero ?? <div className="container ih-inner">
      <Reveal className="ih-copy">
        <p className="ih-eyebrow"><span className="ih-dot" aria-hidden="true"/>{eyebrow}</p>
        <h1 className="ih-title">{title}</h1>
        {lead}
      </Reveal>
      <DirectionalReveal direction="right" delay={420}>
        {aside ?? <div className="ih-card">
          <p className="ih-intro">{intro}</p>
          <HeroButtons/>
        </div>}
      </DirectionalReveal>
    </div>}
  </section>
  <Reveal className="page-content-reveal">{children}</Reveal></main><Footer/><WhatsAppButton/><CookieBar/></div>}
