// 🏠 Gestión de la Página Principal
class HomeManager {
  constructor() {
    this.featuredProducts = [];
    this.onSaleProducts = [];
    this.categories = [];
    this.init();
  }

  async init() {
    console.log('🏠 HomeManager init() - Iniciando...');
    try {
      await Promise.all([
        this.loadFeaturedProducts(),
        this.loadOnSaleProducts(),
        this.loadCategories()
      ]);
      
      this.setupEventListeners();
      console.log('✅ HomeManager inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando HomeManager:', error);
    }
  }

  async loadFeaturedProducts() {
    try {
      // Mostrar skeleton loader
      const container = document.getElementById('featuredProducts');
      if (container && window.skeletonLoader) {
        window.skeletonLoader.show('featuredProducts', 'product-grid');
      }
      
      const response = await window.api.getFeaturedProducts();
      if (response.success) {
        this.featuredProducts = response.data.products;
        this.renderFeaturedProducts();
      }
    } catch (error) {
      console.error('Error loading featured products:', error);
    }
  }

  async loadOnSaleProducts() {
    try {
      // Mostrar skeleton loader
      const container = document.getElementById('onSaleProducts');
      if (container && window.skeletonLoader) {
        window.skeletonLoader.show('onSaleProducts', 'product-grid');
      }
      
      const response = await window.api.getProducts({ on_sale: true });
      if (response.success) {
        this.onSaleProducts = response.data.products.slice(0, 8);
        this.renderOnSaleProducts();
      }
    } catch (error) {
      console.error('Error loading on-sale products:', error);
    }
  }

