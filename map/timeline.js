// Explore Surabaya · Kampus Kita Seluas Kota — direction of the Transit Map spine (SECTIONS.md).
// Film time = story time (no WARP). Grid: 120 BPM, one bar = 2 s. The guest-style windows (WIN) are separate films cut
// in at the edit; here the map hides during them and, for the animatic, a placeholder card names the window.
// Format: ?fmt=reels (1080x1920) or ?fmt=tv (1920x1080); the page also reads the aspect from the viewport.
import { clamp, lerp, seg, ss, eio, eo, back } from '/core/lib.js';

const Q = new URLSearchParams(location.search);
const TV = (Q.get('fmt') || (innerWidth > innerHeight ? 'tv' : 'reels')) === 'tv';
const ANIMATIC = Q.get('animatic') !== '0';                      // placeholder cards in the windows
const DUR = TV ? 188 : 180;
const bar = (b, beat = 1) => (b - 1) * 2 + (beat - 1) * .5;     // bar.beat -> seconds
const G = 100, W = v => v * G;
let H = null;                                                    // engine helpers (init)
const st = id => { const s = window.NET.ST[id]; return [W(s[0]), W(s[1])]; };

// ------------------------------------------------------------------ windows (guest styles), film seconds
export const WIN = [
  { id: 'S0', a: 0, b: 10, style: 'Satellite Briefing', what: 'Orbit di atas Selat Madura' },
  { id: 'S2', a: 29, b: 40, style: 'Projection on White Model', what: 'Tugu Pahlawan · 10 November 1945' },
  { id: 'S3', a: 47, b: 58, style: 'Urban Sketch · Pen & Wash', what: 'Kota Lama · Gedung Cerutu' },
  { id: 'S4', a: 67, b: 76, style: 'Isometric Infographic', what: 'Monumen Kapal Selam terbuka' },
  { id: 'S5', a: 82, b: 90, style: 'Tilt-Shift Miniature', what: 'Jalan Tunjungan · jam sibuk' },
  { id: 'S6', a: 92, b: 104, style: 'Silkscreen Travel Poster', what: '6 kartu pos kota' },
  { id: 'S7', a: 107, b: 116, style: 'Low-poly Isometric Island', what: 'Kebun Binatang · Sura & Baya' },
  { id: 'S8', a: 128, b: 135, style: 'Satellite Briefing', what: 'Suramadu · 5.438 m' },
  { id: 'S9', a: 141, b: 151, style: 'Paper-cut Lightbox', what: 'Malam di Kya-Kya' },
];
const inWin = t => WIN.find(w => t >= w.a && t < w.b);

// ------------------------------------------------------------------ growth phases
const P = (path, a, b, keys, extra = {}) => ({ path, a, b, t0: keys[0][0], t1: keys[keys.length - 1][0], keys, ...extra });
const PHASES = [
  P('M', 'UT', 'TUGU', [[20.0, 'UT'], [20.7, 'KLM'], [22.7, 'KTJ'], [23.8, 'KTB'], [25.0, 'PDN'], [26.0, 'GNI'], [27.0, 'TUGU']], { yearLabel: 'Sejarah' }),
  P('K', 'TUGU', 'JMR', [[42.0, 'TUGU'], [43.0, 'CRT'], [44.2, 'MBI'], [46.0, 'JMR']], { yearLabel: 'Arsitektur' }),
  P('B', 'KTB', 'MKS', [[60.0, 'KTB'], [64.8, 'MKS']], { yearLabel: 'Teknologi' }),
  P('H', 'GNI', 'BRC', [[78.0, 'GNI'], [78.6, 'SIO'], [79.2, 'TJG'], [79.8, 'BPM'], [80.4, 'JKD'], [81.2, 'BKT'], [82.0, 'BRC']], { yearLabel: 'Ruang Publik' }),
  P('O', 'JKD', 'KBS', [[104.0, 'JKD'], [104.9, 'BGK'], [105.7, 'SBY'], [106.4, 'KBS']], { yearLabel: 'Alam' }),
  P('N', 'MBI', 'SRM', [[118.0, 'MBI'], [119.4, 'PRK'], [120.2, 'UJG'], [121.8, 'KJR'], [123.0, 'SRM']], { yearLabel: 'Rekayasa' }),
  P('N', 'SRM', 'BKL', [[123.4, 'SRM'], [127.4, 'BKL']], { lin: true }),
  P('U', 'JMR', 'KYA', [[138.0, 'JMR'], [139.0, 'ABH'], [140.0, 'KYA']], { yearLabel: 'Budaya' }),
  // finale: six tips converge on the campus; the first arrival makes UT an interchange and it falls (160.0)
  P('B', 'MKS', 'UT', [[154.6, 'MKS'], [160.0, 'UT']]),
  P('K', 'JMR', 'UT', [[154.8, 'JMR'], [160.05, 'UT']]),
  P('U', 'KYA', 'UT', [[155.2, 'KYA'], [160.1, 'UT']]),
  P('H', 'BRC', 'UT', [[155.0, 'BRC'], [160.15, 'UT']]),
  P('Nb', 'SRM', 'UT', [[155.6, 'SRM'], [160.2, 'UT']]),
  P('O', 'KBS', 'UT', [[154.4, 'KBS'], [160.25, 'UT']]),
];
const COURSE = [   // [time it lands on the counter, number, ID, EN]
  [0, 0, '', ''], [27.0, 1, 'Sejarah', 'History'], [46.0, 2, 'Arsitektur', 'Architecture'], [64.8, 3, 'Teknologi', 'Technology'],
  [82.0, 4, 'Ruang Publik', 'Public Space'], [106.4, 5, 'Alam', 'Nature'], [123.0, 6, 'Rekayasa', 'Engineering'], [140.0, 7, 'Budaya', 'Culture'],
];

