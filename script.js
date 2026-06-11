let hargaMejaAktif = 0;
let hargaFBAktif = 0;
let durasiJamAktif = 1; 
let intervalStopwatch = null;

function kalkulasiUlangBiaya() {
    // Rumus: (Harga Meja + Makanan) x Jumlah Jam Sewa
    const totalHarga = (hargaMejaAktif + hargaFBAktif) * durasiJamAktif;
    const labelTotal = document.getElementById('total-biaya');
    if (labelTotal) {
        labelTotal.innerText = 'Rp ' + totalHarga.toLocaleString('id-ID');
    }
}

function selectSeat(num) {
    if (['13', '15', '16'].includes(num)) {
        hargaMejaAktif = 25000; 
    } else {
        hargaMejaAktif = 15000; 
    }
    
    document.querySelectorAll('.seat-btn').forEach(b => {
        b.classList.remove('bg-gundam-blue', 'border-gundam-yellow', 'text-white');
        b.classList.add('bg-gundam-dark', 'border-gray-700', 'text-gray-300');
    });
    
    const selectedBtn = document.getElementById('seat-' + num);
    if(selectedBtn) {
        selectedBtn.classList.remove('bg-gundam-dark', 'border-gray-700', 'text-gray-300');
        selectedBtn.classList.add('bg-gundam-blue', 'border-gundam-yellow', 'text-white');
    }
    
    const inputMeja = document.getElementById('input-meja');
    if (inputMeja) {
        inputMeja.value = 'DECK ' + num;
    }

    kalkulasiUlangBiaya();
}
window.selectSeat = selectSeat;

document.addEventListener('DOMContentLoaded', () => {
    const dropdownDurasi = document.getElementById('input-durasi');
    const dropdownKonsumsi = document.getElementById('input-konsumsi');

    if (dropdownDurasi) {
        dropdownDurasi.addEventListener('change', function(e) {
            durasiJamAktif = parseInt(e.target.value) || 1;
            kalkulasiUlangBiaya();
        });
    }

    if (dropdownKonsumsi) {
        dropdownKonsumsi.addEventListener('change', function(e) {
            const pilihan = e.target.value;
            if (pilihan === 'Gundam Fuel (Kopi + Donat)') {
                hargaFBAktif = 25000;
            } else if (pilihan === "Char's Custom (Spicy Fries)") {
                hargaFBAktif = 30000;
            } else {
                hargaFBAktif = 0;
            }
            kalkulasiUlangBiaya();
        });
    }
});


function jalankanStopwatchWorkshop(nama, deck) {
    if (intervalStopwatch) clearInterval(intervalStopwatch);

    const panel = document.getElementById('panel-stopwatch');
    const txtNama = document.getElementById('stopwatch-nama');
    const txtDeck = document.getElementById('stopwatch-deck');
    const txtWaktu = document.getElementById('stopwatch-waktu');

    if (!panel || !txtWaktu) return;

    txtNama.innerText = nama;
    txtDeck.innerText = deck;
    panel.classList.remove('hidden'); 

    let totalDetik = 0;
    intervalStopwatch = setInterval(() => {
        totalDetik++;
        
        let jam = Math.floor(totalDetik / 3600);
        let menit = Math.floor((totalDetik % 3600) / 60);
        let detik = totalDetik % 60;

        let formatJam = jam.toString().padStart(2, '0');
        let formatMenit = menit.toString().padStart(2, '0');
        let formatDetik = detik.toString().padStart(2, '0');

        txtWaktu.innerText = `${formatJam}:${formatMenit}:${formatDetik}`;
    }, 1000); 
}

const supabaseUrl = 'https://ukltnptwfasmvxrmqhts.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbHRucHR3ZmFzbXZ4cm1xaHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NzU0NjIsImV4cCI6MjA5NjU1MTQ2Mn0.Y_2Qia3VEfr-ord9mZ6J5v9SvRkqXCWLC4nRrtAJXfo'; 

let supabaseClient;
try {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
} catch (err) {
    console.error("Supabase error:", err);
}



