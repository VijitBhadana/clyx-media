import { trpc } from '@/lib/trpc';

export type CmsStyle = { fontSize?: string; fontFamily?: string; fontWeight?: string; textColor?: string; background?: string; spacing?: string };
export type CmsRecord = { id?: number; page: string; section: string; content: Record<string, unknown>; sortOrder?: number; style?: CmsStyle };

export const cmsPresets: CmsRecord[] = [
  { page:'homepage', section:'hero', content:{ eyebrow:'Performance creative / creator ads', headline:'We turn organic clips into scaled accounts.', supportingCopy:'CLYX turns creator content into paid media that moves at scale. Creative instincts, performance discipline.', primaryCta:'See what we do', secondaryCta:'Scroll to explore' }, style:{ fontSize:'display', fontFamily:'Inter', fontWeight:'700' } },
  { page:'homepage', section:'ribbon', content:{ items:['KULTURE','NOVA','MUTHA','MOTION','HUSH'] }, style:{ fontSize:'12px', fontWeight:'700', background:'yellow' } },
  { page:'homepage', section:'proof', content:{ statement:'The ad should feel like culture. The result should feel like math.', supportingCopy:"Most agencies choose between creative and performance. We don't. CLYX connects the instinct that makes people stop with the systems that make brands grow.", stats:[{value:'3.8x',label:'average ROAS'},{value:'42%',label:'lower CPA'},{value:'10M+',label:'paid impressions'}] }, style:{ fontSize:'16px', spacing:'comfortable' } },
  { page:'homepage', section:'services', content:{ eyebrow:'What we run', heading:'Six disciplines. One growth engine.', description:'From strategy to storefront, we build the creative and performance systems that turn attention into revenue.' }, style:{ fontSize:'display', fontWeight:'700' } },
  { page:'homepage', section:'methodology', content:{ eyebrow:'The CLYX methodology', heading:'A one-off post does not sell. A whitelisted ad, run on data, does.' }, style:{ fontSize:'display', fontWeight:'700' } },
  { page:'homepage', section:'leadership', content:{ eyebrow:'CLYX leadership', heading:'Small team. Direct founder access.', intro:'You collaborate directly with senior partners who have scaled high-growth categories.', leaders:[{name:'Arjun Chaudhary',role:'Founder & CEO',bio:'Leads the CLYX team and sets the strategic direction across performance, creative, and growth.'},{name:'Sanya Malhotra',role:'Head of Creator Strategy & UGC',bio:'Directs creator relationships and content production frameworks that convert.'},{name:'Karan Johar',role:'Head of Conversion Tech & CRO',bio:'Builds fast, conversion-first digital experiences where every interaction earns its place.'}] }, style:{ fontSize:'display', fontWeight:'700' } },
  { page:'homepage', section:'testimonials', content:{ eyebrow:'Client results', heading:'What D2C founders say about CLYX.', items:[] }, style:{ fontSize:'16px' } },
  { page:'homepage', section:'cta', content:{ eyebrow:'Ready when you are', heading:'Make your next move louder.', button:'Start a project' }, style:{ fontSize:'display', fontWeight:'700', background:'yellow' } },
  ...['about','services','portfolio','case-studies','creators','blog','careers','contact'].map(page=>({ page, section:'page-intro', content:{ title:'', intro:'', eyebrow:'' }, style:{ fontSize:'display', fontWeight:'700' } })),
];

export function parseCmsRecord(row: { id?: number; page: string; section: string; content: string; sortOrder?: number }): CmsRecord { try { const parsed=JSON.parse(row.content); return { id:row.id, page:row.page, section:row.section, sortOrder:row.sortOrder, content:parsed.content ?? parsed, style:parsed.style ?? {} }; } catch { return { id:row.id, page:row.page, section:row.section, sortOrder:row.sortOrder, content:{ raw:row.content }, style:{} }; } }
export function serializeCmsRecord(record: CmsRecord) { return JSON.stringify({ content:record.content, style:record.style ?? {} }, null, 2); }

export function useCmsRecord(page: string, section: string) {
  const query = trpc.content.list.useQuery(undefined, { staleTime: 30_000 });
  const record = query.data?.find(item=>item.page===page && item.section===section);
  const preset = cmsPresets.find(item=>item.page===page && item.section===section);
  return { record: record ? parseCmsRecord(record) : preset, isLoading:query.isLoading };
}
