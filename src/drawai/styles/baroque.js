// ---------------------------------------------------------------
// BAROQUE — oil on a brown ground, c. 1620. Caravaggio, Ribera.
//
// TENEBRISM, which is not "dark painting": it is a painting with the
// middle taken out of it. One violent raking light comes in from the
// left, whatever it touches goes almost to lead white, and everything
// it misses is not shaded — it is ABSENT. A bituminous warm black with
// nothing in it. The drama is entirely in that one missing step.
//
// THE BLACK IS THE GROUND, NOT A SHADOW ON THE FIGURE. That is the
// sentence this file is built around, and it is the whole difference
// between a Caravaggio and a well-shaded doll. In the Calling of St
// Matthew the shadow side of a shoulder is the same value as the wall
// behind it and you cannot say where the man stops. So the style
// declares its own PAPER — a dark red-brown bole, `GROUND` — and then
// every deep stop in every gradient walks out to that exact colour at
// the far contour, where no contour is drawn. The figure does not sit
// ON the ground; half of it IS the ground. Before that the row was a
// lit-and-dark cutout ringed by its own outline on bright cream, and
// it was indistinguishable from Renaissance at thumbnail.
//
// The rest, and each of these is a line of code below:
//   · ONE light, and every shape in the picture obeys it. It is LOW —
//     about thirty degrees above the horizon, which is a window and
//     not a ceiling — so the terminator cuts a form on the diagonal
//     instead of banding it like a sunset.
//   · the light is CLOSE, not the sun: the hot spot sits inside the
//     form and the dark sweeps round it, so the terminator CURVES.
//   · an ABRUPT terminator — two stops, a few hundredths apart — but
//     never a clean one: `scumble` breaks it with wet-in-wet dabs, so
//     the turn has grain and edges in it rather than being an
//     airbrushed ramp. A Ribera terminator is a series of strokes.
//   · thick paint in the light, thin paint in the dark.
//   · the turning edge of flesh goes RED before it goes black.
//   · LOCAL COLOUR SURVIVES THE GLAZE. A dark manner is not a
//     colourless one — Caravaggio's cloaks are vermilion and lake. The
//     box answers for the character's colour but only meets it half
//     way, and the lit plane is re-saturated on the way up, so a red
//     bob comes out red and a blue hood blue.
//   · EVERY closed mass gets a lit plane and a plane in shadow. A
//     white cat asks for no fill at all — the part lays paper and asks
//     only for a contour — and it used to come back evenly lit, which
//     in a row built on "lit side / dark side" reads as Renaissance.
//     Now `edge` closes the open outline into a ring and GLAZES it:
//     transparent in the light, so the paper stays the cat, opaque in
//     the dark. A tenebrist has no evenly lit objects.
//   · the shadow is warm and not quite opaque, and the darkest place
//     on a form is the TERMINATOR, never the far edge — the far edge
//     lifts, but only as far as the ground, and nothing is drawn on
//     it (see the removed bounce, below).
//   · a RIM. Where a dark mass turns against the dark it keeps a thin
//     lit edge, and that is what stops a tenebrist picture becoming a
//     silhouette — it is also what keeps a void eye alive inside a
//     black cheek, which is the whole drama of the face.
//   · NO contour on the shadow side. None. The black is the drawing
//     there, and now the black continues past the figure.
//   · THE PAPER THAT BITES BACK IS BOLE. The hand's granulation is
//     painted in the paper's own colour, which on cream is invisible
//     and on a near-black ground is white noise. `bole()` answers the
//     one call that asks. It was the single largest thing wrong with
//     the row and it is thirty lines down.
//   · ONE HOT HIGHLIGHT, and only one. The brightest thing in a
//     Caravaggio is a single specular on the sitter's brow, and it is
//     smaller than a thumbnail. The row used to spend lead white
//     everywhere — a pale impasto on every mass, a lead-white rim
//     round every dark one, a near-white flare on every lit contour —
//     and a picture with fifteen brightest things in it has none. So
//     every other white in the file was walked back to ochre, and the
//     one specular goes on the FACE, where the light is pointed.
//   · and the VOID has no edges. `backdrop()` paints the only thing
//     behind the figure that a tenebrist picture has: one pool of
//     lamplight on a wall, raking in on the same vector as the light
//     on the figure, dying to nothing long before the panel's own
//     edge — with the figure's own shadow thrown across it, away from
//     the lamp, and a hard short one on the floor at its feet. Nothing
//     is squared off, nothing is framed: a rectangle of dark behind a
//     character is a flat drawn on stage, and the note that killed the
//     old one was exactly that.
//
// Tried and rejected: killing the contour on both sides. Even with a
// dark ground the LIT edge has to be stated or the lit half dissolves
// into it and the head loses its shape.
//
// Tried and REMOVED: the bounce, a warm hairline along the far
// contour. It was right when the ground was a mid-brown. Once the
// ground went to the value it actually is — near black — the bounce
// was the only thing left visible in the dark half, so it re-stated
// the exact silhouette the ground had been darkened to dissolve. A
// dark that keeps one legible line in it is not a dark.
// ---------------------------------------------------------------
import { nearest, step, shade, tint, mix, sat, dens, bbox, centroid, inside, rgb, lum } from './pigment.js';