// ------------------------------------------------------------------ camera
const lz = (a, b, u) => Math.exp(lerp(Math.log(a), Math.log(b), u));
function mixCam(a, b, u) { return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: lz(a.z, b.z, u), tilt: lerp(a.tilt, b.tilt, u), head: lerp(a.head || 0, b.head || 0, u), ap: lerp(a.ap || 0, b.ap || 0, u), focus: 1, far: Math.max(a.far || 5, b.far || 5) }; }
const zf = (zTv, zV) => TV ? zTv : (zV ?? zTv);                   // zoom per format (px per world unit, 1080-high frame)
function tip(key, t) {                                            // the pen tip of the phase drawing `key` at time t (world)
  const o = H.PH.filter(p => p.path.key === key && t >= p.t0 - .01).pop() || H.PH.find(p => p.path.key === key);
  const s = t <= o.t0 ? o.s0 : t >= o.t1 ? o.s1 : lerp(o.s0, o.s1, clamp(o.f(t)));
  return H.pointAt(o.path, s);
}
function smoothTip(key, t, w = .4) { let x = 0, y = 0; const n = 7; for (let i = 0; i < n; i++) { const q = tip(key, t + (i / (n - 1) - .5) * w); x += q[0]; y += q[1]; } return [x / n, y / n]; }
const at = (id, z, tilt = 0, extra = {}) => { const [x, y] = st(id); return { x, y, z, tilt, head: 0, ap: tilt > 10 ? 8 : 0, ...extra }; };
function ride(key, t, z, tilt = 22, lead = 1.5, head = -4) {
  if (!TV) { lead *= .55; z *= .9; } else lead *= .75;
  const a = smoothTip(key, t - .05), b = smoothTip(key, t + .05), d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const p = smoothTip(key, t);
  return { x: p[0] + (b[0] - a[0]) / d * W(lead), y: p[1] + (b[1] - a[1]) / d * W(lead), z, tilt, head, ap: 16 };
}
// a push onto a station: the dot grows toward the cut into the window (match cut on round shapes)
const pushTo = (id, from, t, t0, t1) => mixCam(from, at(id, 3.2, 0, { ap: 0 }), eio(seg(t, t0, t1)));
const pullFrom = (id, to, t, t0, t1) => mixCam(at(id, 3.2, 0, { ap: 0 }), to, eio(seg(t, t0, t1)));
const WIDE = { x: W(3.6), y: W(-3.4), z: zf(.33, .3), tilt: 0, head: 0, ap: 0 };
const ALL = { x: W(TV ? 5.2 : 5.4), y: W(-2.6), z: zf(.34, .275), tilt: 0, head: 0, ap: 0 };
const ENDB = { x: W(5.4), y: W(TV ? 11.4 : 9.0), z: zf(.86, .3), tilt: 0, head: 0, ap: 0 };

