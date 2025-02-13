document.addEventListener('DOMContentLoaded', () => {
    const fields = ['nama', 'email', 'no_phone', 'alamat', 'username']; 

    fields.forEach(field => {
        const input = document.getElementById(`${field}-input`);
        const button = document.getElementById(`${field}-btn`);
        const alertElement = document.getElementById(`${field}-alert`);

        button.addEventListener('click', () => {
            console.log('Button untuk', field, 'diklik'); 

            if (input.hasAttribute('readonly')) {
                input.removeAttribute('readonly'); 
                button.innerHTML = '<span class="fw-bold p-2" style="color: #FF5D00; font-size: 14px;">save</span>';
            } else {
                const newValue = input.value;
                console.log('Data yang akan dikirim:', newValue);
                if (field === 'email' && !validateEmail(newValue)) {
                    alert("Format email tidak valid");
                    return; 
                }

                const userId = document.getElementById('user-id').value; 
                if (!userId) {
                    console.error('User ID not found');
                    return; 
                }
                updateProfileData(field, newValue, userId, input, button, alertElement);
            }
        });
    });
});

function updateProfileData(field, newValue, userId, input, button, alertElement) {
    fetch('/api/profileUsers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            [field]: newValue, 
            userId: userId 
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Profile update failed'); 
        }
        return response.json(); 
    })
    .then(data => {
        console.log(data); 

        // Tampilkan alert sukses
        toggleAlert(alertElement, 'success', 'Data berhasil diperbarui!');

        input.setAttribute('readonly', true); 
        button.innerHTML = `<img class="pe-1" src="img/pensil-icon.png" style="width: 20px; height: 18px;">
                            <span class="fw-bold" style="color: #FFD700; font-size: 14px;">ubah</span>`; 

        // Sembunyikan alert sukses setelah 3 detik
        setTimeout(() => toggleAlert(alertElement, 'hidden', ''), 3000);
    })
    .catch(error => {
        console.error('Error:', error);
        toggleAlert(alertElement, 'danger', 'Gagal memperbarui data.');

        input.setAttribute('readonly', true); 
        button.innerHTML = `<img class="pe-1" src="img/pensil-icon.png" style="width: 20px; height: 18px;">
                            <span class="fw-bold" style="color: #FFD700; font-size: 14px;">ubah</span>`; 

        // Sembunyikan alert error setelah 3 detik
        setTimeout(() => toggleAlert(alertElement, 'hidden', ''), 3000);
    });
}

// Fungsi untuk mengontrol visibilitas dan pesan alert
function toggleAlert(alertElement, alertType, message) {
    if (alertElement) {
        // Set pesan dan jenis alert
        alertElement.innerHTML = `<i class="bi bi-${alertType === 'success' ? 'check2-circle' : 'x-circle'} text-${alertType} me-2"></i> ${message}`;
        
        alertElement.style.visibility = alertType !== 'hidden' ? 'visible' : 'hidden';
        alertElement.style.opacity = alertType !== 'hidden' ? '1' : '0'; 
        alertElement.style.transition = 'opacity 0.5s'; 
    }
}

// Fungsi validasi email
function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}
