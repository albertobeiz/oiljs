// ---------------------------------------------------------------
// IMPRESSIONISM — oil, alla prima, out of doors, 1874.
//
// Four things make a canvas legible as impressionism from across the
// room. Two are refusals, one is the mark, and one is the light.
//
//   · THERE IS NO BLACK. Not in the shadows, not in the contour, not
//     in the darkest dark. Monet's shadow is the COMPLEMENT of the
//     light — violet under a yellow sun — and it is as saturated as
//     the light is. A grey shadow is a studio shadow, and the studio
//     is what they walked out of. This style declares its own `ink`,
//     so the void eyes, the pupils, the lashes and the nostrils — the
//     places a part reaches past the medium for the drawing's black —
//     all come out ultramarine-violet. `DARK` measures .14, as dark as
//     the sheet needs, and up close it is unmistakably a colour.
//   · THE PAINT IS NOT MIXED. Two or three unmixed hues around the
//     local colour are laid side by side and mix in the EYE, not on
//     the palette.
//   · THE TOUCH IS A LOADED COMMA, AND YOU CAN COUNT THEM. A short
//     broad slab of paint with GROUND SHOWING BETWEEN IT AND THE NEXT
//     ONE. That gap is the whole difference between broken brushwork
//     and a mottle: touches laid edge to edge merge into one surface
//     and the surface is what reads, which is why round two came back
//     looking like aged varnish rather than like paint. The lattice is
//     now WIDER than the mark, not tighter, and the mark is a tenth of
//     the mass it sits on — about thirty countable touches on a head,
//     seven of them across it.
//   · THE KEY IS HIGH. Lead white priming under everything, no earths
//     in the box, and a value scale whose floor is a mid violet rather
//     than a dark. This is the brightest row on the sheet and it is
//     supposed to be: they were painting at noon in a field.
//
// And the thing that actually holds a plein-air canvas together is a
// VALUE STRUCTURE. There is ONE LIGHT and ONE SHADOW over the whole
// picture — `SUN` and `SKY` — and they are FAR APART IN VALUE. That
// is the whole game: broken colour with no value split optically
// mixes back to one flat middle grey, which is confetti, not
// sunlight. So every touch is placed by the surface normal, its HUE
// is broken freely, and then its VALUE is put back on the ramp it
// belongs to (`value()` below). Squint and you get a lit half and a
// shadowed half; look close and you get a dozen unmixed colours.
//
// THE BACKDROP is the afternoon itself: a plein-air study of sky,
// horizon and meadow, with poppies in it and the figure's shadow
// thrown across the grass in violet. It earns its place for a reason
// this file has been complaining about since round one — an
// impressionist figure is surrounded by canvas that is ALSO painted,
// and until now this one was surrounded by cream paper, which is why
// the contour had to be kept heavy to stop the figure leaking. With a
// field behind it the contour can finally do what it does in a real
// painting: dissolve wherever the sun is full on the form.
//
// Things tried and thrown away, so nobody re-tries them:
//   · `nearest()` snapping every colour to a pigment, the way gothic
//     does. Impressionism has no box of five — it has optical mixing —
//     and snapping put half the class in one complexion. `keyed()`
//     MIXES half-way toward the nearest pigment instead, and flesh is
//     not snapped at all: a dark skin and a pale skin are the person.
//   · a shadow made by mixing in the complement. Orange plus blue IS
//     grey — that is what complementary means — and that sheet came
//     back the colour of mud. The complement belongs BESIDE a colour
//     as a separate touch, never stirred into it.
//   · broken colour with the touches at one luminance. It is the
//     first sheet's whole failure: a fizzing warm-cool speckle with
//     two dark eyes floating in it. Hue is what varies inside a
//     value; it is not a substitute for one.
//   · touches at the scale the movement really used. At a 90px head
//     that is a hundred marks a shape and it turns to noise, the exact
//     failure the style exists to avoid. Few, and big.
//   · a lattice TIGHTER than the mark, so the touches overlap. It was
//     put there to stop the two hands disagreeing about coverage, and
//     it cost the style its entire subject: overlapping touches are a
//     texture, separated touches are brushwork. The ground underneath
//     is what makes one authored number work in both hands now — it
//     is a quiet, compressed copy of the same light, so a gap is
//     underpainting in either hand rather than a hole.
//   · a ground LIGHTER than the paint. That is what turns the gaps
//     into a web of pale cracks — craquelure, the wrong century, and
//     the thing the critique put its finger on.
//   · letting `value()` bleach. Lightening toward lead white and
//     darkening toward the dark blue both strip a colour's hue, and
//     over a whole figure that convergence is the thing you see: six
//     characters in six colours arriving as one lavender-and-cream
//     creature. `value()` hands the chroma back now, which is what
//     stops this row being the least distinguishable on the sheet as
//     well as the brightest.
//   · a contour eaten over half its ring. Correct for the movement,
//     and it lost two of six characters into the meadow behind them.
//     The dissolve is worth having and it belongs where the sun is
//     FULL on the form, not wherever the form is lit at all.
// ---------------------------------------------------------------
import { mix, sat, opposite, tint, dens, bbox, centroid, inside, rgb, nearest, lum } from './pigment.js';

