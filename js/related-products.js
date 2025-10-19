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
      <div class="container">
        <h2 class="section-title">
          <i class="fas fa-th-large"></i> Productos Relacionados
        </h2>
        <p class="section-subtitle">Productos similares que podrían interesarte</p>
        <div class="related-products-grid">
          ${products.map(product => `
            <div class="product-card">
              <div class="product-image-container">
                <img src="${product.image_url || 'https://via.placeholder.com/300'}" 
                     alt="${product.name}" 
                     class="product-image"
                     onclick="window.location.href='product-detail.html?id=${product.id}'">
                ${product.discount_price ? `
                  <span class="discount-badge">
                    ${Math.round((1 - product.discount_price / product.price) * 100)}% OFF
                  </span>
                ` : ''}
                <button class="wishlist-btn" onclick="toggleWishlist('${product.id}')">
                  <i class="far fa-heart"></i>
                </button>
              </div>
              <div class="product-info">
                <h3 class="product-name" onclick="window.location.href='product-detail.html?id=${product.id}'">
                  ${product.name}
                </h3>
                <div class="product-category">${product.category_name || 'Sin categoría'}</div>
                <div class="product-price">
                  ${product.discount_price ? `
                    <span class="price-old">S/ ${parseFloat(product.price).toFixed(2)}</span>
                    <span class="price-current">S/ ${parseFloat(product.discount_price).toFixed(2)}</span>
                  ` : `
                    <span class="price-current">S/ ${parseFloat(product.price).toFixed(2)}</span>
                  `}
                </div>
                <div class="product-rating">
                  ${this.generateStars(4.5)}
                  <span class="rating-count">(24)</span>
                </div>
                <div class="product-actions">
                  <button class="btn-add-cart" onclick="addToCart('${product.id}')">
                    <i class="fas fa-shopping-cart"></i> Agregar
                  </button>
                  <button class="btn-compare" data-product-id="${product.id}">
                    <i class="fas fa-balance-scale"></i>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
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

async function toggleWishlist(productId) {
  try {
    const response = await window.api.addToWishlist(productId);
    if (response.success) {
      window.notifications.success('Producto agregado a wishlist');
    }
  } catch (error) {
    window.notifications.error('Error al agregar a wishlist');
  }
}


