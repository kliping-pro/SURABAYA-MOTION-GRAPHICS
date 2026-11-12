// Low-poly Isometric Island window S7 (9 s): Kebun Binatang Surabaya and the Sura & Baya statue
// (STYLE: styles/lowpoly-island/STYLE.md). Hex tiles rise from nothing, trees and animals pop, every arrival a note; the
// statue of Sura (the shark) and Baya (the crocodile) lands last on its round plinth. Orthographic camera, slow
// turntable, flat shading, pastel day, GTAO. Opens and closes on the round plinth: a white disc in an orange ring.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { clamp, lerp, seg, ss, eio, eo, back, mulberry } from '/core/lib.js';
const Q = new URLSearchParams(location.search);
const TV = (Q.get('fmt') || (innerWidth > innerHeight ? 'tv' : 'reels')) === 'tv';
const DUR = 9; window.DUR = DUR;
const W = innerWidth, H = innerHeight, A = W / H;
const R = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); R.setPixelRatio(1); R.setSize(W, H);
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.toneMapping = THREE.NeutralToneMapping; R.toneMappingExposure = 1.1;
document.getElementById('stage').appendChild(R.domElement);
const scene = new THREE.Scene();
{ const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#a9cfe8'); gr.addColorStop(.6, '#e7f0f2'); gr.addColorStop(1, '#f6eadb'); g.fillStyle = gr; g.fillRect(0, 0, 4, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; }
const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -200, 400);
const rnd = mulberry(7);
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: .9, ...o });
const sun = new THREE.DirectionalLight('#fff4e0', 2.6); sun.position.set(-30, 50, 25); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 150 }); sun.shadow.bias = -.0008; scene.add(sun);
scene.add(new THREE.HemisphereLight('#dbeaff', '#e8cfa8', 1.2));
// ------------------------------------------------------------------ the island: hex tiles in rings, each rising at its own time with a note
const POP = [];   // {obj, t, kind, y0}
const hexPos = (q, r) => [Math.sqrt(3) * (q + r / 2), 1.5 * r];
const tiles = [];
for (let q = -6; q <= 6; q++) for (let r = -6; r <= 6; r++) { const s = -q - r; const d = Math.max(Math.abs(q), Math.abs(r), Math.abs(s)); if (d > 6) continue; tiles.push({ q, r, d }); }
const pond = new Set(['2,-1', '3,-1', '2,0', '3,-2', '1,0', '2,-2']);
const GR = ['#a8cf7a', '#9cc66e', '#b3d687'], SAND = '#ecd9a8';
tiles.sort((a, b) => a.d - b.d || Math.atan2(a.r, a.q) - Math.atan2(b.r, b.q));
tiles.forEach((tl, i) => {
  const key = tl.q + ',' + tl.r, water = pond.has(key), edge = tl.d >= 6, [x, z] = hexPos(tl.q, tl.r);
  const h = water ? .5 : edge ? .7 : 1 + rnd() * .25;
  const g = new THREE.Group(); const side = new THREE.Mesh(new THREE.CylinderGeometry(.98, .98, h - .08, 6), mat(water ? '#5b8fa8' : edge ? '#d8c08e' : '#8c6e4f'));
  side.position.y = (h - .08) / 2; side.receiveShadow = true; g.add(side);
  const capc = water ? '#7fc4dc' : edge ? SAND : GR[(rnd() * 3) | 0]; const cap = new THREE.Mesh(new THREE.CylinderGeometry(.99, .99, .1, 6), mat(capc, water ? { roughness: .35 } : {}));
  cap.position.y = h - .05; cap.receiveShadow = true; g.add(cap); g.position.set(x, 0, z); scene.add(g);
  POP.push({ obj: g, t: i === 0 ? -1 : .45 + i * .018, kind: 'tile', y0: 0, from: -3 });
  tl.top = h;
});
const tileTop = (q, r) => (tiles.find(t => t.q === q && t.r === r) || { top: 1 }).top;
// trees (cones and icosahedra), animals (primitive assemblies), each popping with a note
function tree(q, r, k) { const [x, z] = hexPos(q, r), g = new THREE.Group(), y = tileTop(q, r);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.08, .1, .5, 5), mat('#7a5a3c')); trunk.position.y = .25; g.add(trunk);
  const crown = k % 2 ? new THREE.Mesh(new THREE.ConeGeometry(.45, 1.1, 6), mat('#4f9a52')) : new THREE.Mesh(new THREE.IcosahedronGeometry(.5, 0), mat('#62ad5a')); crown.position.y = k % 2 ? 1.0 : .85; crown.castShadow = true; g.add(crown);
  g.position.set(x + (rnd() - .5) * .5, y, z + (rnd() - .5) * .5); scene.add(g); return g; }
