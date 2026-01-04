/**
 * 📊 COMPARE PAGE MANAGER
 * Handles the comparison page functionality
 */

class ComparePageManager {
    constructor() {
        this.init();
    }

    async init() {
        // Load header and footer
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

        // Load breadcrumbs
        if (window.Breadcrumbs) {
            window.Breadcrumbs.init();
            window.Breadcrumbs.add('Inicio', 'index.html');
            window.Breadcrumbs.add('Comparar Productos', 'compare.html', true);
        }

        // Wait for comparator to be ready
        if (window.productComparator) {
            await this.loadComparison();
        } else {
            // Wait a bit for comparator to initialize
            setTimeout(() => this.loadComparison(), 500);
        }

        // Setup event listeners
        this.setupEventListeners();
    }

    async loadComparison() {
        const container = document.getElementById('compareContainer');
        const emptyState = document.getElementById('compareEmptyState');
        const clearBtn = document.getElementById('clearCompareBtn');

        if (!container) return;

        // Get products from comparator
        const products = window.productComparator?.getProducts() || [];
        
        if (products.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            if (clearBtn) clearBtn.style.display = 'none';
            container.innerHTML = '';
            container.appendChild(emptyState);
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        if (clearBtn) clearBtn.style.display = 'inline-flex';

        // Render comparison table
        await this.renderComparison(products);
    }

    async renderComparison(products) {
        const container = document.getElementById('compareContainer');
        if (!container) return;

        // Show loading
        container.innerHTML = '<div class="compare-loading"><div class="loading-spinner"></div><p>Cargando comparación...</p></div>';

        try {
            // Fetch full product details
            const fullProducts = await Promise.all(
                products.map(async (product) => {
                    try {
                        if (product.id) {
                            const response = await window.api.getProductById(product.id);
                            if (response.success) {
                                return response.data.product || response.data;
                            }
                        }
                        return product;
                    } catch (error) {
                        console.error('Error loading product:', error);
                        return product;
                    }
                })
            );

            // Render comparison table
            container.innerHTML = this.buildComparisonTable(fullProducts);
        } catch (error) {
            console.error('Error rendering comparison:', error);
            container.innerHTML = `
                <div class="compare-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar la comparación. Por favor, intenta de nuevo.</p>
                    <button class="btn btn-black" onclick="location.reload()">RECARGAR</button>
                </div>
            `;
        }
    }

    buildComparisonTable(products) {
        if (products.length === 0) return '';

        const features = [
            { key: 'name', label: 'Nombre', type: 'text' },
            { key: 'brand', label: 'Marca', type: 'text' },
            { key: 'price', label: 'Precio', type: 'price' },
            { key: 'discount_price', label: 'Precio con Descuento', type: 'price' },
            { key: 'stock_quantity', label: 'Stock Disponible', type: 'number' },
            { key: 'rating', label: 'Calificación', type: 'rating' },
            { key: 'description', label: 'Descripción', type: 'text' },
            { key: 'is_featured', label: 'Destacado', type: 'boolean' },
            { key: 'is_new', label: 'Nuevo', type: 'boolean' },
            { key: 'is_trending', label: 'En Tendencia', type: 'boolean' },
            { key: 'is_bestseller', label: 'Más Vendido', type: 'boolean' }
        ];

        let html = `
            <div class="compare-table-wrapper">
                <table class="compare-table" role="table" aria-label="Comparación de productos">
                    <thead>
                        <tr>
                            <th class="compare-feature-col">Característica</th>
                            ${products.map((product, index) => `
                                <th class="compare-product-col" data-product-id="${product.id}">
                                    <div class="compare-product-header">
                                        <button class="compare-remove-btn" onclick="window.productComparator.removeProduct('${product.id}'); window.comparePageManager.loadComparison();" aria-label="Eliminar de comparación">
                                            <i class="fas fa-times"></i>
                                        </button>
                                        <img src="${product.image_url || 'assets/images/products/placeholder.jpg'}" alt="${product.name}" class="compare-product-image">
                                        <h3>${this.escapeHtml(product.name || 'Producto')}</h3>
                                        <a href="product-detail.html?id=${product.id}" class="btn btn-sm btn-black">VER DETALLES</a>
                                    </div>
                                </th>
                            `).join('')}
                            ${products.length < 3 ? `
                                <th class="compare-add-col">
                                    <div class="compare-add-product">
                                        <i class="fas fa-plus"></i>
                                        <p>Agregar producto</p>
                                        <a href="products.html" class="btn btn-sm btn-outline">EXPLORAR</a>
                                    </div>
                                </th>
                            ` : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${features.map(feature => `
                            <tr>
                                <td class="compare-feature-label">${feature.label}</td>
                                ${products.map(product => `
                                    <td class="compare-feature-value">
                                        ${this.renderFeatureValue(product, feature)}
                                    </td>
                                `).join('')}
                                ${products.length < 3 ? '<td class="compare-feature-value">-</td>' : ''}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        return html;
    }

    renderFeatureValue(product, feature) {
        const value = product[feature.key];

        switch (feature.type) {
            case 'price':
                if (value) {
                    return `S/ ${parseFloat(value).toFixed(2)}`;
                }
                return '-';

            case 'number':
                return value !== null && value !== undefined ? value : '-';

            case 'boolean':
                return value ? '<i class="fas fa-check" style="color: green;"></i>' : '<i class="fas fa-times" style="color: #ccc;"></i>';

            case 'rating':
                if (value) {
                    const stars = Math.round(parseFloat(value));
                    return `${'★'.repeat(stars)}${'☆'.repeat(5 - stars)} (${value})`;
                }
                return 'Sin calificación';

            case 'text':
            default:
                if (feature.key === 'description') {
                    return value ? `<div class="compare-description">${this.escapeHtml(value.substring(0, 150))}${value.length > 150 ? '...' : ''}</div>` : '-';
                }
                return value ? this.escapeHtml(String(value)) : '-';
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setupEventListeners() {
        // Listen for comparator changes
        document.addEventListener('productComparator:updated', () => {
            this.loadComparison();
        });

        // Clear button
        const clearBtn = document.getElementById('clearCompareBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (window.productComparator) {
                    window.productComparator.clear();
                    this.loadComparison();
                }
            });
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.comparePageManager = new ComparePageManager();
});

