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

        // Wait for API to be ready
        if (!window.api) {
            if (window.Logger) window.Logger.error('⚠️ [SearchEngine] API not available, retrying...');
            setTimeout(() => this.init(), 500);
            return;
        }

        // 1. Headers & Footers
        if (window.Components) {
            const header = document.getElementById('mainHeader');
            if (header && !header.innerHTML.trim()) {
                header.innerHTML = window.Components.getHeader(true, true);
                window.Components.initHeader();
                window.Components.initSearch();
                window.Components.initCartCounter();
            }
            const footer = document.getElementById('mainFooter');
            if (footer && !footer.innerHTML.trim()) {
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
            const refineInput = document.getElementById('refineInput');
            if (refineInput) refineInput.value = this.query;
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
        const searchTitle = document.getElementById('searchTitle');
        const countLabel = document.getElementById('resultsCount');
        const container = document.getElementById('searchResultsGrid');

        if (!container) return;

        if (searchTitle) searchTitle.textContent = `"${query}"`;
        if (countLabel) countLabel.textContent = 'Buscando en catálogo...';

        // Show loading state (skeleton en grid de productos)
        if (window.LoadingStates) {
            window.LoadingStates.show('searchResultsGrid', {
                message: 'Escaneando catálogo...',
                type: 'skeleton'
            });
        } else {
            container.innerHTML = '<div style="text-align: center; padding: 60px; grid-column: 1 / -1;"><div class="loading-spinner"></div><p>Escaneando catálogo...</p></div>';
        }

        try {
            if (!window.api) {
                throw new Error('API no disponible');
            }

            // Real API Call
            const response = await window.api.getProducts({
                search: query,
                limit: 100 // Get enough for a full page
            });

            // Hide loading state
            if (window.LoadingStates) {
                window.LoadingStates.hide('searchResultsGrid');
            }

            // Parse response
            let products = [];
            let total = 0;

            if (Array.isArray(response)) {
                products = response;
                total = response.length;
            } else if (response && response.success && response.data) {
                products = response.data.products || response.data || [];
                total = response.data.total || products.length;
            } else if (response && response.data) {
                products = response.data.products || response.data || [];
                total = response.data.total || products.length;
            } else if (response && response.products) {
                products = response.products;
                total = response.total || products.length;
            } else if (response && response.success === false) {
                throw new Error(response.message || 'Error en la búsqueda');
            }

            this.results = products;

            if (products.length > 0) {
                this.renderResults();
            } else {
                if (window.LoadingStates) {
                    window.LoadingStates.empty('searchResultsGrid', {
                        title: `No se encontraron resultados para "${query}"`,
                        message: 'Intenta revisar la ortografía o usa palabras clave más generales.',
                        icon: 'fas fa-search',
                        actionLabel: 'Volver al inicio',
                        actionUrl: 'index.html'
                    });
                } else {
                    this.renderEmpty(`No se encontraron resultados para "${query}"`);
                }
            }

        } catch (e) {
            if (window.ErrorHandler) {
                window.ErrorHandler.api(e, 'performSearch', 'No se pudo realizar la búsqueda. Por favor, intenta de nuevo.');
            } else {
                if (window.Logger) window.Logger.error('Search Failed:', e);
            }

            // Hide loading state
            if (window.LoadingStates) {
                window.LoadingStates.hide('searchResultsGrid');
            }

            const countLabel = document.getElementById('resultsCount');
            if (countLabel) countLabel.textContent = 'ERROR DE CONEXIÓN';

            if (window.LoadingStates) {
                window.LoadingStates.error('searchResultsGrid', {
                    title: 'Error de conexión',
                    message: 'No se pudo conectar al servicio de catálogo. Por favor, intenta de nuevo más tarde.',
                    retryLabel: 'REINTENTAR',
                    retryCallback: `window.searchEngine.performSearch('${query}')`
                });
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

        if (!container) return;

        if (countLabel) {
            countLabel.textContent = `${this.results.length} ${this.results.length === 1 ? 'RESULTADO ENCONTRADO' : 'RESULTADOS ENCONTRADOS'}`;
        }
        if (itemsLabel) {
            itemsLabel.textContent = `Mostrando ${this.results.length} ${this.results.length === 1 ? 'producto' : 'productos'}`;
        }

        // Use Components.getProductCard if available
        if (window.Components && window.Components.getProductCard) {
            container.innerHTML = this.results.map(product => window.Components.getProductCard(product)).join('');
            // Ensure images are loaded/visible
            container.querySelectorAll('img').forEach(img => {
                img.style.opacity = '1';
            });
        } else {
            // If components are missing, show error
            if (window.ErrorHandler) {
                window.ErrorHandler.handle(new Error('Components module missing'), {
                    context: 'SearchEngine.renderResults',
                    userMessage: 'Error al renderizar resultados.'
                });
            }
            container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">Error interno de visualización.</div>';
        }
    }

    renderEmpty(msg) {
        const container = document.getElementById('searchResultsGrid');
        const countLabel = document.getElementById('resultsCount');

        if (countLabel) countLabel.textContent = '0 RESULTADOS';

        if (window.LoadingStates) {
            window.LoadingStates.empty('searchResultsGrid', {
                title: 'Búsqueda sin resultados',
                message: msg || 'Intenta revisar la ortografía o usa palabras clave más generales.',
                icon: 'fas fa-search',
                actionLabel: 'VOLVER AL INICIO',
                actionUrl: 'index.html'
            });
        } else {
            container.innerHTML = `
                <div class="empty-search" style="grid-column: 1 / -1; text-align: center; padding: 4rem;">
                    <i class="fas fa-search" style="font-size: 4rem; margin-bottom: 20px; color: #ccc;"></i>
                    <h2 style="margin-bottom: 10px;">${msg}</h2>
                    <p style="color: #666; margin-bottom: 20px;">Intenta revisar la ortografía o usa palabras clave más generales.</p>
                    <a href="index.html" class="btn btn-black" style="margin-top: 20px;">VOLVER AL INICIO</a>
                </div>
            `;
        }
    }

    sortResults(criteria) {
        if (!this.results || this.results.length === 0) return;

        try {
            if (criteria === 'price_asc') {
                this.results.sort((a, b) => {
                    const priceA = parseFloat(a.discount_price || a.price || 0);
                    const priceB = parseFloat(b.discount_price || b.price || 0);
                    return priceA - priceB;
                });
            } else if (criteria === 'price_desc') {
                this.results.sort((a, b) => {
                    const priceA = parseFloat(a.discount_price || a.price || 0);
                    const priceB = parseFloat(b.discount_price || b.price || 0);
                    return priceB - priceA;
                });
            } else if (criteria === 'name_asc') {
                this.results.sort((a, b) => {
                    const nameA = (a.name || '').toLowerCase();
                    const nameB = (b.name || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                });
            } else if (criteria === 'name_desc') {
                this.results.sort((a, b) => {
                    const nameA = (a.name || '').toLowerCase();
                    const nameB = (b.name || '').toLowerCase();
                    return nameB.localeCompare(nameA);
                });
            } else {
                // Newest (Default) - sort by ID descending
                this.results.sort((a, b) => {
                    const idA = parseInt(a.id || 0);
                    const idB = parseInt(b.id || 0);
                    return idB - idA;
                });
            }
            this.renderResults();
        } catch (e) {
            if (window.Logger) window.Logger.error('Error sorting results:', e);
            // Continue with unsorted results
            this.renderResults();
        }
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    window.searchEngine = new SearchEngine();
});