// THE LIGHT. From the left and LOW — cos/sin of this angle point
// TOWARD the lamp in canvas space (y is down), so it sits about 30°
// above the horizon. It was 54° up for two builds and every head came
// back lit from over its own shoulder, which is a portrait lamp; a
// raking window light is what makes a terminator run diagonally
// across a form instead of ringing it. Shared by every shape on the
// character — parts are only translated onto the character's frame,
// never rotated, so one vector holds for all of them.
const LIGHT = -2.62;
const LX = Math.cos(LIGHT), LY = Math.sin(LIGHT);   // points TOWARD the lamp

// the palette of a dark manner: lead white, Naples yellow, the two
// ochres, vermilion, madder lake, umber, bone black in bitumen — and
// the two dull, expensive-to-avoid cloth colours he did use
const HOT = [252, 243, 214];
const SPEC = [255, 252, 240];    // the one specular, and the only place it is spent
const LEAD = [234, 221, 190];
const NAPLES = [212, 174, 110];
const OCHRE = [170, 122, 58];
const SIENNA = [134, 78, 40];
const VERMILION = [186, 62, 34];
const RED = [130, 50, 36];
const MADDER = [92, 30, 36];
const UMBER = [58, 41, 27];
const BITUMEN = [20, 15, 11];
const OLIVE = [64, 64, 44];
const INDIGO = [40, 46, 66];
const BICE = [58, 84, 106];

// THE GROUND. Not a backdrop: a red-brown BOLE priming, and it is the
// first technical fact of the medium. Caravaggio scumbles his lights
// over it and leaves it showing as the dark — his shadows are very
// largely unpainted ground — so the figure's dark half is not a
// shadow ON the figure at all, it is the ground still visible through
// it. `src/styles/index.js` lays this behind the row, and every deep
// stop below walks toward it: at the far contour the form arrives at
// exactly this colour, so the silhouette has nothing left to state
// and the edge simply stops existing. On a page with no band (the
// crowd keeps drawai's cream) the same stop reads as a warm bounce,
// which is what it also is.
//
// AND IT IS NEARLY BLACK, because that is what a bole ground is. It was
// [74,48,35] for a round — a handsome cocoa — and the row read at
// thumbnail as "the brown one", one seat along from Renaissance's
// ochre. A tenebrist ground is dark enough that the shadow half of a
// figure has literally nothing in it and the picture is only its lit
// third. The hue survives at reading distance; at squint distance the
// row is a black strip with six pools of lamplight punched into it,
// and nothing else on the sheet looks remotely like that.
//
// The backdrop below therefore only ever ADDS light. It never darkens,
// because a panel that darkens has corners, and a corner is the one
// thing a void may not have.
export const GROUND = [33, 22, 17];

// VERMILION and BICE are in here so the sheet is not all tea. They
// are the two or three chromatic notes a Caravaggio actually has, and
// without them the row shares a hue band with three of its neighbours.
const BOX = [LEAD, NAPLES, OCHRE, SIENNA, VERMILION, RED, MADDER, UMBER, BITUMEN, OLIVE, INDIGO, BICE];
// flesh has its own short ramp: a Caravaggio face is ochre-white in
// the light and olive-brown at the turn whatever the sitter is, but
// the character's own skin still chooses WHICH of the four
const FLESH = [[92, 56, 36], [148, 100, 66], [198, 148, 104], [228, 190, 146]];

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

// Where the lamp lands on this particular shape. The hot spot is
// pushed off centre toward the light, and how deep the shape sits
// DOWN-LIGHT of the head shifts its terminator — a foot is further
// from the lamp than a brow, and the falloff is the only thing that
// tells you so. Measured in the shape's own radii, so it works the
// same on a 20px ear and a 200px torso.
function lamp(pts, term) {
  const [x0, y0, x1, y1] = bbox(pts);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  // the shape's own RADIUS — its MEAN one, (w + h) / 4. Two wrong
  // answers came first and both showed up as the same fault, a
  // character with no shadow on it: half the diagonal (1.4 radii on a
  // round blob, so the terminator fell outside the shape) and half
  // the largest span (a head is taller than it is wide, so the whole
  // face fitted inside the light). A radial gradient has to be sized
  // in radii, and a shape's radius is the average of the two.
  const R = Math.max(1, (x1 - x0 + y1 - y0) / 4);
  // WHERE THE HOT SPOT GOES DEPENDS ON WHETHER THE SHAPE HAS A MIDDLE.
  // A blob is lit from just off its centre, toward the lamp, and that
  // is what a close light does to a solid form. But half of what a
  // character hands over is a RING or a crescent — a bob, a hood, a
  // collar, a brim — and a ring's bbox centre is a HOLE. Lighting one
  // from its centre drops the entire light into the hole and the
  // whole band comes back solid black, which is why this row had a
  // red bob painted in bitumen. So: if the centre is in the shape,
  // light the centre; if it is not, hang the light off the shape's
  // LAMP-WARD EXTREMITY instead, a little inboard of it, which is
  // where a raking light lands on a band anyway.
  //
  // The test is worth stating: it is not "how round is this", it is
  // "is the point I am about to light actually PART OF THE THING".
  // Testing the centre instead of the hot spot is not the same
  // question and it misses the near half of every thick crescent.
  let hx = cx + LX * R * .36, hy = cy + LY * R * .36;
  if (!inside(pts, hx, hy)) {
    let ex = pts[0][0], ey = pts[0][1], best = -1e9;
    for (const p of pts) {
      const u = p[0] * LX + p[1] * LY;
      if (u > best) { best = u; ex = p[0]; ey = p[1]; }
    }
    hx = ex - LX * R * .42; hy = ey - LY * R * .42;
  }
  const down = -(cx * LX + cy * LY);                 // >0 = away from the lamp
  return {
    cx, cy, R, hx, hy,
    term: clamp(term - clamp(down / (R * 6), -.1, .2), .22, .82),
  };
}

