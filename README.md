# 🌤️ CuacaKu — Prakiraan Cuaca Interaktif Real-Time

Website prakiraan cuaca interaktif yang menggunakan data real-time dari [Open-Meteo API](https://open-meteo.com/). Dibuat dengan HTML, CSS, dan JavaScript murni — tanpa framework, tanpa API key.

## ✨ Fitur

- 🌡️ **Cuaca Real-Time** — Suhu, kelembapan, angin, tekanan udara, UV index
- ⏰ **Prakiraan Per Jam** — 24 jam ke depan dengan grafik interaktif
- 📅 **Prakiraan 7 Hari** — Suhu min/maks dengan bar visual
- 📊 **Grafik Canvas** — Visualisasi suhu tanpa library eksternal
- 🔍 **Pencarian Kota** — Autocomplete dari seluruh dunia
- 📍 **Geolokasi** — Deteksi lokasi otomatis
- 🌅 **Info Matahari** — Terbit, terbenam, durasi siang, animasi posisi matahari
- 📖 **Edukasi** — Penjelasan cara kerja forecasting cuaca
- 📱 **Responsive** — Tampilan optimal di desktop & mobile
- 🎨 **Glassmorphism UI** — Desain modern dengan animasi halus

## 🚀 Deploy ke GitHub Pages

### Langkah 1: Buat Repository di GitHub

1. Buka [github.com](https://github.com) dan login
2. Klik tombol **"+"** di pojok kanan atas → **"New repository"**
3. Isi nama repository, misalnya: `cuacaku`
4. Pilih **Public**
5. **JANGAN** centang "Add a README file" (karena kita sudah punya)
6. Klik **"Create repository"**

### Langkah 2: Push Kode ke GitHub

Buka terminal di folder project ini, lalu jalankan:

```bash
# Inisialisasi git (jika belum)
git init

# Tambahkan semua file
git add .

# Commit
git commit -m "Initial commit: CuacaKu weather app"

# Tambahkan remote (ganti USERNAME dengan username GitHub Anda)
git remote add origin https://github.com/USERNAME/cuacaku.git

# Push ke GitHub
git branch -M main
git push -u origin main
```

### Langkah 3: Aktifkan GitHub Pages

1. Buka repository Anda di GitHub
2. Klik tab **"Settings"** (⚙️)
3. Di sidebar kiri, klik **"Pages"**
4. Di bagian **"Source"**, pilih:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
5. Klik **"Save"**
6. Tunggu 1-2 menit

### Langkah 4: Akses Website Anda! 🎉

Website Anda akan tersedia di:

```
https://USERNAME.github.io/cuacaku/
```

Ganti `USERNAME` dengan username GitHub Anda.

## 🔧 Teknologi

| Komponen | Teknologi |
|----------|-----------|
| Struktur | HTML5 Semantik |
| Styling | Vanilla CSS (Glassmorphism) |
| Logika | JavaScript (ES6+) |
| Data Cuaca | [Open-Meteo API](https://open-meteo.com/) |
| Geocoding | [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api) |
| Grafik | Canvas API (tanpa library) |
| Hosting | GitHub Pages |

## 📝 Catatan

- **Tidak memerlukan API key** — Open-Meteo API gratis dan terbuka
- **Tidak memerlukan build step** — Semua file statis, langsung bisa di-deploy
- **Tidak memerlukan server** — Berjalan 100% di browser

## 📄 Lisensi

MIT License — Bebas digunakan dan dimodifikasi.