function camera(t) {
  if (t < 10) return at('UT', 1.0, 4, { ap: 3 });
  if (t < 15) return mixCam(at('UT', zf(.95, .8), 6, { ap: 3 }), at('UT', zf(1.7, 1.5), 0), eio(seg(t, 10, 15)));            // push in under the veil
  if (t < 20) return mixCam(at('UT', zf(1.7, 1.5), 0), { x: W(TV ? 12.6 : 13.4), y: W(TV ? 3.4 : 5.2), z: zf(.85, .72), tilt: 30, head: 8, ap: 10 }, eio(seg(t, 15, 18.6)));   // rise: the cartouche and the sheet edge
  if (t < 22.5) return mixCam(camera(19.99), ride('M', t, zf(1.5, 1.4), 20, 1.5, -8), eio(seg(t, 20, 22.5)));
  if (t < 26.6) return ride('M', t, zf(1.5, 1.4), 22, 1.5, -8);
  if (t < 29) { const h = mixCam(ride('M', 26.6, zf(1.5, 1.4), 22, 1.5, -8), at('TUGU', zf(1.7, 1.15), 6, { ap: 4, y: W(window.NET.ST.TUGU[1] - (TV ? 0 : 1.0)) }), eio(seg(t, 26.6, 27.6)));   // hold on the monument: the 1945 callout
    return t < 28 ? h : pushTo('TUGU', h, t, 28, 29); }
  if (t < 40) return at('TUGU', 3.2);
  if (t < 42.6) return pullFrom('TUGU', ride('K', 42.6, zf(1.5, 1.4), 22, 1.5, 0), t, 40, 42.6);
  if (t < 45.8) return ride('K', t, zf(1.5, 1.4), 22, 1.5, 0);
  if (t < 47) { const h = mixCam(ride('K', 45.8, zf(1.5, 1.4), 22, 1.5, 0), at('JMR', 1.7, 4), eio(seg(t, 45.8, 46.3))); return t < 46.3 ? h : pushTo('JMR', h, t, 46.3, 47); }
  if (t < 58) return at('JMR', 3.2);
  if (t < 60.6) return pullFrom('JMR', ride('B', 60.6, zf(1.6, 1.5), 22, 1.2, 0), t, 58, 60.6);
  if (t < 64.6) {                                                                                     // along the Kalimas: the camera drops low
    const r = ride('B', t, zf(1.6, 1.5), 22, 1.2, 0), low = ss(seg(t, 61.2, 61.9)) * (1 - ss(seg(t, 63.6, 64.4)));
    return low > 0 ? mixCam(r, { ...r, x: r.x - W(.6), z: zf(1.85, 1.7), tilt: 58, head: -12, ap: 26 }, low) : r;
  }
  if (t < 67) { const h = mixCam(ride('B', 64.6, zf(1.6, 1.5), 22, 1.2, 0), at('MKS', 1.7, 4), eio(seg(t, 64.6, 65.5))); return t < 66 ? h : pushTo('MKS', h, t, 66, 67); }
  if (t < 76) return at('MKS', 3.2);
  if (t < 78.4) return pullFrom('MKS', ride('H', 78.4, zf(1.35, 1.25), 18, 1.6, 0), t, 76, 78.4);
  if (t < 81.6) return ride('H', t, zf(1.35, 1.25), 18, 1.6, 0);
  if (t < 82) return pushTo('BRC', ride('H', 81.6, zf(1.35, 1.25), 18, 1.6, 0), t, 81.6, 82);
  if (t < 90) return at('BRC', 3.2);
  if (t < 92) return pullFrom('BRC', { ...WIDE, z: zf(.5, .42), tilt: 12, ap: 4 }, t, 90, 92);   // the network so far, then the poster montage (hard cut on the downbeat)
  if (t < 104) return { ...WIDE, z: zf(.5, .42), tilt: 12, ap: 4 };
  if (t < 106.1) return mixCam(at('JKD', 1.6, 20, { ap: 12 }), ride('O', 106.1, zf(1.5, 1.4), 22, 1.4, 0), eio(seg(t, 104, 105)));
  if (t < 107) return pushTo('KBS', ride('O', 106.1, zf(1.5, 1.4), 22, 1.4, 0), t, 106.1, 107);
  if (t < 116) return at('KBS', 3.2);
  if (t < 118.6) return pullFrom('KBS', { ...at('MBI', zf(.9, .8), 16, { ap: 6 }) }, t, 116, 118.6);                       // glide north across the city to the port
  if (t < 122.6) return mixCam(at('MBI', zf(.9, .8), 16, { ap: 6 }), ride('N', t, zf(1.35, 1.25), 22, 1.6, 0), eio(seg(t, 118.6, 119.6)));
  if (t < 127.4) {                                                                                    // across the strait: low, looking north along the bridge
    const r = ride('N', t, zf(1.35, 1.25), 22, 1.6, 0), low = { ...tipCam(t), z: zf(1.85, 1.7), tilt: 60, head: 0, ap: 26 };
    return mixCam(r, low, eio(seg(t, 122.6, 123.6)));
  }
  if (t < 128) return pushTo('BKL', { ...tipCam(127.4), z: zf(1.85, 1.7), tilt: 60, head: 0, ap: 26 }, t, 127.4, 128);
  if (t < 135) return at('BKL', 3.2);
  if (t < 138.6) return pullFrom('BKL', ride('U', 138.6, zf(1.5, 1.4), 22, 1.4, 0), t, 135, 138.6);
  if (t < 140) return ride('U', t, zf(1.5, 1.4), 22, 1.4, 0);
  if (t < 141) return pushTo('KYA', ride('U', 140, zf(1.5, 1.4), 22, 1.4, 0), t, 140, 141);
  if (t < 151) return at('KYA', 3.2);
  if (t < 154) return pullFrom('KYA', { x: W(3.6), y: W(-6.6), z: zf(.75, .65), tilt: 10, head: 0, ap: 4 }, t, 151, 154);     // the breath before the finale
  if (t < 158.6) return mixCam({ x: W(3.6), y: W(-6.6), z: zf(.75, .65), tilt: 10, head: 0, ap: 4 }, { ...WIDE, x: W(4.6), y: W(-2.6), z: zf(.42, .36), tilt: 6 }, eio(seg(t, 154, 157)));   // six tips converge
  if (t < 160.5) return mixCam({ ...WIDE, x: W(4.6), y: W(-2.6), z: zf(.42, .36), tilt: 6 }, at('UT', zf(1.3, 1.2), 14, { ap: 8 }), eio(seg(t, 158.6, 159.9)));
  if (t < 169) {                                                                                     // the long take: a low oblique sweep over the living network
    const u = seg(t, 160.5, 169);
    const sweep = { x: lerp(W(9.2), W(2.0), ss(u)), y: lerp(W(-1.4), W(-4.6), ss(u)), z: zf(1.0, .9), tilt: lerp(57, 62, u), head: lerp(-22, 18, ss(u)), ap: 24, far: 7 };
    return mixCam(at('UT', zf(1.3, 1.2), 14, { ap: 8 }), sweep, eio(seg(t, 160.5, 161.6)));
  }
  if (t < 175.5) return mixCam({ x: W(2.0), y: W(-4.6), z: zf(1.0, .9), tilt: 62, head: 18, ap: 24, far: 7 }, ALL, eio(seg(t, 169, 172.2)));   // pull back: the whole network
  return mixCam(ALL, ENDB, eio(seg(t, 175.5, 177.2)));                       // onto the end block: tagline and logos
}
// audit v2: the map stays flat (top view, no tilt, no depth of field); ?flat=0 brings the oblique camera back
const FLAT = Q.get('flat') !== '0';
function flatCam(t) { const c = camera(t); return FLAT ? { ...c, tilt: 0, head: 0, ap: 0 } : c; }
function tipCam(t) { const p = tip('N', t); return { x: p[0], y: p[1] - W(1.6), z: 1.8, tilt: 60, head: 0, ap: 26 }; }

