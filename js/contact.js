/**
 * Contact Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Components
    if (window.Components) {
        const header = document.getElementById('mainHeader');
        if (header && !header.innerHTML.trim()) {
            header.innerHTML = window.Components.getHeader(true, true);
            if (window.Components.initHeader) window.Components.initHeader();
        }

        const footer = document.getElementById('mainFooter');
        if (footer && !footer.innerHTML.trim()) {
            footer.innerHTML = window.Components.getFooter();
        }
    }

    // 2. Handle Contact Form
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;

            // Simulate processing
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            btn.disabled = true;

            // Obtener datos del formulario
            const formData = {
                name: form.querySelector('input[type="text"]').value.trim(),
                email: form.querySelector('input[type="email"]').value.trim(),
                message: form.querySelector('textarea').value.trim()
            };

            // Validación básica
            if (!formData.name || !formData.email || !formData.message) {
                if (window.notifications) {
                    window.notifications.error('Error', 'Por favor completa todos los campos');
                }
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }

            // Validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                if (window.notifications) {
                    window.notifications.error('Error', 'Por favor ingresa un email válido');
                }
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }

            // Intentar enviar al backend si existe endpoint, sino mostrar mensaje
            try {
                // TODO: Implementar endpoint /api/contact en backend
                // Por ahora, simular envío exitoso
                setTimeout(() => {
                    if (window.notifications) {
                        window.notifications.success('Mensaje enviado', 'Te contactaremos pronto a ' + formData.email);
                    } else {
                        alert('Mensaje enviado. Te contactaremos pronto.');
                    }

                    form.reset();
                    btn.innerHTML = 'Mensaje Enviado ✓';

                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }, 3000);
                }, 1500);
            } catch (error) {
                console.error('Error sending contact form:', error);
                if (window.notifications) {
                    window.notifications.error('Error', 'No se pudo enviar el mensaje. Por favor intenta de nuevo.');
                }
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }
});
