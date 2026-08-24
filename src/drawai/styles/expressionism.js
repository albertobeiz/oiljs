// ---------------------------------------------------------------
// EXPRESSIONISM — a Brücke woodcut, c. 1910. Kirchner, Heckel,
// Schmidt-Rottluff.
//
// Every other style on this sheet is made by PUTTING SOMETHING DOWN.
// This one is made by TAKING SOMETHING AWAY, and every mark below
// follows from that one fact: the block is inked solid, and the
// picture is whatever the gouge did not remove.
//
// What a Brücke woodcut actually looks like, and each of these is a
// function below:
//   · TWO VALUES and no third — printing black and bare sheet. There
//     is no grey on a relief print, so there is no alpha under 1 in
//     this file. Value is made by how densely you gouge, never by how
//     hard you press;
//   · every line is a CHORD. The blade is pushed, it cannot steer, so
//     a curve arrives as a five- to eleven-sided polygon (`chop`);
//   · the gouge is a WEDGE — nothing where the blade entered, widest
//     just after it went deep, tapering to nothing where it lifted —
//     and it runs in ragged parallel FLIGHTS that stop and restart,
//     because a hand pushing a tool through end-grain does not reach
//     the other side (`gouge`, `flight`);
//   · the tool RUNS OFF THE BLOCK. Clearing the field around a figure
//     the cutter overshoots, and the silhouette itself is bitten
//     (`runoff`, and the sever cuts in `edge`);
//   · the contour is not a line, it is a chipped BAND of black of
//     wildly uneven width, with places where the blade slipped and
//     nearly cut through it (`edge`);
//   · one crude flat colour from a second block, printed OFF-REGISTER
//     — a raw red, a viridian, a hot pink — misaligned by a few
//     millimetres so it fringes out past the black (`block`).
//
// THE SHEET IS THE STYLE'S OWN, and it is why `RAG` exists. Every
// white mark here is the cut going through to the paper, so the cut
// has to be exactly the colour of the paper it goes through to —
// otherwise a gouge is white PAINT laid on cream, which is the one
// thing a relief print cannot contain. `ground` below and `RAG` are
// the same triple on purpose; change one and change the other.
//
// The row's whole claim is CONTRAST, and it is made with three things
// and not one: `INK` is the blackest black on the sheet and is handed
// to the character's own eyes and contours through `ink`; `RAG` is a
// cheap GREY proofing stock, not cream, so the light end belongs to
// nobody else; and the `backdrop` is the BLOCK — a plank with its own
// rim, its grain, its uncut corners and the ground it stands on. The
// one rule governing all three is that the FIGURE has to win. The
// backdrop's first version inked the whole field and reserved only the
// character, which is what a Brücke plank actually looks like and what
// turned the row from the highest contrast on the page into merely the
// darkest — a grey hole in black instead of a black shape on grey. The
// note by the plate mark is the long version.
//
// The one deliberate break with the rest of the project: THIS STYLE
// DOES NOT BOIL. Everywhere else the dice are `s.jr`, which is
// re-rolled every frame and makes the line crawl. A printed block is
// cut ONCE and then it is a physical object — a boiling woodcut is a
// lie about what a woodcut is. So the dice here are seeded off the
// shape itself (`dice`), which makes every mark stable frame to frame,
// identical in both hands, and still different for every shape on the
// character.
//
// Seven things were built and taken back out, and each of them is
// written up where it happened:
//   · `hatchFill` for the shadows — a hatch is a PEN. Even flights of
//     even lines, and the sheet came out a tidy engraving;
//   · the cross flight at parity with the main one, which is
//     crosshatching and read as white thread laid over the hair;
//   · a splinter on every contour, which quilled the whole crowd;
//   · a colour plate cut oversize, which is a halo and not a misprint;
//   · the gouges cut with `destination-out`, so the page's own paper
//     would show through them. Every part of a character is its own
//     plane, so erasing the hair does not reveal the paper — it
//     reveals the SKULL behind it, and on a shrouded head it revealed
//     the black hair behind that and the cuts vanished. `RAG` is the
//     answer instead: match the sheet, don't punch through to it.
//   · the block's whole inked FIELD behind the figure, and a closed
//     rectangular RIM round it when that failed — see the plate mark.
// The pattern in all seven: this style's marks are ACCIDENTS OF A
// TOOL, and an accident that happens everywhere is a texture — or,
// for the last two, a frame.
// ---------------------------------------------------------------
import { nearest, dens, bbox, centroid, rgb } from './pigment.js';
import { U } from '../part.js';

// THE INK IS THE BLACKEST THING ON THE SHEET, and that is a claim
// against eight neighbours, not a colour preference. Every other row is
// a painting — a panel, a canvas, a plate — and a painting's darkest
// passage is a mixed dark sitting in a field of half-tones. This is a
// RELIEF PRINT: one slab of carbon-loaded oil ink, opaque, laid on bare
// stock with nothing between. So it is taken as far down as it will go
// and left a hair warm and a hair off-neutral, because a true #000 is a
// screen and not a pigment.
//
// It is also declared as the row's `ink`, which hands the character's
// whole black over to it — void eyes, pupils, nostrils, teeth, every
// contour a part draws for itself. A woodcut cannot contain a second
// black.
const INK = [12, 11, 13];

// The sheet a Brücke proof is pulled on. NOT cream: a proof is pulled
// on whatever is to hand and what was to hand was cheap GREY stock —
// mechanical wood-pulp, unbleached, faintly cold. That is the row's
// `ground`, and it is the second half of the contrast claim: the sheet
// has to be light enough to be the light end of a two-value system,
// and grey enough that it is nobody else's paper. Cream put this row a
// few points off gothic's gesso and dada's newsprint and the squint
// test could not tell three rows apart.
//
// Every gouge below fills with this and nothing else, so a cut reads as
// the stock coming through the block rather than as a white line drawn
// over it. `ground` and `RAG` are the same triple on purpose; change
// one and change the other.
const RAG = [205, 204, 198];
const SHEET = rgb(RAG);

// The second block's box of paint. SIX colours and all of them RAW —
// the point of a colour woodcut is that the hue is unmixed and
// slightly wrong, not that it describes anything. Three of them are
// the Brücke's own acids and they are the reason this row is not six
// impressions of one print: Kirchner's viridian, the poison green of
// the Berlin pavements, and the hot pink of `Marzella`. A box of
// red-ochre-black is a house style; a box with an acid in it gives
// every character a note of its own, because `nearest` maps the
// character's real colour into it and no two characters own the same
// colour.
const CRUDE = [
  [193, 44, 30],     // vermilion
  [26, 58, 136],     // ultramarine
  [223, 158, 36],    // chrome yellow
  [20, 124, 96],     // viridian
  [206, 50, 118],    // hot pink
  [130, 170, 42],    // poison green
];

