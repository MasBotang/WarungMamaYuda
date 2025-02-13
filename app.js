require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const db = require('./src/dbConnection'); 
const path = require('path');
const app = express();
const registerRouter = require('./src/routes/registrasi');
const loginRouter = require('./src/routes/login'); 
const profileRouter = require('./src/routes/profileUsers');
const logoutRouter = require('./src/routes/logout');
const tambahProdukRouter = require('./src/routes/tambahProduk');
const keranjangRouter = require('./src/routes/keranjang');
const updateKeranjangRouter = require('./src/routes/updateKeranjang');
const hapusKeranjangRouter = require('./src/routes/hapusKeranjang');
const checkoutRouter = require('./src/routes/checkout');
const updateOrderStatusRouter = require('./src/routes/updateOrderStatus');
const session = require('express-session');


const PORT = process.env.PORT || 5000;

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 3600000 
    }
}));

app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', registerRouter);
app.use('/api', loginRouter);
app.use('/api', profileRouter);
app.use('/api', logoutRouter);
app.use('/api', tambahProdukRouter);
app.use('/api', keranjangRouter);
app.use('/api', updateKeranjangRouter);
app.use('/api', hapusKeranjangRouter);
app.use('/api', checkoutRouter);
app.use('/api', updateOrderStatusRouter);

app.get('/', (req, res) => {
    // Query untuk mengambil data produk
    const query = 'SELECT * FROM daftar_products'; // Sesuaikan nama tabel sesuai kebutuhan Anda

    // Menjalankan query
    db.execute(query, (err, results) => {
        if (err) {
            console.error('Error saat mengambil data produk:', err);
            return res.status(500).send('Terjadi kesalahan di server.');
        }

        // Kirim data produk ke halaman dashboard-admin
        res.render('index', {
            title: 'Dashboard',
            layout: 'layouts/main-layout',
            showNav: true,
            showFoot: true,
            product: results // Mengirim data produk ke template EJS
        });
    });
});

app.get('/login', (req, res) => {
    res.render('login', {
        title: 'Halaman Login',
        layout: 'layouts/main-layout',
        showNav: false,
        showFoot: false,
    });
});

app.get('/registrasi', (req, res) => {
    res.render('registrasi', {
        title: 'Halaman Registrasi',
        layout: 'layouts/main-layout',
        showNav: false,
        showFoot: false
    });
});

app.get('/dashboard', (req, res) => {

    if (!req.session.user) {
        return res.redirect('/login'); // Jika session kosong, redirect ke login
    }

    const userId = req.session.user.id;
    const queryProducts = 'SELECT * FROM daftar_products';
    const queryOrdersCount = 'SELECT COUNT(*) AS orderCount FROM list_orders WHERE user_id = ?';

    db.execute(queryProducts, (err, productResults) => {
        if (err) {
            console.error('Error saat mengambil data produk:', err);
            return res.status(500).send('Terjadi kesalahan di server.');
        }

        db.execute(queryOrdersCount, [userId], (err, countResult) => {
            if (err) {
                console.error('Error saat menghitung jumlah orders:', err);
                return res.status(500).send('Terjadi kesalahan di server.');
            }

            const orderCount = countResult[0]?.orderCount || 0;

            res.render('dashboard', {
                title: 'Dashboard',
                layout: 'layouts/main-layout',
                showNav: false,
                showFoot: true,
                product: productResults, 
                orderCount,             
                user: userId
            });
        });
    });
});

app.get('/profileUsers', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); 
    }

    const userId = req.session.user.id; 

    // Query untuk mengambil data user berdasarkan ID
    db.query('SELECT * FROM user_accounts WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }

        const user = results[0]; 

        res.render('profileUsers', { 
            title: 'Halaman Profile',
            layout: 'layouts/main-layout',
            showNav: false,
            showFoot: true,
            user: user
        });
    });
});

app.get('/ganti-password', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect ke halaman login jika user belum login
    }
    res.render('ganti-password', {
        title: 'Halaman Ganti Paswword',
        layout: 'layouts/main-layout',
        showNav: false,
        showFoot: false
    });
});

app.get('/keranjang', (req, res) => {
    // Pastikan user sudah login
    if (!req.session.user) {
        return res.redirect('/login'); 
    }

    // Ambil userId dari session
    const userId = req.session.user.id;

    // Query untuk mengambil data user
    const queryUser = "SELECT nama, alamat, no_phone FROM user_accounts WHERE id = ?";
    // Query untuk mengambil data orders
    const queryOrders = "SELECT * FROM list_orders WHERE user_id = ?";
    // Query untuk menghitung jumlah orders
    const queryOrdersCount = 'SELECT COUNT(*) AS orderCount FROM list_orders WHERE user_id = ?';

    // Eksekusi query untuk data user
    db.execute(queryUser, [userId], (err, userResult) => {
        if (err) {
            console.error("Gagal mengambil data user dari database:", err);
            return res.status(500).send("Terjadi kesalahan pada server.");
        }

        if (userResult.length === 0) {
            return res.status(404).send("Data user tidak ditemukan.");
        }

        const user = userResult[0]; // Data user

        // Eksekusi query untuk data orders
        db.execute(queryOrders, [userId], (err, ordersResult) => {
            if (err) {
                console.error("Gagal mengambil data orders dari database:", err);
                return res.status(500).send("Terjadi kesalahan pada server.");
            }

            // Eksekusi query untuk jumlah orders
            db.execute(queryOrdersCount, [userId], (err, countResult) => {
                if (err) {
                    console.error('Error saat menghitung jumlah orders:', err);
                    return res.status(500).send('Terjadi kesalahan di server.');
                }

                // Render halaman keranjang
                res.render('keranjang', {
                    title: 'Keranjang',
                    layout: 'layouts/main-layout',
                    showNav: false,
                    showFoot: true,
                    user,
                    list_orders: ordersResult, 
                    orderCount: countResult[0]?.orderCount || 0 
                });
            });
        });
    });
});

