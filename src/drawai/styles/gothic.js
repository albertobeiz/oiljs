// ---------------------------------------------------------------
// GOTHIC — egg tempera on a gilded panel, c. 1310.
//
// The reference implementation for a style, and the shortest possible
// statement of what one is: a style answers `tone / skin / edge` in a
// vocabulary of its own, and it is allowed to overrule the character's
// colours to do it. A gothic panel has about five pigments in it and
// no others; asked for a lilac, it gives you the ultramarine.
//
// ROUND THREE. The critique: *"Gothic painting means gold-leaf
// backgrounds, flatness, elongated figures, halos, strong black
// contour. You've got a hint of gold on two characters… if any row
// deserves a full gold-ground behind every figure, it's this one."*
// Dead right, and the reason was structural, not a shortage of nerve:
// the gold used to be built inside the head's own PART, on the head's
// own little plate, so it could never be bigger than the head. Six
// gilded sandwich-boards. A ground is not a thing you hang on a
// figure; it is the room the figure is standing in, and until this
// round there was no way to say so.
//
// There is now — `backdrop()`. So the gold moved OFF the character
// entirely and became what it always was: A PANEL. A tall compartment
// with a pointed arch cut into it, gilded inside, tooled with a
// goldsmith's punch around the arch, spandrels and frame in red bole,
// six centuries of craquelure across the lot. Every figure gets one,
// and because the panels are a cell wide they stand shoulder to
// shoulder — a row of gothic is one ALTARPIECE, which is exactly how
// these things were painted.
//
// What is left on the character is the other half of the argument,
// and it has to survive the squint on its own:
//   · brilliant white GESSO under everything, which is why gothic
//     flesh glows and why the same pink on cream goes dull;
//   · flat colour, unmodelled: the modelling is a hard-edged ZONE of
//     the same pigment darker, never a blend and never a scratch.
//     Tempera has no brushmark in it at all;
//   · TRATTEGGIO where the modelling is fine enough to need a comb —
//     on the FLESH, and nowhere else;
//   · VERDACCIO showing through, partially: the green underpaint is
//     visible because the rose above it wore off, so it survives in
//     the shadow of the cheek and not across the whole face;
//   · a gilt HEM on every coloured mass, and CHRYSOGRAPHY — gold
//     assist lines — rayed over the big dark ones. Gold on the figure
//     and gold behind it are two different jobs;
//   · the HALO, on the figures big enough to carry one — a tooled
//     disc of leaf slid in behind the head;
//   · an iron-gall BROWN-black contour, drawn once, not wavering, and
//     the strongest line in the picture. It is declared as the
//     style's `ink`, so the void eyes and the nostrils and the teeth
//     go warm too without a single part being told.
// ---------------------------------------------------------------
import { nearest, step, shade, tint, mix, dens, bbox, centroid, rgb, lum } from './pigment.js';

// the box of paint: lapis, azurite, vermilion, red lead, verdigris,
// terre verte, madder, lead white, iron-gall — and gold, which is not
// a pigment at all
const LAPIS = [38, 56, 132];
const AZURITE = [74, 108, 152];
const VERMILION = [208, 62, 30];   // scarlet: mercury sulphide, not an earth
const MINIUM = [198, 96, 34];      // red lead, the orange in the borders
const VERDIGRIS = [44, 108, 86];
const TERRE = [118, 128, 90];      // terre verte — the verdaccio underpaint
const MADDER = [152, 58, 78];
const GESSO = [251, 249, 243];     // chalk and size: the ground, and it is WHITE
const LEAD = [238, 230, 209];
const IRON = [46, 32, 23];         // iron-gall: a BROWN-black. No lamp black on a panel.
const GOLD = [201, 157, 54];
const GOLD_HI = [252, 231, 158];
const GOLD_LO = [110, 72, 21];
const BOLE = [140, 62, 39];        // Armenian bole: the red clay the leaf is laid on
const WOOD = [78, 34, 26];         // the frame: bole gone almost black in the shadow

const FLESH = tint(MINIUM, .5);   // the rose of a trecento cheek
const BOX = [LAPIS, AZURITE, VERMILION, MINIUM, VERDIGRIS, TERRE, MADDER, GESSO, IRON, GOLD];
const RAMP = [IRON, LAPIS, VERDIGRIS, MADDER, GOLD, GESSO];

// The board's grain runs DOWN the panel, so its cracks run across it.
// One angle for the whole sheet on purpose: these came out of one
// workshop, off boards cut the same way.
const GRAIN = -.14;

// per-canvas latch. Each part is drawn on its own `Sketch`, so this is
// "have I already haloed this plate", which is exactly the question.
const G = s => (s.__goth ??= { halo: false, painted: false, r: null });