// The whole style in one function: a form, lit from over there.
// `cut` is where the terminator falls, MEASURED IN THE SHAPE'S OWN
// RADII from the hot spot — that is the only unit in which "half of
// it is in shadow" means the same thing on a head and on a shoe.
const REACH = 2.0;                                   // radii the gradient spans

function lit(s, pts, col, o = {}) {
  const L = lamp(pts, (o.cut ?? .7) / REACH);
  const deep = o.deep ?? BITUMEN;
  const c = s.ctx;
  const g = c.createRadialGradient(L.hx, L.hy, L.R * .04, L.hx, L.hy, L.R * REACH);
  const t = L.term;
  // the lit plane keeps its CHROMA. `tint` alone walks every colour to
  // the same warm cream and the row came back four browns; taking the
  // tint back up in saturation is the difference between glazing over
  // a local colour and deleting it.
  // AND THE LIT PLANE LEAVES ROOM ABOVE IT. It was tinted almost to
  // the specular's own value, which meant every face had a hot spot on
  // it that could not be seen: a highlight is not a colour, it is a
  // GAP, and if the cheek beside it is already at 215 there is no gap
  // to have. Measured off the red-flag build — the specular was firing
  // on three faces in six and was invisible on all three.
  const hi = sat(mix(tint(col, .34), HOT, .12), 1.30);
  const mid = sat(tint(col, .14), 1.24);
  // the stops are FRACTIONS OF THE CUT, not fixed offsets from it: a
  // form that keeps its light to a third of its radius and one that
  // keeps it to a whole radius are the same painting at two sizes.
  g.addColorStop(0, rgb(hi));                                      // the light, not a hole in the paper
  g.addColorStop(clamp(t * .62, .01, .90), rgb(mid));              // a lit plane hardly varies…
  g.addColorStop(clamp(t * .84, .02, .92), rgb(col));              // …and then falls off fast
  // THE RED TURN, and it is the row's chromatic note. The turning
  // edge of anything painted this way goes vermilion before it goes
  // black — Ribera lives in that band — and it is the one saturated
  // colour the style can put on every character without inventing a
  // cloak nobody asked for. Two stops, so it is a band and not a
  // hairline: without it the terminator is soot and the row is tea.
  g.addColorStop(clamp(t * .91, .025, .93), rgb(mix(col, VERMILION, .3)));
  g.addColorStop(clamp(t * .965, .03, .94), rgb(mix(shade(col, .26), VERMILION, .4)));
  g.addColorStop(t, rgb(shade(col, .88)));                         // and then it goes
  g.addColorStop(clamp(t + .045, .05, .99), rgb(deep, .97));       // darkest at the terminator
  // …and then the shadow walks back OUT to the ground. The darkest
  // place on a form is the terminator, never the far edge: that lift
  // is reflected light, and here it lifts to the exact colour of the
  // priming behind the figure, so the contour has nowhere to be.
  g.addColorStop(clamp(t + .34, .06, .995), rgb(mix(deep, GROUND, .5), .92));
  g.addColorStop(1, rgb(GROUND, .84));
  s.poly(pts, true); c.fillStyle = g; c.fill();
  scumble(s, pts, col, L);
  note(s, pts);
  return L;
}

// The terminator, broken. A Baroque half-light is glazed over an
// opaque dead-colour and the turn is a SERIES OF STROKES, not a ramp
// — the first build handed the whole transition to the gradient and
// the historian's word for it was airbrushed. These are wet-in-wet
// dabs straddling the terminator circle: half of them drag the dark
// forward into the light, half drag the warm half-tone back into the
// dark, and between them the boundary stops being a clean arc.
//
// Through `s.ctx`, not through the hand: this is micro-texture, and a
// loaded p5.brush stroke at this size lands as damage rather than as
// a transition.
function scumble(s, pts, col, L) {
  if (L.R < 9) return;
  const c = s.ctx;
  const rT = L.R * REACH * L.term;
  if (rT < L.R * .12) return;
  c.save(); s.poly(pts, true); c.clip();
  const n = Math.round(clamp(L.R * .26, 6, 14));
  // BOTH dabs are warm. A neutral one is not a half-tone, it is dirt:
  // the first build shaded the local colour straight down and every
  // pale face came back with grey mould on it. The dark dab is the
  // colour taken toward umber, the light one toward the red turn, and
  // both stay a whisker away from the passage they sit in.
  const warm = mix(shade(col, .26), RED, .34);
  const dark = mix(shade(col, .5), UMBER, .55);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + s.jr(-.2, .2);
    const back = s.chance(.5);
    const r = rT + (back ? s.jr(.02, .13) : s.jr(-.13, -.02)) * L.R;
    const x = L.hx + Math.cos(a) * r, y = L.hy + Math.sin(a) * r;
    const rx = L.R * s.jr(.07, .13), ry = rx * s.jr(.3, .5);
    c.save();
    c.translate(x, y); c.rotate(a + Math.PI / 2);
    c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    c.fillStyle = rgb(back ? warm : dark, s.jr(.09, .21));
    c.fill();
    c.restore();
  }
  c.restore();
}

