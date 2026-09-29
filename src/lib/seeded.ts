/** Deterministic pseudo-random numbers from a string, so sample visuals never change between renders. */
export function seeded(seed: string) {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  // finalise so short, similar seeds ("frog", "rugby") still diverge from the first draw
  h = Math.imul(h ^ (h >>> 16), 2246822507)
  h = Math.imul(h ^ (h >>> 13), 3266489909)
  h ^= h >>> 16
  let a = h >>> 0
  return () => {
    // mulberry32
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
/** A price path that ends at `last` and moved `change` (0.12 = +12%) over the window. */
export function pricePath(seed: string, last: number, change: number, points = 72) {
  const r = seeded(seed)
  const first = last / (1 + change)
  const out: number[] = []
  let noise = 0
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1)
    noise = noise * 0.82 + (r() - 0.5) * 0.06
    out.push(first + (last - first) * t + last * noise * Math.sin(t * Math.PI))
  }
  out[points - 1] = last
  return out
}
