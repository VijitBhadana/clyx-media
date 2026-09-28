import { ArrowUpRight, Briefcase, MapPin, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { parseBody } from '@/lib/blog';

type Copy = Record<string, string>;
export type RoleInfo = { title: string; type: string; detail: string; description: string };

// Full write-up for one open role, opened from "See description" on its card. Same body format as blog articles.
export default function RoleDescriptionDialog({ open, onOpenChange, role, onApply, content: c }: { open: boolean; onOpenChange: (open: boolean) => void; role: RoleInfo; onApply: () => void; content: Copy }) {
  const [kind, ...places] = (role.type || '').split('/').map((x) => x.trim()).filter(Boolean);
  const blocks = parseBody(role.description || role.detail || '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-2xl border-clyx-yellow/25 [scrollbar-color:var(--color-clyx-yellow)_transparent] [scrollbar-width:thin] bg-clyx-dark p-0 text-white shadow-[0_40px_80px_-30px_rgba(0,0,0,.9)] sm:max-w-2xl">
        <div className="relative overflow-hidden border-b border-clyx-yellow/20 bg-gradient-to-br from-[#1a1a1a] to-clyx-dark px-6 pb-5 pt-6">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-clyx-yellow/20 blur-3xl" />
          <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-clyx-yellow" />
          <button type="button" onClick={() => onOpenChange(false)} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-clyx-yellow hover:text-clyx-yellow" aria-label="Close"><X size={16} /></button>
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-clyx-yellow">{c.rolesDescLabel}</p>
          <DialogTitle className="display mt-2 pr-10 text-2xl font-bold leading-tight md:text-3xl">{role.title}</DialogTitle>
          <DialogDescription className="sr-only">{role.detail || role.title}</DialogDescription>
          {kind && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-clyx-yellow/30 bg-clyx-yellow/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.14em] text-clyx-yellow"><Briefcase size={12} />{kind}</span>
              {places.map((place) => <span key={place} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[.14em] text-white/75"><MapPin size={12} />{place}</span>)}
            </div>
          )}
        </div>

        <div className="grid gap-4 px-6 py-6 text-sm leading-6 text-white/75">
          {blocks.map((b, i) =>
            b.kind === 'h2' ? <h3 key={i} className="display mt-2 text-lg font-semibold text-white">{b.text}</h3>
            : b.kind === 'list' ? <ul key={i} className="grid gap-2">{b.items.map((item, j) => <li key={j} className="relative pl-5 before:absolute before:left-0 before:top-[.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-clyx-yellow">{item}</li>)}</ul>
            : b.kind === 'quote' ? <p key={i} className="border-l-2 border-clyx-yellow pl-4 italic text-white/85">{b.text}</p>
            : <p key={i}>{b.text}</p>
          )}
        </div>

        <div className="border-t border-white/10 px-6 py-5">
          <button type="button" onClick={onApply} className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-clyx-yellow px-6 py-3.5 text-sm font-semibold uppercase tracking-[.1em] text-clyx-dark transition-colors hover:bg-white sm:w-auto">
            {c.rolesDescApply}<ArrowUpRight size={16} className="transition-transform group-hover:rotate-45" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
