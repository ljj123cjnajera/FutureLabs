document.addEventListener('DOMContentLoaded', function () {
    const headerContainer = document.getElementById('mainHeader');
    const footerContainer = document.getElementById('mainFooter');

    // 1. Initialize Global Components
    if (headerContainer && window.Components) {
        headerContainer.innerHTML = window.Components.getHeader(true, true);
        window.Components.initHeader();
        window.Components.initSearch();
        window.Components.initCartCounter();
    }

    if (footerContainer && window.Components) {
        footerContainer.innerHTML = window.Components.getFooter();
    }

    // 2. FAQ Accordion Logic
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function () {
            const item = this.parentElement;
            const isActive = item.classList.contains('active');
            const answerId = this.getAttribute('aria-controls');

            // Close all items
            document.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('active');
                const btn = i.querySelector('.faq-question');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            });

            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
                this.setAttribute('aria-expanded', 'true');
            } else {
                this.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // 3. FAQ Search & Filter Logic
    const faqSearch = document.getElementById('faqSearch');
    const faqItems = Array.from(document.querySelectorAll('.faq-item'));
    const faqEmptyState = document.getElementById('faqEmptyState');
    const faqClearButtons = document.querySelectorAll('[data-faq-clear]');
    const faqCount = document.querySelector('[data-faq-count]');

    const applyFaqFilter = () => {
        const searchTerm = faqSearch?.value.trim().toLowerCase() ?? '';
        let matches = 0;

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question h3')?.textContent.toLowerCase() ?? '';
            const answer = item.querySelector('.faq-answer-content')?.textContent.toLowerCase() ?? '';
            const shouldShow = !searchTerm || question.includes(searchTerm) || answer.includes(searchTerm);

            item.style.display = shouldShow ? '' : 'none';
            if (shouldShow) matches += 1;
        });

        if (faqCount) faqCount.textContent = matches.toString();
        if (faqEmptyState) faqEmptyState.hidden = matches > 0;
    };

    if (faqSearch) {
        faqSearch.addEventListener('input', applyFaqFilter);
    }

    if (faqClearButtons.length) {
        faqClearButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (!faqSearch) return;
                faqSearch.value = '';
                faqSearch.focus();
                applyFaqFilter();
            });
        });
    }

    applyFaqFilter();
});
