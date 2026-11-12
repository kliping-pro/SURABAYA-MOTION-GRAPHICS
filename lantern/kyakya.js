// Paper-cut Lightbox window S9 v2 (10 s): Kya-Kya Kembang Jepun, the Chinatown night market (STYLE: styles/paper-lantern).
// Built on the library's lightbox engine (src/: paper sheets backlit through the pulp, lit top rims, glow maps, VSM soft
// shadows from a top LED, depth of field and bloom). Full-bleed: the lens is inside the box.
// One warm Chinatown-night ladder: plum-indigo sky -> rose-brown far roofs -> deep red ruko and gate -> near-black front.
// Light is gold; the accent is lantern red. The layers switch on from the back: roof windows, string lights, the shophouses,
// the gate, the big lanterns (from the centre outwards), the stalls, the lanterns in front. Everything stays lit.
import * as THREE from 'three';
import { Pipe } from './src/post.js';
import { sheet, skyPanel, moon, setMoon, text } from './src/paper.js';
import { stage, aim } from './src/stage.js';
import { mulberry, lerp, clamp, TAU, ss, seg, eio, eo } from './src/lib.js';

const Q = new URLSearchParams(location.search);
const TV = (Q.get('fmt') || (innerWidth > innerHeight ? 'tv' : 'reels')) === 'tv';
const SS = +(Q.get('ssaa') || 1);
const DUR = 10; window.DUR = DUR;
const W = innerWidth, H = innerHeight;
const GOLD = '#d9aa4a', RED = '#b3161b', LACQ = '#7a0f14', ROOF = '#1d241f', DARK = '#16070b';
const ON = { roofs: .5, strings: 1.4, ruko: 2.3, gate: 3.2, lanterns: 4.0, stalls: 5.2, front: 6.2 };

const canvas = document.getElementById('c'); canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(SS); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SS);

const S = stage({ light: [0, .02, -.11], lightR: .16, lightCol: '#ffb36a', key: 1.1, keyCol: '#ffd9b0', amb: .26, ambCol: '#7a3a4a', floor: .3, keyPos: [-.04, .32, .32], keyTarget: [0, -.03, -.09], keyAngle: 1.0 });
const { U, cam } = S; cam.aspect = W / H; cam.updateProjectionMatrix();
const R = mulberry(17);

// ------------------------------------------------------------------ drawing helpers (metric canvas, y up)
function chineseRoof(x, cx, y, w, h, tip = .35) {   // a curved roof with upturned eaves: the outline sweeps down then flicks up at both ends
  x.beginPath(); x.moveTo(cx - w * .5 - w * .08, y + h * tip);
  x.quadraticCurveTo(cx - w * .5, y - h * .05, cx - w * .35, y + h * .05);
  x.quadraticCurveTo(cx - w * .2, y + h * .6, cx - w * .14, y + h);
  x.lineTo(cx + w * .14, y + h);
  x.quadraticCurveTo(cx + w * .2, y + h * .6, cx + w * .35, y + h * .05);
  x.quadraticCurveTo(cx + w * .5, y - h * .05, cx + w * .5 + w * .08, y + h * tip);
  x.lineTo(cx + w * .5 - w * .02, y - h * .12); x.lineTo(cx - w * .5 + w * .02, y - h * .12); x.closePath(); x.fill();
  // ridge with swallow-tail ends
  x.beginPath(); x.moveTo(cx - w * .16, y + h); x.lineTo(cx - w * .2, y + h * 1.35); x.lineTo(cx - w * .13, y + h * 1.1); x.lineTo(cx + w * .13, y + h * 1.1); x.lineTo(cx + w * .2, y + h * 1.35); x.lineTo(cx + w * .16, y + h); x.closePath(); x.fill();
}
function lanternShape(x, cx, cy, r, o = {}) {   // a round red lantern: gold caps, ribs, a tassel; optional character
  const rx = r, ry = r * 1.18;
  x.fillStyle = o.body || RED; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, TAU); x.fill();
  x.strokeStyle = 'rgba(80,10,10,.55)'; x.lineWidth = r * .07; for (const k of [-.55, 0, .55]) { x.beginPath(); x.ellipse(cx, cy, rx * Math.abs(Math.cos(k * 1.2)) * .98, ry * .98, 0, -Math.PI / 2, Math.PI / 2, k < 0); x.stroke(); }
  x.fillStyle = o.gold || GOLD; x.fillRect(cx - rx * .55, cy + ry * .86, rx * 1.1, ry * .2); x.fillRect(cx - rx * .55, cy - ry * 1.06, rx * 1.1, ry * .2);
  x.fillRect(cx - r * .04, cy + ry * 1.05, r * .08, r * .35);                                   // hanger
  x.beginPath(); x.moveTo(cx - r * .18, cy - ry * 1.06); x.lineTo(cx + r * .18, cy - ry * 1.06); x.lineTo(cx + r * .1, cy - ry * 1.9); x.lineTo(cx - r * .1, cy - ry * 1.9); x.closePath(); x.fill();   // tassel
  if (o.char) text(x, o.char, cx, cy, r * 1.05, 'NotoSerifSC', { fill: o.gold || GOLD, weight: 700 });
}
function catenary(x0, x1, y, sag) { return u => y - sag * (1 - Math.pow((2 * (u - x0) / (x1 - x0)) - 1, 2)); }

