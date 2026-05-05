const express = require("express");
const { Pool } = require("pg");
const app = express();

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
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
app.post("/tambah", async (req, res) => {
    let { tanggal, nama, jumlah } = req.body;

    try {
        await db.query(
            "INSERT INTO riwayat (tanggal, nama, jumlah) VALUES ($1, $2, $3)",
            [tanggal, nama, jumlah]
        );
        res.send("Berhasil tambah data");
    } catch (err) {
        console.log(err);
        res.send("Gagal tambah data");
    }
});

// AMBIL DATA
app.get("/data", async (req, res) => {
    try {
        let result = await db.query("SELECT * FROM riwayat ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.json([]);
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function(){
    console.log("Server berjalan di port " + PORT);
});

// HAPUS DATA
app.delete("/hapus/:id", async (req, res) => {
    let id = req.params.id;

    try {
        await db.query("DELETE FROM riwayat WHERE id = $1", [id]);
        res.send("Berhasil hapus");
    } catch (err) {
        console.log(err);
        res.send("Gagal hapus");
    }
});

// EDIT DATA
app.put("/edit/:id", async (req, res) => {
    let id = req.params.id;
    let { tanggal, nama, jumlah } = req.body;

    try {
        await db.query(
            "UPDATE riwayat SET tanggal=$1, nama=$2, jumlah=$3 WHERE id=$4",
            [tanggal, nama, jumlah, id]
        );
        res.send("Berhasil edit");
    } catch (err) {
        console.log(err);
        res.send("Gagal edit");
    }
});