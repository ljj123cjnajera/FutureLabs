/**
 * 🛒 CART ENGINE V5 (API Integration + LocalStorage Fallback + Size Support)
 * Focus: API Integration, Guest Support, Stock Validation, Size Handling, Spanish UI
 */

class CartEngine {
  constructor() {
    this.api = window.api;
    this.isAuthenticated = false;
    this.init();
  }

  async init() {
    // Check authentication status
    this.isAuthenticated = this.checkAuth();
    
    // Restore Global Header/Footer if missing
    if (window.Components) {
      const header = document.getElementById('mainHeader');
      if (header && !header.innerHTML.trim()) {
        header.innerHTML = window.Components.getHeader(true, true);
        if (window.Components.initHeader) window.Components.initHeader();
        if (window.Components.initSearch) window.Components.initSearch();
        if (window.Components.initCartCounter) window.Components.initCartCounter();
      }
      
      const footer = document.getElementById('mainFooter');
      if (footer && !footer.innerHTML.trim()) {
        footer.innerHTML = window.Components.getFooter();
      }
    }

    // Sync localStorage cart with API if authenticated
    if (this.isAuthenticated) {
      await this.syncLocalToAPI();
    }

    await this.loadCart();
  }

  checkAuth() {
    const token = localStorage.getItem('auth_token');
    return !!token && !!window.authManager?.isAuthenticated?.();
  }

  async syncLocalToAPI() {
    try {
      const localCart = JSON.parse(localStorage.getItem('brutalist_cart') || '[]');
      if (localCart.length > 0) {
        // Sync each item to API
        let syncedCount = 0;
        let failedCount = 0;
        
        for (const item of localCart) {
          try {
            // Pasar size si existe en el item
            const options = item.size ? { size: item.size } : {};
            await this.api.addToCart(item.id || item.product_id, item.quantity || 1, options);
            syncedCount++;
          } catch (e) {
            // Item might already exist or error, continue
            failedCount++;
            if (window.Logger) window.Logger.warn('Error syncing item to API:', e);
          }
        }
        
        // Clear localStorage after sync (solo si al menos uno se sincronizó)
        if (syncedCount > 0) {
          localStorage.removeItem('brutalist_cart');
          if (window.Logger) window.Logger.log(`✅ ${syncedCount} items sincronizados desde localStorage a API`);
          
          if (failedCount > 0 && window.notifications) {
            window.notifications.info('Carrito sincronizado', `${syncedCount} productos sincronizados. ${failedCount} productos no pudieron sincronizarse.`);
          }
        }
      }
    } catch (e) {
      // Silent fail, continue with API cart
      if (window.Logger) window.Logger.error('Error in syncLocalToAPI:', e);
    }
  }