app.get('/dashboard-admin', async (req, res) => {
    // Pastikan admin sudah login
    if (!req.session.isAdmin) {
        return res.redirect('/login');
    }

    try {
        // Query untuk mengambil data produk
        const queryProducts = 'SELECT * FROM daftar_products';
        const queryOrders = 'SELECT * FROM orders';

        // Menjalankan kedua query secara paralel
        const [products] = await db.promise().query(queryProducts);
        const [orders] = await db.promise().query(queryOrders); // Mengambil data pesanan

        // Pastikan orders adalah array
        if (!Array.isArray(orders)) {
            console.error('orders bukan array', orders);
            return res.status(500).send('Error: Data orders tidak valid');
        }
        
        // Kelompokkan pesanan berdasarkan user_id dan created_at
        const groupedOrders = orders.reduce((groups, order) => {
            const key = `${order.user_id}-${order.created_at}`; // Kunci pengelompokan berdasarkan user_id dan waktu
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(order); // Gabungkan pesanan yang sama berdasarkan kunci
            return groups;
        }, {});

        // Kirim data ke halaman dashboard-admin
        res.render('dashboard-admin/dashboard', {
            title: 'Dashboard',
             layout: 'layouts/admin-layout',
            showNav: true,
            showFoot: true,
            showSidebar: true,
            produk: products,
            orders: Object.values(groupedOrders) // Kirimkan data yang sudah dikelompokkan
        });
    } catch (err) {
        console.error('Error saat mengambil data:', err);
        return res.status(500).send('Terjadi kesalahan di server.');
    }
});

app.get('/daftar-produk', async (req, res) => {
    // Pastikan admin sudah login
    if (!req.session.isAdmin) {
        return res.redirect('/login');
    }

    try {
        // Query untuk mengambil data produk
        const queryProducts = 'SELECT * FROM daftar_products';

        // Menjalankan query produk
        const [products] = await db.promise().query(queryProducts);

        // Kirim data ke halaman daftar-produk
        res.render('dashboard-admin/daftar-produk', {
            title: 'Dashboard Daftar Produk',
            layout: 'layouts/admin-layout',
            showNav: true,
            showPesanan: false,
            showFoot: true,
            showSidebar: false,
            produk: products
        });
    } catch (err) {
        console.error('Error saat mengambil data:', err);
        return res.status(500).send('Terjadi kesalahan di server.');
    }
});

app.get('/tambah-produk', (req, res) => {
    // Pastikan admin sudah login
    if (!req.session.isAdmin) {
        return res.redirect('/login');
    }

    // Kirim data ke halaman tambah-produk
    res.render('dashboard-admin/tambah-produk', {
        title: 'Tambah Produk',
        layout: 'layouts/admin-layout',
        showNav: true,
        showPesanan: false,
        showSidebar:false,
        showFoot: true
    });
});

app.get('/semua-pesanan', async (req, res) => {
    // Pastikan admin sudah login
    if (!req.session.isAdmin) {
        return res.redirect('/login');
    }

    try {
        // Query untuk mengambil data produk
        const queryProducts = 'SELECT * FROM daftar_products';
        const queryOrders = 'SELECT * FROM orders';

        // Menjalankan kedua query secara paralel
        const [products] = await db.promise().query(queryProducts);
        const [orders] = await db.promise().query(queryOrders); // Mengambil data pesanan

        // Pastikan orders adalah array
        if (!Array.isArray(orders)) {
            console.error('orders bukan array', orders);
            return res.status(500).send('Error: Data orders tidak valid');
        }

        orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Kelompokkan pesanan berdasarkan user_id dan created_at
        const groupedOrders = orders.reduce((groups, order) => {
            const key = `${order.user_id}-${order.created_at}`; // Kunci pengelompokan berdasarkan user_id dan waktu
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(order); // Gabungkan pesanan yang sama berdasarkan kunci
            return groups;
        }, {});

        // Kirim data ke halaman dashboard-admin
        res.render('dashboard-admin/semua-pesanan', {
            title: 'Dashboard',
            layout: 'layouts/admin-layout',
            showNav: true,
            showFoot: true,
            showSidebar: true,
            produk: products,
            orders: Object.values(groupedOrders) // Kirimkan data yang sudah dikelompokkan
        });
    } catch (err) {
        console.error('Error saat mengambil data:', err);
        return res.status(500).send('Terjadi kesalahan di server.');
    }
});