const formReservasi = document.getElementById('form-reservasi');
if (formReservasi) {
    formReservasi.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const namaPemesan = document.getElementById('input-nama').value;
        const mejaDipilih = document.getElementById('input-meja').value;
        const konsumsiDipilih = document.getElementById('input-konsumsi').value;
        const durasiPilihanTeks = document.getElementById('input-durasi').value + ' Jam';
        const totalHargaFinal = (hargaMejaAktif + hargaFBAktif) * durasiJamAktif;
        const btnSubmit = document.getElementById('btn-submit');

        if (!mejaDipilih) {
            Swal.fire({
                title: 'LAUNCH ERROR!',
                Text: 'Silahkan tentukan deck instalasi meja anda pada radar denah kiri!',
                icon:'Warning',
                background:'1A1E24',
                color:'F5F7FA',
                confirmButtoncolor:'EFC028',
                confirmButtonText:'Mengerti'
            })
            return;
        }

        if (btnSubmit) {
            btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Triggering Hyperdrive...';
            btnSubmit.disabled = true;
        }

        const { data, error } = await supabaseClient
            .from('PlamoHub')
            .insert([{ 
                nama: namaPemesan, 
                meja: mejaDipilih, 
                status: 'Confirmed',
                konsumsi: konsumsiDipilih,
                total_harga: totalHargaFinal,
                durasi: durasiPilihanTeks 
            }]);

        if (error) {
            console.error("Error Supabase:", error);
            Swal.fire({
                title: 'LAUNCH ABORTED!',
                Text: 'Hambatan: '  + eror.message,
                icon:'error',
                background:'1A1E24',
                color:'F5F7FA',
                confirmButtoncolor:'C8313E',
                confirmButtonText:'PERBAIKI SISTEM'
            })
        } 
        else {
            Swal.fire({
                ttitle: 'SYSTEM ALL GREEN!',
        html: `
            <div class="relative p-4 mt-2">
                <div class="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-emerald-400 opacity-70"></div>
                <div class="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-400 opacity-70"></div>
                <div class="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-emerald-400 opacity-70"></div>
                <div class="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-emerald-400 opacity-70"></div>

                <div class="space-y-4">
                    <p class="text-gray-300 font-mono text-sm tracking-widest uppercase">Data misi sukses direkam.</p>
                    <p class="text-gundam-yellow font-mono text-xs animate-pulse">>> Mengaktifkan Stopwatch Merakit...</p>
                </div>
            </div>
        `,
        showConfirmButton: true,
        confirmButtonText: '<i class="fa-solid fa-rocket mr-2"></i> LAUNCH SORTIE',
        buttonsStyling: false, // Wajib dimatikan agar CSS kita bisa masuk
        customClass: {
            popup: 'swal-scifi-popup',
            title: 'swal-scifi-title',
            confirmButton: 'swal-scifi-confirm'
        },
        background: 'transparent',
        // Backdrop (latar belakang luar pop-up) dibuat agak gelap
        backdrop: `rgba(0, 5, 15, 0.8)`
    });
            
            jalankanStopwatchWorkshop(namaPemesan, mejaDipilih);

            // Reset Form & State Biaya
            document.getElementById('input-nama').value = '';
            document.getElementById('input-konsumsi').value = 'Tanpa Konsumsi';
            document.getElementById('input-durasi').value = '1';
            hargaMejaAktif = 0;
            hargaFBAktif = 0;
            durasiJamAktif = 1;
            kalkulasiUlangBiaya();
            
            fetchDataDariCloud(); 
        }

        if (btnSubmit) {
            btnSubmit.innerHTML = 'LAUNCH SORTIE (Kunci Reservasi)';
            btnSubmit.disabled = false;
        }
    });
}


async function fetchDataDariCloud() {
    const tbody = document.getElementById('tabel-booking');
    if(!tbody) return;

    if (!supabaseClient) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-2 py-4 text-center text-red-400">Database Offline.</td></tr>';
        return;
    }

    const { data, error } = await supabaseClient
        .from('PlamoHub')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Fetch error:", error);
        tbody.innerHTML = '<tr><td colspan="4" class="px-2 py-4 text-center text-red-400">Gagal sinkronisasi data cloud.</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-2 py-4 text-center text-gray-600 italic">Belum ada data peluncuran di cloud.</td></tr>';
        return;
    }

    data.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-800/40 hover:bg-gundam-dark transition-colors';
        
        const formatBiayaDiTabel = item.total_harga ? 'Rp ' + item.total_harga.toLocaleString('id-ID') : 'Rp 0';
        
        // Gabungkan info konsumsi dan durasi agar tabel tetap padat ringkas
        const displayDurasi = item.durasi ? item.durasi : '1 Jam';

        row.innerHTML = `
            <td class="px-2 py-2 font-medium text-gray-300 max-w-[90px] truncate">${item.nama}</td>
            <td class="px-2 py-2 font-mono text-gundam-yellow">${item.meja}</td>
            <td class="px-2 py-2 text-gray-400 font-mono">${displayDurasi}</td>
            <td class="px-2 py-2 font-mono text-emerald-400 font-bold">${formatBiayaDiTabel}</td>
        `;
        tbody.appendChild(row);
    });
}

window.onload = fetchDataDariCloud;
