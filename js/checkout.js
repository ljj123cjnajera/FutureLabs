// 🛒 Checkout Mejorado - FutureLabs

// Variables globales
let currentStep = 1;
const totalSteps = 4;
let selectedPaymentMethod = 'stripe';
let cartData = null;
let appliedCoupon = null;
let discount = 0;
let shippingData = {};
let paymentData = {};
let orderNumber = null;

// Inicializar checkout
document.addEventListener('DOMContentLoaded', async () => {
    // Esperar a que el authManager se inicialice
    const checkAuthInterval = setInterval(() => {
        if (!window.authManager.isInitializing) {
            clearInterval(checkAuthInterval);
            loadCheckout();
            setupEventListeners();
        }
    }, 100);
    
    // Timeout de seguridad después de 5 segundos
    setTimeout(() => {
        clearInterval(checkAuthInterval);
        if (window.authManager.isInitializing) {
            console.warn('⚠️ AuthManager no se inicializó en 5 segundos, continuando...');
            loadCheckout();
            setupEventListeners();
        }
    }, 5000);
});

// Configurar event listeners
function setupEventListeners() {
    document.getElementById('btnNext').addEventListener('click', nextStep);
    document.getElementById('btnPrevious').addEventListener('click', previousStep);
}

// Cargar checkout
async function loadCheckout() {
    const container = document.getElementById('checkoutContent');
    
    try {
        // Verificar autenticación
        if (!window.authManager.isAuthenticated()) {
            container.innerHTML = `
                <div class="checkout-loading">
                    <i class="fas fa-lock"></i>
                    <h2>Inicia sesión para continuar</h2>
                    <p>Necesitas estar autenticado para realizar una compra</p>
                    <button class="btn btn-primary" onclick="window.location.href='index.html'">Ir a Inicio</button>
                </div>
            `;
            return;
        }

        // Obtener carrito
        const cartResponse = await window.api.getCart();
        
        if (!cartResponse.success || cartResponse.data.items.length === 0) {
            container.innerHTML = `
                <div class="checkout-loading">
                    <i class="fas fa-shopping-cart"></i>
                    <h2>Tu carrito está vacío</h2>
                    <p>Agrega productos para continuar con la compra</p>
                    <button class="btn btn-primary" onclick="window.location.href='products.html'">Ver Productos</button>
                </div>
            `;
            return;
        }

        cartData = cartResponse.data;
        
        // Renderizar paso 1
        renderStep(1);
        renderOrderSummary();
        
        // Mostrar navegación
        const navigation = document.getElementById('checkoutNavigation');
        if (navigation) {
            navigation.style.display = 'flex';
        }
        
    } catch (error) {
        console.error('Error al cargar checkout:', error);
        window.notifications.error('Error al cargar el checkout');
    }
}

// Renderizar paso
function renderStep(step) {
    currentStep = step;
    updateProgressIndicator();
    
    const container = document.getElementById('checkoutContent');
    
    switch(step) {
        case 1:
            container.innerHTML = renderShippingStep();
            break;
        case 2:
            container.innerHTML = renderPaymentStep();
            break;
        case 3:
            container.innerHTML = renderReviewStep();
            break;
        case 4:
            container.innerHTML = renderConfirmationStep();
            break;
    }
    
    updateNavigationButtons();
}

// Actualizar indicador de progreso
function updateProgressIndicator() {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber < currentStep) {
            step.classList.add('completed');
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
        }
    });
}

// Actualizar botones de navegación
function updateNavigationButtons() {
    const btnPrevious = document.getElementById('btnPrevious');
    const btnNext = document.getElementById('btnNext');
    
    // Botón Atrás
    if (currentStep === 1) {
        btnPrevious.style.display = 'none';
    } else {
        btnPrevious.style.display = 'flex';
    }
    
    // Botón Siguiente/Completar
    if (currentStep === totalSteps) {
        btnNext.innerHTML = '<i class="fas fa-check"></i> Confirmar Pedido';
        btnNext.onclick = processOrder;
    } else {
        btnNext.innerHTML = 'Continuar <i class="fas fa-arrow-right"></i>';
        btnNext.onclick = nextStep;
    }
}

// Siguiente paso
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            currentStep++;
            renderStep(currentStep);
        }
    }
}

// Paso anterior
function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        renderStep(currentStep);
    }
}

