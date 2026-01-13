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
window.loadingState = (() => {
  const defaultMessages = {
    loading: 'Cargando...',
    empty: 'Sin resultados disponibles',
    error: 'Ocurrió un error al cargar la información'
  };

  function createContainer(message, options = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = options.className || 'loading-state';
    if (options.variant) {
      wrapper.classList.add(`loading-state-${options.variant}`);
    }
    wrapper.innerHTML = `
      <div class="loading-state-content">
        ${options.spinner !== false ? '<div class="loading-spinner"></div>' : ''}
        <p>${message}</p>
      </div>
    `;
    return wrapper;
  }

  function render(target, message, options = {}) {
    const container = typeof target === 'string' ? document.querySelector(target) : target;
    if (!container) return;
    container.innerHTML = '';
    container.appendChild(createContainer(message, options));
  }

  return {
    renderLoading(target, message = defaultMessages.loading, options = {}) {
      render(target, message, { ...options, variant: 'loading' });
    },
    renderEmpty(target, message = defaultMessages.empty, options = {}) {
      render(target, message, { ...options, variant: 'empty', spinner: false });
    },
    renderError(target, message = defaultMessages.error, options = {}) {
      render(target, message, { ...options, variant: 'error', spinner: false });
    }
  };
})();
class SneakersAPI {
  constructor() {
    // 🌍 PRODUCTION API (Railway)
    this.baseURL = 'https://futurelabs-production.up.railway.app/api';
    // Localhost Fallback (only for local dev if needed): http://localhost:3000/api
    this.token = localStorage.getItem('auth_token');
  }

  // 🎭 MOCK HELPER (Disabled by default - User Request)
  mockResponse(endpoint, options) {
    // ... (Mock logic remains as dead code/fallback if needed manually) ...
    return new Promise(resolve => resolve({ success: false, message: 'Mock Mode Disabled' }));
  }

  // Helper para hacer requests
  async request(endpoint, options = {}) {
    // Override: Always use Real Backend
    const method = options.method ? options.method.toUpperCase() : 'GET';
    let effectiveEndpoint = endpoint;

    // Parameter anti-cache (Safari) - only add if endpoint is valid
    if (method === 'GET' && endpoint && endpoint.trim() !== '') {
      const separator = endpoint.includes('?') ? '&' : '?';
      effectiveEndpoint = `${endpoint}${separator}_=${Date.now()}`;
    }

    const performRequest = async (retrying = false) => {
      const url = `${this.baseURL}${effectiveEndpoint}`;
      const config = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        },
        cache: 'no-store'
      };

      if (this.token) {
        config.headers['Authorization'] = `Bearer ${this.token}`;
      }