// ------------------------------------------------------------------ sheet
const SHEET = FLAT_SHEET();
function FLAT_SHEET() { return new URLSearchParams(location.search).get('flat') === '0' ? [W(-6.4), W(-18.6), W(17.8), W(13.6)] : [W(-24), W(-30), W(36), W(24)]; }   // flat: the paper fills every frame
const MUTEDC = '#77736b';
function rt(c, K, id, s, x, y, size, a = 1) {                   // register a printed line (alphabetic baseline) for readcheck
  if (!K || !K.regW) return; const w = c.measureText(s).width, al = c.textAlign, x0 = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x;
  K.regW(id, s, x0, y - size * .9, x0 + w, y + size * .25, a, 12);
}
function furniture(c, t, view, K) {
  const { F, INK } = K;
  // the cartouche (south-east of the campus): the map's name is the film's title
  const x = W(10.8), y = W(5.0);
  c.save(); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  c.fillStyle = '#034693'; c.fillRect(x, y, 110, 12);
  c.fillStyle = INK; c.font = F(900, 54); c.fillText('EXPLORE SURABAYA', x, y + 86); rt(c, K, 'cart-title', 'EXPLORE SURABAYA', x, y + 86, 54);
  c.font = F(700, 38); c.fillText('Kampus Kita Seluas Kota', x, y + 146); rt(c, K, 'cart-sub', 'Kampus Kita Seluas Kota', x, y + 146, 38);
  c.font = F(500, 27); c.fillStyle = '#4a4740'; c.fillText('Our campus is the whole city', x, y + 184); rt(c, K, 'cart-sub-en', 'Our campus is the whole city', x, y + 184, 27);
  c.fillStyle = INK; c.fillRect(x, y + 214, 60, 4);
  c.font = F(600, 24); c.fillText('UT Surabaya · Jl. Dr. Ir. H. Soekarno', x, y + 254);
  c.font = F(500, 20); c.fillStyle = MUTEDC; c.fillText('Peta wisata ilustratif — bukan rute transportasi resmi', x, y + 290); c.fillText('Illustrative tour map — not an official transport network', x, y + 316);
  // line legend: one course per colour
  const Ls = window.NET.LINES; c.font = F(600, 22);
  Ls.forEach((L, i) => { const ly = y + 372 + i * 40; K.roundel(c, x + 20, ly - 8, L.id, .62); c.fillStyle = INK; c.textAlign = 'left'; c.fillText(L.name, x + 48, ly); });
  c.restore();
  // end block in the bottom margin: the tagline, printed in UT blue and yellow (NASKAH.md)
  endBlock(c, t, K);
}
function endBlock(c, t, K) {
  const { F } = K; const k = t - 170.4; if (k < 0) return;
  const x0 = W(-4.4), y0 = W(9.4), w = W(19.6), h = W(3.7);
  const u = eo(seg(k, 0, .5));
  c.save(); c.globalAlpha = u;
  c.fillStyle = '#034693'; c.beginPath(); c.roundRect(x0, y0, w * eo(seg(k, 0, .45)), h, 26); c.fill();
  c.globalAlpha = u * seg(k, .25, .6);
  c.fillStyle = '#FFDD00'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  c.font = F(900, 118).replace('900', 'italic 900').replace('Inter', 'InterI'); c.fillText('Rek, ojo mung liwat!', x0 + w / 2, y0 + 150); rt(c, K, 'tag1', 'Rek, ojo mung liwat!', x0 + w / 2, y0 + 150, 118, c.globalAlpha);
  c.font = F(900, 80).replace('900', 'italic 900').replace('Inter', 'InterI'); c.fillText('Mampiro, akeh karya apik nang kene!', x0 + w / 2, y0 + 258); rt(c, K, 'tag2', 'Mampiro, akeh karya apik nang kene!', x0 + w / 2, y0 + 258, 80, c.globalAlpha);
  c.font = F(600, 30); c.fillStyle = '#ffffff'; c.fillText("Hey, don't just walk by — drop in, there's so much great work here!", x0 + w / 2, y0 + 316);
  c.restore();
}
function waterLabels(c, t, view, { F }) {
  c.save(); c.textBaseline = 'alphabetic'; c.fillStyle = '#5F88AD';
  c.font = F(700, 24); c.save(); c.translate(-12, W(4.6)); c.rotate(-Math.PI / 2); c.textAlign = 'center'; c.fillText('KALIMAS', 0, 0); c.restore();
  c.textAlign = 'left'; c.font = F(700, 30); c.fillText('Selat Madura', W(-4.6), W(-13.9)); c.font = F(500, 22); c.fillText('Madura Strait', W(-4.6), W(-13.5));
  c.fillStyle = '#77736b'; c.font = F(700, 30); c.fillText('Pulau Madura', W(12.6), W(-17.3)); c.font = F(500, 22); c.fillText('Madura Island', W(12.6), W(-16.9));
  c.restore();
}

