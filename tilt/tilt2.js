// Tilt-Shift Miniature window S5 v2 (10 s): Jalan Tunjungan, time-lapse (STYLE: styles/tilt-shift).
// Built on the library's tilt-shift kit (lib/: GB geometry builder, the procedural facade material with windows, frames
// and string courses, the TiltPass with physical depth of field + a screen-space blur band, bloom and the miniature grade).
// The street runs north (z negative); colonial shophouses with arcades on both sides, a white corner block with a tower at
// the north end, trees and lamps on the pavements; cars, many motorbikes and people step at 7.5 Hz (x24 time-lapse) while
// the camera glides smoothly. The street's name is painted on the road; a time-lapse readout in a corner. ?fmt=reels|tv
import * as THREE from 'three';
import { GB } from './lib/geo.js';
import { buildingMaterial, U as CU, CURB } from './lib/city.js';
import { makePost } from './lib/post.js';
import { clamp, lerp, seg, ss, eio, mulberry } from '/core/lib.js';
const Q = new URLSearchParams(location.search);
const TV = (Q.get('fmt') || (innerWidth > innerHeight ? 'tv' : 'reels')) === 'tv';
const DUR = 10; window.DUR = DUR;
const W = innerWidth, H = innerHeight, STEP = 4 / 30;
const R = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true }); R.setPixelRatio(1); R.setSize(W, H);
R.toneMapping = THREE.NeutralToneMapping; R.toneMappingExposure = 1.08; R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(R.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color('#9cc7e8');
const cam = new THREE.PerspectiveCamera(28, W / H, 2, 2500);
const post = makePost(R, scene, cam, W, H, { ssaa: 1, ao: false }); post.bloom.strength = .18; post.bloom.threshold = 1.15;
CU.night.value = 0; CU.lit.value = 0;
const rnd = mulberry(23);
const plain = new GB(), bld = new GB();
// ------------------------------------------------------------------ ground, road, pavements, markings
plain.flat(-600, 600, -900, 400, 0, '#8b8f86');
plain.flat(-7, 7, -760, 260, .02, '#3d4045');                                     // Jalan Tunjungan, one-way north
for (const s of [-1, 1]) plain.box(s > 0 ? 7 : -12, s > 0 ? 12 : -7, 0, CURB, -760, 260, '#cdc6b8', '#d6cfc1');
for (let z = 240; z > -740; z -= 9) plain.box(-3.6, -3.4, .03, .05, z, z + 4, '#f2efe6'); for (let z = 240; z > -740; z -= 9) plain.box(3.4, 3.6, .03, .05, z, z + 4, '#f2efe6');
for (const z of [140, -330]) for (let x = -6; x < 7; x += 1.6) plain.box(x, x + .8, .03, .05, z, z + 5, '#f4f1ea');    // zebra crossings
plain.flat(-600, 600, 160, 176, .025, '#3d4045'); plain.flat(-600, 600, -420, -404, .025, '#3d4045');                      // cross streets
// ------------------------------------------------------------------ shophouses with arcades (both sides), the corner block with its tower
const FAC = ['#f2e6c9', '#ead3ad', '#d9e6d9', '#f3d6c4', '#f6f2ea', '#e9e1f0', '#f5e7a8', '#d6e6ee', '#efd9b8'];
const AW = ['#d8412f', '#2f8a5a', '#2b6cb0', '#f2b705', '#e07b39', '#7a4a8c', '#1f6b6b'];
function shophouse(side, z0, w, floors, k) {
  const d = 16 + rnd() * 8, x0 = side > 0 ? 12 : -12 - d, x1 = side > 0 ? 12 + d : -12, fh = 4.2, h = CURB + floors * fh, wall = FAC[k % FAC.length];
  bld.box(x0, x1, CURB, h, z0, z0 + w, wall, '#b8b0a2', { facade: true, wp: [3 + rnd() * .6, fh, (rnd() < .5 ? 0 : 3) * 1000 + rnd() * 97] });
  const fx = side > 0 ? x0 : x1;                                                   // the street face
  plain.box(Math.min(fx, fx - side * .6), Math.max(fx, fx - side * .6), h, h + .9, z0, z0 + w, '#f4efe4');               // cornice
  if (rnd() < .6) plain.box(Math.min(fx, fx - side * .5), Math.max(fx, fx - side * .5), h + .9, h + 2.6, z0 + w * .3, z0 + w * .7, wall);   // a parapet pediment
  // the arcade: columns along the pavement and a roof slab over it (the covered walkway of old Tunjungan)
  const ax0 = side > 0 ? 8 : -12, ax1 = side > 0 ? 12 : -8; plain.box(ax0, ax1, CURB + 3.6, CURB + 4.1, z0, z0 + w, '#ede6d8');
  for (let z = z0 + 1; z < z0 + w; z += 3.4) plain.box(side > 0 ? 8.1 : -8.6, side > 0 ? 8.6 : -8.1, CURB, CURB + 3.6, z, z + .5, '#f2ece0');
  if (rnd() < .55) plain.box(side > 0 ? 7.2 : -8.0, side > 0 ? 8.0 : -7.2, CURB + 2.6, CURB + 3.0, z0 + .6, z0 + w - .6, AW[k % AW.length]);   // shop awning
  if (rnd() < .45) plain.box(side > 0 ? 7.6 : -7.9, side > 0 ? 7.9 : -7.6, CURB + 4.4, CURB + 6.4, z0 + w * .35, z0 + w * .65, ['#ffffff', '#f2b705', '#d8412f', '#2b6cb0'][k % 4]);   // a plain signboard
  return h;
}
let k = 0; for (const side of [-1, 1]) for (let z = 240; z > -720;) { const w = 9 + rnd() * 10; if (Math.abs(z - 168) < 12 || Math.abs(z + 412) < 12) { z -= 22; continue; } shophouse(side, z - w, w, 2 + (rnd() < .45 ? 1 : 0), k++); z -= w + .4; }
// the white corner block with a tower at the north end (left side)
bld.box(-60, -12, CURB, 22, -700, -640, '#f7f4ee', '#c9c2b4', { facade: true, wp: [3.4, 5.4, 3 * 1000 + 12] });
plain.cyl(-16, -645, 7, CURB, 34, '#f7f4ee', 24); plain.cyl(-16, -645, 7.6, 34, 35, '#e8e1d2', 24); plain.cyl(-16, -645, 4, 35, 39, '#c9554a', 16);
// the city beyond: blocks with red roofs
for (let gx = -340; gx <= 340; gx += 34) for (let gz = 260; gz > -900; gz -= 34) { if (Math.abs(gx) < 52) continue; const h = 6 + rnd() * 12, w = 18 + rnd() * 10;
  bld.box(gx - w / 2, gx + w / 2, 0, h, gz - w / 2, gz + w / 2, FAC[(rnd() * FAC.length) | 0], '#b5503f', { facade: true, wp: [3, 3.6, rnd() * 99] }); }
// trees and lamps on the pavements
for (let z = 230; z > -700; z -= 20) for (const s of [-1, 1]) { if (rnd() < .25) continue; const x = s * 6.9; plain.cyl(x, z, .25, CURB, 3.4, '#6b4b33', 6); }
const trees = new THREE.Group(); scene.add(trees);
for (let z = 230; z > -700; z -= 20) for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(2.6, 0), new THREE.MeshStandardMaterial({ color: ['#3f9a3a', '#4fae45', '#2f8a3a'][(rnd() * 3) | 0], roughness: .9, flatShading: true })); m.position.set(s * 6.9, 5.2, z + rnd() * 2); m.castShadow = true; trees.add(m); }
for (let z = 220; z > -700; z -= 40) for (const s of [-1, 1]) { plain.cyl(s * 7.3, z + 10, .12, CURB, 6.2, '#2d3236', 6); plain.box(s * 7.3 - .5, s * 7.3 + .5, 6.2, 6.5, z + 9.5, z + 10.5, '#f4d27a'); }
// the street's name painted on the road
const nameC = document.createElement('canvas'); nameC.width = 2048; nameC.height = 256; { const g = nameC.getContext('2d'); g.fillStyle = '#f4f1e8'; g.font = '800 190px Overpass'; g.textAlign = 'center'; g.fillText('JL. TUNJUNGAN', 1024, 200); }
const nameT = new THREE.CanvasTexture(nameC); nameT.colorSpace = THREE.SRGBColorSpace;
const nameM = new THREE.Mesh(new THREE.PlaneGeometry(26, 3.2), new THREE.MeshStandardMaterial({ map: nameT, transparent: true, roughness: .8 })); nameM.rotation.x = -Math.PI / 2; nameM.rotation.z = Math.PI / 2; nameM.position.set(0, .06, 100); nameM.receiveShadow = true; scene.add(nameM);
const mBld = new THREE.Mesh(bld.build(), buildingMaterial()); mBld.castShadow = mBld.receiveShadow = true; scene.add(mBld);
const mPl = new THREE.Mesh(plain.build(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .85 })); mPl.castShadow = mPl.receiveShadow = true; scene.add(mPl);
// light: a hard morning sun cheated to light the west-facing facades, a sky fill with warm ground bounce
const sun = new THREE.DirectionalLight('#fff1da', 3.4); sun.position.set(-180, 240, 120); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, { left: -260, right: 260, top: 420, bottom: -420, near: 10, far: 1200 }); sun.shadow.bias = -.0004; sun.target.position.set(0, 0, -200); scene.add(sun, sun.target);
scene.add(new THREE.HemisphereLight('#c4e2ff', '#c9a27a', 1.5));
// ------------------------------------------------------------------ traffic (cars, many motorbikes) and people, stepped at 7.5 Hz
const V = [], P = [];
const mat = c => new THREE.MeshStandardMaterial({ color: c, roughness: .35, metalness: .2 });
const glassM = new THREE.MeshStandardMaterial({ color: '#16202a', roughness: .1, metalness: .4 });
const CARC = ['#e53e31', '#f6ec25', '#2cace2', '#ffffff', '#1c1c1c', '#00a54e', '#f28c28', '#c0c0c0', '#7b4fa2', '#0e497a', '#ffffff', '#c0c0c0'];
for (let i = 0; i < 120; i++) {
  const moto = i % 5 < 3, g = new THREE.Group(), col = CARC[i % CARC.length];
  if (moto) { const b = new THREE.Mesh(new THREE.BoxGeometry(.6, .9, 1.8), mat(col)); b.position.y = .55; g.add(b); const r = new THREE.Mesh(new THREE.CapsuleGeometry(.28, .5, 2, 6), mat(['#2b2b2b', '#c94b3a', '#2b6cb0', '#e8e2d6'][i % 4])); r.position.set(0, 1.35, -.1); g.add(r); }
  else { const b = new THREE.Mesh(new THREE.BoxGeometry(1.8, .9, 4.3), mat(col)); b.position.y = .65; g.add(b); const c = new THREE.Mesh(new THREE.BoxGeometry(1.6, .65, 2.2), glassM); c.position.set(0, 1.4, .2); g.add(c); }
  g.traverse(o => { o.castShadow = true; }); scene.add(g);
  V.push({ g, x: moto ? lerp(-6, 6, (i * .37) % 1) : [-3.6 + 1.8, 0, 3.6 - 1.8][i % 3], s0: rnd() * 1000, v: moto ? 11 + rnd() * 4 : 8 + rnd() * 3 });
}
for (let i = 0; i < 160; i++) { const s = i % 2 ? 1 : -1; const p = new THREE.Mesh(new THREE.CapsuleGeometry(.3, .9, 3, 6), mat(['#e53e31', '#f6ec25', '#2cace2', '#ffffff', '#00a54e', '#f28c28', '#7b4fa2', '#1c1c1c'][i % 8])); p.castShadow = true; scene.add(p);
  P.push({ p, x: s * (9 + rnd() * 2.6), s0: rnd() * 900, v: (rnd() < .5 ? 1 : -1) * (1.1 + rnd() * .7) }); }
