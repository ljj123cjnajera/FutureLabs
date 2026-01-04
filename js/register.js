document.addEventListener('DOMContentLoaded', () => {
    if (window.Components) window.Components.loadHeader();
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const firstNameInput = document.getElementById('registerFirstName');
            const lastNameInput = document.getElementById('registerLastName');
            const emailInput = document.getElementById('registerEmail');
            const passwordInput = document.getElementById('registerPassword');

            const first_name = firstNameInput ? firstNameInput.value.trim() : '';
            const last_name = lastNameInput ? lastNameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            if (!first_name || !last_name || !email || !password) {
                if (window.notifications) window.notifications.error('Error', 'Todos los campos son obligatorios');
                return;
            }

            if (password.length < 6) {
                if (window.notifications) window.notifications.error('Error', 'La contraseña debe tener al menos 6 caracteres');
                return;
            }

            const btn = registerForm.querySelector('button[type="submit"]');
            const originalText = btn ? btn.innerText : 'CREAR CUENTA';
            if (btn) {
                btn.disabled = true;
                btn.innerText = 'CREANDO CUENTA...';
            }

            try {
                const response = await window.api.register({ first_name, last_name, email, password });
                if (response.success || response.token) {
                    if (window.notifications) window.notifications.success('¡Bienvenido!', 'Cuenta creada exitosamente. Verifica tu email para continuar.');
                    
                    if (response.token) {
                        localStorage.setItem('auth_token', response.token);
                        if (response.user) {
                            localStorage.setItem('user', JSON.stringify(response.user));
                        }
                    }

                    // Redirigir a verificación si es necesario, o a profile
                    setTimeout(() => {
                        if (response.requires_verification) {
                            window.location.href = 'verification.html?email=' + encodeURIComponent(email);
                        } else {
                            window.location.href = 'profile.html';
                        }
                    }, 1500);
                } else {
                    throw new Error(response.message || 'Error al registrar');
                }
            } catch (error) {
                console.error('Registration error:', error);
                if (window.notifications) window.notifications.error('Error de Registro', error.message || 'Intente nuevamente');
                if (btn) {
                    btn.disabled = false;
                    btn.innerText = originalText;
                }
            }
        });
    }
});
