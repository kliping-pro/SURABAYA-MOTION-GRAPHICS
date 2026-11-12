// Urban Sketch · Pen & Wash window S3 (11 s): Kota Lama, Surabaya (STYLE: styles/urban-sketch/STYLE.md).
// One sketchbook spread: Gedung Cerutu, Museum Bank Indonesia, Rumah Abu Han, the morning sun. Ink is drawn in stroke
// order, the wash arrives after it (colour as arrival), the page frays at its edges, notes are handwritten.
// The window opens and closes on the sun: a paper-white disc in a yellow ring, the map's station dot. ?fmt=reels|tv
import { INK, PAPER, clamp, lerp, ss, rng, fbm, rgba, hex, mix3, ellipse, rough, penStroke, drawPen, wash, dab, handwrite } from './engine.js';

const Q = new URLSearchParams(location.search);
const TV = (Q.get('fmt') || (innerWidth > innerHeight ? 'tv' : 'reels')) === 'tv';
const DUR = 11; window.DUR = DUR;
const W = innerWidth, H = innerHeight, VW = 1080 * W / H;
const PW = 3600, PH = 2000, GROUND = 1520;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const SUN = [3160, 330], SUN_R = 92;
const C = { lime: hex('#d8c6a0'), cream: hex('#eadcb8'), shade: hex('#8f87a3'), roof: hex('#9a6b52'), dome: hex('#7d8496'), red: hex('#b8483e'), green: hex('#7f9a72'), sky: hex('#9fbcd6'), sun: hex('#e2b04a'), road: hex('#c9b99a'), tree: hex('#7fa04a') };