function elephant(q, r) { const [x, z] = hexPos(q, r), g = new THREE.Group(), m = mat('#9aa0a8');
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, .62, .6), m); body.position.y = .72; g.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(.42, .44, .44), m); head.position.set(.62, .86, 0); g.add(head);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.06, .09, .55, 5), m); trunk.position.set(.86, .55, 0); g.add(trunk);
  for (const [lx, lz] of [[-.32, -.2], [-.32, .2], [.3, -.2], [.3, .2]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.16, .42, .16), m); l.position.set(lx, .21, lz); g.add(l); }
  for (const sz of [-1, 1]) { const ear = new THREE.Mesh(new THREE.BoxGeometry(.08, .34, .3), mat('#8a9098')); ear.position.set(.5, .9, sz * .3); g.add(ear); }
  g.traverse(o => o.castShadow = true); g.position.set(x, tileTop(q, r), z); g.rotation.y = .5; scene.add(g); return g; }
function deer(q, r, rot) { const [x, z] = hexPos(q, r), g = new THREE.Group(), m = mat('#c08a55');
  const body = new THREE.Mesh(new THREE.BoxGeometry(.6, .3, .24), m); body.position.y = .52; g.add(body);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(.12, .36, .12), m); neck.position.set(.28, .78, 0); neck.rotation.z = -.3; g.add(neck);
  const head = new THREE.Mesh(new THREE.BoxGeometry(.2, .14, .14), m); head.position.set(.38, .96, 0); g.add(head);
  for (const [lx, lz] of [[-.22, -.08], [-.22, .08], [.22, -.08], [.22, .08]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.06, .38, .06), m); l.position.set(lx, .19, lz); g.add(l); }
  g.traverse(o => o.castShadow = true); g.position.set(x, tileTop(q, r), z); g.rotation.y = rot; scene.add(g); return g; }
function komodo(q, r) { const [x, z] = hexPos(q, r), g = new THREE.Group(), m = mat('#7d7a5a');
  const body = new THREE.Mesh(new THREE.BoxGeometry(.8, .16, .26), m); body.position.y = .14; g.add(body); const tail = new THREE.Mesh(new THREE.ConeGeometry(.12, .7, 4), m); tail.rotation.z = Math.PI / 2; tail.position.set(-.72, .12, 0); g.add(tail);
  const head = new THREE.Mesh(new THREE.BoxGeometry(.26, .12, .18), m); head.position.set(.5, .16, 0); g.add(head); g.traverse(o => o.castShadow = true); g.position.set(x, tileTop(q, r), z); g.rotation.y = -.8; scene.add(g); return g; }
// the statue of Sura & Baya on its round plinth at the centre of the island: a white disc in an orange ring
const PLINTH = new THREE.Group(); { const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.45, .3, 24), mat('#F28C28')); ring.position.y = .15; PLINTH.add(ring);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, .34, 24), mat('#ffffff')); disc.position.y = .17; PLINTH.add(disc); PLINTH.traverse(o => o.receiveShadow = true); PLINTH.position.set(0, tileTop(0, 0), 0); scene.add(PLINTH); }
const STATUE = new THREE.Group(); { const m = mat('#d7d2c6', { roughness: .8 });
  // Sura, the shark, rising on its tail; Baya, the crocodile, curling up to face it
  const sb = new THREE.Mesh(new THREE.ConeGeometry(.32, 2.1, 5), m); sb.position.set(-.35, 1.25, 0); sb.rotation.z = -.35; STATUE.add(sb);
  const fin = new THREE.Mesh(new THREE.ConeGeometry(.18, .5, 3), m); fin.position.set(-.05, 1.55, 0); fin.rotation.z = -1.4; STATUE.add(fin);
  const tailf = new THREE.Mesh(new THREE.ConeGeometry(.3, .5, 3), m); tailf.position.set(-.62, .45, 0); tailf.rotation.z = 2.6; STATUE.add(tailf);
  const cb = new THREE.Mesh(new THREE.BoxGeometry(.34, 1.7, .36), m); cb.position.set(.42, 1.0, 0); cb.rotation.z = .42; STATUE.add(cb);
  const jaw = new THREE.Mesh(new THREE.ConeGeometry(.17, .7, 4), m); jaw.position.set(.12, 1.95, 0); jaw.rotation.z = .9; STATUE.add(jaw);
  const ct = new THREE.Mesh(new THREE.ConeGeometry(.2, 1.1, 4), m); ct.position.set(.75, .3, .25); ct.rotation.set(.3, 0, -1.3); STATUE.add(ct);
  STATUE.traverse(o => o.castShadow = true); STATUE.position.set(0, tileTop(0, 0) + .34, 0); scene.add(STATUE); }
