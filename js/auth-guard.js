
// 🛡️ Global Auth Guard
window.handleAuthRedirect = function (event, destination) {
    if (event) event.preventDefault();

    const token = localStorage.getItem('auth_token');

    if (token) {
        // User is logged in, proceed
        window.location.href = destination;
    } else {
        // User is guest, redirect to login with return URL
        console.log('🔒 Guest user detected, redirecting to login...');
        const returnUrl = encodeURIComponent(destination);
        window.location.href = `login.html?returnUrl=${returnUrl}`;
    }
};

// Also protect profile.html directly if accessed via URL
if (window.location.pathname.includes('profile.html')) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'login.html?returnUrl=profile.html';
    }
}
