/**
 * 📦 CATALOG ENGINE V3 (Radical Reform)
 * Focus: Robust Data, Brutalist Filtering, Instant Load.
 */

class CatalogEngine {
    constructor() {
        this.api = window.api;
        this.allProducts = []; // Store for client-side filtering (perf optimization)

        // 🛡️ MOCK DATA FORTRESS
        this.fallbackProducts = [
            { id: 201, name: 'Air Jordan 1 High "Chicago"', brand: 'Jordan', price: 1200.00, image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=800', badge: 'GRAIL' },
            { id: 202, name: 'Yeezy Boost 350 "Onyx"', brand: 'Yeezy', price: 950.00, image_url: 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?auto=format&fit=crop&q=80&w=800', badge: 'NEW' },
            { id: 203, name: 'Nike Dunk Low SB', brand: 'Nike', price: 450.00, image_url: 'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&q=80&w=800' },
            { id: 204, name: 'New Balance 2002R', brand: 'New Balance', price: 600.00, image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=800' },
            { id: 205, name: 'Adidas Samba OG', brand: 'Adidas', price: 380.00, image_url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&q=80&w=800' },
            { id: 206, name: 'Jordan 4 Retro "Military Black"', brand: 'Jordan', price: 1100.00, image_url: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&q=80&w=800' },
            { id: 207, name: 'Nike Air Max 1', brand: 'Nike', price: 550.00, image_url: 'https://images.unsplash.com/photo-1514989940723-e8875ea6ab7d?auto=format&fit=crop&q=80&w=800' },
            { id: 208, name: 'Rick Owens Ramones', brand: 'Rick Owens', price: 2500.00, image_url: 'https://images.unsplash.com/photo-1620332302351-8ca260e35730?auto=format&fit=crop&q=80&w=800', badge: 'LUXURY' }
        ];

        this.init();
    }

    async init() {
        console.log('📦 [CatalogEngine] V3 Initialized');
        await this.loadProducts();
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
                throw new Error('API Empty');
            }
        } catch (e) {
            console.warn('⚠️ [CatalogEngine] Using Fallback Data', e);
            // Multiply fallback data to fill grid
            this.allProducts = [...this.fallbackProducts, ...this.fallbackProducts];
        }

        this.render(this.allProducts);
        if (countLabel) countLabel.textContent = this.allProducts.length;
    }

    render(products) {
        const container = document.getElementById('productsContainer');
        if (!container) return;

        // Use Global Standard Card Generator
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
