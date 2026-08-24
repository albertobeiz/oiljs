// ---------------------------------------------------------------
// UKIYO-E — a multi-block woodblock print on washi, c. 1830.
// Hokusai, Kunisada, Hiroshige.
//
// This is a PRINT, not a painting, and every single thing that makes
// it recognisable is a consequence of how it was made. So the style
// is built out of the process, not out of a description of the look:
//
//   · THE KEYBLOCK. One block carries the drawing: a brush line,
//     pasted face-down onto cherry wood and carved away either side
//     of it. So the line keeps the BRUSH in it — it swells where the
//     hand pressed and goes to a hairline where it lifted, and it is
//     dead black and closed. It is the strongest mark on the sheet
//     and everything else is colour poured into it.
//     It is SUMI, and sumi is a warm black — pine soot in animal glue,
//     which goes brown-black in a thin passage and never blue-black.
//     The style declares it as its `ink`, so the void eyes, the
//     pupils, the nostrils and the teeth — every `inkA` any part
//     reaches for — are pulled off the key block too.
//   · FLAT COLOUR. A block prints one flat of one ink. There is no
//     modelling inside a shape anywhere in ukiyo-e — no light source,
//     no cast shadow, no gradient except the one below.
//   · MIS-REGISTRATION. Each colour is a SEPARATE block, aligned by
//     two notches (kentō) cut in the wood, and they never line up
//     perfectly. The colour crosses its own outline on one side and
//     falls short of it on the other. This is THE tell of a print,
//     and it is per-BLOCK, not per-shape: the beni block is out by
//     the same amount everywhere on the sheet, because it is one
//     piece of wood. Hence `REG` below, keyed by pigment identity.
//     And the sumi flats DO NOT SHIFT — black is the key block
//     itself, so a black eye can never be out of register with its
//     own outline. That falls out of the physics and it is also what
//     keeps a 12px eye readable.
//
//     It has to be VISIBLE. A half-pixel slip is not a signature, it
//     is a rounding error, and at 90px a two-pixel one hides under
//     the key line, which is three pixels wide. The floor is now a
//     fraction of the shape and never less than three.
//
//     Half of that effect was IMPOSSIBLE here until `lap()`. A part
//     draws its mass and THEN its contour, so the key line always
//     landed on top and the colour could only ever retreat from it —
//     which reads as a shrunken fill, not as a printing fault. The
//     fault needs colour ON TOP of black on one side. `flat()` now
//     leaves the block it printed on the sketch, and `edge()`, having
//     laid the key line, re-strokes a band of that same ink along the
//     contour CLIPPED TO THE BLOCK: where the block overhangs, the
//     ink buries the line; where it falls short, the clip removes the
//     band and bare washi shows between colour and line. One stroke,
//     and it is the single most recognisable fact about the medium.
//   · BOKASHI. The one gradient allowed: the printer wipes the block
//     with a damp cloth before pulling, so the ink thins to nothing
//     toward one edge. It belongs on the big masses — and it fades
//     toward the PAPER, opaquely. Fading toward transparency was the
//     first attempt and it is wrong twice over: a wiped block still
//     prints an opaque film, and a translucent flat let whatever was
//     behind it (a face, a collar) show through as a grey smear, so
//     the one legitimate gradient in the medium read as a smudge.
//     (In the BACKDROP it does fade to transparency, and that is
//     correct there: there is nothing behind the panel but the sheet's
//     own washi, which is what the ink is thinning toward anyway.)
//   · WOOD GRAIN. The plank prints itself faintly through a large
//     flat, always in one direction — the block's grain, not the
//     shape's. Never on the face: the flesh block is the cleanest
//     pull on the sheet and a plank through it reads as stubble.
//   · WASHI FIBRE. Under the plank, and under everything, the PAPER.
//     Hōsho is mould-made from long kozo fibres shaken out on a
//     bamboo screen, and a flat of colour laid on it is never smooth:
//     a proud fibre takes the ink heavy or misses it altogether, and
//     the screen leaves its own faint ruling across the sheet. That
//     is `fibre()`, it is in every flat including the face, and it is
//     the one texture that goes through `s.ctx` — the paper is the
//     same thickness of hair whichever pen is holding it.
//   · THE PAPER. Washi is the lightest value in the print and the
//     face is mostly bare washi with a breath of beni on it. That
//     is why a bijin's face reads as a face at ten paces: it is a
//     cream hole in a black-and-indigo sheet. So the style declares
//     its own `ground` — a warm hōsho the sheet lays behind the whole
//     row — and knocks out with the very same triple, which makes
//     every mis-registration crescent a scrap of that paper rather
//     than of drawai's page.
//   · THE SHEET IS SIGNED. A print is a published object and it says
//     so on its face: a vertical title cartouche (tanzaku) in one top
//     corner, the artist's and the publisher's seals in beni low on
//     the other side, and a censor's round stamp beside them. That
//     lives in `backdrop()`, along with the space the figure stands
//     in — a bokashi sky, a horizon, and Fuji or a pine or a run of
//     Hokusai's clawed waves out at the back. It is drawn ONCE per
//     character, so it is the one place this style is allowed to make
//     a composition instead of a surface.
//
// One thing this style cannot have and why:
//   · a true AIZURI character (an all-indigo print) needs a per-
//     CHARACTER decision, and a style is only ever handed one shape
//     at a time — `F.media` is one shared object and the Sketch is
//     per PART. A module-level latch that remembered "the last skin
//     colour" was tried in the head and rejected: it makes the sheet
//     depend on part draw order, which is exactly the hidden coupling
//     the project keeps banning. Instead the box is keyed cool AND
//     LOPSIDED BY SIZE: a big mass may only be printed in one of the
//     four dominant inks (sumi, the two Prussians, beni), and ochre,
//     olive and the pales are dealt to small shapes only. A print is
//     one dominant colour and an accent; the accent is by definition
//     the small thing.
//   · anything rolled with `s.jr` per shape SHIMMERS, because the
//     boil reseeds every frame — and a print that jitters is not a
//     print. Registration, bokashi direction, grain, fibre and the
//     keyline's swell all come out of `h01`, a positional hash (the
//     same stable-scatter trick the voxel and objects labs use). The
//     only `s.jr` left is a quarter-pixel of tremor on the line, which
//     is the drawing breathing and belongs to this project's hand.
//     The BACKDROP is exempt and rolls freely: it is drawn once.
// ---------------------------------------------------------------
import { nearest, mix, shade, lum, dens, bbox, rgb } from './pigment.js';

