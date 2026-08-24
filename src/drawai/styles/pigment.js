// ---------------------------------------------------------------
// PIGMENT — the shared colour bench for the styles.
//
// A style is allowed to overrule the character's colours, and most of
// them must: a gothic panel has five pigments and no others, an
// impressionist face has no black in it anywhere. The character still
// asks for "this skin, that hair" — the style answers in its own box
// of paint. That is what `nearest` is for.
//
// Everything here is plain arithmetic on [r,g,b] triples, so it is
// identical in both hands and never touches a canvas.
// ---------------------------------------------------------------

export const clamp255 = v => v < 0 ? 0 : v > 255 ? 255 : v | 0;

// perceived lightness, 0..1 — the only "how dark is this" anyone needs
export const lum = c => (c[0] * .299 + c[1] * .587 + c[2] * .114) / 255;

export const mix = (a, b, t) => [
  clamp255(a[0] + (b[0] - a[0]) * t),
  clamp255(a[1] + (b[1] - a[1]) * t),
  clamp255(a[2] + (b[2] - a[2]) * t),
];

export const shade = (c, t) => mix(c, [18, 16, 14], t);
export const tint = (c, t) => mix(c, [250, 246, 236], t);

// push a colour's saturation without leaving its hue
export function sat(c, k) {
  const g = (c[0] + c[1] + c[2]) / 3;
  return [clamp255(g + (c[0] - g) * k), clamp255(g + (c[1] - g) * k), clamp255(g + (c[2] - g) * k)];
}

// rotate the hue, in turns (1 = all the way round)
export function spin(c, turns) {
  const a = turns * Math.PI * 2, cs = Math.cos(a), sn = Math.sin(a);
  const m = [
    .213 + cs * .787 - sn * .213, .715 - cs * .715 - sn * .715, .072 - cs * .072 + sn * .928,
    .213 - cs * .213 + sn * .143, .715 + cs * .285 + sn * .140, .072 - cs * .072 - sn * .283,
    .213 - cs * .213 - sn * .787, .715 - cs * .715 + sn * .715, .072 + cs * .928 + sn * .072,
  ];
  return [
    clamp255(c[0] * m[0] + c[1] * m[1] + c[2] * m[2]),
    clamp255(c[0] * m[3] + c[1] * m[4] + c[2] * m[5]),
    clamp255(c[0] * m[6] + c[1] * m[7] + c[2] * m[8]),
  ];
}

// the complement, for anyone laying a shadow the impressionist way
export const opposite = c => spin(c, .5);

// The style's box of paint answers for the character's colour: the
// nearest pigment by hue and lightness together, so a brown hair stays
// dark and a pink skin stays pale even when the box has neither.
export function nearest(col, box) {
  if (!col || !box || !box.length) return col;
  let best = box[0], bd = 1e9;
  const L = lum(col);
  for (const p of box) {
    const d = (col[0] - p[0]) ** 2 + (col[1] - p[1]) ** 2 + (col[2] - p[2]) ** 2
            + ((L - lum(p)) * 255 * 1.6) ** 2;
    if (d < bd) { bd = d; best = p; }
  }
  return best;
}

// A style's own value scale: five steps from its darkest to its
// lightest, picked by how dark the character's colour was. Keeps a
// character's contrast when the palette is swapped out from under it.
export function step(col, ramp) {
  const i = Math.min(ramp.length - 1, Math.max(0, Math.round(lum(col) * (ramp.length - 1))));
  return ramp[i];
}

// the density a part asked for, as a number
export const DENSITY = { black: 1, hatch: .72, scribble: .62, stipple: .5, light: .34 };
export const dens = style => DENSITY[style] ?? .7;

// bounding box of an outline
export function bbox(pts) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of pts) {
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return [x0, y0, x1, y1];
}

export const centroid = pts => {
  let x = 0, y = 0;
  for (const p of pts) { x += p[0]; y += p[1]; }
  return [x / pts.length, y / pts.length];
};

// is a point inside the outline (even-odd)
export function inside(pts, x, y) {
  let hit = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

// css from a triple, with optional alpha
export const rgb = (c, a = 1) => a >= 1
  ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`
  : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