// The plate's own unchanging number, 0..1. Anything STRUCTURAL asks
// this instead of `s.chance` — whether the rose has worn off the
// verdaccio, whether a mass carries the gold assist. Rolled fresh each
// boil frame those two turn a face green and back three times a second
// and comb gold rays on and off a robe, which is the flicker the rules
// warn about and which was in here until it was measured.

// ---- paths -----------------------------------------------------
const ELL = (cx, cy, rx, ry, n = 64) => {
  const p = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  return p;
};
const QUAD = (a, b, k, n) => {
  const p = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    p.push([u * u * a[0] + 2 * u * t * k[0] + t * t * b[0],
            u * u * a[1] + 2 * u * t * k[1] + t * t * b[1]]);
  }
  return p;
};
// Two `s.poly` calls do not make one clip — `poly` begins its own
// path, so the second silently throws the first away. A union has to
// be built as sub-paths in a single path.
function clipUnion(c, shapes) {
  c.beginPath();
  for (const pts of shapes) {
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.closePath();
  }
  c.clip();
}

function path(g, pts) {
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath();
}

// A STABLE die. Everything on a character is redrawn two or three
// times a second with a fresh seed, so a `s.chance()` that decides
// whether a halo exists is a halo that flickers. This rolls off
// numbers that do not change between boil frames — the plate's own
// size and where the part's transform put it — so the answer holds
// still for the life of the character.
function fixed01(...ns) {
  let h = 2166136261;
  for (const n of ns) { h ^= Math.round(n * 8) | 0; h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 8192) / 8192;
}

// Off the PLATE'S OWN SIZE and nothing else. The obvious extra
// ingredient — where the part's transform has got to — is not stable:
// a part is free to nudge its own frame with `s.jr()` before it asks
// for paint, and one pixel of nudge flips a hash, which turned a face
// green and back and cost 0.06 on the flicker meter. Two parts of the
// same size answering alike is a workshop; a part answering
// differently three times a second is a fault.
function fixedOf(s, salt = 0) {
  const g = G(s);
  if (g.r == null) g.r = fixed01(s.w, s.h, 7);
  return salt ? fixed01(s.w, s.h, salt) : g.r;
}

// ---- the punch -------------------------------------------------
// A goldsmith's stamp, hammered into the leaf while it is on the
// bole. Every workshop had its own and no two panels carry the same
// one, so the stamp is dealt per panel rather than being one texture
// tile repeated down the row.
const STAMPS = ['ring', 'rosette', 'chevron', 'arc'];

// a five-point star, the only thing that is ever painted on a vault
function starAt(g, x, y, r, a0) {
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = a0 + i / 10 * Math.PI * 2, q = (i % 2 ? .42 : 1) * r;
    const px = x + Math.cos(a) * q, py = y + Math.sin(a) * q;
    i ? g.lineTo(px, py) : g.moveTo(px, py);
  }
  g.closePath(); g.fill();
}

function stampAt(g, kind, x, y, r, a) {
  g.strokeStyle = rgb(GOLD_LO, .85);
  g.fillStyle = rgb(GOLD_LO, .72);
  g.lineWidth = Math.max(.5, r * .4);
  if (kind === 'rosette') {
    g.beginPath(); g.arc(x, y, r * .34, 0, Math.PI * 2); g.fill();
    for (let k = 0; k < 5; k++) {
      const b = a + k / 5 * Math.PI * 2;
      g.beginPath(); g.arc(x + Math.cos(b) * r * .8, y + Math.sin(b) * r * .8, r * .3, 0, Math.PI * 2); g.fill();
    }
  } else if (kind === 'chevron') {
    g.beginPath();
    g.moveTo(x + Math.cos(a + 2.2) * r, y + Math.sin(a + 2.2) * r);
    g.lineTo(x + Math.cos(a) * r * .45, y + Math.sin(a) * r * .45);
    g.lineTo(x + Math.cos(a - 2.2) * r, y + Math.sin(a - 2.2) * r);
    g.stroke();
  } else if (kind === 'arc') {
    g.beginPath(); g.arc(x, y, r, a + .95, a + Math.PI * 2 - .95); g.stroke();
  } else {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
  }
}

// a punched border, walked round the inside of a gilded shape
function punchBorder(g, shape, kind, diag, inset = .07, want) {
  const [cx, cy] = centroid(shape);
  const n = want ?? Math.max(12, Math.min(56, Math.round(diag * .17)));
  const stride = Math.max(1, Math.round(shape.length / n));
  const r = Math.max(1, diag * .016);
  for (let i = 0; i < shape.length; i += stride) {
    const p = shape[i];
    const x = p[0] + (cx - p[0]) * inset, y = p[1] + (cy - p[1]) * inset;
    stampAt(g, kind, x, y, r, Math.atan2(p[1] - cy, p[0] - cx));
  }
}

