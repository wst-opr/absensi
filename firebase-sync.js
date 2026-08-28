// ============================================================
//  WINGSATI — FIREBASE SYNC LAYER
//  Menggantikan localStorage dengan Cloud Firestore.
//  Semua data (personel + absensi) tersimpan di cloud & tersinkron
//  antar perangkat. Preferensi UI (theme, history) tetap localStorage.
// ============================================================

// ============================================================
//  DATA DEFAULT (dipindah dari script.js)
// ============================================================

// ===== KONFIG MULTI-KANTOR =====
// Deteksi halaman: index.html (Pusat) vs cabang.html (Cabang)
// Pisahkan koleksi agar tidak tercampur
const IS_CABANG = window.location.pathname.toLowerCase().includes('cabang');
const DOC_PERSONEL_PATH = IS_CABANG ? 'meta/personel_cabang' : 'meta/personel';
const COL_ABSENSI = IS_CABANG ? 'absensi_cabang' : 'absensi';
const LABEL_KANTOR = IS_CABANG ? 'Cabang' : 'Pusat';

// Data Kantor Pusat (19 karyawan + 4 manajemen) — sesuai tabel gambar s.d Juli 2026
const DEFAULT_PERSONEL_PUSAT = [
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
const REKAP_JULI_PUSAT = {
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

// Data Kantor Cabang — 12 karyawan sesuai tabel s.d Juli 2026
// Kadek Dwi Alviliani = karyawan <12 bulan → jatah cuti 0 (belum berhak)
const DEFAULT_PERSONEL_CABANG = [
    { nama: "TITIEN RAHMAWATI", kategori: "Manajemen" },
    { nama: "IKA SAFITRI", kategori: "Karyawan" },
    { nama: "D P ETY SURIYANI", kategori: "Karyawan" },
    { nama: "EKA DIAN CAHYANI P", kategori: "Karyawan" },
    { nama: "NI WAYAN DESSY PS", kategori: "Karyawan" },
    { nama: "FIRMANSYAH ALAN", kategori: "Karyawan" },
    { nama: "SURYA EKAPUTRA", kategori: "Karyawan" },
    { nama: "CHAKY", kategori: "Karyawan" },
    { nama: "MARSHELINA DWI L", kategori: "Karyawan" },
    { nama: "SRI REDJEKI S", kategori: "Karyawan" },
    { nama: "SHASAMIELLA E", kategori: "Karyawan" },
    { nama: "KADEK DWI ALVILIANI", kategori: "Karyawan", jatahCuti: 0, catatan: "Belum 1 tahun" }
];
const REKAP_CABANG = {
    "TITIEN RAHMAWATI": { sakit: 0, cuti: 1, cutiBersama: 5 },
    "IKA SAFITRI": { sakit: 6, cuti: 0, cutiBersama: 5 },
    "D P ETY SURIYANI": { sakit: 0, cuti: 0, cutiBersama: 5 },
    "EKA DIAN CAHYANI P": { sakit: 1, cuti: 4, cutiBersama: 5 },
    "NI WAYAN DESSY PS": { sakit: 2, cuti: 4, cutiBersama: 5 },
    "FIRMANSYAH ALAN": { sakit: 0, cuti: 0, cutiBersama: 5 },
    "SURYA EKAPUTRA": { sakit: 0, cuti: 0, cutiBersama: 5 },
    "CHAKY": { sakit: 4, cuti: 6, cutiBersama: 5 },
    "MARSHELINA DWI L": { sakit: 4, cuti: 3, cutiBersama: 5 },
    "SRI REDJEKI S": { sakit: 0, cuti: 2, cutiBersama: 5 },
    "SHASAMIELLA E": { sakit: 0, cuti: 2, cutiBersama: 5 },
    "KADEK DWI ALVILIANI": { sakit: 0, cuti: 1, cutiBersama: 0 }
};
// Jatah cuti khusus: 0 untuk yang belum 12 bulan
const JATAH_CUTI_CABANG = {
    "KADEK DWI ALVILIANI": 0
};

// Alias aktif sesuai halaman saat ini (agar script.js tetap pakai DEFAULT_PERSONEL / REKAP_JULI)
const DEFAULT_PERSONEL = IS_CABANG ? DEFAULT_PERSONEL_CABANG : DEFAULT_PERSONEL_PUSAT;
const REKAP_JULI = IS_CABANG ? REKAP_CABANG : REKAP_JULI_PUSAT;
// Helper jatah cuti per karyawan (pusat = 12 semua, cabang = 0 untuk Kadek)
function getJatahCuti(nama) {
    if (IS_CABANG && JATAH_CUTI_CABANG && JATAH_CUTI_CABANG[nama] !== undefined) return JATAH_CUTI_CABANG[nama];
    // cek juga properti di DEFAULT_PERSONEL (untuk Kadek)
    const p = DEFAULT_PERSONEL.find(x => x.nama === nama);
    if (p && p.jatahCuti !== undefined) return p.jatahCuti;
    return 12;
}

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
    const pSnap = await fbDB.doc(DOC_PERSONEL_PATH).get();
    if (!pSnap.exists || !pSnap.data().list || pSnap.data().list.length === 0) {
        if (isAdmin()) {
            listPersonel = DEFAULT_PERSONEL.map(p => ({ ...p }));
            await savePersonel();
        } else {
            listPersonel = [];
        }
    } else {
        listPersonel = pSnap.data().list;
        // Auto-repair personel jika ada yang hilang (hanya admin)
        if (isAdmin()) {
            const existingNames = new Set(listPersonel.map(p => p.nama));
            let needSave = false;
            for (const p of DEFAULT_PERSONEL) {
                if (!existingNames.has(p.nama)) {
                    listPersonel.push({ ...p });
                    needSave = true;
                }
            }
            if (needSave) {
                await savePersonel();
                console.log('[Firebase] Personel diperbaiki - ditambah yang hilang');
            }
        }
    }

    // --- Absensi ---
    const aSnap = await fbDB.collection(COL_ABSENSI).orderBy('tanggal').get();
    if (aSnap.empty) {
        if (isAdmin()) {
            const seed = generateInitialData();
            dataAbsensi = [];
            for (const rec of seed) {
                const ref = await fbDB.collection(COL_ABSENSI).add(rec);
                dataAbsensi.push({ id: ref.id, ...rec });
            }
        } else {
            dataAbsensi = [];
        }
    } else {
        dataAbsensi = aSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Auto-repair: tambah data yang kurang sesuai REKAP_JULI (hanya admin)
        if (isAdmin()) {
            const repaired = await ensureDataIntegrity(false);
            if (repaired > 0) {
                console.log(`[Firebase] Auto-repair: ${repaired} record ditambahkan`);
            }
        }
    }
    firebaseReady = true;
}

// Perbaiki data absensi yang kurang sesuai REKAP_JULI
// silent=false akan tampilkan toast
async function ensureDataIntegrity(silent = true) {
    if (!isAdmin()) {
        if (!silent) showToast('Hanya Manajemen yang dapat repair!', 'error');
        return 0;
    }
    let added = 0;
    for (const [nama, target] of Object.entries(REKAP_JULI)) {
        const recs = dataAbsensi.filter(d => d.nama === nama && (d.tahun === '2026' || !d.tahun));
        const curSakit = recs.filter(d => d.status === 'Sakit').length;
        const curCuti = recs.filter(d => d.status === 'Cuti').length;
        const curCB = recs.filter(d => d.status === 'Cuti Bersama').length;

        const needSakit = Math.max(0, target.sakit - curSakit);
        const needCuti = Math.max(0, target.cuti - curCuti);
        const needCB = Math.max(0, target.cutiBersama - curCB);

        // Cari tanggal yang sudah dipakai untuk nama ini agar tidak duplikat
        const usedDates = new Set(recs.map(d => d.tanggal));

        const addRecords = async (count, status, ket, month) => {
            for (let i = 0; i < count; i++) {
                // cari tanggal kosong di bulan tersebut
                let day = 1;
                let dateStr = '';
                for (let d = 1; d <= 28; d++) {
                    const cand = `2026-${month}-${String(d).padStart(2, '0')}`;
                    if (!usedDates.has(cand)) { dateStr = cand; usedDates.add(cand); break; }
                }
                if (!dateStr) dateStr = `2026-${month}-${String(10 + i).padStart(2, '0')}`;
                const rec = { tanggal: dateStr, tahun: '2026', nama, status, keterangan: ket };
                const id = await addAbsensi(rec);
                dataAbsensi.push({ id, ...rec });
                added++;
            }
        };

        if (needSakit > 0) await addRecords(needSakit, 'Sakit', 'Sakit (s.d Juli 2026)', '02');
        if (needCuti > 0) await addRecords(needCuti, 'Cuti', 'Cuti pribadi (s.d Juli 2026)', '03');
        if (needCB > 0) await addRecords(needCB, 'Cuti Bersama', 'Cuti Bersama (s.d Juli 2026)', '05');
    }
    if (added > 0) {
        if (!silent) showToast(`✅ Repair selesai: ${added} data ditambahkan`, 'success');
        if (typeof renderAll === 'function') renderAll();
    } else {
        if (!silent) showToast('✅ Data sudah lengkap, tidak ada yang perlu diperbaiki', 'info');
    }
    return added;
}

// Reset total dan seed ulang sesuai REKAP_JULI (HATI-HATI: hapus semua absensi)
async function resetFirestore() {
    if (!isAdmin()) { showToast('Hanya Manajemen yang dapat reset!', 'error'); return; }
    if (!confirm('HAPUS SEMUA data absensi dan isi ulang sesuai tabel gambar?\nData lama akan hilang!')) return;
    showToast('⏳ Mereset data...', 'info');
    const snap = await fbDB.collection(COL_ABSENSI).get();
    const batch = fbDB.batch();
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    dataAbsensi = [];
    const seed = generateInitialData();
    for (const rec of seed) {
        const ref = await fbDB.collection(COL_ABSENSI).add(rec);
        dataAbsensi.push({ id: ref.id, ...rec });
    }
    if (typeof renderAll === 'function') renderAll();
    showToast(`✅ Reset selesai: ${seed.length} records dibuat`, 'success');
}

// Expose ke window untuk dipanggil via console / tombol
window.repairAbsensi = () => ensureDataIntegrity(false);
window.resetFirestore = resetFirestore;

// Simpan array personel ke Firestore (1 dokumen meta)
function savePersonel() {
    return fbDB.doc(DOC_PERSONEL_PATH).set({ list: listPersonel });
}

// Tambah 1 record absensi, kembalikan id dokumen
async function addAbsensi(rec) {
    const ref = await fbDB.collection(COL_ABSENSI).add(rec);
    return ref.id;
}

// Hapus 1 record absensi
async function deleteAbsensi(id) {
    return fbDB.collection(COL_ABSENSI).doc(id).delete();
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
    // Update label kantor di header jika ada
    const kantorLabel = document.getElementById('kantorLabel');
    if (kantorLabel) kantorLabel.textContent = IS_CABANG ? 'Kantor Cabang' : 'Kantor Pusat';
    if (typeof renderAll === 'function') renderAll();
    showToast(
        `👋 ${user.email} — ${currentRole === 'admin' ? 'Manajemen' : 'Karyawan'} • ${LABEL_KANTOR}`,
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
