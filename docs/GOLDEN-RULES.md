# Golden Rules — Explore Surabaya × UT Surabaya

12 aturan. Kalau ada keputusan yang melanggar salah satunya, keputusannya yang diganti, bukan aturannya.

---

## A. Konsep

### 1. Satu peta, satu tulang punggung
Seluruh film hidup di **satu lembar peta Transit Map** yang dicetak di atas kertas, tergeletak di meja gelap. Delapan gaya lain **bukan film terpisah** yang ditempel: mereka adalah **jendela** yang terbuka *dari* stasiun di peta dan *kembali ke* stasiun di peta. Penonton tidak pernah "tersesat": setelah tiap jendela, kita selalu pulang ke lembar yang sama, dengan jaringan yang sudah tumbuh sedikit.

### 2. Kampus kita seluas kota
Ide pusat: UT adalah universitas **terbuka** — belajar dari mana saja. Maka kota adalah kampusnya, tiap landmark adalah satu "mata kuliah" (Sejarah, Arsitektur, Budaya, Teknologi, Alam, Rekayasa). Semua jalur berangkat dari dan **pulang ke stasiun UT Surabaya** di Jl. Dr. Ir. H. Soekarno (MERR). Satu subjek, satu tujuan, satu belokan (DIRECTOR §3).

### 2b. Ngomong koyok arek Suroboyo
Narasi Indonesia campur **Suroboyoan ngoko**: hangat, blak-blakan, tidak kasar. Film **ditutup dengan tagline acara**: *"Rek, ojo mung liwat! Mampiro, akeh karya apik nang kene!"* — di Reels sebagai ajakan, di TV sebagai sapaan untuk orang yang lewat. Setiap baris Jawa dicek penutur asli (NASKAH.md).

### 3. Hook ≤ 3 detik, akhir yang menggema
Detik pertama sudah bergerak (zoom satelit menukik ke Selat Madura). Tidak ada logo pembuka pelan. Film **ditutup dengan seluruh jaringan terlihat utuh** dan judul akhir tercetak di cartouche peta — menggemakan titik "Anda di sini" di pembukaan.

## B. Gaya & visual

### 4. STYLE.md tiap gaya itu hukum
Di dalam jendelanya, tiap gaya memegang **semua** invariannya sendiri (warna, material, kamera, suara). Kita tidak mencampur dua gaya dalam satu frame, kecuali di **frame transisi** (Rule 6). Ringkasnya:

| Gaya | Invarian yang paling gampang dilanggar |
|---|---|
| Transit Map | Garis cuma 0°/45°/90°; tulisan tercetak di kertas, bukan overlay; kamera miring + depth of field (jangan top-view terus) |
| Satellite Briefing | Citra satelit asli, di-grade abu analis, garis ukur putih tipis; satu zoom kontinu |
| Projection on White Model | Model putih **tidak pernah berubah**; hanya cahaya proyektor yang berubah |
| Urban Sketch | Garis sepia goyang & tak menutup; cat air keluar garis; kertas cold-press krem |
| Paper-cut Lightbox | 6–9 lapis kertas, cahaya dari belakang, bayangan antar lapis |
| Silkscreen Poster | 4–6 tinta flat, tanpa gradien, celah registrasi; satu lapis = satu ketukan |
| Isometric Infographic | Blok tiga-tone, label tinta tipis, angka digambar (Isotype), benda **terbuka** memperlihatkan isi |
| Tilt-Shift | Tempat yang tampak nyata dilihat dari atas + lensa miring + time-lapse = jadi maket |
| Low-poly Island | Lensa ortografis isometrik, semua blok, tiap yang muncul memantul **dan berbunyi satu nada** |

### 5. Delapan arah, satu jari-jari
Semua geometri peta (jalur, Kalimas, garis pantai Selat Madura) cuma 0/45/90° dengan satu fillet radius. Kalimas = pita biru datar, Selat Madura = area biru. Suramadu = jalur biasa di atas air (jembatan), **bukan** dashed (dashed = terowongan).

