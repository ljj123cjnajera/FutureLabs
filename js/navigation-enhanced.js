/**
 * 🧭 NAVEGACIÓN MEJORADA V2
 * Navegación funcional con dropdowns de productos destacados
 */

class NavigationEnhanced {
    constructor() {
        this.categoryCounts = {};
        this.featuredProducts = {};
        this.init();
    }

    async init() {
        // Cargar conteos y productos destacados
        await this.loadCategoryData();
        
        // Actualizar navegación con datos reales
        this.updateNavigation();
        
        // Setup dropdowns interactivos
        this.setupDropdowns();
        
        // Setup header scroll effect
        this.setupHeaderScroll();
        
        // Deshabilitar polling automático - solo cargar una vez
        // setInterval(() => this.loadCategoryData(), 30000);
    }
    
    setupHeaderScroll() {
        const header = document.querySelector('.header-v3');
        if (!header) return;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    async loadCategoryData() {
        try {
            // Cargar productos por categoría para obtener conteos
            const categories = ['jordan', 'yeezy', 'nike', 'adidas'];
            
            await Promise.all(categories.map(async (category) => {
                try {
                    const response = await window.api.getProducts({ category, limit: 1 });
                    let count = 0;
                    let featured = [];
                    
                    if (response && response.success) {
                        const products = response.data?.products || response.data || [];
                        count = response.data?.total || products.length || 0;
                        
                        // Obtener productos destacados (primeros 4)
                        if (window.api.getProducts) {
                            const featuredRes = await window.api.getProducts({ 
                                category, 
                                limit: 4,
                                featured: true 
                            });
                            if (featuredRes && featuredRes.success) {
                                featured = featuredRes.data?.products || featuredRes.data || [];
                            }
                        }
                    }
                    
                    this.categoryCounts[category] = count;
                    this.featuredProducts[category] = featured.slice(0, 4);
                } catch (e) {
                    if (window.Logger) window.Logger.warn(`Error loading ${category}:`, e);
                    this.categoryCounts[category] = 0;
                    this.featuredProducts[category] = [];
                }
            }));
            
            // Cargar productos nuevos y en oferta
            try {
                const newRes = await window.api.getNewProducts(1);
                this.categoryCounts['new'] = newRes?.data?.total || 0;
            } catch (e) {
                this.categoryCounts['new'] = 0;
            }
            
            try {
                const saleRes = await window.api.getProducts({ on_sale: true, limit: 1 });
                this.categoryCounts['sale'] = saleRes?.data?.total || 0;
            } catch (e) {
                this.categoryCounts['sale'] = 0;
            }
            
        } catch (error) {
            if (window.Logger) window.Logger.error('Error loading category data:', error);
        }
    }

    updateNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            let category = null;
            let count = 0;
            
            // Detectar categoría desde href
            if (href.includes('category=jordan')) {
                category = 'jordan';
                count = this.categoryCounts.jordan || 0;
            } else if (href.includes('category=yeezy')) {
                category = 'yeezy';
                count = this.categoryCounts.yeezy || 0;
            } else if (href.includes('category=nike')) {
                category = 'nike';
                count = this.categoryCounts.nike || 0;
            } else if (href.includes('filter=new')) {
                category = 'new';
                count = this.categoryCounts.new || 0;
            } else if (href.includes('filter=sale')) {
                category = 'sale';
                count = this.categoryCounts.sale || 0;
            }
            
            // Actualizar badge con conteo
            if (category && count > 0) {
                let badge = link.querySelector('.nav-link-badge');
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'nav-link-badge';
                    link.appendChild(badge);
                }
                badge.textContent = count;
                
                // Agregar clase "hot" si hay muchos productos
                if (count > 20) {
                    badge.classList.add('nav-link-badge-hot');
                }
            }
        });
    }

    setupDropdowns() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            if (!link) return;
            
            const href = link.getAttribute('href');
            let category = null;
            
            // Detectar categoría
            if (href.includes('category=jordan')) category = 'jordan';
            else if (href.includes('category=yeezy')) category = 'yeezy';
            else if (href.includes('category=nike')) category = 'nike';
            else if (href.includes('category=adidas')) category = 'adidas';
            else if (href.includes('filter=new')) category = 'new';
            else if (href.includes('filter=sale')) category = 'sale';
            
            if (!category) return;
            
            // Crear dropdown si no existe
            let dropdown = item.querySelector('.nav-dropdown');
            if (!dropdown) {
                dropdown = document.createElement('div');
                dropdown.className = 'nav-dropdown';
                item.appendChild(dropdown);
            }
            
            // Event listeners
            item.addEventListener('mouseenter', () => this.showDropdown(item, category));
            item.addEventListener('mouseleave', () => this.hideDropdown(item));
        });
    }

    async showDropdown(item, category) {
        const dropdown = item.querySelector('.nav-dropdown');
        if (!dropdown) return;
        
        // Mostrar loading
        dropdown.innerHTML = `
            <div class="nav-dropdown-loading">
                <div class="spinner-small"></div>
                <p>Cargando productos...</p>
            </div>
        `;
        dropdown.classList.add('active');
        
        // Cargar productos destacados
        let products = this.featuredProducts[category] || [];
        
        if (products.length === 0) {
            try {
                const response = await window.api.getProducts({ 
                    category: category === 'new' ? null : category,
                    filter: category === 'new' ? 'new' : category === 'sale' ? 'sale' : null,
                    limit: 4 
                });
                
                if (response && response.success) {
                    products = response.data?.products || response.data || [];
                }
            } catch (e) {
                if (window.Logger) window.Logger.warn('Error loading dropdown products:', e);
            }
        }
        
        // Renderizar dropdown
        if (products.length > 0) {
            dropdown.innerHTML = this.renderDropdown(products, category);
        } else {
            dropdown.innerHTML = `
                <div class="nav-dropdown-empty">
                    <p>No hay productos disponibles</p>
                    <a href="products.html?category=${category}" class="btn btn-sm btn-black">VER TODOS</a>
                </div>
            `;
        }
    }

    renderDropdown(products, category) {
        const categoryName = {
            'jordan': 'JORDAN',
            'yeezy': 'YEEZY',
            'nike': 'NIKE',
            'adidas': 'ADIDAS',
            'new': 'NUEVOS LANZAMIENTOS',
            'sale': 'OFERTAS'
        }[category] || (category && typeof category === 'string' ? category.toUpperCase() : 'CATEGORÍA');
        
        return `
            <div class="nav-dropdown-content">
                <div class="nav-dropdown-header">
                    <h3>${categoryName}</h3>
                    <a href="products.html?category=${category}" class="nav-dropdown-link">
                        Ver todos <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
                <div class="nav-dropdown-products">
                    ${products.slice(0, 4).map(product => `
                        <a href="product-detail.html?id=${product.id}" class="nav-dropdown-product">
                            <img src="${product.image_url || 'assets/images/products/placeholder.jpg'}" 
                                 alt="${product.name}" 
                                 loading="lazy"
                                 onerror="this.src='assets/images/products/placeholder.jpg'">
                            <div class="nav-dropdown-product-info">
                                <h4>${product.name}</h4>
                                <div class="nav-dropdown-product-price">
                                    ${product.discount_price ? `
                                        <span class="price-new">S/ ${parseFloat(product.discount_price).toFixed(2)}</span>
                                        <span class="price-old">S/ ${parseFloat(product.price).toFixed(2)}</span>
                                    ` : `
                                        <span class="price">S/ ${parseFloat(product.price).toFixed(2)}</span>
                                    `}
                                </div>
                            </div>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }

    hideDropdown(item) {
        const dropdown = item.querySelector('.nav-dropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (window.api) {
        window.NavigationEnhanced = new NavigationEnhanced();
    }
});



