document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".btn-click");

    buttons.forEach(button => {
        button.addEventListener("click", function () {
            const idProduct = button.dataset.id;
            const namaProduct = button.dataset.nama;
            const hargaProduct = button.dataset.harga;
            const fotoPath = button.dataset.foto;
            const userId = button.dataset.userId;

            const selectedProduct = {
                id: idProduct,
                nama: namaProduct,
                harga: parseFloat(hargaProduct),
                foto: fotoPath,
                user_id: userId,
                jumlah: 1
            };

            fetch("/api/keranjang", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(selectedProduct)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Gagal mengirim data ke server");
                }
                return response.json();
            })
            .then(data => {
                alert("Produk berhasil dimasukkan ke keranjang!");
                location.reload();
            })
            .catch(error => {
                console.error("Terjadi kesalahan:", error);
            });
        });
    });
});