// The 1874 paintbox. They threw the earths out of it — no ochre, no
// umber, no bone black — and worked from these.
const WHITE = [252, 249, 236];   // lead white, always a touch warm
const CHROME = [250, 208, 82];   // chrome yellow — this IS the sunlight
const CADMIUM = [238, 140, 54];  // cadmium orange
const VERM = [220, 74, 54];      // vermilion
const MADDER = [194, 78, 122];   // rose madder
const COBALT = [72, 126, 200];   // cobalt blue
const ULTRA = [58, 64, 154];     // french ultramarine
const VIRIDIAN = [44, 138, 118]; // viridian
const EMERALD = [124, 190, 96];  // emerald green
const VIOLET = [128, 92, 182];   // cobalt violet — the shadow colour

// WHITE is deliberately NOT a keying target. They used more of it than
// anything else, but as a target it swallowed every pale cloth and
// every light skin — a third of the first sheet came back looking
// unpainted. White belongs in the highlight, not in the local colour.
const BOX = [CHROME, CADMIUM, VERM, MADDER, COBALT, ULTRA, VIRIDIAN, EMERALD, VIOLET];

// The two ends of the value scale. Nothing on the sheet is darker than
// DARK or lighter than WHITE, and DARK is a COLOUR — ultramarine with
// madder in it, and visibly violet where it sits next to a skin. It is
// also this style's `ink`, so the character's own black is this.
const DARK = [38, 32, 86];
const AIR = mix(WHITE, COBALT, .14);    // the palest note: white with sky in it

// THE LIGHT AND THE SHADOW OF THIS AFTERNOON — the two colours every
// shape on the character is modelled with, and the only two. One
// afternoon over the whole row: a hat, a face and a shoe are lit by
// the same sun or they are three separately lit objects.
const SUN = mix(CHROME, WHITE, .28);
const SKY = mix(VIOLET, ULTRA, .40);

// One sun for the whole character, upper left.
const LX = -.50, LY = -.866;

const LW = lum(WHITE), LD = lum(DARK);
const cl01 = v => v < 0 ? 0 : v > 1 ? 1 : v;

// PUT A COLOUR ON A VALUE. This is the spine of the style. A touch may
// be any hue it likes — chrome, viridian, madder, the complement — and
// then it is moved onto the value its position on the form has earned,
// by lightening toward the lead white or darkening toward the dark
// blue. Hue is free, value is not, and that is the difference between
// a Monet and a plate of confetti.
// ...AND IT DOES NOT BLEACH ON THE WAY. Mixing toward lead white is
// how a colour gets lighter and it is also how a colour loses its
// hue, and over a whole figure that second effect is the one you see:
// the lit half of everything washes to cream, the shadow half darkens
// toward the same blue-violet, and a row of six characters converges
// on ONE lavender-and-white creature whatever colours it started
// with. That was round three's sheet, and against nine neighbours it
// was the palest and the least distinguishable row on it. So the
// chroma the mix costs is handed back afterwards: the value moves,
// the hue stays where the character put it.
const chroma = c => Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2]);
function value(c, L, keep = .62) {
  const l = lum(c);
  const out = L >= l ? mix(c, WHITE, cl01((L - l) / Math.max(.05, LW - l)))
                     : mix(c, DARK, cl01((l - L) / Math.max(.05, l - LD)));
  const c0 = chroma(c), c1 = chroma(out);
  if (c0 < 2 || c1 < 2) return out;
  return sat(out, Math.max(.7, Math.min(1.9, 1 + (c0 / c1 - 1) * keep)));
}

// A colour answered in this paintbox: half-way to the nearest pigment
// (so the sheet is one palette) and saturated — they used the tube
// colour, not a mixture.
function keyed(col) {
  return sat(mix(col, nearest(col, BOX), .52), 1.3);
}

// Flesh is keyed differently and on purpose: never snapped to a
// pigment. The skins run from dark brown to pale cream and that
// difference is the person. It is warmed toward cadmium, and all the
// impressionist work is done by what is laid ON it — chrome in the
// light, viridian in the turn, violet in the shadow. That is the
// Renoir cheek: a modelling recipe, not a colour.
const fleshOf = col => sat(mix(col, CADMIUM, .26), 1.2);

// How far a point is toward the sun: -1 turning away .. +1 facing it.
const facing = (px, py, cx, cy, r) =>
  Math.max(-1, Math.min(1, ((px - cx) * LX + (py - cy) * LY) / (r || 1)));

