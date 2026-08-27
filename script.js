// ============================================================
//  DATA
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
//  STORAGE
// ============================================================

let listPersonel = JSON.parse(localStorage.getItem('wingsati_personel')) || DEFAULT_PERSONEL;
let dataAbsensi = JSON.parse(localStorage.getItem('wingsati_absensi')) || generateInitialData();

function savePersonel() {
    localStorage.setItem('wingsati_personel', JSON.stringify(listPersonel));
}

function saveAbsensi() {
    localStorage.setItem('wingsati_absensi', JSON.stringify(dataAbsensi));
}

// ============================================================
//  STATE
// ============================================================

let calDate = new Date();

// ============================================================
//  DOM REFS
// ============================================================

const $ = id => document.getElementById(id);
const namaSelect = $('nama');
const tanggalInput = $('tanggal');
const statusSelect = $('status');
const ketInput = $('keterangan');
const absenForm = $('absenForm');
const cutiMasalForm = $('cutiMasalForm');
const personelForm = $('personelForm');
const historyBody = $('historyBody');
const quotaKaryawanBody = $('quotaKaryawanBody');
const quotaManajemenBody = $('quotaManajemenBody');
const calGrid = $('calGrid');
const calMonthYear = $('calMonthYear');
const filterBulan = $('filterBulan');
const filterStatus = $('filterStatus');
const searchHistory = $('searchHistory');

const BULAN_SINGKAT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatTanggalID(tgl) {
    const d = new Date(tgl + 'T00:00:00');
    if (isNaN(d)) return tgl;
    return `${d.getDate()} ${BULAN_SINGKAT[d.getMonth()]} ${d.getFullYear()}`;
}

function todayStr() {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

// ============================================================
//  TOAST
// ============================================================

function showToast(message, type = 'info') {
    const container = $('toastContainer');
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300); }, 2800);
}

// ============================================================
//  RENDER: DROPDOWN
// ============================================================

function renderDropdown() {
    namaSelect.innerHTML = '<option value="">— Pilih —</option>';
    const gK = document.createElement('optgroup');
    gK.label = 'Karyawan';
    const gM = document.createElement('optgroup');
    gM.label = 'Manajemen';
    listPersonel.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.nama;
        opt.textContent = p.nama;
        if (p.kategori === 'Manajemen') gM.appendChild(opt);
        else gK.appendChild(opt);
    });
    namaSelect.appendChild(gK);
    namaSelect.appendChild(gM);
}

// ============================================================
//  RENDER: STATS
// ============================================================

function renderStats() {
    const total = listPersonel.length;
    const absen = dataAbsensi.length;
    const cutiData = dataAbsensi.filter(d => d.status === 'Cuti' || d.status === 'Cuti Bersama');
    const totalCuti = cutiData.length;

    const currentYear = new Date().getFullYear().toString();
    let sisaArr = [];
    listPersonel.forEach(p => {
        const recs = dataAbsensi.filter(d => d.nama === p.nama && (d.tahun === currentYear || !d.tahun));
        const cuti = recs.filter(d => d.status === 'Cuti' || d.status === 'Cuti Bersama').length;
        sisaArr.push(Math.max(0, 12 - cuti));
    });
    const avg = sisaArr.length ? (sisaArr.reduce((a, b) => a + b, 0) / sisaArr.length) : 0;

    $('totalKaryawan').textContent = total;
    $('totalAbsen').textContent = absen;
    $('totalCuti').textContent = totalCuti;
    $('rataSisa').textContent = avg.toFixed(1);
}

// ============================================================
//  RENDER: QUOTA
// ============================================================

function renderQuota() {
    renderQuotaTable('Karyawan', quotaKaryawanBody);
    renderQuotaTable('Manajemen', quotaManajemenBody);
}

