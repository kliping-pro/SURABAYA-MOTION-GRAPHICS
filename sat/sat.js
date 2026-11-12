// Satellite Briefing windows for Explore Surabaya (STYLE: styles/satellite-briefing/STYLE.md).
//   ?shot=S0  0–10 s  the dive: orbit over the Madura Strait down to Surabaya, a reticle searches and locks on the city
//   ?shot=S8  0–7 s   the range line along the Suramadu Bridge: 5.438 m, colour returns to the strait
//   ?fmt=reels|tv
// Ground: Sentinel-2 L2A true colour (imagery/plates.json), UTM 49S metres. World: x = easting, y = -northing (south),
// z up, so the camera basis is the same as the map's. render(t) depends only on t.
import { clamp, lerp, seg, ss, eio, eo, back } from '/core/lib.js';

const Q = new URLSearchParams(location.search);
const SHOT = Q.get('shot') || 'S0';
const TV = (Q.get('fmt') || (innerWidth > innerHeight ? 'tv' : 'reels')) === 'tv';
const DUR = SHOT === 'S0' ? 10 : 7;
window.DUR = DUR;
const VW = () => 1080 * innerWidth / innerHeight;
const DEG = Math.PI / 180, FOCAL = 540 / Math.tan(16 * DEG);
const WHITE = '#F2F5F6', AMBER = '#FFBE55';

// ------------------------------------------------------------------ places (UTM 49S; y = -northing)
const P = {
  centre: [692379, -9196553],                       // Surabaya, 7°15′55″ S 112°44′33″ E
  A: [696396, -9202788], B: [696784, -9208212],     // Suramadu deck ends on the 10 m plate: 5,437.9 m apart (official length 5,438 m)
};
P.M = [(P.A[0] + P.B[0]) / 2, (P.A[1] + P.B[1]) / 2];

// ------------------------------------------------------------------ camera
function basis(c) {
  const th = c.head * DEG, ti = c.tilt * DEG;
  const F = [Math.sin(th) * Math.sin(ti), -Math.cos(th) * Math.sin(ti), -Math.cos(ti)];
  const R = [Math.cos(th), Math.sin(th), 0];
  const U = [F[1] * R[2] - F[2] * R[1], F[2] * R[0] - F[0] * R[2], F[0] * R[1] - F[1] * R[0]];
  const pos = [c.x - F[0] * c.d, c.y - F[1] * c.d, -F[2] * c.d];
  return { pos, F, R, U, c };
}
function toScreen(b, x, y) {
  const v = [x - b.pos[0], y - b.pos[1], -b.pos[2]];
  const zc = v[0] * b.F[0] + v[1] * b.F[1] + v[2] * b.F[2]; if (zc <= 1) return null;
  const xc = v[0] * b.R[0] + v[1] * b.R[1] + v[2] * b.R[2], yc = v[0] * b.U[0] + v[1] * b.U[1] + v[2] * b.U[2];
  return [VW() / 2 + FOCAL * xc / zc, 540 - FOCAL * yc / zc];
}
const ld = (a, b, u) => Math.exp(lerp(Math.log(a), Math.log(b), u));
const mix = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), d: ld(a.d, b.d, u), tilt: lerp(a.tilt, b.tilt, u), head: lerp(a.head, b.head, u) });
// distance d along the view ray; at nadir it is the altitude. Ground height in frame = 0.573 d.
function camera(t) {
  if (SHOT === 'S0') {
    const orbit = { x: 705000, y: -9232000, d: 260000, tilt: 38, head: 8 };
    const over = { x: 693300, y: -9199900, d: TV ? 15500 : 19500, tilt: 0, head: 0 };      // v2: the whole city and the strait stay in view
    const u = eio(seg(t, 0, 7.2));
    const c = mix(orbit, over, u);
    c.x = lerp(orbit.x, over.x, ss(seg(t, 0, 5.6))); c.y = lerp(orbit.y, over.y, ss(seg(t, 0, 5.6)));   // arrive over the city before the last of the descent
    c.d *= 1 - .05 * seg(t, 7.2, 10);                                                                       // the hold creeps in
    return c;
  }
  const full = { x: P.M[0] + (TV ? 900 : 0), y: P.M[1], d: TV ? 10200 : 10600, tilt: 0, head: 0 };
  const atB = { x: P.B[0], y: P.B[1], d: 3800, tilt: 0, head: 0 };
  if (t < 1.3) return mix(atB, full, eio(seg(t, 0, 1.3)));
  const c = { ...full }; c.d *= 1 - .05 * seg(t, 1.3, 7); return c;          // v2: no closing on a point; the strait stays in view
}
const alt = c => c.d * Math.cos(c.tilt * DEG);

