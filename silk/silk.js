// Silkscreen Travel Poster window S6 (12 s): six landmarks as six prints, one bar (2 s) each, one ink per pull
// (STYLE: styles/silkscreen-poster/STYLE.md). A series: one template, a new palette per print, the afternoon moving on.
// Full-bleed art; the name is printed into the sky with the first pull (so it is read for the whole bar), the info
// band last. Opaque flat inks, stepped bands for the sky, registration slips, paper in between. ?fmt=reels|tv
import { clamp, lerp, seg, ss, eo, mulberry } from '/core/lib.js';
const Q = new URLSearchParams(location.search);
const TV = (Q.get('fmt') || (innerWidth > innerHeight ? 'tv' : 'reels')) === 'tv';
const DUR = 12; window.DUR = DUR;
const W = innerWidth, H = innerHeight, VW = 1080 * W / H, UH = 1080;   // units: virtual frame VW x 1080
const PAPER = '#F3EBD9';
// palettes: [sky1, sky2/bands, far, mid, near(+band), accent]
const PAL = [
  ['#FBE6B4', '#F6CD98', '#E7B57A', '#3E7079', '#1E3B3F', '#E8553D'],
  ['#E8F0F2', '#7FB3C8', '#D9C7A3', '#2F6E8E', '#173247', '#F2B134'],
  ['#F6CD98', '#EE9A73', '#9A7FA8', '#3E7079', '#1E3B3F', '#FBE6B4'],
  ['#EEF1F4', '#B8C9D9', '#8B9BB0', '#4A5D78', '#1F2A3C', '#F2B134'],
  ['#FCE3C0', '#F2A86B', '#C96B4B', '#6B3A4B', '#2A1A2A', '#FFD25E'],
  ['#F2D7B6', '#D98A5E', '#8F4E5C', '#3C3B5C', '#1B1A2E', '#F6EC25'],
];
const POSTERS = [
  { name: 'BALAI PEMUDA', en: 'Youth Hall', art: balaiPemuda },
  { name: 'BALAI KOTA', en: 'City Hall', art: balaiKota },
  { name: 'BAMBU RUNCING', en: 'Bamboo Spear Monument', art: bambu },
  { name: 'JOKO DOLOG', en: 'Joko Dolog Statue', art: jokoDolog },
  { name: 'MASPATI', en: 'Kampung Lawas Maspati', art: maspati },
  { name: 'JALAN GULA', en: 'Sugar Street', art: jalanGula },
];
// ------------------------------------------------------------------ shape helpers (Path2D in frame units; ground at GY)
const GY = () => TV ? 820 : 700;
const rect = (p, x, y, w, h) => p.rect(x, y, w, h);
const dome = (p, cx, y, r) => { p.moveTo(cx - r, y); p.arc(cx, y, r, Math.PI, 0); p.closePath(); };
const tri = (p, a, b, c) => { p.moveTo(...a); p.lineTo(...b); p.lineTo(...c); p.closePath(); };
// each art(cx, s) returns { far, mid, near, lit?, sun:[x,y,r] } as Path2D; cx = frame centre, s = scale
function balaiPemuda(cx, s) { const g = GY(), far = new Path2D(), mid = new Path2D(), near = new Path2D();
  rect(mid, cx - 330 * s, g - 210 * s, 660 * s, 210 * s); tri(mid, [cx - 360 * s, g - 210 * s], [cx, g - 300 * s], [cx + 360 * s, g - 210 * s]);
  for (const dx of [-300, 300]) { rect(mid, cx + (dx - 50) * s, g - 300 * s, 100 * s, 300 * s); dome(mid, cx + dx * s, g - 300 * s, 58 * s); rect(mid, cx + (dx - 4) * s, g - 400 * s, 8 * s, 50 * s); }
  for (let i = 0; i < 9; i++) rect(near, cx + (-260 + i * 65) * s, g - 160 * s, 34 * s, 110 * s);
  rect(far, cx - 900 * s, g - 140 * s, 1800 * s, 140 * s); rect(near, cx - 1000 * s, g, 2000 * s, 400);
  return { far, mid, near, sun: [cx + 420 * s, g - 470 * s, 70 * s] }; }
function balaiKota(cx, s) { const g = GY(), far = new Path2D(), mid = new Path2D(), near = new Path2D();
  rect(mid, cx - 420 * s, g - 190 * s, 840 * s, 190 * s); rect(mid, cx - 110 * s, g - 290 * s, 220 * s, 290 * s); tri(mid, [cx - 130 * s, g - 290 * s], [cx, g - 360 * s], [cx + 130 * s, g - 290 * s]);
  for (let i = 0; i < 12; i++) { const x = cx + (-400 + i * 70) * s; if (Math.abs(x - cx) < 120 * s) continue; rect(near, x, g - 150 * s, 30 * s, 100 * s); }
  rect(near, cx - 40 * s, g - 120 * s, 80 * s, 120 * s);
  for (let i = 0; i < 7; i++) dome(far, cx + (-700 + i * 230) * s, g, (60 + (i % 3) * 25) * s);                 // trees
  rect(near, cx - 1000 * s, g, 2000 * s, 400); return { far, mid, near, sun: [cx - 450 * s, g - 450 * s, 66 * s] }; }
