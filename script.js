// ============================================================
//  DATA & STORAGE
//  Diambil dari Cloud Firestore (lihat firebase.js & firebase-sync.js).
//  listPersonel, dataAbsensi, savePersonel, addAbsensi, deleteAbsensi,
//  currentUser, currentRole, isAdmin() didefinisikan di layer Firebase.
// ============================================================

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

// SVG Icons
const ICONS = {
    success: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    inbox: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
    trash: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    sun: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
    moon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    eye: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeSlash: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
};

function showToast(message, type = 'info') {
    const container = $('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `${ICONS[type] || ICONS.info} ${message}`;
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
        const jatah = (typeof getJatahCuti === 'function') ? getJatahCuti(p.nama) : (p.jatahCuti !== undefined ? p.jatahCuti : 12);
        sisaArr.push(Math.max(0, jatah - cuti));
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
        const jatah = (typeof getJatahCuti === 'function') ? getJatahCuti(p.nama) : (p.jatahCuti !== undefined ? p.jatahCuti : 12);
        const sisa = Math.max(0, jatah - terpakai);
        const isBelumBerhak = jatah === 0;
        const namaExtra = isBelumBerhak ? ` <span style="font-size:10px;font-weight:600;color:var(--text3);background:var(--surface2);border:1px solid var(--border);padding:2px 6px;border-radius:20px;margin-left:6px;">Belum berhak cuti</span>` : '';
        const sisaDisplay = isBelumBerhak ? `<span title="Belum 12 bulan — belum dapat jatah cuti">-</span>` : sisa;
        const sisaColor = isBelumBerhak ? 'var(--text3)' : (sisa <= 2 ? 'var(--red)' : 'var(--green)');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="cell-no">${idx+1}</td>
            <td class="cell-name" data-label="Nama"><strong>${p.nama}</strong>${namaExtra}</td>
            <td data-label="Sakit">${sakit || '-'}</td>
            <td data-label="Cuti">${cuti || '-'}</td>
            <td data-label="Cuti Bersama">${cb || '-'}</td>
            <td data-label="Sisa" style="font-weight:700;color:${sisaColor};">${sisaDisplay}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ============================================================
//  KALENDER INDONESIA — HARI LIBUR & PERINGATAN (2025-2027)
//  Sumber: SKB 3 Menteri + hari nasional
// ============================================================
const HOLIDAYS_ID = {
    // 2025
    '2025-01-01': { name: 'Tahun Baru', type: 'libur' },
    '2025-01-29': { name: 'Imlek', type: 'libur' },
    '2025-03-29': { name: 'Nyepi', type: 'libur' },
    '2025-03-31': { name: 'Idul Fitri', type: 'libur' },
    '2025-04-01': { name: 'Idul Fitri 2', type: 'libur' },
    '2025-04-18': { name: 'Wafat Isa Almasih', type: 'libur' },
    '2025-05-01': { name: 'Hari Buruh', type: 'libur' },
    '2025-05-12': { name: 'Waisak', type: 'libur' },
    '2025-05-29': { name: 'Kenaikan Isa Almasih', type: 'libur' },
    '2025-06-01': { name: 'Hari Pancasila', type: 'libur' },
    '2025-06-06': { name: 'Idul Adha', type: 'libur' },
    '2025-06-27': { name: 'Tahun Baru Islam', type: 'libur' },
    '2025-08-17': { name: 'Kemerdekaan RI', type: 'libur' },
    '2025-09-05': { name: 'Maulid Nabi', type: 'libur' },
    '2025-12-25': { name: 'Natal', type: 'libur' },
    // peringatan (tidak libur)
    '2025-04-21': { name: 'Hari Kartini', type: 'peringatan' },
    '2025-05-02': { name: 'Hardiknas', type: 'peringatan' },
    '2025-05-20': { name: 'Harkitnas', type: 'peringatan' },
    '2025-10-28': { name: 'Sumpah Pemuda', type: 'peringatan' },
    '2025-11-10': { name: 'Hari Pahlawan', type: 'peringatan' },
    // 2026
    '2026-01-01': { name: 'Tahun Baru', type: 'libur' },
    '2026-02-17': { name: 'Imlek', type: 'libur' },
    '2026-03-19': { name: 'Nyepi', type: 'libur' },
    '2026-03-20': { name: 'Idul Fitri', type: 'libur' },
    '2026-03-21': { name: 'Idul Fitri 2', type: 'libur' },
    '2026-04-03': { name: 'Wafat Isa Almasih', type: 'libur' },
    '2026-05-01': { name: 'Hari Buruh', type: 'libur' },
    '2026-05-14': { name: 'Kenaikan Isa Almasih', type: 'libur' },
    '2026-05-31': { name: 'Waisak', type: 'libur' },
    '2026-05-27': { name: 'Idul Adha', type: 'libur' },
    '2026-06-01': { name: 'Hari Pancasila', type: 'libur' },
    '2026-06-16': { name: 'Tahun Baru Islam', type: 'libur' },
    '2026-08-17': { name: 'Kemerdekaan RI', type: 'libur' },
    '2026-08-25': { name: 'Maulid Nabi', type: 'libur' },
    '2026-12-25': { name: 'Natal', type: 'libur' },
    // cuti bersama 2026 (contoh, sinkron dengan data absensi 2026-05)
    '2026-05-28': { name: 'Cuti Bersama Idul Adha', type: 'libur' },
    '2026-12-24': { name: 'Cuti Bersama Natal', type: 'libur' },
    // peringatan 2026
    '2026-04-21': { name: 'Hari Kartini', type: 'peringatan' },
    '2026-05-02': { name: 'Hardiknas', type: 'peringatan' },
    '2026-05-20': { name: 'Harkitnas', type: 'peringatan' },
    '2026-10-28': { name: 'Sumpah Pemuda', type: 'peringatan' },
    '2026-11-10': { name: 'Hari Pahlawan', type: 'peringatan' },
    // 2027 (ringkas)
    '2027-01-01': { name: 'Tahun Baru', type: 'libur' },
    '2027-08-17': { name: 'Kemerdekaan RI', type: 'libur' },
    '2027-12-25': { name: 'Natal', type: 'libur' }
};

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
    ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].forEach((d, idx) => {
        const div = document.createElement('div');
        div.className = 'day-name' + (idx === 0 || idx === 6 ? ' weekend-head' : '');
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
        const dow = new Date(year, month, i).getDay();
        const isWeekend = dow === 0 || dow === 6;
        if (isWeekend) div.classList.add('weekend');
        const hol = HOLIDAYS_ID[dateStr];
        if (hol) {
            div.classList.add(hol.type === 'libur' ? 'holiday-libur' : 'holiday-peringatan');
            div.title = hol.name;
            // label kecil di dalam cell untuk libur
            if (hol.type === 'libur') {
                const lbl = document.createElement('span');
                lbl.className = 'hol-label';
                lbl.textContent = hol.name.length > 14 ? hol.name.slice(0,13)+'…' : hol.name;
                div.appendChild(lbl);
            }
        }

        if (dataAbsensi.some(d => d.tanggal === dateStr)) {
            div.classList.add('has-event');
        }
        if (dateStr === todayStr()) {
            div.classList.add('today');
        }

        div.addEventListener('click', () => {
            if (hol) showToast(`📅 ${hol.name} — ${formatTanggalID(dateStr)}`, 'info');
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
            `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text3);">${ICONS.inbox}Tidak ada data</td></tr>`;
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
                <button class="btn-delete" onclick="hapusData(${item.id})" title="Hapus" aria-label="Hapus data">${ICONS.trash}</button>
            </td>
        `;
        historyBody.appendChild(tr);
    });
}

// ============================================================
//  CRUD
// ============================================================

async function hapusData(id) {
    if (!isAdmin()) {
        showToast('Hanya Manajemen yang dapat menghapus!', 'error');
        return;
    }
    if (!confirm('Hapus data ini?')) return;
    try {
        await deleteAbsensi(id);
        dataAbsensi = dataAbsensi.filter(d => d.id !== id);
        renderAll();
        showToast('Data dihapus', 'success');
    } catch (e) {
        console.error(e);
        showToast('Gagal menghapus (periksa hak akses)', 'error');
    }
}

// ============================================================
//  FORM HANDLERS
// ============================================================

// Absensi individual
absenForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!isAdmin()) {
        showToast('Hanya Manajemen yang dapat input!', 'error');
        return;
    }
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
    const rec = { tanggal: tgl, tahun: tahun, nama: nama, status: status, keterangan: ket };
    try {
        const id = await addAbsensi(rec);
        dataAbsensi.push({ id, ...rec });
        absenForm.reset();
        tanggalInput.valueAsDate = new Date();
        renderAll();
        showToast(`✅ ${nama} — ${status} berhasil dicatat`, 'success');
    } catch (err) {
        console.error(err);
        showToast('Gagal menyimpan (periksa hak akses)', 'error');
    }
});

// Cuti Bersama Masal
cutiMasalForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!isAdmin()) {
        showToast('Hanya Manajemen yang dapat input!', 'error');
        return;
    }
    const tgl = $('tanggalMasal').value;
    const ket = $('ketMasal').value.trim();
    if (!tgl || !ket) {
        showToast('Lengkapi tanggal dan keterangan!', 'error');
        return;
    }
    const tahun = tgl.split('-')[0];
    let added = 0;
    try {
        for (const p of listPersonel) {
            const sudah = dataAbsensi.some(d => d.nama === p.nama && d.tanggal === tgl);
            if (!sudah) {
                const rec = { tanggal: tgl, tahun: tahun, nama: p.nama, status: 'Cuti Bersama', keterangan: ket };
                const id = await addAbsensi(rec);
                dataAbsensi.push({ id, ...rec });
                added++;
            }
        }
        cutiMasalForm.reset();
        renderAll();
        showToast(`✅ Cuti Bersama ditambahkan untuk ${added} personel`, 'success');
    } catch (err) {
        console.error(err);
        showToast('Gagal menyimpan (periksa hak akses)', 'error');
    }
});

// Tambah Personel
personelForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!isAdmin()) {
        showToast('Hanya Manajemen yang dapat menambah!', 'error');
        return;
    }
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
    try {
        await savePersonel();
        personelForm.reset();
        renderAll();
        showToast(`✅ ${nama} ditambahkan sebagai ${kategori}`, 'success');
    } catch (err) {
        console.error(err);
        showToast('Gagal menyimpan (periksa hak akses)', 'error');
    }
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
//  EXPORT — SISA CUTI (Excel & PDF dengan tanda tangan)
//  Sesuai permintaan: Excel pakai data Sisa Cuti Karyawan saja
//  PDF ada "Mengetahui & Menyetujui" sesuai kantor
// ============================================================

function getQuotaRows(kategori) {
    const currentYear = new Date().getFullYear().toString();
    const filtered = listPersonel.filter(p => p.kategori === kategori);
    return filtered.map((p, idx) => {
        const recs = dataAbsensi.filter(d => d.nama === p.nama && (d.tahun === currentYear || !d.tahun));
        const sakit = recs.filter(d => d.status === 'Sakit').length;
        const cuti = recs.filter(d => d.status === 'Cuti').length;
        const cb = recs.filter(d => d.status === 'Cuti Bersama').length;
        const jatah = (typeof getJatahCuti === 'function') ? getJatahCuti(p.nama) : (p.jatahCuti !== undefined ? p.jatahCuti : 12);
        const sisa = Math.max(0, jatah - (cuti + cb));
        return { no: idx + 1, nama: p.nama, sakit, cuti, cb, sisa, jatah };
    });
}

function getSignatureConfig() {
    const isCabang = typeof IS_CABANG !== 'undefined' ? IS_CABANG : window.location.pathname.toLowerCase().includes('cabang');
    if (isCabang) {
        return { lokasi: 'Pamulang', tanggal: formatTanggalTTD(new Date()), nama: 'Titien Rahmawati', jabatan: 'Kepala Cabang', kantor: 'Cabang' };
    }
    return { lokasi: 'Pamulang', tanggal: formatTanggalTTD(new Date()), nama: 'Rainingsih Sedana', jabatan: 'Direktur', kantor: 'Pusat' };
}

function formatTanggalTTD(d) {
    const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

function exportQuotaExcel() {
    if (typeof XLSX === 'undefined') { showToast('Library Excel belum termuat', 'error'); return; }
    const rows = getQuotaRows('Karyawan');
    if (rows.length === 0) { showToast('Tidak ada data Sisa Cuti', 'info'); return; }
    const kantor = getSignatureConfig().kantor;
    const wb = XLSX.utils.book_new();
    // Header judul
    const title = `Sisa Cuti Karyawan — Kantor ${kantor} — ${new Date().getFullYear()}`;
    const aoa = [
        [title],
        [`Dicetak: ${formatTanggalTTD(new Date())}`],
        [],
        ['#', 'NAMA', 'SAKIT', 'CUTI', 'CB', 'SISA'],
    ];
    rows.forEach(r => {
        const sisaCell = r.jatah === 0 ? '-' : r.sisa;
        const namaCell = r.jatah === 0 ? `${r.nama} (Belum berhak cuti)` : r.nama;
        aoa.push([r.no, namaCell, r.sakit || '-', r.cuti || '-', r.cb || '-', sisaCell]);
    });
    // Tambah ringkasan di bawah
    aoa.push([]);
    aoa.push(['Mengetahui & Menyetujui,']);
    const sig = getSignatureConfig();
    aoa.push([`${sig.lokasi}, ${sig.tanggal}`]);
    aoa.push([]);
    aoa.push([]);
    aoa.push([sig.nama]);
    aoa.push([sig.jabatan]);

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    // Styling kolom
    ws['!cols'] = [{wch:4},{wch:24},{wch:7},{wch:7},{wch:7},{wch:7}];
    // Merge judul
    ws['!merges'] = [{s:{r:0,c:0},e:{r:0,c:5}}];
    XLSX.utils.book_append_sheet(wb, ws, `Sisa Cuti ${kantor}`);
    const fileName = `Wingsati_SisaCuti_${kantor}_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    showToast('📗 Excel Sisa Cuti berhasil diunduh', 'success');
}

function exportQuotaPDF() {
    if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') { showToast('Library PDF belum termuat', 'error'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const sig = getSignatureConfig();
    const rows = getQuotaRows('Karyawan');
    if (rows.length === 0) { showToast('Tidak ada data Sisa Cuti', 'info'); return; }

    // Header logo + judul
    const margin = 14;
    doc.setFont('helvetica','bold');
    doc.setFontSize(13);
    doc.setTextColor(15,59,94);
    doc.text(`BANK WINGSATI — Sisa Cuti Karyawan`, margin, 14);
    doc.setFontSize(9);
    doc.setFont('helvetica','normal');
    doc.setTextColor(100);
    doc.text(`Kantor ${sig.kantor}  •  Tahun ${new Date().getFullYear()}  •  Dicetak ${sig.lokasi}, ${sig.tanggal}`, margin, 20);
    doc.setDrawColor(15,59,94);
    doc.setLineWidth(0.6);
    doc.line(margin, 22, 210-margin, 22);

    const head = [['#','NAMA','SAKIT','CUTI','CB','SISA']];
    const body = rows.map(r => {
        const sisaCell = r.jatah === 0 ? '-' : r.sisa;
        const namaCell = r.jatah === 0 ? `${r.nama} *` : r.nama;
        return [r.no, namaCell, r.sakit || '-', r.cuti || '-', r.cb || '-', sisaCell];
    });

    doc.autoTable({
        startY: 26,
        head: head,
        body: body,
        theme: 'grid',
        headStyles: { fillColor: [15,59,94], textColor:255, fontStyle:'bold', halign:'center', fontSize:8 },
        columnStyles: {
            0: { halign:'center', cellWidth:10 },
            1: { cellWidth: 85 },
            2: { halign:'center' }, 3: { halign:'center' }, 4: { halign:'center' }, 5: { halign:'center', fontStyle:'bold' }
        },
        styles: { font:'helvetica', fontSize:8, cellPadding:2.2 },
        alternateRowStyles: { fillColor: [246,248,251] },
        didParseCell: function(data){
            if(data.section==='body' && data.column.index===5){
                const v = data.cell.raw;
                if(v==='-') data.cell.styles.textColor=[120,120,120];
                else if(v===0) data.cell.styles.textColor=[220,38,38];
                else if(v<=2) data.cell.styles.textColor=[234,88,12];
                else data.cell.styles.textColor=[22,163,74];
            }
        }
    });
    // Catatan kaki untuk yang belum berhak
    const hasBelumBerhak = rows.some(r=>r.jatah===0);
    if (hasBelumBerhak) {
        doc.setFontSize(7);
        doc.setTextColor(120);
        doc.setFont('helvetica','italic');
        doc.text('* Belum 12 bulan — belum berhak cuti (jatah 0)', margin, doc.lastAutoTable.finalY + 6);
    }

    // Tanda tangan di kanan bawah — rapi tanpa bayangan
    let finalY = doc.lastAutoTable.finalY + 12;
    // jika ada footnote, geser tanda tangan sedikit
    if (rows.some(r=>r.jatah===0)) finalY += 4;
    if (finalY > 242) { doc.addPage(); finalY = 22; }
    const sigX = 128;
    const sigW = 58;
    doc.setFont('helvetica','normal');
    doc.setFontSize(9);
    doc.setTextColor(30);
    doc.text(`${sig.lokasi}, ${sig.tanggal}`, sigX, finalY, { align: 'left' });
    doc.text('Mengetahui & Menyetujui,', sigX, finalY+6, { align: 'left' });
    // ruang tanda tangan ~22mm
    doc.setFont('helvetica','bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 15, 15);
    doc.text(sig.nama, sigX, finalY+30, { align: 'left' });
    // garis tipis pas di bawah nama
    doc.setDrawColor(60);
    doc.setLineWidth(0.35);
    doc.line(sigX, finalY+31, sigX+sigW, finalY+31);
    doc.setFont('helvetica','normal');
    doc.setFontSize(8);
    doc.setTextColor(80);
    doc.text(sig.jabatan, sigX, finalY+34);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(130);
    doc.text(`Wingsati HR • Data tersinkron di Cloud Firestore (${sig.kantor === 'Cabang' ? 'absensi_cabang' : 'absensi'})`, margin, 287);

    const fileName = `Wingsati_SisaCuti_${sig.kantor}_${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(fileName);
    showToast('📄 PDF Sisa Cuti berhasil diunduh', 'success');
}

// Lama: Ekspor riwayat CSV (tetap ada untuk kompatibilitas, dipanggil via toolbar Riwayat)
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
    const kantor = (typeof IS_CABANG !== 'undefined' && IS_CABANG) ? 'Cabang' : 'Pusat';
    a.download = `wingsati_riwayat_${kantor}_${new Date().toISOString().slice(0,10)}.csv`;
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
    icon.innerHTML = next === 'dark' ? ICONS.sun : ICONS.moon;
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
        btn.innerHTML = `${ICONS.eye} Sembunyikan`;
        localStorage.setItem('wingsati_history_visible', 'true');
    } else {
        content.style.display = 'none';
        btn.innerHTML = `${ICONS.eyeSlash} Tampilkan`;
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
        btn.innerHTML = `${ICONS.eyeSlash} Tampilkan`;
    } else {
        content.style.display = 'block';
        btn.innerHTML = `${ICONS.eye} Sembunyikan`;
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
    icon.innerHTML = savedTheme === 'dark' ? ICONS.sun : ICONS.moon;

    // Load history toggle state
    loadHistoryState();

    // Terapkan pembatasan berdasarkan role (admin / karyawan)
    if (typeof applyRoleUI === 'function') applyRoleUI();
}

// ============================================================
//  INIT
//  Render dipicu oleh firebase-sync.js (onAuthStateChanged)
//  setelah data berhasil dimuat dari Firestore.
// ============================================================

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