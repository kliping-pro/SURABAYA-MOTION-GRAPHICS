// Silkscreen Travel Poster window S6 v2 (15 s): six Surabaya landmarks, six prints, 2.5 s each (STYLE: styles/silkscreen-poster).
// Uses the library's print engine (engine/silk.js): opaque flat inks with sheen and trap edges, ragged squeegee fronts, the
// squeegee and its ink bead crossing the sheet on every pull, the screen frame, paper grain, ink mottle and pinholes.
// A series: one template, a new palette per print; the afternoon moves on to dusk. Each print: sky (+ the name, printed
// into the sky on the first pull so it reads for the whole print), stepped bands, far, mid (+ the accent), near (+ the info
// band), each pull 0.42 s. ?fmt=reels|tv
import { makeTextures, paperSheet, inkFinish, wipeRegion, wipeFront, ink, squeegee, screenFrame, polyPath, circlePath, rectPath, unionPath, bandSteps, mix, mulberry, clamp, lerp } from './engine/silk.js';
const Q = new URLSearchParams(location.search);
const TV = (Q.get('fmt') || (innerWidth > innerHeight ? 'tv' : 'reels')) === 'tv';
const PER = 2.5, N = 6, DUR = PER * N; window.DUR = DUR;
const W = innerWidth, H = innerHeight, VW = 1080 * W / H;
const PAPER = '#F3EAD8';
const seg = (t, a, b) => clamp((t - a) / (b - a)), eo = t => 1 - Math.pow(1 - clamp(t), 3);
// palettes [sky1, sky2, far, mid, near, accent] — afternoon to dusk
const PAL = [
  ['#FBE6B4', '#F6CD98', '#E7B57A', '#2F6E8E', '#173247', '#E8553D'],
  ['#E8F0F2', '#9CC5D6', '#D9C7A3', '#3E7079', '#1E3B3F', '#F2B134'],
  ['#F6CD98', '#EE9A73', '#B98AA0', '#7A2E2E', '#2A1A24', '#D9302C'],
  ['#F2E6C8', '#C9D8B0', '#8FAE7E', '#4E6B4A', '#22301F', '#E8553D'],
  ['#FCE3C0', '#F2A86B', '#C96B4B', '#3E7079', '#2A1A2A', '#FFD25E'],
  ['#F2D7B6', '#D98A5E', '#8F4E5C', '#3C3B5C', '#1B1A2E', '#F6EC25'],
];
const s = TV ? 1 : .6, CX = () => VW / 2, GY = () => TV ? 820 : 760;
const P = () => new Path2D();
function rect(p, x, y, w, h) { p.rect(x, y, w, h); }
function tri(p, a, b, c) { p.moveTo(...a); p.lineTo(...b); p.lineTo(...c); p.closePath(); }
function dome(p, cx, y, r, k = 1) { p.moveTo(cx - r, y); p.ellipse(cx, y, r, r * k, 0, Math.PI, 0); p.closePath(); }
function palm(p, x, g, h) { rect(p, x - 3 * s, g - h, 6 * s, h); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .5; p.moveTo(x, g - h); p.quadraticCurveTo(x + Math.cos(a) * 40 * s, g - h + Math.sin(a) * 30 * s - 18 * s, x + Math.cos(a) * 62 * s, g - h + Math.sin(a) * 30 * s + 12 * s); p.lineTo(x + Math.cos(a) * 58 * s, g - h + Math.sin(a) * 30 * s + 16 * s); p.quadraticCurveTo(x + Math.cos(a) * 36 * s, g - h + Math.sin(a) * 30 * s - 10 * s, x, g - h + 6 * s); p.closePath(); } }
function treeRound(p, x, g, r) { rect(p, x - 4 * s, g - r * 1.2, 8 * s, r * 1.2); p.moveTo(x + r, g - r * 1.4); p.arc(x, g - r * 1.4, r, 0, Math.PI * 2); }
function person(p, x, g, h, k = 0) { p.moveTo(x + 6 * s, g - h + 6 * s); p.arc(x, g - h + 6 * s, 6 * s, 0, Math.PI * 2); p.moveTo(x - 7 * s, g); p.lineTo(x - 5 * s + k, g - h + 14 * s); p.lineTo(x + 5 * s + k, g - h + 14 * s); p.lineTo(x + 7 * s, g); p.closePath(); }
function lamp(p, x, g, h) { rect(p, x - 2 * s, g - h, 4 * s, h); rect(p, x - 9 * s, g - h - 14 * s, 18 * s, 14 * s); }
function car(p, x, g, w) { p.roundRect(x, g - 22 * s, w, 16 * s, 5 * s); p.roundRect(x + w * .2, g - 34 * s, w * .55, 14 * s, 6 * s); p.moveTo(x + w * .25 + 7 * s, g - 4 * s); p.arc(x + w * .25, g - 4 * s, 7 * s, 0, Math.PI * 2); p.moveTo(x + w * .78 + 7 * s, g - 4 * s); p.arc(x + w * .78, g - 4 * s, 7 * s, 0, Math.PI * 2); }
function becak(p, x, g) { p.moveTo(x + 18 * s, g - 14 * s); p.arc(x, g - 14 * s, 14 * s, 0, Math.PI * 2); p.moveTo(x + 74 * s, g - 14 * s); p.arc(x + 60 * s, g - 14 * s, 14 * s, 0, Math.PI * 2);
  rect(p, x - 22 * s, g - 64 * s, 44 * s, 34 * s); p.moveTo(x - 26 * s, g - 64 * s); p.quadraticCurveTo(x, g - 92 * s, x + 26 * s, g - 64 * s); p.closePath(); rect(p, x + 10 * s, g - 32 * s, 54 * s, 5 * s); person(p, x + 62 * s, g - 34 * s, 46 * s); }
