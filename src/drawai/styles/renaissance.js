// ---------------------------------------------------------------
// RENAISSANCE — oil on a poplar panel, c. 1500.
// Bellini, Perugino, Raphael, the young Titian.
//
// THREE CORRECTIONS BUILT THIS FILE, in the order they were made.
//
// 1. THE FIRST VERSION WAS SFUMATO AND NOTHING ELSE — everything soft,
//    everything brown, the contour renounced. That is not what a panel
//    of 1500 looks like, it is what a VARNISHED PHOTOGRAPH of one looks
//    like. So: the box became pigments rather than earths, and the
//    contour came back, because Leonardo's silhouettes are razor sharp
//    against the ground and it is the INTERIOR transitions that have no
//    borders.
//
// 2. IT WAS STILL A PHOTOGRAPH, because every glaze in it was brown.
//    Two places were doing it. The halftone was VERDACCIO laid over
//    every mass — but verdaccio is what goes under FLESH; over an
//    ultramarine it is mud. And `edge()` glazed a warm ivory-to-umber
//    ramp over the interior of EVERY shape, including the ones `tone()`
//    had just painted, so a lapis cloak got a film of brown for free.
//    Both are gone. A mass is now modelled in ITS OWN pigment: the
//    shadow is the same lake deeper and MORE saturated, and the light is
//    CANGIANTE — the lit passage shifts hue toward lead-tin yellow
//    instead of merely adding white, which is Michelangelo's trick and
//    the reason quattrocento drapery is more colourful in the light than
//    in the mass. `edge()`'s remaining glaze is NEUTRAL grey: multiplying
//    by [g,g,g] scales all three channels alike, so it can darken a
//    pigment without ever browning it.
//
// 3. THE ROW HAD NO SPACE IN IT. A panel portrait of 1500 is a sitter
//    against a plain DARK GREEN field with a window cut in the wall
//    beside them, and through the window the other thing this movement
//    invented: AERIAL PERSPECTIVE, the distance going pale, cool and
//    blue with the air in front of it. That is `backdrop()`, and it does
//    two jobs at once — it is the era's own idea, and a warm figure on a
//    dark green field is the contrast this row never had. It is the
//    second half of the argument, never the whole of it: the modelling
//    below has to carry the figure on its own.
//
// THE LOST EDGE is the one thing on this sheet that belongs to nobody
// else, so it is now stated properly: the contour is at full weight on
// the lit side and thins away to almost nothing as the form turns. It
// is drawn as arcs in ONE pass — the dim ones are still drawn, so the
// shape always closes, and nothing is stroked twice.
//
// Tried and thrown away: modelling each mass with a plain radial
// "spotlight". On a round head it is right and on an arm or a horn it
// reads as a torchlit blob, because a radial has no direction. The
// general light is a LINEAR ramp (a distant sun, correct for any
// silhouette) with a radial core-light laid over it (the near lamp that
// makes a form turn). Both, or neither works.
// ---------------------------------------------------------------
import { nearest, shade, tint, mix, sat, lum, dens, bbox, rgb } from './pigment.js';
import { SKINC } from '../sketch.js';
import { hashStr } from '../rng.js';

// THE BOX OF PAINT. A panel of 1500 is earths for the flesh and the
// expensive colours everywhere else — the ultramarine went on the
// Virgin's cloak and it cost more than the painter.
const LUME      = [252, 247, 232];   // lead white, warmed
const LEAD      = [240, 231, 210];
const FLESH     = [232, 176, 128];
const ROSE      = [220, 132, 106];   // the blood under a young face
const OCHRE     = [196, 145, 68];
const GIALLO    = [238, 198, 74];    // lead-tin yellow, giallolino
const SIENNA    = [162, 88, 42];
const UMBER     = [88, 60, 40];
const BISTRE    = [30, 24, 21];      // the dark is warm, never black
const VERDACCIO = [122, 132, 96];    // the green-grey underpaint
const TERRE     = [66, 96, 68];      // terre verte, its deep end
const VERMILION = [214, 60, 34];
const MADDER    = [154, 32, 60];     // crimson lake
const LAPIS     = [40, 64, 164];     // ultramarine, the dear one
const AZURITE   = [50, 122, 178];
const VERDIGRIS = [24, 122, 92];
const LEAF      = [106, 150, 50];
const COPPER    = [172, 100, 36];

// neutral greys: the ONLY safe thing to multiply over a pigment you did
// not choose, because [g,g,g] scales every channel alike and so moves
// value without touching hue. This is what `edge()` glazes with.
const GREY_HI   = [214, 209, 200];
const GREY_MID  = [158, 152, 143];
const GREY_LO   = [84, 79, 72];
const GREY_DEEP = [46, 42, 38];

// What the character's colours are answered with. Loud, and the earths
// kept to the few a painter would actually reach for in a garment.
const BOX = [LUME, LEAD, FLESH, OCHRE, GIALLO, SIENNA, UMBER, BISTRE,
             VERMILION, MADDER, LAPIS, AZURITE, VERDIGRIS, LEAF, COPPER, VERDACCIO];
const SKINS = [LEAD, FLESH, OCHRE, SIENNA, UMBER];

// DRAPERY, for a mass that asked for no colour at all — which is most
// of them. Weighted: the blues and the reds carry the row, one brown
// seat is kept so it is a wardrobe and not a paint chart.
const DRAPE = [LAPIS, LAPIS, AZURITE, VERMILION, VERMILION, MADDER,
               VERDIGRIS, VERDIGRIS, GIALLO, LEAF, COPPER, UMBER];

// ONE light for the whole character, and it can be one because a part
// draws in CHARACTER coordinates (origin at the head's centre) — so
// "upper left" means the same thing on the head, on a horn and on a
// shoe. Unit vector pointing AT the light. It is DIFFUSE and even, not
// raking: that is the line between this row and baroque.
const LD = [-.672, -.741];

