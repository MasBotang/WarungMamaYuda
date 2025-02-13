const express = require("express");
const router = express.Router();
const db = require('../dbConnection');

router.post('/checkout', (req, res) => {
    console.log('Checkout endpoint accessed'); // Log for debugging

    // Step 1: Check if the user is logged in
    if (!req.session.user) {
        console.log('User not logged in');
        return res.status(401).send("User not logged in");
    }

    const userId = req.session.user.id;

    // Step 2: Start a transaction to ensure data consistency
    db.beginTransaction((err) => {
        if (err) {
            console.log('Error starting transaction:', err); // Log transaction error
            return res.status(500).send("Error starting transaction");
        }

        // Step 3: Query to fetch products from list_orders based on user_id
        const queryOrderLists = "SELECT * FROM list_orders WHERE user_id = ?";
        db.query(queryOrderLists, [userId], (err, orderItems) => {
            if (err) {
                console.log('Error fetching order items:', err);  // Log query error
                return db.rollback(() => {
                    res.status(500).send("Error fetching order items");
                });
            }

            // Log orderItems for debugging
            console.log('Order items:', orderItems);

            // Check if no items found in cart
            if (orderItems.length === 0) {
                console.log('No items found in cart');
                return db.rollback(() => {
                    res.status(404).send("No items found in cart");
                });
            }

            // Step 4: Query to get user information from user_accounts
            const queryUserInfo = "SELECT nama AS nama_customer, no_phone, alamat FROM user_accounts WHERE id = ?";
            db.query(queryUserInfo, [userId], (err, userInfo) => {
                if (err) {
                    console.log('Error fetching user info:', err);
                    return db.rollback(() => {
                        res.status(500).send("Error fetching user info");
                    });
                }

                // Log userInfo for debugging
                console.log('User info:', userInfo);

                // Check if user info is available
                if (userInfo.length === 0) {
                    console.log('User info not found');
                    return db.rollback(() => {
                        res.status(404).send("User information not found");
                    });
                }

                // Destructure user info to use later
                const { nama_customer, no_phone, alamat } = userInfo[0];

                // Step 5: Prepare the order values to insert into orders table
                const orderValues = orderItems.map(item => {
                    console.log('Mapping order item:', item);  // Log each item for debugging
                    return [
                        userId,
                        nama_customer,  // nama_customer from userInfo
                        no_phone,       // no_phone from userInfo
                        alamat,         // alamat from userInfo
                        item.id,        // Using 'id' from list_orders which refers to product in daftar_products
                        item.nama,
                        item.harga,
                        item.jumlah,
                        item.foto_path,
                        'Pesanan Baru'  // Default status
                    ];
                });

                // Log the prepared orderValues for debugging
                console.log('Order values:', orderValues);

                // Step 6: Insert products into the orders table
                const queryInsertOrders = "INSERT INTO orders (user_id, nama_customer, no_phone, alamat, product_id, product_name, harga, quantity, foto_path, status) VALUES ?";
                db.query(queryInsertOrders, [orderValues], (err, result) => {
                    if (err) {
                        console.log('Error inserting into orders:', err);  // Log insert error
                        return db.rollback(() => {
                            res.status(500).send("Error inserting into orders");
                        });
                    }

                    // Step 7: Delete items that have been successfully transferred to the orders table
                    const queryDeleteFromCart = "DELETE FROM list_orders WHERE user_id = ?";
                    db.query(queryDeleteFromCart, [userId], (err, deleteResult) => {
                        if (err) {
                            console.log('Error deleting from cart:', err);  // Log delete error
                            return db.rollback(() => {
                                res.status(500).send("Error deleting from cart");
                            });
                        }

                        // Step 8: Commit the transaction if all operations were successful
                        db.commit((err) => {
                            if (err) {
                                console.log('Error committing transaction:', err);  // Log commit error
                                return db.rollback(() => {
                                    res.status(500).send("Error committing transaction");
                                });
                            }

                            // Send success response with the order ID
                            res.json({
                                success: true,
                                message: "Checkout successful!",
                                order_id: result.insertId
                            });
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;