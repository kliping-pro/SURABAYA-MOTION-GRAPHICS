// Low-poly Isometric Island window S7 v2 (12 s): Kebun Binatang Surabaya and the Sura & Baya statue (STYLE: styles/lowpoly-island).
// Built on the library's island kit (lib/: the faceted animated sea with a live shallow-water map; the orthographic post:
// GTAO for the seams, depth-based haze into a screen-space sky gradient, a light tilt-shift, bloom, pastel grade).
// The island rises tile by tile from the sea, then the zoo grows on it: paths, enclosures with fences, a pond, trees,
// the entrance gate with its sign, visitors, animals (elephant, giraffe, deer, komodo, flamingos); the statue of Sura (the
// shark) and Baya (the crocodile) lands last on its round plinth. Every arrival is a note (window.EV). Slow turntable.
import * as THREE from 'three';
import { makePost } from './lib/post.js';
import { makeSea } from './lib/sea.js';
import { clamp, lerp, seg, ss, eo, eio, back, mulberry } from '/core/lib.js';
const Q = new URLSearchParams(location.search);
const TV = (Q.get('fmt') || (innerWidth > innerHeight ? 'tv' : 'reels')) === 'tv';
const DUR = 12; window.DUR = DUR;
const W = innerWidth, H = innerHeight;
const R = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true }); R.setPixelRatio(1); R.setSize(W, H);
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.toneMapping = THREE.NeutralToneMapping; R.toneMappingExposure = 1.05;
document.getElementById('stage').appendChild(R.domElement);
const scene = new THREE.Scene();
const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2000);
const post = makePost(R, scene, cam, W, H, { ssaa: 1, aoRadius: .7, aoScale: 1.5, aoThickness: 1 }); post.bloom.strength = .25; post.bloom.threshold = .95;
const sea = makeSea(scene);
const rnd = mulberry(7), MC = new Map();
const mat = (c, o = {}) => { const k = c + JSON.stringify(o); if (!MC.has(k)) MC.set(k, new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: .88, ...o })); return MC.get(k); };
const mesh = (g, c, o) => { const m = new THREE.Mesh(g, mat(c, o)); m.castShadow = true; m.receiveShadow = true; return m; };
const jit = (hex, a) => { const c = new THREE.Color(hex), h = {}; c.getHSL(h); c.setHSL(h.h, h.s, clamp(h.l * (1 + a))); return '#' + c.getHexString(); };
const sun = new THREE.DirectionalLight('#fff4e0', 2.8); sun.position.set(-30, 50, 26); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 160 }); sun.shadow.bias = -.0006; scene.add(sun);
scene.add(new THREE.HemisphereLight('#dbeaff', '#e8cfa8', 1.15));
// ------------------------------------------------------------------ the island: hex tiles (rings), zones
const SQ3 = Math.sqrt(3), hex2w = (q, r) => [SQ3 * (q + r / 2), 1.5 * r], hd = (q, r) => Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r));
const POP = [], TILES = [];
const POND = new Set(['3,-1', '4,-2', '3,-2', '2,-1', '4,-1', '2,0', '3,0']), PATH = new Set(), ROCK = new Set(['-4,1', '-4,2', '-5,2']);
for (let q = -6; q <= 6; q++) for (let r = -6; r <= 6; r++) { const d = hd(q, r); if (d > 6 || d === 3) continue; }
for (let q = -6; q <= 6; q++) for (let r = -6; r <= 6; r++) if (hd(q, r) === 3) PATH.add(q + ',' + r);   // the path ring
const cells = []; for (let q = -6; q <= 6; q++) for (let r = -6; r <= 6; r++) { const d = hd(q, r); if (d <= 6) cells.push({ q, r, d, a: Math.atan2(r + q / 2, q) }); }
cells.sort((a, b) => a.d - b.d || a.a - b.a);
const TOP = { sand: '#f3dfab', grass: ['#93c96c', '#7fbd62', '#8cc468'], path: '#e3d9c2', pond: '#7fc4dc', rock: '#b4b8bd' };
cells.forEach((c, i) => {
  const key = c.q + ',' + c.r, [x, z] = hex2w(c.q, c.r), edge = c.d === 6, pond = POND.has(key), path = PATH.has(key), rock = ROCK.has(key);
  const h = pond ? .45 : edge ? .7 : rock ? 1.6 + rnd() * .5 : path ? .95 : 1 + rnd() * .2;
  const top = pond ? TOP.pond : edge ? TOP.sand : path ? TOP.path : rock ? TOP.rock : TOP.grass[(rnd() * 3) | 0];
  const g = new THREE.Group(); const side = mesh(new THREE.CylinderGeometry(.98, .98, h + 3, 6), edge ? '#e2c68e' : rock ? '#8f949c' : '#c99c6e'); side.position.y = (h - 3) / 2 - .04; g.add(side);
  const cap = mesh(new THREE.CylinderGeometry(.99, .99, .1, 6), jit(top, (rnd() - .5) * .06), pond ? { roughness: .3 } : {}); cap.position.y = h - .02; g.add(cap);
  g.position.set(x, 0, z); scene.add(g); POP.push({ o: g, t: .3 + i * .016, kind: 'tile', y0: 0, from: -4, xz: [x, z] }); c.h = h;
});
const hAt = (q, r) => (cells.find(c => c.q === q && c.r === r) || { h: 1 }).h;
const at = (q, r) => { const [x, z] = hex2w(q, r); return [x, hAt(q, r), z]; };
// ------------------------------------------------------------------ props (each pops with a note)
function place(o, q, r, t, dx = 0, dz = 0, rot = 0) { const [x, y, z] = at(q, r); o.position.set(x + dx, y, z + dz); o.rotation.y = rot; scene.add(o); POP.push({ o, t, kind: 'prop', y0: y }); return o; }
function pine(s = 1) { const g = new THREE.Group(); const tr = mesh(new THREE.CylinderGeometry(.08, .11, .5 * s, 5), '#8a5a3c'); tr.position.y = .25 * s; g.add(tr); for (let k = 0; k < 2; k++) { const c = mesh(new THREE.ConeGeometry((.48 - k * .14) * s, (.8 - k * .1) * s, 6), ['#3f8a5a', '#4f9c63'][k]); c.position.y = (.7 + k * .4) * s; g.add(c); } return g; }
function roundTree(s = 1) { const g = new THREE.Group(); const tr = mesh(new THREE.CylinderGeometry(.08, .1, .55 * s, 5), '#8a5a3c'); tr.position.y = .27 * s; g.add(tr); const c = mesh(new THREE.IcosahedronGeometry(.5 * s, 0), ['#7fc36a', '#9ad06f', '#6fb35e'][(rnd() * 3) | 0]); c.position.y = .85 * s; g.add(c); return g; }
function fence(len, rot) { const g = new THREE.Group(); for (let k = 0; k <= len * 3; k++) { const p = mesh(new THREE.BoxGeometry(.06, .32, .06), '#a8764e'); p.position.set(k / 3 - len / 2, .16, 0); g.add(p); } const rl = mesh(new THREE.BoxGeometry(len, .05, .05), '#7d5436'); rl.position.y = .26; g.add(rl); g.rotation.y = rot; return g; }
function elephant() { const g = new THREE.Group(), c = '#9aa0a8'; const b = mesh(new THREE.IcosahedronGeometry(.42, 0), c); b.scale.set(1.3, .9, .85); b.position.y = .62; g.add(b);
  const hd2 = mesh(new THREE.IcosahedronGeometry(.24, 0), c); hd2.position.set(.55, .78, 0); g.add(hd2); const tr = mesh(new THREE.CylinderGeometry(.05, .08, .5, 5), c); tr.position.set(.72, .5, 0); tr.rotation.z = .2; g.add(tr);
  for (const s of [-1, 1]) { const ear = mesh(new THREE.BoxGeometry(.05, .3, .26), '#8a9098'); ear.position.set(.45, .8, s * .24); g.add(ear); }
  for (const [lx, lz] of [[-.3, -.18], [-.3, .18], [.28, -.18], [.28, .18]]) { const l = mesh(new THREE.CylinderGeometry(.09, .1, .42, 6), c); l.position.set(lx, .21, lz); g.add(l); } return g; }