// Thick paint, and ONLY in the light: two or three broad, barely
// brighter passages laid across the form near the hot spot, so the
// light BREAKS instead of arriving as one clean airbrushed ball.
function impasto(s, pts, col, L, o = {}) {
  // ONLY in the lights. A black cloak has no impasto in it — the paint
  // there is one thin glaze — and a pale streak laid across a dark
  // mass does not read as loaded paint, it reads as a scar. That was
  // the second build: every head of dark hair had a white worm on it.
  if (L.R < 11 || lum(col) < .3) return;
  const c = s.ctx;
  c.save(); s.poly(pts, true); c.clip();
  // FEW and FAT. Thin bright marks read as wire, not as paint — the
  // first build put five narrow near-white daubs on every mass and the
  // sheet came out scribbled over.
  const n = Math.round(clamp(L.R * .07, 2, 4));
  const px = -LY, py = LX;                         // across the light
  for (let i = 0; i < n; i++) {
    const off = (i / (n - 1 || 1) - .5) * L.R * .8;
    const dep = s.jr(-.3, .1) * L.R;
    const bx = L.hx + px * off - LX * dep, by = L.hy + py * off - LY * dep;
    const rx = L.R * s.jr(.26, .42), ry = rx * s.jr(.3, .5);
    // A loaded brush has a body and a feathered end, so the gradient
    // holds full strength for the first half of the mark and only then
    // falls off. A pure falloff from the centre is the airbrush again.
    const g = c.createRadialGradient(bx, by, 0, bx, by, rx);
    // NOT toward lead white. Loaded paint in the half-light is a
    // slightly thicker, slightly lighter passage of the SAME colour —
    // the white is spent once, on the brow, and nowhere else.
    const paint = sat(mix(tint(col, s.jr(.24, .40)), NAPLES, .2), 1.2);
    const a = s.jr(.14, .27) * (o.alpha ?? 1);
    g.addColorStop(0, rgb(paint, a));
    g.addColorStop(.55, rgb(paint, a * .8));
    g.addColorStop(1, rgb(paint, 0));
    c.save();
    c.translate(bx, by); c.rotate(Math.atan2(py, px)); c.scale(1, ry / rx); c.translate(-bx, -by);
    c.beginPath(); c.arc(bx, by, rx, 0, Math.PI * 2);
    c.fillStyle = g; c.fill();
    c.restore();
  }
  c.restore();
}

// THE RIM. A dark form turning against a dark ground keeps one thin
// lit edge — the light grazes the very last of it before it turns
// away. It is drawn INBOARD (the points walked a little toward the
// centroid) so it is a highlight on the mass and never an outline
// around it, and it is the single mark that keeps a void eye legible
// inside a black cheek: on the old sheet three characters went
// one-eyed because the eye and the shadow it sat in were the same
// black.
// It is OCHRE, not lead white, and it is a SHORT arc. Painted pale
// and long it was a white worm crawling round every dark mass in the
// row — six of them a character, all of them competing with the one
// highlight the picture is supposed to have. A graze is the last of
// the light, not a second light.
function rim(s, pts, L, k = 1) {
  if (L.R < 5) return;
  const inset = L.R * .055;
  let run = [];
  const flush = () => {
    if (run.length >= 2) s.sline(run, Math.max(.5, L.R * .024), .3, rgb(mix(SIENNA, NAPLES, .34), .32 * k));
    run = [];
  };
  for (const p of pts) {
    const dx = p[0] - L.cx, dy = p[1] - L.cy;
    const d = Math.hypot(dx, dy) || 1;
    if ((dx * LX + dy * LY) / d > .62) run.push([p[0] - dx / d * inset, p[1] - dy / d * inset]);
    else flush();
  }
  flush();
}

// A mass asked for as solid black — a socket, a nostril, an open
// mouth, a head of black hair, a shrouded face. It is nearly all
// absence, but not flat: the lamp still skims its rim, and that graze
// is the difference between a hole cut in the picture and a dark
// thing standing in a lit room.
function VOID(s, pts) {
  const L = lit(s, pts, mix(UMBER, BITUMEN, .55), { cut: .34, deep: BITUMEN });
  rim(s, pts, L, 1.15);
  return L;
}

// What this style has already covered on this canvas. A shape we
// filled needs no contour where it has turned away — the black IS the
// drawing there.
function note(s, pts) {
  const list = s.__baroque || (s.__baroque = []);
  list.push(bbox(pts));
  if (list.length > 32) list.shift();
}
function covered(s, pts) {
  const list = s.__baroque;
  if (!list) return false;
  const [x0, y0, x1, y1] = bbox(pts);
  const tol = (x1 - x0 + y1 - y0) * .3;
  for (const b of list) {
    if (Math.abs(b[0] - x0) + Math.abs(b[1] - y0) + Math.abs(b[2] - x1) + Math.abs(b[3] - y1) < tol) return true;
  }
  return false;
}

