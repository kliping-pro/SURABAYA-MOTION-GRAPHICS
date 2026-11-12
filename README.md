# SURABAYA-MOTION-GRAPHICS

**EXPLORE SURABAYA: Kampus Kita Seluas Kota** adalah film motion graphic berdurasi kira-kira 3 menit untuk **Universitas Terbuka (UT) Surabaya** (Jl. Dr. Ir. H. Soekarno, MERR), dibuat untuk acara **SENMASTER: Gelar Hasil** (LPPM UT).

> *"Rek, ojo mung liwat! Mampiro, akeh karya apik nang kene!"*

- **Dua output dari satu sumber:** Reels 9:16 (1080×1920, ada narasi dan subtitle) serta TV display 16:9 (1920×1080, jelas tanpa suara, bisa di-loop).
- **Gaya:** satu lembar peta **Transit Map** sebagai tulang punggung, ditambah **8 jendela gaya tamu** (Satellite Briefing, Projection on White Model, Urban Sketch, Isometric Infographic, Tilt-Shift, Silkscreen Poster, Low-poly Island, Paper-cut Lightbox).
- **Dibuat dengan [Lemo-Opuscar](https://github.com/kliping-pro/lemo-opuscar)**, library gaya film berbasis kode. Ini bukan Remotion. Setiap section adalah halaman web `render(t)` yang dirender frame demi frame (alasannya ada di [`docs/STYLES.md`](docs/STYLES.md)).
- **Status:** semua section sudah v2 dan sedang dalam **audit per section**. Film belum digabung final (lihat [`docs/ROADMAP.md`](docs/ROADMAP.md)).

## Dokumentasi

| Dokumen | Isi |
|---|---|
| [`docs/KETENTUAN.md`](docs/KETENTUAN.md) | **Rules dan ketentuan**: brief terkunci, aturan emas ringkas, kontrak teknis halaman, aset dan hak, alur audit |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | **Roadmap dan tujuan per section S0–S10** (plus ekor TV), status tiap section, durasi, dan pekerjaan berikutnya |
| [`docs/STYLES.md`](docs/STYLES.md) | **Gaya yang dipakai**: peran Lemo-Opuscar, engine yang disalin per gaya, tata bahasa transisi, palet |
| [`docs/GOLDEN-RULES.md`](docs/GOLDEN-RULES.md) | 12 aturan emas versi lengkap |
| [`docs/SECTIONS.md`](docs/SECTIONS.md) | Rencana detik demi detik: shot, kamera, sound per section |
| [`docs/NASKAH.md`](docs/NASKAH.md) | Naskah VO Suroboyoan + EN, teks layar, dan tagline |
| [`docs/BRANDING.md`](docs/BRANDING.md) | Aturan logo UT · LPPM UT · SENMASTER dan warna |
| [`docs/FACTS.md`](docs/FACTS.md) · [`docs/RESEARCH.md`](docs/RESEARCH.md) | Fakta di layar beserta sumbernya, dan riset kota |
| [`docs/TREATMENT.md`](docs/TREATMENT.md) | Tiga kandidat struktur dan pilihan akhirnya |
| [`docs/arsip/`](docs/arsip/) | Roadmap awal (rencana Remotion) dan README produksi v1, sebagai sejarah keputusan |
| [`CREDITS`](CREDITS) | Lisensi semua aset pihak ketiga |

## Struktur repo

```
map/          Transit Map (spine): net.js (jaringan), timeline.js (sumber waktu: jendela, kamera, VO, subtitle, end card), film.js + gl.js (engine)
sat/          S0 orbit Selat Madura · S8 Suramadu 5.438 m         (Satellite Briefing)   ?shot=S0|S8
whitemodel/   S2 Tugu Pahlawan                                     (Projection on White Model)
sketch/       S3 Kota Lama: Gedung Cerutu, Museum BI, Rumah Abu Han (Urban Sketch)
iso/          S4 Monumen Kapal Selam                               (Isometric Infographic)
tilt/         S5 Jalan Tunjungan                                   (Tilt-Shift Miniature)
silk/         S6 enam kartu pos kota                               (Silkscreen Travel Poster)
lowpoly/      S7 Kebun Binatang + Sura & Baya                      (Low-poly Island)
lantern/      S9 malam di Kya-Kya                                  (Paper-cut Lightbox)
audio/mix.py  skor + foley sintetis, mix −14 LUFS
voice/        narasi sementara (espeak-ng)
assemble.py   perakitan: spine + jendela + subtitle + logo TV + audio
docs/         dokumentasi
```

Setiap folder section punya `index.html` (versi terbaru) dan `index_v1.html` (versi pertama, untuk pembanding).

## Cara pakai

Prasyarat: **Node 20+**, **Python 3.11+**, **ffmpeg**, dan (untuk suara sementara) **espeak-ng**.

```sh
# 1. sekali saja: clone library Lemo-Opuscar ke vendor/ dan pasang dependensinya
sh setup.sh
#    (sudah punya clone library? LIB=/path/ke/lemo-opuscar sh setup.sh)

# 2. aset lokal yang tidak ada di repo
#    brand/logo-ut.png  brand/logo-senmaster.png  brand/logo-lppm-ut.png   ← dari klien
#    citra satelit & data bangunan: sh setup.sh geo  (lalu build.sh mengambilnya otomatis)

# 3. audit satu section (klip tanpa suara, atau still)
sh render_section.sh S2 tv            # → audit/S2_tv.mp4
sh render_section.sh S9 reels "2 5 8" # → audit/S9_reels_2.jpg …
sh render_section.sh spine tv         # peta penuh (jendela placeholder)

# 4. film utuh (setelah semua section lolos audit)
sh build.sh            # Reels + TV
sh build.sh reels      # satu format
```

Library dicari otomatis di urutan berikut: `$LIB`, lalu `vendor/lemo-opuscar`, lalu `../lemo-opuscar` (clone berdampingan), lalu `../..` (jika repo ini ditaruh di `lemo-opuscar/films/<nama>/`). Lihat `lib.sh`.

## Lisensi dan hak

- Kode engine dari Lemo-Opuscar berlisensi MIT (`LICENSES/LEMO-OPUSCAR-MIT.txt`). Font berlisensi SIL OFL 1.1 (teks lisensi ada di setiap folder `fonts/`).
- Citra: Copernicus Sentinel-2. Bangunan: Google Open Buildings v3 (CC BY 4.0).
- **Logo UT, LPPM UT, dan SENMASTER milik pemiliknya masing-masing.** Logo tidak disimpan di repo ini dan hanya dipakai untuk acara UT.
