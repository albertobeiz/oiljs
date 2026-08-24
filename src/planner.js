// Layered stroke planner (Hertzmann 1998) with pigment pickup via Mixbox.
// Works directly against the PaintEngine fields: the engine's color grid is
// the simulated canvas used for error, and every planned stroke is stamped
// into it immediately. Output: ordered strokes, underpainting first.
import mixbox from 'mixbox';
import { makeRng } from './rng.js';

// Radius-decreasing layers, the painter's own order. `sal` gates a layer on
// the saliency map: the tiny brushes only come out where the image is busy
// (eyes, mouth, hair edges), which is where a viewer actually looks.
const LAYERS = [
  { r: 40, T: 0,  minLen: 3, maxLen: 8,  sal: 0 },     // underpainting
  { r: 22, T: 40, minLen: 3, maxLen: 9,  sal: 0 },
  { r: 13, T: 33, minLen: 3, maxLen: 10, sal: 0 },
  { r: 8,  T: 26, minLen: 4, maxLen: 12, sal: 0.10 },
  { r: 4.5, T: 19, minLen: 4, maxLen: 12, sal: 0.22 },
  { r: 2.6, T: 14, minLen: 4, maxLen: 10, sal: 0.40 },  // final detail
];

function blurCanvas(src, px) {
  const cv = document.createElement('canvas');
  cv.width = src.width; cv.height = src.height;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.filter = `blur(${px}px)`;
  ctx.drawImage(src, 0, 0);
  ctx.filter = 'none';
  return ctx.getImageData(0, 0, cv.width, cv.height);
}

export function planStrokes(targetCanvas, seed, engine) {
  const W = targetCanvas.width, H = targetCanvas.height;
  const g = makeRng(seed ^ 0x9e3779b9);
  const sim = engine.color;                    // engine grid == target pixels
  const strokes = [];
  const baseAngle = g.r(0.4, Math.PI - 0.4);   // coherent direction in flat areas
  const sal = saliency(targetCanvas, W, H);
  // Strokes are placed and steered from the blurred reference, but loaded
  // with paint sampled from the sharp one: mixing the brush from a blurred
  // image turns every dark contour into grey mush.
  const sharp = blurCanvas(targetCanvas, 0).data;

  for (let li = 0; li < LAYERS.length; li++) {
    const { r, T, minLen, maxLen, sal: salMin } = LAYERS[li];
    const ref = blurCanvas(targetCanvas, Math.max(1, r * 0.5)).data;

    // luminance + Sobel gradient of the blurred reference
    const lum = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) {
      lum[i] = 0.299 * ref[i * 4] + 0.587 * ref[i * 4 + 1] + 0.114 * ref[i * 4 + 2];
    }
    const gx = new Float32Array(W * H), gy = new Float32Array(W * H);
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        gx[i] = (lum[i + 1 - W] + 2 * lum[i + 1] + lum[i + 1 + W]
               - lum[i - 1 - W] - 2 * lum[i - 1] - lum[i - 1 + W]) / 8;
        gy[i] = (lum[i + W - 1] + 2 * lum[i + W] + lum[i + W + 1]
               - lum[i - W - 1] - 2 * lum[i - W] - lum[i - W + 1]) / 8;
      }
    }

    // error grid: place a stroke wherever the sim differs enough from the ref
    const step = Math.max(2, Math.round(r));
    const cells = [];
    for (let cy = 0; cy < H; cy += step) {
      for (let cx = 0; cx < W; cx += step) cells.push([cx, cy]);
    }
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(g.next() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    for (const [cx0, cy0] of cells) {
      let errSum = 0, n = 0, maxErr = -1, mx = cx0, my = cy0, salMax = 0;
      for (let y = cy0; y < Math.min(H, cy0 + step); y += 2) {
        for (let x = cx0; x < Math.min(W, cx0 + step); x += 2) {
          const p = y * W + x, i = p * 4;
          const dr = sim[i] - ref[i], dg = sim[i + 1] - ref[i + 1], db = sim[i + 2] - ref[i + 2];
          const e = Math.sqrt(dr * dr + dg * dg + db * db);
          errSum += e; n++;
          if (sal[p] > salMax) salMax = sal[p];
          if (e > maxErr) { maxErr = e; mx = x; my = y; }
        }
      }
      if (n === 0 || errSum / n <= T) continue;
      if (salMin > 0 && salMax < salMin) continue;

      const st = growStroke(mx, my, r, minLen, maxLen, ref, sharp, sim, gx, gy, W, H, g, baseAngle);
      if (!st) continue;
      const stroke = colorStroke(st, r, sim, W, H, g, li);
      if (!stroke) continue;
      engine.stampStroke(stroke, strokes.length);
      strokes.push(stroke);
    }
  }
  return strokes;
}

