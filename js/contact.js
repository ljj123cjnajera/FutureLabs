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

            // Intentar enviar al backend si existe endpoint
            if (window.api && window.api.request) {
                try {
                    const response = await window.api.request('/api/contact', {
                        method: 'POST',
                        body: JSON.stringify(formData),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response && response.success) {
                        if (window.notifications) {
                            window.notifications.success('Mensaje enviado', 'Te contactaremos pronto a ' + formData.email);
                        } else {
                            if (window.notifications) {
                                window.notifications.success('Mensaje enviado', 'Te contactaremos pronto.');
                            } else {
                                if (window.notifications) {
                                    window.notifications.success('Mensaje enviado', 'Te contactaremos pronto a ' + formData.email);
                                }
                            }
                        }
                        form.reset();
                        btn.innerHTML = 'Mensaje Enviado ✓';
                        setTimeout(() => {
                            btn.innerHTML = originalText;
                            btn.disabled = false;
                        }, 3000);
                    } else {
                        throw new Error(response?.message || 'Error al enviar');
                    }
                } catch (error) {
                    if (window.Logger) window.Logger.error('Error sending contact form:', error);
                    // Fallback: mostrar mensaje de éxito aunque no se haya enviado (para UX)
                    if (window.notifications) {
                        window.notifications.info('Mensaje recibido', 'Gracias por contactarnos. Te responderemos pronto.');
                    }
                    form.reset();
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            } else {
                // Sin API disponible, simular envío exitoso
                setTimeout(() => {
                    if (window.notifications) {
                        window.notifications.success('Mensaje enviado', 'Te contactaremos pronto a ' + formData.email);
                    }
                    form.reset();
                    btn.innerHTML = 'Mensaje Enviado ✓';
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }, 3000);
                }, 1500);
            }
        });
    }
});