// ------------------------------------------------------------------ printed callouts on the sheet
function callout(c, K, id, x, y, big, line1, line2, k, color = '#E53E31') {
  const { F, INK } = K; if (k <= 0) return; const u = eo(seg(k, 0, .5));
  c.save(); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  c.fillStyle = color; c.fillRect(x, y, 10, 150 * u);
  c.save(); c.beginPath(); c.rect(x, y - 10, 900 * u, 200); c.clip();
  c.fillStyle = INK; c.font = F(900, 58); c.fillText(big, x + 26, y + 54); rt(c, K, id + 'a', big, x + 26, y + 54, 58);
  c.font = F(700, 34); c.fillText(line1, x + 26, y + 100); rt(c, K, id + 'b', line1, x + 26, y + 100, 34);
  c.font = F(500, 24); c.fillStyle = '#4a4740'; c.fillText(line2, x + 26, y + 134); rt(c, K, id + 'c', line2, x + 26, y + 134, 24);
  c.restore(); c.restore();
}
function annotations(c, t, view, K) {
  // you are here (S1): the campus before any line is drawn
  if (t >= 10 && t < 22) {
    const [x, y] = st('UT'), a = seg(t, 10.3, 10.8) * (1 - seg(t, 21.2, 22));
    c.save(); c.globalAlpha = a;
    const p = (t * .9) % 1; c.lineWidth = 4; c.strokeStyle = '#E53E31'; c.globalAlpha = a * (1 - p) * .7; c.beginPath(); c.arc(x, y, 17 + 46 * p, 0, 7); c.stroke();
    c.globalAlpha = a; c.beginPath(); c.arc(x, y, 17, 0, 7); c.fillStyle = '#E53E31'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#fff'; c.stroke();
    c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillStyle = '#1b1c1e'; c.font = K.F(800, 30); c.fillText('Anda di sini', x + 34, y - 2); rt(c, K, 'here', 'Anda di sini', x + 34, y - 2, 30, a);
    c.font = K.F(600, 21); c.fillStyle = '#4a4740'; c.fillText('You are here · UT Surabaya', x + 34, y + 26);
    c.restore();
  }
  const [tx, ty] = st('TUGU');
  callout(c, K, 'c1945', tx - W(1.4), ty - W(3.0), '10·11·1945', 'Hari Pahlawan', "Heroes' Day", t >= 27.2 && t < 29 ? t - 27.2 : t >= 40 && t < 42.6 ? t - 39 : -1);
  const [sx, sy] = st('SRM');
  callout(c, K, 'csrm', sx + W(.5), sy - W(2.9), '5.438 m', 'Diresmikan 10 Juni 2009', 'Opened 10 June 2009', t >= 125.2 && t < 128 ? t - 125.2 : t >= 135 && t < 138.4 ? t - 134 : -1, '#0E497A');
}
function veil(t) { return t < 10 ? 1 : t < 17 ? 1 - ss(seg(t, 15.2, 17)) : t >= 151 && t < 156 ? .55 * seg(t, 151, 152) * (1 - seg(t, 154.2, 156)) : 0; }

// ------------------------------------------------------------------ trains on the finished network (finale)
function trains(c, t, { PATHS, train, pointAt }) {
  if (t < 160.6) return;
  const a = seg(t, 160.6, 161.4);
  for (const p of Object.values(PATHS)) {
    const L = window.NET.LINES.find(l => l.id === p.line), sp = 200, gap = 400;
    for (let s0 = 0; s0 < p.total; s0 += gap) for (const dir of [1, -1]) {
      const s = ((s0 + dir * sp * (t - 160) + (dir < 0 ? gap / 2 : 0)) % p.total + p.total) % p.total;
      train(c, p, s, L.color, a);
    }
  }
}

