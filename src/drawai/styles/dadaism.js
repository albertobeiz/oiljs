// ---------------------------------------------------------------
// DADA — photomontage and letterpress, Berlin 1918.
//
// Höch, Hausmann, Heartfield. The pictures are not painted, they are
// ASSEMBLED: scraps torn out of the illustrated weeklies and glued
// down by somebody who does not care whether it is straight. So the
// style's job is not to invent a surface — it is to behave like a
// pair of hands with a pot of paste.
//
// THE ONE MOVE THIS STYLE LIVES OR DIES BY IS THE CUT. A version that
// screened every part in perfect register was a texture pass wearing a
// collage costume: everything sat exactly where the drawing put it, so
// the eye read a filter. In 'Cut with the Kitchen Knife' nothing is in
// register — a face is sliced along a straight edge and the halves are
// pasted back a centimetre out of joint, and the two halves are not
// even the same PAPER. So here: a scrap over about 26px is cut by a
// STRAIGHT line, one half slides 10-20px along the cut with its own
// shadow, and the two halves get DIFFERENT MATERIALS off the newsstand
// — a coarse newsprint screen meeting a fine magazine screen, or a
// screen meeting bare torn stock, at a hard edge. The character's own
// features are drawn afterwards and stay where they were, so a face
// really is out of joint. That single mechanism answers four notes at
// once: displacement, mismatched screens, the face's white knockout,
// and per-region misregistration.
//
// The rest of the vocabulary, each a function below:
//   · a TORN patch, not a cut one — long soft lobes with sudden bites
//     where the fibre gives, a pale strip along the tear, and a shadow
//     under it because the scrap has lifted off the board. Every scrap
//     now has BOTH kinds of edge: torn around the outside, cut across
//     the middle. That contrast is what says scissors;
//   · the patch is CROOKED and slightly too big for the hole it fills,
//     and one scrap in eight is PLAINLY too big — the dada joke of a
//     part pasted at the wrong scale;
//   · MATERIALS, dealt per piece: coarse screen, fine screen, flat cut
//     colour, bare torn stock, a photographic gradient, a column of
//     type. Homogeneity is the one thing collage cannot be;
//   · OFF-REGISTER, per piece and not per character: the colour plate
//     landed points off the black one, and one piece per shape slips
//     three times as far as the rest so the eye actually catches it;
//   · TYPE, set at a wrong angle in a wrong size, big and black and
//     cropped by the edge of its own scrap. `ctx.fillText` is
//     legitimate here and nowhere else in this project: a letterform
//     is a found object, not a drawing;
//   · a FOREIGN OBJECT, rarely — a torn rectangle of ledger or a
//     number, pasted half off the edge of the character. Collage is
//     the one thing that does not stay politely inside the outline;
//   · a head nobody coloured, screened anyway — `bareFace`. The rig
//     only reaches `skin` when the character HAS a skin colour, so a
//     white cat used to come back as bare paper with a contour on it:
//     the one cell in the row with no collage in it;
//   · and BEHIND all of it, the PASTED PAGE — see `backdrop`. Höch's
//     grounds are as busy as her figures, and until this round this
//     style's figure was standing on nothing.
//
// The character's BLACK is this style's too (`ink`): the void eyes and
// the contours are printing black, the same ink as the type pasted
// beside them, never lamp black.
//
// The palette is a newsstand and has four things in it: paper cream,
// printing black, the nicotine yellow-brown of paper twenty years in a
// drawer, and one raw red. A blue appears only as the plate that
// slipped.
//
// THE RISK is confetti, and three rules hold it off: the largest piece
// must actually FILL the shape, so the silhouette survives at crowd
// scale; a piece gets at most ONE found object; and the foreign object
// is dealt to about one part in ten. A version that gave every shape a
// stamp and a numeral read as gravel at 90px a head.
// ---------------------------------------------------------------
import { nearest, tint, shade, dens, bbox, centroid, rgb, lum } from './pigment.js';

// The newsstand: four papers and four inks, and no fifth thing. The
// cream is a shade under drawai's own paper on purpose — this style
// paints its row on newsprint (`ground`, below), but the crowd and the
// editor are still the cream page, and a knockout the same value as
// the page is not a knockout, it is a hole in the character.
const CREAM = [230, 222, 201];      // fresh stock — this is the KNOCKOUT
const NEWS = [199, 192, 172];       // grey pulp, the commonest scrap
const NICOTINE = [193, 166, 110];   // twenty years in a drawer
const BLACK = [30, 27, 24];         // printing black, never a true black
const RED = [186, 45, 34];          // the one raw red
const BLUE = [42, 62, 128];         // only ever the plate that slipped

const PAPERS = [[CREAM, 40], [NEWS, 42], [NICOTINE, 18]];
const INKS = [BLACK, RED, NICOTINE, NEWS];

const GLYPHS = '123456789045ABEFGHKMORSTWZ?!&%§';
const FONTS = ['bold %px Georgia, "Times New Roman", serif',
               'bold %px Impact, "Haettenschweiler", sans-serif',
               '900 %px "Helvetica Neue", Helvetica, Arial, sans-serif',
               'bold italic %px Georgia, serif'];
const font = (f, px) => f.replace('%', Math.max(6, px | 0));

// ---- the scissors ------------------------------------------------
// A PASTED SCRAP DOES NOT MOVE, AND THAT COST TWO ROUNDS TO GET RIGHT.
//
// Every part is redrawn once per BOIL FRAME with a fresh seed, so any
// composition rolled with `s.jr` is re-decided two or three times a
// second: the collage reshuffles itself while you watch, which is the
// one thing a pot of paste cannot do. Measured: `__styles.flicker`.
//
// Round one keyed everything off a hash of the shape's bounding box.
// Round two found the flaw and only half-fixed it: several parts
// RE-ROLL THEIR OWN OUTLINE between boil frames — `skull.js` scales
// its skin polygon by 0.95-1.03 (three or four pixels on every edge of
// a head) and `hair.js` swings its hem by a quarter of the head's
// half-height — so any key computed from `pts` is a lottery, whatever
// grid it is quantised to. Smoothing the key into a sine of the box
// (round two's `wave`) only made the lottery quieter: it still flipped
// a font, a screen or a cut angle a few seeds in ten. Measured .052
// against the plain materials' .022, and the worst offenders were
// exactly `skull` and `hairBack`.
//
// So the key is not the shape at all. IT IS THE PLATE. Every part is
// drawn onto its own canvas at its own fixed size, with a transform
// that `rig.js` computes from the bone's position — no dice anywhere
// in it — and that canvas and that transform are IDENTICAL for every
// boil frame of that part. Ask the context where it is and you have a
// per-part identity that cannot move.
//
// What it costs: two shapes drawn on ONE plate share their paper and
// their scissors. That is not a loss, it is the truth about collage —
// a part is one scrap of paper, and a scrap is cut out of one page.
// Everything that must vary WITHIN a plate (where the cut falls, how
// big the type is, where the mark sits) is still measured off the
// shape's own box, so it follows the boil smoothly instead of
// re-rolling.
function plateKey(s, salt = 0) {
  let e = 0, f = 0, a = 1, d = 1;
  try { const T = s.ctx.getTransform(); e = T.e; f = T.f; a = T.a; d = T.d; } catch { /* no transform */ }
  let h = (2166136261 ^ salt) >>> 0;
  for (const v of [s.w | 0, s.h | 0, Math.round(e), Math.round(f), Math.round(a * 64), Math.round(d * 64)])
    h = Math.imul(h ^ (v | 0), 16777619) >>> 0;
  return h;
}
function h01(h, i) {
  let x = Math.imul(h ^ Math.imul(i + 1, 2654435761), 2246822519) >>> 0;
  x ^= x >>> 13; x = Math.imul(x, 3266489917) >>> 0;
  return (x >>> 0) / 4294967296;
}

