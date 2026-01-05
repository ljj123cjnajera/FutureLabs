/**
 * 📦 CATALOG ENGINE V3 (Radical Reform)
 * Focus: Robust Data, Brutalist Filtering, Instant Load.
 */

class CatalogEngine {
    constructor() {
        this.api = window.api;
        this.allProducts = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.totalPages = 1;
        this.totalProducts = 0;
        this.currentFilters = {
            brand: null,
            category: null,
            minPrice: null,
            maxPrice: null,
            onSale: false,
            inStock: true,
            search: null
        };
        this.currentSort = 'newest';
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

        // 🚀 URL PARAMETER HANDLING
        this.applyInitialFilters();
        
        // Load products after applying filters
        await this.loadProducts(this.currentPage);

        // Setup search input
        const searchInput = document.getElementById('productSearchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.search(e.target.value);
                }
            });
        }
    }

    applyInitialFilters() {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const brand = urlParams.get('brand');
        const filter = urlParams.get('filter');
        const search = urlParams.get('search');
        const page = urlParams.get('page');
        const sort = urlParams.get('sort');

        if (page) {
            this.currentPage = parseInt(page) || 1;
        }

        if (sort) {
            this.currentSort = sort;
            const sortSelect = document.getElementById('sortSelect');
            if (sortSelect) sortSelect.value = sort;
        }

        if (search) {
            this.currentFilters.search = search;
            const searchInput = document.getElementById('productSearchInput');
            if (searchInput) searchInput.value = search;
        }

        if (category || brand) {
            const target = (category || brand).toLowerCase();
            this.currentFilters.brand = target;
            this.updateFilterButtons(target);
        }

        if (filter) {
            if (filter === 'sale' || filter === 'on-sale') {
                this.currentFilters.onSale = true;
            }
            if (filter === 'new' || filter === 'new-arrivals') {
                // Will be handled by API or client-side
            }
        }
    }

    async loadProducts(page = 1) {
        const container = document.getElementById('productsContainer');
        const countLabel = document.getElementById('productCount');
        
        // Show loading state
        if (container) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem;">
                    <div class="loading-brutalist">CARGANDO PRODUCTOS...</div>
                </div>
            `;
        }

        try {
            // Build API filters
            const apiFilters = {
                page: page,
                limit: this.itemsPerPage,
                sort_by: this.getSortField(),
                sort_order: this.getSortOrder()
            };

            if (this.currentFilters.brand && this.currentFilters.brand !== 'all') {
                apiFilters.brand = this.currentFilters.brand;
            }
            if (this.currentFilters.category) {
                apiFilters.category_id = this.currentFilters.category;
            }
            if (this.currentFilters.minPrice) {
                apiFilters.min_price = this.currentFilters.minPrice;
            }
            if (this.currentFilters.maxPrice) {
                apiFilters.max_price = this.currentFilters.maxPrice;
            }
            if (this.currentFilters.search) {
                apiFilters.search = this.currentFilters.search;
            }
            if (this.currentFilters.onSale) {
                // Will filter client-side for now
            }

            // Call API with filters
            const response = await this.api.getProducts(apiFilters);
            
            // Handle different response formats
            let products = [];
            let total = 0;
            
            if (Array.isArray(response)) {
                products = response;
                total = response.length;
            } else if (response && response.data) {
                products = response.data.products || response.data || [];
                total = response.data.total || products.length;
                this.totalPages = response.data.pages || Math.ceil(total / this.itemsPerPage);
            } else if (response && response.products) {
                products = response.products;
                total = response.total || products.length;
            } else {
                products = [];
                total = 0;
            }

            // Apply client-side filters if needed
            if (this.currentFilters.onSale) {
                products = products.filter(p => p.discount_price || p.on_sale);
            }
            if (this.currentFilters.inStock) {
                products = products.filter(p => (p.stock_quantity || 0) > 0);
            }

            this.allProducts = products;
            this.filteredProducts = products;
            this.totalProducts = total;
            this.currentPage = page;
            this.totalPages = Math.ceil(total / this.itemsPerPage);

            this.render(products);
            this.updatePagination();
            if (countLabel) countLabel.textContent = total;
            
        } catch (e) {
            console.error('⚠️ [CatalogEngine] API Failed', e);
            this.allProducts = [];
            this.filteredProducts = [];
            if (container) {
                container.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; border: 2px dashed var(--gray-300);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 1rem;"></i>
                        <h2 class="text-2xl font-black uppercase mb-2">ERROR DE CONEXIÓN</h2>
                        <p class="text-gray-600 mb-4">No se pudieron cargar los productos.</p>
                        <button onclick="location.reload()" class="btn btn-black">RECARGAR</button>
                    </div>
                `;
            }
            if (window.notifications) window.notifications.error('Error de Conexión', 'No se pudieron cargar los productos.');
        }
    }

    getSortField() {
        switch(this.currentSort) {
            case 'price-asc':
            case 'price-desc':
                return 'price';
            case 'name-asc':
            case 'name-desc':
                return 'name';
            case 'newest':
            default:
                return 'created_at';
        }
    }

    getSortOrder() {
        switch(this.currentSort) {
            case 'price-asc':
            case 'name-asc':
                return 'asc';
            case 'price-desc':
            case 'name-desc':
            case 'newest':
            default:
                return 'desc';
        }
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
                        <img src="${p.image_url || 'assets/images/products/placeholder.jpg'}" 
                             class="product-image" 
                             alt="${p.name}" 
                             loading="lazy"
                             onerror="this.src='assets/images/products/placeholder.jpg'">
                        ${p.badge ? `<div class="product-badges"><span class="product-badge">${p.badge}</span></div>` : ''}
                        ${(p.stock_quantity || 0) === 0 ? '<div class="product-badges"><span class="product-badge sold-out">AGOTADO</span></div>' : ''}
                    </div>
                    <div class="product-content">
                        <span class="product-category">${p.brand || 'SNEAKERS'}</span>
                        <h3 class="product-title">${p.name}</h3>
                        
                        <div class="product-price-container">
                             <span class="product-price-current">S/ ${(p.discount_price || p.price || 0).toFixed(2)}</span>
                             ${p.discount_price && p.discount_price < p.price ? `<span class="product-price-old" style="text-decoration: line-through; color: var(--gray-500); margin-left: 0.5rem; font-size: 0.9rem;">S/ ${p.price.toFixed(2)}</span>` : ''}
                        </div>
                        
                        <button class="product-btn" 
                                onclick="event.stopPropagation(); window.catalogEngine.quickAdd(${p.id}, '${p.name}', event)"
                                ${(p.stock_quantity || 0) === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                            <i class="fas fa-shopping-cart"></i> ${(p.stock_quantity || 0) === 0 ? 'AGOTADO' : 'AGREGAR AL CARRITO'}
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    // ⚡ INTERACTION LOGIC
    filter(brand) {
        this.currentFilters.brand = brand;
        this.currentPage = 1;
        this.updateFilterButtons(brand);
        this.loadProducts(1);
    }

    updateFilterButtons(activeBrand) {
        document.querySelectorAll('.btn-filter').forEach(btn => {
            const btnBrand = btn.getAttribute('onclick')?.match(/filter\(['"](.*?)['"]\)/)?.[1];
            if (btnBrand === activeBrand) {
                btn.setAttribute('aria-pressed', 'true');
                btn.classList.add('active');
            } else {
                btn.setAttribute('aria-pressed', 'false');
                btn.classList.remove('active');
            }
        });
    }

    sort(criteria) {
        this.currentSort = criteria;
        this.currentPage = 1;
        this.loadProducts(1);
    }

    setPriceFilter(min, max) {
        this.currentFilters.minPrice = min || null;
        this.currentFilters.maxPrice = max || null;
        this.currentPage = 1;
        this.loadProducts(1);
    }

    setCategoryFilter(categoryId) {
        this.currentFilters.category = categoryId;
        this.currentPage = 1;
        this.loadProducts(1);
    }

    toggleSaleFilter() {
        this.currentFilters.onSale = !this.currentFilters.onSale;
        this.currentPage = 1;
        this.loadProducts(1);
    }

    toggleStockFilter() {
        this.currentFilters.inStock = !this.currentFilters.inStock;
        this.currentPage = 1;
        this.loadProducts(1);
    }

    search(query) {
        this.currentFilters.search = query;
        this.currentPage = 1;
        this.loadProducts(1);
    }

    clearFilters() {
        this.currentFilters = {
            brand: null,
            category: null,
            minPrice: null,
            maxPrice: null,
            onSale: false,
            inStock: true,
            search: null
        };
        this.currentSort = 'newest';
        this.currentPage = 1;
        this.updateFilterButtons('all');
        document.getElementById('sortSelect').value = 'newest';
        this.loadProducts(1);
    }

    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadProducts(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    updateURL() {
        const url = new URL(window.location);
        if (this.currentFilters.brand && this.currentFilters.brand !== 'all') {
            url.searchParams.set('brand', this.currentFilters.brand);
        } else {
            url.searchParams.delete('brand');
        }
        if (this.currentFilters.search) {
            url.searchParams.set('search', this.currentFilters.search);
        } else {
            url.searchParams.delete('search');
        }
        if (this.currentPage > 1) {
            url.searchParams.set('page', this.currentPage);
        } else {
            url.searchParams.delete('page');
        }
        if (this.currentSort !== 'newest') {
            url.searchParams.set('sort', this.currentSort);
        } else {
            url.searchParams.delete('sort');
        }
        window.history.pushState({}, '', url);
    }

    updatePagination() {
        const paginationContainer = document.querySelector('.pagination-brutalist');
        if (!paginationContainer) return;

        if (this.totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }

        paginationContainer.style.display = 'flex';
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button class="btn btn-outline" 
                    ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="window.catalogEngine.goToPage(${this.currentPage - 1})"
                    aria-label="Página anterior">
                PREV
            </button>
        `;

        // Page numbers
        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            paginationHTML += `
                <button class="btn btn-outline" onclick="window.catalogEngine.goToPage(1)" aria-label="Página 1">1</button>
            `;
            if (startPage > 2) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="btn ${i === this.currentPage ? 'btn-black' : 'btn-outline'}" 
                        onclick="window.catalogEngine.goToPage(${i})"
                        aria-label="Página ${i}"
                        ${i === this.currentPage ? 'aria-current="page"' : ''}>
                    ${i}
                </button>
            `;
        }

        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
            paginationHTML += `
                <button class="btn btn-outline" 
                        onclick="window.catalogEngine.goToPage(${this.totalPages})" 
                        aria-label="Página ${this.totalPages}">
                    ${this.totalPages}
                </button>
            `;
        }

        // Next button
        paginationHTML += `
            <button class="btn btn-outline" 
                    ${this.currentPage === this.totalPages ? 'disabled' : ''} 
                    onclick="window.catalogEngine.goToPage(${this.currentPage + 1})"
                    aria-label="Página siguiente">
                NEXT
            </button>
        `;

        paginationContainer.innerHTML = paginationHTML;
    }

    quickAdd(id, name, event) {
        if (event) event.stopPropagation();
        
        if (window.cartManager) {
            window.cartManager.add(id, 1);
            if (window.notifications) {
                window.notifications.success('AÑADIDO AL CARRITO', `${name} se agregó correctamente`);
            }
        } else if (window.CartEngine) {
            // Try alternative cart engine
            const cartEngine = new window.CartEngine();
            cartEngine.addToCart(id, 1);
            if (window.notifications) {
                window.notifications.success('AÑADIDO AL CARRITO', `${name} se agregó correctamente`);
            }
        } else {
            // Fallback: redirect to product detail
            window.location.href = `product-detail.html?id=${id}`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.catalogEngine = new CatalogEngine();
});
