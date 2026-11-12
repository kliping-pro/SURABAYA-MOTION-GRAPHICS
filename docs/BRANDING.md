# Branding — UT · LPPM UT · SENMASTER

Logo diberikan user untuk dipakai di film ini (Reels promosi + TV display). File asli ada di `brand/` (**lokal saja, tidak masuk repo**).

| File | Logo | Ukuran asli | Peran |
|---|---|---|---|
| `brand/logo-ut.png` | Universitas Terbuka (globe + buku + pena) | 1366 × 1366 | **Logo utama** institusi |
| `brand/logo-lppm-ut.png` | LPPM — Lembaga Penelitian dan Pengabdian kepada Masyarakat, UT | 2771 × 1199 | Penyelenggara |
| `brand/logo-senmaster.png` | SENMASTER (tangan + empat figur warna) | 1847 × 1847 | Acara / payung tayangan |

> PNG berlatar putih → logo selalu ditaruh di **pelat putih** (aturan §2.3), jadi tidak perlu versi transparan.

## 1. Warna (diambil langsung dari piksel logo)

| Token | Hex | Sumber | Dipakai untuk |
|---|---|---|---|
| `ut-blue` | **#034693** | UT, LPPM | Bar cartouche, kapsul hub UT, aksen judul |
| `ut-yellow` | **#FFDD00** | UT, LPPM | Sorotan kecil (pita "Anda di sini", garis bawah judul) |
| `lppm-grey` | #E6E7E8 | LPPM | Blok latar logo di end card |
| `sen-navy` | **#0E497A** | SENMASTER | Jalur Navy · Rekayasa |
| `sen-sky` | **#2CACE2** | SENMASTER | Jalur Biru · Teknologi (Kalimas) |
| `sen-green` | **#00A54E** | SENMASTER | Jalur Hijau · Ruang Publik |
| `sen-red` | **#E53E31** | SENMASTER | Jalur Merah · Sejarah = **aksen cerita** (titik "Anda di sini") |
| `sen-yellow` | **#F6EC25** | SENMASTER | Jalur Kuning · Arsitektur (terang → rim tinta + angka tinta di bullet) |
| `line-orange` | #F28C28 | tambahan | Jalur Oranye · Alam |
| `line-purple` | #7B4FA2 | tambahan | Jalur Ungu · Budaya |

Kebetulan yang bagus: **empat figur SENMASTER = empat jalur peta pertama.** Film ini secara diam-diam "menggambar logo SENMASTER" lewat jaringannya. Di finale, cincin interchange UT menyebar dengan urutan biru-hijau-merah-kuning seperti figur di logo.

Aturan Transit Map tetap jalan: kertas `#F2EEE5`, tinta `#1B1C1E`, air `#BCD6EA`/`#8FB5D6`. Warna merek hanya masuk lewat **warna jalur** dan **cartouche**, tidak mewarnai kertas atau cahaya.

## 2. Aturan pemakaian logo (tidak bisa ditawar)

1. **Tidak diubah**: tidak di-recolor, distretch, dirotasi, dipotong, diberi efek, outline, atau bayangan. Tidak digambar ulang dengan gaya film (tidak dijadikan sketsa, sablon, low-poly, dll.).
2. **Warna akurat**: logo dirender dengan warna aslinya, **tanpa** multiply tekstur kertas/grain/vignette di atasnya (layer logo dikecualikan dari grade).
3. **Selalu di atas putih atau `lppm-grey`**, dalam "pelat" berbentuk persegi membulat yang tercetak di lembar peta (menjaga aturan STYLE: teks & judul tercetak di peta, bukan melayang).
4. **Clear space** ≥ tinggi huruf "U" pada wordmark di semua sisi.
5. **Ukuran minimum** di layar: UT ≥ 160 px tinggi (Reels) / ≥ 140 px (TV 1080p); LPPM ≥ 90 px tinggi; SENMASTER ≥ 160 px.
6. **Hierarki**: UT (utama) → SENMASTER (acara) → LPPM UT (penyelenggara). Jarak antar-logo sama; dibatasi garis tipis `#1B1C1E` 2 px, atau tanpa garis.
7. Logo **tidak** muncul di 3 detik pertama (hook adalah gerak, bukan logo — GR #3). Pengecualian: TV Display boleh punya *bug* kecil (lihat §3).

## 3. Di mana logo muncul

| Momen | Reels (9:16) | TV Display (16:9) |
|---|---|---|
| S1 — cartouche judul | Pelat kecil logo UT di samping judul "EXPLORE SURABAYA" (tinggi 160 px) | Sama, 140 px |
| S1–S9 | Tidak ada logo (fokus cerita) | **Bug** logo SENMASTER + UT kecil di pojok kanan-atas, opasitas 85 %, 90 px — untuk penonton yang lewat di tengah loop |
| S10 — finale | Pelat ujung di cartouche: **UT · SENMASTER · LPPM UT** + judul akhir + tagline | Sama + tagline besar; ditahan 6 s sebelum loop |
| End hold | 4 s, diam, di downbeat bar 88–90 | 6 s, lalu jembatan loop kembali ke S0 |

## 4. Tagline acara

**"Rek, ojo mung liwat! Mampiro, akeh karya apik nang kene!"** (poster SENMASTER, `ref/poster-senmaster-tagline.jpg`).
Di film: pelat cartouche **`#034693`** dengan huruf **`#FFDD00`**, Inter 900 italic, dua baris. Menggemakan warna poster (kuning di atas biru) tanpa meniru hurufnya. Poster juga memakai Tugu Pahlawan + siluet kota biru → film sudah sejalan (S2 Tugu, S8 Suramadu, S7 Sura & Baya).

## 5. Tipografi pendamping

Logo UT memakai sans geometris tipis; LPPM & SENMASTER sans tebal. Film tetap memakai **Inter** (Transit Map), dengan judul `EXPLORE SURABAYA` di Inter 800 — tidak meniru huruf logo, tidak ada wordmark tiruan.
