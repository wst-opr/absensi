// ============================================================
//  WINGSATI — FIREBASE SYNC LAYER
//  Menggantikan localStorage dengan Cloud Firestore.
//  Semua data (personel + absensi) tersimpan di cloud & tersinkron
//  antar perangkat. Preferensi UI (theme, history) tetap localStorage.
// ============================================================

// ============================================================
//  DATA DEFAULT (dipindah dari script.js)
// ============================================================

const DEFAULT_PERSONEL = [
    { nama: "MINARNI JUNARIAH", kategori: "Karyawan" },
    { nama: "I MD DWI PM", kategori: "Karyawan" },
    { nama: "KENIA CHICELIA", kategori: "Karyawan" },
    { nama: "MADE SUARTA", kategori: "Karyawan" },
    { nama: "I KOMANG PARTHA", kategori: "Karyawan" },
    { nama: "FINA SAFARINA", kategori: "Karyawan" },
    { nama: "SUPRANTO", kategori: "Karyawan" },
    { nama: "DAMAR KESID", kategori: "Karyawan" },
    { nama: "MAURIN DARENOH", kategori: "Karyawan" },
    { nama: "ICA RATNASARI", kategori: "Karyawan" },
    { nama: "MEINAH UMIYATUN", kategori: "Karyawan" },
    { nama: "ISMI WAHYUNI", kategori: "Karyawan" },
    { nama: "AMAD BISRI", kategori: "Karyawan" },
    { nama: "PITRI YADI", kategori: "Karyawan" },
    { nama: "ARIF SETIAWAN", kategori: "Karyawan" },
    { nama: "JAMHARI", kategori: "Karyawan" },
    { nama: "ABU THOLIB", kategori: "Karyawan" },
    { nama: "RIKO", kategori: "Karyawan" },
    { nama: "NOVITA", kategori: "Karyawan" },
    { nama: "KOMUT", kategori: "Manajemen" },
    { nama: "KOMISARIS", kategori: "Manajemen" },
    { nama: "DIRUT", kategori: "Manajemen" },
    { nama: "DIREKTUR", kategori: "Manajemen" }
];

const REKAP_JULI = {
    "MINARNI JUNARIAH": { sakit: 0, cuti: 3, cutiBersama: 5 },
    "I MD DWI PM": { sakit: 1, cuti: 7, cutiBersama: 5 },
    "KENIA CHICELIA": { sakit: 0, cuti: 3, cutiBersama: 5 },
    "MADE SUARTA": { sakit: 2, cuti: 0, cutiBersama: 5 },
    "I KOMANG PARTHA": { sakit: 1, cuti: 3, cutiBersama: 5 },
    "FINA SAFARINA": { sakit: 0, cuti: 1, cutiBersama: 5 },
    "SUPRANTO": { sakit: 0, cuti: 3, cutiBersama: 5 },
    "DAMAR KESID": { sakit: 0, cuti: 2, cutiBersama: 5 },
    "MAURIN DARENOH": { sakit: 0, cuti: 4, cutiBersama: 5 },
    "ICA RATNASARI": { sakit: 1, cuti: 0, cutiBersama: 5 },
    "MEINAH UMIYATUN": { sakit: 7, cuti: 0, cutiBersama: 5 },
    "ISMI WAHYUNI": { sakit: 0, cuti: 0, cutiBersama: 5 },
    "AMAD BISRI": { sakit: 1, cuti: 6, cutiBersama: 5 },
    "PITRI YADI": { sakit: 0, cuti: 0, cutiBersama: 5 },
    "ARIF SETIAWAN": { sakit: 2, cuti: 3, cutiBersama: 5 },
    "JAMHARI": { sakit: 1, cuti: 2, cutiBersama: 5 },
    "ABU THOLIB": { sakit: 2, cuti: 4, cutiBersama: 5 },
    "RIKO": { sakit: 0, cuti: 0, cutiBersama: 0 },
    "NOVITA": { sakit: 0, cuti: 0, cutiBersama: 0 }
};

function generateInitialData() {
    const records = [];
    let id = 1;
    for (const [nama, d] of Object.entries(REKAP_JULI)) {
        for (let i = 0; i < d.sakit; i++) {
            records.push({ id: id++, tanggal: `2026-02-${String(i + 1).padStart(2, '0')}`, tahun: "2026", nama,
                status: "Sakit", keterangan: "Sakit (s.d Juli 2026)" });
        }
        for (let i = 0; i < d.cuti; i++) {
            records.push({ id: id++, tanggal: `2026-03-${String(i + 1).padStart(2, '0')}`, tahun: "2026", nama,
                status: "Cuti", keterangan: "Cuti pribadi (s.d Juli 2026)" });
        }
        for (let i = 0; i < d.cutiBersama; i++) {
            records.push({ id: id++, tanggal: `2026-05-${String(i + 1).padStart(2, '0')}`, tahun: "2026", nama,
                status: "Cuti Bersama", keterangan: "Cuti Bersama (s.d Juli 2026)" });
        }
    }
    return records;
}