const TAU = Math.PI * 2;

// The box of ink. A print shop kept a handful and no more: sumi (soot
// black), ai (indigo — and after about 1829 BERLIN BLUE, the imported
// synthetic that dates this sheet: Hokusai's Fuji series is built on
// it and it is a hard, cold, saturated blue, not the grey-mauve of a
// vegetable indigo), beni (safflower red, expensive, used small),
// ochre, a dull olive from mixing, and the washi itself, which is a
// colour and is used as one.
//
// SUMI is WARM. Pine soot ground into animal glue is a brown-black —
// look at any thin passage of it — and the whole sheet is keyed off
// this one triple, since it is the style's `ink` as well as its key
// block. A blue-black here and the print turns into a photocopy.
const SUMI = [32, 25, 22];                // pine soot: the darkest thing on the sheet, and warm
const AI_DEEP = [12, 40, 80];             // Prussian, at full strength
const AI = [26, 76, 130];
const AI_PALE = [122, 158, 190];          // Prussian, wiped
const BENI = [154, 44, 44];               // benigara: an iron red, darker than gothic's vermilion
const BENI_PALE = [216, 152, 138];
const SEAL = [176, 46, 38];               // the seal-paste vermilion: brighter than the printed beni
const OCHRE = [198, 150, 72];
const OLIVE = [110, 116, 78];

// The paper. Hōsho washi: warm, thin, absorbent, and a COLOUR — the
// lightest value in the print and the actual flesh of most of this
// cast. The style declares it as its `ground` below AND knocks out
// with it, and those two have to be the same triple: mis-registration
// is nothing but exposed knockout, so a knockout a few points off the
// sheet would ring every block with a halo of the wrong cream.
//
// It is WARM BUT NOT TAN, and that is a constraint from outside the
// style: a character with no skin colour has its face filled by
// `skull.js` with drawai's own cream, directly, and no medium is
// asked. On a hōsho as deep as the sheet's default the four bare-paper
// faces in six came back as cold white masks punched out of a tan
// band. So the paper is pulled to within a few points of drawai's
// cream in VALUE and given its warmth in the blue channel alone,
// where an unprinted face can sit on it without a seam.
const WASHI = [245, 236, 212];

// A mass may be any of these. The paper is deliberately absent — a
// mass printed in paper colour is not a mass, it is a hole — and the
// box is split by SIZE, which is where a print's lopsidedness comes
// from. A big flat is the dominant colour of the print; ochre, olive
// and the pales are accents and an accent is small.
//
// The PALES are absent from the dark box for the same reason: a
// print's value structure is black hair over a cream face, so a mass
// the part called dense has to come back dense whatever colour the
// character brought. Answering a sandy blond with a sandy blond flat
// gave a sheet with no black in it at all, which is the one thing a
// ukiyo-e sheet always has.
//
// OLIVE was once in the general box and that was the single biggest
// fault on the sheet. It is a real ukiyo-e ink, but it is the nearest
// match to every green, teal and khaki a character can roll, so it
// swallowed the whole cast and printed six olive characters with no
// ai anywhere — and a ukiyo-e sheet without indigo has lost its main
// chord. It is dealt only to small, muted shapes.
const BIG_BOX = [SUMI, AI_DEEP, AI, BENI];
const BOX = [SUMI, AI_DEEP, AI, AI_PALE, BENI, BENI_PALE, OCHRE];
const DARK_BOX = [SUMI, SUMI, AI_DEEP, AI, AI, BENI];
// A 20px band is not the place for a third hue. Small shapes get four
// inks and no pales, so a headband stops being a colour chart.
const SMALL_BOX = [SUMI, AI_DEEP, BENI, OCHRE];

// The registration error, per BLOCK. One direction per ink for the
// whole sheet — that is what makes it read as a printing fault and
// not as sloppiness. Sumi is the key block: it cannot be out of
// register with itself.
const DRIFT = [.75, .62];
const REG = new Map([
  [SUMI, [0, 0]],
  [AI_DEEP, [.92, .40]], [AI, [.92, .40]], [AI_PALE, [.92, .40]],
  [BENI, [-.58, -.81]], [BENI_PALE, [-.58, -.81]], [SEAL, [-.58, -.81]],
  [OCHRE, [.30, -.95]],
  [OLIVE, [-.94, .34]],
]);

// The flesh block. Five steps, all of them PALE — the darkest skin in
// the cast prints as a warm tan, not as a brown, because the print's
// dark is carried by the key line and the hair. Registered with beni,
// since that is the block it was pulled from. Pale, but not INVISIBLE:
// at the first pass the top two steps were within a few points of the
// washi and the face vanished, which also killed the mis-registration
// — you cannot see a block that is out of register with a paper it
// matches.
// Tinted toward the WASHI, not toward white: the pale end of this
// ramp is a breath of beni on the paper, and a face mixed toward a
// neutral white sat cold and chalky on a warm ground — it read as a
// mask laid on the print rather than as the print's own paper.
const FLESH = [
  mix(OCHRE, [138, 88, 54], .5),
  mix(mix(OCHRE, BENI, .22), WASHI, .30),
  mix(mix(OCHRE, BENI, .32), WASHI, .46),
  mix(BENI_PALE, WASHI, .34),
  mix(BENI_PALE, WASHI, .58),
];
for (const f of FLESH) REG.set(f, REG.get(BENI));

// The print's own dice. Positional, deterministic, and — unlike
// `s.jr` — identical on every boil frame, so a flat never crawls.
const h01 = (a, b = 0) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const smoothstep = t => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

// The plank's grain runs one way for the whole print, near-vertical,
// because that is how a block was sawn. It is not the shape's grain.
const GRAIN_TILT = .075;