// ------------------------------------------------------------------ the drawing: strokes (with draw times) and washes (with arrival sources)
const STROKES = [], WASHES = [], NOTES = [];
let sd = 1;
function S(pts, t0, dur, o = {}) { STROKES.push({ st: penStroke(pts, { w: o.w ?? 2.6, wob: o.wob ?? 1.1, over: o.over ?? 5, gap: o.gap ?? .35, seed: sd++, smooth: o.smooth ?? false }), t0, dur }); }
function box(x0, y0, x1, y1, t0, dt, o) { S([[x0, y1], [x0, y0], [x1, y0]], t0, dt, o); S([[x1, y0], [x1, y1]], t0 + dt * .6, dt * .5, o); }
function Wsh(poly, col, src, o = {}) { WASHES.push({ poly, col, src, a: o.a ?? .55, seed: sd++, dx: o.dx ?? 3, dy: o.dy ?? 2 }); }
// windows: a few marks instead of a grid
function windows(x0, x1, y, h, n, t0, dt, arch = false) {
  for (let i = 0; i < n; i++) { const r = rng(sd + i * 7)(); if (r < .18) continue;
    const cx = lerp(x0, x1, (i + .5) / n), w = (x1 - x0) / n * .42;
    const pts = arch ? [[cx - w / 2, y + h], [cx - w / 2, y + h * .3], [cx - w / 4, y + h * .05], [cx + w / 4, y + h * .05], [cx + w / 2, y + h * .3], [cx + w / 2, y + h]] : [[cx - w / 2, y + h], [cx - w / 2, y], [cx + w / 2, y], [cx + w / 2, y + h * .9]];
    S(pts, t0 + i * dt, dt * 1.6, { w: 2.0, smooth: arch }); }
}
// 1 · Gedung Cerutu: an office block with its cigar-shaped corner tower and dome
(function cerutu() {
  const t = .9, x0 = 260, x1 = 900, tx = 1030, trw = 150, top = 560;
  S([[x0, GROUND], [x0, 1060], [x1, 1060]], t, .5); S([[x0 - 20, 1060], [x1 + 10, 1040]], t + .3, .3, { w: 3 });
  S([[x0, 1270], [x1, 1265]], t + .5, .3, { w: 2 }); windows(x0 + 20, x1 - 20, 1100, 120, 7, t + .6, .06, true); windows(x0 + 20, x1 - 20, 1310, 150, 7, t + .9, .06, true);
  // the tower: a tall cylinder, ribs, narrowing to the dome
  const tl = tx - trw / 2, tr = tx + trw / 2;
  S([[tl, GROUND], [tl, 900], [tl + 8, 700], [tl + 22, top + 60]], t + .4, .45, { smooth: true }); S([[tr, GROUND], [tr, 900], [tr - 8, 700], [tr - 22, top + 60]], t + .55, .45, { smooth: true });
  for (let k = 1; k < 4; k++) { const x = lerp(tl + 6, tr - 6, k / 4); S([[x, 1480], [x + (k - 2) * 3, 880], [lerp(tl + 22, tr - 22, k / 4), top + 70]], t + .8 + k * .07, .35, { w: 1.6, smooth: true }); }
  const dome = [...Array(13)].map((_, i) => { const a = Math.PI + i / 12 * Math.PI; return [tx + Math.cos(a) * (trw / 2 - 20), top + 60 + Math.sin(a) * 120]; });
  S(dome, t + 1.2, .45, { smooth: true, w: 2.8 }); S([[tx, top - 62], [tx, top - 120]], t + 1.6, .15, { w: 2.2 });
  for (const y of [900, 1150, 1380]) S([[tl, y], [tr, y - 6]], t + 1.3, .2, { w: 1.8 });
  S([[x1, 1060], [tl, 1060]], t + 1.0, .2);
  S([[x0 - 40, GROUND], [tr + 160, GROUND + 4]], t + 1.7, .4, { w: 3 });
  const src = [tx, 1100, 3.7, 520];
  Wsh([[x0, GROUND], [x0, 1060], [x1, 1060], [x1, GROUND]], C.lime, src);
  Wsh([[tl, GROUND], [tl, 900], [tl + 22, top + 60], [tr - 22, top + 60], [tr, 900], [tr, GROUND]], C.cream, src);
  Wsh([[tr - 50, GROUND], [tr, GROUND], [tr, 900], [tr - 22, top + 60], [tr - 46, top + 80]], C.shade, src, { a: .4 });
  Wsh(dome, C.dome, src, { a: .6 });
  NOTES.push({ s: 'Gedung Cerutu', x: x0 + 20, y: GROUND + 70, t: 3.2, size: 54 });
})();
// 2 · Museum Bank Indonesia: a symmetric front, a central bay under a pediment, paired columns
(function bank() {
  const t = 2.6, x0 = 1440, x1 = 2440, cx = (x0 + x1) / 2, y0 = 1020;
  S([[x0, GROUND], [x0, y0], [x1, y0], [x1, GROUND]], t, .7);
  S([[x0 - 15, y0], [x1 + 15, y0 - 4]], t + .4, .3, { w: 3.2 }); S([[x0, 1250], [x1, 1248]], t + .5, .3, { w: 2 });
  S([[cx - 170, y0], [cx, 860], [cx + 170, y0]], t + .7, .4, { w: 2.8 });
  S([[cx - 170, GROUND], [cx - 170, y0]], t + .8, .2); S([[cx + 170, GROUND], [cx + 170, y0]], t + .85, .2);
  for (const dx of [-120, -70, 70, 120]) S([[cx + dx, GROUND - 10], [cx + dx, y0 + 30]], t + 1.0 + Math.abs(dx) / 1000, .25, { w: 2.2 });
  windows(x0 + 20, cx - 190, 1060, 140, 5, t + 1.1, .05); windows(cx + 190, x1 - 20, 1060, 140, 5, t + 1.2, .05);
  windows(x0 + 20, cx - 190, 1300, 160, 5, t + 1.4, .05, true); windows(cx + 190, x1 - 20, 1300, 160, 5, t + 1.5, .05, true);
  for (const x of [x0 + 40, x1 - 40]) S([[x - 30, y0], [x - 30, y0 - 70], [x, y0 - 110], [x + 30, y0 - 70], [x + 30, y0]], t + 1.6, .25, { smooth: true, w: 2.2 });
  S([[cx - 60, GROUND], [cx - 60, 1340], [cx + 60, 1340], [cx + 60, GROUND]], t + 1.8, .25, { w: 2.2 });
  S([[x0 - 80, GROUND + 6], [x1 + 80, GROUND]], t + 1.9, .4, { w: 3 });
  const src = [cx, 1200, 6.0, 640];
  Wsh([[x0, GROUND], [x0, y0], [x1, y0], [x1, GROUND]], C.cream, src);
  Wsh([[cx - 170, y0], [cx, 860], [cx + 170, y0]], C.lime, src);
  Wsh([[x1 - 200, GROUND], [x1, GROUND], [x1, y0], [x1 - 200, y0]], C.shade, src, { a: .35 });
  Wsh([[cx - 60, GROUND], [cx - 60, 1340], [cx + 60, 1340], [cx + 60, GROUND]], C.roof, src, { a: .5 });
  NOTES.push({ s: 'Museum Bank Indonesia', x: x0 + 20, y: GROUND + 70, t: 5.6, size: 54 });
})();
// 3 · Rumah Abu Han: a low house, a curved roof with swallow-tail ends, red pillars, two round lanterns
const LANTERNS = [[2840, 1250], [3220, 1250]];
(function han() {
  const t = 4.4, x0 = 2700, x1 = 3360, y0 = 1180;
  S([[x0 - 80, y0 + 10], [x0 + 40, y0 - 30], [x1 - 40, y0 - 30], [x1 + 80, y0 + 10]], t, .6, { smooth: true, w: 3 });
  S([[x0 - 80, y0 + 10], [x0 - 110, y0 - 50]], t + .5, .12, { w: 2.6 }); S([[x1 + 80, y0 + 10], [x1 + 110, y0 - 50]], t + .55, .12, { w: 2.6 });
  S([[x0 + 40, y0 - 30], [x0 + 70, y0 - 120], [x1 - 70, y0 - 120], [x1 - 40, y0 - 30]], t + .6, .45, { smooth: true });
  S([[x0 + 40, y0 - 120], [x0 + 10, y0 - 175]], t + 1.0, .12); S([[x1 - 40, y0 - 120], [x1 - 10, y0 - 175]], t + 1.05, .12);
  for (const x of [x0 + 20, x0 + 180, x1 - 180, x1 - 20]) S([[x, GROUND], [x, y0 + 10]], t + 1.1, .2, { w: 2.4 });
  S([[x0 + 260, GROUND], [x0 + 260, 1320], [x1 - 260, 1320], [x1 - 260, GROUND]], t + 1.4, .3, { w: 2.2 }); S([[(x0 + x1) / 2, GROUND], [(x0 + x1) / 2, 1320]], t + 1.6, .1, { w: 1.6 });
  for (const [lx, ly] of LANTERNS) { S([[lx, y0 + 10], [lx, ly - 46]], t + 1.6, .1, { w: 1.4 }); S([...ellipse(lx, ly, 36, 46, 18), ...ellipse(lx, ly, 36, 46, 18).slice(0, 2)], t + 1.7, .25, { smooth: true, w: 2.2 }); }
  S([[x0 - 120, GROUND], [x1 + 140, GROUND + 6]], t + 1.9, .4, { w: 3 });
  const src = [(x0 + x1) / 2, 1250, 7.2, 560];
  Wsh([[x0 - 80, y0 + 10], [x0 + 40, y0 - 30], [x0 + 70, y0 - 120], [x1 - 70, y0 - 120], [x1 - 40, y0 - 30], [x1 + 80, y0 + 10]], C.green, src, { a: .6 });
  Wsh([[x0 + 10, GROUND], [x0 + 10, y0 + 10], [x1 - 10, y0 + 10], [x1 - 10, GROUND]], C.cream, src, { a: .45 });
  for (const x of [x0 + 20, x0 + 180, x1 - 180, x1 - 20]) Wsh([[x - 14, GROUND], [x - 14, y0 + 10], [x + 14, y0 + 10], [x + 14, GROUND]], C.red, src, { a: .7 });
  Wsh([[x0 + 260, GROUND], [x0 + 260, 1320], [x1 - 260, 1320], [x1 - 260, GROUND]], C.red, src, { a: .65 });
  for (const [lx, ly] of LANTERNS) Wsh(ellipse(lx, ly, 34, 44, 18), C.red, [lx, ly, 7.6, 120], { a: .85 });
  NOTES.push({ s: 'Rumah Abu Han', x: x0, y: GROUND + 70, t: 6.8, size: 54 });
})();
// the sky and the street
WASHES.push({ poly: [[120, 140], [3480, 120], [3500, 860], [2600, 980], [1400, 900], [140, 980]], col: C.sky, src: [2400, 500, 4.6, 2600], a: .32, seed: 777, dx: 0, dy: 0 });
WASHES.push({ poly: [[100, GROUND + 4], [3500, GROUND + 4], [3460, GROUND + 140], [140, GROUND + 160]], col: C.road, src: [1800, 1600, 4.2, 2200], a: .35, seed: 778, dx: 0, dy: 0 });
NOTES.push({ s: 'Kota Lama, Surabaya — pagi', x: 190, y: 250, t: .5, size: 70, font: 'Reenie Beanie' });
NOTES.push({ s: 'Kota Lama · Old Town', x: 190, y: 320, t: 1.0, size: 44, font: 'Reenie Beanie' });

