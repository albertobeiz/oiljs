// ---------------------------------------------------------------
// CUBISM — analytic, 1911. Braque and Picasso, the year they were
// "roped together like mountaineers" and their canvases became hard
// to tell apart.
//
// The first version of this file got the palette right and the
// MECHANISM wrong, and three critics said the same sentence about it:
// a cute round doodle with grey polygons pasted on top, silhouette
// unbroken. It read as camouflage. Everything below is the four
// corrections, and each one is a mechanical fact about an analytic
// canvas rather than a colour.
//
//   1. VALUE IS THE STRUCTURE. A facet is not a patch of texture, it
//      is a plane catching a measured amount of ONE light, and the
//      picture reads as shattered but SOLID because the planes step
//      hard from near-black to near-paper. The old file clamped every
//      facet to a band around the value the part asked for, to protect
//      the character — and that clamp is precisely why the row was
//      mud. What is clamped now is the facet MEAN, area-weighted: dark
//      hair still averages dark and a face still averages pale, but
//      inside the mass the individual planes are free to run the whole
//      ramp. `spread` is the amplitude and it is the single loudest
//      number in the file.
//
//   2. PASSAGE, and this is the defining mechanical fact of 1911. In
//      'Ma Jolie' or 'Man with a Guitar' the facet planes CROSS the
//      figure's contour and carry on into the air, and the outline is
//      simply absent wherever they do, so figure and ground are the
//      same surface. Here the partition is built on a domain LARGER
//      than the shape (`domainOf`), a few boundary cells are painted
//      through into the paper (`dom \ pts`, even-odd), and `edge()`
//      re-derives the very same cut lines — the dice come from the
//      outline, so both calls get the same answer — and drops the
//      contour wherever one crosses it.
//
//   3. THE SCAFFOLDING IS A CONTINUED PLANE EDGE, never a line laid
//      over the picture. Every ruled line in here starts as the chord
//      of a real cut and is extended out past the silhouette. A line
//      that continues an edge of a plane into the air is the cubist
//      mark; the same line floating at a free angle is a scratch on
//      the scan, which is what the first version had.
//
//   4. THE 1911 GRID. Short parallel vertical and horizontal marks
//      building a shallow relief across the form, densest at the
//      centre and dissolving toward the rim — which is also the OVAL
//      both painters cropped to that year, because the corners would
//      not resolve.
//
// ROUND THREE took the exception the critic offered, and it is the
// only style on the sheet that needs one. The sentence was: "since
// your characters keep their round silhouettes, this row can't really
// be Cubist; it's 'character with some angular debris on top'. If the
// renderer could ever fragment the silhouette for this one style, it'd
// be worth the exception." So there are now three more mechanisms, and
// all three break the drawing rather than decorate it:
//
//   5. THE SHEAR AND THE HOLE. One plane of every mass has SLID off
//      the form and hangs out past the contour; another is simply NOT
//      PAINTED and the canvas shows through the middle of the head.
//      Neither is an overlay — both are the mass itself, so the
//      silhouette arrives with a piece stuck out of it and a bite
//      taken out of it.
//
//   6. THE CONTOUR IS NOT THE SILHOUETTE. A quarter of it is absent,
//      one chord has WANDERED bodily off the form, and one or two RUN
//      PAST the corner they should have turned and carry on into the
//      air.
//
//   7. THE PAGE (`backdrop`). The oval canvas of 1911, partitioned the
//      same way a mass is, with two of its planes running straight out
//      through the crop; an armature of ruled lines that crosses the
//      whole picture and stops at nothing; a SECOND VIEW of the head
//      standing beside the first as a construction contour with one
//      eye in it; and the stencilled letters Braque put on Le
//      Portugais that same year.
//
// And `ink` — the character's own black, an iron black with the
// picture's green in it. There is no lamp black on a 1911 canvas.
//
// The palette moved too. Braque 1911 is ochre, grey and BLACK, and
// the sheet already had four brown rows; this one takes the cool
// grey-green seat and keeps ochre as the swing, with a true black at
// the bottom of both ramps. There is no local colour at all: a blue
// hat and a brown one are the same grey. That is not poverty, it is
// the point — with colour out of the way the eye reads nothing but
// planes.
//
// One thing tried and wrong, kept from the first version because it
// is still true: faking the facets with overlapping translucent
// triangles gives a stained-window mush with no flat plane anywhere.
// The cells have to be a real partition, which is what the
// Sutherland-Hodgman clip below is for.
// ---------------------------------------------------------------
import { shade, tint, dens, bbox, centroid, rgb, lum, mix } from './pigment.js';

// The box of paint. Two ramps of seven, one cool and one warm, both
// starting at a real black. COOL leads — Braque's grey swings toward
// a green-grey and that swing is the only colour event on the canvas,
// and it is also the one corner of the wheel this sheet had empty.
const COOL = [[15, 17, 16], [40, 47, 42], [72, 81, 70], [106, 115, 99],
              [143, 149, 129], [180, 184, 162], [212, 214, 194]];
const WARM = [[19, 16, 13], [52, 41, 29], [90, 72, 48], [128, 106, 70],
              [165, 141, 100], [198, 179, 143], [226, 216, 192]];
const N = COOL.length - 1;
const INKD = [24, 28, 25];              // the drawing's line: an iron black with green in it

// a value on the ramp, fractional — the planes are flat but they are
// not restricted to seven greys, or the whole sheet bands
const paint = (ramp, i) => {
  const t = Math.max(0, Math.min(N, i));
  const a = Math.floor(t), b = Math.min(N, a + 1);
  return mix(ramp[a], ramp[b], t - a);
};