// ---------------------------------------------------------------
// WASHI FIBRE — the sheet showing through the ink.
//
// Hōsho is mould-made: long kozo fibres floated in a slurry and shaken
// out on a bamboo screen, so the sheet has hairs lying in it and the
// screen's own ruling across it. Print a flat over that and the flat
// is not smooth anywhere — a proud fibre takes the ink heavy, a
// hollow beside it takes none, and the whole thing is combed faintly
// in the direction of the vatman's shake.
//
// This is MICRO-TEXTURE and it goes through `s.ctx`, never the hand:
// a paper fibre is a hair whatever is holding the pen, and put through
// p5.brush it comes back as a two-pixel textured brush stroke and the
// print looks like it was left out in the rain.
//
// It is in EVERY flat, the face included. The plank is not — that is
// the block, and the flesh block was the shop's cleanest pull — but
// the paper is under all of it by definition.
// ---------------------------------------------------------------
function fibre(s, pts, col) {
  const [x0, y0, x1, y1] = bbox(pts);
  const bw = x1 - x0, bh = y1 - y0;
  if (bw < 7 || bh < 7) return;
  const c = s.ctx;
  const key = x0 * .37 + y1 * .61;
  c.save();
  s.poly(pts, true); c.clip();
  c.lineCap = 'round';

  // A fibre in a dark flat shows as the paper coming back through; in
  // a pale one there is no paper paler than the flat, so it shows the
  // other way round — as a thread that drank more ink than its
  // neighbours.
  // And it has to be QUIETER on a pale flat than on a dark one. On the
  // hair a paper fibre is the sheet coming back through and it may be
  // loud; on a face the same contrast reads as dirt on the scan, not
  // as tooth — the flesh block is the shop's cleanest pull and the
  // paper under it whispers.
  const dark = lum(col) < .46;
  const hair = rgb(dark ? mix(col, WASHI, .62) : shade(col, .22), dark ? .22 : .10);
  const heavy = rgb(shade(col, dark ? .5 : .42), dark ? .12 : .08);

  const n = Math.min(170, Math.max(10, Math.round(bw * bh / (dark ? 46 : 78))));
  for (let i = 0; i < n; i++) {
    const px = x0 + h01(i * 1.7, key) * bw;
    const py = y0 + h01(i * 3.31 + 4.2, key) * bh;
    // near-horizontal: the shake runs across the mould
    const a = (h01(i * 5.13, key + 9) - .5) * 1.05;
    // a kozo fibre is LONG — that is the whole point of the plant, and
    // it is why washi does not tear. Short ones came back as a polka
    // dot: the eye reads a field of even blobs before it reads paper.
    const u = h01(i * .77, key + 2);
    const L = 2.5 + u * u * (11 + bw * .03);
    c.beginPath();
    c.moveTo(px, py);
    c.lineTo(px + Math.cos(a) * L, py + Math.sin(a) * L);
    c.strokeStyle = h01(i * 2.9, key + 5) < .74 ? hair : heavy;
    c.lineWidth = h01(i * 7.3, key + 1) < .86 ? .5 : 1.1;
    c.stroke();
  }

  // the screen's ruling: the laid lines, very faint, straight across
  const sp = 4 + h01(key, 3) * 3;
  const rule = rgb(dark ? mix(col, WASHI, .5) : shade(col, .22), .055);
  c.strokeStyle = rule; c.lineWidth = .6;
  for (let y = y0 + h01(key, 8) * sp; y < y1; y += sp) {
    c.beginPath(); c.moveTo(x0 - 2, y); c.lineTo(x1 + 2, y + (h01(y, key) - .5) * .8);
    c.stroke();
  }
  c.restore();
}

// ---------------------------------------------------------------
// WOOD GRAIN — the plank printing itself through the flat. Two kinds
// of line: the hard summerwood takes MORE ink, the soft springwood
// takes less and leaves washi. Both are needed, or it reads as
// hatching rather than as wood.
// ---------------------------------------------------------------
function grain(s, pts, col, gap) {
  const [x0, y0, x1, y1] = bbox(pts);
  const wd = x1 - x0, ht = y1 - y0;
  const d = Math.hypot(wd, ht);
  if (d < 46) return;                      // a small flat shows no plank
  const c = s.ctx;
  const sp = Math.max(6, gap || d * .07);
  const n = Math.min(20, Math.max(3, Math.round(wd / sp)));
  // barely there. At .12 it stopped being a plank and became hatching
  // down the middle of every face; at .05 it was gone.
  const dark = rgb(shade(col, .34), .07);
  const pale = rgb(mix(col, WASHI, .55), .085);
  const dx = Math.tan(GRAIN_TILT) * (ht + 16);
  for (let i = 0; i < n; i++) {
    const u = (i + .5) / n + (h01(i * 3.1, x0) - .5) / n * .7;
    const gx = x0 + wd * u;
    const bow = (h01(i, y0) - .5) * Math.min(3.5, wd * .03);
    c.beginPath();
    c.moveTo(gx - dx * .5, y0 - 8);
    c.quadraticCurveTo(gx + bow, (y0 + y1) / 2, gx + dx * .5, y1 + 8);
    c.strokeStyle = h01(i * 7.7, y1) < .62 ? dark : pale;
    c.lineWidth = .5 + h01(i * 2.3, x1) * 1.5;
    c.stroke();
  }
}

