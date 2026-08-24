// ---------------------------------------------------------------
// SURREALISM — oil on canvas, 1929. Magritte, Dalí, Tanguy, Ernst.
//
// The mistake everyone makes with this movement is to paint it
// WEIRDLY. Neither Magritte nor Dalí did. Magritte painted like a
// commercial illustrator — flat, sober, unhurried, no visible brush
// anywhere — and Dalí painted like a nineteenth-century academician
// with a three-hair sable. The strangeness is never in the handling.
// It is in the CONTENT, delivered deadpan.
//
// ROUND THREE. The critique: *"the weakest, because it's the one
// movement that's about content, not surface… your row just looks like
// 'blue clothing variant'. You'd need a semantic gag: an eye where it
// shouldn't be, a floating object, a shadow going the wrong way."*
//
// Right on both counts, and the two halves of the answer are in two
// different places.
//
// THE GAG lives in `backdrop()`, because a backdrop is drawn ONCE per
// character and can therefore say something instead of merely being
// made of something. Every figure now stands on the same empty plain
// under the same sky, and every figure gets exactly ONE impossible
// thing standing in it with them, dealt by a stable hash of the seed:
//
//   · THE EYE. 'The False Mirror', 1929 — and that is the same year as
//     this row: an eye the size of weather, with the sky inside it,
//     drawai's own void eye for a pupil. No face anywhere near it.
//   · THE DOOR. A door frame standing open on an empty plain, and what
//     is through it is not the plain. ('La Victoire', 'L'Embellie'.)
//   · THE KEY. 'La Clef des Champs' — an iron key at the scale of a
//     building, floating, throwing a shadow onto the ground.
//   · THE MOON. 'Le Seize Septembre' — a hard-edged crescent in a
//     cloudless blue afternoon.
//   · GOLCONDE. Twelve small bowler-hatted men suspended in rows in
//     the air, falling or not falling, nobody says.
//   · THE STONE. 'Le Château des Pyrénées' — a rock the size of a hill
//     hanging where a cloud should be.
//   · THE APPLE. Wrong-scale, green, deadpan.
//   · THE EASEL. 'La Condition Humaine' — a canvas on an easel showing
//     the same landscape it stands in, and its horizon does not quite
//     line up with the real one.
//
// And under all eight, THE SECOND SUN. The figure and the far monolith
// both throw a long hard shadow to the LEFT; the floating thing throws
// its own to the RIGHT. Nothing in the picture could cast what you are
// looking at, and no one is going to mention it. That, and not the
// palette, is the row.
//
// THE FIGURE is the other half, and the critique's squint test is
// about the FIGURE, not the backdrop. Three changes, and the first is
// the one that mattered:
//
//   · THE HEAD NOBODY COLOURED IN. `skull.js` lays PAPER under a face
//     and only then asks the medium for `skin` — and only if the
//     character has a skin colour at all. Half the sheet does not, so
//     the biggest shape on those characters was never handed to this
//     file: they stood in front of a blue sky with faces measuring
//     246,241,229, which is drawai's paper exactly. That is not pale
//     painting, it is NO painting, and it is why the row lost the
//     squint twice. It is caught at `edge()` now — see `blankFace`;
//
//   · ONE SHADOW, ONE ANGLE, ONE PLATE. The hard cast shadow used to
//     land at a random offset per mass, which is not a shadow, it is
//     dappling. It is now a half-plane whose dead-straight boundary
//     runs through the middle of the PART'S OWN PLATE at a single
//     angle for the whole sheet, so a head, a torso and a hank of hair
//     are all cut by the same edge and the figure reads as one solid
//     object with one hard shadow across it. It is thrown across the
//     side the modelling light comes from, which is the impossibility;
//   · and the paint got MORE ordinary, not less: a real academic
//     modelling with a genuine dark end to it. The row came back last
//     time the colour of the paper — a smooth even wash of bone in
//     front of a blue sky — and a figure that pale loses the squint to
//     every neighbour it has.
//
// Everything else on the character stays quiet on purpose: no facture,
// no granulation, no visible hand. The strangeness has to be the only
// strange thing.
//
// TWO THINGS THIS FILE IS CAREFUL ABOUT.
//
// 1. ONE impossible thing per shape. A window OR a horizon OR a grain,
//    never two. The failure mode of a surrealist pastiche is a page of
//    gags.
//
// 2. The anomaly is chosen by a STABLE hash of the shape, not by
//    `s.jr`. Every other style rolls its texture per boil frame and the
//    shimmer reads as the hand — but the boil is re-rolled twice a
//    second, and a sky that blinks in and out is a strobe, not a
//    painting. (The BACKDROP is exempt: it is built once per character,
//    which is exactly why the gags live there.)
// ---------------------------------------------------------------
import { nearest, step, shade, tint, sat, dens, bbox, rgb } from './pigment.js';
import { mulberry32, hashStr } from '../rng.js';

// ---- the box of paint -------------------------------------------
// Cold. Magritte's sky and Magritte's bowler black, Tanguy's dead
// plain, and a flesh the colour of a shop mannequin — which is the
// point: the people in these pictures are not warm. There is one warm
// pigment in the whole box (a dead terracotta) and it is there so a
// red-haired child is still a red-haired child.
const SKY_HI = [58, 112, 178];     // zenith — the one saturated colour in the row
const SKY_MID = [110, 158, 203];
const SKY_LO = [201, 221, 234];    // the pale band that sits ON the horizon
const CLOUD = [252, 252, 249];
const CLOUD_LO = [196, 210, 226];  // a cumulus is grey underneath
// The plain is PALE — bone, bleached, Tanguy's nowhere. It was a dark
// olive for one round and the long shadow lying on it was invisible,
// which is the whole reason the plain is there.
const PLAIN = [178, 172, 152];     // the far plain, bleached by distance
const PLAIN_D = [138, 132, 113];   // the near ground, under your feet
const DUSK = [42, 44, 52];         // what a shadow on that plain is
const SEA = [44, 80, 92];
const SAND = [186, 170, 138];
const STONE = [146, 147, 143];
const SLATE = [92, 102, 112];
const LEAF = [124, 152, 76];       // the apple, and it is a bright one
const FLESH = [201, 176, 156];
const FLESH_D = [152, 128, 112];
// what a head nobody coloured in is made of here: a shop-window
// mannequin, cast and painted, and NOT the paper it was drawn on
const PLASTER = [201, 185, 171];
const RUST = [136, 96, 82];        // the one warm thing
const NIGHT = [20, 24, 30];        // the bowler hat, and the black through the door
const LINE = [24, 27, 33];

