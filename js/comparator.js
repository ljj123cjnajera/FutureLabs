// 🔄 Comparador de Productos
class ProductComparator {
  constructor() {
    this.maxProducts = 3;
    this.products = [];
    this.init();
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
    document.addEventListener('click', (e) => {
      if (e.target.closest('.btn-compare')) {
        const productId = e.target.closest('.btn-compare').dataset.productId;
        this.addProduct(productId);
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
        this.clear();
      }
    });

    // Botón de comparar ahora
    document.addEventListener('click', (e) => {
      if (e.target.closest('.compare-now')) {
        window.location.href = 'compare.html';
      }
    });
  }

  async addProduct(productId) {
    // Verificar si ya está en el comparador
    if (this.products.find(p => p.id === productId)) {
      window.notifications.warning('Este producto ya está en el comparador');
      return;
    }

    // Verificar límite
    if (this.products.length >= this.maxProducts) {
      window.notifications.error(`Solo puedes comparar hasta ${this.maxProducts} productos`);
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
        window.notifications.success('Producto agregado al comparador');
      }
    } catch (error) {
      window.notifications.error('Error al agregar producto al comparador');
    }
  }

  removeProduct(productId) {
    this.products = this.products.filter(p => p.id !== productId);
    this.saveToStorage();
    this.render();
    window.notifications.success('Producto eliminado del comparador');
  }

  clear() {
    this.products = [];
    this.saveToStorage();
    this.render();
    window.notifications.success('Comparador vaciado');
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

  render() {
    // Actualizar contador en header
    const counter = document.getElementById('comparator-count');
    if (counter) {
      counter.textContent = this.products.length;
      counter.style.display = this.products.length > 0 ? 'block' : 'none';
    }

    // Renderizar comparador flotante
    this.renderFloatingComparator();
  }

  renderFloatingComparator() {
    let comparator = document.getElementById('floating-comparator');
    
    if (!comparator && this.products.length > 0) {
      comparator = document.createElement('div');
      comparator.id = 'floating-comparator';
      comparator.className = 'floating-comparator';
      document.body.appendChild(comparator);
    }

    if (comparator) {
      if (this.products.length === 0) {
        comparator.remove();
        return;
      }

      comparator.innerHTML = `
        <div class="comparator-header">
          <h4><i class="fas fa-balance-scale"></i> Comparador (${this.products.length}/${this.maxProducts})</h4>
          <button class="clear-comparator" title="Vaciar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="comparator-products">
          ${this.products.map(product => `
            <div class="comparator-product">
              <img src="${product.image_url || 'https://via.placeholder.com/100'}" alt="${product.name}">
              <span class="product-name">${product.name.substring(0, 20)}...</span>
              <button class="remove-from-comparator" data-product-id="${product.id}" title="Eliminar">
                <i class="fas fa-times"></i>
              </button>
            </div>
          `).join('')}
        </div>
        <button class="compare-now">
          <i class="fas fa-balance-scale"></i> Comparar Ahora
        </button>
      `;
    }
  }

  getProducts() {
    return this.products;
  }
}

// Inicializar comparador
window.productComparator = new ProductComparator();





