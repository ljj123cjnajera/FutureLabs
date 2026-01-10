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
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = form.querySelector('.btn-auth');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
            btn.disabled = true;

            const email = form.querySelector('input[type="email"]').value;
            const password = form.querySelector('input[type="password"]').value;

            // Get return URL from Query Param OR LocalStorage
            const urlParams = new URLSearchParams(window.location.search);
            let returnUrl = urlParams.get('returnUrl');

            if (!returnUrl) {
                returnUrl = localStorage.getItem('redirect_after_login') || 'profile.html';
                localStorage.removeItem('redirect_after_login'); // Clean up
            }

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
                if (window.Logger) window.Logger.error('AuthManager not loaded');
                btn.innerHTML = 'System Error';
            }
        });
    }
});
