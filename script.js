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

    // TANPA JAM
    let tanggal = new Date().toISOString().split("T")[0];

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

// TAMBAH DATA

function tambahData(){
    let tanggal = document.getElementById("tanggal").value;
    let nama = document.getElementById("nama").value;
    let jumlah = document.getElementById("jumlah").value;
    if(tanggal == "" || nama == "" || jumlah == ""){
        alert("Isi semua data!");
        return;
    }

    let angkaJumlah = ambilAngka(jumlah);
    let saldoSekarang = ambilAngka(document.getElementById("sisaSaldo").innerText);
    if(
        nama !== "Tambah Saldo" &&
        angkaJumlah > saldoSekarang
    ){
        alert("Saldo tidak mencukupi!");
        return;
    }

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
    else{
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
}

// RESET SALDO
function simpanSaldo(){
    let konfirmasi = confirm(
        "Pindahkan sisa saldo ke tabungan?"
    );

    if(!konfirmasi) return;

    let totalMasuk = 0;
    let totalKeluar = 0;

    // HITUNG SALDO AKTIF
    for(let i = 0; i < dataPengeluaran.length; i++){
        let item = dataPengeluaran[i];

        // TAMBAH SALDO
        if(item.nama === "Tambah Saldo"){
            totalMasuk += Number(item.jumlah);
        }

        // MASUK TABUNGAN
        else if(item.nama === "Masuk Tabungan"){
            // RESET 
            totalMasuk = 0;
            totalKeluar = 0;
            continue;
        }

        // AMBIL TABUNGAN
        else if(item.nama === "Ambil Tabungan"){
            totalMasuk += Number(item.jumlah);
        }

        // PENGELUARAN
        else{
            totalKeluar += Number(item.jumlah);
        }
    }

    let sisa = totalMasuk - totalKeluar;
    let tanggal =
    new Date().toISOString().split("T")[0];

    // PINDAH KE TABUNGAN
    fetch("/tambah",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            tanggal: tanggal,
            nama: "Masuk Tabungan",
            jumlah: sisa
        })
    })

    .then(res => res.text())
    .then(() => {
        alert("Saldo dipindahkan");
        ambilData();
    })

    .catch(err => {
        console.log(err);
        alert("Gagal");
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
    let isi =
    document.getElementById("isiData");
    isi.innerHTML = "";

    let isiTabungan =
    document.getElementById("isiTabungan");
    isiTabungan.innerHTML = "";

    let totalMasuk = 0;
    let totalKeluar = 0;
    let totalTabungan = 0;
    let resetAktif = false;

    for(let i = 0; i < dataPengeluaran.length; i++){
        let item = dataPengeluaran[i];

        // MASUK TABUNGAN
        if(item.nama === "Masuk Tabungan"){
            // RESET RINGKASAN 
            resetAktif = true;
            totalMasuk = 0;
            totalKeluar = 0;
            totalTabungan +=
            Number(item.jumlah);
            isiTabungan.innerHTML += `
            <tr>
                <td>${formatTanggal(item.tanggal)}</td>
                <td>Masuk</td>
                <td>Rp ${rupiah(item.jumlah)}</td>
            </tr>
            `;
        }

        // AMBIL TABUNGAN
        else if(item.nama === "Ambil Tabungan"){
            totalTabungan -=
            Number(item.jumlah);
            isiTabungan.innerHTML += `
            <tr>
                <td>${formatTanggal(item.tanggal)}</td>
                <td>Ambil</td>
                <td>Rp ${rupiah(item.jumlah)}</td>
            </tr>
            `;
        }

        // HITUNG RINGKASAN
        if(!resetAktif){

            // TAMBAH SALDO
            if(item.nama === "Tambah Saldo"){
                totalMasuk +=
                Number(item.jumlah);
            }

            // PENGELUARAN
            else if(
                item.nama !== "Masuk Tabungan" &&
                item.nama !== "Ambil Tabungan"
            ){
                totalKeluar +=
                Number(item.jumlah);
            }
        }

        // TAMPIL RIWAYAT
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

    document.getElementById("tampilSaldo").innerText ="Rp " + rupiah(totalMasuk);
    document.getElementById("totalKeluar").innerText ="Rp " + rupiah(totalKeluar);
    document.getElementById("sisaSaldo").innerText ="Rp " + rupiah(totalMasuk - totalKeluar);
    document.getElementById("totalTabungan").innerText ="Rp " + rupiah(totalTabungan);
}

// HAPUS DATA
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

// EDIT DATA
function editData(id){
    let item = dataPengeluaran.find(d => d.id == id);

    document.getElementById("tanggal").value = item.tanggal.split("T")[0];
    document.getElementById("nama").value = item.nama;
    document.getElementById("jumlah").value = item.jumlah;

    editId = id;
}

// RIWAYAT TABUNGAN
function toggleRiwayatTabungan(){
    let riwayat =
    document.getElementById("riwayatTabungan");

    if(riwayat.style.display == "none"){
        riwayat.style.display = "block";

    }else{
        riwayat.style.display = "none";
    }
}

// AMBIL TABUNGAN
function ambilTabungan(){
    let input = document.getElementById("inputTabungan").value;
    let ambil = ambilAngka(input);

    // VALIDASI
    if(ambil <= 0){
        alert("Masukkan nominal!");
        return;
    }

    // AMBIL TOTAL TABUNGAN
    let totalTabungan = ambilAngka(document.getElementById("totalTabungan").innerText);

    // CEK SALDO TABUNGAN
    if(ambil > totalTabungan){
        alert("Saldo tabungan tidak cukup!");
        return;
    }

    let tanggal = new Date().toISOString().split("T")[0];

    // SIMPAN RIWAYAT AMBIL TABUNGAN
    fetch("/tambah",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            tanggal: tanggal,
            nama: "Ambil Tabungan",
            jumlah: ambil
        })
    })
    .then(res => res.text())
    .then(() => {

        // MASUKKAN KE SALDO AKTIF
        return fetch("/tambah",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                tanggal: tanggal,
                nama: "Tambah Saldo",
                jumlah: ambil
            })
        });
    })

    .then(res => res.text())
    .then(() => {
        alert("Uang berhasil diambil dari tabungan");
        document.getElementById("inputTabungan").value = "";
        ambilData();
    });
}