// ------------------------------------------------------------------ the stack (z from -0.142 at the back to -0.03 in front)
const sky = S.add(skyPanel({ w: 1.4, h: .7, z: -.142, stops: [[0, '#0b0512'], [.45, '#1a0a1c'], [.75, '#3a1222'], [1, '#6a2426']], stars: 140, starMinY: .0, gain: 1.0 }));
const mn = S.add(moon({ x: .15, y: .085, z: -.139, r: .008, gain: 1.6, halo: 6, haloGain: .2 })); setMoon(mn, 1);

const FAR = S.add(sheet({ U, w: 1.3, h: .4, z: -.13, trans: .5, glow: 1.4, glowCol: '#ffb860', ppm: 2600, glowRes: 1,
  draw: x => { x.fillStyle = '#4a1c24';
    x.fillRect(-.65, -.2, 1.3, .2 + .005);
    const r = mulberry(4); for (let u = -.62; u < .62;) { const w = .05 + r() * .04, h = .02 + r() * .025; x.fillRect(u, 0, w * .86, h); chineseRoof(x, u + w * .43, h, w, .012 + r() * .006); u += w; }
    // a pagoda on the left, a temple roof on the right
    for (let k = 0; k < 5; k++) { const y = .03 + k * .018, w = .05 - k * .007; x.fillRect(-.205 - w * .3, y - .006, w * .6, .016); chineseRoof(x, -.205, y + .008, w, .008, .45); }
    x.fillRect(-.207, .12, .004, .02);
    x.fillRect(.17, 0, .1, .045); chineseRoof(x, .22, .045, .13, .02); chineseRoof(x, .22, .072, .08, .014); },
  glowDraw: g => { g.fillStyle = '#000'; g.fillRect(-.65, -.2, 1.3, .4); g.fillStyle = '#fff'; const r = mulberry(9); for (let i = 0; i < 160; i++) g.fillRect(-.6 + r() * 1.2, .004 + r() * .035, .003, .004);
    for (let k = 0; k < 5; k++) g.fillRect(-.208, .029 + k * .018, .006, .004); } }));

const STR = S.add(sheet({ U, w: 1.3, h: .4, z: -.118, trans: .3, glow: 1.6, glowCol: '#ff8a4a', ppm: 3000, glowRes: 1, shadow: false,
  draw: x => { x.strokeStyle = '#2a0c10'; x.lineWidth = .0006; for (const [y, sag] of [[.075, .02], [.095, .03], [.06, .015]]) { const f = catenary(-.6, .6, y, sag); x.beginPath(); for (let u = -.6; u <= .6; u += .005) x.lineTo(u, f(u)); x.stroke();
      x.fillStyle = '#c4281e'; for (let u = -.58; u < .6; u += .022) { x.beginPath(); x.ellipse(u, f(u) - .004, .0026, .0032, 0, 0, TAU); x.fill(); } } },
  glowDraw: g => { g.fillStyle = '#000'; g.fillRect(-.65, -.2, 1.3, .4); g.fillStyle = '#fff'; for (const [y, sag] of [[.075, .02], [.095, .03], [.06, .015]]) { const f = catenary(-.6, .6, y, sag); for (let u = -.58; u < .6; u += .022) { g.beginPath(); g.ellipse(u, f(u) - .004, .0026, .0032, 0, 0, TAU); g.fill(); } } } }));

