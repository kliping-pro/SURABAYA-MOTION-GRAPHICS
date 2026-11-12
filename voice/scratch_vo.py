# Scratch narration for the animatic: espeak-ng (offline, Indonesian voice), only to lock timing.
# Final voice: a native Surabaya speaker (NASKAH.md, option A) or a proper TTS.
import json, subprocess, sys, wave, os
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
bar = lambda b, beat=1: (b - 1) * 2 + (beat - 1) * .5
LINES = [  # (bar, beat, text) from NASKAH.md
 (1, 3, 'Rek, deloken teko nduwur. Suroboyo iku mek sak titik.'),
 (6, 3, 'Tapi gawe arek-arek Universitas Terbuka, titik iki awal sak kampus.'),
 (9, 3, 'Kampus sing gak onok pagere.'),
 (12, 1, 'Mata kuliah siji: Sejarah.'),
 (15, 1, 'Sepuluh November sangang las patang puluh limo, arek-arek Suroboyo milih ngelawan.'),
 (18, 3, 'Tugu patang puluh siji koma limolas meter iki nyimpen tanggal iku nang bentuke.'),
 (22, 3, 'Loro: Arsitektur. Kota lama ngajari awakdewe moco gedung koyok moco buku.'),
 (31, 3, 'Telu: Teknologi. Kapal selam temenan, saiki nyandar nang pinggir Kalimas.'),
 (40, 2, 'Papat: Ruang Publik. Nang Tunjungan, kutho iki sinau mlaku bareng.'),
 (53, 2, 'Limo: Alam. Jare legenda, Sura si iwak hiu ambek Baya si boyo,'),
 (56, 3, 'sing gelut, terus dadi jenenge kutho iki.'),
 (60, 3, 'Enem: Rekayasa.'),
 (64, 1, 'Limang ewu patang atus telung puluh wolu meter, nyambung Jowo ambek Meduro.'),
 (70, 3, 'Pitu: Budaya.'),
 (72, 1, 'Bengi iku awakdewe sadar. Kabeh sing disinaoni dino iki, disinaoni nang njobo kelas.'),
 (82, 1, 'Universitas Terbuka Surabaya. Kampuse, sak kutho.'),
 (86, 1, 'Rek, ojo mung liwat! Mampiro, akeh karya apik nang kene!'),
]
SR = 24000; DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 180.0
mix = np.zeros(int(DUR * SR) + SR, np.float32); report = []
for i, (b, bt, text) in enumerate(LINES):
    f = f'{HERE}/scratch_{i+1:02d}.wav'
    subprocess.run(['espeak-ng', '-v', 'id', '-s', '172', '-p', '45', '-w', f, text], check=True)
    x, sr = sf.read(f, dtype='float32')
    if sr != SR: x = np.interp(np.arange(0, len(x), sr / SR), np.arange(len(x)), x).astype(np.float32)
    t0 = bar(b, bt); n0 = int(t0 * SR); d = len(x) / SR
    nxt = bar(*LINES[i + 1][:2]) if i + 1 < len(LINES) else DUR
    mix[n0:n0 + len(x)] += x * .8
    report.append({'line': i + 1, 't0': round(t0, 2), 'dur': round(d, 2), 'gap_to_next': round(nxt - t0 - d, 2)})
mix = mix[:int(DUR * SR)]
sf.write(f'{HERE}/scratch_vo.wav', mix / max(1e-6, np.abs(mix).max()) * .7, SR)
json.dump(report, open(f'{HERE}/scratch_timing.json', 'w'), indent=1)
for r in report: print(r, '  <-- OVERLAP' if r['gap_to_next'] < 0.2 else '')
