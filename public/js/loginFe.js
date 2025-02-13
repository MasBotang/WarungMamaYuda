document.addEventListener('DOMContentLoaded', function () {
    const formLogin = document.getElementById('form-login');

    formLogin.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.querySelector('[name="username"]').value;
        const password = document.querySelector('[name="password"]').value;

        const formData = { username, password };

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',  
                },
                body: JSON.stringify(formData),
                credentials: 'same-origin',  
            });

            const result = await response.json();

            if (result.success) {
                if (result.user.username === 'mama_yuda') {
                    window.location.href = '/dashboard-admin';  
                } else {
                    window.location.href = '/dashboard';  
                }
            } else {
                alert('Login gagal: ' + result.message);
            }
        } catch (error) {
            alert('Terjadi kesalahan pada server.');
        }
    });
});