// A stable scatter. The drapery a mass is dealt may NOT come out of
// the rng: `s.jr` is reseeded for each of the three boil frames, so a
// rolled hue would flicker between lapis and vermilion three times a
// second. It is hashed off the PLATE (`s.w/s.h`, fixed per part) and a
// coarse quarter of the shape's position on it — both stable under the
// one or two pixels of boil jitter. Same trick as the voxel `h01`.
function h01(a, b, c) {
  let x = ((a | 0) * 374761393 + (b | 0) * 668265263 + (c | 0) * 2246822519) >>> 0;
  x = Math.imul(x ^ (x >>> 13), 1274126177) >>> 0;
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

// pull a pigment toward a wanted lightness without leaving its hue
function toneTo(c, want, k = .72) {
  const L = lum(c);
  if (Math.abs(L - want) < .02) return c;
  const t = L < want ? Math.min(.92, (want - L) / Math.max(.05, 1 - L))
                     : Math.min(.92, (L - want) / Math.max(.05, L));
  return mix(c, L < want ? tint(c, t) : shade(c, t), k);
}

// the shape's own frame: centre, radii, and its half-extent measured
// along the light, which is what a directional ramp has to span
function frame(pts) {
  const [x0, y0, x1, y1] = bbox(pts);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const rx = Math.max(.6, (x1 - x0) / 2), ry = Math.max(.6, (y1 - y0) / 2);
  const R = Math.hypot(rx, ry);
  return { x0, y0, x1, y1, cx, cy, rx, ry, R, diag: R * 2,
           h: Math.abs(rx * LD[0]) + Math.abs(ry * LD[1]) };
}

const paint = (c, f) => c.fillRect(f.x0 - 3, f.y0 - 3, f.x1 - f.x0 + 6, f.y1 - f.y0 + 6);

// HAS ANYTHING BEEN PAINTED ON THIS PLATE? Every part gets its own
// `Sketch`, so this one boolean answers the only question `edge()`
// actually needs: is this shape sitting on a pigment somebody chose,
// or is it bare drawing?
//
// It matters because `edge()` glazes the INTERIOR of every shape it is
// handed, and the right glaze is not the same in the two cases. Over a
// lapis cloak it must be NEUTRAL grey, or it browns it — that was the
// row's whole disease. Over a bare face it must be FLESH, because a
// character with no skin colour never reaches `skin()` at all
// (`skull.js` fills the face with paper and stops), so `edge()` is the
// only hook that ever gets to those four faces in six. Glazed with the
// neutral grey they came back as plaster casts, which is round one of
// this file happening again in a different colour.
//
// It cannot flicker: `skin()`/`tone()` are called or not called for
// structural reasons, identically on every boil frame.
const painted = s => !!s.__renPaint;
const claim = s => { s.__renPaint = true; };

// Where the core light lands: not the centre, and not the rim either
// — a form's brightest point is where its surface faces the lamp, so
// it sits about half way out toward the lit edge.
const lume = f => [f.cx + LD[0] * f.rx * .52, f.cy + LD[1] * f.ry * .52];

// ---- one pigment, three passages --------------------------------
// CANGIANTE. A quattrocento drapery is not one colour lightened and
// darkened; it is a colour that CHANGES as it turns — a rose lit with
// lead-tin yellow, an ultramarine going green-white on the fold. And
// its shadow is the same lake glazed deeper, which comes out MORE
// saturated, not less. Both of those are why the row is loud, and
// both were what the old brown glaze was destroying.
function trio(base) {
  const L = lum(base);
  const partner = L > .56 ? mix(GIALLO, SIENNA, .28) : GIALLO;
  const lit  = sat(mix(tint(base, .30), partner, .40), 1.15);
  const dark = sat(mix(shade(base, .52), mix(UMBER, base, .55), .35), 1.22);
  const deep = sat(shade(mix(base, MADDER, .14), .74), 1.10);
  return { lit, dark, deep };
}

// The one concession to facture. Sfumato has no visible marks, but a
// panel is not an airbrush either: a few very wide, very faint passes
// dragged ACROSS the light — bowed, because a brush follows the form
// round — give the surface the slow wiped quality of a glaze. At .05
// alpha you cannot see any single one of them; you can see when they
// are all gone, and what you see is a render.
function scumble(s, f, warm, cool) {
  const c = s.ctx;
  const ax = -LD[1], ay = LD[0];                 // across the light
  const n = 5;
  c.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1) - .5) * 1.75;
    const bx = f.cx + LD[0] * f.h * t, by = f.cy + LD[1] * f.h * t;
    const len = f.R * s.jr(.85, 1.35);
    const bow = -LD[0] * f.R * .18, boy = -LD[1] * f.R * .18;
    c.beginPath();
    c.moveTo(bx - ax * len, by - ay * len);
    c.quadraticCurveTo(bx + bow, by + boy, bx + ax * len, by + ay * len);
    c.lineWidth = f.R * s.jr(.15, .3);
    c.strokeStyle = rgb(t < 0 ? warm : cool, s.jr(.03, .085));
    c.stroke();
  }
}

// The panel's own tooth. Gesso is not glass: without a whisper of
// grain the gradients read as CSS. Kept faint so the boil (three
// redrawn frames) breathes rather than crawls — everything else in
// this style is deliberately steady, because smoke that flickers is
// not smoke.
function tooth(s, f, dark, pale) {
  const c = s.ctx;
  const n = Math.min(90, Math.max(6, ((f.x1 - f.x0) * (f.y1 - f.y0)) / 52));
  for (let i = 0; i < n; i++) {
    c.fillStyle = rgb(s.chance(.5) ? dark : pale, s.jr(.015, .06));
    c.fillRect(s.jr(f.x0, f.x1), s.jr(f.y0, f.y1), s.jr(.9, 2.2), s.jr(.9, 2.2));
  }
}

