const express = require('express');
const db = require('../dbConnection'); // Import koneksi ke database
const router = express.Router();

// Rute update-profile dengan pengecekan session
router.post('/profileUsers', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized, please login' });
    }

    const userId = req.session.user.id;

    // Objek untuk menyimpan data yang akan diupdate
    const updates = {};

    // Fungsi validasi untuk field yang ada
    const validations = {
        nama: (value) => value && (updates.nama = value),
        email: (value) => value && validateEmail(value) && (updates.email = value),
        no_phone: (value) => value && validatePhone(value) && (updates.no_phone = value),
        alamat: (value) => value && (updates.alamat = value),
        username: (value) => value && (updates.username = value),
    };

    // Lakukan validasi untuk masing-masing field dan tambahkan ke updates jika valid
    for (const [field, validate] of Object.entries(validations)) {
        if (req.body[field]) validate(req.body[field]);
    }

    // Jika tidak ada field yang diupdate
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No data to update' });
    }

    // Ambil data pengguna yang ada dari database untuk cek perbedaan
    db.query('SELECT * FROM user_accounts WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        const currentData = results[0];

        // Cek perbedaan data
        const updateNeeded = Object.keys(updates).some(field => updates[field] !== currentData[field]);

        if (!updateNeeded) {
            return res.status(400).json({ error: 'No changes detected' });
        }

        // Query untuk update
        const query = `
            UPDATE user_accounts
            SET ${Object.keys(updates).map(field => `${field} = ?`).join(', ')}
            WHERE id = ?
        `;
        const queryParams = [...Object.values(updates), userId];

        db.query(query, queryParams, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Profile updated successfully' });
        });
    });
});

module.exports = router;

// Fungsi validasi email
function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

// Fungsi validasi nomor telepon
function validatePhone(phone) {
    const regex = /^[0-9]{10,15}$/;
    return regex.test(phone);
}