      try {
        window.pageProgress?.begin?.();

        let response;
        try {
          response = await fetch(url, config);
        } catch (netError) {
          if (window.Logger) window.Logger.error('❌ Backend Connection Failed (Real API):', netError);
          // NO FALLBACK TO MOCK - User requested strict backend connection
          throw netError;
        }

        // console.log('📥 Response status:', response.status);

        const parseResponse = async (resp) => {
          let data = {};
          const contentLength = resp.headers.get('content-length');
          const hasBody = resp.status !== 204 && resp.status !== 205 &&
            (contentLength === null || parseInt(contentLength, 10) > 0);

          if (hasBody) {
            const text = await resp.text();
            if (text) {
              try { data = JSON.parse(text); }
              catch (e) { data = { raw: text }; }
            }
          }

          if (!resp.ok) {
            const error = new Error(data?.message || 'Error en la petición');
            error.status = resp.status;
            error.data = data;
            throw error;
          }
          return data;
        };

        return parseResponse(response);

      } catch (error) {
        if (window.Logger) window.Logger.error('❌ Error API:', error);
        throw error;
      } finally {
        window.pageProgress?.end?.();
      }
    };

    return performRequest();
  }

  // Guardar token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
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
    if (window.Logger) window.Logger.log('🚪 API.logout() - Iniciando...');
    try {
      // Solo intentar logout en el backend si hay token
      if (this.token) {
        if (window.Logger) window.Logger.log('📤 Enviando petición de logout al backend...');
        await this.request('/auth/logout', {
          method: 'POST'
        });
        if (window.Logger) window.Logger.log('✅ Respuesta del backend recibida');
      } else {
        if (window.Logger) window.Logger.log('⚠️ No hay token, saltando petición al backend');
      }

      // Siempre limpiar el token local
      this.setToken(null);
      if (window.Logger) window.Logger.log('✅ Logout completado en API');
    } catch (error) {
      if (window.Logger) window.Logger.error('❌ Error en API.logout():', error);
      // Aún así, limpiar el token local
      this.setToken(null);
      throw error;
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // ========== LOYALTY ==========

  async getLoyaltyPoints() {
    return this.request('/loyalty/points');
  }

  async getLoyaltyTransactions(limit = 20) {
    return this.request(`/loyalty/transactions?limit=${limit}`);
  }

  async redeemLoyaltyPoints(points) {
    return this.request('/loyalty/redeem', {
      method: 'POST',
      body: JSON.stringify({ points_to_redeem: points })
    });
  }

  // ========== PRODUCTOS ==========

  async getProducts(filters = {}) {
    if (window.Logger) window.Logger.log('🔵 [API] getProducts called with filters:', filters);
    // Clean filters - remove undefined/null/empty values, spaces, and convert booleans
    const cleanFilters = {};
    Object.keys(filters).forEach(key => {
      // Skip empty keys, undefined, null, empty strings, or keys with only spaces
      if (!key || key.trim() === '') return;
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '' && value !== ' ') {
        // Convert boolean to string 'true' or 'false'
        if (typeof value === 'boolean') {
          cleanFilters[key.trim()] = value.toString();
        } else if (typeof value === 'string' && value.trim() !== '') {
          cleanFilters[key.trim()] = value.trim();
        } else if (typeof value === 'number') {
          cleanFilters[key.trim()] = value.toString();
        }
      }
    });
    
    // Only create params if we have valid filters
    let queryString = '';
    if (Object.keys(cleanFilters).length > 0) {
      const params = new URLSearchParams(cleanFilters);
      queryString = params.toString();
    }
    
    return this.request(`/products${queryString ? `?${queryString}` : ''}`);
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

  async getTrendingProducts(limit = 8) {
    return this.request(`/products/trending?limit=${limit}`);
  }

  async getBestsellerProducts(limit = 8) {
    return this.request(`/products/bestseller?limit=${limit}`);
  }

  async getNewProducts(limit = 8) {
    return this.request(`/products/new?limit=${limit}`);
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

  // ========== HOME CONTENT ==========

  async getHomeHeroSlides() {
    return this.request('/home-content/hero-slides');
  }

  async getHomeBanners(filters = {}) {
    const params = new URLSearchParams(filters);
    const query = params.toString();
    return this.request(`/home-content/banners${query ? `?${query}` : ''}`);
  }

  async getHomeBenefits() {
    return this.request('/home-content/benefits');
  }

  async getHomeSections() {
    return this.request('/home-content/sections');
  }

  async getHomeContent() {
    return this.request('/home-content/all');
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

  async getStripePublicKey() {
    return this.request('/payments/stripe/public-key');
  }

  async getMobilePaymentInfo() {
    return this.request('/payments/mobile/info');
  }

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

  async processMobilePayment(orderId, phoneNumber, amount, paymentType = 'yape') {
    return this.request('/payments/mobile/process', {
      method: 'POST',
      body: JSON.stringify({
        order_id: orderId,
        phone_number: phoneNumber,
        amount,
        payment_type: paymentType
      })
    });
  }

  async processCashPayment(orderId) {
    return this.request('/payments/cash/process', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId })
    });
  }

  async processBankTransfer(orderId) {
    return this.request('/payments/bank-transfer/process', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId })
    });
  }

  async updateOrderPaymentIntent(orderId, paymentIntentId) {
    return this.request(`/orders/${orderId}/payment-intent`, {
      method: 'PUT',
      body: JSON.stringify({ payment_intent_id: paymentIntentId })
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


  // ========== BÚSQUEDA (AUTOCOMPLETE) ==========
  async getSearchSuggestions(query) {
    // Si la API tiene un endpoint específico de sugerencias:
    // return this.request(`/search/suggestions?q=${encodeURIComponent(query)}`);

    // Por ahora, simulamos sugerencias buscando productos reales
    try {
      const response = await this.request(`/products?search=${encodeURIComponent(query)}&limit=5`);

      if (response.success) {
        // Adaptar respuesta de productos a formato de sugerencias
        const products = response.data.products || response.data || [];
        const suggestions = products.map(p => ({
          type: 'product',
          id: p.id,
          name: p.name,
          slug: p.slug,
          image_url: p.image_url,
          price: p.price,
          discount_price: p.discount_price
        }));

        return {
          success: true,
          data: {
            suggestions: suggestions
          }
        };
      }
      return response;
    } catch (e) {
      if (window.Logger) window.Logger.error("Error en getSearchSuggestions:", e);
      return { success: false, message: e.message };
    }
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
      if (window.Logger) window.Logger.error('Error uploading image:', error);
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

  // ===== ADMIN PAYMENTS =====
  async getPaymentTransactions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.payment_method) params.append('payment_method', filters.payment_method);
    if (filters.order_id) params.append('order_id', filters.order_id);
    if (filters.user_email) params.append('user_email', filters.user_email);
    const query = params.toString();
    return this.request(`/admin/payments/transactions${query ? '?' + query : ''}`);
  }

  async getPendingPayments() {
    return this.request('/admin/payments/pending');
  }

  async getPaymentStatistics(filters = {}) {
    const params = new URLSearchParams();
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    const query = params.toString();
    return this.request(`/admin/payments/statistics${query ? '?' + query : ''}`);
  }

  async getPaymentTransaction(transactionId) {
    return this.request(`/admin/payments/transactions/${transactionId}`);
  }

  async confirmPayment(transactionId, adminNotes = null) {
    return this.request('/admin/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ transaction_id: transactionId, admin_notes: adminNotes })
    });
  }

  async updatePaymentStatus(transactionId, status) {
    return this.request(`/admin/payments/transactions/${transactionId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async getPaymentNotifications() {
    return this.request('/admin/payments/notifications');
  }

  // ========== CHAT ==========

  async sendChatMessage(data) {
    return this.request('/chat/send', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getChatMessages(conversationId) {
    return this.request(`/chat/conversation/${conversationId}`);
  }

  async getChatConversations() {
    return this.request('/chat/conversations');
  }
}

// 🚀 Initialize API Client
window.api = new SneakersAPI();

// Inicializar con token si existe
if (window.api.token) {
  if (window.Logger) window.Logger.log('✅ API inicializada con token');
} else {
  if (window.Logger) window.Logger.log('⚠️ API inicializada sin token (modo invitado)');
}