// Validar paso actual
function validateCurrentStep() {
    switch(currentStep) {
        case 1:
            return validateShippingForm();
        case 2:
            return validatePaymentForm();
        case 3:
            return true;
        default:
            return true;
    }
}

// Renderizar Paso 1: Información de Envío
function renderShippingStep() {
    return `
        <div class="checkout-form-section">
            <h2><i class="fas fa-map-marker-alt"></i> Dirección de Envío</h2>
            
            <div class="form-group">
                <label class="form-label required">Nombre Completo</label>
                <input type="text" class="form-input" id="fullName" placeholder="Juan Pérez" required>
            </div>
            
            <div class="form-group">
                <label class="form-label required">Dirección</label>
                <input type="text" class="form-input" id="address" placeholder="Av. Principal 123" required>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label required">Ciudad</label>
                    <input type="text" class="form-input" id="city" placeholder="Lima" required>
                </div>
                <div class="form-group">
                    <label class="form-label required">País</label>
                    <select class="form-select" id="country" required>
                        <option value="Perú">Perú</option>
                        <option value="Chile">Chile</option>
                        <option value="Colombia">Colombia</option>
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Código Postal</label>
                    <input type="text" class="form-input" id="postalCode" placeholder="15001">
                </div>
                <div class="form-group">
                    <label class="form-label required">Teléfono</label>
                    <input type="tel" class="form-input" id="phone" placeholder="+51 987 654 321" required>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label required">Email</label>
                <input type="email" class="form-input" id="email" placeholder="juan@example.com" required>
            </div>
        </div>
    `;
}