// ------------------------------------------------------------------ the plate shader (ray -> ground -> plates -> analyst grade)
const VS = `#version 300 es
in vec2 p; out vec2 v; void main(){ v = p*.5+.5; gl_Position = vec4(p,0.,1.); }`;
const FS = `#version 300 es
precision highp float;
in vec2 v; out vec4 o;
uniform vec2 uRes; uniform vec3 uCam, uF, uR, uU; uniform float uFocal;
uniform sampler2D uWide, uCity; uniform vec4 uWideB, uCityB;   // bounds x0, y0, x1, y1 (world, y south)
uniform float uCityW, uGrade, uHaze, uVig;
uniform vec2 uColPt0, uColPt1; uniform float uColR, uColA;      // colour returns along a corridor
float lum(vec3 c){ return dot(c, vec3(.299,.587,.114)); }
vec3 plate(sampler2D s, vec4 b, vec2 m, out float inside){
  vec2 uv = (m - b.xy) / (b.zw - b.xy);
  vec2 e = min(uv, 1.-uv) * (b.zw - b.xy);
  inside = smoothstep(0., 2500., min(e.x, e.y)) * step(0., min(uv.x, uv.y)) * step(max(uv.x, uv.y), 1.);
  return texture(s, uv).rgb;
}
void main(){
  vec2 px = (v*uRes - .5*uRes) * (1080./uRes.y);
  vec3 d = normalize(uF*uFocal + uR*px.x + uU*px.y);
  float t = -uCam.z / min(d.z, -1e-5);
  vec2 m = (uCam + d*t).xy;
  float iw, ic; vec3 cw = plate(uWide, uWideB, m, iw), cc = plate(uCity, uCityB, m, ic);
  vec3 sea = vec3(.035,.07,.09);
  vec3 col = mix(sea, cw, iw);
  // the wide plate has holes (no data) at its corners: treat near-black as sea
  col = mix(sea, col, smoothstep(.02, .06, lum(cw)) * iw + (1.-iw)*0.);
  col = mix(col, cc, ic * uCityW * smoothstep(.02,.06,lum(cc)));
  // analyst grade: luminance, local contrast, a shoulder, toned blue-black -> cool silver, a fifth of the chroma
  float l = lum(col); l = clamp((l - .32) * 1.35 + .36, 0., 1.); l = l / (1. + .35*l) * 1.12;
  vec3 tone = mix(vec3(.027,.043,.055), vec3(.63,.655,.665), clamp(l, 0., 1.));
  vec3 grey = mix(tone, col, .2);
  // colour returns along the corridor (the strait under the bridge)
  vec2 ab = uColPt1 - uColPt0; float h = clamp(dot(m - uColPt0, ab) / dot(ab, ab), 0., 1.);
  float dc = length(m - uColPt0 - ab*h);
  float keep = uColA * (1. - smoothstep(uColR*.25, uColR, dc));
  col = mix(col, grey, uGrade * (1. - keep));
  // haze at orbit, vignette
  col = mix(col, vec3(.55,.66,.78), uHaze * smoothstep(0., 1., t / 400000.));
  vec2 q = v - .5; q.x *= uRes.x/uRes.y; col *= 1. - uVig * smoothstep(.3, 1.05, length(q));
  o = vec4(col, 1.);
}`;
function makeGL(canvas, imgs, plates) {
  const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
  const sh = (ty, src) => { const s = gl.createShader(ty); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.bindAttribLocation(pr, 0, 'p'); gl.linkProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
  const tex = im => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im); gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 8); return t; };
  const tW = tex(imgs.wide), tC = tex(imgs.city);
  const B = p => [p.bounds[0], -p.bounds[3], p.bounds[2], -p.bounds[1]];
  const U = n => gl.getUniformLocation(pr, n);
  return (b, o) => {
    gl.viewport(0, 0, canvas.width, canvas.height); gl.useProgram(pr);
    gl.uniform2f(U('uRes'), canvas.width, canvas.height); gl.uniform3fv(U('uCam'), b.pos); gl.uniform3fv(U('uF'), b.F); gl.uniform3fv(U('uR'), b.R); gl.uniform3fv(U('uU'), b.U);
    gl.uniform1f(U('uFocal'), FOCAL); gl.uniform4fv(U('uWideB'), B(plates.wide)); gl.uniform4fv(U('uCityB'), B(plates.city));
    gl.uniform1f(U('uCityW'), o.cityW); gl.uniform1f(U('uGrade'), o.grade); gl.uniform1f(U('uHaze'), o.haze); gl.uniform1f(U('uVig'), .22);
    gl.uniform2fv(U('uColPt0'), P.A); gl.uniform2fv(U('uColPt1'), P.B); gl.uniform1f(U('uColR'), o.colR || 1); gl.uniform1f(U('uColA'), o.colA || 0);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tW); gl.uniform1i(U('uWide'), 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tC); gl.uniform1i(U('uCity'), 1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
}

