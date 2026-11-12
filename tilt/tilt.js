// Tilt-Shift Miniature window S5 (8 s): Jalan Tunjungan at rush hour (STYLE: styles/tilt-shift/STYLE.md).
// A model-like street seen from high up through a thin sharp band; traffic and people step in time-lapse (7.5 Hz, the
// camera stays smooth). Opens and closes top-down on the roundabout at the south end: a white disc in a green ring,
// the map's station dot. The street's name is painted on the road; a time-lapse readout in a corner. ?fmt=reels|tv
import * as THREE from 'three';
import { clamp, lerp, seg, ss, eio, eo, mulberry } from '/core/lib.js';
const Q = new URLSearchParams(location.search);
const TV = (Q.get('fmt') || (innerWidth > innerHeight ? 'tv' : 'reels')) === 'tv';
const DUR = 8; window.DUR = DUR;
const W = innerWidth, H = innerHeight, VW = 1080 * W / H;
const STEP = 4 / 30;                                     // time-lapse: the world updates at 7.5 Hz
const R = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); R.setPixelRatio(1); R.setSize(W, H);
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.toneMapping = THREE.NeutralToneMapping; R.toneMappingExposure = 1.25;
document.getElementById('stage').appendChild(R.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color('#9cc7e8');
const cam = new THREE.PerspectiveCamera(28, W / H, 1, 3000);
const rnd = mulberry(11);
const M = (c, r = .8) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
const add = (g, m, x, y, z, sh = true) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = sh; o.receiveShadow = true; scene.add(o); return o; };
// ------------------------------------------------------------------ the street (z north-south, x east-west; road along z, 14 m)
const ROUND = [0, 0, 120];                               // the roundabout at the south end (z = +120)
add(new THREE.PlaneGeometry(2000, 2000).rotateX(-Math.PI / 2), M('#a39d92', .95), 0, 0, 0, false);
add(new THREE.BoxGeometry(14, .05, 700), M('#3a3c40', .9), 0, .03, -230, false);                // Jalan Tunjungan
add(new THREE.BoxGeometry(500, .05, 14), M('#3a3c40', .9), 0, .03, ROUND[2], false);            // the cross street
for (const sx of [-1, 1]) add(new THREE.BoxGeometry(4, .25, 560), M('#c9c2b4', .9), sx * 9, .12, -300, false);
// lane marks and the name painted on the road
const markC = document.createElement('canvas'); markC.width = 1024; markC.height = 256; { const g = markC.getContext('2d'); g.fillStyle = 'rgba(0,0,0,0)'; g.fillRect(0, 0, 1024, 256); g.fillStyle = '#f4f1e8'; g.font = '800 150px Overpass, Inter'; g.textAlign = 'center'; g.fillText('TUNJUNGAN', 512, 190); }
const markT = new THREE.CanvasTexture(markC); markT.colorSpace = THREE.SRGBColorSpace;
{ const m = new THREE.Mesh(new THREE.PlaneGeometry(12, 3).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: markT, transparent: true, roughness: .8 })); m.position.set(0, .07, 60); m.rotation.y = Math.PI; m.receiveShadow = true; scene.add(m);
  m.geometry = new THREE.PlaneGeometry(3, 12).rotateX(-Math.PI / 2); m.rotation.y = Math.PI / 2; }
for (let z = 100; z > -560; z -= 9) add(new THREE.BoxGeometry(.25, .02, 4), M('#f2efe6'), 0, .07, z, false);
// the roundabout: white centre, green ring of grass (the map's dot), a white kerb
add(new THREE.CylinderGeometry(13, 13, .3, 64), M('#f4f3ee', .7), ROUND[0], .15, ROUND[2], false);
add(new THREE.CylinderGeometry(9.5, 9.5, .36, 64), M('#00A54E', .9), ROUND[0], .18, ROUND[2], false);
add(new THREE.CylinderGeometry(6.6, 6.6, .42, 64), M('#ffffff', .6), ROUND[0], .21, ROUND[2], false);
// facades: one canvas atlas of colonial shophouse fronts (bays, shutters, cornices), sampled per building
const fac = document.createElement('canvas'); fac.width = 1024; fac.height = 1024; {
  const g = fac.getContext('2d'), pal = ['#f2e6c9', '#e9d3b0', '#cfe3d6', '#f3d2c1', '#ffffff', '#e8e0f0', '#f5e9a8', '#d7e7ef'];
  for (let i = 0; i < 8; i++) { const x0 = (i % 4) * 256, y0 = Math.floor(i / 4) * 512; g.fillStyle = pal[i]; g.fillRect(x0, y0, 256, 512);
    g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x0, y0 + 470, 256, 42);                                  // darker toward the ground
    for (let fl = 0; fl < 3; fl++) { const y = y0 + 40 + fl * 150; g.fillStyle = 'rgba(70,60,50,.35)'; g.fillRect(x0, y - 18, 256, 8);
      for (let b = 0; b < 3; b++) { const x = x0 + 22 + b * 80; g.fillStyle = '#2b3440'; g.fillRect(x, y, 50, 86); g.fillStyle = ['#2f6b5e', '#7a3b2e', '#2b4f7a'][i % 3]; g.fillRect(x - 8, y, 7, 86); g.fillRect(x + 51, y, 7, 86); } } } }