// Renderizar Paso 2: Método de Pago
function renderPaymentStep() {
    return `
        <div class="checkout-form-section">
            <h2><i class="fas fa-credit-card"></i> Método de Pago</h2>
            
            <div class="payment-methods-grid">
                <div class="payment-method-card ${selectedPaymentMethod === 'stripe' ? 'selected' : ''}" onclick="selectPaymentMethod('stripe')">
                    <i class="fab fa-cc-visa"></i>
                    <div class="method-name">Tarjeta</div>
                    <div class="method-desc">Visa, Mastercard, Amex</div>
                </div>
                
                <div class="payment-method-card ${selectedPaymentMethod === 'paypal' ? 'selected' : ''}" onclick="selectPaymentMethod('paypal')">
                    <i class="fab fa-paypal"></i>
                    <div class="method-name">PayPal</div>
                    <div class="method-desc">Paga con tu cuenta PayPal</div>
                </div>
                
                <div class="payment-method-card ${selectedPaymentMethod === 'yape' ? 'selected' : ''}" onclick="selectPaymentMethod('yape')">
                    <i class="fas fa-mobile-alt"></i>
                    <div class="method-name">Yape</div>
                    <div class="method-desc">Pago móvil</div>
                </div>
                
                <div class="payment-method-card ${selectedPaymentMethod === 'cash' ? 'selected' : ''}" onclick="selectPaymentMethod('cash')">
                    <i class="fas fa-money-bill-wave"></i>
                    <div class="method-name">Efectivo</div>
                    <div class="method-desc">Pago contra entrega</div>
                </div>
            </div>
            
            ${selectedPaymentMethod === 'stripe' ? `
                <div class="payment-details active">
                    <h3>Detalles de la Tarjeta</h3>
                    <div class="form-group">
                        <label class="form-label required">Número de Tarjeta</label>
                        <input type="text" class="form-input" id="cardNumber" placeholder="4242 4242 4242 4242" maxlength="19">
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Nombre en la Tarjeta</label>
                        <input type="text" class="form-input" id="cardName" placeholder="JUAN PEREZ">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label required">Fecha de Vencimiento</label>
                            <input type="text" class="form-input" id="cardExpiry" placeholder="MM/AA" maxlength="5">
                        </div>
                        <div class="form-group">
                            <label class="form-label required">CVV</label>
                            <input type="text" class="form-input" id="cardCvv" placeholder="123" maxlength="4">
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Renderizar Paso 3: Revisar Pedido
function renderReviewStep() {
    return `
        <div class="checkout-form-section">
            <h2><i class="fas fa-clipboard-check"></i> Revisar Pedido</h2>
            
            <div class="review-info">
                <h4>Información de Envío</h4>
                <div class="review-info-item">
                    <span class="review-info-label">Nombre:</span>
                    <span class="review-info-value">${shippingData.fullName}</span>
                </div>
                <div class="review-info-item">
                    <span class="review-info-label">Dirección:</span>
                    <span class="review-info-value">${shippingData.address}</span>
                </div>
                <div class="review-info-item">
                    <span class="review-info-label">Ciudad:</span>
                    <span class="review-info-value">${shippingData.city}, ${shippingData.country}</span>
                </div>
                <div class="review-info-item">
                    <span class="review-info-label">Teléfono:</span>
                    <span class="review-info-value">${shippingData.phone}</span>
                </div>
                <div class="review-info-item">
                    <span class="review-info-label">Email:</span>
                    <span class="review-info-value">${shippingData.email}</span>
                </div>
            </div>
            
            <div class="review-info">
                <h4>Método de Pago</h4>
                <div class="review-info-item">
                    <span class="review-info-label">Método:</span>
                    <span class="review-info-value">${getPaymentMethodName(selectedPaymentMethod)}</span>
                </div>
                ${selectedPaymentMethod === 'stripe' ? `
                <div class="review-info-item">
                    <span class="review-info-label">Tarjeta:</span>
                    <span class="review-info-value">Terminada en ${paymentData.cardNumber ? paymentData.cardNumber.slice(-4) : '****'}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Renderizar Paso 4: Confirmación
function renderConfirmationStep() {
    return `
        <div class="confirmation-section">
            <div class="confirmation-icon">
                <i class="fas fa-check"></i>
            </div>
            <h2 class="confirmation-title">¡Pedido Confirmado!</h2>
            <p class="confirmation-message">Tu pedido ha sido procesado exitosamente</p>
            
            <div class="confirmation-details">
                <div class="confirmation-detail-item">
                    <span>Número de Pedido:</span>
                    <strong>#${orderNumber}</strong>
                </div>
                <div class="confirmation-detail-item">
                    <span>Fecha:</span>
                    <strong>${new Date().toLocaleDateString()}</strong>
                </div>
                <div class="confirmation-detail-item">
                    <span>Total:</span>
                    <strong>S/ ${cartData.total.toFixed(2)}</strong>
                </div>
            </div>
            
            <p style="color: var(--text-secondary); margin-bottom: var(--spacing-lg);">
                Recibirás un email de confirmación en <strong>${shippingData.email}</strong>
            </p>
            
            <div class="confirmation-actions">
                <button class="btn btn-outline" onclick="window.location.href='orders.html'">
                    <i class="fas fa-list"></i> Ver Mis Pedidos
                </button>
                <button class="btn btn-primary" onclick="window.location.href='index.html'">
                    <i class="fas fa-home"></i> Continuar Comprando
                </button>
            </div>
        </div>
    `;
}

// Seleccionar método de pago
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    renderStep(2);
}

// Obtener nombre del método de pago
function getPaymentMethodName(method) {
    const methods = {
        'stripe': 'Tarjeta de Crédito/Débito',
        'paypal': 'PayPal',
        'yape': 'Yape',
        'cash': 'Pago en Efectivo'
    };
    return methods[method] || method;
}

// Validar formulario de envío
function validateShippingForm() {
    const fullName = document.getElementById('fullName').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    
    const errors = [];
    
    if (!fullName || fullName.length < 3) {
        errors.push('El nombre debe tener al menos 3 caracteres');
    }
    
    if (!address || address.length < 10) {
        errors.push('La dirección debe tener al menos 10 caracteres');
    }
    
    if (!city) {
        errors.push('La ciudad es requerida');
    }
    
    if (!phone || !/^\+?[0-9]{9,15}$/.test(phone)) {
        errors.push('El teléfono no es válido');
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('El email no es válido');
    }
    
    if (errors.length > 0) {
        window.notifications.error(errors[0]);
        return false;
    }
    
    // Guardar datos de envío
    shippingData = {
        fullName,
        address,
        city,
        country: document.getElementById('country').value,
        postalCode: document.getElementById('postalCode').value,
        phone,
        email
    };
    
    return true;
}

// Validar formulario de pago
function validatePaymentForm() {
    if (selectedPaymentMethod === 'stripe') {
        const cardNumber = document.getElementById('cardNumber').value;
        const cardName = document.getElementById('cardName').value;
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCvv = document.getElementById('cardCvv').value;
        
        const errors = [];
        
        if (!cardNumber || cardNumber.length < 13) {
            errors.push('El número de tarjeta no es válido');
        }
        
        if (!cardName || cardName.length < 3) {
            errors.push('El nombre en la tarjeta no es válido');
        }
        
        if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
            errors.push('La fecha de vencimiento no es válida');
        }
        
        if (!cardCvv || cardCvv.length < 3) {
            errors.push('El CVV no es válido');
        }
        
        if (errors.length > 0) {
            window.notifications.error(errors[0]);
            return false;
        }
        
        // Guardar datos de pago
        paymentData = {
            cardNumber: cardNumber.replace(/\s/g, ''),
            cardName,
            cardExpiry,
            cardCvv
        };
    }
    
    return true;
}

