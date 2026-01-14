
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

        this.init();
    }

    async init() {
        if (window.Logger) window.Logger.log('💳 CheckoutManager V2 Starting...');

        // 1. Auth Guard
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            window.location.href = 'login.html?returnUrl=checkout.html';
            return;
        }

        // 2. Load Data
        await this.loadCart();
        await this.loadAddresses();

        // 3. Render
        this.renderOrderSummary();
        this.renderStep(1);
    }

    async loadCart() {
        // Mostrar loading state
        if (window.LoadingStates && this.formContainer) {
            window.LoadingStates.show(this.formContainer, { 
                message: 'Cargando carrito...',
                type: 'spinner'
            });
        }

        try {
            // Intentar cargar desde API primero
            if (window.authManager && window.authManager.isAuthenticated() && window.api) {
                const response = await window.api.getCart();
                if (response && response.success && response.data && response.data.items) {
                    this.cart = response.data.items;
                } else if (response && Array.isArray(response)) {
                    this.cart = response;
                } else {
                    // Fallback a localStorage
                    const stored = localStorage.getItem('cart') || localStorage.getItem('brutalist_cart');
                    if (stored) {
                        this.cart = JSON.parse(stored);
                    }
                }
            } else {
                // Usuario no autenticado, usar localStorage
                const stored = localStorage.getItem('cart') || localStorage.getItem('brutalist_cart');
                if (stored) {
                    this.cart = JSON.parse(stored);
                }
            }

            if (!this.cart || this.cart.length === 0) {
                if (window.LoadingStates && this.formContainer) {
                    window.LoadingStates.empty(this.formContainer, {
                        icon: 'fas fa-shopping-cart',
                        title: 'Carrito Vacío',
                        message: 'Agrega productos antes de continuar',
                        actionLabel: 'Ver Productos',
                        actionUrl: 'products.html'
                    });
                }
                if (window.notifications) {
                    window.notifications.warning('Tu carrito está vacío', 'Agrega productos antes de continuar');
                }
                setTimeout(() => {
                    window.location.href = 'cart.html';
                }, 2000);
                return;
            }
        } catch (error) {
            // Usar error handler si está disponible
            if (window.ErrorHandler) {
                window.ErrorHandler.api(error, 'loadCart', 'No se pudo cargar el carrito');
            } else {
                if (window.Logger) window.Logger.error('Error loading cart:', error);
                if (window.notifications) {
                    window.notifications.error('Error', 'No se pudo cargar el carrito. Por favor, intenta de nuevo.');
                }
            }

            // Mostrar estado de error
            if (window.LoadingStates && this.formContainer) {
                window.LoadingStates.error(this.formContainer, {
                    title: 'Error al Cargar',
                    message: 'No se pudo cargar el carrito. Por favor, intenta de nuevo.',
                    retryLabel: 'Reintentar',
                    retryCallback: 'window.checkoutManager.loadCart()'
                });
            }

            // Fallback a localStorage
            const stored = localStorage.getItem('cart') || localStorage.getItem('brutalist_cart');
            if (stored) {
                this.cart = JSON.parse(stored);
            }
            if (!this.cart || this.cart.length === 0) {
                window.location.href = 'cart.html';
            }
        } finally {
            // Ocultar loading state
            if (window.LoadingStates && this.formContainer) {
                window.LoadingStates.hide(this.formContainer, false);
            }
        }
    }

    async loadAddresses() {
        try {
            const response = await window.api.getAddresses();
            if (response.success) {
                this.addresses = response.data.addresses || response.data; // Handle potential wrapper
                // Auto-select default or first
                const defaultAddr = this.addresses.find(a => a.is_default);
                if (defaultAddr) this.selectedAddressId = defaultAddr.id;
                else if (this.addresses.length > 0) this.selectedAddressId = this.addresses[0].id;
            } else {
                // Si no hay direcciones, inicializar array vacío
                this.addresses = [];
            }
        } catch (e) {
            // Usar error handler si está disponible
            if (window.ErrorHandler) {
                window.ErrorHandler.api(e, 'loadAddresses', 'No se pudieron cargar las direcciones');
            } else {
                if (window.Logger) window.Logger.error('Failed to load addresses:', e);
            }
            // Inicializar array vacío en caso de error
            this.addresses = [];
        }
    }

    renderStep(step) {
        this.currentStep = step;

        // Update Stepper UI
        this.steps.forEach(s => {
            const sNum = parseInt(s.dataset.step);
            s.classList.toggle('active', sNum === step);
            s.classList.toggle('completed', sNum < step);
        });

        // Render Content
        if (step === 1) this.renderShipping();
        else if (step === 2) this.renderPayment();
        else if (step === 3) this.renderReview();
        else if (step === 4) this.renderSuccess();

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
                                    <strong>${addr.first_name || ''} ${addr.last_name || ''}</strong>
                                    ${addr.is_default ? '<span class="badge">PREDETERMINADA</span>' : ''}
                                </div>
                                <p>${addr.street_address}</p>
                                <p>${addr.city}, ${addr.postal_code}</p>
                                <p>${addr.country}</p>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-outline" style="margin-top:20px" onclick="checkoutManager.toggleNewAddressForm()">+ ADD NEW ADDRESS</button>
                    
                    <div id="newAddressFormContainer" style="display:none; margin-top:20px; border-top:1px solid #eee; padding-top:20px;">
                        ${this.getAddressFormHtml()}
                    </div>

                    <div class="checkout-actions">
                        <button class="btn btn-black btn-block" onclick="checkoutManager.nextStep()">CONTINUE TO PAYMENT</button>
                    </div>
                </div>
            `;
        } else {
            contentHtml = `
                <div class="fade-in">
                    <h3>AGREGAR DIRECCIÓN DE ENVÍO</h3>
                    ${this.getAddressFormHtml()}
                    <div class="checkout-actions">
                        <button class="btn btn-black btn-block" onclick="checkoutManager.saveNewAddress()">SAVE & CONTINUE</button>
                    </div>
                </div>
            `;
        }

        this.formContainer.innerHTML = contentHtml;
    }

    getAddressFormHtml() {
        return `
            <form id="addressForm">
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
                    <input type="text" name="country" value="United States" required>
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" name="phone_number" required>
                </div>
            </form>
        `;
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
        const form = document.getElementById('addressForm');
        if (!form.checkValidity()) {
            alert('Please fill all required fields');
            return;
        }

        const formData = new FormData(form);
        const addressData = Object.fromEntries(formData);
        // Defaults
        addressData.is_default = this.addresses.length === 0;
        addressData.type = 'shipping';

        try {
            const btn = document.querySelector('.btn-black');
            if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SAVING...';

            const res = await window.api.createAddress(addressData);
            if (res.success) {
                await this.loadAddresses(); // Refresh list
                const newAddr = res.data.address || res.data;
                this.selectedAddressId = newAddr.id;
                this.renderStep(1); // Go back to rendering list
            } else {
                alert('Error saving address: ' + res.message);
                if (btn) btn.innerHTML = 'SAVE & CONTINUE';
            }
        } catch (e) {
            if (window.Logger) window.Logger.error('Address Save Failed:', e);
            alert('System Error Saving Address. Please check your connection.');
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
        return methods[method] || method.toUpperCase();
    }

    renderReview() {
        if (!this.selectedAddressId) {
            this.renderStep(1);
            return;
        }

        const addr = this.addresses.find(a => a.id == this.selectedAddressId);

        const cartTotal = this.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const shipping = cartTotal > 150 ? 0 : 15;
        const total = cartTotal + shipping;

        const html = `
            <div class="checkout-form-section fade-in">
                <h2>REVISAR PEDIDO</h2>
                
                <div class="review-block">
                    <h4>ENVIAR A:</h4>
                    <p><strong>${addr.first_name} ${addr.last_name}</strong></p>
                    <p>${addr.street_address || addr.street}</p>
                    <p>${addr.city}${addr.region ? ', ' + addr.region : ''}, ${addr.postal_code}</p>
                    <p>${addr.country || 'Perú'}</p>
                    ${addr.phone_number ? `<p><i class="fas fa-phone"></i> ${addr.phone_number}</p>` : ''}
                </div>

                <div class="review-block">
                    <h4>MÉTODO DE PAGO:</h4>
                    <p><strong>${this.getPaymentMethodName(this.paymentMethod)}</strong></p>
                    ${this.paymentMethod === 'yape' || this.paymentMethod === 'plin' ? `
                    <p style="font-size: 0.85rem; color: #666; margin-top: 0.5rem;">
                        <i class="fas fa-info-circle"></i> Recibirás las instrucciones de pago por email después de confirmar el pedido.
                    </p>
                    ` : ''}
                </div>

                <div class="review-block">
                    <h4>PRODUCTOS:</h4>
                    ${this.cart.map(item => {
                        const price = parseFloat(item.discount_price || item.price || 0);
                        const quantity = item.quantity || 1;
                        const itemTotal = price * quantity;
                        return `<p>${quantity}x ${item.name}${item.size ? ' (Talla: ' + item.size + ')' : ''} - S/ ${itemTotal.toFixed(2)}</p>`;
                    }).join('')}
                </div>

                <div class="review-block" style="border-top: 2px solid var(--black); padding-top: 1rem; margin-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Subtotal:</span>
                        <span>S/ ${subtotal.toFixed(2)}</span>
                    </div>
                    ${discount > 0 ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: #4caf50;">
                        <span>Descuento:</span>
                        <span>-S/ ${discount.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Envío:</span>
                        <span>${shipping === 0 ? 'GRATIS' : 'S/ ' + shipping.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 900; margin-top: 1rem; padding-top: 1rem; border-top: 2px solid var(--black);">
                        <span>TOTAL:</span>
                        <span>S/ ${total.toFixed(2)}</span>
                    </div>
                </div>

                <div class="checkout-actions">
                    <button class="btn btn-outline" onclick="checkoutManager.renderStep(2)">VOLVER</button>
                    <button class="btn btn-black btn-block" onclick="checkoutManager.placeOrder()">
                        <i class="fas fa-lock"></i> CONFIRMAR PEDIDO (S/ ${total.toFixed(2)})
                    </button>
                </div>
            </div>
        `;
        this.formContainer.innerHTML = html;
    }

    async placeOrder() {
        const btn = document.querySelector('.btn-green');
        const originalBtnText = btn ? btn.innerHTML : '';
        
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESANDO...';
            btn.disabled = true;
        }

        // Validaciones antes de procesar
        if (!this.selectedAddressId) {
            if (window.notifications) {
                window.notifications.warning('Dirección Requerida', 'Por favor, selecciona una dirección de envío');
            }
            this.renderStep(1);
            if (btn) {
                btn.innerHTML = originalBtnText;
                btn.disabled = false;
            }
            return;
        }

        if (!this.cart || this.cart.length === 0) {
            if (window.notifications) {
                window.notifications.warning('Carrito Vacío', 'Tu carrito está vacío');
            }
            window.location.href = 'cart.html';
            return;
        }

        try {
            // Prepare Payload
            const orderData = {
                items: this.cart.map(item => ({
                    product_id: item.product_id || item.id,
                    quantity: item.quantity,
                    price: item.discount_price || item.price // Optional, backend might verify
                })),
                shipping_address_id: this.selectedAddressId,
                payment_method: this.paymentMethod === 'card' ? 'credit_card' : this.paymentMethod,
                payment_details: {
                    provider: 'stripe',
                    transaction_id: 'tx_' + Date.now() // Placeholder for actual gateway integration
                }
            };

            if (window.Logger) window.Logger.log('📤 Placing Order:', orderData);
            const response = await window.api.createOrder(orderData);

            if (response.success) {
                if (window.Logger) window.Logger.log('✅ Order Created');

                // Clear Cart
                localStorage.removeItem('cart');
                localStorage.removeItem('brutalist_cart');
                localStorage.removeItem('cart_expires'); // If used

                // Update Badge
                if (window.Components) window.Components.updateCartCount();

                // Show success notification
                if (window.notifications) {
                    window.notifications.success('Pedido Creado', 'Tu pedido se ha procesado correctamente');
                }

                // Redirect to Success Page
                const orderId = response.data.order ? response.data.order.id : (response.data.id || 'CONFIRMED');
                setTimeout(() => {
                    window.location.href = `order-success.html?id=${orderId}`;
                }, 1000);
            } else {
                throw new Error(response.message || 'Failed to create order');
            }

        } catch (e) {
            // Usar error handler si está disponible
            if (window.ErrorHandler) {
                window.ErrorHandler.api(e, 'placeOrder', 'No se pudo procesar el pedido. Por favor, intenta de nuevo.');
            } else {
                if (window.Logger) window.Logger.error('Order Error:', e);
                if (window.notifications) {
                    const errorMsg = e.message || e.response?.data?.message || 'No se pudo procesar el pedido. Por favor, intenta de nuevo.';
                    window.notifications.error('Error al Procesar', errorMsg);
                }
            }
        } finally {
            // Restaurar botón
            if (btn) {
                btn.innerHTML = originalBtnText;
                btn.disabled = false;
            }
        }
    }

    renderOrderSummary() {
        if (!this.orderSummary) return;

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = total > 150 ? 0 : 15;
        const finalTotal = total + shipping;

        this.orderSummary.innerHTML = `
            <div class="summary-card">
                <h3>RESUMEN DE PEDIDO</h3>
                <div class="summary-items">
                    ${this.cart.map(item => {
                        const itemPrice = item.discount_price || item.price;
                        const itemTotal = itemPrice * item.quantity;
                        return `
                        <div class="summary-item">
                            <img src="${item.image_url || item.image || 'assets/images/products/placeholder.jpg'}" alt="${item.name}" onerror="this.src='assets/images/products/placeholder.jpg'">
                            <div>
                                <h4>${item.name}</h4>
                                <p>x${item.quantity} - S/ ${itemTotal.toFixed(2)}</p>
                            </div>
                        </div>
                    `;
                    }).join('')}
                </div>
                <div class="summary-totals">
                    <div class="row"><span>Subtotal</span> <span>S/ ${total.toFixed(2)}</span></div>
                    <div class="row"><span>Envío</span> <span>${shipping === 0 ? 'GRATIS' : 'S/ ' + shipping.toFixed(2)}</span></div>
                    <div class="row total"><span>TOTAL</span> <span>S/ ${finalTotal.toFixed(2)}</span></div>
                </div>
            </div>
        `;
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
