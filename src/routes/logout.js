const express = require('express');
const router = express.Router();

// Route untuk logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Gagal logout');
        }
        res.clearCookie('connect.sid');  // Clear cookie session
        res.redirect('/');  // Redirect ke halaman login setelah logout
    });
});


module.exports = router;
