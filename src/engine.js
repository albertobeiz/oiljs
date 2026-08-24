// 2.5D height-field paint engine (IMPaSTo/Stuyck style, simplified).
// Paint lives in two continuous grid fields — height (volume) and color —
// so strokes merge into paste: each stamp deposits volume, presses what's
// underneath, raises a bead along the stroke edges and carves bristle
// grooves as parallel height striations. One instance is the single source
// of truth: the planner reads it for error/pickup, the renderer draws it.
import { makeRng } from './rng.js';

const SETTLE_EVERY = 24;      // strokes between full-surface settling passes

// Settling scratch, shared by every engine of the same size. A gallery holds
// nine canvases at once and this is the bulk of an engine's memory, but the
// pass is synchronous and never reentrant, so one set is enough.
const scratch = new Map();
function scratchFor(W, H) {
  const key = W * 65536 + H;
  let s = scratch.get(key);
  if (!s) {
    s = { dh: new Float32Array(W * H), di: new Float32Array(W * H), dc: new Float32Array(W * H * 3) };
    scratch.set(key, s);
  }
  return s;
}

export class PaintEngine {
  constructor(W, H, seed) {
    this.W = W; this.H = H; this.seed = seed;
    this.height = new Float32Array(W * H);        // paint thickness, ~0..9
    this.color = new Uint8ClampedArray(W * H * 4);
    this.weave = new Float32Array(W * H);         // bare canvas relief
    // net volume change, gross inflow, and the pigment that inflow carries,
    // kept apart so the mix stays exact for a cell that both sends and
    // receives in the same pass
    Object.assign(this, scratchFor(W, H));
    const g = makeRng(seed ^ 0x77aa11);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        // Two crossed threads plus grain. Kept low: the surface normal is
        // rebuilt per pixel at full resolution, so a weave that looked right
        // as a bump map reads as graph paper once the light hits it directly.
        const w = Math.sin(x * 1.02) * Math.sin(y * 0.21) + Math.sin(y * 1.02) * Math.sin(x * 0.21);
        this.weave[y * W + x] = 0.30 + 0.07 * w + g.next() * 0.06;
      }
    }
    this.reset();
  }

  reset() {
    this.since = 0;
    this.height.set(this.weave);
    const c = this.color;
    for (let i = 0; i < this.W * this.H; i++) {
      const w = this.weave[i];
      const v = 215 + w * 28;
      c[i * 4] = v; c[i * 4 + 1] = v - 6; c[i * 4 + 2] = v - 20; c[i * 4 + 3] = 255;
    }
  }

  // Stamp a full stroke: pts are fine samples, colors one RGB per sample.
  stampStroke(st, idx) {
    const g = makeRng(this.seed ^ Math.imul(idx + 1, 2654435761));
    const rad = st.r;
    // per-stroke bristle groove pattern across the brush width (smoothed noise)
    const n = Math.max(3, Math.ceil(rad * 2) + 1);
    const raw = [];
    for (let i = 0; i < n; i++) raw.push(0.80 + g.next() * 0.45);
    const strands = [];
    for (let i = 0; i < n; i++) {
      strands.push((raw[Math.max(0, i - 1)] + raw[i] * 2 + raw[Math.min(n - 1, i + 1)]) / 4);
    }
    const pts = st.pts, S = pts.length;
    // small brushes carry less paint, so detail strokes sit on the paste
    // instead of burying it under fresh relief
    const deposit = (0.5 + g.next() * 0.25) * Math.min(1, 0.42 + rad / 26);
    const press = 0.16 + g.next() * 0.12;

    for (let s = 0; s < S; s++) {
      const [x, y] = pts[s];
      const a = Math.max(0, s - 1), b = Math.min(S - 1, s + 1);
      let dx = pts[b][0] - pts[a][0], dy = pts[b][1] - pts[a][1];
      const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
      const t = s / Math.max(1, S - 1);
      const taper = Math.min(1, (s + 0.6) / 2.0, (S - 0.4 - s) / 2.0);
      const load = 1 - (0.25 + g.next() * 0.1) * t;   // brush runs dry
      const col = st.colors[Math.min(s, st.colors.length - 1)];
      this.stampDisc(x, y, rad, dx, dy, col, strands,
        deposit * Math.max(0.15, taper) * Math.max(0.35, load), press);
    }
    // Paste settles with time, not once per stroke, so the whole surface
    // relaxes on a fixed cadence. Doing it per stroke was both wrong — an
    // early stroke would slump dozens of times and a late one never — and
    // far more expensive, since big strokes cover most of the canvas.
    if (++this.since >= SETTLE_EVERY) {
      this.since = 0;
      this.settle(1, 1, this.W - 2, this.H - 2, 1);
    }
  }

  stampDisc(cx, cy, rad, dx, dy, col, strands, deposit, press) {
    const { W, H, height, color } = this;
    const x0 = Math.max(0, Math.floor(cx - rad)), x1 = Math.min(W - 1, Math.ceil(cx + rad));
    const y0 = Math.max(0, Math.floor(cy - rad)), y1 = Math.min(H - 1, Math.ceil(cy + rad));
    const r2 = rad * rad;
    const cr = col[0], cg = col[1], cb = col[2];
    const nS = strands.length;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const ox = x - cx, oy = y - cy;
        const d2 = ox * ox + oy * oy;
        if (d2 > r2) continue;
        const q = 1 - d2 / r2;                 // 0 rim .. 1 center
        const dome = Math.sqrt(q);
        const lat = -ox * dy + oy * dx;        // perpendicular offset in px
        let si = Math.round(lat + rad);
        if (si < 0) si = 0; else if (si >= nS) si = nS - 1;
        const str = strands[si];
        const i = y * W + x;

        // ragged bristle edge: weak strands don't reach the rim
        const cover = q - (1 - str) * 0.18;
        if (cover <= 0) continue;

        // color: deposit is opaque paste, grooves keep a hint of what's below
        const a = Math.min(0.97, (0.68 + 0.32 * dome) * 0.97);
        const i4 = i * 4;
        color[i4] = color[i4] * (1 - a) + cr * a;
        color[i4 + 1] = color[i4 + 1] * (1 - a) + cg * a;
        color[i4 + 2] = color[i4 + 2] * (1 - a) + cb * a;

        // height: press existing paint, then deposit with striation;
        // saturating add keeps total volume bounded
        let h = height[i];
        h -= press * dome * Math.max(0, h - 1.2);
        h += deposit * dome * str * (1 - h / 9);
        height[i] = h;
      }
    }
  }

  // Viscoplastic settling over a region — the reason the paste behaves like
  // paint and not like clay. Oil paint is a Bingham plastic: it holds its
  // shape until the local slope exceeds a yield stress, then flows. Paint
  // flows down-slope only past YIELD, so peaks slump and ridges soften while
  // brush ridges survive, and the pigment travels with the volume it rides on
  // (conservative advection: whatever a cell loses, its neighbour gains).
  settle(x0, y0, x1, y1, iters = 1) {
    const { W, H, height, color, dh, di, dc } = this;
    x0 = Math.max(1, x0); y0 = Math.max(1, y0);
    x1 = Math.min(W - 2, x1); y1 = Math.min(H - 2, y1);
    if (x1 < x0 || y1 < y0) return;
    const YIELD = 0.45;    // slope the paste supports before it flows
    const RATE = 0.22;     // how much of the excess moves per pass
    const FLOOR = 0.05;    // paint never fully leaves a cell (canvas tooth)

    for (let it = 0; it < iters; it++) {
      for (let y = y0; y <= y1; y++) {
        const row = y * W;
        for (let x = x0; x <= x1; x++) {
          dh[row + x] = 0; di[row + x] = 0;
          const j = (row + x) * 3;
          dc[j] = dc[j + 1] = dc[j + 2] = 0;
        }
      }
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const i = y * W + x;
          const h = height[i];
          const avail = h - FLOOR;
          if (avail <= 0) continue;
          // excess over the yield slope, per neighbour
          const eL = Math.max(0, h - height[i - 1] - YIELD);
          const eR = Math.max(0, h - height[i + 1] - YIELD);
          const eU = Math.max(0, h - height[i - W] - YIELD);
          const eD = Math.max(0, h - height[i + W] - YIELD);
          const tot = eL + eR + eU + eD;
          if (tot <= 0) continue;
          // never move more than half the excess, and never below the floor
          let out = Math.min(tot * RATE, avail * 0.5);
          const k = out / tot;
          const i4 = i * 4;
          const cr = color[i4], cg = color[i4 + 1], cb = color[i4 + 2];
          dh[i] -= out;
          for (const [e, n] of [[eL, i - 1], [eR, i + 1], [eU, i - W], [eD, i + W]]) {
            if (e <= 0) continue;
            const q = e * k;
            dh[n] += q; di[n] += q;
            const n3 = n * 3;
            dc[n3] += q * cr; dc[n3 + 1] += q * cg; dc[n3 + 2] += q * cb;
          }
        }
      }
      // apply: the cell keeps (h - outflow) of its own paint and gains the
      // incoming volume, so the new colour is their volume-weighted mix
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const i = y * W + x;
          const d = dh[i];
          if (d === 0) continue;
          const h = height[i];
          const nh = h + d;
          height[i] = nh;
          const inflow = di[i];
          if (inflow > 1e-6 && nh > 1e-4) {
            const kept = h - (inflow - d);      // own paint left behind
            const i3 = i * 3, i4 = i * 4;
            const total = kept + inflow;
            if (total > 1e-6) {
              color[i4] = (color[i4] * kept + dc[i3]) / total;
              color[i4 + 1] = (color[i4 + 1] * kept + dc[i3 + 1]) / total;
              color[i4 + 2] = (color[i4 + 2] * kept + dc[i3 + 2]) / total;
            }
          }
        }
      }
    }
  }
}
