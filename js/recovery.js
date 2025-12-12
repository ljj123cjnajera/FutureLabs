// 🔐 Password Recovery Logic - SneakersShop

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Header
    const headerContainer = document.getElementById('mainHeader');
    if (headerContainer && window.Components) {
        headerContainer.innerHTML = window.Components.getHeader(true, false);
        window.Components.initHeader();
        window.Components.initSearch();
        window.Components.initCartCounter();
    }

    // Inicializar Footer
    const footerContainer = document.getElementById('mainFooter');
    if (footerContainer && window.Components) {
        footerContainer.innerHTML = window.Components.getFooter();
    }

    // Logic del Formulario
    const form = document.getElementById('recoveryForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');

    if (!form || !submitBtn || !successMessage) {
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById('email');
        const email = emailInput.value.trim();

        if (!email) {
            window.notifications?.error?.('Por favor ingresa tu email');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading-inline"><span class="loading-spinner small"></span> Enviando...</span>';

        try {
            const response = await window.api.requestPasswordRecovery(email);

            if (response.success) {
                // Ocultar formulario y mostrar mensaje de éxito
                form.style.display = 'none';
                successMessage.classList.add('show');
                window.notifications?.success?.('Instrucciones enviadas');

                // Mostrar token solo en desarrollo para facilitar pruebas
                if (response.resetToken) {
                    console.log('🔑 Token de recuperación (DEV):', response.resetToken);
                    // No usamos alert en producción, pero útil aquí si no hay servidor de correo real
                    console.info('Usa este token para resetear la contraseña en /reset-password.html?token=' + response.resetToken);
                }
            } else {
                window.notifications?.error?.(response.message || 'Error al enviar instrucciones');
            }
        } catch (error) {
            console.error('Error al enviar instrucciones:', error);
            window.notifications?.error?.('Error al conectar con el servidor');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                if (!successMessage.classList.contains('show')) {
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Instrucciones';
                }
            }
        }
    });
});
