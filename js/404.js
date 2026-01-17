document.addEventListener('DOMContentLoaded', () => {
    // Wait for Components to be ready
    const initComponents = () => {
        if (!window.Components) {
            setTimeout(initComponents, 100);
            return;
        }

        // Header Injection
        const headerContainer = document.getElementById('mainHeader');
        if (headerContainer && window.Components.getHeader) {
            if (!headerContainer.innerHTML.trim()) {
                headerContainer.innerHTML = window.Components.getHeader(true, true);
                if (window.Components.initHeader) window.Components.initHeader();
                if (window.Components.initSearch) window.Components.initSearch();
                if (window.Components.initCartCounter) window.Components.initCartCounter();
            }
        }

        // Footer Injection
        const footerContainer = document.getElementById('mainFooter');
        if (footerContainer && window.Components.getFooter) {
            if (!footerContainer.innerHTML.trim()) {
                footerContainer.innerHTML = window.Components.getFooter();
            }
        }
    };

    initComponents();
});
