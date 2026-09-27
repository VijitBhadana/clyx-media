/**
 * Whether an IntersectionObserver entry has scrolled far enough in to reveal.
 * An element taller than the viewport divided by `threshold` can never reach that ratio (e.g. a whole page's
 * content on a short phone screen), so it counts as revealed as soon as any of it is on screen.
 * Observe with a threshold list that includes 0 (see revealThresholds) so that first entry is reported.
 */
export function hasRevealed(entry: IntersectionObserverEntry, threshold: number) {
  if (!entry.isIntersecting) return false;
  if (entry.intersectionRatio >= threshold) return true;
  const rootHeight = entry.rootBounds?.height ?? window.innerHeight;
  return entry.boundingClientRect.height * threshold > rootHeight;
}

export const revealThresholds = (threshold: number) => [0, threshold];