const BOX = [SKY_MID, SEA, SLATE, STONE, SAND, FLESH, RUST, NIGHT];
// The value scale, dark to light. It ends in SKY, not in white: what a
// drawing would have shaded lightly is a piece of air here.
const RAMP = [NIGHT, SEA, SLATE, STONE, SAND, SKY_LO];

// The shadow is a MULTIPLY of a cool grey-violet, never a grey fill:
// laid over the sky it has to darken the blue and keep it blue, or the
// window stops being a window.
const SHADOW = [104, 108, 136];

// nothing in these pictures is at full chroma — it is oil paint from a
// tube, mixed with white and a little of its complement
const mute = c => sat(c, .80);

// a closed ellipse path, since a hard-edged silhouette is most of what
// this file draws and `c.ellipse` is not a primitive either hand owns
function ell(c, cx, cy, rx, ry, rot = 0) {
  const cs = Math.cos(rot), sn = Math.sin(rot);
  c.beginPath();
  for (let i = 0; i <= 48; i++) {
    const a = i / 48 * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    const px = cx + x * cs - y * sn, py = cy + x * sn + y * cs;
    i ? c.lineTo(px, py) : c.moveTo(px, py);
  }
  c.closePath();
}
const box = (c, x, y, w, h) => { c.beginPath(); c.rect(x, y, w, h); };

// ---------------------------------------------------------------
// The stable hash — the one piece of engineering in this file.
//
// It must return the SAME anomaly for the same shape on every boil
// frame. So it is fed only things the boil cannot move:
//
//   · `s.w`/`s.h` — the part's canvas, sized once from THIS
//     character's proportions. This is the important one and it took a
//     bad sheet to find it: hash the shape alone and you have hashed
//     the PART, so the same anomaly landed on the hair of all six
//     people in the row and the page read as a template;
//   · the point count, the spacing hint, the density and the colour
//     asked for — all decided in `gen()`, none of them boil;
//   · the CENTROID, in one of three columns and three rows. A blob's
//     outline wobbles by a quarter of its radius every frame, so the
//     bounding box is not usable at all (it was, in the first version,
//     and it flickered). The centroid of that wobble barely moves.
// ---------------------------------------------------------------
function dealer(s, pts, o, col) {
  const W = s.w || 256, H = s.h || 256;
  let cx = 0, cy = 0;
  for (const p of pts) { cx += p[0]; cy += p[1]; }
  cx /= pts.length; cy /= pts.length;
  const bin = (v, n) => Math.floor(Math.min(.999, Math.max(0, v)) * n);
  let h = 2166136261 >>> 0;
  const feed = v => { h = Math.imul(h ^ ((v | 0) & 0xffff), 16777619) >>> 0; };
  feed(Math.round(W)); feed(Math.round(H));       // which character, which part
  feed(bin(cx / W, 3)); feed(bin(cy / H, 3));     // which shape in it
  feed(pts.length);
  // The spacing hint is NOT stable, and it cost 0.07 on the flicker
  // meter before anyone measured it: `skull.js` asks for
  // `gap: S * s.jr(.035, .05)`, so a hint fed in raw is a fresh number
  // on every boil frame and the whole die is re-rolled twice a second.
  // What is stable about it is its ORDER OF MAGNITUDE against the
  // plate — "about a twentieth of the head" — so that is what goes in.
  // A hint that rolls over a 1.4× range cannot move a log2 bucket.
  feed(Math.floor(Math.log2(Math.max(1e-6, (o.gap ?? 1) / W))));
  feed(Math.round(dens(o.style) * 100));
  if (col) feed(col[0] + col[1] * 7 + col[2] * 13);
  return mulberry32(h || 1);
}

// ---------------------------------------------------------------
// A DIE THAT DOES NOT MOVE, off the plate's own size and nothing else.
// Everything on a character is redrawn two or three times a second
// with a fresh seed, so an `s.chance()` deciding whether a head is
// made of sky is a head that strobes.
// ---------------------------------------------------------------
function fixed01(...ns) {
  let h = 2166136261;
  for (const n of ns) { h ^= Math.round(n * 8) | 0; h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 8192) / 8192;
}
// per-canvas latch: each part is drawn on its own `Sketch`, so this is
// "has anything painted this plate yet", which is exactly the question
const G = s => (s.__surr ??= { painted: false, face: false });

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
const ellPts = (cx, cy, rx, ry, n = 56) => {
  const p = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  return p;
};

// A part draws in ITS OWN frame — pixels, y down, origin at the head's
// centre — so the plate's edges are wherever the part's transform put
// them. Asking `s.w` where a part is drawing is asking a question in
// the wrong coordinate system. The transform is right there; invert it.
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

// ---------------------------------------------------------------
// The handling: one light, always the same one, high and to the LEFT
// of every shape on the character. No brush, no grain, no hatching — a
// gradient is exactly the right tool here and is the only place in
// this project where that sentence is true.
//
// It needs a real DARK end. Round two modelled everything at a whisper
// and the whole row came back the colour of the paper it was painted
// on; against six blue skies that is not restraint, it is a hole.
// ---------------------------------------------------------------
function model(s, pts, col, k = 1) {
  const c = s.ctx;
  const [x0, y0, x1, y1] = bbox(pts);
  const w = x1 - x0, h = y1 - y0, dg = Math.hypot(w, h) || 1;
  s.poly(pts, true); c.fillStyle = rgb(col); c.fill();
  c.save(); s.poly(pts, true); c.clip();
  const lx = x0 + w * .30, ly = y0 + h * .22;
  const g = c.createRadialGradient(lx, ly, dg * .03, lx, ly, dg * .80);
  g.addColorStop(0, rgb(tint(col, .46 * k), .95));
  g.addColorStop(.30, rgb(tint(col, .14 * k), .50));
  g.addColorStop(.62, rgb(shade(col, .22 * k), .44));
  g.addColorStop(1, rgb(shade(col, .48 * k), .86));
  c.fillStyle = g; s.poly(pts, true); c.fill();
  c.restore();
}

