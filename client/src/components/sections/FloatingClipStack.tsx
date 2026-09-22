import { useEffect, useState } from 'react';

type Card={className:string;label:string;image:string};
const cards:Card[]=[
  {className:'clip-card-one',label:'Organic reel',image:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85'},
  {className:'clip-card-two',label:'Organic reel',image:'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85'},
  {className:'clip-card-three',label:'Scaled ad · +312% ROAS',image:'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85'},
  {className:'clip-card-four',label:'Organic reel',image:'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85'},
  {className:'clip-card-five',label:'Scaled ad · +188% CTR',image:'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85'},
];

export default function FloatingClipStack(){
  const [active,setActive]=useState<Card|null>(null);
  useEffect(()=>{if(!active)return; const close=(event:KeyboardEvent)=>event.key==='Escape'&&setActive(null); document.addEventListener('keydown',close); document.body.style.overflow='hidden'; return()=>{document.removeEventListener('keydown',close);document.body.style.overflow='';}},[active]);
  return <>
    <div className="clip-stack" aria-label="Floating creator content collage">
      {cards.map((card,index)=><button type="button" className={`clip-card ${card.className} clip-card-${index+1}`} key={card.label+index} style={{['--clip-image' as any]:`url(${card.image})`}} onClick={()=>setActive(card)} aria-label={`Open ${card.label} preview`}><span className="clip-thumb"/><span className="clip-glass"/><span className="clip-tag">{card.label}</span></button>)}
    </div>
    {active&&<div className="clip-modal" role="dialog" aria-modal="true" aria-label={`${active.label} preview`} onClick={()=>setActive(null)}><div className="clip-modal-panel" onClick={event=>event.stopPropagation()}><button type="button" className="clip-modal-close" onClick={()=>setActive(null)} aria-label="Close preview">×</button><img src={active.image} alt={active.label}/><p>{active.label}</p></div></div>}
  </>
}
