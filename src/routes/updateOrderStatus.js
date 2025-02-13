const express = require("express");
const router = express.Router();
const db = require('../dbConnection');

// Endpoint untuk memperbarui status pesanan
router.post("/updateOrderStatus", (req, res) => {
    const { orderId, newStatus } = req.body;

    if (!orderId || !newStatus) {
        return res.status(400).json({ success: false, message: "Data tidak lengkap." });
    }

    // Query untuk memperbarui status pesanan
    const query = `UPDATE orders SET status = ? WHERE id = ?`;

    db.query(query, [newStatus, orderId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
        }

        if (result.affectedRows > 0) {
            res.json({ success: true, message: "Status pesanan berhasil diperbarui." });
        } else {
            res.status(404).json({ success: false, message: "Pesanan tidak ditemukan." });
        }
    });
});

module.exports = router;
