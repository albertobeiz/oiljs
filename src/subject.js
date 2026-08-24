// The subject of the painting: a seeded drawai character, drawn flat onto
// one 2D canvas for the oil planner to abstract into brush strokes.
//
// drawai normally gives every part its own canvas and hangs it on a bone in
// a three.js scene. We skip that: parts draw in absolute character
// coordinates, so they can all go onto one shared canvas with one transform,
// in registry (draw) order. src/drawai/ is a vendored copy — drawai is public
// domain — with the two three.js-facing functions removed.
import { setRender } from './drawai/part.js';
import { newRecipe, ensureParams } from './drawai/rig.js';
import { buildLayout } from './drawai/layout.js';
import { PARTS } from './drawai/parts/index.js';
import { Sketch, PR } from './drawai/sketch.js';
import { groundOf } from './drawai/styles/index.js';
import { hashStr } from './drawai/rng.js';
import { makeRng } from './rng.js';

export const TW = 560, TH = 700;          // the size the planner expects

// Media that lay real colour, and hold it. Graphite and ink give a cream page
// with thin dark lines; watercolour and marker are pale enough that the
// planner abstracts them into an almost blank canvas. All three are true to
// the drawing and useless as an oil portrait.
const MEDIA = [
  'oil', 'oil', 'oil', 'oil',
  'renaissance', 'renaissance', 'baroque', 'baroque',
  'impressionism', 'impressionism', 'expressionism', 'ukiyoe',
];

// Weighted toward human: an oil portrait gallery wants mostly people, with
// the odd animal sitter as the joke. These are drawai's four profiles.
const SPECIES = ['human', 'human', 'human', 'human', 'dog', 'cat', 'nightmare'];

export function makeSubject(seed) {
  const r = newRecipe(seed);
  r.media = MEDIA[hashStr(`${seed}:media`) % MEDIA.length];
  r.species = SPECIES[hashStr(`${seed}:species`) % SPECIES.length];
  r.color = 'color';        // 'auto' leaves many characters uncoloured
  r.base = 'biped';         // guarantees a shoulder line under every head
  ensureParams(r);          // the recipe is the only state, and now complete
  // Colour mode only lifts the global veto; each part still carries its own
  // switch, and a drawing that comes out as line work on cream gives the
  // planner nothing to mix. Params are plain JSON, so setting them here is
  // just a different roll of the same dice.
  if (r.parts.skull) r.parts.skull.params.skinOn = true;
  if (r.parts.hair) r.parts.hair.params.colOn = true;
  if (r.parts.torso) r.parts.torso.params.clothOn = true;
  return r;
}
export const makeRecipe = makeSubject;

const paramsOf = r => Object.fromEntries(
  PARTS.filter(d => r.parts[d.id]).map(d => [d.id, r.parts[d.id].params]));

// every (part, bone) this recipe draws, in draw order
function pieces(r, F) {
  const out = [];
  for (const def of PARTS) {
    if (def.species && !def.species.includes(r.species)) continue;
    if (def.base && !def.base.includes(r.base)) continue;
    const P = F.P[def.id];
    if (!P) continue;
    if (def.skip?.(P, F)) continue;
    for (const b of def.bones(P, F)) {
      out.push({ def, P, b, order: b.order ?? def.order, i: out.length });
    }
  }
  return out.sort((a, b) => a.order - b.order || a.i - b.i);
}

// Draw one part onto a context already transformed so that the origin is the
// centre of the head. The boil is seeded from the bone name, so drawing the
// same part twice — once for the picture, once for the region mask — puts
// every mark in the same place.
function drawPiece(s, r, F, e) {
  // save/restore per part is load-bearing: eyes and tears translate the
  // context without restoring it, and drawai's rig is what absorbs that.
  s.ctx.save();
  s.boil(hashStr(`${r.seed}:${e.b.name}`));
  if (F.media.ink) s.setBaseInk(F.media.ink);
  e.def.draw(s, e.P, e.def.states?.[0] ?? 'idle', F, e.b);
  s.setBaseInk(null);
  s.ctx.restore();
}

function paintPieces(s, r, F) {
  for (const e of pieces(r, F)) drawPiece(s, r, F, e);
}

