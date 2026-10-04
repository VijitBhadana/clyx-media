import { usePageTitle } from '@/hooks/usePageMeta';
import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Mail, MessageCircle, CalendarDays, CheckCircle2, Loader2 } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import { Label, Section } from '@/components/ui/primitives';
import { API_URL } from '@/lib/api';
import { safeHref, usePageContent } from '@/lib/pageContent';
import { FormattedText } from '@/components/ui/FormattedText';

type Status = { kind: 'idle' | 'sending' | 'done' } | { kind: 'error'; message: string };

const field = 'w-full border-b border-grid bg-transparent px-0 py-4 text-lg outline-none focus:border-blue';
const labelCls = 'block text-[10px] font-semibold uppercase tracking-[.16em] text-muted';

export default function Contact(){usePageTitle('Contact | CLYX Media');
  const c=usePageContent('contact');
  const [status,setStatus]=useState<Status>({kind:'idle'});
  const sending=status.kind==='sending';

  const submit=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const form=e.currentTarget;
    setStatus({kind:'sending'});
    try{
      const res=await fetch(`${API_URL}/api/public/contact`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});
      const body=await res.json().catch(()=>({}));
      if(!res.ok) throw new Error(body.error||c.formError);
      form.reset();
      setStatus({kind:'done'});
    }catch(err){
      setStatus({kind:'error',message:err instanceof Error&&err.message!=='Failed to fetch'?err.message:c.formNetworkError});
    }
  };

  return <PageShell eyebrow={c.heroEyebrow} title={<>{c.heroTitle}<br/><span className="text-yellow">{c.heroHighlight}</span></>} intro={c.heroIntro}><Section><div className="grid gap-16 md:grid-cols-[.75fr_1.25fr]"><div><Label>{c.detailsLabel}</Label><div className="space-y-6 text-sm">{c.email&&<a href={`mailto:${c.email}`} className="flex items-center gap-3 hover:text-blue"><Mail size={18}/>{c.email}</a>}{c.whatsappUrl&&<a href={safeHref(c.whatsappUrl)} className="flex items-center gap-3 hover:text-blue"><MessageCircle size={18}/>{c.whatsappLabel}</a>}{c.calendlyUrl&&<a href={safeHref(c.calendlyUrl)} className="flex items-center gap-3 hover:text-blue"><CalendarDays size={18}/>{c.calendlyLabel} <ArrowUpRight size={16}/></a>}</div></div>
    <div id="contact-form" className="scroll-mt-28">
      {status.kind==='done'?(
        <div role="status" className="flex flex-col items-start gap-5 border border-grid p-8">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-yellow text-dark"><CheckCircle2 size={28}/></span>
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-muted">{c.formSent}</p>
          <h2 className="display text-3xl font-bold">{c.formSentTitle}</h2>
          <p className="text-muted"><FormattedText text={c.formSentText} /></p>
          <button type="button" onClick={()=>setStatus({kind:'idle'})} className="inline-flex items-center gap-3 border border-grid px-5 py-3 text-xs font-semibold uppercase tracking-[.1em] hover:border-blue hover:text-blue">{c.formSendAnother}</button>
        </div>
      ):(
        <form onSubmit={submit} className="contact-form grid gap-8">
          <label><span className={labelCls}>{c.formNameLabel}</span><input name="name" required minLength={2} maxLength={120} autoComplete="name" placeholder={c.formName} className={field}/></label>
          <label><span className={labelCls}>{c.formEmailLabel}</span><input name="email" type="email" required maxLength={200} autoComplete="email" placeholder={c.formEmail} className={field}/></label>
          <label><span className={labelCls}>{c.formCompanyLabel}</span><input name="company" maxLength={200} autoComplete="organization" placeholder={c.formCompany} className={field}/></label>
          <label><span className={labelCls}>{c.formMessageLabel}</span><textarea name="message" required minLength={5} maxLength={5000} placeholder={c.formMessage} rows={4} className={`${field} resize-none`}/></label>
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0"/>
          {status.kind==='error'&&<p role="alert" className="border border-[#e5484d]/40 bg-[#e5484d]/10 px-4 py-3 text-sm text-[#e5484d]">{status.message}</p>}
          <button type="submit" disabled={sending} className="inline-flex w-fit items-center gap-3 bg-yellow px-6 py-4 text-sm font-semibold uppercase tracking-[.1em] text-dark hover:bg-blue hover:text-white disabled:cursor-wait disabled:opacity-70">{sending?<><Loader2 size={16} className="animate-spin"/>{c.formSending}</>:<>{c.formButton} <ArrowUpRight size={16}/></>}</button>
        </form>
      )}
    </div>
  </div></Section><section className="bg-yellow text-dark"><div className="container grid gap-8 py-20 md:grid-cols-3 md:py-28">{[c.step1,c.step2,c.step3].map((step,i)=><div key={i}><p className="font-mono text-xs">{String(i+1).padStart(2,'0')}</p><h2 className="display mt-5 text-4xl font-bold">{step}</h2></div>)}</div></section></PageShell>}
