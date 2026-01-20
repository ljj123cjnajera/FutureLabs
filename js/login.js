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

    if (window.authManager && typeof window.authManager.isAuthenticated === 'function' && window.authManager.isAuthenticated()) {
        window.location.href = (new URLSearchParams(window.location.search)).get('returnUrl') || 'profile.html';
        return;
    }

    const form = document.getElementById('loginForm');
    if (form) {
        // Inicializar validación en tiempo real
        if (window.FormValidator) {
            window.FormValidator.initRealTime(form);
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            var emailInput = form.querySelector('#loginEmail') || form.elements.email;
            var passwordInput = form.querySelector('#loginPassword') || form.elements.password;
            var email = (emailInput && emailInput.value) ? String(emailInput.value).trim() : '';
            var password = (passwordInput && passwordInput.value) ? String(passwordInput.value) : '';
            var returnUrl = (new URLSearchParams(window.location.search)).get('returnUrl') || 'profile.html';
            var btn = form.querySelector('button[type="submit"]');
            var originalText = btn ? btn.innerHTML : '';

            if (window.FormValidator) {
                var validation = window.FormValidator.validateForm(form, { showErrors: true, focusFirstError: true });
                if (!validation.valid) {
                    if (window.notifications) window.notifications.warning('Formulario inválido', 'Corrige los campos marcados.');
                    return;
                }
            }

            try {
                if (window.LoadingStates) {
                    window.LoadingStates.show(form, { type: 'spinner', message: 'Iniciando sesión...', overlay: true });
                } else if (btn) {
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> INICIANDO SESIÓN...';
                    btn.disabled = true;
                }

                if (!window.authManager) {
                    throw new Error('AuthManager no está disponible. Recarga la página.');
                }

                if (window.Logger) window.Logger.log('🔐 Login attempt:', email ? email.replace(/(.{2}).*(@.*)/, '$1***$2') : '(sin email)');
                var success = await window.authManager.login(email, password);

                if (success) {
                    if (window.Logger) window.Logger.log('✅ Login OK, redirigiendo a:', returnUrl);
                    setTimeout(function () { window.location.href = returnUrl; }, 400);
                } else {
                    if (window.LoadingStates) window.LoadingStates.hide(form, false);
                    else if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
                    if (window.notifications) window.notifications.error('Error al iniciar sesión', 'Correo o contraseña incorrectos. Verifica e intenta de nuevo.');
                }
            } catch (error) {
                if (window.LoadingStates) window.LoadingStates.hide(form, false);
                else if (btn) { btn.innerHTML = originalText; btn.disabled = false; }

                var msg = (error && error.message) ? error.message : 'No se pudo iniciar sesión. Verifica tu conexión.';
                if (window.ErrorHandler) window.ErrorHandler.api(error, 'login', msg);
                else if (window.notifications) window.notifications.error('Error', msg);
            }
        });
    }
});
