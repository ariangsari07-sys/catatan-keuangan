let saldoAwal = 0;
let dataPengeluaran = [];
let editIndex = -1;

// FORMAT ANGKA OTOMATIS
function formatAngka(input){

    let angka = input.value.replace(/[^0-9]/g,'');

    if(angka == ""){
        input.value = "";
        return;
    }

    input.value = "Rp." + Number(angka).toLocaleString("id-ID");
}

// AMBIL ANGKA ASLI
function ambilAngka(teks){
    return Number(teks.replace(/[^0-9]/g,''));
}

// FORMAT RUPIAH
function rupiah(angka){
    return angka.toLocaleString("id-ID");
}

// SIMPAN SALDO
function simpanSaldo(){

    let isiInput = document.getElementById("saldoAwal").value;

    saldoAwal = ambilAngka(isiInput);

    if(isNaN(saldoAwal)){
        saldoAwal = 0;
    }

    tampilData();
}

function tambahSaldo(){

    let isiInput = document.getElementById("saldoAwal").value;

    let tambah = ambilAngka(isiInput);

    saldoAwal = saldoAwal + tambah;

    document.getElementById("saldoAwal").value = "";

    tampilData();
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
    .then(response => response.text())
    .then(data => {

        alert(data);

        // tambahkan ke array lokal
        dataPengeluaran.push({
            tanggal: tanggal,
            nama: nama,
            jumlah: angkaJumlah
        });

        tampilData();

        document.getElementById("tanggal").value = "";
        document.getElementById("nama").value = "";
        document.getElementById("jumlah").value = "";

    });

}

// TAMPIL DATA
function tampilData(){

    let isi = document.getElementById("isiData");
    isi.innerHTML = "";

    let total = 0;

    for(let i=0; i<dataPengeluaran.length; i++){

        total += dataPengeluaran[i].jumlah;

        isi.innerHTML += `
        <tr>
            <td>${dataPengeluaran[i].tanggal}</td>
            <td>${dataPengeluaran[i].nama}</td>
            <td>Rp ${rupiah(dataPengeluaran[i].jumlah)}</td>
            <td>
                <button class="edit" onclick="editData(${i})">Edit</button>
                <button class="hapus" onclick="hapusData(${i})">Hapus</button>
            </td>
        </tr>
        `;
    }

    document.getElementById("tampilSaldo").innerText = "Rp " + rupiah(saldoAwal);
    document.getElementById("totalKeluar").innerText = "Rp " + rupiah(total);
    document.getElementById("sisaSaldo").innerText = "Rp " + rupiah(saldoAwal - total);
}

tampilData();
// HAPUS
function hapusData(index){
    dataPengeluaran.splice(index,1);
    tampilData();
}

// EDIT
function editData(index){

    document.getElementById("tanggal").value = dataPengeluaran[index].tanggal;
    document.getElementById("nama").value = dataPengeluaran[index].nama;
    document.getElementById("jumlah").value = dataPengeluaran[index].jumlah.toLocaleString("id-ID");

    editIndex = index;
}

tampilData();