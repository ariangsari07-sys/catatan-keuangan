const express = require("express");
const mysql = require ("mysql2");
const app = express();

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "catatan_uang"
});

db.connect(function(err){
    if(err){
        console.log("Koneksi gagal");
    }else{
        console.log("Database tersambung");
    }
});

app.use(express.static(__dirname));

app.use(express.json());

app.post("/tambah", function(req,res){

    let tanggal = req.body.tanggal;
    let nama = req.body.nama;
    let jumlah = req.body.jumlah;

    let sql = "INSERT INTO pengeluaran (tanggal,nama,jumlah) VALUES (?,?,?)";

    db.query(sql,[tanggal,nama,jumlah], function(err,result){

        if(err){
            res.send("Gagal tambah data");
        }else{
            res.send("Berhasil tambah data");
        }

    });

});

app.get("/data", function(req,res){

    let sql = "SELECT * FROM pengeluaran ORDER BY id DESC";

    db.query(sql, function(err,result){

        if(err){
            res.send([]);
        }else{
            res.json(result);
        }

    });

});

app.get("/data", function(req,res){

    let sql = "SELECT * FROM pengeluaran ORDER BY id DESC";

    db.query(sql, function(err,result){

        if(err){
            res.send([]);
        }else{
            res.json(result);
        }

    });

});
app.listen(3000, function(){
    console.log("Server berjalan di http://localhost:3000");
});

function ambilData(){

    fetch("/data")
    .then(response => response.json())
    .then(data => {

        dataPengeluaran = data;

        tampilData();

    });

}