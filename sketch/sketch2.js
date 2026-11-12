// Urban Sketch · Pen & Wash window S3 v2 (12 s): Kota Lama, Surabaya (STYLE: styles/urban-sketch).
// Built on the library's sketch engine (engine.js): the page is baked once into a colour layer (washes, foliage, carrot
// people), an ink layer and a stroke-time layer (rasterPen); the WebGL compositor plays the ink back in stroke order and
// blooms the colour through an arrival field with a wet, darker front and granulation in the paper tooth.
// The street: Gedung Cerutu on the corner, Museum Bank Indonesia, Rumah Abu Han with its lanterns; trees, lamps, becak,
// people, the morning sun. It opens on the sun and ends on the whole page with the place written in the margin.
import { INK, PAPER, clamp, lerp, ss, rng, fbm, n2, hex, mix3, ellipse, rough, penStroke, rasterPen, wash, reserve, dab, foliage, arrivalField, compositor, handwrite, LEAF } from './engine.js';
const Q = new URLSearchParams(location.search);
const TV = (Q.get('fmt') || (innerWidth > innerHeight ? 'tv' : 'reels')) === 'tv';
const DUR = 12; window.DUR = DUR;
const SW = innerWidth, SH = innerHeight, VW = 1080 * SW / SH;
const W = 4800, H = 2700, GY = 1880, WIN = [0, 12];
const seg = (t, a, b) => clamp((t - a) / (b - a)), eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const C = { lime: hex('#d8c6a0'), cream: hex('#eadcb8'), white: hex('#f1ebde'), shade: hex('#8f87a3'), roof: hex('#9a6b52'), dome: hex('#7d8496'), red: hex('#b8483e'), green: hex('#7f9a72'),
  sky: hex('#9fbcd6'), skyD: hex('#86a6c8'), sun: hex('#e2b04a'), road: hex('#c9b99a'), walk: hex('#d8ccb1'), lamp: hex('#3c4640'), gold: hex('#d2a24c') };