// the shophouses (ruko) on both sides of Kembang Jepun: two storeys, balconies, shuttered windows, vertical signboards
const RUKO = S.add(sheet({ U, w: 1.3, h: .4, z: -.107, trans: .3, glow: 1.2, glowCol: '#ffb860', ppm: 3200, glowRes: 1,
  draw: x => { const r = mulberry(21);
    for (const side of [-1, 1]) for (let i = 0; i < 6; i++) { const cx = side * (.13 + i * .07), w = .066, top = .02 + r() * .012;
      x.fillStyle = i % 2 ? '#5a1a1e' : '#4a1418'; x.fillRect(cx - w / 2, -.2, w, .2 + top);
      x.fillStyle = ROOF; chineseRoof(x, cx, top, w * 1.05, .012);
      x.fillStyle = '#2a0a0e'; x.fillRect(cx - w / 2, -.025, w, .004);                             // balcony
      for (let k = -1; k <= 1; k++) { x.fillStyle = '#3a0c10'; x.fillRect(cx + k * .02 - .007, -.015, .014, .022); x.fillRect(cx + k * .02 - .007, -.07, .014, .03); }
      x.fillStyle = RED; x.fillRect(cx + side * w * .32 - .005, -.06, .01, .05); x.strokeStyle = GOLD; x.lineWidth = .0008; x.strokeRect(cx + side * w * .32 - .005, -.06, .01, .05); } },
  glowDraw: g => { g.fillStyle = '#000'; g.fillRect(-.65, -.2, 1.3, .4); g.fillStyle = '#fff'; for (const side of [-1, 1]) for (let i = 0; i < 6; i++) { const cx = side * (.13 + i * .07);
      for (let k = -1; k <= 1; k++) { g.fillRect(cx + k * .02 - .0055, -.0135, .011, .019); g.fillRect(cx + k * .02 - .0055, -.068, .011, .026); } } } }));

// the gate (paifang): four red pillars, three openings, two tiers of curved roofs, a plaque, lanterns under the eaves
const GATE = S.add(sheet({ U, w: .5, h: .4, z: -.095, trans: .2, glow: 1.6, glowCol: '#ffbf6a', ppm: 4200, glowRes: 1,
  draw: x => { const base = -.11;
    x.fillStyle = LACQ; for (const px of [-.085, -.03, .03, .085]) x.fillRect(px - .005, base, .01, .14);
    x.fillStyle = '#5a0c10'; x.fillRect(-.1, .02, .2, .008); x.fillRect(-.1, -.002, .2, .006);
    x.fillStyle = ROOF; chineseRoof(x, 0, .042, .11, .022, .5); chineseRoof(x, -.0575, .03, .07, .016, .5); chineseRoof(x, .0575, .03, .07, .016, .5);
    x.fillStyle = GOLD; x.fillRect(-.11, .0405, .22, .0012); x.fillRect(-.1, .0282, .2, .001);
    // dragons on the ridge (stylised curls) and a pearl
    x.beginPath(); x.arc(0, .087, .004, 0, TAU); x.fill();
    for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * .01, .081); x.bezierCurveTo(s * .02, .093, s * .03, .078, s * .045, .086); x.lineTo(s * .046, .082); x.bezierCurveTo(s * .03, .074, s * .02, .089, s * .012, .078); x.closePath(); x.fill(); }
    // the plaque
    x.fillStyle = '#8a1418'; x.fillRect(-.032, .006, .064, .016); x.strokeStyle = GOLD; x.lineWidth = .0012; x.strokeRect(-.032, .006, .064, .016);
    text(x, 'KYA-KYA', 0, .0142, .0095, 'Cormorant', { fill: GOLD, weight: 700 });
    // lattice brackets
    x.strokeStyle = '#3a0608'; x.lineWidth = .0012; for (const px of [-.0575, .0575]) for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(px - .02 + k * .013, .002); x.lineTo(px - .014 + k * .013, .019); x.stroke(); }
    for (const px of [-.0575, 0, .0575]) lanternShape(x, px, -.012, .0055); },
  glowDraw: g => { g.fillStyle = '#000'; g.fillRect(-.25, -.2, .5, .4); g.fillStyle = '#fff'; for (const px of [-.0575, 0, .0575]) { g.beginPath(); g.ellipse(px, -.012, .0055, .0065, 0, 0, TAU); g.fill(); }
    } }));

// two rows of big red lanterns across the street (they light from the centre outwards)
const LANT = [], LANTS = [];
for (const [row, y, sag, z] of [[0, .072, .018, -.082], [1, .052, .012, -.074]]) {
  const f = catenary(-.5, .5, y, sag), xs = []; for (let u = -.46; u <= .46; u += row ? .062 : .05) xs.push(u + (row ? .025 : 0));
  const m = S.add(sheet({ U, w: 1.0, h: .3, z, trans: .35, glow: 1.3, glowCol: '#ff5a2a', ppm: 4200, glowRes: 1,
    draw: x => { x.strokeStyle = '#2a0a0e'; x.lineWidth = .0008; x.beginPath(); for (let u = -.5; u <= .5; u += .005) x.lineTo(u, f(u) + .014); x.stroke();
      for (const u of xs) lanternShape(x, u, f(u), row ? .0105 : .0085, { char: '福' }); },
    glowDraw: g => { g.fillStyle = '#000'; g.fillRect(-.5, -.15, 1, .3); g.fillStyle = '#fff'; for (const u of xs) { g.beginPath(); g.ellipse(u, f(u), (row ? .0105 : .0085) * .92, (row ? .0105 : .0085) * 1.08, 0, 0, TAU); g.fill(); text(g, '福', u, f(u), (row ? .0105 : .0085) * 1.05, 'NotoSerifSC', { fill: '#000', weight: 700 }); } } }));
  LANTS.push(m);
}