// The order a painter actually works in: the ground, then the big masses,
// then the head, and the eyes last of all. `from` is the first brush size a
// region is allowed — a 40px brush has no business blocking in an eye, so
// small regions join the picture once the brushes are small enough to mean
// something there. Everything the planner does downstream reads this table.
export const REGIONS = [
  { id: 'fondo',   parts: [], from: 0 },
  { id: 'cuerpo',  parts: ['tail', 'legs', 'torso', 'arms', 'wings', 'paws', 'quadlegs', 'offhand', 'held'], from: 0 },
  { id: 'cabeza',  parts: ['skull', 'ears'], from: 0 },
  { id: 'pelo',    parts: ['hair', 'crest', 'worn'], from: 1 },
  { id: 'rasgos',  parts: ['nose', 'mouth', 'brows'], from: 2 },
  { id: 'ojos',    parts: ['eyes'], from: 3 },
  { id: 'remates', parts: ['extras', 'tearsWet'], from: 3 },
];

const LABEL_OF = {};
REGIONS.forEach((rg, i) => rg.parts.forEach(p => { LABEL_OF[p] = i; }));
const LABEL_STEP = 32;             // spread labels out so edge blending rounds back

// Which region owns each pixel. Every part is drawn alone, flattened to a
// flat label colour and stacked in draw order, so the last part to cover a
// pixel owns it — exactly the part a viewer sees there.
function regionLabels(r, F, box) {
  const lab = document.createElement('canvas');
  lab.width = TW; lab.height = TH;
  const lc = lab.getContext('2d', { willReadFrequently: true });
  lc.fillStyle = '#000';                        // label 0: bare ground
  lc.fillRect(0, 0, TW, TH);

  const tmp = new Sketch(TW, TH);
  const tc = tmp.ctx;
  for (const e of pieces(r, F)) {
    const label = LABEL_OF[e.def.id];
    if (label === undefined) continue;
    tc.setTransform(1, 0, 0, 1, 0, 0);
    tc.clearRect(0, 0, TW, TH);
    tc.setTransform(1, 0, 0, 1, TW / 2 - box.cx, -box.y0);
    drawPiece(tmp, r, F, e);
    tc.setTransform(1, 0, 0, 1, 0, 0);
    // keep the part's alpha, throw away its colour
    tc.globalCompositeOperation = 'source-in';
    tc.fillStyle = `rgb(${label * LABEL_STEP},0,0)`;
    tc.fillRect(0, 0, TW, TH);
    tc.globalCompositeOperation = 'source-over';
    lc.drawImage(tmp.canvas, 0, 0);
  }

  const d = lc.getImageData(0, 0, TW, TH).data;
  const out = new Uint8Array(TW * TH);
  for (let i = 0; i < out.length; i++) out[i] = Math.round(d[i * 4] / LABEL_STEP);
  return out;
}

// Where the ink actually lands, in character coordinates. Guessing this from
// layout numbers does not work: hats, crests and horns reach heights no anchor
// publishes, and a crown clipped by the frame is the one framing error a
// viewer always notices. So we draw the character once and look.
const M_U = 90;                       // measuring resolution: cheap, not exact
function inkBounds(r) {
  setRender({ u: M_U });
  const F = buildLayout(r, paramsOf(r));
  const W = 900, H = 1100, ox = W / 2, oy = H * 0.42;
  const s = new Sketch(W, H);
  s.ctx.setTransform(1, 0, 0, 1, ox, oy);
  paintPieces(s, r, F);
  s.ctx.setTransform(1, 0, 0, 1, 0, 0);
  s.done?.();

  const d = s.ctx.getImageData(0, 0, W, H).data;
  let top = H, bot = -1, left = W, right = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (d[(y * W + x) * 4 + 3] < 24) continue;
      if (y < top) top = y;
      if (y > bot) bot = y;
      if (x < left) left = x;
      if (x > right) right = x;
    }
  }
  if (bot < 0) return null;             // nothing drawn; fall back to layout
  const k = F.s;                        // report in head-scale units
  return {
    top: (top - oy) / k, bot: (bot - oy) / k,
    left: (left - ox) / k, right: (right - ox) / k,
  };
}

// Head-and-shoulders crop, in character coordinates (px, y down, origin at
// the centre of the head). drawai frames a whole standing figure; a portrait
// wants the bust, so we change the crop box and never layout.js — every
// number in there is a ratio that twenty parts agree on.
function crop(F, ink) {
  // drawai heads are deliberately oversized, so a tight bust crop turns into
  // a head pressed against all four edges. The room above the crown and below
  // the shoulders is what makes it read as a framed portrait.
  const crown = ink ? Math.min(-1.05, ink.top) : -1.05;
  const y0 = F.s * (crown - 0.30);              // clear whatever is on the head
  const y1 = F.B.shoulderY + F.s * 0.95;        // well below the shoulder line
  // A wide sitter — big hat, spread ears — gets the frame widened rather than
  // cropped, since height is what fills the canvas.
  const halfW = ink ? Math.max(Math.abs(ink.left), ink.right) * F.s : F.w * 1.2;
  const need = (halfW + F.s * 0.22) * 2 * (TH / TW);
  return { y0, y1: Math.max(y1, y0 + need), cx: F.turn * F.w * 0.10 };
}

