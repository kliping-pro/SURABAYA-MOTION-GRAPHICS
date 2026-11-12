// Isometric Infographic window S4 v2 (12 s): Monumen Kapal Selam on the Kalimas (STYLE: styles/iso-infographic).
// Built on the library's iso engine (engine.js: depth-sorted three-tone solids, horizontal cylinders, pins, insets, cut
// lines, hatch, Isotype icons, billboard people). A floating board with strata at its edges: the river, the park, the
// museum, the submarine KRI Pasopati 410 on its plinth as a real cylindrical hull in 16 sections.
// 0–2.6 scale reveal from the sail · 2.6 cut line · 3.4 the upper skin lifts, the board greys (focus + context), hatched
// cut rims, the compartments with their machinery · 4.8 pins · 6.3 inset of the torpedo room · 7.8 the 16 sections
// counted · 10.4 the skin returns, colour comes back. No closing dot. ?fmt=reels|tv
import { Iso, PAL, tri, mix, hex, clamp, lerp, seg, ss, eo, eio, back, TAU, pin, inset, cutLine, hatch, person, haloText, FONT } from './engine.js';
const Q = new URLSearchParams(location.search);
const TV = (Q.get('fmt') || (innerWidth > innerHeight ? 'tv' : 'reels')) === 'tv';
const DUR = 12; window.DUR = DUR;
const W = innerWidth, H = innerHeight, VW = 1080 * W / H;
const T = { cut: 2.6, open: 3.4, open1: 4.6, pins: 4.8, inset: 6.3, sections: 7.8, close: 10.4, close1: 11.4 };
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
const iso = new Iso(g, VW, 1080);
// ------------------------------------------------------------------ the model (metres)
const SUB = { x0: -38, x1: 38, y: 0, r: 3.3, plinth: 2.4 }, SEC = 16, SL = (SUB.x1 - SUB.x0) / SEC, ZC = SUB.plinth + SUB.r;
const rAt = i => SUB.r * Math.pow(Math.sin(Math.PI * clamp(((i + .5) / SEC) * .9 + .05)), .42);
const HULL = ['#566472', '#3F4B57', '#2C353E'], REDS = PAL.red;
const COMP = [ // [from, to, ID, EN, hue] — bow at +x (simplified layout of a Whiskey-class boat)
  [13, 16, 'Ruang torpedo depan', 'Forward torpedo room', '#E9BE5C'],
  [9, 13, 'Ruang awak & baterai', 'Crew & batteries', '#7BA75F'],
  [7, 9, 'Ruang kendali · periskop', 'Control room · periscope', '#2CACE2'],
  [3, 7, 'Mesin diesel', 'Diesel engines', '#CF5140'],
  [0, 3, 'Motor listrik · torpedo belakang', 'Electric motors · aft torpedoes', '#8E7CC3'],
];
const secX = i => SUB.x0 + i * SL;
function hullSection(i, lift, alpha, lower) {    // a 16-gon cylinder section along x; lower: only the trough (open hull)
  const r = rAt(i), x = secX(i), n = 18;
  iso.add(x + SL / 2 + SUB.y + ZC + (lower ? -2 : 0), () => {
    const A0 = iso.alpha; iso.alpha = alpha;
    const ring = []; for (let k = 0; k <= n; k++) { const a = lower ? Math.PI + k / n * Math.PI : k / n * TAU; ring.push([Math.cos(a) * r, Math.sin(a) * r, a]); }
    const faces = [];
    for (let k = 0; k < n; k++) { const p = ring[k], q = ring[k + 1]; const f = [[x, SUB.y + p[0], ZC + lift + p[1]], [x + SL - .06, SUB.y + p[0], ZC + lift + p[1]], [x + SL - .06, SUB.y + q[0], ZC + lift + q[1]], [x, SUB.y + q[0], ZC + lift + q[1]]];
      const m = (p[2] + q[2]) / 2, out = [0, Math.cos(m), Math.sin(m)]; faces.push([out[1] + out[2], f, out, Math.sin(m)]); }
    faces.sort((a, b) => a[0] - b[0]);
    for (const [, f, out, sz] of faces) {
      const t3 = sz < -.35 ? REDS : HULL;
      if (lower) { if (!iso.face3(f, t3, { out })) iso.face3(f, t3, { both: true, color: hex(mix('#EDE3D0', '#B9B09E', .5 + .5 * out[2])) }); continue; }
      else iso.face3(f, t3, { out });
    }
    iso.alpha = A0;
  });
}
function plate(x, y, w, d, z, t3, o = {}) { iso.box(x, y, z, w, d, .3, t3, o); }
function tree(x, y, s = 1) { iso.cyl(x, y, 0, .35 * s, 2.2 * s, PAL.soil); iso.sphere(x, y, 3.4 * s, 2.0 * s, PAL.green); }
function lamp(x, y) { iso.cyl(x, y, 0, .15, 4.2, PAL.stone, { n: 8 }); iso.box(x - .45, y - .45, 4.2, .9, .9, .6, PAL.mustard); }
// ------------------------------------------------------------------ camera
function camAt(t) {
  const sail = { x: secX(8), y: 0, z: ZC + 6, k: TV ? 55 : 34 }, wide = { x: 2, y: 4, z: 3, k: TV ? 10.2 : 6.0 }, mid = { x: 0, y: 0, z: ZC, k: TV ? 19 : 8.6 };
  const L = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: lerp(a.z, b.z, u), k: Math.exp(lerp(Math.log(a.k), Math.log(b.k), u)) });
  if (t < 2.6) return L(sail, wide, eio(seg(t, .2, 2.6)));
  if (t < 4.6) return L(wide, mid, eio(seg(t, 2.6, 4.6)));
  if (t < 10.4) { const c = L(mid, mid, 0); c.x += .25 * (t - 4.6); return c; }
  return L({ ...mid, x: mid.x + .25 * 5.8 }, wide, eio(seg(t, 10.4, 12)));
}
// ------------------------------------------------------------------ frame
let REG = [];
function people(t) {
  const F = Math.floor(t * 12) / 12;   // 12 fps steps
  [['#CF5140', 1], ['#2CACE2', -1], ['#E9BE5C', 1], ['#7BA75F', 1], ['#8E7CC3', -1], ['#F28C28', 1], ['#00A54E', -1], ['#CF5140', -1]].forEach(([c, dir], i) => {
    const x = -50 + ((i * 14 + dir * F * 1.3) % 100 + 100) % 100, y = 13.5 + (i % 2) * 1.6;
    iso.bill(x, y, 0, (gg) => person(gg, { h: 1.8, body: c, face: dir, bob: (Math.floor(t * 12) + i) % 2 ? .04 : 0, hair: '#2E2522' }), { r: 2 }); });
}
function render(t) {
  REG = []; const S = H / 1080; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#F2E6D0'; g.fillRect(0, 0, W, H); g.setTransform(S, 0, 0, S, 0, 0);
  iso.cam = camAt(t);
  const open = eo(seg(t, T.open, T.open1)) * (1 - eo(seg(t, T.close, T.close1)));
  iso.desat = .75 * open; iso.keep = false;
  // background: a faint iso dot lattice
  g.fillStyle = 'rgba(46,37,34,.08)'; for (let gx = -90; gx <= 90; gx += 6) for (let gy = -90; gy <= 90; gy += 6) { const [px, py] = iso.P(gx, gy, -8); if (px > -5 && px < VW + 5 && py > -5 && py < 1085) g.fillRect(px - 1.2, py - 1.2, 2.4, 2.4); }
  // board with strata at the front faces: soil, then the river's water column on its side
  iso.box(-60, -34, -6, 120, 68, 3.4, PAL.soil, { bias: -500 }); iso.box(-60, -34, -2.6, 120, 68, 2.6, ['#9CC48A', '#7BA75F', '#5E8C4A'], { bias: -499 });
  iso.box(-60, -34, -5.6, 120, 15, 5.2, PAL.blue, { bias: -400 });                                   // the Kalimas (water column at the edge)
  iso.box(-60, -19, 0, 120, 2.6, .2, PAL.stone, { bias: -300 }); iso.box(-60, 12, 0, 120, 4.2, .15, PAL.cream, { bias: -300 });      // quay and the park path
  // a river boat on the Kalimas
  { const bx = -40 + (t * 2.2) % 90; iso.box(bx, -30, -.2, 9, 3.2, 1, PAL.cream); iso.box(bx + 2, -29.5, .8, 5, 2.2, 1.4, PAL.mustard); }
  // the museum hall and the entrance gate
  iso.box(36, 18, 0, 16, 10, 5, PAL.cream); iso.roof(35.5, 17.5, 5, 17, 11, 3, PAL.red, { ridge: 'x', over: .3 });
  iso.box(-52, 18, 0, 1, 1, 6, PAL.stone); iso.box(-44, 18, 0, 1, 1, 6, PAL.stone); iso.box(-52.5, 18, 6, 9.5, 1, 1, ['#3C7FB1', '#2D6390', '#244F73']);
  for (const [x, y] of [[-56, 24], [-30, 26], [-12, 25], [10, 26], [26, 24], [-58, 6], [56, 6], [50, -12]]) tree(x, y);
  for (const x of [-40, -20, 0, 20]) lamp(x, 11);
  people(t);
  // the plinth and the hull
  iso.box(SUB.x0 - 3, -4.6, 0, SUB.x1 - SUB.x0 + 6, 9.2, SUB.plinth, PAL.stone, { bias: -20 });
  iso.keep = true;
  for (let i = 0; i < SEC; i++) {
    if (open > .001) hullSection(i, 0, 1, true);
    hullSection(i, 6 * open, 1 - open * .95, false);
  }
  // interiors (visible when open): one floor and machinery per compartment, in its hue
  if (open > .02) { const A0 = iso.alpha; iso.alpha = open;
    COMP.forEach(([a, b, , , hue], j) => { const x0 = secX(a) + .2, x1 = secX(b) - .2, fz = ZC - SUB.r * .55;
      iso.box(x0, -2.2, fz, x1 - x0, 4.4, .3, tri(hue));
      if (j === 0) for (const yy of [-1.2, 0, 1.2]) iso.cyl(x0 + 1, yy, fz + 1.1, .4, x1 - x0 - 2, PAL.stone, { axis: 'x', n: 10 });
      if (j === 1) for (let k = 0; k < 4; k++) { iso.box(x0 + 1 + k * 4, -2, fz + .3, 3, 1.4, .5, tri(hue)); iso.box(x0 + 1 + k * 4, -2, fz + 1.6, 3, 1.4, .5, tri(hue)); }
      if (j === 2) { iso.cyl(secX(8), 0, fz, .35, 8, PAL.stone, { n: 10 }); iso.box(x0 + .8, -2, fz + .3, 2, 1.2, 1.4, tri(hue)); iso.box(x1 - 2.8, 1, fz + .3, 2, 1.2, 1.4, tri(hue)); }
      if (j === 3) for (let k = 0; k < 2; k++) { iso.box(x0 + 1 + k * 9, -1.6, fz + .3, 7, 3.2, 2, tri(hue)); iso.cyl(x0 + 1 + k * 9, 0, fz + 2.6, .5, 7, PAL.stone, { axis: 'x', n: 10 }); }
      if (j === 4) { iso.box(x0 + 1, -1.4, fz + .3, 6, 2.8, 1.8, tri(hue)); for (const yy of [-1, 1]) iso.cyl(SUB.x0 + .6, yy, fz + 1.4, .38, 4, PAL.stone, { axis: 'x', n: 10 }); } });
    iso.alpha = A0; }
  // the sail (conning tower), periscope and masts (lift with the skin)
  { const sx = secX(7) + .6, lift = 6 * open, A0 = iso.alpha; iso.alpha = 1 - open * .95;
    iso.box(sx, -1.4, ZC + SUB.r - .4 + lift, SL * 2.2, 2.8, 3.4, HULL); iso.box(sx + .6, -1, ZC + SUB.r + 3 + lift, SL * 1.5, 2, .6, HULL);
    iso.cyl(secX(8), 0, ZC + SUB.r + 3.6 + lift, .22, 3.4, PAL.stone, { n: 8 }); iso.cyl(secX(8) + 1.6, 0, ZC + SUB.r + 3.6 + lift, .16, 2.4, PAL.stone, { n: 8 }); iso.alpha = A0; }
  iso.keep = false;
  iso.flush();
  // ---- infographic layer ----
  const ca = seg(t, T.cut, T.cut + .8) * (1 - seg(t, T.close, T.close + .3));
  if (ca > 0) cutLine(g, [iso.P(SUB.x0 - 2, SUB.y + SUB.r + .4, ZC + .2), iso.P(SUB.x1 + 2, SUB.y + SUB.r + .4, ZC + .2)], seg(t, T.cut, T.cut + .8), { color: PAL.ink });
  if (open > .3) { for (const i of [0, SEC - 1]) { const r = rAt(i), x = i ? secX(SEC) - .06 : secX(0); const pts = []; for (let k = 0; k <= 12; k++) { const a = Math.PI + k / 12 * Math.PI; pts.push(iso.P(x, SUB.y + Math.cos(a) * r, ZC + Math.sin(a) * r)); }
    pts.push(iso.P(x, SUB.y + r * .8, ZC)); g.save(); g.globalAlpha = open; hatch(g, pts, { sp: 6 }); g.restore(); } }
  // pins: three compartments named on the object
  const pa = t < T.close ? seg(t, T.pins, T.pins + 1.2) : 1 - seg(t, T.close, T.close + .4);
  [[2, TV ? -1 : 1, TV ? 150 : 110], [0, TV ? 1 : -1, TV ? 120 : 150], [3, 1, TV ? 280 : 250]].forEach(([j, dir, up], q) => { const [a, b, nm] = COMP[j], x = (secX(a) + secX(b)) / 2;
    pin(iso, x, 0, ZC + .2, { a: clamp((pa - q * .15) / .85), title: nm.toUpperCase(), up, dir, len: TV ? 60 : 30, ts: TV ? 22 : 15 }); });
  // inset: the torpedo room's bow bulkhead, six tubes (frame within the frame)
  const ia = t < T.close ? seg(t, T.inset, T.inset + 1.1) : 1 - seg(t, T.close, T.close + .4);
  if (ia > 0) { const [ax, ay] = iso.P(secX(15), 0, ZC), cx = TV ? 1560 : VW - 120, cy = TV ? 300 : 360, r = TV ? 130 : 86;
    inset(iso, ax, ay, cx, cy, r, ia, (gg, x, y, R) => { gg.fillStyle = '#B8B2A6'; gg.fillRect(x - R, y - R, 2 * R, 2 * R); gg.fillStyle = '#948E83'; gg.beginPath(); gg.arc(x, y, R * .82, 0, TAU); gg.fill();
      for (const [dx, dy] of [[-.32, -.22], [0, -.22], [.32, -.22], [-.32, .2], [0, .2], [.32, .2]]) { gg.beginPath(); gg.arc(x + dx * R, y + dy * R, R * .13, 0, TAU); gg.fillStyle = '#2E2522'; gg.fill(); gg.lineWidth = R * .04; gg.strokeStyle = '#E9BE5C'; gg.stroke(); } });
    if (ia > .6) { haloText(g, '6 tabung torpedo depan', cx - r, cy + r + (TV ? 34 : 26), { font: `600 ${TV ? 20 : 14}px ${FONT}` }); } }
  // the 16 sections: cut ticks along the hull and an Isotype count (each icon = one hull section)
  const sa = t < T.close ? seg(t, T.sections, T.sections + .3) : 1 - seg(t, T.close + .4, T.close + .8);
  if (sa > 0) { const n = clamp(Math.floor((t - T.sections) / .09) + 1, 0, 16);
    g.save(); g.globalAlpha = sa; g.strokeStyle = PAL.ink; g.lineWidth = 2; g.setLineDash([5, 4]);
    for (let i = 0; i <= Math.min(n, 16); i++) { const a = iso.P(secX(i), SUB.y + rAt(Math.min(i, 15)) + .3, ZC - SUB.r), b = iso.P(secX(i), SUB.y + rAt(Math.min(i, 15)) + .3, ZC + SUB.r + 1); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
    g.setLineDash([]);
    const rx = TV ? 90 : 30, ry = TV ? 860 : 700, s = TV ? 30 : 19;
    for (let i = 0; i < 16; i++) { const on = i < n, pop = on ? back(clamp((t - T.sections - i * .09) / .25), 2.4) : 1; const x = rx + (i % 8) * (s + 7), y = ry + Math.floor(i / 8) * (s * .62 + 7);
      g.save(); g.translate(x + s / 2, y + s * .31); g.scale(pop, pop); g.beginPath(); g.roundRect(-s / 2, -s * .31, s, s * .62, s * .3); g.fillStyle = on ? HULL[1] : 'rgba(63,75,87,.18)'; g.fill(); if (on) { g.fillStyle = REDS[1]; g.fillRect(-s / 2 + 2, s * .1, s - 4, s * .18); } g.restore(); }
    haloText(g, `${n} bagian`, rx + 8 * (s + 7) + 18, ry + (TV ? 44 : 30), { font: `500 ${TV ? 64 : 42}px ${FONT}` });
    haloText(g, 'dipotong untuk dipindah ke darat', rx, ry - (TV ? 20 : 14), { font: `600 ${TV ? 24 : 16}px ${FONT}` });
    haloText(g, 'cut into 16 sections to move it ashore · dibuka 15 Juli 1998 · sumber: detik.com, UNESA', rx, ry + (TV ? 98 : 66), { font: `500 ${TV ? 17 : 12}px ${FONT}`, color: '#5a4c46' });
    g.restore(); if (n >= 16 && sa > .5) REG.push({ id: 'sec', text: '16 bagian', x0: (rx + 8 * (s + 7) + 18) * S, y0: (ry - 20) * S, x1: (rx + 8 * (s + 7) + 260) * S, y1: (ry + 50) * S }); }
  // the title plate (pale plate, dashed outline, one accent)
  const ta = seg(t, 1.6, 2.1); if (ta > 0) { const x = TV ? 60 : 30, y = TV ? 60 : 135; g.save(); g.globalAlpha = ta; g.fillStyle = 'rgba(251,244,230,.92)'; g.setLineDash([6, 4]); g.strokeStyle = PAL.ink; g.lineWidth = 2; g.beginPath(); g.roundRect(x, y, TV ? 500 : 340, TV ? 92 : 66, 10); g.fill(); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#2CACE2'; g.fillRect(x + 14, y + 14, 8, TV ? 64 : 38); haloText(g, 'MONUMEN KAPAL SELAM', x + 36, y + (TV ? 44 : 32), { font: `600 ${TV ? 28 : 19}px ${FONT}`, track: 3, halo: false }); haloText(g, 'KRI Pasopati 410 · tepi Kalimas', x + 36, y + (TV ? 74 : 52), { font: `500 ${TV ? 18 : 13}px ${FONT}`, halo: false, color: '#5a4c46' }); g.restore();
    if (ta > .5) REG.push({ id: 'title', text: 'MONUMEN KAPAL SELAM', x0: (x + 36) * S, y0: (y + 10) * S, x1: (x + 440) * S, y1: (y + 50) * S }); }
}
window.render = render; window.TEXTS = () => REG.slice();
window.EV = [{ t: T.cut, type: 'cut' }, { t: T.open, type: 'open' }, { t: T.pins, type: 'label' }, { t: T.pins + .2, type: 'label' }, { t: T.pins + .4, type: 'label' }, { t: T.inset, type: 'open' }, ...Array.from({ length: 16 }, (_, i) => ({ t: +(T.sections + i * .09).toFixed(2), type: 'tick' })), { t: T.close, type: 'close' }];
document.fonts.load(`600 20px ${FONT}`, 'A').then(() => { render(0); window.READY = true; });