// Close an OPEN outline into a ring. Half of what a part hands `edge`
// is open — a skull's is the contour with the crown left out — and
// filling one with the canvas's own `closePath` lays a chord straight
// across the gap, which drops a black slab with a ruled top edge over
// half the head. That was the reason the shadow was skipped on
// unpainted masses for two builds. Instead the gap is bridged by
// CONTINUING THE PATH'S OWN ROTATION at the radius the two ends were
// at, so a missing crown comes back as a crown.
function closeRing(pts) {
  const n = pts.length;
  if (n < 6) return pts;
  const a = pts[0], b = pts[n - 1];
  const [x0, y0, x1, y1] = bbox(pts);
  const diag = Math.hypot(x1 - x0, y1 - y0);
  if (Math.hypot(a[0] - b[0], a[1] - b[1]) < diag * .10) return pts;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  let sweep = 0, prev = Math.atan2(a[1] - cy, a[0] - cx);
  for (let i = 1; i < n; i++) {
    const ang = Math.atan2(pts[i][1] - cy, pts[i][0] - cx);
    let d = ang - prev;
    if (d > Math.PI) d -= Math.PI * 2; else if (d < -Math.PI) d += Math.PI * 2;
    sweep += d; prev = ang;
  }
  const dir = sweep >= 0 ? 1 : -1;
  const aEnd = Math.atan2(b[1] - cy, b[0] - cx), aStart = Math.atan2(a[1] - cy, a[0] - cx);
  let gap = (aStart - aEnd) * dir;
  gap -= Math.floor(gap / (Math.PI * 2)) * Math.PI * 2;
  const rEnd = Math.hypot(b[0] - cx, b[1] - cy), rStart = Math.hypot(a[0] - cx, a[1] - cy);
  const out = pts.slice();
  const m = Math.max(4, Math.round(gap * 7));
  for (let i = 1; i < m; i++) {
    const t = i / m;
    const ang = aEnd + dir * gap * t;
    // the bridge bows out a little at its middle: a crown is a dome,
    // and a straight chord between two radii still reads as a cut
    const r = (rEnd + (rStart - rEnd) * t) * (1 + Math.sin(Math.PI * t) * .06);
    out.push([cx + Math.cos(ang) * r, cy + Math.sin(ang) * r]);
  }
  return out;
}

// A mass the character asked for in PAPER — a white cat's skull, an
// unpainted muzzle. It gets the same light as everything else, but as
// a GLAZE: transparent where the lamp hits, so the paper stays the
// cat, opaque where it turns away. Without this the row had two
// evenly-lit heads in it, and an evenly-lit head in a tenebrist row
// is a Renaissance one.
function glaze(s, pts) {
  const L = lamp(pts, .72 / REACH);
  const c = s.ctx;
  const t = L.term;
  const dark = mix(UMBER, BITUMEN, .5);
  const g = c.createRadialGradient(L.hx, L.hy, L.R * .04, L.hx, L.hy, L.R * REACH);
  g.addColorStop(0, rgb(HOT, 0));
  g.addColorStop(clamp(t * .58, .01, .88), rgb(NAPLES, .12));
  g.addColorStop(clamp(t * .88, .02, .92), rgb(SIENNA, .34));
  g.addColorStop(clamp(t * .96, .03, .94), rgb(mix(SIENNA, RED, .5), .66));
  g.addColorStop(t, rgb(dark, .93));
  g.addColorStop(clamp(t + .045, .05, .99), rgb(BITUMEN, .96));
  g.addColorStop(clamp(t + .34, .06, .995), rgb(mix(dark, GROUND, .5), .92));
  g.addColorStop(1, rgb(GROUND, .84));
  s.poly(pts, true); c.fillStyle = g; c.fill();
  scumble(s, pts, SIENNA, L);
  note(s, pts);
  return L;
}

// The part's own plate, in the part's own coordinates. A part draws
// with the origin at the head's centre and whatever transform the rig
// gave it, so `s.w` is a question in the wrong coordinate system —
// invert the transform and ask again. (The same trick gothic needs to
// size its gold; it is worth the twelve duplicated lines rather than
// a shared helper nobody can change without touching two styles.)
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

