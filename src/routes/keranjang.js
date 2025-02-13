const express = require("express");
const router = express.Router();
const db = require('../dbConnection');

router.post("/keranjang", (req, res) => {
    const selectedProduct = req.body;

    console.log("Produk yang diterima:", selectedProduct);

    // Validasi data
    if (
        !selectedProduct || 
        typeof selectedProduct.id === "undefined" || 
        typeof selectedProduct.nama === "undefined" || 
        typeof selectedProduct.harga === "undefined" || 
        typeof selectedProduct.jumlah === "undefined" ||
        typeof selectedProduct.foto === "undefined" ||
        typeof selectedProduct.user_id === "undefined"  // Validasi user_id
    ) {
        console.error("Data produk tidak lengkap:", selectedProduct);
        return res.status(400).json({ 
            message: "Data produk tidak lengkap atau tidak valid.", 
            receivedData: selectedProduct 
        });
    }

    // Cek apakah produk sudah ada di tabel list_orders berdasarkan id dan user_id
    const queryCheck = "SELECT * FROM list_orders WHERE id = ? AND user_id = ?";
    db.query(queryCheck, [selectedProduct.id, selectedProduct.user_id], (err, result) => {
        if (err) {
            console.error("Gagal mengecek data di database:", err);
            return res.status(500).json({ 
                message: "Terjadi kesalahan saat memeriksa data di database.", 
                error: err 
            });
        }

        console.log("Hasil cek produk:", result);

        if (result.length > 0) {
            // Jika produk sudah ada, update jumlahnya dan foto_path
            const updateQuery = "UPDATE list_orders SET jumlah = jumlah + ?, foto_path = ? WHERE id = ? AND user_id = ?";
            db.query(updateQuery, [selectedProduct.jumlah, selectedProduct.foto, selectedProduct.id, selectedProduct.user_id], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error("Gagal memperbarui jumlah produk:", updateErr);
                    return res.status(500).json({ 
                        message: "Gagal memperbarui jumlah produk.", 
                        error: updateErr 
                    });
                }

                console.log("Jumlah produk berhasil diperbarui:", updateResult);
                return res.status(200).json({ 
                    message: "Jumlah produk berhasil diperbarui.", 
                    updatedData: { id: selectedProduct.id, jumlah: selectedProduct.jumlah } 
                });
            });
        } else {
            // Jika produk belum ada, insert produk baru ke tabel
            const insertQuery = "INSERT INTO list_orders (id, nama, harga, jumlah, foto_path, user_id) VALUES (?, ?, ?, ?, ?, ?)";
            db.query(insertQuery, [selectedProduct.id, selectedProduct.nama, selectedProduct.harga, selectedProduct.jumlah, selectedProduct.foto, selectedProduct.user_id], (insertErr, insertResult) => {
                if (insertErr) {
                    console.error("Gagal menyimpan ke database:", insertErr);
                    return res.status(500).json({ 
                        message: "Gagal menyimpan data ke database.", 
                        error: insertErr 
                    });
                }

                console.log("Produk berhasil disimpan:", insertResult);
                return res.status(201).json({ 
                    message: "Produk berhasil disimpan ke dalam database.", 
                    savedData: { id: selectedProduct.id, nama: selectedProduct.nama } 
                });
            });
        }
    });
});

module.exports = router;
