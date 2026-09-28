import { useEffect, useRef, useState, type DragEvent, type FormEvent } from 'react';
import { ArrowUpRight, CheckCircle2, ChevronDown, FileText, Loader2, UploadCloud, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { API_URL } from '@/lib/api';
import { pageDefaults } from '@/lib/pageContent';

export const GENERAL_ROLE = 'General application';
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

type Status = { kind: 'idle' | 'sending' | 'done' } | { kind: 'error'; message: string };
type Copy = Record<string, string>;

const field = 'w-full rounded-xl border border-white/15 bg-white/[.04] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-clyx-yellow focus:bg-clyx-yellow/[.06]';
const labelCls = 'mb-1.5 block text-[10px] font-semibold uppercase tracking-[.16em] text-white/60';

function checkFile(file: File, c: Copy): string | null {
  if (!/\.(pdf|docx?)$/i.test(file.name)) return c.applyResumeTypeError;
  if (file.size > MAX_BYTES) return c.applyResumeSizeError;
  return null;
}

export default function ApplyDialog({ open, onOpenChange, roles, initialRole, content: c = pageDefaults('careers') }: { open: boolean; onOpenChange: (open: boolean) => void; roles: string[]; initialRole: string; content?: Copy }) {
  const [role, setRole] = useState(initialRole);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const inputRef = useRef<HTMLInputElement>(null);
  const options = Array.from(new Set([...roles, GENERAL_ROLE]));

  // Every open starts fresh on the role that was clicked.
  useEffect(() => {
    if (!open) return;
    setRole(initialRole);
    setFile(null);
    setFileError('');
    setStatus({ kind: 'idle' });
  }, [open, initialRole]);

  const pick = (f: File | undefined) => {
    if (!f) return;
    const err = checkFile(f, c);
    setFileError(err ?? '');
    setFile(err ? null : f);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files[0]);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return setFileError(c.applyResumeRequiredError);
    const data = new FormData(e.currentTarget);
    data.set('role', role);
    data.set('resume', file);
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch(`${API_URL}/api/public/apply`, { method: 'POST', body: data });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || c.applyGenericError);
      setStatus({ kind: 'done' });
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error && err.message !== 'Failed to fetch' ? err.message : c.applyNetworkError });
    }
  };

  const sending = status.kind === 'sending';

  return (
    <Dialog open={open} onOpenChange={(next) => !sending && onOpenChange(next)}>
      <DialogContent showCloseButton={false} className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-2xl border-clyx-yellow/25 [scrollbar-color:var(--color-clyx-yellow)_transparent] [scrollbar-width:thin] bg-clyx-dark p-0 text-white shadow-[0_40px_80px_-30px_rgba(0,0,0,.9)] sm:max-w-lg">
        <div className="relative overflow-hidden border-b border-clyx-yellow/20 bg-gradient-to-br from-[#1a1a1a] to-clyx-dark px-6 pb-5 pt-6">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-clyx-yellow/20 blur-3xl" />
          <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-clyx-yellow" />
          <button type="button" onClick={() => onOpenChange(false)} disabled={sending} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-clyx-yellow hover:text-clyx-yellow disabled:opacity-40" aria-label="Close"><X size={16} /></button>
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-clyx-yellow">{status.kind === 'done' ? c.applySentEyebrow : c.applyEyebrow}</p>
          <DialogTitle className="display mt-2 pr-10 text-2xl font-bold leading-tight md:text-3xl">{status.kind === 'done' ? c.applySentTitle : role}</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-white/65">{status.kind === 'done' ? c.applySentText : c.applyIntroText}</DialogDescription>
        </div>

        {status.kind === 'done' ? (
          <div className="flex flex-col items-center gap-5 px-6 py-10 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-clyx-yellow text-clyx-dark"><CheckCircle2 size={30} /></span>
            <button type="button" onClick={() => onOpenChange(false)} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[.12em] text-clyx-dark transition-colors hover:bg-clyx-yellow hover:text-clyx-dark">{c.applyDoneButton}</button>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-4 px-6 py-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className={labelCls}>{c.applyNameLabel}</span><input name="name" required minLength={2} maxLength={120} autoComplete="name" placeholder={c.applyNamePlaceholder} className={field} /></label>
              <label><span className={labelCls}>{c.applyEmailLabel}</span><input name="email" type="email" required maxLength={200} autoComplete="email" placeholder={c.applyEmailPlaceholder} className={field} /></label>
              <label><span className={labelCls}>{c.applyPhoneLabel}</span><input name="phone" type="tel" maxLength={40} autoComplete="tel" placeholder={c.applyPhonePlaceholder} className={field} /></label>
              <label className="sm:col-span-2"><span className={labelCls}>{c.applyRoleLabel}</span>
                <span className="relative block">
                  <select value={role} onChange={(e) => setRole(e.target.value)} className={`${field} cursor-pointer appearance-none pr-10 [&>option]:bg-clyx-dark [&>option]:text-white`}>
                    {options.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-clyx-yellow" />
                </span>
              </label>
            </div>

            <div>
              <span className={labelCls}>{c.applyResumeLabel}</span>
              <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
              {file ? (
                <div className="flex items-center gap-3 rounded-xl border border-clyx-yellow/40 bg-clyx-yellow/10 px-4 py-3">
                  <FileText size={20} className="shrink-0 text-clyx-yellow" />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{file.name}</p><p className="text-xs text-white/55">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
                  <button type="button" onClick={() => setFile(null)} className="grid h-7 w-7 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white" aria-label="Remove file"><X size={14} /></button>
                </div>
              ) : (
                <button type="button" onClick={() => inputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop} className={`flex w-full flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors ${dragging ? 'border-clyx-yellow bg-clyx-yellow/10' : 'border-white/25 bg-white/[.03] hover:border-clyx-yellow/60 hover:bg-white/[.06]'}`}>
                  <UploadCloud size={24} className="text-clyx-yellow" />
                  <span className="text-sm font-medium">{c.applyDropText.replace(/browse$/i, '')}<span className="text-clyx-yellow underline underline-offset-4">browse</span></span>
                  <span className="text-xs text-white/50">{c.applyResumeHint}</span>
                </button>
              )}
              {fileError && <p className="mt-2 text-xs text-[#ffb4a8]">{fileError}</p>}
            </div>

            <label><span className={labelCls}>{c.applyNoteLabel} <span className="normal-case tracking-normal text-white/40">({c.applyNoteHint})</span></span><textarea name="note" rows={2} maxLength={2000} className={`${field} resize-none`} /></label>
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />

            {status.kind === 'error' && <p className="rounded-xl border border-[#ffb4a8]/40 bg-[#ffb4a8]/10 px-4 py-3 text-sm text-[#ffd6cf]">{status.message}</p>}

            <button type="submit" disabled={sending} className="group mt-1 inline-flex items-center justify-center gap-3 rounded-full bg-clyx-yellow px-6 py-3.5 text-sm font-semibold uppercase tracking-[.1em] text-clyx-dark transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-70">
              {sending ? <><Loader2 size={16} className="animate-spin" />{c.applySendingText}</> : <>{c.applySubmitText}<ArrowUpRight size={16} className="transition-transform group-hover:rotate-45" /></>}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