// THE ONE HOT HIGHLIGHT. The brightest thing in the picture, spent
// once, on the brow of the face — which is the only mass a character
// has exactly one of.
//
// The gate is a PROPORTION, never a roll: a skin mass that fills most
// of its own plate is the face; a skin mass that is a fifth of its
// plate is a hand, and a hand does not get the picture's highlight.
// Rolling this would strobe, and a highlight that moves between two
// masses two or three times a second is not a highlight, it is a
// firefly. The latch is per plate per boil frame, which is exactly
// "once per drawing of this face".
function specular(s, pts, L) {
  if (s.__baroqueHot || L.R < 10) return;
  const b = plateBounds(s);
  if (b) {
    const [x0, y0, x1, y1] = bbox(pts);
    if (x1 - x0 < (b[2] - b[0]) * .30 || y1 - y0 < (b[3] - b[1]) * .26) return;
  }
  s.__baroqueHot = true;
  // a little further into the lamp than the broad light is: the
  // specular sits on the brow, not in the middle of the cheek
  let hx = L.hx + LX * L.R * .10, hy = L.hy + LY * L.R * .10;
  if (!inside(pts, hx, hy)) { hx = L.hx; hy = L.hy; }
  const c = s.ctx;
  c.save(); s.poly(pts, true); c.clip();
  // SMALL, and with a core. A wide soft one is just a brighter cheek;
  // what makes a highlight the brightest thing in a picture is that it
  // holds full value across a few pixels and then stops.
  const r = Math.max(2.6, L.R * .24);
  const g = c.createRadialGradient(hx, hy, 0, hx, hy, r);
  g.addColorStop(0, rgb(SPEC, .98));
  g.addColorStop(.45, rgb(SPEC, .9));
  g.addColorStop(.72, rgb(HOT, .26));
  g.addColorStop(1, rgb(HOT, 0));
  c.fillStyle = g;
  c.beginPath(); c.arc(hx, hy, r, 0, Math.PI * 2); c.fill();
  c.restore();
}

// THE PAPER THAT BITES BACK IS BOLE, NOT CREAM — and this is the
// single largest thing that was wrong with the row.
//
// The hand's granulation is not decoration: a graphite ribbon sheds
// crumbs past its edges AND lets the paper bite back into them, and
// the bite is painted in the PAPER's colour. On drawai's cream that is
// invisible by construction, which is why nobody had ever had to think
// about it. On a near-black bole ground every one of those bites is a
// WHITE speck, and a contour a hundred points long lays a few hundred
// of them in a row: measured off the sheet, the pale worm running
// across the first character's forehead was pixel (243,227,205) — that
// is not ochre and it is not lead white, it is drawai's own paper,
// showing through a stroke exactly as designed.
//
// So the style says what its paper is. `paperA` is the one call that
// asks, every crumb goes through it, and answering `GROUND` turns the
// hand's granulation from white noise into what it always was
// underneath: the priming, coming back up through the paint.
function bole(s) {
  if (s.__bole) return;
  s.__bole = true;
  s.paperA = a => rgb(GROUND, Math.min(1, a) * .8);
}

// The value a mass gets when the character named no colour.
function valueOf(d) {
  return d >= .7 ? UMBER
    : d >= .6 ? mix(UMBER, SIENNA, .5)
      : d >= .45 ? SIENNA
        : mix(SIENNA, OCHRE, .7);
}

// The box answers for the character's colour but only MEETS IT HALF
// WAY. Snapping all the way to a pigment is what turned a red bob and
// a blue hood into the same warm tan; a baroque glaze sits over a
// local colour, it does not replace it.
//
// And a colour that HAS a hue is answered out of the chromatic half
// of the box only. That is not a hack, it is the two or three notes:
// a dark manner is dark, it is not colourless, and the whole picture
// hangs off one vermilion cloak or one length of blue. Letting lead
// white and bone black bid for a red bob is how the row became four
// shades of tea. A grey stays grey — it has no hue to keep.
const CHROMATIC = [NAPLES, OCHRE, SIENNA, VERMILION, RED, MADDER, OLIVE, INDIGO, BICE];
const chromaOf = c => (Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2])) / 255;

function pigmentOf(col) {
  const hued = chromaOf(col) > .10;
  return sat(mix(nearest(col, hued ? CHROMATIC : BOX), col, hued ? .5 : .3), hued ? 1.18 : 1);
}

// how much of the lamp a point on the contour is facing, -1..1. Taken
// from the CENTROID rather than from the winding, because a part may
// hand over a ring either way round and half a character silhouetted
// the wrong way is not a subtle bug.
const facing = (cx, cy, p) => {
  const dx = p[0] - cx, dy = p[1] - cy;
  return (dx * LX + dy * LY) / (Math.hypot(dx, dy) || 1);
};