  async loadCategories() {
    try {
      // Mostrar skeleton loader
      const container = document.getElementById('categories');
      if (container && window.skeletonLoader) {
        window.skeletonLoader.show('categories', 'categories');
      }
      
      const response = await window.api.getCategories();
      if (response.success) {
        this.categories = response.data.categories;
        this.renderCategories();
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  renderFeaturedProducts() {
    const container = document.getElementById('featuredProductsGrid');
    if (!container) return;

    container.innerHTML = this.featuredProducts.map(product => this.createProductCard(product)).join('');
    
    // Ocultar skeleton loader
    if (window.skeletonLoader) {
      window.skeletonLoader.hide('featuredProducts');
    }
  }

  renderOnSaleProducts() {
    // Crear contenedor si no existe
    let container = document.getElementById('onSaleProductsGrid');
    if (!container) {
      const section = document.createElement('section');
      section.className = 'section';
      section.innerHTML = `
        <div class="container">
          <h2 class="section-title">🔥 Ofertas Especiales</h2>
          <div id="onSaleProductsGrid" class="products-grid"></div>
        </div>
      `;
      
      // Insertar después de featured products
      const featuredSection = document.getElementById('featured-products');
      if (featuredSection) {
        featuredSection.insertAdjacentElement('afterend', section);
        container = document.getElementById('onSaleProductsGrid');
      } else {
        console.log('⚠️ Featured section not found, skipping on-sale products');
        return;
      }
    }

    if (container) {
      container.innerHTML = this.onSaleProducts.map(product => this.createProductCard(product)).join('');
      
      // Ocultar skeleton loader
      if (window.skeletonLoader) {
        window.skeletonLoader.hide('onSaleProducts');
      }
    }
  }

  renderCategories() {
    const container = document.querySelector('.categories-carousel');
    if (!container) return;

    container.innerHTML = this.categories.map(category => `
      <div class="category-card" onclick="window.location.href='products.html?category=${category.slug}'">
        <div class="category-icon">
          <i class="${this.getCategoryIcon(category.slug)}"></i>
        </div>
        <h3>${category.name}</h3>
        <p>${category.description}</p>
      </div>
    `).join('');
    
    // Ocultar skeleton loader
    if (window.skeletonLoader) {
      window.skeletonLoader.hide('categories');
    }
  }

  createProductCard(product) {
    const discount = product.discount_price ? 
      Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;
    
    return `
      <div class="product-card" onclick="window.location.href='product-detail.html?id=${product.id}'">
        <div class="product-image">
          <img src="${product.image_url || 'assets/images/products/placeholder.jpg'}" 
               alt="${product.name}" 
               onerror="this.src='assets/images/products/placeholder.jpg'">
          ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
          <button class="favorite-btn" onclick="event.stopPropagation(); homeManager.toggleFavorite('${product.id}')">
            <i class="far fa-heart"></i>
          </button>
        </div>
        <div class="product-info">
          <span class="product-brand">${product.brand}</span>
          <h3 class="product-name">${product.name}</h3>
          <div class="product-rating">
            ${this.generateStars(product.rating)}
            <span class="rating-text">(${product.review_count || 0})</span>
          </div>
          <div class="product-price">
            ${product.discount_price ? `
              <span class="price-old">S/ ${parseFloat(product.price).toFixed(2)}</span>
              <span class="price-new">S/ ${parseFloat(product.discount_price).toFixed(2)}</span>
            ` : `
              <span class="price-current">S/ ${parseFloat(product.price).toFixed(2)}</span>
            `}
          </div>
          <div class="product-actions">
            <button class="btn-cart" onclick="event.stopPropagation(); homeManager.addToCart('${product.id}')">
              <i class="fas fa-shopping-cart"></i> Agregar
            </button>
            <button class="btn-buy" onclick="event.stopPropagation(); homeManager.buyNow('${product.id}')">
              Comprar
            </button>
          </div>
        </div>
      </div>
    `;
  }

  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return `
      ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
      ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
      ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
    `;
  }

  getCategoryIcon(slug) {
    const icons = {
      'gaming': 'fa-gamepad',
      'smartphones': 'fa-mobile-alt',
      'laptops': 'fa-laptop',
      'audio': 'fa-headphones',
      'smart-home': 'fa-home',
      'wearables': 'fa-heartbeat',
      'cameras': 'fa-camera',
      'accessories': 'fa-plug'
    };
    return icons[slug] || 'fa-box';
  }

  async addToCart(productId) {
    try {
      console.log('🛒 Intentando agregar producto al carrito:', productId);
      console.log('🔍 cartManager existe:', typeof window.cartManager);
      console.log('🔍 notifications existe:', typeof window.notifications);
      
      await window.cartManager.add(productId, 1);
      console.log('✅ Producto agregado al carrito');
      window.notifications.show('Producto agregado al carrito', 'success');
    } catch (error) {
      console.error('❌ Error al agregar producto:', error);
      window.notifications.show('Error al agregar producto', 'error');
    }
  }

  async buyNow(productId) {
    try {
      await window.cartManager.add(productId, 1);
      window.location.href = 'checkout.html';
    } catch (error) {
      window.notifications.show('Error al procesar compra', 'error');
    }
  }

  async toggleFavorite(productId) {
    try {
      // Verificar si está autenticado
      if (!window.authManager || !window.authManager.isAuthenticated()) {
        window.notifications.show('Inicia sesión para agregar a favoritos', 'warning');
        window.modalManager.showLogin();
        return;
      }

      // Verificar si está en wishlist
      const checkResponse = await window.api.checkWishlist(productId);
      
      if (checkResponse.success && checkResponse.data.inWishlist) {
        // Remover de wishlist
        const response = await window.api.removeFromWishlist(productId);
        if (response.success) {
          window.notifications.show('Eliminado de favoritos', 'success');
        }
      } else {
        // Agregar a wishlist
        const response = await window.api.addToWishlist(productId);
        if (response.success) {
          window.notifications.show('Agregado a favoritos', 'success');
        }
      }
    } catch (error) {
      window.notifications.show('Error al gestionar favoritos', 'error');
    }
  }

  setupEventListeners() {
    // Búsqueda
    const searchInput = document.querySelector('.search-bar input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
      const performSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        }
      };
      
      searchBtn.addEventListener('click', performSearch);
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
      });
    }

    // Botones de navegación rápida
    document.querySelectorAll('.banner').forEach(banner => {
      banner.addEventListener('click', function() {
        const title = this.querySelector('h3').textContent;
        if (title.includes('Gaming')) {
          window.location.href = 'products.html?category=gaming';
        } else if (title.includes('Smart Home')) {
          window.location.href = 'products.html?category=smart-home';
        } else if (title.includes('Audio')) {
          window.location.href = 'products.html?category=audio';
        }
      });
    });

    // CTA buttons
    document.querySelectorAll('.cta-button').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'products.html';
      });
    });
  }
}

// Crear instancia global
window.homeManager = new HomeManager();

