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

      // 1. CRITICAL: Inject Standard Header FIRST (matches products.html)
      // Check if we have the placeholder ID
      const headerPlaceholder = document.getElementById('mainHeader');

      // If header is already injected (contains class header-v3), skip injection
      const alreadyInjected = document.querySelector('header.header-v3');

      if (window.Components && window.Components.getHeader) {
        if (headerPlaceholder && !alreadyInjected) {
          const newHeaderHTML = window.Components.getHeader(true, true);
          // Create a temp container to parse the string
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = newHeaderHTML;

          // The first child is the <header class="header-v3"> element
          const newHeaderEl = tempDiv.firstElementChild;
          if (newHeaderEl) {
            newHeaderEl.id = 'mainHeader'; // Preserve ID for CSS hooks
            headerPlaceholder.replaceWith(newHeaderEl);
          }
        }

        // Initialize Header Logic (Always run this)
        if (window.Components.initHeader) {
          window.Components.initHeader();
        }
      }

      // 1.1 CRITICAL: Inject Standard Footer (matches products.html)
      if (window.Components && window.Components.getFooter) {
        const footerEl = document.getElementById('mainFooter');
        if (footerEl) {
          footerEl.innerHTML = window.Components.getFooter();
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
      this.initStickyFooter();
      this.initTabbedEngine();
    } catch (err) {
      console.error('⚠️ [HomeEngine] Partial Load Error:', err);
      // Ensure loader is removed even if error occurs
      this.toggleLoader(false);
    }
  }

  // ==========================================
  // 🧩 GLOBAL COMPONENTS
  // ==========================================
  async renderGlobals() {
    try {
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

      // 4. Load Journal
      await this.loadJournal();

      // 5. Load Brands
      this.renderBrands();

      console.log('✅ HomeEngine Initialized');
    } catch (e) {
      console.error('HomeEngine Init Error:', e);
    }
  }

  async loadJournal() {
    const container = document.querySelector('.journal-grid');
    if (!container) return; // Fail silently if not found

    try {
      // Attempt API fetch
      let posts = [];
      if (this.api && this.api.getBlogPosts) {
        const res = await this.api.getBlogPosts({ limit: 3 });
        if (res.success) posts = res.data;
      }

      // Fallback if API fails or returns empty
      if (!posts || posts.length === 0) {
        posts = [
          {
            title: 'El fin de una era: Yeezy vs Adidas',
            category: 'RELEASE',
            excerpt: 'Analizamos el impacto en el mercado de reventa y qué esperar del futuro.',
            image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800',
            link: 'blog-post.html'
          },
          {
            title: '¿Por qué las J1 High nunca mueren?',
            category: 'CULTURE',
            excerpt: 'La historia detrás de la silueta que inició todo en 1985.',
            image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800',
            link: 'blog-post.html'
          },
          {
            title: 'Guía de Estilo: Streetwear Verano 2025',
            category: 'STYLE',
            excerpt: 'Los esenciales que necesitas en tu rotación esta temporada.',
            image_url: 'https://images.unsplash.com/photo-1523398002811-6ce9e490101d?q=80&w=800',
            link: 'blog-post.html'
          }
        ];
      }

      // Render
      container.innerHTML = posts.map(post => `
                <article class="journal-card" onclick="window.location.href='${post.link}'" style="cursor: pointer;">
                    <div class="journal-image">
                        <img src="${post.image_url}" alt="${post.title}" loading="lazy">
                    </div>
                    <div class="journal-content">
                        <span class="journal-tag">${post.category || 'NEWS'}</span>
                        <h3>${post.title}</h3>
                        <p>${post.excerpt}</p>
                        <span class="read-more">Leer más</span>
                    </div>
                </article>
          `).join('');

    } catch (e) {
      console.warn('Journal Load Error:', e);
    }
  }


  renderBrands() {
    const marqueeContent = document.querySelector('.marquee-content');
    if (!marqueeContent) return;

    const brands = this.state.brands || this.fallbackData.brands;

    // We need to duplicate content for infinite scroll effect
    const brandHTML = brands.map(brand => `
          <div class="brand-item">
            <img src="${brand.logo}" alt="${brand.name}" style="height: 40px; width: auto; filter: invert(1);"> 
          </div>
      `).join('');

    // Inject doubled content for smooth loop
    marqueeContent.innerHTML = brandHTML + brandHTML + brandHTML + brandHTML;
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
    const targets = document.querySelectorAll('.section, .hero-section, .home-section-card, .brand-card');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add a small delay based on index if possible for staggered effect
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15, // Slightly higher to ensure user sees the element before animating
      rootMargin: '0px 0px -50px 0px' // Trigget slightly before bottom
    });

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
    this.setupHeroTouch(container, slides.length);
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

  setupHeroTouch(container, count) {
    let touchStartX = 0;
    let touchEndX = 0;

    container.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(count);
    }, { passive: true });

    this.handleSwipe = (count) => {
      const threshold = 50;
      if (touchEndX < touchStartX - threshold) {
        // Swipe Left -> Next
        const current = Array.from(document.querySelectorAll('.slide')).findIndex(s => s.classList.contains('active'));
        this.goToSlide((current + 1) % count);
      }
      if (touchEndX > touchStartX + threshold) {
        // Swipe Right -> Prev
        const current = Array.from(document.querySelectorAll('.slide')).findIndex(s => s.classList.contains('active'));
        this.goToSlide((current - 1 + count) % count);
      }
    };
  }

  // ==========================================
  // 2. CATEGORIES (Bento Grid)
  // ==========================================
  async loadCategories() {
    const container = document.getElementById('homeSectionsContainer');
    if (!container) return;

    const categories = this.fallbackData.categories;

    container.innerHTML = `
        <div class="bento-grid">
            ${categories.map((cat, index) => `
                <a href="products.html?category=${cat.slug}" class="bento-item">
                    <img src="${cat.image}" alt="${cat.name}" loading="lazy">
                    <div class="bento-overlay">
                        <h3>${cat.name}</h3>
                        <i class="fas fa-arrow-right"></i>
                    </div>
                </a>
            `).join('')}
        </div>
    `;

    // Remove legacy listeners as CSS handles hover now
    // Modern Hover Effect is handled by .bento-item:hover in CSS

    // Modern Hover Effect

  }

  startCountdown() {
    // Placeholder for countdown logic if needed in V1
    const timerElement = document.getElementById('dropTimer');
    if (timerElement) {
      timerElement.textContent = "02D 14H 30M";
    }
  }

  // ==========================================
  // 3. PRODUCTS (Grid & Slider)
  // ==========================================
  async loadProducts() {
    this.startCountdown(); // use simple startCountdown

    // 🛡️ Get Data (API or Fallback)
    let products = [];
    try {
      if (this.api && this.api.getProducts) {
        const response = await this.api.getProducts();
        // Handle { success: true, data: [...] } or direct array [...]
        if (Array.isArray(response)) {
          products = response;
        } else if (response && Array.isArray(response.data)) {
          products = response.data;
        } else if (response && response.products && Array.isArray(response.products)) {
          products = response.products;
        }
      }
    } catch (e) { console.warn('API Error, using fallback', e); }

    if (!products || products.length === 0) {
      products = this.fallbackData.products;
    }

    // A. TRENDING / FEATURED (Slider)
    // Filter logic: High Heat, New, or Hype badges
    const trending = products.filter(p =>
      ['GRAIL', 'HYPE', 'HOT', 'TRENDING', 'NEW'].includes(p.badge) || p.price > 400
    ).slice(0, 8); // Top 8 

    await this.renderProductSlider('featuredProductsGrid', trending);

    // B. ON SALE (Grid)
    // Logic: Products with discount (mocking if needed)
    let saleProducts = products.filter(p => p.discount_price || p.badge === 'SALE');

    // If no sale products in mock, generate some for demo
    if (saleProducts.length < 4) {
      saleProducts = products.slice(4, 12).map(p => ({
        ...p,
        discount_price: (p.price * 0.8).toFixed(2), // 20% off
        badge: 'SALE'
      }));
    }

    await this.renderProductGrid('onSaleProductsGrid', saleProducts);
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
    // container.style.display = 'flex'; // Handled by CSS class usually

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

    // Default Fallback Data (Premium)
    const fallbackPosts = [
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

    let posts = [];

    // 1. Try API
    if (this.api && this.api.getRecentBlogPosts) {
      try {
        const res = await this.api.getRecentBlogPosts(3);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          posts = res.data.map(p => ({
            category: p.category || 'NEWS',
            title: p.title,
            desc: p.excerpt || p.content.substring(0, 100) + '...',
            img: p.image_url || 'img/placeholder-journal.jpg',
            time: `${Math.ceil((p.content?.length || 1000) / 1000)} MIN READ`,
            url: `blog-post.html?slug=${p.slug}`
          }));
        }
      } catch (e) {
        // Silent fail to fallback
      }
    }

    // 2. Use Fallback if needed
    if (posts.length === 0) {
      posts = fallbackPosts;
    }

    container.innerHTML = posts.map(post => `
        <article class="journal-card" onclick="window.location.href='${post.url}'">
            <div class="journal-image">
                <img src="${post.img}" alt="${post.title}" loading="lazy">
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
      loader.style.display = 'flex'; // Ensure it's in logic flow
      loader.style.visibility = 'visible';
      // Small timeout to allow display change to register before opacity transition
      requestAnimationFrame(() => {
        loader.style.opacity = '1';
      });
    } else {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.style.visibility = 'hidden';
          loader.style.display = 'none'; // CRITICAL FIX: Remove from layout
        }, 500);
      }, 800);
    }
  }

  // ==========================================
  // ⚡ INTERACTIONS
  // ==========================================
  // ==========================================
  // ⚡ INTERACTIONS
  // ==========================================

  // 0. COUNTDOWN TIMER
  initCountdown() {
    const countdownEl = document.getElementById('countDownTimer');
    if (!countdownEl) return;

    // Set target date to 3 days from now (Simulated Drop)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    targetDate.setHours(20, 0, 0, 0); // 8 PM Launch

    // Store in session to keep consistent while browsing
    let savedTarget = sessionStorage.getItem('nextDropTime');
    if (savedTarget) {
      // use saved
    } else {
      sessionStorage.setItem('nextDropTime', targetDate.getTime());
    }

    // Override for simple demo: Always 2 days 14 hours ahead
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = (parseInt(savedTarget || targetDate.getTime())) - now;

      if (distance < 0) {
        countdownEl.innerHTML = "DROPPING NOW";
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      countdownEl.innerHTML = `
            <div>${days}<small>D</small></div>
            <div>${hours}<small>H</small></div>
            <div>${minutes}<small>M</small></div>
            <div>${seconds}<small>S</small></div>
        `;
    };

    setInterval(updateTimer, 1000);
    updateTimer();
  }

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

  // NEW: Quick View Binding for Dynamic Content
  setupQuickAddbox() {
    // Delegate event to container to handle dynamic buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-quick-view') || e.target.closest('.quick-view-trigger');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const productId = btn.dataset.id;

        if (window.QuickView) {
          window.QuickView.open(productId);
        } else {
          console.warn('QuickView module not loaded');
          // Fallback: Redirect
          window.location.href = `product-detail.html?id=${productId}`;
        }
      }
    });
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

  // 🛡️ UTILITY: Safe Loader
  async safeLoad(fn, name) {
    try {
      await fn();
      console.log(`✅ [HomeEngine] ${name} Loaded`);
    } catch (e) {
      console.error(`❌ [HomeEngine] ${name} Failed`, e);
    }
  }

  toggleWishlist(id) {
    if (window.wishlistManager) window.wishlistManager.toggle(id);
    if (window.notifications) window.notifications.success('WISHLIST', 'Producto guardado');
  }

  setupNewsletter() {
    // 1. Footer Form (Intercept ID specific to Index or Generic)
    const forms = document.querySelectorAll('.footer-newsletter form, #newsletterPopup form');

    forms.forEach(form => {
      form.onsubmit = (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        const originalText = btn ? btn.innerText : 'SUSCRIBIRME';

        if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        setTimeout(() => {
          if (btn) btn.innerHTML = '<i class="fas fa-check"></i> LISTO';
          if (window.notifications) window.notifications.success('WELCOME TO THE CLUB', 'Te has suscrito correctamente.');

          // Hide popup if that was it
          const popup = form.closest('.newsletter-popup');
          if (popup) {
            setTimeout(() => {
              popup.style.opacity = '0';
              setTimeout(() => popup.style.display = 'none', 500);
            }, 1000);
          }

          localStorage.setItem('newsletter_subscribed', 'true');
        }, 1500);
      };
    });

    // 2. Popup Logic (Exit Intent / Time Delay)
    const popup = document.getElementById('newsletterPopup');
    if (popup && !localStorage.getItem('newsletter_subscribed') && !sessionStorage.getItem('newsletter_dismissed')) {
      setTimeout(() => {
        popup.style.display = 'flex';
        // Force reflow for fade in
        setTimeout(() => popup.classList.add('visible'), 10);
      }, 5000); // Show after 5 seconds

      const closeBtn = popup.querySelector('.close-modal');
      const closeLink = popup.querySelector('.close-link');

      const closeAction = () => {
        popup.classList.remove('visible');
        setTimeout(() => popup.style.display = 'none', 500);
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
  }

  // 6. Sticky Footer Logic (Dismissible)
  initStickyFooter() {
    const sticky = document.getElementById('stickyFooter');
    if (!sticky) return;

    // Check if dismissed in session
    if (sessionStorage.getItem('stickyDetailDismissed')) {
      sticky.style.display = 'none';
      return;
    }

    // Add close button if not present
    if (!sticky.querySelector('.close-sticky')) {
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '&times;';
      closeBtn.className = 'close-sticky';
      closeBtn.style.cssText = `
              position: absolute;
              right: 1rem;
              top: 50%;
              transform: translateY(-50%);
              background: transparent;
              border: none;
              color: var(--white);
              font-size: 1.5rem;
              cursor: pointer;
              font-weight: bold;
          `;
      closeBtn.onclick = () => {
        sticky.style.display = 'none';
        sessionStorage.setItem('stickyDetailDismissed', 'true');
      };

      // Ensure container is relative for positioning
      const container = sticky.querySelector('.container');
      if (container) {
        container.style.position = 'relative';
        container.appendChild(closeBtn);
      } else {
        sticky.appendChild(closeBtn);
      }
    }
  }

  // 7. Product Engine (Tabbed Collections)
  initTabbedEngine() {
    const tabs = document.querySelectorAll('.engine-tab');
    const grid = document.getElementById('engineGrid');
    const loader = document.getElementById('engineLoader');
    const seeAll = document.getElementById('engineSeeAll');

    if (!tabs.length || !grid) return;

    const loadCategory = async (category) => {
      // 1. UI Loading State
      grid.style.display = 'none';
      grid.classList.remove('loaded');
      if (loader) loader.style.display = 'flex';

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelector(`.engine-tab[data-tab="${category}"]`)?.classList.add('active');

      try {
        // 2. Fetch Data (Real API)
        // Using api.getProducts with category filter
        const response = await window.api.getProducts({
          category: category,
          limit: 4
        });

        let products = [];
        if (response && response.success && response.data && response.data.products) {
          products = response.data.products;
        } else {
          // Fallback to internal mock if API fails/returns empty
          console.warn(`⚠️ API returned no products for ${category}, utilizing fallback.`);
          products = this.getFallbackProducts(category);
        }

        // 3. Render
        if (products.length > 0) {
          grid.innerHTML = products.map(p => window.Components.getProductCard(p)).join('');
        } else {
          grid.innerHTML = `<div class="empty-state">NO WEAPONS FOUND IN SECTOR ${category.toUpperCase()}</div>`;
        }

        // 4. Update "See All" Link
        if (seeAll) seeAll.href = `products.html?category=${category}`;

      } catch (err) {
        console.warn('❌ Engine Error:', err);
        // Fallback on error
        const fallbackIds = this.getFallbackProducts(category);
        grid.innerHTML = fallbackIds.map(p => window.Components.getProductCard(p)).join('');
      } finally {
        // 5. Reveal
        if (loader) loader.style.display = 'none';
        grid.style.display = 'grid';
        // Small delay to allow display:grid to apply before opacity transition
        setTimeout(() => grid.classList.add('loaded'), 50);
      }
    };

    // Initialize with first tab (Nike)
    loadCategory('nike');

    // Event Listeners
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const category = tab.dataset.tab;
        loadCategory(category);
      });
    });
  }

  // Helper: Mock fallback if API is empty during dev
  getFallbackProducts(category) {
    // Return 4 mock items based on category
    const mockDb = {
      'nike': [1, 2, 3, 4],
      'jordan': [5, 6, 7, 8],
      'yeezy': [9, 10, 11, 12],
      'adidas': [13, 14, 15, 16]
    };
    const ids = mockDb[category] || [1, 2, 3, 4];

    // Hydrate from catalogEngine if available, or generate generic
    return ids.map(id => {
      return {
        id: id,
        name: `${category.toUpperCase()} PROTOTYPE 00${id}`,
        price: 299.00,
        brand: category.toUpperCase(),
        image_url: 'assets/images/products/placeholder.jpg',
        is_new: Math.random() > 0.5
      };
    });
  }

  // 🛡️ FAILSAFE: Force visibility after 2 seconds if observer fails or user turns off JS interactions
  forceReveal() {
    const elementsToReveal = document.querySelectorAll('.section, .bento-item, .product-card, .brand-item, .journal-card, .trust-bar, .newsletter-section');
    elementsToReveal.forEach(el => {
      if (!el.classList.contains('visible')) {
        el.classList.add('visible');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.homeEngine = new HomeEngine();

  // Failsafe: Ensure Footer is visible if Engine hangs
  setTimeout(() => {
    const footer = document.getElementById('mainFooter');
    if (footer && (!footer.innerHTML.trim() || footer.offsetHeight < 10)) {
      if (window.Components && window.Components.getFooter) {
        footer.innerHTML = window.Components.getFooter();
        footer.style.display = 'block';
      }
    }
  }, 2000);
});
