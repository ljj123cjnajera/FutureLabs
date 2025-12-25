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

    // 🛡️ DATA FALLBACK EXCELLENCE (High Heat Edition)
    this.fallbackData = {
      banners: [
        {
          id: 'hero-1',
          title: 'TRAVIS SCOTT x JUMPMAN',
          subtitle: 'THE FINAL CHAPTER. OLIVE LOWS AVAILABLE NOW.',
          image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=1920',
          link: 'products.html?collection=travis-scott',
          cta: 'SHOP COLLECTION'
        },
        {
          id: 'hero-2',
          title: 'YEEZY ARCHIVE',
          subtitle: 'ICONIC SILHOUETTES RETURN. LIMITED QUANTITIES.',
          image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=1920',
          link: 'products.html?category=yeezy',
          cta: 'ACCESS ARCHIVE'
        },
        {
          id: 'hero-3',
          title: 'NIKE SB DUNK',
          subtitle: 'SKATE CULTURE MEETS HIGH FASHION.',
          image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1920',
          link: 'products.html?category=nike-sb',
          cta: 'SHOP DUNKS'
        }
      ],
      categories: [
        { id: 'cat-1', name: 'JORDAN RETRO', slug: 'jordan', image: 'https://images.unsplash.com/photo-1695513286047-9d7e56230873?auto=format&fit=crop&q=80&w=800' },
        { id: 'cat-2', name: 'YEEZY SLIDES', slug: 'yeezy', image: 'https://images.unsplash.com/photo-1620332302351-8ca260e35730?auto=format&fit=crop&q=80&w=800' },
        { id: 'cat-3', name: 'NIKE DUNK', slug: 'nike', image: 'https://images.unsplash.com/photo-1605218427368-22d7168b4f4c?auto=format&fit=crop&q=80&w=800' },
        { id: 'cat-4', name: 'NEW BALANCE', slug: 'new-balance', image: 'https://images.unsplash.com/photo-1663044522649-6f9202611757?auto=format&fit=crop&q=80&w=800' }
      ],
      products: [
        { id: 101, name: 'Air Jordan 1 High OG "Lost & Found"', price: 450.00, image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=800', badge: 'GRAIL' },
        { id: 102, name: 'Adidas Yeezy Boost 350 V2 "Zebra"', price: 380.00, image_url: 'https://images.unsplash.com/photo-1549488344-c7059349b576?auto=format&fit=crop&q=80&w=800', badge: 'RESTOCK' },
        { id: 103, name: 'Nike Dunk Low Retro "Panda"', price: 180.00, image_url: 'https://images.unsplash.com/photo-1637844527273-218ba489995a?auto=format&fit=crop&q=80&w=800', badge: 'BESTSELLER' },
        { id: 104, name: 'Travis Scott x AJ1 Low "Olive"', price: 1200.00, image_url: 'https://images.unsplash.com/photo-1584735175315-9d58160926ad?auto=format&fit=crop&q=80&w=800', badge: 'HYPE' },
        { id: 105, name: 'New Balance 550 "Aimé Leon Dore"', price: 350.00, image_url: 'https://images.unsplash.com/photo-1656335362192-2bc9051b1824?auto=format&fit=crop&q=80&w=800', badge: 'COLLAB' },
        { id: 106, name: 'Air Jordan 4 Retro "Military Black"', price: 420.00, image_url: 'https://images.unsplash.com/photo-1695513286047-9d7e56230873?auto=format&fit=crop&q=80&w=800', badge: 'HOT' },
        { id: 107, name: 'Nike SB Dunk Low "Mummy"', price: 550.00, image_url: 'https://images.unsplash.com/photo-1523398002811-6ce9e490101d?auto=format&fit=crop&q=80&w=800', badge: 'TENDENCIA' },
        { id: 108, name: 'Yeezy Foam Runner "Sand"', price: 150.00, image_url: 'https://images.unsplash.com/photo-1605218427368-22d7168b4f4c?auto=format&fit=crop&q=80&w=800', badge: 'SUMMER' },
        { id: 109, name: 'Samba OG "Cloud White"', price: 120.00, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800', badge: 'CLASSIC' },
        { id: 110, name: 'Off-White x Nike Air Force 1', price: 1500.00, image_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800', badge: 'MUSEUM' },
        { id: 111, name: 'Rick Owens Geobasket', price: 980.00, image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800', badge: 'AVANT' },
        { id: 112, name: 'Birkenstock Boston Taupe', price: 180.00, image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800', badge: 'COMFORT' },
        // Expanded Data for Phase 104
        { id: 113, name: 'Jordan 3 Retro "White Cement"', price: 280.00, image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=800', badge: 'RESTOCK' },
        { id: 114, name: 'Nike Dunk Low "Grey Fog"', price: 160.00, image_url: 'https://images.unsplash.com/photo-1637844527273-218ba489995a?auto=format&fit=crop&q=80&w=800', badge: 'ESSENTIAL' },
        { id: 115, name: 'New Balance 2002R "Protection Pack"', price: 220.00, image_url: 'https://images.unsplash.com/photo-1620332302351-8ca260e35730?auto=format&fit=crop&q=80&w=800', badge: 'TRENDING' },
        { id: 116, name: 'Adidas Forum Low 84', price: 110.00, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800', badge: 'VINTAGE' }
      ],
      brands: [
        { name: 'NIKE', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
        { name: 'JORDAN', logo: 'https://upload.wikimedia.org/wikipedia/en/3/37/Jumpman_logo.svg' },
        { name: 'ADIDAS', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' },
        { name: 'YEEZY', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Yeezy_logo.svg' },
        { name: 'NEW BALANCE', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/New_Balance_logo.svg' },
        { name: 'OFF-WHITE', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Off-white_logo.svg' },
        { name: 'SUPREME', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Supreme_Logo.svg' }
      ]
    };

    this.init();
  }

  async init() {
    try {
      console.log('🚀 HomeEngine Starting...');

      // 1. CRITICAL: Inject Standard Header FIRST (matches products.html)
      if (window.Components && window.Components.getHeader) {
        const headerEl = document.getElementById('mainHeader');
        if (headerEl) {
          headerEl.innerHTML = window.Components.getHeader();
          // Initialize Header Logic (Search, Menu, Cart)
          if (window.Components.initHeader) {
            window.Components.initHeader();
          }
        }
      }

      // 2. Load Content with Failsafes
      await Promise.all([
        this.safeLoad(this.loadHero.bind(this), 'Hero Slider'),
        this.safeLoad(this.loadCategories.bind(this), 'Categories'),
        this.safeLoad(this.loadProducts.bind(this), 'Products'),
        this.safeLoad(this.loadBrands.bind(this), 'Brands'),
        this.safeLoad(this.loadJournal.bind(this), 'Journal')
      ]);

      this.setupNewsletter();
      this.setupQuickAddbox();

      this.toggleLoader(false);

      // 2. Start Visuals
      this.initHypeFeatures();
      this.initScrollAnimations();

      console.log('🚀 [HomeEngine] V3.1 Initialized (Defensive Mode).');
    } catch (err) {
      console.error('⚠️ [HomeEngine] Partial Load Error:', err);
      // Ensure loader is removed even if error occurs
      this.toggleLoader(false);
    }
  }

  // ==========================================
  // 🧩 GLOBAL COMPONENTS
  // ==========================================
  renderGlobals() {
    // Header - Fix for Double Nesting
    const headerElement = document.getElementById('mainHeader');
    if (headerElement && window.Components) {
      // Use outerHTML to replace the container itself, preventing <header><header>
      const newHeaderHTML = window.Components.getHeader(true, true);
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = newHeaderHTML;

      // Transfer ID if needed, or rely on .header-v3
      if (tempDiv.firstElementChild) {
        tempDiv.firstElementChild.id = 'mainHeader'; // Maintain ID for CSS compatibility
        headerElement.replaceWith(tempDiv.firstElementChild);
      }

      window.Components.initHeader();
      if (window.Components.initCartDrawer) window.Components.initCartDrawer();

      // Init other header components
      if (window.Components.initSearch) window.Components.initSearch();
      if (window.Components.initCartCounter) window.Components.initCartCounter();
    } else {
      console.warn("⚠️ Header container missing or Components not ready.");
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
    // If static content exists, don't overwrite it immediately (Hydration)
    if (container && container.children.length > 0) {
      console.log('⚡ Hero already rendered (Static). Initializing generic logic only.');
      return;
    }
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

    // Trending / Featured (SLIDER) - CORRECTED
    // Was incorrectly checking as Grid, forcing breaks in layout
    await this.renderProductSlider('featuredProductsGrid', this.fallbackData.products);

    // On Sale (Grid) - Remains Grid for variety
    await this.renderProductGrid('onSaleProductsGrid', this.fallbackData.products.map(p => ({ ...p, discount_price: p.price * 0.8 })));
  }

  async renderProductGrid(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Remove inline styles that might conflict (let CSS control the grid)
    // BUT ensure the class exists for grid layout
    container.classList.add('product-grid-v3');

    // 🛡️ Guard: Empty State
    if (!products || products.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-xl font-bold border-2 border-black">NO PRODUCTS FOUND IN THIS COLLECTION</div>`;
      return;
    }

    // Simulate network delay for premium 'Skeleton to Content' transition effect
    await new Promise(r => setTimeout(r, 600));

    // Use Component's Card Generator for consistency
    const cardsHTML = window.Components && window.Components.getProductCard
      ? products.map(p => window.Components.getProductCard(p)).join('')
      : products.map(p => `
            <div class="product-card brutalist-fallback">
                <h3>${p.name}</h3>
                <p>$${p.price}</p>
                <button>Add to Cart</button>
            </div>
        `).join('');

    // Fade Out Skeletons -> Fade In Content
    container.style.opacity = '0';
    setTimeout(() => {
      container.innerHTML = cardsHTML;
      container.style.transition = 'opacity 0.5s ease';
      container.style.opacity = '1';

      // Re-inject the grid style if CSS is missing (Safety Net)
      if (getComputedStyle(container).display !== 'grid') {
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
        container.style.gap = '20px';
      }
    }, 200);
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

  // ==========================================
  // 4. BRAND MARQUEE (SVG UPGRADE)
  // ==========================================
  async loadBrands() {
    const marqueeTrack = document.querySelector('.marquee-track');
    if (!marqueeTrack) return;

    // SVG Logos (White, High Quality)
    const brands = [
      { name: 'NIKE', src: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
      { name: 'JORDAN', src: 'https://upload.wikimedia.org/wikipedia/en/3/37/Jumpman_logo.svg' },
      { name: 'ADIDAS', src: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' },
      { name: 'YEEZY', src: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Yeezy_logo.svg' },
      { name: 'NEW BALANCE', src: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/New_Balance_logo.svg' },
      { name: 'OFF-WHITE', src: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Off-white_logo.svg' },
      { name: 'SUPREME', src: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Supreme_Logo.svg' },
      { name: 'NIKE', src: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' }, // Repeat for loop
      { name: 'JORDAN', src: 'https://upload.wikimedia.org/wikipedia/en/3/37/Jumpman_logo.svg' }
    ];

    // Clear text placeholders
    marqueeTrack.innerHTML = brands.map(b => `
        <div class="brand-item svg-mode">
            <img src="${b.src}" alt="${b.name}" loading="lazy">
        </div>
    `).join('');
  }

  // ==========================================
  // 5. JOURNAL (DYNAMIC INJECTION)
  // ==========================================
  async loadJournal() {
    const container = document.querySelector('.journal-grid');
    if (!container) return;

    // Fallback Data
    const posts = [
      {
        category: 'RELEASE',
        title: 'El fin de una era: Yeezy vs Adidas',
        desc: 'Analizamos el impacto en el mercado de reventa y qué esperar del futuro.',
        img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800',
        time: '5 MIN READ',
        url: 'blog-post.html'
      },
      {
        category: 'CULTURE',
        title: '¿Por qué las J1 High nunca mueren?',
        desc: 'La historia detrás de la silueta que inició todo en 1985.',
        img: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800',
        time: '3 MIN READ',
        url: 'blog-post.html'
      },
      {
        category: 'STYLE',
        title: 'Guía de Estilo: Streetwear Verano 2025',
        desc: 'Los esenciales que necesitas en tu rotación esta temporada.',
        img: 'https://images.unsplash.com/photo-1523398002811-6ce9e490101d?q=80&w=800',
        time: '7 MIN READ',
        url: 'blog-post.html'
      }
    ];

    // Check if static content exists, if so, replace it to ensure dynamic features
    container.innerHTML = posts.map(post => `
        <article class="journal-card" onclick="window.location.href='${post.url}'">
            <div class="journal-image">
                <img src="${post.img}" alt="${post.title}">
                <span class="read-time-badge"><i class="far fa-clock"></i> ${post.time}</span>
            </div>
            <div class="journal-content">
                <span class="journal-tag">${post.category}</span>
                <h3>${post.title}</h3>
                <p>${post.desc}</p>
                <a href="${post.url}" class="read-more">PROPAGANDA_V3 <i class="fas fa-arrow-right"></i></a>
            </div>
        </article>
    `).join('');
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
    // 1. Update Cart Engine
    if (window.cartEngine) {
      // Mock add
    }

    // 2. OPEN CART DRAWER (Interaction Feedback)
    if (window.CartDrawer) {
      window.CartDrawer.open();
    } else if (window.Components && window.Components.initCartDrawer) {
      window.Components.initCartDrawer();
      setTimeout(() => window.CartDrawer.open(), 100);
    }

    // 3. Show Premium Toast Notification
    if (window.notifications) {
      window.notifications.success('ADDED TO CART', `${name}`);
    }
  }

  setupParallax() {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const hero = document.querySelector('.hero-section');
      const slides = document.querySelectorAll('.slide');

      if (hero && slides.length > 0) {
        slides.forEach(slide => {
          const limit = slide.offsetTop + slide.offsetHeight;
          if (scrolled > slide.offsetTop && scrolled <= limit) {
            slide.style.backgroundPositionY = (scrolled * 0.5) + 'px';
          }
        });
      }
    });
  }

  toggleWishlist(id) {
    if (window.wishlistManager) window.wishlistManager.toggle(id);
    if (window.notifications) window.notifications.success('WISHLIST', 'Producto guardado');
  }

  setupNewsletter() {
    // 1. Footer Form
    const footerForm = document.querySelector('.footer-newsletter .input-group');
    if (footerForm) {
      const btn = footerForm.querySelector('button');
      const input = footerForm.querySelector('input');
      if (btn) {
        btn.onclick = () => {
          if (input && input.value.includes('@')) {
            btn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => btn.innerHTML = 'THANKS!', 1000);
            localStorage.setItem('newsletter_subscribed', 'true');
          }
        };
      }
    }

    // 2. Popup Logic (Exit Intent / Time Delay)
    const popup = document.getElementById('newsletterPopup');
    if (popup && !localStorage.getItem('newsletter_subscribed')) {
      setTimeout(() => {
        popup.style.display = 'flex';
      }, 5000); // Show after 5 seconds

      const closeBtn = popup.querySelector('.close-modal');
      const closeLink = popup.querySelector('.close-link');

      const closeAction = () => {
        popup.style.display = 'none';
        // Don't show again for this session
        sessionStorage.setItem('newsletter_dismissed', 'true');
      };

      if (closeBtn) closeBtn.onclick = closeAction;
      if (closeLink) closeLink.onclick = closeAction;
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
    const playBtn = document.querySelector('.btn-play, .btn-api'); // Support both
    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Simple alert for MVP or implement full modal
        console.log("Play Video");
      });
    }
  }

  // 5. Scroll Reveal Animations (Brutalist Fade Up)
  initScrollAnimations() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Reveal once
        }
      });
    }, observerOptions);

    // Select elements to reveal
    const elementsToReveal = document.querySelectorAll('.section, .bento-item, .product-card, .brand-item, .journal-card, .trust-bar, .newsletter-section');

    elementsToReveal.forEach((el, index) => {
      el.classList.add('reveal-on-scroll');
      el.style.transitionDelay = `${index % 4 * 100}ms`; // Stagger effect
      observer.observe(el);
    });

    // 🛡️ FAILSAFE: Force visibility after 2 seconds if observer fails or user turns off JS interactions
    setTimeout(() => {
      elementsToReveal.forEach(el => {
        if (!el.classList.contains('visible')) {
          el.classList.add('visible');
          // console.warn('⚠️ Force-revealing element (Failsafe triggered)');
        }
      });
    }, 2000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.homeEngine = new HomeEngine();
});
