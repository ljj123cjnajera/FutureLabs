/**
 * Legal Pages Common Logic
 * Handles initialization for warranty, terms, returns, privacy pages
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

    // 2. Initialize Navigation Enhanced if available
    if (window.NavigationEnhanced) {
        const nav = new window.NavigationEnhanced();
        nav.init();
    }

    // 3. Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 4. Add table of contents if needed (for long legal pages)
    const legalContent = document.querySelector('.legal-content');
    if (legalContent) {
        const headings = legalContent.querySelectorAll('h2, h3');
        if (headings.length > 3) {
            // Could add a TOC here if needed
        }
    }
});