// ---- the light, laid on a colour that is already there -----------
// Four passes, in the order an oil painter lays them: the general
// light, the core light, the cool halftone (flesh only), the
// reflection. The dark passes MULTIPLY and the light ones SCREEN, so
// none of them can replace the pigment underneath — they only darken
// or lift it. That is the difference between a glaze and a coat of
// brown.
function light(s, f, base, o = {}) {
  const { hi = .55, lo = .72, core = .55, warm = .16, green = 0 } = o;
  const T = trio(base);
  const c = s.ctx;

  // 1. the general light — a distant ramp across the whole form, and
  // it goes properly DARK at the far end, in the pigment's own deep
  // glaze rather than in somebody else's umber. The boil is one or two
  // percent of a radius: paint scraped back and reglazed, not a line
  // looking for itself.
  const jx = s.jr(-.02, .02) * f.rx, jy = s.jr(-.02, .02) * f.ry;
  c.globalCompositeOperation = 'multiply';
  const g = c.createLinearGradient(
    f.cx + LD[0] * f.h * 1.12 + jx, f.cy + LD[1] * f.h * 1.12 + jy,
    f.cx - LD[0] * f.h * 1.12 + jx, f.cy - LD[1] * f.h * 1.12 + jy);
  g.addColorStop(0, rgb(LUME, 0));
  g.addColorStop(.36, rgb(LUME, 0));
  g.addColorStop(.56, rgb(base, lo * .26));
  g.addColorStop(.76, rgb(T.dark, lo * .82));
  g.addColorStop(.93, rgb(T.deep, lo));
  g.addColorStop(1, rgb(T.deep, lo * .70));
  c.fillStyle = g; paint(c, f);

  // 2. the core light: the near lamp, which is what makes the form
  // TURN — and it is CANGIANTE, a hue and not a white. Screened, so a
  // lapis comes up to the light as a bright lapis instead of as a pale
  // brown.
  const [lx, ly] = lume(f);
  c.globalCompositeOperation = 'screen';
  const r2 = c.createRadialGradient(lx, ly, 0, lx, ly, f.R * 1.02);
  r2.addColorStop(0, rgb(T.lit, hi * core * 1.55));
  r2.addColorStop(.40, rgb(T.lit, hi * core * .62));
  r2.addColorStop(1, rgb(T.lit, 0));
  c.fillStyle = r2; paint(c, f);

  // 3. the halftone is COOL, and it is FLESH ONLY. Terre verte laid in
  // the band where the form starts to go — the underpaint coming
  // through. Over a coloured mass it is mud, which is the mistake this
  // file was rewritten twice to stop making, so `green` defaults to 0.
  if (green > 0) {
    c.globalCompositeOperation = 'multiply';
    const r3 = c.createRadialGradient(lx, ly, f.R * .40, lx, ly, f.R * 1.55);
    r3.addColorStop(0, rgb(VERDACCIO, 0));
    r3.addColorStop(.36, rgb(VERDACCIO, green));
    r3.addColorStop(.64, rgb(TERRE, green * .72));
    r3.addColorStop(1, rgb(TERRE, 0));
    c.fillStyle = r3; paint(c, f);
  }

  // 4. reflected light: the ground throws warmth back into the far
  // side, so the shadow has air in it. Leave it out and the dark
  // reads as a hole cut in the panel — and a hole is baroque's, not
  // this row's.
  c.globalCompositeOperation = 'screen';
  const g4 = c.createLinearGradient(
    f.cx - LD[0] * f.h * 1.1, f.cy - LD[1] * f.h * 1.1, f.cx, f.cy);
  g4.addColorStop(0, rgb(SIENNA, warm));
  g4.addColorStop(.42, rgb(SIENNA, 0));
  c.fillStyle = g4; paint(c, f);

  c.globalCompositeOperation = 'source-over';
}

// the imprimatura: a warm ochre ground under everything, which is what
// unifies a fifteenth-century panel. The colour goes on over it at
// less than full strength, so the ground reads through the thin
// passages the way it does on a real one.
function model(s, pts, base, o = {}) {
  const f = frame(pts);
  const c = s.ctx;
  c.save(); s.poly(pts, true); c.clip();
  // A mass the part asked for LIGHTLY is not a pale object, it is a
  // THIN one: a fringe, a wisp, a highlight lifted out of the mass
  // under it. Painted opaque it came back as a white curtain hung over
  // the face — worst in the brush hand, where the paper reads brighter
  // — which is the note the editor filed against the old hair shine.
  // Thin ones are scumbled instead: no ground, half strength, and what
  // is underneath still shows through.
  if (o.thin) {
    c.fillStyle = rgb(base, .58); paint(c, f);
    light(s, f, base, { ...o, hi: o.hi * .8, core: o.core * .7 });
    tooth(s, f, shade(base, .45), tint(base, .5));
    c.restore();
    return;
  }
  c.fillStyle = rgb(mix(OCHRE, SIENNA, .3)); paint(c, f);
  c.fillStyle = rgb(base, .96); paint(c, f);
  light(s, f, base, o);
  const T = trio(base);
  scumble(s, f, T.lit, T.deep);
  tooth(s, f, shade(base, .55), tint(base, .5));
  c.restore();
}

// =================================================================
// THE PANEL — everything below here is `backdrop()`.
// =================================================================
const BOARD   = [178, 148, 106];   // the poplar, sized and primed
const GILT    = [188, 150, 78];
const GILT_HI = [236, 208, 140];
const GILT_LO = [102, 74, 32];
const FIELD   = [42, 64, 50];      // the dark green a sitter stands against
const FIELD_HI= [88, 116, 88];
const ROOM    = [74, 56, 40];      // the boards of the floor
const SKY_TOP = [72, 116, 178];
const SKY_LOW = [238, 228, 196];   // pale and WARM at the horizon: aerial perspective
const RIDGE_F = [156, 172, 192];
const RIDGE_M = [110, 138, 138];
const RIDGE_N = [70, 96, 66];