// ---------------------------------------------------------------
// A FLAT — one pull of one block. Washi first (the ink is opaque and
// the print has no glazing), then the colour, OFFSET by that block's
// registration error, then bokashi, then the plank, then the paper.
//
// The offset leaves a crescent of bare washi inside the key line on
// one side and — via `lap()`, below — lays colour over it on the
// other. Resist the urge to "fix" that: the crescent is the entire
// effect.
// ---------------------------------------------------------------
function flat(s, pts, col, o = {}) {
  const c = s.ctx;
  const [x0, y0, x1, y1] = bbox(pts);
  const d = Math.hypot(x1 - x0, y1 - y0);

  // an opaque ink knocks out whatever it is printed over; a pale one
  // is a light block laid on the sheet and does not need to
  if (o.knock !== false && (lum(col) < .5 || d > 40)) {
    s.poly(pts, true); c.fillStyle = rgb(WASHI); c.fill();
  }

  const [ux, uy] = REG.get(col) || DRIFT;
  // The error has to CLEAR THE KEY LINE, and the key line is nearly
  // three times the asked width. A two-pixel slip just hides
  // underneath it; the fault only reads once the colour visibly stands
  // off the black on one side and buries it on the other. Three pixels
  // is the floor and it is measured against the line, not chosen.
  const amt = Math.min(7.5, Math.max(3, d * .058)) * (.78 + h01(x0 * .7, y1) * .44);
  // A colour block is a SECOND CARVING of the same drawing, so it is
  // never quite the same size either — a hair under or over. But the
  // scale is kept SMALL on purpose: at ±4% it dominated the shift and
  // every flat read as an outline with a halo, evenly all the way
  // round, which is not a printing fault, it is a sticker. The slip is
  // the effect; the recarving is a seasoning on it.
  const k = .988 + h01(y1, x0 * 1.3) * .024;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const P = pts.map(p => [cx + (p[0] - cx) * k + ux * amt, cy + (p[1] - cy) * k + uy * amt]);

  c.save();
  s.poly(P, true); c.clip();
  const m = 6;
  let style;
  // BOKASHI: the printer's damp cloth, drawn across the block before
  // the pull, so the ink thins toward one edge and the washi comes
  // back through. Only on the big masses, and only about half of them
  // — on everything it stops being a wipe and becomes a house style.
  if (o.bokashi !== false && d > 44 && h01(x1, y0 * 1.3) < .58) {
    const dark = lum(col) < .34;
    // a dark mass is always wiped UP or DOWN — the printer pulls the
    // cloth across the block, and on a head-sized flat a sideways
    // wipe on the hair just reads as a lighting error
    const dir = dark ? ((h01(y0, x1 * .9) * 2) | 0) : ((h01(y0, x1 * .9) * 4) | 0);
    const g = dir === 0 ? c.createLinearGradient(0, y1, 0, y0 - m)
            : dir === 1 ? c.createLinearGradient(0, y0, 0, y1 + m)
            : dir === 2 ? c.createLinearGradient(x1, 0, x0 - m, 0)
            : c.createLinearGradient(x0, 0, x1 + m, 0);
    // How far the cloth takes it. A pale block may be wiped almost to
    // bare paper — that is a Hiroshige sky. A dark one may not: the
    // hair is the print's darkest value and it has to stay the darkest
    // value at 90px, so the wipe takes it halfway and stops.
    const end = dark ? .46 : .82;
    g.addColorStop(0, rgb(col));
    g.addColorStop(.42, rgb(mix(col, WASHI, end * .11)));
    g.addColorStop(1, rgb(mix(col, WASHI, end)));
    style = g;
  } else {
    style = rgb(col);
  }
  c.fillStyle = style;
  c.fillRect(x0 - m * 2, y0 - m * 2, x1 - x0 + m * 4, y1 - y0 + m * 4);
  if (o.grain !== false) grain(s, P, col, o.gap);
  c.restore();

  // the paper is under everything, the face included
  fibre(s, P, col);

  // hand the block to `edge()`, which is the only place it can be
  // printed OVER the key line — see `lap()`
  s.__uk = (ux || uy) ? { x0, y0, x1, y1, n: pts.length, P, style } : null;
}

// ---------------------------------------------------------------
// THE LAP — the other half of mis-registration.
//
// The key line has just been laid over the flat. Re-stroke a band of
// the flat's own ink along the contour, clipped to the BLOCK: where
// the block overhangs its outline the band survives and buries the
// black; where the block fell short the clip eats the band and the
// washi knockout shows as a hairline between colour and line.
//
// It has to be the same `fillStyle` object the flat used, gradient
// and all, or the lap prints at full strength on a wiped edge and
// draws a bright rim round the bokashi.
// ---------------------------------------------------------------
function lap(s, pts, w) {
  const u = s.__uk;
  if (!u) return;
  const [x0, y0, x1, y1] = bbox(pts);
  if (Math.abs(x0 - u.x0) > .05 || Math.abs(y0 - u.y0) > .05 ||
      Math.abs(x1 - u.x1) > .05 || Math.abs(y1 - u.y1) > .05) return;
  if (Math.abs(pts.length - u.n) > 1) return;
  if (Math.hypot(x1 - x0, y1 - y0) < 22) return;   // a small block cannot afford to lose its line
  const c = s.ctx;
  c.save();
  s.poly(u.P, true); c.clip();
  s.poly(pts, true);
  c.strokeStyle = u.style;
  c.lineWidth = w;
  c.lineJoin = 'round'; c.lineCap = 'round';
  c.stroke();
  c.restore();
  s.__uk = null;
}

// ---------------------------------------------------------------
// THE KEYBLOCK LINE.
//
// A brush drawing, carved. The width comes from the brush and it is
// PERIODIC around a closed ring — integer harmonics of the arc-length
// parameter, so the swell meets itself at the seam instead of
// stepping. An open path gets the other half of the brush's story:
// it lands thick and lifts to nothing.
//
// The harmonics are LOW — one or two swells around a whole contour,
// not five. A carved line is confident: it was cut with a knife along
// a drawing that was already made, so it grows and thins in long
// arcs. Ripple it at speed and you get a pencil contour again, which
// is the one thing this line must not look like.
//
// A worn block CHIPS, and a chipped block prints a broken line. Two
// or three nicks on a long contour, placed by the positional hash so
// they sit in the same place on every frame.
// ---------------------------------------------------------------
function ring(pts, closed, step) {
  const P = closed ? pts.concat([pts[0]]) : pts;
  const out = [];
  let carry = 0;
  out.push([P[0][0], P[0][1]]);
  for (let i = 1; i < P.length; i++) {
    let ax = P[i - 1][0], ay = P[i - 1][1];
    const bx = P[i][0], by = P[i][1];
    let seg = Math.hypot(bx - ax, by - ay);
    while (seg >= step - carry && seg > 0) {
      const t = (step - carry) / seg;
      ax += (bx - ax) * t; ay += (by - ay) * t;
      out.push([ax, ay]);
      seg = Math.hypot(bx - ax, by - ay);
      carry = 0;
    }
    carry += seg;
  }
  if (closed && out.length > 2) out.pop();
  return out;
}

