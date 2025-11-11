// 🔄 Comparador de Productos
class ProductComparator {
  constructor() {
    this.maxProducts = 3;
    this.products = [];
    this.init();
    this.pendingSetFromIds = null;

    document.addEventListener('DOMContentLoaded', () => {
      this.updateCompareButtons();
    });
  }

  init() {
    // Cargar productos del localStorage
    this.loadFromStorage();
    
    // Renderizar comparador
    this.render();
    
    // Setup event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Botón de comparar en productos
    document.addEventListener('click', async (e) => {
      const button = e.target.closest('.btn-compare');
      if (!button) return;

      e.preventDefault();
      e.stopPropagation();

      const productId = button.dataset.productId;
      if (!productId) return;

      button.classList.add('is-loading');
      button.disabled = true;

      try {
        await this.toggleProduct(productId);
      } finally {
        button.classList.remove('is-loading');
        button.disabled = false;
        this.updateCompareButtons();
      }
    });

    // Botón de eliminar del comparador
    document.addEventListener('click', (e) => {
      if (e.target.closest('.remove-from-comparator')) {
        const productId = e.target.closest('.remove-from-comparator').dataset.productId;
        this.removeProduct(productId);
      }
    });

    // Botón de vaciar comparador
    document.addEventListener('click', (e) => {
      if (e.target.closest('.clear-comparator')) {
        e.preventDefault();
        this.clear();
      }
    });

    // Botón de comparar ahora
    document.addEventListener('click', (e) => {
      if (e.target.closest('.compare-now')) {
        e.preventDefault();
        window.location.href = 'compare.html';
      }
    });
  }

  isInComparator(productId) {
    return this.products.some(p => String(p.id) === String(productId));
  }

  async addProduct(productId) {
    // Verificar si ya está en el comparador
    if (this.products.find(p => String(p.id) === String(productId))) {
      window.notifications?.warning?.('Este producto ya está en el comparador');
      return;
    }

    // Verificar límite
    if (this.products.length >= this.maxProducts) {
      window.notifications?.error?.(`Solo puedes comparar hasta ${this.maxProducts} productos`);
      return;
    }

    try {
      // Obtener producto del API
      const response = await window.api.getProductById(productId);
      
      if (response.success) {
        const product = response.data.product;
        this.products.push(product);
        this.saveToStorage();
        this.render();
        window.notifications?.success?.('Producto agregado al comparador');
      }
    } catch (error) {
      window.notifications?.error?.('Error al agregar producto al comparador');
    }
  }

  async toggleProduct(productId) {
    if (this.isInComparator(productId)) {
      this.removeProduct(productId, { silent: true });
      window.notifications?.info?.('Producto eliminado del comparador');
    } else {
      await this.addProduct(productId);
    }
  }

  removeProduct(productId, options = {}) {
    const { silent = false } = options;
    this.products = this.products.filter(p => String(p.id) !== String(productId));
    this.saveToStorage();
    this.render();
    if (!silent) {
      window.notifications?.success?.('Producto eliminado del comparador');
    }
  }

  clear() {
    this.products = [];
    this.saveToStorage();
    this.render();
    window.notifications?.success?.('Comparador vaciado');
  }

  saveToStorage() {
    localStorage.setItem('comparator', JSON.stringify(this.products));
  }

  loadFromStorage() {
    const stored = localStorage.getItem('comparator');
    if (stored) {
      this.products = JSON.parse(stored);
    }
  }

  emitUpdate() {
    document.dispatchEvent(new CustomEvent('productComparator:updated', {
      detail: {
        products: this.products.slice(),
        max: this.maxProducts
      }
    }));
  }

  updateCompareButtons() {
    const buttons = document.querySelectorAll('.btn-compare[data-product-id]');
    buttons.forEach(button => {
      const productId = button.dataset.productId;
      if (!productId) return;

      const isActive = this.isInComparator(productId);
      button.classList.toggle('is-active', isActive);

      const variant = button.dataset.compareVariant || 'default';
      const icon = isActive ? 'fa-check' : 'fa-balance-scale';
      const inactiveLabel = button.dataset.labelInactive || 'Comparar';
      const activeLabel = button.dataset.labelActive || 'Comparando';
      const label = isActive ? activeLabel : inactiveLabel;

      if (variant === 'icon') {
        button.innerHTML = `<i class="fas ${icon}"></i>`;
      } else {
        button.innerHTML = `<i class="fas ${icon}"></i> ${label}`;
      }

      const tooltip = isActive ? 'Quitar del comparador' : 'Comparar producto';
      button.setAttribute('title', tooltip);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  render() {
    // Actualizar contador en header
    const counter = document.getElementById('comparator-count');
    if (counter) {
      counter.textContent = this.products.length;
      counter.style.display = this.products.length > 0 ? 'block' : 'none';
    }

    // Renderizar comparador flotante
    this.renderFloatingComparator();
    this.updateCompareButtons();
    this.emitUpdate();
  }

  renderFloatingComparator() {
    let comparator = document.getElementById('floating-comparator');
    
    if (!comparator && this.products.length > 0) {
      comparator = document.createElement('div');
      comparator.id = 'floating-comparator';
      comparator.className = 'floating-comparator';
      comparator.setAttribute('role', 'region');
      comparator.setAttribute('aria-label', 'Comparador de productos seleccionados');
      document.body.appendChild(comparator);
    }

    if (comparator) {
      if (this.products.length === 0) {
        comparator.remove();
        return;
      }

      comparator.innerHTML = `
        <div class="comparator-header">
          <h4><i class="fas fa-balance-scale" aria-hidden="true"></i> Comparador (${this.products.length}/${this.maxProducts})</h4>
          <button class="clear-comparator" type="button" title="Vaciar" aria-label="Vaciar comparador">
            <i class="fas fa-trash" aria-hidden="true"></i>
          </button>
        </div>
        <div class="comparator-products">
          ${this.products.map(product => `
            <div class="comparator-product">
              <img src="${product.image_url || 'https://via.placeholder.com/100'}" alt="${product.name}">
              <span class="product-name">${product.name.substring(0, 20)}...</span>
              <button class="remove-from-comparator" type="button" data-product-id="${product.id}" title="Eliminar" aria-label="Eliminar ${product.name} del comparador">
                <i class="fas fa-times" aria-hidden="true"></i>
              </button>
            </div>
          `).join('')}
        </div>
        <button class="compare-now" type="button">
          <i class="fas fa-balance-scale" aria-hidden="true"></i> Comparar Ahora
        </button>
      `;
    }
  }

  getProducts() {
    return this.products;
  }

  getProductIds() {
    return this.products.map(product => product.id);
  }

  async setProductsByIds(ids = []) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return;
    }

    const dedupedIds = Array.from(new Set(ids.filter(Boolean).map(id => String(id))));
    if (dedupedIds.length === 0) {
      return;
    }

    this.pendingSetFromIds = dedupedIds;

    try {
      const products = await Promise.all(
        dedupedIds.map(async (id) => {
          try {
            const response = await window.api.getProductById(id);
            return response.success ? response.data.product : null;
          } catch (error) {
            console.error('Error loading product for comparator:', error);
            return null;
          }
        })
      );

      if (this.pendingSetFromIds !== dedupedIds) {
        return;
      }

      this.products = products.filter(Boolean);
      this.saveToStorage();
      this.render();
    } finally {
      this.pendingSetFromIds = null;
    }
  }
}

// Inicializar comparador
window.productComparator = new ProductComparator();





