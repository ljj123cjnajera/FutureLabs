// 🔍 Quick View Modal - Ver productos sin cambiar de página
class QuickView {
  constructor() {
    this.modal = null;
    this.currentProduct = null;
    this.init();
  }

  init() {
    // Crear modal si no existe
    if (!document.getElementById('quickViewModal')) {
      this.createModal();
    }
    this.modal = document.getElementById('quickViewModal');
    
    // Event listeners
    this.setupEventListeners();
  }

  createModal() {
    const modalHTML = `
      <div class="quick-view-modal" id="quickViewModal">
        <div class="quick-view-overlay"></div>
        <div class="quick-view-content">
          <button class="quick-view-close" id="quickViewClose">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="quick-view-body" id="quickViewBody">
            <!-- Contenido se carga dinámicamente -->
            <div class="quick-view-loading">
              <i class="fas fa-spinner fa-spin"></i>
              <p>Cargando producto...</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  setupEventListeners() {
    // Cerrar al hacer click en overlay
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('quick-view-overlay')) {
        this.close();
      }
    });

    // Cerrar con botón X
    const closeBtn = document.getElementById('quickViewClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
        this.close();
      }
    });
  }

  async show(productId) {
    try {
      // Mostrar modal con loading
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Cargar datos del producto
      const response = await window.api.getProduct(productId);
      
      if (response.success) {
        this.currentProduct = response.data.product;
        this.renderProduct(this.currentProduct);
      } else {
        this.showError('Error al cargar el producto');
      }
    } catch (error) {
      console.error('Error en Quick View:', error);
      this.showError('Error al cargar el producto');
    }
  }

  renderProduct(product) {
    const discount = product.discount_price && product.discount_price < product.price
      ? Math.round(((product.price - product.discount_price) / product.price) * 100)
      : 0;

    const rating = product.rating || 0;
    const reviewCount = product.review_count || 0;

    const html = `
      <div class="quick-view-product">
        <div class="quick-view-image">
          <img src="${product.image_url || 'assets/images/products/placeholder.jpg'}" 
               alt="${product.name}"
               onerror="this.src='assets/images/products/placeholder.jpg'">
          ${discount > 0 ? `<span class="quick-view-badge">-${discount}%</span>` : ''}
        </div>
        
        <div class="quick-view-info">
          <div class="quick-view-header">
            <span class="quick-view-brand">${product.brand || 'Sin marca'}</span>
            <h2 class="quick-view-title">${product.name}</h2>
            <div class="quick-view-rating">
              ${this.generateStars(rating)}
              <span class="quick-view-rating-text">(${reviewCount} reseñas)</span>
            </div>
          </div>

          <div class="quick-view-price">
            ${product.discount_price && product.discount_price < product.price ? `
              <span class="quick-view-price-old">S/ ${parseFloat(product.price).toFixed(2)}</span>
              <span class="quick-view-price-new">S/ ${parseFloat(product.discount_price).toFixed(2)}</span>
              <span class="quick-view-discount">Ahorras S/ ${(parseFloat(product.price) - parseFloat(product.discount_price)).toFixed(2)}</span>
            ` : `
              <span class="quick-view-price-current">S/ ${parseFloat(product.price).toFixed(2)}</span>
            `}
          </div>

          <div class="quick-view-description">
            <p>${product.description || 'Descripción no disponible'}</p>
          </div>

          <div class="quick-view-features">
            <div class="quick-view-feature">
              <i class="fas fa-check-circle"></i>
              <span>Envío gratis en compras mayores a S/ 200</span>
            </div>
            <div class="quick-view-feature">
              <i class="fas fa-check-circle"></i>
              <span>Garantía oficial del fabricante</span>
            </div>
            <div class="quick-view-feature">
              <i class="fas fa-check-circle"></i>
              <span>Devolución gratis 30 días</span>
            </div>
          </div>

          <div class="quick-view-stock">
            <i class="fas fa-box"></i>
            <span>Stock disponible</span>
          </div>

          <div class="quick-view-actions">
            <button class="btn btn-primary btn-lg" onclick="quickView.addToCart('${product.id}')">
              <i class="fas fa-shopping-cart"></i> Agregar al Carrito
            </button>
            <button class="btn btn-outline btn-lg" onclick="quickView.buyNow('${product.id}')">
              <i class="fas fa-bolt"></i> Comprar Ahora
            </button>
            <button class="btn btn-ghost btn-lg" onclick="quickView.toggleWishlist('${product.id}')">
              <i class="far fa-heart"></i>
            </button>
            <button class="btn btn-ghost btn-lg" onclick="quickView.addToCompare('${product.id}')">
              <i class="fas fa-balance-scale"></i>
            </button>
          </div>

          <div class="quick-view-footer">
            <a href="product-detail.html?id=${product.id}" class="quick-view-link">
              Ver detalles completos <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    `;

    document.getElementById('quickViewBody').innerHTML = html;
  }

  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
      stars += '<i class="far fa-star"></i>';
    }

    return `<div class="quick-view-stars">${stars}</div>`;
  }

  showError(message) {
    document.getElementById('quickViewBody').innerHTML = `
      <div class="quick-view-error">
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="quickView.close()">Cerrar</button>
      </div>
    `;
  }

  close() {
    if (this.modal) {
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
      this.currentProduct = null;
    }
  }

  async addToCart(productId) {
    try {
      if (window.cartManager) {
        await window.cartManager.add(productId, 1);
        if (window.notifications) {
          window.notifications.success('Producto agregado al carrito');
        }
        // Cerrar modal después de agregar
        setTimeout(() => this.close(), 500);
      }
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      if (window.notifications) {
        window.notifications.error('Error al agregar producto');
      }
    }
  }

  buyNow(productId) {
    this.close();
    window.location.href = `product-detail.html?id=${productId}`;
  }

  toggleWishlist(productId) {
    if (window.wishlistManager) {
      window.wishlistManager.toggle(productId);
    } else {
      console.warn('Wishlist manager no disponible');
    }
  }

  addToCompare(productId) {
    if (window.comparator) {
      window.comparator.addProduct(productId);
      if (window.notifications) {
        window.notifications.success('Producto agregado al comparador');
      }
    }
  }
}

// Inicializar Quick View globalmente
let quickView;
document.addEventListener('DOMContentLoaded', () => {
  quickView = new QuickView();
  window.quickView = quickView;
});

