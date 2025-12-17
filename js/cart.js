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
            <div class="cart-layout-v3" style="display: grid; grid-template-columns: 1fr 350px; gap: 2rem;">
                <!-- Items List -->
                <div class="cart-items-brutalist">
                    ${items.map(item => `
                        <div class="cart-item-row" style="display: flex; gap: 1rem; border: 2px solid var(--black); padding: 1rem; margin-bottom: 1rem; align-items: center;">
                            <img src="${item.image_url}" style="width: 100px; height: 100px; object-fit: cover; border: 2px solid var(--black);" alt="${item.name}">
                            <div style="flex: 1;">
                                <div style="font-weight: 800; text-transform: uppercase;">${item.brand}</div>
                                <h3 style="margin: 0; font-size: 1.2rem;">${item.name}</h3>
                                <div style="margin-top: 0.5rem; font-weight: 700;">S/ ${item.price.toFixed(2)}</div>
                            </div>
                            <div class="qty-controls" style="display: flex; align-items: center; border: 2px solid var(--black);">
                                <button onclick="window.cartEngine.updateQty(${item.id}, ${item.quantity - 1})" style="width: 32px; height: 32px; background: transparent; border: none; font-weight: 900; cursor: pointer;">-</button>
                                <span style="font-weight: 800; padding: 0 8px;">${item.quantity}</span>
                                <button onclick="window.cartEngine.updateQty(${item.id}, ${item.quantity + 1})" style="width: 32px; height: 32px; background: black; color: white; border: none; font-weight: 900; cursor: pointer;">+</button>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Summary (Sticky) -->
                <div class="cart-summary-brutalist" style="border: 4px solid var(--black); padding: 2rem; height: fit-content;">
                    <h2 style="margin-top: 0; text-transform: uppercase; font-weight: 900; border-bottom: 2px solid var(--black); padding-bottom: 1rem;">Order Summary</h2>
                    
                    <div style="display: flex; justify-content: space-between; margin: 1rem 0; font-weight: 600;">
                        <span>SUBTOTAL</span>
                        <span>S/ ${total.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 1rem 0; font-weight: 600;">
                        <span>SHIPPING</span>
                        <span>FREE</span>
                    </div>

                    <div style="display: flex; justify-content: space-between; margin: 2rem 0; font-size: 1.5rem; font-weight: 900; border-top: 2px solid var(--black); padding-top: 1rem;">
                        <span>TOTAL</span>
                        <span>S/ ${total.toFixed(2)}</span>
                    </div>

                    <button class="btn btn-massive" style="width: 100%; display: block; margin-top: 1rem;" onclick="window.location.href='checkout.html'">
                        CHECKOUT <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
  }

  renderEmpty(container) {
    container.innerHTML = `
            <div style="text-align: center; padding: 4rem; border: 2px solid var(--black);">
                <h2 style="font-size: 3rem; text-transform: uppercase; font-weight: 900;">CART EMPTY</h2>
                <p>YOU NEED SOME HEAT ON YOUR FEET.</p>
                <a href="products.html" class="btn btn-black" style="margin-top: 1rem; display: inline-block;">GO SHOPPING</a>
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
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.cartEngine = new CartEngine();
});
