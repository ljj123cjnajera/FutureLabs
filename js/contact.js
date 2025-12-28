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

            // Mock API call
            setTimeout(() => {
                if (window.notifications) {
                    window.notifications.show('Mensaje enviado. Te contactaremos pronto.', 'success');
                } else {
                    alert('Mensaje enviado. Te contactaremos pronto.');
                }

                form.reset();
                btn.innerHTML = 'Mensaje Enviado';

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 3000);
            }, 1500);
        });
    }
});