function giraffe() { const g = new THREE.Group(), c = '#e4b25a'; const b = mesh(new THREE.BoxGeometry(.6, .3, .26), c); b.position.y = .85; g.add(b); const n = mesh(new THREE.BoxGeometry(.12, .8, .12), c); n.position.set(.26, 1.35, 0); n.rotation.z = -.25; g.add(n);
  const hd2 = mesh(new THREE.BoxGeometry(.26, .12, .12), c); hd2.position.set(.4, 1.78, 0); g.add(hd2); for (const [lx, lz] of [[-.24, -.09], [-.24, .09], [.24, -.09], [.24, .09]]) { const l = mesh(new THREE.BoxGeometry(.06, .72, .06), c); l.position.set(lx, .36, lz); g.add(l); }
  for (let k = 0; k < 5; k++) { const sp = mesh(new THREE.BoxGeometry(.1, .02, .1), '#9a6a2e'); sp.position.set(-.2 + k * .1, 1.01, (k % 2 - .5) * .1); g.add(sp); } return g; }
function deer() { const g = new THREE.Group(), c = '#c08a55'; const b = mesh(new THREE.BoxGeometry(.5, .24, .2), c); b.position.y = .48; g.add(b); const n = mesh(new THREE.BoxGeometry(.1, .3, .1), c); n.position.set(.24, .7, 0); n.rotation.z = -.3; g.add(n);
  const hd2 = mesh(new THREE.BoxGeometry(.18, .12, .12), c); hd2.position.set(.32, .86, 0); g.add(hd2); for (const [lx, lz] of [[-.18, -.06], [-.18, .06], [.18, -.06], [.18, .06]]) { const l = mesh(new THREE.BoxGeometry(.05, .36, .05), c); l.position.set(lx, .18, lz); g.add(l); } return g; }