// ---------------------------------------------------------------
// THE TOUCH.
//
// A ground that already carries the light — one sweep from the sun
// into the shade — and then a scatter of broad SEPARATE commas over
// it. The ground earns its place three times over: it is what shows
// in the gaps between the touches, at crowd scale the touches merge
// back into it, and what is left has to still be a lit, modelled,
// coloured shape rather than a flat patch.
// ---------------------------------------------------------------
function commas(s, pts, local, o = {}) {
  const [x0, y0, x1, y1] = bbox(pts);
  const bw = x1 - x0, bh = y1 - y0;
  const diag = Math.hypot(bw, bh);
  if (diag < 2) return;
  const [cx, cy] = centroid(pts);
  const c = s.ctx;
  const flesh = !!o.flesh, flat = !!o.flat;

  // ---- THE TWO ENDS OF THIS SHAPE'S VALUE RAMP -----------------
  // Wide on purpose, and HIGH. Half a value apart is what a light
  // SOURCE looks like; a tenth is what a texture looks like. The whole
  // ramp sits a tenth higher than it did in round two, because the
  // row is meant to be the brightest thing on the sheet and lead-white
  // priming under thin oil is why. `flat` is the character's own darks
  // — a void eye, the inside of a mouth — which are a hole and must
  // not be modelled into a ball.
  const L = lum(local);
  // A FACE keeps its own key — a pale skin stays pale, a dark skin
  // stays dark, that difference is the person — and buys its
  // modelling out of the shadow end instead. Push a face up to the
  // same top note as a hat and every character on the row gets the
  // same cream mask.
  // `o.key` overrides both ends outright, and exactly one caller uses
  // it: the head nobody painted. A white creature in the sun lives in
  // the top quarter of the scale and is modelled in HUE — chrome
  // against cobalt violet — not in value. Modelled on the ordinary
  // flesh ramp it came back with half its face in mid-violet, which
  // reads as dirt rather than as light.
  const litL = o.key ? o.key[1]
    : flat ? Math.min(.42, L + .10)
    : flesh ? Math.min(.90, Math.max(.62, L + .10))
    : Math.min(.86, Math.max(.56, L + .21));
  const shdL = o.key ? o.key[0]
    : flat ? Math.max(.04, L - .05)
    : flesh ? Math.max(.40, Math.min(.62, L - .24))
    : Math.max(.30, Math.min(.56, L - .22));
  // The two ends keep the LOCAL hue and are only LEANED toward the sun
  // and the sky. `value()` does the rest, and it cools as it darkens
  // and warms as it lightens all by itself, because the two ends of
  // the scale are a warm white and a blue-violet dark. Lean harder
  // than this and every character on the row is the same purple —
  // which is exactly what a 55% mix looked like.
  // The shadow leans toward the sky and NOT much further. `value()`
  // already darkens toward a blue-violet all by itself, so a big lean
  // here is the same fact twice and every shadow on the row came out
  // the identical lavender.
  const lit = value(sat(mix(local, SUN, .40), 1.24), litL);
  const shd = value(sat(mix(local, SKY, .18), 1.34), shdL);

  c.save();
  // The clip is a size larger than the drawing, so a touch may hang
  // over the contour. Paint laid alla prima does not stop at the line;
  // clipped exactly to it, every mark ends in the same smooth arc and
  // the shape's rim is the one place the brushwork disappears.
  s.poly(s.offsetShape(pts, 1.035, 0, 0, 0), true); c.clip();

  // The ground, laid as one sweep from the light into the shade. It is
  // a COMPRESSED copy of the touches' ramp — pulled in a tenth of a
  // value at both ends — and that is not a detail. THE TOUCHES DO NOT
  // MEET any more; this is what is between them. A ground lighter than
  // the paint turns every gap into a pale crack and the sheet comes
  // back as craquelure — which is exactly the note the critique wrote
  // against round two. The ground must always be the quieter of the
  // two, and slightly the darker.
  const g = c.createLinearGradient(cx + LX * diag * .56, cy + LY * diag * .56,
                                   cx - LX * diag * .56, cy - LY * diag * .56);
  g.addColorStop(0, rgb(value(mix(local, SUN, .26), litL - .10)));
  g.addColorStop(.44, rgb(value(local, (litL + shdL) * .50)));
  g.addColorStop(.9, rgb(value(mix(local, SKY, .26), shdL + .04)));
  g.addColorStop(1, rgb(value(mix(local, SKY, .26), shdL + .04)));
  s.poly(s.offsetShape(pts, 1.06, 0, 0, 0), true);
  c.fillStyle = g; c.fill();

  // Below about a fingernail there is no room for broken colour, and
  // trying anyway is what turns a nostril into mud. One touch and out.
  if (diag < 20) {
    s.daub(cx - bw * .22, cy + bh * .16, cx + bw * .20, cy - bh * .04,
      Math.max(1.4, bh * .5), lit, { alpha: .7, ridge: false });
    c.restore(); return;
  }

  // ---- THE MARK -------------------------------------------------
  // WIDTH FIRST, and it is taken from the size of the shape being
  // filled: a torso gets loaded drags, an ear gets two dabs, and a
  // head and a foot never get the same mark, which is what makes a
  // hand-painted row instead of a filter.
  // A comma is about a TENTH of the mass it sits on, which puts seven
  // of them across a head. At a sixth — where round three started —
  // three marks cover a hat and the shape comes back as a jigsaw of
  // flat plates rather than as brushwork. Countable means countable at
  // around thirty, not at four.
  const K = flat ? .16 : flesh ? .115 : .105;
  let tw = Math.max(2.4, diag * K);
  // AND THE LATTICE IS WIDER THAN THE MARK. This one number is the
  // round-three change and the whole answer to "it reads as aged
  // varnish": at .92 the touches overlapped into a single mottled
  // surface, at 1.2 you can count them. What holds the shape together
  // in the gaps is the ground above, not the neighbouring mark.
  let sp = tw * 1.2;

  // ONE dominant direction per shape, taken from the shape itself and
  // never rolled: a tall mass is stroked steeply, a wide one nearly
  // flat, both up to the right, where a right hand takes them.
  const ba = (bh > bw * 1.15 ? -1.16 : -.38);
  const bx = Math.cos(ba), by = Math.sin(ba);

  // TWO MARKS, and the mix is not decoration. `daub` is the loaded
  // slab — opaque, with a bristle ridge — and it is the touch this
  // style is about; `stroke` with a wedge is the hand's own comma,
  // thin where the brush landed and fat where it lifted. Slabs are the
  // majority now: separated, their bristle ridges read as impasto
  // instead of tiling into the web of pale cracks that made round two
  // look like a cracked varnish.
  const loadP = .6;

  // A few dozen marks, never hundreds, and the cap is a COST rule as
  // much as an art one: the brush hand pays ~.8ms a mark, and a
  // character has half a dozen shapes big enough to fill. When a shape
  // wants more cells than that, the LATTICE OPENS and the mark grows
  // with it — a big mass gets bigger touches, never more of them. The
  // cap must never be hit by running out mid-loop: the loop walks top
  // to bottom, so an exhausted budget leaves the bottom of the shape
  // bare ground.
  const budget = 44;
  const est = (bw / sp + 1) * (bh / sp + 1) * .72;
  if (est > budget) { const f = Math.sqrt(est / budget); sp *= f; tw = Math.max(tw, sp * .8); }
  const nx = Math.max(1, Math.round(bw / sp)), ny = Math.max(1, Math.round(bh / sp));
  let left = budget + 8;

  for (let iy = 0; iy <= ny && left > 0; iy++) {
    for (let ix = 0; ix <= nx && left > 0; ix++) {
      // a jittered lattice, not a scatter: a scatter clumps, and a
      // clump of commas is a stain
      // ...and the rows are STAGGERED, every other one shoved half a
      // step sideways. Without that the marks line up into corduroy —
      // a lattice of horizontal touches is a lattice you can see.
      //
      // The jitter is DELIBERATELY SMALL. It is re-rolled every boil
      // frame, and a mark this big wandering a third of a cell is a
      // mark you watch move — the flicker measure catches it.
      const px = x0 + (ix + .5 + (iy & 1 ? .5 : 0)) * (bw / (nx + 1)) + s.jr(-.14, .14) * sp;
      const py = y0 + (iy + .5) * (bh / (ny + 1)) + s.jr(-.12, .12) * sp;
      if (!inside(pts, px, py)) continue;
      left--;

      // ---- WHERE ON THE FORM, AND THEREFORE WHAT VALUE ----------
      const t = facing(px, py, cx, cy, diag * .42);
      // more of a form is lit than is not — but a FACE turns sooner,
      // because a cheek with no shadow side is a plate
      const u = cl01((t + (flesh ? .66 : .82)) / (flesh ? 1.26 : 1.34));
      const uu = u * u * (3 - 2 * u);            // a soft terminator
      const base = mix(shd, lit, uu);
      const bl = shdL + (litL - shdL) * uu;

      // The stroke FOLLOWS THE FORM: the dominant direction bent
      // toward the tangent of the mass it sits on, so the touches
      // swirl round a head instead of ruling it into stripes. Straight
      // rows of long marks read as wood grain — that was an early
      // sheet, and it looked like a tiger.
      let vx = px - cx, vy = py - cy;
      const d = Math.hypot(vx, vy) || 1;
      let tx = -vy / d, ty = vx / d;                     // the tangent
      if (tx * bx + ty * by < 0) { tx = -tx; ty = -ty; }  // one handedness
      const k = .92 * Math.min(1, d / (diag * .20));      // flat only at the centre
      let ax = bx * (1 - k) + tx * k, ay = by * (1 - k) + ty * k;
      const al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
      // alternate rows lean the other way as well — a second guard
      // against banding, and it is what a loaded brush does anyway
      const jt = s.jr(-.22, .22) + (iy & 1 ? .2 : -.2), cj = Math.cos(jt), sj = Math.sin(jt);
      [ax, ay] = [ax * cj - ay * sj, ax * sj + ay * cj];

      // ---- WHAT HUE, INSIDE THAT VALUE -------------------------
      // The hues stay in a NARROW band around the local colour and
      // around the light: chrome and white in the sun, viridian and
      // cadmium in the turn, cobalt violet in the shade. Give the
      // scatter the run of the wheel and you get rainbow spaghetti.
      // A separated touch can carry more unmixed colour than an
      // overlapping one could — a gap between two hues is what lets
      // the eye do the mixing instead of the canvas — so the leans are
      // a third stronger than they were.
      // The face gets a tighter band than anything else: broken colour
      // still has to resolve into a cheek at three metres.
      const q = o.calm ? .62 : flesh ? .88 : 1;
      let col;
      if (uu > .62) col = s.chance(.55) ? mix(base, CHROME, .32 * q) : mix(base, WHITE, .20 * q);
      else if (uu < .34) col = s.chance(.55) ? mix(base, VIOLET, .34 * q) : mix(base, ULTRA, .24 * q);
      else col = s.chance(.5) ? mix(base, CADMIUM, .30 * q)
        : mix(base, flesh ? VIRIDIAN : COBALT, .26 * q);
      // and now and then the complement, laid BESIDE its neighbours
      // and never stirred into them — the mark that makes the eye do
      // the mixing. Rare: at one touch in twenty it is a spark, at one
      // in ten it is confetti. Never on a face.
      if (!flesh && s.chance(.06)) col = mix(base, sat(opposite(local), 1.2), .46);

      // ...AND BACK ONTO ITS VALUE. Everything above moved the hue and
      // the luminance together; only the hue was wanted.
      col = value(col, cl01(bl * s.jr(.95, 1.05)));
      // ...and then the chroma is put BACK. `value()` moves a colour by
      // mixing it toward lead white or toward the dark blue, and both
      // of those wash the hue out on the way — which is fatal at the
      // top of the scale, where a face lives. A pale cheek painted this
      // way came back as a blank cream oval with the marks invisible
      // inside it. Flesh gets the biggest push for exactly that reason:
      // Renoir's light skin is not pale paint, it is saturated pink,
      // chrome and green at a high value.
      col = sat(col, o.calm ? 1.1 : flesh ? 1.35 : 1.15);

      // BROAD AND SHORT: a loaded comma is one to three of its own
      // widths long, and now and then a real drag. The lengths vary a
      // lot — one length everywhere is hatching however fat it is.
      const wd = tw * s.jr(.8, 1.1);
      const len = wd * (s.chance(.22) ? s.jr(1.9, 2.6) : s.jr(.8, 1.7));
      const hx = ax * len * .5, hy = ay * len * .5;
      if (s.chance(loadP)) s.daub(px - hx, py - hy, px + hx, py + hy, wd, col,
        { alpha: s.jr(.88, 1), ridge: s.chance(.45) });
      else {
        s.setInk(col);
        // WEDGE: the hand's own comma, thin where the bristle touched
        // down and loaded where it lifted. A symmetrical taper is a
        // hatch mark; a wedge is a brush leaving the canvas.
        s.stroke([[px - hx, py - hy], [px + hx, py + hy]], wd * 1.1,
          { alpha: s.jr(.9, 1), wedge: true, amp: wd * .09 });
      }
    }
  }

  // THE SUN ITSELF, last and on top: a few broad strokes of the
  // brightest note dragged across the lit shoulder of the mass.
  // Everything before this is local colour under a light; this is the
  // light, and it costs four marks.
  //
  // It is a step above THIS SHAPE'S OWN top note, never an absolute
  // white. Painted at `mix(SUN, WHITE)` it was white on everything,
  // and on a navy hood four white commas read as a lightning bolt —
  // a highlight is relative to the thing it is on.
  if (diag > 46 && !flat) {
    const lx = cx + LX * diag * .3, ly = cy + LY * diag * .3;
    for (let i = 0; i < s.ri(3, 5); i++) {
      const px = lx + s.jr(-.22, .22) * diag, py = ly + s.jr(-.18, .18) * diag;
      if (!inside(pts, px, py)) continue;
      const a = ba + s.jr(-.24, .24);
      // SHORT and broad. Long bright marks stop being light on a form
      // and become ribbons lying across it — they read as tinsel.
      const hx = Math.cos(a) * tw * s.jr(.6, 1.1), hy = Math.sin(a) * tw * s.jr(.6, 1.1);
      s.daub(px - hx, py - hy, px + hx, py + hy, tw * s.jr(.6, .9),
        value(mix(local, SUN, .66), Math.min(.95, litL + .10)),
        { alpha: s.jr(.6, .9), ridge: false });
    }
  }
  c.restore();
}

