// 🧩 Componentes Reutilizables
// Versión: 2.0 - Sin botón Inicio (eliminado 2024-11-04)
class Components {
  static getFooter() {
    return `
      <!-- Footer (Brutalist) -->
      <footer class="footer">
        <div class="container">
            <div class="footer-grid" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 4rem; padding-bottom: 4rem;">
                <!-- Brand / Bio -->
                <div class="footer-col footer-brand">
                    <div class="footer-logo" style="font-size: 2rem; margin-bottom: 1.5rem;">SNEAKERS SHOP</div>
                    <p class="footer-bio" style="max-width: 300px;">
                        The ultimate destination for hype. Curating the best sneakers from Nike, Jordan, Yeezy and more. 
                        <br><br>
                        EST. 2024 — WORLDWIDE
                    </p>
                    <div class="social-links" style="margin-top: 2rem;">
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
                    <div class="input-group" style="margin-top: 1.5rem;">
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
    `;
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
                <a href="index.html" class="header-logo">
                    <img src="assets/images/logo.png" alt="SNEAKERS SHOP" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                    <span style="font-family: 'Poppins', sans-serif; font-weight: 900; font-size: 1.5rem; letter-spacing: -1px; display: none;">SNEAKERS<span style="color: var(--accent);">SHOP</span></span>
                </a>

                <!-- SEARCH (Desktop) -->
                ${showSearch ? `
                <div class="header-search desktop-only">
                    <div class="search-input-wrapper">
                        <input type="text" placeholder="SEARCH DROPS..." id="globalSearchInput" onkeypress="window.Components.handleSearch(event)">
                        <button class="search-icon-btn"><i class="fas fa-search"></i></button>
                    </div>
                </div>
                ` : ''}

                <!-- ACTIONS -->
                <div class="header-actions">
                    <a href="account.html" class="action-btn">
                        <i class="far fa-user"></i>
                        <span class="desktop-only">ACCOUNT</span>
                    </a>
                    <a href="wishlist.html" class="action-btn">
                        <i class="far fa-heart"></i>
                        <span class="action-badge" id="wishlistCount" style="display: none;">0</span>
                        <span class="desktop-only">WISHLIST</span>
                    </a>
                    <a href="cart.html" class="action-btn">
                        <i class="fas fa-shopping-bag"></i>
                        <span class="action-badge cart-count">0</span>
                        <span class="desktop-only">CART</span>
                    </a>
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
                    <li class="nav-item"><a href="products.html?filter=new" class="nav-link">NEW ARRIVALS</a></li>
                    <li class="nav-item"><a href="products.html?category=jordan" class="nav-link">JORDAN</a></li>
                    <li class="nav-item"><a href="products.html?category=yeezy" class="nav-link">YEEZY</a></li>
                    <li class="nav-item"><a href="products.html?category=nike" class="nav-link">NIKE</a></li>
                    <li class="nav-item"><a href="products.html?filter=sale" class="nav-link" style="color: var(--accent);">SALE</a></li>
                </ul>
            </nav>
            ` : ''}
        </div>

        <!-- MOBILE MENU OVERLAY (Added for V3) -->
        <div class="mobile-menu-overlay" id="mobileMenuOverlay" onclick="window.MobileMenu.toggle()"></div>
        <div class="mobile-menu-sidebar" id="mobileMenu">
            <div class="mobile-menu-header">
                <h3>SNEAKERS SHOP</h3>
                <button class="close-menu-btn" onclick="window.MobileMenu.toggle()">×</button>
            </div>
            <div class="mobile-menu-content">
                <div class="mobile-search">
                    <input type="text" placeholder="SEARCH...">
                    <button>GO</button>
                </div>
                <ul class="mobile-nav-list">
                    <li><a href="products.html">New Arrivals 🔥</a></li>
                    <li><a href="products.html?category=jordan">Jordan</a></li>
                    <li><a href="products.html?category=yeezy">Yeezy</a></li>
                    <li><a href="products.html?category=nike">Nike</a></li>
                    <li><a href="products.html?category=adidas">Adidas</a></li>
                    <li><a href="products.html?filter=sale">Sale</a></li>
                </ul>
                <div class="mobile-auth-links">
                    <a href="login.html">Login</a>
                    <a href="register.html">Register</a>
                </div>
            </div>
        </div>
      </header>
    `;
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

    if (window.wishlistManager) {
      syncIfReady();
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