function keyline(s, pts, w, o = {}) {
  if (!pts || pts.length < 3) return;
  const c = s.ctx;
  const [x0, y0, x1, y1] = bbox(pts);
  const diag = Math.hypot(x1 - x0, y1 - y0);
  // a ring whose ends already meet is closed; a brow or a mouth line
  // arrives open and must not be sealed
  const closed = Math.hypot(pts[0][0] - pts[pts.length - 1][0],
                            pts[0][1] - pts[pts.length - 1][1]) < Math.max(1.5, diag * .06);
  const step = Math.max(1.7, w * .6);
  const R = ring(pts, closed, step);
  const n = R.length;
  if (n < 3) { s.stroke(pts, w, { alpha: .95, taper: .3, amp: .3 }); return; }

  // the brush's pressure, hashed off the shape so it holds still
  const p1 = h01(x0, y0) * TAU, p2 = h01(x1, y1) * TAU, p3 = h01(x0, y1) * TAU;
  const k1 = 1 + ((h01(y0, x1) * 2) | 0);       // integer: closes seamlessly
  const k2 = k1 + 2;
  // The line is the loudest thing on the sheet — it has to be. A
  // keyblock line at the width of a pencil contour reads as a
  // colouring-book outline; at nearly three times it reads as a brush
  // that was carved.
  // `lo` is a floor, not a taste: below about half the asked width the
  // swell starts BREAKING the silhouette, and a keyblock line is
  // confident and CLOSED above all else.
  const hi = w * 2.9, lo = w * .62;
  // where the block chipped
  const nicks = diag > 46 ? 1 + ((h01(x1 * .3, y0 * .7) * 3) | 0) : 0;

  const L = [], Rt = [];
  for (let i = 0; i < n; i++) {
    const t = closed ? i / n : i / (n - 1);
    const a = R[Math.max(0, i - 1)], b = R[Math.min(n - 1, i + 1)];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0];
    const dd = Math.hypot(nx, ny) || 1; nx /= dd; ny /= dd;

    let m = .5 + .5 * (.70 * Math.sin(t * TAU * k1 + p1) + .30 * Math.sin(t * TAU * k2 + p2));
    // bias the profile THIN: a brush spends most of a stroke light and
    // presses in bursts, and a line that is fat for half its length is
    // a marker outline, not a carved one
    m = m * m * (1.6 - .6 * m);
    let half = (lo + (hi - lo) * m) * .5;
    if (!closed) {
      // a brush lands fast and lifts to a POINT — never a round cap
      half *= smoothstep(t / .09) * smoothstep((1 - t) / .3);
      half = Math.max(half, .1);
    }
    for (let k = 0; k < nicks; k++) {
      const at = h01(x0 + k * 13.7, y1 + k * 5.3);
      const dt = Math.abs(((t - at) + 1.5) % 1 - .5);   // wrapped distance
      if (dt < .022) half *= .12 + .88 * smoothstep(dt / .022);
    }
    // a quarter pixel of tremor: this is drawai's hand, not the press
    const bow = Math.sin(t * TAU * (k1 + 1) + p3) * w * .16;
    const px = R[i][0] + nx * bow + s.jr(-.14, .14);
    const py = R[i][1] + ny * bow + s.jr(-.14, .14);
    L.push([px + nx * half, py + ny * half]);
    Rt.push([px - nx * half, py - ny * half]);
  }

  c.beginPath();
  c.moveTo(L[0][0], L[0][1]);
  for (let i = 1; i < n; i++) c.lineTo(L[i][0], L[i][1]);
  if (closed) { c.lineTo(L[0][0], L[0][1]); c.lineTo(Rt[0][0], Rt[0][1]); }
  for (let i = n - 1; i >= 0; i--) c.lineTo(Rt[i][0], Rt[i][1]);
  c.closePath();
  c.fillStyle = rgb(o.col || SUMI);
  c.fill();
  return hi;
}

// =================================================================
// THE SHEET — everything below here is `backdrop()`, drawn ONCE per
// character onto a panel behind the figure. It rolls freely with
// `s.jr`: there is no boil back here, so a decision made once is a
// decision that holds.
// =================================================================

// ---- the seals --------------------------------------------------
// A print is a published object and it carries three marks in beni
// paste: the artist's seal, the publisher's, and the censor's round
// aratame stamp. They are CARVED, so the strokes are the paper showing
// through the red — cut in negative, never drawn in a second colour.
//
// The marks are blocks and bars on a grid. They are deliberately not
// writing and must not be read as any: a carved seal at this size is
// a lattice of red and paper and that is all the eye gets.
function sealMark(s, cx, cy, r, kind) {
  const c = s.ctx;
  c.save();
  c.translate(cx, cy);
  c.rotate(s.jr(-.05, .05));
  c.beginPath();
  if (kind === 'round') c.arc(0, 0, r, 0, TAU);
  else {
    const rr = r * .22;                        // the corners of a cut stone are soft
    const w = r, h = r * (kind === 'tall' ? 1.35 : 1);
    c.moveTo(-w + rr, -h);
    c.arcTo(w, -h, w, h, rr); c.arcTo(w, h, -w, h, rr);
    c.arcTo(-w, h, -w, -h, rr); c.arcTo(-w, -h, w, -h, rr);
    c.closePath();
  }
  c.fillStyle = rgb(SEAL, .93);
  c.fill();

  // the carving. Paper-coloured, opaque: where the knife went, the
  // paste never touched the sheet.
  c.save();
  c.clip();
  c.strokeStyle = rgb(WASHI, .96);
  c.lineCap = 'butt';
  const h = r * (kind === 'tall' ? 1.35 : 1);
  const cols = kind === 'round' ? 1 : 2;
  const lw = Math.max(.9, r * .17);
  c.lineWidth = lw;
  for (let ci = 0; ci < cols; ci++) {
    const gx = cols === 1 ? 0 : -r * .48 + ci * r * .96;
    const rows = s.ri(2, 3);
    for (let ri = 0; ri < rows; ri++) {
      const gy = -h * .62 + (ri + .5) / rows * h * 1.24;
      const gw = (cols === 1 ? r * .62 : r * .34);
      const gh = h / rows * .34;
      // a couple of bars and a stem: enough lattice to read as cut
      const bars = s.ri(2, 3);
      for (let b = 0; b < bars; b++) {
        const yy = gy - gh + (b + .5) / bars * gh * 2;
        c.beginPath();
        c.moveTo(gx - gw, yy); c.lineTo(gx + gw * s.jr(.5, 1), yy);
        c.stroke();
      }
      if (s.chance(.8)) {
        c.beginPath();
        c.moveTo(gx + s.jr(-.3, .3) * gw, gy - gh);
        c.lineTo(gx + s.jr(-.3, .3) * gw, gy + gh);
        c.stroke();
      }
    }
  }
  // the seal's own frame, cut just inside the stone
  c.lineWidth = Math.max(.8, r * .1);
  c.beginPath();
  if (kind === 'round') c.arc(0, 0, r * .84, 0, TAU);
  else c.rect(-r * .82, -h * .84, r * 1.64, h * 1.68);
  c.stroke();
  c.restore();

  // paste is never evenly loaded: a corner of the stone came up dry
  c.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 7; i++) {
    c.beginPath();
    c.arc(s.jr(-r, r), s.jr(-h, h), s.jr(.6, r * .3), 0, TAU);
    c.fillStyle = `rgba(0,0,0,${s.jr(.1, .35)})`;
    c.fill();
  }
  c.restore();
}

