class RecentlyViewed {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'recentlyViewedProducts';
    this.maxItems = options.maxItems || 8;
    this.defaultImage = 'assets/images/products/placeholder.jpg';
  }

  getProducts() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (error) {
      console.error('Error leyendo productos vistos recientemente:', error);
      return [];
    }
  }

  saveProducts(products) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(products));
    } catch (error) {
      console.error('Error guardando productos vistos recientemente:', error);
    }
  }

  formatProduct(rawProduct) {
    if (!rawProduct) return null;

    const price = Number(rawProduct.price ?? rawProduct.discount_price ?? 0);
    const discountPrice = Number(rawProduct.discount_price ?? 0);

    return {
      id: rawProduct.id,
      name: rawProduct.name || 'Producto sin nombre',
      brand: rawProduct.brand || '',
      image:
        rawProduct.image_url ||
        rawProduct.thumbnail ||
        rawProduct.images?.[0] ||
        this.defaultImage,
      price,
      discount_price: discountPrice > 0 ? discountPrice : null,
      url: `product-detail.html?id=${rawProduct.id}`,
      added_at: Date.now()
    };
  }

  add(rawProduct) {
    const product = this.formatProduct(rawProduct);
    if (!product?.id) return;

    let products = this.getProducts();
    products = products.filter((item) => item.id !== product.id);
    products.unshift(product);

    if (products.length > this.maxItems) {
      products = products.slice(0, this.maxItems);
    }

    this.saveProducts(products);
  }

  clear() {
    this.saveProducts([]);
  }

  render(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const products = this.getProducts();
    const limit = options.limit || this.maxItems;
    const section = container.dataset.section
      ? document.querySelector(container.dataset.section)
      : container.closest('[data-recently-viewed-section]');

    if (!products.length) {
      container.innerHTML = `
        <div class="recently-viewed-empty">
          <i class="fas fa-history"></i>
          <p>Aún no has visto productos recientemente.</p>
        </div>
      `;
      if (section) {
        section.style.display = options.hideWhenEmpty === false ? 'block' : 'none';
      }
      return;
    }

    if (section) {
      section.style.display = 'block';
    }

    container.innerHTML = products
      .slice(0, limit)
      .map((product) => this.renderCard(product, options))
      .join('');
  }

  renderCard(product, options = {}) {
    const price = product.discount_price ?? product.price;
    const formattedPrice = this.formatCurrency(price);

    const secondary = product.discount_price
      ? `<span class="recently-viewed-card-price-old">S/ ${Number(
          product.price
        ).toFixed(2)}</span>`
      : '';

    const actionLabel = options.actionLabel || 'Ver producto';

    return `
      <article class="recently-viewed-card">
        <a href="${product.url}" class="recently-viewed-card-image" title="${product.name}">
          <img src="${product.image}" alt="${product.name}">
        </a>
        <div class="recently-viewed-card-content">
          ${
            product.brand
              ? `<span class="recently-viewed-card-brand">${product.brand}</span>`
              : ''
          }
          <h3 class="recently-viewed-card-title">${product.name}</h3>
          <div class="recently-viewed-card-price">
            <span>
              <i class="fas fa-tag"></i> ${formattedPrice}
            </span>
            ${secondary}
          </div>
          <div class="recently-viewed-card-actions">
            <a class="btn-link" href="${product.url}">
              ${actionLabel} <i class="fas fa-arrow-right"></i>
            </a>
            <button
              type="button"
              class="btn btn-sm btn-outline"
              onclick="window.cartManager?.add('${product.id}', 1)"
            >
              <i class="fas fa-cart-plus"></i>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  formatCurrency(value) {
    const amount = Number(value) || 0;
    return `S/ ${amount.toFixed(2)}`;
  }

  clearAndRender(containerId, options = {}) {
    this.clear();
    this.render(containerId, options);
  }
}

window.recentlyViewed = new RecentlyViewed();

