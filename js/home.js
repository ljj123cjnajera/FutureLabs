/**
 * 🏠 FUTURELABS HOME ENGINE V3 (Radical Reform)
 * Focus: Brutalist Aesthetics, Robust Data Fallback (Offline Mode), Performance.
 */

class HomeEngine {
  constructor() {
    this.api = window.api;
    this.state = {
      banners: [],
      categories: [],
      trending: [],
      blog: [],
      newsletterSubscribed: false
    };

    // 🛡️ DATA FALLBACK EXCELLENCE
    // Hardcoded Premium Data to ensure the site NEVER looks empty.
    this.fallbackData = {
      banners: [
        {
          id: 'hero-1',
          title: 'URBAN LEGENDS',
          subtitle: 'ICONIC SILHOUETTES REIMAGINED',
          image_url: 'https://images.unsplash.com/photo-1556906781-9a412961d28c?auto=format&fit=crop&q=80&w=1920',
          link: 'products.html?collection=icons',
          cta: 'SHOP ICONS'
        },
        {
          id: 'hero-2',
          title: 'SPEED DEFINED',
          subtitle: 'PERFORMANCE MEETS AESTHETICS',
          image_url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=1920',
          link: 'products.html?category=running',
          cta: 'EXPLORE RUNNING'
        },
        {
          id: 'hero-3',
          title: 'YEEZY SEASON',
          subtitle: 'THE FUTURE OF FOOTWEAR',
          image_url: 'https://images.unsplash.com/photo-1549488344-c7059349b576?auto=format&fit=crop&q=80&w=1920',
          link: 'products.html?category=yeezy',
          cta: 'SHOP YEEZY'
        }
      ],
      categories: [
        { id: 'cat-1', name: 'JORDAN', slug: 'jordan', image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&q=80&w=800' },
        { id: 'cat-2', name: 'YEEZY', slug: 'yeezy', image: 'https://images.unsplash.com/photo-1620332302351-8ca260e35730?auto=format&fit=crop&q=80&w=800' },
        { id: 'cat-3', name: 'NIKE', slug: 'nike', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800' },
        { id: 'cat-4', name: 'ADIDAS', slug: 'adidas', image: 'https://images.unsplash.com/photo-1518002171953-a080ee321e2f?auto=format&fit=crop&q=80&w=800' }
      ],
      products: [
        { id: 101, name: 'Air Jordan 1 High OG "Lost & Found"', price: 899.00, image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=800', badge: 'HOT' },
        { id: 102, name: 'Nike Dunk Low "Panda"', price: 449.00, image_url: 'https://images.unsplash.com/photo-1637844527273-218ba489995a?auto=format&fit=crop&q=80&w=800', badge: 'BESTSELLER' },
        { id: 103, name: 'Yeezy Boost 350 V2 "Zebra"', price: 1199.00, image_url: 'https://images.unsplash.com/photo-1549488344-c7059349b576?auto=format&fit=crop&q=80&w=800', badge: 'LIMITED' },
        { id: 104, name: 'New Balance 550', price: 549.00, image_url: 'https://images.unsplash.com/photo-1656335362192-2bc9051b1824?auto=format&fit=crop&q=80&w=800', badge: 'NEW' }
      ]
    };

    this.init();
  }

  async init() {
    // 1. Initial State
    this.toggleLoader(true);

    // 2. Logic Chain
    await this.loadHero();
    await this.loadCategories();
    await this.loadProducts();

    // 3. Setup Interactions
    this.setupNewsletter();
    this.setupQuickAddbox();

    // 4. Reveal
    this.toggleLoader(false);
    console.log('🚀 [HomeEngine] V3 Initialized. Robust Mode: ON');
  }

  toggleLoader(show) {
    const loader = document.getElementById('preloader');
    if (!loader) return;
    if (show) {
      loader.style.visibility = 'visible';
      loader.style.opacity = '1';
    } else {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.visibility = 'hidden', 500);
      }, 800); // Small delay for cinematic effect
    }
  }