// ------------------------------------------------------------------ the six arts: { far, mid, near, lit?, accent: Path2D, sun:[x,y,r] }
const ART = [
  function balaiPemuda() { const cx = CX(), g = GY(), far = P(), mid = P(), near = P(), acc = P();
    for (let i = -6; i <= 6; i++) treeRound(far, cx + i * 150 * s, g - 30 * s, (40 + (i * 37 % 20)) * s);
    rect(mid, cx - 300 * s, g - 200 * s, 600 * s, 200 * s); tri(mid, [cx - 330 * s, g - 200 * s], [cx, g - 290 * s], [cx + 330 * s, g - 200 * s]);
    for (const dx of [-290, 290]) { rect(mid, cx + (dx - 46) * s, g - 300 * s, 92 * s, 300 * s); dome(mid, cx + dx * s, g - 300 * s, 54 * s, 1.15); rect(mid, cx + (dx - 3) * s, g - 400 * s, 6 * s, 44 * s); }
    for (let i = 0; i < 9; i++) { rect(near, cx + (-250 + i * 60) * s, g - 160 * s, 30 * s, 104 * s); }
    for (const dx of [-470, -400, 400, 470]) palm(near, cx + dx * s, g, 230 * s);
    for (const dx of [-170, 170]) lamp(near, cx + dx * s, g, 120 * s);
    for (let i = 0; i < 6; i++) person(mid, cx + (-520 + i * 210) * s, g, 52 * s, (i % 2 ? 2 : -2) * s);   // visitors on the square, in the mid ink
    rect(near, cx - 1200, g, 2400, 500); acc.addPath(circlePath(cx + 430 * s, g - 470 * s, 66 * s));
    return { far, mid, near, acc }; },
  function balaiKota() { const cx = CX(), g = GY(), far = P(), mid = P(), near = P(), acc = P();
    for (let i = -7; i <= 7; i++) treeRound(far, cx + i * 130 * s, g - 20 * s, (34 + (i * 53 % 24)) * s);
    rect(mid, cx - 430 * s, g - 180 * s, 860 * s, 180 * s); rect(mid, cx - 120 * s, g - 260 * s, 240 * s, 260 * s); tri(mid, [cx - 140 * s, g - 260 * s], [cx, g - 330 * s], [cx + 140 * s, g - 260 * s]); rect(mid, cx - 450 * s, g - 192 * s, 900 * s, 14 * s);
    for (let i = 0; i < 12; i++) { const x = cx + (-405 + i * 72) * s; if (Math.abs(x - cx) < 130 * s) continue; rect(near, x, g - 150 * s, 28 * s, 96 * s); }
    rect(near, cx - 40 * s, g - 120 * s, 80 * s, 120 * s);
    // the fountain in the garden: a basin and jets (the jets are paper: knocked out of the near ink)
    rect(near, cx - 1200, g, 2400, 500); near.moveTo(cx - 150 * s, g + 40 * s); near.ellipse(cx, g + 40 * s, 150 * s, 26 * s, 0, 0, Math.PI * 2);
    acc.addPath(circlePath(cx - 460 * s, g - 460 * s, 64 * s));
    const jets = P(); for (let k = -3; k <= 3; k++) { jets.moveTo(cx + k * 30 * s, g + 34 * s); jets.quadraticCurveTo(cx + k * 44 * s, g - 70 * s, cx + k * 70 * s, g + 20 * s); jets.lineTo(cx + k * 66 * s, g + 24 * s); jets.quadraticCurveTo(cx + k * 42 * s, g - 56 * s, cx + k * 26 * s, g + 34 * s); jets.closePath(); }
    return { far, mid, near, acc, knock: jets }; },
  function bambu() { const cx = CX(), g = GY(), far = P(), mid = P(), near = P(), acc = P();
    rect(far, cx - 1200, g - 80 * s, 2400, 80 * s); for (let i = -8; i <= 8; i++) treeRound(far, cx + i * 120 * s, g - 70 * s, 30 * s);
    const H0 = [420, 360, 500, 300, 460, 340, 390];
    H0.forEach((h, i) => { const x = cx + (-180 + i * 56) * s, w = 34 * s, top = g - 40 * s - h * s, p = i % 2 ? mid : near;
      p.moveTo(x, g - 40 * s); p.lineTo(x, top + 50 * s); p.lineTo(x + w, top); p.lineTo(x + w, g - 40 * s); p.closePath();
      for (let k = 1; k < 5; k++) rect(i % 2 ? near : mid, x - 2 * s, top + 50 * s + k * (h * s - 60 * s) / 5, w + 4 * s, 5 * s); });
    near.moveTo(cx - 300 * s, g - 40 * s); near.ellipse(cx, g - 40 * s, 300 * s, 40 * s, 0, Math.PI, 0); near.closePath();
    rect(near, cx - 1200, g, 2400, 500);
    rect(near, cx + 340 * s, g - 330 * s, 6 * s, 330 * s); const flagR = P(); rect(flagR, cx + 346 * s, g - 330 * s, 110 * s, 36 * s); // Merah Putih: red over white (the white is paper)
    car(near, cx - 520 * s, g + 70 * s, 120 * s); car(near, cx + 400 * s, g + 70 * s, 120 * s);
    acc.addPath(flagR); acc.addPath(circlePath(cx - 380 * s, g - 470 * s, 58 * s));
    return { far, mid, near, acc }; },
  function jokoDolog() { const cx = CX(), g = GY(), far = P(), mid = P(), near = P(), acc = P();
    for (let i = -6; i <= 6; i++) far.addPath(circlePath(cx + i * 170 * s, g - 10 * s, (80 + (i * 41 % 30)) * s));
    tri(mid, [cx - 330 * s, g - 340 * s], [cx, g - 450 * s], [cx + 330 * s, g - 340 * s]); rect(mid, cx - 300 * s, g - 352 * s, 600 * s, 16 * s); for (const dx of [-260, -90, 90, 260]) rect(mid, cx + (dx - 10) * s, g - 340 * s, 20 * s, 340 * s);
    rect(near, cx - 120 * s, g - 70 * s, 240 * s, 70 * s);
    near.moveTo(cx - 95 * s, g - 70 * s); near.quadraticCurveTo(cx - 108 * s, g - 150 * s, cx - 55 * s, g - 175 * s); near.lineTo(cx - 45 * s, g - 245 * s); near.arc(cx, g - 278 * s, 42 * s, Math.PI * .8, Math.PI * .2); near.lineTo(cx + 55 * s, g - 175 * s); near.quadraticCurveTo(cx + 108 * s, g - 150 * s, cx + 95 * s, g - 70 * s); near.closePath();
    for (const dx of [-470, 470]) { rect(near, cx + (dx - 6) * s, g - 160 * s, 12 * s, 160 * s); for (let k = 0; k < 7; k++) near.addPath(circlePath(cx + dx * s + Math.cos(k) * 50 * s, g - 190 * s + Math.sin(k * 1.7) * 30 * s, 30 * s)); }
    rect(near, cx - 1200, g, 2400, 500); acc.addPath(circlePath(cx - 400 * s, g - 470 * s, 60 * s));
    for (let k = 0; k < 9; k++) acc.addPath(circlePath(cx + (k < 5 ? -470 : 470) * s + Math.cos(k * 2.3) * 52 * s, g - 190 * s + Math.sin(k * 1.3) * 34 * s, 9 * s));   // frangipani flowers
    return { far, mid, near, acc }; },
  function maspati() { const cx = CX(), g = GY(), far = P(), mid = P(), near = P(), acc = P();
    rect(far, cx - 1200, g - 70 * s, 2400, 70 * s);
    for (const side of [-1, 1]) for (let i = 0; i < 3; i++) { const x = cx + side * (170 + i * 175) * s, h = (210 + (i % 2) * 40) * s; rect(mid, x - 78 * s, g - h, 156 * s, h); tri(mid, [x - 98 * s, g - h], [x, g - h - 74 * s], [x + 98 * s, g - h]); rect(near, x - 24 * s, g - 110 * s, 48 * s, 110 * s); rect(near, x - 60 * s, g - h + 40 * s, 30 * s, 40 * s); }
    rect(near, cx - 112 * s, g - 340 * s, 26 * s, 340 * s); rect(near, cx + 86 * s, g - 340 * s, 26 * s, 340 * s); rect(near, cx - 146 * s, g - 372 * s, 292 * s, 42 * s);
    rect(near, cx - 1200, g, 2400, 500);
    for (let i = 0; i < 4; i++) person(mid, cx + (-300 + i * 200) * s, g, (i % 2 ? 40 : 56) * s);
    // bunting: two strings of triangular flags across the alley (the accent), umbul-umbul poles
    for (const [y, sag] of [[g - 420 * s, 40 * s], [g - 300 * s, 30 * s]]) for (let k = 0; k < 22; k++) { const x = cx - 620 * s + k * 58 * s, yy = y + sag * Math.sin(Math.PI * k / 21); tri(acc, [x, yy], [x + 40 * s, yy + 2 * s], [x + 20 * s, yy + 40 * s]); }
    for (const dx of [-560, 560]) { rect(near, cx + (dx - 3) * s, g - 520 * s, 6 * s, 520 * s); acc.moveTo(cx + dx * s, g - 515 * s); acc.quadraticCurveTo(cx + (dx + 30) * s, g - 420 * s, cx + (dx + 12) * s, g - 300 * s); acc.lineTo(cx + dx * s, g - 300 * s); acc.closePath(); }
    return { far, mid, near, acc }; },
  function jalanGula() { const cx = CX(), g = GY(), far = P(), mid = P(), near = P(), acc = P();
    rect(far, cx - 1200, g - 400 * s, 2400, 36 * s);
    for (let i = -3; i <= 3; i++) { const x = cx + i * 200 * s, h = (240 + Math.abs(i % 2) * 30) * s; rect(mid, x - 94 * s, g - h, 188 * s, h); tri(mid, [x - 104 * s, g - h], [x, g - h - 96 * s], [x + 104 * s, g - h]);
      rect(near, x - 42 * s, g - 156 * s, 84 * s, 156 * s); rect(near, x - 16 * s, g - h - 50 * s, 32 * s, 26 * s); }
    rect(near, cx - 1200, g, 2400, 500);
    becak(near, cx - 380 * s, g + 80 * s); becak(near, cx + 240 * s, g + 80 * s);
    for (const dx of [-560, -40, 520]) lamp(near, cx + dx * s, g, 170 * s);
    acc.addPath(circlePath(cx + 360 * s, g - 470 * s, 74 * s)); for (const dx of [-560, -40, 520]) acc.addPath(rectPath(cx + (dx - 7) * s, g - 182 * s, 14 * s, 10 * s));
    return { far, mid, near, acc }; },
];
const NAMES = [['BALAI PEMUDA', 'Youth Hall'], ['BALAI KOTA', 'City Hall'], ['BAMBU RUNCING', 'Bamboo Spear Monument'], ['JOKO DOLOG', 'Joko Dolog Statue'], ['MASPATI', 'Kampung Lawas Maspati'], ['JALAN GULA', 'Sugar Street']];
// ------------------------------------------------------------------ printing
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
let T = null, REG = [], CACHE = [];
const PULL = .42, STARTS = [0, .44, .88, 1.32, 1.76];          // sky+name · bands+far · mid · accent · near+band
function skyPaths() { const g = GY(); const a = rectPath(-60, -60, VW + 120, 1200); const b = bandSteps(-60, VW + 120, g * .42, g * .42 + 160 * (TV ? 1 : .8), 5, 0); const top = rectPath(-60, -60, VW + 120, g * .42 + 2); const u = new Path2D(); u.addPath(top); u.addPath(b); return [a, u]; }
function render(t) {
  REG = []; const S = H / 1080; ctx.setTransform(S, 0, 0, S, 0, 0);
  const i = clamp(Math.floor(t / PER), 0, N - 1), lt = t - i * PER, pal = PAL[i];
  if (!CACHE[i]) CACHE[i] = ART[i]();
  const A = CACHE[i], [skyA, skyB] = skyPaths(), box = [-60, -60, VW + 120, 1200];
  paperSheet(ctx, T, -60, -60, VW + 120, 1200, .6);
  const R = mulberry(31 + i), reg = () => [(R() - .5) * 5, (R() - .5) * 5];
  const k = st => seg(lt, st, st + PULL);
  const clip = (st, sd) => { const p = k(st); return p >= 1 ? null : wipeRegion(box, 'down', eo(p), sd, 30 * (TV ? 1 : .7)); };
  const layer = (path, color, st, sd, o = {}) => { if (k(st) <= 0) return; ink(ctx, { path, ...(o.knock ? { knock: o.knock } : {}) }, { color, reg: reg(), clip: clip(st, sd), sheen: .8, trap: .6, lw: 1.6 }); };
  layer(skyA, pal[0], STARTS[0], 1); layer(skyB, pal[1], STARTS[0], 2);
  // the name, printed into the sky with the first pull, in the near ink
  if (k(STARTS[0]) > 0) { ctx.save(); const c = clip(STARTS[0], 3); if (c) ctx.clip(c); ctx.fillStyle = pal[4]; ctx.textAlign = 'center';
    ctx.font = `800 ${TV ? 156 : 88}px BigShoulders`; ctx.letterSpacing = TV ? '10px' : '5px'; ctx.fillText(NAMES[i][0], VW / 2, TV ? 200 : 290);
    ctx.font = `600 ${TV ? 28 : 19}px Outfit`; ctx.letterSpacing = TV ? '7px' : '4px'; ctx.fillText(NAMES[i][1].toUpperCase(), VW / 2, TV ? 248 : 322); ctx.restore();
    if (k(STARTS[0]) >= 1) REG.push({ id: 'p' + i, text: NAMES[i][0], x0: (VW / 2 - 420) * S, y0: ((TV ? 200 : 290) - 130) * S, x1: (VW / 2 + 420) * S, y1: (TV ? 214 : 300) * S }); }
  layer(A.far, pal[2], STARTS[1], 4); layer(A.mid, pal[3], STARTS[2], 5); layer(A.acc, pal[5], STARTS[3], 6); layer(A.near, pal[4], STARTS[4], 7, { knock: A.knock });
  // the info band, printed last with the near ink: a rule, the city, the number
  if (k(STARTS[4]) > .3) { ctx.save(); const by = TV ? 960 : 830, c = clip(STARTS[4], 8); if (c) ctx.clip(c); ctx.fillStyle = pal[0]; ctx.font = `600 ${TV ? 26 : 18}px Outfit`; ctx.letterSpacing = '4px';
    ctx.textAlign = 'left'; ctx.fillText('SURABAYA', TV ? 80 : 34, by); ctx.textAlign = 'right'; ctx.fillText(`${String(i + 1).padStart(2, '0')} / 06`, VW - (TV ? 80 : 34), by); ctx.fillRect(TV ? 80 : 34, by + 16, VW - (TV ? 160 : 68), 3); ctx.restore(); }
  inkFinish(ctx, T, -60, -60, VW + 120, 1200, .6, 1);
  // the screen and the squeegee: during each pull the frame is down and the blade crosses the sheet with its bead of the next ink
  const cur = STARTS.map((st, j) => [k(st), j]).find(([p]) => p > 0 && p < 1);
  if (cur) { const [p, j] = cur, col = [pal[0], pal[2], pal[3], pal[5], pal[4]][j], fy = wipeFront(box, 'down', eo(p), 30);
    screenFrame(ctx, [-30, -30, VW + 60, 1140], { frame: 30, lift: 0, meshLines: true });
    squeegee(ctx, [-20, fy], [VW + 20, fy], [0, 1], { scale: TV ? 1 : .7, seed: i * 5 + j, roll: t * 3, beads: [{ t0: 0, t1: 1, color: col }], handle: .5 }); }
  // (no frame between pulls: the print is left clear to be read)
}
window.render = render; window.TEXTS = () => REG.slice();
window.EV = Array.from({ length: N }, (_, i) => STARTS.map(o => ({ t: +(i * PER + o).toFixed(2), type: 'pull', poster: i }))).flat();
Promise.all(['800 40px BigShoulders', '600 20px Outfit'].map(f => document.fonts.load(f, 'A'))).then(() => { T = makeTextures(PAPER, 7); render(0); window.READY = true; });
