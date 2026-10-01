import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Briefcase, FileText, MapPin, Rocket } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import { RevealWords } from '@/components/ui/ScrollMotion';
import CareersValuesFlow from '@/components/sections/CareersValuesFlow';
import CareersHowWeWork from '@/components/sections/CareersHowWeWork';
import { Label, Section } from '@/components/ui/primitives';
import { useCollection } from '@/lib/siteContent';
import { safeHref, usePageContent } from '@/lib/pageContent';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import '@/styles/careers-hero-card.css';
// The apply form (and the dialog library under it) is only downloaded once a visitor points at or picks a role.
const loadApplyDialog=()=>import('@/components/sections/ApplyDialog');
const ApplyDialog=lazy(loadApplyDialog);
// Same for the "See description" popup.
const loadDescDialog=()=>import('@/components/sections/RoleDescriptionDialog');
const RoleDescriptionDialog=lazy(loadDescDialog);
const defaultRoles=[{title:'Performance Marketing Lead',type:'Full-time / Remote',detail:'Own the decisions that turn winning creative into efficient growth.',description:''},{title:'Creator Partnerships Manager',type:'Full-time / Mumbai or Remote',detail:'Build the relationships and systems behind our creator network.',description:''},{title:'Conversion Designer',type:'Contract / Remote',detail:'Shape the pages, offers, and interactions that turn attention into action.',description:''}];
export default function Careers(){const c=usePageContent('careers');const roles=useCollection('careers',defaultRoles,item=>({title:item.title,type:item.type,detail:item.detail,description:item.description||''}));const [cardIn,setCardIn]=useState(false);const showCard=useCallback(()=>setCardIn(true),[]);return <PageShell eyebrow={c.heroEyebrow} title={<span data-hero-title>{c.heroTitle}<span data-hero-baseline className="inline-block h-0 w-0"/><br/><RevealWords className="text-yellow" text={c.heroHighlight} delay={450}/></span>} intro="" heroDecor={<HeroLine onArrive={showCard}/>} aside={<HeroCard c={c} shown={cardIn}/>}><CareersHowWeWork c={c}/><RolesSection c={c} roles={roles}/><Section className="values-section"><CareersValuesFlow label={c.valuesLabel} title={c.valuesTitle} highlight={c.valuesHighlight} intro={c.valuesIntro} values={[{title:c.value1,text:c.value1Text},{title:c.value2,text:c.value2Text},{title:c.value3,text:c.value3Text}]}/></Section></PageShell>}
// Heartbeat line across the hero: runs from the left edge just above the headline, blips once past the
// headline, then slips behind the card to the right edge. The card is revealed as the line reaches it.
const LINE_START=250,LINE_SPEED=1.2; // ms before drawing starts, px drawn per ms
function HeroLine({onArrive}:{onArrive:()=>void}){const svgRef=useRef<SVGSVGElement>(null);const [geo,setGeo]=useState<{w:number;h:number;d:string}|null>(null);const [mode,setMode]=useState<{draw:boolean;duration:number}|null>(null);
  useEffect(()=>{const hero=svgRef.current?.closest<HTMLElement>('.inner-hero');const title=hero?.querySelector<HTMLElement>('[data-hero-title]');const mark=hero?.querySelector<HTMLElement>('[data-hero-baseline]');const card=hero?.querySelector<HTMLElement>('.careers-hero-card');
    if(!hero||!title||!mark||!card){onArrive();return;}
    const draw=matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)').matches;if(!draw)onArrive();
    // Layout offsets (not bounding rects) so the entrance transforms on the copy and card don't skew the maths.
    const pos=(el:HTMLElement)=>{let x=0,y=0,n:HTMLElement|null=el;while(n&&n!==hero){x+=n.offsetLeft;y+=n.offsetTop;n=n.offsetParent as HTMLElement|null;}return {x,y};};
    const timers:number[]=[window.setTimeout(onArrive,4000)];let started=false;
    const measure=()=>{const w=hero.clientWidth,h=hero.clientHeight,fs=parseFloat(getComputedStyle(title).fontSize)||80;
      const titleRight=pos(title).x+title.offsetWidth,cp=pos(card),cardLeft=cp.x;const capTop=pos(mark).y-fs*.72,eyebrow=hero.querySelector<HTMLElement>('.ih-eyebrow'),eyebrowBottom=eyebrow?pos(eyebrow).y+eyebrow.offsetHeight:capTop-32;const y=Math.round((eyebrowBottom+capTop)/2)+.5; // midway between the eyebrow pill and the first headline row
      // Blip: spike up, long fall to a deep trough, then snap back up to a lower level that runs on to the right edge.
      const bw=168,bx=titleRight+Math.max(8,Math.min(40,(cardLeft-titleRight-bw)/2)),up=Math.min(140,fs*1.4),y2=Math.min(y+Math.round(Math.min(70,fs*.7)),cp.y+card.offsetHeight-24),trough=y+up*1.15;
      setGeo({w,h,d:`M0 ${y}H${bx}L${bx+44} ${y-up}L${bx+144} ${trough}L${bx+bw} ${y2}H${w+24}`});
      if(started)return;started=true;clearTimeout(timers[0]);if(!draw){setMode({draw:false,duration:0});return;}
      const blip=Math.hypot(44,up)+Math.hypot(100,up+trough-y)+Math.hypot(24,trough-y2),toCard=bx+blip+(cardLeft-bx-bw),total=toCard+(w-cardLeft),duration=total/LINE_SPEED;
      setMode({draw:true,duration});timers.push(window.setTimeout(onArrive,LINE_START+Math.max(0,toCard-40)/total*duration));};
    const ro=new ResizeObserver(measure);document.fonts.ready.then(()=>{ro.observe(hero);ro.observe(title);});
    return ()=>{ro.disconnect();timers.forEach(clearTimeout);};},[onArrive]);
  return <svg ref={svgRef} aria-hidden="true" width={geo?.w} height={geo?.h} className={`careers-hero-line${mode?(mode.draw?' is-drawing':' is-static'):''}`} style={mode?.draw?{'--chl-dur':`${mode.duration}ms`,'--chl-delay':`${LINE_START}ms`} as React.CSSProperties:undefined}>{geo&&<path d={geo.d} pathLength={1}/>}</svg>}