function world(t) { const T = Math.floor(t / STEP) * STEP * 24;
  for (const c of V) { const s = ((c.s0 + T * c.v) % 1000 + 1000) % 1000; c.g.position.set(c.x, 0, 250 - s); }
  for (const q of P) { const s = ((q.s0 + T * q.v) % 900 + 900) % 900; q.p.position.set(q.x, CURB + .75, 240 - s); } }
// ------------------------------------------------------------------ camera: a high oblique glide up the street, then a slow descent toward the arcades
function camAt(t) {
  const u = eio(seg(t, 0, DUR)), z = lerp(150, -200, u), h = lerp(TV ? 120 : 160, TV ? 70 : 95, ss(seg(t, 4, 10))), side = lerp(-60, -34, u);
  const look = new THREE.Vector3(0, 0, z - 30); cam.position.set(look.x + side, h, look.z + h * .95); cam.lookAt(look);
  const d = post.dof; d.focus = cam.position.distanceTo(look); d.aper = TV ? 5200 : 4200; d.maxCoc = 26;
  Object.assign(d.band, { y: .5, w: TV ? .06 : .05, amp: 28, mix: .55, tilt: 0, pow: 1.3 });
}
// overlay: the time-lapse readout
const ov = document.getElementById('ov'); ov.width = W; ov.height = H; const oc = ov.getContext('2d'); let REG = [];
function overlay(t) { const S = H / 1080; oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, W, H); oc.setTransform(S, 0, 0, S, 0, 0);
  const a = seg(t, .6, 1.0); if (a <= 0) return; const x = TV ? 60 : 30, y = TV ? 70 : 150, fs = TV ? 26 : 18;
  oc.save(); oc.globalAlpha = a; oc.fillStyle = 'rgba(20,24,28,.72)'; oc.beginPath(); oc.roundRect(x, y - fs - 10, TV ? 330 : 230, fs + 22, 6); oc.fill(); oc.fillStyle = '#f6ec25'; oc.font = `600 ${fs}px PlexMono`; oc.fillText('×24 TIME-LAPSE', x + 14, y + 2); oc.restore();
  if (a > .5) REG.push({ id: 'tl', text: '×24 TIME-LAPSE', x0: (x + 14) * S, y0: (y - fs) * S, x1: (x + 300) * S, y1: (y + 4) * S }); }
function render(t) { REG = []; world(t); camAt(t); const G = post.grade.uniforms; G.sat.value = 1.32; G.contrast.value = .25; G.amt.value = .3; G.warm.value = .25; post.composer.render(); overlay(t); }
window.render = render; window.TEXTS = () => REG.slice();
window.EV = Array.from({ length: Math.floor(DUR / STEP) }, (_, i) => ({ t: +(i * STEP).toFixed(3), type: 'tick' })).filter((e, i) => i % 2 === 0);
Promise.all(['800 40px Overpass', '600 20px PlexMono'].map(f => document.fonts.load(f, 'A1'))).then(() => { const g = nameC.getContext('2d'); g.clearRect(0, 0, 2048, 256); g.fillStyle = '#f4f1e8'; g.font = '800 190px Overpass'; g.textAlign = 'center'; g.fillText('JL. TUNJUNGAN', 1024, 200); nameT.needsUpdate = true; render(0); window.READY = true; });
