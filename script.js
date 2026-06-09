// =========================================================================
// 1. LOGIKA ANTARMUKA (DI-RENDER PERTAMA AGAR TOMBOL ANTI-MACET)
// =========================================================================
function selectSeat(num) {
    console.log("Meja " + num + " diklik."); // Log untuk debugging di console
    
    // Reset semua warna tombol meja ke semula
    document.querySelectorAll('.seat-btn').forEach(b => {
        b.classList.remove('bg-blue-600', 'border-blue-400', 'text-white');
        b.classList.add('bg-slate-900', 'border-slate-800');
    });
    
    // Berikan efek aktif warna biru pada meja yang dipilih
    const selectedBtn = document.getElementById('seat-' + num);
    if(selectedBtn) {
        selectedBtn.classList.remove('bg-slate-900', 'border-slate-800');
        selectedBtn.classList.add('bg-blue-600', 'border-blue-400', 'text-white');
    }
    
    // Masukkan nomor meja ke dalam kolom input form
    const inputMeja = document.getElementById('input-meja');
    if (inputMeja) {
        inputMeja.value = 'MEJA ' + num;
    }
}

// Daftarkan fungsi ke window global agar bisa dibaca oleh 'onclick' di HTML
window.selectSeat = selectSeat;


// =========================================================================
// 2. KONEKSI DATABASE CLOUD (MENGGUNAKAN ANON KEY ASLI)
// =========================================================================
const supabaseUrl = 'https://ukltnptwfasmvxrmqhts.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbHRucHR3ZmFzbXZ4cm1xaHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NzU0NjIsImV4cCI6MjA5NjU1MTQ2Mn0.Y_2Qia3VEfr-ord9mZ6J5v9SvRkqXCWLC4nRrtAJXfo'; 

let supabaseClient;
try {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
} catch (err) {
    console.error("Supabase gagal inisialisasi:", err);
}


// =========================================================================
// 3. TRANSMISI DATA: FORM SUBMIT KE SUPABASE (SUDAH INCLUDE KONSUMSI)
// =========================================================================
const formReservasi = document.getElementById('form-reservasi');
if (formReservasi) {
    formReservasi.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const namaPemesan = document.getElementById('input-nama').value;
        const mejaDipilih = document.getElementById('input-meja').value;
        const konsumsiDipilih = document.getElementById('input-konsumsi').value; // Ambil nilai dropdown F&B
        const btnSubmit = document.getElementById('btn-submit');

        if (!mejaDipilih) {
            alert('Silakan pilih nomor meja Anda terlebih dahulu pada denah!');
            return;
        }

        if (btnSubmit) {
            btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';
            btnSubmit.disabled = true;
        }

        // Tembak data ke database termasuk kolom 'konsumsi' yang baru dibuat
        const { data, error } = await supabaseClient
            .from('PlamoHub')
            .insert([{ 
                nama: namaPemesan, 
                meja: mejaDipilih, 
                status: 'Confirmed',
                konsumsi: konsumsiDipilih // Mengirim ke laci kolom 'konsumsi' di cloud
            }]);

        if (error) {
            console.error("Error dari Supabase:", error);
            alert("Gagal Menyimpan! Hambatan: " + error.message);
        } else {
            alert("Successfull! Data reservasi dan paket hidangan berhasil masuk ke Cloud Supabase!");
            document.getElementById('input-nama').value = ''; 
            document.getElementById('input-konsumsi').value = 'Tanpa Konsumsi'; // Reset dropdown
            fetchDataDariCloud(); 
        }

        if (btnSubmit) {
            btnSubmit.innerHTML = 'Kunci Reservasi';
            btnSubmit.disabled = false;
        }
    });
}


// =========================================================================
// 4. RETRIEVAL DATA: AMBIL DATA DARI CLOUD KE TABEL REAL-TIME
// =========================================================================
async function fetchDataDariCloud() {
    const tbody = document.getElementById('tabel-booking');
    if(!tbody) return;

    if (!supabaseClient) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-2 py-4 text-center text-red-400">Database tidak terkonfigurasi.</td></tr>';
        return;
    }

    const { data, error } = await supabaseClient
        .from('PlamoHub')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Fetch error:", error);
        tbody.innerHTML = '<tr><td colspan="4" class="px-2 py-4 text-center text-red-400">Gagal memuat data dari cloud.</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-2 py-4 text-center text-slate-600 italic">Belum ada data di basis data cloud.</td></tr>';
        return;
    }

    data.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'border-b border-slate-800/40 hover:bg-slate-900 transition-colors';
        
        // Atur tampilan ringkas jika tanpa konsumsi agar tabel tetap rapi
        const displayKonsumsi = item.konsumsi ? item.konsumsi : '-';

        row.innerHTML = `
            <td class="px-2 py-2 font-medium text-slate-300 max-w-[90px] truncate">${item.nama}</td>
            <td class="px-2 py-2 font-mono text-blue-400">${item.meja}</td>
            <td class="px-2 py-2 text-slate-400 max-w-[120px] truncate">${displayKonsumsi}</td>
            <td class="px-2 py-2 text-emerald-400 text-center"><i class="fa-solid fa-circle-check"></i></td>
        `;
        tbody.appendChild(row);
    });
}

// Jalankan otomatis saat halaman selesai dimuat
window.onload = fetchDataDariCloud;