// 🛍️ Products Page Logic - SneakersShop

// Global variables to be accessible
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 12;
let currentFilters = {};
let currentSort = 'name-asc';
const recentlyViewedOptions = { limit: 6, hideWhenEmpty: true };

// ==================== FUNCIONES GLOBALES ====================

// Agregar al carrito (global)
async function addToCart(productId) {
    if (!productId) {
        window.notifications.show('Error: ID de producto no válido', 'error');
        return;
    }

    try {
        await window.cartManager.add(productId, 1);
    } catch (error) {
        console.error('Error en addToCart:', error);
    }
}

// Resetear filtros (global)
function resetFilters() {
    const searchInput = document.getElementById('searchFilter');

    // Filtros
    const filters = [
        'categoryFilter', 'brandFilter', 'silhouetteFilter',
        'yearFilter', 'sizeFilter', 'minPrice', 'maxPrice'
    ];

    if (searchInput) searchInput.value = '';

    filters.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'name-asc';

    filteredProducts = [...allProducts];
    currentPage = 1;
    renderProducts();
}

function scrollToFilters() {
    const filtersSection = document.querySelector('.products-filters');
    if (filtersSection) {
        filtersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function renderStars(ratingValue = 0) {
    const rating = Number(ratingValue) || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return `${'<i class="fas fa-star"></i>'.repeat(fullStars)}${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}${'<i class="far fa-star"></i>'.repeat(emptyStars)}`;
}

// Aplicar filtros
function applyFilters() {
    const search = document.getElementById('searchFilter').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const brand = document.getElementById('brandFilter').value;
    const silhouette = document.getElementById('silhouetteFilter').value;
    const year = document.getElementById('yearFilter').value;
    const size = document.getElementById('sizeFilter').value;
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;

    filteredProducts = allProducts.filter(product => {
        const matchSearch = !search || product.name.toLowerCase().includes(search);
        const matchCategory = !category || product.category_slug === category;
        const matchBrand = !brand || product.brand === brand;
        const matchPrice = product.price >= minPrice && product.price <= maxPrice;

        // Parse specifications helper
        let specs = {};
        try {
            specs = typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications;
        } catch (e) { }

        const matchSilhouette = !silhouette || (specs && specs['Silueta'] === silhouette);
        const matchYear = !year || (specs && specs['Año de Lanzamiento'] === year);

        // Simple size logic: checks if 'Tallas Disponibles' string contains the number (e.g. "US 7-13" contains "7")
        // In a real app this would check array overlap
        const matchSize = !size || (specs && specs['Tallas Disponibles'] && specs['Tallas Disponibles'].includes(size)) || true; // Permissive for demo

        return matchSearch && matchCategory && matchBrand && matchPrice && matchSilhouette && matchYear && matchSize;
    });

    currentPage = 1;
    renderProducts();
}

// Aplicar ordenamiento
function applySort() {
    const sortValue = document.getElementById('sortSelect').value;
    currentSort = sortValue;

    filteredProducts.sort((a, b) => {
        switch (sortValue) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'rating-desc':
                return b.rating - a.rating;
            case 'newest':
                return new Date(b.created_at) - new Date(a.created_at);
            default:
                return 0;
        }
    });

    currentPage = 1;
    renderProducts();
}

// Renderizar productos
function renderProducts() {
    const container = document.getElementById('productsContainer');
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const pageProducts = filteredProducts.slice(start, end);

    // Actualizar contador
    const productsCountEl = document.getElementById('productsCount');
    if (productsCountEl) {
        productsCountEl.innerHTML = `Mostrando <strong>${pageProducts.length}</strong> de <strong>${filteredProducts.length}</strong> productos`;
    }

    if (pageProducts.length > 0) {
        const cardsMarkup = pageProducts.map((product) => {
            return window.Components.getProductCard(product);
        }).join('');

        container.innerHTML = `<div class="products-grid">${cardsMarkup}</div>`;
    } else {
        showEmptyState('No se encontraron productos con estos filtros');
    }

    // Renderizar paginación
    renderPagination();

    // Actualizar estado de botones del comparador
    if (window.productComparator) {
        window.productComparator.updateCompareButtons();
    }

    // Sincronizar wishlist
    if (window.wishlistManager) {
        window.wishlistManager.syncToggleButtons?.(container);
    }

    window.recentlyViewed?.render('recentlyViewedGridProducts', recentlyViewedOptions);
}

// Renderizar paginación
function renderPagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const pagination = document.getElementById('pagination');

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = `
        <button class="btn btn-outline btn-sm" onclick="window.goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `
                <button class="btn ${i === currentPage ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="window.goToPage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<span class="btn btn-ghost btn-sm" style="pointer-events: none;">...</span>`;
        }
    }

    html += `
        <button class="btn btn-outline btn-sm" onclick="window.goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    pagination.innerHTML = html;
}

