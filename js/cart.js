/**
 * 🛒 CART ENGINE V4 (API Integration + LocalStorage Fallback)
 * Focus: API Integration, Guest Support, Stock Validation, Spanish UI
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
    if (window.Components && !document.getElementById('mainHeader')?.innerHTML) {
      const header = document.getElementById('mainHeader');
      if (header) {
        header.innerHTML = window.Components.getHeader(true, true);
        if (window.Components.initHeader) window.Components.initHeader();
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
      } else {
        if (window.LoadingStates) {
          window.LoadingStates.error('cartContainer', {
            title: 'Error al cargar carrito',
            message: 'No se pudo cargar el carrito. Por favor, intenta de nuevo.',
            retryLabel: 'REINTENTAR',
            retryCallback: 'window.cartEngine.loadCart()'
          });
        } else {
          container.innerHTML = `
            <div style="text-align: center; padding: 4rem; border: 2px dashed #dc3545; color: #dc3545;">
              <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
              <h3>ERROR AL CARGAR CARRITO</h3>
              <p>No se pudo cargar el carrito. Por favor, intenta de nuevo.</p>
              <button onclick="window.cartEngine.loadCart()" class="btn btn-outline" style="margin-top: 1rem; border-color: #dc3545; color: #dc3545;">REINTENTAR</button>
            </div>
          `;
        }
      }
    }
  }

  render(container, items, subtotal, total) {
    // Get applied coupon discount if any
    const appliedCoupon = window.couponsManager?.appliedCoupon || null;
    const couponDiscount = window.couponsManager?.discount || 0;
    
    // Calculate subtotal after coupon
    const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscount);
    
    // Calculate shipping (free over S/ 150, based on subtotal after coupon)
    const shippingThreshold = 150;
    const shipping = subtotalAfterCoupon >= shippingThreshold ? 0 : 15;
    const finalTotal = subtotalAfterCoupon + shipping;

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
                                
                                <div class="quantity-control">
                                    <button class="quantity-btn" 
                                            onclick="window.cartEngine.updateQty(${productId}, ${itemQuantity - 1})"
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
                                            onclick="window.cartEngine.updateQty(${productId}, ${itemQuantity + 1})"
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
                                        onclick="window.cartEngine.removeItem(${productId})"
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
                    ${appliedCoupon ? `
                    <div class="summary-row" style="color: var(--success, #28a745);">
                        <span>
                            <i class="fas fa-tag"></i> CUPÓN: ${appliedCoupon.code}
                            <button onclick="window.cartEngine.removeCoupon()" 
                                    style="margin-left: 0.5rem; background: transparent; border: none; color: inherit; cursor: pointer; font-size: 0.8rem;"
                                    aria-label="Remover cupón">
                                <i class="fas fa-times"></i>
                            </button>
                        </span>
                        <span>-S/ ${couponDiscount.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    <div class="summary-row">
                        <span>ENVÍO</span>
                        <span>${shipping === 0 ? 'GRATIS' : `S/ ${shipping.toFixed(2)}`}</span>
                    </div>
                    ${subtotalAfterCoupon < shippingThreshold ? `
                    <div class="summary-shipping-note" style="font-size: 0.85rem; color: #666; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #eee;">
                        <i class="fas fa-info-circle"></i> Agrega S/ ${(shippingThreshold - subtotalAfterCoupon).toFixed(2)} más para envío gratis
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
                    
                    <!-- Coupon Section -->
                    <div id="cartCouponSection" style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid var(--black);">
                        ${appliedCoupon ? '' : `
                        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <input type="text" 
                                   id="couponCodeInput" 
                                   placeholder="CÓDIGO DE CUPÓN" 
                                   style="flex: 1; padding: 0.75rem; border: 2px solid var(--black); font-weight: 600; text-transform: uppercase;"
                                   onkeypress="if(event.key==='Enter') window.cartEngine.applyCoupon()">
                            <button onclick="window.cartEngine.applyCoupon()" 
                                    class="btn btn-black" 
                                    style="padding: 0.75rem 1.5rem; white-space: nowrap;">
                                APLICAR
                            </button>
                        </div>
                        `}
                    </div>
                    
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

  async updateQty(productId, newQty) {
    if (newQty <= 0) {
      return this.removeItem(productId);
    }

    try {
      // Validate stock before updating
      const stockInfo = await this.validateStock(productId, newQty);
      if (!stockInfo.available) {
        if (window.notifications) {
          window.notifications.warning('Stock Insuficiente', stockInfo.message || 'No hay suficiente stock disponible');
        }
        return;
      }

      if (this.isAuthenticated) {
        await this.api.updateCartItem(productId, newQty);
      } else {
        // Update localStorage
        let cart = JSON.parse(localStorage.getItem('brutalist_cart') || '[]');
        const item = cart.find(i => (i.id === productId || i.product_id === productId));
        if (item) {
          // Validate stock in localStorage item
          if (item.stock_quantity !== undefined && newQty > item.stock_quantity) {
            if (window.notifications) {
              window.notifications.warning('Stock Insuficiente', `Solo hay ${item.stock_quantity} unidades disponibles`);
            }
            return;
          }
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
        const errorMsg = e.response?.data?.message || e.message || 'No se pudo actualizar la cantidad. Por favor, intenta de nuevo.';
        window.notifications.error('Error', errorMsg);
      }
    }
  }

  async validateStock(productId, quantity) {
    try {
      // Try to get product info from API
      if (this.api && this.api.getProduct) {
        const product = await this.api.getProduct(productId);
        if (product && product.success && product.data) {
          const stock = product.data.stock_quantity;
          if (stock !== undefined) {
            if (stock === 0) {
              return { available: false, message: 'Este producto está agotado' };
            }
            if (stock < quantity) {
              return { available: false, message: `Solo hay ${stock} unidades disponibles` };
            }
            return { available: true };
          }
        }
      }
      // If validation fails, allow the operation (fallback)
      return { available: true };
    } catch (e) {
      if (window.Logger) window.Logger.warn('Error validating stock:', e);
      // On error, allow the operation (fail open)
      return { available: true };
    }
  }

  async removeItem(productId) {
    try {
      if (this.isAuthenticated) {
        await this.api.removeFromCart(productId);
      } else {
        // Remove from localStorage
        let cart = JSON.parse(localStorage.getItem('brutalist_cart') || '[]');
        cart = cart.filter(i => (i.id !== productId && i.product_id !== productId));
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
      // Validate stock before adding
      const stockInfo = await this.validateStock(productId, quantity);
      if (!stockInfo.available) {
        if (window.notifications) {
          window.notifications.warning('Stock Insuficiente', stockInfo.message || 'No hay suficiente stock disponible');
        }
        return false;
      }

      // Additional validation from currentProduct if available
      if (window.currentProduct) {
        const stock = window.currentProduct.stock_quantity;
        if (stock !== undefined && stock === 0) {
          if (window.notifications) {
            window.notifications.warning('Producto Agotado', 'Este producto no está disponible en este momento.');
          }
          return false;
        }
        if (stock !== undefined && stock < quantity) {
          if (window.notifications) {
            window.notifications.warning('Stock Insuficiente', `Solo hay ${stock} unidades disponibles`);
          }
          return false;
        }
      }

      // Validate size stock if size is provided
      if (options.size && window.productSizeStock && window.productSizeStock[options.size] !== undefined) {
        const sizeStock = window.productSizeStock[options.size];
        if (sizeStock === 0) {
          if (window.notifications) {
            window.notifications.warning('Talla Agotada', `La talla US ${options.size} no está disponible`);
          }
          return false;
        }
        if (sizeStock < quantity) {
          if (window.notifications) {
            window.notifications.warning('Stock Insuficiente', `Solo hay ${sizeStock} unidades en talla US ${options.size}`);
          }
          return false;
        }
      }

      if (this.isAuthenticated) {
        try {
          const response = await this.api.addToCart(productId, quantity, options);
          // Check if API returned an error
          if (response && !response.success) {
            if (window.notifications) {
              const message = response.message || 'No se pudo agregar el producto al carrito';
              if (response.message && response.message.includes('Stock insuficiente')) {
                window.notifications.warning('Stock Insuficiente', response.message);
              } else {
                window.notifications.error('Error', message);
              }
            }
            return false;
          }
        } catch (e) {
          if (window.Logger) window.Logger.error('Error adding to cart:', e);
          if (window.notifications) {
            const errorMsg = e.response?.data?.message || e.message || 'No se pudo agregar el producto. Por favor, intenta de nuevo.';
            if (errorMsg.includes('Stock insuficiente')) {
              window.notifications.warning('Stock Insuficiente', errorMsg);
            } else {
              window.notifications.error('Error', errorMsg);
            }
          }
          return false;
        }
      } else {
        // Add to localStorage
        let cart = JSON.parse(localStorage.getItem('brutalist_cart') || '[]');
        
        // For guest users, check if same product with same size already exists
        const existingIndex = cart.findIndex(i => {
          const sameProduct = (i.id === productId || i.product_id === productId);
          const sameSize = (!options.size && !i.size) || (options.size === i.size);
          return sameProduct && sameSize;
        });

        if (existingIndex !== -1) {
          const existing = cart[existingIndex];
          // Check stock before increasing quantity
          if (existing.stock_quantity !== undefined) {
            const newQty = existing.quantity + quantity;
            if (newQty > existing.stock_quantity) {
              if (window.notifications) {
                window.notifications.warning('Stock Insuficiente', `Solo puedes agregar ${existing.stock_quantity - existing.quantity} unidades más`);
              }
              return false;
            }
          }
          existing.quantity += quantity;
        } else {
          const product = window.currentProduct || { 
            id: productId, 
            name: 'Producto ' + productId, 
            price: 0, 
            image_url: 'assets/images/products/placeholder.jpg', 
            brand: 'Marca',
            stock_quantity: undefined
          };

          cart.push({
            id: productId,
            product_id: productId,
            name: product.name,
            price: parseFloat(product.discount_price || product.price || 0),
            quantity: quantity,
            image_url: product.image_url,
            brand: product.brand,
            size: options.size || null,
            stock_quantity: product.stock_quantity
          });
        }

        localStorage.setItem('brutalist_cart', JSON.stringify(cart));
      }

      // Update cart display if on cart page
      const cartContainer = document.getElementById('cartContainer');
      if (cartContainer) {
        await this.loadCart();
      }
      
      this.updateCartCounter();

      if (window.notifications) {
        const sizeText = options.size ? ` (Talla US ${options.size})` : '';
        window.notifications.success('Agregado al Carrito', `El producto se agregó correctamente${sizeText}`);
      }

      // Open drawer if available
      if (window.CartDrawer) window.CartDrawer.open();

      return true;
    } catch (e) {
      if (window.Logger) window.Logger.error('Error adding to cart:', e);
      if (window.notifications) {
        const errorMsg = e.response?.data?.message || e.message || 'No se pudo agregar el producto. Por favor, intenta de nuevo.';
        window.notifications.error('Error', errorMsg);
      }
      return false;
    }
  }

  async applyCoupon() {
    const input = document.getElementById('couponCodeInput');
    if (!input) return;
    
    const code = input.value.trim().toUpperCase();
    if (!code) {
      if (window.notifications) {
        window.notifications.warning('Cupón Inválido', 'Por favor ingresa un código de cupón');
      }
      return;
    }

    try {
      // Get current cart total
      const container = document.getElementById('cartContainer');
      const items = container ? Array.from(container.querySelectorAll('.cart-item')).map(item => {
        const productId = item.dataset.productId || null;
        const quantity = parseInt(item.querySelector('.quantity-input')?.value || 1);
        return { product_id: productId, quantity };
      }) : [];

      const response = await this.api.validateCoupon(code, this.getCurrentSubtotal(), items);
      
      if (response && response.success) {
        // Initialize coupons manager if not already
        if (!window.couponsManager) {
          if (window.CouponsManager) {
            window.couponsManager = new window.CouponsManager();
          } else {
            if (window.Logger) window.Logger.warn('CouponsManager not available');
            return;
          }
        }

        // Apply coupon
        window.couponsManager.appliedCoupon = response.data.coupon;
        window.couponsManager.discount = response.data.discount || 0;
        
        // Reload cart to show discount
        await this.loadCart();
        
        if (window.notifications) {
          window.notifications.success('Cupón Aplicado', `Descuento de S/ ${window.couponsManager.discount.toFixed(2)} aplicado`);
        }
      } else {
        if (window.notifications) {
          window.notifications.error('Cupón Inválido', response?.message || 'El código de cupón no es válido');
        }
      }
    } catch (e) {
      if (window.Logger) window.Logger.error('Error applying coupon:', e);
      if (window.notifications) {
        window.notifications.error('Error', 'No se pudo aplicar el cupón. Por favor, intenta de nuevo.');
      }
    }
  }

  async removeCoupon() {
    if (window.couponsManager) {
      window.couponsManager.appliedCoupon = null;
      window.couponsManager.discount = 0;
      await this.loadCart();
      if (window.notifications) {
        window.notifications.info('Cupón Removido', 'El cupón ha sido removido del carrito');
      }
    }
  }

  getCurrentSubtotal() {
    const container = document.getElementById('cartContainer');
    if (!container) return 0;
    
    const items = container.querySelectorAll('.cart-item');
    let subtotal = 0;
    
    items.forEach(item => {
      const priceText = item.querySelector('.price-new')?.textContent || 
                       item.querySelector('.cart-price span')?.textContent || '0';
      const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;
      const quantity = parseInt(item.querySelector('.quantity-input')?.value || 1);
      subtotal += price * quantity;
    });
    
    return subtotal;
  }

  updateCartCounter() {
    // Update cart counter in header
    document.dispatchEvent(new CustomEvent('cartUpdated'));
    if (window.Components && window.Components.updateCartCount) {
      window.Components.updateCartCount();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.cartEngine = new CartEngine();
  // Alias for backward compatibility with Components.js
  window.cartManager = window.cartEngine;
});
