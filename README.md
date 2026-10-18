# 🌤️ CuacaKu — Prakiraan Cuaca Interaktif Real-Time

Website prakiraan cuaca interaktif yang menggunakan data real-time dari [Open-Meteo API](https://open-meteo.com/). Dibuat dengan HTML, CSS, dan JavaScript murni — tanpa build step, tanpa API key.

## ✨ Fitur

- 🎨 **Tema reaktif cuaca** — warna & latar animasi (hujan, salju, bintang, awan, petir) berubah sesuai kondisi cuaca dan siang/malam
- 🌡️ **Cuaca real-time** — suhu, terasa seperti, kelembapan, angin (kompas), UV, curah hujan, tekanan, jarak pandang
- 🌅 **Busur matahari** — posisi matahari saat ini, terbit/terbenam, durasi siang
- 📅 **Prakiraan 7 hari** — kartu interaktif dengan panel detail per hari
- 📊 **Grafik interaktif** — tab Suhu / Hujan / Angin / Kelembapan dengan tooltip (Canvas API)
- ⏰ **Prakiraan per jam** — 24 jam ke depan
- 🗺️ **Peta lokasi** — Leaflet + tile Esri (tanpa API key), klik peta untuk ganti lokasi
- 🔍 **Pencarian kota** — autocomplete seluruh dunia (tekan `/` untuk fokus)
- 📍 **Geolokasi** & 🌡️ **toggle °C/°F** (tersimpan di browser)
- 📖 **Edukasi forecasting** — stepper 4 tahap, simulator ketidakpastian, FAQ
- 🔄 **Auto-refresh** setiap 10 menit
- 📱 **Responsive** & mendukung *reduced motion*

## 🚀 Deploy ke GitHub Pages (tanpa Git)

1. Buka repository `cuacaku` di GitHub
2. Klik **Add file → Upload files**
3. Seret file `index.html`, `style.css`, `script.js`, dan `README.md`
4. Klik **Commit changes** (file lama otomatis tertimpa)
5. Pastikan **Settings → Pages → Branch: `main` / `(root)`**
6. Tunggu 1–2 menit, lalu buka `https://USERNAME.github.io/cuacaku/`
   dan tekan **Ctrl + Shift + R** (hard refresh) agar versi baru termuat

## 🔧 Teknologi

| Komponen | Teknologi |
|----------|-----------|
| Struktur | HTML5 Semantik |
| Styling | Vanilla CSS (glassmorphism, tema dinamis) |
| Logika | JavaScript (ES6+) |
| Data Cuaca | [Open-Meteo Forecast API](https://open-meteo.com/) |
| Geocoding | [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api), BigDataCloud (reverse) |
| Peta | [Leaflet](https://leafletjs.com/) + Esri tiles |
| Grafik | Canvas API (tanpa library) |
| Hosting | GitHub Pages |

## 📝 Catatan

- **Tidak memerlukan API key** — semua layanan gratis & terbuka
- **Tidak memerlukan build step / server** — berjalan 100% di browser

## 📄 Lisensi

MIT License — Bebas digunakan dan dimodifikasi.
