document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const alertBox = document.getElementById('loginAlert');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        alertBox.style.display = 'none';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = form.querySelector('button');
        const originalBtnText = btn.innerHTML;

        // Loading State
        if (window.LoadingStates) {
            window.LoadingStates.show(form, { message: 'Autenticando...', overlay: true, type: 'spinner' });
        } else {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AUTENTICANDO...';
            btn.disabled = true;
        }

        try {
            // Hacer login directamente con la API
            const response = await window.api.login(email, password);

            if (response.success) {
                const user = response.data.user;

                // Verificar rol
                if (user.role === 'admin' || user.role === 'moderator') {
                    // Guardar token en localStorage
                    localStorage.setItem('auth_token', response.data.token);
                    if (window.Logger) window.Logger.log('✅ Token guardado en localStorage');

                    // Guardar información del usuario en localStorage para admin.html
                    localStorage.setItem('admin_user', JSON.stringify({
                        id: user.id,
                        email: user.email,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        role: user.role
                    }));

                    alertBox.style.display = 'block';
                    alertBox.style.background = '#e8f5e9';
                    alertBox.style.color = '#2e7d32';
                    alertBox.style.borderColor = '#2e7d32';
                    alertBox.textContent = 'ACCESS GRANTED. REDIRECTING...';

                    // Redirigir al panel admin
                    setTimeout(() => {
                        window.location.href = 'admin.html';
                    }, 1000);
                } else {
                    throw new Error('Insufficient Privileges. Admin Role Required.');
                }
            } else {
                throw new Error(response.message || 'Authentication Failed');
            }
        } catch (error) {
            if (window.Logger) window.Logger.error('Login Error:', error);
            alertBox.style.display = 'block';
            alertBox.style.background = '#ffebee';
            alertBox.style.color = '#c62828';
            alertBox.style.borderColor = '#c62828';
            alertBox.textContent = 'ACCESS DENIED: ' + error.message;

            // Shake animation
            const inputs = form.querySelectorAll('.form-input');
            inputs.forEach(input => {
                input.classList.add('input-shake');
                setTimeout(() => input.classList.remove('input-shake'), 300);
            });
        } finally {
            if (window.LoadingStates) {
                window.LoadingStates.hide(form);
            }
            btn.innerHTML = originalBtnText;
            btn.disabled = false;
        }
    });
});
