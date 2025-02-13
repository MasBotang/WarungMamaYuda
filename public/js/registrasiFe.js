const form1 = document.getElementById('form-1');
const form2 = document.getElementById('form-2');

// Menyimpan data form1 dan form2
let formData1 = {};
let formData2 = {};

// form-1
form1.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Mengambil data dari form-1
    formData1 = {
        nama: document.querySelector('[name="nama"]').value,
        email: document.querySelector('[name="email"]').value,
        no_phone: document.querySelector('[name="no_phone"]').value,
        alamat: document.querySelector('[name="alamat"]').value
    };

    // Sembunyikan form-1 dan tampilkan form-2
    form1.style.display = 'none';
    form2.style.display = 'block';
});

// form-2
form2.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Mengambil data dari form-2
    formData2 = {
        username: document.querySelector('[name="username"]').value,
        password: document.querySelector('[name="password"]').value,
        confirm_password: document.querySelector('[name="confirm_password"]').value
    };

    // Validasi password dan confirm password
    if (formData2.password !== formData2.confirm_password) {
        document.getElementById('alert').style.display = 'block';
        return; 
    }

    // Gabungkan data form1 dan form2
    const formData = { ...formData1, ...formData2 };

    try {
        // Kirim data ke backend menggunakan fetch
        const response = await fetch('/api/registrasi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData) 
        });

        // Ambil hasil respons dari server
        const result = await response.json();
        console.log('Response from server:', result);

        // Cek jika response sukses
        if (result.success) {
            console.log('Data berhasil disimpan!');
            window.location.href = '/login';
        } else {
            console.log('Error:', result.message);
        }
    } catch (error) {
        console.error('Error during fetch:', error);
    }
});
