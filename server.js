const express = require("express");
const mysql = require("mysql2");
const app = express();

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "catatan_keuangan"
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

// TAMBAH DATA
app.post("/tambah", function(req,res){

    let { tanggal, nama, jumlah } = req.body;

    let sql = "INSERT INTO riwayat (tanggal,nama,jumlah) VALUES (?,?,?)";

    db.query(sql,[tanggal,nama,jumlah], function(err){
        if(err){
            console.log(err);
            res.send("Gagal tambah data");
        }else{
            res.send("Berhasil tambah data");
        }
    });

});

// AMBIL DATA
app.get("/data", function(req,res){

    let sql = "SELECT * FROM riwayat ORDER BY id DESC";

    db.query(sql, function(err,result){
        if(err){
            console.log(err);
            res.json([]);
        }else{
            res.json(result);
        }
    });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function(){
    console.log("Server berjalan di port " + PORT);
});

// HAPUS DATA
app.delete("/hapus/:id", function(req,res){

    let id = req.params.id;

    let sql = "DELETE FROM riwayat WHERE id = ?";

    db.query(sql,[id], function(err){
        if(err){
            console.log(err);
            res.send("Gagal hapus");
        }else{
            res.send("Berhasil hapus");
        }
    });

});

// EDIT DATA
app.put("/edit/:id", function(req,res){

    let id = req.params.id;
    let { tanggal, nama, jumlah } = req.body;

    let sql = "UPDATE riwayat SET tanggal=?, nama=?, jumlah=? WHERE id=?";

    db.query(sql,[tanggal,nama,jumlah,id], function(err){
        if(err){
            console.log(err);
            res.send("Gagal edit");
        }else{
            res.send("Berhasil edit");
        }
    });

});