const SUN = [3980, 420], SUN_R = 120;
function cv(w, h, fill) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); if (fill) { x.fillStyle = fill; x.fillRect(0, 0, w, h); } return [c, x]; }
function pageMask(x, y) { const n = (fbm(x * .004, y * .004, 5, 3) - .5) * 160; return Math.min(x - 70, y - 70, W - 70 - x, H - 70 - y) + n; }
// ------------------------------------------------------------------ build the page
function build() {
  const [colorC, cx] = cv(W, H, '#fff'), [inkC, ia] = cv(W, H), [timeC, ta] = cv(W, H, '#fff');
  const [inkB, ib] = cv(W, H), [timeB, tb] = cv(W, H, '#fff');
  ta.globalCompositeOperation = 'darken';
  let sd = 1; const R = rng(2025);
  const pen = (pts, t0, dur, o = {}) => { const st = penStroke(pts, { w: o.w ?? 3.2, wob: o.wob ?? 1.3, over: o.over ?? 7, gap: o.gap ?? .35, seed: sd++, smooth: o.smooth ?? false }); if (st.P.length > 1) rasterPen(ia, ta, st, t0, dur, WIN); };
  const box = (x0, y0, x1, y1, t0, dt, o) => { pen([[x0, y1], [x0, y0], [x1, y0]], t0, dt, o); pen([[x1, y0], [x1, y1]], t0 + dt * .6, dt * .5, o); };
  const W8 = (poly, col, a = .55, o = {}) => wash(cx, poly, col, { a, j: o.j ?? 6, layers: 3, edge: .32, seed: sd++, dx: o.dx ?? 3, dy: o.dy ?? 2 });
  const windows = (x0, x1, y, h, n, t0, dt, arch) => { for (let i = 0; i < n; i++) { if (R() < .15) continue; const c = lerp(x0, x1, (i + .5) / n), w = (x1 - x0) / n * .42;
    const pts = arch ? [[c - w / 2, y + h], [c - w / 2, y + h * .3], [c - w / 4, y + h * .06], [c + w / 4, y + h * .06], [c + w / 2, y + h * .3], [c + w / 2, y + h]] : [[c - w / 2, y + h], [c - w / 2, y], [c + w / 2, y], [c + w / 2, y + h * .9]];
    pen(pts, t0 + i * dt, dt * 1.6, { w: 2.4, smooth: arch }); W8(pts, C.shade, .28, { j: 2, dx: 1, dy: 1 }); } };
  // --- sky: big soft washes, clouds kept as paper
  for (let i = 0; i < 50; i++) { const x = 300 + R() * 4200, y = 150 + R() * 900; W8(ellipse(x, y, 260 + R() * 360, 120 + R() * 160, 20), R() < .5 ? C.sky : C.skyD, .12 + R() * .1, { j: 40 }); }
  for (const [x, y] of [[1200, 380], [2500, 300], [3300, 560]]) reserve(cx, ellipse(x, y, 260, 70, 18), .85, 12);
  // --- the sun: a ring of yellow wash round a paper disc, an ink circle
  W8(ellipse(SUN[0], SUN[1], SUN_R + 48, SUN_R + 48, 40), C.sun, .8, { j: 4 }); reserve(cx, ellipse(SUN[0], SUN[1], SUN_R, SUN_R, 40), 1, 0);
  pen([...ellipse(SUN[0], SUN[1], SUN_R, SUN_R, 34), ...ellipse(SUN[0], SUN[1], SUN_R, SUN_R, 34).slice(0, 3)], .05, .35, { w: 3.4, smooth: true });
  // --- the street and the pavement, people and becak, drawn after the buildings
  // 1 · Gedung Cerutu: an office block with its cigar-shaped corner tower and dome
  { const t = .9, x0 = 260, x1 = 1180, tx = 1340, trw = 210, top = 520, y0 = 1080;
    W8([[x0, GY], [x0, y0], [x1, y0], [x1, GY]], C.lime); W8([[x1 - 160, GY], [x1, GY], [x1, y0], [x1 - 160, y0]], C.shade, .35);
    pen([[x0, GY], [x0, y0], [x1, y0]], t, .5); pen([[x0 - 30, y0], [x1 + 14, y0 - 6]], t + .3, .3, { w: 4 }); pen([[x0, 1450], [x1, 1444]], t + .5, .3, { w: 2.6 });
    windows(x0 + 26, x1 - 26, 1130, 170, 8, t + .6, .05, true); windows(x0 + 26, x1 - 26, 1500, 210, 8, t + .9, .05, true);
    const tl = tx - trw / 2, tr = tx + trw / 2;
    W8([[tl, GY], [tl, 860], [tl + 30, top + 80], [tr - 30, top + 80], [tr, 860], [tr, GY]], C.cream); W8([[tr - 70, GY], [tr, GY], [tr, 860], [tr - 30, top + 80], [tr - 64, top + 110]], C.shade, .4);
    pen([[tl, GY], [tl, 860], [tl + 12, 680], [tl + 30, top + 80]], t + .4, .45, { smooth: true }); pen([[tr, GY], [tr, 860], [tr - 12, 680], [tr - 30, top + 80]], t + .55, .45, { smooth: true });
    for (let k = 1; k < 5; k++) { const x = lerp(tl + 8, tr - 8, k / 5); pen([[x, GY - 20], [x + (k - 2.5) * 3, 860], [lerp(tl + 30, tr - 30, k / 5), top + 90]], t + .8 + k * .06, .35, { w: 2, smooth: true }); }
    const dome = [...Array(13)].map((_, i) => { const a = Math.PI + i / 12 * Math.PI; return [tx + Math.cos(a) * (trw / 2 - 28), top + 80 + Math.sin(a) * 170]; });
    W8(dome, C.dome, .65); pen(dome, t + 1.2, .45, { smooth: true, w: 3.6 }); pen([[tx, top - 90], [tx, top - 170]], t + 1.6, .15, { w: 2.8 });
    for (const y of [860, 1200, 1500]) pen([[tl, y], [tr, y - 8]], t + 1.3, .2, { w: 2.2 });
    pen([[x1, y0], [tl, y0]], t + 1.0, .2); }
  // 2 · Museum Bank Indonesia: symmetric front, a central bay under a pediment, paired columns, corner turrets
  { const t = 2.4, x0 = 1700, x1 = 3000, c = (x0 + x1) / 2, y0 = 1060;
    W8([[x0, GY], [x0, y0], [x1, y0], [x1, GY]], C.white); W8([[c - 230, y0], [c, 860], [c + 230, y0]], C.lime); W8([[x1 - 260, GY], [x1, GY], [x1, y0], [x1 - 260, y0]], C.shade, .35);
    pen([[x0, GY], [x0, y0], [x1, y0], [x1, GY]], t, .7); pen([[x0 - 20, y0], [x1 + 20, y0 - 5]], t + .4, .3, { w: 4.2 }); pen([[x0, 1400], [x1, 1397]], t + .5, .3, { w: 2.6 });
    pen([[c - 230, y0], [c, 860], [c + 230, y0]], t + .7, .4, { w: 3.6 }); pen([[c - 230, GY], [c - 230, y0]], t + .8, .2); pen([[c + 230, GY], [c + 230, y0]], t + .85, .2);
    for (const dx of [-160, -96, 96, 160]) pen([[c + dx, GY - 14], [c + dx, y0 + 40]], t + 1.0 + Math.abs(dx) / 1000, .25, { w: 2.8 });
    windows(x0 + 26, c - 250, 1110, 190, 6, t + 1.1, .05); windows(c + 250, x1 - 26, 1110, 190, 6, t + 1.2, .05); windows(x0 + 26, c - 250, 1450, 220, 6, t + 1.4, .05, true); windows(c + 250, x1 - 26, 1450, 220, 6, t + 1.5, .05, true);
    for (const x of [x0 + 56, x1 - 56]) { const p = [[x - 40, y0], [x - 40, y0 - 90], [x, y0 - 150], [x + 40, y0 - 90], [x + 40, y0]]; W8(p, C.dome, .5); pen(p, t + 1.6, .25, { smooth: true, w: 2.8 }); }
    const door = [[c - 80, GY], [c - 80, 1520], [c + 80, 1520], [c + 80, GY]]; W8(door, C.roof, .55); pen(door, t + 1.8, .25, { w: 2.8 }); }
  // 3 · Rumah Abu Han: a low house, a curved roof with swallow-tail ends, red pillars, two lanterns
  const LANT = [[3540, 1520], [4020, 1520]];
  { const t = 4.2, x0 = 3360, x1 = 4200, y0 = 1460;
    const roof = [[x0 - 110, y0 + 14], [x0 + 50, y0 - 40], [x0 + 90, y0 - 160], [x1 - 90, y0 - 160], [x1 - 50, y0 - 40], [x1 + 110, y0 + 14]];
    W8(roof, C.green, .62); W8([[x0 + 14, GY], [x0 + 14, y0 + 14], [x1 - 14, y0 + 14], [x1 - 14, GY]], C.cream, .45);
    pen([[x0 - 110, y0 + 14], [x0 + 50, y0 - 40], [x1 - 50, y0 - 40], [x1 + 110, y0 + 14]], t, .6, { smooth: true, w: 4 });
    pen([[x0 - 110, y0 + 14], [x0 - 150, y0 - 66]], t + .5, .12, { w: 3.4 }); pen([[x1 + 110, y0 + 14], [x1 + 150, y0 - 66]], t + .55, .12, { w: 3.4 });
    pen([[x0 + 50, y0 - 40], [x0 + 90, y0 - 160], [x1 - 90, y0 - 160], [x1 - 50, y0 - 40]], t + .6, .45, { smooth: true });
    pen([[x0 + 50, y0 - 160], [x0 + 10, y0 - 230]], t + 1.0, .12); pen([[x1 - 50, y0 - 160], [x1 - 10, y0 - 230]], t + 1.05, .12);
    for (const x of [x0 + 26, x0 + 230, x1 - 230, x1 - 26]) { W8([[x - 18, GY], [x - 18, y0 + 14], [x + 18, y0 + 14], [x + 18, GY]], C.red, .72, { j: 2 }); pen([[x, GY], [x, y0 + 14]], t + 1.1, .2, { w: 3 }); }
    const door = [[x0 + 330, GY], [x0 + 330, 1640], [x1 - 330, 1640], [x1 - 330, GY]]; W8(door, C.red, .68); pen(door, t + 1.4, .3, { w: 2.8 }); pen([[(x0 + x1) / 2, GY], [(x0 + x1) / 2, 1640]], t + 1.6, .1, { w: 2 });
    for (const [lx, ly] of LANT) { W8(ellipse(lx, ly, 46, 58, 18), C.red, .9, { j: 2 }); pen([[lx, y0 + 14], [lx, ly - 58]], t + 1.6, .1, { w: 1.8 }); pen([...ellipse(lx, ly, 46, 58, 18), ...ellipse(lx, ly, 46, 58, 18).slice(0, 2)], t + 1.7, .25, { smooth: true, w: 2.8 }); } }
  // --- trees (foliage dabs, scalloped ink only on the outline), lamps
  const TREES = [[1560, 1380, 1.1], [3200, 1430, .9], [4500, 1400, 1.0], [140, 1460, .9]];
  for (const [x, y, s] of TREES) { const crown = [{ x, y, r: 230 * s }, { x: x - 150 * s, y: y + 70 * s, r: 170 * s }, { x: x + 150 * s, y: y + 60 * s, r: 180 * s }];
    W8([[x - 16, GY], [x - 12, y + 160 * s], [x + 12, y + 160 * s], [x + 16, GY]], hex('#8a735e'), .6, { j: 2 }); foliage(cx, crown, { seed: x | 0, scale: 1.3 * s });
    pen([[x - 14, GY], [x - 10, y + 170 * s]], 6.6 + x / 4800, .2, { w: 2.6 }); pen([[x + 14, GY], [x + 10, y + 170 * s]], 6.65 + x / 4800, .2, { w: 2.6 });
  }
  for (const x of [600, 2350, 3060, 4400]) { pen([[x, GY + 30], [x, 1460]], 7.0, .2, { w: 2.6 }); pen([[x - 30, 1460], [x + 30, 1460], [x + 20, 1410], [x - 20, 1410], [x - 30, 1460]], 7.1, .2, { w: 2.2 }); W8(ellipse(x, 1440, 26, 22, 12), C.sun, .6, { j: 2 }); }
  // --- street, pavement, kerb
  W8([[80, GY], [4720, GY], [4720, GY + 90], [80, GY + 90]], C.walk, .35, { j: 10 }); W8([[80, GY + 90], [4720, GY + 90], [4700, GY + 520], [100, GY + 560]], C.road, .32, { j: 14 });
  pen([[60, GY], [4740, GY + 8]], 1.8, .6, { w: 3.6 }); pen([[60, GY + 92], [4740, GY + 96]], 6.2, .6, { w: 2.6 });
  for (let k = 0; k < 14; k++) pen([[300 + k * 320, GY + 300], [440 + k * 320, GY + 300]], 7.4 + k * .02, .08, { w: 2.2 });
  // --- becak (trishaws) on the street and carrot people on the pavement
  for (const [x, dir] of [[900, 1], [2600, -1], [3800, 1]]) { const y = GY + 330, s = 1;
    pen([...ellipse(x, y, 52, 52, 16), ...ellipse(x, y, 52, 52, 16).slice(0, 2)], 7.6, .2, { smooth: true, w: 2.4 }); pen([...ellipse(x + dir * 200, y, 52, 52, 16), ...ellipse(x + dir * 200, y, 52, 52, 16).slice(0, 2)], 7.65, .2, { smooth: true, w: 2.4 });
    const cab = [[x - 90, y - 50], [x - 90, y - 190], [x - 40, y - 250], [x + 90, y - 250], [x + 90, y - 50]]; W8(cab, [C.red, hex('#5f8fb0'), C.sun][Math.abs(x) % 3], .6, { j: 3 }); pen(cab, 7.7, .25, { w: 2.6, smooth: true }); pen([[x + 60, y - 60], [x + dir * 200, y - 70], [x + dir * 210, y - 220]], 7.8, .2, { w: 2.4 }); }
  const TOPS = ['#8ea6c4', '#d9d2c2', '#c9796a', '#e2c46a', '#7fa084', '#b58fb0', '#f0ece0', '#5f6f8f'].map(hex), SKIN = ['#e2b394', '#c89274', '#9c6a50'].map(hex), HAIR = ['#2e2622', '#4a3a30'].map(hex);
  for (let i = 0; i < 46; i++) { const x = 140 + R() * 4500, y = GY + 40 + R() * 70, S = 190 + R() * 50, top = TOPS[(R() * TOPS.length) | 0], hw = S * .075, hip = y - S * .47, sh = y - S * .8;
    const body = [[x - hw * .8, hip], [x - hw, sh], [x + hw, sh], [x + hw * .8, hip]]; reserve(cx, body, .8, 0); wash(cx, body, top, { a: .6, j: 1.2, layers: 2, edge: .3, seed: i + 400 });
    wash(cx, ellipse(x, sh - S * .075, S * .055, S * .06, 10), SKIN[i % 3], { a: .55, j: .6, edge: 0 }); wash(cx, ellipse(x, sh - S * .1, S * .057, S * .04, 10), HAIR[i % 2], { a: .7, j: .5, edge: 0 });
    wash(cx, ellipse(x + 12, y + 3, S * .12, S * .025, 10), C.shade, { a: .3, j: 1, edge: 0 });
    const t0 = 7.9 + (x / 4800) * 1.2; pen([[x - hw * .4, hip], [x - hw * .6, y]], t0, .06, { w: 1.8, wob: .4, over: 0 }); pen([[x + hw * .4, hip], [x + hw * .5, y]], t0, .06, { w: 1.8, wob: .4, over: 0 }); }
  // --- the page frays at its edge
  { const [mc, mx] = cv(W, H); mx.fillStyle = '#fff'; for (let y = 0; y < H; y += 4) for (let x = 0; x < W; x += 4) if (pageMask(x, y) < 0) mx.fillRect(x, y, 4, 4);
    cx.globalCompositeOperation = 'source-over'; cx.drawImage(mc, 0, 0); ia.save(); ia.globalCompositeOperation = 'destination-out'; ia.drawImage(mc, 0, 0); ia.restore(); }
  // pack ink (alpha) and time (red) into the compositor's byte textures (second ink channel left empty)
  const out = new Uint8Array(W * H * 4), tim = new Uint8Array(W * H * 4); const A = ia.getImageData(0, 0, W, H).data, Tm = ta.getImageData(0, 0, W, H).data;
  for (let i = 0, n = W * H; i < n; i++) { out[i * 4] = A[i * 4 + 3]; out[i * 4 + 3] = 255; tim[i * 4] = Tm[i * 4]; tim[i * 4 + 1] = 255; tim[i * 4 + 3] = 255; }
  return { W, H, color: colorC, ink: out, time: tim, winA: WIN, winB: [99, 1], LANT };
}
// ------------------------------------------------------------------ arrival of colour: the sun first, then each building as it is drawn, the street last
const SRC = [
  { x: SUN[0], y: SUN[1], t: .2, v: 900, R: 220, hard: 1 },
  { x: SUN[0], y: SUN[1], t: 1.4, v: 1300, R: 4200, mask: (x, y) => y < 1000 },
  { x: 1340, y: 1200, t: 3.0, v: 900, R: 1000 }, { x: 2350, y: 1300, t: 4.6, v: 900, R: 900 }, { x: 3780, y: 1550, t: 6.2, v: 900, R: 800 },
  { x: 2400, y: 2000, t: 7.4, v: 1500, R: 3000, mask: (x, y) => y > 1700 }, { x: 2400, y: 1400, t: 8.4, v: 1600, R: 3000 },
];
// ------------------------------------------------------------------ camera (page px; z = screen units per page px in the VW x 1080 frame)
function camera(t) {
  const fit = Math.min(VW / W, 1080 / H) * .98;
  const K = [[0, { x: SUN[0], y: SUN[1], z: TV ? 1.6 : 1.2 }], [1.0, { x: 2400, y: 1200, z: fit * 1.6 }], [2.4, { x: 1000, y: 1400, z: TV ? .62 : .42 }], [4.0, { x: 1200, y: 1420, z: TV ? .66 : .44 }],
    [5.6, { x: 2350, y: 1480, z: TV ? .62 : .42 }], [7.4, { x: 3780, y: 1560, z: TV ? .64 : .44 }], [9.0, { x: 3000, y: 1700, z: TV ? .5 : .34 }], [10.6, { x: W / 2, y: H / 2, z: fit }], [12, { x: W / 2, y: H / 2, z: fit * .98 }]];
  let i = 1; while (i < K.length - 1 && t > K[i][0]) i++;
  const [ta, A] = K[i - 1], [tb, B] = K[i], u = eio(seg(t, ta, tb));
  return { x: lerp(A.x, B.x, u), y: lerp(A.y, B.y, u), z: Math.exp(lerp(Math.log(A.z), Math.log(B.z), u)) };
}
// ------------------------------------------------------------------ frame
const out = document.getElementById('c'); out.width = SW; out.height = SH; const octx = out.getContext('2d');
const glc = document.createElement('canvas'); glc.width = SW; glc.height = SH;
let comp = null, REG = [];
const NOTES = [{ s: 'Kota Lama, Surabaya — pagi', x: 260, y: 300, t: 9.6, size: 110, font: 'Reenie Beanie' }, { s: 'Gedung Cerutu · Museum Bank Indonesia · Rumah Abu Han', x: 260, y: 2420, t: 10.2, size: 58, font: 'Caveat' }];
function render(t) {
  REG = []; const c = camera(t), S = SH / 1080;
  comp({ cx: c.x, cy: c.y, z: c.z * S }, t);
  octx.setTransform(1, 0, 0, 1, 0, 0); octx.drawImage(glc, 0, 0);
  // handwriting in the margin, on the page (moves with the camera)
  octx.setTransform(c.z * S, 0, 0, c.z * S, SW / 2 - c.x * c.z * S, SH / 2 - c.y * c.z * S);
  for (const n of NOTES) { const p = seg(t, n.t, n.t + n.s.length * .03); if (p <= 0) continue; handwrite(octx, n.s, n.x, n.y, n.size, p, { font: n.font, weight: 600 });
    if (p >= 1) { octx.font = `600 ${n.size}px ${n.font}`; const w = octx.measureText(n.s).width, m = octx.getTransform(), a = m.transformPoint({ x: n.x, y: n.y - n.size }), b = m.transformPoint({ x: n.x + w, y: n.y + n.size * .2 }); if (a.x >= 0 && b.x <= SW) REG.push({ id: n.s, text: n.s, x0: a.x, y0: a.y, x1: b.x, y1: b.y }); } }
}
window.render = render; window.TEXTS = () => REG.slice();
window.EV = [{ t: .2, type: 'sun' }, { t: .9, type: 'pen' }, { t: 2.4, type: 'pen' }, { t: 3.0, type: 'wash' }, { t: 4.2, type: 'pen' }, { t: 4.6, type: 'wash' }, { t: 6.2, type: 'wash' }, { t: 7.4, type: 'wash' }, { t: 7.6, type: 'pen' }, { t: 9.6, type: 'write' }];
Promise.all(['600 40px Caveat', '40px "Reenie Beanie"'].map(f => document.fonts.load(f, 'Ab'))).then(() => {
  const world = build(); const GWd = 600, GHd = 340; const arr = arrivalField(W, H, GWd, GHd, SRC, { amp: 200 });
  comp = compositor(glc, { ...world, arr, gw: GWd, gh: GHd }); render(0); window.READY = true; });
