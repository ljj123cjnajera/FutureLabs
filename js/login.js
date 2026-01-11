document.addEventListener('DOMContentLoaded', async () => {
    if (window.Components) window.Components.loadHeader();

    // 1. Auto-redirect if already logged in
    if (window.authManager) {
        // Wait for auth init if needed (though usually sync with token)
        if (window.authManager.isAuthenticated()) {
            window.location.href = 'profile.html';
            return;
        }
    }

    const form = document.getElementById('loginForm');
    if (form) {
        // Inicializar validación en tiempo real
        if (window.FormValidator) {
            window.FormValidator.initRealTime(form);
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validar formulario antes de enviar
            if (window.FormValidator) {
                const validation = window.FormValidator.validateForm(form, {
                    showErrors: true,
                    focusFirstError: true
                });
                if (!validation.valid) {
                    if (window.notifications) {
                        window.notifications.warning('Formulario Inválido', 'Por favor, corrige los errores en el formulario');
                    }
                    return;
                }
            }

            const btn = form.querySelector('.btn-auth');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> INICIANDO SESIÓN...';
            btn.disabled = true;

            const email = form.querySelector('input[type="email"]').value.trim();
            const password = form.querySelector('input[type="password"]').value;

            // Get return URL from Query Param OR LocalStorage
            const urlParams = new URLSearchParams(window.location.search);
            let returnUrl = urlParams.get('returnUrl');

            if (!returnUrl) {
                returnUrl = localStorage.getItem('redirect_after_login') || 'profile.html';
                localStorage.removeItem('redirect_after_login'); // Clean up
            }

            try {
                if (window.authManager) {
                    if (window.Logger) window.Logger.log('🔐 Attempting login for:', email);
                    const success = await window.authManager.login(email, password);

                    if (success) {
                        if (window.Logger) window.Logger.log('✅ Login successful, redirecting to:', returnUrl);
                        // AuthManager handles notifications and token storage
                        setTimeout(() => {
                            window.location.href = returnUrl;
                        }, 500); // 500ms delay
                    } else {
                        if (window.Logger) window.Logger.warn('❌ Login failed');
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }
                } else {
                    throw new Error('AuthManager no está disponible');
                }
            } catch (error) {
                // Usar error handler si está disponible
                if (window.ErrorHandler) {
                    window.ErrorHandler.api(error, 'login', 'No se pudo iniciar sesión. Por favor, verifica tus credenciales.');
                } else {
                    if (window.Logger) window.Logger.error('Login error:', error);
                    if (window.notifications) {
                        window.notifications.error('Error', 'No se pudo iniciar sesión. Por favor, intenta de nuevo.');
                    }
                }
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }
});
