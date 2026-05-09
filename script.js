let dataPengeluaran = [];
let editIndex = -1;
let editId = null;

// FORMAT ANGKA
function formatAngka(input){
    let angka = input.value.replace(/[^0-9]/g,'');

    if(angka == ""){
        input.value = "";
        return;
    }

    input.value = "Rp." + Number(angka).toLocaleString("id-ID");
}

// AMBIL ANGKA
function ambilAngka(teks){
    return Number(teks.replace(/[^0-9]/g,''));
}

// FORMAT RUPIAH
function rupiah(angka){
    return Number(angka).toLocaleString("id-ID");
}

// FORMAT TANGGAL + HARI
function formatTanggal(tanggal){
    let t = new Date(tanggal);

    return t.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}

// TAMBAH SALDO
function tambahSaldo(){

    let isiInput = document.getElementById("saldoAwal").value;
    let tambah = ambilAngka(isiInput);

    if(tambah <= 0){
        alert("Masukkan nominal yang benar!");
        return;
    }

    let tanggal = new Date().toISOString();

    fetch("/tambah",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            tanggal: tanggal,
            nama: "Tambah Saldo",
            jumlah: tambah
        })
    })
    .then(res => res.text())
    .then(data => {
        alert(data);
        document.getElementById("saldoAwal").value = "";
        ambilData();
    });
}

// TAMBAH PENGELUARAN
function tambahData(){

    let tanggal = document.getElementById("tanggal").value;
    let nama = document.getElementById("nama").value;
    let jumlah = document.getElementById("jumlah").value;

    if(tanggal == "" || nama == "" || jumlah == ""){
        alert("Isi semua data!");
        return;
    }

    let angkaJumlah = ambilAngka(jumlah);

    // MODE EDIT
    if(editId !== null){

        fetch(`/edit/${editId}`,{
            method:"PUT",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                tanggal: tanggal,
                nama: nama,
                jumlah: angkaJumlah
            })
        })
        .then(res => res.text())
        .then(data => {
            alert(data);
            editId = null;
            ambilData();
        });

    } 
    // MODE TAMBAH
    else {

        fetch("/tambah",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                tanggal: tanggal,
                nama: nama,
                jumlah: angkaJumlah
            })
        })
        .then(res => res.text())
        .then(data => {
            alert(data);
            ambilData();
        });
    }

    document.getElementById("tanggal").value = "";
    document.getElementById("nama").value = "";
    document.getElementById("jumlah").value = "";

    console.log("EDIT ID:", editId);
}

// RESET SALDO (TIDAK HAPUS DATA)
function simpanSaldo(){

    let konfirmasi = confirm("Simpan sisa saldo ke tabungan & reset?");
    if(!konfirmasi) return;

    // HITUNG SISA DARI DATA SEKARANG
    let totalMasuk = 0;
    let totalKeluar = 0;

    for(let i = dataPengeluaran.length - 1; i >= 0; i--){

        let item = dataPengeluaran[i];

        if(item.nama === "Reset Saldo"){
            totalMasuk = 0;
            totalKeluar = 0;
        }
        else if(item.nama === "Tambah Saldo"){
            totalMasuk += Number(item.jumlah);
        }
        else if(item.nama !== "Tabungan"){
            totalKeluar += Number(item.jumlah);
        }
    }

    let sisa = totalMasuk - totalKeluar;

    let tanggal = new Date().toISOString();

    // SIMPAN KE TABUNGAN
    fetch("/tambah",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
            tanggal: tanggal,
            nama: "Tabungan",
            jumlah: sisa
        })
    })
    .then(() => {

        // RESET BULAN
        return fetch("/tambah",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({
                tanggal: tanggal,
                nama: "Reset Saldo",
                jumlah: 0
            })
        });

    })
    .then(() => {
        alert("Saldo dipindahkan ke tabungan & berhasil reset");
        ambilData();
    });
}

// AMBIL DATA
function ambilData(){

    fetch("/data")
    .then(res => res.json())
    .then(data => {

        dataPengeluaran = data;
        tampilData();

    });

}

// TAMPIL DATA
function tampilData(){

    let isi = document.getElementById("isiData");
    isi.innerHTML = "";

    let totalMasuk = 0;
    let totalKeluar = 0;
    let totalTabungan = 0;

    for(let i=dataPengeluaran.length - 1; i >= 0; i--){

        let item = dataPengeluaran[i];

        // RESET BULAN
        if(item.nama === "Tabungan"){
            totalTabungan += Number(item.jumlah);
        }

        else if(item.nama === "Reset Saldo"){
            totalMasuk = 0;
            totalKeluar = 0;
        }

        else if(item.nama === "Tambah Saldo"){
            totalMasuk += Number(item.jumlah);
        } 
        
        else {
            totalKeluar += Number(item.jumlah);
        }

        isi.innerHTML += `
        <tr>
            <td>${formatTanggal(item.tanggal)}</td>
            <td>${item.nama}</td>
            <td>Rp ${rupiah(item.jumlah)}</td>
            <td>
                <button class="btn-edit" onclick="editData(${item.id})">Edit</button>
                <button class="btn-hapus" onclick="hapusData(${item.id})">Hapus</button>
            </td>
        </tr>
        `;
    }

    document.getElementById("tampilSaldo").innerText = "Rp " + rupiah(totalMasuk);
    document.getElementById("totalKeluar").innerText = "Rp " + rupiah(totalKeluar);
    document.getElementById("sisaSaldo").innerText = "Rp " + rupiah(totalMasuk - totalKeluar);
    document.getElementById("tabungan").innerText = "Rp " + rupiah(totalTabungan);
}

ambilData();

//HAPUS DATA
function hapusData(id){

    let konfirmasi = confirm("Yakin mau hapus data ini?");
    if(!konfirmasi) return;

    fetch(`/hapus/${id}`,{
        method:"DELETE"
    })
    .then(res => res.text())
    .then(data => {
        alert(data);
        ambilData();
    });
}

//EDIT DATA
function editData(id){

    let item = dataPengeluaran.find(d => d.id == id);

    document.getElementById("tanggal").value = item.tanggal.split("T")[0];
    document.getElementById("nama").value = item.nama;
    document.getElementById("jumlah").value = item.jumlah;

    editId = id;
}

