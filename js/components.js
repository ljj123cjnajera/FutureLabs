// 🧩 Componentes Reutilizables
// Versión: 2.1 - Includes Global Auth Guard
window.handleAuthRedirect = function (event, destination) {
  if (event) event.preventDefault();
  const token = localStorage.getItem('auth_token');
  if (token) {
    window.location.href = destination;
  } else {
    console.log('🔒 Guest user detected, redirecting to login...');
    window.location.href = `login.html?returnUrl=${encodeURIComponent(destination)}`;
  }
};

class Components {
  static updateCartCount() {
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
      document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        // Optional: Hide badge if 0
        if (count === 0 && el.classList.contains('action-badge')) {
          // el.style.display = 'none'; // Maybe? User might prefer seeing '0'
        } else {
          el.style.display = 'flex';
        }
      });
    } catch (e) {
      console.warn('Components: Could not update cart count', e);
    }
  }

  static getFooter() {
    return `
      <!-- Footer (Brutalist) -->
      <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <!-- Brand / Bio -->
                <div class="footer-col footer-brand">
                    <div class="footer-logo">SNEAKERS SHOP</div>
                    <p class="footer-bio">
                        The ultimate destination for hype. Curating the best sneakers from Nike, Jordan, Yeezy and more. 
                        <br><br>
                        EST. 2024 — WORLDWIDE
                    </p>
                    <div class="social-links">
                        <a href="#"><i class="fab fa-instagram"></i></a>
                        <a href="#"><i class="fab fa-tiktok"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                        <a href="#"><i class="fab fa-youtube"></i></a>
                    </div>
                </div>

                <!-- Links 1 -->
                <div class="footer-col">
                    <h3>SHOP</h3>
                    <ul>
                        <li><a href="products.html?filter=new">New Arrivals</a></li>
                        <li><a href="products.html?filter=best">Best Sellers</a></li>
                        <li><a href="products.html?filter=upcoming">Upcoming Drops</a></li>
                        <li><a href="products.html?cat=sale">Archived Sale</a></li>
                    </ul>
                </div>

                <!-- Links 2 -->
                <div class="footer-col">
                    <h3>SUPPORT</h3>
                    <ul>
                        <li><a href="orders.html">Track Order</a></li>
                        <li><a href="faq.html">FAQs</a></li>
                        <li><a href="returns.html">Returns & Exchange</a></li>
                        <li><a href="contact.html">Contact Us</a></li>
                    </ul>
                </div>

                <!-- Newsletter -->
                <div class="footer-col footer-newsletter">
                    <h3>STAY IN THE KNOW</h3>
                    <p class="newsletter-desc">Subscribe for exclusive access to drops and events.</p>
                    <div class="input-group">
                        <input type="email" placeholder="ENTER YOUR EMAIL">
                        <button>→</button>
                    </div>
                    <div class="payment-methods">
                        <span class="payment-method">VISA</span>
                        <span class="payment-method">MC</span>
                        <span class="payment-method">AMEX</span>
                        <span class="payment-method">YAPE</span>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} SNEAKERS SHOP. ALL RIGHTS RESERVED.</p>
                <div class="footer-meta">
                    <a href="privacy.html">PRIVACY</a>
                    <a href="terms.html">TERMS</a>
                    <a href="sitemap.html">SITEMAP</a>
                </div>
            </div>
        </div>
      </footer>
      </footer>
    `;
  }

  static loadHeader(showSearch = true, showNav = true) {
    const headerElement = document.getElementById('mainHeader');
    if (headerElement) {
      headerElement.innerHTML = this.getHeader(showSearch, showNav);
      this.initLoyaltyBadge();
      this.updateCartCount();
    } else {
      console.warn('Components.loadHeader: #mainHeader element not found');
    }
  }

  static getHeader(showSearch = true, showNav = true) {
    // 1. ANNOUNCEMENT BAR TICKER
    const announcementBar = `
        <div class="announcement-bar">
            <div class="announcement-content" id="announcementText">
                FREE SHIPPING ON ORDERS OVER $150 ✈️
            </div>
        </div>
    `;

    // 2. MEGA MENU DATA (Ideally this comes from a config, simplistic here for MVP)
    const megaMenuHTML = `
        <div class="mega-menu-dropdown">
            <div class="mega-menu-container">
                <div class="mega-column">
                    <h4>Collections</h4>
                    <ul>
                        <li><a href="products.html?filter=new-arrivals">New Arrivals 🔥</a></li>
                        <li><a href="products.html?filter=best-sellers">Best Sellers</a></li>
                        <li><a href="products.html?collection=limited">Limited Editions</a></li>
                        <li><a href="products.html?collection=essentials">Essentials</a></li>
                    </ul>
                </div>
                <div class="mega-column">
                    <h4>Brands</h4>
                    <ul>
                        <li><a href="products.html?category=jordan">Air Jordan</a></li>
                        <li><a href="products.html?category=yeezy">Yeezy</a></li>
                        <li><a href="products.html?category=nike">Nike</a></li>
                        <li><a href="products.html?category=adidas">Adidas</a></li>
                    </ul>
                </div>
                <div class="mega-column">
                    <h4>Categories</h4>
                    <ul>
                        <li><a href="products.html?type=high-top">High Tops</a></li>
                        <li><a href="products.html?type=low-top">Low Tops</a></li>
                        <li><a href="products.html?type=running">Running</a></li>
                        <li><a href="products.html?type=slides">Slides</a></li>
                    </ul>
                </div>
                <div class="mega-column">
                    <div class="mega-promo">
                        <img src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=600" alt="Promo">
                        <div class="promo-content">
                            <h5>JUST DROPPED</h5>
                            <a href="products.html?filter=new" class="promo-btn">SHOP NOW</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return `
      <header class="header-v3">
        ${announcementBar}
        
        <div class="header-main-row">
            <div class="container" style="display: flex; justify-content: space-between; align-items: center; padding: 0;">
                <!-- LOGO -->
                <!-- LOGO (TEXT ONLY - BRUTALIST V3) -->
                <a href="index.html" class="header-logo" style="text-decoration: none; display: block;">
                    <span style="font-family: 'Poppins', sans-serif; font-weight: 900; font-size: 1.8rem; letter-spacing: -1px; line-height: 1; color: var(--black); text-transform: uppercase;">
                        SNEAKERS<span style="color: var(--accent);">SHOP</span>
                    </span>
                </a>

                <!-- SEARCH (Desktop) -->
                ${showSearch ? `
                <div class="header-search desktop-only">
                    <div class="search-input-wrapper" onclick="window.SearchOverlay.open()">
                        <input type="text" placeholder="SEARCH DROPS..." readonly style="cursor: pointer;">
                        <button class="search-icon-btn"><i class="fas fa-search"></i></button>
                    </div>
                </div>
                ` : ''}

                <!-- ACTIONS -->
                <div class="header-actions">
                    <a href="#" onclick="window.handleAuthRedirect(event, 'profile.html?tab=loyalty')" class="action-btn" id="headerLoyaltyBadge" style="display: none; border: 1px solid var(--black); background: var(--black); color: var(--white);">
                        <i class="fas fa-medal"></i>
                        <span class="desktop-only" id="headerLoyaltyPoints">0 PTS</span>
                    </a>
                    <a href="#" onclick="window.handleAuthRedirect(event, 'profile.html')" class="action-btn">
                        <i class="far fa-user"></i>
                        <span class="desktop-only">ACCOUNT</span>
                    </a>
                    <button class="action-btn" onclick="window.location.href='wishlist.html'">
                        <i class="far fa-heart"></i>
                        <span class="action-badge" id="wishlistCount" style="display: none;">0</span>
                        <span class="desktop-only">WISHLIST</span>
                    </button>
                    <button class="action-btn" onclick="window.CartDrawer ? window.CartDrawer.open() : window.location.href='cart.html'">
                        <i class="fas fa-shopping-bag"></i>
                        <span class="action-badge cart-count">0</span>
                        <span class="desktop-only">CART</span>
                    </button>
                    <button class="header-mobile-toggle mobile-only" onclick="document.getElementById('mobileMenu').classList.add('active')">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- NAVIGATION -->
        ${showNav ? `
        <nav class="header-nav desktop-only">
            <div class="container" style="padding: 0;">
                <ul class="nav-list">
                    <li class="nav-item">
                        <a href="products.html?filter=new" class="nav-link">NEW ARRIVALS</a>
                        ${megaMenuHTML}
                    </li>
                    <li class="nav-item"><a href="products.html?category=jordan" class="nav-link">JORDAN</a></li>
                    <li class="nav-item"><a href="products.html?category=yeezy" class="nav-link">YEEZY</a></li>
                    <li class="nav-item"><a href="products.html?category=nike" class="nav-link">NIKE</a></li>
                    <li class="nav-item"><a href="products.html?filter=sale" class="nav-link" style="color: var(--accent);">SALE</a></li>
                </ul>
            </nav>
            ` : ''}
            
        <!-- CART DRAWER (New Phase 81 Feature) -->
        <div id="cartDrawerOverlay" class="cart-drawer-overlay" onclick="window.CartDrawer.close()"></div>
        <div id="cartDrawer" class="cart-drawer">
            <div class="cart-drawer-header">
                <h3>YOUR CART (<span class="cart-count">0</span>)</h3>
                <button class="close-drawer-btn" onclick="window.CartDrawer.close()">×</button>
            </div>
            <div class="cart-drawer-items" id="cartDrawerItems">
                <!-- Items injected here -->
                <div class="empty-cart-message">
                    <p>YOUR CART IS EMPTY</p>
                    <button class="btn btn-black" onclick="window.CartDrawer.close()">START SHOPPING</button>
                </div>
            </div>
            <div class="cart-drawer-footer">
                <div class="cart-total-row">
                    <span>TOTAL</span>
                    <span id="cartDrawerTotal">$0.00</span>
                </div>
                <button class="btn btn-black btn-block" onclick="window.location.href='checkout.html'">CHECKOUT</button>
                <button class="btn btn-outline btn-block" onclick="window.location.href='cart.html'">VIEW CART</button>
            </div>
        </div>

        <!-- SEARCH OVERLAY (New Phase 81 Feature) -->
        <div id="searchOverlay" class="search-overlay">
            <button class="search-close-btn" onclick="window.SearchOverlay.close()">×</button>
            <div class="search-container-large search-bar">
                <input type="text" id="largeSearchInput" class="search-input-large" placeholder="WHAT ARE YOU LOOKING FOR?" autocomplete="off">
                <div class="search-suggestions">
                    <span class="search-tag" onclick="window.SearchOverlay.search('Jordan')">JORDAN</span>
                    <span class="search-tag" onclick="window.SearchOverlay.search('Yeezy')">YEEZY</span>
                    <span class="search-tag" onclick="window.SearchOverlay.search('Dunk')">DUNK</span>
                    <span class="search-tag" onclick="window.SearchOverlay.search('Travis Scott')">TRAVIS SCOTT</span>
                </div>
            </div>
        </div>

        <!-- MOBILE MENU OVERLAY (Improved V3) -->
        <div class="mobile-menu-overlay" id="mobileMenuOverlay" onclick="window.MobileMenu.toggle()"></div>
        <div class="mobile-menu-sidebar" id="mobileMenu">
            <div class="mobile-menu-header">
                <h3>MENU</h3>
                <button class="close-menu-btn" onclick="document.getElementById('mobileMenu').classList.remove('active')">×</button>
            </div>
            <div class="mobile-menu-content">
                <div class="mobile-search" onclick="window.SearchOverlay.open()">
                    <input type="text" placeholder="SEARCH SNEAKERS..." readonly>
                    <button><i class="fas fa-search"></i></button>
                </div>
                <ul class="mobile-nav-list">
                    <li><a href="products.html?filter=new">🔥 NEW ARRIVALS</a></li>
                    <li><a href="products.html?category=jordan">JORDAN</a></li>
                    <li><a href="products.html?category=yeezy">YEEZY</a></li>
                    <li><a href="products.html?category=nike">NIKE</a></li>
                    <li><a href="products.html?category=adidas">ADIDAS</a></li>
                    <li><a href="products.html?filter=sale" style="color: var(--error);">SALE ARCHIVE</a></li>
                </ul>
                <div class="mobile-auth-links">
                    <a href="login.html">LOGIN</a>
                    <a href="register.html">JOIN</a>
                </div>
            </div>
        </div>
      </header>
    `;
  }

  // Inject Cart Logic
  static initCartDrawer() {
    window.CartDrawer = {
      open: () => {
        document.getElementById('cartDrawer').classList.add('active');
        document.getElementById('cartDrawerOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
      },
      close: () => {
        document.getElementById('cartDrawer').classList.remove('active');
        document.getElementById('cartDrawerOverlay').classList.remove('active');
        document.body.style.overflow = '';
      }
    };
  }

  static initSearchOverlay() {
    window.SearchOverlay = {
      open: () => {
        const overlay = document.getElementById('searchOverlay');
        const input = document.getElementById('largeSearchInput');
        if (overlay) {
          overlay.classList.add('active');
          document.body.style.overflow = 'hidden';
          if (input) setTimeout(() => input.focus(), 300);
        }
      },
      close: () => {
        document.getElementById('searchOverlay').classList.remove('active');
        document.body.style.overflow = '';
      },
      search: (term) => {
        window.location.href = `products.html?search=${encodeURIComponent(term)}`;
      }
    };

    // Bind Enter Key
    const input = document.getElementById('largeSearchInput');
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          window.SearchOverlay.search(input.value);
        }
      });
    }
  }

  static initHeader() {
    console.log('🔵 [COMPONENTS] initHeader() executed');

    // Ticker Animation Logic
    const messages = [
      "FREE SHIPPING ON ORDERS OVER $150 ✈️",
      "NEW JORDAN DROP THIS FRIDAY 🔥",
      "JOIN THE CLUB & GET 10% OFF 👟"
    ];
    let msgIndex = 0;
    const ticker = document.getElementById('announcementText');
    if (ticker) {
      setInterval(() => {
        msgIndex = (msgIndex + 1) % messages.length;
        ticker.style.opacity = 0;
        setTimeout(() => {
          ticker.innerText = messages[msgIndex];
          ticker.style.opacity = 1;
        }, 500);
      }, 4000);
    }

    this.ensureWishlistAssets();
    this.ensureVerificationAssets();
    this.updateCartCount();

    // Check admin status
    setTimeout(async () => {
      await this.checkAndShowAdminButton();
      this.initLoyaltyBadge();
    }, 1000);
  }

  static async showAdminButton() {
    // Verificar si el botón ya existe
    if (document.getElementById('adminButton')) {
      return;
    }

    const userActions = document.querySelector('.header-actions'); // Updated selector for V3
    if (!userActions) return;

    // Crear botón de admin
    const adminButton = document.createElement('a');
    adminButton.href = 'admin.html';
    adminButton.className = 'action-btn';
    adminButton.id = 'adminButton';
    adminButton.innerHTML = '<i class="fas fa-cog"></i> <span>Admin</span>';
    adminButton.style.cssText = 'color: var(--accent); font-weight: 800;';

    // Insertar antes del botón de cuenta
    const accountLink = document.getElementById('accountLink');
    if (accountLink && accountLink.parentNode) {
      userActions.insertBefore(adminButton, accountLink);
    }
  }

  static hideAdminButton() {
    const adminButton = document.getElementById('adminButton');
    if (adminButton) {
      adminButton.remove();
    }
  }

  static async checkAndShowAdminButton() {
    try {
      if (window.authManager && window.authManager.isAuthenticated()) {
        const user = await window.authManager.getCurrentUser();
        if (user && (user.role === 'admin' || user.role === 'moderator')) {
          this.showAdminButton();
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  }

  static initSearch() {
    this.ensureAutocompleteAssets();
  }

  static ensureWishlistAssets() {
    if (typeof document === 'undefined') return;

    const syncIfReady = () => {
      if (window.wishlistManager && typeof window.wishlistManager.syncToggleButtons === 'function') {
        window.wishlistManager.syncToggleButtons(document);
      }
    };

    // 1. Check if logic is already loaded
    if (window.wishlistManager) {
      syncIfReady();
      return;
    }

    // 2. CRITICAL GATE: Only load if there are actual buttons needing it
    // or if we are explicitly on the wishlist page
    const hasWishlistButtons = document.querySelector('.action-btn[onclick*="wishlist"], .product-quick-action[onclick*="wishlist"]');
    const isWishlistPage = window.location.pathname.includes('wishlist.html');

    if (!hasWishlistButtons && !isWishlistPage && !document.getElementById('wishlistGrid')) {
      // No need to inject script on a page with no wishlist interactions
      return;
    }

    if (document.querySelector('script[data-wishlist-script]')) {
      document.querySelector('script[data-wishlist-script]').addEventListener('load', () => syncIfReady(), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'js/wishlist.js';
    script.defer = true;
    script.setAttribute('data-wishlist-script', 'true');
    script.onload = () => syncIfReady();
    document.body.appendChild(script);
  }

  static ensureVerificationAssets() {
    if (typeof document === 'undefined') return;

    // GATE: Only load on auth pages or if explicit container exists
    const verificationContainer = document.getElementById('verificationModal');
    const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html');

    if (!verificationContainer && !isAuthPage) {
      return;
    }

    if (window.verificationManager) {
      return;
    }

    if (document.querySelector('script[data-verification-script]')) {
      document
        .querySelector('script[data-verification-script]')
        .addEventListener('load', () => {
          console.log('🔵 [COMPONENTS] verification assets loaded (existing)');
        }, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'js/verification.js';
    script.defer = true;
    script.setAttribute('data-verification-script', 'true');
    document.body.appendChild(script);
  }

  static ensureAutocompleteAssets() {
    if (typeof document === 'undefined') return;

    if (!document.querySelector('link[data-autocomplete-style]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'css/autocomplete.css?v=1.0';
      link.setAttribute('data-autocomplete-style', 'true');
      document.head.appendChild(link);
    }

    const initialize = () => {
      if (window.searchAutocomplete && typeof window.searchAutocomplete.init === 'function') {
        window.searchAutocomplete.init();
      } else if (typeof window.initializeAutocomplete === 'function') {
        window.initializeAutocomplete();
      }
      // Additional initializations as per user's instruction
      if (window.Components.initSearch) window.Components.initSearch();
      if (window.Components.initSearchOverlay) window.Components.initSearchOverlay();
      if (window.Components.initCartCounter) window.Components.initCartCounter();
    };

    if (window.searchAutocomplete || typeof window.initializeAutocomplete === 'function') {
      initialize();
      return;
    }

    if (!document.querySelector('script[data-autocomplete-script]')) {
      const script = document.createElement('script');
      script.src = 'js/autocomplete.js';
      script.defer = true;
      script.setAttribute('data-autocomplete-script', 'true');
      script.onload = () => initialize();
      document.body.appendChild(script);
    }
  }

  static initCartCounter() {
    // Actualizar contador de carrito
    document.addEventListener('cartUpdated', (e) => {
      const cartCount = document.querySelector('.cart-count');
      if (cartCount) {
        cartCount.textContent = e.detail.count;
      }
    });
  }

  static getProductCard(product) {
    const discount = product.discount_price ?
      Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;

    // Mock sizes logic (preserved from Home for consistency, ideally should come from API)
    // Tallas Disponibles might be a string or array in 'specifications'
    let sizeText = 'US 7 • 8 • 9 • 10 • 11';
    try {
      let specs = product.specifications;
      if (typeof specs === 'string') specs = JSON.parse(specs);
      if (specs && specs['Tallas Disponibles']) {
        const sizes = Array.isArray(specs['Tallas Disponibles'])
          ? specs['Tallas Disponibles']
          : specs['Tallas Disponibles'].split(',');
        sizeText = sizes.slice(0, 5).join(' • ');
      }
    } catch (e) { }


    return `
      <div class="product-card" onclick="window.location.href='product-detail.html?id=${product.id}'">
        <div class="product-image-container">
          <img src="${product.image_url || 'assets/images/products/placeholder.jpg'}" 
               class="product-image"
               alt="${product.name}" 
               loading="lazy"
               onerror="this.src='assets/images/products/placeholder.jpg'">
          
          <div class="product-badges">
            ${discount > 0 ? `<span class="product-badge product-badge-sale">-${discount}%</span>` : ''}
            ${product.is_new ? `<span class="product-badge product-badge-new">NUEVO</span>` : ''}
          </div>

          <div class="product-quick-actions">
            <button class="product-quick-action" onclick="event.stopPropagation(); window.wishlistManager?.toggle('${product.id}')" title="Agregar a favoritos">
              <i class="far fa-heart"></i>
            </button>
            <button class="product-quick-action" onclick="event.stopPropagation(); window.openQuickView?.('${product.id}') || window.quickView?.show('${product.id}')" title="Vista Rápida">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>

        <div class="product-content">
          <span class="product-category">${product.brand || 'Sneakers'}</span>
          <h3 class="product-title">${product.name}</h3>
          
          <div class="product-price-container">
            <div class="product-price">
              ${product.discount_price ? `
                <span class="product-price-new">S/ ${parseFloat(product.discount_price).toFixed(2)}</span>
                <span class="product-price-old">S/ ${parseFloat(product.price).toFixed(2)}</span>
              ` : `
                <span class="product-price-current">S/ ${parseFloat(product.price).toFixed(2)}</span>
              `}
            </div>
            <button class="btn-quick-add" onclick="event.preventDefault(); event.stopPropagation(); window.cartManager?.add(${product.id ? `'${product.id}'` : 'null'}, 1); window.notifications?.success('AÑADIDO', '${product.name.replace(/'/g, "\\'")} al carrito');">
                <i class="fas fa-plus"></i>
            </button>
          </div>

          <div class="product-size-preview">${sizeText}</div>

          <button class="product-btn" onclick="event.stopPropagation(); window.cartManager?.add('${product.id}', 1)">
            AGREGAR AL CARRITO
          </button>
        </div>
      </div>
      `;
  }

  static async initLoyaltyBadge() {
    const badge = document.getElementById('headerLoyaltyBadge');
    const pointsSpan = document.getElementById('headerLoyaltyPoints');

    if (!badge || !window.authManager || !window.authManager.isAuthenticated()) return;

    try {
      const res = await window.api.getLoyaltyPoints();
      const points = res.data?.points || 0;

      if (points > 0) {
        badge.style.display = 'flex';
        if (pointsSpan) pointsSpan.textContent = `${points} PTS`;
      }
    } catch (e) {
      console.warn('Loyalty Badge Error:', e);
    }
  }
}

// Función de búsqueda global
function performSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  const query = searchInput.value.trim();
  if (!query) return;

  if (window.searchAutocomplete && typeof window.searchAutocomplete.executeSearch === 'function') {
    window.searchAutocomplete.executeSearch(query);
  } else if (typeof window.initializeAutocomplete === 'function') {
    window.initializeAutocomplete();
    if (window.searchAutocomplete && typeof window.searchAutocomplete.executeSearch === 'function') {
      window.searchAutocomplete.executeSearch(query);
    } else {
      window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    }
  } else {
    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
  }
}

// Función de búsqueda con query específica
function performSearchWithQuery(query) {
  if (!query) return;

  if (window.searchAutocomplete && typeof window.searchAutocomplete.executeSearch === 'function') {
    window.searchAutocomplete.executeSearch(query);
  } else if (typeof window.initializeAutocomplete === 'function') {
    window.initializeAutocomplete();
    if (window.searchAutocomplete && typeof window.searchAutocomplete.executeSearch === 'function') {
      window.searchAutocomplete.executeSearch(query);
    } else {
      window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    }
  } else {
    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
  }
}

// Hacer disponible globalmente
window.Components = Components;

// Mobile Menu Logic (V3)
window.MobileMenu = {
  toggle: function () {
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileMenuOverlay');

    if (menu && overlay) {
      menu.classList.toggle('active');
      overlay.classList.toggle('active');

      // Prevent body scroll
      if (menu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    } else {
      console.error('Mobile Menu element not found');
    }
  }
};