// ------------------------------------------------------------------ prebaked layers
function paper() {
  const s = 4, c = document.createElement('canvas'); c.width = PW / s; c.height = PH / s; const g = c.getContext('2d'), im = g.createImageData(c.width, c.height);
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4, m = fbm(x * .012, y * .012, 3, 3) * .045 + fbm(x * .2, y * .2, 9, 2) * .03, e = edge(x * s, y * s);
    const v = 1 - m; im.data[i] = PAPER[0] * v; im.data[i + 1] = PAPER[1] * v; im.data[i + 2] = PAPER[2] * v; im.data[i + 3] = 255 * e; }
  g.putImageData(im, 0, 0); return c;
}
function edge(x, y) { const d = Math.min(x - 70, y - 70, PW - 70 - x, PH - 70 - y) + (fbm(x * .01, y * .01, 5, 3) - .5) * 120; return clamp(d / 60); }
let PAPERC;

// ------------------------------------------------------------------ camera (page px; z = screen units per page px, frame VW x 1080)
const sunCam = z => ({ x: SUN[0], y: SUN[1], z });
const zS = TV ? 1 : 1;
const DOTZ = 27 / SUN_R;                                   // the sun's ring the size of the map's station dot (r ~ 27 units)
function camera(t) {
  const a = sunCam(DOTZ * 1.0), wideZ = TV ? .5 : .36;
  const K = [
    [0, a], [.45, { x: SUN[0] - 120, y: SUN[1] + 80, z: DOTZ * .8 }], [1.6, { x: TV ? 760 : 830, y: 1060, z: TV ? .72 : .48 }], [3.2, { x: TV ? 780 : 840, y: 1060, z: TV ? .8 : .52 }],
    [4.3, { x: 1200, y: 1100, z: TV ? .7 : .5 }], [6.2, { x: 1950, y: 1150, z: TV ? .7 : .5 }], [7.6, { x: 3030, y: 1180, z: TV ? .74 : .52 }],
    [8.9, { x: 3060, y: 800, z: TV ? .6 : .48 }], [9.5, { x: SUN[0], y: SUN[1] + 60, z: .9 }], [10.8, sunCam(DOTZ)], [11, sunCam(DOTZ)],
  ];
  let i = 1; while (i < K.length - 1 && t > K[i][0]) i++;
  const [ta, A] = K[i - 1], [tb, B] = K[i], u = eio(seg(t, ta, tb));
  return { x: lerp(A.x, B.x, u), y: lerp(A.y, B.y, u), z: Math.exp(lerp(Math.log(A.z), Math.log(B.z), u)) };
}

