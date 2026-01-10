/**
 * 🔍 SEARCH PAGE ENGINE
 * Handles search queries, rendering, and fallback.
 */

class SearchEngine {
    constructor() {
        this.query = '';
        this.results = [];
        this.init();
    }

    init() {
        if (window.Logger) window.Logger.log('🔍 Search Engine Initializing...');

        // 1. Headers & Footers
        if (window.Components) {
            const header = document.getElementById('mainHeader');
            if (header) {
                header.innerHTML = window.Components.getHeader(true, true);
                window.Components.initHeader();
                window.Components.initSearch();
                window.Components.initCartCounter();
            }
            const footer = document.getElementById('mainFooter');
            if (footer) {
                footer.innerHTML = window.Components.getFooter();
            }
        }

        // 2. Parse Query
        const urlParams = new URLSearchParams(window.location.search);
        this.query = urlParams.get('q') || '';

        // 3. UI Bindings
        this.bindEvents();

        // 4. Execute Search
        if (this.query) {
            document.getElementById('refineInput').value = this.query;
            this.performSearch(this.query);
        } else {
            this.renderEmpty('Escribe una palabra clave para comenzar a buscar.');
        }

        // Remove loading class
        document.body.classList.remove('loading');
    }

    bindEvents() {
        // Refine Search Form
        const form = document.getElementById('refineSearchForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const newQuery = document.getElementById('refineInput').value.trim();
                if (newQuery) {
                    window.location.href = `search.html?q=${encodeURIComponent(newQuery)}`;
                }
            });
        }

        // Sort
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.sortResults(sortSelect.value);
            });
        }
    }

    async performSearch(query) {
        document.getElementById('searchTitle').textContent = `"${query}"`;
        document.getElementById('resultsCount').textContent = 'Buscando en catálogo...';

        const container = document.getElementById('searchResultsGrid');
        if (!container) return;

        if (window.loadingState && window.loadingState.renderLoading) {
            window.loadingState.renderLoading(container, 'Escaneando catálogo...');
        } else {
            container.innerHTML = '<div style="text-align: center; padding: 60px;"><div class="loading-spinner"></div><p>Escaneando catálogo...</p></div>';
        }

        try {
            // Real API Call
            const response = await window.api.getProducts({
                search: query,
                limit: 50 // Get enough for a full page
            });

            if (response.success) {
                this.results = response.data.products || response.data || [];

                if (this.results.length > 0) {
                    this.renderResults();
                } else {
                    this.renderEmpty(`No se encontraron resultados para "${query}"`);
                }
            } else {
                this.renderEmpty('Servicio de búsqueda no disponible.');
            }

        } catch (e) {
            if (window.Logger) window.Logger.error('Search Failed:', e);
            const countLabel = document.getElementById('resultsCount');
            if (countLabel) countLabel.textContent = 'ERROR DE CONEXIÓN';
            
            if (window.loadingState && window.loadingState.renderError) {
                window.loadingState.renderError(container, 'No se pudo conectar al servicio de catálogo.');
            } else {
                container.innerHTML = `
                    <div style="text-align: center; padding: 60px; grid-column: 1 / -1;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f00; margin-bottom: 20px;"></i>
                        <h2>Error de conexión</h2>
                        <p>No se pudo conectar al servicio de catálogo. Por favor, intenta de nuevo más tarde.</p>
                        <a href="index.html" class="btn btn-black" style="margin-top: 20px;">Volver al inicio</a>
                    </div>
                `;
            }
        }
    }

    renderResults() {
        const container = document.getElementById('searchResultsGrid');
        const countLabel = document.getElementById('resultsCount');
        const itemsLabel = document.getElementById('itemsShowing');

        countLabel.textContent = `${this.results.length} ${this.results.length === 1 ? 'RESULTADO ENCONTRADO' : 'RESULTADOS ENCONTRADOS'}`;
        itemsLabel.textContent = `Mostrando ${this.results.length} ${this.results.length === 1 ? 'producto' : 'productos'}`;

        container.innerHTML = this.results.map(product => {
            // Re-use Component logic if possible, or manual build
            if (window.Components && window.Components.getProductCard) {
                return window.Components.getProductCard(product);
            }

            // Manual Fallback Card
            return `
                <div class="product-card">
                    <a href="product-detail.html?id=${product.id}" class="card-img-link">
                        <img src="${product.image_url || 'img/placeholder.jpg'}" alt="${product.name}">
                        ${product.stock_quantity === 0 ? '<div class="sold-out-badge">SOLD OUT</div>' : ''}
                    </a>
                    <div class="card-info" style="padding: 15px;">
                        <div class="card-brand">${product.brand || 'FUTURELABS'}</div>
                        <h3 class="card-title"><a href="product-detail.html?id=${product.id}">${product.name}</a></h3>
                        <div class="card-price">S/ ${parseFloat(product.price).toFixed(2)}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderEmpty(msg) {
        const container = document.getElementById('searchResultsGrid');
        const countLabel = document.getElementById('resultsCount');

        countLabel.textContent = '0 RESULTADOS';
        container.innerHTML = `
            <div class="empty-search" style="grid-column: 1 / -1;">
                <i class="fas fa-search" style="font-size: 4rem; margin-bottom: 20px; color: #ccc;"></i>
                <h2 style="margin-bottom: 10px;">${msg}</h2>
                <p style="color: #666; margin-bottom: 20px;">Intenta revisar la ortografía o usa palabras clave más generales.</p>
                <a href="index.html" class="btn btn-black" style="margin-top: 20px;">VOLVER AL INICIO</a>
            </div>
        `;
    }

    sortResults(criteria) {
        if (criteria === 'price_asc') {
            this.results.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (criteria === 'price_desc') {
            this.results.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        } else if (criteria === 'name_asc') {
            this.results.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            // Newest (Default usually, if we have ID or date)
            this.results.sort((a, b) => b.id - a.id);
        }
        this.renderResults();
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    window.searchEngine = new SearchEngine();
});
