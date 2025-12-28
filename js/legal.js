/**
 * Legal Pages Logic (Terms, Privacy, Returns, Warranty)
 * Handles: Header/Footer injection, Table of Contents (TOC) ScrollSpy, and Smooth Scrolling.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Global Components
    if (window.Components) {
        const header = document.getElementById('mainHeader');
        if (header && !header.innerHTML.trim()) {
            header.innerHTML = window.Components.getHeader(true, true);
            if (window.Components.initHeader) window.Components.initHeader();
            if (window.Components.initSearch) window.Components.initSearch();
            if (window.Components.initCartCounter) window.Components.initCartCounter();
        }

        const footer = document.getElementById('mainFooter');
        if (footer && !footer.innerHTML.trim()) {
            footer.innerHTML = window.Components.getFooter();
        }
    }

    // 2. Table of Contents (TOC) Logic
    initTOC();

    // 3. Update "Last Updated" Date if element exists (Optional dynamic tweak)
    const dateLabel = document.getElementById('legalUpdatedLabel');
    if (dateLabel && !dateLabel.textContent.includes('2025')) {
        dateLabel.textContent = '16 Oct 2025';
    }
});

function initTOC() {
    const tocLinks = Array.from(document.querySelectorAll('.legal-toc a[href^="#"]'));
    if (tocLinks.length === 0) return;

    // A. Smooth Scroll on Click
    tocLinks.forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);
            if (!target) return;

            // Offset for fixed header
            const headerOffset = 100;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });

            // Update active class immediately
            tocLinks.forEach(item => item.classList.remove('is-active'));
            link.classList.add('is-active');
        });
    });

    // B. ScrollSpy (Intersection Observer)
    const sections = tocLinks
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    if (sections.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px', // Active when element is in top-middle of viewport
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const activeId = entry.target.getAttribute('id');
                    tocLinks.forEach(link => {
                        const href = link.getAttribute('href').replace('#', '');
                        if (href === activeId) {
                            tocLinks.forEach(item => item.classList.remove('is-active'));
                            link.classList.add('is-active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }
}
