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
    // 0. Restore Core UI (Header/Footer)
    this.renderGlobals();

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

    // 5. Hype Features (Visuals)
    this.initHypeFeatures();

    console.log('🚀 [HomeEngine] V3 Initialized. Robust Mode: ON');
  }

  initHypeFeatures() {
    // Logic for the Drop Countdown
    this.startCountdown();

    // Marquee Speed Logic (Optional adjustment)
    const marquee = document.querySelector('.marquee-track');
    if (marquee) {
      marquee.style.opacity = 1; // Fade in
    }

    // Scroll Reveal
    this.setupScrollReveals();

    // Video Modal
    this.setupVideoModal();
  }

  setupScrollReveals() {
    // 1. Add reveal class to targets
    const targets = document.querySelectorAll('.section, .hero-section, .brand-marquee, .home-section-card, .next-drop-section, .video-section, .manifesto-section, .social-section');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Optional: Stop observing once revealed
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    targets.forEach(target => {
      target.classList.add('reveal-on-scroll');
      observer.observe(target);
    });
  }

  setupVideoModal() {
    const playBtn = document.querySelector('.btn-play');
    if (!playBtn) return;

    playBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.openVideoModal('https://videos.pexels.com/video-files/3753305/3753305-hd_1920_1080_25fps.mp4');
    });
  }

  openVideoModal(videoSrc) {
    // Create Modal on the fly
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:black;z-index:9999;display:flex;justify-content:center;align-items:center;opacity:0;transition:opacity 0.5s;';

    modal.innerHTML = `
          <button class="close-video" style="position:absolute;top:20px;right:20px;color:white;font-size:2rem;background:none;border:none;cursor:pointer;">&times;</button>
          <video controls autoplay style="max-width:90%;max-height:90vh;box-shadow:0 0 50px rgba(255,255,255,0.1);">
              <source src="${videoSrc}" type="video/mp4">
          </video>
      `;

    document.body.appendChild(modal);

    // Animate In
    requestAnimationFrame(() => modal.style.opacity = '1');

    // Close Logic
    const close = () => {
      modal.style.opacity = '0';
      setTimeout(() => modal.remove(), 500);
    };

    modal.querySelector('.close-video').onclick = close;
    modal.onclick = (e) => { if (e.target === modal) close(); };
  }

  startCountdown() {
    const days = document.getElementById('days');
    const hours = document.getElementById('hours');
    const minutes = document.getElementById('minutes');
    const seconds = document.getElementById('seconds');

    if (!days) return;

    // Set target to 3 days from now (Mock)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);

    setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      days.innerText = d < 10 ? '0' + d : d;
      hours.innerText = h < 10 ? '0' + h : h;
      minutes.innerText = m < 10 ? '0' + m : m;
      seconds.innerText = s < 10 ? '0' + s : s;
    }, 1000);
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
  // 🧩 GLOBAL COMPONENTS
  // ==========================================
  renderGlobals() {
    // Header
    const header = document.getElementById('mainHeader');
    if (header && window.Components) {
      header.innerHTML = window.Components.getHeader(true, true);
      window.Components.initHeader();
      // Initialize Search & Cart Count if available
      if (window.Components.initSearch) window.Components.initSearch();
      if (window.Components.initCartCounter) window.Components.initCartCounter();
    }

    // Footer
    const footer = document.getElementById('mainFooter');
    if (footer && window.Components) {
      footer.innerHTML = window.Components.getFooter();
    }

    // V3 Mobile Menu Logic (if not in Components)
    this.setupMobileMenu();
  }

  // ==========================================
  // 🧭 NAVIGATION (MegaMenu)
  // ==========================================
  setupMobileMenu() {
    // 1. Mobile Toggle (Hamburger)
    const menuBtn = document.querySelector('.mobile-menu-btn'); // From Components.getHeader()
    const mobileMenu = document.getElementById('mobileMenu');

    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener('click', () => {
        mobileMenu.classList.add('active');
      });

      const closeBtn = mobileMenu.querySelector('.close-menu');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => mobileMenu.classList.remove('active'));
      }
    }

    // 2. MegaMenu (Desktop "Ver Todo" / Categories)
    this.setupMegaMenu();
  }

  setupMegaMenu() {
    const trigger = document.querySelector('.all-categories'); // From Components.getHeader()
    const megaMenu = document.getElementById('megaMenu');
    const overlay = document.getElementById('megaMenuOverlay');
    const closeBtn = document.getElementById('closeMenu');

    if (!trigger || !megaMenu || !overlay) return;

    // Open
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      megaMenu.classList.add('active');
      overlay.classList.add('active');
    });

    // Close
    const close = () => {
      megaMenu.classList.remove('active');
      overlay.classList.remove('active');
    };

    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    // Tab Logic (Restored from V2)
    this.setupMegaMenuTabs();
  }

  setupMegaMenuTabs() {
    const items = document.querySelectorAll('.category-item');
    const contents = document.querySelectorAll('.category-content');

    items.forEach(item => {
      item.addEventListener('mouseenter', () => { // Hover for desktop
        const cat = item.getAttribute('data-category');

        // Reset
        items.forEach(i => i.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        // Activate
        item.classList.add('active');
        const content = document.querySelector(`.category-content[data-category="${cat}"]`);
        if (content) content.classList.add('active');
      });
    });
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
                    <span class="slide-eyebrow">LATEST DROPS</span>
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
    // Brutalist Grid Render (V3)
    container.innerHTML = `
        <div class="home-sections-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
            ${categories.map((cat, index) => `
                <div class="home-section-card ${index === 0 ? 'span-2' : ''}" 
                     onclick="window.location.href='products.html?category=${cat.slug}'"
                     style="position: relative; height: 400px; overflow: hidden; border: 2px solid #000; cursor: pointer;">
                     
                    <img src="${cat.image || cat.image_url}" alt="${cat.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s;">
                    
                    <div class="section-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; flex-direction: column; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s;">
                        <h2 style="color: #fff; font-size: 3rem; font-weight: 900; text-transform: uppercase; margin: 0; text-shadow: 2px 2px 0 #000;">${cat.name}</h2>
                        <span style="color: #fff; font-weight: 700; border: 2px solid #fff; padding: 0.5rem 1.5rem; margin-top: 1rem; background: #000;">EXPLORE</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Add Hover Animation via JS
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
            <div class="product-card" onclick="window.location.href='product-detail.html?id=${p.id}'" style="cursor: pointer;">
                <div class="product-image-container">
                    ${p.badge ? `<div class="product-badges"><span class="product-badge product-badge-new">${p.badge}</span></div>` : ''}
                    <img src="${p.image_url}" alt="${p.name}" class="product-image">
                    <button class="quick-add-btn" onclick="event.stopPropagation(); window.homeEngine.quickAdd(${p.id}, '${p.name}')">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="product-info" style="padding: 1rem;">
                    <h3 style="font-size: 1rem; margin-bottom: 0.5rem; text-transform: uppercase; font-weight: 800;">${p.name}</h3>
                    <div class="price" style="font-family: inherit; font-size: 1.1rem; font-weight: 700;">
                        $${p.price.toFixed(2)}
                        ${p.original_price ? `<span style="text-decoration: line-through; color: #999; font-size: 0.9rem; margin-left: 5px;">$${p.original_price.toFixed(2)}</span>` : ''}
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
