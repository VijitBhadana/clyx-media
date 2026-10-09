import { ArrowUpRight, BarChart3, CalendarClock, Check, Clock, MonitorPlay, X, type LucideIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { parseBody } from '@/lib/blog';
import { responsiveImage } from '@/lib/images';
import { splitLines } from '@/lib/pageContent';
import { FormattedText } from '@/components/ui/FormattedText';
import { coursePrice, formatRupees, type Course } from '@/data/courses';

type Copy = Record<string, string>;

/** "One point per line" fields -> list items; a leading "-", "*" or "•" is dropped. */
const points = (text: string) => splitLines(text).map((line) => line.replace(/^[-*•]\s*/, '')).filter(Boolean);

function Points({ title, items, tick }: { title: string; items: string[]; tick?: boolean }) {
  if (!items.length) return null;
  return (
    <section>
      <h3 className="display text-lg font-semibold text-white">{title}</h3>
      <ul className="mt-3 grid gap-2.5">
        {items.map((item, i) =>
          tick ? (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-clyx-yellow text-clyx-dark"><Check size={12} strokeWidth={3} /></span>
              <span>{item}</span>
            </li>
          ) : (
            <li key={i} className="relative pl-5 before:absolute before:left-0 before:top-[.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-clyx-yellow">{item}</li>
          ),
        )}
      </ul>
    </section>
  );
}

// Full details of one course, opened from "See more details" on its card. "Purchase" opens the checkout chat.
export default function CourseDetailsDialog({ open, onOpenChange, course, onBuy, content: c }: { open: boolean; onOpenChange: (open: boolean) => void; course: Course; onBuy: () => void; content: Copy }) {
  const price = coursePrice(course);
  const original = Number(course.originalPrice) || 0;
  const blocks = parseBody(course.description || '');
  const facts = (
    [
      [Clock, c.detailsDuration, course.duration],
      [BarChart3, c.detailsLevel, course.level],
      [MonitorPlay, c.detailsFormat, course.format],
      [CalendarClock, c.detailsSchedule, course.schedule],
    ] as [LucideIcon, string, string][]
  ).filter(([, , value]) => value?.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Re-points the brand colour tokens so the popup matches the Courses page's navy + lime look. */}
      <DialogContent showCloseButton={false} style={{ '--color-clyx-yellow': '#B6EE3C', '--color-clyx-dark': '#071A29', fontFamily: "'Space Grotesk', sans-serif" } as React.CSSProperties} className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-2xl border-clyx-yellow/25 [scrollbar-color:var(--color-clyx-yellow)_transparent] [scrollbar-width:thin] bg-clyx-dark p-0 text-white shadow-[0_40px_80px_-30px_rgba(0,0,0,.9)] sm:max-w-2xl">
        <div className="relative h-44 overflow-hidden sm:h-56">
          {course.image && <img {...responsiveImage(course.image, '(min-width: 640px) 672px, 100vw')} alt="" className="h-full w-full object-cover" />}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-clyx-dark via-clyx-dark/40 to-transparent" />
          <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-clyx-yellow" />
          <button type="button" onClick={() => onOpenChange(false)} className="cr-pill absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur transition-colors hover:border-clyx-yellow hover:text-clyx-yellow" aria-label="Close"><X size={16} /></button>
          {course.badge && <span className="absolute left-5 top-5 rounded-full bg-clyx-yellow px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-clyx-dark">{course.badge}</span>}
        </div>
        <div className="-mt-10 relative px-6 pb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-clyx-yellow">{c.detailsLabel}</p>
          <DialogTitle className="display mt-2 text-2xl font-bold leading-tight md:text-3xl">{course.title}</DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-6 text-white/70">{course.tagline || course.title}</DialogDescription>
        </div>

        {facts.length > 0 && (
          <dl className="grid grid-cols-2 gap-px border-y border-white/10 bg-white/10">
            {facts.map(([Icon, label, value]) => (
              <div key={label} className="bg-clyx-dark px-6 py-4">
                <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[.14em] text-white/50"><Icon size={12} className="text-clyx-yellow" />{label}</dt>
                <dd className="mt-1 text-sm font-semibold text-white">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="grid gap-6 px-6 py-6 text-sm leading-6 text-white/75">
          <Points title={c.detailsLearn} items={points(course.highlights)} tick />
          <Points title={c.detailsIncludes} items={points(course.includes)} />
          {blocks.length > 0 && (
            <section className="grid gap-4">
              <h3 className="display text-lg font-semibold text-white">{c.detailsAbout}</h3>
              {blocks.map((b, i) =>
                b.kind === 'h2' ? <h4 key={i} className="display mt-2 text-base font-semibold text-white">{b.text}</h4>
                : b.kind === 'list' ? <ul key={i} className="grid gap-2">{b.items.map((item, j) => <li key={j} className="relative pl-5 before:absolute before:left-0 before:top-[.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-clyx-yellow">{item}</li>)}</ul>
                : b.kind === 'quote' ? <p key={i} className="border-l-2 border-clyx-yellow pl-4 italic text-white/85"><FormattedText text={b.text} /></p>
                : <p key={i}><FormattedText text={b.text} /></p>
              )}
            </section>
          )}
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-clyx-dark/95 px-6 py-4 backdrop-blur">
          {price > 0 && (
            <p className="flex items-baseline gap-2">
              <span className="display text-2xl font-bold text-clyx-yellow">{formatRupees(price)}</span>
              {original > price && <span className="text-sm text-white/45 line-through">{formatRupees(original)}</span>}
            </p>
          )}
          <button type="button" onClick={onBuy} className="cr-pill group inline-flex flex-1 items-center justify-center gap-3 rounded-full bg-clyx-yellow px-6 py-3.5 text-sm font-semibold uppercase tracking-[.1em] text-clyx-dark transition-colors hover:bg-white sm:flex-none">
            {c.buyButton}<ArrowUpRight size={16} className="transition-transform group-hover:rotate-45" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