// ---------------------------------------------------------------
// The clouds. Magritte's, and they have a rule: FLAT ALONG THE BOTTOM,
// lobed on top. Big enough to read as cloud at a thumbnail and few
// enough not to read as a pattern.
// ---------------------------------------------------------------
function cloud(s, cx, cy, w, h, R) {
  const c = s.ctx;
  const n = 3 + (R() * 2 | 0);
  const l = cx - w / 2;
  c.beginPath();
  c.moveTo(l, cy);
  for (let i = 0; i < n; i++) {
    const a = l + w * (i / n), b = l + w * ((i + 1) / n);
    const lift = h * (.9 + R() * .5);
    c.bezierCurveTo(a - w * .05, cy - lift, b + w * .05, cy - lift, b, cy);
  }
  c.closePath();
  const g = c.createLinearGradient(0, cy - h * 1.5, 0, cy);
  g.addColorStop(0, rgb(CLOUD));
  g.addColorStop(1, rgb(CLOUD_LO));
  c.fillStyle = g; c.fill();
}

// ---------------------------------------------------------------
// THE WINDOW. A shape that is not made of anything — a hole onto the
// same sky the character is standing in front of. Hard-edged against
// everything around it, high chroma, and the clouds sized to be seen.
// ---------------------------------------------------------------
function windowSky(s, pts, R) {
  const c = s.ctx;
  const [x0, y0, x1, y1] = bbox(pts);
  const w = x1 - x0, h = y1 - y0;
  c.save(); s.poly(pts, true); c.clip();

  const g = c.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, rgb(SKY_HI));
  g.addColorStop(.58, rgb(SKY_MID));
  g.addColorStop(1, rgb(SKY_LO));
  c.fillStyle = g; s.poly(pts, true); c.fill();

  // ONE or TWO, and BIG. A quarter-width cloud is a fleck of white
  // paint at row scale; half the width is weather.
  const n = 1 + (R() * 2 | 0);
  for (let i = 0; i < n; i++) {
    const cw = w * (.46 + R() * .30);
    const cx = x0 + w * (.16 + R() * .68);
    const cy = y0 + h * (.28 + R() * .46);
    cloud(s, cx, cy, cw, cw * (.20 + R() * .10), R);
  }

  // the window has a THICKNESS: a band of shadow just inside the frame,
  // so the shape reads as cut through rather than painted on
  const rim = c.createLinearGradient(0, y0, 0, y0 + h * .18);
  rim.addColorStop(0, rgb(shade(SKY_HI, .55), .52));
  rim.addColorStop(1, rgb(SKY_HI, 0));
  c.fillStyle = rim; s.poly(pts, true); c.fill();
  c.restore();
}

// ---------------------------------------------------------------
// THE WRONG SHADOW, and it is the whole of the figure's argument.
//
// ONE angle for the entire sheet, and — this is the round-three fix —
// ONE BOUNDARY PER PLATE, ruled through the middle of the part's own
// canvas rather than at a rolled offset per shape. A shadow that lands
// somewhere different on every mass is not a shadow, it is dappling;
// ruled through the plate, a skull, a fringe and a torso are all cut by
// the same straight edge and the figure reads as one solid thing.
//
// The normal points UP AND LEFT, which is where the modelling light is:
// every shape is lit and in shadow on the same side. The boundary is
// DEAD STRAIGHT and has no blur — softening it by two pixels loses the
// effect completely.
// ---------------------------------------------------------------
const SH_A = -.40;                       // the edge, radians
function castShadow(s, pts) {
  const c = s.ctx;
  const [x0, y0, x1, y1] = bbox(pts);
  const b = plateBounds(s);
  const px = b ? (b[0] + b[2]) / 2 : (x0 + x1) / 2;
  const py = b ? (b[1] + b[3]) / 2 : (y0 + y1) / 2;
  const far = (b ? Math.hypot(b[2] - b[0], b[3] - b[1]) : Math.hypot(x1 - x0, y1 - y0)) * 2 || 64;
  const dx = Math.cos(SH_A), dy = Math.sin(SH_A);
  const nx = dy, ny = -dx;                // into the shadow: up and left
  const q = [
    [px - dx * far, py - dy * far],
    [px + dx * far, py + dy * far],
    [px + dx * far + nx * far, py + dy * far + ny * far],
    [px - dx * far + nx * far, py - dy * far + ny * far],
  ];
  // c.save() flushes the brush hand's plate BEFORE the composite mode
  // changes — set it first and the pending marks get blitted through
  // the multiply as well.
  c.save(); s.poly(pts, true); c.clip();
  c.globalCompositeOperation = 'multiply';
  s.poly(q, true); c.fillStyle = rgb(SHADOW); c.fill();
  c.restore();
}

// ---------------------------------------------------------------
// THE HORIZON IN A SHAPE. The mass stops being an object and becomes a
// distance. A long climb of air over a thin far shore reads as
// somewhere very far away, seen through a hole; a landscape that filled
// the shape would read as a pattern.
// ---------------------------------------------------------------
function horizonIn(s, pts, col, R) {
  const c = s.ctx;
  const [x0, y0, x1, y1] = bbox(pts);
  const w = x1 - x0, h = y1 - y0;
  const hy = y0 + h * (.48 + R() * .18);
  const ground = R() < .5 ? SEA : PLAIN;
  c.save(); s.poly(pts, true); c.clip();

  const up = c.createLinearGradient(0, hy - h * .42, 0, hy);
  up.addColorStop(0, rgb(SKY_MID, 0));
  up.addColorStop(.40, rgb(SKY_MID, .52));
  up.addColorStop(1, rgb(SKY_LO, 1));
  c.fillStyle = up; c.fillRect(x0 - 2, hy - h * .42, w + 4, h * .42);

  // the ground stays a THIN strip: it is the far shore, not a floor
  const dn = c.createLinearGradient(0, hy, 0, hy + h * .14);
  dn.addColorStop(0, rgb(shade(ground, .12)));
  dn.addColorStop(1, rgb(ground, 0));
  c.fillStyle = dn; c.fillRect(x0 - 2, hy, w + 4, h * .14);

  cloud(s, x0 + w * (.24 + R() * .5), hy - h * .045, w * .28, h * .05, R);

  c.fillStyle = rgb(shade(ground, .62), .95);
  c.fillRect(x0 - 2, hy - Math.max(.4, h * .008), w + 4, Math.max(.9, h * .016));
  c.restore();
}

