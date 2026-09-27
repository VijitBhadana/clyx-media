import { ArrowUpRight } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import { Label, Section } from '@/components/ui/primitives';
import { DirectionalReveal } from '@/components/ui/ScrollMotion';
import { ICONS as SERVICE_ICONS } from '@/components/sections/ServiceGrid';
import ServicesCTA from '@/components/sections/ServicesCTA';
import OperatingPrinciple from '@/components/sections/OperatingPrinciple';
import ServicesHeroEngine from '@/components/sections/ServicesHeroEngine';
import { usePageContent, useServices } from '@/lib/pageContent';
export default function ServicesPage(){const c=usePageContent('services');const rows=useServices();return <PageShell eyebrow={c.heroEyebrow} title={<>{c.heroTitle}<br/><span className="text-yellow">{c.heroHighlight}</span></>} intro="" aside={<ServicesHeroEngine items={rows} note={c.heroNote}/>}><Section className="overflow-x-clip"><div className="mb-12"><Label>{c.listEyebrow}</Label><h2 className="display text-5xl font-bold md:text-7xl">{c.listTitle}</h2></div><div className="grid gap-4">{rows.map((service,i)=><DirectionalReveal key={service.iconKey} direction={i%2===0?'left':'right'} delay={(i%3)*120} className="service-row-reveal"><article className="service-row-card group grid gap-5 md:grid-cols-[80px_1fr_1fr_auto] md:items-center"><span className="service-row-index">{(()=>{const Icon=SERVICE_ICONS[service.iconKey]?.Icon;return Icon?<Icon size={22} strokeWidth={1.9} aria-hidden="true"/>:service.index;})()}</span><h3 className="display text-3xl font-semibold">{service.title}</h3><p className="max-w-md text-sm leading-6 text-muted">{service.text}</p><ArrowUpRight className="service-row-arrow"/></article></DirectionalReveal>)}</div></Section><ServicesCTA content={c}/><OperatingPrinciple content={c}/></PageShell>}