const facT = new THREE.CanvasTexture(fac); facT.colorSpace = THREE.SRGBColorSpace;
function building(x, z, w, d, h, k) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv; const u0 = (k % 4) / 4, v0 = Math.floor(k / 4) % 2 / 2;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + uv.getX(i) / 4, 1 - (v0 + (1 - uv.getY(i)) / 2));
  const m = new THREE.MeshStandardMaterial({ map: facT, roughness: .85 }); add(g, m, x, h / 2, z);
  add(new THREE.BoxGeometry(w + .6, .6, d + .6), M('#e8e2d6'), x, h + .3, z);                                  // cornice
  if (rnd() < .6) add(new THREE.BoxGeometry(2 + rnd() * 3, 1.4, 2 + rnd() * 3), M('#b8b3aa'), x + (rnd() - .5) * w * .5, h + 1.2, z + (rnd() - .5) * d * .4);   // roof clutter
  if (rnd() < .5) add(new THREE.BoxGeometry(.4, 1.2, w * .8), M(['#b8483e', '#2CACE2', '#F6EC25', '#00A54E'][k % 4], .6), x + Math.sign(-x) * (d / 2 + .25), 4, z, true).rotation.y = 0;   // awning
}
let k = 0;
for (const sx of [-1, 1]) for (let z = 100; z > -560;) { const w = 8 + rnd() * 9, d = 14 + rnd() * 10, h = 9 + rnd() * 8; building(sx * (11 + d / 2), z - w / 2, d, w, h, k++); z -= w + .3; }
// the city around: blocks behind the street rows, streets between them
for (let gx = -260; gx <= 260; gx += 34) for (let gz = 160; gz > -760; gz -= 34) { if (Math.abs(gx) < 48) continue; const h = 6 + rnd() * 14, w = 18 + rnd() * 10, d = 18 + rnd() * 10;
  add(new THREE.BoxGeometry(w, h, d), M(['#efe4cc', '#e7d6b8', '#f4efe6', '#dcd3c4', '#e9c9b4', '#cfdccf'][(rnd() * 6) | 0], .85), gx, h / 2, gz); add(new THREE.BoxGeometry(w * .9, .8, d * .9), M('#b3473d', .7), gx, h + .4, gz, false); if (rnd() < .3) add(new THREE.SphereGeometry(5, 10, 8), M('#3f9a3a'), gx + 14, 5, gz + 14); }
