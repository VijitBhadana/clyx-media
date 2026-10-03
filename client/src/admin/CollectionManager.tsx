import { Fragment, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, ImageOff, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMoveItem, useServerList, type AdminContent, type ListItem } from './useAdminData';
import { COLLECTIONS } from './collections';
import { Control, Field } from './fields';
import { Confirm, Drawer, Empty } from './ui';
import type { CollectionName } from '@/lib/pageContent';

type Draft = Record<string, string>;

const blankDraft = (name: CollectionName): Draft =>
  Object.fromEntries(COLLECTIONS[name].fields.map((f) => [f.key, f.default ?? '']));

/** Card grid for one repeating list: add, edit in a side panel, hide/show, reorder and delete. Every change saves live. */
export default function CollectionManager({
  name,
  content,
  refetch,
}: {
  name: CollectionName;
  content: AdminContent | undefined;
  refetch: () => Promise<unknown>;
}) {
  const def = COLLECTIONS[name];
  const [items, setItems] = useServerList<ListItem>(name, content, refetch, def.position);
  const move = useMoveItem(refetch);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null);
  const [deleting, setDeleting] = useState<ListItem | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => def.fields.some((f) => String(item[f.key] ?? '').toLowerCase().includes(q)));
  }, [items, query, def]);

  const openNew = () => setEditing({ id: null, draft: blankDraft(name) });
  const openEdit = (item: ListItem) =>
    setEditing({ id: item.id, draft: Object.fromEntries(def.fields.map((f) => [f.key, String(item[f.key] ?? f.default ?? '')])) });

  const save = () => {
    if (!editing) return;
    const missing = def.fields.find((f) => f.required && !editing.draft[f.key]?.trim());
    if (missing) {
      toast.error(`"${missing.label}" is required.`);
      return;
    }
    if (editing.id) {
      const id = editing.id;
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...editing.draft } : x)));
    } else {
      const created = { id: `new-${Date.now()}`, hidden: false, ...editing.draft } as ListItem;
      setItems((prev) => (def.position === 'start' ? [created, ...prev] : [...prev, created]));
    }
    setEditing(null);
  };

  const Icon = def.icon;
  const liveCount = items.filter((x) => !x.hidden).length;

  return (
    <section className="adm-collection">
      <div className="adm-toolbar">
        <div className="adm-toolbar-info">
          <span className="adm-toolbar-icon">
            <Icon size={18} />
          </span>
          <div>
            <h3>{def.label}</h3>
            <p>{def.description}</p>
          </div>
        </div>
        <div className="adm-toolbar-actions">
          <span className="adm-pill">
            <span className="adm-dot is-live" />
            {liveCount} live{items.length !== liveCount ? ` · ${items.length - liveCount} hidden` : ''}
          </span>
          {items.length > 4 && (
            <label className="adm-search">
              <Search size={14} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${def.label.toLowerCase()}…`} />
            </label>
          )}
          <button type="button" className="adm-btn is-primary" onClick={openNew}>
            <Plus size={16} /> Add {def.singular}
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <Empty
          icon={<Icon size={22} />}
          title={`No ${def.label.toLowerCase()} yet`}
          text={`Add the first ${def.singular} and it will appear on the website straight away.`}
          action={
            <button type="button" className="adm-btn is-primary" onClick={openNew}>
              <Plus size={16} /> Add {def.singular}
            </button>
          }
        />
      ) : (
        <div className={`adm-cards${def.imageKey ? ' has-media' : ''}`}>
          {visible.map((item) => {
            const index = items.indexOf(item);
            const image = def.imageKey ? String(item[def.imageKey] ?? '') : '';
            const badge = def.badgeKey ? String(item[def.badgeKey] ?? '') : '';
            const subtitle = def.subtitleKey ? String(item[def.subtitleKey] ?? '') : '';
            const pending = !/^[0-9a-f-]{36}$/i.test(item.id);
            return (
              <article key={item.id} className={`adm-card${item.hidden ? ' is-hidden' : ''}${pending ? ' is-pending' : ''}`}>
                {def.imageKey && (
                  <div className="adm-card-media" onClick={() => openEdit(item)}>
                    {image ? <img src={image} alt="" loading="lazy" /> : <span className="adm-card-noimg"><ImageOff size={20} /></span>}
                    {item.hidden && <span className="adm-card-flag">Hidden</span>}
                  </div>
                )}
                <div className="adm-card-body">
                  <div className="adm-card-top">
                    {badge ? <span className="adm-tag">{badge}</span> : <span />}
                    {!def.imageKey && item.hidden && <span className="adm-card-flag is-inline">Hidden</span>}
                  </div>
                  <h4 onClick={() => openEdit(item)}>{String(item[def.titleKey] || `Untitled ${def.singular}`)}</h4>
                  {subtitle && <p>{subtitle}</p>}
                </div>
                <div className="adm-card-actions">
                  <button type="button" className="adm-chip" onClick={() => openEdit(item)}>
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    type="button"
                    className="adm-icon-btn"
                    title={item.hidden ? 'Show on website' : 'Hide from website'}
                    onClick={() => setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, hidden: !x.hidden } : x)))}
                  >
                    {item.hidden ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  {!query && (
                    <>
                      <button type="button" className="adm-icon-btn" title="Move up" disabled={index === 0 || pending} onClick={() => move(item.id, 'up')}>
                        <ArrowUp size={15} />
                      </button>
                      <button
                        type="button"
                        className="adm-icon-btn"
                        title="Move down"
                        disabled={index === items.length - 1 || pending}
                        onClick={() => move(item.id, 'down')}
                      >
                        <ArrowDown size={15} />
                      </button>
                    </>
                  )}
                  <button type="button" className="adm-icon-btn is-danger" title="Delete" onClick={() => setDeleting(item)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            );
          })}
          {visible.length === 0 && <p className="adm-muted">Nothing matches “{query}”.</p>}
        </div>
      )}

      <Drawer
        open={!!editing}
        title={editing?.id ? `Edit ${def.singular}` : `New ${def.singular}`}
        subtitle={def.description}
        onClose={() => setEditing(null)}
        footer={
          <>
            <button type="button" className="adm-btn is-ghost" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button type="button" className="adm-btn is-primary" onClick={save}>
              {editing?.id ? 'Save changes' : `Add ${def.singular}`}
            </button>
          </>
        }
      >
        {editing && (
          <div className="adm-form-grid">
            {def.fields.map((f) => (
              <Fragment key={f.key}>
                {f.section && <h4 className="adm-form-section">{f.section}</h4>}
                <Field label={f.label} hint={f.hint} required={f.required} wide={f.wide || f.type === 'image' || f.type === 'textarea' || f.type === 'richtext'}>
                  <Control
                    type={f.type}
                    value={editing.draft[f.key] ?? ''}
                    options={f.options}
                    placeholder={f.placeholder}
                    onChange={(v) => setEditing((e) => (e ? { ...e, draft: { ...e.draft, [f.key]: v } } : e))}
                  />
                </Field>
              </Fragment>
            ))}
          </div>
        )}
      </Drawer>

      <Confirm
        open={!!deleting}
        title={`Delete this ${def.singular}?`}
        message={`“${String(deleting?.[def.titleKey] ?? '')}” will be removed from the website. This cannot be undone — use Hide if you only want to take it down for now.`}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          const id = deleting?.id;
          setDeleting(null);
          if (id) setItems((prev) => prev.filter((x) => x.id !== id));
        }}
      />
    </section>
  );
}