// leaf, laid on bole and rubbed with an agate until it takes the light
// in streaks. Everything here is flat 2D — leaf has no brushmark, so
// nothing goes through the hand.
function burnish(g, s, shape, x0, y0, x1, y1, n = 9) {
  g.save(); path(g, shape); g.clip();
  g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const y = s.jr(y0, y1);
    g.beginPath(); g.moveTo(x0 - 6, y); g.lineTo(x1 + 6, y + s.jr(-3, 3));
    // keep it a STREAK, not a stripe: at full strength sixteen of
    // these ruled across a field read as corduroy, not as leaf that
    // has been rubbed with an agate
    g.strokeStyle = rgb(s.chance(.55) ? GOLD_HI : shade(GOLD, .28), .26);
    g.lineWidth = s.jr(1.2, 4.6); g.stroke();
  }
  g.restore();
}

// ---- the arch --------------------------------------------------
// A panel is a COMPARTMENT, and its head is the whole of its gothic:
// a lancet, a trefoil, an ogee, or the round Romanesque one the
// workshops had not quite let go of in 1310. It is built as a plain
// list of points so the cusping can be applied to the same list —
// pulling the arch's underside toward the springing in lobes, which
// is what a foil actually is.
// A POINTED ARCH IS TWO ARCS OF A CIRCLE, and it will not come out of
// a Bézier. Two quads from the springing to the apex were the first
// attempt and every panel in the row came back an EGG: one control
// point cannot be both tangent to the jamb at the bottom and steep at
// the point, so it splits the difference and gives you an oval. The
// mason's construction has no such problem — the left half is an arc
// whose CENTRE sits out beyond the right springing, and the further
// out it sits the sharper the point. Given the rise R and the half
// width W, the centre offset is (R² − W²) / 2W, which is 0 for a
// semicircle and exactly W for the equilateral arch.
function archTop(s, kind, X0, X1, YT, Ys) {
  const cx = (X0 + X1) / 2, W = (X1 - X0) / 2, TOT = Ys - YT;
  if (kind === 'round' || TOT <= W * 1.04) {
    const p = [];
    for (let i = 0; i <= 44; i++) { const a = Math.PI + i / 44 * Math.PI; p.push([cx + Math.cos(a) * W, Ys + Math.sin(a) * TOT]); }
    return p;
  }
  // an ogee spends the last quarter of its rise on the flame, so the
  // circular part of it is built shorter and pushed back up to YT
  const R = kind === 'ogee' ? Math.max(W * 1.05, TOT * .76) : TOT;
  const a = (R * R - W * W) / (2 * W);         // how far out the centre sits
  const th = Math.atan2(-R, -a);               // where the apex lands on that arc
  const N = 26, half = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, g = -Math.PI + t * (th + Math.PI);
    half.push([cx + a + Math.cos(g) * (a + W), Ys + Math.sin(g) * (a + W)]);
  }
  let p = [...half, ...half.slice(0, N).reverse().map(([x, y]) => [2 * cx - x, y])];

  if (kind === 'ogee') {
    // the S: the arch keeps its haunches and its point is pulled up
    // into a flame. A pure reversal of curvature near the apex, faded
    // in over the top third so the haunch is untouched.
    const rise = TOT - R;
    p = p.map(([x, y]) => {
      const u = Math.min(1, Math.max(0, (Ys - y) / R));
      const k = Math.max(0, (u - .62) / .38);
      return [cx + (x - cx) * (1 - k * k * .38), y - k * k * rise];
    });
  }
  return p;
}

function cuspify(top, cx, cy, lobes, amp) {
  const n = top.length - 1;
  return top.map((p, i) => {
    const t = i / n, f = 1 - amp * Math.abs(Math.sin(t * Math.PI * lobes));
    return [cx + (p[0] - cx) * f, cy + (p[1] - cy) * f];
  });
}

