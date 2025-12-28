/**
 * About Page Logic
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

    // Future: Add animations or interaction for "Why Us" cards here
});