app.get('/siap-dikirim', async (req, res) => {
    // Pastikan admin sudah login
    if (!req.session.isAdmin) {
        return res.redirect('/login');
    }

    try {
        // Query untuk mengambil data produk
        const queryProducts = 'SELECT * FROM daftar_products';
        const queryOrders = 'SELECT * FROM orders';

        // Menjalankan kedua query secara paralel
        const [products] = await db.promise().query(queryProducts);
        const [orders] = await db.promise().query(queryOrders); // Mengambil data pesanan

        // Pastikan orders adalah array
        if (!Array.isArray(orders)) {
            console.error('orders bukan array', orders);
            return res.status(500).send('Error: Data orders tidak valid');
        }

        // Kelompokkan pesanan berdasarkan user_id dan created_at
        const groupedOrders = orders.reduce((groups, order) => {
            const key = `${order.user_id}-${order.created_at}`; // Kunci pengelompokan berdasarkan user_id dan waktu
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(order); // Gabungkan pesanan yang sama berdasarkan kunci
            return groups;
        }, {});

        // Kirim data ke halaman dashboard-admin
        res.render('dashboard-admin/siap-dikirim', {
            title: 'Dashboard',
            layout: 'layouts/admin-layout',
            showNav: true,
            showFoot: true,
            showSidebar:true,
            produk: products,
            orders: Object.values(groupedOrders) // Kirimkan data yang sudah dikelompokkan
        });
    } catch (err) {
        console.error('Error saat mengambil data:', err);
        return res.status(500).send('Terjadi kesalahan di server.');
    }
});

app.get('/siap-diambil', async (req, res) => {
    // Pastikan admin sudah login
    if (!req.session.isAdmin) {
        return res.redirect('/login');
    }

    try {
        // Query untuk mengambil data produk
        const queryProducts = 'SELECT * FROM daftar_products';
        const queryOrders = 'SELECT * FROM orders';

        // Menjalankan kedua query secara paralel
        const [products] = await db.promise().query(queryProducts);
        const [orders] = await db.promise().query(queryOrders); // Mengambil data pesanan

        // Pastikan orders adalah array
        if (!Array.isArray(orders)) {
            console.error('orders bukan array', orders);
            return res.status(500).send('Error: Data orders tidak valid');
        }

        // Kelompokkan pesanan berdasarkan user_id dan created_at
        const groupedOrders = orders.reduce((groups, order) => {
            const key = `${order.user_id}-${order.created_at}`; // Kunci pengelompokan berdasarkan user_id dan waktu
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(order); // Gabungkan pesanan yang sama berdasarkan kunci
            return groups;
        }, {});

        // Kirim data ke halaman dashboard-admin
        res.render('dashboard-admin/siap-diambil', {
            title: 'Dashboard',
            layout: 'layouts/admin-layout',
            showNav: true,
            showFoot: true,
            showSidebar:true,
            produk: products,
            orders: Object.values(groupedOrders) // Kirimkan data yang sudah dikelompokkan
        });
    } catch (err) {
        console.error('Error saat mengambil data:', err);
        return res.status(500).send('Terjadi kesalahan di server.');
    }
});

app.get('/pesanan-selesai', async (req, res) => {
    // Pastikan admin sudah login
    if (!req.session.isAdmin) {
        return res.redirect('/login');
    }

    try {
        // Query untuk mengambil data produk
        const queryProducts = 'SELECT * FROM daftar_products';
        const queryOrders = 'SELECT * FROM orders';

        // Menjalankan kedua query secara paralel
        const [products] = await db.promise().query(queryProducts);
        const [orders] = await db.promise().query(queryOrders); // Mengambil data pesanan

        // Pastikan orders adalah array
        if (!Array.isArray(orders)) {
            console.error('orders bukan array', orders);
            return res.status(500).send('Error: Data orders tidak valid');
        }

        orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Kelompokkan pesanan berdasarkan user_id dan created_at
        const groupedOrders = orders.reduce((groups, order) => {
            const key = `${order.user_id}-${order.created_at}`; // Kunci pengelompokan berdasarkan user_id dan waktu
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(order); // Gabungkan pesanan yang sama berdasarkan kunci
            return groups;
        }, {});

        // Kirim data ke halaman dashboard-admin
        res.render('dashboard-admin/pesanan-selesai', {
            title: 'Dashboard',
            layout: 'layouts/admin-layout',
            showNav: true,
            showFoot: true,
            showSidebar:true,
            produk: products,
            orders: Object.values(groupedOrders) // Kirimkan data yang sudah dikelompokkan
        });
    } catch (err) {
        console.error('Error saat mengambil data:', err);
        return res.status(500).send('Terjadi kesalahan di server.');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/'); // Redirect to home after logout
    });
});



// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
