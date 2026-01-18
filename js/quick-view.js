// 🔍 Quick View Modal - Ver productos sin cambiar de página
class QuickView {
  constructor() {
    this.modal = null;
    this.currentProduct = null;
    this.selectedSize = null;
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
          <div class="loading-spinner"></div>
              <p>Cargando producto...</p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  setupEventListeners() {
    // Limpiar listeners anteriores si existen
    this.cleanup();

    // Cerrar al hacer click en overlay
    this.overlayClickHandler = (e) => {
      if (e.target.classList.contains('quick-view-overlay')) {
        this.close();
      }
    };
    document.addEventListener('click', this.overlayClickHandler);

    // Cerrar con botón X
    const closeBtn = document.getElementById('quickViewClose');
    if (closeBtn) {
      this.closeBtnHandler = () => this.close();
      closeBtn.addEventListener('click', this.closeBtnHandler);
    }

    // Cerrar con ESC
    this.escapeKeyHandler = (e) => {
      if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
        this.close();
      }
    };
    document.addEventListener('keydown', this.escapeKeyHandler);
  }

  cleanup() {
    // Remover event listeners para prevenir memory leaks
    if (this.overlayClickHandler) {
      document.removeEventListener('click', this.overlayClickHandler);
      this.overlayClickHandler = null;
    }
    if (this.escapeKeyHandler) {
      document.removeEventListener('keydown', this.escapeKeyHandler);
      this.escapeKeyHandler = null;
    }
    const closeBtn = document.getElementById('quickViewClose');
    if (closeBtn && this.closeBtnHandler) {
      closeBtn.removeEventListener('click', this.closeBtnHandler);
      this.closeBtnHandler = null;
    }
  }

  async show(productId) {
    try {
      this.selectedSize = null; // Reset selection
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
      if (window.Logger) window.Logger.error('Error en Quick View:', error);
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

          <div class="quick-view-size-selector" style="margin-bottom: 20px;">
              <h4 style="font-weight: 700; margin-bottom: 10px; font-size: 0.9rem;">SELECCIONA TU TALLA:</h4>
              <div id="quickViewSizeGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 8px;">
                 <!-- Sizes injected here -->
              </div>
              <div id="quickViewSizeError" style="color: #d32f2f; font-size: 0.85rem; margin-top: 8px; font-weight: 600; display: none;">
                  <i class="fas fa-exclamation-circle"></i> Selecciona una talla
              </div>
          </div>

          <div class="quick-view-actions">
            <button class="btn btn-primary btn-lg" onclick="quickView.addToCart('${product.id}')">
              <i class="fas fa-shopping-cart"></i> Agregar al Carrito
            </button>
            <button class="btn btn-outline btn-lg" onclick="quickView.buyNow('${product.id}')">
              <i class="fas fa-bolt"></i> Comprar Ahora
            </button>
            <button
              class="btn btn-ghost btn-lg"
              type="button"
              data-wishlist-toggle
              data-product-id="${product.id}"
              data-label-inactive="Agregar a favoritos"
              data-label-active="En tu wishlist"
              data-icon-inactive="far fa-heart"
              data-icon-active="fas fa-heart"
            >
              <i class="far fa-heart"></i>
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

    const quickViewBody = document.getElementById('quickViewBody');
    if (quickViewBody) {
      quickViewBody.innerHTML = html;
      this.renderSizes(product);
      window.wishlistManager?.syncToggleButtons?.(quickViewBody);
    }
  }

  renderSizes(product) {
    const grid = document.getElementById('quickViewSizeGrid');
    if (!grid) return;

    let sizeStock = {};
    try {
      if (typeof product.size_stock === 'string') {
        sizeStock = JSON.parse(product.size_stock);
      } else if (typeof product.size_stock === 'object') {
        sizeStock = product.size_stock;
      }
    } catch (e) { }

    // Common US sizes
    const sizes = ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13'];

    grid.innerHTML = sizes.map(size => {
      // If detailed stock exists, use it. Otherwise assume stock if main quantity > 0
      const stock = sizeStock[size] !== undefined ? sizeStock[size] : (product.stock_quantity || 10);
      const isAvailable = stock > 0;

      return `
              <button 
                  class="size-option-quick ${!isAvailable ? 'disabled' : ''}" 
                  style="
                      padding: 10px; 
                      border: 1px solid ${isAvailable ? '#e5e7eb' : '#f3f4f6'}; 
                      background: ${isAvailable ? 'white' : '#f9fafb'}; 
                      color: ${isAvailable ? '#000' : '#d1d5db'};
                      cursor: ${isAvailable ? 'pointer' : 'not-allowed'};
                      font-weight: 700;
                      transition: all 0.2s;
                  "
                  onclick="quickView.selectSize('${size}', this)"
                  ${!isAvailable ? 'disabled' : ''}
              >
                  ${size}
              </button>
          `;
    }).join('');
  }

  selectSize(size, btnElement) {
    this.selectedSize = size;

    // Update UI
    document.querySelectorAll('.size-option-quick').forEach(btn => {
      btn.style.borderColor = '#e5e7eb';
      btn.style.background = 'white';
      btn.style.color = '#000';
    });

    if (btnElement) {
      btnElement.style.borderColor = '#000';
      btnElement.style.background = '#000';
      btnElement.style.color = '#fff';
    }

    // Clear error
    const errorMsg = document.getElementById('quickViewSizeError');
    if (errorMsg) errorMsg.style.display = 'none';
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
    // Limpiar listeners cuando se cierra
    this.cleanup();
  }

  async addToCart(productId) {
    if (!this.selectedSize) {
      const errorMsg = document.getElementById('quickViewSizeError');
      if (errorMsg) {
        errorMsg.style.display = 'block';
        errorMsg.classList.add('shake');
        setTimeout(() => errorMsg.classList.remove('shake'), 500);
      }
      return;
    }

    try {
      const btn = document.querySelector('.quick-view-actions .btn-primary');
      const originalText = btn ? btn.innerHTML : '';
      if (btn) {
        btn.innerHTML = '<div class="loading-spinner-sm"></div> Agregando...';
        btn.disabled = true;
      }

      // Add to cart using engine (Robust method: handles Guests + Auth + Stock)
      if (window.cartEngine) {
        // Use cartEngine.add() instead of direct API call to support LocalStorage/Guests
        const success = await window.cartEngine.add(productId, 1, { size: this.selectedSize });

        if (success) {
          // Success notification is handled by cartEngine, but we can do extra UI cleanup here
          this.close();

          // Open cart drawer if available
          if (window.CartDrawer) {
            window.CartDrawer.open();
          }
        }
      } else {
        throw new Error('Sistema de carrito no disponible');
      }
    } catch (e) {
      console.error('Error adding to cart:', e);
      if (window.notifications) {
        window.notifications.error('Error', 'No se pudo agregar al carrito');
      }
    } finally {
      const btn = document.querySelector('.quick-view-actions .btn-primary');
      if (btn) {
        btn.innerHTML = originalText || '<i class="fas fa-shopping-cart"></i> Agregar al Carrito';
        btn.disabled = false;
      }
    }
  }

  buyNow(productId) {
    this.close();
    window.location.href = `product-detail.html?id=${productId}`;
  }

}

// Inicializar Quick View globalmente
let quickView;
document.addEventListener('DOMContentLoaded', () => {
  quickView = new QuickView();
  window.quickView = quickView;
});

