// Unsplash serves any width on request, so card images ask for roughly the size they are shown at instead of the
// 1000–1400px original (a phone was downloading 4–10x the pixels it displays). Other image hosts are left as they are.
const UNSPLASH = /^https:\/\/images\.unsplash\.com\//i;
const WIDTHS = [320, 480, 640, 800, 1080, 1400, 1800];

/** `src`, plus `srcSet`/`sizes` for Unsplash URLs. Spread onto an <img>; `sizes` is how wide the image is shown. */
export function responsiveImage(url: string | undefined, sizes: string): { src?: string; srcSet?: string; sizes?: string } {
  if (!url || !UNSPLASH.test(url)) return { src: url };
  let base: URL;
  try {
    base = new URL(url);
  } catch {
    return { src: url };
  }
  const max = Number(base.searchParams.get('w')) || 1800;
  const height = Number(base.searchParams.get('h')) || 0;
  const at = (w: number) => {
    const next = new URL(base);
    next.searchParams.set('w', String(w));
    // A fixed height would change the crop's shape at other widths, so it is scaled along.
    if (height) next.searchParams.set('h', String(Math.round((height * w) / max)));
    if (!next.searchParams.has('auto')) next.searchParams.set('auto', 'format');
    return next.toString();
  };
  const widths = [...WIDTHS.filter((w) => w < max), max];
  return { src: url, srcSet: widths.map((w) => `${at(w)} ${w}w`).join(', '), sizes };
}
