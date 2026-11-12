# ROADMAP — tujuan dan status per section

Film ini punya **11 section (S0–S10)** plus **ekor TV**. Peta Transit Map adalah tulang punggungnya (S1, S10, dan semua perjalanan pen di antara jendela). Delapan jendela gaya tamu menyela peta di stasiun-stasiun kunci.
Rincian detik demi detik (shot, kamera, sound) ada di [`SECTIONS.md`](SECTIONS.md). Naskah VO terbaru ada di [`NASKAH.md`](NASKAH.md).

Legenda status: ✅ lolos audit · 🔁 v2 selesai, menunggu catatan revisi · ⏳ belum dikerjakan.

---

## 1. Peta besar

| Sec | Waktu di peta (rencana) | Judul | Mata kuliah · warna jalur | Gaya | Folder | Durasi jendela (rencana → v2) | Status |
|---|---|---|---|---|---|---|---|
| **S0** | 0:00–0:10 | Orbit di atas Selat Madura | — | Satellite Briefing | `sat/` (`?shot=S0`) | 10 → **10 s** | 🔁 v2 |
| **S1** | 0:10–0:29 | Anda di sini: UT Surabaya | titik merah | **Transit Map** | `map/` | (spine) | 🔁 v2 (peta datar) |
| **S2** | 0:29–0:40 | Kota Pahlawan · Tugu Pahlawan | 1 · Sejarah · Merah | Projection on White Model | `whitemodel/` | 11 → **16 s** | 🔁 v3 |
| **S3** | 0:47–0:58 | Kota Lama · Gedung Cerutu | 2 · Arsitektur · Kuning | Urban Sketch · Pen & Wash | `sketch/` | 11 → **12 s** | 🔁 v2 |
| **S4** | 1:07–1:16 | Kalimas · Monumen Kapal Selam | 3 · Teknologi · Biru | Isometric Infographic | `iso/` | 9 → **12 s** | 🔁 v2 |
| **S5** | 1:22–1:30 | Jantung kota · Jalan Tunjungan | 4 · Ruang Publik · Hijau | Tilt-Shift Miniature | `tilt/` | 8 → **10 s** | 🔁 v2 |
| **S6** | 1:32–1:44 | Kartu pos kota (6 poster) | (Hijau lanjut) | Silkscreen Travel Poster | `silk/` | 12 → **15 s** | 🔁 v2 |
| **S7** | 1:47–1:56 | Kebun Binatang · Sura & Baya | 5 · Alam · Oranye | Low-poly Isometric Island | `lowpoly/` | 9 → **12 s** | 🔁 v2 |
| **S8** | 2:08–2:15 | Gerbang laut · Suramadu | 6 · Rekayasa · Navy | Satellite Briefing | `sat/` (`?shot=S8`) | 7 → **7 s** | 🔁 v2 |
| **S9** | 2:21–2:31 | Malam di Kya-Kya | 7 · Budaya · Ungu | Paper-cut Lightbox | `lantern/` | 10 → **10 s** | 🔁 v2 |
| **S10** | 2:31–3:00 | Semua jalur pulang (finale) | semua → UT | **Transit Map** | `map/` | (spine) | 🔁 v2 |
| **TV** | 3:00–3:08 | End hold 6 s + jembatan loop 2 s | — | Transit Map | `map/` (`fmt=tv`) | 8 s | 🔁 v2 |

Kolom waktu adalah posisi jendela di `map/timeline.js` (`WIN`) saat ini. Jendela v2 sudah lebih panjang dari slot itu, total **+17 s** (lihat §3).

## 2. Tujuan per section

### S0 · Orbit di atas Selat Madura (Satellite Briefing)
- **Tujuan:** hook ≤ 3 detik dan memberi skala sebelum lokasi. Penonton langsung tahu ini Surabaya, kota di tepi selat.
- **Isi:** citra Sentinel-2 asli dengan grade abu analis, satu zoom kontinu dari orbit ke kota, dan reticle yang mencari lalu mengunci Surabaya (`7°15′ S 112°45′ E`). Kota tetap terlihat dan hidup. Tidak ada layar gelap dan tidak ada titik bulat polos (catatan revisi).
- **Menanam:** garis Suramadu (dibayar di S8).
- **Keluar:** reticle menyusut menjadi titik stasiun di kertas (match-cut ke S1). Desis pen masuk lebih dulu (J-cut).