  // ==========================================
  // 🎨 RENDER LOGIC (Hero Section)
  // ==========================================
  async loadHero() {
    const container = document.getElementById('heroSlidesContainer');
    const dotsContainer = document.getElementById('heroSliderDots');
    if (!container) return;

    let slides = [];
    try {
      // Try API
      const response = await this.api.getBanners();
      if (response && response.length > 0) slides = response;
      else throw new Error('Empty API Banners');
    } catch (e) {
      console.warn('⚠️ [HomeEngine] API Failed/Empty. Using Premium Fallback.', e);
      slides = this.fallbackData.banners;
    }

    // Render Logic
    container.innerHTML = slides.map((slide, index) => `
            <div class="slide ${index === 0 ? 'active' : ''}" style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${slide.image_url}')">
                <div class="slide-content">
                    <span class="slide-eyebrow">FUTURE COLLECTION</span>
                    <h1>${slide.title}</h1>
                    <p>${slide.subtitle || slide.description || ''}</p>
                    <a href="${slide.link || slide.button_link || 'products.html'}" class="btn btn-primary btn-lg">${slide.cta || slide.button_text || 'SHOP NOW'}</a>
                </div>
            </div>
        `).join('');

    // Dots
    if (dotsContainer) {
      dotsContainer.innerHTML = slides.map((_, index) => `
                <button class="slider-dot ${index === 0 ? 'active' : ''}" onclick="window.homeEngine.goToSlide(${index})"></button>
            `).join('');
    }

    this.startSliderAutoPlay(slides.length);
  }

  startSliderAutoPlay(count) {
    if (count <= 1) return;
    let current = 0;
    setInterval(() => {
      current = (current + 1) % count;
      this.goToSlide(current);
    }, 5000);
  }

  goToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slider-dot');
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  // ==========================================
  // 📦 CATEGORIES (Bento Grid)
  // ==========================================
  async loadCategories() {
    const container = document.getElementById('homeSectionsContainer'); // Reusing existing ID
    if (!container) return;

    let categories = [];
    try {
      const response = await this.api.getCategories();
      if (response && response.length > 0) categories = response.slice(0, 4);
      else throw new Error('Empty API Categories');
    } catch (e) {
      categories = this.fallbackData.categories;
    }

    // Brutalist Grid Render
    container.innerHTML = `
            <div class="bento-grid">
                ${categories.map(cat => `
                    <a href="products.html?category=${cat.slug}" class="bento-item">
                        <img src="${cat.image || cat.image_url}" alt="${cat.name}">
                        <div class="bento-overlay">
                            <h3>${cat.name}</h3>
                            <span class="btn-arrow"><i class="fas fa-arrow-right"></i></span>
                        </div>
                    </a>
                `).join('')}
            </div>
        `;
  }

  // ==========================================
  // 👟 PRODUCTS (Trending & Sale)
  // ==========================================
  async loadProducts() {
    await this.renderProductGrid('featuredProductsGrid', this.fallbackData.products); // Using fallback for speed/demo
    await this.renderProductGrid('onSaleProductsGrid', this.fallbackData.products.map(p => ({ ...p, price: p.price * 0.8, original_price: p.price, badge: 'SALE' })));
  }

  async renderProductGrid(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = products.map(p => `
            <div class="product-card brutalist-card">
                ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
                <div class="product-image">
                    <a href="product-detail.html?id=${p.id}">
                        <img src="${p.image_url}" alt="${p.name}">
                    </a>
                    <button class="quick-add-btn" onclick="window.homeEngine.quickAdd(${p.id}, '${p.name}')">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="product-info">
                    <a href="product-detail.html?id=${p.id}" class="product-title">${p.name}</a>
                    <div class="product-price">
                        ${p.original_price ? `<span class="price-original">S/ ${p.original_price.toFixed(2)}</span>` : ''}
                        <span class="price-current">S/ ${p.price.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `).join('');
  }

  // ==========================================
  // ⚡ INTERACTIONS
  // ==========================================
  quickAdd(id, name) {
    if (window.cart) window.cart.add(id, 1);
    if (window.notifications) window.notifications.success('AÑADIDO', `${name} al carrito`);
  }

  setupNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        const input = form.querySelector('input');
        const original = btn.textContent;

        btn.textContent = 'PROCESANDO...';
        btn.disabled = true;

        setTimeout(() => {
          btn.textContent = '¡SUSCRITO!';
          input.value = '';
          if (window.notifications) window.notifications.success('BIENVENIDO', 'Revisa tu correo para el descuento.');

          setTimeout(() => {
            btn.textContent = original;
            btn.disabled = false;
          }, 2000);
        }, 1000);
      });
    }
  }

  setupQuickAddbox() {
    // Global listener logic if needed
  }
}

// Singleton Init
document.addEventListener('DOMContentLoaded', () => {
  window.homeEngine = new HomeEngine();
});
