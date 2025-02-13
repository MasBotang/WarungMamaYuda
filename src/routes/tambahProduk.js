const express = require('express');
const db = require('../dbConnection'); // Import koneksi mysql2
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/'); // Folder tempat menyimpan file
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nama unik untuk file
    }
});

const upload = multer({ storage: storage });

// Route untuk menambahkan produk dengan foto
router.post('/tambahProduk', upload.single('foto_path'), (req, res) => {
    const { nama_product, harga, deskripsi, stok, kategori } = req.body;
    const foto_path = req.file ? `/uploads/${req.file.filename}` : null; // Path gambar

    // Validasi input
    if (!nama_product || !harga || !deskripsi || !stok || !kategori || !foto_path) {
        return res.status(400).json({
            success: false,
            message: 'Semua field harus diisi, termasuk foto produk.'
        });
    }

    // Query untuk memasukkan data ke database
    const query = 'INSERT INTO daftar_products (nama_product, foto_path, harga, deskripsi, stok, kategori, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())';
    db.execute(query, [nama_product, foto_path, harga, deskripsi, stok, kategori], (err, results) => {
        if (err) {
            console.error('Error saat menyimpan data ke MySQL:', err);
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan di server.'
            });
        }

        // Jika berhasil memasukkan data, kirimkan respon
        if (results.affectedRows > 0) {
            return res.status(201).json({
                success: true,
                message: 'Produk berhasil ditambahkan!',
                data: {
                    id: results.insertId,
                    nama_product,
                    foto_path,
                    harga,
                }
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Gagal menambahkan produk.'
            });
        }
    });
});

module.exports = router;
