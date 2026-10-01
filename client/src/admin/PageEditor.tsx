import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Check, FileText, Loader2, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { sectionBlock, type PageDef } from '@/lib/pageContent';
import CollectionManager from './CollectionManager';
import { COLLECTIONS } from './collections';
import { Control, Field } from './fields';
import { PAGE_ICONS } from './nav';
import type { AdminContent } from './useAdminData';

type Values = Record<string, string>;

/**
 * Everything editable on one website page: its copy (grouped by section, saved with one button)
 * and the lists shown on it (each change there saves immediately).
 */
export default function PageEditor({
  page,
  content,
  refetch,
  saveBlock,
  onDirtyChange,
}: {
  page: PageDef;
  content: AdminContent | undefined;
  refetch: () => Promise<unknown>;
  saveBlock: (key: string, value: Values) => Promise<boolean>;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [tab, setTab] = useState<string>('content');
  const [edits, setEdits] = useState<Record<string, Values>>({});
  const [saving, setSaving] = useState(false);

  // Reset local state when switching to another page.
  useEffect(() => {
    setTab('content');
    setEdits({});
  }, [page.id]);

  // What is live right now for every block this page uses: saved values over the built-in defaults.
  const live = useMemo(() => {
    const out: Record<string, Values> = {};
    for (const section of page.sections) {
      const block = sectionBlock(page, section);
      const stored = (content?.blocks?.[block] ?? {}) as Record<string, unknown>;
      out[block] ??= {};
      for (const f of section.fields) {
        out[block][f.key] = typeof stored[f.key] === 'string' ? (stored[f.key] as string) : f.default;
      }
    }
    return out;
  }, [content, page]);

  const valueOf = (block: string, key: string) => edits[block]?.[key] ?? live[block]?.[key] ?? '';
  const changedBlocks = Object.keys(edits).filter((block) => Object.entries(edits[block]).some(([k, v]) => v !== live[block]?.[k]));
  const dirty = changedBlocks.length > 0;
  const changedCount = changedBlocks.reduce(
    (n, block) => n + Object.entries(edits[block]).filter(([k, v]) => v !== live[block]?.[k]).length,
    0,
  );

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  // Warn before closing the tab with unsaved copy.
  useEffect(() => {
    if (!dirty) return;
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [dirty]);

  const setValue = (block: string, key: string, value: string) =>
    setEdits((prev) => ({ ...prev, [block]: { ...prev[block], [key]: value } }));

  const save = async () => {
    setSaving(true);
    let ok = true;
    for (const block of changedBlocks) {
      const stored = (content?.blocks?.[block] ?? {}) as Values;
      ok = (await saveBlock(block, { ...stored, ...live[block], ...edits[block] })) && ok;
    }
    setSaving(false);
    if (ok) {
      setEdits({});
      toast.success(`${page.label} page updated on the live website`);
    }
  };

  const Icon = PAGE_ICONS[page.id];
  const fieldCount = page.sections.reduce((n, s) => n + s.fields.length, 0);

  return (
    <div className="adm-page">
      <header className="adm-hero">
        <div className="adm-hero-glow" aria-hidden="true" />
        <div className="adm-hero-main">
          <span className="adm-hero-icon">
            <Icon size={22} />
          </span>
          <div>
            <p className="adm-eyebrow">Website page · {page.route}</p>
            <h1>{page.label}</h1>
            <p className="adm-hero-text">{page.blurb}</p>
          </div>
        </div>
        <div className="adm-hero-side">
          <div className="adm-hero-stat">
            <strong>{page.sections.length}</strong>
            <span>sections</span>
          </div>
          <div className="adm-hero-stat">
            <strong>{fieldCount}</strong>
            <span>editable fields</span>
          </div>
          <a className="adm-btn is-light" href={page.route} target="_blank" rel="noreferrer">
            View page <ArrowUpRight size={15} />
          </a>
        </div>
      </header>

      <nav className="adm-tabs" aria-label={`${page.label} editor`}>
        <button type="button" className={tab === 'content' ? 'is-active' : ''} onClick={() => setTab('content')}>
          <FileText size={15} /> Page content
          {dirty && <span className="adm-dot is-warn" />}
        </button>
        {page.collections.map((name) => {
          const def = COLLECTIONS[name];
          const TabIcon = def.icon;
          return (
            <button key={name} type="button" className={tab === name ? 'is-active' : ''} onClick={() => setTab(name)}>
              <TabIcon size={15} /> {def.label}
              <span className="adm-count">{content?.collections?.[name]?.length ?? 0}</span>
            </button>
          );
        })}
      </nav>

      {tab === 'content' ? (
        <div className="adm-editor">
          <aside className="adm-outline">
            <p className="adm-outline-title">Sections</p>
            {page.sections.map((section, i) => {
              const block = sectionBlock(page, section);
              const changed = section.fields.some((f) => edits[block]?.[f.key] !== undefined && edits[block][f.key] !== live[block]?.[f.key]);
              return (
                <a
                  key={section.id}
                  href={`#sec-${section.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(`sec-${section.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  <span className="adm-outline-num">{String(i + 1).padStart(2, '0')}</span>
                  {section.title}
                  {changed && <span className="adm-dot is-warn" />}
                </a>
              );
            })}
          </aside>

          <div className="adm-sections">
            {page.sections.map((section, i) => {
              const block = sectionBlock(page, section);
              return (
                <section key={section.id} id={`sec-${section.id}`} className="adm-section">
                  <header>
                    <span className="adm-section-num">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h2>{section.title}</h2>
                      {section.description && <p>{section.description}</p>}
                    </div>
                  </header>
                  <div className="adm-form-grid">
                    {section.fields.map((f) => {
                      const value = valueOf(block, f.key);
                      const wide = f.type === 'textarea' || f.type === 'image' || f.default.length > 48;
                      return (
                        <Field
                          key={f.key}
                          label={f.label}
                          hint={f.hint}
                          wide={wide}
                          onReset={value !== f.default ? () => setValue(block, f.key, f.default) : undefined}
                        >
                          <Control type={f.type} options={f.options} value={value} onChange={(v) => setValue(block, f.key, v)} />
                        </Field>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <CollectionManager key={tab} name={tab as keyof typeof COLLECTIONS} content={content} refetch={refetch} />
      )}

      <div className={`adm-savebar${dirty ? ' is-open' : ''}`} role="status">
        <span className="adm-savebar-text">
          <span className="adm-dot is-warn" />
          {changedCount} unsaved {changedCount === 1 ? 'change' : 'changes'} on {page.label}
        </span>
        <div className="adm-savebar-actions">
          <button type="button" className="adm-btn is-ghost-dark" onClick={() => setEdits({})} disabled={saving}>
            <Undo2 size={15} /> Discard
          </button>
          <button type="button" className="adm-btn is-accent" onClick={save} disabled={saving}>
            {saving ? <Loader2 size={15} className="adm-spin" /> : <Check size={15} />}
            {saving ? 'Publishing…' : 'Publish changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