function komodo() { const g = new THREE.Group(), c = '#7d7a5a'; const b = mesh(new THREE.BoxGeometry(.75, .14, .24), c); b.position.y = .12; g.add(b); const tl = mesh(new THREE.ConeGeometry(.1, .7, 4), c); tl.rotation.z = Math.PI / 2; tl.position.set(-.7, .1, 0); g.add(tl);
  const hd2 = mesh(new THREE.BoxGeometry(.24, .1, .16), c); hd2.position.set(.48, .14, 0); g.add(hd2); for (const [lx, lz] of [[-.2, -.16], [-.2, .16], [.2, -.16], [.2, .16]]) { const l = mesh(new THREE.BoxGeometry(.06, .1, .12), c); l.position.set(lx, .05, lz); g.add(l); } return g; }
function flamingo() { const g = new THREE.Group(), c = '#f19bb0'; const b = mesh(new THREE.IcosahedronGeometry(.16, 0), c); b.scale.set(1.4, .9, .9); b.position.y = .6; g.add(b); const n = mesh(new THREE.CylinderGeometry(.025, .03, .38, 4), c); n.position.set(.14, .82, 0); n.rotation.z = -.4; g.add(n);
  const l = mesh(new THREE.CylinderGeometry(.015, .015, .5, 4), '#d97f95'); l.position.y = .25; g.add(l); return g; }