// The same dice the Sketch offers — `r / i / c / pick / w` — but drawn
// from the PLATE instead of from the frame's seed. Anything that
// decides WHAT IS THERE uses these; anything that decides how the ink
// happened to land still uses `s.jr`, which is the boil.
function dice(h) {
  let i = 0;
  return {
    r: (a, b) => a + h01(h, ++i) * (b - a),
    i: (a, b) => Math.floor(a + h01(h, ++i) * (b - a + 1)),
    c: p => h01(h, ++i) < p,
    pick: a => a[Math.min(a.length - 1, (h01(h, ++i) * a.length) | 0)],
    w(pairs) {
      let t = 0; for (const p of pairs) t += p[1];
      let x = h01(h, ++i) * t;
      for (const p of pairs) if ((x -= p[1]) < 0) return p[0];
      return pairs[pairs.length - 1][0];
    },
  };
}
const plateDice = (s, salt) => dice(plateKey(s, salt));

// per-plate latch — each part is drawn on its own Sketch, so this is
// exactly "has anything been pasted on this part yet", which is the
// question `edge` has to ask before it screens a bare head.
const D = s => (s.__dada ??= { painted: false });

// A part hands over a coarse ring — sixteen points for a blob. A tear
// needs more resolution than that, or its notches come out as gentle
// dents: smooth, i.e. cut.
function densify(pts, n) {
  let out = pts;
  while (out.length < n) {
    const next = [];
    for (let i = 0; i < out.length; i++) {
      const a = out[i], b = out[(i + 1) % out.length];
      next.push(a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
    }
    out = next;
  }
  return out;
}

const diagOf = pts => { const [x0, y0, x1, y1] = bbox(pts); return Math.hypot(x1 - x0, y1 - y0); };
const spanOf = pts => { const [x0, y0, x1, y1] = bbox(pts); return Math.min(x1 - x0, y1 - y0); };

// how deep the tear is on a shape this big — the one number the patch
// and the contour have to agree on
const tearK = pts => Math.max(.8, diagOf(pts) * .032);

// THE SCISSORS: crooked, a little too big, and torn. A real tear is
// LOW frequency — long straightish runs with the occasional big bite
// out of it — so the spectrum matters more than the amplitude: two
// slow lobes carry it and one sharply-peaked term takes the bites.
// (An earlier version put half its energy in a 7-12 cycle term and the
// result read as roughness, i.e. as a rough DRAWN edge.) Every term is
// a function of the ANGLE about the box's centre and never of the
// point index, so the ring comes out the same however finely the
// caller happened to sample its outline.
function scrap(pts, g, extra = 1) {
  const k = tearK(pts);
  const [x0, y0, x1, y1] = bbox(pts);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const rot = g.r(-.055, .055), sc = (1.02 + g.r(0, .035)) * extra;
  const p1 = g.r(0, 7), p2 = g.r(0, 7), p3 = g.r(0, 7);
  const f1 = g.i(2, 3), f2 = g.i(4, 6), f3 = g.i(2, 4);
  const co = Math.cos(rot), si = Math.sin(rot);
  return densify(pts, 56).map(([x, y]) => {
    const qx = (x - cx) * sc, qy = (y - cy) * sc;
    const px = cx + qx * co - qy * si, py = cy + qx * si + qy * co;
    let dx = px - cx, dy = py - cy;
    const d = Math.hypot(dx, dy) || 1;
    dx /= d; dy /= d;
    const bite = Math.max(0, Math.sin(Math.atan2(dy, dx) * f3 + p3)) ** 9;   // the fibre gave
    const a = Math.atan2(dy, dx);
    const off = k * (.55 * Math.sin(a * f1 + p1) + .18 * Math.sin(a * f2 + p2) - 2.4 * bite);
    return [px + dx * off, py + dy * off];
  });
}

// THE STRAIGHT CUT. Walk the ring, collect the runs on each side of a
// line and stitch in the crossings: a blob comes back as two polygons
// that share one dead-straight edge. The crossing vertices are TAGGED
// (a third element), because the fibre rim must not run along a cut —
// a cut edge shows no fibre, that is how you know it was scissors.
function splitRing(ring, ang, off) {
  const [x0, y0, x1, y1] = bbox(ring);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const nx = Math.cos(ang), ny = Math.sin(ang);
  const sd = p => (p[0] - cx) * nx + (p[1] - cy) * ny - off;
  const A = [], B = [], n = ring.length;
  for (let i = 0; i < n; i++) {
    const p = ring[i], q = ring[(i + 1) % n];
    const dp = sd(p), dq = sd(q);
    (dp >= 0 ? A : B).push([p[0], p[1]]);
    if ((dp >= 0) !== (dq >= 0)) {
      const t = dp / (dp - dq);
      const m = [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, 1];
      A.push(m); B.push([m[0], m[1], 1]);
    }
  }
  return [A, B];
}

const move = (pts, dx, dy) => pts.map(p => [p[0] + dx, p[1] + dy, p[2]]);

// shift a ring bodily about its centroid — the plate that slipped. Its
// own outline never changes, which is the whole point of a
// misregistration: it is the SAME impression, twice.
const shift = (pts, dx, dy, sc = 1) => {
  const [cx, cy] = centroid(pts);
  return pts.map(p => [cx + (p[0] - cx) * sc + dx, cy + (p[1] - cy) * sc + dy, p[2]]);
};

// inset by an ABSOLUTE distance, leaving tagged (cut) vertices alone,
// so the pale fibre rim appears only where the paper was torn
function insetPoly(poly, t) {
  const [cx, cy] = centroid(poly);
  return poly.map(p => {
    if (p[2]) return [p[0], p[1], 1];
    const dx = p[0] - cx, dy = p[1] - cy;
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.max(.25, 1 - t / d);
    return [cx + dx * k, cy + dy * k];
  });
}

// ---- the composition ---------------------------------------------
// PURE IN (`s`, `pts`), because `tone`, `skin` and `edge` all have to
// agree about it. It answers the only structural questions: how many
// pieces this scrap is in, where each one slid, how far its colour
// plate missed and how high off the board it is glued. Every DECISION
// comes off the plate; every MEASUREMENT comes off the shape, as a
// fraction of its own box, so the boil moves the cut by a pixel
// instead of dealing a new pair of scissors.
function plan(s, pts) {
  const g = plateDice(s, 3);
  const diag = diagOf(pts);
  const k = tearK(pts);
  // One scrap in eight is plainly too big for the hole it fills — the
  // dada joke of a part pasted at the wrong scale. Only the middling
  // parts (an ear, a muzzle, a foot), because a head pasted half again
  // as large stops being a character; and it RAMPS rather than
  // switching, so a shape near the threshold is barely oversize.
  const big = g.r(0, 1);
  const wrong = diag > 12 && diag < 62 ? 1 + 3 * Math.max(0, big - .86) : 1;
  const ring = scrap(pts, g, wrong);

  let polys = [ring];
  // No dice on whether to cut: a scrap big enough to cut IS cut. That
  // boolean was the single loudest thing that could flip between boil
  // frames, and the style does not need it — one uncut scrap in the
  // character is supplied for free by everything under 26px.
  if (diag > 26) {
    const cutA = g.r(0, 6.283);                       // the line's NORMAL
    // ±.15 of the diagonal, not ±.18: the sliver test below is a
    // threshold on a shape that BOILS, so the offset has to leave both
    // halves clear of it by more than the hem of a haircut swings.
    const [A, B] = splitRing(ring, cutA, g.r(-.15, .15) * diag);
    if (A.length > 4 && B.length > 4 && Math.min(diagOf(A), diagOf(B)) > diag * .26) {
      // slide ALONG the cut, and open a hairline of bare page across
      // it. Sliding along keeps the two straight edges collinear, which
      // is what makes the joint read as one piece of paper cut in two
      // rather than as two unrelated shapes; the small push across it
      // is the slit of page you see between them.
      const m = Math.max(5, Math.min(20, diag * g.r(.09, .16)));
      const gap = k * g.r(.3, 1.2);
      let vx = -Math.sin(cutA) * m - Math.cos(cutA) * gap;
      let vy = Math.cos(cutA) * m - Math.sin(cutA) * gap;
      // ALWAYS SIDEWAYS OR UP. The one direction a scrap may not slide
      // is down, because down is where the face is: a fringe slid onto
      // the eyes takes the character's whole read with it, and at 90px
      // that is a white blob with a diagonal on it. Flipping the sign
      // costs nothing — the joint is just as out of joint either way.
      if (vy > 0) { vx = -vx; vy = -vy; }
      polys = [A, move(B, vx, vy)];
    }
  }

  // A piece here and there slips three times as far as the rest: 1-2px
  // reads as chromatic aberration, 5-7px reads as a press out of
  // register, and only the second one is a fact about printing. Cubed,
  // so most pieces are quiet and the occasional one is not.
  return polys.map((poly, i) => {
    const gp = plateDice(s, 300 + i * 37);
    const t = gp.r(0, 1);
    const base = Math.max(1.5, diag * .021) * (.7 + 3.4 * t * t * t);
    const a = gp.r(0, 6.283);
    return {
      poly,
      k,
      moved: i > 0,
      reg: [Math.cos(a) * base, Math.sin(a) * base],
      regInk: gp.c(.28) ? BLUE : RED,
      // not every scrap is glued at the same height off the board
      lift: k * gp.r(.35, 1.5) * (i > 0 ? 1.9 : 1),
    };
  });
}

// ---- the press ---------------------------------------------------
// The screen. `d` is the part's density and here it is a dot RADIUS:
// at d=1 the dots merge into solid ink, at d=.34 they are pinpricks
// and the paper carries the tone. The gradient across the grid gives
// the scrap the modelling a photograph would have had — a flat screen
// reads as a swatch, not as a picture, and at `gk` near 1 the screen
// builds a light AND a dark instead of one even grey.
//
// THE SCREEN BELONGS TO THE PRESS, NOT TO THE OBJECT, and that is both
// the correct model and the last flicker in the file. A ruling is a
// physical mesh in a camera: one page is screened at one pitch, and
// every shape on it gets whatever the mesh gives. Sized off each
// SHAPE, the pitch shifted a little every time the shape boiled, and
// since the grid was anchored on the shape's centre too, every dot
// slid — measured, that was HALF of everything left moving on this
// style (skull .066 with the dots, .031 without, against graphite's
// .030). So the pitch comes off the PLATE, which cannot move, and the
// lattice is laid out in the plate's own frame and merely CLIPPED by
// the shape. What still follows the shape is the gradient, which is
// smooth and may drift a pixel unseen.
const plateSpan = s => Math.hypot(s.w, s.h) * .62;
function halftone(s, ring, ink, d, o = {}) {
  const c = s.ctx;
  const [x0, y0, x1, y1] = bbox(ring);
  const w = x1 - x0, h = y1 - y0;
  const diag = Math.hypot(w, h);
  if (diag < 4) return;
  // The budget is the cost rule: a screen is thousands of marks if you
  // let it be, so the pitch opens up rather than the count. (The
  // BACKDROP is drawn once per character and may raise it.)
  const P = o.plate ?? plateSpan(s);
  let pitch = Math.min(o.maxPitch ?? 7.6, Math.max(2.6, P * (o.fine ?? .058)));
  const budget = o.budget ?? 760;
  const est = (P * P * .5) / (pitch * pitch);
  if (est > budget) pitch *= Math.sqrt(est / budget);
  const gx = Math.cos(o.grad ?? 0), gy = Math.sin(o.grad ?? 0);
  const gk = o.gk ?? .42;
  // A dot must not KISS its neighbour at mid tone or the screen stops
  // reading as dots and starts reading as a woven check — which is
  // what the first version did to every face in the sheet, and what a
  // coarse screen went back to doing the moment the pitch came off the
  // plate and stopped shrinking with the shape. At .55 of the pitch a
  // mid grey is separate dots and a black still merges.
  const rmax = pitch * (o.dot ?? .62);
  const ang = o.ang ?? .8, dx = o.dx ?? 0, dy = o.dy ?? 0;
  // the shape's box, in the SCREEN's own frame — only to know which
  // part of the mesh to walk
  const co = Math.cos(ang), si = Math.sin(ang);
  let u0 = 1e9, v0 = 1e9, u1 = -1e9, v1 = -1e9;
  for (const [px, py] of [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]) {
    const qx = px - dx, qy = py - dy;
    const u = qx * co + qy * si, v = -qx * si + qy * co;
    if (u < u0) u0 = u; if (u > u1) u1 = u;
    if (v < v0) v0 = v; if (v > v1) v1 = v;
  }
  const uc = (u0 + u1) / 2, vc = (v0 + v1) / 2, R = diag * .62;
  const us = Math.floor(u0 / pitch) * pitch, vs = Math.floor(v0 / pitch) * pitch;
  c.save();
  s.poly(ring, true); c.clip();
  c.translate(dx, dy);
  c.rotate(ang);
  c.beginPath();
  for (let u = us; u <= u1 + pitch; u += pitch) {
    for (let v = vs; v <= v1 + pitch; v += pitch) {
      const g = (gx * (u - uc) + gy * (v - vc)) / R;   // -1..1 across the scrap
      const t = Math.max(0, Math.min(1, d * (1 - gk * .5 + gk * g)));
      if (t < .04) continue;
      // the ONE thing here that may boil: how fat the ink went down
      const r = rmax * Math.sqrt(t) * s.jr(.86, 1.12);
      if (r < .3) continue;
      c.moveTo(u + r, v);
      c.arc(u, v, r, 0, Math.PI * 2);
    }
  }
  c.fillStyle = rgb(ink, o.alpha ?? .96);
  c.fill();
  c.restore();
}

// A COLUMN OF TYPE as a MATERIAL — the whole piece is a scrap of set
// text, ruled at whatever angle the scissors happened to leave. It is
// illegible and that is the point: it is the texture that says
// newspaper and nothing else, and it is the one material on the
// newsstand that is neither a screen nor a flat.
function typeField(s, ring, g, ink, alpha = .8) {
  const c = s.ctx;
  const [x0, y0, x1, y1] = bbox(ring);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const diag = Math.hypot(x1 - x0, y1 - y0);
  const lh = Math.max(2.2, diag / g.i(7, 13));
  c.save();
  s.poly(ring, true); c.clip();
  c.translate(cx, cy);
  c.rotate(g.r(-.5, .5) + (g.c(.3) ? Math.PI / 2 : 0));
  c.fillStyle = rgb(ink, alpha);
  const R = diag * .62;
  const colW = R * g.r(.7, 1.25);
  const gg = dice(plateKey(s, 7));
  for (let y = -R; y < R; y += lh) {
    for (let x = -R; x < R; x += colW) {
      const ind = gg.c(.2) ? colW * .2 : 0;
      const wRun = (colW * .82 - ind) * gg.r(.5, 1);
      c.fillRect(x + ind, y, wRun, Math.max(.9, lh * .34));
    }
  }
  c.restore();
}

// ---- the newsstand's materials -----------------------------------
// Höch's method is heterogeneous fragments at mismatched scales, so
// every piece of every scrap is dealt its own stock. Homogeneity is
// the one thing collage cannot be — the version that screened
// everything at one pitch read as a photocopier filter.
function material(s, face, mat, ink, d, g, gkMax = 9) {
  const diag = diagOf(face);
  const GK = k => Math.min(k, gkMax);
  if (mat === 'kraft') return;                          // bare stock: the knockout
  if (mat === 'flat') {
    s.poly(face, true); s.ctx.fillStyle = rgb(ink, .96); s.ctx.fill();
    return;
  }
  if (mat === 'column') { typeField(s, face, g, ink, .78); return; }
  if (mat === 'coarse') {
    halftone(s, face, ink, d, { grad: g.r(0, 6.3), ang: g.r(.2, 1.3), gk: GK(g.r(.5, .9)), fine: .085, dot: .55 });
    return;
  }
  if (mat === 'fine') {
    halftone(s, face, ink, d * .92, { grad: g.r(0, 6.3), ang: g.r(.2, 1.3), gk: GK(g.r(.4, .8)), fine: .026, dot: .55 });
    return;
  }
  // photographic: a hard gradient, so the piece has a lit side and a
  // dark one and the dots are doing a photograph's job. On a FACE the
  // gradient is capped, because a hard one plus the cut's knockout
  // left three quarters of the head as bare paper and the style
  // stopped happening to it at all.
  halftone(s, face, ink, Math.min(1, d * 1.15), {
    grad: g.r(0, 6.3), ang: g.r(.2, 1.3), gk: GK(g.r(.95, 1.25)), fine: .045, dot: .55,
  });
  if (diag > 40) halftone(s, face, ink, d * .5, {
    grad: g.r(0, 6.3), ang: g.r(.2, 1.3), gk: .5, fine: .022, dot: .5, alpha: .5,
  });
}

// The scrap itself: the shadow it casts, the plate that missed, the
// pale fibre of the tear, the paper. Four fills, in the order a real
// one is built up in — and the paper is inset only off the TORN edges.
function paste(s, piece, paper) {
  const c = s.ctx;
  const poly = piece.poly;
  const diag = diagOf(poly);

  // it has lifted off the board — and not every scrap sits at the same
  // height, which is what turns a flat filter into a stack of paper
  s.poly(move(poly, piece.lift * 1.1, piece.lift * 1.35), true);
  c.fillStyle = rgb(BLACK, piece.moved ? .3 : .22); c.fill();

  // OFF-REGISTER: a raw fringe on one side of every printed thing
  if (diag > 12) {
    s.poly(shift(poly, piece.reg[0], piece.reg[1], 1.004), true);
    c.fillStyle = rgb(piece.regInk, .72); c.fill();
  }

  // the tear shows the fibre: a pale rim, uneven because a tear is
  s.poly(poly, true);
  c.fillStyle = rgb(tint(paper, .8), .96); c.fill();

  // ...and the paper, inset off the fibre
  const face = insetPoly(poly, Math.min(piece.k * 1.4, diag * .1));
  s.poly(face, true);
  c.fillStyle = rgb(paper); c.fill();
  return face;
}

// A SECOND SCRAP across the first at a wrong angle — clipped to the
// piece, so it can never eat the silhouette. It is an ALTERNATIVE to
// the type, never an addition: two found objects on one piece is where
// the confetti starts.
function strip(s, ring, g, diag, ink) {
  const c = s.ctx;
  const [x0, y0, x1, y1] = bbox(ring);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const a = g.r(-1.2, 1.2);
  const th = diag * g.r(.07, .16), L = diag * .9;
  const dx = Math.cos(a), dy = Math.sin(a), px = -dy, py = dx;
  const quad = [], n = 9;
  const side = sg => {
    for (let i = 0; i <= n; i++) {
      const j = sg > 0 ? i : n - i;
      const t = (j / n - .5) * 2 * L;
      const e = th * (1 + .28 * Math.sin(j * 2.1 + (sg > 0 ? 1.7 : 4.2)));  // torn long edges
      quad.push([cx + dx * t + px * e * sg, cy + dy * t + py * e * sg]);
    }
  };
  side(1); side(-1);
  c.save();
  s.poly(ring, true); c.clip();
  s.poly(move(quad, diag * .02, diag * .025), true);
  c.fillStyle = rgb(BLACK, .2); c.fill();               // it is lifted too
  s.poly(quad, true);
  c.fillStyle = rgb(ink, .95); c.fill();
  c.restore();
}

// ---- the found type ----------------------------------------------
// One intervention, clipped to the piece it is printed on — but placed
// so it CROPS on that piece's edge, because a letterform snipped
// through by the scissors is the thing that says the paste-up came out
// of a newspaper and not out of a font menu. Everything is sized off
// the piece, so a numeral on an ear is an ear-sized numeral and the
// sheet never fills up with gravel.
function typeMark(s, ring, g, ink, diag) {
  const c = s.ctx;
  const [x0, y0, x1, y1] = bbox(ring);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const which = g.w([['glyph', 38], ['word', 26], ['stamp', 16], ['column', 20]]);
  c.save();
  s.poly(ring, true); c.clip();

  if (which === 'glyph' || which === 'word') {
    // a letterform in the wrong size and at the wrong angle. Pushed
    // out to the piece's edge on purpose: half a letter is a found
    // object, a whole centred one is a logo.
    c.translate(cx + g.r(-.42, .42) * (x1 - x0), cy + g.r(-.42, .42) * (y1 - y0));
    c.rotate(g.r(-.7, .7) + (g.c(.16) ? Math.PI / 2 : 0));
    const px = diag * (which === 'word' ? g.r(.26, .4) : g.r(.5, .85));
    c.font = font(g.pick(FONTS), px);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = rgb(g.c(.26) ? RED : ink, g.r(.9, 1));
    let str = g.pick(GLYPHS.split(''));
    if (which === 'word') { const n = g.i(2, 4); for (let i = 1; i < n; i++) str += g.pick(GLYPHS.split('')); }
    c.fillText(str, 0, 0);
  } else if (which === 'stamp') {
    // a rubber stamp: a ring, a second ring and a letter inside it,
    // never quite level and never quite fully inked
    const r = diag * g.r(.22, .38);
    c.translate(cx + g.r(-.34, .34) * (x1 - x0), cy + g.r(-.34, .34) * (y1 - y0));
    c.rotate(g.r(-.5, .5));
    c.strokeStyle = rgb(RED, .8); c.lineWidth = Math.max(1, r * .1);
    c.beginPath(); c.arc(0, 0, r, g.r(0, .5), Math.PI * 2 - g.r(0, .5)); c.stroke();
    c.beginPath(); c.arc(0, 0, r * .78, 0, Math.PI * 2); c.stroke();
    c.font = font(FONTS[0], r * .9);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = rgb(RED, .88);
    c.fillText(g.pick('ABDKMRZ0123456789'.split('')), 0, 0);
  } else {
    // a ruled column snipped out of a page, pasted on white stock
    const w = diag * g.r(.32, .55), h = diag * g.r(.35, .62);
    c.translate(cx + g.r(-.34, .34) * (x1 - x0), cy + g.r(-.3, .3) * (y1 - y0));
    c.rotate(g.r(-.35, .35) + (g.c(.25) ? Math.PI / 2 : 0));
    c.fillStyle = rgb(tint(CREAM, .3), .94);
    c.fillRect(-w / 2, -h / 2, w, h);
    const lh = Math.max(2, h / g.i(5, 9));
    c.fillStyle = rgb(BLACK, .76);
    for (let y = -h / 2 + lh * .8; y < h / 2 - lh * .3; y += lh) {
      const ind = g.c(.22) ? w * .18 : 0;               // paragraph breaks
      c.fillRect(-w / 2 + w * .08 + ind, y, (w * .84 - ind) * g.r(.62, 1), Math.max(.9, lh * .32));
    }
  }
  c.restore();
}

// ---- the foreign object ------------------------------------------
// NOT clipped, and that is the entire point: a collage has something
// in it that came from somewhere else and it hangs off the edge. It is
// centred on a point of the scrap's own outline, so about half of it
// lands on bare page. Dealt to roughly one part in nine, which comes
// out at about one per character.
// It is sized off the shape's SHORT side and not its diagonal: a
// ground line is fourteen hundred pixels long and twenty deep, and a
// scrap pasted at half its diagonal covered the entire row.
function foreign(s, poly, g, span) {
  const c = s.ctx;
  const p = poly[Math.min(poly.length - 1, (g.r(0, 1) * poly.length) | 0)];
  const w = span * g.r(.45, .8), h = span * g.r(.26, .46);
  const a = g.r(-1.1, 1.1);
  const stock = g.w([[CREAM, 40], [NICOTINE, 30], [RED, 18], [BLACK, 12]]);
  const dark = lum(stock) < .45;
  // torn along all four sides — a rectangle with a bitten outline
  const quad = [];
  const N = 7, ph = g.r(0, 7);
  const edgePt = (u, v) => {
    const jx = (Math.sin(u * 5.1 + v * 2.7 + ph) * .5 + .5);
    return [u * w / 2 * (1 + .06 * jx), v * h / 2 * (1 + .1 * jx)];
  };
  for (let i = 0; i <= N; i++) quad.push(edgePt(-1 + 2 * i / N, -1));
  for (let i = 1; i <= N; i++) quad.push(edgePt(1, -1 + 2 * i / N));
  for (let i = 1; i <= N; i++) quad.push(edgePt(1 - 2 * i / N, 1));
  for (let i = 1; i < N; i++) quad.push(edgePt(-1, 1 - 2 * i / N));
  c.save();
  c.translate(p[0], p[1]);
  c.rotate(a);
  s.poly(move(quad, h * .12, h * .16), true);
  c.fillStyle = rgb(BLACK, .22); c.fill();
  s.poly(shift(quad, -h * .09, -h * .05, 1.01), true);
  c.fillStyle = rgb(g.c(.3) ? BLUE : RED, .6); c.fill();
  s.poly(quad, true);
  c.fillStyle = rgb(stock); c.fill();
  // and something printed on it: ledger rules, or one big numeral
  c.save();
  s.poly(quad, true); c.clip();
  const ink = dark ? tint(stock, .8) : BLACK;
  if (g.c(.5)) {
    const lh = Math.max(2, h / g.i(4, 7));
    c.fillStyle = rgb(ink, .78);
    for (let y = -h / 2 + lh; y < h / 2 - lh * .3; y += lh) c.fillRect(-w / 2 + w * .08, y, w * .84 * g.r(.5, 1), Math.max(.9, lh * .3));
  } else {
    c.font = font(g.pick(FONTS), h * g.r(.9, 1.35));
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = rgb(ink, .92);
    c.fillText(g.pick(GLYPHS.split('')) + g.pick(GLYPHS.split('')), g.r(-.2, .2) * w, 0);
  }
  c.restore();
  c.restore();
}

// ---- the head nobody coloured ------------------------------------
// The rig only reaches `skin` when the character HAS a skin colour
// (`skull.js`: `else if (F.colors.skin)`), so a white cat came back as
// bare paper with a contour drawn round it — one character in six with
// no collage on its face at all, and it was the weakest cell in the
// row every round. The contour is the one hook that fires on EVERY
// shape, so that is where a bare head gets screened.
//
// Two shapes, because the outline a skull hands over is OPEN at the
// crown — the same fact gothic's `temperaFace` records. They take one
// screen between them and it does not seam, because the lattice is
// anchored to the plate now and not to either shape.
function clipUnion(c, shapes) {
  c.beginPath();
  for (const pts of shapes) {
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.closePath();
  }
  c.clip();
}
function bareFace(s, pts, g) {
  const c = s.ctx;
  const closed = pts.concat([pts[0]]);
  const [x0, y0, x1, y1] = bbox(closed);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const rx = (x1 - x0) * .46, ry = (y1 - y0) * .46, L = Math.hypot(x1 - x0, y1 - y0);
  const cap = [];
  for (let i = 0; i < 40; i++) { const a = i / 40 * 6.2832; cap.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  const shapes = [closed, cap];
  // FRESH stock, not pulp: the page behind the figure is already grey,
  // and a head printed on the same grey sinks into it. The lightest
  // thing in the cell has to be the face.
  const paper = tint(g.c(.3) ? NICOTINE : CREAM, .28);
  for (const sh of shapes) { s.poly(sh, true); c.fillStyle = rgb(paper, .96); c.fill(); }
  // LIGHT, and with the gradient run right out. The first version
  // screened a bare head at the density a coloured one gets and every
  // white character came back as a woven check with two eyes on it —
  // the exact failure the press note above describes. A head that
  // asked for no colour is a PALE photograph: half of it should be
  // fading into the paper.
  const opt = { grad: g.r(0, 6.3), ang: g.r(.2, 1.3), gk: 1.05, fine: g.pick([.022, .032, .05]), dot: .55 };
  for (const sh of shapes) halftone(s, sh, BLACK, g.r(.3, .44), opt);
  // and the scissors went through it too: beyond the cut the stock is
  // fresh, which is the knockout the eyes get read against
  const a = g.r(0, 6.283), nx = Math.cos(a), ny = Math.sin(a), px = -ny, py = nx;
  const bx = cx + nx * g.r(-.16, .16) * L, by = cy + ny * g.r(-.16, .16) * L;
  c.save(); clipUnion(c, shapes);
  s.poly([[bx + px * L, by + py * L], [bx - px * L, by - py * L],
    [bx - px * L + nx * L, by - py * L + ny * L], [bx + px * L + nx * L, by + py * L + ny * L]], true);
  c.fillStyle = rgb(CREAM, .96); c.fill();
  c.restore();
  if (L > 60 && g.c(.45)) typeMark(s, closed, g, BLACK, L * .55);
}

// ---- the pasted page ---------------------------------------------
// Höch's grounds are as busy as her figures: the figure in 'Cut with
// the Kitchen Knife' is not standing anywhere, it is pasted onto a
// page that already had a machine, a crowd and a headline on it. Until
// this hook existed the style's figure stood on nothing, and the whole
// argument had to be carried by the character's own surface.
//
// It is drawn ONCE per character, so it may roll as much as it likes —
// this is the one place in the file where `s.jr` is not a flicker.
//
// The composition rule is the same one that keeps the character off
// confetti: the LOUD things go to the sides, the top and the floor,
// and the middle of the page — where the head is — carries grain, the
// odd rule and whatever crops into it. A collage may cross the figure;
// it may not replace it.
const tornRect = (s, w, h, rough = .05, n = 10) => {
  const k = Math.min(w, h) * rough, ph = s.jr(0, 7);
  const nz = t => Math.sin(t * 3.1 + ph) * .5 + Math.sin(t * 7.7 + ph * 2.3) * .3 + Math.sin(t * 17.3 + ph * .7) * .2;
  const pts = [], x = w / 2, y = h / 2;
  const side = (ax, ay, bx, by, nx, ny, t0) => {
    for (let i = 0; i < n; i++) {
      const t = i / n, d = k * nz(t0 + t * 2);
      pts.push([ax + (bx - ax) * t + nx * d, ay + (by - ay) * t + ny * d]);
    }
  };
  side(-x, -y, x, -y, 0, -1, 0);
  side(x, -y, x, y, 1, 0, 2);
  side(x, y, -x, y, 0, 1, 4);
  side(-x, y, -x, -y, -1, 0, 6);
  return pts;
};

// a block of set text: rules, columns, indents and the occasional
// headline slug. The whole newspaper vocabulary in nine lines.
function ruled(s, x0, y0, w, h, cols, lh, ink, alpha) {
  const c = s.ctx;
  const cw = w / cols;
  for (let k = 0; k < cols; k++) {
    for (let y = y0; y < y0 + h - lh * .4; y += lh) {
      if (s.chance(.06)) continue;                      // a break in the setting
      const ind = s.chance(.18) ? cw * .16 : 0;
      c.fillStyle = rgb(ink, alpha * s.jr(.75, 1));
      c.fillRect(x0 + k * cw + cw * .05 + ind, y, (cw * .84 - ind) * s.jr(.55, 1), Math.max(.8, lh * .3));
    }
  }
}

function pastedPhoto(s, x, y, w, h, a) {
  const c = s.ctx;
  c.save();
  c.translate(x, y); c.rotate(a);
  const q = tornRect(s, w, h, .045, 9);
  s.poly(move(q, w * .022, h * .03), true); c.fillStyle = rgb(BLACK, .24); c.fill();
  s.poly(shift(q, -w * .012, -h * .01, 1.01), true);
  c.fillStyle = rgb(s.chance(.7) ? RED : BLUE, .55); c.fill();     // the plate that slipped
  s.poly(q, true); c.fillStyle = rgb(tint(CREAM, .35)); c.fill();
  halftone(s, q, BLACK, s.jr(.62, .92), {
    grad: s.jr(0, 6.3), ang: s.jr(.2, 1.3), gk: s.jr(.9, 1.25),
    plate: Math.hypot(w, h), fine: .06, dot: .6, budget: 2600, maxPitch: 7,
  });
  c.restore();
}

// ---- the head of the interface -----------------------------------
export default {
  id: 'dadaism', label: 'dada', era: 1918, underdraw: true,

  // The row is printed on YELLOWING NEWSPRINT, not on drawai's cream:
  // a knockout only reads as a knockout if the paper around it is
  // already off-white. And warm rather than grey on purpose — the
  // grey-buff end of this palette belongs to the CUBIST canvas two
  // rows up the sheet, and two rows that squint the same colour are
  // one row.
  ground: [231, 218, 183],

  // THE CHARACTER'S BLACK IS PRINTING BLACK. Not lamp black: a rotary
  // press lays down an oily near-black that goes warm-grey where the
  // paper drank it, and the void eyes, the contours and the nostrils
  // are all the same ink as the type pasted next to them. One line,
  // and the whole face joins the newsstand.
  ink: BLACK,

  // A pasted page is bigger than the figure on it and runs off every
  // side. Wider and taller than the default cell so the collage crops
  // rather than fits.
  panel: { w: 1.02, h: 1.24, y: .5 },

  backdrop(s, { w, h, floor }) {
    const c = s.ctx;
    const SW = w * .93, SH = h * .95;
    const fy = floor - h / 2;                    // the feet, in sheet coordinates
    const side = s.chance(.5) ? 1 : -1;          // which side the type column took

    c.save();
    c.translate(w / 2, h / 2);
    c.rotate(s.jr(-.05, .05));

    const sheet = tornRect(s, SW, SH, .05, 20);
    s.poly(move(sheet, SW * .014, SH * .016), true);
    c.fillStyle = rgb(BLACK, .2); c.fill();
    // more nicotine than pulp, on purpose: the grey-buff end of this
    // palette is the CUBIST row's ground two lines up the sheet, and
    // two rows that squint the same colour are one row.
    const stock = s.weighted([[NEWS, 38], [CREAM, 24], [NICOTINE, 38]]);
    s.poly(sheet, true); c.fillStyle = rgb(tint(stock, .12)); c.fill();

    c.save(); s.poly(sheet, true); c.clip();

    // 1. THE GRAIN. Newsprint is a screen before it is anything else.
    const pitch = Math.max(2.6, SW * .018);
    c.beginPath();
    for (let x = -SW / 2; x < SW / 2; x += pitch)
      for (let y = -SH / 2; y < SH / 2; y += pitch) {
        const r = pitch * .3 * s.jr(.5, 1.25);
        c.moveTo(x + r, y); c.arc(x, y, r, 0, Math.PI * 2);
      }
    c.fillStyle = rgb(BLACK, .09); c.fill();

    // THE FOUR CORNERS, SHUFFLED. A fixed slot per kind of paste gave
    // six pages in a row with the identical layout on them, which is a
    // template and not a paste-up. Deal the corners instead.
    const zn = [[-.32, -.3], [.32, -.28], [-.36, .1], [.36, .12]];
    for (let i = zn.length - 1; i > 0; i--) { const j = s.ri(0, i); const t = zn[i]; zn[i] = zn[j]; zn[j] = t; }
    const Z = i => [zn[i][0] * SW, zn[i][1] * SH];

    // 2. THE COLUMN. Two columns of set text down one edge, under a
    //    headline slug — the thing that says NEWSPAPER at any size. It
    //    keeps the edge (a column of type is a column) but it is as
    //    likely to have been pasted on its side as the right way up.
    {
      const turned = s.chance(.3);
      const bw = SW * (turned ? .42 : .3);
      const bh = (turned ? SW : SH) * s.jr(.55, .8);
      c.save();
      c.translate(side * SW * s.jr(.34, .42), turned ? -SH * s.jr(.1, .3) : -SH * .06);
      c.rotate(turned ? Math.PI / 2 * (s.chance(.5) ? 1 : -1) + s.jr(-.1, .1) : s.jr(-.05, .05));
      const bx = -bw / 2, by = -bh / 2;
      c.fillStyle = rgb(BLACK, .86);
      c.fillRect(bx, by, bw * s.jr(.7, 1), Math.max(2, SH * .02));        // the slug
      c.fillRect(bx, by + SH * .038, bw, Math.max(1, SH * .004));         // the rule under it
      ruled(s, bx, by + SH * .062, bw, bh * .46, 2, Math.max(2.2, SH * .019), BLACK, .74);
      c.fillStyle = rgb(BLACK, .8);
      c.fillRect(bx, by + bh * .54, bw * s.jr(.5, .9), Math.max(2, SH * .015));
      ruled(s, bx, by + bh * .6, bw, bh * .38, 2, Math.max(2.2, SH * .019), BLACK, .7);
      c.restore();
    }

    // 3. THE TORN PHOTOGRAPH — a screened fragment of somebody else's
    //    picture, its own red plate off. It is the one thing on the
    //    page with a LIGHT SIDE, which is why it reads as a photograph.
    {
      const [px, py] = Z(0);
      pastedPhoto(s, px, py, SW * s.jr(.36, .5), SH * s.jr(.19, .28), s.jr(-.32, .32));
      if (s.chance(.55)) {
        const [qx, qy] = Z(3);
        pastedPhoto(s, qx, qy, SW * s.jr(.18, .28), SH * s.jr(.1, .17), s.jr(-.5, .5));
      }
    }

    // 4. THE NUMBER, set far too large and at the wrong angle, and
    //    RUNNING OFF THE PAGE — a date, a price, a page number, cropped
    //    by whatever the scissors took it out of. Set inside the sheet
    //    it is a logo; hung half over the edge it is a found object.
    {
      const str = s.pick(['1918', '18', 'DADA', 'MERZ', '7', '46', 'OR', 'NEIN', '1920', '§', '32']);
      const [nx, ny] = Z(1);
      c.save();
      c.translate(Math.sign(nx) * SW * s.jr(.4, .5), ny * s.jr(.6, 1.2));
      c.rotate(s.jr(-.6, .6));
      c.font = font(s.pick(FONTS), SH * s.jr(.32, .5));
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = rgb(s.chance(.26) ? RED : BLACK, s.jr(.82, .95));
      c.fillText(str, 0, 0);
      c.restore();
    }

    // 4b. A SOLID BLOCK — a fragment where the screen went all the way
    //     to black, or a swatch of flat colour. Nothing on the page is
    //     darker, so it is what the row has to lose at squint distance.
    if (s.chance(.5)) {
      const [bx, by] = Z(2);
      c.save();
      c.translate(bx * s.jr(.8, 1.15), by * s.jr(.7, 1.3));
      c.rotate(s.jr(-.45, .45));
      const q = tornRect(s, SW * s.jr(.2, .34), SH * s.jr(.11, .2), .1, 10);
      s.poly(move(q, SW * .01, SH * .012), true); c.fillStyle = rgb(BLACK, .22); c.fill();
      s.poly(q, true);
      c.fillStyle = rgb(s.weighted([[BLACK, 56], [RED, 30], [NICOTINE, 14]]), .93); c.fill();
      c.restore();
    }

    // 5. THE RED BAR. One raw red, torn, and it is the only thing on
    //    the page that is a colour rather than a value.
    {
      c.save();
      if (s.chance(.42)) {                     // a band up one edge
        c.translate(side * SW * s.jr(.3, .46), SH * s.jr(-.06, .06));
        c.rotate(s.jr(-.16, .16));
        s.poly(tornRect(s, SW * s.jr(.05, .09), SH * 1.05, .09, 12), true);
      } else {                                 // or a slash across the bottom
        c.translate(SW * s.jr(-.1, .1), fy - SH * s.jr(.02, .14));
        c.rotate(s.jr(-.28, .28));
        s.poly(tornRect(s, SW * 1.2, SH * s.jr(.045, .08), .18, 12), true);
      }
      c.fillStyle = rgb(RED, .9); c.fill();
      c.restore();
    }

    // 6. THE STAMP: a date ring, banged on crooked and short of ink.
    {
      const r = SH * s.jr(.05, .075);
      c.save();
      c.translate(side * SW * s.jr(.22, .36), fy - SH * s.jr(.02, .14));
      c.rotate(s.jr(-.6, .6));
      c.strokeStyle = rgb(RED, .78); c.lineWidth = Math.max(1, r * .12);
      c.beginPath(); c.arc(0, 0, r, s.jr(0, .6), Math.PI * 2 - s.jr(0, .6)); c.stroke();
      c.beginPath(); c.arc(0, 0, r * .74, 0, Math.PI * 2); c.stroke();
      c.font = font(FONTS[2], r * .8);
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = rgb(RED, .82);
      c.fillText(s.pick(['18', '20', 'A', 'K', 'Z', '9']), 0, 0);
      c.restore();
    }

    // 7. A RULE ruled clean across everything, the way a cut line is —
    //    the one straight edge on a page made entirely of tears.
    for (let i = 0, n = s.ri(0, 2); i < n; i++) {
      c.save();
      c.translate(SW * s.jr(-.2, .2), SH * s.jr(-.4, .4));
      c.rotate(s.jr(-1.4, 1.4));
      c.fillStyle = rgb(BLACK, s.jr(.5, .8));
      c.fillRect(-SW * .8, 0, SW * 1.6, Math.max(.9, SH * s.jr(.003, .008)));
      c.restore();
    }

    // 8. THE FLOOR is a pasted strip, not a horizon: the figure stands
    //    on a torn band of darker stock, and its shadow is a smear of
    //    ink under the feet. A collage does not have a ground plane —
    //    it has another piece of paper.
    {
      c.save();
      c.translate(0, fy + SH * .012);
      c.rotate(s.jr(-.02, .02));
      s.poly(tornRect(s, SW * 1.12, SH * s.jr(.05, .085), .22, 14), true);
      c.fillStyle = rgb(s.chance(.5) ? NICOTINE : shade(NEWS, .45), .9); c.fill();
      c.restore();
      s.poly(tornRect(s, SW * .42, SH * .022, .5, 12).map(p => [p[0], p[1] + fy + SH * .005]), true);
      c.fillStyle = rgb(BLACK, .3); c.fill();
    }

    // 9. A COUPLE OF SNIPPETS, pasted at random over the lot — the
    //    scraps that were left on the table.
    for (let i = 0, n = s.ri(2, 4); i < n; i++) {
      const sw = SW * s.jr(.07, .16), sh = SH * s.jr(.03, .08);
      c.save();
      c.translate(SW * s.jr(-.46, .46), SH * s.jr(-.46, .46));
      c.rotate(s.jr(-1.2, 1.2));
      const q = tornRect(s, sw, sh, .12, 8);
      s.poly(move(q, sw * .05, sh * .1), true); c.fillStyle = rgb(BLACK, .2); c.fill();
      const st = s.weighted([[CREAM, 44], [NICOTINE, 26], [BLACK, 16], [RED, 14]]);
      s.poly(q, true); c.fillStyle = rgb(st); c.fill();
      c.save(); s.poly(q, true); c.clip();
      const ink = lum(st) < .45 ? tint(st, .82) : BLACK;
      if (s.chance(.5)) ruled(s, -sw / 2, -sh / 2 + sh * .16, sw, sh * .7, 1, Math.max(1.6, sh * .26), ink, .8);
      else {
        c.font = font(s.pick(FONTS), sh * s.jr(.9, 1.3));
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillStyle = rgb(ink, .9);
        c.fillText(s.pick(GLYPHS.split('')) + s.pick(GLYPHS.split('')), 0, 0);
      }
      c.restore();
      c.restore();
    }

    c.restore();      // the sheet clip
    c.restore();      // the page tilt
  },

  tone(s, pts, o = {}) {
    D(s).painted = true;
    const d = dens(o.style);
    const g = plateDice(s, 17);
    const diag = diagOf(pts);
    // The character asks for a hair colour and the newsstand answers
    // with one of its four inks: a lilac gets the black, a rust the
    // red. With no colour asked for it is ALWAYS black — a value ramp
    // here (the first version had one) printed the faint masses in
    // cream on cream and lost them completely.
    const ink = o.col ? nearest(o.col, INKS) : BLACK;
    // A true black void — an eye socket — is a solid patch of ink and
    // never a screen: a halftoned eye at 20px is grey mush, and the
    // black void eye IS this project's face.
    const void_ = d > .92 && !o.col;
    const pieces = plan(s, pts);

    pieces.forEach((piece, i) => {
      const gp = plateDice(s, 60 + i * 29);
      const paper = void_ ? BLACK : gp.w(PAPERS);
      const face = paste(s, piece, paper);
      const pd = diagOf(face);
      if (void_) {
        s.poly(face, true); s.ctx.fillStyle = rgb(ink, .97); s.ctx.fill();
        return;
      }
      // Two or three distinct densities per character, and the pieces
      // of one scrap never take the same stock: that mismatch across a
      // straight edge is the whole read.
      const dp = Math.max(.16, Math.min(1, d * (i ? gp.r(.45, .8) : gp.r(1, 1.35))));
      const mat = gp.w(i
        ? [['coarse', 22], ['fine', 22], ['flat', 16], ['kraft', 22], ['column', 18]]
        : [['coarse', 24], ['fine', 16], ['photo', 16], ['flat', 20], ['kraft', 8], ['column', 16]]);
      material(s, face, mat, ink, dp, g);
      // ONE found object per piece, or none — never two. How dark the
      // piece came out decides whether the mark is printed in ink or
      // reversed out of it, so type stays legible on black and on cream.
      if (pd > 18) {
        const heavy = mat === 'flat' ? lum(ink) < .45 : lum(paper) * (1 - dp * .55) < .3;
        const fg = heavy ? tint(paper, .62) : BLACK;
        const mv = gp.w([['none', 22], ['type', 54], ['strip', 24]]);
        if (mv === 'type') typeMark(s, face, g, fg, pd);
        else if (mv === 'strip') strip(s, face, g, pd, gp.w([[fg, 58], [RED, 42]]));
      }
    });
    const span = spanOf(pts);
    if (span > 22 && diag > 34 && g.c(.13)) foreign(s, pieces[0].poly, g, span);
  },

  skin(s, pts, col, o = {}) {
    // The FACE is the photographic scrap — the one thing in a Höch
    // that really was cut out of a magazine. The stock is the same for
    // every face on the newsstand: a photograph is not printed on
    // browner paper for a darker sitter, it is printed with MORE INK.
    // So the skin colour becomes screen density and the paper stays
    // pale, which is also what keeps the void eyes and the mouth
    // readable on top of it.
    //
    // AND THE FACE IS NEVER SCREENED ALL OVER AT ONE DENSITY. That is
    // what turned the heads into even grey blobs the eyes had to fight
    // through: a halftone is a VALUE tool, so one piece of the face is
    // pushed dark and the other is left as bare stock — a knockout.
    // The cut supplies the boundary for free.
    D(s).painted = true;
    const g = plateDice(s, 23);
    // The inked half is grey pulp and the knockout is fresh stock, and
    // that is not negotiable by the sitter's colour: a WHITE character
    // answered with cream got a face the same value as the page, and
    // the style stopped happening to it. The sitter's colour is spent
    // entirely on how much ink went down.
    const paper = g.c(.22) ? NICOTINE : NEWS;
    const pieces = plan(s, pts);
    const dark = Math.max(.46, Math.min(.75, .28 + (1 - lum(col)) * .6));
    // Which half of the face carries the ink; the other is the
    // knockout. Usually the BIGGER half — a knockout is a hole in a
    // screen, so the screen has to be the majority of the face or the
    // head goes back to being blank paper with a band across it.
    // (and it is decided by MEASURING the two pieces, not by a roll,
    //  so it cannot swap between boil frames)
    const inked = pieces.length < 2 || diagOf(pieces[0].poly) >= diagOf(pieces[1].poly) ? 0 : 1;

    pieces.forEach((piece, i) => {
      const gp = plateDice(s, 120 + i * 31);
      const stock = i === inked ? paper : CREAM;
      const face = paste(s, piece, stock);
      const pd = diagOf(face);
      if (pieces.length > 1 && i !== inked) {
        // BARE STOCK, or the faintest of screens — this is the white
        // the eyes are read against
        if (gp.c(.45)) halftone(s, face, BLACK, .16, {
          grad: gp.r(1.4, 2.6), ang: gp.r(.2, 1.3), gk: .5, alpha: .6, fine: .028, dot: .5,
        });
      } else {
        // No FLAT on a face. It was in this table at a weight of six
        // and it came up: a head printed as one slab of solid stock is
        // a brown paper bag with two eyes stuck on it, and it happened
        // to the same character in both hands. A face is a PHOTOGRAPH,
        // which is to say a screen — the only question is how coarse.
        const mat = gp.w([['photo', 34], ['coarse', 28], ['fine', 28], ['column', 8]]);
        // a face that was NOT cut has to grow its own knockout, so its
        // gradient is allowed to run out; a cut one already has one
        material(s, face, mat, BLACK, dark, g, pieces.length > 1 ? .62 : 1.2);
        // and it was printed twice, a hair out, on the red plate
        if (pd > 30) halftone(s, face, RED, dark * .42, {
          grad: gp.r(3.5, 5), ang: gp.r(.2, 1.3), gk: .3, alpha: .34, fine: .03,
          dx: -pd * .03, dy: -pd * .02,
        });
      }
      if (pd > 34 && gp.c(.38)) typeMark(s, face, g, BLACK, pd * .8);
    });
    const span = spanOf(pts);
    if (span > 26 && g.c(.16)) foreign(s, pieces[pieces.length - 1].poly, g, span);
  },

  // Letterpress: a line block prints hard, flat and even — it does not
  // waver the way a pencil does, so the wobble is turned nearly off.
  // It traces the SAME pieces the scraps were pasted as, which is what
  // makes the edge read as the edge of the paper rather than as a drawn
  // outline around it — and it is the only reason the cut is visible at
  // all, since it draws a hard black line down both sides of the joint.
  // The slipped plate matches the FILL's slip, per piece: that is the
  // one place on this sheet where a contour is a printing fact.
  edge(s, pts, w, o = {}) {
    const diag = diagOf(pts);
    if (diag <= 9) {
      s.setInk(BLACK);
      s.stroke(pts, w * 1.05, { alpha: .95, ghost: false, taper: .3, amp: .22, ...o });
      s.setInk(null);
      return;
    }
    const g = plateDice(s, 41);
    const pieces = plan(s, pts);
    // A character with no skin colour never reaches `skin` at all — the
    // rig leaves its face as bare paper (`skull.js`: `if
    // (F.colors.skin)`), so on a white cat this style only ever
    // painted the hair. The contour is the one hook that fires on
    // EVERY shape, so a head-sized outline is where the collage gets
    // its chance: a scrap pasted across the silhouette, half of it on
    // the page. It is centred on the outline itself, so it can never
    // land on the eyes.
    const big = spanOf(pts) > 40 && diag > 74;
    if (big && !D(s).painted) { D(s).painted = true; bareFace(s, pts, plateDice(s, 57)); }
    if (big && g.c(.3)) foreign(s, pieces[0].poly, g, spanOf(pts) * .7);
    pieces.forEach((piece, i) => {
      const gp = plateDice(s, 200 + i * 17);
      if (gp.c(.42)) {
        s.setInk(piece.regInk);
        s.stroke(move(piece.poly, piece.reg[0], piece.reg[1]), w * .8,
          { alpha: .62, ghost: false, taper: .3, amp: .2 });
        s.setInk(null);
      }
      s.setInk(BLACK);
      s.stroke(piece.poly, w * 1.05, { alpha: .95, ghost: false, taper: .3, amp: .22, ...o });
      s.setInk(null);
    });
  },
};