// ------------------------------------------------------------------ screen space (virtual frame: VW x 1080)
const LOGOS = {}; window.__ASSETS = Promise.all(['ut', 'senmaster', 'lppm-ut'].map(n => new Promise(res => { const im = new Image(); im.onload = () => { LOGOS[n] = im; res(); }; im.onerror = () => { if (!im.dataset.up) { im.dataset.up = 1; im.src = `../brand/logo-${n}.png`; } else res(); }; im.src = `brand/logo-${n}.png`; })));
const VO = [   // NASKAH.md: [bar, beat, seconds spoken, ID, EN]
  [1, 3, 4.2, 'Rek, deloken teko nduwur. Suroboyo iku mek sak titik.', 'Look from above, folks. Surabaya is just one dot.'],
  [6, 3, 4.9, 'Tapi gawe arek-arek Universitas Terbuka, titik iki awal sak kampus.', 'But for us at Universitas Terbuka, this dot is where a campus begins.'],
  [9, 3, 2.2, 'Kampus sing gak onok pagere.', 'A campus with no fences.'],
  [12, 1, 2.3, 'Mata kuliah siji: Sejarah.', 'Course one: History.'],
  [15, 1, 5.4, '10 November 1945, arek-arek Suroboyo milih ngelawan.', '10 November 1945: the people of Surabaya chose to fight back.'],
  [18, 3, 5.0, 'Tugu 41,15 meter iki nyimpen tanggal iku nang bentuke.', 'This 41.15-metre monument keeps that date in its shape.'],
  [22, 3, 5.6, 'Loro: Arsitektur. Kota lama ngajari awakdewe moco gedung koyok moco buku.', 'Two: Architecture. The old town teaches us to read buildings like books.'],
  [31, 3, 5.5, 'Telu: Teknologi. Kapal selam temenan, saiki nyandar nang pinggir Kalimas.', 'Three: Technology. A real submarine, now moored on the Kalimas.'],
  [40, 2, 5.1, 'Papat: Ruang Publik. Nang Tunjungan, kutho iki sinau mlaku bareng.', 'Four: Public Space. On Tunjungan, the city learns to walk together.'],
  [53, 2, 4.8, 'Limo: Alam. Jare legenda, Sura si iwak hiu ambek Baya si boyo…', 'Five: Nature. Legend says Sura the shark and Baya the crocodile…'],
  [56, 3, 3.0, '…sing gelut, terus dadi jenenge kutho iki.', '…fought, and gave this city its name.'],
  [60, 3, 1.6, 'Enem: Rekayasa.', 'Six: Engineering.'],
  [64, 1, 4.9, '5.438 meter, nyambung Jowo ambek Meduro.', '5,438 metres, joining Java and Madura.'],
  [70, 3, 1.4, 'Pitu: Budaya.', 'Seven: Culture.'],
  [72, 1, 6.0, 'Bengi iku awakdewe sadar… kabeh sing disinaoni dino iki, disinaoni nang njobo kelas.', 'That night we realised… everything we learned today, we learned outside a classroom.'],
  [82, 1, 4.2, 'Universitas Terbuka Surabaya. Kampuse… sak kutho.', 'Universitas Terbuka Surabaya. Our campus… is the whole city.'],
].map(([b, bt, d, id, en]) => { const t0 = bar(b, bt), need = Math.max(1.8, d + .6, id.length / 15 + 1.5); return { t0, t1: t0 + need, id, en }; });
export const SUBS = VO;
function wrap(c, s, maxW) { const w = s.split(' '), out = []; let cur = ''; for (const x of w) { const n = cur ? cur + ' ' + x : x; if (c.measureText(n).width > maxW && cur) { out.push(cur); cur = x; } else cur = n; } if (cur) out.push(cur); return out; }
function subtitles(c, t, F, R) {
  const s = VO.find(v => t >= v.t0 && t < v.t1); if (!s) return;
  const vw = window.VW(), a = seg(t, s.t0, s.t0 + .15) * (1 - seg(t, s.t1 - .15, s.t1));
  const fs = TV ? 40 : 23, fe = TV ? 26 : 15, maxW = vw * (TV ? .7 : .86);
  c.save(); c.font = F(700, fs); const L1 = wrap(c, s.id, maxW); c.font = F(500, fe); const L2 = wrap(c, s.en, maxW);
  const lh1 = fs * 1.22, lh2 = fe * 1.3, hh = L1.length * lh1 + L2.length * lh2 + (TV ? 30 : 18);
  const cy = TV ? 1080 - 70 - hh : 760 - hh / 2;   // reels: inside 1300–1480 px of 1920
  let wmax = 0; c.font = F(700, fs); L1.forEach(l => wmax = Math.max(wmax, c.measureText(l).width)); c.font = F(500, fe); L2.forEach(l => wmax = Math.max(wmax, c.measureText(l).width));
  c.globalAlpha = a; c.fillStyle = 'rgba(242,238,229,.9)'; c.beginPath(); c.roundRect(vw / 2 - wmax / 2 - 18, cy, wmax + 36, hh, 10); c.fill();
  c.textAlign = 'center'; c.textBaseline = 'top'; let y = cy + (TV ? 15 : 9);
  c.fillStyle = '#1b1c1e'; c.font = F(700, fs); for (const l of L1) { c.fillText(l, vw / 2, y); y += lh1; }
  c.fillStyle = '#4a4740'; c.font = F(500, fe); for (const l of L2) { c.fillText(l, vw / 2, y); y += lh2; }
  c.restore();
}
function counter(c, t, F, R) {
  if (t < 10 || t >= 154) return;
  const vw = window.VW(), k = TV ? 1 : .8, X = TV ? 34 : 18, Y = TV ? 34 : 132;                 // reels: below the top 220 px of 1920
  const cur = [...COURSE].reverse().find(q => t >= q[0]) || COURSE[0], prev = COURSE[Math.max(0, COURSE.indexOf(cur) - 1)];
  const a = seg(t, 10.4, 11) * (1 - seg(t, 153.4, 154));
  c.save(); c.translate(X, Y); c.scale(k, k); c.globalAlpha = a;
  c.fillStyle = '#23211f'; c.beginPath(); c.roundRect(0, 0, 470, 104, 14); c.fill();
  c.fillStyle = '#5a554c'; for (const [sx, sy] of [[12, 12], [458, 12], [12, 92], [458, 92]]) { c.beginPath(); c.arc(sx, sy, 4, 0, 7); c.fill(); }
  c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillStyle = '#efe8d8'; c.font = F(700, 24); c.fillText('Mata kuliah', 26, 42); c.font = F(500, 17); c.fillStyle = '#aaa395'; c.fillText('Courses', 26, 66);
  // the drum: rolls 0.5 s into the new value, lands only on true counts
  const roll = eo(seg(t, cur[0], cur[0] + .5)), dx = 170;
  c.save(); c.beginPath(); c.roundRect(dx, 20, 46, 66, 6); c.fillStyle = '#efe8d8'; c.fill(); c.clip();
  c.fillStyle = '#1b1c1e'; c.font = F(900, 50); c.textAlign = 'center';
  const yA = 72 - 66 * roll; c.fillText(String(prev[1]), dx + 23, yA); c.fillText(String(cur[1]), dx + 23, yA + 66);
  c.restore();
  c.fillStyle = '#aaa395'; c.font = F(700, 26); c.fillText('/ 7', dx + 56, 66);
  if (cur[2]) { const ca = seg(t, cur[0] + .3, cur[0] + .7); c.globalAlpha = a * ca; c.fillStyle = '#efe8d8'; c.font = F(800, 26); c.fillText(cur[2], 290, 48); c.font = F(500, 17); c.fillStyle = '#aaa395'; c.fillText(cur[3], 290, 72);
    if (ca > .9) { R.regS('course', cur[2], X + 290 * k, Y + 24 * k, X + 450 * k, Y + 52 * k); } }
  c.restore();
}
function logoPlate(c, t, O) {                                   // the end block's logo row: exact colours, outside the paper grade
  const k = t - 175.6; if (k < 0) return;
  const p0 = O.toScreen(O.b, W(-4.4), W(13.25)), p1 = O.toScreen(O.b, W(15.2), W(13.25)); if (!p0 || !p1) return;
  const a = seg(k, 0, .6), vw = window.VW();
  const hh = TV ? 120 : 92, gap = TV ? 40 : 22, pad = TV ? 26 : 16;
  const ims = [['ut', 1], ['senmaster', 1], ['lppm-ut', 2771 / 1199]].filter(([n]) => LOGOS[n]);
  const ws = ims.map(([, r]) => hh * r), tw = ws.reduce((s, w) => s + w, 0) + gap * (ims.length - 1);
  const cx = vw / 2, y = Math.min(p0[1] + 18, 1080 - hh - pad * 2 - 30);
  c.save(); c.globalAlpha = a; c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(cx - tw / 2 - pad, y, tw + pad * 2, hh + pad * 2, 16); c.fill();
  let x = cx - tw / 2; ims.forEach(([n], i) => { c.drawImage(LOGOS[n], x, y + pad, ws[i], hh); x += ws[i] + gap; });
  c.restore();
}
function placeholder(c, t, w, F) {                              // animatic only: the guest window to be cut in here
  const vw = window.VW();
  c.save(); c.fillStyle = '#121212'; c.fillRect(0, 0, vw, 1080);
  const u = seg(t, w.a, w.a + .4), r = lerp(27, Math.hypot(vw, 1080) * .32, eo(u));
  c.beginPath(); c.arc(vw / 2, 540, r, 0, 7); c.fillStyle = '#1e1d1b'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#3a3833'; c.stroke();
  c.fillStyle = '#efe8d8'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  c.font = F(600, TV ? 22 : 15); c.fillStyle = '#aaa395'; c.fillText(`JENDELA ${w.id} · ${(w.a).toFixed(0)}–${w.b.toFixed(0)} s`, vw / 2, 470);
  c.font = F(800, TV ? 46 : 28); c.fillStyle = '#efe8d8'; c.fillText(w.style, vw / 2, 530);
  c.font = F(500, TV ? 28 : 18); c.fillStyle = '#cfc7b6'; c.fillText(w.what, vw / 2, 572);
  c.restore();
}
function overlay(c, t, O) {
  const { F } = O, w = inWin(t);
  if (w) { if (ANIMATIC) placeholder(c, t, w, F); }
  else { counter(c, t, F, O); logoPlate(c, t, O); }
  if (TV && t >= 180) tvTail(c, t, O);
  if (Q.get('subs') !== '0') subtitles(c, t, F, O);
}
function tvTail(c, t, O) {                                      // TV: hold the tagline, then the loop bridge back to frame 0
  const u = seg(t, 186, 188); if (u <= 0) return; const vw = window.VW();
  c.save(); c.globalAlpha = eo(u); c.fillStyle = '#121212'; c.fillRect(0, 0, vw, 1080); c.restore();
}