// ---------------------------------------------------------------
// THE AFTERNOON — the space the figure stands in.
//
// This is the one thing `tone / skin / edge` could never give the
// style, and the file has been asking for it since round one: an
// impressionist figure is surrounded by canvas that is ALSO painted.
// Sky, a horizon, a meadow with poppies in it, and the figure's own
// shadow laid across the grass in violet, going where the sun says it
// should. It is drawn once per character, so it never boils, and it is
// deliberately HIGH KEY and low contrast — a backdrop that fights the
// figure is wallpaper, and the squint test is about the figure.
//
// The edge of it is a painted patch, not a rectangle: strokes running
// off the wet edge of an oil sketch. Panels are not allowed to touch —
// every backdrop sits at the same z, so two of them overlapping
// z-fight — which is a second reason for a ragged edge inside the
// panel rather than a full bleed.
// ---------------------------------------------------------------
function torn(s, x0, y0, x1, y1) {
  const p = [], n = 13;
  const w = (x1 - x0), h = (y1 - y0), r = Math.min(w, h) * .04;
  for (let i = 0; i <= n; i++) p.push([x0 + w * i / n + s.jr(-r, r), y0 + s.jr(-r, r)]);
  for (let i = 0; i <= n; i++) p.push([x1, y0 + h * i / n]);
  for (let i = 0; i <= n; i++) p.push([x1 - w * i / n + s.jr(-r, r), y1 + s.jr(-r, r)]);
  for (let i = 0; i <= n; i++) p.push([x0, y1 - h * i / n]);
  return p;
}