// A DISTANCE. Small — it is a window, not a mural — so it is built out
// of four bands and one pale river, because at forty pixels across
// anything finer is dust. What has to survive is the one fact: the
// further away a thing is, the paler and the bluer it goes.
function landscape(s, x, y, W, H) {
  const c = s.ctx;
  const hz = y + H * s.jr(.50, .62);
  c.save();
  c.beginPath(); c.rect(x, y, W, H); c.clip();

  const sky = c.createLinearGradient(0, y, 0, hz);
  sky.addColorStop(0, rgb(SKY_TOP));
  sky.addColorStop(.52, rgb(mix(SKY_TOP, SKY_LOW, .55)));
  sky.addColorStop(1, rgb(SKY_LOW));
  c.fillStyle = sky; c.fillRect(x, y, W, hz - y);

  // three ranges, each nearer one lower, greener and darker
  const range = (baseY, rise, col, ph) => {
    c.beginPath();
    c.moveTo(x - 2, baseY);
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const k = Math.sin(t * 6.1 + ph) * .5 + Math.sin(t * 13.7 + ph * 1.7) * .3 + Math.sin(t * 2.3 + ph * .6) * .6;
      c.lineTo(x + t * W, baseY - rise * (.45 + .55 * (k * .5 + .5)));
    }
    c.lineTo(x + W + 2, baseY); c.lineTo(x + W + 2, y + H + 2); c.lineTo(x - 2, y + H + 2);
    c.closePath(); c.fillStyle = rgb(col); c.fill();
  };
  range(hz + H * .015, H * .17, RIDGE_F, s.jr(0, 6));
  range(hz + H * .085, H * .15, mix(RIDGE_F, RIDGE_M, .70), s.jr(0, 6));
  range(hz + H * .20, H * .12, RIDGE_M, s.jr(0, 6));

  // the near plain, going warm and dark at the sill
  const gnd = c.createLinearGradient(0, hz + H * .18, 0, y + H);
  gnd.addColorStop(0, rgb(RIDGE_N, 0));
  gnd.addColorStop(.5, rgb(RIDGE_N, .92));
  gnd.addColorStop(1, rgb(shade(mix(RIDGE_N, UMBER, .5), .25)));
  c.fillStyle = gnd; c.fillRect(x, hz + H * .18, W, y + H - hz - H * .18);

  // a river taking the light: the one pale thing below the horizon,
  // and it is what makes the plain read as a plain and not a wall
  c.strokeStyle = rgb(mix(SKY_LOW, RIDGE_F, .35), .85);
  c.lineJoin = 'round'; c.lineCap = 'round';
  c.beginPath();
  const rx0 = x + W * s.jr(.3, .7);
  c.moveTo(rx0, hz + H * .12);
  c.bezierCurveTo(rx0 + W * s.jr(-.3, .3), hz + H * .3,
                  rx0 + W * s.jr(-.4, .4), hz + H * .38,
                  rx0 + W * s.jr(-.6, .6), y + H);
  c.lineWidth = Math.max(.8, W * .045); c.stroke();

  // a hill town on the middle range: three roofs and a tower
  const tx = x + W * s.jr(.12, .82), ty = hz + H * .07, u = Math.max(1, W * .035);
  c.fillStyle = rgb(mix(RIDGE_F, LEAD, .45), .9);
  for (let i = 0; i < 3; i++) c.fillRect(tx + i * u * 1.3, ty - u * s.jr(.8, 1.3), u, u * 1.4);
  c.fillRect(tx + u * s.jr(.4, 2.6), ty - u * 2.5, u * .7, u * 2.8);
  c.restore();
}

