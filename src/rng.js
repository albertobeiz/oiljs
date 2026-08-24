// Seeded randomness (mulberry32) — same seed, same painting. Same scheme as drawai.
export function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function makeRng(seed) {
  const f = mulberry32(seed);
  return {
    next: f,
    r: (a, b) => a + f() * (b - a),
    ri: (a, b) => Math.floor(a + f() * (b - a + 1)),
    pick: arr => arr[Math.floor(f() * arr.length)],
    chance: p => f() < p,
  };
}
