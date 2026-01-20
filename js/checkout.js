
/**
 * 💳 CHECKOUT MANAGER V2 (Real Backend)
 * Connects to FutureLabs API for Addresses and Orders.
 */
class CheckoutManager {
    constructor() {
        this.currentStep = 1;
        this.steps = document.querySelectorAll('.step');
        this.formContainer = document.getElementById('checkoutContent');
        this.orderSummary = document.getElementById('orderSummary');

        this.cart = [];
        this.addresses = [];
        this.selectedAddressId = null;
        this.paymentMethod = 'card'; // Default
        this.loyaltyPointsAvailable = 0;
        this.loyaltyPointsUsed = 0;

        this.init();
    }

    /** Totales: subtotal, cupón, puntos, envío, total. 100 pts = S/ 1; máx 20% con puntos. */
    getTotals() {
        const subtotal = this.cart.reduce((sum, i) => {
            const p = parseFloat(i.discount_price || i.price || 0);
            return sum + (p * (i.quantity || 1));
        }, 0);
        const couponDiscount = (window.couponsManager && window.couponsManager.getDiscount) ? window.couponsManager.getDiscount() : 0;
        const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscount);
        const maxPointsSoles = subtotalAfterCoupon * 0.2;
        const maxPointsToUse = Math.min(this.loyaltyPointsAvailable, Math.floor(maxPointsSoles * 100));
        const effectivePoints = Math.min(this.loyaltyPointsUsed, maxPointsToUse);
        const loyaltyDiscount = effectivePoints / 100;
        const subtotalAfterLoyalty = Math.max(0, subtotalAfterCoupon - loyaltyDiscount);
        const shipping = subtotalAfterLoyalty >= 150 ? 0 : 15;
        const total = subtotalAfterLoyalty + shipping;
        return {
            subtotal,
            couponDiscount,
            loyaltyDiscount,
            shipping,
            total,
            loyaltyPointsEffective: effectivePoints
        };
    }

    async init() {
        if (window.Logger) window.Logger.log('💳 CheckoutManager V2 Starting...');

        // 0. Initialize UI Components (Header/Footer)
        if (window.Components) {
            const headerContainer = document.getElementById('mainHeader');
            if (headerContainer) {
                // Use simplified=true for header to keep checkout clean but consistent
                headerContainer.innerHTML = window.Components.getHeader(true, true);
                if (window.Components.initHeader) window.Components.initHeader();
                if (window.Components.initSearch) window.Components.initSearch();
            }

            const footerContainer = document.getElementById('mainFooter');
            if (footerContainer) {
                footerContainer.innerHTML = window.Components.getFooter();
            }
        }

        // 1. Auth Guard - REMOVED for Guest Checkout
        // if (!window.authManager || !window.authManager.isAuthenticated()) {
        //     window.location.href = 'login.html?returnUrl=checkout.html';
        //     return;
        // }

        // 2. Load Data
        await this.loadCart();
        await this.loadAddresses();
        await this.loadLoyaltyInfo();

        // 3. Render
        this.renderOrderSummary();
        this.renderStep(1);

        window.addEventListener('couponUpdated', () => {
            this.renderOrderSummary();
            if (this.currentStep === 3) this.renderReview();
        });

        this.setupNavButtons();
        this.updateNavButtons();
    }

    setupNavButtons() {
        var self = this;
        var prev = document.getElementById('btnPrevious');
        var next = document.getElementById('btnNext');
        if (prev) prev.addEventListener('click', function () {
            if (self.currentStep === 1) window.location.href = 'cart.html';
            else if (self.currentStep === 2) self.renderStep(1);
            else if (self.currentStep === 3) self.renderStep(2);
        });
        if (next) next.addEventListener('click', function () {
            if (self.currentStep === 1) self.nextStep();
            else if (self.currentStep === 2) self.renderStep(3);
            else if (self.currentStep === 3) self.placeOrder();
        });
    }

    updateNavButtons() {
        var n = this.currentStep;
        var next = document.getElementById('btnNext');
        var prev = document.getElementById('btnPrevious');
        if (!next || !prev) return;
        if (n === 4) return;
        prev.textContent = n === 1 ? 'CARRITO' : 'VOLVER';
        next.textContent = n === 1 ? 'CONTINUAR' : n === 2 ? 'REVISAR PEDIDO' : 'CONFIRMAR PEDIDO';
    }

    async loadLoyaltyInfo() {
        if (!window.authManager || !window.authManager.isAuthenticated() || !window.api) return;
        try {
            const res = await window.api.getLoyaltyPoints();
            this.loyaltyPointsAvailable = (res && res.success && res.data && res.data.points != null)
                ? Math.max(0, parseInt(res.data.points, 10)) : 0;
        } catch (e) {
            if (window.Logger) window.Logger.warn('Checkout: no se pudieron cargar puntos:', e);
            this.loyaltyPointsAvailable = 0;
        }
    }

    async loadCart() {
        if (window.LoadingStates && this.formContainer) {
            window.LoadingStates.show(this.formContainer, { message: 'Cargando carrito...', type: 'spinner' });
        }

        try {
            // Intentar cargar desde API primero
            if (window.authManager && window.authManager.isAuthenticated() && window.api) {
                const response = await window.api.getCart();
                this.cart = (response && response.success && response.data && response.data.items) ? response.data.items :
                    (Array.isArray(response) ? response : []);
            }

            if (!this.cart || this.cart.length === 0) {
                var stored = localStorage.getItem('brutalist_cart');
                if (stored) {
                    try { this.cart = JSON.parse(stored); } catch (_) { this.cart = []; }
                    if (this.cart && this.cart.length && !this.isGuest() && window.api && typeof window.api.addToCart === 'function') {
                        await this.syncCartToApi();
                    }
                }
            }

            if (!this.cart || this.cart.length === 0) {
                if (window.LoadingStates) {
                    window.LoadingStates.empty(this.formContainer, {
                        icon: 'fas fa-shopping-cart',
                        title: 'Carrito Vacío',
                        message: 'Agrega productos antes de continuar',
                        actionLabel: 'Ver Productos',
                        actionUrl: 'products.html'
                    });
                }
                setTimeout(() => window.location.href = 'cart.html', 2000);
                return;
            }
        } catch (error) {
            if (window.ErrorHandler) {
                window.ErrorHandler.api(error, 'loadCart', 'No se pudo cargar el carrito');
            } else {
                if (window.Logger) window.Logger.error('Error loading cart:', error);
            }

            var stored = localStorage.getItem('brutalist_cart');
            if (stored) {
                try { this.cart = JSON.parse(stored); } catch (_) { this.cart = []; }
                if (this.cart && this.cart.length && !this.isGuest() && window.api && typeof window.api.addToCart === 'function') {
                    await this.syncCartToApi();
                }
            }
            if (!this.cart || this.cart.length === 0) window.location.href = 'cart.html';
        } finally {
            if (window.LoadingStates) window.LoadingStates.hide(this.formContainer, false);
        }
    }

    async loadAddresses() {
        if (this.isGuest()) {
            this.addresses = [];
            return;
        }
        try {
            if (!window.api || typeof window.api.getAddresses !== 'function') {
                this.addresses = [];
                return;
            }
            var response = await window.api.getAddresses();
            if (response && response.success) {
                this.addresses = response.data.addresses || response.data || [];
                if (this.addresses.length > 0) {
                    var defaultAddr = this.addresses.find(function (a) { return a.is_default; });
                    this.selectedAddressId = defaultAddr ? defaultAddr.id : this.addresses[0].id;
                }
            } else {
                this.addresses = [];
            }
        } catch (e) {
            if (window.ErrorHandler) window.ErrorHandler.api(e, 'loadAddresses', 'No se pudieron cargar las direcciones');
            this.addresses = [];
        }
    }

    /** Sincroniza this.cart (desde localStorage) al carrito de la API para usuarios autenticados. Luego actualiza this.cart con la respuesta. */
    async syncCartToApi() {
        if (!this.cart || !this.cart.length || !window.api) return;
        for (var i = 0; i < this.cart.length; i++) {
            var it = this.cart[i];
            var pid = it.product_id || it.id;
            if (!pid) continue;
            try {
                await window.api.addToCart(pid, it.quantity || 1, { size: it.size || null });
            } catch (e) {
                if (window.Logger) window.Logger.warn('syncCart: no se pudo añadir', pid, e);
            }
        }
        try {
            var r = await window.api.getCart();
            if (r && r.success && r.data && r.data.items && r.data.items.length) this.cart = r.data.items;
        } catch (_) {}
    }

    renderStep(step) {
        this.currentStep = step;

        // Update Stepper UI
        this.steps.forEach(s => {
            const sNum = parseInt(s.dataset.step);
            s.classList.toggle('active', sNum === step);
            s.classList.toggle('completed', sNum < step);
        });

        var nav = document.getElementById('checkoutNavigation');
        if (nav) nav.style.display = step === 4 ? 'none' : '';

        // Render Content
        if (step === 1) this.renderShipping();
        else if (step === 2) this.renderPayment();
        else if (step === 3) this.renderReview();
        else if (step === 4) this.renderSuccess();

        this.updateNavButtons();
        window.scrollTo(0, 0);
    }

    renderShipping() {
        // If we have addresses, show selection list + Add New button
        // If no addresses, show Add New Form directly.

        let contentHtml = '';

        if (this.addresses.length > 0) {
            contentHtml = `
                <div class="saved-addresses fade-in">
                    <h3>SELECCIONAR DIRECCIÓN DE ENVÍO</h3>
                    <div class="address-grid">
                        ${this.addresses.map(addr => `
                            <div class="address-card ${this.selectedAddressId === addr.id ? 'selected' : ''}" 
                                 onclick="checkoutManager.selectAddress('${addr.id}')">
                                <div class="addr-header">
                                    <strong>${addr.full_name || (addr.first_name || '') + ' ' + (addr.last_name || '') || '—'}</strong>
                                    ${addr.is_default ? '<span class="badge">PREDETERMINADA</span>' : ''}
                                </div>
                                <p>${addr.address || addr.street_address || '—'}</p>
                                <p>${addr.city || ''}${addr.postal_code ? ', ' + addr.postal_code : ''}</p>
                                <p>${addr.country || '—'}</p>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-outline" style="margin-top:20px" onclick="checkoutManager.toggleNewAddressForm()">+ AGREGAR NUEVA DIRECCIÓN</button>
                    
                    <div id="newAddressFormContainer" style="display:none; margin-top:20px; border-top:1px solid #eee; padding-top:20px;">
                        ${this.getAddressFormHtml()}
                    </div>

                    <div class="checkout-actions">
                        <button class="btn btn-black btn-block" onclick="checkoutManager.nextStep()">CONTINUAR AL PAGO</button>
                    </div>
                </div>
            `;
        } else {
            contentHtml = `
                <div class="fade-in">
                    <h3>AGREGAR DIRECCIÓN DE ENVÍO</h3>
                    ${this.getAddressFormHtml()}
                    <div class="checkout-actions">
                        <button class="btn btn-black btn-block" onclick="checkoutManager.saveNewAddress()">GUARDAR Y CONTINUAR</button>
                    </div>
                </div>
            `;
        }

        this.formContainer.innerHTML = contentHtml;
    }

    isGuest() {
        return !(window.authManager && typeof window.authManager.isAuthenticated === 'function' && window.authManager.isAuthenticated());
    }

    getAddressFormHtml() {
        var isGuest = this.isGuest();
        return `
            <form id="addressForm">
                ${isGuest ? `
                <div class="form-group">
                    <label>Email Address (Para confirmación del pedido)</label>
                    <input type="email" name="email" required>
                </div>
                ` : ''}
                <div class="form-row">
                    <div class="form-group half">
                        <label>First Name</label>
                        <input type="text" name="first_name" required>
                    </div>
                    <div class="form-group half">
                        <label>Last Name</label>
                        <input type="text" name="last_name" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Street Address</label>
                    <input type="text" name="street_address" required>
                </div>
                 <div class="form-row">
                    <div class="form-group half">
                        <label>City</label>
                        <input type="text" name="city" required>
                    </div>
                    <div class="form-group half">
                        <label>Zip Code</label>
                        <input type="text" name="postal_code" required>
                    </div>
                </div>
                 <div class="form-group">
                    <label>Country</label>
                    <input type="text" name="country" value="Perú" required>
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" name="phone_number" required>
                </div>
            </form>
        `;
    }

    nextStep() {
        if (this.currentStep === 1) {
            if (this.addresses.length === 0) {
                if (window.notifications) window.notifications.warning('Dirección requerida', 'Completa el formulario y haz clic en GUARDAR Y CONTINUAR.');
                return;
            }
            if (this.addresses.length > 0 && !this.selectedAddressId) {
                if (window.notifications) window.notifications.warning('Selecciona una dirección', 'Elige una dirección de envío para continuar.');
                return;
            }
            this.renderStep(2);
        }
    }

    selectAddress(id) {
        this.selectedAddressId = id;
        this.renderShipping(); // Re-render to update selection visual
    }

    toggleNewAddressForm() {
        const container = document.getElementById('newAddressFormContainer');
        if (container) {
            container.style.display = container.style.display === 'none' ? 'block' : 'none';
        }
    }

    async saveNewAddress() {
        var form = document.getElementById('addressForm');
        if (!form) return;
        if (!form.checkValidity()) {
            form.reportValidity();
            if (window.notifications) window.notifications.warning('Campos requeridos', 'Completa todos los campos marcados como obligatorios.');
            return;
        }

        var formData = new FormData(form);
        var addressData = Object.fromEntries(formData);

        if (this.isGuest()) {
            this.guestAddress = addressData;
            this.guestEmail = addressData.email || null;
            this.selectedAddressId = 'GUEST_ADDR';
            this.renderStep(2);
            return;
        }

        // Mapear formulario (first_name, street_address, phone_number) al formato de /api/addresses (full_name, address, phone)
        var apiPayload = {
            full_name: [addressData.first_name, addressData.last_name].filter(Boolean).join(' ').trim() || 'N/A',
            address: addressData.street_address || addressData.address || '',
            city: addressData.city || '',
            state: addressData.state || null,
            country: addressData.country || 'Perú',
            postal_code: addressData.postal_code || null,
            phone: addressData.phone_number || addressData.phone || '',
            email: addressData.email || undefined,
            is_default: this.addresses.length === 0
        };

        var btn = this.formContainer.querySelector('button.btn-black') || document.querySelector('#checkoutContent button.btn-black');
        var originalBtnText = btn ? btn.innerHTML : '';

        try {
            if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> GUARDANDO...'; btn.disabled = true; }

            if (!window.api || typeof window.api.createAddress !== 'function') {
                throw new Error('El servicio no está disponible. Verifica tu conexión.');
            }
            var res = await window.api.createAddress(apiPayload);
            if (res && res.success) {
                await this.loadAddresses();
                var newAddr = (res.data && res.data.address) ? res.data.address : (res.data || res.address || res);
                this.selectedAddressId = newAddr && newAddr.id ? newAddr.id : this.selectedAddressId;
                if (window.notifications) window.notifications.success('Dirección guardada', 'La dirección se guardó correctamente.');
                this.renderStep(2);
            } else {
                var msg = (res && res.message) ? res.message : 'No se pudo guardar la dirección.';
                if (window.ErrorHandler && res) window.ErrorHandler.handle(res, { context: 'saveNewAddress', userMessage: msg });
                if (window.notifications) window.notifications.error('Error', msg);
            }
        } catch (e) {
            if (window.ErrorHandler) window.ErrorHandler.api(e, 'saveNewAddress', 'No se pudo guardar la dirección. Verifica tu conexión.');
            if (window.notifications) window.notifications.error('Error', e && e.message ? e.message : 'No se pudo guardar la dirección. Verifica tu conexión.');
            if (window.Logger) window.Logger.error('saveNewAddress error:', e);
        } finally {
            if (btn) { btn.innerHTML = originalBtnText || 'GUARDAR Y CONTINUAR'; btn.disabled = false; }
        }
    }

    renderPayment() {
        const html = `
            <div class="checkout-form-section fade-in">
                <h2>MÉTODO DE PAGO</h2>
                 <div class="payment-tabs">
                    <button class="payment-tab ${this.paymentMethod === 'card' ? 'active' : ''}" onclick="checkoutManager.setPayment('card')">
                        <i class="far fa-credit-card"></i> TARJETA
                    </button>
                    <button class="payment-tab ${this.paymentMethod === 'yape' ? 'active' : ''}" onclick="checkoutManager.setPayment('yape')">
                        <i class="fas fa-mobile-alt"></i> YAPE
                    </button>
                    <button class="payment-tab ${this.paymentMethod === 'plin' ? 'active' : ''}" onclick="checkoutManager.setPayment('plin')">
                        <i class="fas fa-mobile-alt"></i> PLIN
                    </button>
                    <button class="payment-tab ${this.paymentMethod === 'cash' ? 'active' : ''}" onclick="checkoutManager.setPayment('cash')">
                        <i class="fas fa-money-bill"></i> EFECTIVO
                    </button>
                    <button class="payment-tab ${this.paymentMethod === 'bank_transfer' ? 'active' : ''}" onclick="checkoutManager.setPayment('bank_transfer')">
                        <i class="fas fa-university"></i> TRANSFERENCIA
                    </button>
                </div>

                ${this.paymentMethod === 'card' ? `
                    <form id="paymentForm">
                        <div class="form-group">
                            <label>NÚMERO DE TARJETA</label>
                            <input type="text" class="input-card" placeholder="4242 4242 4242 4242">
                        </div>
                        <div class="form-row">
                            <div class="form-group half">
                                <label>VENCIMIENTO</label>
                                <input type="text" placeholder="MM/AA">
                            </div>
                            <div class="form-group half">
                                <label>CVC</label>
                                <input type="text" placeholder="123">
                            </div>
                        </div>
                    </form>
                ` : this.paymentMethod === 'yape' || this.paymentMethod === 'plin' ? `
                    <div style="padding:20px; text-align:center; border: 2px solid var(--black); margin-top: 1rem;">
                        <p><strong>Pago con ${this.getPaymentMethodName(this.paymentMethod)}</strong></p>
                        <p>Se te enviará un código QR o número de cuenta para completar el pago.</p>
                    </div>
                ` : this.paymentMethod === 'cash' ? `
                    <div style="padding:20px; text-align:center; border: 2px solid var(--black); margin-top: 1rem;">
                        <p><strong>Pago en Efectivo</strong></p>
                        <p>El pago se realizará al momento de la entrega.</p>
                    </div>
                ` : this.paymentMethod === 'bank_transfer' ? `
                    <div style="padding:20px; text-align:center; border: 2px solid var(--black); margin-top: 1rem;">
                        <p><strong>Transferencia Bancaria</strong></p>
                        <p>Te enviaremos los datos bancarios por email al confirmar el pedido.</p>
                    </div>
                ` : '<div style="padding:20px; text-align:center;">Redirección después de confirmar el pedido.</div>'}

                <div class="checkout-actions">
                    <button class="btn btn-outline" onclick="checkoutManager.renderStep(1)">VOLVER</button>
                    <button class="btn btn-black" onclick="checkoutManager.renderStep(3)">REVISAR PEDIDO</button>
                </div>
            </div>
        `;
        this.formContainer.innerHTML = html;
    }

    setPayment(method) {
        this.paymentMethod = method;
        this.renderPayment();
    }

    getPaymentMethodName(method) {
        const methods = {
            'card': 'Tarjeta de Crédito/Débito',
            'credit_card': 'Tarjeta de Crédito/Débito',
            'paypal': 'PayPal',
            'yape': 'Yape',
            'plin': 'Plin',
            'cash': 'Efectivo',
            'bank_transfer': 'Transferencia Bancaria'
        };
        return methods[method] || (method && typeof method === 'string' ? method.toUpperCase() : 'UNKNOWN');
    }

    renderReview() {
        if (!this.selectedAddressId) {
            this.renderStep(1);
            return;
        }

        var addr = this.selectedAddressId === 'GUEST_ADDR' && this.guestAddress
            ? this.guestAddress
            : this.addresses.find(function (a) { return a.id == this.selectedAddressId; }.bind(this));
        if (!addr) { this.renderStep(1); return; }

        var fullName = addr.full_name || ([addr.first_name, addr.last_name].filter(Boolean).join(' ')) || '—';
        var line1 = addr.address || addr.street_address || addr.street || '—';
        var line2 = (addr.city || '') + (addr.state || addr.region ? ', ' + (addr.state || addr.region) : '') + (addr.postal_code ? ', ' + addr.postal_code : '');
        var phone = addr.phone || addr.phone_number || '';

        var t = this.getTotals();

        var html = `
            <div class="checkout-form-section fade-in">
                <h2>REVISAR PEDIDO</h2>
                <div class="review-block">
                    <h4>ENVIAR A:</h4>
                    <p><strong>${fullName}</strong></p>
                    ${(addr.email || this.guestEmail) ? '<p><span>' + (addr.email || this.guestEmail) + '</span></p>' : ''}
                    <p>${line1}</p>
                    <p>${line2 || '—'}</p>
                    <p>${addr.country || 'Perú'}</p>
                    ${phone ? '<p><i class="fas fa-phone"></i> ' + phone + '</p>' : ''}
                </div>
                <div class="review-block">
                    <h4>MÉTODO DE PAGO:</h4>
                    <p><strong>${this.getPaymentMethodName(this.paymentMethod)}</strong></p>
                    ${this.paymentMethod === 'yape' || this.paymentMethod === 'plin' || this.paymentMethod === 'bank_transfer' ? `
                    <p style="font-size: 0.85rem; color: #666; margin-top: 0.5rem;">
                        <i class="fas fa-info-circle"></i> Recibirás las instrucciones de pago por email después de confirmar el pedido.
                    </p>
                    ` : ''}
                </div>
                <div class="review-block">
                    <h4>PRODUCTOS:</h4>
                    ${this.cart.map(item => {
                        const price = parseFloat(item.discount_price || item.price || 0);
                        const q = item.quantity || 1;
                        return `<p>${q}x ${item.name}${item.size ? ' (Talla: ' + item.size + ')' : ''} - S/ ${(price * q).toFixed(2)}</p>`;
                    }).join('')}
                </div>
                <div class="review-block" style="border-top: 2px solid var(--black); padding-top: 1rem; margin-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Subtotal:</span>
                        <span>S/ ${t.subtotal.toFixed(2)}</span>
                    </div>
                    ${t.couponDiscount > 0 ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: #4caf50;">
                        <span>Descuento (cupón):</span>
                        <span>-S/ ${t.couponDiscount.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    ${t.loyaltyDiscount > 0 ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: #4caf50;">
                        <span>Descuento (puntos):</span>
                        <span>-S/ ${t.loyaltyDiscount.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Envío:</span>
                        <span>${t.shipping === 0 ? 'GRATIS' : 'S/ ' + t.shipping.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 900; margin-top: 1rem; padding-top: 1rem; border-top: 2px solid var(--black);">
                        <span>TOTAL:</span>
                        <span>S/ ${t.total.toFixed(2)}</span>
                    </div>
                </div>
                <div class="checkout-actions">
                    <button class="btn btn-outline" onclick="checkoutManager.renderStep(2)">VOLVER</button>
                    <button class="btn btn-black btn-block btn-confirm-order" onclick="checkoutManager.placeOrder()">
                        <i class="fas fa-lock"></i> CONFIRMAR PEDIDO (S/ ${t.total.toFixed(2)})
                    </button>
                </div>
            </div>
        `;
        this.formContainer.innerHTML = html;
    }

    renderSuccess() {
        this.formContainer.innerHTML = `
            <div class="checkout-form-section fade-in" style="text-align: center; padding: 3rem 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1.5rem; color: var(--black);"><i class="fas fa-check-circle"></i></div>
                <h2 style="font-size: 1.75rem; font-weight: 900; text-transform: uppercase; margin-bottom: 1rem;">PEDIDO CONFIRMADO</h2>
                <p style="font-size: 1.1rem; color: var(--gray-600); margin-bottom: 1.5rem;">Redirigiendo a la página de confirmación...</p>
                <div class="loading-spinner" style="margin: 0 auto 1.5rem;"></div>
                <p style="font-size: 0.9rem; color: var(--gray-500);"><a href="order-success.html" style="color: var(--black); text-decoration: underline;">Haz clic aquí</a> si no eres redirigido.</p>
            </div>
        `;
    }

    /** Construye el objeto plano de envío que exige /api/orders: shipping_address, shipping_city, shipping_full_name, shipping_email, shipping_phone, etc. */
    getShippingFlat() {
        var addr = null;
        var email = null;

        if (this.selectedAddressId === 'GUEST_ADDR' && this.guestAddress) {
            addr = this.guestAddress;
            email = this.guestEmail || addr.email || null;
            return {
                shipping_full_name: [addr.first_name, addr.last_name].filter(Boolean).join(' ').trim() || '—',
                shipping_address: (addr.street_address || addr.address || '').trim() || '—',
                shipping_city: (addr.city || '').trim() || '—',
                shipping_country: (addr.country || 'Perú').trim(),
                shipping_phone: (addr.phone_number || addr.phone || '').trim() || '—',
                shipping_email: email || '',
                shipping_state: (addr.state || addr.region || null) || null,
                shipping_postal_code: (addr.postal_code || null) || null
            };
        }

        var a = this.addresses.find(function (x) { return x.id == this.selectedAddressId; }.bind(this));
        if (!a) return null;

        var u = (window.authManager && (window.authManager.currentUser || (typeof window.authManager.getUser === 'function' ? window.authManager.getUser() : null))) || null;
        email = (a.email && /@/.test(a.email)) ? a.email : (u && u.email) || '';

        return {
            shipping_full_name: (a.full_name || (a.first_name || '') + ' ' + (a.last_name || '') || '—').trim(),
            shipping_address: (a.address || a.street_address || '').trim() || '—',
            shipping_city: (a.city || '').trim() || '—',
            shipping_country: (a.country || 'Perú').trim(),
            shipping_phone: (a.phone || a.phone_number || '').trim() || '—',
            shipping_email: email,
            shipping_state: (a.state || a.region || null) || null,
            shipping_postal_code: (a.postal_code || null) || null
        };
    }

    async placeOrder() {
        var btn = document.querySelector('.btn-confirm-order') || document.querySelector('.btn-black.btn-block');
        var navNext = document.getElementById('btnNext');
        var originalBtnText = btn ? btn.innerHTML : '';

        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESANDO...';
            btn.disabled = true;
        }
        if (navNext) navNext.disabled = true;

        if (!this.selectedAddressId) {
            if (window.notifications) window.notifications.warning('Dirección Requerida', 'Por favor, selecciona una dirección de envío');
            this.renderStep(1);
            if (btn) { btn.innerHTML = originalBtnText; btn.disabled = false; }
            if (navNext) navNext.disabled = false;
            return;
        }

        if (!this.cart || this.cart.length === 0) {
            if (window.notifications) window.notifications.warning('Carrito Vacío', 'Tu carrito está vacío');
            if (navNext) navNext.disabled = false;
            window.location.href = 'cart.html';
            return;
        }

        const t = this.getTotals();

        var flat = this.getShippingFlat();
        if (!flat || !flat.shipping_email || !/@/.test(flat.shipping_email)) {
            if (window.notifications) window.notifications.warning('Email requerido', 'Se necesita un email válido para el envío. Añade uno en la dirección o inicia sesión.');
            if (btn) { btn.innerHTML = originalBtnText; btn.disabled = false; }
            if (navNext) navNext.disabled = false;
            return;
        }

        try {
            var orderData = {
                payment_method: this.paymentMethod === 'card' ? 'stripe' : this.paymentMethod,
                coupon_code: (window.couponsManager && window.couponsManager.getAppliedCoupon && window.couponsManager.getAppliedCoupon()) ? window.couponsManager.getAppliedCoupon().code : undefined,
                loyalty_points_used: t.loyaltyPointsEffective > 0 ? t.loyaltyPointsEffective : undefined,
                expected_total: t.total,
                shipping_cost: t.shipping,
                shipping_address: flat.shipping_address,
                shipping_city: flat.shipping_city,
                shipping_country: flat.shipping_country,
                shipping_full_name: flat.shipping_full_name,
                shipping_email: flat.shipping_email,
                shipping_phone: flat.shipping_phone
            };
            if (flat.shipping_state) orderData.shipping_state = flat.shipping_state;
            if (flat.shipping_postal_code) orderData.shipping_postal_code = flat.shipping_postal_code;

            if (this.isGuest()) orderData.email = flat.shipping_email;

            if (window.Logger) window.Logger.log('📤 Placing Order:', orderData);
            var response = await window.api.createOrder(orderData);

            if (response.success) {
                if (window.Logger) window.Logger.log('✅ Order Created');

                // Clear Cart (usar brutalist_cart consistentemente)
                localStorage.removeItem('brutalist_cart');
                localStorage.removeItem('cart_expires'); // If used

                // Update Badge
                if (window.Components) window.Components.updateCartCount();

                if (window.notifications) {
                    window.notifications.success('Pedido Creado', 'Tu pedido se ha procesado correctamente');
                }

                var orderId = response.data.order ? response.data.order.id : (response.data.id || 'CONFIRMED');
                var redirectUrl = `order-success.html?id=${orderId}`;
                if (orderData.email) {
                    redirectUrl += `&email=${encodeURIComponent(orderData.email)}`;
                } else if (!(window.authManager && window.authManager.isAuthenticated && window.authManager.isAuthenticated()) && this.guestEmail) {
                    redirectUrl += `&email=${encodeURIComponent(this.guestEmail)}`;
                }

                this.renderStep(4);
                setTimeout(function () { window.location.href = redirectUrl; }, 1200);
            } else {
                throw new Error(response.message || 'Failed to create order');
            }

        } catch (e) {
            var is401 = (e && (e.status === 401 || (e.response && e.response.status === 401))) || (e && e.message && /401|unauthorized|token/i.test(String(e.message)));
            if (is401) {
                if (window.notifications) window.notifications.error('Inicia sesión', 'Para completar la compra inicia sesión o crea una cuenta. Redirigiendo...');
                setTimeout(function () { window.location.href = 'login.html?returnUrl=' + encodeURIComponent('checkout.html'); }, 1800);
                return;
            }
            if (window.ErrorHandler) window.ErrorHandler.api(e, 'placeOrder', 'No se pudo procesar el pedido. Por favor, intenta de nuevo.');
            else {
                if (window.Logger) window.Logger.error('Order Error:', e);
                if (window.notifications) window.notifications.error('Error al procesar', (e && e.message) || (e && e.data && e.data.message) || 'No se pudo procesar el pedido. Por favor, intenta de nuevo.');
            }
        } finally {
            if (btn) {
                btn.innerHTML = originalBtnText;
                btn.disabled = false;
            }
            if (navNext) navNext.disabled = false;
        }
    }

    renderOrderSummary() {
        if (!this.orderSummary) return;

        const t = this.getTotals();
        const subtotalAfterCoupon = t.subtotal - t.couponDiscount;
        const maxPointsSoles = subtotalAfterCoupon * 0.2;
        const maxPointsToUse = Math.min(this.loyaltyPointsAvailable, Math.floor(maxPointsSoles * 100));

        this.orderSummary.innerHTML = `
            <div class="summary-card">
                <h3>RESUMEN DEL PEDIDO</h3>
                <div class="summary-items">
                    ${this.cart.map(item => {
                        const price = parseFloat(item.discount_price || item.price || 0);
                        const q = item.quantity || 1;
                        return `
                        <div class="summary-item">
                            <img src="${item.image_url || item.image || 'assets/images/products/placeholder.jpg'}" alt="${item.name}" onerror="this.src='assets/images/products/placeholder.jpg'">
                            <div>
                                <h4>${item.name}</h4>
                                <p>x${q} - S/ ${(price * q).toFixed(2)}</p>
                                ${item.size ? `<p style="font-size: 0.8rem; color: #666;">Talla: ${item.size}</p>` : ''}
                            </div>
                        </div>`;
                    }).join('')}
                </div>
                <div class="summary-totals">
                    <div class="row"><span>Subtotal</span> <span>S/ ${t.subtotal.toFixed(2)}</span></div>
                    ${t.couponDiscount > 0 ? `<div class="row" style="color: #4caf50;"><span>Descuento (cupón)</span> <span>-S/ ${t.couponDiscount.toFixed(2)}</span></div>` : ''}
                    ${t.loyaltyDiscount > 0 ? `<div class="row" style="color: #4caf50;"><span>Descuento (puntos)</span> <span>-S/ ${t.loyaltyDiscount.toFixed(2)}</span></div>` : ''}
                    <div class="row"><span>Envío</span> <span>${t.shipping === 0 ? 'GRATIS' : 'S/ ' + t.shipping.toFixed(2)}</span></div>
                    ${(t.subtotal - t.couponDiscount - t.loyaltyDiscount) < 150 ? `
                    <div style="font-size: 0.85rem; color: #666; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #eee;">
                        <i class="fas fa-info-circle"></i> Agrega S/ ${(150 - (t.subtotal - t.couponDiscount - t.loyaltyDiscount)).toFixed(2)} más para envío gratis
                    </div>
                    ` : ''}
                    <div class="row total"><span>TOTAL</span> <span>S/ ${t.total.toFixed(2)}</span></div>
                </div>
                ${this.loyaltyPointsAvailable > 0 ? `
                <div class="loyalty-checkout-block" style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid var(--black);">
                    <h4 style="font-size: 0.9rem; margin-bottom: 0.5rem;"><i class="fas fa-coins"></i> Puntos (${this.loyaltyPointsAvailable} disponibles ≈ S/ ${(this.loyaltyPointsAvailable / 100).toFixed(2)})</h4>
                    ${maxPointsToUse > 0 ? `
                    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                        <button type="button" class="btn btn-outline" style="font-size: 0.85rem; padding: 0.35rem 0.6rem;" onclick="checkoutManager.setLoyaltyMax()">Usar máx (${maxPointsToUse} pts)</button>
                        ${t.loyaltyPointsEffective > 0 ? `<button type="button" class="btn btn-ghost" style="font-size: 0.85rem;" onclick="checkoutManager.setLoyaltyZero()">Quitar</button>` : ''}
                        ${t.loyaltyPointsEffective > 0 ? `<span style="font-size: 0.9rem;">→ -S/ ${t.loyaltyDiscount.toFixed(2)}</span>` : ''}
                    </div>
                    ` : '<p style="font-size: 0.85rem; color: #666;">Máx 20% del subtotal con puntos. Aumenta tu compra para usar más.</p>'}
                </div>
                ` : ''}
                ${window.couponsManager ? `
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid var(--black);">
                    <div id="couponSection"></div>
                </div>
                ` : ''}
            </div>
        `;

        if (window.couponsManager) {
            window.couponsManager.setCartContext(this.cart, t.subtotal);
            const cup = document.getElementById('couponSection');
            if (cup) {
                if (window.couponsManager.renderCouponForm) {
                    window.couponsManager.renderCouponForm('couponSection');
                }
            }
        }
    }

    setLoyaltyMax() {
        const t = this.getTotals();
        const sub = t.subtotal - t.couponDiscount;
        const maxPts = Math.min(this.loyaltyPointsAvailable, Math.floor((sub * 0.2) * 100));
        this.loyaltyPointsUsed = maxPts;
        this.renderOrderSummary();
        if (this.currentStep === 3) this.renderReview();
    }

    setLoyaltyZero() {
        this.loyaltyPointsUsed = 0;
        this.renderOrderSummary();
        if (this.currentStep === 3) this.renderReview();
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    window.checkoutManager = new CheckoutManager();
    if (window.Logger) window.Logger.log('Secure Checkout Initialized');
});

window.scrollToOrderSummary = function () {
    const summary = document.getElementById('orderSummary');
    if (summary) {
        summary.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};
