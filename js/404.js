document.addEventListener('DOMContentLoaded', () => {
    // Header V7 Injection
    const headerContainer = document.getElementById('mainHeader');
    if (headerContainer && window.Components && window.Components.getHeader) {
        headerContainer.outerHTML = window.Components.getHeader(false, false); // Minimal header for 404
        window.Components.initHeader();
    }
});
