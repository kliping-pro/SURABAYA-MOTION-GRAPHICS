// Isometric Infographic window S4 (9 s): Monumen Kapal Selam on the Kalimas (STYLE: styles/iso-infographic/STYLE.md).
// A floating board: the river, the park, the submarine (KRI Pasopati 410) on its plinth, visitors. Cut line, the skin
// slides away (cutaway), the compartments show; then the hull's 16 sections (it was cut into 16 to be moved ashore).
// Opens and closes on a tracking ring the size of the map's station dot. Flat true isometric, three tones per face.
import { clamp, lerp, seg, ss, eio, eo, back } from '/core/lib.js';
const Q = new URLSearchParams(location.search);
const TV = (Q.get('fmt') || (innerWidth > innerHeight ? 'tv' : 'reels')) === 'tv';
const DUR = 9; window.DUR = DUR;
const W = innerWidth, H = innerHeight, VW = 1080 * W / H;
const INK = '#1d1b26', GROUND = '#f1ece0';
const C30 = Math.cos(Math.PI / 6);
const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mixc = (a, b, t) => a.map((v, i) => Math.round(lerp(v, b[i], t)));
const css = c => `rgb(${c[0]},${c[1]},${c[2]})`;
const tones = h => { const c = hx(h); return { top: css(mixc(c, [255, 250, 240], .2)), left: css(c), right: css(mixc(c, hx('#231A2C'), .22)) }; };
const GREY = h => { const c = hx(h), l = (c[0] * .3 + c[1] * .59 + c[2] * .11); return '#' + mixc(c, [l + 20, l + 16, l + 10], .75).map(v => clamp(v, 0, 255) | 0).map(v => v.toString(16).padStart(2, '0')).join(''); };