// ---- craquelure ------------------------------------------------
// The panel moved and the gesso did not. Cracks run ACROSS the grain
// of the board, they turn rather than curve, and they crowd along the
// join between two planks — sprinkled evenly they are just dust on
// the scan.
//
// Drawn straight on the 2D context and NOT through `s.sline`, and
// that is a rule worth stating for every style: MICRO-TEXTURE goes
// through `s.ctx`, EXPRESSIVE MARKS go through the hand. A crack is a
// hairline whatever is holding the pen; put it through the hand and
// p5.brush hands you back a 2px textured brush stroke, and the panel
// comes back from the shot looking like a shattered windscreen. The
// tratteggio and the contour DO go through the hand, because those
// are marks a painter made and each hand should say them its own way.
function cracks(s, g, x0, y0, x1, y1, pale, dirt, per = .16) {
  const bw = x1 - x0, bh = y1 - y0;
  const diag = Math.hypot(bw, bh);
  if (diag < 24) return;
  g.lineCap = 'round';
  const lw = Math.max(.45, diag * .0042);
  const seg = diag * .030;                     // a crack is SHORT. Long ones are scratches.
  const jx = x0 + bw * s.jr(.28, .72);         // where two planks meet

  const n = Math.round(diag * per);
  for (let k = 0; k < n; k++) {
    const t = s.jr(-1, 1);
    let x = jx + t * t * t * bw * .85;         // they pool along the join
    let y = s.jr(y0 - bh * .05, y1 + bh * .05);
    const base = GRAIN + (s.chance(.5) ? Math.PI : 0);
    g.beginPath(); g.moveTo(x, y);
    for (let i = 0, m = s.ri(2, 4); i < m; i++) {
      const a = base + s.jr(-.7, .7);
      x += Math.cos(a) * seg * s.jr(.6, 1.4); y += Math.sin(a) * seg * s.jr(.6, 1.4);
      g.lineTo(x, y);
    }
    g.lineWidth = lw * s.jr(.7, 1.3); g.strokeStyle = pale; g.stroke();
  }
  // the seam itself, with six centuries of dirt in it
  let y = y0 - seg, x = jx;
  g.beginPath(); g.moveTo(x, y);
  while (y < y1 + seg) { y += seg * 2; x += s.jr(-1, 1) * seg * .5; g.lineTo(x, y); }
  g.lineWidth = lw * 1.5; g.strokeStyle = dirt; g.stroke();
}

function craquelure(s, pts, col) {
  const [x0, y0, x1, y1] = bbox(pts);
  if (Math.hypot(x1 - x0, y1 - y0) < 26) return;
  const c = s.ctx;
  c.save(); s.poly(pts, true); c.clip();
  // Flat is the point. The panel behind the figure now carries the six
  // hundred years; on the figure it is a whisper, or the flesh comes
  // back looking scratched rather than painted.
  cracks(s, c, x0, y0, x1, y1, rgb(tint(col, .50), .26), rgb(shade(col, .6), .16), .07);
  c.restore();
}

// ---- gold ON the figure ----------------------------------------
// Gold behind the figure is the SPACE; gold on the figure is the
// goldsmith's work in the picture, and they are two different jobs.
// If the only leaf in the row were the ground, every character would
// read as a silhouette pasted on a plaque.

// CHRYSOGRAPHY — the gold assist. Hair-fine rays of leaf combed down
// over a robe or a mass of hair, springing from one point above it.
// Micro-texture, so it goes through `s.ctx` and stays hair-fine in
// both hands.
function chrysography(s, pts, diag) {
  const [x0, y0, x1, y1] = bbox(pts);
  const c = s.ctx;
  c.save(); s.poly(pts, true); c.clip();
  c.lineCap = 'round';
  const ox = (x0 + x1) / 2 + s.jr(-.25, .25) * (x1 - x0);
  const oy = y0 - (y1 - y0) * s.jr(.5, 1);
  const n = s.ri(5, 9), L = diag * 1.6;
  for (let i = 0; i < n; i++) {
    const a = Math.PI * .17 + Math.PI * .66 * ((i + s.jr(.2, .8)) / n);
    let x = ox, y = oy;
    c.beginPath(); c.moveTo(x, y);
    for (let k = 0; k < 7; k++) {
      const b = a + s.jr(-.06, .06);
      x += Math.cos(b) * L / 7; y += Math.sin(b) * L / 7;
      c.lineTo(x, y);
    }
    c.strokeStyle = rgb(GOLD, .62);
    c.lineWidth = Math.max(.6, diag * .0075); c.stroke();
  }
  c.restore();
}

// a hairline of leaf run just inside a contour: the gilt hem. Every
// coloured mass gets one, so gold is somewhere on every character
// even when the panel behind it is the blue vault.
function giltHem(s, pts, diag) {
  if (diag < 30) return;
  const c = s.ctx;
  s.poly(s.offsetShape(pts, .93, 0, 0, 0), true);
  c.strokeStyle = rgb(mix(GOLD, GOLD_HI, .45), .72);
  c.lineWidth = Math.max(.7, diag * .0095); c.stroke();
}

