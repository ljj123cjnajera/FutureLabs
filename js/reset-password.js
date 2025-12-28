document.addEventListener('DOMContentLoaded', () => {
    const headerContainer = document.getElementById('mainHeader');
    if (headerContainer && window.Components) {
        headerContainer.innerHTML = window.Components.getHeader(true, false);
        window.Components.initHeader();
        window.Components.initSearch();
        window.Components.initCartCounter();
    }

    const footerContainer = document.getElementById('mainFooter');
    if (footerContainer && window.Components) {
        footerContainer.innerHTML = window.Components.getFooter();
    }

    const form = document.getElementById('resetForm');
    const submitBtn = document.getElementById('submitBtn');

    if (!form || !submitBtn) {
        return;
    }

    // Auto-fill token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
        document.getElementById('token').value = tokenParam;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = document.getElementById('token').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            window.notifications?.error?.('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            window.notifications?.error?.('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading-inline"><span class="loading-spinner small"></span> Restableciendo...</span>';

        try {
            const response = await window.api.resetPassword(token, password);

            if (response.success) {
                window.notifications?.success?.('Contraseña restablecida exitosamente');
                form.reset();

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                window.notifications?.error?.(response.message || 'Error al restablecer contraseña');
            }
        } catch (error) {
            console.error('Error en resetPassword:', error);
            window.notifications?.error?.('Error al conectar con el servidor');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Restablecer Contraseña';
        }
    });
});
