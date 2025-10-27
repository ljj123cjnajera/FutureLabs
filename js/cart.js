// 🛒 Sistema de Carrito
class CartManager {
  constructor() {
    this.items = [];
    this.total = 0;
    this.count = 0;
    this.init();
  }

  async init() {
    // Cargar carrito si el usuario está autenticado
    if (window.authManager.isAuthenticated()) {
      await this.loadCart();
    }
  }

  async loadCart() {
    try {
      const response = await window.api.getCart();
      
      if (response.success) {
        this.items = response.data.items;
        this.total = response.data.total;
        this.count = response.data.count;
        this.updateCartUI();
      }
    } catch (error) {
      console.error('Error cargando carrito:', error);
    }
  }

  async add(productId, quantity = 1) {
    try {
      console.log('🛒 CartManager.add() - Iniciando');
      console.log('📦 productId:', productId);
      console.log('📊 quantity:', quantity);
      
      if (!productId) {
        console.error('❌ ProductId es undefined');
        this.showNotification('Error: ID de producto no válido', 'error');
        return false;
      }
      
      if (!window.authManager.isAuthenticated()) {
        this.showNotification('Debes iniciar sesión para agregar productos al carrito', 'warning');
        return false;
      }

      const response = await window.api.addToCart(productId, quantity);
      
      if (response.success) {
        await this.loadCart();
        this.showNotification('Producto agregado al carrito', 'success');
        return true;
      }
      
      return false;
    } catch (error) {
      this.showNotification('Error al agregar producto: ' + error.message, 'error');
      return false;
    }
  }

  async update(productId, quantity) {
    try {
      const response = await window.api.updateCartItem(productId, quantity);
      
      if (response.success) {
        await this.loadCart();
        return true;
      }
      
      return false;
    } catch (error) {
      this.showNotification('Error al actualizar carrito: ' + error.message, 'error');
      return false;
    }
  }

  async remove(productId) {
    try {
      const response = await window.api.removeFromCart(productId);
      
      if (response.success) {
        await this.loadCart();
        this.showNotification('Producto eliminado del carrito', 'success');
        return true;
      }
      
      return false;
    } catch (error) {
      this.showNotification('Error al eliminar producto: ' + error.message, 'error');
      return false;
    }
  }

  async clear() {
    try {
      const response = await window.api.clearCart();
      
      if (response.success) {
        this.items = [];
        this.total = 0;
        this.count = 0;
        this.updateCartUI();
        this.showNotification('Carrito limpiado', 'success');
        return true;
      }
      
      return false;
    } catch (error) {
      this.showNotification('Error al limpiar carrito: ' + error.message, 'error');
      return false;
    }
  }

  updateCartUI() {
    // Actualizar contador de carrito
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
      cartCountElement.textContent = this.count;
    }

    // Disparar evento personalizado
    const event = new CustomEvent('cartUpdated', {
      detail: {
        items: this.items,
        total: this.total,
        count: this.count
      }
    });
    document.dispatchEvent(event);
  }

  showNotification(message, type = 'info') {
    if (typeof window.notifications !== 'undefined') {
      window.notifications.show(message, type);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification(message, type);
    } else {
      alert(message);
    }
  }
}

// Crear instancia global
window.cartManager = new CartManager();