// Ground colours, weighted the way the results deserve: dark grounds win.
// A pale sitter over near-black bole is the look that carries an oil
// portrait, so the deep umbers and coloured darks appear often and the
// style's own ground only sometimes.
const GROUND_PALETTE = [
  [22, 19, 17], [22, 19, 17], [30, 24, 20], [16, 14, 13],   // near-black umbers
  [56, 26, 22], [74, 32, 24],                               // dark bole reds
  [24, 36, 28], [30, 44, 32],                               // deep greens
  [20, 28, 40], [26, 34, 48],                               // night blues
  [58, 44, 26],                                             // dark ochre
  [88, 34, 52],                                             // wine
];

function pickGround(seed, styleGround) {
  const h = hashStr(`${seed}:ground`);
  // one in three keeps the movement's historically-correct priming
  if (h % 3 === 0 && styleGround) return styleGround;
  return GROUND_PALETTE[((h / 3) | 0) % GROUND_PALETTE.length];
}

// The sitter's backdrop. drawai's ground is one flat colour, which the
// planner would repeat across half the canvas at one value; a portrait wants
// the background to turn — lighter behind the head, falling off to the
// corners — so the big brushes have something to model.
function ground(c, base, seed) {
  const rng = makeRng(seed ^ 0x1d3b7f);
  const [br, bg, bb] = base;
  const lum = (br + bg + bb) / 765;
  const lift = lum > 0.55 ? -1 : 1;            // dark grounds glow, light ones sink
  const k = (m) => `rgb(${Math.round(Math.max(0, Math.min(255, br + m)))},`
    + `${Math.round(Math.max(0, Math.min(255, bg + m * 0.94)))},`
    + `${Math.round(Math.max(0, Math.min(255, bb + m * 0.82)))})`;

  c.fillStyle = k(0);
  c.fillRect(0, 0, TW, TH);
  const gx = TW * rng.r(0.34, 0.66), gy = TH * rng.r(0.26, 0.40);
  const gr = c.createRadialGradient(gx, gy, TW * 0.06, gx, gy, TW * 1.05);
  gr.addColorStop(0, k(lift * 30));
  gr.addColorStop(0.55, k(lift * 8));
  gr.addColorStop(1, k(-lift * 26));
  c.fillStyle = gr;
  c.fillRect(0, 0, TW, TH);
  // broken colour: a ground laid with a knife is never one tone
  for (let i = 0; i < 22; i++) {
    const x = rng.r(-60, TW + 60), y = rng.r(-60, TH + 60);
    const rad = rng.r(70, 210);
    const b = c.createRadialGradient(x, y, 0, x, y, rad);
    const m = rng.r(-16, 16);
    b.addColorStop(0, k(m).replace('rgb', 'rgba').replace(')', `,${rng.r(0.05, 0.14)})`));
    b.addColorStop(1, k(m).replace('rgb', 'rgba').replace(')', ',0)'));
    c.fillStyle = b;
    c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
}

// The subject, plus the map of what is where. `labels` is one byte per pixel
// indexing REGIONS, which is what lets the planner paint in a painter's order
// instead of purely by brush size.
export function renderSubject(r) {
  // Measure where the ink lands, then pick U so the crop fills the canvas. U
  // is resolution only, so this zooms the geometry while every grain constant
  // in Sketch stays at one device pixel — which is why the marks stay crisp
  // instead of being ctx.scale'd to mush.
  const ink = inkBounds(r);
  setRender({ u: M_U });
  let F = buildLayout(r, paramsOf(r));
  let box = crop(F, ink);
  setRender({ u: M_U * (TH / (box.y1 - box.y0)) });
  F = buildLayout(r, paramsOf(r));
  box = crop(F, ink);

  const s = new Sketch(TW, TH);
  const c = s.ctx;

  // Opaque ground first: the planner reads RGB and ignores alpha, so any
  // pixel drawai leaves transparent would reach it as black.
  ground(c, pickGround(r.seed, groundOf(F.media) ?? PR), r.seed);

  c.setTransform(1, 0, 0, 1, TW / 2 - box.cx, -box.y0);
  paintPieces(s, r, F);
  c.setTransform(1, 0, 0, 1, 0, 0);
  s.done?.();

  return { canvas: s.canvas, labels: regionLabels(r, F, box) };
}

export function drawSubject(r) { return renderSubject(r).canvas; }
export const drawPortrait = drawSubject;