const props = [];
[[-3, 1], [-4, 2], [-2, 4], [1, 4], [4, 1], [-5, 3], [-1, -4], [1, -5], [-3, -2], [5, -3], [0, 5], [-4, -1], [3, 2], [2, 3]].forEach(([q, r], i) => props.push(tree(q, r, i)));
props.push(elephant(-2, 2), deer(1, 2, 2.2), deer(-1, 3, .4), komodo(4, -4), komodo(-3, 0));
props.forEach((o, i) => POP.push({ obj: o, t: 2.3 + i * .14, kind: 'prop', y0: o.position.y, from: 0 }));
// the plinth is there from the first frame: it is the map's dot
POP.push({ obj: STATUE, t: 5.3, kind: 'statue', y0: STATUE.position.y, from: 0 });
// a few birds circling (boxes with flapping wings) — skipped for the frame budget; the pond carries the glints
// ------------------------------------------------------------------ post
const comp = new EffectComposer(R); comp.addPass(new RenderPass(scene, cam));
const ao = new GTAOPass(scene, cam, W, H); ao.output = GTAOPass.OUTPUT.Default; ao.blendIntensity = .9; comp.addPass(ao); comp.addPass(new OutputPass());
// ------------------------------------------------------------------ camera: orthographic, elevation 33°, a slow turntable; open/close on the plinth
function camAt(t) {
  const plR = 1.45, dotH = plR * 1080 / 35 * 2 / 2;                       // frustum half-height so the plinth (r 1.45) reads r ~ 35 of 1080 (ring included)
  const wideH = TV ? 9.5 : 13.5;
  const h = t < 2.0 ? Math.exp(lerp(Math.log(plR * 1080 / 35 / 2 * 1.0), Math.log(wideH), eio(seg(t, .3, 2.0)))) : t < 7.6 ? wideH * (1 - .06 * seg(t, 2, 7.6)) : Math.exp(lerp(Math.log(wideH * .94), Math.log(plR * 1080 / 35 / 2), eio(seg(t, 7.6, 8.9))));
  const az = (35 + 28 * t / DUR) * Math.PI / 180, el = (t < 1 ? lerp(80, 33, ss(seg(t, 0, 1.6))) : t > 7.6 ? lerp(33, 80, ss(seg(t, 7.9, 8.9))) : 33) * Math.PI / 180;
  const ty = tileTop(0, 0) + .2;
  cam.left = -h * A; cam.right = h * A; cam.top = h; cam.bottom = -h; cam.updateProjectionMatrix();
  cam.position.set(Math.cos(el) * Math.cos(az) * 60, ty + Math.sin(el) * 60, Math.cos(el) * Math.sin(az) * 60); cam.lookAt(0, ty, 0);
}
function popAt(t) {
  for (const p of POP) { const k = t - p.t; if (k < 0) { p.obj.visible = false; continue; } p.obj.visible = true;
    const u = clamp(k / .35), b = back(u, 2.6); p.obj.scale.setScalar(Math.max(.001, b)); p.obj.position.y = p.y0 + (p.kind === 'tile' ? lerp(p.from, 0, eo(u)) : 0); }
}
// overlay: a small sign in the world's colours (the place), lower left
const ov = document.getElementById('ov'); ov.width = W; ov.height = H; const oc = ov.getContext('2d'); let REG = [];
function overlay(t) { const S = H / 1080; oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, W, H); oc.setTransform(S, 0, 0, S, 0, 0);
  const a = seg(t, 2.2, 2.6) * (1 - seg(t, 7.4, 7.8)); if (a <= 0) return; const x = TV ? 70 : 34, y = TV ? 90 : 160;
  oc.save(); oc.globalAlpha = a; oc.fillStyle = 'rgba(255,255,255,.82)'; oc.beginPath(); oc.roundRect(x, y - 44, TV ? 520 : 360, TV ? 92 : 70, 14); oc.fill();
  oc.fillStyle = '#F28C28'; oc.beginPath(); oc.arc(x + 30, y + 2, TV ? 14 : 10, 0, 7); oc.fill(); oc.fillStyle = '#3d3a35'; oc.font = `800 ${TV ? 30 : 22}px Fredoka`; oc.fillText('Kebun Binatang Surabaya', x + 56, y + 2);
  oc.font = `500 ${TV ? 20 : 14}px Fredoka`; oc.fillStyle = '#6b665d'; oc.fillText(t > 5.6 ? 'Patung Sura & Baya · Sura and Baya Statue' : 'Surabaya Zoo', x + 56, y + (TV ? 30 : 22)); oc.restore();
  if (a > .5) REG.push({ id: 'kbs', text: 'Kebun Binatang Surabaya', x0: (x + 56) * S, y0: (y - 26) * S, x1: (x + 480) * S, y1: (y + 6) * S }); }
function render(t) { REG = []; popAt(t); camAt(t); comp.render(); overlay(t); }
window.render = render; window.TEXTS = () => REG.slice();
window.EV = POP.map(p => ({ t: +p.t.toFixed(3), type: p.kind }));
document.fonts.load('800 30px Fredoka', 'K').then(() => { render(0); window.READY = true; });
