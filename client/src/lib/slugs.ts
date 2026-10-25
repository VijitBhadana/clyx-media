/**
 * Gives every card its own address. The first card with a slug keeps it; a later card with the same slug gets "-2",
 * "-3"… skipping any slug another card already has, so a project named "Halo Goods 2" keeps "halo-goods-2" even when
 * there are two "Halo Goods". Cards whose slug is already unique are returned unchanged.
 */
export function withUniqueSlugs<T extends { slug: string }>(items: T[]): T[] {
  const taken = new Set(items.map((item) => item.slug));
  const seen = new Set<string>();
  return items.map((item) => {
    if (!seen.has(item.slug)) {
      seen.add(item.slug);
      return item;
    }
    let n = 2;
    while (taken.has(`${item.slug}-${n}`)) n++;
    const slug = `${item.slug}-${n}`;
    taken.add(slug);
    return { ...item, slug };
  });
}