// ---- THE SHAPE'S OWN DICE, and this is the rule that decides
// whether the style is usable at all --------------------------------
//
// `s.jr` is the BOIL. Every part is re-drawn two or three times a
// second with a fresh seed, and anything rolled inside `draw()` is
// re-rolled with it. For the other styles that is the whole point —
// a hatch that crawls is a hand that is still drawing. Here it is
// fatal: the cuts, the plane values and the missing pieces of the
// contour are STRUCTURE, and structure rolled on the boil means the
// head re-shatters into a different cubist head three times a second.
//
// A style cannot ask which part it is drawing — it is handed an
// outline and nothing else. So the seed is taken FROM THE OUTLINE:
// its point count and its bounding box quantised to a coarse grid,
// which the boil moves by a pixel and never off its bucket. Same
// trick as the voxel lab's `h01` and the plant lab's `oshash`.
//
// It buys a second thing now, and passage depends on it: `tone()` and
// `edge()` are two separate calls that are handed the SAME outline, so
// asking the outline for the cuts twice gives the same cuts both
// times. That is how the contour knows where a plane crossed it.
function shapeDice(s, pts) {
  const [x0, y0, x1, y1] = bbox(pts);
  const diag = Math.hypot(x1 - x0, y1 - y0);
  // WHAT GOES INTO THE HASH is the whole trick, and it took two wrong
  // answers. The seed has to be STABLE under the boil and DIFFERENT
  // for every part, and those pull opposite ways.
  //
  // It was the four bbox corners on a twelfth of the diagonal first.
  // The skull re-jitters its skin polygon by ±3.5% of the head every
  // boil frame (`skull.js` — "never quite on the drawing"), which is
  // the same order as the bucket, and with four jittering numbers in
  // the hash there were four chances a frame to land in a different
  // bucket and re-shatter the head: `__styles.flicker('cubism')` read
  // .062 on the skull, against gothic's .023.
  //
  // Then a much coarser grid, which fixed the flicker (.017) and broke
  // something worse: parts of ONE character started sharing a bucket,
  // so a whole figure would roll the same dice and draw four PARALLEL
  // ruled lines at the same angle. Every shape must get its own
  // answer.
  //
  // So: a coarse grid on the CENTROID — two jittering numbers, not
  // four — and the entropy back from two quantities the boil cannot
  // touch. The point COUNT is exact, and the ASPECT RATIO is invariant
  // under exactly the transform the skull applies (a uniform scale and
  // a translate). A skull, a hair mass, an ear and a leg differ in
  // both, so they collide almost never, and a left and a right ear
  // that do collide are a pair of ears breaking the same way, which is
  // what a pair of ears should do.
  // Position alone is thin: every part draws with the origin at the
  // head's centre, so `cx` and `cy` are small numbers and a coarse
  // grid collapses most of the sheet onto a handful of buckets — the
  // whole row started breaking the same way. So most of the entropy
  // comes from the shape's OWN proportions, which are invariant under
  // a uniform scale and a translate and therefore free of the boil:
  // the point count, the aspect ratio, and where the centroid sits
  // inside the bounding box (a hair mass leans, a skull does not).
  //
  // ROUND THREE THREW ALL OF THAT AWAY, and the arithmetic says why.
  // A term quantised as `round(x * k)` changes bucket with probability
  // about `j * k` per frame, where `j` is the fractional jitter the
  // boil puts into it — so every term in the hash is another die rolled
  // against re-shattering the shape, and the shape re-shatters if ANY
  // of them lands. That is the wrong shape of arithmetic: entropy and
  // stability were being bought from the same purse.
  //
  // Worse, the hair mass exposed the real problem. `hair.js` builds its
  // mass with `s.blobPts(…, s.jr(-.25, .25))` — a lumpy blob SPUN by a
  // quarter radian every boil frame — so its aspect ratio and the lean
  // of its centroid are not jittering by three per cent, they are
  // genuinely different numbers from frame to frame. No quantisation of
  // them is stable, and `flicker` said so: .058 on `hairFront` against
  // a .023 baseline, twice the sheet's worst.
  //
  // So the hash is now the two quantities the boil CANNOT touch:
  //   · the point COUNT, which is exact — `blobPts` always returns the
  //     same number of vertices however it spun them;
  //   · the shape's SIZE, on a log scale coarse enough that a few per
  //     cent cannot move it.
  //
  // Two masses on one character that share a count and a size now
  // break along the SAME few directions — which is the rule this file
  // already states at `GRID`: the figure reads as one shattered system
  // precisely because every shape breaks the same way. Where they
  // differ is where they should, in the cut OFFSETS, which are placed
  // by each shape's own support and never by the dice.
  //
  // Two inputs alone were not enough, though, and the shot said so
  // immediately: with the whole sheet drawing from a handful of seeds,
  // every skull rolled the same first number, took the same ramp and
  // cut its first plane at the same angle, and the row came back six
  // beige heads behind a picket fence. The missing entropy is on `s`.
  // A part's plate is sized ONCE, in `makePart`, and both boil frames
  // are drawn on the same dimensions — so `s.w` and `s.h` are exactly
  // what the hash needed and could not find in the outline: numbers
  // that differ for every part and for every character, and that the
  // boil cannot touch because the boil is drawn on them.
  let h = 2166136261;
  for (const v of [pts.length, Math.round(Math.log2(Math.max(6, diag)) * 1.5), s.w, s.h]) {
    h = Math.imul(h ^ (v & 0xffff), 16777619);
  }
  let a = (h >>> 0) || 1;
  const r = () => {
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  return {
    jr: (lo, hi) => lo + r() * (hi - lo),
    ri: (lo, hi) => Math.floor(lo + r() * (hi - lo + 1)),
    chance: p => r() < p,
    weighted(pairs) {
      let t = 0; for (const p of pairs) t += p[1];
      let x = r() * t;
      for (const p of pairs) { if ((x -= p[1]) < 0) return p[0]; }
      return pairs[pairs.length - 1][0];
    },
  };
}

// THE GRID OF DIRECTIONS. Every cut, every ruled line and every tick
// in the project takes its angle from these, jittered by a tenth of a
// radian and no more. A part cannot know what the part beside it did
// — each has its own seed — so the only way the whole figure reads as
// ONE shattered system rather than nine separately-broken lumps is for
// every shape to break along the same few directions. Free angles were
// the first version and the figure came apart into unrelated debris.
//
// It is RECTILINEAR now: vertical first, horizontal a strong second,
// the steep diagonals a minority. 1911 is an armature of uprights and
// crossbars with a few tilts through it, not a heap of random shards.
const GRID = [[Math.PI / 2, 40], [0, 26], [Math.PI / 2 - 1.02, 14], [Math.PI / 2 + 1.02, 14],
              [Math.PI / 2 - .48, 3], [Math.PI / 2 + .48, 3]];

// The light: ONE fixed direction for the whole project, from the upper
// left and slightly in front. Analytic cubism has no light source in
// the illusionist sense, but the planes do step consistently across a
// canvas — vary this per shape and the character falls into confetti.
const LX = -.50, LY = -.72, LZ = .48;

// ---- the clip -------------------------------------------------
// Sutherland-Hodgman against one half-plane: keep everything with
// a*x + b*y + c >= 0. Fifteen lines, and it is the whole reason the
// facets are real planes and not stacked transparencies.
function clipHalf(poly, a, b, c) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    const dp = a * p[0] + b * p[1] + c, dq = a * q[0] + b * q[1] + c;
    if (dp >= 0) out.push(p);
    if ((dp >= 0) !== (dq >= 0)) {
      const t = dp / (dp - dq);
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  }
  return out;
}

// the same clip, walked round a CONVEX polygon — one half-plane per
// edge. Used only by the page: the crop is an ellipse, which is
// convex, so Sutherland-Hodgman is exact and there is no need for a
// general polygon boolean anywhere in this file.
function clipPoly(poly, convex) {
  let out = poly;
  const n = convex.length;
  // Which side is "in"? Ask the centroid rather than the winding.
  // Winding is a sign convention and this project has y pointing DOWN,
  // so the convention is the wrong way round half the time and the
  // clip silently returns nothing.
  const [mx, my] = centroid(convex);
  for (let i = 0; i < n && out.length > 2; i++) {
    const p = convex[i], q = convex[(i + 1) % n];
    let a = -(q[1] - p[1]), b = q[0] - p[0];
    let cc = -(a * p[0] + b * p[1]);
    if (a * mx + b * my + cc < 0) { a = -a; b = -b; cc = -cc; }
    out = clipHalf(out, a, b, cc);
  }
  return out;
}

const area = p => {
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    const q = p[(i + 1) % p.length];
    a += p[i][0] * q[1] - q[0] * p[i][1];
  }
  return Math.abs(a) / 2;
};

// where a cut line crosses the outline, in order along the line — the
// chord that could be drawn, if passage lets it be drawn at all
function crossings(pts, a, b, c) {
  const hits = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    const dp = a * p[0] + b * p[1] + c, dq = a * q[0] + b * q[1] + c;
    if ((dp >= 0) !== (dq >= 0)) {
      const t = dp / (dp - dq);
      hits.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  }
  hits.sort((u, v) => (-b * u[0] + a * u[1]) - (-b * v[0] + a * v[1]));
  return hits;
}

// One cut. The line is placed by the shape's OWN SUPPORT along the cut
// normal, not by an offset from its centroid. Offsetting by a fraction
// of the bounding diagonal was the first version and it was silently
// wrong: on any shape wider than it is tall — a hair mass, a brow —
// most cuts landed off the form entirely, so the "faceted" head came
// back as one flat plane with a bit of texture on it.
function cutLine(g, pts) {
  const th = g.weighted(GRID) + g.jr(-.10, .10);
  const a = -Math.sin(th), b = Math.cos(th);
  let lo = 1e9, hi = -1e9;
  for (const [x, y] of pts) { const d = a * x + b * y; if (d < lo) lo = d; if (d > hi) hi = d; }
  // never a bisector: equal halves read as a fold, unequal ones as
  // two planes seen from two places
  return [a, b, -(lo + (hi - lo) * g.jr(.20, .80))];
}

// THE CUTS OF A SHAPE, from the shape alone. Its own private dice, so
// whoever asks — the fill or the contour — is told the same thing.
function cutsFor(s, pts) {
  const g = shapeDice(s, pts);
  const [x0, y0, x1, y1] = bbox(pts);
  const diag = Math.hypot(x1 - x0, y1 - y0);
  // enough planes to read as shattered, few enough that each one is a
  // PLANE and not a speck. Braque works finer than this; at 90px on a
  // contact sheet finer is noise.
  const n = diag > 150 ? 5 : diag > 62 ? 4 : 3;
  const out = [];
  for (let k = 0; k < n; k++) out.push(cutLine(g, pts));
  return out;
}