// the night market: stalls with scalloped awnings, woks, steam, stools, people
const STALL = S.add(sheet({ U, w: 1.2, h: .4, z: -.06, trans: .18, glow: 1.6, glowCol: '#ffcf80', ppm: 3600, glowRes: 1,
  draw: x => { const r = mulberry(33); const base = -.115;
    x.fillStyle = '#2a0d10'; x.fillRect(-.6, -.2, 1.2, .2 + base);
    for (let i = -5; i <= 5; i++) { if (Math.abs(i) < 1) continue; const cx = i * .085, w = .07;
      x.fillStyle = i % 2 ? '#9a1a1e' : '#c8a060'; x.beginPath(); x.moveTo(cx - w / 2, base + .055); x.lineTo(cx + w / 2, base + .055); x.lineTo(cx + w / 2 + .004, base + .045);
      for (let k = 6; k >= 0; k--) x.arc(cx - w / 2 + (k + .5) * w / 7, base + .045, w / 14, 0, Math.PI, true); x.closePath(); x.fill();
      x.fillStyle = '#3a1014'; x.fillRect(cx - w / 2 + .002, base + .042, .002, -.045); x.fillRect(cx + w / 2 - .004, base + .042, .002, -.045);
      x.fillStyle = '#4a1418'; x.fillRect(cx - w * .42, base, w * .84, .016);                                   // counter
      x.fillStyle = '#1a0608'; x.beginPath(); x.ellipse(cx - .012, base + .019, .008, .003, 0, 0, Math.PI); x.fill();      // wok
      x.fillStyle = '#f0dcc0'; for (let s = 0; s < 3; s++) { x.beginPath(); x.ellipse(cx - .012 + Math.sin(s * 2 + i) * .003, base + .026 + s * .007, .0035 - s * .0006, .0022, 0, 0, TAU); x.fill(); }   // steam puffs (paper)
      x.fillStyle = '#ffd890'; x.fillRect(cx + .012, base + .02, .008, .01);                                    // menu board
      // people (paper silhouettes)
      for (let p = 0; p < 2; p++) { const px = cx + (r() - .5) * .06, h = .028 + r() * .008; x.fillStyle = DARK; x.beginPath(); x.arc(px, base + h, .0038, 0, TAU); x.fill(); x.beginPath(); x.moveTo(px - .006, base - .004); x.lineTo(px - .004, base + h - .006); x.lineTo(px + .004, base + h - .006); x.lineTo(px + .006, base - .004); x.closePath(); x.fill(); } } },
  glowDraw: g => { g.fillStyle = '#000'; g.fillRect(-.6, -.2, 1.2, .4); g.fillStyle = '#fff'; const base = -.115;
    for (let i = -5; i <= 5; i++) { if (Math.abs(i) < 1) continue; const cx = i * .085; g.fillRect(cx + .012, base + .02, .008, .01); g.beginPath(); g.arc(cx, base + .046, .003, 0, TAU); g.fill(); } } }));

