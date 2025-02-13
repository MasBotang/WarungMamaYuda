const express = require("express");
const router = express.Router();
const db = require('../dbConnection');

router.delete('/hapusKeranjang/:produkId', (req, res) => {
    const produkId = req.params.produkId;

    const query = 'DELETE FROM list_orders WHERE id = ? AND user_id = ?';
    db.query(query, [produkId, req.session.user.id], (err, result) => {
        if (err) {
            console.error('Gagal menghapus produk:', err);
            return res.status(500).json({ message: 'Gagal menghapus produk' });
        }
        res.json({ message: 'Produk berhasil dihapus dari keranjang' });
    });
});


module.exports = router;