// ---- the block's own dice --------------------------------------
// Seeded off the shape itself, so the cut is a property of the shape
// and not of the frame. See the header: a print does not move.
//
// The seed is COARSELY BINNED, and that is not fussiness. Parts jitter
// their own outlines a little every redraw — `skull.js` nudges the
// skin polygon by ±3.5% of the head and rescales it — and on a raw
// bounding box that re-cuts the whole face sixty times a second, which
// is the worst kind of boil there is. The bins are sized off the
// shape's own diagonal (an eighth of it for position, a log step for
// size), so a wobble smaller than the shape's own features lands back
// in the same bin and the block holds still.
function dice(pts) {
  const [x0, y0, x1, y1] = bbox(pts);
  const dg = Math.hypot(x1 - x0, y1 - y0) || 1;
  const q = Math.max(1, dg * .13);
  let h = (Math.imul(Math.round(Math.log(dg) * 5), 374761393)
    ^ Math.imul(Math.round((x0 + x1) / 2 / q), 668265263)
    ^ Math.imul(Math.round((y0 + y1) / 2 / q), 2246822519)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0;
  return () => {
    h = (h + 0x6D2B79F5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// path helpers — `s.poly` always begins its own path, so a shape with
// a HOLE in it (which is what the reserve below needs) has to be
// built by hand
function ring(c, pts) {
  c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  c.closePath();
}
function clipTo(c, shape, hole) {
  c.beginPath();
  ring(c, shape);
  if (hole) { ring(c, hole); c.clip('evenodd'); } else c.clip();
}

// a board is SAWN, not cut: four straight-ish sides walked with a
// jitter, so the block's own edge is a hand's edge
function sawn(R, x0, y0, x1, y1, amp) {
  const p = [], M = 5;
  const side = (ax, ay, bx, by) => {
    for (let i = 0; i < M; i++) {
      const t = i / M;
      p.push([ax + (bx - ax) * t + (R() - .5) * amp, ay + (by - ay) * t + (R() - .5) * amp]);
    }
  };
  side(x0, y0, x1, y0); side(x1, y0, x1, y1);
  side(x1, y1, x0, y1); side(x0, y1, x0, y0);
  return p;
}

// The plank's own fibre, lifting ink out of whatever is printed over
// it. It runs DOWN the board, because this is a side-grain plank and
// not an engraver's end-grain block, and it is the only mark in the
// file that is not a gouge — so it goes through `s.ctx` and stays
// hair-fine in both hands. Put through the hand it comes back as a
// brush stroke, and a brush stroke is the one thing a print cannot
// contain.
function grain(s, c, w, h, m) {
  c.strokeStyle = SHEET; c.lineCap = 'round';
  for (let i = 0; i < 16; i++) {
    const x = s.jr(-m * .05, w + m * .05);
    const ph = s.jr(0, 7), fq = s.jr(.02, .05), aw = m * s.jr(.004, .022);
    let y = -m * .05;
    c.beginPath(); c.moveTo(x, y);
    while (y < h + m * .05) { y += m * .05; c.lineTo(x + Math.sin(y * fq + ph) * aw, y); }
    c.lineWidth = Math.max(.5, m * s.jr(.0016, .0042));
    c.stroke();
  }
}

// ---- a curve is a series of chords ------------------------------
// The single most important move in the file. Decimating the ring to
// five-to-eleven vertices is what turns a cute round head into a
// carved one; everything else is texture on top of it. The count comes
// off the shape's own size, so an eye becomes a pentagon and a skull a
// hendecagon — and the eye being a pentagon is the point, not a
// concession. Thirteen sides was the first try and it is a circle.
//
// The inscribed polygon loses area against the ring it came from, so
// each vertex is pushed back out by 1/cos(pi/n) before it is jittered;
// without that the silhouette shrinks a few percent per part and the
// features drift off the head they belong to.
function chop(R, pts, extra = 0) {
  const [x0, y0, x1, y1] = bbox(pts);
  const diag = Math.hypot(x1 - x0, y1 - y0);
  const n = Math.max(5, Math.min(11, Math.round(4 + diag * .085) + extra));
  const [cx, cy] = centroid(pts);
  const m = pts.length;
  const grow = 1 / Math.cos(Math.PI / n);
  const ph = R() * m;
  const out = [];
  for (let i = 0; i < n; i++) {
    const p = pts[Math.round(ph + i * m / n) % m];
    const g = grow * (1 + (R() - .5) * .17);      // the cut wanders off the drawing
    out.push([cx + (p[0] - cx) * g, cy + (p[1] - cy) * g]);
  }
  return out;
}

// ---- one gouge --------------------------------------------------
// A wedge, and it is not straight: the blade is pushed against the
// grain and skips off it, so the spine is two or three chords with a
// kink at each join. That kink is the whole difference between a
// woodcut and a set of tapered brush marks.
//
// The width profile TAPERS AT BOTH ENDS, because the tool enters and
// the tool lifts, and it is asymmetric: the rise is short (the blade
// drops in) and the fall is long (it is drawn out over most of the
// run). Peaking in the middle looks like a leaf, which is a nib, not
// a gouge; rising instantly looks like a chisel stab.
function gouge(s, R, sx, sy, ang, len, half) {
  const segs = 2 + (R() * 2 | 0);
  const spine = [[sx, sy]];
  let a = ang + (R() - .5) * .2, x = sx, y = sy;
  for (let k = 0; k < segs; k++) {
    a += (R() - .5) * .34;
    x += Math.cos(a) * len / segs; y += Math.sin(a) * len / segs;
    spine.push([x, y]);
  }
  const M = 7, path = [];
  for (let i = 0; i <= M; i++) {
    const t = i / M * segs, k = Math.min(segs - 1, t | 0), f = t - k;
    path.push([spine[k][0] + (spine[k + 1][0] - spine[k][0]) * f,
               spine[k][1] + (spine[k + 1][1] - spine[k][1]) * f]);
  }
  const L = [], Rt = [];
  for (let i = 0; i <= M; i++) {
    const t = i / M;
    const wd = half * (t < .17 ? Math.pow(t / .17, .6)
                               : Math.pow(1 - (t - .17) / .83, .95));
    const a0 = path[Math.max(0, i - 1)], b0 = path[Math.min(M, i + 1)];
    let nx = -(b0[1] - a0[1]), ny = b0[0] - a0[0];
    const d = Math.hypot(nx, ny) || 1; nx /= d; ny /= d;
    L.push([path[i][0] + nx * wd, path[i][1] + ny * wd]);
    Rt.push([path[i][0] - nx * wd, path[i][1] - ny * wd]);
  }
  s.poly(L.concat(Rt.reverse()), true);
  s.ctx.fill();
}

// ---- a flight of them -------------------------------------------
// Parallel, but only in the sense that a ploughed field is: the
// spacing staggers, the cuts start and stop at different places along
// their line, and a line may carry two of them with bare block
// between. `wt(u)` weights the flight across its own width, which is
// how a cheek gets a black slab on one side and clean paper on the
// other without anything having to know where the light is.
//
// LENGTH IS A LOTTERY, and the spread has to be an order of magnitude.
// Every cut the same length is a scribble at one frequency, which is
// what a scratch looks like; a real block carries a few cuts that run
// most of the way across it and a great many short flicks, and the
// difference between those two is what says a TOOL was here.
function flight(s, R, shape, css, o) {
  const { ang, gap, cover, len = .5, wt = null, fan = .3, hole = null } = o;
  const [x0, y0, x1, y1] = bbox(shape);
  const diag = Math.hypot(x1 - x0, y1 - y0);
  if (diag < 3) return;
  const c = s.ctx;
  c.save(); clipTo(c, shape, hole);
  c.fillStyle = css;
  const dx = Math.cos(ang), dy = Math.sin(ang), px = -dy, py = dx;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const span = diag * .62;
  let guard = 0;
  for (let off = -span; off <= span && guard < 30; off += gap * (.78 + R() * .5)) {
    guard++;
    const cv = Math.min(1.1, cover * (wt ? wt(off / span) : 1));
    if (cv <= .05) continue;
    const bx = cx + px * off, by = cy + py * off;
    // the flight FANS: a cutter's arm pivots at the elbow, so the
    // direction swings a little from one side of the block to the
    // other and the flight follows the form instead of ruling across
    // it. Truly parallel cuts read as machine hatching.
    const ga = ang + fan * (off / span);
    const n = 1 + (R() * 2 | 0);        // the cut does not reach the other side
    for (let k = 0; k < n; k++) {
      const t0 = (R() * 1.5 - .75) * diag;
      const lm = R() < .13 ? 1.7 + R() * 1.5 : .18 + R() * .72;  // an order of magnitude
      // the .6 floor is a value decision, not a cosmetic one: a wedge
      // thinner than a pixel prints as a grey line, and this style
      // does not own a grey
      gouge(s, R, bx + dx * t0, by + dy * t0, ga,
        diag * len * lm, Math.max(.6, gap * .5 * cv));
    }
  }
  c.restore();
}

// ---- the tool runs off the block ---------------------------------
// A cutter clearing the field does not stop politely at the drawing:
// the gouge is driven at the figure from outside it and overshoots,
// so the silhouette is BITTEN — widest at the rim, tapering inward.
// That bite is where the ragged Brücke edge actually comes from, and
// without it the cuts all sit in the middle of a mass with a clean
// black border round them, which reads as a scribble inside a shape
// instead of as a carved plank.
//
// It doubles as the guarantee that no plank goes uncut. A black mass
// with nothing taken out of it is a FILL, not a block — the cutter has
// to prove he was there — and the small ones (a topknot, an ear) fell
// through the flight's spacing and came out as flat slabs.
function runoff(s, R, shape, css, n) {
  const [x0, y0, x1, y1] = bbox(shape);
  const diag = Math.hypot(x1 - x0, y1 - y0);
  if (diag < 6 || n < 1) return;
  const c = s.ctx;
  const [cx, cy] = centroid(shape);
  c.save(); clipTo(c, shape);
  c.fillStyle = css;
  for (let k = 0; k < n; k++) {
    const a = R() * 6.2832;
    const rr = diag * (.4 + R() * .24);
    gouge(s, R, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr,
      a + Math.PI + (R() - .5) * .6,
      diag * (.1 + R() * .3), Math.max(.9, diag * (.012 + R() * .028)));
  }
  c.restore();
}

// ---- the press was starved ---------------------------------------
// A Brücke proof was not pulled on a press. It was rubbed by hand with
// a spoon or the heel of the palm, and a hand runs out: the top of a
// print is fully charged and the bottom is STARVED — the black goes
// patchy, breaks into flecks and skips outright where the block never
// quite met the sheet. It is the most recognisable process artefact
// there is and it costs a lookup.
//
// `press(y)` is where on the print we are. `draw()` is in character
// coordinates with the origin at the CENTRE OF THE HEAD, so y is
// already "how far down the figure", and `U` (canvas px per world unit)
// is the only thing needed to turn it into a fraction — which is why
// this file imports it. Without a real unit the constant would be in
// raw pixels and the crowd, which builds at a smaller `U`, would starve
// its characters at the chin.
//
// It is capped short of 1. Fully starved feet are feet that are not
// there, and the drawing still has to hold.
// The two constants are MEASURED, not guessed. A character's masses
// run from about y = -.3U (the crown) to y = +.75U (the shoes) — read
// off the real generator by wrapping `tone` and logging bounding boxes
// over a build — so the ramp has to start just under the chin and
// reach its cap at the feet. The first pair were sized for a figure
// twice as long and the whole gradient topped out at four tenths: the
// starve was there in the code and invisible on the sheet.
const press = y => Math.max(0, Math.min(.82, (y / U - .12) / .78));

// The starve itself: flecks of bare stock eaten out of whatever was
// just laid down. MICRO-TEXTURE, so it goes through `s.ctx` and stays
// fleck-sized in both hands — put through the hand it comes back as
// brush marks, and a brush mark is the one thing a print cannot have.
// They are irregular quads and not dots, because ink fails along the
// grain of the paper's own tooth, and they crowd toward the bottom of
// the shape as well as toward the bottom of the print.
function starve(s, R, shape, k) {
  if (k <= .04) return;
  const [x0, y0, x1, y1] = bbox(shape);
  const bw = x1 - x0, bh = y1 - y0;
  const diag = Math.hypot(bw, bh);
  if (diag < 7) return;
  const c = s.ctx;
  c.save(); clipTo(c, shape);
  c.fillStyle = SHEET;
  const n = Math.round(diag * 2.2 * k);
  for (let i = 0; i < n; i++) {
    const u = R(), v = Math.pow(R(), .55);          // crowded low
    const x = x0 + bw * u, y = y0 + bh * v;
    const r = diag * (.01 + R() * .045) * (.5 + k);
    const q = [];
    const m = 4 + (R() * 3 | 0);
    for (let j = 0; j < m; j++) {
      const a = j / m * 6.2832;
      q.push([x + Math.cos(a) * r * (.4 + R() * 1.3), y + Math.sin(a) * r * (.3 + R())]);
    }
    s.poly(q, true); c.fill();
  }
  // and the outright SKIPS: where the rubbing missed altogether the
  // ink simply stops, in a long thin lane across the print. Two or
  // three, only well down the sheet — a skip near the top is a scratch.
  if (k > .45) {
    for (let i = 0, sk = (R() * 2.6 * k | 0); i < sk; i++) {
      const y = y0 + bh * (.35 + R() * .7);
      const th = diag * (.012 + R() * .03);
      const lane = [];
      const M = 5;
      for (let j = 0; j <= M; j++) lane.push([x0 - bw * .1 + bw * 1.2 * (j / M), y + (R() - .5) * th * 2.4]);
      for (let j = M; j >= 0; j--) lane.push([x0 - bw * .1 + bw * 1.2 * (j / M), y + th + (R() - .5) * th * 2.4]);
      s.poly(lane, true); c.fill();
    }
  }
  c.restore();
}

// ---- the reserve -------------------------------------------------
// THE ONE PLACE THIS STYLE IS NOT ALLOWED TO WIN. drawai's whole
// register is a black void eye sitting in a light field, and a woodcut
// that inks a head solid eats it: the eye stops being an eye and
// becomes a hole in a mass. So before any black goes near a head, a
// band across the eye line is RESERVED — and reserving is what a
// cutter does anyway. He does not paint the light in, he cuts it out.
//
// The band is placed with no help from the parts, and it does not need
// any: `draw()` is in CHARACTER COORDINATES with the origin at the
// centre of the head, and the eyes sit on that origin. So a mass is
// covering them exactly when it straddles (0,0). Its height is tied to
// the shape's own HALF WIDTH and never to its height, because an eye
// scales with how wide a head is and not with how long its chin is.
//
// It is a LANE and not a lozenge, and that is the difference between a
// carved reserve and a mask. Cut as a closed pill in the middle of the
// face it read as a bandage somebody was wearing; run clean off both
// sides of the block, with a kinked freehand edge top and bottom, it
// reads as what it is — the cutter clearing a lane across the plank so
// the eyes have somewhere to be.
//
// The guards are what keep it off everything that is not a head: it
// must straddle the origin in both axes, be centred on it, and have a
// head's aspect. A torso starts below the origin and fails; a fringe
// ends above it and fails; a waist-length hair mass is far taller than
// it is wide and fails, which matters, because that one is drawn
// BEHIND the face and a light lozenge in it flashes out at the
// temples.
function eyeBand(R, shape) {
  const [x0, y0, x1, y1] = bbox(shape);
  const hw = (x1 - x0) / 2, hh = (y1 - y0) / 2;
  if (hw < 11 || hh < 11) return null;
  if (hh / hw < .5 || hh / hw > 1.7) return null;               // a head's aspect
  if (Math.abs(x0 + x1) > hw * .7 || Math.abs(y0 + y1) > hh * .8) return null;
  if (x0 > -hw * .5 || x1 < hw * .5) return null;              // straddles the eyes
  if (y0 > -hh * .22 || y1 < hh * .22) return null;
  const far = hw * 1.9, ry = hw * .34, cy = -ry * .12;
  const tilt = (R() - .5) * .16;                    // the lane is cut by hand
  const M = 4, top = [], bot = [];
  for (let i = 0; i <= M; i++) {
    const u = (i / M - .5) * 2 * far;
    top.push([u, cy - ry * (.72 + R() * .55) + u * tilt]);
    bot.push([u, cy + ry * (.72 + R() * .55) + u * tilt]);
  }
  return top.concat(bot.reverse());
}

// ---- the second block, off-register -----------------------------
// The colour block is a CRUDER cut than the key block — fewer sides,
// one slab across the shape rather than a shape at all — and it is
// printed a few millimetres out, so it fringes past the black on one
// side and falls short on the other. That misalignment is the only
// thing on the page that says "this was printed" rather than "this was
// drawn", so the offset is deliberately too large to be a mistake.
//
// The slab's own direction is a FULL TURN, and that is a fix, not a
// detail. It used to be half a turn, which meant the half-plane kept
// was always the upper one — so the colour landed across the brow of
// every character in the row and the second block read as a mask
// somebody was wearing rather than as a plate somebody printed.
//
// `grow` is a SHRINK, and that is not a typo. `chop` pushes its
// vertices out by 1/cos(pi/n) to hold the area it inherited, and the
// colour plate is chopped again at seven sides where the key block has
// eleven — so it arrives eleven percent oversize before anything here
// touches it, and left alone it put a red aura the size of its own
// head around one character. Colour all the way round a mass is not a
// misprint, it is a halo. The fringe has to be on ONE side, which is
// what the offset is for.
function block(s, R, shape, col, diag, grow = .93) {
  const c = s.ctx;
  const [cx, cy] = centroid(shape);
  // the offset has to be BIG. At 5% of the diagonal the colour showed
  // as a red thread along one edge of the hair and read as a hairband
  // somebody had drawn; at 9% with the plate cut oversize it reads as
  // what it is, a second impression that missed.
  const a = R() * 6.2832;
  const dx = Math.cos(a) * diag * .085, dy = Math.sin(a) * diag * .085;
  const ca = R() * 6.2832, nx = Math.cos(ca), ny = Math.sin(ca);
  const far = diag * 3, sh = R() * .78 - .3;
  const ex = cx + nx * diag * sh, ey = cy + ny * diag * sh;
  const tx = -ny, ty = nx;
  c.save();
  s.poly([[ex + tx * far, ey + ty * far], [ex - tx * far, ey - ty * far],
          [ex - tx * far - nx * far, ey - ty * far - ny * far],
          [ex + tx * far - nx * far, ey + ty * far - ny * far]], true);
  c.clip();
  const pl = chop(R, shape, -4).map(p => [cx + (p[0] - cx) * grow + dx,
                                          cy + (p[1] - cy) * grow + dy]);
  s.poly(pl, true);
  c.fillStyle = rgb(col); c.fill();
  // THE COLOUR BLOCK IS A BLOCK TOO. Left as a flat fill a big red
  // face is the one shape on the character that was not cut out of
  // anything, and it reads as a swatch dropped behind the drawing. A
  // handful of cuts through it — far fewer than the key block gets,
  // because a colour plate is roughed out and not modelled — and it
  // joins the print.
  flight(s, R, pl, SHEET, {
    ang: R() * 3.14, gap: diag * (.16 + R() * .1), cover: .34,
    len: .55, fan: (R() - .5) * .9,
  });
  c.restore();
}

export default {
  id: 'expressionism', label: 'expressionism', era: 1910, underdraw: false,

  // the row's paper IS the colour every gouge fills with. See `RAG`.
  ground: RAG,
  // ...and the character's whole black is the block's ink. See `INK`.
  ink: INK,

  // The panel is the BLOCK, so it is a board and not a window: as wide
  // as the cell, a little taller than the figure, and dropped so there
  // is a hand's width of plank below the feet for the print to run out
  // on. `y` lower than the default is what buys that margin.
  panel: { w: 1.04, h: 1.0, y: .38 },

  // ---- the block --------------------------------------------------
  // The one style on this sheet whose backdrop is not a SPACE. Gothic
  // needs a gold heaven behind the figure, baroque a void, surrealism a
  // plain with something impossible standing on it — because those are
  // pictures OF somewhere. A woodcut is not of anywhere. It is a plank
  // with an image cut into it, and the thing behind the figure is the
  // rest of the plank: the field the cutter cleared, the black he left
  // standing, the grain of the wood lifting ink out of it, and the
  // gouges that ran off the edge because a pushed blade does not stop.
  //
  // So this is the same four functions the figure is made of — `sawn`,
  // `chop`, `gouge`, `flight` — at a scale ten times bigger. That is
  // the argument for it: it is not wallpaper behind a drawing, it is
  // the drawing's own tool talking at the size of the whole sheet, and
  // a viewer who has looked at one character already knows what it is
  // saying.
  //
  // It is drawn ONCE per character, so unlike everything else in this
  // file it may roll freely — a slab of colour here or not, the field
  // cleared this side or that. Nothing here can strobe.
  backdrop(s, { w, h, floor }) {
    const c = s.ctx;
    const R = () => s.jr(0, 1);
    const m = Math.min(w, h);
    // the board is not always squared up on the sheet, and the inset is
    // rolled per print so six blocks in a row do not line their rims up
    // into one horizontal bar — the cage failure again, rotated.
    const in0 = m * s.jr(.02, .09);

    // the board
    const board = sawn(R, in0, in0, w - in0, h - in0, m * .022);

    // The RESERVE: the shape of the field the cutter cleared so the
    // figure would have somewhere to stand. Sized off `floor`, so it
    // lands where the figure lands without this knowing anything about
    // the page's layout.
    //
    // Nothing is drawn from it directly any more — see the plate mark —
    // but it is still the SECOND BLOCK's outline, and that is the right
    // job for it: a colour plate on a two-block print is cut roughly to
    // the same field as the key block, which is exactly why the
    // misregistration is legible when it misses.
    const cx = w * .5, cy = floor - h * .44;
    const rx = w * .44, ry = h * .43, N = 13;
    const res = [];
    for (let i = 0; i < N; i++) {
      const a = i / N * 6.2832, g = 1 + (R() - .5) * .26;
      res.push([cx + Math.cos(a) * rx * g, cy + Math.sin(a) * ry * g]);
    }

    // THE SECOND BLOCK, at sheet scale. On the figure it is a slab
    // across one mass; here it is the whole field behind the head, and
    // it is what makes this row survive a squint from across the room —
    // one raw unmixed hue, printed a good few millimetres out of true.
    if (s.chance(.66)) {
      const r = R();
      const col = r < .28 ? CRUDE[0] : r < .46 ? CRUDE[2] : r < .60 ? CRUDE[1]
                : r < .76 ? CRUDE[3] : r < .90 ? CRUDE[4] : CRUDE[5];
      const dx = (R() - .5) * m * .17, dy = (R() - .5) * m * .17;
      const pl = chop(R, res, -6).map(p => [p[0] + dx, p[1] + dy]);
      c.save(); clipTo(c, board);
      // the plate is cut down with one straight pass, so it is a SLAB
      // over part of the field and not a second ground: colour edge to
      // edge behind every figure is a poster, and this row has one
      // accent per print or none
      const a = R() * 6.2832, nx = Math.cos(a), ny = Math.sin(a);
      const far = m * 3, tx = -ny, ty = nx;
      const sh = (R() - .5) * m * .34;
      const ex = cx + nx * sh, ey = cy + ny * sh;
      s.poly([[ex + tx * far, ey + ty * far], [ex - tx * far, ey - ty * far],
              [ex - tx * far - nx * far, ey - ty * far - ny * far],
              [ex + tx * far - nx * far, ey + ty * far - ny * far]], true);
      c.clip();
      s.poly(pl, true); c.fillStyle = rgb(col); c.fill();
      flight(s, R, pl, SHEET, { ang: R() * 3.14, gap: m * .13, cover: .3, len: .6, fan: (R() - .5) * .9 });
      c.restore();
    }

    // THE PLATE MARK — and the size of it is the whole lesson of this
    // round. The first version inked the entire field and reserved only
    // the figure, which is what a Brücke plank actually looks like: a
    // black sheet with a figure cut out of it. On a page of its own it
    // was magnificent. In the ROW it was a disaster, because the figure
    // is already the blackest object on the sheet, and putting it on
    // black meant the character stopped being a black shape on grey and
    // became a grey hole in black. The row went from the highest
    // contrast on the page to the darkest, which is not the same thing
    // and is worth half the argument.
    //
    // So what is left is the rim: the one part of a plank that always
    // prints, because it is the part the cutter never has any reason to
    // clear. Its thickness is jittered by as much as its own width, so
    // it is a hand-sawn edge and not a picture frame — and the corners
    // are where it is thickest, which is exactly where a block wears.
    // ...and the rim is dealt SIDE BY SIDE, not as a rectangle, which
    // is the second half of the same lesson. A closed band of black
    // round every figure is a frame — worse, six of them in a row with
    // their verticals abutting came back as a CAGE, black bars from the
    // top of the sheet to the bottom with a child behind each gap. A
    // plate mark on a hand-rubbed proof is nothing like that: it shows
    // where the block bore down and not where it did not, so it is
    // usually one edge, sometimes two, often only half of one. The
    // verticals are dealt rarest of the four for exactly the reason
    // above.
    //
    // Everything else about it is uneven on purpose: where along the
    // side it starts and stops, how thick it is at each point, and
    // whether the tool then went along it and took a stretch out.
    const co = [[in0, in0], [w - in0, in0], [w - in0, h - in0], [in0, h - in0]];
    const odds = [.18, .16, .46, .16];
    c.save(); clipTo(c, board);
    for (let e = 0; e < 4; e++) {
      if (R() > odds[e]) continue;
      const a0 = co[e], b0 = co[(e + 1) % 4];
      const dx = b0[0] - a0[0], dy = b0[1] - a0[1];
      const L = Math.hypot(dx, dy) || 1;
      const ux = dx / L, uy = dy / L, nx = -uy, ny = ux;   // inward
      const u0 = R() * .34, u1 = Math.min(1, u0 + .45 + R() * .55);
      const M2 = 6, band = [], back = [];
      for (let i = 0; i <= M2; i++) {
        const u = u0 + (u1 - u0) * (i / M2);
        const px = a0[0] + dx * u, py = a0[1] + dy * u;
        const t = m * (.018 + R() * .055);
        band.push([px, py]);
        back.push([px + nx * t, py + ny * t]);
      }
      const rim = band.concat(back.reverse());
      s.poly(rim, true); c.fillStyle = rgb(INK); c.fill();
      // THE GRAIN. End-grain would take no impression at all; this is a
      // plank sawn the long way, and its fibre lifts the ink in streaks
      // that run DOWN the board. It is clipped to the ink, because
      // grain is ink FAILING and there is nothing for it to fail in
      // over bare stock.
      c.save(); clipTo(c, rim); grain(s, c, w, h, m); c.restore();
      // and the tool went along it: one stretch cleared outright
      if (R() < .7) {
        c.fillStyle = SHEET;
        const u = u0 + (u1 - u0) * R();
        const ang = Math.atan2(uy, ux) + (R() - .5) * .3;
        gouge(s, R, a0[0] + dx * u, a0[1] + dy * u, ang,
          L * (.12 + R() * .34), Math.max(1, m * (.012 + R() * .034)));
      }
    }
    c.restore();

    // THE CORNERS ARE NEVER CLEARED. A cutter works the middle of a
    // block, where the picture is; the corners are where his tool has
    // no reason to go, so a Brücke plank keeps a wedge of full uncut
    // black at two or three of them and the field opens out from there.
    // It is the whole of what survived of the inked field after the
    // note above, and it is the right survivor: it puts real black mass
    // on the sheet, it is ASYMMETRIC — one corner or two, never four —
    // and it never closes round the figure, which is what made the full
    // field and the rectangular rim both fail.
    //
    // The hypotenuse is a freehand chord, kinked, because the cutter
    // ran the tool across in three or four pushes and not one.
    // Two rules keep them from adding back up into the field that was
    // just taken out. They are DIAGONAL — a second wedge goes to the
    // opposite corner and never the one next door, because two wedges
    // along the same edge are that edge — and the first is dealt to the
    // BOTTOM by preference, where it runs into the ground mass and
    // reads as the earth coming up at the side of the picture. Dealt
    // freely, six characters put black in both top corners and the row
    // grew a ceiling.
    const c0 = R() < .62 ? 2 + (R() < .5 ? 0 : 1) : (R() < .5 ? 0 : 1);
    const ord = [c0, (c0 + 2) % 4];
    c.save(); clipTo(c, board);
    for (let k = 0, nc = 1 + (R() < .45 ? 1 : 0); k < nc; k++) {
      const p = co[ord[k]];
      const sx = p[0] < w * .5 ? 1 : -1, sy = p[1] < h * .5 ? 1 : -1;
      const dx2 = m * (.12 + R() * .21), dy2 = m * (.1 + R() * .23);
      const wedge = [p];
      const M3 = 4;
      for (let i = 0; i <= M3; i++) {
        const t = i / M3, jt = (R() - .5) * m * .07;
        wedge.push([p[0] + sx * dx2 * (1 - t) + jt, p[1] + sy * dy2 * t + jt]);
      }
      c.fillStyle = rgb(INK); s.poly(wedge, true); c.fill();
      c.save(); clipTo(c, wedge); grain(s, c, w, h, m); c.restore();
      // the frontier, cut both ways — the same move the figure's own
      // masses get, at ten times the size
      for (let g = 0; g < 5; g++) {
        const i = 1 + ((R() * M3) | 0);
        const q = wedge[i];
        const a = Math.atan2(q[1] - p[1], q[0] - p[0]) + Math.PI / 2 * (R() < .5 ? 1 : -1) + (R() - .5) * .8;
        c.fillStyle = g < 3 ? SHEET : rgb(INK);
        gouge(s, R, q[0], q[1], a, m * (.06 + R() * .3), Math.max(1, m * (.01 + R() * .04)));
      }
    }
    c.restore();

    // THE GOUGES THAT RAN OFF THE EDGE. Not clipped to the board, on
    // purpose: the blade is pushed at the block from outside it and
    // does not stop where the sawn edge is, so the cut carries on into
    // the margin of the sheet. It is the one mark here that proves the
    // black rectangle is an OBJECT somebody handled and not a shape
    // somebody drew.
    c.fillStyle = SHEET;
    for (let k = 0; k < 4; k++) {
      const t = R() * 4 | 0;
      const u = R();
      const sx = t === 0 ? w * u : t === 1 ? w - in0 : t === 2 ? w * u : in0;
      const sy = t === 0 ? in0 : t === 1 ? h * u : t === 2 ? h - in0 : h * u;
      const a = Math.atan2(sy - h * .5, sx - w * .5) + (R() - .5) * .8;
      gouge(s, R, sx - Math.cos(a) * m * .1, sy - Math.sin(a) * m * .1, a,
        m * (.09 + R() * .13), m * (.008 + R() * .025));
    }

    // THE GROUND. A Brücke figure is not floating: there is a black
    // mass under it and its top edge is one freehand chord. It is cut
    // just below the feet so the figure stands ON it rather than in it,
    // and it is the most starved thing on the print, because it is the
    // last thing the hand reached.
    const bar = [], M = 6, ty0 = floor + m * .015;
    for (let i = 0; i <= M; i++) {
      const u = i / M;
      bar.push([-m * .05 + (w + m * .1) * u, ty0 + (R() - .5) * m * .035 + (u - .5) * m * .05]);
    }
    bar.push([w + m * .05, h * 1.2], [-m * .05, h * 1.2]);
    c.save(); clipTo(c, board);
    s.poly(bar, true); c.fillStyle = rgb(INK); c.fill();
    c.save(); clipTo(c, bar); grain(s, c, w, h, m); c.restore();
    flight(s, R, bar, SHEET,
      { ang: .08 + (R() - .5) * .3, gap: m * .05, cover: .66, len: .8, fan: .2 });
    c.restore();

    // ...and the whole bottom of the print is starved, for the same
    // reason the figure's feet are: a hand rubbing a block runs out.
    // Same function, keyed to the panel's own height instead of to the
    // character's.
    c.save(); clipTo(c, board);
    c.fillStyle = SHEET;
    for (let i = 0, n = Math.round(m * .22); i < n; i++) {
      const v = Math.pow(R(), .4);
      const y = h * (.3 + .72 * v), x = R() * w;
      const r = m * (.004 + R() * .02) * (.4 + v);
      const q = [], q4 = 4 + (R() * 3 | 0);
      for (let j = 0; j < q4; j++) {
        const a = j / q4 * 6.2832;
        q.push([x + Math.cos(a) * r * (.4 + R() * 1.4), y + Math.sin(a) * r * (.3 + R())]);
      }
      s.poly(q, true); c.fill();
    }
    c.restore();
  },

  // A mass is the block. Above about half density the ink survives and
  // the value is CUT out of it; below it the block has been taken away
  // and what is left is splinters. Same function, colours swapped —
  // which is exactly the decision a cutter makes at the drawing stage.
  tone(s, pts, o = {}) {
    const R = dice(pts);
    const d = dens(o.style);
    const shape = chop(R, pts);
    const [x0, y0, x1, y1] = bbox(shape);
    const diag = Math.hypot(x1 - x0, y1 - y0);
    const gap = Math.max(2.6, o.gap ? o.gap * 1.2 : diag * .14);
    const ang = -1.15 + (R() - .5) * 2;

    // The second block does not have to justify itself against
    // anything the character asked for — on a two-block print it is
    // just a slab of colour laid where the cutter wanted one. So it
    // prints on a coloured mass often, and on an uncoloured one now
    // and then, which is what keeps the raw hue on the sheet instead
    // of only on the two characters who happen to own a skin tone.
    //
    // It is dealt only to BIG shapes, and that is the discipline of
    // the second block: one plate per print, on one large shape. Three
    // sites lighting up on one character — hair, face and cloth — is
    // not a colour woodcut, it is a poster, and an accent stops being
    // an accent the moment there are two of them. `diag` alone was not
    // the right gate: a LEG passes it (it is long) and a plate landed
    // on a shoe, which is an accent nobody can read. The short side of
    // the box has to pass too.
    //
    // THE PLATE IS DECIDED HERE AND PRINTED BELOW, after the key
    // block, and that ordering is the whole reason there is any colour
    // in this row at all. Printed first, as it was, the black plate
    // lands on top of the same shape and swallows it whole — the only
    // colour that ever reached the sheet was the few pixels of fringe
    // where the misregistration pushed past the silhouette, which is
    // why five of six characters came out black and cream and I spent
    // two rounds raising a probability that was never the problem.
    let plate = null;
    if (diag > 80 && Math.min(x1 - x0, y1 - y0) > 34) {
      const has = !!o.col;
      // when nothing asked for a colour the plate is dealt WEIGHTED,
      // not picked flat: a Brücke print is usually red or ochre, and
      // the acids are what it reaches for when it wants to shout
      const r = R();
      const free = r < .30 ? CRUDE[0] : r < .50 ? CRUDE[2] : r < .64 ? CRUDE[1]
                 : r < .78 ? CRUDE[3] : r < .90 ? CRUDE[4] : CRUDE[5];
      // The odds rise with the shape's SIZE, which is how "one large
      // shape" is enforced without anything having to know what the
      // shape is: a torso or a hair mass carries the plate most of the
      // time, a pair of trousers now and then, and the small stuff
      // never. And a mass that asked for no colour is dealt one nearly
      // as often as one that did — the style may overrule the
      // character's palette, and on this sheet most of the big masses
      // are uncoloured, so deferring to them left four of six
      // characters in black and cream.
      const big = Math.min(1, (diag - 70) / 190);
      if (R() < (has ? .44 : .4) + big * .42) plate = has ? nearest(o.col, CRUDE) : free;
    }

    if (d >= .55) {
      s.poly(shape, true); s.ctx.fillStyle = rgb(INK); s.ctx.fill();
      // the colour goes down between the key block and its cuts, so
      // the same gouges run through black and through colour alike.
      // A plate cut separately reads as a sticker.
      //
      // It is cut a shade UNDER the key block and never over it. Cut
      // oversize the only colour that survives is the crescent
      // sticking out past the silhouette — every part is its own
      // plane, so a later part covers the middle of the mass and
      // leaves exactly the rim — and a rim of raw colour round a black
      // mass is a halo, not a misprint. Two characters came out
      // wearing the same gold chevron on the crown.
      if (plate) block(s, R, shape, plate, diag, .96);
      // Even a 'black' mass is CARVED. The first version left it at a
      // 17% cut and the hair came out as flat slabs with a few white
      // hairs scratched on: a woodcut's black is never untouched,
      // because the cutter has to prove the block was cut at all.
      const cv = Math.min(.82, (1 - d) * 1.6 + .32);
      flight(s, R, shape, SHEET, { ang, gap, cover: cv, len: .62, fan: (R() - .5) * 1.1 });
      // a second flight across the first, and it has to be MUCH
      // sparser than the first — at two thirds of it the two read as a
      // net of white thread over the hair rather than as a cut block.
      // A woodcut has one dominant direction and an occasional cut
      // across it; parity between them is crosshatching, which belongs
      // to a pen.
      if (R() < .7) {
        flight(s, R, shape, SHEET,
          { ang: ang + 1.35, gap: gap * 2.3, cover: cv * .45, len: .3, fan: (R() - .5) * .8 });
      }
      // the tool overruns the drawing, and no plank goes uncut
      runoff(s, R, shape, SHEET, 1 + (R() * 2.4 | 0));

      // a head inked solid still has to give its eyes somewhere to
      // live — see `eyeBand`. The band is CUT, not painted: cleared to
      // the sheet and then cut back into with two or three gouges of
      // ink, so it reads as a place the cutter took the block away
      // rather than as a white pill stuck on the front.
      const band = eyeBand(R, shape);
      if (band) {
        const c = s.ctx;
        c.save(); clipTo(c, shape);
        s.poly(band, true); c.fillStyle = SHEET; c.fill();
        c.restore();
        flight(s, R, band, rgb(INK),
          { ang: ang + .5, gap: Math.max(2.4, diag * .1), cover: .5, len: .5, fan: .4 });
      }
      // the rubbing ran out on the way down the sheet
      starve(s, R, shape, press((y0 + y1) / 2));
    } else {
      s.poly(shape, true); s.ctx.fillStyle = SHEET; s.ctx.fill();
      if (plate) block(s, R, shape, plate, diag);
      flight(s, R, shape, rgb(INK), { ang, gap: gap * .95, cover: d * 1.15 + .18, len: .6 });
      starve(s, R, shape, press((y0 + y1) / 2) * .7);
    }
  },

  // Skin is the reverse and it is the whole reason the faces survive:
  // the lit part of a face on a woodcut is BARE SHEET, and the shadow
  // is a slab of gouges crowded onto one side. Cover the face evenly
  // and you get a black egg with two black eyes in it.
  skin(s, pts, col, o = {}) {
    const R = dice(pts);
    const shape = chop(R, pts);
    const [x0, y0, x1, y1] = bbox(shape);
    const diag = Math.hypot(x1 - x0, y1 - y0);
    s.poly(shape, true); s.ctx.fillStyle = SHEET; s.ctx.fill();

    // the face's colour plate is cut close, not oversize: grown like a
    // mass's it spills a raw slab clean off the head and the
    // silhouette stops being the character's
    if (diag > 80 && R() < .78) block(s, R, shape, nearest(col, CRUDE), diag, .89);

    // the reserve — the band across the eyes that nothing dark may
    // enter. See `eyeBand`.
    const band = eyeBand(R, shape);

    // Where the shadow goes is not a free roll. Left to chance, half
    // the faces put their black slab under the hair where nothing can
    // see it and came out as bare paper with a pencil mouth on it. The
    // light is ABOVE, always, so the slab is aimed down and to one
    // side — jaw and one cheek — which is also the only lighting a
    // Brücke head ever gets. `ang` is the cuts' direction and it is
    // perpendicular to that, so the flight runs ACROSS the gradient.
    const phi = Math.PI / 2 + (R() < .5 ? -1 : 1) * (.35 + R() * .55);
    const ang = phi + Math.PI / 2;
    const bias = -1;
    const gap = Math.max(2.8, o.gap ? o.gap * 1.15 : diag * .115);

    // The shadow is a SLAB with a chopped chord for its edge, and the
    // flight is only its ragged frontier. Left as flights alone the
    // dark side of every face came out as a field of stripes — which
    // is a value, i.e. a grey, i.e. the thing this style is a refusal
    // of. A woodcut shadow is uncut block with a hard border, and the
    // border kinks because it was cut freehand.
    if (diag > 18) {
      const sx = Math.cos(phi), sy = Math.sin(phi);
      const tx = -sy, ty = sx;
      const cxs = (x0 + x1) / 2, cys = (y0 + y1) / 2;
      const t = diag * (.17 + R() * .13);
      const ex = cxs + sx * t, ey = cys + sy * t;
      const far = diag * 2.5, wide = diag * .75, M = 4;
      const bnd = [[ex - tx * far, ey - ty * far]];
      for (let i = 0; i <= M; i++) {
        const u = (i / M - .5) * 2 * wide, j = (R() - .5) * diag * .22;
        bnd.push([ex + tx * u + sx * j, ey + ty * u + sy * j]);
      }
      bnd.push([ex + tx * far, ey + ty * far],
               [ex + tx * far + sx * far, ey + ty * far + sy * far],
               [ex - tx * far + sx * far, ey - ty * far + sy * far]);
      const c = s.ctx;
      c.save(); clipTo(c, shape, band);
      s.poly(bnd, true); c.fillStyle = rgb(INK); c.fill();
      c.restore();
    }
    // The weight curve is CUBED and it is offset hard, so the shadow
    // arrives suddenly at about two thirds across rather than fading
    // in — a print has no fade, and a linear ramp reads as an
    // airbrush. The constant taken off the end is what keeps the lit
    // side BARE: at the old value every face still got a faint even
    // stubble of cuts right across the light, which is a grey, and a
    // grey is what this style is a refusal of. There is now a third of
    // the face with NOTHING on it.
    flight(s, R, shape, rgb(INK), {
      ang, gap, len: .55, cover: 1, fan: (R() - .5) * .9, hole: band,
      wt: u => { const k = (u * bias + 1) / 2; return Math.max(0, k * k * k * 2.1 - .3); },
    });
    // a face is high on the sheet, so this is usually nothing — which
    // is the point: the starve has to be a GRADIENT across the figure
    // and not a texture applied to every part equally. A head on a body
    // gets none; a head that IS the character (a floater) is low enough
    // to catch the first of it.
    starve(s, R, shape, press((y0 + y1) / 2) * .8);
  },

  // The contour is a BAND, not a line: black of wildly uneven width,
  // stepping at every vertex, and one vertex in six where the blade
  // took too much and it nearly fails. It hangs mostly INSIDE the ring
  // (.65 out, 1.35 in) so a heavy contour does not fatten the
  // silhouette — at crowd scale a band drawn centred put about a
  // pixel and a half onto every head and the features stopped fitting.
  edge(s, pts, w, o = {}) {
    let ring2 = pts;
    const m = ring2.length;
    if (m > 3 && Math.abs(ring2[0][0] - ring2[m - 1][0]) < .01
              && Math.abs(ring2[0][1] - ring2[m - 1][1]) < .01) ring2 = ring2.slice(0, m - 1);
    const R = dice(ring2);
    const shape = chop(R, ring2);
    const [x0, y0, x1, y1] = bbox(shape);
    const diag = Math.hypot(x1 - x0, y1 - y0);
    const W = Math.max(.8, Math.min(w * 1.75, diag * .07));
    const n = shape.length;

    // outward normals — averaged from the two adjacent chords, and
    // sign-corrected off the ring's own winding, because a part may
    // hand its outline either way round and a band pointing inward is
    // a shape with a hole in it
    let A = 0;
    for (let i = 0; i < n; i++) {
      const a = shape[i], b = shape[(i + 1) % n];
      A += a[0] * b[1] - b[0] * a[1];
    }
    const sg = A > 0 ? 1 : -1;
    const en = [];
    for (let i = 0; i < n; i++) {
      const a = shape[i], b = shape[(i + 1) % n];
      let nx = (b[1] - a[1]) * sg, ny = -(b[0] - a[0]) * sg;
      const d = Math.hypot(nx, ny) || 1;
      en.push([nx / d, ny / d]);
    }
    const out = [], inn = [];
    for (let i = 0; i < n; i++) {
      const p = en[(i - 1 + n) % n], q = en[i];
      let nx = p[0] + q[0], ny = p[1] + q[1];
      const d = Math.hypot(nx, ny) || 1; nx /= d; ny /= d;
      let h = W * (.42 + R() * 1.45);
      if (R() < .18) h *= .14;                       // the blade slipped
      out.push([shape[i][0] + nx * h * .65, shape[i][1] + ny * h * .65]);
      inn.push([shape[i][0] - nx * h * 1.35, shape[i][1] - ny * h * 1.35]);
    }
    const c = s.ctx;
    c.beginPath();
    c.moveTo(out[0][0], out[0][1]);
    for (let i = 1; i < n; i++) c.lineTo(out[i][0], out[i][1]);
    c.closePath();
    c.moveTo(inn[0][0], inn[0][1]);
    for (let i = n - 1; i >= 0; i--) c.lineTo(inn[i][0], inn[i][1]);
    c.closePath();
    c.fillStyle = rgb(INK);
    c.fill('evenodd');

    if (diag > 22) {
      // Splinters: the block breaks OUTWARD at a corner or two. Only
      // on shapes big enough to have survived being handled — putting
      // them on eyes gave every character eyelashes — and OFTEN NONE
      // at all, which is why the loop counts from zero. At one-to-three
      // per contour every part on the character grew them and the
      // crowd came out quilled.
      c.fillStyle = rgb(INK);
      for (let k = 0; k < (R() * 2.2 | 0); k++) {
        const i = (R() * n) | 0;
        const p = en[i];
        gouge(s, R, shape[i][0], shape[i][1], Math.atan2(p[1], p[0]) + (R() - .5) * .9,
          W * (1.6 + R() * 3), W * (.45 + R() * .55));
      }
      // ...and a gouge or two runs straight THROUGH it. This is the
      // detail that separates a woodcut contour from a thick inked
      // line: the cutter is clearing the field around the figure and
      // the tool overruns into the outline, so the band is severed
      // outright at a couple of places. Thinning the band at a vertex
      // (which is what the first version did on its own) only ever
      // looked like a line drawn with a worn nib. But the cut has to be
      // SHORT: started five band-widths out it does not sever the
      // outline, it drives a white lane clean across the face behind
      // it, and two of those turned a head into a bandage.
      //
      // It counts from ONE now, not from zero. Every contour on the
      // sheet closing cleanly is the thing that made the row read as
      // scratched rather than carved: the cuts sat safely inside their
      // shapes and the silhouette was never touched.
      c.fillStyle = SHEET;
      // ...and low on the sheet, where the rubbing was starved, the
      // band fails on its own account as well: one more sever per
      // contour down at the feet. It is the same fact as `starve`, said
      // in the contour's own vocabulary rather than laid over it.
      const sev = (diag > 40 ? 1 : 0) + (R() * 2.4 | 0) + (press((y0 + y1) / 2) > .5 ? 1 : 0);
      for (let k = 0; k < sev; k++) {
        const i = (R() * n) | 0;
        const p = en[i], a = Math.atan2(p[1], p[0]);
        gouge(s, R, shape[i][0] + p[0] * W * 2.4, shape[i][1] + p[1] * W * 2.4,
          a + Math.PI + (R() - .5) * .7, W * (2.8 + R() * 2.4), W * (.5 + R() * .65));
      }
    }
  },
};