// the domain the planes are cut out of: the shape itself, GROWN. The
// facets exist outside the figure too — that is the whole of passage —
// and this is the air they are allowed to reach into.
//
// It was the bounding box first and that was the loudest mistake in
// the repaint: a box grown by a sixth of the diagonal is mostly air,
// so every mass on every character painted a rectangular slab of the
// background and the sheet came back as a Bauhaus poster with a
// doodle behind it. Growing the OUTLINE keeps the overshoot a rim —
// a plane that steps a little past the contour and stops, which is
// what a Braque does — and it can never be larger than the form.
function domainOf(s, pts, k) {
  return s.offsetShape(pts, k, 0, 0, 0);
}

// ---- the tache ------------------------------------------------
// A plane is painted, not filled: a few parallel strokes of a loaded
// brush inside the facet, at the facet's own angle. It is SEASONING
// now and nothing more — the old file leaned on it for the surface
// and got soft-edged blotches, which is exactly the "stained-window
// mush" its own comment warned about. The value structure is the
// picture; this is the paint on it.
function tache(s, g, cell, col, sz) {
  if (sz < 16) return;
  const c = s.ctx;
  const [x0, y0, x1, y1] = bbox(cell);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const ang = g.weighted(GRID) + g.jr(-.16, .16);
  const dx = Math.cos(ang), dy = Math.sin(ang);
  const gap = Math.max(3.2, sz * .22);
  const n = Math.min(5, Math.max(2, Math.round(sz / gap)));
  c.save(); s.poly(cell, true); c.clip();
  c.lineCap = 'butt';
  c.lineWidth = Math.max(.8, sz * .045);
  for (let i = 0; i < n; i++) {
    const t = (i - (n - 1) / 2) * gap * s.jr(.85, 1.15);
    const bx = cx - dy * t, by = cy + dx * t;
    const u0 = s.jr(-.58, -.14), u1 = s.jr(.14, .58);
    c.strokeStyle = rgb(s.chance(.5) ? shade(col, .16) : tint(col, .13), s.jr(.10, .20));
    c.beginPath();
    c.moveTo(bx + dx * sz * u0, by + dy * sz * u0);
    c.lineTo(bx + dx * sz * u1, by + dy * sz * u1);
    c.stroke();
  }
  c.restore();
}

// ---- the ruled line -------------------------------------------
// The construction lines are RULED, and they are drawn with the bare
// context rather than through `s.sline`. Two reasons, and the second
// one is a bug that took an ablation to find.
//
// The first is that they are construction: a cubist reaches for a
// straightedge here, and a line that wobbles like a stroke of the
// brush reads as drawing rather than as scaffolding.
//
// The second is p5.brush. Every mark it composites carries a fringe
// of near-WHITE where its mask coverage falls off — invisible on
// paper, which is where the other styles put their lines, and glaring
// over a flat plane, which is where this one puts them. A face
// crossed by four faint brush-hand ghosts came back covered in white
// cobwebs. A context stroke has no fringe and renders identically in
// both hands, which is exactly what a ruled line should do.
function ruled(s, pts, w, css) {
  const c = s.ctx;
  c.beginPath();
  for (let i = 0; i < pts.length; i++) {
    // a hand held the rule: a third of a pixel of tremor, no more
    const x = pts[i][0] + s.jr(-.35, .35), y = pts[i][1] + s.jr(-.35, .35);
    i ? c.lineTo(x, y) : c.moveTo(x, y);
  }
  c.strokeStyle = css; c.lineWidth = w; c.lineCap = 'butt'; c.lineJoin = 'miter';
  c.stroke();
}

// ---- IS THERE ANYTHING INSIDE THIS CONTOUR? --------------------
// The sheet's low-chroma columns — the white cat, the black bob —
// barely change from row to row, and here is the mechanical reason:
// `colors.skin` is NULL on a plain character, so the skull paper-fills
// the face and never calls `skin()` at all. Four of six faces on this
// row were therefore bare cream with the features hanging on nothing.
// Every style has the problem; most can live with it (a gothic face
// IS the gesso). An analytic canvas cannot: 1911 has no local colour
// and no bare ground, and a contour in a Braque is where two PLANES
// meet — there has to be paint on both sides of it.
//
// `edge()` is the only call a shape without colour still gets, so it
// asks the canvas directly: one pixel at the centroid. Transparent, or
// lighter than anything on this ramp (the palest step is .83 luma, so
// .885 is comfortably above every plane cubism can lay), means nobody
// has painted here and cubism paints it. Painted already — the mass
// took `tone`, the face took `skin` — and it leaves well alone.
//
// One pixel, once per contour. Not a per-pixel loop, and it is the
// only way a style can find out what it is standing on.
// THREE pixels, not one, and they have to agree. One was enough until
// this style started leaving a plane out of the middle of a face: the
// hole is transparent, so a single probe at the centroid landed in it,
// answered "nobody has painted here", and the whole face was repainted
// on top of itself — on the frames where the hole happened to reach the
// centre and not on the others. That is a strobe, and it was invisible
// in a still. Three probes spread across the shape cannot all fall in
// one missing plane.
function bare(s, pts) {
  const c = s.ctx, cv = s.canvas;
  if (!c.getImageData || !cv) return false;
  const [x0, y0, x1, y1] = bbox(pts);
  const [cx, cy] = centroid(pts);
  let m;
  try { m = c.getTransform(); } catch { return false; }
  const probes = [[cx, cy],
                  [cx + (x1 - x0) * .17, cy - (y1 - y0) * .13],
                  [cx - (x1 - x0) * .17, cy + (y1 - y0) * .13]];
  let seen = 0;
  for (const [ux, uy] of probes) {
    const px = Math.round(m.a * ux + m.c * uy + m.e);
    const py = Math.round(m.b * ux + m.d * uy + m.f);
    if (!(px >= 0 && py >= 0 && px < cv.width && py < cv.height)) continue;
    let d;
    try { d = c.getImageData(px, py, 1, 1).data; } catch { return false; }
    seen++;
    // painted, and dark enough to be paint rather than the ground:
    // one probe on real paint is enough to say "leave this alone"
    if (d[3] >= 12 && (d[0] * .299 + d[1] * .587 + d[2] * .114) / 255 <= .885) return false;
  }
  return seen > 0;
}

// the outline STRAIGHTENED: a ring of chords. Everything cubism draws
// as a line goes through here — the contour, the ghost.
function chordRing(pts, n) {
  const v = [];
  const m = pts.length;
  for (let i = 0; i < n; i++) v.push(pts[Math.round(i * m / n) % m]);
  v.push(v[0]);
  return v;
}

// ---- THE 1911 GRID --------------------------------------------
// Short parallel uprights and crossbars, laid over the planes,
// densest at the centre of the form and gone by the rim. Two jobs:
// it builds the shallow relief that stops the space reading flat, and
// its falloff is the OVAL — both painters cropped these canvases to
// one that year because the corners would not resolve, and fading the
// marks out toward the corners buys the same read for nothing.
//
// Micro-texture, so it goes down through `s.ctx` and stays micro in
// both hands.
function relief(s, g, pts, diag, dark) {
  const [x0, y0, x1, y1] = bbox(pts);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const rx = (x1 - x0) / 2 || 1, ry = (y1 - y0) / 2 || 1;
  const c = s.ctx;
  c.save(); s.poly(pts, true); c.clip();
  c.lineCap = 'butt';
  const n = Math.round(Math.min(26, diag * .16));
  for (let i = 0; i < n; i++) {
    const ax = g.jr(-1, 1), ay = g.jr(-1, 1);
    const r = Math.hypot(ax, ay);
    // the oval: nothing survives in the corners
    if (r > .96 || g.chance(Math.min(.92, Math.pow(r, 1.7)))) continue;
    const px = cx + ax * rx, py = cy + ay * ry;
    const up = g.chance(.62);
    const L = diag * g.jr(.045, .105);
    const w = Math.max(.55, diag * g.jr(.007, .013));
    c.strokeStyle = rgb(dark, g.jr(.20, .46));
    c.lineWidth = w;
    c.beginPath();
    if (up) { c.moveTo(px, py - L / 2); c.lineTo(px + s.jr(-.5, .5), py + L / 2); }
    else { c.moveTo(px - L / 2, py); c.lineTo(px + L / 2, py + s.jr(-.5, .5)); }
    c.stroke();
  }
  c.restore();
}

