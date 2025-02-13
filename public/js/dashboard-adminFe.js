document.addEventListener('DOMContentLoaded', () => {
    const buttonActives = [
        {
            buttonActive: 'btn-daftar-pesanan',
            contentActive: 'daftar-pesanan'
        },
        {
            buttonActive: 'btn-daftar-produk',
            contentActive: 'daftar-produk'
        },
        {
            buttonActive: 'btn-tambah-produk',
            contentActive: 'tambah-produk'
        }
    ];

    // Event listener untuk setiap tombol
    buttonActives.forEach(({ buttonActive, contentActive }) => {
        const button = document.getElementById(buttonActive);
        const content = document.getElementById(contentActive);

        if (button && content) {
            button.addEventListener('click', () => {
                // Nonaktifkan semua tombol dan sembunyikan semua konten
                buttonActives.forEach(({ buttonActive, contentActive }) => {
                    const otherButton = document.getElementById(buttonActive);
                    const otherContent = document.getElementById(contentActive);

                    if (otherButton) {
                        otherButton.classList.remove('btn-active');
                    }
                    if (otherContent) {
                        otherContent.classList.add('d-none');
                    }
                });

                // Aktifkan tombol yang diklik dan tampilkan kontennya
                button.classList.add('btn-active');
                content.classList.remove('d-none');
            });
        }
    });

    // Pastikan elemen awal aktif (default adalah btn-daftar-pesanan)
    const defaultButton = document.getElementById('btn-daftar-pesanan');
    const defaultContent = document.getElementById('daftar-pesanan');

    if (defaultButton && defaultContent) {
        defaultButton.classList.add('btn-active');
        defaultContent.classList.remove('d-none');
    }
});

// Tambah produk
const tambahProdukButton = document.getElementById('save-produk');
if (tambahProdukButton) {
    tambahProdukButton.addEventListener('click', async function (event) {
        // Mencegah form agar tidak melakukan reload
        event.preventDefault();

        // Ambil nilai dari input terkait berdasarkan ID atau atribut lain
        const nama_product = document.getElementById('namaProduk').value;
        const harga = document.getElementById('hargaProduk').value;
        const deskripsi = document.getElementById('deskripsiProduk').value;
        const stok = document.getElementById('stokProduk').value;
        const kategori = document.getElementById('kategoriProduk').value;
        const foto_path = document.getElementById('foto_path').files[0]; // Mengambil file foto

        // Validasi input saat tombol diklik
        if (!nama_product || !harga || !deskripsi || !stok || !kategori || !foto_path) {
            alert('Semua field harus diisi!');
            return;
        }

        // Bungkus data dalam objek formData
        const formDataProduk = new FormData();
        formDataProduk.append('nama_product', nama_product);
        formDataProduk.append('harga', harga);
        formDataProduk.append('deskripsi', deskripsi);
        formDataProduk.append('stok', stok);
        formDataProduk.append('kategori', kategori);
        formDataProduk.append('foto_path', foto_path); // Menambahkan foto

        try {
            const response = await fetch('/api/tambahProduk', {
                method: 'POST',
                body: formDataProduk // Mengirimkan FormData yang berisi file
            });

            const result = await response.json();

            if (result.success) {
                const alertSuccess = document.getElementById('alert-success');
                if (alertSuccess) {
                    alertSuccess.classList.remove('invisible');
                    alertSuccess.classList.add('visible');
                    alertSuccess.textContent = 'Produk berhasil ditambahkan!';

                    // Setelah 3 detik, sembunyikan alert sukses
                    setTimeout(() => {
                        alertSuccess.classList.remove('visible');
                        alertSuccess.classList.add('invisible');
                    }, 3000);
                }

                // Kosongkan input setelah produk ditambahkan
                document.getElementById('namaProduk').value = '';
                document.getElementById('hargaProduk').value = '';
                document.getElementById('deskripsiProduk').value = '';
                document.getElementById('stokProduk').value = '';
                document.getElementById('kategoriProduk').value = ''; // Reset kategori
                document.getElementById('foto_path').value = ''; // Reset foto

                // Reset select ke default
                const kategoriSelect = document.getElementById('kategoriProduk');
                kategoriSelect.selectedIndex = 0;  // Kembalikan ke placeholder
            } else {
                alert('Gagal menambahkan produk: ' + result.message);
            }
        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            alert('Terjadi kesalahan pada server. Silakan coba lagi nanti.');
        }
    });
} 

document.addEventListener("DOMContentLoaded", function() {
    const button = document.getElementById("btn-terimaPesanan");

    if (button) {
        button.addEventListener("click", function() {
            const orderId = this.getAttribute("data-order-id"); 
            const currentStatus = this.getAttribute("data-status");

            if (orderId && currentStatus) {
                const newStatus = "Siap Dikirim"; 

                // Mengirimkan request untuk memperbarui status pesanan
                fetch("/api/updateOrderStatus", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        orderId: orderId,
                        newStatus: newStatus
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("Status pesanan berhasil diperbarui!");
                        window.location.reload(); 
                    } else {
                        alert("Gagal memperbarui status pesanan.");
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    alert("Terjadi kesalahan.");
                });
            } else {
                alert("Data pesanan tidak ditemukan.");
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const button = document.getElementById("btn-pesananSiap");

    if (button) {
        button.addEventListener("click", function() {
            const orderId = this.getAttribute("data-order-id"); 
            const currentStatus = this.getAttribute("data-status"); 

            if (orderId && currentStatus) {
                const newStatus = "Siap Diambil"; 

                // Mengirimkan request untuk memperbarui status pesanan
                fetch("/api/updateOrderStatus", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        orderId: orderId,
                        newStatus: newStatus
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("Status pesanan berhasil diperbarui!");
                        window.location.reload(); 
                    } else {
                        alert("Gagal memperbarui status pesanan.");
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    alert("Terjadi kesalahan.");
                });
            } else {
                alert("Data pesanan tidak ditemukan.");
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const button = document.getElementById("btn-pesananSelesai");

    if (button) {
        button.addEventListener("click", function() {
            const orderId = this.getAttribute("data-order-id");
            const currentStatus = this.getAttribute("data-status");

            if (orderId && currentStatus) {
                const newStatus = "Pesanan Selesai"; 

                // Mengirimkan request untuk memperbarui status pesanan
                fetch("/api/updateOrderStatus", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        orderId: orderId,
                        newStatus: newStatus
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("Status pesanan berhasil diperbarui!");
                        window.location.reload(); 
                    } else {
                        alert("Gagal memperbarui status pesanan.");
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    alert("Terjadi kesalahan.");
                });
            } else {
                alert("Data pesanan tidak ditemukan.");
            }
        });
    }
});