// ------------------------------------------------------------------ camera: world metres -> screen (iso, k px per metre)
let CAM = { x: 0, y: 0, z: 0, k: 8 };
function P(x, y, z) { const k = CAM.k; return [VW / 2 + ((x - CAM.x) - (y - CAM.y)) * C30 * k, 540 + (((x - CAM.x) + (y - CAM.y)) * .5 - (z - CAM.z)) * k]; }
// ------------------------------------------------------------------ prisms, depth sorted
let Qd = [];
function box(x, y, z, w, d, h, col, o = {}) { Qd.push({ k: 'box', x, y, z, w, d, h, col, o, depth: x + w / 2 + y + d / 2 + z + (o.bias || 0) }); }
function item(depth, fn) { Qd.push({ k: 'fn', depth, fn }); }
function flush(c) {
  Qd.sort((a, b) => a.depth - b.depth);
  for (const q of Qd) {
    if (q.k === 'fn') { q.fn(c); continue; }
    const { x, y, z, w, d, h, col, o } = q, T = typeof col === 'string' ? tones(col) : col, a = o.a ?? 1; if (a <= 0) continue;
    const pts = (L) => { c.beginPath(); L.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](...P(...p))); c.closePath(); c.fill(); };
    c.save(); c.globalAlpha = a;
    if (!o.noTop) { c.fillStyle = T.top; pts([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]]); }
    if (!o.noLeft) { c.fillStyle = T.left; pts([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]]); }
    if (!o.noRight) { c.fillStyle = T.right; pts([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]]); }
    c.restore();
  }
  Qd = [];
}
// ------------------------------------------------------------------ the board
const BX = -62, BY = -34, BW = 124, BD = 70, BT = 5;          // metres
const SUB = { x0: -38, x1: 38, y: 2, w: 7.5, z: 3.2 };        // the hull sits on a plinth, 16 sections along x
const SEC = 16, secL = (SUB.x1 - SUB.x0) / SEC;
const COMP = [ // compartments (simplified layout of a Whiskey-class boat, bow at +x): [from section, to section, name ID, EN, hue]
  [12, 16, 'Ruang torpedo depan', 'Forward torpedo room', '#E0A33A'],
  [9, 12, 'Ruang awak & baterai', 'Crew & batteries', '#6AA84F'],
  [7, 9, 'Ruang kendali · periskop', 'Control room · periscope', '#2CACE2'],
  [3, 7, 'Mesin diesel', 'Diesel engines', '#C0504D'],
  [0, 3, 'Motor listrik · torpedo belakang', 'Electric motors · aft torpedoes', '#8E7CC3'],
];
const hullH = i => { const u = (i + .5) / SEC; return 6.2 * Math.pow(Math.sin(Math.PI * clamp(u * .92 + .04)), .45); };
let REG = [];
function label(c, id, s1, s2, ax, ay, ax2, ay2, a) {
  if (a <= 0) return; const fs = TV ? 22 : 15, fs2 = TV ? 16 : 11;
  c.save(); c.globalAlpha = a; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax2, ay2); c.stroke();
  c.beginPath(); c.arc(ax, ay, 3.5, 0, 7); c.fillStyle = INK; c.fill();
  c.font = `700 ${fs}px Inter`; c.textAlign = ax2 > ax ? 'left' : 'right'; const dx = ax2 > ax ? 8 : -8;
  c.fillText(s1, ax2 + dx, ay2 + 2); c.font = `500 ${fs2}px Inter`; c.fillStyle = '#4a4552'; c.fillText(s2, ax2 + dx, ay2 + 2 + fs2 + 4);
  if (a > .5) { const S = H / 1080, w = c.measureText(s1).width; const x0 = ax2 > ax ? ax2 + dx : ax2 + dx - w; REG.push({ id, text: s1, x0: x0 * S, y0: (ay2 - fs) * S, x1: (x0 + w) * S, y1: (ay2 + 4) * S }); }
  c.restore();
}
function person(x, y, t, i, col) {   // a billboard visitor stepping at 12 fps
  const f = Math.floor(t * 12 + i * 3) % 2;
  item(x + y + 1.6, c => { const [px, py] = P(x, y, 0), k = CAM.k; c.save(); c.fillStyle = col; c.beginPath(); c.moveTo(px - .45 * k, py); c.lineTo(px + .45 * k, py); c.lineTo(px + .3 * k, py - 1.2 * k); c.lineTo(px - .3 * k, py - 1.2 * k); c.fill();
    c.fillStyle = '#e8c39e'; c.beginPath(); c.arc(px, py - 1.5 * k, .32 * k, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = Math.max(1, .14 * k); c.beginPath(); c.moveTo(px - .2 * k, py); c.lineTo(px - .2 * k + (f ? .2 : -.2) * k, py + .35 * k); c.stroke(); c.restore(); });
}
// ------------------------------------------------------------------ camera path (metres): the ring on the periscope -> the board -> close on the hull -> the ring again
const PERI = [lerp(SUB.x0, SUB.x1, 8 / SEC), SUB.y + SUB.w / 2, SUB.z + 9.4];
function camera(t) {
  const ringK = 27 / .9;                                   // the ring (0.9 m) the size of the map's station dot
  const K = [[0, { x: PERI[0], y: PERI[1], z: PERI[2], k: ringK }], [1.6, { x: 0, y: 0, z: 0, k: TV ? 11 : 6.2 }], [3.0, { x: 2, y: 2, z: 3, k: TV ? 13 : 7.4 }], [6.0, { x: 0, y: 3, z: 3, k: TV ? 14 : 7.6 }], [7.6, { x: 0, y: 3, z: 3, k: TV ? 14 : 7.6 }], [8.8, { x: PERI[0], y: PERI[1], z: PERI[2], k: ringK }], [9, { x: PERI[0], y: PERI[1], z: PERI[2], k: ringK }]];
  let i = 1; while (i < K.length - 1 && t > K[i][0]) i++;
  const [ta, A] = K[i - 1], [tb, B] = K[i], u = eio(seg(t, ta, tb));
  return { x: lerp(A.x, B.x, u), y: lerp(A.y, B.y, u), z: lerp(A.z, B.z, u), k: Math.exp(lerp(Math.log(A.k), Math.log(B.k), u)) };
}
const T = { cut: 2.6, open: 3.0, open1: 4.0, labels: 3.9, sections: 6.0, close: 7.8 };
// ------------------------------------------------------------------ frame
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
function render(t) {
  REG = []; CAM = camera(t); const S = H / 1080;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = GROUND; ctx.fillRect(0, 0, W, H); ctx.setTransform(S, 0, 0, S, 0, 0);
  // faint iso dot lattice on the ground
  ctx.fillStyle = 'rgba(29,27,38,.10)'; for (let gx = -120; gx <= 120; gx += 6) for (let gy = -120; gy <= 120; gy += 6) { const [px, py] = P(gx, gy, -BT - 6); if (px > -5 && px < VW + 5 && py > -5 && py < 1085) ctx.fillRect(px - 1, py - 1, 2, 2); }
  // board shadow, board with strata on its front faces
  { const p = [P(BX, BY, -BT - 6), P(BX + BW, BY, -BT - 6), P(BX + BW, BY + BD, -BT - 6), P(BX, BY + BD, -BT - 6)]; ctx.save(); ctx.filter = 'blur(14px)'; ctx.fillStyle = 'rgba(40,30,50,.18)'; ctx.beginPath(); p.forEach((q, i) => ctx[i ? 'lineTo' : 'moveTo'](q[0] + 6, q[1] + 10)); ctx.fill(); ctx.restore(); }
  const focus = seg(t, T.open, T.open + .5) * (1 - seg(t, T.close, T.close + .4));   // focus + context: the board greys while the hull is open
  const g = h => focus > .01 ? GREY(h) : h;
  box(BX, BY, -BT, BW, BD, BT - 1.2, '#b9a68a', { bias: -200 }); box(BX, BY, -1.2, BW, BD, 1.2, g('#8fbf7a'), { bias: -199 });
  // the Kalimas along the far edge of the board, and a path
  box(BX, BY, -.6, BW, 16, .7, g('#6FA8DC'), { bias: -150 }); box(BX, BY + 16, 0, BW, 3, .25, g('#d9cdb4'), { bias: -140 });
  box(BX, 20, 0, BW, 3.2, .25, g('#d9cdb4'), { bias: -140 });
  // trees
  for (const [x, y] of [[-55, 26], [-48, 28], [46, 27], [54, 25], [-20, 28], [12, 29]]) { box(x, y, 0, .8, .8, 2.4, g('#7a5a3c')); box(x - 1.6, y - 1.6, 2.4, 4, 4, 3.2, g('#5f9a4f')); }
  // the plinth and the hull: 16 sections; cutaway lifts the skin (top + near side) away
  box(SUB.x0 - 2, SUB.y - 1, 0, SUB.x1 - SUB.x0 + 4, SUB.w + 2, SUB.z - .4, g('#cfc6b8'), { bias: -40 });
  const open = eo(seg(t, T.open, T.open1));
  for (let i = 0; i < SEC; i++) {
    const x = SUB.x0 + i * secL, h = hullH(i), dz = h * .5, zz = SUB.z + (6.2 - h) * .5;
    const comp = COMP.find(q => i >= q[0] && i < q[1]);
    // inside (visible when open): the compartment in its hue, a floor slab
    if (open > 0) { box(x + .15, SUB.y + .6, zz + .3, secL - .3, SUB.w - 1.2, h * .55, comp[4], { a: open }); box(x + .1, SUB.y + .5, zz, secL - .2, SUB.w - 1, .3, '#3b4350', { a: open }); }
    // the skin: lower band red, upper dark steel; when open the upper skin lifts and fades
    box(x, SUB.y, zz, secL - .04, SUB.w, h * .35, '#9b3b33', { noTop: true });
    box(x, SUB.y, zz + h * .35 + 6 * open, secL - .04, SUB.w, h * .65, '#4a5866', { a: 1 - open });
    // section lines: 16 cut marks (dashed) when the count arrives
  }
  // the conning tower (sail) and periscope, over the control room
  { const x = lerp(SUB.x0, SUB.x1, 7 / SEC); box(x, SUB.y + 1.8, SUB.z + 6, secL * 2.2, SUB.w - 3.6, 2.6 + 0 * open, '#3f4b57', { a: 1 - open * .85 }); box(PERI[0] - .2, PERI[1] - .2, SUB.z + 8.6, .4, .4, .8, '#2b333b', { a: 1 - open * .85 }); }
  // visitors along the path
  for (let i = 0; i < 7; i++) person(-50 + i * 15 + Math.sin(t * .8 + i) * 2 + t * 1.2, 21.6, t, i, ['#c0504d', '#2CACE2', '#e0a33a', '#6aa84f', '#8e7cc3', '#f28c28', '#00a54e'][i]);
  flush(ctx);
  // infographic layer: cut line, leader labels, 16 sections, tracking ring
  const cutA = seg(t, T.cut, T.cut + .5) * (1 - seg(t, T.close, T.close + .3));
  if (cutA > 0) { const a = P(SUB.x0 - 1, SUB.y + SUB.w, SUB.z + 2.2), b = P(lerp(SUB.x0 - 1, SUB.x1 + 1, seg(t, T.cut, T.cut + .45)), SUB.y + SUB.w, SUB.z + 2.2);
    ctx.save(); ctx.globalAlpha = cutA; ctx.setLineDash([8, 6]); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); ctx.restore(); }
  const la = seg(t, T.labels, T.labels + .4) * (1 - seg(t, T.sections - .2, T.sections + .2));
  // a legend (one hue per compartment) and one leader for the control room, under the periscope
  if (la > 0) {
    const lx = TV ? 1340 : 40, ly = TV ? 650 : 760, fs = TV ? 22 : 16, fs2 = TV ? 15 : 11, gap = TV ? 46 : 34;
    [...COMP].reverse().forEach((q, j) => { const a2 = seg(t, T.labels + j * .15, T.labels + j * .15 + .3) * la; if (a2 <= 0) return;
      ctx.save(); ctx.globalAlpha = a2; ctx.fillStyle = q[4]; ctx.fillRect(lx, ly + j * gap - fs + 2, fs, fs); ctx.fillStyle = INK; ctx.font = `700 ${fs}px Inter`; ctx.textAlign = 'left'; ctx.fillText(q[2], lx + fs + 12, ly + j * gap);
      ctx.font = `500 ${fs2}px Inter`; ctx.fillStyle = '#4a4552'; ctx.fillText(q[3], lx + fs + 12, ly + j * gap + fs2 + 3); ctx.restore();
      if (a2 > .5) REG.push({ id: 'lg' + j, text: q[2], x0: (lx + fs + 12) * S, y0: (ly + j * gap - fs) * S, x1: (lx + 400) * S, y1: (ly + j * gap + 4) * S }); });
    const pc = P(PERI[0], PERI[1], SUB.z + 3.6); label(ctx, 'peri', 'Periskop', 'Periscope', pc[0], pc[1], pc[0] + (TV ? 60 : 40), pc[1] - (TV ? 150 : 110), la);
  }
  const sa = seg(t, T.sections, T.sections + .3) * (1 - seg(t, T.close, T.close + .3));
  if (sa > 0) {
    const n = clamp(Math.floor((t - T.sections) / .07) + 1, 0, 16);
    ctx.save(); ctx.globalAlpha = sa; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
    for (let i = 0; i <= Math.min(n, 16); i++) { const x = SUB.x0 + i * secL, a = P(x, SUB.y + SUB.w + .3, SUB.z - .2), b = P(x, SUB.y + SUB.w + .3, SUB.z + 7.2); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }
    ctx.setLineDash([]);
    // the reading: built from icons (one hull section per icon), lands on 16
    const rx = TV ? 90 : 34, ry = TV ? 860 : 640, s = TV ? 26 : 17;
    for (let i = 0; i < 16; i++) { const on = i < n; ctx.fillStyle = on ? '#4a5866' : 'rgba(74,88,102,.18)'; ctx.beginPath(); ctx.roundRect(rx + (i % 8) * (s + 6), ry + Math.floor(i / 8) * (s * .62 + 6), s, s * .62, s * .3); ctx.fill(); }
    ctx.fillStyle = INK; ctx.font = `800 ${TV ? 64 : 42}px Inter`; ctx.textAlign = 'left'; ctx.fillText(`${n} bagian`, rx + 8 * (s + 6) + 18, ry + (TV ? 42 : 28));
    ctx.font = `600 ${TV ? 24 : 16}px Inter`; ctx.fillText('dipotong untuk dipindah ke darat', rx, ry - (TV ? 22 : 16));
    ctx.font = `500 ${TV ? 18 : 12}px Inter`; ctx.fillStyle = '#4a4552'; ctx.fillText('cut into 16 sections to move it ashore · dibuka 15 Juli 1998 · sumber: detik.com, UNESA', rx, ry + (TV ? 92 : 62));
    if (n >= 16 && sa > .5) REG.push({ id: 'sec', text: '16 bagian', x0: (rx + 8 * (s + 6) + 18) * S, y0: (ry - 10) * S, x1: (rx + 8 * (s + 6) + 260) * S, y1: (ry + 50) * S });
    ctx.restore();
  }
  // title plate (a pale plate with a dashed outline + accent), top-left
  const ta = seg(t, 1.2, 1.6) * (1 - seg(t, T.close, T.close + .3));
  if (ta > 0) { const x = TV ? 60 : 30, y = TV ? 60 : 135; ctx.save(); ctx.globalAlpha = ta; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.setLineDash([6, 4]); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x, y, TV ? 470 : 330, TV ? 84 : 62, 10); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#2CACE2'; ctx.fillRect(x + 14, y + 14, 8, (TV ? 56 : 34)); ctx.fillStyle = INK; ctx.font = `800 ${TV ? 30 : 21}px Inter`; ctx.fillText('Monumen Kapal Selam', x + 36, y + (TV ? 42 : 32)); ctx.font = `500 ${TV ? 18 : 13}px Inter`; ctx.fillStyle = '#4a4552'; ctx.fillText('KRI Pasopati 410 · tepi Kalimas', x + 36, y + (TV ? 68 : 50)); ctx.restore();
    if (ta > .5) REG.push({ id: 'title', text: 'Monumen Kapal Selam', x0: (x + 36) * S, y0: (y + 10) * S, x1: (x + 400) * S, y1: (y + 50) * S }); }
  // tracking ring on the periscope: the map's station dot (white disc, blue ring) at both ends of the window
  const ra = 1 - seg(t, .9, 1.4) + seg(t, 8.2, 8.7); if (ra > 0) { const [px, py] = P(...PERI), r = .9 * CAM.k; ctx.save(); ctx.globalAlpha = clamp(ra); ctx.beginPath(); ctx.arc(px, py, r * .7, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = r * .32; ctx.strokeStyle = '#2CACE2'; ctx.stroke(); ctx.restore(); }
}
window.render = render; window.TEXTS = () => REG.slice();
window.EV = [{ t: 0, type: 'ring' }, { t: T.cut, type: 'cut' }, { t: T.open, type: 'open' }, ...COMP.map((q, j) => ({ t: +(T.labels + j * .18).toFixed(2), type: 'label' })), ...Array.from({ length: 16 }, (_, i) => ({ t: +(T.sections + i * .07).toFixed(2), type: 'tick' })), { t: T.close, type: 'close' }];
Promise.all(['500 20px Inter', '700 20px Inter', '800 20px Inter'].map(f => document.fonts.load(f, 'A1'))).then(() => { render(0); window.READY = true; });