// ---- the halo --------------------------------------------------
// The one piece of leaf that still belongs on the character's own
// plate, because it has to be centred on the HEAD and nothing behind
// the figure knows where that is. A disc of gold slid in underneath
// with `destination-over`, scored, tooled with the punch, and rimmed
// hard in bole so it reads against the gilded panel it is standing on
// — a gold disc on a gold ground is the real thing, and the real
// thing is legible only by its tooling and its rim.
//
// Who gets one is decided by SIZE and then by a die that does not
// move (see `fixed01`). A haloed head that blinks its halo two or
// three times a second is the flicker the rules warn about.
function halo(s, pts) {
  const c = s.ctx;
  const [x0, y0, x1, y1] = bbox(pts);
  const hw = (x1 - x0) / 2, hh = (y1 - y0) / 2;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 - hh * .10;
  const b = plateBounds(s);
  let r = Math.max(hw, hh) * 1.14;
  if (b) r = Math.min(r, (b[2] - b[0]) * .48, (b[3] - b[1]) * .48);
  if (r < 12) return;
  const ring = ELL(cx, cy, r, r, 64);
  const kind = STAMPS[(fixedOf(s, 31) * STAMPS.length) | 0];

  const off = document.createElement('canvas');
  off.width = s.w; off.height = s.h;
  const g = off.getContext('2d');
  g.setTransform(c.getTransform());

  path(g, ring); g.fillStyle = rgb(GOLD); g.fill();
  burnish(g, s, ring, cx - r, cy - r, cx + r, cy + r, 7);
  // the scored line the punches sit behind
  path(g, ring.map(p => [cx + (p[0] - cx) * .90, cy + (p[1] - cy) * .90]));
  g.strokeStyle = rgb(GOLD_LO, .75); g.lineWidth = Math.max(.8, r * .022); g.stroke();
  punchBorder(g, ring, kind, r * 2, .055);
  // bole at the rim: the leaf is laid on red clay and the agate wore
  // through. It is also the only thing that separates a gold halo
  // from the gold panel behind it.
  g.save(); path(g, ring); g.clip();
  path(g, ring); g.strokeStyle = rgb(BOLE, .95); g.lineWidth = Math.max(2, r * .055); g.stroke();
  g.restore();
  path(g, ring); g.strokeStyle = rgb(IRON, .72); g.lineWidth = Math.max(.8, r * .016); g.stroke();

  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = 'destination-over';
  c.drawImage(off, 0, 0);
  c.restore();
}

// A part draws in ITS OWN frame — pixels, y down, origin at the head's
// centre — so the plate's edges are wherever the part's transform put
// them. Asking `s.w` where a part is drawing is asking a question in
// the wrong coordinate system, and the answer it gives is plausible
// and wrong: the gold came back a third of the size and vanished
// behind the face. The transform is right there; invert it.
function plateBounds(s) {
  const T = s.ctx.getTransform();
  let inv; try { inv = T.inverse(); } catch { return null; }
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [X, Y] of [[0, 0], [s.w, 0], [s.w, s.h], [0, s.h]]) {
    const p = inv.transformPoint(new DOMPoint(X, Y));
    x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x);
    y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
  }
  return [x0, y0, x1, y1];
}

// ---- tratteggio ------------------------------------------------
// The modelling of a tempera face is a COMB of fine parallel strokes
// in a darker shade of the paint already there — egg dries too fast
// to blend. It is the modelling, so it has to READ at arm's length:
// few strokes, dark, and only where the form actually turns. Combed
// over a whole mass it stops being tempera and becomes pencil.
function tratteggio(s, clip, region, col) {
  const [x0, y0, x1, y1] = bbox(region);
  const d = Math.hypot(x1 - x0, y1 - y0);
  if (d < 22) return;
  const c = s.ctx;
  const dark = shade(mix(col, MADDER, .8), .5);   // a darker shade of the SAME paint, never a grey
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const ang = -1.0, dx = Math.cos(ang), dy = Math.sin(ang), px = -dy, py = dx;
  const n = 6, gap = d * .125, L = d * .38;
  c.save(); s.poly(clip, true); c.clip();
  // Through the HAND — a comb is a mark a painter MADE, and each hand
  // should say it in its own accent — but with the colour handed over
  // EXPLICITLY rather than through the ink. `hatchFill` was the
  // obvious call and it is the wrong one: p5.brush's grainy hatch tip
  // came back a PALE highlight sitting in the shadow, so the brush row
  // had six faces with white scratches combed across them while the
  // graphite row had the modelling it was supposed to. `sline` takes a
  // colour argument, both hands honour it, and seven strokes is what
  // "few marks and each one reads" actually looks like.
  for (let i = 0; i < n; i++) {
    const t = (i - (n - 1) / 2) * gap + s.jr(-.18, .18) * gap;
    const k = s.jr(.7, 1.0);
    s.sline([[cx + px * t - dx * L * k, cy + py * t - dy * L * k],
             [cx + px * t + dx * L * k, cy + py * t + dy * L * k]],
      Math.max(1.3, d * .015), .9, rgb(dark, .52));
  }
  c.restore();
}

