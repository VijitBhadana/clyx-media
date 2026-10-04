import { usePageTitle } from '@/hooks/usePageMeta';
import PageShell from '@/components/layout/PageShell';
import { Label, Section } from '@/components/ui/primitives';
import AboutHero, { AboutHeroGlow } from '@/components/sections/AboutHero';
import AboutLeadership from '@/components/sections/AboutLeadership';
import AboutValues from '@/components/sections/AboutValues';
import { leaders as defaultLeaders } from '@/data/home';
import { Lines } from '@/components/ui/Lines';
import { useCollection } from '@/lib/siteContent';
import { usePageContent } from '@/lib/pageContent';
import { FormattedText } from '@/components/ui/FormattedText';
export default function About(){usePageTitle('About | CLYX Media');const c=usePageContent('about');const leaders=useCollection('team',defaultLeaders,item=>({name:item.name,role:item.role,metric:item.badge,bio:item.bio,img:item.img}));return <PageShell heroClass="about-hero" heroDecor={<AboutHeroGlow/>} hero={<AboutHero content={c}/>} eyebrow={c.heroTag} title={c.heroHeadline} intro={c.heroSub}><Section className="about-intro"><div className="split-intro grid gap-10 md:grid-cols-2 md:items-start"><div><Label>{c.introLabel}</Label><h2 className="display mt-5 max-w-2xl text-4xl font-bold md:text-5xl xl:text-6xl"><Lines text={c.introTitle}/></h2></div><p className="max-w-xl text-base leading-7 text-muted md:pt-10"><FormattedText text={c.introText} /></p></div></Section><AboutValues content={c}/><AboutLeadership members={leaders} content={c}/></PageShell>}
