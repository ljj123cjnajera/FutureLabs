document.addEventListener('DOMContentLoaded', async () => {
    // 1. Load Components
    if (window.Components) {
        window.Components.loadHeader(false, false); // Minimal header

        // Lazy load footer using HomeEngine logic if available, or simple inject
        const footer = document.getElementById('mainFooter');
        if (footer && window.HomeEngine) {
            // Using HomeEngine's footer generator if accessible, else manual
            // For now, simpler:
            footer.innerHTML = `
                <div style="background:var(--black); color:var(--white); padding:3rem 1rem; text-align:center; margin-top:4rem;">
                    <h4 style="margin-bottom:1rem;">SNEAKERS SHOP</h4>
                    <p style="opacity:0.6; font-size:0.9rem;">&copy; 2025 ALL RIGHTS RESERVED.</p>
                </div>
             `;
        }
    }

    // 2. Get Order ID
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');
    const email = params.get('email');

    if (orderId) {
        const badge = document.getElementById('orderIdDisplay');
        const container = document.getElementById('orderIdContainer');
        if (badge && container) {
            const safeOrderId = (orderId && typeof orderId === 'string') ? orderId.toUpperCase() : 'N/A';
            badge.textContent = `ORDER #${safeOrderId}`;
            container.style.display = 'block';
        }
    }

    if (email) {
        const el = document.getElementById('customerEmail');
        if (el) el.textContent = email;
    } else if (window.authManager && window.authManager.currentUser) {
        const el = document.getElementById('customerEmail');
        if (el) el.textContent = window.authManager.currentUser.email;
    }
});