// ---- the body of the style -------------------------------------
// One routine paints every mass and every face; only the value
// amplitude and the number of cuts change.
function facets(s, pts, i0, o = {}) {
  const g = shapeDice(s, pts);
  const [x0, y0, x1, y1] = bbox(pts);
  const diag = Math.hypot(x1 - x0, y1 - y0);
  const [cx, cy] = centroid(pts);
  const rx = (x1 - x0) / 2 || 1, ry = (y1 - y0) / 2 || 1;
  // Braque's canvases are GREY with ochre in them, not brown with grey
  // in them. Warm-dominant was the first mix and the sheet came out
  // the colour of a cardboard box; it also parked this row in the
  // middle of four other brown ones. So COOL is the key — and the
  // SWING to ochre is per FACET, not per shape. One roll a shape left
  // four of six characters with no ochre anywhere in them, which is
  // not Braque, it is a monochrome: the two temperatures belong in the
  // SAME mass, alternating plane by plane at the same value. That
  // alternation is the only colour event on an analytic canvas.
  const cool = o.cool ?? .78;
  const RAMP = g.chance(cool) ? COOL : WARM, OTHER = RAMP === COOL ? WARM : COOL;

  // A small shape is not a cubist head, it is a pupil. Faceting it
  // shatters the one thing that has to survive: the eyes. Below the
  // threshold it is one flat plane, which is also what Braque does
  // with a small dark accent.
  if (diag < 26) {
    const col = paint(RAMP, i0);
    s.poly(pts, true); s.ctx.fillStyle = rgb(col); s.ctx.fill();
    return;
  }

  // ---- the partition, cut out of a domain LARGER than the shape ---
  // Each cell carries two polygons: the part of it inside the figure
  // and the part of the same plane out in the air. Cells whose inside
  // is empty are pure background and are dropped — a plane only exists
  // because a piece of the figure is standing in it.
  //
  // Every cell also carries a SIGNATURE: one bit per cut, saying which
  // side of it the cell is on. That is the cell's IDENTITY, and it is
  // the only handle on a cell that the boil cannot move. Anything
  // structural — which plane slides, which one is missing — is chosen
  // on the signature and never on an area rank: two cells of nearly
  // equal area swap places in a sort when the outline jitters by three
  // per cent, and "the missing plane" then jumps from one side of the
  // head to the other twice a second. That single ordering was worth
  // .03 of flicker on its own.
  let cells = [{ inn: pts, dom: domainOf(s, pts, o.ext ?? 1.19), sig: 0 }];
  const cuts = cutsFor(s, pts);
  for (let ci = 0; ci < cuts.length; ci++) {
    const [a, b, c] = cuts[ci];
    const next = [];
    for (const cell of cells) {
      const A = clipHalf(cell.inn, a, b, c), B = clipHalf(cell.inn, -a, -b, -c);
      if (A.length > 2) next.push({ inn: A, dom: clipHalf(cell.dom, a, b, c), sig: cell.sig | (1 << ci) });
      if (B.length > 2) next.push({ inn: B, dom: clipHalf(cell.dom, -a, -b, -c), sig: cell.sig });
    }
    cells = next;
  }

  // ---- THE VALUES, and this is the whole repaint -----------------
  // A facet is a small flat tilt of a real surface, lit from one
  // direction. Its normal is the sphere's normal where it sits, knocked
  // off by the tilt of the plane itself, and its value is that normal
  // against the light. So the planes step in a coherent SEQUENCE —
  // light up the left, dark down the right — with a hard jump at every
  // boundary, which is what "shattered but solid" is.
  const spread = o.spread ?? 2.35;
  const info = cells.map(cell => {
    const [fx, fy] = centroid(cell.inn);
    let nx = (fx - cx) / rx, ny = (fy - cy) / ry;
    const r = Math.hypot(nx, ny);
    if (r > 1) { nx /= r; ny /= r; }
    const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    // the tilt: a facet is FLAT, so it is not the sphere's normal, it
    // is a plane that was fitted to it and over-shot
    return { cell, w: Math.max(1e-6, area(cell.inn)),
             u: nx * LX + ny * LY + nz * LZ + g.jr(-.34, .34) };
  });
  // STRETCH THE SEQUENCE TO FILL THE RAMP. The light term alone does
  // not: on a round mass the cells all sit near the middle, so every
  // normal points more or less at the viewer, every dot product lands
  // within a fifth of the same number, and the shape comes back one
  // flat green with hairline seams in it — which is precisely the mud
  // the whole repaint is about, arriving by a different road. The
  // ORDER of the planes is the light's to decide; the AMPLITUDE is
  // `spread`'s, and it is spent in full on every shape whatever the
  // cuts happened to do.
  let ulo = 1e9, uhi = -1e9;
  for (const f of info) { if (f.u < ulo) ulo = f.u; if (f.u > uhi) uhi = f.u; }
  const span = Math.max(1e-6, uhi - ulo);
  for (const f of info) f.raw = ((f.u - ulo) / span * 2 - 1) * spread;
  // clamp the area-weighted MEAN, never the individual facet. That one
  // line is the difference between a value system and a texture: the
  // mass still weighs what the part asked for, and inside it the planes
  // are free to run from black to paper.
  const recentre = () => {
    let W = 0, M = 0;
    for (const f of info) { W += f.w; M += f.w * f.v; }
    const d = i0 - M / W;
    for (const f of info) f.v = Math.max(.05, Math.min(N - .06, f.v + d));
  };
  for (const f of info) f.v = f.raw;
  recentre(); recentre();

  // ONE black and ONE near-paper, guaranteed, on any shape big enough
  // to hold them — and taken on a SMALL cell so its area cannot drag
  // the mass off the value the part asked for. Analytic cubism is full
  // of black; a row of it with no black in it is the fourth brown row.
  if (diag > 44 && info.length > 3 && !o.quiet) {
    const small = info.filter(f => f.w < area(pts) * .34);
    if (small.length > 1) {
      const dk = small.reduce((a, b) => a.v < b.v ? a : b);
      const lt = small.reduce((a, b) => a.v > b.v ? a : b);
      if (dk !== lt) {
        dk.v = Math.min(dk.v, g.jr(.05, .55));
        lt.v = Math.max(lt.v, N - g.jr(.10, .70));
      }
    }
  }

  // ---- THE SHEAR AND THE HOLE -------------------------------------
  // The critic's sentence about this row was: "since your characters
  // keep their round silhouettes, this row can't really be Cubist".
  // These eleven lines are the answer, and they are the exception the
  // critic said would be worth taking.
  //
  // A plane in an analytic canvas is not obliged to stay where the
  // object is. One of them has SLID — the same facet, drawn a
  // centimetre off the form, so it hangs out past the contour and
  // leaves a wedge of bare canvas where it used to be — and one of
  // them is simply NOT PAINTED, so the ground shows through the middle
  // of the head. Between them the outline stops being an outline: it
  // has a piece sticking out of it and a bite taken out of it, and
  // neither is decoration laid on top, both are the mass itself.
  //
  // STRUCTURE, so it is chosen on the shape's own dice and never on
  // the boil. A shear that re-picks its plane three times a second is
  // the character having a seizure.
  const big = diag > 54 && !o.quiet && info.length > 3;
  // by SIGNATURE, which is a topological name for a cell and holds
  // still, never by area, which does not
  const bySig = big ? info.slice().sort((a, b) => a.cell.sig - b.cell.sig) : [];
  const total = area(pts) || 1;
  const pickCell = (want, cap) => {
    const k = g.ri(0, Math.max(0, bySig.length - 1));
    if (!want) return null;
    // a plane that is most of the mass is the mass: dropping or sliding
    // it is not a cubist decision, it is a missing character
    for (let i = 0; i < bySig.length; i++) {
      const f = bySig[(k + i) % bySig.length];
      if (f.w < total * cap) return f;
    }
    return null;
  };
  const hole = pickCell(g.chance(.72), .22);
  const shear = pickCell(g.chance(.85), .42);
  const slid = new Map();
  if (shear && shear !== hole) {
    const [fx, fy] = centroid(shear.cell.inn);
    // outward, along the line from the middle of the form to the
    // middle of the plane: a plane slides OFF, it does not slide in
    let ux = fx - cx, uy = fy - cy;
    const un = Math.hypot(ux, uy) || 1;
    ux /= un; uy /= un;
    const k = diag * g.jr(.085, .175);
    slid.set(shear, shear.cell.inn.map(([x, y]) => [x + ux * k, y + uy * k]));
  }

  // ---- paint ------------------------------------------------------
  const cc = s.ctx;
  for (const f of info) {
    const [bx0, by0, bx1, by1] = bbox(f.cell.inn);
    const sz = Math.hypot(bx1 - bx0, by1 - by0);
    if (sz < 2) continue;
    f.col = paint(g.chance(.25) ? OTHER : RAMP, f.v);
    if (f === hole) continue;             // the plane that is not there
    const poly = slid.get(f) || f.cell.inn;
    s.poly(poly, true);
    cc.fillStyle = rgb(f.col); cc.fill();
    tache(s, g, poly, f.col, sz);
  }

  // ---- PASSAGE ----------------------------------------------------
  // The plane carries on past the figure. Two boundary cells at most,
  // chosen by how much air they reach into, painted as `dom` MINUS the
  // whole outline — clip to the cell first, then one path of both
  // polygons filled even-odd, which inside the clip is exactly the
  // difference. Nothing else in the file makes the silhouette stop
  // being a silhouette.
  if (diag > 54 && !o.quiet) {
    const out = info.map(f => ({ f, z: area(f.cell.dom) - f.w }))
      .filter(q => q.z > diag * diag * .008)
      .sort((a, b) => b.z - a.z)
      .slice(0, g.chance(.45) ? 2 : 1);
    for (const { f } of out) {
      cc.save();
      s.poly(f.cell.dom, true); cc.clip();
      cc.beginPath();
      const run = p => { cc.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) cc.lineTo(p[i][0], p[i][1]); cc.closePath(); };
      run(f.cell.dom); run(pts);
      // the plane in the air is the same plane, a shade thinner: paint
      // laid over nothing is paint laid over the ground
      cc.fillStyle = rgb(mix(f.col, paint(RAMP, N - .9), .16));
      cc.fill('evenodd');
      cc.restore();
    }
  }

  // ---- the drawn cuts, and the scaffolding they turn into ---------
  //
  // THE LINES ARE OPAQUE, and that is not a taste decision. p5.brush
  // composites a mark by spectral-mixing its pigment into the
  // background — and where the part's plate is still transparent the
  // background it mixes into is WHITE. So a dark line asked for at
  // alpha .34 does not come out faint, it comes out an OPAQUE PALE
  // one, and the first brush-hand shot had white cobwebs over every
  // head. Faintness has to live in the COLOUR here, never in the
  // alpha: stated flat, both hands agree.
  const onPale = i0 >= 2.6;
  // A CUT lives inside the form, so it takes its value from the form:
  // dark on a pale mass, pale on a dark one.
  const CUT = onPale ? [30, 34, 30] : [188, 190, 172];
  // A RULE and a GHOST do not. They spend most of their length out on
  // the CANVAS, which is a mid grey-buff — so they are dark always,
  // and where one crosses a dark mass it simply disappears, which is
  // passage getting the answer right for free. Keyed to the mass the
  // way a cut is, every dark hair ruled a near-white streak across the
  // whole cell and the row came back covered in scratches.
  const RULE = [27, 31, 28];
  const GHOST = [88, 94, 84];

  // PASSAGE in the line too: only some of the cuts are ever drawn, and
  // the ones that are get drawn short, so one plane leaks into the
  // next. Draw them all and you have a stained-glass window. Which
  // ones is chosen by LENGTH, not by the dice — a rolled subset
  // scatters stubs around the rim and the form reads as chipped.
  const segs = [];
  for (const [a, b, c] of cuts) {
    const hits = crossings(pts, a, b, c);
    for (let i = 0; i + 1 < hits.length; i += 2) segs.push([hits[i], hits[i + 1]]);
  }
  const len = ([p, q]) => Math.hypot(q[0] - p[0], q[1] - p[1]);
  segs.sort((A, B) => len(B) - len(A));
  const drawn = segs.slice(0, Math.max(1, Math.round(segs.length * (o.quiet ? .3 : .42))));
  drawn.forEach(([p, q], k) => {
    const a0 = g.jr(-.10, .30), a1 = a0 + g.jr(.55, 1.10);
    const P = [p[0] + (q[0] - p[0]) * a0, p[1] + (q[1] - p[1]) * a0];
    const Q = [p[0] + (q[0] - p[0]) * a1, p[1] + (q[1] - p[1]) * a1];
    const wd = Math.max(1, diag * (o.quiet ? .013 : .020));
    // A DARK cut is drawn and a PALE one is scraped, and that split is
    // p5.brush's, not a taste. Every mark the brush hand composites
    // carries a fringe of near-WHITE where its mask coverage falls
    // off, and a pale line already near white is nothing BUT fringe:
    // the round-two brush shot came back with white squiggles crawling
    // over every dark mass. Dark on a pale plane still goes through
    // the hand, so the two hands keep saying it differently.
    if (onPale) s.sline([P, Q], wd, .98, rgb(CUT));
    else ruled(s, [P, Q], wd, rgb(CUT));
  });

  // Below this the shape is a feature, not a form: a ruled line across
  // a 40px ear is not cubism, it is litter.
  if (diag < 62) return;

  relief(s, g, pts, diag, onPale ? INKD : [206, 208, 190]);

  // THE SCAFFOLDING. It is the LONGEST CUT, continued out past the
  // silhouette into the air — never a free line laid over the picture.
  // That is the difference between an armature and a scratch, and the
  // first version had the scratch.
  //
  // COUNT IS EVERYTHING. Every mass on the character calls this, so
  // two lines a shape came out as forty lines a figure and the sheet
  // read as six people behind a picket fence. One, on the big masses.
  if (drawn.length && !o.quiet && g.chance(diag > 110 ? .5 : .2)) {
    // ANY of the drawn cuts, not the longest. The longest chord of a
    // shape wider than it is tall is a horizontal, so taking the
    // longest gave the row a rack of parallel crossbars.
    const pick = drawn[g.ri(0, drawn.length - 1)];
    const [p, q] = pick;
    const dx = (q[0] - p[0]) / (len(pick) || 1), dy = (q[1] - p[1]) / (len(pick) || 1);
    const back = diag * g.jr(.30, .95), fwd = diag * g.jr(.30, .95);
    const run = [[p[0] - dx * back, p[1] - dy * back], [q[0] + dx * fwd, q[1] + dy * fwd]];
    const wd = Math.max(1.4, diag * .026);
    ruled(s, run, wd, rgb(RULE));
    // ruled twice: the second pass is the straightedge shifted, not
    // the hand drawing again, so it goes down with the rule
    if (g.chance(.5)) {
      const o2 = diag * g.jr(.02, .055), nx = -dy * o2, ny = dx * o2;
      // the second pass is DARKER than the first, never lighter. Mixed
      // toward white it came out near-paper, and a near-paper rule
      // ruled across the whole cell is the scratch-on-the-scan the
      // scaffolding was rewritten to stop being.
      ruled(s, run.map(v => [v[0] + nx, v[1] + ny]), wd * .55, rgb(mix(RULE, [138, 142, 126], .5)));
    }
  }

  // MULTIPLE VIEWPOINTS: the same form seen from somewhere else, left
  // in as a construction contour. Straightened, because a cubist never
  // re-draws a curve — he re-draws the chords of it. Rare and at a
  // real weight; at 30% ink it was invisible on all six and was doing
  // nothing but costing code.
  if (diag > 96 && !o.quiet && g.chance(.4)) {
    const gh = chordRing(s.offsetShape(pts, g.jr(.80, 1.04),
      g.jr(-.20, .20) * diag, g.jr(-.16, .16) * diag, 0), 5 + g.ri(0, 2));
    // RULED, for the same reason the contour is: a mid-grey line put
    // through the brush hand came back as a bright white ring drawn
    // round one character's whole head in the round-two shot. A ghost
    // is a construction line anyway — it was measured off, not drawn.
    ruled(s, gh, Math.max(1.1, diag * .014), rgb(GHOST));
  }
}

