# Roadmap — dari konsep sampai final render

> **Arsip: rencana awal.** Arsitektur Remotion di bawah **tidak dipakai**. Produksi memakai pipeline Lemo-Opuscar (lihat [`../STYLES.md`](../STYLES.md) §2). Roadmap terbaru ada di [`../ROADMAP.md`](../ROADMAP.md).

Durasi 3 menit dengan 9 gaya = kira-kira **5–6× kerja film 30–60 s biasa**. Karena itu kita bangun **satu engine per gaya, sekali**, lalu semua section hanya data + kamera.

## Fase & gerbang (gate)

| Fase | Output | Gate (harus lolos sebelum lanjut) |
|---|---|---|
| **F0 Brief** | Jawaban 6 pertanyaan di README | User jawab sekali; sisanya pakai default |
| **F1 Riset & fakta** | `FACTS.md` dari RESEARCH.md; semua 🟡 jadi ✅ atau dibuang | Tidak ada angka/tanggal di VO atau layar tanpa 2 sumber |
| **F2 Peta (data)** | `net.js`: 7 jalur, ≥ 40 stasiun bernama, ≥ 8 interchange, Kalimas + Selat Madura, UT sebagai hub | Validator: 100 % segmen 0/45/90°; label tidak menabrak garis; minimum STYLE §11 terpenuhi |
| **F3 Skor & VO dulu** | Grid 90 bar, `cues.json`, VO TTS per baris + cek speech-to-text, skor sketsa | Setiap cut/landing/subtitle jatuh di beat (`events` check) |
| **F4 Look (style frames)** | 1 frame per gaya (9 frame) dari kode asli, + 3 frame signature Transit Map | Dicek terhadap tiap STYLE.md; tampil di HP |
| ~~F5 Storyboard~~ | *dilewati (keputusan user)* | — |
| **F6 Produksi per section** | S0…S10 sebagai komponen Remotion | Tiap section render sendiri, lolos QA section |
| **F7 Transisi & assembly** | 10 transisi match-cut, timeline penuh | Tidak ada frame kosong/hitam; bentuk bulat cocok posisi & ukuran di frame cut |
| **F8 Mix** | Ambience + foley + musik + VO, ducking | −14 LUFS, ≤ −3 dBTP, 2 hening terdengar, J/L-cut ada |
| **F9 QA & satu putaran fix** | Contact sheet, strip 0,2 s aksi kunci, tonton penuh dengan suara di HP | Checklist di bawah 100 % |
| **F10 Deliver** | **Reels**: `surabaya-explore-ut_reels_1080x1920.mp4` + `.srt` + cover 1080×1920 · **TV**: `surabaya-explore-ut_tv_1920x1080.mp4` (loop-ready, aman tanpa suara) · `poster.jpg`, `CREDITS`, `build.sh`, `TREATMENT.md`, `FACTS.md` | Diputar di TV sungguhan / laptop+HDMI sebelum acara |

Urutan prioritas produksi (risiko tertinggi dulu): Transit Map engine (dipakai di 10 dari 11 section) → Satellite (S0, S8) → White Model → Iso Infographic → sisanya.

## Arsitektur Remotion

```
films/surabaya-explore-ut/
├─ remotion/
│  ├─ src/
│  │  ├─ Root.tsx               # <Composition id="Reels" 1080x1920 30fps 5400f>
│  │  │                         # <Composition id="TV"    1920x1080 30fps 5640f>
│  │  ├─ format.ts              # FORMAT = 'reels' | 'tv': framing kamera, posisi teks, safe zone, bug logo
│  │  ├─ timeline.ts            # SUMBER KEBENARAN: BPM, bar→frame, SECTIONS[], CUES[], VO[]
│  │  ├─ Film.tsx               # <Series>/<Sequence> per section + <Audio src=mix.wav>
│  │  ├─ engines/               # satu engine per gaya, MURNI fungsi (frame) → gambar
│  │  │  ├─ transit/            # port dari styles/transit-map/demo (gl.js, film.js) → canvas+WebGL
│  │  │  ├─ satellite/  whiteModel/  urbanSketch/  isoInfo/
│  │  │  ├─ tiltShift/  silkscreen/  lowpoly/  lightbox/
│  │  ├─ sections/S0…S10.tsx    # hanya data + kamera, memanggil engine
│  │  ├─ transitions/RoundMatch.tsx  # dot ↔ bentuk bulat (posisi & radius diinterpolasi di layar)
│  │  └─ ui/Odometer.tsx  Subtitle.tsx  SafeZone.tsx (debug overlay)
│  └─ public/  brand/ (logo, layer bebas grade)  fonts/ imagery/ (Sentinel tiles) models/ (white model) audio/
├─ net.js                        # data jaringan peta (G grid)
├─ FACTS.md  CREDITS  build.sh
```