// ---------------------------------------------------------------
// THE FROTTAGE. Ernst, 1925: paper laid over floorboards and rubbed
// with a soft pencil until the plank came up through it. It is the ONE
// place the two hands get to speak in this file — everything else is a
// flat context fill, because a Magritte has no drawing left in it, but
// a rubbing IS a hand's pressure. Dealt rarely, and only to middling
// masses: a surrealist canvas that is textured all over is an Ernst
// pastiche, and this row is a Magritte.
// ---------------------------------------------------------------
function frottage(s, pts, col, R) {
  const c = s.ctx;
  const [x0, y0, x1, y1] = bbox(pts);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const dg = Math.hypot(x1 - x0, y1 - y0) || 1;
  const a = R() < .62 ? Math.PI / 2 + (R() - .5) * .5 : (R() - .5) * .5;   // mostly vertical boards
  const gx = Math.cos(a), gy = Math.sin(a);          // along the grain
  const nx = -gy, ny = gx;                           // across it
  const span = dg * .62, len = dg * .78;

  const knots = [];
  for (let k = 0, n = 1 + (R() < .45 ? 1 : 0); k < n; k++)
    knots.push([(R() - .5) * len * .7, (R() - .5) * span * .8, dg * (.045 + R() * .05)]);

  const lines = 11 + (R() * 6 | 0);
  const ink = shade(col, .52);
  c.save(); s.poly(pts, true); c.clip();
  for (let i = 0; i < lines; i++) {
    const o0 = (i / (lines - 1) - .5) * span;
    const path = [];
    for (let j = 0; j <= 16; j++) {
      const t = (j / 16 - .5) * len;
      let o = o0 + Math.sin(t / dg * 5.2 + o0 / dg * 3.1) * dg * .012;
      for (const [kt, ko, kr] of knots) {
        const d = o0 - ko, ad = Math.abs(d);
        if (ad > kr * 4) continue;
        const dt = t - kt;
        const bulge = Math.max(0, kr * kr - dt * dt * .55);
        if (bulge <= 0) continue;
        o += Math.sign(d || 1) * Math.sqrt(bulge) * Math.exp(-ad / (kr * 1.7));
      }
      path.push([cx + gx * t + nx * o, cy + gy * t + ny * o]);
    }
    s.sline(path, Math.max(.7, dg * .008), .45, rgb(ink, .42));
  }
  c.restore();
}

// ---------------------------------------------------------------
// THE HEAD NOBODY COLOURED IN, and it is the reason this row lost the
// squint test twice running.
//
// `skull.js` lays down PAPER under the face and only then asks the
// medium for `skin` — and only if the character HAS a skin colour. A
// white cat, a bald nightmare, half the sheet: the biggest shape on
// the character was never handed to this file at all, so six figures
// stood in front of six blue skies with faces exactly the colour of
// the paper. It measured 246,241,229. That is not pale painting, that
// is no painting.
//
// So an unpainted head is caught at `edge()` — the head's contour is
// the one shape a part hands over with an overshoot AND a taper, which
// makes it the only reliable "this is the face" in the media interface
// — and painted. A Magritte head is either a cast MANNEQUIN, modelled
// like a shop dummy, or it is a hole with the sky behind it, and one
// head in five being the second is the deadpan rate.
//
// The outline arrives OPEN at the crown, so the cap is closed with an
// ellipse and the two are filled through ONE clip: two overlapping
// gradients leave a seam straight down the middle of the face.
// ---------------------------------------------------------------
function blankFace(s, pts) {
  const c = s.ctx;
  const [x0, y0, x1, y1] = bbox(pts);
  const closed = pts.concat([pts[0]]);
  const cap = ellPts((x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) * .46, (y1 - y0) * .46);
  const shapes = [closed, cap];
  let a0 = 1e9, b0 = 1e9, a1 = -1e9, b1 = -1e9;
  for (const sh of shapes) {
    const b = bbox(sh);
    a0 = Math.min(a0, b[0]); b0 = Math.min(b0, b[1]);
    a1 = Math.max(a1, b[2]); b1 = Math.max(b1, b[3]);
  }
  // the silhouette is the CLIP; the paint is handed a plain rectangle,
  // so `model` and `windowSky` need to know nothing about crowns
  const pad = [[a0 - 2, b0 - 2], [a1 + 2, b0 - 2], [a1 + 2, b1 + 2], [a0 - 2, b1 + 2]];
  c.save(); clipUnion(c, shapes);
  const die = fixed01(s.w, s.h, 19);
  if (die < .20) windowSky(s, pad, mulberry32(((die * 8192) | 0) + 7));
  else { model(s, pad, PLASTER, 1); castShadow(s, pad); }
  c.restore();
}

// =================================================================
// THE PLAIN, AND THE ONE IMPOSSIBLE THING STANDING IN IT.
// Everything below here is `backdrop()`. It is built once per
// character, never per boil frame, so it may roll as freely as it
// likes and nothing it draws can ever flicker.
// =================================================================

function skyGrad(c, hy) {
  const g = c.createLinearGradient(0, 0, 0, hy);
  g.addColorStop(0, rgb(shade(SKY_HI, .18)));
  g.addColorStop(.30, rgb(SKY_HI));
  g.addColorStop(.68, rgb(SKY_MID));
  g.addColorStop(1, rgb(SKY_LO));
  return g;
}

