const express = require("express");
const router = express.Router();
const db = require('../dbConnection');

router.post('/updateKeranjang/:produkId', (req, res) => {
    const produkId = req.params.produkId;
    const { jumlah } = req.body;

    const query = 'UPDATE list_orders SET jumlah = ? WHERE id = ? AND user_id = ?';
    db.query(query, [jumlah, produkId, req.session.user.id], (err, result) => {
        if (err) {
            console.error('Gagal mengupdate jumlah produk:', err);
            return res.status(500).json({ message: 'Gagal mengupdate jumlah produk' });
        }
        res.json({ message: 'Jumlah produk berhasil diperbarui' });
    });
});

module.exports = router;
