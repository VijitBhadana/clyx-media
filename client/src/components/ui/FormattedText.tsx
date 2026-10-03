import type { CSSProperties } from 'react';

/** A line starting with a bullet ("•", "-", "*", "–", "▪", "◦") or a number ("1." / "1)"), with optional indent before it. */
const LIST_LINE = /^([ \t]*)([•\-*–▪◦●]|\d{1,3}[.)])[ \t]+(.*)$/;

/** Leading spaces/tabs as a width in spaces (a tab counts as four). */
const indentOf = (lead: string) => lead.replace(/\t/g, '    ').length;

/** True when the text uses more than one line or starts a list, i.e. needs FormattedText's line layout. */
export const hasLayout = (text: string) => text.includes('\n') || LIST_LINE.test(text);

/**
 * Renders admin-written text the way it was typed in the admin text box: every line break, blank line (gap), run of
 * spaces and indent is kept, and bullet / numbered lines get a marker with a hanging indent so wrapped lines stay
 * aligned. "-" and "*" bullets show as "•". Text on a single line comes back untouched, so it renders as before.
 * Only <span>s are used, so it is safe inside a <p> or heading.
 */
export function FormattedText({ text }: { text: string | undefined }) {
  // Trailing newlines/spaces are dropped (a non-breaking space is kept: it can be the whole text of a gap).
  const value = (text ?? '').replace(/\r\n?/g, '\n').replace(/[ \t\n]+$/, '');
  if (!hasLayout(value)) return <>{value}</>;
  return (
    <span className="fmt-text">
      {value.split('\n').map((line, i) => {
        if (!line.trim()) return <span key={i} className="fmt-line" aria-hidden="true">{' '}</span>;
        const item = LIST_LINE.exec(line);
        if (!item) return <span key={i} className="fmt-line">{line}</span>;
        const [, lead, marker, rest] = item;
        const numbered = /\d/.test(marker);
        const style = { '--fmt-indent': `${indentOf(lead)}ch` } as CSSProperties;
        return (
          <span key={i} className={`fmt-li${numbered ? ' is-num' : ''}`} style={style}>
            <span className="fmt-marker" aria-hidden={!numbered}>{/[-*●]/.test(marker) ? '•' : marker}</span>
            {rest}
          </span>
        );
      })}
    </span>
  );
}
