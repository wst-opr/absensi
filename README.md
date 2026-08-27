# Wingsati — Manajemen Absensi & Cuti (PWA)

Aplikasi web progresif untuk manajemen absensi, cuti, dan ketidakhadiran karyawan.
Bisa diinstal di HP seperti aplikasi native dan berfungsi offline.

## Struktur File
```
absensi/
├── index.html          # Halaman utama
├── style.css           # Stylesheet (responsive + dark mode)
├── script.js           # Logic aplikasi + PWA install prompt
├── sw.js               # Service Worker (caching & offline)
├── manifest.json       # Konfigurasi PWA
├── wingsati logo vertikal.png  # Icon/logo
└── DEPLOYMENT.md       # Panduan deploy
```

## Cara Menjalankan Lokal
Buka `index.html` di browser, atau gunakan local server:
```bash
# Python
python -m http.server 8000

# Node (npx)
npx serve .
```
Lalu buka `http://localhost:8000`

> Catatan: Service Worker butuh HTTPS atau `localhost` untuk aktif.

## Deployment ke Hosting Gratis

### Opsi 1: GitHub Pages
1. Buat repo di GitHub, upload semua file ini
2. Settings → Pages → Source: `main` branch
3. Akses: `https://username.github.io/nama-repo`

### Opsi 2: Netlify / Vercel
1. Drag & drop folder `absensi/` ke netlify.com/drop
2. Langsung dapat URL HTTPS

### Opsi 3: Vercel CLI
```bash
npm i -g vercel
vercel
```

## Fitur PWA
- ✅ Install ke HP (Android Chrome / iOS Safari)
- ✅ Offline mode (data tersimpan di cache)
- ✅ Icon shortcut (Input / Riwayat)
- ✅ Dark mode
- ✅ Responsive (mobile-first)

## Data
Semua data tersimpan di `localStorage` browser masing-masing perangkat.
Belum ada sinkronisasi antar perangkat (perlu backend untuk itu).

---
Versi 3.1 + PWA | Wingsati HR