function renderQuotaTable(kategori, tbody) {
    const currentYear = new Date().getFullYear().toString();
    const filtered = listPersonel.filter(p => p.kategori === kategori);
    tbody.innerHTML = '';
    if (filtered.length === 0) {
        tbody.innerHTML =
            `<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:16px;">Tidak ada data</td></tr>`;
        return;
    }
    filtered.forEach((p, idx) => {
        const recs = dataAbsensi.filter(d => d.nama === p.nama && (d.tahun === currentYear || !d.tahun));
        const sakit = recs.filter(d => d.status === 'Sakit').length;
        const cuti = recs.filter(d => d.status === 'Cuti').length;
        const cb = recs.filter(d => d.status === 'Cuti Bersama').length;
        const terpakai = cuti + cb;
        const sisa = Math.max(0, 12 - terpakai);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="cell-no">${idx+1}</td>
            <td class="cell-name" data-label="Nama"><strong>${p.nama}</strong></td>
            <td data-label="Sakit">${sakit || '-'}</td>
            <td data-label="Cuti">${cuti || '-'}</td>
            <td data-label="Cuti Bersama">${cb || '-'}</td>
            <td data-label="Sisa" style="font-weight:700;color:${sisa <= 2 ? 'var(--red)' : 'var(--green)'};">${sisa}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ============================================================
//  RENDER: CALENDAR
// ============================================================

function renderCalendar() {
    const year = calDate.getFullYear();
    const month = calDate.getMonth();
    const bulanNama = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober",
        "November", "Desember"
    ];
    calMonthYear.textContent = `${bulanNama[month]} ${year}`;

    calGrid.innerHTML = '';
    ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].forEach(d => {
        const div = document.createElement('div');
        div.className = 'day-name';
        div.textContent = d;
        calGrid.appendChild(div);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const div = document.createElement('div');
        div.className = 'day other-month';
        div.textContent = '';
        calGrid.appendChild(div);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const div = document.createElement('div');
        div.className = 'day';
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(i).padStart(2, '0');
        const dateStr = `${year}-${mm}-${dd}`;
        div.textContent = i;

        if (dataAbsensi.some(d => d.tanggal === dateStr)) {
            div.classList.add('has-event');
        }
        if (dateStr === todayStr()) {
            div.classList.add('today');
        }

        div.addEventListener('click', () => {
            tanggalInput.value = dateStr;
            tanggalInput.focus();
            calGrid.querySelectorAll('.day.selected').forEach(el => el.classList.remove('selected'));
            div.classList.add('selected');
        });

        calGrid.appendChild(div);
    }
}

function ubahBulan(delta) {
    calDate.setMonth(calDate.getMonth() + delta);
    renderCalendar();
}

// ============================================================
//  RENDER: HISTORY
// ============================================================

function renderTable() {
    const search = searchHistory.value.toLowerCase().trim();
    const bulan = filterBulan.value;
    const status = filterStatus.value;

    let filtered = [...dataAbsensi];

    if (bulan) {
        filtered = filtered.filter(d => d.tanggal.startsWith(bulan));
    }
    if (status) {
        filtered = filtered.filter(d => d.status === status);
    }
    if (search) {
        filtered = filtered.filter(d =>
            d.nama.toLowerCase().includes(search) ||
            d.keterangan.toLowerCase().includes(search)
        );
    }

    filtered.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    historyBody.innerHTML = '';
    if (filtered.length === 0) {
        historyBody.innerHTML =
            `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text3);"><i class="fas fa-inbox" style="font-size:24px;display:block;margin-bottom:6px;"></i>Tidak ada data</td></tr>`;
        return;
    }

    filtered.forEach((item, idx) => {
        const statusClass = item.status.replace(' ', '-').toLowerCase();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="cell-no center">${idx+1}</td>
            <td data-label="Tanggal">${formatTanggalID(item.tanggal)}</td>
            <td class="cell-name" data-label="Nama"><strong>${item.nama}</strong></td>
            <td data-label="Status"><span class="badge badge-${statusClass}">${item.status}</span></td>
            <td class="cell-ket" data-label="Keterangan">${item.keterangan || '—'}</td>
            <td class="cell-aksi">
                <button class="btn-delete" onclick="hapusData(${item.id})" title="Hapus" aria-label="Hapus data"><i class="fas fa-trash-can"></i></button>
            </td>
        `;
        historyBody.appendChild(tr);
    });
}

// ============================================================
//  CRUD
// ============================================================

function hapusData(id) {
    if (!confirm('Hapus data ini?')) return;
    dataAbsensi = dataAbsensi.filter(d => d.id !== id);
    saveAbsensi();
    renderAll();
    showToast('Data dihapus', 'success');
}

// ============================================================
//  FORM HANDLERS
// ============================================================

// Absensi individual
absenForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const tgl = tanggalInput.value;
    const nama = namaSelect.value;
    const status = statusSelect.value;
    const ket = ketInput.value.trim() || '-';

    if (!tgl || !nama) {
        showToast('Lengkapi semua field yang wajib!', 'error');
        return;
    }

    const dup = dataAbsensi.some(d => d.nama === nama && d.tanggal === tgl);
    if (dup) {
        showToast(`${nama} sudah tercatat pada tanggal ini!`, 'error');
        return;
    }

    const tahun = tgl.split('-')[0];
    dataAbsensi.push({
        id: Date.now() + Math.random(),
        tanggal: tgl,
        tahun: tahun,
        nama: nama,
        status: status,
        keterangan: ket
    });
    saveAbsensi();
    absenForm.reset();
    tanggalInput.valueAsDate = new Date();
    renderAll();
    showToast(`✅ ${nama} — ${status} berhasil dicatat`, 'success');
});

// Cuti Bersama Masal
cutiMasalForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const tgl = $('tanggalMasal').value;
    const ket = $('ketMasal').value.trim();
    if (!tgl || !ket) {
        showToast('Lengkapi tanggal dan keterangan!', 'error');
        return;
    }
    const tahun = tgl.split('-')[0];
    let added = 0;
    listPersonel.forEach(p => {
        const sudah = dataAbsensi.some(d => d.nama === p.nama && d.tanggal === tgl);
        if (!sudah) {
            dataAbsensi.push({
                id: Date.now() + Math.random() + Math.random(),
                tanggal: tgl,
                tahun: tahun,
                nama: p.nama,
                status: 'Cuti Bersama',
                keterangan: ket
            });
            added++;
        }
    });
    saveAbsensi();
    cutiMasalForm.reset();
    renderAll();
    showToast(`✅ Cuti Bersama ditambahkan untuk ${added} personel`, 'success');
});

// Tambah Personel
personelForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const nama = $('namaBaru').value.trim().toUpperCase();
    const kategori = $('kategoriBaru').value;
    if (!nama) {
        showToast('Masukkan nama!', 'error');
        return;
    }
    if (listPersonel.some(p => p.nama === nama)) {
        showToast(`"${nama}" sudah ada!`, 'error');
        return;
    }
    listPersonel.push({ nama, kategori });
    savePersonel();
    personelForm.reset();
    renderAll();
    showToast(`✅ ${nama} ditambahkan sebagai ${kategori}`, 'success');
});

// ============================================================
//  FILTER RESET
// ============================================================

function resetFilter() {
    filterBulan.value = '';
    filterStatus.value = '';
    searchHistory.value = '';
    renderTable();
}

// ============================================================
//  EXPORT CSV
// ============================================================

function exportCSV() {
    if (dataAbsensi.length === 0) {
        showToast('Tidak ada data untuk diekspor', 'info');
        return;
    }
    let csv = 'Tanggal,Nama,Status,Keterangan\n';
    dataAbsensi.forEach(d => {
        csv += `${d.tanggal},"${d.nama}","${d.status}","${d.keterangan || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wingsati_absensi_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Ekspor CSV berhasil', 'success');
}

// ============================================================
//  THEME TOGGLE
// ============================================================

function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    const icon = $('themeIcon');
    icon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('wingsati_theme', next);
}

// ============================================================
//  TOGGLE HISTORY (Tampilkan / Sembunyikan Riwayat)
// ============================================================

function toggleHistory() {
    const content = document.getElementById('historyContent');
    const btn = document.getElementById('toggleHistoryBtn');
    if (!content || !btn) return;

    const isHidden = content.style.display === 'none';
    if (isHidden) {
        content.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-eye"></i> Sembunyikan';
        localStorage.setItem('wingsati_history_visible', 'true');
    } else {
        content.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-eye-slash"></i> Tampilkan';
        localStorage.setItem('wingsati_history_visible', 'false');
    }
}

function loadHistoryState() {
    const content = document.getElementById('historyContent');
    const btn = document.getElementById('toggleHistoryBtn');
    if (!content || !btn) return;

    const visible = localStorage.getItem('wingsati_history_visible');
    if (visible === 'false') {
        content.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-eye-slash"></i> Tampilkan';
    } else {
        content.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-eye"></i> Sembunyikan';
        // Jika belum ada state, set default ke true
        if (visible === null) {
            localStorage.setItem('wingsati_history_visible', 'true');
        }
    }
}

// ============================================================
//  RENDER ALL
// ============================================================

function renderAll() {
    renderDropdown();
    renderStats();
    renderQuota();
    renderCalendar();
    renderTable();
    // Set default date
    if (!tanggalInput.value) {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        tanggalInput.value = `${y}-${m}-${d}`;
    }
    // Set filter bulan default ke bulan ini
    if (!filterBulan.value) {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        filterBulan.value = `${y}-${m}`;
    }
    // Today date
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    $('todayDate').textContent =
        `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

    // Restore theme
    const savedTheme = localStorage.getItem('wingsati_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const icon = $('themeIcon');
    icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

    // Load history toggle state
    loadHistoryState();
}

// ============================================================
//  INIT
// ============================================================

document.addEventListener('DOMContentLoaded', renderAll);

// ============================================================
//  PWA: INSTALL PROMPT
// ============================================================

let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Tampilkan banner hanya jika belum di-install & belum ditolak
    const dismissed = localStorage.getItem('wingsati_install_dismissed');
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
    if (!dismissed && !isInstalled) {
        const banner = document.getElementById('installBanner');
        if (banner) banner.style.display = 'block';
    }
});

window.addEventListener('appinstalled', () => {
    const banner = document.getElementById('installBanner');
    if (banner) banner.style.display = 'none';
    deferredPrompt = null;
    showToast('✅ Wingsati terpasang di perangkat Anda', 'success');
});

const installYesBtn = document.getElementById('installYes');
const installNoBtn = document.getElementById('installNo');
const installBannerEl = document.getElementById('installBanner');

if (installYesBtn) {
    installYesBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            showToast('📲 Membuka installer…', 'info');
        }
        deferredPrompt = null;
        if (installBannerEl) installBannerEl.style.display = 'none';
    });
}

if (installNoBtn) {
    installNoBtn.addEventListener('click', () => {
        if (installBannerEl) installBannerEl.style.display = 'none';
        localStorage.setItem('wingsati_install_dismissed', 'true');
    });
}

// ============================================================
//  KEYBOARD SHORTCUT: ESC to reset filter
// ============================================================

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') resetFilter();
});