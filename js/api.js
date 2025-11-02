// 🚀 FutureLabs API Client
class FutureLabsAPI {
  constructor() {
    this.baseURL = 'https://futurelabs-production.up.railway.app/api';
    this.token = localStorage.getItem('auth_token');
  }

  // Helper para hacer requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Agregar token si existe
    if (this.token) {
      config.headers['Authorization'] = `Bearer ${this.token}`;
      console.log('🔑 Token enviado en request:', this.token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ No hay token en request');
    }

    try {
      console.log('📤 Request a:', url);
      const response = await fetch(url, config);
      console.log('📥 Response status:', response.status);
      
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (!response.ok) {
        console.error('❌ Response not ok:', data.message);
        throw new Error(data.message || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error('❌ Error en API:', error);
      throw error;
    }
  }

  // Guardar token
  setToken(token) {
    console.log('🔑 API.setToken() - Token:', token ? token.substring(0, 20) + '...' : 'null');
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
      console.log('💾 Token guardado en localStorage');
    } else {
      localStorage.removeItem('auth_token');
      console.log('🧹 Token eliminado de localStorage');
    }
  }

  // ========== AUTENTICACIÓN ==========

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout() {
    console.log('🚪 API.logout() - Iniciando...');
    try {
      // Solo intentar logout en el backend si hay token
      if (this.token) {
        console.log('📤 Enviando petición de logout al backend...');
        await this.request('/auth/logout', {
          method: 'POST'
        });
        console.log('✅ Respuesta del backend recibida');
      } else {
        console.log('⚠️ No hay token, saltando petición al backend');
      }
      
      // Siempre limpiar el token local
      this.setToken(null);
      console.log('✅ Logout completado en API');
    } catch (error) {
      console.error('❌ Error en API.logout():', error);
      // Aún así, limpiar el token local
      this.setToken(null);
      throw error;
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // ========== PRODUCTOS ==========

  async getProducts(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/products?${params.toString()}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async getProductBySlug(slug) {
    return this.request(`/products/slug/${slug}`);
  }

  async getFeaturedProducts(limit = 8) {
    return this.request(`/products/featured?limit=${limit}`);
  }

  async getOnSaleProducts(limit = 8) {
    return this.request(`/products/on-sale?limit=${limit}`);
  }

  async getProductsByCategory(categorySlug, filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/products/category/${categorySlug}?${params.toString()}`);
  }

  // ========== CATEGORÍAS ==========

  async getCategories() {
    return this.request('/categories');
  }

  async getCategory(id) {
    return this.request(`/categories/${id}`);
  }

  async getCategoryBySlug(slug) {
    return this.request(`/categories/slug/${slug}`);
  }

  // ========== CARRITO ==========

  async getCart() {
    return this.request('/cart');
  }

  async addToCart(productId, quantity = 1) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity })
    });
  }

  async updateCartItem(productId, quantity) {
    return this.request('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ product_id: productId, quantity })
    });
  }

  async removeFromCart(productId) {
    return this.request('/cart/remove', {
      method: 'DELETE',
      body: JSON.stringify({ product_id: productId })
    });
  }

  async clearCart() {
    return this.request('/cart/clear', {
      method: 'DELETE'
    });
  }

  async getCartCount() {
    return this.request('/cart/count');
  }

  // ========== PEDIDOS ==========

  async getOrders() {
    return this.request('/orders');
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async getOrderByNumber(orderNumber) {
    return this.request(`/orders/number/${orderNumber}`);
  }

  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  // ========== PAGOS ==========

  async createStripePaymentIntent(orderData) {
    return this.request('/payments/stripe/create-intent', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async processStripePayment(orderId, paymentMethodId) {
    return this.request('/payments/stripe/process', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, payment_method_id: paymentMethodId })
    });
  }

  async confirmStripePayment(orderId, clientSecret) {
    return this.request('/payments/stripe/confirm', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, client_secret: clientSecret })
    });
  }

  async processPayPalPayment(orderId, paypalOrderId) {
    return this.request('/payments/paypal/process', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, paypal_order_id: paypalOrderId })
    });
  }

  async processMobilePayment(orderId, phoneNumber, amount) {
    return this.request('/payments/mobile/process', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, phone_number: phoneNumber, amount })
    });
  }

  async processCashPayment(orderId) {
    return this.request('/payments/cash/process', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId })
    });
  }

  // ===== REVIEWS =====
  async getProductReviews(productId, limit = null) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/reviews/product/${productId}${params}`);
  }

  async createReview(productId, rating, title, comment, verifiedPurchase = false) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        rating,
        title,
        comment,
        verified_purchase: verifiedPurchase
      })
    });
  }

  async getUserReviews() {
    return this.request('/reviews/user');
  }

  async updateReview(reviewId, rating, title, comment) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify({ rating, title, comment })
    });
  }

  async deleteReview(reviewId) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'DELETE'
    });
  }

  // ===== USERS =====
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    });
  }

  // ===== VERIFICATION =====
  async verifyEmail(email, code) {
    return this.request('/verification/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code })
    });
  }

  async resendVerificationCode(email) {
    return this.request('/verification/resend-code', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  // ===== PASSWORD RECOVERY =====
  async requestPasswordRecovery(email) {
    return this.request('/password-recovery/request', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async resetPassword(token, password) {
    return this.request('/password-recovery/reset', {
      method: 'POST',
      body: JSON.stringify({ token, password })
    });
  }

  // ===== BLOG =====
  async getBlogPosts(page = 1, limit = 10) {
    return this.request(`/blog?page=${page}&limit=${limit}`);
  }

  async getRecentBlogPosts(limit = 5) {
    return this.request(`/blog/recent?limit=${limit}`);
  }

  async getBlogPostBySlug(slug) {
    return this.request(`/blog/${slug}`);
  }

  async getBlogPostById(id) {
    return this.request(`/blog/admin/${id}`);
  }

  async getAllBlogPosts(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/blog/admin/all?${query}`);
  }

  async createBlogPost(postData) {
    return this.request('/blog', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  }

  async updateBlogPost(id, postData) {
    return this.request(`/blog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData)
    });
  }

  async deleteBlogPost(id) {
    return this.request(`/blog/${id}`, {
      method: 'DELETE'
    });
  }

  // ===== RELATED PRODUCTS =====
  async getRelatedProducts(productId, limit = 4) {
    return this.request(`/related-products/${productId}?limit=${limit}`);
  }

  async getRecommendedForUser(userId, limit = 8) {
    return this.request(`/related-products/recommended/${userId}?limit=${limit}`);
  }

  async getPopularProducts(limit = 8) {
    return this.request(`/related-products/popular/all?limit=${limit}`);
  }

  async getTopSellingProducts(limit = 8, categoryId = null) {
    const url = categoryId 
      ? `/related-products/popular/top-selling?limit=${limit}&category_id=${categoryId}`
      : `/related-products/popular/top-selling?limit=${limit}`;
    return this.request(url);
  }

  // ===== LOYALTY POINTS =====
  async getLoyaltyPoints() {
    return this.request('/loyalty/points');
  }

  async getLoyaltyTransactions(limit = 20) {
    return this.request(`/loyalty/transactions?limit=${limit}`);
  }

  async calculateLoyaltyDiscount(totalAmount) {
    return this.request('/loyalty/calculate-discount', {
      method: 'POST',
      body: JSON.stringify({ total_amount: totalAmount })
    });
  }

  async redeemLoyaltyPoints(pointsToRedeem) {
    return this.request('/loyalty/redeem', {
      method: 'POST',
      body: JSON.stringify({ points_to_redeem: pointsToRedeem })
    });
  }

  // ===== SEARCH =====
  async getSearchSuggestions(query) {
    return this.request(`/search/suggestions?q=${encodeURIComponent(query)}`);
  }

  async advancedSearch(params) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/search/advanced?${query}`);
  }

  // ===== WISHLIST =====
  async getWishlist() {
    return this.request('/wishlist');
  }

  async addToWishlist(productId) {
    return this.request(`/wishlist/${productId}`, {
      method: 'POST'
    });
  }

  async removeFromWishlist(productId) {
    return this.request(`/wishlist/${productId}`, {
      method: 'DELETE'
    });
  }

  async checkWishlist(productId) {
    return this.request(`/wishlist/check/${productId}`);
  }

  async clearWishlist() {
    return this.request('/wishlist', {
      method: 'DELETE'
    });
  }

  // ===== COUPONS =====
  async validateCoupon(code, totalAmount, items = []) {
    return this.request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, total_amount: totalAmount, items })
    });
  }

  async getCoupons() {
    return this.request('/coupons');
  }

  async createCoupon(couponData) {
    return this.request('/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData)
    });
  }

  async updateCoupon(couponId, couponData) {
    return this.request(`/coupons/${couponId}`, {
      method: 'PUT',
      body: JSON.stringify(couponData)
    });
  }

  async deleteCoupon(couponId) {
    return this.request(`/coupons/${couponId}`, {
      method: 'DELETE'
    });
  }

  // ===== ADMIN =====
  async get(url) {
    return this.request(url);
  }

  async post(url, data) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(url, data) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(url) {
    return this.request(url, {
      method: 'DELETE'
    });
  }

  // ===== UPLOAD =====
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${this.baseURL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });
    
    const data = await response.json();
    return data;
  }

  async uploadImages(files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await fetch(`${this.baseURL}/upload/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });
    
    const data = await response.json();
    return data;
  }

  async deleteImage(filename) {
    return this.request(`/upload/${filename}`, {
      method: 'DELETE'
    });
  }
}

// Crear instancia global
window.api = new FutureLabsAPI();

// Inicializar con token si existe
if (window.api.token) {
  console.log('✅ API inicializada con token');
} else {
  console.log('⚠️ API inicializada sin token (modo invitado)');
}