### S1 · Anda di sini: UT Surabaya (Transit Map)
- **Tujuan:** memperkenalkan premis: *UT itu kampus terbuka, jadi kotanya adalah kampus.* Titik "Anda di sini" berada di **UT Surabaya, Jl. Dr. Ir. H. Soekarno**.
- **Isi:** lembar peta datar (sesuai catatan revisi: bukan 2,5D), cartouche judul tercetak, dan odometer *Mata kuliah 0*. Pen merah berangkat ke barat.
- **Rasa:** pelan dan yakin. **Hening 1** sebelum 1945.

### S2 · Kota Pahlawan (Projection on White Model) · Mata kuliah 1: Sejarah
- **Tujuan:** momen khidmat. Surabaya adalah Kota Pahlawan, dan tanggal **10 November 1945** "tersimpan" di bentuk Tugu.
- **Isi:** 2.053 jejak bangunan Google Open Buildings di sekitar Tugu, dengan Tugu 41,15 m (10 lengkung, 11 ruas). Model putih **tidak pernah berubah**; hanya cahaya proyektor yang bercerita: jalan 1945, panah gerak, angka `10 · 11 · 1945`, dan `41,15 m`. Lampu ruangan diredupkan ke 20% (catatan revisi: jangan gelap, kota tetap terlihat). Tugu tampil utuh dan sempurna di landscape, dengan durasi lebih lama.
- **Keluar:** lensa proyektor menjadi titik stasiun.

### S3 · Kota Lama (Urban Sketch · Pen & Wash) · Mata kuliah 2: Arsitektur
- **Tujuan:** mengajak penonton *membaca gedung seperti buku*. Ini kota lama Surabaya.
- **Isi:** Gedung Cerutu, Museum Bank Indonesia, dan Rumah Abu Han digambar fineliner sepia sesuai urutan goresan, lalu cat air menyusul dan keluar garis. Ada label tulisan tangan dan orang-orang "wortel" khas urban sketch.
- **Keluar:** cipratan cat bulat menjadi titik stasiun.

### S4 · Kalimas & Kapal Selam (Isometric Infographic) · Mata kuliah 3: Teknologi
- **Tujuan:** rasa ingin tahu teknik. Ada kapal selam sungguhan di tepi Kalimas.
- **Isi:** papan isometrik dengan sungai, taman, museum, dan **KRI Pasopati 410** di plinthnya. Lambung silinder yang **terbuka** memperlihatkan ruang-ruang kapal, dengan label tinta tipis, Isotype, dan catatan *dipotong 16 bagian untuk dipindah ke darat* (🟡, sumber disebut di layar).
- **Keluar:** periskop menjadi titik. Sonar ping memberi L-cut ke S5.

### S5 · Jantung Kota (Tilt-Shift Miniature) · Mata kuliah 4: Ruang Publik
- **Tujuan:** kota yang hidup, ramai, dan meriah, seperti maket mainan.
- **Isi:** Jalan Tunjungan dari atas dengan ruko kolonial berarkade, menara sudut, time-lapse mobil, motor, pejalan, dan bus kota tanpa logo. Lensa tilt-shift dan grade miniatur.
- **Keluar:** lampu lalu lintas hijau menjadi titik.

### S6 · Kartu Pos Kota (Silkscreen Travel Poster) · akselerasi
- **Tujuan:** puncak energi pertama. Montase cepat yang menunjukkan bahwa kota ini punya banyak hal.
- **Isi:** **6 poster sablon × 2,5 s**: Balai Pemuda, Balai Kota, Monumen Bambu Runcing, Arca Joko Dolog, Kampung Lawas Maspati, dan Jalan Gula. Tiap poster dibangun lapis tinta per ketukan, dengan raclette yang melintas setiap tarikan. Sore bergeser ke senja sepanjang seri.
- **Masuk/keluar:** potongan keras di downbeat. Cap tinta bulat menjadi titik stasiun.

### S7 · Kebun Binatang (Low-poly Isometric Island) · Mata kuliah 5: Alam
- **Tujuan:** ringan dan lucu, sekaligus asal-usul nama kota (*jare legenda*).
- **Isi:** pulau naik tile demi tile dari laut, lalu kebun binatang tumbuh di atasnya: jalan, kandang berpagar, kolam, pohon, dan satwa. Patung **Sura (hiu) & Baya (buaya)** dibangun blok demi blok di tengah. Setiap kemunculan memantul dan berbunyi satu nada.
- **Keluar:** matahari sore menjadi titik.

### S8 · Gerbang Laut: Suramadu (Satellite Briefing) · Mata kuliah 6: Rekayasa
- **Tujuan:** momen megah yang membayar S0.
- **Isi:** kembali ke citra satelit. Garis ukur putih Surabaya ↔ Bangkalan menunjukkan **5.438 m** dan *Diresmikan 10 Juni 2009*, lalu warna kembali ke selat. Pin landmark membuat kota terasa hidup.
- **Keluar:** reticle menjadi titik di kaki Suramadu.