function field(s, W, H, floor) {
  const c = s.ctx;
  // The sides BLEED. Panels are one cell wide and butt up against
  // their neighbours, and the horizon is a fixed fraction of the panel
  // — so the row shares one continuous meadow instead of six studies
  // with a white seam between each pair. Inset them by even one
  // percent and the seam is what you see.
  const x0 = -2, x1 = W + 2, y0 = H * .02, y1 = Math.min(H - 1, floor + H * .045);
  const hz = floor - H * .30;                       // the horizon, above the feet
  const patch = torn(s, x0, y0, x1, y1);

  c.save();
  s.poly(patch, true); c.clip();

  // ---- the two grounds, laid wet ------------------------------
  const sky = c.createLinearGradient(0, y0, 0, hz);
  sky.addColorStop(0, rgb(value(mix(WHITE, COBALT, .48), .74)));
  sky.addColorStop(1, rgb(value(mix(WHITE, CHROME, .20), .87)));
  c.fillStyle = sky; c.fillRect(x0 - 4, y0 - 4, x1 - x0 + 8, hz - y0 + 8);

  const grass = c.createLinearGradient(0, hz, 0, y1);
  grass.addColorStop(0, rgb(value(mix(EMERALD, CHROME, .40), .70)));
  grass.addColorStop(1, rgb(value(mix(VIRIDIAN, ULTRA, .22), .50)));
  c.fillStyle = grass; c.fillRect(x0 - 4, hz, x1 - x0 + 8, y1 - hz + 8);

  // ---- the sky, in touches ------------------------------------
  // Broad and near-horizontal, and they get paler and flatter toward
  // the horizon. Sky painted at one value is a wall.
  const sw = W * .1;
  for (let i = 0; i < 18; i++) {
    const px = s.jr(x0 - sw, x1 + sw), py = s.jr(y0 - 4, hz + 2);
    const t = cl01((py - y0) / Math.max(1, hz - y0));
    const base = mix(mix(WHITE, COBALT, .46 - t * .34), CHROME, t * .18);
    // A sky is BROKEN, not busy: the touches sit within a few points
    // of the gradient under them, so what reads at arm's length is one
    // luminous field and what reads up close is separate strokes. Give
    // them their own value and the sky comes back as white confetti.
    const col = value(s.chance(.3) ? mix(base, VIOLET, .2) : base,
      .74 + t * .16 + s.jr(-.03, .03));
    const a = s.jr(-.24, .24) * (1 - t * .6);
    const len = sw * s.jr(1.1, 2.2);
    s.daub(px - Math.cos(a) * len * .5, py - Math.sin(a) * len * .5,
      px + Math.cos(a) * len * .5, py + Math.sin(a) * len * .5,
      sw * s.jr(.22, .4), col, { alpha: s.jr(.28, .48), ridge: false });
  }
  // a cloud or two: the only place absolute white is allowed
  for (let i = 0, n = s.ri(1, 2); i < n; i++) {
    const px = s.jr(x0, x1), py = s.jr(y0, y0 + (hz - y0) * .45);
    for (let k = 0; k < 4; k++)
      s.daub(px - sw * s.jr(.4, 1.1), py + s.jr(-4, 4), px + sw * s.jr(.4, 1.1), py + s.jr(-4, 4),
        sw * s.jr(.3, .5), mix(WHITE, CHROME, s.jr(.02, .2)), { alpha: s.jr(.3, .55), ridge: false });
  }

  // ---- the meadow ---------------------------------------------
  // Short and horizontal at the horizon, long and steep at the
  // bottom: that is the only perspective a field of grass has.
  const gw = W * .085;
  for (let i = 0; i < 40; i++) {
    const py = hz + Math.pow(s.jr(0, 1), .7) * (y1 - hz + 4);
    const t = cl01((py - hz) / Math.max(1, y1 - hz));
    const px = s.jr(x0 - gw, x1 + gw);
    const base = s.chance(.5) ? mix(EMERALD, CHROME, s.jr(.1, .5))
      : s.chance(.5) ? VIRIDIAN : mix(EMERALD, COBALT, s.jr(.1, .4));
    const col = value(base, .74 - t * .22 + s.jr(-.05, .05));
    const a = (s.chance(.5) ? -1 : 1) * s.jr(.05, .3) + (Math.PI / 2) * t * s.jr(.5, 1);
    const len = gw * (.5 + t * 1.5) * s.jr(.7, 1.3);
    const wd = gw * (.3 + t * .4) * s.jr(.7, 1.2);
    s.daub(px - Math.cos(a) * len * .5, py - Math.sin(a) * len * .5,
      px + Math.cos(a) * len * .5, py + Math.sin(a) * len * .5,
      wd, col, { alpha: s.jr(.88, 1), ridge: s.chance(.3) });
  }
  // poppies. Monet painted this field in 1873 and the red dots are the
  // reason anyone can name the picture.
  for (let i = 0, n = s.ri(7, 14); i < n; i++) {
    const py = hz + Math.pow(s.jr(0, 1), .55) * (y1 - hz);
    const t = cl01((py - hz) / Math.max(1, y1 - hz));
    const px = s.jr(x0, x1);
    const r = gw * (.13 + t * .26) * s.jr(.7, 1.3);
    s.daub(px, py, px + s.jr(-r, r), py - r * .5, r,
      value(s.chance(.5) ? VERM : mix(VERM, MADDER, .4), .52 + s.jr(0, .1)),
      { alpha: s.jr(.75, 1), ridge: false });
  }

  // ---- the shadow ---------------------------------------------
  // The sun is upper LEFT for every shape on the character, so the
  // shadow goes down and to the RIGHT. It is violet, it is not a
  // darkened green, and it is the single most impressionist thing on
  // the panel: there is no such thing as a grey shadow out of doors.
  const fx = W * .5, fy = floor;
  for (let i = 0; i < 14; i++) {
    const u = s.jr(0, 1);
    const px = fx + u * W * .30 + s.jr(-W * .07, W * .07);
    const py = fy + u * H * .045 + s.jr(-H * .022, H * .022);
    const len = gw * s.jr(1.0, 2.0) * (1 - u * .4);
    const a = .22 + s.jr(-.12, .12);
    s.daub(px - Math.cos(a) * len * .5, py - Math.sin(a) * len * .5,
      px + Math.cos(a) * len * .5, py + Math.sin(a) * len * .5,
      gw * s.jr(.4, .7),
      value(mix(VIOLET, ULTRA, s.jr(.1, .5)), .40 + s.jr(-.05, .08)),
      { alpha: s.jr(.45, .8) * (1 - u * .45), ridge: false });
  }
  c.restore();
}

