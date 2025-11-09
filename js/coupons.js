// 🎟️ Sistema de Cupones - FutureLabs

class CouponsManager {
  constructor() {
    this.appliedCoupon = null;
    this.discount = 0;
    this.originalTotal = 0;
    this.cartTotal = 0;
    this.cartItems = [];
    this.containerId = 'couponSection';
    this.context = 'cart';
    this.availableCoupons = [];
    this.availableCouponsLoaded = false;
    this.availableCouponsLoading = false;
    this.initialized = false;
  }

  init(options = {}) {
    this.initialized = true;
    if (options.context) {
      this.context = options.context;
    }
    if (options.containerId) {
      this.containerId = options.containerId;
    }
    if (Array.isArray(options.items)) {
      this.setCartItems(options.items);
    }
    if (typeof options.total !== 'undefined') {
      this.cartTotal = Number(options.total) || 0;
    }

    this.renderCouponForm(this.containerId);

    if (!this.availableCouponsLoaded && !this.availableCouponsLoading) {
      this.loadAvailableCoupons().catch((error) =>
        console.error('Error inicializando cupones:', error)
      );
    }
  }

  setCartContext(items = [], total = 0) {
    this.setCartItems(items);
    this.cartTotal = Number(total) || 0;
  }

  setCartItems(items = []) {
    this.cartItems = items.map((item) => ({
      product_id: item.product_id || item.id || null,
      category_id: item.category_id || null,
      brand: item.brand || null
    }));
  }

  async loadAvailableCoupons(force = false) {
    if (this.availableCouponsLoaded && !force) {
      return this.availableCoupons;
    }

    this.availableCouponsLoading = true;

    try {
      const response = await window.api.getAvailableCoupons();

      if (response?.success) {
        this.availableCoupons = response.data?.coupons || [];
      } else {
        this.availableCoupons = [];
      }

      this.availableCouponsLoaded = true;
    } catch (error) {
      console.error('Error cargando cupones disponibles:', error);
      this.availableCoupons = [];
      this.availableCouponsLoaded = true;
      this.setStatus('No pudimos cargar los cupones disponibles en este momento.', 'warning');
    } finally {
      this.availableCouponsLoading = false;
      this.renderAvailableCouponsList();
    }

    return this.availableCoupons;
  }

  async applyCoupon(code, options = {}) {
    const { silent = false } = options;
    const trimmedCode = (code || '').trim().toUpperCase();

    if (!trimmedCode) {
      if (!silent) {
        this.setStatus('Ingresa un código de cupón válido.', 'warning');
        window.notifications?.warning?.('Ingresa un código de cupón');
      }
      return { success: false, message: 'Código vacío' };
    }

    try {
      const total = typeof options.total !== 'undefined' ? options.total : this.cartTotal;
      const items = Array.isArray(options.items) ? options.items : this.cartItems;

      const response = await window.api.validateCoupon(trimmedCode, total, items);

      if (response?.success) {
        this.appliedCoupon = response.data?.coupon || null;
        this.discount = parseFloat(response.data?.discount || 0);
        this.originalTotal = Number(total) || 0;

        if (!silent) {
          const description =
            this.appliedCoupon?.description || 'Descuento aplicado correctamente';
          this.setStatus(description, 'success');
          window.notifications?.success?.(`Cupón "${trimmedCode}" aplicado`);
        }

        this.renderCouponForm();
        this.emitUpdate();

        return {
          success: true,
          coupon: this.appliedCoupon,
          discount: this.discount,
          newTotal: this.calculateNewTotal(total)
        };
      }

      throw new Error(response?.message || 'Cupón inválido');
    } catch (error) {
      console.error('Error al aplicar cupón:', error);

      if (!silent) {
        const message = error?.message || 'Error al aplicar el cupón';
        this.setStatus(message, 'error');
        window.notifications?.error?.(message);
      }

      return {
        success: false,
        message: error?.message
      };
    }
  }

  removeCoupon(options = {}) {
    const { silent = false } = options;

    this.appliedCoupon = null;
    this.discount = 0;
    this.originalTotal = 0;

    if (!silent) {
      this.setStatus('Cupón removido', 'info');
      window.notifications?.info?.('Cupón removido');
    }

    this.renderCouponForm();
    this.emitUpdate();
  }

  hasCoupon() {
    return Boolean(this.appliedCoupon);
  }

  getAppliedCoupon() {
    return this.appliedCoupon;
  }

  getDiscount() {
    return Number(this.discount) || 0;
  }

