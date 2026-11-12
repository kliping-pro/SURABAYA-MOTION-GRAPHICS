# KETENTUAN — aturan main film *Explore Surabaya · Kampus Kita Seluas Kota*

Dokumen ini merangkum **semua aturan dan ketentuan** proyek dalam satu tempat. Kalau ada keputusan yang melanggar salah satu aturan di sini, keputusannya yang diganti, bukan aturannya.
Penjelasan panjang tiap aturan emas ada di [`GOLDEN-RULES.md`](GOLDEN-RULES.md). Logo ada di [`BRANDING.md`](BRANDING.md), fakta di [`FACTS.md`](FACTS.md), dan naskah di [`NASKAH.md`](NASKAH.md).

---

## 1. Brief yang terkunci

| Item | Ketentuan |
|---|---|
| Klien / konteks | **Universitas Terbuka (UT) Surabaya**, Jl. Dr. Ir. H. Soekarno (MERR), untuk acara **SENMASTER: Gelar Hasil** (LPPM UT) |
| Judul | **EXPLORE SURABAYA**, dengan subjudul *Kampus Kita Seluas Kota* |
| Output 1: Reels | 1080 × 1920 (9:16), 30 fps, **180 s**, ada narasi dan subtitle |
| Output 2: TV display | 1920 × 1080 (16:9), 30 fps, **188 s** (180 + 6 s end hold + 2 s jembatan loop). **Harus jelas tanpa suara** dan **bisa di-loop** tanpa frame hitam |
| Bahasa | Narasi Indonesia campur **Suroboyoan ngoko**: hangat dan blak-blakan, tidak kasar. Teks utama Indonesia, baris kedua English |
| Tagline penutup | ***"Rek, ojo mung liwat! Mampiro, akeh karya apik nang kene!"*** di kedua format |
| End card | Judul, tagline, dan logo **UT · SENMASTER · LPPM UT**. Tanpa tanggal, tempat, link, atau IG. Alamat ditulis *Jl. Dr. Ir. H. Soekarno, Surabaya* tanpa nomor |
| Storyboard | Tidak dipakai. Alurnya: style frame → produksi → audit per section |

## 2. Aturan emas (ringkas)

| # | Aturan | Artinya di lapangan |
|---|---|---|
| 1 | **Satu peta, satu tulang punggung** | Seluruh film hidup di satu lembar peta **Transit Map**. Delapan gaya lain hanyalah *jendela* yang terbuka dari sebuah stasiun dan kembali ke peta |
| 2 | **Kampus kita seluas kota** | Tiap landmark = satu "mata kuliah". Semua jalur berangkat dari dan pulang ke stasiun **UT Surabaya** |
| 2b | **Ngomong koyok arek Suroboyo** | Setiap baris Jawa dicek penutur asli sebelum final |
| 3 | **Hook ≤ 3 detik, akhir yang menggema** | Frame pertama sudah bergerak (satelit menukik). Film ditutup dengan jaringan utuh plus cartouche judul |
| 4 | **STYLE.md tiap gaya itu hukum** | Di dalam jendelanya, gaya tamu memegang semua invariannya. Dua gaya tidak dicampur dalam satu frame, kecuali di frame transisi |
| 5 | **Delapan arah, satu jari-jari** | Geometri peta hanya 0°, 45°, dan 90°. Suramadu digambar sebagai jalur biasa di atas air (bukan dashed) |
| 6 | **Transisi lahir dari medium** | Tidak ada crossfade, wipe generik, atau fade-to-black di tengah film. Masuk dan keluar jendela memakai **match-cut bentuk bulat**: titik stasiun ↔ reticle, lensa, matahari, periskop, lampu, cap tinta, lampion |
| 7 | **Presisi = ukuran terukur** | Teks Reels ≥ 36 px (baris utama) dan ≥ 22 px (baris kedua). Safe zone Reels: 220 px di atas dan 380 px di bawah bebas teks penting |
| 8 | **Suara adalah setengah film** | Setiap aksi yang terlihat punya bunyi. Minimal **2 hening** (sebelum 1945 dan sebelum finale) dan minimal **2 J-/L-cut** |
| 9 | **Grid musik duluan** | **120 BPM, 1 bar = 2 s.** Cut, landing, odometer, dan subtitle jatuh di beat |
| 10 | **Tempo bervariasi** | Ada akselerasi (poster sablon), ada perlambatan (Tugu 1945), dan ada satu long take (finale). Waktu baca = huruf ÷ 15 + 1,5 s |
| 10b | **Dua layar, satu film** | Subjek di zona aman bersama (1080 × 1080 di tengah). Setiap info penting dari VO juga tercetak di layar untuk TV |
| 11 | **Fakta diperiksa, karya orang tidak dijiplak** | Angka di layar butuh ≥ 2 sumber di `FACTS.md`. Ilustrasi peta dari user hanya referensi daftar tempat dan tidak di-trace |
| 12 | **Bukan demo, bukan tutorial** | `DEMO.md` gaya hanya dibaca untuk teknik. Tidak ada kredit atau watermark LemoLab di film |