// A head nobody laid a colour on is still a head on a gilded panel,
// and gothic is allowed to say so: chalk ground, terre-verte under,
// rose over. The critics are right that the low-chroma characters are
// where a style has to shout — a white cat left white is a style that
// only paints where paint already was.
//
// It also matters WHICH white. Gothic flesh is bright because it sits
// on brilliant white gesso; the same rose on cream paper goes dull and
// the row loses to the woodblock's warm hosho two rows down.
function temperaFace(s, pts) {
  const c = s.ctx;
  const [x0, y0, x1, y1] = bbox(pts);
  const closed = pts.concat([pts[0]]);
  const cap = ELL((x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) * .46, (y1 - y0) * .46);
  // the outline a skull hands over is OPEN at the crown; the panel is not
  for (const shape of [closed, cap]) { s.poly(shape, true); c.fillStyle = rgb(GESSO); c.fill(); }
  for (const shape of [closed, cap]) { s.poly(shape, true); c.fillStyle = rgb(TERRE, .92); c.fill(); }
  const bw = x1 - x0, bh = y1 - y0;
  c.save(); clipUnion(c, [closed, cap]);
  for (const shape of [closed, cap]) {
    s.poly(s.offsetShape(shape, 1.06, -bw * .08, -bh * .07, 0), true);
    c.fillStyle = rgb(FLESH, .97); c.fill();
  }
  c.restore();
  tratteggio(s, closed, s.offsetShape(closed, .84, bw * .42, bh * .32, 0), FLESH);
  craquelure(s, closed, FLESH);
}

