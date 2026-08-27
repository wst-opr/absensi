# Panduan Deploy Wingsati PWA

## Prerequisites
- Akun GitHub (untuk GitHub Pages) ATAU akun Netlify/Vercel
- File sudah lengkap: index.html, style.css, script.js, sw.js, manifest.json, logo

---

## 🚀 OPSI 1: GitHub Pages (Gratis, Permanen)

### Step 1: Buat Repository
1. Login ke github.com
2. Klik **New repository** (ikon +)
3. Nama: `wingsati-absensi`
4. Visibility: **Public**
5. Klik **Create repository**

### Step 2: Upload File
```bash
cd "C:\Users\Administrator\Desktop\absensi"
git init
git add .
git commit -m "Wingsati PWA v3.1"
git branch -M main
git remote add origin https://github.com/USERNAME/wingsati-absensi.git
git push -u origin main
```
Atau upload manual via "Add file" → "Upload files"

### Step 3: Enable Pages
1. Repository → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / Folder: **/ (root)**
4. Save
5. Tunggu 1-2 menit → URL: `https://USERNAME.github.io/wingsati-absensi`

### Step 4: Test PWA
1. Buka URL di HP (Chrome Android / Safari iOS)
2. Scroll ke bawah → klik **"Pasang"** di banner
3. App muncul di home screen

---

## 🚀 OPSI 2: Netlify Drop (Paling Cepat, 30 detik)

1. Buka https://app.netlify.com/drop
2. Drag & drop folder `absensi/` ke window
3. Selesai! Langsung dapat URL `https://xxx.netlify.app`

---

## 🚀 OPSI 3: Vercel (CLI)

```bash
npm install -g vercel
cd "C:\Users\Administrator\Desktop\absensi"
vercel
```
Ikuti prompt → dapat URL HTTPS

---

## ✅ Checklist Sebelum Deploy
- [ ] Semua file ada (index.html, sw.js, manifest.json, logo)
- [ ] Buka di localhost → tidak ada error console
- [ ] Logo PNG valid (bisa dibuka)
- [ ] Test install di HP berhasil

## ⚠️ Catatan Penting
- **HTTPS wajib** untuk PWA (semua opsi di atas otomatis HTTPS)
- **Data tidak tersinkron** antar perangkat (masih localStorage)
- Untuk sinkronisasi antar HP → butuh backend (Firebase/Supabase)

## 🔧 Troubleshooting
| Masalah | Solusi |
|---------|--------|
| Banner tidak muncul | Pastikan buka via HTTPS/localhost, bukan file:// |
| Icon tidak tampil | Cek file logo PNG tidak corrupt |
| Offline tidak jalan | Hard refresh (Ctrl+Shift+R) setelah deploy |
| Install gagal iOS | Safari → Share → "Add to Home Screen" |
