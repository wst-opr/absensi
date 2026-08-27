// ============================================================
//  WINGSATI — FIREBASE CONFIG & INIT
//  PENTING: Isi nilai dari Firebase Console
//  → Project Settings → Your apps → SDK setup and configuration (CDN)
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyCkpDIo6Muxzhfmz9ltXnF7VGAMM2l2MJA",
	authDomain: "wingsati-absensi.firebaseapp.com",
	projectId: "wingsati-absensi",
	storageBucket: "wingsati-absensi.firebasestorage.app",
	messagingSenderId: "248019929103",
	appId: "1:248019929103:web:bcec10313cd5491e4f3b7a",
	measurementId: "G-WNKCZ1Z4Z1"
};

// ============================================================
//  HAK AKSES — DAFTAR EMAIL MANAJEMEN (ADMIN)
//  Email di bawah ini otomatis menjadi ADMIN (bisa input/edit/hapus).
//  Email LAIN yang login = Karyawan (hanya bisa LIHAT data).
//  >>> PASTIKAN SAMA PERSIS DENGAN daftar di firestore.rules (function adminEmails) <<<
// ============================================================
const ADMIN_EMAILS = [
    "bprwingsati.operasional@gmail.com",
    // "dirut@wingsati.com"
];

// Cegah app rusak jika config masih placeholder
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.indexOf("ISI_") === 0) {
    alert("⚠️ Firebase belum dikonfigurasi!\nBuka file firebase.js dan isi firebaseConfig + ADMIN_EMAILS.");
}

// ---- INIT ----
firebase.initializeApp(firebaseConfig);
const fbAuth = firebase.auth();
const fbDB = firebase.firestore();

// Offline persistence → PWA tetap jalan tanpa internet, lalu auto-sync
fbDB.enablePersistence({ synchronizeTabs: true })
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('[Firebase] Persistence gagal: banyak tab terbuka');
        } else if (err.code === 'unimplemented') {
            console.warn('[Firebase] Persistence tidak didukung browser ini');
        }
    });

// ============================================================
//  SHARED STATE (dipakai script.js & firebase-sync.js)
// ============================================================
let currentUser = null;     // firebase.User | null
let currentRole = 'user';   // 'admin' (Manajemen) | 'user' (Karyawan)
let listPersonel = [];      // array personel (dari Firestore)
let dataAbsensi = [];       // array absensi (dari Firestore)
let firebaseReady = false;

// Cek apakah user saat ini adalah Admin
function isAdmin() {
    return !!currentUser && ADMIN_EMAILS.indexOf(currentUser.email) !== -1;
}
