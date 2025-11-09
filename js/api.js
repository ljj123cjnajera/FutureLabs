// 🚀 FutureLabs API Client

(function initPageProgress() {
  if (window.pageProgress) return;

  let container = null;
  let bar = null;
  let activeRequests = 0;
  let progress = 0;
  let trickleTimer = null;

  const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

  function ensureBar() {
    if (container && bar) return;

    container = document.createElement('div');
    container.id = 'pageProgress';
    container.className = 'page-progress';

    bar = document.createElement('div');
    bar.className = 'page-progress-bar';

    container.appendChild(bar);
    document.body.appendChild(container);
  }

  function setProgress(value) {
    ensureBar();
    progress = clamp(value);
    bar.style.width = `${progress * 100}%`;
  }

  function startTrickle() {
    if (trickleTimer) return;
    trickleTimer = setInterval(() => {
      if (progress >= 0.95) return;
      const delta = (Math.random() * 3 + 2) / 100;
      setProgress(progress + delta);
    }, 400);
  }

  function stopTrickle() {
    if (trickleTimer) {
      clearInterval(trickleTimer);
      trickleTimer = null;
    }
  }

  function begin() {
    activeRequests += 1;
    ensureBar();
    container.classList.add('is-active');
    container.classList.remove('is-complete');
    if (activeRequests === 1) {
      setProgress(0.08);
      startTrickle();
    } else {
      setProgress(progress + 0.05);
    }
  }

  function end() {
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests > 0) {
      setProgress(progress + 0.05);
      return;
    }

    stopTrickle();
    setProgress(1);
    container.classList.add('is-complete');
    setTimeout(() => {
      container.classList.remove('is-active');
      bar.style.width = '0%';
      progress = 0;
    }, 300);
  }

  window.pageProgress = {
    begin,
    end,
    set: setProgress
  };
})();
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
      window.pageProgress?.begin?.();
      console.log('📤 Request a:', url);
      const response = await fetch(url, config);
      console.log('📥 Response status:', response.status);
      
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (!response.ok) {
        console.error('❌ Response not ok:', data.message);
        const error = new Error(data.message || 'Error en la petición');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error en API:', error);
      throw error;
    } finally {
      window.pageProgress?.end?.();
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

  async getProductById(id) {
    return this.getProduct(id);
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

  // ===== ADDRESSES =====
  async getAddresses() {
    return this.request('/addresses');
  }

  async getAddress(addressId) {
    return this.request(`/addresses/${addressId}`);
  }

  async getDefaultAddress() {
    return this.request('/addresses/default');
  }

  async createAddress(addressData) {
    return this.request('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData)
    });
  }

  async updateAddress(addressId, addressData) {
    return this.request(`/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData)
    });
  }

  async deleteAddress(addressId) {
    return this.request(`/addresses/${addressId}`, {
      method: 'DELETE'
    });
  }

  async setDefaultAddress(addressId) {
    return this.request(`/addresses/${addressId}/set-default`, {
      method: 'PUT'
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

  async addToWishlist(productId, listId = null) {
    const options = { method: 'POST' };

    if (listId) {
      options.body = JSON.stringify({ list_id: listId });
    }

    return this.request(`/wishlist/${productId}`, options);
  }

  async removeFromWishlist(productId, listId = null) {
    const options = { method: 'DELETE' };

    if (listId) {
      options.body = JSON.stringify({ list_id: listId });
    }

    return this.request(`/wishlist/${productId}`, options);
  }

  async checkWishlist(productId, listId = null) {
    const query = listId ? `?list_id=${encodeURIComponent(listId)}` : '';
    return this.request(`/wishlist/check/${productId}${query}`);
  }

  async clearWishlist(listId = null) {
    const options = { method: 'DELETE' };

    if (listId) {
      options.body = JSON.stringify({ list_id: listId });
    }

    return this.request('/wishlist', options);
  }

  async createWishlistList(listData) {
    return this.request('/wishlist/lists', {
      method: 'POST',
      body: JSON.stringify(listData)
    });
  }

  async updateWishlistList(listId, listData) {
    return this.request(`/wishlist/lists/${listId}`, {
      method: 'PUT',
      body: JSON.stringify(listData)
    });
  }

  async deleteWishlistList(listId, { deleteItems = false } = {}) {
    return this.request(`/wishlist/lists/${listId}`, {
      method: 'DELETE',
      body: JSON.stringify({ delete_items: deleteItems })
    });
  }

  async setDefaultWishlistList(listId) {
    return this.request(`/wishlist/lists/${listId}/set-default`, {
      method: 'POST'
    });
  }

  async moveWishlistItem(productId, fromListId, toListId) {
    return this.request('/wishlist/items/move', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        from_list_id: fromListId,
        to_list_id: toListId
      })
    });
  }

  // ===== COUPONS =====
  async validateCoupon(code, totalAmount, items = []) {
    return this.request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, total_amount: totalAmount, items })
    });
  }

  async getAvailableCoupons() {
    return this.request('/coupons/available');
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
    try {
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
      
      if (!response.ok) {
        return {
          success: false,
          message: data.message || `Error ${response.status}: ${response.statusText}`
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        message: error.message || 'Error al subir imagen'
      };
    }
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

  // ===== HOME CONTENT =====
  // Público
  async getHomeContent() {
    return this.request('/home-content/all');
  }

  async getHeroSlides() {
    return this.request('/home-content/hero-slides');
  }

  async getBanners(type = null, position = null) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (position) params.append('position', position);
    const query = params.toString();
    return this.request(`/home-content/banners${query ? '?' + query : ''}`);
  }

  async getBenefits() {
    return this.request('/home-content/benefits');
  }

  async getHomeSections() {
    return this.request('/home-content/sections');
  }

  // Admin - Hero Slides
  async getAdminHeroSlides() {
    return this.request('/home-content/admin/hero-slides');
  }

  async createHeroSlide(slideData) {
    return this.request('/home-content/admin/hero-slides', {
      method: 'POST',
      body: JSON.stringify(slideData)
    });
  }

  async updateHeroSlide(slideId, slideData) {
    return this.request(`/home-content/admin/hero-slides/${slideId}`, {
      method: 'PUT',
      body: JSON.stringify(slideData)
    });
  }

  async deleteHeroSlide(slideId) {
    return this.request(`/home-content/admin/hero-slides/${slideId}`, {
      method: 'DELETE'
    });
  }

  // Admin - Banners
  async getAdminBanners() {
    return this.request('/home-content/admin/banners');
  }

  async createBanner(bannerData) {
    return this.request('/home-content/admin/banners', {
      method: 'POST',
      body: JSON.stringify(bannerData)
    });
  }

  async updateBanner(bannerId, bannerData) {
    return this.request(`/home-content/admin/banners/${bannerId}`, {
      method: 'PUT',
      body: JSON.stringify(bannerData)
    });
  }

  async deleteBanner(bannerId) {
    return this.request(`/home-content/admin/banners/${bannerId}`, {
      method: 'DELETE'
    });
  }

  // Admin - Benefits
  async getAdminBenefits() {
    return this.request('/home-content/admin/benefits');
  }

  async createBenefit(benefitData) {
    return this.request('/home-content/admin/benefits', {
      method: 'POST',
      body: JSON.stringify(benefitData)
    });
  }

  async updateBenefit(benefitId, benefitData) {
    return this.request(`/home-content/admin/benefits/${benefitId}`, {
      method: 'PUT',
      body: JSON.stringify(benefitData)
    });
  }

  async deleteBenefit(benefitId) {
    return this.request(`/home-content/admin/benefits/${benefitId}`, {
      method: 'DELETE'
    });
  }

  // Admin - Home Sections
  async getAdminSections() {
    return this.request('/home-content/admin/sections');
  }

  async createHomeSection(sectionData) {
    return this.request('/home-content/admin/sections', {
      method: 'POST',
      body: JSON.stringify(sectionData)
    });
  }

  async updateHomeSection(sectionId, sectionData) {
    return this.request(`/home-content/admin/sections/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify(sectionData)
    });
  }

  async deleteHomeSection(sectionId) {
    return this.request(`/home-content/admin/sections/${sectionId}`, {
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