  calculateNewTotal(total = this.cartTotal) {
    const base = Number(total) || 0;
    const discount = this.getDiscount();
    return Math.max(0, parseFloat((base - discount).toFixed(2)));
  }

  emitUpdate() {
    const detail = {
      applied: this.hasCoupon(),
      discount: this.getDiscount(),
      coupon: this.getAppliedCoupon(),
      total: this.cartTotal,
      totalWithDiscount: this.calculateNewTotal()
    };

    window.dispatchEvent(new CustomEvent('couponUpdated', { detail }));
  }

  renderCouponForm(containerId = this.containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="coupon-widget">
        ${this.hasCoupon() ? this.renderAppliedCouponContent() : this.renderCouponFormContent()}
        <section class="coupon-suggestions">
          <header class="coupon-suggestions-header">
            <h4><i class="fas fa-lightbulb"></i> Cupones sugeridos</h4>
            <p>Elige uno de nuestros cupones activos y se aplicará automáticamente.</p>
          </header>
          <div class="coupon-suggestions-body" data-role="coupon-available-list">
            ${this.renderAvailableCouponsPlaceholder()}
          </div>
        </section>
      </div>
    `;

    if (this.availableCouponsLoaded) {
      this.renderAvailableCouponsList();
    }
  }

  renderCouponFormContent() {
    return `
      <section class="coupon-form">
        <h4><i class="fas fa-tag"></i> ¿Tienes un cupón?</h4>
        <div class="coupon-input-group">
          <input
            type="text"
            class="form-input"
            id="couponCode"
            data-role="coupon-input"
            placeholder="Ingresa tu código de cupón"
            autocomplete="off"
          >
          <button class="btn btn-primary" type="button" onclick="applyCoupon()">
            <i class="fas fa-check"></i> Aplicar
          </button>
        </div>
        <div class="coupon-message" data-role="coupon-message"></div>
      </section>
    `;
  }

  renderAppliedCouponContent() {
    const coupon = this.getAppliedCoupon();
    const discountLabel = this.getCouponDiscountLabel(coupon);

    return `
      <section class="coupon-applied">
        <div class="applied-coupon">
          <div class="coupon-info">
            <i class="fas fa-badge-check"></i>
            <div class="coupon-details">
              <div class="coupon-code">
                ${coupon?.code || ''}
                <span class="coupon-badge"><i class="fas fa-check"></i> Activo</span>
              </div>
              <div class="coupon-description">
                ${coupon?.description || 'Descuento aplicado correctamente'}
              </div>
            </div>
          </div>
          <div class="coupon-discount">
            ${discountLabel}
          </div>
          <button class="btn btn-ghost btn-sm" type="button" onclick="removeCoupon()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="coupon-message" data-role="coupon-message"></div>
      </section>
    `;
  }

  renderAvailableCouponsPlaceholder() {
    if (this.availableCouponsLoading) {
      return this.renderSkeletonCards();
    }

    if (this.availableCouponsLoaded && this.availableCoupons.length === 0) {
      return `
        <div class="empty-state">
          <i class="fas fa-ticket-alt"></i>
          <p>No hay cupones disponibles por ahora. Vuelve pronto para nuevas promociones.</p>
        </div>
      `;
    }

    return '<div class="coupons-list"></div>';
  }

  renderAvailableCouponsList() {
    const container = document
      .getElementById(this.containerId)
      ?.querySelector('[data-role="coupon-available-list"]');

    if (!container) {
      return;
    }

    if (this.availableCouponsLoading) {
      container.innerHTML = this.renderSkeletonCards();
      return;
    }

    if (this.availableCoupons.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-ticket-alt"></i>
          <p>No hay cupones disponibles por ahora.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="coupons-list">
        ${this.availableCoupons.map((coupon) => this.renderCouponCard(coupon)).join('')}
      </div>
    `;
  }

  renderSkeletonCards(count = 3) {
    return `
      <div class="coupons-list skeleton">
        ${Array.from({ length: count })
          .map(
            () => `
              <div class="coupon-card skeleton-card">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line"></div>
              </div>
            `
          )
          .join('')}
      </div>
    `;
  }

