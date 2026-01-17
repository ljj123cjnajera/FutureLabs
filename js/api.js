  async addToCart(productId, quantity = 1, options = {}) {
    const payload = { product_id: productId, quantity };
    if (options.size) {
      payload.size = options.size;
    }
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateCartItem(productId, quantity, options = {}) {
    const payload = { product_id: productId, quantity };
    if (options.size) {
      payload.size = options.size;
    }
    return this.request('/cart/update', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async removeFromCart(productId, options = {}) {
    const payload = { product_id: productId };
    if (options.size) {
      payload.size = options.size;
    }
    return this.request('/cart/remove', {
      method: 'DELETE',
      body: JSON.stringify(payload)
    });
  }
