// Projection on White Model window S2 (11 s): Tugu Pahlawan (STYLE: styles/white-model/STYLE.md).
// The white model: Google Open Buildings v3 footprints around the monument (uniform height, no height data) and the
// monument from its documented form (41.15 m, 10 flutes, 11 segments). Every colour is projected light added in the
// shader; the model never changes. 1 unit = 100 m. ?fmt=reels|tv
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { clamp, lerp, seg, ss, eio, eo, back } from '/core/lib.js';

const Q = new URLSearchParams(location.search);
const TV = (Q.get('fmt') || (innerWidth > innerHeight ? 'tv' : 'reels')) === 'tv';
const DUR = 16; window.DUR = DUR;   // v2: longer (audit note: the monument needs time to be seen)
const W = innerWidth, H = innerHeight, VW = () => 1080 * W / H;
const RED = '#E53E31';
// beats (s)
const T = { lightsOut: 5.6, strike: 6.05, flute0: 6.6, fluteDT: .32, climb0: 10.0, climb1: 12.6, figure: 12.8, iris: 14.6 };

let M, R, scene, cam, U, REG = [];
const glsl = /* glsl */`
uniform float uProj, uFlutes, uLevel, uTugH, uDot, uIris, uHouse, uTime;
uniform vec3 uProjPos;
varying vec4 vData; varying vec3 vWP; varying vec3 vWN;
vec3 projLight(float kind){
  vec3 N = normalize(vWN);
  float dirK = .42 + .58 * max(dot(N, normalize(uProjPos - vWP)), 0.);
  vec3 c = vec3(.0035, .0045, .008);                                // projector black level, cool near-black
  float r = length(vWP.xz);
  if (kind < .5) {                                                  // the monument
    float ang = atan(vWP.z, vWP.x); float fl = floor(mod((ang + 3.14159265) / 6.2831853 * 10. + .5, 10.));
    float on = step(fl + .5, uFlutes);                               // flutes switch on one by one
    float flash = clamp(1. - (uFlutes - fl - .5) * 2.2, 0., 1.) * on;
    c += vec3(.898, .243, .192) * 2.8 * on + vec3(1.) * flash * 1.4;
    float h = vWP.y / uTugH, lv = smoothstep(uLevel + .012, uLevel - .012, h);   // a level of light climbs the segments
    float seg = fract(h * 11.); float rib = smoothstep(.0, .06, seg) * smoothstep(1., .94, seg);
    c = mix(c, vec3(1., .93, .84) * 1.5 * (.75 + .25 * rib), lv * step(.001, uLevel));
    float band = exp(-pow((h - uLevel) / .012, 2.)) * step(.001, uLevel) * step(uLevel, .999);
    c += vec3(1.) * band * 1.4;
  } else if (kind > .5 && kind < 1.5) {                             // the plate: the map's station dot, projected
    float R0 = .054 * uDot, RW = .0145;
    float disc = smoothstep(R0 + .002, R0 - .002, r) * step(.01, uDot);
    float ring = smoothstep(RW * .5 + .002, RW * .5 - .002, abs(r - R0 - RW * .5)) * step(.01, uDot);
    c += vec3(1.) * disc * 1.3 + vec3(.898, .243, .192) * 2.2 * ring;
  }
  // v2: the city is lit too: waves of warm-to-blue light spread from the monument over every roof (lively, not dark)
  if (kind > .5 && kind < 2.5) { float w = .55 + .45 * sin(r * 7. - uTime * 2.2); vec3 wc = mix(vec3(1., .62, .28), vec3(.30, .55, 1.), smoothstep(.4, 2.6, r));
    c += wc * w * .55 * smoothstep(3.2, .2, r) * step(.001, uFlutes); }
  float iris = smoothstep(uIris + .03, uIris - .03, r);              // the throw closes onto the plaza
  return c * dirK * uProj * iris;
}`;
function projMat(kind, color, rough = .9) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0 });
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec4 vData; varying vec3 vWP; varying vec3 vWN;')
      .replace('#include <fog_vertex>', '#include <fog_vertex>\n vWP = (modelMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + glsl)
      .replace('#include <opaque_fragment>', `outgoingLight += projLight(${kind}.0) * diffuseColor.rgb * 2.1;\n#include <opaque_fragment>`);
  };
  m.customProgramCacheKey = () => 'p' + kind;
  return m;
}
// the monument: a fluted decagonal shaft in 11 segments on a stepped round base (documented: 41.15 m, 10 flutes, 11 segments)
function tugu(h) {
  const parts = [], segs = 11, r0 = .016, r1 = .0042;               // base and top radius (simplified proportions)
  for (let s = 0; s < segs; s++) {
    const y0 = h * s / segs, y1 = h * (s + 1) / segs, ra = lerp(r0, r1, s / segs) * (s === 0 ? 1.05 : 1), rb = lerp(r0, r1, (s + 1) / segs);
    const shape = (rr) => { const p = new THREE.Shape(); const N = 10; for (let i = 0; i <= N * 6; i++) { const a = i / (N * 6) * Math.PI * 2, k = .82 + .18 * Math.abs(Math.cos(a * N / 2)); const x = Math.cos(a) * rr * k, z = Math.sin(a) * rr * k; i ? p.lineTo(x, z) : p.moveTo(x, z); } return p; };
    const g = new THREE.CylinderGeometry(rb, ra, (y1 - y0) * .965, 60, 1);
    // flute the cylinder: radial in-out by angle
    const pos = g.attributes.position; for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i), a = Math.atan2(z, x), k = .84 + .16 * Math.abs(Math.cos(a * 5)); pos.setX(i, x * k); pos.setZ(i, z * k); }
    g.translate(0, (y0 + y1) / 2, 0); g.computeVertexNormals(); parts.push(g);
  }
  const tip = new THREE.ConeGeometry(r1 * .95, h * .02, 30); tip.translate(0, h * 1.01, 0); parts.push(tip);
  return mergeGeometries(parts.map(g => g.toNonIndexed()));
}
function buildings() {
  const geos = [];
  for (const [rings] of M.b) {
    const sh = new THREE.Shape(rings[0].map(([x, z]) => new THREE.Vector2(x, -z)));
    for (const hole of rings.slice(1)) sh.holes.push(new THREE.Path(hole.map(([x, z]) => new THREE.Vector2(x, -z))));
    const g = new THREE.ExtrudeGeometry(sh, { depth: M.h, bevelEnabled: false }); g.rotateX(-Math.PI / 2); geos.push(g.toNonIndexed());
  }
  return mergeGeometries(geos);
}
function setup() {
  R = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  R.setPixelRatio(1); R.setSize(W, H); R.toneMapping = THREE.NeutralToneMapping; R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('stage').appendChild(R.domElement);
  scene = new THREE.Scene();
  { const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d'), gr = g.createRadialGradient(128, 110, 10, 128, 128, 190); gr.addColorStop(0, '#1b1e22'); gr.addColorStop(.55, '#0a0b0d'); gr.addColorStop(1, '#030304'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; }
  cam = new THREE.PerspectiveCamera(30, W / H, .002, 40);
  U = { uProj: { value: 0 }, uFlutes: { value: 0 }, uLevel: { value: 0 }, uTugH: { value: M.tugu.h }, uDot: { value: 0 }, uIris: { value: 9 }, uHouse: { value: 1 }, uTime: { value: 0 }, uProjPos: { value: new THREE.Vector3(.6, 3.2, 1.4) } };
  const white = '#f3f3f1';
  const city = new THREE.Mesh(buildings(), projMat(2, white)); city.castShadow = city.receiveShadow = true; scene.add(city);
  const mon = new THREE.Mesh(tugu(M.tugu.h), projMat(0, white, .85)); mon.castShadow = mon.receiveShadow = true; scene.add(mon);
  const base1 = new THREE.Mesh(new THREE.CylinderGeometry(.03, .034, .006, 64), projMat(3, white)); base1.position.y = .003; base1.receiveShadow = base1.castShadow = true; scene.add(base1);
  const base2 = new THREE.Mesh(new THREE.CylinderGeometry(.022, .026, .004, 64), projMat(3, white)); base2.position.y = .008; base2.receiveShadow = base2.castShadow = true; scene.add(base2);
  const S = M.half * 2;
  const plate = new THREE.Mesh(new THREE.BoxGeometry(S + .1, .02, S + .1), projMat(1, '#ebe8e2')); plate.position.y = -.01; plate.receiveShadow = true; scene.add(plate);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(S + .5, 1.2, S + .5), new THREE.MeshStandardMaterial({ color: '#17181a', roughness: .5 })); plinth.position.y = -.62; scene.add(plinth);
  const house = new THREE.DirectionalLight('#ffffff', 2.2); house.position.set(-2.4, 3.6, 2.0); house.castShadow = true;
  Object.assign(house.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: .5, far: 12 }); house.shadow.mapSize.set(2048, 2048); house.shadow.bias = -.0004; house.shadow.normalBias = .002;
  scene.add(house); const hemi = new THREE.HemisphereLight('#dfe7f2', '#141414', .35); scene.add(hemi);
  scene.userData = { house, hemi };
}
// ------------------------------------------------------------------ camera: top-down on the tip (the map's dot) -> crane out -> orbit -> boom down low -> back up
function camAt(t) {
  const h = M.tugu.h;
  const top = { r: .002, el: 89.5, az: 20, d: .55, ty: h * .9 };
  // the landscape: house lights on, the whole monument in its square and the streets around it, a slow orbit
  const land = { r: 0, el: 13, az: 18, d: TV ? 1.3 : 1.7, ty: h * .5 };
  const oblique = { r: 0, el: 20, az: 40, d: TV ? 1.55 : 2.0, ty: h * .5 };
  // low against the black, still the whole monument from base to tip in frame
  const low = { r: 0, el: 7, az: 70, d: TV ? 1.35 : 1.75, ty: h * .52 };
  const mixc = (a, b, u) => ({ el: lerp(a.el, b.el, u), az: lerp(a.az, b.az, u), d: Math.exp(lerp(Math.log(a.d), Math.log(b.d), u)), ty: lerp(a.ty, b.ty, u) });
  let c;
  if (t < 3.4) c = mixc(top, land, eio(seg(t, .5, 3.4)));
  else if (t < 6.4) c = { ...land, az: lerp(18, 34, seg(t, 3.4, 6.4)) };
  else if (t < 10.0) c = mixc({ ...land, az: 34 }, oblique, eio(seg(t, 6.4, 8.2))), c.az += 8 * seg(t, 8.2, 10);
  else if (t < 14.4) c = mixc({ ...oblique, az: 48 }, low, eio(seg(t, 10, 11.6))), c.az += 8 * seg(t, 11.6, 14.4);
  else c = mixc({ ...low, az: 78 }, { ...top, ty: 0, d: 4.0 }, eio(seg(t, 14.4, 15.8)));
  const el = c.el * Math.PI / 180, az = c.az * Math.PI / 180;
  cam.position.set(Math.cos(el) * Math.cos(az) * c.d, c.ty + Math.sin(el) * c.d, Math.cos(el) * Math.sin(az) * c.d);
  cam.up.set(0, 1, 0); if (c.el > 89) cam.up.set(0, 0, -1);
  cam.lookAt(0, c.ty, 0);
  // reels: the monument moves to the right third so the readout keeps the left; centred again for the closing dot
  if (!TV) { const off = ss(seg(t, 6.2, 7.6)) * (1 - ss(seg(t, 14.4, 15.2))); cam.setViewOffset(W * 1.5, H, W * .25 * (1 - off), 0, W, H); }
}
// ------------------------------------------------------------------ 2D layer (virtual VW x 1080)
const toScreen = v => { const p = v.clone().project(cam); return [(p.x + 1) / 2 * VW(), (1 - p.y) / 2 * 1080]; };
function txt(c, id, s, x, y, font, col = '#eef0f2', a = 1, align = 'left') {
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.font = font; c.textAlign = align; c.fillStyle = col; c.fillText(s, x, y);
  const w = c.measureText(s).width, h = parseFloat(font.match(/(\d+)px/)[1]), x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  if (a > .5) { const S = H / 1080; REG.push({ id, text: s, x0: x0 * S, y0: (y - h * .8) * S, x1: (x0 + w) * S, y1: (y + h * .2) * S }); } c.restore();
}
const MONO = s => `${s}px PlexMono`, THIN = s => `200 ${s}px Inter`, SANS = (w, s) => `${w} ${s}px Inter`;
function overlay(c, t) {
  const vw = VW(), k = TV ? 1 : .7, L = TV ? 70 : 34;
  // identity label, quiet, top-left
  const ia = seg(t, 1.6, 2.2) * (1 - seg(t, 14.0, 14.5)), iy = TV ? 52 : 140;
  txt(c, 'id1', 'Tugu Pahlawan, Surabaya', L, iy, SANS(600, 22 * k + (TV ? 0 : 4)), '#cfd3d8', ia);
  txt(c, 'id2', 'jejak bangunan: Google Open Buildings v3 · CC BY 4.0', L, iy + 26 * k + 6, MONO(TV ? 18 : 13), '#9aa0a6', ia);
  txt(c, 'id3', 'tinggi bangunan seragam 6 m (tanpa data tinggi)', L, iy + 48 * k + 10, MONO(TV ? 18 : 13), '#9aa0a6', ia);
  txt(c, 'id4', 'bentuk tugu disederhanakan', L, iy + 70 * k + 14, MONO(TV ? 18 : 13), '#9aa0a6', ia);
  // the readout in the left third: one layer, one figure, one label, one source
  const ry = TV ? 640 : 610;
  const layer = t < T.climb0 ? 1 : t < T.figure ? 2 : 3;
  const la = seg(t, T.flute0 - .2, T.flute0 + .2) * (1 - seg(t, T.iris, T.iris + .4));
  if (la > 0) {
    c.save(); c.globalAlpha = la * .55; const gr = c.createLinearGradient(0, 0, (TV ? 620 : 420), 0); gr.addColorStop(0, 'rgba(5,7,12,.9)'); gr.addColorStop(1, 'rgba(5,7,12,0)'); c.fillStyle = gr; c.fillRect(0, ry - 200 * k, TV ? 620 : 420, 300 * k); c.restore();
    if (layer === 1) {
      const n = clamp(Math.floor((t - T.flute0) / T.fluteDT) + 1, 0, 10);
      txt(c, 'l1i', '01 · LENGKUNG', L, ry - 150 * k, MONO(TV ? 20 : 14), '#9aa0a6', la);
      txt(c, 'l1f', String(n), L, ry, THIN(TV ? 140 : 96), n === 10 ? RED : '#eef0f2', la);
      txt(c, 'l1l', 'lengkungan di badan tugu', L, ry + 44 * k, SANS(500, TV ? 30 : 22), '#eef0f2', la);
      txt(c, 'l1s', 'sumber: tirto.id · Wikipedia', L, ry + 76 * k, MONO(TV ? 18 : 13), '#9aa0a6', la);
    } else if (layer === 2) {
      const u = seg(t, T.climb0, T.climb1), sg = clamp(Math.floor(u * 11 + .02), 0, 11), m = u >= 1 ? '41,15' : (41.15 * u).toFixed(1).replace('.', ',');
      txt(c, 'l2i', '02 · RUAS · TINGGI', L, ry - 150 * k, MONO(TV ? 20 : 14), '#9aa0a6', 1);
      txt(c, 'l2f', `${m} m`, L, ry, THIN(TV ? 140 : 96), u >= 1 ? RED : '#eef0f2', 1);
      txt(c, 'l2l', `ruas ${sg} dari 11`, L, ry + 44 * k, SANS(500, TV ? 30 : 22), '#eef0f2', 1);
      txt(c, 'l2s', 'sumber: tirto.id · Wikipedia', L, ry + 76 * k, MONO(TV ? 18 : 13), '#9aa0a6', 1);
    } else {
      txt(c, 'l3i', '03 · TANGGAL', L, ry - 150 * k, MONO(TV ? 20 : 14), '#9aa0a6', la);
      txt(c, 'l3f', '10 · 11 · 1945', L, ry, THIN(TV ? 120 : 70), RED, la);
      txt(c, 'l3l', '10 lengkung · 11 ruas · 1945', L, ry + 44 * k, SANS(500, TV ? 30 : 22), '#eef0f2', la);
      txt(c, 'l3s', 'diresmikan 10 November 1952', L, ry + 76 * k, MONO(TV ? 18 : 13), '#9aa0a6', la);
    }
  }
  // the pin on the tip: a hairline up to a tag
  const pa = seg(t, T.climb1, T.climb1 + .4) * (1 - seg(t, T.iris, T.iris + .3));
  if (pa > 0) {
    const tipP = toScreen(new THREE.Vector3(0, M.tugu.h * 1.02, 0)), tx = tipP[0] + (TV ? 120 : -270), ty = tipP[1] - (TV ? 60 : -60);
    c.save(); c.globalAlpha = pa; c.strokeStyle = '#eef0f2'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(tipP[0], tipP[1]); c.lineTo(tx + (TV ? 0 : 232), ty); c.lineTo(tx + (TV ? 12 : 220), ty); c.stroke();
    c.fillStyle = 'rgba(10,12,16,.82)'; c.beginPath(); c.roundRect(tx + 12, ty - 30, TV ? 320 : 220, TV ? 62 : 50, 6); c.fill(); c.restore();
    txt(c, 'pin1', 'Tugu Pahlawan', tx + 24, ty - 4, SANS(600, TV ? 26 : 19), '#eef0f2', pa);
    txt(c, 'pin2', "Heroes Monument · 41.15 m", tx + 24, ty + (TV ? 20 : 15), MONO(TV ? 18 : 13), '#9aa0a6', pa);
  }
}
// ------------------------------------------------------------------ frame
const ov = document.getElementById('ov'); ov.width = W; ov.height = H; const oc = ov.getContext('2d');
function render(t) {
  REG = [];
  const out = 1 - ss(seg(t, T.lightsOut, T.lightsOut + .25)), back2 = 0;
  scene.userData.house.intensity = 2.2 * Math.max(out, .2); scene.userData.hemi.intensity = .35 * Math.max(out, .35) + .04; U.uTime.value = t;   // v2: the house lights dim, never off: the city stays visible under the projection
  const strike = t < T.strike ? 0 : (t < T.strike + .25 ? .5 + .5 * Math.sin((t - T.strike) * 90) : 1);
  U.uProj.value = strike;
  U.uFlutes.value = t < T.flute0 ? 0 : (t - T.flute0) / T.fluteDT + .5;
  U.uLevel.value = t < T.climb0 ? 0 : eo(seg(t, T.climb0, T.climb1)) * 1.0001;
  U.uDot.value = ss(seg(t, 14.4, 15.1));
  U.uIris.value = t < T.iris ? 9 : lerp(3, .15, ss(seg(t, T.iris, T.iris + .7)));
  camAt(t); R.render(scene, cam);
  const S = H / 1080; oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, W, H); oc.setTransform(S, 0, 0, S, 0, 0);
  overlay(oc, t);
}
window.render = render; window.TEXTS = () => REG.slice();
window.EV = [{ t: T.lightsOut, type: 'relay' }, { t: T.strike, type: 'strike' }, ...Array.from({ length: 10 }, (_, i) => ({ t: +(T.flute0 + i * T.fluteDT).toFixed(3), type: 'flute', i })), { t: T.climb0, type: 'climb' }, { t: T.climb1, type: 'land' }, { t: T.figure, type: 'figure' }, { t: T.iris, type: 'iris' }];
Promise.all([fetch('model.json').then(r => r.json()), ...['200 20px Inter', '500 20px Inter', '600 20px Inter', '20px PlexMono'].map(f => document.fonts.load(f, 'A1'))])
  .then(([m]) => { M = m; setup(); render(0); window.READY = true; });