// Renderizar resumen del pedido
function renderOrderSummary() {
    const summaryHTML = `
        <div class="order-summary">
            <h3>Resumen del Pedido</h3>
            <div class="summary-items">
                ${cartData.items.map(item => `
                    <div class="summary-item">
                        <img src="${item.image_url}" alt="${item.name}">
                        <div class="summary-item-info">
                            <div class="summary-item-name">${item.name}</div>
                            <div class="summary-item-price">S/ ${parseFloat(item.price).toFixed(2)} x ${item.quantity}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="summary-totals">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>S/ ${parseFloat(cartData.subtotal).toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Envío</span>
                    <span>S/ ${(cartData.shipping || 30.00).toFixed(2)}</span>
                </div>
                ${discount > 0 ? `
                <div class="summary-row">
                    <span>Descuento</span>
                    <span>-S/ ${parseFloat(discount).toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="summary-row total">
                    <span>Total</span>
                    <span>S/ ${parseFloat(cartData.total).toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('orderSummary').innerHTML = summaryHTML;
}

// Procesar pedido
async function processOrder() {
    try {
        // Mostrar loading
        window.notifications.show('Procesando pedido...', 'info');
        
        // Crear pedido
        const orderData = {
            // Datos de envío (formato plano para el backend)
            shipping_address: shippingData.address,
            shipping_city: shippingData.city,
            shipping_country: shippingData.country,
            shipping_postal_code: shippingData.postalCode,
            shipping_phone: shippingData.phone,
            shipping_email: shippingData.email,
            shipping_full_name: shippingData.fullName,
            // Método de pago
            payment_method: selectedPaymentMethod,
            // No enviamos payment_details por ahora
            // shipping cost viene del carrito
            shipping_cost: cartData.shipping || 30.00,
            // Código de cupón si aplicó
            coupon_code: appliedCoupon
        };
        
        const response = await window.api.createOrder(orderData);
        
        if (response.success) {
            // Guardar número de pedido
            orderNumber = response.data.order_number || response.data.id;
            
            // Limpiar carrito
            await window.api.clearCart();
            
            // Ir a confirmación
            currentStep = 4;
            renderStep(4);
            
            // Ocultar navegación
            document.getElementById('checkoutNavigation').style.display = 'none';
            
            window.notifications.success('Pedido confirmado exitosamente');
        } else {
            throw new Error(response.message || 'Error al procesar el pedido');
        }
    } catch (error) {
        console.error('Error al procesar pedido:', error);
        window.notifications.error(error.message || 'Error al procesar el pedido');
    }
}

// Aplicar cupón
async function applyCoupon() {
    const couponInput = document.getElementById('couponCode');
    const couponCode = couponInput.value.trim();
    
    if (!couponCode) {
        window.notifications.warning('Ingresa un código de cupón');
        return;
    }
    
    try {
        const response = await window.api.validateCoupon(couponCode, cartData.total);
        
        if (response.success) {
            appliedCoupon = couponCode;
            discount = response.data.discount;
            cartData.total = cartData.subtotal + (cartData.shipping || 30.00) - discount;
            
            window.notifications.success('Cupón aplicado exitosamente');
            renderOrderSummary();
        } else {
            throw new Error(response.message || 'Cupón inválido');
        }
    } catch (error) {
        console.error('Error al aplicar cupón:', error);
        window.notifications.error(error.message || 'Error al aplicar cupón');
    }
}

