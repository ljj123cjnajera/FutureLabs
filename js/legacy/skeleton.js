// 💀 Skeleton Loaders - FutureLabs

class SkeletonLoader {
    constructor() {
        this.activeLoaders = new Map();
    }

    // Mostrar skeleton loader
    show(elementId, type = 'default') {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Guardar contenido original
        this.activeLoaders.set(elementId, {
            originalHTML: element.innerHTML,
            type
        });

        // Renderizar skeleton según el tipo
        element.innerHTML = this.render(type);
    }

    // Ocultar skeleton loader
    hide(elementId) {
        const loader = this.activeLoaders.get(elementId);
        if (!loader) return;

        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = loader.originalHTML;
        }

        this.activeLoaders.delete(elementId);
    }

    // Renderizar skeleton según el tipo
    render(type) {
        const skeletons = {
            'default': this.renderDefault(),
            'product-card': this.renderProductCard(),
            'product-grid': this.renderProductGrid(),
            'product-list': this.renderProductList(),
            'form': this.renderForm(),
            'table': this.renderTable(),
            'list': this.renderList(),
            'sidebar': this.renderSidebar(),
            'header': this.renderHeader(),
            'stats': this.renderStats(),
            'testimonial': this.renderTestimonial(),
            'comment': this.renderComment(),
            'profile': this.renderProfile(),
            'categories': this.renderCategories(),
            'checkout': this.renderCheckout(),
            'cart': this.renderCart(),
            'orders': this.renderOrders()
        };

        return skeletons[type] || skeletons['default'];
    }

    // Skeleton por defecto
    renderDefault() {
        return `
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text" style="width: 60%;"></div>
        `;
    }

    // Skeleton de tarjeta de producto
    renderProductCard() {
        return `
            <div class="skeleton-product-card">
                <div class="skeleton skeleton-image"></div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text" style="width: 70%;"></div>
                <div class="skeleton skeleton-price"></div>
                <div class="skeleton skeleton-action-button"></div>
            </div>
        `;
    }

    // Skeleton de grid de productos
    renderProductGrid() {
        return `
            <div class="skeleton-products-grid">
                ${Array(6).fill(0).map(() => this.renderProductCard()).join('')}
            </div>
        `;
    }

    // Skeleton de lista de productos
    renderProductList() {
        return `
            <div class="skeleton-list">
                ${Array(5).fill(0).map(() => `
                    <div class="skeleton-list-item">
                        <div class="skeleton skeleton-avatar"></div>
                        <div style="flex: 1;">
                            <div class="skeleton skeleton-text"></div>
                            <div class="skeleton skeleton-text" style="width: 60%;"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Skeleton de formulario
    renderForm() {
        return `
            <div class="skeleton-form">
                <div class="skeleton skeleton-title"></div>
                ${Array(4).fill(0).map(() => `
                    <div class="skeleton-form-group">
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-input"></div>
                    </div>
                `).join('')}
                <div class="skeleton skeleton-action-button"></div>
            </div>
        `;
    }

    // Skeleton de tabla
    renderTable() {
        return `
            <div class="skeleton-table">
                ${Array(5).fill(0).map(() => `
                    <div class="skeleton-table-row">
                        <div class="skeleton skeleton-table-cell"></div>
                        <div class="skeleton skeleton-table-cell"></div>
                        <div class="skeleton skeleton-table-cell"></div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Skeleton de lista
    renderList() {
        return `
            <div class="skeleton-list">
                ${Array(6).fill(0).map(() => `
                    <div class="skeleton skeleton-text"></div>
                `).join('')}
            </div>
        `;
    }

    // Skeleton de sidebar
    renderSidebar() {
        return `
            <div class="skeleton-sidebar">
                <div class="skeleton skeleton-title"></div>
                ${Array(4).fill(0).map(() => `
                    <div class="skeleton skeleton-text"></div>
                `).join('')}
            </div>
        `;
    }

    // Skeleton de header
    renderHeader() {
        return `
            <div class="skeleton skeleton-header"></div>
        `;
    }

    // Skeleton de estadísticas
    renderStats() {
        return `
            <div class="skeleton-stats">
                ${Array(3).fill(0).map(() => `
                    <div class="skeleton-stat-card">
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-title"></div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Skeleton de testimonio
    renderTestimonial() {
        return `
            <div class="skeleton-testimonial">
                <div class="skeleton-testimonial-header">
                    <div class="skeleton skeleton-avatar"></div>
                    <div style="flex: 1;">
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text" style="width: 50%;"></div>
                    </div>
                </div>
                <div class="skeleton-testimonial-content">
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text" style="width: 70%;"></div>
                </div>
                <div class="skeleton-testimonial-rating">
                    ${Array(5).fill(0).map(() => `
                        <div class="skeleton skeleton-star"></div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Skeleton de comentario
    renderComment() {
        return `
            <div class="skeleton-comment">
                <div class="skeleton-comment-header">
                    <div class="skeleton skeleton-avatar"></div>
                    <div style="flex: 1;">
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text" style="width: 40%;"></div>
                    </div>
                </div>
                <div class="skeleton-comment-body">
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                </div>
                <div class="skeleton-comment-footer">
                    <div class="skeleton skeleton-badge"></div>
                    <div class="skeleton skeleton-badge"></div>
                </div>
            </div>
        `;
    }

    // Skeleton de perfil
    renderProfile() {
        return `
            <div class="skeleton-profile">
                <div class="skeleton skeleton-profile-avatar"></div>
                <div class="skeleton skeleton-profile-name"></div>
                <div class="skeleton skeleton-profile-role"></div>
                <div class="skeleton-profile-stats">
                    ${Array(3).fill(0).map(() => `
                        <div class="skeleton-profile-stat">
                            <div class="skeleton skeleton-profile-stat-value"></div>
                            <div class="skeleton skeleton-profile-stat-label"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Skeleton de categorías
    renderCategories() {
        return `
            <div class="skeleton-categories">
                ${Array(6).fill(0).map(() => `
                    <div class="skeleton-category-card">
                        <div class="skeleton skeleton-category-icon"></div>
                        <div class="skeleton skeleton-category-name"></div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Skeleton de checkout
    renderCheckout() {
        return `
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--spacing-xl);">
                <div class="skeleton-form">
                    <div class="skeleton skeleton-title"></div>
                    ${Array(5).fill(0).map(() => `
                        <div class="skeleton-form-group">
                            <div class="skeleton skeleton-text"></div>
                            <div class="skeleton skeleton-input"></div>
                        </div>
                    `).join('')}
                </div>
                <div class="skeleton-sidebar">
                    <div class="skeleton skeleton-title"></div>
                    ${Array(4).fill(0).map(() => `
                        <div class="skeleton skeleton-text"></div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Skeleton de carrito
    renderCart() {
        return `
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--spacing-xl);">
                <div class="skeleton-list">
                    ${Array(3).fill(0).map(() => `
                        <div class="skeleton-list-item">
                            <div class="skeleton skeleton-image" style="width: 100px; height: 100px;"></div>
                            <div style="flex: 1;">
                                <div class="skeleton skeleton-text"></div>
                                <div class="skeleton skeleton-text" style="width: 60%;"></div>
                                <div class="skeleton skeleton-price"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="skeleton-sidebar">
                    <div class="skeleton skeleton-title"></div>
                    ${Array(4).fill(0).map(() => `
                        <div class="skeleton skeleton-text"></div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Skeleton de pedidos
    renderOrders() {
        return `
            <div class="skeleton-list">
                ${Array(5).fill(0).map(() => `
                    <div class="skeleton-comment">
                        <div class="skeleton-comment-header">
                            <div class="skeleton skeleton-text" style="width: 30%;"></div>
                            <div class="skeleton skeleton-badge"></div>
                        </div>
                        <div class="skeleton-comment-body">
                            <div class="skeleton skeleton-text"></div>
                            <div class="skeleton skeleton-text" style="width: 70%;"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Crear instancia global
window.skeletonLoader = new SkeletonLoader();


