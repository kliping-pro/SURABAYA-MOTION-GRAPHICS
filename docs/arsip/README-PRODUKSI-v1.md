# EXPLORE SURABAYA — "Kampus Kita Seluas Kota"

> **Arsip.** README produksi v1 dari folder `films/surabaya-explore-ut/` di repo lemo-opuscar. README terbaru ada di [`../../README.md`](../../README.md).

Film **3 menit** tentang perjalanan menjelajah Kota Surabaya, dalam konteks **Universitas Terbuka (UT) Surabaya**, kantor di Jl. Dr. Ir. H. Soekarno (MERR), untuk acara **SENMASTER — Gelar Hasil** (LPPM UT).

**Dua output dari satu sumber:**
1. **Reels promosi** — 9:16, dengan narasi & subtitle.
2. **TV Display** di lokasi acara — 16:9, harus tetap jelas **tanpa suara** dan bisa **diputar berulang (loop)**.
Gaya utama: **Transit Map** (`styles/transit-map`). Delapan gaya lain dari library masuk sebagai **"jendela tamu"**: tiap stasiun penting di peta membuka satu jendela dengan gayanya sendiri, lalu kembali ke peta.

> Status: **PRODUKSI v1.** Peta (spine) + 8 jendela gaya sudah dibangun dan dirender; musik & efek disintesis; narasi masih **suara sementara** (espeak-ng) sampai ada rekaman asli.
> Satu perintah: `sh build.sh` (atau `sh build.sh reels` / `sh build.sh tv`).

## Struktur produksi

| Folder | Isi | Gaya |
|---|---|---|
| `map/` | Spine Transit Map: `net.js` (35 stasiun, 7 jalur), `timeline.js` (kamera, callout, odometer, end card), engine `film.js` diadaptasi untuk 9:16 & 16:9 | Transit Map |
| `sat/` | S0 orbit → Surabaya, S8 garis ukur Suramadu 5.438 m; citra Sentinel-2 asli | Satellite Briefing |
| `whitemodel/` | S2 Tugu Pahlawan: 2.053 jejak bangunan Google Open Buildings + tugu 41,15 m, 10 lengkung, 11 ruas | Projection on White Model |
| `sketch/` | S3 Gedung Cerutu, Museum BI, Rumah Abu Han | Urban Sketch |
| `iso/` | S4 Monumen Kapal Selam dibelah, 16 bagian | Isometric Infographic |
| `tilt/` | S5 Jalan Tunjungan time-lapse ×24 | Tilt-Shift |
| `silk/` | S6 enam poster sablon | Silkscreen Poster |
| `lowpoly/` | S7 Kebun Binatang + patung Sura & Baya | Low-poly Island |
| `lantern/` | S9 malam di Kya-Kya | Paper-cut Lightbox |
| `audio/mix.py` · `voice/` · `assemble.py` | skor + foley + narasi; perakitan, subtitle, loudness | — |

**Keputusan teknis (berbeda dari rencana awal):**
- Pipeline render memakai pipeline library (`render(t)` per halaman + `core/render/video.mjs`), bukan Remotion: deterministik dan sama hasilnya, tanpa urusan lisensi Remotion, dan sudah berjalan di lingkungan ini. Tiap jendela = halaman sendiri, dirakit oleh `assemble.py` (ffmpeg).
- Subtitle satu gaya untuk seluruh film (pita kertas, Inter, ID di atas EN), dibakar saat perakitan; tagline akhir tidak di-subtitle karena sudah tercetak di peta.
- S6 (poster) masuk dan keluar dengan potongan keras di downbeat; jendela lain dengan match-cut bentuk bulat (titik stasiun ↔ reticle, lensa, matahari, cincin, bundaran, alas patung, bulan).
- Logo hanya di end card (pelat putih, warna asli, di luar grade). Pelat logo kecil di cartouche S1 dan bug logo TV belum dibuat.

## Isi folder