### 6. Transisi lahir dari medium, bukan dari plugin
Tidak ada crossfade default, wipe generik, atau fade-to-black di tengah film. Satu tata bahasa transisi untuk seluruh film:
- **Masuk jendela**: *match-cut bentuk bulat* — titik stasiun putih (r 0,085 G) membesar dan menjadi benda bulat di gaya tamu (lensa proyektor, matahari cat air, lampion, bulan, lubang periskop, cap sablon…).
- **Keluar jendela**: benda bulat terakhir di jendela mengecil kembali menjadi titik stasiun berikutnya, pen-tip langsung melanjutkan gambar.
- Transisi di-cut **tepat di downbeat bar** (Rule 9).

### 7. Presisi = ukuran yang terukur
- Teks yang harus dibaca: baris utama ≥ **20 px**, baris kedua ≥ **12 px** pada tinggi 1080 → di 1080×1920 kita pakai **≥ 36 px / ≥ 22 px** (skala lebar layar).
- Safe zone Reels: atas 220 px & bawah 380 px (UI IG) **kosong dari teks penting**; subtitle di 1.300–1.480 px dari atas.
- Subjek di momen kunci mengisi ≥ 1/3 tinggi frame.
- Semua komposisi dicek di ukuran HP (lihat ROADMAP §QA).

## C. Waktu, suara, rasa

### 8. Suara adalah setengah film
Tiga lapis: ambience (pelabuhan, lalu lintas MERR, burung KBS), foley (pen-tip mendesis di kertas, kapsul interchange jatuh, sobekan kertas lightbox, raclette sablon), musik. **Setiap aksi yang terlihat punya bunyi.** Minimal **dua hening** (sebelum 10 November 1945 dan sebelum finale UT). Minimal **dua J-/L-cut** sebagai transisi suara.

### 9. Grid musik duluan, gambar mengunci ke grid
120 BPM, bar = 2 s. Setiap cut, landing kapsul, landing angka odometer, dan awal subtitle jatuh di beat. Arransemen tumbuh **dengan menambah suara per jalur** (bukan menaikkan tempo): tiap jalur baru = satu instrumen baru di ostinato. Motif: **chime dua nada stasiun**, kembali di setiap belokan cerita.

### 10. Tempo bervariasi, beri napas
Bukan 3 menit kecepatan rata. Ada akselerasi (montase poster sablon), ada perlambatan (white model 1945), ada **satu long take** (low sweep atas jaringan saat finale). Waktu baca: (huruf ÷ 15 + 1,5) s; subtitle ≥ 1,8 s dan ≥ durasi ucapan + 0,6 s.

### 10b. Dua layar, satu film
Setiap shot dirancang untuk **9:16 dan 16:9 sekaligus**: subjek di tengah "zona aman bersama" (area 1080 × 1080 di tengah kedua format), lalu kamera tiap format membingkai ulang (Transit Map: aim point & zoom per format; jendela tamu: crop/lebar kamera per format). **TV harus terbaca tanpa suara**: setiap informasi penting dari VO juga ada sebagai teks tercetak; dan film harus **bisa di-loop** tanpa frame hitam.

## D. Kebenaran & hak

### 11. Fakta diperiksa, karya orang tidak dijiplak
- Setiap angka/tanggal di layar ada di `FACTS.md` dengan **≥ 2 sumber** (pemerintah/pengelola dulu, pers, ensiklopedia terakhir). Yang belum pasti → tidak tampil, atau tampil dengan definisinya.
- Peta di film adalah **peta wisata tematik**, bukan peta transportasi resmi → tercetak kecil di cartouche: *"Peta wisata ilustratif — bukan rute transportasi resmi"*.
- **Ilustrasi "Explore Surabaya" dari user hanya referensi** daftar tempat. Kita tidak men-trace ikon, huruf, atau layout-nya; semua digambar ulang dalam tata bahasa masing-masing gaya.
- Logo **UT, LPPM UT, SENMASTER** diberikan user untuk acara UT sendiri → dipakai **persis seperti aslinya**, sesuai BRANDING.md (tidak di-recolor, tidak digambar ulang dengan gaya film). Tidak ada merek/logo pihak ketiga (bank, operator bus, dsb.) di layar.

### 12. Bukan demo lagi, dan bukan tutorial
`DEMO.md` tiap gaya **baru dibaca setelah TREATMENT.md selesai**, hanya untuk belajar teknik (engine kertas, rig, shader, mix). Minimal 4 dari 6 hal (struktur, opening, signature shot, jalur kamera, bentuk skor, ending) harus berbeda dari demo Transit Map "6 Kilometres". Tidak ada kredit/watermark LemoLab di film ini.
