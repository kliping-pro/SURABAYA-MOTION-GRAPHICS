# STYLES — gaya yang dipakai, dan hubungannya dengan Lemo-Opuscar

## 1. Ya, film ini dibuat dengan Lemo-Opuscar

**Lemo-Opuscar** adalah library gaya film: setiap gaya punya `STYLE.md` (aturan tampilan) dan satu demo film yang dibuat sepenuhnya dengan kode. Repo library: [kliping-pro/lemo-opuscar](https://github.com/kliping-pro/lemo-opuscar), lisensi MIT.

Film ini memakai Lemo-Opuscar dalam tiga cara:

| Bagian | Dari library | Di repo ini |
|---|---|---|
| **Aturan gaya** | `styles/<slug>/STYLE.md` (invarian: warna, material, kamera, suara, transisi) | Dipatuhi di dalam setiap jendela (KETENTUAN.md aturan #4) |
| **Engine gaya** | Kode demo tiap gaya (kertas, kuas, tinta, shader, rig) | **Disalin dan diadaptasi** ke folder section (tabel §3). Cerita, shot, dan timeline demo **tidak** dipakai |
| **Pipeline render** | `core/render/` (server lokal, Chromium headless, frame-per-frame ke ffmpeg), `core/audio/` (sfx, sampler), `core/lib.js` (easing & helper yang di-import halaman), three.js | **Tidak disalin**: dipanggil dari clone library (`$LIB`). `setup.sh` menyiapkannya |

## 2. Kenapa bukan Remotion

Rencana awal memakai Remotion ([arsip](arsip/ROADMAP-AWAL-REMOTION.md)). Produksi akhirnya memakai pipeline bawaan Lemo-Opuscar karena:
- **Sama-sama deterministik.** Halaman mengekspor `render(t)` dan dirender per frame, jadi hasilnya identik setiap kali.
- **Engine gaya library sudah berbentuk halaman web `render(t)`.** Engine bisa langsung dipakai tanpa di-port ke React.
- **Tanpa urusan lisensi.** Remotion mewajibkan Company License untuk organisasi dengan lebih dari 3 orang; pipeline ini MIT.
- Arsitekturnya tetap sama dengan rencana: satu engine per gaya, section hanya berisi data dan kamera, dan satu timeline (`map/timeline.js`) sebagai sumber waktu.

Alurnya:

```
halaman section (index.html + *.js)  --render(t)-->  core/render/video.mjs (Chromium, 30 fps)  -->  parts/<fmt>/Sx.mp4
map/timeline.js (VO, cue)  -->  voice/scratch_vo.py + audio/mix.py  -->  audio/mix_<fmt>.wav (−14 LUFS)
assemble.py: spine + jendela (concat demuxer) + subtitle ASS + logo TV + audio  -->  surabaya-explore-ut_<fmt>.mp4
```

## 3. Sembilan gaya: gaya utama dan delapan jendela

| Gaya (gallery) | 中文 | Slug library | Section | Folder | Engine yang disalin dari library | Invarian yang paling dijaga |
|---|---|---|---|---|---|---|
| **Transit Map** *(utama)* | 地铁线路图 | `transit-map` | S1, S10, semua perjalanan, ekor TV | `map/` | `demo/film.js` (diadaptasi untuk aspek mana pun) + `demo/gl.js` | Garis hanya 0/45/90°; teks tercetak di kertas; pen-tip menggambar jalur; interchange "jatuh" |
| Satellite Briefing | 卫星简报 | `satellite-briefing` | S0, S8 | `sat/` | Tidak ada; ditulis baru (`sat.js`) mengikuti STYLE.md, dengan citra Sentinel-2 asli | Citra asli dengan grade abu analis; garis ukur putih tipis; satu zoom kontinu |
| Projection on White Model | 白模投影 | `white-model` | S2 | `whitemodel/` | Tidak ada; ditulis baru (`wm.js`, three.js), dengan data Google Open Buildings | Model putih tidak pernah berubah; hanya cahaya proyektor |
| Urban Sketch · Pen & Wash | 钢笔淡彩 | `urban-sketch` | S3 | `sketch/` | `demo/engine.js` (compositor, arrivalField, rasterPen) | Garis sepia goyang dan tak menutup; cat air keluar garis; kertas krem |
| Isometric Infographic | 等距信息图 | `iso-infographic` | S4 | `iso/` | `demo/engine.js` (solid tiga-tone, silinder, pin, Isotype) | Isometrik sejati 30°, tanpa outline; benda terbuka memperlihatkan isi |
| Tilt-Shift Miniature | 移轴微缩 | `tilt-shift` | S5 | `tilt/` | `demo/post.js`, `geo.js`, `city.js` → `lib/` | Tempat nyata dari atas, lensa miring, dan time-lapse menjadi maket |
| Silkscreen Travel Poster | 丝印旅行海报 | `silkscreen-poster` | S6 | `silk/` | `demo/engine/silk.js` | 4–6 tinta flat tanpa gradien, celah registrasi, satu lapis per ketukan |
| Low-poly Isometric Island | 低多边形等距 | `lowpoly-island` | S7 | `lowpoly/` | `demo/post.js`, `sea.js` → `lib/` | Ortografis isometrik, semua blok; setiap kemunculan memantul dan berbunyi |
| Paper-cut Lightbox | 纸雕灯影 | `paper-lantern` | S9 | `lantern/` | `demo/src/` `lib.js`, `paper.js`, `stage.js`, `post.js` | 6–9 lapis kertas, cahaya dari belakang, bayangan antar lapis |

Setiap file engine yang disalin memuat komentar asalnya di baris pertama. Lisensi library ada di `LICENSES/LEMO-OPUSCAR-MIT.txt`. Sesuai aturan library untuk film milik user, **tidak ada kredit atau watermark LemoLab di dalam film**.

## 4. Tata bahasa transisi (perekat sembilan gaya)

Semua jendela masuk dan keluar lewat **bentuk bulat yang sama dengan titik stasiun** di peta, sehingga sembilan gaya terasa satu film:

| Section | Masuk dari titik stasiun → | Keluar → titik stasiun |
|---|---|---|
| S0 | (pembuka) | reticle |
| S2 | lensa proyektor | lensa proyektor |
| S3 | matahari pagi | cipratan cat |
| S4 | lubang periskop | periskop |
| S5 | lampu lalu lintas | lampu hijau |
| S6 | potongan keras di downbeat | cap tinta (registration mark) |
| S7 | matahari sore | matahari |
| S8 | reticle | reticle |
| S9 | lampion | lampion terakhir |

## 5. Palet jalur (BRANDING.md)

Merah `#E53E31` (Sejarah) · Kuning `#F6EC25` (Arsitektur) · Biru `#2CACE2` (Teknologi) · Hijau `#00A54E` (Ruang Publik) · Oranye `#F28C28` (Alam) · Navy `#0E497A` (Rekayasa) · Ungu `#7B4FA2` (Budaya). Hub UT berupa kapsul dengan outline `#034693`. Tagline memakai huruf kuning di atas pelat biru UT.