| File | Isi | Dibaca kapan |
|---|---|---|
| [`GOLDEN-RULES.md`](../GOLDEN-RULES.md) | 12 aturan emas yang tidak boleh dilanggar di film ini | Pertama, dan sebelum setiap keputusan |
| [`RESEARCH.md`](../RESEARCH.md) | Riset kota, landmark, fakta + sumber + status verifikasi (cikal bakal `FACTS.md`) | Sebelum menulis narasi / angka di layar |
| [`TREATMENT.md`](../TREATMENT.md) | Tiga kandidat struktur, pilihan & alasannya, logline, arc, benchmark | Setelah golden rules |
| [`SECTIONS.md`](../SECTIONS.md) | 11 section detik demi detik: gaya, kamera, transisi, VO, sound | Bahan utama produksi |
| [`BRANDING.md`](../BRANDING.md) | Logo UT · LPPM UT · SENMASTER, warna, aturan pakai, posisi di tiap format | Sebelum style frame & end card |
| [`NASKAH.md`](../NASKAH.md) | Naskah VO Suroboyoan + EN, teks layar, tagline acara, pilihan suara | Sebelum rekaman / TTS |
| [`ROADMAP.md`](ROADMAP-AWAL-REMOTION.md) | Fase kerja dari brief → render final, arsitektur Remotion, checklist QA | Untuk mengatur kerja harian |
| `brand/*.png` *(lokal)* | Logo UT, LPPM UT, SENMASTER dari user | Lihat BRANDING.md |
| `ref/poster-senmaster-tagline.jpg` *(lokal)* | Poster acara: tagline "Rek, ojo mung liwat!…" | Sumber tagline & nada |
| `ref/peta-referensi.jpg` *(lokal saja, tidak di-commit)* | Ilustrasi "Explore Surabaya" dari user | **Hanya referensi** daftar landmark & posisi kasar — tidak di-trace (lihat Golden Rule #11) |

## Brief singkat (default yang dipakai sampai user bilang lain)

| Item | Keputusan |
|---|---|
| Format Reels | 1080 × 1920 (9:16), **30 fps** (ditetapkan STYLE Transit Map), 180 s = 5.400 frame |
| Format TV | **TV display umum**: 1920 × 1080 (Full HD, jalan di TV mana pun), 30 fps, 180 s + 6 s end hold + 2 s jembatan loop = 188 s; aman **dengan atau tanpa suara** (teks di layar ikut menyampaikan narasi), bisa diputar berulang |
| Logo | UT · SENMASTER · LPPM UT — diberikan user; aturan di BRANDING.md |
| Bahasa | Narasi **Indonesia campur Suroboyoan** (NASKAH.md), teks utama Indonesia; baris kedua **English** (aturan bilingual Transit Map) |
| Suara | VO Indonesia (edge-tts `id-ID-ArdiNeural` / `id-ID-GadisNeural`) kecuali user punya rekaman sendiri |
| Musik | Disintesis dari timeline: perkusi bernada (marimba, glockenspiel, vibraphone) + warna **saron/bonang** sebagai suara Surabaya |
| Tempo grid | **120 BPM, 4/4** → 1 bar = 2,0 s → film = **90 bar** tepat |
| Loudness | −14 LUFS, true peak ≤ −3 dBTP |
| Engine | **Remotion** sebagai timeline master; tiap gaya = komponen canvas/WebGL yang murni fungsi dari frame |
| Output | `surabaya-explore-ut.mp4`, `.srt` (ID + EN), `poster.jpg`, `CREDITS`, `build.sh` |

## Brief: TERKUNCI ✅

Semua keputusan sudah diambil; tidak ada pertanyaan terbuka.

- Logo UT · LPPM UT · SENMASTER — dari user; disimpan **lokal** di `brand/`, tidak masuk repo.
- Narasi Indonesia + Suroboyoan; penutup tagline **"Rek, ojo mung liwat! Mampiro, akeh karya apik nang kene!"** (Reels & TV).
- Dua output saja: **Reels 9:16** dan **TV display umum 16:9 Full HD**.
- End card **tanpa** tanggal/tempat/link/IG — cukup judul, tagline, logo. Alamat ditulis **Jl. Dr. Ir. H. Soekarno, Surabaya** (tanpa nomor).
- Tanpa storyboard: langsung produksi setelah style frame lolos cek.
- Suara: TTS untuk draf; rekaman penutur asli opsional untuk final (NASKAH.md).
- Git: semua lokal; push ke GitHub hanya setelah user bilang final.