// Where the image is busy: local gradient energy, blurred into regions.
// Cheap stand-in for face detection — eyes, lips and hair edges score highest.
function saliency(canvas, W, H) {
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d', { willReadFrequently: true });
  c.drawImage(canvas, 0, 0);
  const d = c.getImageData(0, 0, W, H).data;
  const e = new Float32Array(W * H);
  let max = 1e-6;
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const a = i * 4, l = (a - 4), rr = (a + 4), u = a - W * 4, dn = a + W * 4;
      const v = Math.abs(d[rr] - d[l]) + Math.abs(d[rr + 1] - d[l + 1]) + Math.abs(d[rr + 2] - d[l + 2])
        + Math.abs(d[dn] - d[u]) + Math.abs(d[dn + 1] - d[u + 1]) + Math.abs(d[dn + 2] - d[u + 2]);
      e[i] = v;
      if (v > max) max = v;
    }
  }
  // spread energy into regions with a few box-blur passes
  const tmp = new Float32Array(W * H);
  for (let pass = 0; pass < 3; pass++) {
    const rad = 6;
    for (let y = 0; y < H; y++) {
      let acc = 0;
      for (let x = 0; x < W; x++) {
        acc += e[y * W + Math.min(W - 1, x + rad)] - e[y * W + Math.max(0, x - rad - 1)];
        tmp[y * W + x] = acc;
      }
    }
    for (let x = 0; x < W; x++) {
      let acc = 0;
      for (let y = 0; y < H; y++) {
        acc += tmp[Math.min(H - 1, y + rad) * W + x] - tmp[Math.max(0, y - rad - 1) * W + x];
        e[y * W + x] = acc / ((2 * rad + 1) * (2 * rad + 1));
      }
    }
  }
  let m2 = 1e-6;
  for (let i = 0; i < e.length; i++) if (e[i] > m2) m2 = e[i];
  for (let i = 0; i < e.length; i++) e[i] = Math.min(1, e[i] / (m2 * 0.55));
  return e;
}

// Hertzmann's spline stroke: walk perpendicular to the image gradient,
// stop when the canvas already matches the reference better than we would.
function growStroke(x0, y0, r, minLen, maxLen, ref, sharp, sim, gx, gy, W, H, g, baseAngle) {
  const i0 = (Math.round(y0) * W + Math.round(x0)) * 4;
  const col = [sharp[i0], sharp[i0 + 1], sharp[i0 + 2]];
  const pts = [[x0, y0]];
  let x = x0, y = y0, ldx = 0, ldy = 0;

  for (let k = 1; k < maxLen; k++) {
    const xi = Math.round(x), yi = Math.round(y);
    if (xi < 1 || yi < 1 || xi >= W - 1 || yi >= H - 1) break;
    const i = (yi * W + xi) * 4;
    const dRef = Math.sqrt(
      (ref[i] - sim[i]) ** 2 + (ref[i + 1] - sim[i + 1]) ** 2 + (ref[i + 2] - sim[i + 2]) ** 2);
    const dCol = Math.sqrt(
      (ref[i] - col[0]) ** 2 + (ref[i + 1] - col[1]) ** 2 + (ref[i + 2] - col[2]) ** 2);
    if (k > minLen && dRef < dCol) break;

    let dx = -gy[yi * W + xi], dy = gx[yi * W + xi];
    const mag = Math.hypot(dx, dy);
    if (mag < 0.6) {
      if (ldx === 0 && ldy === 0) { const a = baseAngle + g.r(-0.35, 0.35); dx = Math.cos(a); dy = Math.sin(a); }
      else { dx = ldx; dy = ldy; }
    } else { dx /= mag; dy /= mag; }
    if (dx * ldx + dy * ldy < 0) { dx = -dx; dy = -dy; }
    if (ldx || ldy) { dx = 0.65 * dx + 0.35 * ldx; dy = 0.65 * dy + 0.35 * ldy; }
    const m2 = Math.hypot(dx, dy) || 1; dx /= m2; dy /= m2;

    x += r * dx; y += r * dy;
    ldx = dx; ldy = dy;
    pts.push([x, y]);
  }
  if (pts.length < 2) {
    const a = baseAngle + g.r(-0.6, 0.6);
    pts.push([x0 + Math.cos(a) * r * 0.8, y0 + Math.sin(a) * r * 0.8]);
  }
  return { pts, col };
}

// Resample the polyline and mix pigment with what's on the canvas already:
// the brush gets dirty as it drags, so color drifts along the stroke.
function colorStroke(st, r, sim, W, H, g, layer) {
  const fine = resample(st.pts, Math.max(1.6, r * 0.45));
  if (fine.length < 2) return null;

  let brush = [st.col[0], st.col[1], st.col[2]];
  const colors = [];
  // A loaded detail brush stays clean; a big one drags half the canvas with
  // it. Without this the last, finest layer — the one carrying the drawing's
  // contours — arrives pre-greyed and the picture never sharpens.
  const dirt = Math.min(1, r / 14);
  const pickup = (0.04 + g.next() * 0.06) * dirt;

  for (let s = 0; s < fine.length; s++) {
    const [x, y] = fine[s];
    const xi = Math.max(0, Math.min(W - 1, Math.round(x)));
    const yi = Math.max(0, Math.min(H - 1, Math.round(y)));
    const i = (yi * W + xi) * 4;
    const under = [sim[i], sim[i + 1], sim[i + 2]];
    const t = s / fine.length;
    colors.push(mixbox.lerp(brush, under, (0.06 + 0.16 * t) * dirt));
    brush = mixbox.lerp(brush, under, pickup);
  }
  return { pts: fine, r, colors, layer };
}

function resample(ctrl, spacing) {
  if (ctrl.length === 2) {
    const [a, b] = ctrl;
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.max(2, Math.round(d / spacing) + 1);
    const out = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
    return out;
  }
  const pts = [ctrl[0], ...ctrl, ctrl[ctrl.length - 1]];
  const out = [];
  let carry = 0;
  for (let i = 1; i < pts.length - 2; i++) {
    const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2];
    const segLen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const steps = Math.max(2, Math.ceil(segLen / spacing) * 2);
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      carry += segLen / steps;
      if (carry < spacing && out.length > 0) continue;
      carry = 0;
      const t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  const last = ctrl[ctrl.length - 1];
  out.push([last[0], last[1]]);
  return out;
}