// ---- THE VOID --------------------------------------------------
// A Caravaggio background is not a colour behind a figure, it is a
// room with one window in it, and the only evidence of the room is
// where the light lands. So this paints light and nothing else:
//
//   · ONE POOL, raking in on the SAME vector as the light on the
//     figure (`LX`/`LY`, shared — if the wall's light and the face's
//     light disagree the figure is a cut-out pasted onto a photo),
//     elongated along that vector so it reads as a shaft and not as a
//     lamp halo, and dead by two-thirds of the way out. The panel's
//     own edge is never reached, so the void has no edge — which was
//     the note: a rectangle of dark behind a character is a flat.
//   · THE FIGURE'S SHADOW thrown across that pool, away from the
//     lamp. It is what turns a symmetric glow into a crescent, and it
//     is the cheapest possible proof that the figure is standing in
//     the room rather than in front of it.
//   · a SHORT HARD one on the floor at the feet, leaning away from
//     the lamp — the only thing in the picture that says which way is
//     down.
//   · and the wall is BRUSHED, thin and warm, in whichever hand is
//     holding the pen. A gradient alone is a photographic vignette.
//
// Drawn once per character, so none of it can boil.
function backdrop(s, { w, h, floor }) {
  const c = s.ctx;
  const cx = w / 2;
  const headY = floor - h * .46;          // about where the head hangs
  // EVERY radius here is measured so that nothing this function draws
  // can reach the panel's own border. That is not tidiness, it is the
  // whole point: coverage that touches the edge IS the rectangle the
  // critic saw, and the first build of this backdrop drew one — a lit
  // oblong standing behind every character like a projection screen.
  // A void is a thing with no border, so the light has to be dead
  // before the panel is. Every gradient below therefore hits alpha 0
  // at t = .85 and coasts, and every centre is offset by less than
  // the .15 that leaves.
  const WALL = mix(GROUND, NAPLES, .62);
  const WARM = mix(GROUND, OCHRE, .40);
  const DEEP = mix(GROUND, BITUMEN, .6);

  // an ellipse of light, sized in the panel's two axes rather than as
  // a rotated disc: the panel is much wider than it is tall and a
  // round pool in it is a lamp hung behind the sitter's head
  const pool = (X, Y, rx, ry, stops) => {
    const g = c.createRadialGradient(X, Y, 0, X, Y, rx);
    for (const [t, col, a] of stops) g.addColorStop(t, rgb(col, a));
    c.save();
    c.translate(X, Y); c.scale(1, ry / rx); c.translate(-X, -Y);
    c.fillStyle = g;
    c.beginPath(); c.arc(X, Y, rx, 0, Math.PI * 2); c.fill();
    c.restore();
  };

  // THE WALL, LIT. It is a MID value and it is meant to be: a wall in
  // a tenebrist picture is lit dimly enough that a dark head reads as
  // a form against it and the flesh is still, by a long way, the
  // brightest thing in the room. Painted up toward white it becomes a
  // window and the figure becomes a cut-out in front of it.
  //
  // It is thrown UP AND LEFT — the direction the light comes from —
  // so it fills the empty quarter of the cell instead of haloing the
  // head, and the figure stands at the dark edge of its own light.
  // It is a PLATEAU, not a bell. A bell-shaped pool puts its one
  // bright spot exactly where the head is standing and spends the
  // rest of itself getting dimmer: measured, the wall in the gap
  // between two characters came out at value 66 against a ground of
  // 33 — a lift you cannot see. A character is nearly as wide as its
  // cell, so the only wall a viewer ever sees is the slivers, and the
  // slivers are where the light has to be at full strength.
  const rx = w * .38, ry = h * .40;
  const px = cx + LX * w * .13, py = headY + LY * h * .16;
  pool(px, py, rx, ry, [
    [0, WALL, .98], [.40, WALL, .88], [.60, WARM, .54],
    [.80, GROUND, .16], [.92, GROUND, 0], [1, GROUND, 0],
  ]);

  // THE WALL HAS TOOTH, but it is not BRUSHED — and that is a
  // correction, not a shortcut. This was six broad passes through the
  // hand's own ribbon, which is what the rules ask for and which is
  // right for any mark a painter MADE. A wall in the dark is not one:
  // it is a value. The brush hand proved it at a glance — a pale
  // ribbon of any width comes off a loaded tip as a torn rope, and
  // each character had a white lightning bolt standing next to it.
  // Same lesson the bounce taught, and it is the second time this
  // file has learned it: PALE + WIDE + THROUGH THE HAND = damage.
  // So the tooth is scumbled dabs on `s.ctx`, micro in both hands.
  const S = Math.min(rx, ry);
  c.save();
  c.beginPath(); c.ellipse(px, py, rx * .84, ry * .84, 0, 0, Math.PI * 2); c.clip();
  const ax = -LY, ay = LX;                       // across the light
  for (let i = 0; i < 26; i++) {
    const u = s.jr(-1, 1), v = s.jr(-1, 1);
    const d = Math.hypot(u, v);
    if (d > 1) continue;
    const X = px + u * rx * .8, Y = py + v * ry * .8;
    const fade = (1 - d) * (1 - d);
    const l = S * s.jr(.10, .26), t = l * s.jr(.16, .34);
    c.save();
    c.translate(X, Y); c.rotate(Math.atan2(ay, ax) + s.jr(-.3, .3));
    c.beginPath(); c.ellipse(0, 0, l, t, 0, 0, Math.PI * 2);
    c.fillStyle = rgb(s.chance(.5) ? WALL : WARM, s.jr(.05, .13) * fade);
    c.fill();
    c.restore();
  }
  c.restore();

  // THE FIGURE'S OWN SHADOW, thrown across that wall away from the
  // lamp. It is what turns a symmetric glow into a crescent, and it
  // is the cheapest possible proof that the figure is standing IN the
  // room rather than in front of a picture of one.
  pool(cx - LX * w * .20, py + h * .17, w * .24, h * .32, [
    [0, DEEP, .88], [.38, DEEP, .62], [.72, DEEP, .14], [.88, DEEP, 0], [1, DEEP, 0],
  ]);

  // …and the short hard one at the feet, leaning away from the lamp:
  // the only thing in the picture that says which way is down.
  const fx = cx - LX * w * .07;
  pool(fx, floor, w * .26, h * .045, [
    [0, DEEP, .96], [.5, DEEP, .74], [.85, DEEP, 0], [1, DEEP, 0],
  ]);
}