// ---- THE PAGE BEHIND THE FIGURE --------------------------------
// Analytic cubism's other half is not on the object at all. It is the
// canvas: an OVAL — both painters cropped to one in 1911 because the
// corners would not resolve — filled with a shallow relief of planes
// that belong to no object in particular, ruled through by an armature
// of straight lines that crosses the whole picture and stops at
// nothing, with the SAME HEAD drawn a second time from somewhere else
// left standing in the middle of it as a construction contour.
//
// And the letters. Braque stencilled BAL, VALSE, JOURNAL onto Le
// Portugais in exactly 1911 — the first typography in a painting, and
// it is there for a reason this file cares about: a stencilled letter
// is flat and it is unmistakably ON the canvas, so it fixes the
// surface the planes are floating over. It is also the one thing on
// the sheet nobody will mistake for another movement.
//
// It is drawn ONCE per character, so it may roll freely on `s` and it
// can never flicker.
const ovalPts = (cx, cy, rx, ry, n = 72) => {
  const p = [];
  for (let i = 0; i < n; i++) {
    const t = i / n * Math.PI * 2;
    p.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]);
  }
  return p;
};

// the stencil vocabulary: what was actually stencilled onto these
// canvases, and nothing invented
const WORDS = ['BAL', 'VALSE', 'JOU', 'JOURNAL', 'MA JOLIE', 'BACH', 'CAFÉ', 'ARIA', 'LE TORÉADOR'];