// ------------------------------------------------------------------ marks (2D overlay, virtual frame VW x 1080)
let REG = [];
function reg(id, text, x0, y0, x1, y1) { const S = innerHeight / 1080; REG.push({ id, text, x0: x0 * S, y0: y0 * S, x1: x1 * S, y1: y1 * S }); }
function halo(c, draw, w) { c.save(); c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = w + 2.4; draw(); c.restore(); draw(); }
function line(c, pts, w = 1.6, col = WHITE, dash = null) {
  const d = () => { c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](p[0], p[1])); c.stroke(); };
  c.save(); c.lineWidth = w; c.strokeStyle = col; if (dash) c.setLineDash(dash); c.lineCap = 'round'; halo(c, d, w); c.restore();
}
function text(c, id, s, x, y, font, col = WHITE, align = 'left', a = 1) {
  c.save(); c.globalAlpha *= a; c.font = font; c.textAlign = align; c.textBaseline = 'alphabetic';
  c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.5)'; c.strokeText(s, x, y); c.fillStyle = col; c.fillText(s, x, y);
  const w = c.measureText(s).width, x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x, h = parseFloat(font.match(/(\d+(\.\d+)?)px/)[1]);
  if (a > .5) reg(id, s, x0, y - h * .8, x0 + w, y + h * .2); c.restore();
}
function reticle(c, x, y, r, a, k = 1) {         // corner brackets and a ring; k > 1 while it snaps
  if (a <= 0) return; c.save(); c.globalAlpha = a;
  const R = r * k, L = R * .45;
  line(c, [[x - R, y - R + L], [x - R, y - R], [x - R + L, y - R]], 1.8); line(c, [[x + R - L, y - R], [x + R, y - R], [x + R, y - R + L]], 1.8);
  line(c, [[x - R, y + R - L], [x - R, y + R], [x - R + L, y + R]], 1.8); line(c, [[x + R - L, y + R], [x + R, y + R], [x + R, y + R - L]], 1.8);
  c.beginPath(); c.arc(x, y, R * .55, 0, 7); c.lineWidth = 1.4; c.strokeStyle = WHITE; c.stroke();
  line(c, [[x - R * .2, y], [x - R * .08, y]], 1.4); line(c, [[x + R * .08, y], [x + R * .2, y]], 1.4);
  c.restore();
}
const MONO = s => `${s}px PlexMono`, COND = s => `300 ${s}px BarlowC`, SANS = (w, s) => `${w} ${s}px Inter`;
function instruments(c, t, cam) {
  const vw = VW(), k = TV ? 1 : .62, m = TV ? 40 : 22, bot = TV ? 1080 - 40 : 1080 - 236;   // reels: above the bottom UI band
  const a = alt(cam), km = a / 1000;
  const altS = km >= 10 ? `${km.toFixed(0)} km` : `${km.toFixed(1)} km`;
  text(c, 'alt', `ALT ${altS}`, vw - m, (TV ? 60 : 150), MONO(26 * k + (TV ? 0 : 4)), WHITE, 'right');
  // scale bar from the same camera: a round ground length that is 80–200 px long at the frame centre
  const mpp = a * 2 * Math.tan(16 * DEG) / 1080;
  const nice = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000]; const L = nice.find(n => n / mpp >= (TV ? 120 : 70)) || 50000;
  const w = L / mpp, x0 = vw - m - w, y0 = (TV ? 90 : 176);
  line(c, [[x0, y0], [x0 + w, y0]], 1.6); line(c, [[x0, y0 - 6], [x0, y0 + 6]], 1.4); line(c, [[x0 + w, y0 - 6], [x0 + w, y0 + 6]], 1.4);
  text(c, 'scale', L >= 1000 ? `${L / 1000} km` : `${L} m`, x0 + w / 2, y0 + (TV ? 28 : 22), MONO(TV ? 20 : 13), WHITE, 'center');
  text(c, 'credit', 'Contains modified Copernicus Sentinel data 2024', m, bot, MONO(TV ? 20 : 12), 'rgba(242,245,246,.85)');
}

