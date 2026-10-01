/**
 * Whether an IntersectionObserver entry has scrolled far enough in to reveal: `threshold` of the element is on screen,
 * or, for an element taller than the viewport, enough of it to cover `threshold` of the screen. (A whole page's
 * content can be several screens tall, so waiting for a share of its own height would leave it invisible while the
 * visitor scrolls through its first sections.)
 * An element taller than the viewport divided by `threshold` counts as revealed as soon as any of it is on screen.
 * Observe with revealThresholds so the callback also fires at the in-between ratios this needs.
 */
export function hasRevealed(entry: IntersectionObserverEntry, threshold: number) {
  if (!entry.isIntersecting) return false;
  if (entry.intersectionRatio >= threshold) return true;
  const rootHeight = entry.rootBounds?.height ?? window.innerHeight;
  const height = entry.boundingClientRect.height;
  if (height * threshold > rootHeight) return true;
  return entry.intersectionRect.height >= threshold * Math.min(height, rootHeight);
}

// 0 (so the first entry is reported), `threshold`, and steps in between for tall elements that reveal at a lower ratio.
export const revealThresholds = (threshold: number) => Array.from({ length: 11 }, (_, i) => (threshold * i) / 10);