// ---- the title cartouche ----------------------------------------
// A tanzaku: the tall strip in a top corner carrying the series title
// and the sheet's. It is printed from the key block like everything
// else, so it is a sumi frame on knocked-out paper with carved marks
// down it — blocks and bars, not letters. The project is in English
// and this is not text; it is the drawing of a column of carving.
function cartouche(s, x, y, w, h) {
  const c = s.ctx;
  c.save();
  // the paper of the strip, knocked out of whatever sky is behind it
  c.fillStyle = rgb(s.chance(.3) ? mix(BENI_PALE, WASHI, .55) : WASHI, .97);
  c.fillRect(x, y, w, h);
  c.strokeStyle = rgb(SUMI, .92);
  c.lineWidth = Math.max(1.1, w * .085);
  c.strokeRect(x, y, w, h);
  c.beginPath();
  c.rect(x + w * .17, y + w * .17, w * .66, h - w * .34);
  c.lineWidth = Math.max(.6, w * .04);
  c.stroke();

  // the column
  const inner = w * .48;
  const n = Math.max(2, Math.round((h - w * .5) / (inner * 1.5)));
  const cx = x + w * .5;
  c.strokeStyle = rgb(SUMI, .9);
  c.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const gy = y + w * .38 + (i + .5) / n * (h - w * .76);
    const gh = inner * .46;
    const lw = Math.max(.8, inner * .17);
    c.lineWidth = lw;
    const bars = s.ri(2, 4);
    for (let b = 0; b < bars; b++) {
      const yy = gy - gh + (b + .5) / bars * gh * 2;
      const hw = inner * .5 * s.jr(.55, 1);
      c.beginPath(); c.moveTo(cx - hw, yy); c.lineTo(cx + hw, yy); c.stroke();
    }
    if (s.chance(.85)) {
      c.beginPath();
      c.moveTo(cx + s.jr(-.25, .25) * inner, gy - gh * 1.05);
      c.lineTo(cx + s.jr(-.25, .25) * inner, gy + gh * 1.05);
      c.stroke();
    }
    if (s.chance(.45)) {
      const d = s.chance(.5) ? 1 : -1;
      c.beginPath();
      c.moveTo(cx - inner * .45 * d, gy - gh * .8);
      c.lineTo(cx + inner * .45 * d, gy + gh * .9);
      c.stroke();
    }
  }
  c.restore();
}

// ---- the distances ----------------------------------------------
// Fuji: two concave slopes and a flattened, notched summit, with the
// snow cap printed as a knockout — on a real sheet it is simply where
// no block reached, which is why it is exactly the paper.
function fujiPts(cx, base, hw, ht) {
  const p = [], cap = hw * .17, N = 16;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    p.push([cx - hw + (hw - cap) * t, base - ht * Math.pow(t, 1.75)]);
  }
  p.push([cx - cap * .3, base - ht * 1.03]);
  p.push([cx + cap * .2, base - ht * .99]);
  for (let i = N; i >= 0; i--) {
    const t = i / N;
    p.push([cx + hw - (hw - cap) * t, base - ht * Math.pow(t, 1.75)]);
  }
  return p;
}

