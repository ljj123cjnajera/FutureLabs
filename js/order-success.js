document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Components
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

        // CHECK AUTH STATE & SHOW UPSELL
        const isGuest = !window.authManager || !window.authManager.isAuthenticated();

        if (isGuest) {
            // 1. Hide "View Order" button (requires auth)
            const viewBtn = document.getElementById('viewOrderBtn');
            if (viewBtn) viewBtn.style.display = 'none';

            // 2. Show Upsell
            const upsell = document.getElementById('guestUpsell');
            const upsellEmail = document.getElementById('upsellEmail');
            const registerLink = document.getElementById('registerLink');

            if (upsell) {
                upsell.style.display = 'block';
                if (upsellEmail) upsellEmail.textContent = email;
                if (registerLink) registerLink.href = `register.html?email=${encodeURIComponent(email)}`;
            }
        }

    } else if (window.authManager && window.authManager.currentUser) {
        const el = document.getElementById('customerEmail');
        if (el) el.textContent = window.authManager.currentUser.email;
    }
});