// ---- WHERE the impossible thing stands --------------------------
// The first build of this put the gags in the middle of the sky and
// every one of them landed behind a head. A character is centred and
// nearly as wide as its panel, so the only free canvas is the corners:
// a column of sky up one side, and the far half of the plain. The
// placement is therefore decided ONCE, before the gag is drawn, and
// every gag is authored against it.
//
//   `gx, gy` — the anchor, in a top corner, on the side `sgn` says;
//   `r`      — the thing's size, one number, so nothing overruns;
//   `sx`     — where its shadow lands on the plain, and it is ALWAYS
//              the far side from the figure's own, which runs left.
function place(s, w, h, hy, floor) {
  const right = s.chance(.55);
  const sgn = right ? 1 : -1;
  const gx = right ? w * s.jr(.70, .88) : w * s.jr(.12, .30);
  const r = w * s.jr(.135, .175);
  // `gy` is the object's CENTRE and it is derived from `r`, never
  // rolled beside it: rolled independently, the big gags came out with
  // their tops sliced off by the top of the panel — a floating rock
  // that has been cropped is a wall, not a rock.
  // 1.85 is not a taste: it is the tallest thing any of the eight
  // reaches above its own centre (the key's bow, the apple's stalk),
  // and a floating rock that has been sliced off by the top of the
  // panel is a wall, not a rock. Overlapping the HEAD below is fine —
  // the panel is behind the figure and being partly hidden is what
  // says so.
  const gy = r * 1.85 + h * s.jr(.005, .030);
  return { w, h, hy, floor, sgn, gx, gy, r, sx: w * s.jr(.66, .90) };
}

// THE SECOND SUN. A floating thing throws a hard shadow onto the plain
// — and it throws it to the RIGHT, while the figure throws its own to
// the LEFT. Two suns in one afternoon, both perfectly ordinary, and
// nobody in the picture is going to mention it.
function otherShadow(s, G, r) {
  const c = s.ctx;
  ell(c, G.sx, G.floor - G.h * .012, r * 2.1, Math.max(2, r * .24), -.03);
  c.fillStyle = rgb(DUSK, .62); c.fill();
}

// a rounded silhouette from a jittered radius — the rock, and the
// apple, and anything else that has to look solid and hand-shaped
function lumpPath(c, cx, cy, r, R, k = .14, n = 22) {
  const ph = R() * 6.28;
  c.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = i / n * Math.PI * 2;
    const m = 1 + k * (Math.sin(a * 3 + ph) * .6 + Math.sin(a * 5 + ph * 1.7) * .4);
    const x = cx + Math.cos(a) * r * m, y = cy + Math.sin(a) * r * m * .92;
    i ? c.lineTo(x, y) : c.moveTo(x, y);
  }
  c.closePath();
}

// ---- the eight gags ---------------------------------------------
// Each puts ONE thing in the panel, at the anchor `place()` chose.
// Every one is drawn slick and hard-edged: no facture, no wobble,
// nothing that looks like it was enjoyed. The strangeness is the only
// strange thing in the picture.

// THE FALSE MIRROR, 1929, and the date is not a coincidence: an eye
// the size of weather, with the sky inside it. Drawai's own void eye is
// a black oval, so it is the pupil; the iris is the same air the
// character is standing in front of. A plain black oval was tried
// first and it is invisible — a dark shape high in a dark blue sky is
// a smudge, and a gag nobody can see is not a gag.
function gagEye(s, G) {
  const c = s.ctx, r = G.r * 1.25;
  const x = G.gx, y = G.gy, tilt = s.jr(-.10, .10);
  // the white of it — the one really light thing in the sky
  ell(c, x, y, r, r * .62, tilt);
  c.fillStyle = rgb(CLOUD); c.fill();
  // the iris: sky, with weather in it
  c.save(); ell(c, x, y, r, r * .62, tilt); c.clip();
  ell(c, x, y, r * .50, r * .50);
  c.fillStyle = rgb(SKY_MID); c.fill();
  c.save(); ell(c, x, y, r * .50, r * .50); c.clip();
  cloud(s, x - r * .10, y + r * .16, r * .74, r * .13, () => s.jr(0, 1));
  c.restore();
  c.restore();
  ell(c, x, y, r * .22, r * .22);
  c.fillStyle = rgb(NIGHT); c.fill();
  // and the lid, drawn as the two arcs a lid is
  ell(c, x, y, r, r * .62, tilt);
  c.strokeStyle = rgb(NIGHT, .92); c.lineWidth = Math.max(1.4, r * .075); c.stroke();
  otherShadow(s, G, r * .8);
}

function gagDoor(s, G) {
  const c = s.ctx, { w, h, floor } = G;
  const dh = h * s.jr(.20, .26), dw = dh * s.jr(.42, .50);
  // hard to the edge: a thing standing ON the plain stands at the
  // figure's own height, where the figure is at its widest, so anything
  // less than this is a door behind a torso
  const dx = G.gx + G.sgn * w * .09 - dw / 2;
  const dy = floor - h * .045 - dh;
  // the jamb: a plain painted frame, stood in nothing at all
  box(c, dx - dw * .11, dy - dh * .06, dw * 1.22, dh * 1.06);
  c.fillStyle = rgb(tint(STONE, .38)); c.fill();
  // and what is through it is not the plain behind it
  box(c, dx, dy, dw, dh);
  c.fillStyle = rgb(NIGHT); c.fill();
  // the leaf, standing open at an angle, catching the light
  const sw = dw * s.jr(.55, .85), lean = dw * .28;
  c.beginPath();
  c.moveTo(dx + dw, dy);
  c.lineTo(dx + dw + sw, dy - lean * .35);
  c.lineTo(dx + dw + sw, dy + dh - lean * .12);
  c.lineTo(dx + dw, dy + dh);
  c.closePath();
  c.fillStyle = rgb(shade(STONE, .20)); c.fill();
  c.strokeStyle = rgb(LINE, .55); c.lineWidth = Math.max(.8, w * .004); c.stroke();
  // a door standing in the open has a shadow, and it is a long slab
  c.fillStyle = rgb(DUSK, .55);
  c.beginPath();
  c.moveTo(dx, dy + dh); c.lineTo(dx + dw + sw, dy + dh);
  c.lineTo(dx + dw + sw + dh * .9, dy + dh + h * .030);
  c.lineTo(dx + dh * .9, dy + dh + h * .030);
  c.closePath(); c.fill();
}