// Yellow hiring card on the right of the hero; jumps down to the open roles. Stays hidden until the heartbeat line reaches it.
function HeroCard({c,shown}:{c:Record<string,string>;shown:boolean}){const tags=(c.heroCardTags||'').split(',').map(x=>x.trim()).filter(Boolean);return <a href="#open-roles" className={`careers-hero-card group${shown?' is-in':''}`}>
  <div className="chc-top"><span className="chc-icon" aria-hidden><Rocket size={22} strokeWidth={2}/></span></div>
  {c.heroCardTitle&&<h2 className="chc-title"><RevealWords text={c.heroCardTitle} delay={350} step={40}/></h2>}
  {c.heroCardText&&<p className="chc-text"><span className="sr-only">{c.heroCardText}</span>{c.heroCardText.split(/\s+/).filter(Boolean).map((w,i)=><span key={i} aria-hidden="true">{i>0&&' '}<span className="chc-word" style={{animationDelay:`${650+i*45}ms`}}>{w}</span></span>)}</p>}
  <div className="chc-foot"><ul className="chc-tags">{tags.map(tag=><li key={tag}>{tag}</li>)}</ul><span className="chc-arrow" aria-hidden><ArrowUpRight size={18} strokeWidth={2.4}/></span></div>
</a>}
// Words rise out of a mask one by one once the heading scrolls into view.
function AnimatedHighlight({text}:{text:string}){const ref=useRef<HTMLSpanElement>(null);const inView=useScrollReveal(ref);const words=text.split(/\s+/).filter(Boolean);return <span ref={ref} className={`roles-highlight text-clyx-yellow ${inView?'is-in':''}`}>{words.map((w,i)=><span key={i}>{i>0&&' '}<span className="rh-mask"><span className="rh-word" style={{'--i':i} as React.CSSProperties}>{w}</span></span></span>)}</span>}
type Role={title:string;type:string;detail:string;description:string};
function RolesSection({c,roles}:{c:Record<string,string>;roles:Role[]}){const [applyRole,setApplyRole]=useState<string|null>(null);const lastRole=useRef<string|null>(null);if(applyRole)lastRole.current=applyRole;const [descRole,setDescRole]=useState<Role|null>(null);const lastDesc=useRef<Role|null>(null);if(descRole)lastDesc.current=descRole;const preload=()=>{loadDescDialog();loadApplyDialog();};const gridRef=useRef<HTMLDivElement>(null);const gridInView=useScrollReveal(gridRef);const gridShown=useRef(false);if(gridInView)gridShown.current=true;return <section id="open-roles" className="relative scroll-mt-20 overflow-hidden bg-blue text-white">
  <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-white/[.06] blur-3xl"/>
  <div className="container relative py-10 md:py-12">
    <div className="mb-5 md:mb-6"><Label className="!mb-2" style={{color:'#FFDE59'}}>{c.rolesLabel}</Label>{c.rolesTitle&&<h2 className="display text-2xl font-bold md:text-3xl">{c.rolesTitle}{c.rolesHighlight&&<> <AnimatedHighlight text={c.rolesHighlight}/></>}</h2>}</div>
    <div ref={gridRef} className={`role-cards -mt-1 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 pt-1 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0${gridShown.current?' is-in':''}`}>{roles.map((role,i)=>{const [kind,...places]=(role.type||'').split('/').map(x=>x.trim()).filter(Boolean);const row=Math.floor(i/3),fromLeft=row%2===0,order=fromLeft?i%3:2-i%3;return <div key={`${role.title}-${i}`} style={{'--d':`${row*450+order*130}ms`} as React.CSSProperties} onPointerEnter={preload} className={`role-card ${fromLeft?'from-left':'from-right'} group relative flex w-[82%] shrink-0 snap-start flex-col overflow-hidden sm:w-[46%] lg:w-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/[.10] to-white/[.02] p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-clyx-yellow/40 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,.7)] focus-within:border-clyx-yellow/40 md:p-5`}>
      {/* The whole card applies for the role; "See description" sits above this layer. */}
      <button type="button" onClick={()=>setApplyRole(role.title)} onFocus={loadApplyDialog} aria-label={`Apply for ${role.title}`} className="absolute inset-0 z-[1] rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-clyx-yellow"/>
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-clyx-yellow transition-transform duration-300 group-hover:scale-x-100"/>
      <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[.06] to-transparent transition-transform duration-700 group-hover:translate-x-full"/>
      <div className="flex items-center justify-between">
        <span className="display grid h-8 w-8 place-items-center rounded-lg border border-white/15 bg-white/[.06] text-xs font-semibold tabular-nums text-clyx-yellow transition-colors duration-300 group-hover:border-clyx-yellow group-hover:bg-clyx-yellow group-hover:text-clyx-dark">{String(i+1).padStart(2,'0')}</span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-clyx-blue transition-colors duration-300 group-hover:bg-clyx-yellow group-hover:text-clyx-dark" aria-hidden><ArrowUpRight size={14} className="transition-transform duration-300 group-hover:rotate-45"/></span>
      </div>
      <h3 className="display mt-4 text-lg font-semibold md:text-xl">{role.title}</h3>
      {role.detail&&<p className="mt-1.5 text-[13px] leading-5 text-white/65">{role.detail}</p>}
      <div className="mt-auto flex flex-col items-start gap-3 pt-4 xl:flex-row xl:items-end xl:justify-between">
        {kind?<div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-clyx-yellow/30 bg-clyx-yellow/10 whitespace-nowrap px-3 py-1 text-[10px] font-semibold uppercase tracking-[.14em] text-clyx-yellow"><Briefcase size={12}/>{kind}</span>
          {places.map(place=><span key={place} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[.04] whitespace-nowrap px-3 py-1 text-[10px] font-semibold uppercase tracking-[.14em] text-white/75"><MapPin size={12}/>{place}</span>)}
        </div>:<span/>}
        <button type="button" onClick={()=>setDescRole(role)} onFocus={loadDescDialog} className="relative z-[2] inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/25 bg-white/[.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:border-clyx-yellow hover:bg-clyx-yellow hover:text-clyx-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clyx-yellow"><FileText size={12}/>{c.rolesDescButton}</button>
      </div>
    </div>})}</div>
    {c.rolesNote&&<div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><p className="text-sm text-white/70">{c.rolesNote}</p><a href={safeHref(c.applyUrl||'mailto:work@clyxmedia.com?subject=Careers')} className="inline-flex items-center gap-2 self-start text-xs font-semibold uppercase tracking-[.12em] text-clyx-yellow hover:text-white md:self-auto">{c.rolesNoteLink||'Get in touch'}<ArrowUpRight size={14}/></a></div>}
  </div>
  {lastDesc.current&&<Suspense fallback={null}><RoleDescriptionDialog open={descRole!==null} onOpenChange={o=>!o&&setDescRole(null)} role={lastDesc.current} onApply={()=>{const title=lastDesc.current!.title;setDescRole(null);setApplyRole(title);}} content={c}/></Suspense>}
  {lastRole.current&&<Suspense fallback={null}><ApplyDialog open={applyRole!==null} onOpenChange={o=>!o&&setApplyRole(null)} roles={roles.map(r=>r.title)} initialRole={lastRole.current} content={c}/></Suspense>}
</section>}