function stencil(s, c, text, x, y, size, col, a) {
  c.save();
  // a stencil is a plate, not a hand: flat, condensed, wide-tracked
  try { c.letterSpacing = `${(size * .16).toFixed(1)}px`; } catch { /* older engines */ }
  c.font = `600 ${size}px "Helvetica Neue", "Arial Narrow", Arial, sans-serif`;
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = rgb(col, a);
  c.fillText(text, x, y);
  // the bridges a stencil plate leaves: thin bars of canvas across the
  // letters, which is what makes a stencilled letter a stencilled one
  c.globalCompositeOperation = 'destination-out';
  const wdt = c.measureText(text).width;
  for (let k = 0; k < 2; k++) {
    const yy = y + size * (k ? .22 : -.20) + s.jr(-1, 1);
    c.fillStyle = 'rgba(0,0,0,1)';
    c.fillRect(x - wdt * .6, yy, wdt * 1.2, Math.max(.7, size * .045));
  }
  c.restore();
}

function backdropPage(s, w, h, floor) {
  const c = s.ctx;
  const cx = w * .5, cy = floor - h * s.jr(.40, .46);
  // The oval VARIES. Six identical ovals in a row is a row of eggs,
  // which is what the first shot of this page was — the crop has to be
  // a decision somebody made about this canvas, not a template. Two of
  // the axes and a small tilt is enough.
  const rx = w * s.jr(.40, .475), ry = h * s.jr(.37, .445);
  const tilt = s.jr(-.10, .10);
  const oval = ovalPts(cx, cy, rx, ry).map(([x, y]) => {
    const dx = x - cx, dy = y - cy;
    return [cx + dx * Math.cos(tilt) - dy * Math.sin(tilt), cy + dx * Math.sin(tilt) + dy * Math.cos(tilt)];
  });
  const diag = Math.hypot(rx, ry) * 2;

  // the primed oval — barely off the ground, because the crop is a LINE
  // and a few planes, never a value step. A dark egg behind every
  // figure was the first version and it cost the figures their read.
  s.poly(oval, true); c.fillStyle = rgb([189, 189, 171]); c.fill();

  // ---- the field of planes ---------------------------------------
  // The page is partitioned exactly the way a mass is, and for the
  // same reason: it is the same surface. The partition is cut on the
  // whole PANEL, not on the oval, and each cell is then painted
  // clipped to the crop — except for two of them, which are painted in
  // full and run straight out of the picture. That is passage at the
  // scale of the canvas, and it is what stops the crop reading as an
  // egg with a pattern in it.
  //
  // It is deliberately LOW in amplitude: this is the air, and air that
  // competes with the figure is wallpaper.
  // THE OVERRUN IS A RIM, NOT A SLAB. Cut on a domain the crop's own
  // size and a bit — grown, never a bounding box. A partition of the
  // whole panel gave two cells the size of the picture and the row came
  // back as a Bauhaus poster with a doodle standing in front of it,
  // which is the same mistake `domainOf` records making on the figure.
  const grow = s.jr(1.16, 1.34);
  const outer = oval.map(([x, y]) => [cx + (x - cx) * grow, cy + (y - cy) * grow]);
  let cells = [outer];
  const nCut = 8 + s.ri(0, 3);
  for (let k = 0; k < nCut; k++) {
    const th = s.weighted(GRID) + s.jr(-.12, .12);
    const a = -Math.sin(th), b = Math.cos(th);
    let lo = 1e9, hi = -1e9;
    for (const [x, y] of oval) { const d = a * x + b * y; if (d < lo) lo = d; if (d > hi) hi = d; }
    const cc = -(lo + (hi - lo) * s.jr(.06, .94));
    const next = [];
    for (const cell of cells) {
      const A = clipHalf(cell, a, b, cc), B = clipHalf(cell, -a, -b, -cc);
      if (A.length > 2) next.push(A);
      if (B.length > 2) next.push(B);
    }
    cells = next;
  }
  const field = [];
  for (const cell of cells) {
    const inn = clipPoly(cell, oval);
    if (inn.length < 3) continue;
    field.push({ cell, inn, a: area(inn) });
  }
  field.sort((p, q) => q.a - p.a);
  // the two that run out: chosen by how much of the cell is OUTSIDE
  // the crop, so an overrun is always a plane with somewhere to go
  const spill = field.slice().sort((p, q) => (area(q.cell) - q.a) - (area(p.cell) - p.a))
    .filter(f => f.a > 0 && area(f.cell) - f.a > 0)
    .slice(0, 2 + s.ri(0, 1));
  // TWO DARKS ON THE PAGE. Without them the field is a haze at row
  // scale — every plane sits in the same band and the squint sees fog
  // with a doodle in it. A Braque has real black in the corners of the
  // canvas, and two dark planes are what tell the eye the pale ones
  // are pale. They are taken off the SMALL end so they cannot swamp
  // the figure, and away from the middle where the figure stands.
  const dark = new Set(field.slice(Math.floor(field.length * .45))
    .filter(f => Math.abs(centroid(f.inn)[0] - cx) > rx * .34)
    .slice(0, 2));
  for (const f of field) {
    const [fx, fy] = centroid(f.inn);
    // the same one light the figure is under, so the page and the
    // figure are lit by the same lamp — which is what makes them one
    // surface rather than a figure on a pattern
    const u = ((fx - cx) / rx) * LX + ((fy - cy) / ry) * LY;
    const ramp = s.chance(.26) ? WARM : COOL;
    const col = dark.has(f) ? paint(ramp, s.jr(1.05, 2.10))
                            : paint(ramp, 4.80 + u * 1.30 + s.jr(-.30, .30));
    s.poly(f.inn, true); c.fillStyle = rgb(col); c.fill();
    if (spill.includes(f)) {
      // out past the crop and onto the bare canvas, a shade thinner —
      // paint over nothing is paint over the ground
      s.poly(f.cell, true); c.fillStyle = rgb(mix(col, [206, 204, 186], .30), .92); c.fill();
    }
  }

  // ---- the armature ----------------------------------------------
  // Straight lines the full width and height of the PANEL, not of the
  // oval — they run out of the picture at both ends and they do not
  // stop for the figure. That is the difference between scaffolding
  // and a frame.
  //
  // COUNT IS EVERYTHING here too. Seven hairlines came back as rain
  // falling on the row. Three or four, and each one at a weight you
  // could hold a straightedge against.
  const RULE = [40, 45, 40];
  const n = 3 + s.ri(0, 1);
  for (let i = 0; i < n; i++) {
    const th = s.weighted(GRID) + s.jr(-.10, .10);
    const dx = Math.cos(th), dy = Math.sin(th);
    const px = cx + s.jr(-1, 1) * rx * .95, py = cy + s.jr(-1, 1) * ry * .95;
    const L = w + h;
    // ONE of them is the straightedge and the rest are the marking
    // out. Four lines of the same weight is rain; one bar with three
    // hairlines round it is an armature.
    const heavy = i === 0;
    ruled(s, [[px - dx * L, py - dy * L], [px + dx * L, py + dy * L]],
      heavy ? Math.max(1.8, diag * s.jr(.014, .022)) : Math.max(.8, diag * s.jr(.004, .008)),
      rgb(RULE, heavy ? s.jr(.66, .86) : s.jr(.34, .56)));
  }

  // ---- THE OTHER VIEWPOINT ---------------------------------------
  // The head again, from the side, drawn as a construction contour and
  // never painted: a straightened profile with one eye in it, standing
  // beside the figure at the figure's own scale. This is the thing the
  // critic said the row could not do — two views of one head in one
  // picture — and it is exactly what a backdrop is for.
  // It stands OUT at the rim of the crop, not near the middle — the
  // figure occupies the middle of every panel on the sheet, and the
  // first version of this drew the second head neatly behind the first
  // one, where nobody could see it. It is also drawn at a real weight:
  // a construction line is thin, but thin and pale together is
  // invisible at row scale, so it is thin and DARK.
  const side = s.chance(.5) ? 1 : -1;
  const gx = cx + side * rx * s.jr(.62, .80), gy = cy - ry * s.jr(.18, .52);
  const gr = Math.min(rx, ry) * s.jr(.42, .56);
  const GH = [56, 62, 52];
  const gw = Math.max(1.1, gr * .042);
  // SIX CHORDS, not a ring. A smooth ellipse beside an oval crop is a
  // second egg — the round-three shot had two of them on every panel
  // and neither read as a head. A cubist never re-draws a curve, he
  // re-draws the chords of it, and six of them is where the eye stops
  // seeing a circle.
  const ring = [];
  const m = 6;
  for (let i = 0; i <= m; i++) {
    const t = i / m * Math.PI * 2 + s.jr(-.10, .10) + .3;
    ring.push([gx + Math.cos(t) * gr * s.jr(.84, 1.16) * .84,
               gy + Math.sin(t) * gr * s.jr(.86, 1.14) * 1.06]);
  }
  // and it is BROKEN, like every other contour in this style
  for (let i = 1; i < ring.length; i++) {
    if (s.chance(.22)) continue;
    ruled(s, [ring[i - 1], ring[i]], gw, rgb(GH, .88));
  }
  // the profile: a brow and a jaw cut straight across it, so the same
  // head is being seen from the front and from the side at once
  ruled(s, [[gx - side * gr * .92, gy - gr * .12], [gx + side * gr * .48, gy - gr * .36],
            [gx + side * gr * .98, gy + gr * .28]], gw * 1.5, rgb(GH, .95));
  ruled(s, [[gx - side * gr * .70, gy + gr * .42], [gx + side * gr * .86, gy + gr * .58]],
    gw * 1.2, rgb(GH, .8));
  // and ONE EYE, seen from the front inside a head seen from the side
  const ex = gx - side * gr * s.jr(.10, .30), ey = gy - gr * s.jr(.04, .24);
  const er = gr * s.jr(.22, .30);
  ruled(s, ovalPts(ex, ey, er, er * .72, 12).concat([[ex + er, ey]]), gw, rgb(GH, .95));
  c.beginPath(); c.arc(ex, ey, er * .42, 0, Math.PI * 2);
  c.fillStyle = rgb([34, 38, 32], .82); c.fill();

  // ---- the stencil ------------------------------------------------
  // Low and to the other side, where the figure's legs are not, and at
  // a size you can read across a room. Braque's letters are LARGE:
  // BAL on Le Portugais is a fifth of the canvas.
  const tx = cx - side * rx * s.jr(.56, .78), ty = cy + ry * s.jr(.34, .64);
  stencil(s, c, s.pick(WORDS), tx, ty, Math.max(10, ry * s.jr(.17, .24)), [34, 38, 33], s.jr(.72, .9));

  // ---- the crop ---------------------------------------------------
  // The oval is a stretcher, and a stretcher has an edge — but a
  // CLOSED ring round every panel is six eggs standing in a row, which
  // is what the last two shots were. So the crop obeys the same rule
  // the figure's contour obeys: it is a run of chords with a third of
  // them missing, and it is gone entirely wherever a plane ran out
  // through it.
  const crop = chordRing(oval, 22);
  for (let i = 1; i < crop.length; i++) {
    if (s.chance(.42)) continue;
    ruled(s, [crop[i - 1], crop[i]], Math.max(.8, diag * s.jr(.003, .006)),
      rgb([58, 62, 54], s.jr(.35, .62)));
  }
}