function gagKey(s, G) {
  const c = s.ctx;
  const L = G.r * 2.6;
  const kx = G.gx, ky = G.gy;
  const a = s.jr(-1.0, -.35), cs = Math.cos(a), sn = Math.sin(a);
  const T = (u, v) => [kx + u * cs - v * sn, ky + u * sn + v * cs];
  const sh = L * .070;
  const iron = shade(SLATE, .42);
  // the bow: a ring, and a ring is the one thing a key cannot be
  // mistaken for anything else with
  const bw = L * .21;
  const [bx, by] = T(-L * .40, 0);
  ell(c, bx, by, bw, bw * .92, a);
  c.fillStyle = rgb(iron); c.fill();
  ell(c, bx, by, bw * .48, bw * .44, a);
  c.fillStyle = rgb(SKY_MID); c.fill();     // punched through — you see sky
  c.beginPath();
  for (const [u, v] of [[-L * .34, -sh], [L * .50, -sh], [L * .50, sh], [-L * .34, sh]]) {
    const p = T(u, v); c.lineTo(p[0], p[1]);
  }
  c.closePath(); c.fillStyle = rgb(iron); c.fill();
  // the bit: two teeth
  for (const u of [L * .30, L * .44]) {
    c.beginPath();
    for (const [uu, vv] of [[u, sh], [u + L * .060, sh], [u + L * .060, sh + L * .15], [u, sh + L * .15]]) {
      const p = T(uu, vv); c.lineTo(p[0], p[1]);
    }
    c.closePath(); c.fillStyle = rgb(iron); c.fill();
  }
  otherShadow(s, G, L * .34);
}

function gagMoon(s, G) {
  const c = s.ctx, r = G.r * 1.05;
  const x = G.gx, y = G.gy;
  ell(c, x, y, r, r);
  c.fillStyle = rgb(tint(SAND, .66)); c.fill();
  // the crescent is cut with the sky itself, so the bite is exactly
  // the colour of the air behind it and the edge stays hard
  const d = r * s.jr(.44, .62);
  ell(c, x + d, y - d * .30, r * 1.02, r * 1.02);
  c.fillStyle = skyGrad(c, G.hy); c.fill();
}

// GOLCONDE. Small men in bowler hats suspended in rows in the air,
// falling or not falling, nobody says. This one wants the whole sky
// rather than a corner — it is a weather, not an object — so it thins
// out where the figure is and crowds the edges.
function gagGolconde(s, G) {
  const c = s.ctx, { w, h, hy } = G;
  const u = h * s.jr(.026, .034);
  const cols = 5, rows = 3;
  const y0 = h * s.jr(.07, .12), sy = h * s.jr(.115, .150);
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const x = w * (.06 + .88 * ((k + (r % 2 ? .5 : 0)) / (cols - 1 + .5)));
    const y = y0 + sy * r;
    if (y > hy - u * 2) continue;
    const dk = shade(NIGHT, r * .12);
    // the coat is NARROWER than the hat's brim, or the whole man reads
    // as one dark post and the bowler — which is the entire joke — is
    // invisible at row scale
    c.beginPath();
    c.moveTo(x - u * .40, y + u * 2.5); c.lineTo(x - u * .34, y + u * .60);
    c.lineTo(x + u * .34, y + u * .60); c.lineTo(x + u * .40, y + u * 2.5);
    c.closePath(); c.fillStyle = rgb(dk, .94); c.fill();
    ell(c, x, y + u * .32, u * .32, u * .36);
    c.fillStyle = rgb(tint(FLESH_D, .16), .94); c.fill();
    ell(c, x, y - u * .02, u * .34, u * .27);
    c.fillStyle = rgb(dk, .96); c.fill();
    box(c, x - u * .58, y + u * .04, u * 1.16, Math.max(1.2, u * .15));
    c.fillStyle = rgb(dk, .96); c.fill();
  }
}

function gagStone(s, G) {
  const c = s.ctx, r = G.r * 1.30;
  const x = G.gx, y = G.gy;
  // the phase is rolled ONCE and handed to every call: rolled per call,
  // the fill, the clip and the contour are three different rocks
  const ph = s.jr(0, 1), flat = () => ph;
  lumpPath(c, x, y, r, flat, .17, 20);
  c.fillStyle = rgb(shade(STONE, .32)); c.fill();
  // a lit crown: the same rock a shade paler, offset up-left, so it has
  // a sunlit top and a bulk under it
  c.save(); lumpPath(c, x, y, r, flat, .17, 20); c.clip();
  lumpPath(c, x - r * .10, y - r * .32, r * .96, flat, .17, 20);
  c.fillStyle = rgb(tint(STONE, .34), .92); c.fill();
  c.restore();
  lumpPath(c, x, y, r, flat, .17, 20);
  c.strokeStyle = rgb(LINE, .35); c.lineWidth = Math.max(.7, G.w * .004); c.stroke();
  otherShadow(s, G, r * .9);
}

function gagApple(s, G) {
  const c = s.ctx, r = G.r;
  const x = G.gx, y = G.gy;
  const flat = () => .5;
  lumpPath(c, x, y + r * .06, r, flat, .09, 24);
  c.fillStyle = rgb(LEAF); c.fill();
  c.save(); lumpPath(c, x, y + r * .06, r, flat, .09, 24); c.clip();
  ell(c, x - r * .30, y - r * .34, r * .52, r * .40, -.5);
  c.fillStyle = rgb(tint(LEAF, .32), .55); c.fill();
  ell(c, x, y - r * 1.02, r * .46, r * .30);
  c.fillStyle = rgb(shade(LEAF, .45), .8); c.fill();
  c.restore();
  box(c, x - r * .05, y - r * 1.14, Math.max(1.4, r * .11), r * .30);
  c.fillStyle = rgb(shade(RUST, .40)); c.fill();
  otherShadow(s, G, r * .85);
}