// ------------------------------------------------------------------ the shots
// v2: the city stays alive: the reticle locks on Surabaya and stays; landmark pins pop one by one (coordinates in UTM 49S)
const PINS = [
  ['Tugu Pahlawan', 'Heroes Monument', [691868, -9198701], 6.0, -1],
  ['Jembatan Merah', 'Red Bridge', [691883, -9199718], 6.45, -1],
  ['Tanjung Perak', 'port', [691466, -9203226], 6.9, -1],
  ['Monumen Kapal Selam', 'Submarine Monument', [693252, -9196561], 7.35, 1],
  ['Jembatan Suramadu', 'Suramadu Bridge', null, 7.8, 1],
  ['Kebun Binatang', 'Surabaya Zoo', [691737, -9193193], 8.25, -1],
];
function pin(c, id, s1, s2, p, a, side, t0, t) {
  if (!p || a <= 0) return; const k = TV ? 1 : .8, ring = 1 + .5 * ((t - t0) * 1.4 % 1);
  c.save(); c.globalAlpha = a;
  c.beginPath(); c.arc(p[0], p[1], 6 * k, 0, 7); c.fillStyle = AMBER; c.fill();
  c.globalAlpha = a * (1 - ((t - t0) * 1.4 % 1)); c.beginPath(); c.arc(p[0], p[1], 9 * k * ring * 1.6, 0, 7); c.lineWidth = 1.6; c.strokeStyle = AMBER; c.stroke(); c.globalAlpha = a;
  const lx = p[0] + side * (TV ? 70 : 40), ly = p[1] - (TV ? 46 : 34);
  line(c, [[p[0] + side * 8, p[1] - 6], [lx, ly], [lx + side * (TV ? 14 : 8), ly]], 1.3); c.restore();
  const tx = lx + side * (TV ? 20 : 12);
  text(c, id + 'a', s1, tx, ly + 4, SANS(700, TV ? 26 : 19), WHITE, side > 0 ? 'left' : 'right', a);
  text(c, id + 'b', s2, tx, ly + (TV ? 26 : 20), MONO(TV ? 16 : 12), WHITE, side > 0 ? 'left' : 'right', a);
}
function overlayS0(c, t, b, cam) {
  const vw = VW(), cx = vw / 2;
  const tg = toScreen(b, ...P.centre);
  const ra = seg(t, 2.8, 3.2);
  if (ra > 0 && tg) {
    const wander = 1 - ss(seg(t, 4.6, 5.6));
    const x = lerp(tg[0], cx + Math.sin(t * 2.3) * 90, wander), y = lerp(tg[1], 540 + Math.cos(t * 1.7) * 70, wander);
    const snap = t > 5.6 ? 1 + .25 * Math.exp(-(t - 5.6) * 9) * Math.cos((t - 5.6) * 30) : 1;
    reticle(c, x, y, TV ? 60 : 44, ra, snap);
    const la = seg(t, 5.7, 6.1);
    if (la > 0) {
      const lx = x + (TV ? 90 : 56), ly = y + (TV ? 70 : 60);
      c.save(); c.globalAlpha = la; line(c, [[x + (TV ? 34 : 26), y + (TV ? 30 : 24)], [lx - 8, ly - 22]], 1.4); c.restore();
      text(c, 'city', 'SURABAYA', lx, ly, SANS(800, TV ? 40 : 28), WHITE, 'left', la);
      text(c, 'coord', '7°15′55″ S · 112°44′33″ E', lx, ly + (TV ? 30 : 22), MONO(TV ? 20 : 13), WHITE, 'left', la);
    }
  }
  for (const [s1, s2, p, t0, side] of PINS) { const q = toScreen(b, ...(p || P.M)); pin(c, 'pin' + s1, s1, s2, q, seg(t, t0, t0 + .3), side, t0, t); }
}
const READ_T0 = 1.5, READ_T1 = 4.3;    // the range line grows from the Madura end to the Surabaya end; the reading lands at 4.3
function overlayS8(c, t, b, cam) {
  const vw = VW(), A = toScreen(b, ...P.A), B = toScreen(b, ...P.B); if (!A || !B) return;
  // the reticle opens from the map's dot on the Madura end
  const open = eo(seg(t, 0, .8)), r = lerp(25, TV ? 60 : 44, open), fade = 1 - seg(t, 1.1, 1.5);
  if (t < 1.5) reticle(c, B[0], B[1], r, fade);
  const u = eo(seg(t, READ_T0, READ_T1));
  c.save();
  if (u > 0) {
    const T = [lerp(B[0], A[0], u), lerp(B[1], A[1], u)];
    line(c, [B, T], 2.2);
    // ticks every 500 m along the line, perpendicular
    const dx = A[0] - B[0], dy = A[1] - B[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    for (let m = 0; m <= 5438; m += 500) { const f = m / 5437.9; if (f > u) break; const q = [lerp(B[0], A[0], f), lerp(B[1], A[1], f)], s = m % 1000 === 0 ? 9 : 5;
      line(c, [[q[0] - nx * s, q[1] - ny * s], [q[0] + nx * s, q[1] + ny * s]], 1.3); }
    line(c, [[B[0] - nx * 14, B[1] - ny * 14], [B[0] + nx * 14, B[1] + ny * 14]], 1.8);
    if (u >= 1) line(c, [[A[0] - nx * 14, A[1] - ny * 14], [A[0] + nx * 14, A[1] + ny * 14]], 1.8);
    // the reading in the right third, beside the line; it rolls while the line grows and lands with a pop
    const landed = t >= READ_T1, val = landed ? 5438 : Math.round(5437.9 * u / 10) * 10;
    const pop = landed ? 1 + .12 * Math.exp(-(t - READ_T1) * 8) : 1;
    const rx = (A[0] + B[0]) / 2 + (TV ? 150 : 70), ry = 540 + (TV ? 40 : 30);
    const fs = (TV ? 120 : 76) * pop;
    text(c, 'rlabel', 'Jembatan Suramadu', rx, ry - fs * .95, SANS(600, TV ? 30 : 20), WHITE, 'left', seg(t, READ_T0, READ_T0 + .3));
    c.save(); c.font = COND(fs); c.fillStyle = landed ? AMBER : WHITE; c.textBaseline = 'alphabetic';
    const s = val.toLocaleString('id-ID') + ' m'; c.lineWidth = 4; c.strokeStyle = 'rgba(0,0,0,.45)'; c.strokeText(s, rx, ry); c.fillText(s, rx, ry);
    if (landed) reg('reading', s, rx, ry - fs * .8, rx + c.measureText(s).width, ry + fs * .1); c.restore();
    text(c, 'rnote', 'panjang total · sumber: Setneg RI', rx, ry + (TV ? 40 : 28), MONO(TV ? 20 : 12), WHITE, 'left', seg(t, READ_T1, READ_T1 + .3));
    text(c, 'rnote2', 'Jawa – Madura · total length', rx, ry + (TV ? 68 : 46), MONO(TV ? 20 : 12), WHITE, 'left', seg(t, READ_T1 + .1, READ_T1 + .4));
  }
  c.restore();
  // closing: a ring tightens on the Madura end, the size of the map's station dot
  const cl = 0;   // v2: no closing ring
  if (cl > 0) { c.save(); c.globalAlpha = cl; c.beginPath(); c.arc(B[0], B[1], lerp(60, 25, eo(cl)), 0, 7); c.lineWidth = 3; c.strokeStyle = WHITE; c.stroke(); c.restore(); }
}
function grading(t) {
  if (SHOT === 'S0') return { grade: ss(seg(t, 3.4, 6.0)) * .35, haze: .75 * (1 - ss(seg(t, 0, 4))), cityW: ss(seg(t, 2.2, 4.4)) };
  // S8: colour returns along the bridge corridor once the reading lands
  return { grade: .55, haze: 0, cityW: 1, colA: ss(seg(t, READ_T1 + .1, READ_T1 + 1.1)), colR: lerp(300, 4200, ss(seg(t, READ_T1 + .1, READ_T1 + 1.8))) };
}

// ------------------------------------------------------------------ frame
const glC = document.getElementById('gl'), ov = document.getElementById('ov'), oc = ov.getContext('2d');
for (const k of [glC, ov]) { k.width = innerWidth; k.height = innerHeight; }
let draw = null;
function render(t) {
  REG = [];
  const cam = camera(t), b = basis(cam);
  draw(b, grading(t));
  const S = innerHeight / 1080; oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, ov.width, ov.height); oc.setTransform(S, 0, 0, S, 0, 0);
  if (SHOT === 'S0') overlayS0(oc, t, b, cam); else overlayS8(oc, t, b, cam);
  instruments(oc, t, cam);
}
window.render = render; window.TEXTS = () => REG.slice();
window.EV = SHOT === 'S0'
  ? [{ t: 0, type: 'orbit' }, { t: 2.8, type: 'search' }, { t: 5.6, type: 'lock' }, { t: 8.9, type: 'close' }]
  : [{ t: 0, type: 'open' }, { t: READ_T0, type: 'range' }, { t: READ_T1, type: 'land' }, { t: READ_T1 + .1, type: 'colour' }, { t: 6.2, type: 'close' }];
const img = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
Promise.all([fetch('imagery/plates.json').then(r => r.json()), img('imagery/wide.jpg'), img('imagery/city.jpg'),
  ...['20px PlexMono', '300 20px BarlowC', '600 20px Inter', '700 20px Inter'].map(f => document.fonts.load(f, 'A1'))])
  .then(([pl, wide, city]) => { draw = makeGL(glC, { wide, city }, pl.plates); render(0); window.READY = true; });
