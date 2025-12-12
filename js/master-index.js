/**
 * PROJECT ZERO: MASTER INDEX JS
 * Logic for the Ultimate Index Rebuild
 */

class MasterIndex {
    constructor() {
        this.init();
    }

    async init() {
        console.log('🚀 Project Zero Launched');

        await this.loadData();
        this.initStickyHeader();
        this.initMarquee();
    }

    async loadData() {
        // Mock Data for Prototype Phase (will connect to window.api later)
        this.products = [
            { id: 1, name: "Air Jordan 1 High OG", price: "S/. 899.00", image: "https://images.unsplash.com/photo-1695655455806-0568ee234f2d?q=80&w=800" },
            { id: 2, name: "Nike Dunk Low Retro", price: "S/. 599.00", image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=800" },
            { id: 3, name: "Yeezy Boost 350 V2", price: "S/. 1299.00", image: "https://images.unsplash.com/photo-1582260611295-d2a9391d17cf?q=80&w=800" },
            { id: 4, name: "Adidas Forum Low", price: "S/. 459.00", image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800" },
            { id: 5, name: "New Balance 550", price: "S/. 659.00", image: "https://images.unsplash.com/photo-1656335362192-2bc9051b1824?q=80&w=800" }
        ];

        this.renderCarousel('new-drops-track', this.products);
        this.renderCarousel('best-sellers-track', [...this.products].reverse());
    }

    renderCarousel(elementId, items) {
        const container = document.getElementById(elementId);
        if (!container) return;

        container.innerHTML = items.map(product => `
            <article class="product-card">
                <div class="product-img-wrapper">
                    <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-price">${product.price}</div>
                </div>
            </article>
        `).join('');
    }

    initStickyHeader() {
        const header = document.querySelector('.master-header');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll <= 0) {
                header.classList.remove('scroll-up');
                return;
            }

            if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
                // Scroll Down
                header.classList.remove('scroll-up');
                header.classList.add('scroll-down');
                header.style.transform = 'translateY(-100%)';
            } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
                // Scroll Up
                header.classList.remove('scroll-down');
                header.classList.add('scroll-up');
                header.style.transform = 'translateY(0)';
            }
            lastScroll = currentScroll;
        });
    }

    initMarquee() {
        // Infinite scroll logic fallback if CSS fails (optional)
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.masterApp = new MasterIndex();
});
