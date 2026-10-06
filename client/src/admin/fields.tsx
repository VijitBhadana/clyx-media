import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Film, ImagePlus, IndentDecrease, IndentIncrease, Link2, List, ListOrdered, Loader2, Plus, RotateCcw, Trash2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import type { RowColumn } from '@/lib/pageContent';
import { MAX_VIDEO_MB, uploadImage, uploadVideo, VIDEO_ACCEPT } from './uploadImage';

/** 'textarea' is plain multi-line text (lists the site splits per line); 'richtext' adds the bullet toolbar and shows on the site as typed. */
export type ControlType = 'text' | 'textarea' | 'richtext' | 'image' | 'url' | 'select' | 'color' | 'rows';

/** Label row + control + hint, shared by every form in the admin. */
export function Field({
  label,
  hint,
  required,
  wide,
  onReset,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  wide?: boolean;
  onReset?: () => void;
  children: ReactNode;
}) {
  return (
    <div className={`adm-field${wide ? ' is-wide' : ''}`}>
      <div className="adm-field-head">
        <label className="adm-label">
          {label}
          {required && <span className="adm-req">*</span>}
        </label>
        {onReset && (
          <button type="button" className="adm-reset" onClick={onReset} title="Restore the original text">
            <RotateCcw size={11} /> Reset
          </button>
        )}
      </div>
      {children}
      {hint && <p className="adm-hint">{hint}</p>}
    </div>
  );
}

function AutoTextarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight + 2, 360)}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      className="adm-input adm-textarea"
      value={value}
      rows={3}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/** Same pattern as FormattedText on the site: optional indent, a bullet or "1." / "1)", then a space. */
const LIST_LINE = /^([ \t]*)([•\-*–▪◦●]|\d{1,3}[.)])[ \t]+/;
const INDENT = '   ';

/**
 * Writes `text` over [from, to) through the browser's own editing, so Ctrl+Z still undoes it, then selects
 * [selFrom, selTo). Falls back to setting the value directly where execCommand is unavailable.
 */
function replaceRange(el: HTMLTextAreaElement, from: number, to: number, text: string, selFrom: number, selTo: number, onChange: (v: string) => void) {
  el.focus();
  el.setSelectionRange(from, to);
  let done = false;
  try {
    done = document.execCommand('insertText', false, text);
  } catch {
    done = false;
  }
  if (!done || el.value.slice(from, from + text.length) !== text) onChange(el.value.slice(0, from) + text + el.value.slice(to));
  requestAnimationFrame(() => el.setSelectionRange(selFrom, selTo));
}

/** The whole lines touched by the current selection: [start, end) offsets and the lines themselves. */
function selectedLines(el: HTMLTextAreaElement) {
  const { value, selectionStart, selectionEnd } = el;
  const start = value.lastIndexOf('\n', selectionStart - 1) + 1;
  const endBreak = value.indexOf('\n', selectionEnd > selectionStart && value[selectionEnd - 1] === '\n' ? selectionEnd - 1 : selectionEnd);
  const end = endBreak === -1 ? value.length : endBreak;
  return { start, end, lines: value.slice(start, end).split('\n') };
}

/**
 * Multi-line text box for copy that the site shows exactly as typed (FormattedText). A small toolbar turns the
 * selected lines into bullet or numbered points; Enter continues a list, Enter on an empty point ends it, and
 * Tab / Shift+Tab indent or outdent points.
 */
function RichTextarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight + 2, 420)}px`;
  }, [value]);

  // Adds the marker to every selected non-empty line, or removes it when they all already have that kind.
  const toggleList = (numbered: boolean) => {
    const el = ref.current;
    if (!el) return;
    const { start, end, lines } = selectedLines(el);
    const filled = lines.filter((l) => l.trim());
    const isKind = (l: string) => {
      const m = LIST_LINE.exec(l);
      return !!m && /\d/.test(m[2]) === numbered;
    };
    const remove = filled.length > 0 && filled.every(isKind);
    let n = 0;
    const next = lines.map((line) => {
      if (!line.trim()) return remove || lines.length > 1 ? line : numbered ? '1. ' : '• ';
      const lead = /^[ \t]*/.exec(line)![0];
      const body = line.replace(LIST_LINE, '').trimStart();
      if (remove) return lead + body;
      n += 1;
      return `${lead}${numbered ? `${n}. ` : '• '}${body}`;
    });
    const text = next.join('\n');
    const caret = lines.length === 1 ? start + text.length : start;
    replaceRange(el, start, end, text, caret, start + text.length, onChange);
  };

  const indent = (outdent: boolean) => {
    const el = ref.current;
    if (!el) return;
    const { start, end, lines } = selectedLines(el);
    const text = lines
      .map((line) => {
        if (!line.trim()) return line;
        if (!outdent) return INDENT + line;
        return line.replace(new RegExp(`^ {1,${INDENT.length}}|^\t`), '');
      })
      .join('\n');
    replaceRange(el, start, end, text, start, start + text.length, onChange);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    if (e.nativeEvent.isComposing) return;
    const { start, end } = selectedLines(el);
    const line = el.value.slice(start, end);
    const item = LIST_LINE.exec(line);
    if (e.key === 'Tab' && item) {
      e.preventDefault();
      indent(e.shiftKey);
      return;
    }
    if (e.key !== 'Enter' || e.shiftKey || !item || el.selectionStart !== el.selectionEnd) return;
    e.preventDefault();
    const caret = el.selectionStart;
    if (!line.slice(item[0].length).trim()) {
      // Enter on an empty point ends the list: the marker goes and the line is left blank.
      replaceRange(el, start, end, '', start, start, onChange);
      return;
    }
    const [, lead, marker] = item;
    const num = /^(\d+)([.)])$/.exec(marker);
    const nextMarker = num ? `${Number(num[1]) + 1}${num[2]}` : marker;
    const insert = `\n${lead}${nextMarker} `;
    replaceRange(el, caret, caret, insert, caret + insert.length, caret + insert.length, onChange);
  };

  return (
    <div className="adm-rich">
      <div className="adm-rich-bar" role="toolbar" aria-label="Text formatting">
        <button type="button" className="adm-rich-btn" title="Bullet points" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleList(false)}>
          <List size={14} /> Bullets
        </button>
        <button type="button" className="adm-rich-btn" title="Numbered points" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleList(true)}>
          <ListOrdered size={14} /> Numbered
        </button>
        <span className="adm-rich-sep" />
        <button type="button" className="adm-rich-btn is-icon" title="Indent (Tab)" onMouseDown={(e) => e.preventDefault()} onClick={() => indent(false)}>
          <IndentIncrease size={14} />
        </button>
        <button type="button" className="adm-rich-btn is-icon" title="Outdent (Shift+Tab)" onMouseDown={(e) => e.preventDefault()} onClick={() => indent(true)}>
          <IndentDecrease size={14} />
        </button>
        <span className="adm-rich-note">Line breaks, gaps and points show on the site exactly as typed</span>
      </div>
      <textarea
        ref={ref}
        className="adm-input adm-textarea"
        value={value}
        rows={4}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** Image picker: preview, drag & drop or click to upload, or paste a URL. */
export function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => setBroken(false), [value]);

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file (JPG, PNG, WebP or GIF).');
      return;
    }
    setBusy(true);
    try {
      onChange(await uploadImage(file));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(`Image upload failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div className="adm-image">
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        className={`adm-image-drop${dragging ? ' is-drag' : ''}${value && !broken ? ' has-image' : ''}`}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        disabled={busy}
      >
        {value && !broken ? (
          <>
            <img src={value} alt="" onError={() => setBroken(true)} />
            <span className="adm-image-overlay">
              {busy ? <Loader2 size={18} className="adm-spin" /> : <ImagePlus size={18} />}
              {busy ? 'Uploading…' : 'Replace image'}
            </span>
          </>
        ) : (
          <span className="adm-image-empty">
            {busy ? <Loader2 size={22} className="adm-spin" /> : <UploadCloud size={22} />}
            <strong>{busy ? 'Uploading…' : 'Drop an image or click to upload'}</strong>
            <small>{broken ? 'The current link does not load — upload a new image' : 'JPG, PNG, WebP or GIF · up to 5 MB'}</small>
          </span>
        )}
      </button>
      <div className="adm-image-url">
        <Link2 size={14} />
        <input className="adm-input-bare" value={value} placeholder="…or paste an image URL" onChange={(e) => onChange(e.target.value)} />
        {value && (
          <button type="button" className="adm-icon-btn is-danger" title="Remove image" onClick={() => onChange('')}>
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

const YOUTUBE_ID = /(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/;

/** Video picker: upload a file (sent straight to storage, with progress) or paste a YouTube / video link. */
export function VideoInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const youtube = YOUTUBE_ID.exec(value)?.[1];

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!VIDEO_ACCEPT.split(',').includes(file.type)) {
      toast.error('Please choose an MP4, WebM or MOV video.');
      return;
    }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      toast.error(`The video is larger than ${MAX_VIDEO_MB} MB. Compress it, or upload it to YouTube and paste the link.`);
      return;
    }
    setProgress(0);
    try {
      onChange(await uploadVideo(file, setProgress));
      toast.success('Video uploaded');
    } catch (err) {
      toast.error(`Video upload failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    } finally {
      setProgress(null);
      if (input.current) input.current.value = '';
    }
  };

  const busy = progress !== null;
  return (
    <div className="adm-image">
      <input ref={input} type="file" accept={VIDEO_ACCEPT} hidden onChange={(e) => handleFile(e.target.files?.[0])} />
      <button
        type="button"
        className={`adm-image-drop adm-video-drop${dragging ? ' is-drag' : ''}${value && !busy ? ' has-image' : ''}`}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        disabled={busy}
      >
        {value && !busy ? (
          <>
            {youtube ? <img src={`https://i.ytimg.com/vi/${youtube}/hqdefault.jpg`} alt="" /> : <video src={`${value}#t=0.5`} muted playsInline preload="metadata" />}
            <span className="adm-image-overlay">
              <Film size={18} /> Replace video
            </span>
          </>
        ) : (
          <span className="adm-image-empty">
            {busy ? <Loader2 size={22} className="adm-spin" /> : <UploadCloud size={22} />}
            <strong>{busy ? `Uploading… ${Math.round((progress ?? 0) * 100)}%` : 'Drop a video or click to upload'}</strong>
            <small>{`MP4, WebM or MOV · up to ${MAX_VIDEO_MB} MB`}</small>
          </span>
        )}
        {busy && <span className="adm-video-bar" style={{ transform: `scaleX(${progress ?? 0})` }} />}
      </button>
      <div className="adm-image-url">
        <Link2 size={14} />
        <input className="adm-input-bare" value={value} placeholder="…or paste a YouTube / Shorts / video link" onChange={(e) => onChange(e.target.value)} />
        {value && (
          <button type="button" className="adm-icon-btn is-danger" title="Remove video" onClick={() => onChange('')}>
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

const cleanCell = (v: string) => v.replace(/\|/g, '/').replace(/\s*\n\s*/g, ' ').trim();
const parseRows = (text: string, size: number) =>
  text
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      const cells = line.split('|').map((c) => c.trim());
      return Array.from({ length: size }, (_, i) => cells[i] ?? '');
    });
const serializeRows = (rows: string[][]) =>
  rows
    .map((row) => {
      const cells = row.map(cleanCell);
      while (cells.length && !cells[cells.length - 1]) cells.pop();
      return cells.join(' | ');
    })
    .filter(Boolean)
    .join('\n');

/** A list edited one card per row, with image / video uploads per column. Saved as "a | b | c" lines. */
export function RowsInput({ value, onChange, columns, item = 'Item' }: { value: string; onChange: (v: string) => void; columns: RowColumn[]; item?: string }) {
  const [rows, setRows] = useState(() => parseRows(value, columns.length));
  // Follow outside changes (reset, reload) but keep a freshly added empty row while it is being filled in.
  useEffect(() => {
    if (serializeRows(rows) !== value) setRows(parseRows(value, columns.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, columns.length]);
  const commit = (next: string[][]) => {
    setRows(next);
    onChange(serializeRows(next));
  };
  const setCell = (r: number, c: number, v: string) => commit(rows.map((row, i) => (i === r ? row.map((old, j) => (j === c ? v : old)) : row)));
  const move = (r: number, dir: number) => {
    const next = [...rows];
    [next[r], next[r + dir]] = [next[r + dir], next[r]];
    commit(next);
  };

  return (
    <div className="adm-rows">
      {rows.map((row, r) => (
        <div key={r} className="adm-row">
          <div className="adm-row-head">
            <strong>{`${item} ${r + 1}${row[0] ? ` · ${row[0]}` : ''}`}</strong>
            <div className="adm-row-tools">
              <button type="button" className="adm-icon-btn" title="Move up" disabled={r === 0} onClick={() => move(r, -1)}>
                <ArrowUp size={14} />
              </button>
              <button type="button" className="adm-icon-btn" title="Move down" disabled={r === rows.length - 1} onClick={() => move(r, 1)}>
                <ArrowDown size={14} />
              </button>
              <button type="button" className="adm-icon-btn is-danger" title={`Remove ${item.toLowerCase()}`} onClick={() => commit(rows.filter((_, i) => i !== r))}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div className="adm-row-grid">
            {columns.map((col, c) => (
              <div key={c} className={`adm-row-cell${col.kind === 'text' ? ' is-text' : ''}`}>
                <span className="adm-row-label">{col.label}</span>
                {col.kind === 'image' ? (
                  <ImageInput value={row[c]} onChange={(v) => setCell(r, c, v)} />
                ) : col.kind === 'video' ? (
                  <VideoInput value={row[c]} onChange={(v) => setCell(r, c, v)} />
                ) : (
                  <input className="adm-input" value={row[c]} placeholder={col.placeholder} onChange={(e) => setCell(r, c, e.target.value)} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button type="button" className="adm-btn is-outline adm-rows-add" onClick={() => setRows([...rows, columns.map(() => '')])}>
        <Plus size={15} /> {`Add ${item.toLowerCase()}`}
      </button>
    </div>
  );
}

export function Control({
  type = 'text',
  value,
  onChange,
  placeholder,
  options,
  columns,
  item,
}: {
  type?: ControlType;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  options?: string[];
  columns?: RowColumn[];
  item?: string;
}) {
  switch (type) {
    case 'rows':
      return <RowsInput value={value} onChange={onChange} columns={columns ?? []} item={item} />;
    case 'textarea':
      return <AutoTextarea value={value} onChange={onChange} placeholder={placeholder} />;
    case 'richtext':
      return <RichTextarea value={value} onChange={onChange} placeholder={placeholder} />;
    case 'image':
      return <ImageInput value={value} onChange={onChange} />;
    case 'select':
      return (
        <select className="adm-input" value={value} onChange={(e) => onChange(e.target.value)}>
          {(options ?? []).map((o) => (
            <option key={o} value={o}>
              {o.charAt(0).toUpperCase() + o.slice(1)}
            </option>
          ))}
        </select>
      );
    case 'color':
      return (
        <div className="adm-color">
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#FFDE59'} onChange={(e) => onChange(e.target.value.toUpperCase())} />
          <input className="adm-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder="#FFDE59" />
          {['#FFDE59', '#003AA3', '#050814'].map((swatch) => (
            <button key={swatch} type="button" className="adm-swatch" style={{ background: swatch }} title={swatch} onClick={() => onChange(swatch)} />
          ))}
        </div>
      );
    case 'url':
      return (
        <div className="adm-input-icon">
          <Link2 size={14} />
          <input className="adm-input" value={value} placeholder={placeholder ?? 'https://… or /page'} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    default:
      return <input className="adm-input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
  }
}
