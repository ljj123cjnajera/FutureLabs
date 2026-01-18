// 🔗 Productos Relacionados
class RelatedProducts {
  constructor() {
    this.init();
  }

  init() {
    // Renderizar productos relacionados si estamos en una página de producto
    if (window.location.pathname.includes('product-detail.html')) {
      this.loadRelatedProducts();
    }
  }

  async loadRelatedProducts() {
    try {
      // Obtener ID del producto desde la URL o del producto actual
      const urlParams = new URLSearchParams(window.location.search);
      let productId = urlParams.get('id') || window.currentProductId;

      if (!productId && window.currentProduct) {
        productId = window.currentProduct.id;
      }

      if (!productId) return;

      // Obtener productos relacionados desde API
      let relatedProducts = [];
      
      try {
        const response = await window.api.getRelatedProducts(productId, 4);
        if (response && response.success && response.data && response.data.related_products) {
          relatedProducts = response.data.related_products;
        } else if (response && Array.isArray(response)) {
          relatedProducts = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          relatedProducts = response.data;
        }
      } catch (apiError) {
        if (window.Logger) window.Logger.warn('API de productos relacionados no disponible, usando fallback');
        // Fallback: obtener productos de la misma marca o categoría
        relatedProducts = await this.getFallbackRelatedProducts(productId);
      }

      if (relatedProducts && relatedProducts.length > 0) {
        this.renderRelatedProducts(relatedProducts);
      }
    } catch (error) {
      if (window.Logger) window.Logger.error('Error loading related products:', error);
    }
  }
  
  async getFallbackRelatedProducts(productId) {
    try {
      if (!window.currentProduct) {
        // Si no tenemos el producto actual, obtenerlo
        const product = await window.api.getProduct(productId);
        if (product && product.data) {
          window.currentProduct = product.data;
        }
      }
      
      if (!window.currentProduct) return [];
      
      // Buscar productos de la misma marca o categoría
      const filters = {
        limit: 4,
        brand: window.currentProduct.brand
      };
      
      const response = await window.api.getProducts(filters);
      let products = [];
      
      if (response && Array.isArray(response)) {
        products = response;
      } else if (response && response.data && Array.isArray(response.data.products)) {
        products = response.data.products;
      } else if (response && response.data && Array.isArray(response.data)) {
        products = response.data;
      }
      
      // Filtrar el producto actual
      return products.filter(p => p.id !== productId).slice(0, 4);
    } catch (error) {
      if (window.Logger) window.Logger.error('Error en fallback de productos relacionados:', error);
      return [];
    }
  }

  renderRelatedProducts(products) {
    // Buscar contenedor de productos relacionados
    let container = document.getElementById('relatedProducts');

    if (!container) {
      // Crear contenedor si no existe
      container = document.createElement('section');
      container.id = 'relatedProducts';
      container.className = 'related-products-section';

      // Insertar después del producto actual
      const productDetail = document.querySelector('.product-detail');
      if (productDetail) {
        productDetail.insertAdjacentElement('afterend', container);
      }
    }

    container.innerHTML = `
      <div class="container style-it-with-section">
        <h2 class="style-it-with-title">
          <i class="fas fa-layer-group"></i> Completa tu Outfit
        </h2>
        <p class="section-subtitle">Productos recomendados para ti</p>
        <div class="related-products-grid products-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px;">
          ${products.map(product => {
      if (window.Components && window.Components.getProductCard) {
        return window.Components.getProductCard(product);
      }
      // Fallback
      return '<div class="error">Error loading card</div>';
    }).join('')}
        </div>
      </div>
    `;

    // Comparador eliminado - código removido

    window.wishlistManager?.syncToggleButtons?.(container);
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
}

// Inicializar productos relacionados - singleton instance
if (!window.relatedProducts) {
    window.relatedProducts = new RelatedProducts();
}

// Funciones globales
async function addToCart(productId) {
  // Redirigir a product-detail para seleccionar talla
  window.location.href = `product-detail.html?id=${productId}`;
}

