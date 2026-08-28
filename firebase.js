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
//  HAK AKSES — DAFTAR EMAIL MANAJEMEN (ADMIN) PER KANTOR
//  Pusat & Cabang terpisah — admin Cabang HANYA bisa di cabang.html
//  >>> PASTIKAN SAMA PERSIS DENGAN daftar di firestore.rules <<<
// ============================================================
const ADMIN_PUSAT = [
    "bprwingsati.operasional@gmail.com"
];
const ADMIN_CABANG = [
    "operasional.wst.cab01@gmail.com"
];
// Gabungan untuk kompatibilitas (Firestore rules pakai ini)
const ADMIN_EMAILS = [...ADMIN_PUSAT, ...ADMIN_CABANG];

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

// Cek apakah user saat ini adalah Admin (per-kantor — STRICT: tidak cross-edit)
// Cabang tidak bisa edit Pusat, Pusat tetap bisa view cabang tapi tidak auto-admin di cabang jika ingin strict
// Saat ini: isAdmin di Pusat = hanya ADMIN_PUSAT, di Cabang = hanya ADMIN_CABANG
// Jika butuh super-admin pusat kelola cabang, tambahkan || ADMIN_PUSAT di blok cabang
function isAdmin() {
    if (!currentUser || !currentUser.email) return false;
    const email = currentUser.email;
    const isCabangPage = window.location.pathname.toLowerCase().includes('cabang');
    if (isCabangPage) {
        // STRICT: hanya admin cabang yang bisa edit cabang
        return ADMIN_CABANG.indexOf(email) !== -1;
    }
    // Di halaman Pusat: hanya admin pusat
    return ADMIN_PUSAT.indexOf(email) !== -1;
}
