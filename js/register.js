document.addEventListener('DOMContentLoaded', () => {
    if (window.Components) window.Components.loadHeader();
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            const name = nameInput ? nameInput.value : '';
            const email = emailInput ? emailInput.value : '';
            const password = passwordInput ? passwordInput.value : '';

            if (!name || !email || !password) {
                if (window.notifications) window.notifications.error('Error', 'Todos los campos son obligatorios');
                return;
            }

            const btn = registerForm.querySelector('button[type="submit"]');
            const originalText = btn ? btn.innerText : 'REGISTRARSE';
            if (btn) btn.innerText = 'CREANDO CUENTA...';

            try {
                const response = await window.api.register({ name, email, password });
                if (response.success || response.token) {
                    if (window.notifications) window.notifications.success('Bienvenido', 'Cuenta creada exitosamente');
                    // Token is usually handled in api.js (saved to localStorage), but we ensure it here if needed
                    // window.api should handle saving if it parses response. 
                    // Assuming API saves it or we need to save it. 
                    // Let's rely on api.register returning success and potentially auto-saving token or we do:
                    if (response.token) localStorage.setItem('user_token', response.token);

                    setTimeout(() => {
                        window.location.href = 'profile.html';
                    }, 1000);
                } else {
                    throw new Error(response.message || 'Error al registrar');
                }
            } catch (error) {
                console.error(error);
                if (window.notifications) window.notifications.error('Error de Registro', error.message || 'Intente nuevamente');
                if (btn) btn.innerText = originalText;
            }
        });
    }
});