function distances(s, kind, w, hor, ink) {
  const c = s.ctx;
  c.save();
  c.beginPath(); c.rect(-4, -4, w + 8, hor + 4); c.clip();

  if (kind === 'fuji') {
    const cx = w * s.pick([.19, .24, .76, .81]);
    const hw = w * s.jr(.32, .48), ht = hor * s.jr(.30, .44);
    const P = fujiPts(cx, hor + 1, hw, ht);
    s.poly(P, true);
    const g = c.createLinearGradient(0, hor - ht, 0, hor);
    g.addColorStop(0, rgb(ink));
    g.addColorStop(1, rgb(mix(ink, WASHI, .72)));
    c.fillStyle = g; c.fill();
    // the snow: a scalloped knockout across the summit
    c.save(); s.poly(P, true); c.clip();
    const snow = [];
    const yTop = hor - ht * 1.1, yLo = hor - ht * s.jr(.52, .66);
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      snow.push([cx - hw + t * hw * 2, yLo + Math.sin(t * 17 + 1) * ht * .07 + Math.sin(t * 41) * ht * .035]);
    }
    snow.push([cx + hw, yTop], [cx - hw, yTop]);
    s.poly(snow, true); c.fillStyle = rgb(WASHI, .95); c.fill();
    c.restore();
  } else if (kind === 'hills') {
    const n = s.ri(2, 3);
    for (let i = 0; i < n; i++) {
      const cx = w * s.jr(-.1, 1.1), hw = w * s.jr(.3, .6), ht = hor * s.jr(.06, .15);
      const P = [];
      for (let k = 0; k <= 22; k++) {
        const t = k / 22;
        P.push([cx - hw + t * hw * 2, hor + 1 - ht * Math.pow(Math.sin(t * Math.PI), .7)]);
      }
      P.push([cx + hw, hor + 3], [cx - hw, hor + 3]);
      s.poly(P, true);
      c.fillStyle = rgb(mix(ink, WASHI, .3 + i * .22), .92); c.fill();
    }
  } else if (kind === 'waves') {
    // Hokusai's claw: a crest that curls and throws fingers of foam
    const n = s.ri(3, 5);
    for (let i = 0; i < n; i++) {
      const cx = w * ((i + s.jr(.1, .9)) / n);
      const r = w * s.jr(.07, .14), y = hor - s.jr(0, hor * .09);
      c.beginPath();
      c.arc(cx, y, r, Math.PI * s.jr(.98, 1.08), 0);
      c.lineTo(cx + r * .5, y);
      c.closePath();
      c.fillStyle = rgb(ink, .9); c.fill();
      c.strokeStyle = rgb(WASHI, .8);
      c.lineWidth = Math.max(.8, r * .1);
      c.lineCap = 'round';
      for (let k = 0; k < 4; k++) {
        const a = Math.PI * (1.05 + k * .12);
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * r * .55, y + Math.sin(a) * r * .55);
        c.lineTo(cx + Math.cos(a) * r * 1.02, y + Math.sin(a) * r * 1.02);
        c.stroke();
      }
    }
  } else if (kind === 'pine') {
    // a bough entering from a top corner, the way a print frames itself
    const side = s.chance(.5) ? 0 : 1;
    const x0 = side ? w + 6 : -6, dir = side ? -1 : 1;
    const y0 = hor * s.jr(.04, .18);
    c.strokeStyle = rgb(SUMI, .9);
    c.lineCap = 'round';
    c.lineWidth = Math.max(2, w * .022);
    c.beginPath();
    c.moveTo(x0, y0);
    const x1 = x0 + dir * w * s.jr(.3, .5), y1 = y0 + hor * s.jr(.1, .22);
    c.quadraticCurveTo(x0 + dir * w * .2, y0 + hor * .16, x1, y1);
    c.stroke();
    const nc = s.ri(3, 5);
    for (let i = 0; i < nc; i++) {
      const t = (i + .5) / nc;
      const px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t + Math.sin(t * 3) * 3;
      const r = w * s.jr(.05, .085);
      c.lineWidth = Math.max(.7, w * .006);
      c.strokeStyle = rgb(SUMI, .82);
      for (let k = 0; k < 11; k++) {
        const a = s.jr(0, TAU);
        c.beginPath();
        c.moveTo(px, py);
        c.lineTo(px + Math.cos(a) * r, py + Math.sin(a) * r);
        c.stroke();
      }
    }
  }
  c.restore();
}

