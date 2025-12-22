/**
 * 🛒 CART ENGINE V3 (Radical Reform)
 * Focus: Brutalist Aesthetics, LocalStorage Fallback, Secure Checkout flow.
 */

class CartEngine {
  constructor() {
    this.api = window.api;

    // 🛍️ MOCK MOCK MOCK
    // If API fails or user is guest, we show this (unless empty)
    this.mockItems = [
      { id: 101, name: 'Air Jordan 1 High "Lost & Found"', price: 899.00, quantity: 1, image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=800', brand: 'Jordan' },
      { id: 104, name: 'New Balance 550', price: 549.00, quantity: 2, image_url: 'https://images.unsplash.com/photo-1656335362192-2bc9051b1824?auto=format&fit=crop&q=80&w=800', brand: 'New Balance' }
    ];

    this.init();
  }

  async init() {
    console.log('🛒 [CartEngine] V3 Initialized');
    // Restore Global Header/Footer if missing (safety net)
    if (window.Components && !document.getElementById('mainHeader').innerHTML) {
      document.getElementById('mainHeader').innerHTML = window.Components.getHeader(true, true);
      if (window.Components.initHeader) window.Components.initHeader();
    }

    await this.loadCart();
  }

  async loadCart() {
    const container = document.getElementById('cartContainer');
    if (!container) return;

    let items = [];
    try {
      // Check LocalStorage first (for guest persistence demo)
      const localCart = JSON.parse(localStorage.getItem('brutalist_cart') || '[]');

      if (localCart.length > 0) {
        items = localCart;
      } else {
        // Try API (or Mock if auth fails/demo mode)
        // For this V3 Demo, we'll auto-fill with Mock if empty to show the UI
        if (!localStorage.getItem('cart_cleared')) {
          items = this.mockItems;
          localStorage.setItem('brutalist_cart', JSON.stringify(items));
        }
      }
    } catch (e) {
      console.warn('⚠️ [CartEngine] Fallback', e);
    }

    if (items.length === 0) {
      this.renderEmpty(container);
    } else {
      this.render(container, items);
    }
  }

  render(container, items) {
    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    container.innerHTML = `
            <div class="cart-grid-v3">
                <!-- Items List -->
                <div class="cart-items-list">
                    ${items.map(item => `
                        <div class="cart-item">
                            <div class="cart-item-image">
                                <img src="${item.image_url}" alt="${item.name}">
                            </div>
                            
                            <div class="cart-item-details">
                                <div class="cart-item-brand">${item.brand || 'Sneakers'}</div>
                                <h3 class="cart-item-title">${item.name}</h3>
                                <div class="cart-item-options">Size: ${item.size || 'US 9'}</div>
                                
                                <div class="quantity-control">
                                    <button class="quantity-btn" onclick="window.cartEngine.updateQty(${item.id}, ${item.quantity - 1})">-</button>
                                    <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                                    <button class="quantity-btn" onclick="window.cartEngine.updateQty(${item.id}, ${item.quantity + 1})">+</button>
                                </div>
                            </div>

                            <div class="cart-item-price-col">
                                <div class="cart-price">S/ ${(item.price * item.quantity).toFixed(2)}</div>
                                <button class="btn-remove" onclick="window.cartEngine.updateQty(${item.id}, 0)">
                                    REMOVE
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Summary (Sticky) -->
                <div class="order-summary-box">
                    <h2 class="summary-title">Order Summary</h2>
                    
                    <div class="summary-row">
                        <span>SUBTOTAL</span>
                        <span>S/ ${total.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>SHIPPING</span>
                        <span>FREE</span>
                    </div>

                    <div class="summary-total">
                        <span>TOTAL</span>
                        <span>S/ ${total.toFixed(2)}</span>
                    </div>

                    <button class="btn-checkout" onclick="window.location.href='checkout.html'">
                        PROCEED TO CHECKOUT
                    </button>
                    
                    <div style="margin-top: 2rem; text-align: center; font-size: 0.8rem; color: #666;">
                        <i class="fas fa-lock"></i> SECURE CHECKOUT
                    </div>
                </div>
            </div>
        `;
  }

  renderEmpty(container) {
    container.innerHTML = `
            <div class="empty-cart-state">
                <i class="fas fa-shopping-cart" style="font-size: 4rem; margin-bottom: 2rem; color: var(--black);"></i>
                <h2 class="empty-cart-title">YOUR CART IS EMPTY</h2>
                <p style="font-family: 'Inter', sans-serif; margin-bottom: 2rem;">Looks like you haven't found your grails yet.</p>
                <a href="products.html" class="btn-continue-shopping">Start Shopping</a>
            </div>
        `;
  }

  updateQty(id, newQty) {
    let cart = JSON.parse(localStorage.getItem('brutalist_cart') || '[]');
    if (newQty <= 0) {
      cart = cart.filter(i => i.id !== id);
    } else {
      const item = cart.find(i => i.id === id);
      if (item) item.quantity = newQty;
    }

    if (cart.length === 0) localStorage.setItem('cart_cleared', 'true');

    localStorage.setItem('brutalist_cart', JSON.stringify(cart));
    this.loadCart(); // Re-render

    // Trigger Drawer Update Event
    document.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: cart.reduce((a, b) => a + b.quantity, 0) } }));
  }

  // Add Item Method (Missing in V3 Engine)
  async add(id, quantity = 1, options = {}) {
    // 1. Get Current Cart
    let cart = JSON.parse(localStorage.getItem('brutalist_cart') || '[]');

    // 2. Check if item exists
    const existing = cart.find(i => i.id == id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      // Mock Fetch Product Data if not provided (Safety)
      //In real app, we would fetch from API or use the product object passed.
      // For now, assuming we use the global currentProduct or fetch
      const product = window.currentProduct || { id, name: 'Product ' + id, price: 199, image_url: 'assets/images/products/placeholder.jpg', brand: 'Brand' };

      cart.push({
        id: id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: quantity,
        image_url: product.image_url,
        brand: product.brand,
        size: options.size || 'US 9'
      });
    }

    // 3. Save
    localStorage.setItem('brutalist_cart', JSON.stringify(cart));

    // 4. Update UI
    this.loadCart();
    document.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: cart.reduce((a, b) => a + b.quantity, 0) } }));

    // 5. Open Drawer
    if (window.CartDrawer) window.CartDrawer.open();

    return true;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.cartEngine = new CartEngine();
  // Alias for backward compatibility with Components.js
  window.cartManager = window.cartEngine;
});
