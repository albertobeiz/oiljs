// Render settings and the swappable hand, vendored from drawai.
// drawai's makePart (canvas -> THREE textured plane) is deliberately
// absent: oiljs draws every part flat onto one shared canvas, so this
// copy is three.js-free and carries only what parts actually read.
//
// U is chosen so parts draw at cyber-crowd's native pixel scale
// (face scale s ≈ 65-90 px) — the granulation constants port as-is.
import { Sketch } from './sketch.js';

// Render settings. `U` is only RESOLUTION: every part sizes itself in
// world units (px / U) and the rig places bones the same way, so a
// smaller U yields the same layout drawn on smaller canvases. The
// crowd scene turns both of these down — 35 faces at editor quality
// would cost hundreds of megabytes of canvas.
export let U = 160;              // canvas px per world unit
export let BOIL_FRAMES = 3;

export function setRender({ u, frames } = {}) {
  if (u) U = u;
  if (frames) BOIL_FRAMES = frames;
}

// The HAND. A part describes marks; who makes them is a scene's
// choice — `src/brush/bsketch.js` is a second hand built on p5.brush
// and it is chosen here, once, before any part is built. A hand may
// need a moment to settle before its canvas is read (the brush one
// blits a shared plate), so it is asked for `done()` afterwards.
let makeSketch = (w, h) => new Sketch(w, h);

export function setHand(fn) { makeSketch = fn || ((w, h) => new Sketch(w, h)); }

// …and anything else a scene draws by hand — an emote, a floor line —
// should come off the same one, or half the page is in another medium.
export function hand(w, h) { return makeSketch(w, h); }