export default {
  id: 'baroque', label: 'baroque', era: 1620, underdraw: false,
  ground: GROUND,
  // A tenebrist's black is BITUMEN — warm, and blacker than anything
  // else on the sheet, because everything else in the picture is
  // walking toward it. Every void eye, pupil, nostril and contour a
  // part asks for resolves through this without knowing.
  ink: [22, 15, 11],
  // wide and tall, so the pool has room to die before the panel does
  // The panel is cut to sit INSIDE the row's torn band (which is
  // CELL_H * .99 tall, centred .38 above the floor line). A void that
  // overhangs its own ground paints lamplight onto drawai's cream
  // paper, and a pale oblong floating above a black row is the
  // clunky rectangle again, upside down.
  // …and it is WIDE — wider than the cell, so the pools of adjacent
  // characters run into each other and the row becomes one unlit room
  // with six lamps in it rather than six lit alcoves side by side.
  // Cut to the cell, the pool was almost entirely behind the head it
  // was meant to be lighting: a character is nearly as wide as its
  // cell, so all the space a backdrop actually has is between them.
  panel: { w: 1.7, h: .95, y: .375 },
  backdrop,

  tone(s, pts, o = {}) {
    bole(s);
    const d = dens(o.style);
    if (!o.col && d >= .95) { VOID(s, pts); return; }
    const col = o.col ? pigmentOf(o.col) : valueOf(d);
    // A pale mass stands further into the lamp's mercy than a dark
    // one — and a mass that named a COLOUR keeps a lit passage
    // whatever density it asked for, because a crimson cloak swallowed
    // whole is just more black.
    const L = lit(s, pts, col, { cut: (o.col ? .66 : .5) + (1 - d) * .4 });
    impasto(s, pts, col, L, { alpha: .5 + (1 - d) * .7 });
    if (lum(col) < .34) rim(s, pts, L, .85);
  },

  skin(s, pts, col, o = {}) {
    bole(s);
    // THE FACE IS THE LIT THING. That is the deal the whole style
    // makes: if the light falls anywhere it falls here, so the flesh
    // gets a later terminator and a longer reach than anything else,
    // and its dark is umber rather than bitumen so the eyes still
    // have a head to sit in at crowd scale.
    const flesh = step(col, FLESH);
    const L = lit(s, pts, flesh, { cut: .74, deep: mix(UMBER, BITUMEN, .62) });
    impasto(s, pts, flesh, L, { alpha: .8 });
    specular(s, pts, L);
  },

  // The contour is a lighting decision, not a line. Where the plane
  // faces the lamp it is stated warm; where it is grazed hardest it
  // flares; where it has turned away it is not drawn AT ALL — and now
  // that the paper behind it is dark too, that is where the figure
  // and the room become one value and the silhouette breaks.
  edge(s, pts, w, o = {}) {
    bole(s);
    const [x0, y0, x1, y1] = bbox(pts);
    const bw = x1 - x0, bh = y1 - y0;
    const diag = Math.hypot(bw, bh);
    const small = diag < w * 16;
    let filled = covered(s, pts);

    // A MASS NOBODY PAINTED STILL OWES THE LIGHT A DARK HALF. Only
    // for real masses: a tooth, a nostril or a tear has no room for a
    // lit half and a lost half.
    if (!filled && !small && bw > s.w * .30 && bh > s.h * .24) {
      // …and a face nobody coloured is still the lit thing in the
      // picture. Most characters here never reach `skin` at all — a
      // white cat's head is paper and a contour — so the one highlight
      // has to be dealt from both routes or five faces in six never
      // get one. Measured: `skin` fired for two characters out of six.
      const ring = closeRing(pts);
      specular(s, ring, glaze(s, ring));
      filled = true;
    }

    const [cx, cy] = centroid(pts);
    // Two shapes have to be closed all the way round anyway: anything
    // small, and anything this style still never filled.
    if (small || !filled) {
      // one quiet pass right round, laid FIRST so the lit stretch goes
      // over it: it closes the shape without ever reading as an
      // outline against the dark
      s.setInk(mix(BITUMEN, UMBER, .5));
      s.stroke(pts, w * .6, { alpha: .45, taper: .3, amp: .25, ghost: false });
      s.setInk(null);
    }
    let run = [], band = -2;
    const flush = () => {
      if (run.length >= 2) {
        if (band === 0) {
          // the flare: a THIN line, and drawn with sline rather than
          // the ribbon. A hot ribbon at contour weight comes off the
          // brush hand as a torn white patch lying on top of the head
          // — light does not have a width.
          s.sline(run, Math.max(.5, w * .26), .4, rgb(mix(OCHRE, NAPLES, .3), .42));
        } else if (band === 1) {
          s.setInk(mix(SIENNA, UMBER, .55));
          s.stroke(run, w * .58, { alpha: .42, taper: .35, amp: .3, ghost: false });
          s.setInk(null);
        }
        // …and band -1, the far contour, gets NOTHING. It carried a
        // warm bounce for two rounds and the bounce had to go with the
        // ground: on a near-black priming a faint warm line in the
        // shadow is not reflected light, it is the silhouette, drawn.
        // The dark is detail-free or it is not dark.
      }
      run = [];
    };
    for (const p of pts) {
      const u = facing(cx, cy, p);
      // anything that has turned away gets nothing at all
      const b = u > .7 ? 0 : u > -.06 ? 1 : -2;
      if (b !== band) { flush(); band = b; }
      if (b === -2) continue;
      run.push(p);
    }
    flush();
  },
};