function visitor(c) { const g = new THREE.Group(); const b = mesh(new THREE.CapsuleGeometry(.11, .26, 2, 6), c); b.position.y = .28; g.add(b); const h = mesh(new THREE.IcosahedronGeometry(.1, 0), '#e2b394'); h.position.y = .58; g.add(h); return g; }
// the zoo
for (const [q, r, s] of [[-5, 1, 1], [-5, 4, 1.1], [-2, 5, .9], [1, 4, 1], [4, 2, 1.2], [5, -4, 1], [-1, -5, .9], [-3, -2, 1], [0, -2, 1], [5, 0, .9], [-6, 3, 1], [2, -5, 1.1]]) place(rnd() < .5 ? pine(s) : roundTree(s), q, r, 1.9 + rnd() * .8, (rnd() - .5) * .5, (rnd() - .5) * .5);
place(fence(3.2, .5), -2, 1, 3.0); place(fence(3.2, -.5), -1, -1, 3.05); place(fence(2.6, 1.57), 1, 2, 3.1);
place(elephant(), -2, 2, 3.4, 0, 0, .6); place(giraffe(), 1, -4, 3.6, 0, 0, 2.2); place(deer(), 2, 4, 3.8, 0, 0, -1); place(deer(), 1, 5, 3.9, .3, 0, .4);
place(komodo(), -4, 2, 4.1, 0, 0, -.8); place(komodo(), -5, 3, 4.2, 0, 0, 1.4);
for (let k = 0; k < 4; k++) place(flamingo(), 3, -1, 4.4 + k * .1, (k - 1.5) * .35, (k % 2 - .5) * .4, k);
// the entrance gate with its sign, a ticket booth
{ const g = new THREE.Group(); for (const s of [-1, 1]) { const p = mesh(new THREE.BoxGeometry(.3, 1.8, .3), '#2f8a5a'); p.position.set(s * .9, .9, 0); g.add(p); }
  const c = document.createElement('canvas'); c.width = 512; c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#F28C28'; x.fillRect(0, 0, 512, 128); x.fillStyle = '#fff'; x.font = '800 92px Fredoka'; x.textAlign = 'center'; x.fillText('KBS', 256, 100);
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; const sign = new THREE.Mesh(new THREE.BoxGeometry(2.2, .55, .12), [mat('#F28C28'), mat('#F28C28'), mat('#F28C28'), mat('#F28C28'), new THREE.MeshStandardMaterial({ map: tx, roughness: .8 }), new THREE.MeshStandardMaterial({ map: tx, roughness: .8 })]);
  sign.position.y = 2.0; sign.castShadow = true; g.add(sign); place(g, 0, 6, 2.6, 0, -.3, 0); window.__signTex = { tx, c }; }
{ const b = new THREE.Group(); const m = mesh(new THREE.BoxGeometry(.8, .6, .6), '#fbf3e6'); m.position.y = .3; b.add(m); const rf = mesh(new THREE.ConeGeometry(.65, .35, 4), '#d9644a'); rf.position.y = .78; rf.rotation.y = Math.PI / 4; b.add(rf); place(b, 2, 4, 2.8, 0, -.5); }
const PEOPLE = []; ['#e53e31', '#2cace2', '#f6ec25', '#00a54e', '#7b4fa2', '#f28c28', '#ffffff', '#e53e31'].forEach((c, i) => { const v = visitor(c); scene.add(v); PEOPLE.push({ v, a0: i / 8 * Math.PI * 2, t0: 5.0 + i * .12 }); POP.push({ o: v, t: 5.0 + i * .12, kind: 'prop', y0: 0, person: true }); });
// the statue of Sura & Baya on its round plinth at the centre: the shark rising on its tail, the crocodile coiled around it
const STATUE = new THREE.Group(); {
  const pl = mesh(new THREE.CylinderGeometry(1.15, 1.25, .35, 16), '#F28C28'); pl.position.y = .17; STATUE.add(pl); const pl2 = mesh(new THREE.CylinderGeometry(.85, .85, .4, 16), '#fbf3e6'); pl2.position.y = .4; STATUE.add(pl2);
  const sk = '#5f8fc0', cr = '#6f8a5a';
  const sb = mesh(new THREE.IcosahedronGeometry(.42, 1), sk); sb.scale.set(.72, 2.05, .72); sb.position.set(-.2, 1.7, 0); sb.rotation.z = -.38; STATUE.add(sb);
  const sh = mesh(new THREE.ConeGeometry(.3, .75, 6), sk); sh.position.set(.22, 2.6, 0); sh.rotation.z = -.9; STATUE.add(sh);             // the shark's snout
  const df = mesh(new THREE.ConeGeometry(.16, .4, 3), sk); df.position.set(-.42, 1.85, 0); df.rotation.z = .9; STATUE.add(df);              // dorsal fin
  const tf = mesh(new THREE.ConeGeometry(.26, .5, 3), sk); tf.position.set(-.4, .78, 0); tf.rotation.z = 2.6; STATUE.add(tf);               // tail fin
  for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 1.6 - .4, rr = .62 - k * .025, seg2 = mesh(new THREE.BoxGeometry(.38, .2, .3), cr); seg2.position.set(Math.cos(a) * rr, .72 + k * .16, Math.sin(a) * rr); seg2.rotation.y = -a; STATUE.add(seg2); }
  const ch = mesh(new THREE.BoxGeometry(.5, .14, .2), cr); ch.position.set(.42, 2.15, .22); ch.rotation.z = .5; STATUE.add(ch);            // the crocodile's jaws reaching up
  const ch2 = mesh(new THREE.BoxGeometry(.46, .08, .18), cr); ch2.position.set(.44, 2.02, .22); ch2.rotation.z = .2; STATUE.add(ch2);
  const ct = mesh(new THREE.ConeGeometry(.14, .9, 4), cr); ct.position.set(.55, .62, -.35); ct.rotation.set(.4, 0, -1.4); STATUE.add(ct);   // tail
}
place(STATUE, 0, 0, 7.4, 0, 0, .3); const SPOP = POP[POP.length - 1]; SPOP.kind = 'statue';
// ------------------------------------------------------------------ camera: high and wide on the empty sea, the island grows, a slow turntable, close on the statue, back wide
const DEG = Math.PI / 180;
function camAt(t) {
  const tg = [0, lerp(.5, 1.2, ss(seg(t, 6.8, 8.6))) * (1 - ss(seg(t, 10.2, 11.6))) + .5, 0];
  const az = 35 + t * 4.2, el = lerp(38, 30, ss(seg(t, 0, 6)));
  let fh = TV ? 17 : 21; fh *= lerp(1, .42, ss(seg(t, 6.8, 8.6))) * lerp(1, 1 / .42, ss(seg(t, 10.2, 11.8)));
  const D = 300, ce = Math.cos(el * DEG); cam.position.set(tg[0] + D * ce * Math.sin(az * DEG), tg[1] + D * Math.sin(el * DEG), tg[2] + D * ce * Math.cos(az * DEG)); cam.up.set(0, 1, 0); cam.lookAt(...tg);
  const fw = fh * W / H; cam.left = -fw / 2; cam.right = fw / 2; cam.top = fh / 2; cam.bottom = -fh / 2; cam.near = 1; cam.far = D + fh * 5 + 800; cam.updateProjectionMatrix();
  const cot = 1 / Math.tan(el * DEG); post.comp.camDist.value = D; post.comp.hz0.value = .35 * fh * cot; post.comp.hz1.value = 1.0 * fh * cot; post.tilt.fy.value = .5; post.tilt.band.value = .3;
}
function popAt(t) { for (const p of POP) { const k = t - p.t; if (k < 0) { p.o.visible = false; continue; } p.o.visible = true; const u = clamp(k / .35), b = back(u, 2.6);
  if (p.kind === 'tile') { p.o.position.y = lerp(p.from, 0, eo(u)); p.o.scale.setScalar(1); } else p.o.scale.setScalar(Math.max(.001, p.kind === 'statue' ? back(clamp(k / .6), 2.2) : b)); } }