// ============================================================
//  DATA LAYER — FIRESTORE
// ============================================================

// Muat seluruh data dari Firestore (dengan seeding oleh admin saja)
async function loadAll() {
    // --- Personel ---
    const pSnap = await fbDB.doc('meta/personel').get();
    if (!pSnap.exists || !pSnap.data().list || pSnap.data().list.length === 0) {
        if (isAdmin()) {
            listPersonel = DEFAULT_PERSONEL.map(p => ({ ...p }));
            await savePersonel();
        } else {
            listPersonel = [];
        }
    } else {
        listPersonel = pSnap.data().list;
    }

    // --- Absensi ---
    const aSnap = await fbDB.collection('absensi').orderBy('tanggal').get();
    if (aSnap.empty) {
        if (isAdmin()) {
            const seed = generateInitialData();
            dataAbsensi = [];
            for (const rec of seed) {
                const ref = await fbDB.collection('absensi').add(rec);
                dataAbsensi.push({ id: ref.id, ...rec });
            }
        } else {
            dataAbsensi = [];
        }
    } else {
        dataAbsensi = aSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    firebaseReady = true;
}

// Simpan array personel ke Firestore (1 dokumen meta)
function savePersonel() {
    return fbDB.doc('meta/personel').set({ list: listPersonel });
}

// Tambah 1 record absensi, kembalikan id dokumen
async function addAbsensi(rec) {
    const ref = await fbDB.collection('absensi').add(rec);
    return ref.id;
}

// Hapus 1 record absensi
async function deleteAbsensi(id) {
    return fbDB.collection('absensi').doc(id).delete();
}

// ============================================================
//  ROLE / UI GATING
// ============================================================

function applyRoleUI() {
    const admin = isAdmin();
    document.body.classList.toggle('readonly-mode', !admin);

    // Disable semua form input jika bukan admin
    [absenForm, cutiMasalForm, personelForm].forEach(f => {
        if (!f) return;
        Array.from(f.elements).forEach(el => { el.disabled = !admin; });
    });

    const roleBadge = document.getElementById('roleBadge');
    if (roleBadge) roleBadge.textContent = admin ? 'Manajemen' : 'Karyawan';
}

function updateUserBadge() {
    const el = document.getElementById('userBadge');
    if (el && currentUser) el.textContent = currentUser.email;
}

// ============================================================
//  AUTH STATE
// ============================================================

fbAuth.onAuthStateChanged(async (user) => {
    const loginScreen = document.getElementById('loginScreen');
    const appRoot = document.getElementById('appRoot');

    if (!user) {
        currentUser = null;
        currentRole = 'user';
        if (loginScreen) loginScreen.style.display = 'flex';
        if (appRoot) appRoot.style.display = 'none';
        return;
    }

    currentUser = user;
    currentRole = isAdmin() ? 'admin' : 'user';

    try {
        await loadAll();
    } catch (e) {
        console.error('[Firebase] Load gagal:', e);
        showToast('Gagal memuat data dari Firebase', 'error');
    }

    if (loginScreen) loginScreen.style.display = 'none';
    if (appRoot) appRoot.style.display = 'block';

    updateUserBadge();
    if (typeof renderAll === 'function') renderAll();
    showToast(
        `👋 ${user.email} — ${currentRole === 'admin' ? 'Manajemen (Admin)' : 'Karyawan (Read-only)'}`,
        'info'
    );
});

// ============================================================
//  LOGIN / REGISTER / LOGOUT UI
// ============================================================

function setLoginError(msg) {
    const el = document.getElementById('loginError');
    if (el) el.textContent = msg || '';
}

function loginErrorMessage(err) {
    const code = err && err.code ? err.code : '';
    const map = {
        'auth/invalid-email': 'Format email salah',
        'auth/user-not-found': 'Akun tidak ditemukan',
        'auth/wrong-password': 'Password salah',
        'auth/invalid-credential': 'Email atau password salah',
        'auth/email-already-in-use': 'Email sudah terdaftar',
        'auth/weak-password': 'Password minimal 6 karakter',
        'auth/network-request-failed': 'Gagal koneksi ke server'
    };
    return map[code] || (err && err.message) || 'Terjadi kesalahan';
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const pw = document.getElementById('loginPassword').value;
        setLoginError('');
        try {
            await fbAuth.signInWithEmailAndPassword(email, pw);
        } catch (err) {
            setLoginError(loginErrorMessage(err));
        }
    });
}

const btnRegister = document.getElementById('btnRegister');
if (btnRegister) {
    btnRegister.addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value.trim();
        const pw = document.getElementById('loginPassword').value;
        if (!email || !pw) { setLoginError('Isi email & password'); return; }
        if (pw.length < 6) { setLoginError('Password minimal 6 karakter'); return; }
        setLoginError('');
        try {
            await fbAuth.createUserWithEmailAndPassword(email, pw);
            showToast('✅ Akun berhasil dibuat', 'success');
        } catch (err) {
            setLoginError(loginErrorMessage(err));
        }
    });
}

const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        fbAuth.signOut();
        showToast('Logout berhasil', 'info');
    });
}
