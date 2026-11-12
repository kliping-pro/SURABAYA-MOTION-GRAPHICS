// Paper-cut Lightbox window S9 (10 s): Malam di Kya-Kya, Kembang Jepun (STYLE: styles/paper-lantern/STYLE.md).
// A shallow box of cut paper sheets, backlit. Full-bleed: the lens is inside the box. One cool night ladder (light at the
// back, near-black in front), warm light through windows, red lanterns as the one accent. The layers switch on from the
// back, one by one; at the end the lights dim and only the moon is left. The moon (a white disc in a violet paper ring)
// is the map's station dot at both ends. Units: metres; layers from z = -0.14 (sky) to 0 (front).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { clamp, lerp, seg, ss, eio, eo, mulberry } from '/core/lib.js';
const Q = new URLSearchParams(location.search);
const TV = (Q.get('fmt') || (innerWidth > innerHeight ? 'tv' : 'reels')) === 'tv';
const DUR = 10; window.DUR = DUR;
const W = innerWidth, H = innerHeight;
const R = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); R.setPixelRatio(1); R.setSize(W, H);
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.toneMapping = THREE.NeutralToneMapping;
document.getElementById('stage').appendChild(R.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color('#05070f');
const cam = new THREE.PerspectiveCamera(26, W / H, .01, 5);
const SW = .9, SH = .9;                                     // sheet size (a long full-bleed strip, larger than the frame)
const MOON = [.17, .16, .028];                              // x, y, r (m) on the sky sheet
// ------------------------------------------------------------------ sheets: a paper canvas (colour + holes) and a light canvas (windows)
const PX = 1400 / SW;   // px per metre
function sheet(z, col, draw, lights, trans, on) {
  const c = document.createElement('canvas'); c.width = 1400; c.height = 1400; const g = c.getContext('2d');
  g.setTransform(PX, 0, 0, -PX, 700, 700);                  // metre space, y up, origin centre
  g.fillStyle = col; draw(g);
  // fibre grain and the top rim / bottom shade, a few px shifted
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; const r = mulberry(z * 1e4 | 0);
  for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(255,255,255,${r() * .05})`; g.fillRect(r() * 1400, r() * 1400, 1 + r() * 3, 1); }
  g.globalCompositeOperation = 'source-over';
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const m = new THREE.MeshStandardMaterial({ map: t, transparent: false, alphaTest: .5, roughness: .95, emissive: new THREE.Color('#ffb862'), emissiveMap: t, emissiveIntensity: 0, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), m); mesh.position.z = z; mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
  let lm = null;
  if (lights) { const lc = document.createElement('canvas'); lc.width = 1400; lc.height = 1400; const lg = lc.getContext('2d'); lg.setTransform(PX, 0, 0, -PX, 700, 700); lights(lg);
    const lt = new THREE.CanvasTexture(lc); lt.colorSpace = THREE.SRGBColorSpace;
    lm = new THREE.MeshBasicMaterial({ map: lt, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
    const lmesh = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), lm); lmesh.position.z = z - .004; scene.add(lmesh); }
  return { m, lm, trans, on };
}
const P = (g, pts) => { g.beginPath(); pts.forEach((p, i) => g[i ? 'lineTo' : 'moveTo'](...p)); g.closePath(); g.fill(); };
const hole = (g, f) => { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; f(); g.restore(); };
const rnd = mulberry(5);
// the roofs of Kembang Jepun shophouses, a row of windows
function roofRow(g, y, n, w, hMin, hMax, seed) { const r = mulberry(seed); g.beginPath(); g.moveTo(-SW / 2, -SH / 2); let x = -SW / 2;
  while (x < SW / 2) { const ww = w * (.7 + r() * .6), hh = lerp(hMin, hMax, r()); g.lineTo(x, y + hh); g.lineTo(x + ww * .12, y + hh + .025); g.lineTo(x + ww * .88, y + hh + .025); g.lineTo(x + ww, y + hh); x += ww; }
  g.lineTo(SW / 2, -SH / 2); g.closePath(); g.fill(); }
const WIN = [];
const L = [
  // 0 · sky: deep night, the moon is a hole (it burns), a violet paper ring around it
  sheet(-.14, '#0a1330', g => { g.fillRect(-SW / 2, -SH / 2, SW, SH); hole(g, () => { g.beginPath(); g.arc(MOON[0], MOON[1], MOON[2], 0, 7); g.fill(); }); },
    g => { g.fillStyle = '#fff6e0'; g.beginPath(); g.arc(MOON[0], MOON[1], MOON[2] * 1.02, 0, 7); g.fill(); }, .9, -1),
  // 1 · the ring around the moon (a separate small sheet just in front, violet)
  null,
  // 2 · far roofs, pale cool, many small windows
  sheet(-.11, '#6a86c2', g => roofRow(g, -.05, 0, .07, .02, .08, 3), g => { g.fillStyle = '#ffd59a'; const r = mulberry(9); for (let i = 0; i < 70; i++) { const x = -SW / 2 + r() * SW, y = -.2 + r() * .17; g.fillRect(x, y, .008, .011); } }, .7, 1.2),
  // 3 · the Pecinan gate (gapura) with its curved roof, lantern strings
  sheet(-.08, '#3f5a92', g => { const y0 = -.02; P(g, [[-.2, y0], [-.17, y0 + .045], [.17, y0 + .045], [.2, y0], [.23, y0 + .025], [.23, y0 - .006], [-.23, y0 - .006], [-.23, y0 + .025]]);
      g.fillRect(-.16, -.45, .028, y0 + .45); g.fillRect(.132, -.45, .028, y0 + .45); g.fillRect(-.17, y0 - .05, .34, .03); roofRow(g, -.12, 0, .1, .0, .05, 7); },
    g => { g.fillStyle = '#ffb862'; g.fillRect(-.11, -.05, .22, .018); }, .45, 2.4),
  // 4 · stalls: awnings, carts with lit windows
  sheet(-.05, '#24346a', g => { for (let i = -3; i <= 3; i++) { const x = i * .12; g.fillRect(x - .055, -.118, .11, .022); for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(x - .044 + k * .022, -.118, .011, Math.PI, 0); g.fill(); } g.fillRect(x - .045, -.2, .09, .08); } g.fillRect(-SW / 2, -SH / 2, SW, SH / 2 - .2); },
    g => { g.fillStyle = '#ffcf80'; for (let i = -3; i <= 3; i++) g.fillRect(i * .12 - .035, -.175, .07, .04); }, .25, 3.6),
  // 5 · strings of red lanterns (the accent), crossing the street
  sheet(-.025, '#0e1532', g => { for (const [y, s] of [[.02, 1], [.075, -1]]) { g.lineWidth = .002; g.strokeStyle = '#0e1532'; g.beginPath(); g.moveTo(-SW / 2, y + .02); g.quadraticCurveTo(0, y - .03 * s, SW / 2, y + .02); g.stroke(); } },
    g => { for (const [y, s] of [[.02, 1], [.075, -1]]) for (let i = -9; i <= 9; i++) { const x = i * .045, yy = y + .02 - (.05 * s) * (1 - Math.pow(x / (SW / 2), 2)) - .012; g.fillStyle = '#ff5a3c'; g.beginPath(); g.ellipse(x, yy, .011, .014, 0, 0, 7); g.fill(); g.fillStyle = '#ffd08a'; g.fillRect(x - .0025, yy - .004, .005, .008); } }, .1, 4.8),
  // 6 · the front: near black, figures at the stalls, the street edge
  sheet(0, '#070a18', g => { g.fillRect(-SW / 2, -SH / 2, SW, SH / 2 - .27); const r = mulberry(12);
      for (let i = 0; i < 16; i++) { const x = -.42 + i * .056 + r() * .02, h = .06 + r() * .025; g.beginPath(); g.arc(x, -.27 + h, .009, 0, 7); g.fill(); P(g, [[x - .012, -.27], [x - .009, -.27 + h - .01], [x + .009, -.27 + h - .01], [x + .012, -.27]]); }
      g.fillRect(-SW / 2, -SH / 2, .06, SH); g.fillRect(SW / 2 - .06, -SH / 2, .06, SH); }, null, .05, 6.0),
];
// the moon's ring: a violet paper ring just in front of the sky (the map's station dot, line 7 Budaya)
{ const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#7B4FA2'; g.beginPath(); g.arc(128, 128, 126, 0, 7); g.fill(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(128, 128, 126 * MOON[2] / (MOON[2] * 1.38), 0, 7); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const m = new THREE.MeshStandardMaterial({ map: t, alphaTest: .5, roughness: .95, emissive: new THREE.Color('#ffffff'), emissiveMap: t, emissiveIntensity: 1.0 });
  const ring = new THREE.Mesh(new THREE.PlaneGeometry(MOON[2] * 2 * 1.38, MOON[2] * 2 * 1.38), m); ring.position.set(MOON[0], MOON[1], -.136); ring.castShadow = true; scene.add(ring); }
// light: a warm top spot casting soft shadows from each layer onto the ones behind, and a dim fill
const spot = new THREE.SpotLight('#ffe2b0', 1.5, 3, .9, .7, 1); spot.position.set(-.05, .55, .35); spot.target.position.set(0, 0, -.1); spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.radius = 6; spot.shadow.bias = -.0005; scene.add(spot, spot.target);
scene.add(new THREE.AmbientLight('#4060a0', .18));
// ------------------------------------------------------------------ post: bloom so the windows burn, vignette in the output
const comp = new EffectComposer(R); comp.addPass(new RenderPass(scene, cam)); const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), .7, .5, .6); comp.addPass(bloom); comp.addPass(new OutputPass());
// ------------------------------------------------------------------ camera: on the moon (dot-sized) -> pull back and down into the street -> drift -> back to the moon
const fovT = Math.tan(13 * Math.PI / 180);
const dDot = MOON[2] * 1.38 * 540 / 34 / fovT;   // the ring reads r ~ 34 of 1080
function camAt(t) {
  const dz = -.14;
  const moon = { x: MOON[0], y: MOON[1], d: dDot }, street = { x: TV ? 0 : -.02, y: TV ? -.02 : -.04, d: TV ? .62 : .78 }, street2 = { x: TV ? .04 : .03, y: TV ? -.035 : -.05, d: TV ? .55 : .7 };
  let a, b, u; if (t < 2.4) { a = moon; b = street; u = eio(seg(t, .6, 2.6)); } else if (t < 7.6) { a = street; b = street2; u = seg(t, 2.4, 7.6); } else { a = street2; b = moon; u = eio(seg(t, 7.8, 9.8)); }
  const d = Math.exp(lerp(Math.log(a.d), Math.log(b.d), u)), x = lerp(a.x, b.x, u), y = lerp(a.y, b.y, u);
  const lookZ = lerp(-.14, -.06, ss(seg(d, dDot, .5)));
  cam.position.set(x, y, lookZ + d); cam.lookAt(x, y, lookZ);
}
function lightsAt(t) {
  const dim = 1 - ss(seg(t, 7.6, 8.8));
  L.forEach((s, i) => { if (!s) return; const on = s.on < 0 ? 1 : ss(seg(t, s.on, s.on + .5));
    s.m.emissiveIntensity = s.trans * (.15 + .85 * on) * (s.on < 0 ? 1 : dim) * .32;
    if (s.lm) s.lm.opacity = (s.on < 0 ? 1 : on * dim) * (i === 0 ? .85 : 1.1) * (1 + .06 * Math.sin(t * 7 + i)); });
  spot.intensity = 1.5 * (.4 + .6 * ss(seg(t, .8, 2.0))) * (.5 + .5 * (1 - ss(seg(t, 7.8, 9.0))));
}
// a handwritten-free paper caption strip (printed on a sheet edge feel): place and time, lower left
const ov = document.getElementById('ov'); ov.width = W; ov.height = H; const oc = ov.getContext('2d'); let REG = [];
function overlay(t) { const S = H / 1080; oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, W, H); oc.setTransform(S, 0, 0, S, 0, 0);
  const a = seg(t, 2.6, 3.0) * (1 - seg(t, 7.4, 7.8)); if (a <= 0) return; const x = TV ? 80 : 36, y = TV ? 110 : 190;
  oc.save(); oc.globalAlpha = a; oc.fillStyle = '#f3e3c3'; oc.font = `600 ${TV ? 40 : 28}px Inter`; oc.fillText('Kya-Kya Kembang Jepun', x, y); oc.font = `400 ${TV ? 22 : 16}px Inter`; oc.fillStyle = '#c9b996'; oc.fillText('malam · Kembang Jepun night market', x, y + (TV ? 34 : 26)); oc.restore();
  if (a > .5) REG.push({ id: 'kya', text: 'Kya-Kya Kembang Jepun', x0: x * S, y0: (y - 36) * S, x1: (x + 470) * S, y1: (y + 6) * S }); }
function render(t) { REG = []; camAt(t); lightsAt(t); comp.render(); overlay(t); }
window.render = render; window.TEXTS = () => REG.slice();
window.EV = [{ t: 0, type: 'moon' }, ...L.filter(s => s && s.on > 0).map(s => ({ t: s.on, type: 'layer' })), { t: 7.6, type: 'dim' }];
document.fonts.load('600 30px Inter', 'K').then(() => { render(0); window.READY = true; });
