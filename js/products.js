/**
 * 📦 CATALOG ENGINE V3 (Radical Reform)
 * Focus: Robust Data, Brutalist Filtering, Instant Load.
 */

class CatalogEngine {
    constructor() {
        this.api = window.api;
        this.allProducts = [];
        this.filteredProducts = [];
        this.categories = [];
        this.brands = [];
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
            inStock: false, // false = mostrar todos, true = solo con stock
            search: null
        };
        this.currentSort = 'newest';
        this.viewMode = 'grid';
        this.searchDebounceTimer = null;
        this.init();
    }

    async init() {
        if (window.Logger) window.Logger.log('📦 [CatalogEngine] V3 Initialized');

        // Wait for API to be ready
        if (!window.api) {
            if (window.Logger) window.Logger.error('⚠️ [CatalogEngine] API not available, retrying...');
            setTimeout(() => this.init(), 500);
            return;
        }

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

        // Load categories and brands for filter (don't wait if they fail)
        try {
            await this.loadCategories();
        } catch (e) {
            if (window.Logger) window.Logger.warn('Failed to load categories:', e);
        }
        
        try {
            await this.loadBrands();
        } catch (e) {
            if (window.Logger) window.Logger.warn('Failed to load brands:', e);
        }

        // 🚀 URL PARAMETER HANDLING
        this.applyInitialFilters();
        
        // Load products after applying filters
        await this.loadProducts(this.currentPage);

        // Setup search input with debounce
        const searchInput = document.getElementById('productSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                clearTimeout(this.searchDebounceTimer);
                this.searchDebounceTimer = setTimeout(() => {
                    this.search(query);
                }, 500);
            });
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    clearTimeout(this.searchDebounceTimer);
                    this.search(e.target.value.trim());
                }
            });
        }

        // Setup view mode from localStorage
        const savedView = localStorage.getItem('productsViewMode') || 'grid';
        this.setViewMode(savedView);
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

        if (category) {
            // Category filter - need to get category_id from slug
            this.currentFilters.categorySlug = category.toLowerCase();
            // Will need to resolve category_id when loading products
        }
        if (brand) {
            const target = brand.toLowerCase();
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
        
        // Show loading state using LoadingStates
        if (container && window.LoadingStates) {
            window.LoadingStates.show('productsContainer', {
                message: 'Cargando productos...',
                type: 'spinner'
            });
        } else if (container) {
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
            } else if (this.currentFilters.categorySlug) {
                // If we have a category slug, map common ones to brand filters
                // This is a temporary solution - ideally we'd resolve the slug to ID first
                const slugMap = {
                    'jordan': 'Jordan',
                    'nike': 'Nike',
                    'adidas': 'Adidas',
                    'yeezy': 'Yeezy'
                };
                if (slugMap[this.currentFilters.categorySlug]) {
                    apiFilters.brand = slugMap[this.currentFilters.categorySlug];
                }
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
            // Add server-side filters
            if (this.currentFilters.onSale) {
                apiFilters.onSale = true;
            }
            if (this.currentFilters.inStock) {
                apiFilters.inStock = true;
            }

            // Call API with filters
            if (window.Logger) window.Logger.log('📦 [CatalogEngine] Loading products with filters:', apiFilters);
            
            const response = await this.api.getProducts(apiFilters);
            
            if (window.Logger) {
                window.Logger.log('📦 [CatalogEngine] API Response:', response);
                window.Logger.log('📦 [CatalogEngine] Response type:', typeof response);
                window.Logger.log('📦 [CatalogEngine] Is Array:', Array.isArray(response));
            }
            
            // Handle different response formats
            let products = [];
            let total = 0;
            let pages = 1;
            
            if (Array.isArray(response)) {
                // Direct array response
                products = response;
                total = response.length;
                pages = Math.ceil(total / this.itemsPerPage);
                if (window.Logger) window.Logger.log('✅ [CatalogEngine] Parsed as direct array');
            } else if (response && response.success === true && response.data) {
                // Standard API response: { success: true, data: { products: [], total: X, pages: Y } }
                products = response.data.products || response.data || [];
                total = response.data.total !== undefined ? response.data.total : products.length;
                pages = response.data.pages !== undefined ? response.data.pages : Math.ceil(total / this.itemsPerPage);
                if (window.Logger) window.Logger.log('✅ [CatalogEngine] Parsed as success response with data');
            } else if (response && response.data) {
                // Response with data but no success field
                products = response.data.products || response.data || [];
                total = response.data.total !== undefined ? response.data.total : products.length;
                pages = response.data.pages !== undefined ? response.data.pages : Math.ceil(total / this.itemsPerPage);
                if (window.Logger) window.Logger.log('✅ [CatalogEngine] Parsed as response with data');
            } else if (response && response.products) {
                // Response with products array directly
                products = response.products;
                total = response.total !== undefined ? response.total : products.length;
                pages = response.pages !== undefined ? response.pages : Math.ceil(total / this.itemsPerPage);
                if (window.Logger) window.Logger.log('✅ [CatalogEngine] Parsed as response with products');
            } else if (response && response.success === false) {
                // API returned an error
                const errorMsg = response.message || 'Error al cargar productos';
                if (window.Logger) window.Logger.error('❌ [CatalogEngine] API Error:', errorMsg);
                throw new Error(errorMsg);
            } else {
                // Unknown or empty response
                if (window.Logger) window.Logger.warn('⚠️ [CatalogEngine] Unknown response format or empty response');
                products = [];
                total = 0;
            }
            
            if (window.Logger) window.Logger.log(`📦 [CatalogEngine] Parsed ${products.length} products, total: ${total}, pages: ${pages}`);

            this.allProducts = products;
            this.filteredProducts = products;
            this.totalProducts = total;
            this.currentPage = page;
            this.totalPages = pages;

            // Hide loading state (don't restore original content, we're about to render)
            if (window.LoadingStates) {
                const container = document.getElementById('productsContainer');
                if (container) {
                    // Remove loading overlay if exists
                    const overlay = container.querySelector('.loading-overlay');
                    if (overlay) overlay.remove();
                    // Clear any loading content
                    if (container.innerHTML.includes('Cargando') || container.innerHTML.includes('loading')) {
                        container.innerHTML = '';
                    }
                }
            }

            this.render(products);
            this.updatePagination();
            this.updateURL();
            this.updateCounts();
            
            // Update product count in hero section
            if (countLabel) countLabel.textContent = this.totalProducts || 0;
            
        } catch (e) {
            if (window.ErrorHandler) {
                window.ErrorHandler.api(e, 'loadProducts', 'No se pudieron cargar los productos. Por favor, intenta de nuevo.');
            } else {
                if (window.Logger) window.Logger.error('⚠️ [CatalogEngine] API Failed', e);
            }
            
            this.allProducts = [];
            this.filteredProducts = [];
            
            // Show error state using LoadingStates
            if (container && window.LoadingStates) {
                window.LoadingStates.error('productsContainer', {
                    title: 'Error al cargar productos',
                    message: 'No se pudieron cargar los productos. Por favor, intenta de nuevo.',
                    retryLabel: 'Reintentar',
                    retryCallback: `window.catalogEngine.loadProducts(${page})`
                });
            } else if (container) {
                container.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; border: 2px dashed var(--gray-300);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 1rem;"></i>
                        <h2 class="text-2xl font-black uppercase mb-2">ERROR DE CONEXIÓN</h2>
                        <p class="text-gray-600 mb-4">No se pudieron cargar los productos.</p>
                        <button onclick="location.reload()" class="btn btn-black">RECARGAR</button>
                    </div>
                `;
            }
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
        if (!container) {
            if (window.Logger) window.Logger.error('❌ [CatalogEngine] productsContainer not found!');
            return;
        }

        if (window.Logger) window.Logger.log(`📦 [CatalogEngine] Rendering ${products.length} products`);

        // Use LoadingStates for empty state
        if (products.length === 0) {
            if (window.Logger) window.Logger.warn('⚠️ [CatalogEngine] No products to render');
            if (window.LoadingStates) {
                window.LoadingStates.empty('productsContainer', {
                    title: 'No se encontraron productos',
                    message: 'Intenta ajustar tus filtros o busca algo diferente.',
                    icon: 'fas fa-box-open'
                });
            } else {
                container.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; border: 2px dashed var(--gray-300);">
                        <i class="fas fa-box-open" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 1rem;"></i>
                        <h2 class="text-2xl font-black uppercase mb-2">NO SE ENCONTRARON PRODUCTOS</h2>
                        <p class="text-gray-600">Intenta ajustar tus filtros o busca algo diferente.</p>
                    </div>
                 `;
                // Make container visible even when empty
                container.classList.add('loaded');
            }
            return;
        }

        // Ensure container has correct classes
        if (!container.classList.contains('product-grid-v3')) {
            container.classList.add('product-grid-v3');
        }

        // Apply view mode class
        if (this.viewMode === 'list') {
            container.classList.add('list-view');
        } else {
            container.classList.remove('list-view');
        }

        // Clear any loading states
        if (window.LoadingStates) {
            window.LoadingStates.hide('productsContainer');
        }

        // Render products
        try {
            if (window.Components && window.Components.getProductCard) {
                const cardsHTML = products.map(p => {
                    try {
                        return window.Components.getProductCard(p);
                    } catch (e) {
                        if (window.Logger) window.Logger.error('Error rendering product card:', e, p);
                        return '';
                    }
                }).filter(html => html).join('');
                
                if (cardsHTML) {
                    container.innerHTML = cardsHTML;
                    // Add 'loaded' class to make grid visible (removes opacity: 0)
                    container.classList.add('loaded');
                    if (window.Logger) window.Logger.log(`✅ [CatalogEngine] Rendered ${products.length} product cards`);
                } else {
                    if (window.Logger) window.Logger.error('⚠️ [CatalogEngine] No product cards generated!');
                    container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 4rem;">Error al renderizar productos</div>';
                    container.classList.add('loaded'); // Still make it visible even on error
                }
            } else {
                // Fallback just in case (Brutalist V3 Structure)
                // SVG Placeholder (more visible with better contrast)
                const svgPlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3Ctext fill='%236b7280' font-family='system-ui, -apple-system, sans-serif' font-size='28' font-weight='900' x='50%25' y='45%25' text-anchor='middle'%3ESNEAKERS%3C/text%3E%3Ctext fill='%236b7280' font-family='system-ui, -apple-system, sans-serif' font-size='28' font-weight='900' x='50%25' y='60%25' text-anchor='middle'%3ESHOP%3C/text%3E%3C/svg%3E";
                
                const cardsHTML = products.map(p => {
                // Normalize image URL - validate before using
                let imageUrl = svgPlaceholder;
                if (p.image_url && 
                    p.image_url.trim() !== '' && 
                    !p.image_url.includes('undefined') &&
                    !p.image_url.includes('null') &&
                    (p.image_url.startsWith('http') || p.image_url.startsWith('/') || p.image_url.startsWith('assets/'))) {
                    imageUrl = p.image_url;
                } else if (Array.isArray(p.images) && p.images.length > 0 && p.images[0]) {
                    const firstImg = p.images[0];
                    if (firstImg && firstImg.trim() !== '' && !firstImg.includes('undefined')) {
                        imageUrl = firstImg;
                    }
                } else if (typeof p.images === 'string') {
                    try {
                        const parsed = JSON.parse(p.images);
                        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]) {
                            const parsedImg = parsed[0];
                            if (parsedImg && parsedImg.trim() !== '' && !parsedImg.includes('undefined')) {
                                imageUrl = parsedImg;
                            }
                        }
                    } catch (e) {
                        // Not valid JSON, use placeholder
                    }
                }
                
                // Always use placeholder if image URL is invalid
                if (!imageUrl || imageUrl === '' || imageUrl.includes('undefined') || imageUrl.includes('null')) {
                    imageUrl = svgPlaceholder;
                }
                
                return `
                <div class="product-card" onclick="window.location.href='product-detail.html?id=${p.id}'">
                    <div class="product-image-container">
                        <img src="${imageUrl}" 
                             class="product-image" 
                             alt="${p.name || 'Producto'}" 
                             loading="lazy"
                             onerror="this.onerror=null; this.src='${svgPlaceholder}'; this.style.display='block';"
                             onload="this.style.display='block';"
                             style="display: block; min-height: 100%; object-fit: cover;">
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
            `;
                }).filter(html => html).join('');
                
                if (cardsHTML) {
                    container.innerHTML = cardsHTML;
                    // Add 'loaded' class to make grid visible (removes opacity: 0)
                    container.classList.add('loaded');
                    if (window.Logger) window.Logger.log(`✅ [CatalogEngine] Rendered ${products.length} products (fallback)`);
                } else {
                    if (window.Logger) window.Logger.error('⚠️ [CatalogEngine] No fallback cards generated!');
                    container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 4rem;">Error al renderizar productos</div>';
                    container.classList.add('loaded'); // Still make it visible even on error
                }
            }
        } catch (e) {
            if (window.Logger) window.Logger.error('❌ [CatalogEngine] Error in render():', e);
            if (container) {
                container.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 4rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 1rem;"></i>
                        <h2>Error al mostrar productos</h2>
                        <p>Por favor, recarga la página.</p>
                    </div>
                `;
                // Make container visible even on error
                container.classList.add('loaded');
            }
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
        // Update radio buttons
        const brandRadios = document.querySelectorAll('input[name="brand"]');
        brandRadios.forEach(radio => {
            if (radio.value === activeBrand || (activeBrand === 'all' && radio.value === 'all')) {
                radio.checked = true;
            } else {
                radio.checked = false;
            }
        });
        
        // Also update any button filters if they exist
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
            inStock: false, // Changed to false to show all products
            search: null
        };
        this.currentSort = 'newest';
        this.currentPage = 1;
        
        // Reset all filter inputs
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) sortSelect.value = 'newest';
        
        const searchInput = document.getElementById('productSearchInput');
        if (searchInput) searchInput.value = '';
        
        const minPriceInput = document.getElementById('minPrice');
        if (minPriceInput) minPriceInput.value = '';
        
        const maxPriceInput = document.getElementById('maxPrice');
        if (maxPriceInput) maxPriceInput.value = '';
        
        const onSaleFilter = document.getElementById('onSaleFilter');
        if (onSaleFilter) onSaleFilter.checked = false;
        
        const inStockFilter = document.getElementById('inStockFilter');
        if (inStockFilter) inStockFilter.checked = false; // Match default inStock: false
        
        // Reset brand radio buttons
        const brandRadios = document.querySelectorAll('input[name="brand"]');
        brandRadios.forEach(radio => {
            if (radio.value === 'all') {
                radio.checked = true;
            } else {
                radio.checked = false;
            }
        });
        
        // Reset category radio buttons
        const categoryRadios = document.querySelectorAll('input[name="category"]');
        categoryRadios.forEach(radio => {
            radio.checked = false;
        });
        
        this.updateFilterButtons('all');
        this.loadProducts(1);
    }

    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadProducts(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    updateCounts() {
        const resultsCount = document.getElementById('resultsCount');
        const totalCount = document.getElementById('totalCount');
        
        // Show current page results count
        const start = (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, this.totalProducts);
        
        if (resultsCount) {
            if (this.totalProducts > 0) {
                resultsCount.textContent = `${start}-${end}`;
            } else {
                resultsCount.textContent = '0';
            }
        }
        if (totalCount) {
            totalCount.textContent = this.totalProducts;
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

    async loadCategories() {
        try {
            const response = await this.api.getCategories();
            let categories = [];
            
            if (Array.isArray(response)) {
                categories = response;
            } else if (response && response.data) {
                categories = response.data.categories || response.data || [];
            } else if (response && response.categories) {
                categories = response.categories;
            }

            this.categories = categories;
            this.renderCategoriesFilter();
        } catch (e) {
            if (window.Logger) window.Logger.error('Error loading categories:', e);
            // Don't show error to user for categories - it's not critical
            // Just use empty categories array
            this.categories = [];
        }
    }

    async loadBrands() {
        try {
            // Load brands from products - use smaller limit to avoid timeouts
            const response = await this.api.getProducts({ limit: 100 });
            let products = [];
            
            if (Array.isArray(response)) {
                products = response;
            } else if (response && response.data) {
                products = response.data.products || response.data || [];
            } else if (response && response.products) {
                products = response.products;
            }

            // Extract unique brands
            const brandsSet = new Set();
            products.forEach(p => {
                if (p.brand) {
                    brandsSet.add(p.brand.toLowerCase());
                }
            });
            
            this.brands = Array.from(brandsSet).sort();
            this.renderBrandsFilter();
        } catch (e) {
            if (window.Logger) window.Logger.error('Error loading brands:', e);
            // Don't show error to user, just use default brands
            this.brands = ['jordan', 'yeezy', 'nike', 'adidas'];
            this.renderBrandsFilter();
        }
    }

    renderBrandsFilter() {
        const container = document.querySelector('.filter-section:nth-of-type(3) .filter-options');
        if (!container) return;

        // Keep "TODAS" option and add dynamic brands
        const allOption = `
            <label class="filter-checkbox">
                <input type="radio" name="brand" value="all" checked onchange="window.catalogEngine.filter('all')">
                <span>TODAS</span>
            </label>
        `;

        const brandOptions = this.brands.map(brand => {
            if (!brand || typeof brand !== 'string') return '';
            const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
            return `
                <label class="filter-checkbox">
                    <input type="radio" name="brand" value="${brand}" onchange="window.catalogEngine.filter('${brand}')">
                    <span>${brandName.toUpperCase()}</span>
                </label>
            `;
        }).join('');

        container.innerHTML = allOption + brandOptions;
    }

    renderCategoriesFilter() {
        const container = document.getElementById('categoriesFilter');
        if (!container || !this.categories.length) return;

        container.innerHTML = this.categories.map(cat => `
            <label class="filter-checkbox">
                <input type="radio" 
                       name="category" 
                       value="${cat.id}" 
                       onchange="window.catalogEngine.setCategoryFilter(${cat.id})">
                <span>${cat.name}</span>
            </label>
        `).join('');
    }

    setViewMode(mode) {
        this.viewMode = mode;
        localStorage.setItem('productsViewMode', mode);
        
        const container = document.getElementById('productsContainer');
        if (container) {
            if (mode === 'list') {
                container.classList.add('list-view');
            } else {
                container.classList.remove('list-view');
            }
            
            // Re-render to apply view mode changes
            if (this.allProducts.length > 0) {
                this.render(this.allProducts);
            }
        }

        // Update view toggle buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            if (btn.dataset.view === mode) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            }
        });
    }

    quickAdd(id, name, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        // Find product to check stock
        const product = this.allProducts.find(p => p.id === id || p.id === String(id));
        if (product && (product.stock_quantity || 0) === 0) {
            if (window.notifications) {
                window.notifications.warning('Producto Agotado', 'Este producto no está disponible en este momento.');
            }
            return false;
        }
        
        // Use cartEngine (global instance from cart.js)
        const cart = window.cartEngine || window.cartManager;
        if (cart) {
            cart.add(id, 1).then(success => {
                if (success && window.notifications) {
                    window.notifications.success('AÑADIDO AL CARRITO', `${name} se agregó correctamente`);
                }
            }).catch(e => {
                if (window.Logger) window.Logger.error('Error adding to cart:', e);
            });
        } else {
            if (window.notifications) {
                window.notifications.error('Error', 'Carrito no disponible. Por favor, recarga la página.');
            }
            if (window.Logger) window.Logger.error('CartEngine not available');
            return false;
        }
    }
}

// Global functions
window.toggleFiltersSidebar = function() {
    const sidebar = document.getElementById('productsSidebar');
    const overlay = document.querySelector('.products-sidebar-overlay');
    
    if (sidebar) {
        const isActive = sidebar.classList.contains('active');
        sidebar.classList.toggle('active');
        
        // Create or toggle overlay
        if (!overlay) {
            const newOverlay = document.createElement('div');
            newOverlay.className = 'products-sidebar-overlay';
            newOverlay.onclick = window.toggleFiltersSidebar;
            document.body.appendChild(newOverlay);
            setTimeout(() => newOverlay.classList.add('active'), 10);
        } else {
            overlay.classList.toggle('active');
            if (!sidebar.classList.contains('active')) {
                setTimeout(() => {
                    if (overlay && !overlay.classList.contains('active')) {
                        overlay.remove();
                    }
                }, 300);
            }
        }
        
        // Prevent body scroll when sidebar is open
        if (sidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
};

window.setViewMode = function(mode) {
    if (window.catalogEngine) {
        window.catalogEngine.setViewMode(mode);
    }
};

window.applyPriceFilter = function() {
    const min = document.getElementById('minPrice')?.value;
    const max = document.getElementById('maxPrice')?.value;
    if (window.catalogEngine) {
        window.catalogEngine.setPriceFilter(min || null, max || null);
    }
};

// Initialize when DOM and API are ready
function initCatalogEngine() {
    // Wait for API to be available
    if (!window.api) {
        if (window.Logger) window.Logger.warn('⚠️ [CatalogEngine] API not ready, retrying...');
        setTimeout(initCatalogEngine, 100);
        return;
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (!window.catalogEngine) {
                window.catalogEngine = new CatalogEngine();
            }
        });
    } else {
        if (!window.catalogEngine) {
            window.catalogEngine = new CatalogEngine();
        }
    }
}

// Start initialization
initCatalogEngine();