export default {
  id: 'ukiyoe', label: 'ukiyo-e', era: 1830, underdraw: false,

  // the sheet lays this behind the row, and `flat()` knocks out with
  // the same triple — one paper, printed on and printed round
  ground: WASHI,

  // The key block is the character's black, everywhere. A part asks
  // for `inkA` and gets warm sumi — the void eyes, the pupils, the
  // nostrils, the teeth are all pulled off the same piece of cherry
  // wood as the contour, which is the literal truth about a print and
  // also the only way the row keeps a single black in it.
  ink: SUMI,

  // An ōban sheet: a tall portrait rectangle, and the figure stands
  // low on it with sky over its head. Narrower than the cell so the
  // sheets do not run into one another — six prints with a gutter
  // between them, not one continuous band.
  //
  // The HEIGHT is the default and that is deliberate. It was tried at
  // 1.32 (the title strip hung out over the page above the row and
  // read as a label stuck on the print rather than pulled with it) and
  // at .96, cut flush to the row's torn sheet — which is tidy, and
  // which left no air over the figure's head at all, so the title went
  // behind it and the whole print came out squat beside its
  // neighbours' panels. A sheet that is shorter than the ones either
  // side of it looks like a smaller idea. The couple of pixels of
  // overhang at the top are invisible anyway, because the row's paper
  // and the print's paper are the same triple.
  // The default height puts the title strip up on the row above, in
  // the middle of somebody else's black; a hair under it and the sheet
  // stays on its own paper with air still over the figure's head.
  panel: { w: .95, h: 1.08, y: .44 },

  // A mass is one block of one flat ink. The density the part asked
  // for chooses WHICH ink, never how much of it — there is no "less
  // ink" in a print, only a paler block. And the SIZE chooses which
  // box: the big flats carry the print's dominant colours, the small
  // ones are where an accent is allowed to happen.
  tone(s, pts, o = {}) {
    const d = dens(o.style);
    const [x0, y0, x1, y1] = bbox(pts);
    const size = Math.hypot(x1 - x0, y1 - y0);
    let col;
    if (o.col) {
      col = nearest(o.col, d >= .9 ? DARK_BOX : size > 58 ? BIG_BOX : size < 30 ? SMALL_BOX : BOX);
    } else if (d >= .95) {
      col = SUMI;                                   // hair, a socket, an eye
    } else if (d >= .68) {
      col = AI_DEEP;
    } else if (d >= .58) {
      col = AI;
    } else if (d >= .45) {
      // the muted mids, and the only place olive is dealt at all
      const r = h01(pts[0][0], pts[0][1]);
      col = size > 58 ? AI : r < .3 ? OLIVE : r < .6 ? OCHRE : AI;
    } else {
      col = size > 58 ? AI_PALE : h01(pts[0][1], pts[0][0]) < .5 ? AI_PALE : BENI_PALE;
    }
    flat(s, pts, col, { gap: o.gap });
  },

  // The face is the lightest value in the print and it is nearly bare
  // washi. Everything the character brought is answered with one of
  // five pale steps off the beni block — a darker cast member prints
  // as a warm tan, because a print's darks are the line and the hair.
  // No plank through it: the flesh block was the shop's cleanest pull.
  // The PAPER is still under it — that is `fibre`, inside `flat`.
  skin(s, pts, col, o = {}) {
    const i = Math.min(FLESH.length - 1, Math.max(0, Math.round(lum(col) * (FLESH.length - 1))));
    flat(s, pts, FLESH[i], { gap: o.gap, knock: true, grain: false });
  },

  // Every silhouette on the character goes through here, and this one
  // line plus the lap behind it is most of what the style is.
  edge(s, pts, w, o = {}) {
    const W = w * 1.05;
    const hi = keyline(s, pts, W, o);
    if (hi) lap(s, pts, hi * 1.15);
  },

  // ---------------------------------------------------------------
  // THE SHEET the figure is printed on: sky, horizon, distance, and
  // the marks that say this is a published print — the title strip and
  // the seals. Every block back here is mis-registered like every
  // block on the figure, and at panel width that slip is four or five
  // pixels of bare washi running the whole way across the sheet, which
  // is the loudest statement of the fault the style can make.
  //
  // Drawn once. So it may choose — a sky colour, a distance, which
  // corner the title hangs in — where a part may not choose anything.
  // ---------------------------------------------------------------
  backdrop(s, { w, h, floor }) {
    const c = s.ctx;
    const reg = Math.max(3, Math.min(7, w * .028));
    // THE HORIZON SITS HIGH — well above the feet, so the near ground
    // is a big flat field the figure stands on rather than a skirting
    // board it stands against. That is how a print divides a sheet
    // (Hiroshige gives half of one to a bank of earth), and it is also
    // the only version that survives being shrunk: with the horizon
    // just under the feet the panel is a pale rectangle with a stripe
    // top and bottom, and at row-of-nine scale that is a pale
    // rectangle. Two big blocks of flat colour and a band of bare
    // washi between them reads at any size.
    const hor = Math.max(h * .40, Math.min(h * .92, floor - h * s.jr(.10, .26)));

    // ---- the sky block ------------------------------------------
    // A bokashi wipe at the head of the sheet. Deep only at the very
    // top: the character's hair is sumi and a full-strength Prussian
    // behind it would swallow the silhouette whole.
    // Weighted hard toward the Prussian, and that is the one piece of
    // art direction in this file that is a DATE: Berlin blue reached
    // the Edo print shops in about 1829 and the sheet is 1830. It is
    // the reason the row exists where it does in the timeline, so it
    // had better be the colour the row is mostly made of.
    //
    // SUMI is not in it. A sumi bokashi at the head of the sheet is a
    // real thing — a night sky, and cheap to print — but at row scale
    // a grey wipe behind a black-haired head does not read as weather,
    // it reads as the scan being dirty. Every other ink here says
    // "sky" the moment it is wiped; that one says "smudge".
    const sky = s.weighted([[AI_DEEP, 42], [AI, 23], [AI_PALE, 11], [BENI, 13], [OCHRE, 11]]);
    const [sx, sy] = REG.get(sky) || DRIFT;
    // The wipe has to be SPENT by the time it reaches the head. A
    // Prussian that is still at half strength behind a blue-haired
    // character takes the silhouette with it, and the key line is then
    // the only thing holding the figure together — which is a lot to
    // ask of a three-pixel line. Full ink for the top eighth, then the
    // cloth takes it away fast.
    const skyH = h * s.jr(.30, .44);
    const g = c.createLinearGradient(0, 0, 0, skyH);
    g.addColorStop(0, rgb(sky, .97));
    g.addColorStop(.13, rgb(sky, .88));
    g.addColorStop(.38, rgb(sky, .38));
    g.addColorStop(1, rgb(sky, 0));
    c.fillStyle = g;
    c.fillRect(sx * reg, -6 + sy * reg, w, skyH + 8);

    // ---- the distance -------------------------------------------
    const kind = s.weighted([['fuji', 22], ['hills', 22], ['waves', 18], ['pine', 14], ['none', 24]]);
    distances(s, kind, w, hor, lum(sky) < .3 ? AI : AI_DEEP);

    // ---- the horizon, on the key block --------------------------
    c.strokeStyle = rgb(SUMI, .78);
    c.lineWidth = Math.max(1, w * .008);
    c.beginPath();
    for (let i = 0; i <= 20; i++) {
      const x = -2 + (w + 4) * i / 20;
      const y = hor + Math.sin(i * .9 + 2) * .7;
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke();

    // ---- the near ground ----------------------------------------
    // One block, one flat, out of register with the line it was cut
    // to sit against — so the whole width of the sheet shows either a
    // ribbon of bare washi under the horizon or the colour climbing
    // over it. Nothing else in the style says "print" this loudly.
    // and it is dealt AGAINST the sky. Two blocks of the same hue with
    // a band of bare paper between them make a halo round the head
    // instead of a horizon under it; a print divides its sheet, and
    // that is a decision the block cutter made, not an accident.
    const blueSky = sky === AI_DEEP || sky === AI || sky === AI_PALE;
    const gnd = s.weighted(blueSky
      ? [[OCHRE, 34], [OLIVE, 26], [BENI_PALE, 12], [AI_PALE, 16], [AI, 8]]
      : [[AI_PALE, 32], [AI, 26], [OLIVE, 26], [BENI_PALE, 10]]);
    const [gx, gy] = REG.get(gnd) || DRIFT;
    c.save();
    c.beginPath();
    c.rect(gx * reg * 1.5, hor + gy * reg * 1.5, w, h - hor + 24);
    c.clip();
    const gg = c.createLinearGradient(0, hor, 0, h);
    gg.addColorStop(0, rgb(mix(gnd, WASHI, .42)));
    gg.addColorStop(1, rgb(gnd, .96));
    c.fillStyle = gg;
    c.fillRect(-8, hor - 10, w + 16, h - hor + 30);
    // the plank and the paper, in the near ground as everywhere else
    const band = [[-8, hor - 10], [w + 8, hor - 10], [w + 8, h + 8], [-8, h + 8]];
    grain(s, band, gnd, w * .09);
    fibre(s, band, gnd);
    c.restore();

    // ---- the marks that say this is a print ---------------------
    const right = s.chance(.5);
    const cw = w * s.jr(.115, .15), ch = h * s.jr(.24, .33);
    const cx = right ? w - cw - w * .05 : w * .05;
    cartouche(s, cx, h * s.jr(.035, .075), cw, ch);

    // the seals go low and on the other side, where a signature goes:
    // down on the near ground, in the corner of the sheet
    const sxo = right ? w * s.jr(.07, .13) : w - w * s.jr(.07, .13);
    const syo = h * s.jr(.70, .86);
    const r = w * s.jr(.038, .052);
    sealMark(s, sxo, syo, r, 'tall');
    if (s.chance(.7)) sealMark(s, sxo + (right ? 1 : -1) * r * 2.4, syo + r * s.jr(.2, .8), r * .7, 'round');

    // ---- and the paper, over the whole sheet --------------------
    fibre(s, [[0, 0], [w, 0], [w, h], [0, h]], mix(WASHI, SUMI, .18));
  },
};