export default {
  id: 'renaissance', label: 'renaissance', era: 1500, underdraw: false,

  // THE GROUND. Not the priming — the honest imprimatura is warm ochre
  // and that is where it is, laid under every mass inside `model()`,
  // which is where a ground belongs pictorially anyway. What the ROW
  // is painted on is the back of the workshop: the poplar boards the
  // panels are cut from, sized and toned. The panels stand on it, and
  // because they are narrower than the cell you can see it between
  // them, which is what makes them read as objects rather than as
  // wallpaper.
  ground: [186, 158, 118],

  // NO LAMP BLACK ON A PANEL OF 1500. The contour, the void of an eye,
  // a nostril, a pupil — all of it is iron-gall and bone black ground
  // in oil, which is a warm dark brown. Declared here, so the whole
  // character's black is this without a single part knowing.
  ink: [46, 34, 27],

  // A panel portrait is a TALL board, and it is narrower than the cell
  // so the workshop's boards show between one panel and the next.
  panel: { w: .90, h: 1.12, y: .50 },

  tone(s, pts, o = {}) {
    const d = dens(o.style);
    const f = frame(pts);
    const c = s.ctx;
    claim(s);

    // THE VOID. An eye socket, a nostril, an open mouth, a raven bob.
    // This is the one shape that must NOT be modelled away: it is the
    // cute-dark register the whole project runs on, and a black graded
    // into a grey stops reading at crowd scale. So it stays near-black
    // and gets the two things a Renaissance dark gets instead of light
    // — a warm bounce along its lower rim, and one small wet
    // catchlight up in the corner the lamp is in. The dark itself is
    // shifted toward indigo: an ivory black on a panel is never neutral.
    if (!o.col && d >= .95) {
      c.save(); s.poly(pts, true); c.clip();
      const g = c.createLinearGradient(
        f.cx + LD[0] * f.h, f.cy + LD[1] * f.h, f.cx - LD[0] * f.h, f.cy - LD[1] * f.h);
      g.addColorStop(0, rgb(mix(BISTRE, LAPIS, .30)));
      g.addColorStop(.6, rgb(BISTRE));
      g.addColorStop(1, rgb(mix(BISTRE, SIENNA, .26)));
      c.fillStyle = g; paint(c, f);
      const [lx, ly] = lume(f);
      const k = c.createRadialGradient(lx, ly, 0, lx, ly, f.R * .42);
      k.addColorStop(0, rgb(LEAD, .30));
      k.addColorStop(1, rgb(LEAD, 0));
      c.fillStyle = k; paint(c, f);
      c.restore();
      return;
    }

    // Everything else is a mass of paint: hair, cloth, a horn.
    //
    // A colour asked for is answered by the nearest PIGMENT and then
    // pushed — the character's own box is muted on purpose and a
    // muted answer is what made this row a photograph. A fifth of the
    // character's colour is mixed back so a teal hood is still
    // recognisably the teal one.
    //
    // A colour NOT asked for is the common case (78% of hair, every
    // plain character) and it is where the row's colour actually comes
    // from: it gets DRAPERY, hashed off the plate so it holds still,
    // pulled to the lightness the part's density asked for so a
    // 'black' cloak stays a cloak and a bone horn stays bone.
    // And a CLOTH colour is dealt out of drawai's skin box (`layout.js`
    // takes `cloth` straight from `SKINC`), so a coat literally asks to
    // be a shade of tan. Answered honestly it is a third of the reason
    // this row came back sepia. A garment is the one thing on a panel
    // that is allowed to be expensive, so a tan asked for by a mass
    // that is not a face is refused and dealt drapery at the same
    // VALUE. Hair colours (`HAIRCOL`) are respected — they are already
    // six different hues and they answer beautifully.
    let base;
    const cloth = o.col && SKINC.some(k => k[0] === o.col[0] && k[1] === o.col[1] && k[2] === o.col[2]);
    const thin = !o.col && d <= .40;
    if (o.col && !cloth) {
      base = sat(mix(nearest(o.col, BOX), o.col, .20), 1.46);
    } else {
      // A LAKE IS DEEP. Pulled to the lightness a pale tan cloth asked
      // for, a madder came out dusty pink and an ultramarine came out
      // powder blue — the row went sepia the first time for exactly this
      // kind of politeness. The cloth's value is COMPRESSED into the
      // half of the scale a garment pigment actually lives in, so a
      // light coat is still lighter than a dark one and neither is a
      // pastel.
      const want = cloth ? .28 + lum(o.col) * .26 : .62 - d * .30;
      const u = h01(s.w * 131 + s.h * 7,
                    Math.round(f.cx / Math.max(8, s.w * .25)) * 29 +
                    Math.round(f.cy / Math.max(8, s.h * .25)) * 13,
                    Math.round((cloth ? lum(o.col) : d) * 20));
      const p = DRAPE[(u * DRAPE.length) | 0];
      // A thin mass keeps the same pigment, taken up to a chalky
      // pastel: a straw, a pale rose, a faded azure. Answered with
      // plain lead white — which is what it was — a whole light-toned
      // head of hair came back the same cream as the face beside it,
      // and the character was one oval again.
      base = thin ? sat(tint(p, .48), 1.24) : sat(toneTo(p, want, .44), 1.38);
    }

    model(s, pts, base, {
      thin,
      hi: .64 - d * .18,        // a dark mass keeps less light on it…
      lo: .56 + d * .32,        // …and goes further down at the far side
      core: .60 - d * .20,
      warm: .13 + d * .10,      // …but bounces more, so it stays a solid
    });
  },

  // ---- the face -------------------------------------------------
  // The only thing everyone knows about a quattrocento head, done the
  // way it was actually done: lay the WHOLE head in verdaccio, then
  // glaze the flesh over it — thick in the light, THIN where the form
  // turns (so the green comes through as the halftone), and warm and
  // dark again in the core shadow. The green is not painted; it is
  // what is left when the flesh gets out of the way.
  skin(s, pts, col, o = {}) {
    const f = frame(pts);
    const c = s.ctx;
    claim(s);
    c.save(); s.poly(pts, true); c.clip();

    // the underpaint, opaque, cooler where the light will not reach
    const u = c.createLinearGradient(
      f.cx + LD[0] * f.h, f.cy + LD[1] * f.h, f.cx - LD[0] * f.h, f.cy - LD[1] * f.h);
    u.addColorStop(0, rgb(tint(VERDACCIO, .18)));
    u.addColorStop(1, rgb(shade(TERRE, .34)));
    c.fillStyle = u; paint(c, f);

    // The character's skin, answered in earths but keeping its value.
    // Flesh is the one place the loud box is wrong: a panel face is
    // ochre and ROSE over green, and the ultramarine went on the cloak.
    // It is warm and it is SATURATED — an ivory flesh on a dark green
    // field is a plaster cast, and this row owns the widest colour of
    // the four oil centuries.
    const flesh = sat(shade(mix(nearest(col, SKINS), mix(FLESH, ROSE, .42), .58), .09), 1.16);
    const [lx, ly] = lume(f);
    // The radius matters more than the stops: at 1.55R the shadow
    // stops all landed OUTSIDE the shape and every face was blown out.
    // It has to be about the distance from the core light to the FAR
    // rim (~1.1R for a round head) so the dark end lands on the panel,
    // not past it.
    const jr = f.R * s.jr(1.08, 1.13);
    const g = c.createRadialGradient(lx, ly, 0, lx, ly, jr);
    g.addColorStop(0, rgb(tint(flesh, .38), .97));    // lead white, loaded
    g.addColorStop(.24, rgb(tint(flesh, .15), .95));
    g.addColorStop(.44, rgb(flesh, .90));
    g.addColorStop(.58, rgb(shade(flesh, .20), .46)); // the glaze thins…
    g.addColorStop(.68, rgb(shade(flesh, .38), .40)); // …and the green reads
    g.addColorStop(.82, rgb(sat(shade(flesh, .62), 1.1), .90)); // the turn into shadow
    g.addColorStop(1, rgb(sat(shade(flesh, .86), 1.2), .97));   // core shadow, and DARK
    c.fillStyle = g; paint(c, f);

    // a thread of vermilion under the lit cheekbone. Barely there —
    // a cinquecento blush is blood under skin, not rouge.
    c.globalCompositeOperation = 'multiply';
    const bx = f.cx + LD[0] * f.rx * .34, by = f.cy + f.ry * .22;
    const b = c.createRadialGradient(bx, by, 0, bx, by, f.R * .62);
    b.addColorStop(0, rgb(VERMILION, .26));
    b.addColorStop(1, rgb(VERMILION, 0));
    c.fillStyle = b; paint(c, f);
    c.globalCompositeOperation = 'source-over';

    // the lume: one small loaded touch of lead white on the brow
    const k = c.createRadialGradient(lx, ly, 0, lx, ly, f.R * .32);
    k.addColorStop(0, rgb(LUME, .30));
    k.addColorStop(1, rgb(LUME, 0));
    c.fillStyle = k; paint(c, f);

    // reflected warmth off the collar, into the shadow of the jaw
    const g4 = c.createLinearGradient(
      f.cx - LD[0] * f.h * 1.1, f.cy - LD[1] * f.h * 1.1, f.cx, f.cy);
    g4.addColorStop(0, rgb(SIENNA, .20));
    g4.addColorStop(.4, rgb(SIENNA, 0));
    c.fillStyle = g4; paint(c, f);

    scumble(s, f, tint(flesh, .35), mix(shade(flesh, .25), TERRE, .5));
    tooth(s, f, shade(flesh, .5), LEAD);
    c.restore();
  },

  // ---- the edge --------------------------------------------------
  // Three things, in this order:
  //
  //   1. a NEUTRAL modelling glaze, clipped inside the shape — light
  //      to dark along the one light. Neutral because this runs over
  //      every shape in the drawing, including the ones `tone()` has
  //      already painted a pigment on, and a warm glaze over those was
  //      the brown film that kept this row a photograph. Multiplying
  //      by a grey moves VALUE and leaves hue alone;
  //   2. the core shadow gathered just inside the shadow-side rim,
  //      with the last sliver of rim left warmer (the reflected light,
  //      which is what stops a shadow reading as a hole);
  //   3. THE DRAWING — and this is the sfumato, stated properly at
  //      last. The contour is at full weight where the form faces the
  //      lamp and DISSOLVES as it turns away, which is the lost edge
  //      and is nobody else's on this sheet. A thin ring goes all the
  //      way round underneath at low weight, so the shape always
  //      closes and the row still reads at 90px.
  //
  // (2) is also the answer to a bug worth recording: a character with
  // NO skin colour never reaches `skin()` at all (`skull.js` fills the
  // face with paper and stops), so four faces in six came back blank
  // no matter what the flesh glaze did. An edge, though, every shape
  // gets. Modelling from the contour inward is the one hook that
  // reaches them.
  edge(s, pts, w, o = {}) {
    const n = pts.length;
    if (n < 3) return;
    const f = frame(pts);
    if (f.diag < 2.5) return;
    const c = s.ctx;
    const litAt = i => {
      const dx = pts[i][0] - f.cx, dy = pts[i][1] - f.cy;
      const d = Math.hypot(dx, dy) || 1;
      return (dx * LD[0] + dy * LD[1]) / d;      // +1 = facing the lamp
    };
    const seg = Math.max(1, Math.round(n / 16));
    const band = Math.max(1.2, Math.min(f.diag * .034, w * 3.2));

    c.save(); s.poly(pts, true); c.clip();

    const bare = !painted(s);

    // A BARE PLATE IS FLESH. Nobody laid a colour on it, so it is a
    // face, an ear, an arm or a leg, and on a panel of 1500 those are
    // ochre and rose over a green underpaint — not the paper. This is
    // the only paint four faces in six ever get.
    if (bare) {
      c.fillStyle = rgb(mix(VERDACCIO, TERRE, .34), .92); paint(c, f);
      c.fillStyle = rgb(mix(mix(FLESH, ROSE, .22), LUME, .20), .86); paint(c, f);
    }

    // …then ONE glaze across the whole interior, along the light. A
    // stroked band alone only ever hugs the outline, which on a bare
    // face gave a white disc with a dark rim — a rim is not a form
    // turning. A panel is glazed edge to edge and so is this.
    //
    // WHICH glaze depends on whether there is a pigment under it. On
    // bare flesh it is warm, because that is the modelling. On a mass
    // `tone()` has already painted it is NEUTRAL grey — multiplying by
    // [g,g,g] moves value and leaves hue alone, so an ultramarine gets
    // darker instead of browner. Using the warm one everywhere is what
    // kept this row a photograph for two rounds.
    c.globalCompositeOperation = 'multiply';
    const gl = c.createLinearGradient(
      f.cx + LD[0] * f.h * 1.05, f.cy + LD[1] * f.h * 1.05,
      f.cx - LD[0] * f.h * 1.05, f.cy - LD[1] * f.h * 1.05);
    if (bare) {
      gl.addColorStop(0, rgb(mix(LUME, FLESH, .14), .18));
      gl.addColorStop(.30, rgb(mix(LEAD, FLESH, .34), .28));
      gl.addColorStop(.50, rgb(mix(FLESH, OCHRE, .44), .40));
      gl.addColorStop(.66, rgb(mix(VERDACCIO, SIENNA, .40), .80));  // the halftone goes green
      gl.addColorStop(.84, rgb(mix(UMBER, TERRE, .40), .97));
      gl.addColorStop(.98, rgb(shade(mix(UMBER, MADDER, .28), .38), .96));
      gl.addColorStop(1, rgb(SIENNA, .58));                         // reflection at the very rim
    } else {
      gl.addColorStop(0, rgb(LUME, .10));
      gl.addColorStop(.34, rgb(GREY_HI, .18));
      gl.addColorStop(.56, rgb(GREY_HI, .34));
      gl.addColorStop(.74, rgb(GREY_MID, .56));
      gl.addColorStop(.90, rgb(GREY_LO, .74));
      gl.addColorStop(.98, rgb(GREY_DEEP, .80));
      gl.addColorStop(1, rgb(SIENNA, .40));
    }
    c.fillStyle = gl; paint(c, f);

    // and the light lifted back off the lit half, so the two halves
    // are a real value structure and not a tint on cream
    c.globalCompositeOperation = 'screen';
    const [lx, ly] = lume(f);
    const li = c.createRadialGradient(lx, ly, 0, lx, ly, f.R * .95);
    li.addColorStop(0, rgb(bare ? mix(LUME, GIALLO, .30) : LUME, bare ? .52 : .40));
    li.addColorStop(.5, rgb(LEAD, bare ? .24 : .17));
    li.addColorStop(1, rgb(LUME, 0));
    c.fillStyle = li; paint(c, f);
    c.globalCompositeOperation = 'multiply';

    c.lineJoin = 'round'; c.lineCap = 'round';
    for (let a = 0; a < n - 1; a += seg) {
      const b = Math.min(n - 1, a + seg);
      let L = 0; for (let i = a; i <= b; i++) L += litAt(i);
      L /= (b - a + 1);
      const sh = Math.max(0, Math.min(1, (.5 - L) / 1.1));
      if (sh < .04) continue;
      const inw = [];
      for (let i = a; i <= b; i++) {
        const dx = pts[i][0] - f.cx, dy = pts[i][1] - f.cy;
        const d = Math.hypot(dx, dy) || 1;
        inw.push([pts[i][0] - dx / d * band * .55, pts[i][1] - dy / d * band * .55]);
      }
      for (let k = 0; k < 3; k++) {
        c.beginPath(); c.moveTo(inw[0][0], inw[0][1]);
        for (let i = 1; i < inw.length; i++) c.lineTo(inw[i][0], inw[i][1]);
        c.lineWidth = band * (2.3 - k * .7);
        c.strokeStyle = rgb(k < 2 ? UMBER : shade(UMBER, .45), sh * (.09 + k * .08));
        c.stroke();
      }
    }
    c.globalCompositeOperation = 'source-over';
    c.restore();

    // 3. THE DRAWING, and THE LOST EDGE. The contour is at full weight
    // where the form faces the lamp and thins away to almost nothing as
    // it turns — the lost edge, which is sfumato said properly and is
    // nobody else's on this sheet. The arcs are geometric (keyed to the
    // light and the shape, never rolled), so this cannot strobe.
    //
    // ONE pass, and it matters: a full-weight closing ring underneath
    // plus seven arcs on top is eight strokes down the same path, and
    // the brush hand sheds paper-coloured crumbs off every one of them.
    // On a dark green panel that is a snowdrift round every head. Each
    // arc is drawn exactly once and the DIM ones are still drawn, so
    // the shape always closes.
    const prev = s.ink;
    s.setInk(mix(BISTRE, UMBER, .22));
    if (f.diag > 13) {
      const closed = Math.hypot(pts[0][0] - pts[n - 1][0], pts[0][1] - pts[n - 1][1]) > w
        ? pts.concat([pts[0]]) : pts;
      const N = closed.length, arcs = 7, st = N / arcs;
      for (let a = 0; a < arcs; a++) {
        const i0 = Math.max(0, Math.floor(a * st) - 1);
        const i1 = Math.min(N - 1, Math.ceil((a + 1) * st) + 1);
        if (i1 - i0 < 2) continue;
        let L = 0;
        for (let i = i0; i <= i1; i++) {
          const dx = closed[i][0] - f.cx, dy = closed[i][1] - f.cy;
          const d = Math.hypot(dx, dy) || 1;
          L += (dx * LD[0] + dy * LD[1]) / d;
        }
        L /= (i1 - i0 + 1);
        const k = Math.max(0, Math.min(1, (L + .55) / 1.25));   // 1 = facing the lamp
        s.stroke(closed.slice(i0, i1 + 1), w * (.30 + .70 * k),
          { alpha: .16 + .76 * k, taper: .26, amp: w * .24, ghost: false, over: 0 });
      }
    } else {
      s.stroke(pts, w * .78, { alpha: .82, taper: .08, amp: w * .28, ghost: false, over: 0 });
    }
    s.setInk(prev);
  },

  // ---------------------------------------------------------------
  // THE PANEL. A sitter of 1500 stands against a plain dark green
  // field with a window cut in the wall beside them, and through it
  // the distance goes pale and blue with the air in front of it. That
  // is aerial perspective, it is this movement's own invention, and it
  // is the one thing the row was missing entirely.
  //
  // The field is COUNTERCHANGED — darker behind the lit side of the
  // figure, lighter behind the shadow side. It is an ordinary
  // painter's device and it is what makes a head read against a wall.
  // Three kinds of panel are dealt (a window, an open loggia, a cloth
  // of honour), because six identical dark rectangles in a row is
  // wallpaper, which is the failure a backdrop exists to fix.
  //
  // Drawn once per character, never per boil frame, so it may roll
  // freely.
  // ---------------------------------------------------------------
  backdrop(s, { w, h, seed, floor }) {
    const c = s.ctx;
    const m = Math.max(3, Math.min(w, h) * .045);      // the frame's moulding
    const X0 = m, Y0 = m, X1 = w - m, Y1 = h - m;
    const W = X1 - X0, H = Y1 - Y0;

    // the board
    c.fillStyle = rgb(BOARD); c.fillRect(0, 0, w, h);

    // WHAT KIND OF PANEL. Six identical dark rectangles in a row is
    // wallpaper, which is exactly the failure the backdrop is supposed
    // to fix somewhere else. A workshop of 1500 turned out three sorts
    // of portrait and they are dealt here: a wall with a WINDOW cut in
    // it, an open LOGGIA with a pier to one side and the distance
    // filling the rest, and a CLOTH of honour — a brocade hung behind
    // the sitter, which is the one with no landscape in it at all.
    // Rolled freely, because this is drawn once per character.
    // …and it is dealt off the SEED, through an avalanche. TWO ways of
    // doing this have already failed in this row and both are worth
    // recording, because they fail SILENTLY — six cells came back
    // identical and nothing said why. `s.jr` first: a mulberry32
    // seeded from neighbouring strings gives correlated FIRST draws,
    // so every panel took the same branch. Then raw `hashStr`: it is
    // FNV-1a, and strings differing in their last character land
    // within two percent of each other, so `h < .5` is the same answer
    // six times running. `h01` is the mixer that fixes both.
    const dealt = k => h01(hashStr(`${k}:${seed}`), 7, 3);
    const u = dealt('kind');
    const kind = u < .50 ? 'window' : u < .76 ? 'loggia' : 'cloth';
    const right = dealt('side') < .5;    // which side the opening is on

    // THE FIELD, and it is COUNTERCHANGED: darker behind the lit side
    // of the figure, lighter behind the shadow side. An ordinary
    // painter's device, and it is what makes a head read against a wall.
    const fg = c.createLinearGradient(X0, 0, X1, 0);
    fg.addColorStop(0, rgb(shade(FIELD, .30)));
    fg.addColorStop(.42, rgb(FIELD));
    fg.addColorStop(1, rgb(mix(FIELD, FIELD_HI, .85)));
    c.fillStyle = fg; c.fillRect(X0, Y0, W, H);
    // and a slow vertical fall, so the top corners are the deepest
    const vg = c.createLinearGradient(0, Y0, 0, Y1);
    vg.addColorStop(0, rgb(BISTRE, .34));
    vg.addColorStop(.5, rgb(BISTRE, 0));
    c.fillStyle = vg; c.fillRect(X0, Y0, W, H);

    if (kind === 'loggia') {
      // the distance itself, filling the panel from the sill up, with
      // a pier of the loggia standing against it on one side
      const px = right ? X0 : X1 - W * .26;
      const ly = Y0 + H * .06, lh = H * s.jr(.50, .60);
      landscape(s, right ? X0 + W * .26 : X0, ly, W * .74, lh);
      c.fillStyle = rgb(shade(FIELD, .18));
      c.fillRect(px, Y0, W * .26, H);
      c.fillStyle = rgb(mix(FIELD, LEAD, .16), .5);   // the pier's lit face
      c.fillRect(right ? px : px + W * .20, Y0, W * .06, H);
      // the sill the distance stands on
      c.fillStyle = rgb(mix(FIELD, LEAD, .22));
      c.fillRect(X0, ly + lh, W, Math.max(1.5, H * .022));
      c.fillStyle = rgb(shade(FIELD, .35));
      c.fillRect(X0, ly + lh + Math.max(1.5, H * .022), W, H);
    } else if (kind === 'cloth') {
      // a CLOTH OF HONOUR: gold brocade on the green, a pomegranate
      // repeat stamped small enough that it reads as a pattern rather
      // than as a row of shapes
      const u = W * s.jr(.16, .22);
      c.strokeStyle = rgb(GILT, .30); c.lineWidth = Math.max(.7, u * .07);
      c.fillStyle = rgb(GILT, .22);
      for (let yy = Y0 + u * .3; yy < Y1; yy += u) {
        for (let xx = X0 + ((Math.round((yy - Y0) / u) % 2) ? u * .5 : 0); xx < X1; xx += u) {
          c.beginPath();
          c.ellipse(xx, yy, u * .20, u * .28, 0, 0, Math.PI * 2);
          c.stroke();
          c.beginPath();
          c.arc(xx, yy, u * .07, 0, Math.PI * 2); c.fill();
        }
      }
      // and it HANGS: the folds run down it, lit from the same lamp
      for (let i = 0; i < 5; i++) {
        const xx = X0 + W * ((i + s.jr(.2, .8)) / 5);
        const grd = c.createLinearGradient(xx - W * .06, 0, xx + W * .06, 0);
        grd.addColorStop(0, rgb(BISTRE, 0));
        grd.addColorStop(.42, rgb(BISTRE, .30));
        grd.addColorStop(.5, rgb(LEAD, .10));
        grd.addColorStop(1, rgb(BISTRE, 0));
        c.fillStyle = grd; c.fillRect(xx - W * .06, Y0, W * .12, H);
      }
    }

    // the floor of the room, warmer, coming forward under the sitter
    const fy = Math.max(Y0, floor - H * .30);
    const fl = c.createLinearGradient(0, fy, 0, Y1);
    fl.addColorStop(0, rgb(ROOM, 0));
    fl.addColorStop(.5, rgb(ROOM, .62));
    fl.addColorStop(1, rgb(shade(ROOM, .18), .88));
    c.fillStyle = fl; c.fillRect(X0, fy, W, Y1 - fy);

    // THE CAST SHADOW. One light on the whole row, upper left, so
    // every shadow in this style falls to the lower right — the exact
    // opposite of the row four down, where the point is that they do
    // not agree.
    const sx = w * .5 + W * .10, sy = floor + H * .010;
    const sh = c.createRadialGradient(sx, sy, 0, sx, sy, W * .34);
    sh.addColorStop(0, rgb(shade(BISTRE, .1), .55));
    sh.addColorStop(.55, rgb(shade(BISTRE, .1), .22));
    sh.addColorStop(1, rgb(shade(BISTRE, .1), 0));
    c.fillStyle = sh; c.fillRect(X0, fy, W, Y1 - fy);

    // THE WINDOW, cut into the wall, with the wall's own thickness
    // showing as a lit embrasure on the lamp's side.
    if (kind === 'window') {
      const ww = W * s.jr(.32, .40), wh = ww * s.jr(.84, 1.06);
      const wx = right ? X1 - W * s.jr(.055, .11) - ww : X0 + W * s.jr(.055, .11);
      const wy = Y0 + H * s.jr(.12, .22);
      const t = Math.max(1.2, ww * .10);
      c.fillStyle = rgb(mix(FIELD, LEAD, .34), .9);
      c.fillRect(wx - t, wy - t, ww + t * 2, wh + t * 2);
      c.fillStyle = rgb(shade(FIELD, .45), .9);
      c.fillRect(wx + t * .4, wy + t * .4, ww + t * .6, wh + t * .6);
      landscape(s, wx, wy, ww, wh);
      // the mullion: one bar, which is what says "window" at this size
      c.fillStyle = rgb(shade(UMBER, .40), .92);
      c.fillRect(wx + ww * .48, wy, Math.max(.9, ww * .045), wh);
      c.strokeStyle = rgb(shade(BISTRE, .1), .8);
      c.lineWidth = Math.max(.8, ww * .035);
      c.strokeRect(wx, wy, ww, wh);
    }

    // THE CARTELLINO — the little slip of paper a Venetian painter
    // pinned to the parapet and signed. It is trompe-l'oeil, it is
    // 1500, and it costs eight lines.
    const cw = W * .21, ch = cw * .34;
    const cx0 = X0 + W * s.jr(.06, .16), cy0 = Y1 - H * s.jr(.10, .17);
    c.fillStyle = rgb(shade(BISTRE, .1), .35);
    c.fillRect(cx0 + cw * .04, cy0 + ch * .16, cw, ch);
    c.fillStyle = rgb(mix(LEAD, OCHRE, .16));
    c.beginPath();
    c.moveTo(cx0, cy0 + ch * .06);
    c.lineTo(cx0 + cw, cy0);
    c.lineTo(cx0 + cw, cy0 + ch);
    c.lineTo(cx0, cy0 + ch * .94);
    c.closePath(); c.fill();
    c.strokeStyle = rgb(mix(BISTRE, UMBER, .3), .75);
    c.lineWidth = Math.max(.5, ch * .09);
    for (let i = 0; i < 2; i++) {
      const yy = cy0 + ch * (.36 + i * .30);
      c.beginPath();
      c.moveTo(cx0 + cw * .12, yy);
      c.lineTo(cx0 + cw * s.jr(.55, .88), yy - ch * .04);
      c.stroke();
    }

    // THE FRAME: a gilt moulding, lit by the same lamp as everything
    // else in this style — bright along the top and the left, dark
    // along the bottom and the right.
    c.fillStyle = rgb(GILT);
    c.fillRect(0, 0, w, m); c.fillRect(0, h - m, w, m);
    c.fillRect(0, 0, m, h); c.fillRect(w - m, 0, m, h);
    // the wood under the leaf, showing in streaks
    c.strokeStyle = rgb(GILT_LO, .30); c.lineWidth = Math.max(.6, m * .13);
    for (let i = 0; i < 9; i++) {
      const yy = s.jr(0, h);
      c.beginPath(); c.moveTo(0, yy); c.lineTo(m, yy + s.jr(-2, 2)); c.stroke();
      const xx = s.jr(0, w);
      c.beginPath(); c.moveTo(xx, 0); c.lineTo(xx + s.jr(-2, 2), m); c.stroke();
    }
    c.fillStyle = rgb(GILT_HI, .70);
    c.fillRect(0, 0, w, m * .30); c.fillRect(0, 0, m * .30, h);
    c.fillStyle = rgb(GILT_LO, .55);
    c.fillRect(0, h - m * .34, w, m * .34); c.fillRect(w - m * .34, 0, m * .34, h);
    // the inner lip, in shadow
    c.strokeStyle = rgb(GILT_LO, .95); c.lineWidth = Math.max(1, m * .22);
    c.strokeRect(X0, Y0, W, H);
  },
};