function gagEasel(s, G) {
  const c = s.ctx, { w, h, floor } = G;
  const cw = w * s.jr(.22, .29), ch = cw * s.jr(.80, .96);
  const cx = G.gx + G.sgn * w * .09;      // see `gagDoor` — right out at the edge
  const top = floor - h * .055 - ch;
  const x0 = cx - cw / 2;
  // the legs, behind
  c.strokeStyle = rgb(shade(RUST, .50)); c.lineWidth = Math.max(1.4, w * .009);
  for (const dx of [-cw * .36, cw * .36, 0]) {
    c.beginPath(); c.moveTo(cx + dx * .3, top + ch * .12);
    c.lineTo(cx + dx, floor - h * .010); c.stroke();
  }
  // the canvas: the same landscape, and its horizon does not line up
  // with the one it is standing in. That is the entire painting.
  const off = ch * s.jr(.12, .24) * (s.chance(.5) ? 1 : -1);
  const ihy = top + ch * .62 + off;
  c.save(); box(c, x0, top, cw, ch); c.clip();
  const g = c.createLinearGradient(0, top, 0, ihy);
  g.addColorStop(0, rgb(SKY_HI)); g.addColorStop(1, rgb(SKY_LO));
  c.fillStyle = g; c.fillRect(x0, top, cw, ihy - top);
  c.fillStyle = rgb(PLAIN); c.fillRect(x0, ihy, cw, top + ch - ihy);
  c.fillStyle = rgb(DUSK, .9); c.fillRect(x0, ihy - 1, cw, Math.max(1.4, ch * .012));
  cloud(s, x0 + cw * s.jr(.25, .7), ihy - ch * s.jr(.22, .40), cw * .42, cw * .10, () => s.jr(0, 1));
  c.restore();
  // the stretcher, pale, so the canvas reads as an object in the world
  box(c, x0, top, cw, ch);
  c.strokeStyle = rgb(tint(SAND, .54)); c.lineWidth = Math.max(1.8, w * .012); c.stroke();
  otherShadow(s, G, cw * .42);
}

const GAGS = [gagEye, gagDoor, gagKey, gagMoon, gagGolconde, gagStone, gagApple, gagEasel];
// the three that own the picture's own space — the two standing ON the
// plain, and the sky full of falling men — so the far monolith and the
// clouds stay out of their way
const GROUNDED = new Set([gagDoor, gagEasel, gagGolconde]);