## 3. Ketentuan teknis (kontrak halaman)

Setiap section adalah **satu halaman web** yang dirender frame demi frame oleh pipeline Lemo-Opuscar (lihat [`STYLES.md`](STYLES.md) §2):

1. Halaman mengekspor `window.render(t)` (t dalam detik), `window.DUR`, `window.READY`, dan opsional `window.EV` (event suara) serta `window.TEXTS` (teks untuk cek waktu baca).
2. **Deterministik.** Gambar = f(t) murni. Tidak boleh ada `Math.random()` tanpa seed, `Date.now()`, animasi CSS, atau `requestAnimationFrame`. Render paralel bergantung pada aturan ini.
3. **Satu halaman, dua format.** Format dipilih lewat `?fmt=reels|tv`. Bingkai virtual `VW = 1080 × lebar ÷ tinggi`, sehingga komposisi di-reframe per format, bukan di-crop.
4. Font dimuat dari folder `fonts/` di halaman itu sendiri (OFL, lisensi ikut disertakan). Tidak ada font dari CDN.
5. Logo dirender di lapisan paling atas, **tanpa grade, grain, atau vignette**, dari PNG asli (BRANDING.md).
6. Audio: skor, foley, dan VO dirender terpisah (`audio/mix.py`), lalu loudness **−14 LUFS** dengan true peak **≤ −3 dBTP**.
7. Perakitan memakai `assemble.py`: tiap potongan jadi file sendiri lalu digabung dengan concat demuxer ffmpeg (filter_complex panjang kehabisan memori). Subtitle ASS dibakar lewat libass.
8. **Jangan edit `core/` atau `styles/` di library.** Semua yang dipakai film ini sudah disalin ke repo ini.

## 4. Aset dan hak

| Aset | Ketentuan |
|---|---|
| Logo UT, LPPM UT, SENMASTER | Dari klien, hanya untuk acara UT. Dipakai **persis aslinya**: tidak di-recolor dan tidak digambar ulang. Disimpan **lokal** di `brand/` (`logo-ut.png`, `logo-senmaster.png`, `logo-lppm-ut.png`) dan **tidak di-commit** |
| Referensi dari user (peta ilustrasi, poster acara) | Lokal di `ref/` dan tidak di-commit. Hanya untuk referensi |
| Citra satelit | Copernicus Sentinel-2 L2A (bebas dan terbuka). File `sat/imagery/*.jpg` tidak di-commit; ambil ulang dengan `sat/tools/fetch_s2.py` |
| Jejak bangunan (White Model) | Google Open Buildings v3, **CC BY 4.0**. `whitemodel/model.json` (turunan, kecil) di-commit; data mentah diambil ulang dengan `fetch_buildings.sh` |
| Font | Semua **SIL OFL 1.1**, dengan teks lisensi di setiap folder `fonts/` |
| Kode library | Lemo-Opuscar, **MIT** (`LICENSES/LEMO-OPUSCAR-MIT.txt`) |
| Merek pihak ketiga | **Dilarang** tampil di layar (bank, operator bus, dan sebagainya) |
| Peta | Tercetak kecil di cartouche: *Peta wisata ilustratif — bukan rute transportasi resmi* |

## 5. Ketentuan kerja (alur audit)

1. **Audit per section.** Setiap section direvisi dan diaudit sendiri-sendiri (`sh render_section.sh S2 tv`) sebelum film digabung.
2. **Belum merge final.** Penggabungan (`build.sh`) baru dijalankan setelah semua section lolos audit dan durasi disetujui (lihat [`ROADMAP.md`](ROADMAP.md) §3).
3. Versi lama setiap jendela disimpan sebagai `index_v1.html` plus file `*.js` v1 untuk pembanding. `index.html` selalu menunjuk versi terbaru.
4. Hasil render (`parts/`, `audit/`, `*.mp4`) tidak di-commit. Semuanya dibuat ulang dari kode.
5. Narasi saat ini adalah **suara sementara** (espeak-ng). Versi final idealnya rekaman penutur asli Surabaya (NASKAH.md).
