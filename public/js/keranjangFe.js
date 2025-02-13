document.addEventListener("DOMContentLoaded", function () {
    const decrementBtns = document.querySelectorAll('.decrement-btn');
    decrementBtns.forEach(button => {
        button.removeEventListener('click', decrementHandler);
        button.addEventListener('click', decrementHandler);
    });

    const incrementBtns = document.querySelectorAll('.increment-btn');
    incrementBtns.forEach(button => {
        button.removeEventListener('click', incrementHandler);
        button.addEventListener('click', incrementHandler);
    });

    function decrementHandler(event) {
        const button = event.target;
        const produkId = button.getAttribute('data-id');
        const counter = document.getElementById(`counter-${produkId}`);
        let value = parseInt(counter.textContent, 10);
        if (value > 0) {
            counter.textContent = value - 1;
            updateProductQuantity(produkId, value - 1);
            if (value - 1 === 0) {
                removeProductFromCart(produkId);
            } else {
                location.reload();
            }
        }
    }

    function incrementHandler(event) {
        const button = event.target;
        const produkId = button.getAttribute('data-id');
        const counter = document.getElementById(`counter-${produkId}`);
        let value = parseInt(counter.textContent, 10);
        counter.textContent = value + 1;
        updateProductQuantity(produkId, value + 1);
        location.reload();
    }

    function updateProductQuantity(produkId, newQuantity) {
        fetch(`/api/updateKeranjang/${produkId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jumlah: newQuantity
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Gagal mengupdate jumlah produk');
            }
            return response.json();
        })
        .then(data => {
            console.log('Jumlah produk berhasil diperbarui:', data);
        })
        .catch(error => {
            console.error('Terjadi kesalahan saat mengupdate produk:', error);
        });
    }

    function removeProductFromCart(produkId) {
        fetch(`/api/hapusKeranjang/${produkId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Gagal menghapus produk dari keranjang');
            }
            return response.json();
        })
        .then(data => {
            console.log('Produk berhasil dihapus:', data);
            const productElement = document.getElementById(`product-${produkId}`);
            if (productElement) {
                productElement.remove();
            }
            location.reload();
        })
        .catch(error => {
            console.error('Terjadi kesalahan saat menghapus produk:', error);
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const listProduk = document.getElementById('list-produk');
    const pengiriman = document.getElementById('pengiriman');
    const btnTogglePengiriman = document.getElementById('checkout');

    btnTogglePengiriman.addEventListener('click', function () {
        if (!listProduk.classList.contains('d-none')) {
            // Sembunyikan produk dan tampilkan form pengiriman
            listProduk.classList.add('d-none');
            pengiriman.classList.remove('d-none');
        } else {
            // Kirim request ke backend untuk checkout
            fetch('/api/checkout', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                // Tidak perlu kirim user_id karena sudah ada di session server
                body: JSON.stringify({}) // Data kosong karena server sudah mengakses session
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Server error');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert('Pesanan Berhasil dibuat!');
                    window.location.href = '/dashboard'; 
                } else {
                    alert('Gagal memproses pesanan: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Terjadi kesalahan, silakan coba lagi.');
            });
        }
    });
});

// Ambil elemen tombol dan menu dropdown
const dropdownButton = document.getElementById('dropdownPengiriman');
const dropdownMenu = document.querySelector('.dropdown-menu');
const dropdownItems = dropdownMenu.querySelectorAll('.dropdown-item');

// Fungsi untuk toggle dropdown
dropdownButton.addEventListener('click', function(event) {
    // Cegah aksi default dari tombol dropdown
    event.preventDefault();
    
    // Toggle visibilitas dropdown
    dropdownMenu.classList.toggle('show');
});

// Tutup dropdown jika klik di luar area dropdown
document.addEventListener('click', function(event) {
    if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
        // Menyembunyikan dropdown jika klik di luar area
        dropdownMenu.classList.remove('show');
    }
});

// Menambahkan event listener untuk setiap item dropdown
dropdownItems.forEach(item => {
    item.addEventListener('click', function() {
        // Mengubah teks pada tombol dengan teks dari item yang dipilih
        dropdownButton.innerHTML = `${item.textContent} `;

        // Menghapus icon setelah memilih item
        const icon = dropdownButton.querySelector('i');
        if (icon) {
            icon.remove(); // Menghapus ikon yang ada di tombol
        }

        // Menutup dropdown setelah memilih item
        dropdownMenu.classList.remove('show');
    });
});

