const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../dbConnection');
const router = express.Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Cek login hardcoded untuk admin
    if (username === 'mama_yuda' && password === 'tinggalMasuk') {
        req.session.isAdmin = true;  
        req.session.user = { username }; 
        return res.status(200).json({
            success: true,
            message: 'Login berhasil',
            user: { username: 'mama_yuda' }
        });
    }

    try {
        const query = 'SELECT * FROM user_accounts WHERE username = ?';
        
        // Menjalankan query dan mengambil hasil
        db.execute(query, [username], async (err, results) => {
            if (err) {
                console.error('Error saat mengambil data dari MySQL:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Terjadi kesalahan saat mengakses server.'
                });
            }

            console.log('Hasil query:', results);

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Username tidak ditemukan.'
                });
            }

            const user = results[0];

            // Validasi password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Password salah.'
                });
            }

            // Set session user setelah berhasil login
            req.session.user = {
                id: user.id,
                nama: user.nama,
                email: user.email,
                no_phone: user.no_phone,
                alamat: user.alamat,
                username: user.username
            };

            // Kembalikan response sukses
            return res.status(200).json({
                success: true,
                message: 'Login berhasil.',
                user: { id: user.id, username: user.username }
            });
        });
    } catch (error) {
        console.error('Error selama proses login:', error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan di server.'
        });
    }
});

module.exports = router;
