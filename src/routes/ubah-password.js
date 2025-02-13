// const express = require('express');
// const bcrypt = require('bcryptjs'); 
// const db = require('../dbConnection'); 
// const router = express.Router();

// router.post('/ubah-password', async (req, res) => {
//     const password  = req.body;

//     try {
//         const hashedPassword = await bcrypt.hash(password, 10); 

//         const query = 'INSERT INTO user_accounts password) VALUES (?, ?, ?, ?, ?, ?)';
//         db.execute(query, hashedPassword], (err, results) => {
//             if (err) {
//                 console.error('Error saat menyimpan data ke MySQL:', err);
//                 return res.status(500).json({
//                     success: false,
//                     message: 'Terjadi kesalahan saat menyimpan data ke server.'
//                 });
//             }
//             return res.status(201).json({
//                 success: true,
//                 message: 'User berhasil terdaftar!'
//             });
//         });
//     } catch (error) {
//         console.error('Error selama proses hashing password:', error);
//         return res.status(500).json({
//             success: false,
//             message: 'Terjadi kesalahan di server.'
//         });
//     }
// });

// module.exports = router;