export default {
  id: 'surrealism', label: 'surrealism', era: 1929,
  underdraw: false,

  // Bowler black. Magritte's blacks are never lamp black and never
  // warm — they are the blue-black of a good hat, and the void eyes,
  // the nostrils and the contours all resolve through this.
  ink: NIGHT,

  // Smooth academic priming, pulled COOL. The row's warmth has been
  // taken out at every level and this is the first one.
  ground: [226, 227, 221],

  // A window onto a plain, and it runs the full width of the cell so
  // the six panels TOUCH and the row reads as ONE landscape with six
  // people standing about in it — a great deal more Magritte than six
  // postcards.
  //
  // The height is not free either, and it is not decoration: a
  // character is centred and nearly as wide as its cell, so the only
  // canvas a gag can stand in is the sky ABOVE the head. `h/2 + y` is
  // how much panel there is above the feet, and it went from .88 cells
  // to 1.07 for exactly that reason. It cannot go much further — the
  // sheet's rows are one cell apart and each carries a torn band of its
  // own ground, so a taller panel bites a strip of sky out of the row
  // above.
  panel: { w: 1.0, h: 1.20, y: .47 },

  // ---------------------------------------------------------------
  // Every character stands on the same plain under the same sky, and
  // every character gets exactly one impossible thing to stand next to.
  // The gag is dealt off a hash of the SEED, so it is this character's
  // gag and it is the same one every time the page is loaded.
  //
  // The sun is on the RIGHT — the figure's shadow and the monolith's
  // both run left. The floating thing's runs the other way. The
  // modelling on the figure itself lights it from the LEFT. Every one
  // of those is perfectly ordinary on its own.
  // ---------------------------------------------------------------
  backdrop(s, { w, h, seed, floor }) {
    const c = s.ctx;
    const hy = floor - h * .105;             // the horizon, just above the feet

    c.fillStyle = skyGrad(c, hy); c.fillRect(0, 0, w, hy);

    // the plain: bleached where it meets the sky, heavy underfoot
    const gnd = c.createLinearGradient(0, hy, 0, h);
    gnd.addColorStop(0, rgb(PLAIN));
    gnd.addColorStop(.35, rgb(shade(PLAIN, .18)));
    gnd.addColorStop(1, rgb(PLAIN_D));
    c.fillStyle = gnd; c.fillRect(0, hy, w, h - hy);

    // THE GAG. One per character, dealt by the seed and nothing else.
    const gag = GAGS[hashStr(`surreal:${seed}`) % GAGS.length];
    const G = place(s, w, h, hy, floor);

    // Clouds, small and high — they are the scale of the sky. They keep
    // off the corner the gag has taken: a cumulus behind a floating
    // rock is the one thing that can make a floating rock look like
    // weather.
    const n = 2 + s.ri(0, 1);
    for (let i = 0; i < n; i++) {
      const cw = w * s.jr(.26, .46);
      const cx = G.sgn > 0 ? s.jr(-w * .1, w * .48) : s.jr(w * .52, w * 1.1);
      cloud(s, cx, hy - h * s.jr(.16, .42), cw, cw * s.jr(.18, .26), () => s.jr(0, 1));
    }

    // THE FAR MONOLITH — Tanguy's, doing all of the deep-space work for
    // four lines: it says the plain is enormous and it says the light
    // is low and on the right. It stands aside for the gags that stand
    // on the ground themselves.
    if (!GROUNDED.has(gag)) {
      const mx = G.sgn > 0 ? w * s.jr(.16, .44) : w * s.jr(.56, .86);
      const mw = w * s.jr(.030, .052), mh = mw * s.jr(2.6, 5.0);
      const msh = mw * s.jr(8, 13);
      c.fillStyle = rgb(DUSK, .42);
      c.beginPath();
      c.moveTo(mx, hy); c.lineTo(mx + mw, hy);
      c.lineTo(mx - msh, hy + mh * .22); c.lineTo(mx - msh - mw * .6, hy + mh * .22);
      c.closePath(); c.fill();
      c.fillStyle = rgb(shade(SLATE, .52));
      c.fillRect(mx, hy - mh, mw, mh);
      c.fillStyle = rgb(tint(SLATE, .26), .85);
      c.fillRect(mx + mw * .60, hy - mh, mw * .40, mh);     // its lit right side
    }

    gag(s, G);

    // THE FIGURE'S SHADOW, and it is the wrong shape for the figure: a
    // long hard-edged slab, cast by a rectangular block that is not
    // there. Dead straight, no blur, and much darker than the ground it
    // lies on — a soft one reads as ordinary shading, which is exactly
    // what killed the first version of this. It sits FORWARD of the
    // feet: laid exactly on the drawai pencil ground line it was twenty
    // pixels tall and completely hidden behind it.
    const fx = w * .5;
    const y0 = floor + h * .030, t0 = h * .050;      // at the feet
    const x1 = fx - w * s.jr(.62, .95);              // the blunt far end
    const y1 = floor - h * .048, t1 = h * .020;
    c.fillStyle = rgb(DUSK, .92);
    c.beginPath();
    c.moveTo(fx + w * .09, y0 - t0); c.lineTo(fx + w * .09, y0 + t0);
    c.lineTo(x1, y1 + t1); c.lineTo(x1, y1 - t1);
    c.closePath(); c.fill();

    // the horizon: RULED. One straight edge in a world of wobble, and
    // dark enough that the pale sky above it reads as distance.
    c.fillStyle = rgb(DUSK, .92);
    c.fillRect(0, hy - Math.max(1, h * .003), w, Math.max(2, h * .006));
  },

  tone(s, pts, o = {}) {
    G(s).painted = true;
    const d = dens(o.style);
    const R = dealer(s, pts, o, o.col);
    const u = R();

    // WHICH shapes get an anomaly is the whole art direction.
    //
    // `airy` — no colour asked for, almost no weight — is where the
    // drawing underneath would have left the paper showing, and nothing
    // is left showing here: a halo, a bare limb and the white of an eye
    // are exactly the shapes that can afford to be a hole.
    //
    // `big` is measured against the part's OWN spacing hint rather than
    // in pixels, which is the only scale-free ruler in the contract: a
    // part asks for a gap of about a twentieth of the head, so a mass
    // thirty gaps across is hair or a torso and one four gaps across is
    // an eye. Magritte put the sky in the large calm shape, never in
    // the fiddly one — and he put it there OFTEN.
    const airy = !o.col && d <= .42;
    const [bx0, by0, bx1, by1] = bbox(pts);
    const dg = Math.hypot(bx1 - bx0, by1 - by0);
    const big = o.gap > 0 && dg > o.gap * 14;
    const mid = o.gap > 0 && dg > o.gap * 7;

    // .24 and not .46. Two reasons, and the second is the one that
    // decides it: at nearly half, three characters in six came back
    // wearing a sky for hair and a hole that common is not a hole —
    // and a mass filled with blue standing in front of a blue backdrop
    // is mass the figure has GIVEN AWAY, which is the exact opposite of
    // what the squint test is asking for. The sky belongs in the space;
    // on the character it is an event.
    const pWin = airy ? .72 : big ? .24 : mid ? .11 : .03;
    if (u < pWin) { windowSky(s, pts, R); return; }

    const col = o.col
      ? mute(nearest(o.col, BOX))
      : step([255 * (1 - d), 255 * (1 - d), 255 * (1 - d)], RAMP);

    // re-normalised, so the bands below are honest rates among the
    // shapes that did NOT become a window
    const t = (u - pWin) / (1 - pWin);

    model(s, pts, col);
    // the anomaly INSIDE the mass, at most one, and rarely: the row's
    // strangeness is in the space now, and a figure that is itself made
    // of six impossible things is a cartoon about surrealism.
    if (big && t < .22) horizonIn(s, pts, col, R);
    else if (mid && t < .34) frottage(s, pts, col, R);
    // …and then the shadow that could not be there, on everything.
    castShadow(s, pts);
  },

  skin(s, pts, col, o = {}) {
    G(s).painted = true;
    const R = dealer(s, pts, o, col);
    const u = R();
    // A head is the biggest calm shape a character owns and it is the
    // one window everybody recognises — 'The False Mirror' is an eye
    // full of exactly this sky, and Dalí filled a head with a landscape
    // twenty times. One face in six is the deadpan rate: often enough
    // that the row has a hole in it, rare enough that it is not a joke.
    if (u < .17) { windowSky(s, pts, R); return; }
    // A shop-mannequin flesh: the tube colour pulled toward grey and
    // cooled, then MODELLED hard. Round two knocked it so pale that the
    // faces came back the colour of the sheet and six characters read
    // as unpainted — pale is the register, paper is not.
    const base = nearest(col, [FLESH, FLESH_D, SAND, STONE]);
    const flesh = shade(sat(base, .62), .10);
    model(s, pts, flesh, 1);
    if (u < .26) horizonIn(s, pts, flesh, R);
    castShadow(s, pts);
  },

  // Even, quiet, and the same every time — and it is a PLAIN
  // ctx.stroke, the only style here that does not go through the
  // ribbon. That is deliberate. `s.stroke` was tried first with its
  // wobble turned right down, and in both hands the row still came out
  // as a drawing with paint on it: a granulated ribbon is a pencil no
  // matter how straight you make it, and it announces the hand on every
  // contour. A surrealist canvas has no drawing left in it. (The
  // frottage is where the hand speaks instead — a rubbing is a hand's
  // pressure, and a contour here is not.)
  //
  // `pts` is closed by the caller, so this never closes the path — a
  // few parts hand over a deliberately OPEN outline and closing it
  // would rule a chord across the face. `o` is taken and ignored on
  // purpose: its `amp` is a wobble hint, and there is no wobble here.
  edge(s, pts, w, o = {}) {
    const c = s.ctx;
    // …and this is where a head nobody coloured in gets painted, before
    // the contour goes round it. See `blankFace`.
    const g = G(s);
    if (!g.face && !g.painted && o.over != null && o.taper != null) {
      g.face = true;
      const [x0, y0, x1, y1] = bbox(pts), b = plateBounds(s);
      if (b && x1 - x0 > (b[2] - b[0]) * .35 && y1 - y0 > (b[3] - b[1]) * .28) blankFace(s, pts);
    }
    c.save();
    s.poly(pts, false);
    c.strokeStyle = rgb(LINE, .95);
    c.lineWidth = w * .95; c.lineJoin = 'round'; c.lineCap = 'round';
    c.stroke();
    c.restore();
  },
};