// ------------------------------------------------------------------ frame
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
let REG = [];
function arrived(src, t) { return t < src[2] ? 0 : Math.min(src[3], (t - src[2]) * src[3] / .9) ; }
function render(t) {
  REG = [];
  const cam = camera(t), Sx = H / 1080;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#d9cfb6'; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(Sx * cam.z, 0, 0, Sx * cam.z, Sx * (VW / 2 - cam.x * cam.z), Sx * (540 - cam.y * cam.z));
  ctx.drawImage(PAPERC, 0, 0, PW, PH);
  // washes: each revealed by its own arrival front (a rough growing disc from its source), multiplied onto the paper
  for (const w of WASHES) {
    const r = arrived(w.src, t); if (r <= 0) continue;
    ctx.save(); ctx.beginPath(); const blob = rough(ellipse(w.src[0], w.src[1], r * 1.6, r * 1.1, 40), Math.min(60, r * .2), w.seed, 14, .01);
    blob.forEach((p, k) => ctx[k ? 'lineTo' : 'moveTo'](p[0], p[1])); ctx.closePath(); ctx.clip();
    wash(ctx, w.poly, w.col, { a: w.a, j: 5, layers: 3, edge: .32, seed: w.seed, dx: w.dx, dy: w.dy });
    ctx.restore();
  }
  // the sun: a ring of yellow wash around a paper-white disc, ink circle (always there; it opens and closes the window)
  ctx.save(); const ring = [...ellipse(SUN[0], SUN[1], SUN_R + 34, SUN_R + 34, 40)]; wash(ctx, ring, C.sun, { a: .75, j: 3, layers: 3, edge: .4, seed: 91 });
  ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = rgba(PAPER, 1); ctx.beginPath(); ctx.arc(SUN[0], SUN[1], SUN_R, 0, 7); ctx.fill(); ctx.restore();
  drawPen(ctx, SUNPEN, 1);
  // ink in stroke order
  for (const s of STROKES) { const p = seg(t, s.t0, s.t0 + s.dur); if (p > 0) drawPen(ctx, s.st, p); }
  // handwriting
  for (const n of NOTES) { const p = seg(t, n.t, n.t + n.s.length * .045); if (p <= 0) continue; handwrite(ctx, n.s, n.x, n.y, n.size, p, { font: n.font ?? 'Caveat', weight: 500 });
    if (p >= 1) { ctx.font = `500 ${n.size}px ${n.font ?? 'Caveat'}`; const w = ctx.measureText(n.s).width, m = ctx.getTransform(); const q0 = m.transformPoint({ x: n.x, y: n.y - n.size * .8 }), q1 = m.transformPoint({ x: n.x + w, y: n.y + n.size * .2 });
      if (q0.x >= 0 && q0.y >= 0 && q1.x <= W && q1.y <= H) REG.push({ id: n.s, text: n.s, x0: q0.x, y0: q0.y, x1: q1.x, y1: q1.y }); } }
}
const SUNPEN = penStroke([...ellipse(SUN[0], SUN[1], SUN_R, SUN_R, 30), ...ellipse(SUN[0], SUN[1], SUN_R, SUN_R, 30).slice(0, 3)], { w: 2.8, wob: .8, seed: 92, smooth: true, over: 6 });
window.render = render; window.TEXTS = () => REG.slice();
window.EV = [...STROKES.map(s => ({ t: +s.t0.toFixed(3), type: 'pen', dur: +s.dur.toFixed(2) })), ...WASHES.map(w => ({ t: w.src[2], type: 'wash' })), ...NOTES.map(n => ({ t: n.t, type: 'write' }))];
Promise.all(['500 40px Caveat', '40px "Reenie Beanie"'].map(f => document.fonts.load(f, 'Ab'))).then(() => { PAPERC = paper(); render(0); window.READY = true; });