// Ir a página
function goToPage(page) {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Mostrar estado vacío
function showEmptyState(message) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = `
        <div class="products-empty-state">
            <i class="fas fa-box-open"></i>
            <h3>${message}</h3>
            <p>Te recomendamos ajustar los filtros o explorar otra categoría.</p>
            <button type="button" class="btn btn-outline btn-sm" onclick="resetFilters()">
                <i class="fas fa-redo"></i> Limpiar filtros
            </button>
        </div>
    `;
}

// Expose functions globally for onclick handlers
window.addToCart = addToCart;
window.resetFilters = resetFilters;
window.scrollToFilters = scrollToFilters;
window.applyFilters = applyFilters;
window.applySort = applySort;
window.goToPage = goToPage;

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', async function () {
    console.log('🔧 Inicializando products.html...');

    // 1. Inicializar Header y Footer
    const headerContainer = document.getElementById('mainHeader');
    if (headerContainer && window.Components) {
        headerContainer.innerHTML = window.Components.getHeader(true, true);
        window.Components.initHeader();
        window.Components.initSearch();
        window.Components.initCartCounter();
    }

    // 2. Inicializar Recently Viewed
    const clearRecentlyViewedBtn = document.getElementById('clearRecentlyViewedProductsBtn');
    if (clearRecentlyViewedBtn) {
        clearRecentlyViewedBtn.addEventListener('click', () => {
            window.recentlyViewed?.clearAndRender('recentlyViewedGridProducts', recentlyViewedOptions);
        });
    }
    window.recentlyViewed?.render('recentlyViewedGridProducts', recentlyViewedOptions);

    // 3. Obtener parámetros de URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    const categorySlug = urlParams.get('category');

    // 4. Funciones de carga de datos
    async function loadProducts() {
        const container = document.getElementById('productsContainer');
        window.loadingState.renderLoading(container, 'Cargando productos...');

        try {
            let response;
            if (categorySlug) {
                response = await window.api.getProductsByCategory(categorySlug);
            } else {
                const filters = {};
                if (searchQuery) filters.search = searchQuery;
                response = await window.api.getProducts(filters);
            }

            if (response.success) {
                allProducts = response.data.products;
                filteredProducts = [...allProducts];

                await loadCategories();
                await loadBrands();

                if (searchQuery) {
                    const searchInput = document.getElementById('searchFilter');
                    if (searchInput) searchInput.value = searchQuery;
                }

                renderProducts();
            } else {
                showEmptyState('No se encontraron productos');
            }
        } catch (error) {
            showEmptyState('Error al cargar productos: ' + error.message);
        }
    }

    async function loadCategories() {
        try {
            const response = await window.api.getCategories();
            if (response.success) {
                const select = document.getElementById('categoryFilter');
                // Limpiar opciones excepto la primera
                while (select.options.length > 1) {
                    select.remove(1);
                }

                response.data.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.slug;
                    option.textContent = category.name;
                    select.appendChild(option);
                });

                if (categorySlug) {
                    select.value = categorySlug;
                }
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async function loadBrands() {
        const brands = [...new Set(allProducts.map(p => p.brand))].sort();
        const select = document.getElementById('brandFilter');
        // Limpiar opciones excepto la primera
        while (select.options.length > 1) {
            select.remove(1);
        }

        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            select.appendChild(option);
        });

        // Cargar años
        const years = new Set();
        allProducts.forEach(p => {
            try {
                let specs = p.specifications;
                if (typeof specs === 'string') specs = JSON.parse(specs);
                if (specs && specs['Año de Lanzamiento']) {
                    years.add(specs['Año de Lanzamiento']);
                }
            } catch (e) { }
        });

        const yearSelect = document.getElementById('yearFilter');
        // Limpiar opciones excepto la primera
        while (yearSelect.options.length > 1) {
            yearSelect.remove(1);
        }

        [...years].sort().reverse().forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
    }

    // Actualizar contador de carrito
    document.addEventListener('cartUpdated', (e) => {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = e.detail.count;
        }
    });

    // Iniciar carga
    loadProducts();
});