function peopleAt(t) { const F = Math.floor(t * 12) / 12; PEOPLE.forEach((p, i) => { const a = p.a0 + F * .18 * (i % 2 ? 1 : -1), r = 3 * 1.5 * .98; const x = Math.cos(a) * r * SQ3 / 1.5, z = Math.sin(a) * r; p.v.position.set(x * .86, .95, z * .86); p.v.rotation.y = -a; }); }
// overlay: a small sign in the world's colours
const ov = document.getElementById('ov'); ov.width = W; ov.height = H; const oc = ov.getContext('2d'); let REG = [];
function overlay(t) { const S = H / 1080; oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, W, H); oc.setTransform(S, 0, 0, S, 0, 0);
  const a = seg(t, 2.4, 2.8); if (a <= 0) return; const x = TV ? 70 : 34, y = TV ? 90 : 160;
  oc.save(); oc.globalAlpha = a; oc.fillStyle = 'rgba(255,255,255,.85)'; oc.beginPath(); oc.roundRect(x, y - 44, TV ? 560 : 390, TV ? 92 : 70, 14); oc.fill();
  oc.fillStyle = '#F28C28'; oc.beginPath(); oc.arc(x + 30, y + 2, TV ? 14 : 10, 0, 7); oc.fill(); oc.fillStyle = '#3d3a35'; oc.font = `700 ${TV ? 30 : 22}px Fredoka`; oc.fillText('Kebun Binatang Surabaya', x + 56, y + 2);
  oc.font = `500 ${TV ? 20 : 14}px Fredoka`; oc.fillStyle = '#6b665d'; oc.fillText(t > 7.4 ? 'Patung Sura & Baya · Sura and Baya Statue' : 'Surabaya Zoo', x + 56, y + (TV ? 30 : 22)); oc.restore();
  if (a > .5) REG.push({ id: 'kbs', text: 'Kebun Binatang Surabaya', x0: (x + 56) * S, y0: (y - 26) * S, x1: (x + 500) * S, y1: (y + 6) * S }); }
function render(t) {
  REG = []; popAt(t); peopleAt(t); camAt(t);
  sea.U.uTime.value = t; sea.U.uAmp.value = 1; sea.U.uDeep.value.set('#3aa3b8'); sea.U.uShal.value.set('#86e0d2');
  sea.drawShallow(POP.filter(p => p.kind === 'tile' && t > p.t).map(p => [p.xz[0], p.xz[1], 2.2, clamp((t - p.t) / .4)]));
  post.comp.zen.value.set('#8ec5e8'); post.comp.hor.value.set('#f3e6d0'); const G = post.grade; G.sat.value = 1.08; G.contrast.value = .06; G.vig.value = .22;
  post.composer.render(); overlay(t);
}
window.render = render; window.TEXTS = () => REG.slice();
window.EV = POP.filter(p => !p.person).map(p => ({ t: +p.t.toFixed(3), type: p.kind }));
document.fonts.load('800 40px Fredoka', 'KBS').then(() => { const { tx, c } = window.__signTex; const x = c.getContext('2d'); x.fillStyle = '#F28C28'; x.fillRect(0, 0, 512, 128); x.fillStyle = '#fff'; x.font = '800 92px Fredoka'; x.textAlign = 'center'; x.fillText('KBS', 256, 100); tx.needsUpdate = true; render(0); window.READY = true; });