function bambu(cx, s) { const g = GY(), far = new Path2D(), mid = new Path2D(), near = new Path2D();
  const H0 = [440, 370, 500, 320, 400, 280]; H0.forEach((h, i) => { const x = cx + (-150 + i * 60) * s, w = 34 * s, top = g - h * s;
    const p = i % 2 ? mid : near; p.moveTo(x, g); p.lineTo(x, top + 50 * s); p.lineTo(x + w, top); p.lineTo(x + w, g); p.closePath(); });
  rect(near, cx - 230 * s, g - 60 * s, 460 * s, 60 * s); rect(far, cx - 1000 * s, g - 90 * s, 2000 * s, 90 * s); rect(near, cx - 1000 * s, g, 2000 * s, 400);
  return { far, mid, near, sun: [cx + 330 * s, g - 520 * s, 64 * s] }; }
function jokoDolog(cx, s) { const g = GY(), far = new Path2D(), mid = new Path2D(), near = new Path2D();
  tri(mid, [cx - 320 * s, g - 360 * s], [cx, g - 470 * s], [cx + 320 * s, g - 360 * s]); for (const dx of [-250, 250]) rect(mid, cx + (dx - 14) * s, g - 360 * s, 28 * s, 360 * s);
  rect(near, cx - 120 * s, g - 70 * s, 240 * s, 70 * s);                                                       // pedestal
  near.moveTo(cx - 95 * s, g - 70 * s); near.quadraticCurveTo(cx - 105 * s, g - 150 * s, cx - 55 * s, g - 175 * s); near.lineTo(cx - 45 * s, g - 250 * s);
  near.arc(cx, g - 280 * s, 42 * s, Math.PI * .8, Math.PI * .2); near.lineTo(cx + 55 * s, g - 175 * s); near.quadraticCurveTo(cx + 105 * s, g - 150 * s, cx + 95 * s, g - 70 * s); near.closePath();
  for (let i = 0; i < 6; i++) dome(far, cx + (-760 + i * 300) * s, g, (90 + (i % 2) * 40) * s);
  rect(near, cx - 1000 * s, g, 2000 * s, 400); return { far, mid, near, sun: [cx - 380 * s, g - 470 * s, 60 * s] }; }
function maspati(cx, s) { const g = GY(), far = new Path2D(), mid = new Path2D(), near = new Path2D();
  for (const side of [-1, 1]) for (let i = 0; i < 3; i++) { const x = cx + side * (150 + i * 170) * s, h = (210 + (i % 2) * 40) * s; rect(mid, x - 75 * s, g - h, 150 * s, h); tri(mid, [x - 95 * s, g - h], [x, g - h - 70 * s], [x + 95 * s, g - h]); rect(near, x - 25 * s, g - 110 * s, 50 * s, 110 * s); }
  rect(near, cx - 110 * s, g - 330 * s, 26 * s, 330 * s); rect(near, cx + 84 * s, g - 330 * s, 26 * s, 330 * s); rect(near, cx - 140 * s, g - 360 * s, 280 * s, 40 * s);   // the kampung gate
  for (const dx of [-60, 60]) { near.moveTo(cx + (dx + 20) * s, g - 270 * s); near.arc(cx + dx * s, g - 270 * s, 20 * s, 0, Math.PI * 2); }
  rect(far, cx - 1000 * s, g - 60 * s, 2000 * s, 60 * s); rect(near, cx - 1000 * s, g, 2000 * s, 400);
  return { far, mid, near, sun: [cx + 330 * s, g - 450 * s, 62 * s] }; }
function jalanGula(cx, s) { const g = GY(), far = new Path2D(), mid = new Path2D(), near = new Path2D();
  for (let i = -3; i <= 3; i++) { const x = cx + i * 190 * s, h = (230 + Math.abs(i % 2) * 30) * s; rect(mid, x - 90 * s, g - h, 180 * s, h); tri(mid, [x - 100 * s, g - h], [x, g - h - 90 * s], [x + 100 * s, g - h]); rect(near, x - 40 * s, g - 150 * s, 80 * s, 150 * s); }
  rect(far, cx - 1000 * s, g - 380 * s, 2000 * s, 40 * s); rect(near, cx - 1000 * s, g, 2000 * s, 400);
  return { far, mid, near, sun: [cx + 360 * s, g - 470 * s, 74 * s] }; }
