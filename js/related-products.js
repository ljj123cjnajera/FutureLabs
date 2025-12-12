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
      // Obtener ID del producto desde la URL
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('id');

      if (!productId) return;

      // Obtener productos relacionados
      const response = await window.api.getRelatedProducts(productId, 4);

      if (response.success && response.data.related_products.length > 0) {
        this.renderRelatedProducts(response.data.related_products);
      }
    } catch (error) {
      console.error('Error loading related products:', error);
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

    if (window.productComparator) {
      window.productComparator.updateCompareButtons();
    }

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

// Inicializar productos relacionados
const relatedProducts = new RelatedProducts();

// Funciones globales
async function addToCart(productId) {
  try {
    await window.cartManager.add(productId, 1);
    window.notifications.show('Producto agregado al carrito', 'success');
  } catch (error) {
    window.notifications.show('Error al agregar al carrito', 'error');
  }
}

