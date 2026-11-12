// Explore Surabaya: a themed tour network drawn as a transit schematic (octilinear, 0/45/90 degrees).
// Illustrative tour map, not an official transport network (printed on the sheet as such). Places are real; positions
// are simplified to the grid. Units: G = 1 grid step = 100 world units; x grows east, y grows south.
// The Kalimas is drawn as a straight north-south band at x = 0; west bank = Kota Lama, Tugu, Tunjungan; east bank =
// Pecinan, Monkasel, Gubeng, MERR. UT Surabaya sits on the MERR (x = 10).
// Lines are "courses" (mata kuliah), each in a colour from the SENMASTER / UT palette (BRANDING.md).
(function () {
const G = 100;
// id: [x, y, native (ID), second (EN), tier]   tier 1 hub (label at every zoom), 2 interchange, 3 named stop
const ST = {
  // MERR corridor and the campus
  UT:   [10, -0.8, 'UT Surabaya', 'Universitas Terbuka', 1],
  MLY:  [10, -3.6, 'Mulyorejo', 'Mulyorejo', 2],
  KJD:  [10, -5.8, 'Kalijudan', 'Kalijudan', 3],
  RKT:  [10, 3.4, 'Rungkut', 'Rungkut', 3],
  KLM:  [7.6, -0.8, 'Klampis', 'Klampis', 3],
  // red · Sejarah
  KTJ:  [3.0, -3.8, 'Kertajaya', 'Kertajaya', 3],
  KTB:  [1.4, -3.8, 'Ketabang', 'Ketabang', 2],
  PDN:  [-1.4, -3.8, 'Rumah Lahir Bung Karno', "Sukarno's Birthplace", 3],
  GNI:  [-3.2, -3.8, 'Gedung Nasional Indonesia', 'National Building', 2],
  TUGU: [-3.2, -5.8, 'Tugu Pahlawan', 'Heroes Monument', 1],
  // yellow · Arsitektur
  CRT:  [-3.2, -7.2, 'Gedung Cerutu', 'Cigar Building', 3],
  MBI:  [-3.2, -8.6, 'Museum Bank Indonesia', 'Bank Indonesia Museum', 2],
  JMR:  [-1.2, -8.6, 'Jembatan Merah', 'Red Bridge', 1],
  // purple · Budaya (shares the Kembang Jepun corridor with yellow in the finale)
  ABH:  [1.4, -8.6, 'Rumah Abu Han', 'Han Ancestral House', 3],
  KYA:  [2.8, -8.6, 'Kya-Kya Kembang Jepun', 'Kembang Jepun Night Market', 2],
  KPS:  [4.6, -8.6, 'Kapasan', 'Kapasan', 3],
  JGL:  [6.4, -8.6, 'Jalan Gula', 'Sugar Street', 3],
  // blue · Teknologi
  MKS:  [1.4, -0.7, 'Monumen Kapal Selam', 'Submarine Monument', 1],
  GBG:  [4.6, -0.7, 'Gubeng', 'Gubeng', 2],
  // green · Ruang Publik
  SIO:  [-3.2, -2.4, 'Siola', 'Siola', 3],
  TJG:  [-3.2, -1.0, 'Jalan Tunjungan', 'Tunjungan Street', 2],
  BPM:  [-2.0, 0.2, 'Balai Pemuda', 'Youth Hall', 3],
  JKD:  [-1.2, 1.0, 'Arca Joko Dolog', 'Joko Dolog Statue', 2],
  BKT:  [1.4, 1.0, 'Balai Kota', 'City Hall', 3],
  BRC:  [3.4, 1.0, 'Monumen Bambu Runcing', 'Bamboo Spear Monument', 2],
  MNR:  [6.0, 1.0, 'Manyar', 'Manyar', 3],
  // orange · Alam
  BGK:  [-1.2, 4.0, 'Taman Bungkul', 'Bungkul Park', 3],
  SBY:  [-1.2, 6.4, 'Patung Sura & Baya', 'Sura and Baya Statue', 2],
  KBS:  [-1.2, 8.0, 'Kebun Binatang Surabaya', 'Surabaya Zoo', 1],
  JGR:  [2.4, 8.0, 'Jagir', 'Jagir', 3],
  // navy · Rekayasa
  PRK:  [-3.2, -11.6, 'Tanjung Perak', 'Tanjung Perak Port', 2],
  UJG:  [-1.2, -11.6, 'Ujung', 'Ujung', 3],
  KJR:  [5.4, -11.6, 'Kenjeran', 'Kenjeran', 3],
  SRM:  [10, -11.6, 'Jembatan Suramadu', 'Suramadu Bridge', 1],
  BKL:  [10, -16.6, 'Bangkalan', 'Bangkalan, Madura', 2],
};

// line colours (BRANDING.md): SENMASTER red, yellow, sky, green; navy; plus orange and purple
const LINES = [
  // red leaves the campus west on the north side of the Klampis corridor, then climbs NW to Ketabang
  { id: 'M', name: 'Sejarah', bullet: '1', color: '#E53E31', route: [['UT', -0.2, -0.1], ['KLM', 0, -0.1], 'KTJ', 'KTB', 'PDN', 'GNI', 'TUGU'] },
  // yellow: Kota Lama, then (finale) east along Kembang Jepun on the north side and down the MERR (middle)
  { id: 'K', name: 'Arsitektur', bullet: '2', ink: true, color: '#F6EC25',
    route: ['TUGU', 'CRT', 'MBI', 'JMR', ['ABH', 0, -0.1], ['KYA', 0, -0.1], ['KPS', 0, -0.1], ['JGL', 0, -0.1], [8.083, -8.7], [10.0, -6.783], 'KJD', 'MLY', ['UT', 0, -0.3]] },
  // blue: down the east bank of the Kalimas to the submarine, then (finale) east along the south side of the corridor
  { id: 'B', name: 'Teknologi', bullet: '3', color: '#2CACE2', route: ['KTB', 'MKS', 'GBG', ['KLM', 0, 0.1], ['UT', -0.2, 0.1]] },
  { id: 'H', name: 'Ruang Publik', bullet: '4', color: '#00A54E', route: ['GNI', 'SIO', 'TJG', 'BPM', 'JKD', 'BKT', 'BRC', 'MNR', ['UT', 0, 0.3]] },
  { id: 'O', name: 'Alam', bullet: '5', color: '#F28C28', route: ['JKD', 'BGK', 'SBY', 'KBS', 'JGR', [6.2, 8.0], [10.2, 4.0], ['RKT', 0.2, 0], ['UT', 0.2, 0.3]] },
  { id: 'N', name: 'Rekayasa', bullet: '6', color: '#0E497A', route: ['MBI', 'PRK', 'UJG', 'KJR', 'SRM', 'BKL'],
    branch: ['SRM', [10.2, -11.4], ['KJD', 0.2, 0], ['MLY', 0.2, 0], ['UT', 0.2, -0.3]] },
  { id: 'U', name: 'Budaya', bullet: '7', color: '#7B4FA2',
    route: ['JMR', ['ABH', 0, 0.1], ['KYA', 0, 0.1], ['KPS', 0, 0.1], ['JGL', 0, 0.1], [8.0, -8.5], [9.8, -6.7], ['KJD', -0.2, 0], ['MLY', -0.2, 0], ['UT', -0.2, -0.3]] },
];

// water: the Kalimas (straight band, x = 0) into the Madura Strait (an area across the top of the sheet; Madura beyond)
const KALIMAS = [[0, 24], [0, -12.6]];
const STRAIT = [[-24, -12.6], [36, -12.6], [36, -16.4], [13.2, -16.4], [12.2, -15.4], [7.4, -15.4], [6.4, -16.4], [-24, -16.4]];   // across the whole (flat) sheet   // Madura's coast juts south where the bridge lands
const WATER = [
  { id: 'kalimas', line: KALIMAS, outer: 0.81, inner: 0.75 },
  { id: 'strait', area: STRAIT },
];

function pt(it) {
  if (typeof it === 'string') { const s = ST[it]; if (!s) throw new Error('no station ' + it); return [s[0], s[1]]; }
  if (typeof it[0] === 'string') { const s = ST[it[0]]; if (!s) throw new Error('no station ' + it[0]); return [s[0] + it[1], s[1] + it[2]]; }
  return [it[0], it[1]];
}
const sid = it => typeof it === 'string' ? it : (typeof it[0] === 'string' ? it[0] : null);
function expand(route) {
  const out = [], ids = []; let diagFirst = false;
  for (const it of route) {
    if (it === '/') { diagFirst = true; continue; }
    const p = pt(it);
    if (out.length) {
      const a = out[out.length - 1], dx = p[0] - a[0], dy = p[1] - a[1], ax = Math.abs(dx), ay = Math.abs(dy);
      if (ax > 1e-6 && ay > 1e-6 && Math.abs(ax - ay) > 1e-6) {
        const d = Math.min(ax, ay), sx = Math.sign(dx), sy = Math.sign(dy);
        const bend = diagFirst ? [a[0] + sx * d, a[1] + sy * d] : [p[0] - sx * d, p[1] - sy * d];
        out.push(bend); ids.push(null);
      }
    }
    out.push(p); ids.push(sid(it)); diagFirst = false;
  }
  return { pts: out, ids };
}
const LINKS = [];
window.NET = { G, ST, LINES, WATER, LINKS, pt, sid, expand, KALIMAS, STRAIT };
})();