// ------------------------------------------------------------------ cues for the score
const CUES = [
  { t: 0, type: 'orbit' }, { t: 10, type: 'cut' }, { t: 10.2, type: 'chime' }, { t: 21.0, type: 'hush' }, { t: 27.2, type: 'callout' },
  ...WIN.map(w => ({ t: w.a, type: 'window', id: w.id })), ...WIN.map(w => ({ t: w.b, type: 'return', id: w.id })),
  { t: 123.6, type: 'crossing' }, { t: 125.2, type: 'callout' }, { t: 152.0, type: 'hush' }, { t: 154.0, type: 'chime' },
  { t: 160.0, type: 'landing' }, { t: 160.6, type: 'sweep' }, { t: 169.0, type: 'rise' }, { t: 170.4, type: 'tagline' }, { t: 175.6, type: 'logos' },
];

const drops = { UT: true, TUGU: true, JMR: true };
// the campus landing: shock rings in every course colour, in the order of the SENMASTER figures (blue, green, red, yellow), then the rest
const RING = ['#2CACE2', '#00A54E', '#E53E31', '#F6EC25', '#F28C28', '#0E497A', '#7B4FA2'];
function dropRing(c, n, k2, { capsule, INK }) {
  if (k2 < 0) return;
  const many = n.id === 'UT', dur = many ? 1.6 : .9;
  if (k2 < dur) { const v = k2 / dur;
    c.save(); c.globalAlpha *= (1 - v) * .75; c.lineWidth = 7; c.strokeStyle = INK; c.beginPath(); c.arc(n.cx, n.cy, 30 + (many ? 420 : 230) * eo(v), 0, 7); c.stroke(); c.restore();
    const cols = many ? RING : [...n.pts].sort((p, q) => p.tl - q.tl).map(p => window.NET.LINES.find(l => l.id === p.line).color);
    cols.forEach((col, i) => { const vi = clamp((v - i * .06) * 1.25); if (vi <= 0 || vi >= 1) return;
      c.save(); c.globalAlpha *= (1 - vi) * .9; c.lineWidth = 6; c.strokeStyle = col; c.beginPath(); c.arc(n.cx, n.cy, 30 + (many ? 360 : 170) * eo(vi), 0, 7); c.stroke(); c.restore(); });
  }
  capsule(c, n, 1 + .18 * Math.exp(-k2 * 14) * Math.cos(k2 * 40), 7);
}
export const DATA = {
  DUR, SHEET, PHASES, camera: flatCam, furniture, waterLabels, annotations, overlay, trains, veil, drops, dropRing,
  tunnelOnly: t => !!inWin(t) || (TV && t >= 187.9),
  cues: CUES,
  noRoundel: [],
  roundelPos: { M: [10.9, -2.0], K: [-4.4, -5.0], B: [2.2, -4.6], H: [-4.4, -3.2], O: [-2.2, 1.9], N: [-4.4, -9.2], U: [-1.2, -9.9] },
  roundelAlpha: (t, id) => 1 - seg(t, 152, 154) * (t < 170 ? 1 : 0),
  stationDim: (n, t, v) => 1 - .8 * v * (n.id === 'UT' ? 0 : 1),
  labelOnly: t => t >= 160.5 && t < 169 ? ['UT', 'MKS', 'GBG', 'KTB', 'TUGU', 'JMR', 'KYA', 'MLY', 'KLM'] : t >= 169 ? ['UT', 'TUGU', 'JMR', 'MKS', 'KBS', 'SRM', 'BKL', 'TJG', 'KYA', 'GNI', 'MBI', 'SBY'] : null,
  LABEL_PREF: { UT: 'e', TUGU: 'e', JMR: 'n', MKS: 'se', SRM: 'e', BKL: 'e', KBS: 'e', KTB: 'ne', SBY: 'e', BGK: 'e', KYA: 's', PDN: 'n' },
  init(h) { H = h; },
};