export default {
  id: 'gothic', label: 'gothic', era: 1310, underdraw: false,

  // Iron gall. The contour, the void eyes, the nostrils, the teeth —
  // every black on the character resolves through this, and there was
  // no lamp black within three hundred miles of a trecento workshop.
  ink: IRON,

  // Brilliant white gesso: chalk and rabbit-skin size, scraped and
  // polished. It has to read as WHITE against drawai's cream, because
  // that is the whole reason gothic flesh glows.
  ground: [250, 248, 241],

  // A compartment out of a polyptych: tall, narrow, standing on the
  // shelf. A cell wide, so the six of them touch and the row reads as
  // one altarpiece.
  // The height is not free: the arch's POINT is the whole gothic read,
  // and a panel taller than the cell has its point cropped off by the
  // top of the page — which is the same mistake as the old plate-sized
  // gold, made at the other end. Tall enough for a lancet, short
  // enough that the lancet is in the picture.
  panel: { w: .99, h: .96, y: .45 },

  // ---------------------------------------------------------------
  // THE GOLD GROUND. Not a tint and not an ornament — the SPACE. On a
  // trecento panel (Duccio, Simone Martini, any Giotto altarpiece) the
  // leaf is behind every figure: it is the sky, it is the air, it is
  // what makes the thing gothic before you have looked at a face.
  //
  // Built once per character, so it may roll as freely as it likes.
  // ---------------------------------------------------------------
  backdrop(s, { w, h, floor }) {
    const c = s.ctx;
    const fr = Math.max(3.5, w * .050);                    // the frame's width
    const X0 = fr, X1 = w - fr, cx = w / 2;
    const YT = fr * 2.6;      // the point needs frame above it, or it is not a point
    const YB = Math.min(h - fr * .4, floor + h * .028);
    // The springing has to sit LOW. The rise has to beat the half
    // width before two arcs can meet at an angle at all — spring it
    // high and the mason's construction quietly degenerates into the
    // same semicircle a Bézier gave you.
    const kind = s.weighted([['lancet', 34], ['trefoil', 30], ['ogee', 22], ['round', 14]]);
    // A ROUND arch is a SEMICIRCLE and nothing else. Given the same
    // springing as a lancet it comes out an egg — which is what the
    // whole row looked like an hour ago — so it sets its own, and the
    // Romanesque holdover ends up the short-headed compartment it is.
    const W = (X1 - X0) / 2;
    const Ys = kind === 'round'
      ? Math.min(YT + W, YT + (YB - YT) * .62)
      : YT + (YB - YT) * s.jr(.42, .51);                  // the springing line
    let top = archTop(s, kind === 'trefoil' ? 'lancet' : kind, X0, X1, YT, Ys);
    if (kind === 'trefoil') top = cuspify(top, cx, Ys, s.chance(.55) ? 3 : 5, s.jr(.055, .095));
    const field = [[X0, YB], [X0, Ys], ...top, [X1, Ys], [X1, YB]];
    const diag = Math.hypot(X1 - X0, YB - YT);
    const stamp = s.pick(STAMPS);

    // ---- the frame. Everything that is not the field is the carved
    // moulding, and on a real panel that includes the spandrels: the
    // two corners the arch leaves behind.
    c.fillStyle = rgb(WOOD); c.fillRect(0, 0, w, h);
    c.fillStyle = rgb(shade(BOLE, .18), .85);
    c.fillRect(fr * .34, fr * .34, w - fr * .68, h - fr * .68);

    // ---- the field.
    // NOT EVERY PANEL IS GILDED. Giotto's vault at the Arena chapel is
    // ultramarine sown with gold stars, and one blue field in six is
    // what stops a row of gold from settling into a single band of
    // ochre. It is still a gothic space — same arch, same tooling.
    const vault = s.chance(.17);
    // no two books of leaf are the same colour, and six identical
    // ochres in a row is the trap this style keeps falling into
    const leaf = s.chance(.5) ? mix(GOLD, GOLD_HI, s.jr(.02, .10)) : mix(GOLD, GOLD_LO, s.jr(.02, .18));
    path(c, field);
    c.fillStyle = rgb(vault ? LAPIS : leaf); c.fill();
    if (vault) {
      c.fillStyle = rgb(GOLD_HI, .95);
      const nst = s.ri(11, 18);
      for (let i = 0; i < nst; i++) {
        const p = field[Math.floor((i + s.jr(.2, .8)) / nst * field.length) % field.length];
        const f = s.jr(.10, .34);
        starAt(c, p[0] + (cx - p[0]) * f, p[1] + (Ys - p[1]) * f * .6,
          Math.max(2, diag * s.jr(.018, .030)), s.jr(0, 6.28));
      }
    } else {
      burnish(c, s, field, X0, YT, X1, YB, 13);
      // the leaf is laid on red clay and the gilder's agate wore
      // through at the edges: bole all round the inside of the field.
      c.save(); path(c, field); c.clip();
      path(c, field);
      c.strokeStyle = rgb(BOLE, .9); c.lineWidth = Math.max(2.5, diag * .022); c.stroke();
      c.restore();
    }

    // ---- the tooling. A scored line just inside the field and the
    // workshop's punch marching all the way round it, arch included.
    // This is the mark that says GOLD LEAF rather than yellow paint.
    path(c, field.map(p => [cx + (p[0] - cx) * .955, Ys + (p[1] - Ys) * .955]));
    c.strokeStyle = rgb(GOLD_LO, .62); c.lineWidth = Math.max(.8, diag * .0045); c.stroke();
    punchBorder(c, field, stamp, diag, .028, 46);

    // ---- the arch's own fillet: a hard gilt edge where the field
    // meets the moulding, and an iron line outside it. A gilded shape
    // is never allowed to end in a soft edge.
    path(c, field);
    c.strokeStyle = rgb(GOLD_HI, .85); c.lineWidth = Math.max(1, diag * .006); c.stroke();
    path(c, field.map(p => [cx + (p[0] - cx) * 1.012, Ys + (p[1] - Ys) * 1.012]));
    c.strokeStyle = rgb(IRON, .62); c.lineWidth = Math.max(.8, diag * .005); c.stroke();

    // ---- the spandrels get a punched rosette each, the way a carved
    // corner does, and the frame gets its gilt bead.
    const sr = Math.max(3, (X1 - X0) * .055);
    for (const sx of [X0 + sr * 1.9, X1 - sr * 1.9]) stampAt(c, 'rosette', sx, YT + sr * 1.9, sr, .3);
    c.strokeStyle = rgb(GOLD, .7); c.lineWidth = Math.max(1, fr * .22);
    c.strokeRect(fr * .34, fr * .34, w - fr * .68, h - fr * .68);

    // ---- the floor the figure stands on: a narrow band of dark paint
    // across the foot of the field, which is where a trecento panel
    // stops being air and becomes a place.
    c.save(); path(c, field); c.clip();
    const fh = (YB - Ys) * .09;
    c.fillStyle = rgb(shade(s.chance(.5) ? VERDIGRIS : MADDER, .5));
    c.fillRect(X0, YB - fh, X1 - X0, fh);
    c.fillStyle = rgb(IRON, .5);
    c.fillRect(X0, YB - fh, X1 - X0, Math.max(1, fh * .12));
    c.restore();

    // ---- six hundred years. Across the whole board, frame and all,
    // pooling along the join between two planks — the one texture that
    // ties the panel to the figure standing on it.
    c.save();
    c.beginPath(); c.rect(0, 0, w, h); c.clip();
    cracks(s, c, 0, 0, w, h, rgb(tint(GESSO, .3), .30), rgb(shade(WOOD, .5), .3), .085);
    c.restore();
  },

  tone(s, pts, o = {}) {
    G(s).painted = true;
    const d = dens(o.style);
    const c = s.ctx;
    const [x0, y0, x1, y1] = bbox(pts);
    const bw = x1 - x0, bh = y1 - y0, diag = Math.hypot(bw, bh);
    // A mass that asked for no colour and little weight is LEAD WHITE
    // here, not paper and not leaf: gold on the figure against gold
    // behind it is a hole in the character.
    const col = o.col ? nearest(o.col, BOX)
      : d <= .4 ? LEAD
      : step([255 * (1 - d), 255 * (1 - d), 255 * (1 - d)], RAMP);

    // gesso, then the pigment, FLAT. Tempera is a seamless surface —
    // no brushmark, no granulation, no scratching. Whatever the hand
    // would like to do with a fill, a panel does not do it.
    s.poly(pts, true); c.fillStyle = rgb(GESSO); c.fill();
    s.poly(pts, true); c.fillStyle = rgb(col, .98); c.fill();

    // the modelling is a ZONE: the same pigment darker, hard-edged,
    // laid over the shadow side. Trecento drapery, and it holds its
    // value at 90px where a hatch does not.
    if (diag > 24) {
      c.save(); s.poly(pts, true); c.clip();
      s.poly(s.offsetShape(pts, 1.16, bw * .32, bh * .22, 0), true);
      c.fillStyle = rgb(shade(col, .32), .9); c.fill();
      c.restore();
    }
    if (diag > 44 && lum(col) < .5 && fixedOf(s, 5) > .58) chrysography(s, pts, diag);
    giltHem(s, pts, diag);
    craquelure(s, pts, col);
  },

  skin(s, pts, col, o = {}) {
    G(s).painted = true;
    const c = s.ctx;
    const [x0, y0, x1, y1] = bbox(pts);
    const bw = x1 - x0, bh = y1 - y0, diag = Math.hypot(bw, bh);

    s.poly(pts, true); c.fillStyle = rgb(GESSO); c.fill();
    // VERDACCIO: the flesh is underpainted green and the rose laid
    // over it. What everybody recognises about a tempera face is an
    // ACCIDENT — the green shows because the rose has abraded off —
    // so it survives in the shadow, and a whole green face is rare.
    s.poly(pts, true); c.fillStyle = rgb(TERRE); c.fill();
    // terre verte is what is UNDER a face, never what a face is: left in
    // the box it kept winning the vote for olive skins and the row came
    // back with two mouldy heads in it.
    const flesh = tint(nearest(col, [VERMILION, MADDER, MINIUM, LEAD]), .32);
    const abraded = fixedOf(s) < .12;
    if (!abraded) {
      c.save(); s.poly(pts, true); c.clip();
      s.poly(s.offsetShape(pts, 1.06, -bw * .08, -bh * .07, 0), true);
      c.fillStyle = rgb(flesh, .97); c.fill();
      c.restore();
      // and the comb, in the shadow the green is already sitting in
      tratteggio(s, pts, s.offsetShape(pts, .84, bw * .42, bh * .32, 0), flesh);
    }
    giltHem(s, pts, diag);
    craquelure(s, pts, abraded ? TERRE : flesh);
  },

  // One line, laid down once, and it does not waver. Iron-gall, so it
  // is a BROWN-black — warmer than the sumi keyblock two rows down —
  // and it is the STRONGEST line in the picture, which on a flat
  // panel is the whole of the drawing.
  //
  // It is also where the halo gets slid in, because the head's contour
  // is the one shape a part hands over with an overshoot AND a taper,
  // which makes it the only reliable "this is the face" in the whole
  // media interface.
  edge(s, pts, w, o = {}) {
    const g = G(s);
    if (!g.halo && o.over != null && o.taper != null) {
      g.halo = true;
      // …and it has to be face-SIZED on its own plate. Measured against
      // the plate in the part's own units, never against `s.w`: those
      // are two coordinate systems and only one of them is where `pts`
      // lives.
      const [x0, y0, x1, y1] = bbox(pts), b = plateBounds(s);
      if (b && x1 - x0 > (b[2] - b[0]) * .35 && y1 - y0 > (b[3] - b[1]) * .28) {
        if (!g.painted) temperaFace(s, pts);
        // …and then a die that does not move between boil frames.
        if (fixedOf(s, 13) < .45) halo(s, pts);
      }
    }
    const keep = s.ink;
    s.setInk(IRON);
    s.stroke(pts, w * 1.5, { ghost: false, ...o, alpha: 1, taper: .16, amp: Math.min(.16, (o.amp ?? .3)) });
    s.ink = keep;
  },
};