// ---------------------------------------------------------------
// THE HEAD NOBODY PAINTED.
//
// `skull.js` lays cream PAPER over the face and then only calls
// `skin()` if the character has a skin colour — so half a row arrives
// with a bare paper oval where its face should be. On drawai's own
// cream page that is a white cat and it is fine. On a white-lead
// ground, in front of a green field, it is a hole: three of the six
// characters on round three's sheet had no paint on the largest shape
// they own, and no amount of work on the hair was going to survive
// that. Gothic hit the same wall and answered it the same way
// (`temperaFace`): the one shape a part hands over with BOTH an
// overshoot and a taper is the head's contour, which makes `edge` the
// only place a style can say "nobody painted this, I will".
//
// A white thing in the sun is not white paint. It is chrome where the
// light hits and cobalt violet where it turns, which is the most
// impressionist sentence in the file, so an unpainted head is the one
// place this style gets to say it without an argument.
const G = s => (s.__imp ??= { painted: false });

// A part draws in ITS OWN frame — pixels, y down, origin at the head's
// centre — so the plate's edges are wherever the part's transform put
// them. Asking `s.w` here is a question in the wrong coordinate
// system. The transform is right there; invert it.
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

// The outline a skull hands over runs from one temple round the chin
// to the other and is OPEN across the crown; closed with a straight
// chord it takes the top of the head off. Bulge the join outward
// instead and it is a dome.
function closeCrown(pts) {
  const a = pts[pts.length - 1], b = pts[0];
  const [x0, y0, x1, y1] = bbox(pts);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const gap = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (gap < (x1 - x0) * .1) return pts;
  const out = pts.slice();
  for (let i = 1; i < 12; i++) {
    const u = i / 12;
    const x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u;
    const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1;
    const bulge = Math.sin(u * Math.PI) * gap * .30;
    out.push([x + dx / d * bulge, y + dy / d * bulge]);
  }
  return out;
}

