import { useEffect, useMemo, useRef, useState } from 'react';

const TYPE_MS = 85;
const DELETE_MS = 45;
const HOLD_MS = 2200;
const GAP_MS = 350;
const OFFSCREEN_RETRY_MS = 500;

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/**
 * The highlighted hero phrase: types `base`, deletes it, types the next phrase, forever.
 * Screen readers get the static phrase; the animated text is decorative. Pauses while off screen or in a background tab.
 */
export default function HeroTypewriter({ base, phrases }: { base: string; phrases: string[] }) {
  const phraseKey = phrases.join('\n');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const words = useMemo(() => [base, ...phrases.filter((w) => w && w !== base)], [base, phraseKey]);
  const animate = words.length > 1 && !prefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [text, setText] = useState(base);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    setText(base);
    setTyping(false);
    if (!animate) return;

    let visible = true;
    const observer =
      ref.current && typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: '120px 0px' })
        : null;
    if (observer && ref.current) observer.observe(ref.current);

    let wordIndex = 0;
    let chars = base.length;
    let deleting = true;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (document.hidden || !visible) {
        timer = setTimeout(tick, OFFSCREEN_RETRY_MS);
        return;
      }
      let delay: number;
      if (deleting) {
        chars--;
        delay = DELETE_MS;
        if (chars <= 0) {
          chars = 0;
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          delay = GAP_MS;
        }
      } else {
        chars++;
        delay = TYPE_MS;
        if (chars >= words[wordIndex].length) {
          deleting = true;
          delay = HOLD_MS;
        }
      }
      setText(words[wordIndex].slice(0, chars));
      setTyping(!(deleting && delay === HOLD_MS));
      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, HOLD_MS);
    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, [animate, base, words]);

  if (!animate) return <em className="accent">{base}</em>;
  // On phones the headline wraps, so a growing/shrinking phrase changed its line count and pushed the whole page
  // up and down. The invisible longest phrase keeps the box (and the lines) the same size there; see .tw-box.
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), '');
  return (
    <em ref={ref} className={`accent${typing ? ' is-typing' : ''}`}>
      <span className="tw-sr">{base}</span>
      <span className="tw-box" aria-hidden="true">
        <span className="tw-ghost">{longest}</span>
        <span className="tw-live">
          <span className="tw-text">{text}</span>
          <span className="tw-caret" />
        </span>
      </span>
    </em>
  );
}
