/**
 * 📦 CATALOG ENGINE V3 (Radical Reform)
 * Focus: Robust Data, Brutalist Filtering, Instant Load.
 */

class CatalogEngine {
    constructor() {
        this.api = window.api;
        this.allProducts = []; // Store for client-side filtering (perf optimization)

        this.api = window.api;
        this.allProducts = []; // Store for client-side filtering (perf optimization)
        this.init();
    }

    async init() {
        console.log('📦 [CatalogEngine] V3 Initialized');

        // Init Globals immediately
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

        await this.loadProducts();

        // 🚀 URL PARAMETER HANDLING
        this.applyInitialFilters();
    }

    applyInitialFilters() {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const brand = urlParams.get('brand'); // Alias for category often used
        const filter = urlParams.get('filter'); // e.g. 'new', 'sale'
        const search = urlParams.get('search');

        if (search) {
            // If search exists, wait for search engine or simple filter
            const query = search.toLowerCase();
            const filtered = this.allProducts.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.brand.toLowerCase().includes(query)
            );
            this.render(filtered);
            // Update UI to show search term
            const titleEl = document.querySelector('.section-header h2');
            if (titleEl) titleEl.textContent = `SEARCH: "${search}"`;
            return;
        }

        if (category || brand) {
            const target = (category || brand).toLowerCase();
            this.filter(target);
            // Highlight active category in UI if exists
            return;
        }

        if (filter) {
            if (filter === 'new' || filter === 'new-arrivals') {
                // Mock logic for 'new'
                const filtered = this.allProducts.filter(p => p.badge === 'NEW' || p.is_new);
                if (filtered.length > 0) this.render(filtered);
            }
            if (filter === 'sale') {
                const filtered = this.allProducts.filter(p => p.discount_price || p.badge === 'SALE');
                if (filtered.length > 0) this.render(filtered);
            }
        }
    }

    async loadProducts() {
        const container = document.getElementById('productsContainer');
        const countLabel = document.getElementById('productCount');

        try {
            // Try API
            const response = await this.api.getProducts();
            if (response && response.length > 0) {
                this.allProducts = response;
            } else {
                // API Empty implies strict empty state
                this.allProducts = [];
            }
        } catch (e) {
            console.error('⚠️ [CatalogEngine] API Failed', e);
            this.allProducts = [];
            if (window.notifications) window.notifications.error('Connection Failed', 'Could not load products.');
        }

        this.render(this.allProducts);
        if (countLabel) countLabel.textContent = this.allProducts.length;
    }

    render(products) {
        const container = document.getElementById('productsContainer');
        if (!container) return;

        // Use Global Standard Card Generator
        if (products.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; border: 2px dashed var(--gray-300);">
                    <i class="fas fa-box-open" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 1rem;"></i>
                    <h2 class="text-2xl font-black uppercase mb-2">NO PRODUCTS FOUND</h2>
                    <p class="text-gray-600">Check back later for new drops.</p>
                </div>
             `;
            return;
        }

        if (window.Components && window.Components.getProductCard) {
            container.innerHTML = products.map(p => window.Components.getProductCard(p)).join('');
        } else {
            // Fallback just in case (Brutalist V3 Structure)
            container.innerHTML = products.map(p => `
                <div class="product-card" onclick="window.location.href='product-detail.html?id=${p.id}'">
                    <div class="product-image-container">
                        <img src="${p.image_url}" class="product-image" alt="${p.name}">
                        ${p.badge ? `<div class="product-badges"><span class="product-badge">${p.badge}</span></div>` : ''}
                    </div>
                    <div class="product-content">
                        <span class="product-category">${p.brand}</span>
                        <h3 class="product-title">${p.name}</h3>
                        
                        <div class="product-price-container">
                             <span class="product-price-current">S/ ${p.price.toFixed(2)}</span>
                             <button class="btn-quick-add" onclick="event.stopPropagation(); window.catalogEngine.quickAdd(${p.id}, '${p.name}')">
                                <i class="fas fa-plus"></i>
                             </button>
                        </div>
                        
                        <button class="product-btn">ADD TO CART</button>
                    </div>
                </div>
            `).join('');
        }
    }

    // ⚡ INTERACTION LOGIC
    filter(brand) {
        if (brand === 'all') {
            this.render(this.allProducts);
        } else {
            const filtered = this.allProducts.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
            this.render(filtered);
        }
    }

    sort(criteria) {
        let sorted = [...this.allProducts];
        if (criteria === 'price-asc') sorted.sort((a, b) => a.price - b.price);
        if (criteria === 'price-desc') sorted.sort((a, b) => b.price - a.price);
        // newest logic omitted for brevity in mock
        this.render(sorted);
    }

    quickAdd(id, name) {
        if (window.cartManager) {
            window.cartManager.add(id, 1);
            if (window.notifications) window.notifications.success('AÑADIDO', `${name} al carrito`);
        } else {
            // Fallback if cartManager not ready
            if (window.notifications) window.notifications.success('MOCK', 'Added to cart (Simulation)');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.catalogEngine = new CatalogEngine();
});
