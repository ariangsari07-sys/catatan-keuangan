const express = require("express");
const mysql = require("mysql2");
const { Pool } = require("pg");

const app = express();

let db;
let mode = "";

if(process.env.DATABASE_URL){
    // POSTGRESQL (RAILWAY)
    db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    mode = "postgres";

    console.log("Mode ONLINE PostgreSQL");

}else{
    // MYSQL (LOCALHOST)
    db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "catatan_keuangan"
    });

    db.connect(function(err){
        if(err){
            console.log("Koneksi MySQL gagal");
        }else{
            console.log("MySQL localhost tersambung");
        }
    });

    mode = "mysql";
}

app.use(express.static(__dirname));
app.use(express.json());

// TAMBAH DATA
app.post("/tambah", async (req,res)=>{

    let { tanggal, nama, jumlah } = req.body;

    // POSTGRESQL
    if(mode == "postgres"){

        try{

            await db.query(
                "INSERT INTO riwayat (tanggal,nama,jumlah) VALUES ($1,$2,$3)",
                [tanggal,nama,jumlah]
            );

            res.send("Berhasil tambah data");

        }catch(err){

            console.log(err);
            res.send("Gagal tambah data");

        }

    }

    // MYSQL
    else{

        let sql = "INSERT INTO riwayat (tanggal,nama,jumlah) VALUES (?,?,?)";

        db.query(sql,[tanggal,nama,jumlah], function(err){

            if(err){
                console.log(err);
                res.send("Gagal tambah data");
            }else{
                res.send("Berhasil tambah data");
            }

        });

    }

});


// ======================
// AMBIL DATA
// ======================

app.get("/data", async (req,res)=>{

    // POSTGRESQL
    if(mode == "postgres"){

        try{

            let result = await db.query(
                "SELECT * FROM riwayat ORDER BY id DESC"
            );

            res.json(result.rows);

        }catch(err){

            console.log(err);
            res.json([]);

        }

    }

    // MYSQL
    else{

        let sql = "SELECT * FROM riwayat ORDER BY id DESC";

        db.query(sql, function(err,result){

            if(err){
                console.log(err);
                res.json([]);
            }else{
                res.json(result);
            }

        });

    }

});

// HAPUS DATA
app.delete("/hapus/:id", async (req,res)=>{

    let id = req.params.id;

    // POSTGRESQL
    if(mode == "postgres"){

        try{

            await db.query(
                "DELETE FROM riwayat WHERE id = $1",
                [id]
            );

            res.send("Berhasil hapus");

        }catch(err){

            console.log(err);
            res.send("Gagal hapus");

        }

    }

    // MYSQL
    else{

        let sql = "DELETE FROM riwayat WHERE id = ?";

        db.query(sql,[id], function(err){

            if(err){
                console.log(err);
                res.send("Gagal hapus");
            }else{
                res.send("Berhasil hapus");
            }

        });

    }

});

// EDIT DATA
app.put("/edit/:id", async (req,res)=>{

    let id = req.params.id;
    let { tanggal, nama, jumlah } = req.body;

    // POSTGRESQL
    if(mode == "postgres"){

        try{

            await db.query(
                "UPDATE riwayat SET tanggal=$1, nama=$2, jumlah=$3 WHERE id=$4",
                [tanggal,nama,jumlah,id]
            );

            res.send("Berhasil edit");

        }catch(err){

            console.log(err);
            res.send("Gagal edit");

        }

    }

    // MYSQL
    else{

        let sql = "UPDATE riwayat SET tanggal=?, nama=?, jumlah=? WHERE id=?";

        db.query(sql,[tanggal,nama,jumlah,id], function(err){

            if(err){
                console.log(err);
                res.send("Gagal edit");
            }else{
                res.send("Berhasil edit");
            }

        });

    }

});

// JALANKAN SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, function(){
    console.log("Server berjalan di port " + PORT);
});