export default {
  id: 'cubism', label: 'cubism', era: 1911, underdraw: false,

  // THE DRAWING'S BLACK. Every `inkA()` a part reaches for — the void
  // eyes, the pupils, the nostrils — resolves through this, so the
  // character's black is the style's. There is no lamp black on a
  // 1911 canvas: the dark is an iron black with the green of the
  // picture already in it, which is what stops the eyes reading as two
  // stickers pasted onto a grey painting.
  ink: [30, 33, 28],

  // The oval is the picture, so the panel is nearly square and it
  // stands where the figure stands. Wider than the cell and it bites
  // into its neighbour's page — the sheet's rows are one cell apart.
  // It also has to sit INSIDE the row's torn ground, which is one cell
  // tall standing on the shelf. At 1.10 the armature ran out of the top
  // of the paper and the row came back with a picket fence over it.
  panel: { w: .97, h: 1.02, y: .40 },

  backdrop(s, { w, h, floor }) { backdropPage(s, w, h, floor); },

  // The paper. A 1911 canvas is a grey-buff commercial primed linen,
  // and this one is pulled off the warm buff the sheet's fallback
  // offers toward the green-grey the planes are painted in — the ochre
  // in this row is the SWING, not the key, and a warm ground put the
  // key back where the other four brown rows are.
  //
  // And it is a shade DARKER than the sheet's fallback, not lighter.
  // The palest step on this ramp is .83 luma and the fallback buff was
  // .78 — the pale planes had nowhere to be pale, so at row scale the
  // whole thing sank into its own canvas. A mid ground at .72 puts the
  // lights clearly above it and the blacks clearly below, which is
  // what a primed linen is for.
  ground: [186, 185, 167],

  tone(s, pts, o = {}) {
    const d = dens(o.style);
    // The style takes the VALUE the part asked for and nothing else.
    // A blue horn and a brown one are the same grey here; that is
    // 1911, and it is why the sheet's variety has to live in the
    // marks.
    //
    // The top of the ramp is not available. A white cat's fur asked
    // for lum 1 and got the palest step, which is the paper — the
    // shape disappeared and took its planes with it. Nothing in an
    // analytic canvas is the colour of the ground.
    const v = o.col ? Math.min(1, lum(o.col) * (1.10 - d * .28)) : 1 - d;
    // THE PALE END IS CAPPED HARD, and this is the second thing the
    // first repaint got wrong. A white cat's fur asks for lum 1, lands
    // at the top of the ramp, and every facet in the mass then clamps
    // against the ceiling — so the wide spread has nowhere to go and
    // the shape comes back as one flat cream disc with the planes
    // squeezed out of it. Capping the MEAN two steps below the top
    // gives the swing room in both directions, and it is also just
    // true: nothing in an analytic canvas is the colour of the ground,
    // the lightest thing on one is a light ochre.
    const i0 = Math.max(.35, Math.min(N - 1.95, v * N));
    const cool = o.col ? (lum([o.col[0], o.col[1] * .6, 0]) < lum([0, o.col[1] * .6, o.col[2]]) ? .93 : .72) : .84;
    // a mass that asked to be BLACK keeps a narrower swing — it is
    // still allowed a grey plane in it, but a black hat that averages
    // mid-grey is not a black hat
    facets(s, pts, i0, { cool, spread: d > .9 ? 1.7 : 2.8 });
  },

  skin(s, pts, col, o = {}) {
    // Flesh in an analytic canvas is not pink, it is the middle of the
    // same monochrome: a face and a table top are made of the same
    // paint and only the planes tell them apart. Put a face up at the
    // pale end and the whole sheet turns to sand — the darks are what
    // the light planes are FOR.
    //
    // The amplitude is a little under a mass's, and only a little.
    // The face is where the character has to survive the movement, and
    // it survives on the EYES, which are drawn over the top of this as
    // their own small flat planes.
    const i0 = 2.85 + Math.max(0, Math.min(1, lum(col))) * .95;
    facets(s, pts, i0, { cool: .72, spread: 2.15, ext: 1.13 });
  },

  // ---- the contour ------------------------------------------------
  // A POLYLINE OF CHORDS — cubism straightens everything — and it is
  // BROKEN in the two places 1911 breaks it.
  //
  //   · wherever a facet crossed it. The cuts are re-derived from the
  //     same outline, so this call knows exactly where the planes went
  //     through, and the line simply is not there. That is passage,
  //     and it is the reason the silhouette stops being a silhouette.
  //   · on the LIT side. No analytic canvas has a black outline
  //     anywhere in it, and where a plane turns into the light the
  //     figure and the air are the same value, so there is nothing for
  //     a line to separate.
  //
  // What survives is a dark iron-green, heavy in the shadow and gone
  // in the light — a contour with an opinion instead of a rubber band
  // round the drawing.
  edge(s, pts, w, o = {}) {
    if (pts.length < 5) { s.stroke(pts, w, { alpha: .9, amp: .3, ...o }); return; }
    const [x0, y0, x1, y1] = bbox(pts);
    const diag = Math.hypot(x1 - x0, y1 - y0);
    const [cx, cy] = centroid(pts);
    // a form nobody painted: cubism paints it before it closes it.
    // Head-sized only — a blank patch a centimetre across is a tooth
    // or a highlight and it is meant to be blank.
    // QUIET: it is a face, and the eyes go on top of it. The planes
    // are there and the cuts are there, but not the forced black, not
    // the passage and not a ruled line — six characters each running
    // their own armature across the row is the picket fence the
    // scaffolding comment warns about, and it happened the moment this
    // block was added.
    if (diag > 62 && bare(s, pts)) {
      // and it sits HIGH on the ramp. drawai's identity is a black
      // void eye, and the eyes are drawn over this: park the face at
      // mid-grey and they stop reading as holes. The planes still swing
      // a step and a half either way, which is plenty on a face.
      facets(s, pts, 3.62, { cool: .72, spread: 1.7, quiet: true });
    }
    // FEW chords. Twelve around a head is still a circle — the contour
    // only reads as straightened at six or seven.
    //
    // The ring is pushed a few per cent OUT before it is straightened.
    // A chord cuts the corner off a curve, so a contour built on the
    // outline itself runs INSIDE the shape, with the shape's own paint
    // on both sides of it — and in the brush hand every mark carries a
    // pale fringe, which over paint is a white scratch and over paper
    // is nothing.
    const v = chordRing(s.offsetShape(pts, 1.04, 0, 0, 0),
      Math.max(5, Math.min(8, 4 + Math.round(diag * .045))));
    const g = shapeDice(s, pts);
    // where the planes went through — same cuts the fill used
    const cuts = diag > 26 ? cutsFor(s, pts) : [];
    const gate = Math.max(2.2, diag * .06);
    const near = (px, py) => {
      for (const [a, b, c] of cuts) if (Math.abs(a * px + b * py + c) < gate) return true;
      return false;
    };
    // THE CONTOUR IS RULED, and that is the last thing the brush hand
    // forced. Every mark p5.brush composites carries a fringe of
    // near-WHITE where its mask coverage falls off. On cream paper —
    // which is where the other eight styles put their contours — the
    // fringe is invisible. This style now paints the whole figure, so
    // the contour lies over dark planes, and the fringe came back as a
    // white halo tracing every head: the same bug the ruled lines and
    // the facet cuts were already moved off `s.stroke` to avoid.
    // Widening the mark does not fix it, because the fringe is outside
    // the core and gets drawn last.
    //
    // Which is fine, because a cubist contour is a RULE anyway: a
    // polyline of chords, drawn firm, against a straightedge. It goes
    // down twice — once for the line, once for the straightedge
    // shifted — and it keeps the wrist's overshoot past the corner,
    // which is drawai's hand and survives the change.
    //
    // It also frees the weight. A brush contour has to be WIDE or its
    // fringe swallows it, so the lit side could never be drawn thin;
    // a ruled one can be a hairline where the light is and a bar where
    // the shadow is, which is the whole point of the thing.
    // THE CONTOUR IS NOT THE SILHOUETTE ANY MORE, and this is the
    // second half of the exception. A cubist outline is a polyline of
    // chords, and three things happen to those chords that never
    // happen to an outline:
    //
    //   · one RUNS PAST the corner it should have turned and keeps
    //     going into the air — the plane's edge continued, not a
    //     wrist's overshoot;
    //   · one has WANDERED, shifted bodily sideways off the form, so
    //     the line and the paint are half a centimetre apart and the
    //     eye has to decide which is the object;
    //   · a third of them are simply ABSENT.
    //
    // All three are rolled on `g`, the shape's own dice, so the
    // silhouette breaks the SAME way on every boil frame. Rolled on
    // `s` the head would grow and lose a different limb of its outline
    // three times a second.
    let run = [], runW = 1;
    const flush = () => {
      if (run.length > 1) {
        const wd = Math.max(.9, w * runW);
        let q = run.slice();
        // RUN PAST THE CORNER. Both ends are candidates and the tail
        // goes long: at a fortieth of the diagonal it was a wrist tic,
        // at a sixth it is a plane edge carrying on into the air, which
        // is what it is supposed to be.
        const extend = (i, j, k) => {
          const a = q[i], b = q[j];
          const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
          q[j] = [b[0] + (b[0] - a[0]) / d * k, b[1] + (b[1] - a[1]) / d * k];
        };
        if (g.chance(.55)) extend(q.length - 2, q.length - 1, diag * g.jr(.05, .17));
        if (g.chance(.30)) extend(1, 0, diag * g.jr(.04, .13));
        // THE CHORD THAT WANDERED: the whole run bodily off the form,
        // perpendicular to itself. The contour is a MEASUREMENT of the
        // object here, and a cubist leaves the measurement where he
        // took it even after the object has moved on.
        if (g.chance(.30)) {
          const a = q[0], b = q[q.length - 1];
          const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
          const k = diag * g.jr(.035, .085) * (g.chance(.5) ? 1 : -1);
          const nx = -(b[1] - a[1]) / d * k, ny = (b[0] - a[0]) / d * k;
          q = q.map(([x, y]) => [x + nx, y + ny]);
        }
        ruled(s, q, wd, rgb(INKD));
        // pressed harder on the way back down one of the chords
        if (g.chance(.42)) ruled(s, q, wd * s.jr(.35, .6), rgb(shade(INKD, .3)));
      }
      run = [];
    };
    for (let i = 1; i < v.length; i++) {
      const mx = (v[i - 1][0] + v[i][0]) / 2, my = (v[i - 1][1] + v[i][1]) / 2;
      // the outward normal of this piece of the silhouette, against the
      // light: 1 is full in the light, -1 is the shadow side
      const nl = Math.hypot(mx - cx, my - cy) || 1;
      const face = ((mx - cx) * LX + (my - cy) * LY) / nl;
      // a plane crossed here — the line is simply absent
      if (near(mx, my)) { flush(); continue; }
      // and the lit side dissolves. A third of the ring gone is the
      // target: below that the eye reassembles the circle and the
      // exception has bought nothing.
      if (g.chance(.24 + Math.max(0, face) * .48)) { flush(); continue; }
      // WEIGHT, not alpha, carries the shadow side — and never below
      // 1, because p5.brush's mark has a pale fringe of fixed width
      // where its coverage falls off and the only way to make the
      // fringe small is to make the dark core large. Over cream that
      // fringe is nothing; over a dark plane, which is now most of
      // this row, it is a white scratch.
      if (!run.length) { run.push(v[i - 1]); runW = .70 + Math.max(0, -face) * 1.30; }
      run.push(v[i]);
      // and never more than two or three chords in a row. Four in a
      // row is a continuous heavy ring, which is the black outline no
      // canvas of 1911 has anywhere in it — the contour has to arrive
      // as separate decisions with air between them.
      if (run.length > (g.chance(.4) ? 3 : 2)) flush();
    }
    flush();
  },
};
