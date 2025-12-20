/**
 * 🏠 FUTURELABS HOME ENGINE V3.1 (Visual Polish & Feature Expansion)
 * Focus: Brutalist Aesthetics, Brands Slider, Trending Carousel.
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
    this.fallbackData = {
      banners: [
        {
          id: 'hero-1',
          title: 'DEFINING STREETWEAR',
          subtitle: 'PREMIUM SELECTION. EXCLUSIVE DROPS.',
          image_url: 'https://images.unsplash.com/photo-1556906781-9a412961d28c?auto=format&fit=crop&q=80&w=1920',
          link: 'products.html?collection=new',
          cta: 'SHOP LATEST'
        },
        {
          id: 'hero-2',
          title: 'AIR JORDAN RETRO',
          subtitle: 'THE LEGACY CONTINUES. AVAILABLE NOW.',
          image_url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=1920',
          link: 'products.html?category=jordan',
          cta: 'SHOP JORDAN'
        },
        {
          id: 'hero-3',
          title: 'YEEZY SEASON',
          subtitle: 'AVANT-GARDE DESIGN FOR THE BOLD.',
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
      ],
      brands: [
        { name: 'NIKE', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
        { name: 'JORDAN', logo: 'https://upload.wikimedia.org/wikipedia/en/3/37/Jumpman_logo.svg' },
        { name: 'ADIDAS', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' },
        { name: 'YEEZY', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Yeezy_logo.svg' }, // Placeholder
        { name: 'NEW BALANCE', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/New_Balance_logo.svg' }
      ]
    };

    this.init();
  }

  async init() {
    // 0. Render Globals (Header/Footer) first
    this.renderGlobals();

    this.toggleLoader(true);

    // 1. Load Content sequence
    await this.loadHero();
    await this.loadCategories();
    await this.loadProducts();
    await this.loadBrands(); // NEW: Brands Section

    this.setupNewsletter();
    this.setupQuickAddbox();

    this.toggleLoader(false);

    // 2. Start Visuals
    this.initHypeFeatures();

    console.log('🚀 [HomeEngine] V3.1 Initialized.');
  }

  // ==========================================
  // 🧩 GLOBAL COMPONENTS
  // ==========================================
  renderGlobals() {
    // Header
    const header = document.getElementById('mainHeader');
    if (header && window.Components) {
      header.innerHTML = window.Components.getHeader(true, true);
      window.Components.initHeader(); // This initializes the ticker and cart count

      // Init other header components if they exist
      if (window.Components.initSearch) window.Components.initSearch();
      if (window.Components.initCartCounter) window.Components.initCartCounter();
    } else {
      console.error("❌ Critical: Header container or Components class missing.");
    }

    // Footer
    const footer = document.getElementById('mainFooter');
    if (footer && window.Components) {
      footer.innerHTML = window.Components.getFooter();
    }

    // Mobile Menu Hook
    if (this.setupMobileMenu) this.setupMobileMenu();
  }

  initHypeFeatures() {
    this.startCountdown();
    this.setupScrollReveals();
    this.setupVideoModal();

    // Marquee Fade In
    const marquee = document.querySelector('.marquee-track');
    if (marquee) marquee.style.opacity = 1;
  }

  setupScrollReveals() {
    const targets = document.querySelectorAll('.section, .hero, .home-section-card, .brand-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    targets.forEach(target => {
      target.classList.add('reveal-on-scroll');
      observer.observe(target);
    });
  }

  // ==========================================
  // 1. HERO SLIDER
  // ==========================================
  async loadHero() {
    const container = document.getElementById('heroSlidesContainer');
    const dotsContainer = document.getElementById('heroSliderDots');
    if (!container) return;

    let slides = this.fallbackData.banners; // Prioritize premium fallback for now

    container.innerHTML = slides.map((slide, index) => `
            <div class="slide ${index === 0 ? 'active' : ''}" style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${slide.image_url}')">
                <div class="slide-content">
                    <span class="slide-eyebrow">LATEST DROPS</span>
                    <h1>${slide.title}</h1>
                    <p>${slide.subtitle || ''}</p>
                    <a href="${slide.link}" class="btn btn-primary btn-lg">${slide.cta}</a>
                </div>
            </div>
        `).join('');

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
    }, 6000); // 6s interval
  }

  goToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slider-dot');
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  // ==========================================
  // 2. CATEGORIES (Bento Grid)
  // ==========================================
  async loadCategories() {
    const container = document.getElementById('homeSectionsContainer');
    if (!container) return;

    const categories = this.fallbackData.categories;

    container.innerHTML = `
        <div class="home-sections-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            ${categories.map((cat, index) => `
                <div class="home-section-card ${index === 0 ? 'span-2' : ''}" 
                     onclick="window.location.href='products.html?category=${cat.slug}'"
                     style="position: relative; height: 400px; overflow: hidden; border: 4px solid var(--black); cursor: pointer; box-shadow: 10px 10px 0 var(--black);">
                     
                    <img src="${cat.image}" alt="${cat.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.2, 1, 0.3, 1);">
                    
                    <div class="section-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; flex-direction: column; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s;">
                        <h2 style="color: #fff; font-size: 3rem; font-weight: 900; text-transform: uppercase; margin: 0; letter-spacing: -2px;">${cat.name}</h2>
                        <span style="color: var(--black); font-weight: 800; border: none; padding: 10px 20px; margin-top: 20px; background: var(--accent); text-transform: uppercase;">Shop Now</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Modern Hover Effect
    container.querySelectorAll('.home-section-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.querySelector('.section-overlay').style.opacity = '1';
        card.querySelector('img').style.transform = 'scale(1.1)';
      });
      card.addEventListener('mouseleave', () => {
        card.querySelector('.section-overlay').style.opacity = '0';
        card.querySelector('img').style.transform = 'scale(1)';
      });
    });
  }

  // ==========================================
  // 3. PRODUCTS (Grid & Slider)
  // ==========================================
  async loadProducts() {
    this.initCountdown();

    // Featured (Grid)
    await this.renderProductGrid('featuredProductsGrid', this.fallbackData.products);

    // Trending (Horizontal Slider)
    await this.renderProductSlider('trendingSlider', this.fallbackData.products);
  }

  async renderProductGrid(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Use Component's Card Generator for consistency
    if (window.Components && window.Components.getProductCard) {
      container.innerHTML = products.map(p => window.Components.getProductCard(p)).join('');
    } else {
      // Simple fallback
      container.innerHTML = products.map(p => `
            <div class="product-card"><h3>${p.name}</h3><p>$${p.price}</p></div>
        `).join('');
    }
  }

  // NEW: Slider Renderer for Trending and Sale
  async renderProductSlider(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Force horizontal scroll class
    container.classList.add('products-horizontal-scroll');
    container.style.display = 'flex';

    // Transform grid to slider via style injection if needed
    if (window.Components && window.Components.getProductCard) {
      container.innerHTML = products.map(p => window.Components.getProductCard(p)).join('');
    }
  }

  async loadBrands() {
    // Logic for Brands if HTML container existed. 
    // Current index.html might not have #brandsContainer. 
    // We will inject it via the brands-section if found.
    const brandsSection = document.querySelector('.brand-marquee-section');
    // Assuming CSS handles the marquee, no JS needed unless dynamic.
  }

  initCountdown() {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);

    const updateTimer = () => {
      const now = new Date();
      const diff = targetDate - now;
      if (diff <= 0) return;

      const set = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.innerText = v.toString().padStart(2, '0');
      };

      set('days', Math.floor(diff / (1000 * 60 * 60 * 24)));
      set('hours', Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
      set('minutes', Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
      set('seconds', Math.floor((diff % (1000 * 60)) / 1000));
    };
    setInterval(updateTimer, 1000);
    updateTimer();
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
      }, 800);
    }
  }

  // ==========================================
  // ⚡ INTERACTIONS
  // ==========================================
  quickAdd(id, name) {
    if (window.cartManager) window.cartManager.add(id, 1);
    else if (window.cart) window.cart.add(id, 1);

    if (window.notifications) window.notifications.success('AÑADIDO', `${name} al carrito`);
  }

  toggleWishlist(id) {
    if (window.wishlistManager) window.wishlistManager.toggle(id);
    if (window.notifications) window.notifications.success('WISHLIST', 'Producto guardado');
  }

  setupNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        // Animation logic...
        btn.textContent = 'THANKS!';
      });
    }
  }

  setupMobileMenu() {
    // 1. Mobile Toggle (Hamburger)
    const menuBtn = document.querySelector('.header-mobile-toggle'); // V3 Class
    const mobileMenu = document.getElementById('mobileMenu'); // V3 ID

    if (menuBtn && mobileMenu) {
      // Logic handled by window.MobileMenu in components.js usually
      // But we can add extra listeners here if needed
    }
  }

  setupVideoModal() {
    // Basic modal logic
    const playBtn = document.querySelector('.btn-play');
    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Simple alert for MVP or implement full modal
        console.log("Play Video");
      });
    }
  }

}

document.addEventListener('DOMContentLoaded', () => {
  window.homeEngine = new HomeEngine();
});
