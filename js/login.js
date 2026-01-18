document.addEventListener('DOMContentLoaded', async () => {
    // Initialize header and footer
    if (window.Components) {
        const headerContainer = document.getElementById('mainHeader');
        if (headerContainer && !headerContainer.innerHTML.trim()) {
            headerContainer.innerHTML = window.Components.getHeader(true, true);
            if (window.Components.initHeader) window.Components.initHeader();
            if (window.Components.initSearch) window.Components.initSearch();
            if (window.Components.initCartCounter) window.Components.initCartCounter();
        }

        const footerContainer = document.getElementById('mainFooter');
        if (footerContainer && !footerContainer.innerHTML.trim()) {
            footerContainer.innerHTML = window.Components.getFooter();
        }
    }

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

            try {
                // MODERN CORE: Use LoadingStates
                if (window.LoadingStates) {
                    window.LoadingStates.show(form, { type: 'spinner', message: 'Iniciando sesión...', overlay: true });
                } else {
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> INICIANDO SESIÓN...';
                    btn.disabled = true;
                }

                if (window.authManager) {
                    if (window.Logger) window.Logger.log('🔐 Attempting login for:', email);
                    const success = await window.authManager.login(email, password);

                    if (success) {
                        if (window.Logger) window.Logger.log('✅ Login successful, redirecting to:', returnUrl);
                        setTimeout(() => {
                            window.location.href = returnUrl;
                        }, 500);
                    } else {
                        if (window.Logger) window.Logger.warn('❌ Login failed');
                        if (window.LoadingStates) window.LoadingStates.hide(form);
                        else {
                            btn.innerHTML = originalText;
                            btn.disabled = false;
                        }
                    }
                } else {
                    throw new Error('AuthManager no está disponible');
                }
            } catch (error) {
                if (window.LoadingStates) window.LoadingStates.hide(form);

                if (window.ErrorHandler) {
                    window.ErrorHandler.api(error, 'login', 'No se pudo iniciar sesión.');
                } else {
                    if (window.notifications) window.notifications.error('Error', 'No se pudo iniciar sesión.');
                }

                if (!window.LoadingStates) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            }
        });
    }
});