  renderCouponCard(coupon) {
    const isActive = this.appliedCoupon?.code === coupon.code;
    const discountLabel = this.getCouponDiscountLabel(coupon);
    const validity = this.formatCouponValidity(coupon);
    const remainingUses = this.getRemainingUsesLabel(coupon);

    return `
      <article class="coupon-card ${isActive ? 'active' : ''}" data-code="${coupon.code}">
        <div class="coupon-card-header">
          <span class="coupon-card-code">${coupon.code}</span>
          <span class="coupon-card-discount">${discountLabel}</span>
        </div>
        <div class="coupon-card-body">
          <h5 class="coupon-card-title">${coupon.description || 'Cupón disponible'}</h5>
          <p class="coupon-card-description">
            ${this.getCouponSummary(coupon)}
          </p>
          <div class="coupon-card-validity">
            <i class="fas fa-calendar-alt"></i>
            ${validity}
          </div>
        </div>
        <div class="coupon-card-footer">
          <span class="coupon-card-conditions">${remainingUses}</span>
          <button
            type="button"
            class="coupon-card-apply"
            ${isActive ? 'disabled' : ''}
            onclick="applyCouponFromCard('${coupon.code}')"
          >
            ${isActive ? '<i class="fas fa-check"></i> Aplicado' : 'Usar cupón'}
          </button>
        </div>
      </article>
    `;
  }

  getCouponDiscountLabel(coupon) {
    if (!coupon) {
      return `-S/ ${this.getDiscount().toFixed(2)}`;
    }

    if (coupon.type === 'percentage') {
      return `-${Number(coupon.value || 0)}%`;
    }

    return `-S/ ${Number(coupon.value || 0).toFixed(2)}`;
  }

  getCouponSummary(coupon) {
    const minPurchase = Number(coupon.min_purchase || coupon.min_order_amount || 0);
    if (minPurchase > 0) {
      return `Aplica en compras desde S/ ${minPurchase.toFixed(2)}.`;
    }
    return 'Disponible para tus próximas compras.';
  }

  formatCouponValidity(coupon) {
    if (!coupon?.valid_until) {
      return 'Sin fecha de expiración definida';
    }

    const formattedDate = this.formatDate(coupon.valid_until);
    if (typeof coupon.expires_in_days === 'number') {
      if (coupon.expires_in_days < 0) {
        return `Expirado el ${formattedDate}`;
      }

      if (coupon.expires_in_days === 0) {
        return `Expira hoy (${formattedDate})`;
      }

      if (coupon.expires_in_days === 1) {
        return `Expira mañana (${formattedDate})`;
      }

      return `Válido hasta ${formattedDate} (${coupon.expires_in_days} días)`;
    }

    return `Válido hasta ${formattedDate}`;
  }

  getRemainingUsesLabel(coupon) {
    if (!coupon.max_uses) {
      return 'Usos ilimitados';
    }

    const remaining = Math.max(
      0,
      coupon.max_uses - (coupon.used_count || 0)
    );

    return remaining === 0
      ? 'Usos agotados'
      : `${remaining} uso${remaining !== 1 ? 's' : ''} disponible${remaining !== 1 ? 's' : ''}`;
  }

  formatDate(dateValue) {
    if (!dateValue) return '';

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  setStatus(message, status = 'info') {
    const container = document.getElementById(this.containerId);
    const messageElement = container?.querySelector('[data-role="coupon-message"]');

    if (!messageElement) return;

    messageElement.textContent = message || '';
    messageElement.className = `coupon-message is-${status}`;
  }

  getCouponInput() {
    const container = document.getElementById(this.containerId);
    return (
      container?.querySelector('[data-role="coupon-input"]') ||
      document.getElementById('couponCode')
    );
  }

  prefillCode(code) {
    const input = this.getCouponInput();
    if (input) {
      input.value = code;
      input.focus();
    }
  }
}

window.couponsManager = new CouponsManager();

async function applyCoupon() {
  const input = window.couponsManager.getCouponInput();
  const code = input?.value || '';

  const result = await window.couponsManager.applyCoupon(code);

  if (result.success && input) {
    input.value = '';
  }
}

function removeCoupon() {
  window.couponsManager.removeCoupon();
}

function renderCouponInfo(containerId) {
  if (containerId) {
    window.couponsManager.renderCouponForm(containerId);
  } else {
    window.couponsManager.renderCouponForm();
  }
}

function updateCartTotals() {
  window.couponsManager.emitUpdate();
}

async function applyCouponFromCard(code) {
  if (!code) return;
  window.couponsManager.prefillCode(code);
  await applyCoupon();
}

window.applyCoupon = applyCoupon;
window.removeCoupon = removeCoupon;
window.renderCouponInfo = renderCouponInfo;
window.updateCartTotals = updateCartTotals;
window.applyCouponFromCard = applyCouponFromCard;