// ------------------------------------------------------------------ printing
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
let paperC; let REG = [];
function makePaper() { const c = document.createElement('canvas'); c.width = Math.ceil(VW); c.height = UH; const g = c.getContext('2d'), R = mulberry(5); g.fillStyle = PAPER; g.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(120,100,70,${R() * .05})`; g.fillRect(R() * c.width, R() * c.height, 1 + R() * 2, 1); } return c; }
function pull(c, path, ink, k, reg, front) {   // one opaque ink revealed by a ragged squeegee front moving down (k 0..1), slipped by reg
  if (k <= 0) return; c.save(); c.translate(reg[0], reg[1]);
  if (k < 1) { const y = front(k); c.beginPath(); c.moveTo(-50, -50); c.lineTo(VW + 50, -50); for (let x = VW + 50; x >= -50; x -= 40) c.lineTo(x, y + Math.sin(x * .07 + k * 9) * 6); c.closePath(); c.clip(); }
  c.fillStyle = 'rgba(0,0,0,.10)'; c.save(); c.translate(1.6, 1.6); c.fill(path); c.restore();               // overprint ghost
  c.fillStyle = ink; c.fill(path); c.restore();
}
function blade(c, k, col) { if (k <= 0 || k >= 1) return; const y = lerp(-40, UH + 40, eo(k)); c.save(); c.fillStyle = 'rgba(40,40,46,.85)'; c.fillRect(-10, y - 6, VW + 20, 12); c.fillStyle = col; c.beginPath(); c.roundRect(-10, y - 22, VW + 20, 14, 7); c.fill(); c.restore(); }
function sky(p, c0, c1) {  // stepped bands, no gradients
  const P0 = new Path2D(); P0.rect(0, 0, VW, UH); const P1 = new Path2D(), g = GY(); P1.rect(0, 0, VW, g * .42); for (let i = 0; i < 5; i++) P1.rect(0, g * .42 + i * 26 + i * i * 2, VW, 14 - i * 2.4);
  return [P0, P1];
}
function render(t) {
  REG = []; const S = H / 1080; ctx.setTransform(S, 0, 0, S, 0, 0); ctx.drawImage(paperC, 0, 0);
  const i = clamp(Math.floor(t / 2), 0, 5), lt = t - i * 2, P = POSTERS[i], pal = PAL[i], R = mulberry(31 + i);
  const cx = VW / 2, s = TV ? 1 : .56;
  const art = P.art(cx, s), [skyA, skyB] = sky(); const reg = () => [(R() - .5) * 5, (R() - .5) * 5];
  const sunP = new Path2D(); sunP.arc(art.sun[0], art.sun[1], art.sun[2], 0, Math.PI * 2);
  const front = k => lerp(-40, UH + 40, eo(k));
  const pulls = [ // [path, ink, start]: sky + name, far, mid + sun, near + band (each pull 0.32 s; four pulls a bar)
    [skyA, pal[0], 0], [skyB, pal[1], 0], [art.far, pal[2], .3], [sunP, pal[5], .3], [art.mid, pal[3], .6], [art.near, pal[4], .9]];
  for (const [p, ink, st] of pulls) pull(ctx, p, ink, seg(lt, st, st + .28), reg(), front);
  // the name, printed into the sky with the first pull (knocked out to paper where it sits on the deep sky)
  const k1 = seg(lt, 0, .28); if (k1 > 0) { ctx.save(); if (k1 < 1) { ctx.beginPath(); ctx.rect(0, 0, VW, front(k1)); ctx.clip(); }
    const fs = TV ? 150 : 84; ctx.font = `800 ${fs}px BigShoulders`; ctx.textAlign = 'center'; ctx.fillStyle = pal[4]; ctx.letterSpacing = TV ? '8px' : '4px'; ctx.fillText(P.name, cx, TV ? 200 : 290);
    ctx.font = `600 ${TV ? 28 : 19}px Outfit`; ctx.letterSpacing = TV ? '6px' : '3px'; ctx.fillText(P.en.toUpperCase(), cx, TV ? 250 : 322); ctx.restore();
    if (k1 >= 1) REG.push({ id: 'p' + i, text: P.name, x0: (cx - 400) * S, y0: ((TV ? 200 : 290) - 120) * S, x1: (cx + 400) * S, y1: (TV ? 210 : 300) * S }); }
  // the info band: name, number, a rule (printed with the near ink, last)
  const kb = seg(lt, .9, 1.18); if (kb > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, VW, front(kb)); ctx.clip(); const by = TV ? 950 : 742;
    ctx.fillStyle = pal[0]; ctx.font = `600 ${TV ? 26 : 18}px Outfit`; ctx.letterSpacing = '4px'; ctx.textAlign = 'left'; ctx.fillText('SURABAYA', TV ? 80 : 34, by); ctx.textAlign = 'right'; ctx.fillText(`${String(i + 1).padStart(2, '0')} / 06`, VW - (TV ? 80 : 34), by);
    ctx.fillRect(TV ? 80 : 34, by + 16, VW - (TV ? 160 : 68), 3); ctx.restore(); }
  blade(ctx, seg(lt, 0, .28), pal[1]); blade(ctx, seg(lt, .3, .58), pal[2]); blade(ctx, seg(lt, .6, .88), pal[3]); blade(ctx, seg(lt, .9, 1.18), pal[4]);
}
window.render = render; window.TEXTS = () => REG.slice();
window.EV = POSTERS.flatMap((p, i) => [0, .3, .6, .9].map(o => ({ t: i * 2 + o, type: 'pull', poster: i })));
Promise.all(['800 40px BigShoulders', '600 20px Outfit'].map(f => document.fonts.load(f, 'A'))).then(() => { paperC = makePaper(); render(0); window.READY = true; });