### S9 · Malam di Kya-Kya (Paper-cut Lightbox) · Mata kuliah 7: Budaya
- **Tujuan:** belokan emosi: *semua yang kami pelajari hari ini, kami pelajari di luar ruang kelas.*
- **Isi:** kotak lightbox dengan lapisan kertas Pecinan Kembang Jepun: gapura, deret ruko merah, lampion, dan aksara Tionghoa (subset Noto Serif SC). Lapisan menyala dari belakang satu per satu dengan cahaya hangat (catatan revisi: vibe China lebih kuat, glow tidak berlebihan).
- **Keluar:** lampion terakhir meredup menjadi titik. **Hening 2** sebelum finale.

### S10 · Semua Jalur Pulang (Transit Map finale)
- **Tujuan:** klimaks dan pesan utama: ***Kampus kita seluas kota***, lalu ajakan *Rek, ojo mung liwat!*
- **Isi:** chime dua nada, lalu enam pen-tip serentak pulang ke UT. **Interchange UT jatuh** dengan cincin 7 warna (urutan figur SENMASTER: biru → hijau → merah → kuning, lalu oranye, navy, ungu). Disusul long take melintasi jaringan, pull back ke peta utuh, odometer `7 / 7`, cartouche akhir, **tagline** di pelat biru UT dengan huruf kuning, dan pelat logo.

### Ekor TV (hanya `fmt=tv`)
- **Tujuan:** TV di lokasi acara bisa memutar film berulang tanpa jeda hitam.
- **Isi:** end hold 6 s (tagline dan logo tetap terbaca dari jauh), lalu jembatan loop 2 s yang kembali ke frame 0.

## 3. Pekerjaan berikutnya (urut)

1. **Catatan revisi per section.** Section yang masih 🔁 menunggu catatan dari user. Render audit per section: `sh render_section.sh S5 tv`.
2. **Keputusan durasi.** Jendela v2 total **+17 s** dari slot di peta (S2 +5, S3 +1, S4 +3, S5 +2, S6 +3, S7 +3), jadi film menjadi kira-kira **3:17 (Reels)** dan **3:25 (TV)**. Ada dua pilihan:
   - **a.** Retime peta (`map/timeline.js`: `WIN`, `PHASES`, `COURSE`, VO, subtitle, cue) dan `audio/mix.py` agar mengikuti durasi v2. Film jadi sekitar 3:17.
   - **b.** Pangkas jendela kembali ke slot lama supaya film tetap 3:00.
3. **Narasi final.** Ganti suara sementara dengan rekaman penutur asli Surabaya: satu file per baris di `voice/`, sesuai tabel VO di `map/timeline.js`.
4. **Gabung (merge final).** Jalankan `sh build.sh` untuk render semua part, VO, mix −14 LUFS, perakitan, dan subtitle.
5. **QA final.** Contact sheet, tonton penuh di HP (Reels) dan di TV sungguhan lewat HDMI, cek titik loop TV, cek safe zone IG.
6. **Deliver.** `surabaya-explore-ut_reels.mp4` + `.srt`, `surabaya-explore-ut_tv.mp4`, poster, dan CREDITS.

## 4. Fase yang sudah dilewati

| Fase | Hasil | Status |
|---|---|---|
| F0 Brief | Brief terkunci (KETENTUAN.md §1) | ✅ |
| F1 Riset & fakta | `RESEARCH.md` → `FACTS.md` (≥ 2 sumber, 🟡 disebut sumbernya di layar) | ✅ |
| F2 Peta | `map/net.js`: 7 jalur, UT sebagai hub, Kalimas, dan Selat Madura | ✅ |
| F3 Skor & VO sementara | Grid 120 BPM, skor sintetis, espeak-ng | ✅ (VO final ⏳) |
| F4 Look | Style frame 9 gaya dari kode asli | ✅ |
| F6 Produksi per section | Semua jendela sudah v2 (S2 v3) | 🔁 audit |
| F7–F10 | Retime, gabung, mix final, QA, deliver | ⏳ |

Rencana awal (arsitektur Remotion) disimpan di [`arsip/ROADMAP-AWAL-REMOTION.md`](arsip/ROADMAP-AWAL-REMOTION.md) sebagai sejarah keputusan. Produksi akhirnya memakai pipeline Lemo-Opuscar; alasannya ada di [`STYLES.md`](STYLES.md) §2.