// the front: a carved lattice window frames the street (frame within the frame), big lanterns hang into the top corners
const FRONT = S.add(sheet({ U, w: 1.0, h: .5, z: -.035, trans: .05, glow: 1.3, glowCol: '#ff5a2a', ppm: 3000, glowRes: 1,
  draw: x => { x.fillStyle = '#120508';
    const ow = TV ? .44 : .2, oh = TV ? .25 : .46;           // the opening fits each format
    x.beginPath(); x.rect(-.5, -.25, 1, .5); x.moveTo(-ow / 2, -oh / 2); x.lineTo(-ow / 2, oh / 2); x.lineTo(ow / 2, oh / 2); x.lineTo(ow / 2, -oh / 2); x.closePath(); x.fill('evenodd');
    // lattice corners (fretwork)
    x.strokeStyle = '#120508'; x.lineWidth = .0022; for (const sx of [-1, 1]) for (const sy of [-1, 1]) { const cx = sx * ow / 2, cy = sy * oh / 2;
      for (let k = 1; k <= 3; k++) { x.beginPath(); x.moveTo(cx, cy - sy * k * .008); x.lineTo(cx - sx * k * .008, cy - sy * k * .008); x.lineTo(cx - sx * k * .008, cy); x.stroke(); } }
    for (const [lx, ly, rr] of [[-ow / 2 + .02, oh / 2 - .03, .016], [ow / 2 - .022, oh / 2 - .04, .019]]) { x.fillStyle = '#120508'; x.fillRect(lx - .0006, ly + .02, .0012, oh); lanternShape(x, lx, ly, rr, { char: '福', body: '#a3121a' }); } },
  glowDraw: g => { g.fillStyle = '#000'; g.fillRect(-.5, -.25, 1, .5); g.fillStyle = '#fff'; const ow = TV ? .44 : .2, oh = TV ? .25 : .46;
    for (const [lx, ly, rr] of [[-ow / 2 + .02, oh / 2 - .03, .016], [ow / 2 - .022, oh / 2 - .04, .019]]) { g.beginPath(); g.ellipse(lx, ly, rr * .92, rr * 1.08, 0, 0, TAU); g.fill(); } } }));

const LAYERS = { roofs: [FAR], strings: [STR], ruko: [RUKO], gate: [GATE], lanterns: LANTS, stalls: [STALL], front: [FRONT] };
// ------------------------------------------------------------------ frame
const ov = document.getElementById('ov'); ov.width = W; ov.height = H; const oc = ov.getContext('2d'); let REG = [];
function render(t) {
  REG = [];
  for (const [k, ms] of Object.entries(LAYERS)) { const on = ss(seg(t, ON[k], ON[k] + .6)), flick = 1 + .05 * Math.sin(t * 9 + ON[k] * 3);
    for (const m of ms) m.material.userData.u.uGlowLit.value = on * flick; }
  // the big lanterns light from the centre outwards
  const rr = lerp(0, .6, eo(seg(t, ON.lanterns, ON.lanterns + 1.6)));
  for (const m of LANTS) m.material.userData.u.uGR.value.set(0, .06, rr, 1);
  LANTS.forEach((m, i) => { m.position.x = .0012 * Math.sin(t * 1.3 + i); m.position.y = .0005 * Math.sin(t * 1.9 + i * 2); });
  U.uLit.value = .4 + .3 * ss(seg(t, .2, 2.5));
  // camera: through the lattice window, a slow push into the street, a small rise and drift
  const k = eio(seg(t, 0, DUR));
  const z = TV ? lerp(.5, .36, k) : lerp(.62, .5, k), y = lerp(-.004, .008, k), x = lerp(-.008, .01, k);
  aim(cam, [x, y, z, x * .4, y + .002, -.09], t, { hand: .0005 });
  pipe.shot(S.scene, cam, { focus: z + .085, aper: TV ? 10 : 6, maxCoc: 12, bloom: { strength: .32, radius: .55, threshold: 1.15 } }, pipe.rtA);
  pipe.final({ expo: 1.05, vig: .42, sat: 1.12, contrast: .12, lift: [.008, .002, .006], gain: [1.05, .98, .92] });
  // the place, small, on the dark band at the top-left
  const Sx = H / 1080; oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, W, H); oc.setTransform(Sx, 0, 0, Sx, 0, 0);
  const a = seg(t, 1.6, 2.2); if (a > 0) { const px = TV ? 70 : 34, py = TV ? 92 : 170; oc.globalAlpha = a; oc.fillStyle = '#f3e3c3'; oc.font = `600 ${TV ? 36 : 26}px Cormorant`; oc.fillText('Kya-Kya Kembang Jepun', px, py); oc.font = `400 ${TV ? 22 : 16}px Inter`; oc.fillStyle = '#d8c09a'; oc.fillText('malam · Kembang Jepun night market', px, py + (TV ? 30 : 24)); oc.globalAlpha = 1;
    if (a > .5) REG.push({ id: 'kya', text: 'Kya-Kya Kembang Jepun', x0: px * Sx, y0: (py - 30) * Sx, x1: (px + 380) * Sx, y1: (py + 6) * Sx }); }
}
window.render = render; window.TEXTS = () => REG.slice();
window.EV = Object.entries(ON).map(([k, t]) => ({ t, type: 'layer', id: k }));
Promise.all(['700 40px NotoSerifSC', '700 40px Cormorant', '600 40px Cormorant', '400 20px Inter'].map(f => document.fonts.load(f, '福K'))).then(() => { render(0); window.READY = true; });