// `edge` is handed a ring and a width and nothing else — it is never
// told the colour of the shape it closes. But every part in the rig
// fills and THEN closes, so the last colour laid down IS the local
// colour of this contour. Remembering it is the only way the style can
// keep its own rule that a contour is never neutral.
let LAST = AIR, LAST_SHD = .2;

export default {
  id: 'impressionism', label: 'impressionism', era: 1874,
  // graphite is a grey, and a grey is a kind of black: nothing from
  // the underdrawing is allowed through
  underdraw: false,

  // THE CHARACTER'S BLACK. Void eyes, pupils, lashes, nostrils, teeth
  // — every place a part reaches for the drawing's own ink instead of
  // asking the medium. There was no lamp black on an impressionist
  // palette, so there is none here: this measures .14, dark enough to
  // be a hole at 90px, and up close it is ultramarine.
  ink: DARK,

  // LEAD WHITE PRIMING, and it is WHY the key is high. The brightest
  // ground on the sheet, on purpose.
  ground: [252, 250, 244],

  // A landscape wants to be a little wider than it is tall.
  panel: { w: 1.0, h: 1.16, y: .50 },

  backdrop(s, { w, h, floor }) { field(s, w, h, floor); },

  tone(s, pts, o = {}) {
    G(s).painted = true;
    const d = dens(o.style);
    // The character's darks — a void eye, the inside of a mouth — come
    // in with no colour at all, and they are answered on the value
    // scale between the air and DARK. Never on a grey one, and never
    // modelled: a hole with a light side is a bead.
    if (!o.col) {
      const local = mix(AIR, DARK, Math.min(1, d * 1.06));
      LAST = local; LAST_SHD = Math.max(.06, lum(local) - .06);
      commas(s, pts, local, { flat: true });
      s.setInk(null);
      return;
    }
    // A mass keeps its own value — a dark hair is dark — but it is
    // answered in the paintbox and it is lifted, because it is
    // outdoors at noon and nothing here is a studio brown.
    const k = keyed(o.col);
    const local = tint(k, .12 + (1 - d) * .34);
    LAST = local; LAST_SHD = Math.max(.30, Math.min(.56, lum(local) - .22));
    commas(s, pts, local, {});
    s.setInk(null);
  },

  skin(s, pts, col, o = {}) {
    G(s).painted = true;
    // Impressionist flesh is not pink, it is pink with green in it.
    // The cool note in a face is viridian, and it is why a Renoir
    // cheek looks alive and a tinted photograph does not.
    const local = tint(fleshOf(col), .12);
    LAST = local; LAST_SHD = Math.max(.40, Math.min(.62, lum(local) - .24));
    commas(s, pts, local, { flesh: true });
    s.setInk(null);
  },

  edge(s, pts, w, o = {}) {
    const g = G(s);
    // the head's contour is the only ring in the whole media interface
    // that arrives with an overshoot AND a taper, and it has to be
    // face-SIZED on its own plate — measured in the part's own units,
    // never against `s.w`
    if (!g.painted && o.over != null && o.taper != null && pts.length > 12) {
      const [hx0, hy0, hx1, hy1] = bbox(pts), b = plateBounds(s);
      if (b && hx1 - hx0 > (b[2] - b[0]) * .35 && hy1 - hy0 > (b[3] - b[1]) * .28) {
        g.painted = true;
        const local = tint(mix(WHITE, CHROME, .16), .04);
        // CALM: half the hue swing and a quarter of the value swing
        // everything else gets. A white cat modelled on the ordinary
        // flesh ramp came back wearing a lavender mask that swallowed
        // its own eyes — the paint has to stay under the drawing here,
        // because the drawing is all this character has.
        commas(s, closeCrown(pts), local, { flesh: true, calm: true, key: [.76, .95] });
        LAST = local; LAST_SHD = .66;
      }
    }
    const local = LAST || AIR;
    // The contour is the shadow colour of what it encloses, taken one
    // step below the darkest touch inside it so it still separates —
    // a dark note of the same afternoon, never a line drawn round a
    // shape, and never neutral.
    const dark = value(sat(mix(local, SKY, .44), 1.25), Math.max(.14, LAST_SHD - .16));
    // ...and on the lit side it is the light itself, a pale warm line
    // that holds the silhouette against the paper without drawing it.
    // ...and it is a PALE WARM note, not a white one. At .80 it came
    // back as a white rope run round the lit half of every mass — the
    // one thing an eaten contour is supposed to prevent.
    const glow = value(sat(mix(local, SUN, .55), 1.15), .70);
    const n = pts.length;
    if (n < 8) {
      s.setInk(dark);
      s.stroke(pts, w * .9, { alpha: .7, taper: .4, amp: o.amp ?? .6 });
      s.setInk(null);
      return;
    }
    const [x0, y0, x1, y1] = bbox(pts);
    const [cx, cy] = centroid(pts);
    const r = Math.hypot(x1 - x0, y1 - y0) * .44;
    const segs = s.ri(6, 9);
    for (let i = 0; i < segs; i++) {
      const a = Math.floor(n * i / segs);
      const b = Math.min(n, Math.floor(n * (i + 1) / segs) + 2);
      const run = pts.slice(a, b);
      if (run.length < 2) continue;
      const m = run[(run.length / 2) | 0];
      const t = facing(m[0], m[1], cx, cy, r);
      // Where the sun is full on it the contour is EATEN. This is the
      // dividend the backdrop pays: for two rounds the line had to be
      // kept all the way round because the figure was standing on bare
      // cream paper and a broken silhouette LEAKED. Standing in a
      // painted field it can dissolve into the light the way it does
      // in every canvas this style is named after.
      // ...but only where the sun is FULL on it, and only sometimes. A
      // ring broken evenly stops reading as a silhouette, and against a
      // green field a pale character then has nothing holding it at
      // all — two of six went missing at squint distance when this was
      // opened up to half the ring.
      if (t > .62 && s.chance(.3)) continue;
      const g = Math.max(0, t);
      s.setInk(t > 0 ? mix(dark, glow, Math.min(.78, t * .9)) : mix(dark, VIOLET, -t * .3));
      s.stroke(run, w * (1.15 - g * .62) * s.jr(.86, 1.1), {
        alpha: .95 - g * .5,
        taper: .38, amp: (o.amp ?? .7) * 1.05,
      });
    }
    s.setInk(null);
  },
};