**Aturan teknis (turunan Golden Rules):**
1. Semua gambar = `f(useCurrentFrame())`. Tidak ada `Math.random()` tanpa seed, tidak ada `Date.now()`, tidak ada animasi CSS/`requestAnimationFrame`. Render paralel Remotion menuntut determinisme.
2. `timeline.ts` satu-satunya sumber waktu: `bar(n) = (n-1) * 60` frame. Section, transisi, VO, cue musik semua dihitung dari situ.
3. Canvas/WebGL: render di `useLayoutEffect` per frame, tunggu font/gambar dengan `delayRender()`/`continueRender()`. Three.js lewat `@remotion/three` untuk White Model, Low-poly, Iso, Tilt-shift.
4. Transisi: komponen `RoundMatch` mengambil `{x, y, r}` titik stasiun di layar dari kamera Transit Map (`toScreen`) dan bentuk bulat di gaya tamu → keduanya bertemu di frame cut. Satu fungsi world→screen untuk tiap gaya.
5. Audio dirender terpisah dengan pipeline library (`core/` sampler, sfx, mix, `mux.sh` dua-pass loudnorm), lalu dimasukkan sebagai satu `<Audio>`; event suara diekspor dari `timeline.ts` (`cues.json`).
6. `TEXTS(frame)` diekspor untuk cek waktu baca (`core/render/readcheck.mjs` atau port-nya).
7. Render: `npx remotion render Reels out/reels.mp4 --codec h264 --crf 16` dan `npx remotion render TV out/tv.mp4 --codec h264 --crf 14`; cek frame tunggal dengan `npx remotion still`.
8. **Dua format, satu engine**: `useVideoConfig()` → `format.ts` memilih aim point/zoom kamera dan tata letak teks. Engine gaya tidak tahu format apa; ia hanya menerima kamera & ukuran kanvas.
9. **Logo** dirender di layer terpisah di atas pass grade (tanpa grain, tanpa vignette, tanpa tekstur kertas), dari PNG asli tanpa resampling berlebihan (≥ ukuran tampil).
10. **TV loop**: frame terakhir jembatan loop dan frame 0 dicek berdampingan; audio TV (jika ada) di-crossfade 10 ms di titik loop agar tidak klik.

**Catatan lisensi Remotion:** Remotion gratis untuk individu & tim kecil, tapi **organisasi dengan > 3 orang wajib membeli Company License**. Bila film ini diproduksi atas nama UT, cek remotion.pro/license. Alternatif tanpa lisensi: pipeline bawaan library (`core/render/video.mjs`, `render(t)` di halaman web) — arsitektur engine di atas tetap sama, hanya pembungkusnya yang berganti.

## QA checklist (F9)

**Gaya & peta**
- [ ] Semua segmen peta 0/45/90°; Suramadu tidak dashed; Kalimas pita biru
- [ ] Tidak ada garis batas wilayah (DIRECTOR §13)
- [ ] Setiap jendela lolos cek STYLE.md gayanya (lihat tabel GR #4)
- [ ] Penutup = jaringan utuh, judul akhir tercetak di cartouche
- [ ] Bandingkan dengan demo "6 Kilometres": ≥ 4/6 berbeda

**Branding**
- [ ] Warna logo di frame render = warna file asli (ΔE < 2), tanpa grain/tekstur
- [ ] Hierarki UT → SENMASTER → LPPM UT, clear space & ukuran minimum terpenuhi

**TV Display**
- [ ] Ditonton **tanpa suara** dari awal sampai akhir: cerita tetap terbaca
- [ ] Loop 3× berturut-turut tanpa kedip hitam / lompatan
- [ ] Teks terbaca dari jarak 3 m di TV 55" (teks utama ≥ 30 px di 1080p)

**Reels / HP**
- [ ] Safe zone atas 220 px & bawah 380 px bebas teks penting
- [ ] Teks utama ≥ 36 px, kedua ≥ 22 px di 1080×1920
- [ ] Ditonton di HP sungguhan, suara HP & earphone

**Waktu & suara**
- [ ] `readcheck` lulus; subtitle ≥ 1,8 s & ≥ ucapan + 0,6 s
- [ ] VO lolos cek speech-to-text
- [ ] −14 LUFS, ≤ −3 dBTP; 2 hening; J-cut & L-cut; setiap aksi terlihat ada bunyi
- [ ] Tidak ada frame hitam / NaN, terutama di 10 frame transisi

**Fakta & hak**
- [ ] Semua angka di layar ada di FACTS.md dengan 2 sumber
- [ ] Logo UT hanya jika izin ada; tidak ada logo pihak ketiga
- [ ] Ilustrasi referensi user tidak di-trace
- [ ] CREDITS: Sentinel/Copernicus, OSM (ODbL), font OFL, edge-tts, sample library
- [ ] `grep -rniE "lemo ?lab"` bersih

## Estimasi urutan kerja (hari kerja agent)

| Hari | Pekerjaan |
|---|---|
| 1 | F1 fakta + F2 data peta + F3 grid & VO |
| 2 | Engine Transit Map di Remotion + style frames Transit |
| 3 | Satellite + White Model + Urban Sketch |
| 4 | Iso Infographic + Tilt-Shift + Silkscreen |
| 5 | Low-poly + Lightbox + transisi RoundMatch |
| 6 | Skor penuh, foley, mix |
| 7 | QA, satu putaran fix, deliver |