// Siola at the north end: a large white corner block with a tower
add(new THREE.BoxGeometry(40, 20, 40), M('#f6f4ef', .7), -32, 10, -590); add(new THREE.CylinderGeometry(6, 6, 34, 24), M('#f6f4ef', .7), -14, 17, -572);
// trees along the pavements
for (let z = 90; z > -540; z -= 22) for (const sx of [-1, 1]) { add(new THREE.CylinderGeometry(.25, .3, 3, 6), M('#6b4b33'), sx * 8.8, 1.5, z + sx * 6); add(new THREE.SphereGeometry(2.4, 10, 8), M('#3f9a3a', .9), sx * 8.8, 4.2, z + sx * 6); }
// lights: a hard sun front-lighting the west facades, a fill with warm bounce
const sun = new THREE.DirectionalLight('#fff3df', 3.2); sun.position.set(-160, 260, 90); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, { left: -260, right: 260, top: 360, bottom: -360, near: 10, far: 900 }); sun.shadow.bias = -.0005; sun.target.position.set(0, 0, -150); scene.add(sun, sun.target);
scene.add(new THREE.HemisphereLight('#bfe0ff', '#c9a27a', 1.7));
// ------------------------------------------------------------------ traffic: precomputed lanes; positions update at 7.5 Hz
const CARS = [], PEOPLE = [];
const carCols = ['#e53e31', '#f6ec25', '#2cace2', '#ffffff', '#1c1c1c', '#00a54e', '#f28c28', '#c0c0c0', '#7b4fa2', '#0e497a'];
for (let i = 0; i < 70; i++) {
  const moto = rnd() < .45, g = new THREE.Group(), col = carCols[i % carCols.length];
  if (moto) { const b = new THREE.Mesh(new THREE.BoxGeometry(.7, 1.1, 1.9), M(col, .5)); b.position.y = .6; b.castShadow = true; g.add(b); }
  else { const b = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 4.2), M(col, .35)); b.position.y = .7; b.castShadow = true; g.add(b);
    const c = new THREE.Mesh(new THREE.BoxGeometry(1.6, .7, 2.2), M('#1d2530', .15)); c.position.set(0, 1.5, .2); c.castShadow = true; g.add(c); }
  scene.add(g); CARS.push({ g, lane: (i % 3) - 1, s0: rnd() * 700, v: moto ? 13 + rnd() * 4 : 9 + rnd() * 3, moto });
}
for (let i = 0; i < 90; i++) { const sx = i % 2 ? 1 : -1; const p = new THREE.Mesh(new THREE.CapsuleGeometry(.32, .9, 3, 6), M(['#e53e31', '#f6ec25', '#2cace2', '#ffffff', '#00a54e', '#f28c28', '#7b4fa2'][i % 7], .6)); p.castShadow = true; scene.add(p); PEOPLE.push({ p, x: sx * (8 + rnd() * 1.6), s0: rnd() * 600, v: (rnd() < .5 ? 1 : -1) * (1.2 + rnd()) }); }
function world(t) {
  const tq = Math.floor(t / STEP) * STEP, T = tq * 24;                      // x24 time-lapse, stepped
  for (const c of CARS) { const s = ((c.s0 + T * c.v) % 700 + 700) % 700, z = 110 - s; c.g.position.set(c.lane * 3.6 + (c.moto ? .9 : 0), 0, z); c.g.rotation.y = 0; }
  for (const q of PEOPLE) { const s = ((q.s0 + T * q.v) % 600 + 600) % 600; q.p.position.set(q.x, .8, 95 - s); }
}
// ------------------------------------------------------------------ post: the tilt-shift band, saturation, vignette
const rt = new THREE.WebGLRenderTarget(W, H, { samples: 0 }); rt.texture.colorSpace = THREE.SRGBColorSpace;
const post = new THREE.ShaderMaterial({ uniforms: { tex: { value: rt.texture }, band: { value: .55 }, bw: { value: .07 }, amp: { value: 26 }, res: { value: new THREE.Vector2(W, H) } },
  vertexShader: 'varying vec2 v; void main(){ v = uv; gl_Position = vec4(position.xy, 0., 1.); }',
  fragmentShader: `uniform sampler2D tex; uniform float band, bw, amp; uniform vec2 res; varying vec2 v;
  void main(){ float dy = v.y - band; float coc = clamp(pow(max(0., abs(dy) - bw) / .5, 1.2) * amp, 0., 30.) * res.y / 1080.;
    vec3 acc = vec3(0.); float n = 0.; float rot = fract(sin(dot(v, vec2(12.9898, 78.233))) * 43758.5453) * 6.283;
    for (int i = 0; i < 24; i++) { float a = float(i) * 2.39996 + rot, r = sqrt(float(i) / 24.) * coc; acc += texture2D(tex, v + vec2(cos(a), sin(a)) * r / res).rgb; n += 1.; }
    vec3 c = acc / n; float l = dot(c, vec3(.299, .587, .114)); c = mix(vec3(l), c, 1.35); c = (c - .5) * 1.08 + .5; c *= vec3(1.02, 1.0, .97);
    vec2 q = v - .5; c *= 1. - .35 * smoothstep(.35, .9, length(q * vec2(res.x / res.y, 1.))); gl_FragColor = vec4(c, 1.); }` });
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post); const pscene = new THREE.Scene(); pscene.add(quad); const pcam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
// ------------------------------------------------------------------ camera
function camAt(t) {
  const fovH = 28 * Math.PI / 180, dTop = 6.6 * 540 / 27 / Math.tan(fovH / 2);   // top-down: the white centre (6.6 m) the size of the map dot (r 27 of 1080)
  const top = { x: ROUND[0], z: ROUND[2], h: dTop, pitch: 90, yaw: 0 };
  const wide = { x: 0, z: TV ? -20 : -40, h: TV ? 95 : 130, pitch: 44, yaw: 32 };
  const wide2 = { x: 0, z: TV ? -120 : -150, h: TV ? 100 : 135, pitch: 44, yaw: 22 };
  let a, b, u;
  if (t < 2.4) { a = top; b = wide; u = eio(seg(t, .5, 2.4)); } else if (t < 6.4) { a = wide; b = wide2; u = seg(t, 2.4, 6.4); } else { a = wide2; b = top; u = eio(seg(t, 6.4, 7.9)); }
  const h = Math.exp(lerp(Math.log(a.h), Math.log(b.h), u)), pitch = lerp(a.pitch, b.pitch, u) * Math.PI / 180, x = lerp(a.x, b.x, u), z = lerp(a.z, b.z, u);
  const back = h / Math.tan(Math.max(pitch, .01)), yaw = lerp(a.yaw, b.yaw, u) * Math.PI / 180;
  cam.position.set(x + (pitch > 1.565 ? 0 : back * Math.sin(yaw)), h, z + (pitch > 1.565 ? 0 : back * Math.cos(yaw))); cam.up.set(0, pitch > 1.565 ? 0 : 1, pitch > 1.565 ? -1 : 0); cam.lookAt(x, 0, z);
  return { band: lerp(.5, TV ? .5 : .48, ss(seg(t, 1.2, 2.4))), bw: lerp(.25, TV ? .07 : .06, ss(seg(t, .8, 2.2))) * 1 + lerp(0, .2, ss(seg(t, 6.6, 7.6))) };
}
// ------------------------------------------------------------------ overlay: the time-lapse readout
const ov = document.getElementById('ov'); ov.width = W; ov.height = H; const oc = ov.getContext('2d'); let REG = [];
function overlay(t) {
  const S = H / 1080; oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, W, H); oc.setTransform(S, 0, 0, S, 0, 0);
  const a = seg(t, 1.6, 2.0) * (1 - seg(t, 6.6, 7.0)); if (a <= 0) return;
  const x = TV ? 60 : 30, y = TV ? 70 : 150, fs = TV ? 26 : 18;
  oc.save(); oc.globalAlpha = a; oc.fillStyle = 'rgba(20,24,28,.72)'; oc.beginPath(); oc.roundRect(x, y - fs - 10, TV ? 330 : 230, fs + 22, 6); oc.fill();
  oc.fillStyle = '#f6ec25'; oc.font = `600 ${fs}px PlexMono`; oc.fillText('×24 TIME-LAPSE', x + 14, y + 2); oc.restore();
  if (a > .5) REG.push({ id: 'tl', text: '×24 TIME-LAPSE', x0: (x + 14) * S, y0: (y - fs) * S, x1: (x + 300) * S, y1: (y + 4) * S });
}
function render(t) { REG = []; world(t); const p = camAt(t); post.uniforms.band.value = p.band; post.uniforms.bw.value = p.bw; R.setRenderTarget(rt); R.render(scene, cam); R.setRenderTarget(null); R.render(pscene, pcam); overlay(t); }
window.render = render; window.TEXTS = () => REG.slice();
window.EV = [{ t: 0, type: 'roundabout' }, { t: 1.0, type: 'rise' }, ...Array.from({ length: Math.floor(DUR / STEP) }, (_, i) => ({ t: +(i * STEP).toFixed(3), type: 'tick' })).filter((e, i) => i % 2 === 0 && e.t > 1.6 && e.t < 6.6), { t: 6.4, type: 'dive' }];
Promise.all(['800 40px Overpass', '600 20px PlexMono'].map(f => document.fonts.load(f, 'A1'))).then(() => { markT.needsUpdate = true; { const g = markC.getContext('2d'); g.clearRect(0, 0, 1024, 256); g.fillStyle = '#f4f1e8'; g.font = '800 150px Overpass'; g.textAlign = 'center'; g.fillText('TUNJUNGAN', 512, 190); markT.needsUpdate = true; }
  render(0); window.READY = true; });