  async loadCart() {
    const container = document.getElementById('cartContainer');
    if (!container) return;

    // Show loading state
    if (window.LoadingStates) {
      window.LoadingStates.show('cartContainer', {
        message: 'Cargando carrito...',
        type: 'spinner'
      });
    } else {
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem;">
          <div class="loading-brutalist">CARGANDO CARRITO...</div>
        </div>
      `;
    }

    let items = [];
    let total = 0;
    let subtotal = 0;

    try {
      if (this.isAuthenticated) {
        // Load from API
        const response = await this.api.getCart();
        
        // Handle different response formats
        if (response && response.success && response.data) {
          // Format: { success: true, data: { items: [], total: 0, count: 0 } }
          items = response.data.items || [];
          subtotal = response.data.total || 0;
        } else if (response && response.success && Array.isArray(response.data)) {
          // Format: { success: true, data: [...] }
          items = response.data;
          subtotal = items.reduce((acc, item) => {
            const price = parseFloat(item.discount_price || item.price || 0);
            return acc + (price * (item.quantity || 1));
          }, 0);
        } else if (Array.isArray(response)) {
          // Format: [...]
          items = response;
          subtotal = items.reduce((acc, item) => {
            const price = parseFloat(item.discount_price || item.price || 0);
            return acc + (price * (item.quantity || 1));
          }, 0);
        } else if (response && response.items) {
          // Format: { items: [], total: 0 }
          items = response.items;
          subtotal = response.total || 0;
        } else {
          // Empty cart or unexpected format
          items = [];
          subtotal = 0;
        }
        
        total = subtotal; // Shipping will be calculated later
        
        if (window.Logger) window.Logger.log('✅ Cart loaded from API:', { itemsCount: items.length, subtotal });
      } else {
        // Load from localStorage for guests
        const localCart = JSON.parse(localStorage.getItem('brutalist_cart') || '[]');
        items = localCart;
        subtotal = items.reduce((acc, item) => {
          const price = parseFloat(item.discount_price || item.price || 0);
          return acc + (price * (item.quantity || 1));
        }, 0);
        total = subtotal;
        
        if (window.Logger) window.Logger.log('✅ Cart loaded from localStorage:', { itemsCount: items.length, subtotal });
      }

      // Hide loading state
      if (window.LoadingStates) {
        window.LoadingStates.hide('cartContainer');
      }

      if (items.length === 0) {
        if (window.LoadingStates) {
          window.LoadingStates.empty('cartContainer', {
            title: 'Tu carrito está vacío',
            message: 'Parece que aún no has encontrado tus grails perfectos.',
            icon: 'fas fa-shopping-cart',
            actionLabel: 'Comenzar a comprar',
            actionUrl: 'products.html'
          });
        } else {
          this.renderEmpty(container);
        }
      } else {
        this.render(container, items, subtotal, total);
      }
    } catch (e) {
      if (window.ErrorHandler) {
        window.ErrorHandler.api(e, 'loadCart', 'No se pudo cargar el carrito. Por favor, intenta de nuevo.');
      } else {
        if (window.Logger) window.Logger.error('Error loading cart:', e);
      }

      // Hide loading state
      if (window.LoadingStates) {
        window.LoadingStates.hide('cartContainer');
      }

      // Fallback to localStorage
      if (!this.isAuthenticated) {
        const localCart = JSON.parse(localStorage.getItem('brutalist_cart') || '[]');
        items = localCart;
        subtotal = items.reduce((acc, item) => acc + (parseFloat(item.price || 0) * (item.quantity || 1)), 0);
        total = subtotal;
        
        if (items.length === 0) {
          if (window.LoadingStates) {
            window.LoadingStates.empty('cartContainer', {
              title: 'Tu carrito está vacío',
              message: 'Parece que aún no has encontrado tus grails perfectos.',
              icon: 'fas fa-shopping-cart',
              actionLabel: 'Comenzar a comprar',
              actionUrl: 'products.html'
            });
          } else {
            this.renderEmpty(container);
          }
        } else {
          this.render(container, items, subtotal, total);
        }
      }
    }
  }

  render(container, items, subtotal, total) {
    // Calculate shipping (free over S/ 150)
    const shipping = subtotal >= 150 ? 0 : 15;
    const finalTotal = subtotal + shipping;

    container.innerHTML = `
            <div class="cart-grid-v3">
                <!-- Items List -->
                <div class="cart-items-list">
                    ${items.map(item => {
                        const productId = item.product_id || item.id;
                        const itemPrice = parseFloat(item.discount_price || item.price || 0);
                        const itemQuantity = item.quantity || 1;
                        const itemTotal = itemPrice * itemQuantity;
                        const stockAvailable = item.stock_quantity !== undefined ? item.stock_quantity : null;
                        const isOutOfStock = stockAvailable !== null && stockAvailable === 0;
                        const isLowStock = stockAvailable !== null && stockAvailable > 0 && stockAvailable < itemQuantity;
                        const itemSize = item.size || null;
                        const sizeParam = itemSize ? `, {size: '${itemSize}'}` : '';

                        return `
                        <div class="cart-item ${isOutOfStock ? 'out-of-stock' : ''}">
                            <div class="cart-item-image">
                                <a href="product-detail.html?id=${productId}">
                                    <img src="${item.image_url || 'assets/images/products/placeholder.jpg'}" 
                                         alt="${item.name}" 
                                         loading="lazy"
                                         onerror="this.src='assets/images/products/placeholder.jpg'">
                                </a>
                                ${isOutOfStock ? '<div class="stock-badge out">AGOTADO</div>' : ''}
                                ${isLowStock ? '<div class="stock-badge low">STOCK BAJO</div>' : ''}
                            </div>
                            
                            <div class="cart-item-details">
                                <div class="cart-item-brand">${item.brand || 'Sneakers'}</div>
                                <h3 class="cart-item-title">
                                    <a href="product-detail.html?id=${productId}">${item.name}</a>
                                </h3>
                                ${item.slug ? `<div class="cart-item-slug">SKU: ${item.slug}</div>` : ''}
                                ${itemSize ? `<div class="cart-item-size" style="margin-top: 0.5rem; font-weight: 600; text-transform: uppercase; color: var(--gray-600);">Talla: ${itemSize}</div>` : ''}
                                
                                <div class="quantity-control">
                                    <button class="quantity-btn" 
                                            onclick="window.cartEngine.updateQty(${productId}, ${itemQuantity - 1}${sizeParam})"
                                            ${itemQuantity <= 1 ? 'disabled' : ''}
                                            aria-label="Disminuir cantidad">
                                        <i class="fas fa-minus"></i>
                                    </button>
                                    <input type="number" 
                                           class="quantity-input" 
                                           value="${itemQuantity}" 
                                           min="1" 
                                           max="${stockAvailable || 99}"
                                           readonly
                                           aria-label="Cantidad">
                                    <button class="quantity-btn" 
                                            onclick="window.cartEngine.updateQty(${productId}, ${itemQuantity + 1}${sizeParam})"
                                            ${(stockAvailable !== null && itemQuantity >= stockAvailable) ? 'disabled' : ''}
                                            aria-label="Aumentar cantidad">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>

                            <div class="cart-item-price-col">
                                <div class="cart-price">
                                    ${item.discount_price && item.discount_price < item.price ? `
                                        <span class="price-old">S/ ${parseFloat(item.price).toFixed(2)}</span>
                                        <span class="price-new">S/ ${itemPrice.toFixed(2)}</span>
                                    ` : `
                                        <span>S/ ${itemPrice.toFixed(2)}</span>
                                    `}
                                    <div class="item-total">S/ ${itemTotal.toFixed(2)}</div>
                                </div>
                                <button class="btn-remove" 
                                        onclick="window.cartEngine.removeItem(${productId}${sizeParam})"
                                        aria-label="Eliminar producto">
                                    <i class="fas fa-trash"></i> ELIMINAR
                                </button>
                            </div>
                        </div>
                    `;
                    }).join('')}
                </div>

                <!-- Summary (Sticky) -->
                <div class="order-summary-box">
                    <h2 class="summary-title">RESUMEN DE PEDIDO</h2>
                    
                    <div class="summary-row">
                        <span>SUBTOTAL</span>
                        <span>S/ ${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>ENVÍO</span>
                        <span>${shipping === 0 ? 'GRATIS' : `S/ ${shipping.toFixed(2)}`}</span>
                    </div>
                    ${subtotal < 150 ? `
                    <div class="summary-shipping-note" style="font-size: 0.85rem; color: #666; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #eee;">
                        <i class="fas fa-info-circle"></i> Agrega S/ ${(150 - subtotal).toFixed(2)} más para envío gratis
                    </div>
                    ` : ''}

                    <div class="summary-total">
                        <span>TOTAL</span>
                        <span>S/ ${finalTotal.toFixed(2)}</span>
                    </div>

                    <button class="btn-checkout" 
                            onclick="window.location.href='checkout.html'"
                            ${items.some(item => (item.stock_quantity !== undefined && item.stock_quantity === 0)) ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                        <i class="fas fa-lock"></i> PROCEDER AL PAGO
                    </button>
                    
                    ${!this.isAuthenticated ? `
                    <div style="margin-top: 1rem; padding: 1rem; background: #fff3cd; border: 2px solid #ffc107; text-align: center;">
                        <p style="margin: 0; font-size: 0.85rem; font-weight: 600;">
                            <i class="fas fa-user"></i> <a href="login.html" style="color: #000; text-decoration: underline;">Inicia sesión</a> para guardar tu carrito
                        </p>
                    </div>
                    ` : ''}
                    
                    <div style="margin-top: 2rem; text-align: center; font-size: 0.8rem; color: #666;">
                        <i class="fas fa-lock"></i> PAGO 100% SEGURO
                    </div>
                </div>
            </div>
        `;
  }

  renderEmpty(container) {
    container.innerHTML = `
            <div class="empty-cart-state">
                <i class="fas fa-shopping-cart" style="font-size: 4rem; margin-bottom: 2rem; color: var(--black);"></i>
                <h2 class="empty-cart-title">TU CARRITO ESTÁ VACÍO</h2>
                <p style="font-family: 'Inter', sans-serif; margin-bottom: 2rem;">Parece que aún no has encontrado tus grails perfectos.</p>
                <a href="products.html" class="btn-continue-shopping">
                    <i class="fas fa-arrow-right"></i> COMENZAR A COMPRAR
                </a>
            </div>
        `;
  }

  async updateQty(productId, newQty, options = {}) {
    if (newQty <= 0) {
      return this.removeItem(productId, options);
    }

    try {
      if (this.isAuthenticated) {
        await this.api.updateCartItem(productId, newQty, options);
      } else {
        // Update localStorage
        let cart = JSON.parse(localStorage.getItem('brutalist_cart') || '[]');
        const item = cart.find(i => {
          const sameProduct = (i.id === productId || i.product_id === productId);
          const sameSize = (!options.size && !i.size) || (options.size === i.size);
          return sameProduct && sameSize;
        });
        if (item) {
          item.quantity = newQty;
          localStorage.setItem('brutalist_cart', JSON.stringify(cart));
        }
      }

      await this.loadCart();
      this.updateCartCounter();
      
      if (window.notifications) {
        window.notifications.success('Carrito Actualizado', 'La cantidad se actualizó correctamente');
      }
    } catch (e) {
      if (window.Logger) window.Logger.error('Error updating cart:', e);
      if (window.notifications) {
        window.notifications.error('Error', 'No se pudo actualizar la cantidad. Por favor, intenta de nuevo.');
      }
    }
  }

  async removeItem(productId, options = {}) {
    try {
      if (this.isAuthenticated) {
        await this.api.removeFromCart(productId, options);
      } else {
        // Remove from localStorage (considerando size si existe)
        let cart = JSON.parse(localStorage.getItem('brutalist_cart') || '[]');
        cart = cart.filter(i => {
          const sameProduct = (i.id === productId || i.product_id === productId);
          const sameSize = (!options.size && !i.size) || (options.size === i.size);
          // Si no se especifica size, remover todos los items de ese producto
          return !sameProduct || (options.size && !sameSize);
        });
        localStorage.setItem('brutalist_cart', JSON.stringify(cart));
      }

      await this.loadCart();
      this.updateCartCounter();
      
      if (window.notifications) {
        window.notifications.success('Producto Eliminado', 'El producto fue removido del carrito');
      }
    } catch (e) {
      if (window.Logger) window.Logger.error('Error removing from cart:', e);
      if (window.notifications) {
        window.notifications.error('Error', 'No se pudo eliminar el producto. Por favor, intenta de nuevo.');
      }
    }
  }

  async add(productId, quantity = 1, options = {}) {
    try {
      // Validar stock antes de agregar
      try {
        const productResponse = await this.api.getProduct(productId);
        const product = productResponse?.data || productResponse;
        
        if (product) {
          const stock = product.stock_quantity;
          if (stock !== undefined && stock === 0) {
            if (window.notifications) {
              window.notifications.warning('Producto Agotado', 'Este producto no está disponible en este momento.');
            }
            return false;
          }
          
          // Validar cantidad vs stock disponible
          if (stock !== undefined && stock < quantity) {
            if (window.notifications) {
              window.notifications.warning('Stock Insuficiente', `Solo hay ${stock} unidades disponibles.`);
            }
            return false;
          }
        }
      } catch (stockError) {
        // Si falla la validación de stock, continuar (no bloquear)
        if (window.Logger) window.Logger.warn('Error validating stock, continuing:', stockError);
      }

      if (this.isAuthenticated) {
        // Pasar options (incluyendo size) a la API
        await this.api.addToCart(productId, quantity, options);
      } else {
        // Add to localStorage
        let cart = JSON.parse(localStorage.getItem('brutalist_cart') || '[]');
        
        // Buscar item existente (considerando size si existe)
        const existing = cart.find(i => {
          const sameProduct = (i.id === productId || i.product_id === productId);
          const sameSize = (!options.size && !i.size) || (options.size === i.size);
          return sameProduct && sameSize;
        });

        if (existing) {
          existing.quantity += quantity;
        } else {
          const product = window.currentProduct || { 
            id: productId, 
            name: 'Producto ' + productId, 
            price: 0, 
            image_url: 'assets/images/products/placeholder.jpg', 
            brand: 'Sneakers' 
          };

          cart.push({
            id: productId,
            product_id: productId,
            name: product.name,
            price: parseFloat(product.discount_price || product.price || 0),
            quantity: quantity,
            image_url: product.image_url || 'assets/images/products/placeholder.jpg',
            brand: product.brand || 'Sneakers',
            size: options.size || null
          });
        }

        localStorage.setItem('brutalist_cart', JSON.stringify(cart));
      }

      await this.loadCart();
      this.updateCartCounter();

      if (window.notifications) {
        window.notifications.success('Agregado al Carrito', 'El producto se agregó correctamente');
      }

      // Open drawer if available
      if (window.CartDrawer) window.CartDrawer.open();

      return true;
    } catch (e) {
      if (window.Logger) window.Logger.error('Error adding to cart:', e);
      if (window.notifications) {
        window.notifications.error('Error', 'No se pudo agregar el producto. Por favor, intenta de nuevo.');
      }
      return false;
    }
  }

  updateCartCounter() {
    // Update cart counter in header
    document.dispatchEvent(new CustomEvent('cartUpdated'));
    if (window.Components && window.Components.updateCartCount) {
      window.Components.updateCartCount();
    }
    // Update cart drawer if it's open
    if (window.CartDrawer && document.getElementById('cartDrawer')?.classList.contains('active')) {
      window.CartDrawer.update();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.cartEngine = new CartEngine();
  // Alias for backward compatibility with Components.js
  window.cartManager = window.cartEngine;
});
