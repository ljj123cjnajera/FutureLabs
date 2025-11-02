// 🛒 Checkout Mejorado - FutureLabs

// Variables globales
let currentStep = 1;
const totalSteps = 4;
let selectedPaymentMethod = 'stripe';
let cartData = null;
let appliedCoupon = null;
let discount = 0;
let loyaltyPointsUsed = 0;
let loyaltyPointsDiscount = 0;
let availableLoyaltyPoints = 0;
let savedAddresses = [];
let selectedAddressId = null;
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
        
        // Cargar puntos de fidelidad disponibles
        try {
            const pointsResponse = await window.api.getLoyaltyPoints();
            if (pointsResponse.success) {
                availableLoyaltyPoints = pointsResponse.data.points || 0;
            }
        } catch (error) {
            console.log('No se pudieron cargar puntos de fidelidad:', error);
        }

        // Cargar direcciones guardadas
        try {
            const addressesResponse = await window.api.getAddresses();
            if (addressesResponse.success) {
                savedAddresses = addressesResponse.data.addresses || [];
                // Si hay una dirección por defecto, seleccionarla
                const defaultAddress = savedAddresses.find(addr => addr.is_default);
                if (defaultAddress) {
                    selectedAddressId = defaultAddress.id;
                    loadAddressData(defaultAddress);
                }
            }
        } catch (error) {
            console.log('No se pudieron cargar direcciones guardadas:', error);
        }
        
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
            
            ${savedAddresses.length > 0 ? `
            <div class="saved-addresses" style="margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <h3 style="margin: 0 0 15px 0; font-size: 16px;">Direcciones Guardadas</h3>
                <div style="display: grid; gap: 10px;">
                    ${savedAddresses.map(addr => `
                        <label style="display: flex; align-items: start; gap: 10px; padding: 15px; border: 2px solid ${selectedAddressId === addr.id ? '#667eea' : '#ddd'}; border-radius: 8px; background: white; cursor: pointer; transition: all 0.3s;">
                            <input type="radio" name="savedAddress" value="${addr.id}" ${selectedAddressId === addr.id ? 'checked' : ''} 
                                   onchange="selectSavedAddress('${addr.id}')" style="margin-top: 4px;">
                            <div style="flex: 1;">
                                <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 5px;">
                                    <strong>${addr.label || 'Dirección'}</strong>
                                    ${addr.is_default ? '<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px;">POR DEFECTO</span>' : ''}
                                </div>
                                <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">
                                    ${addr.full_name}<br>
                                    ${addr.address}, ${addr.city}, ${addr.country}<br>
                                    Tel: ${addr.phone}
                                </p>
                            </div>
                        </label>
                    `).join('')}
                </div>
                <button type="button" class="btn btn-outline" onclick="useNewAddress()" style="margin-top: 15px; padding: 8px 16px; font-size: 14px;">
                    <i class="fas fa-plus"></i> Usar Nueva Dirección
                </button>
            </div>
            ` : ''}
            
            <div id="shippingFormSection" style="${savedAddresses.length > 0 && selectedAddressId ? 'display: none;' : ''}">
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
        </div>
    `;
}

// Seleccionar dirección guardada
function selectSavedAddress(addressId) {
    selectedAddressId = addressId;
    const address = savedAddresses.find(addr => addr.id === addressId);
    if (address) {
        loadAddressData(address);
        document.getElementById('shippingFormSection').style.display = 'none';
        renderOrderSummary();
    }
}

// Usar nueva dirección
function useNewAddress() {
    selectedAddressId = null;
    document.getElementById('shippingFormSection').style.display = 'block';
    // Desmarcar radio buttons
    document.querySelectorAll('input[name="savedAddress"]').forEach(radio => {
        radio.checked = false;
    });
}

// Cargar datos de dirección en el formulario
function loadAddressData(address) {
    shippingData = {
        fullName: address.full_name,
        address: address.address,
        city: address.city,
        country: address.country,
        postalCode: address.postal_code || '',
        phone: address.phone,
        email: address.email || ''
    };
}

// Hacer funciones globales
window.selectSavedAddress = selectSavedAddress;
window.useNewAddress = useNewAddress;

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
                    <div id="stripe-card-element" style="border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin: 20px 0; background: white;"></div>
                    <p style="color: #666; font-size: 14px; margin-top: 10px;">
                        <i class="fas fa-lock"></i> Tu información está protegida por Stripe
                    </p>
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
    // Si hay una dirección seleccionada, usar esos datos
    if (selectedAddressId) {
        const address = savedAddresses.find(addr => addr.id === selectedAddressId);
        if (address) {
            shippingData = {
                fullName: address.full_name,
                address: address.address,
                city: address.city,
                country: address.country,
                postalCode: address.postal_code || '',
                phone: address.phone,
                email: address.email || ''
            };
            return true;
        }
    }

    // Validar formulario manual
    const fullName = document.getElementById('fullName')?.value;
    const address = document.getElementById('address')?.value;
    const city = document.getElementById('city')?.value;
    const phone = document.getElementById('phone')?.value;
    const email = document.getElementById('email')?.value;
    
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
            ${availableLoyaltyPoints > 0 ? `
            <div class="loyalty-section" style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin: 20px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div>
                        <strong><i class="fas fa-gift"></i> Tus Puntos</strong>
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                            ${availableLoyaltyPoints} puntos disponibles (${(availableLoyaltyPoints / 10).toFixed(1)} S/ de descuento)
                        </p>
                    </div>
                    ${loyaltyPointsUsed === 0 ? `
                    <button class="btn btn-outline" onclick="useLoyaltyPoints()" style="padding: 8px 16px; font-size: 14px;">
                        <i class="fas fa-star"></i> Usar Puntos
                    </button>
                    ` : `
                    <div>
                        <strong style="color: #10b981;">-${loyaltyPointsUsed} puntos</strong>
                        <button class="btn btn-sm" onclick="removeLoyaltyPoints()" style="padding: 4px 8px; font-size: 12px; margin-left: 10px;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    `}
                </div>
                ${loyaltyPointsDiscount > 0 ? `
                <div class="summary-row" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                    <span>Descuento por Puntos</span>
                    <span style="color: #10b981;">-S/ ${loyaltyPointsDiscount.toFixed(2)}</span>
                </div>
                ` : ''}
            </div>
            ` : ''}
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
                    <span>Descuento Cupón</span>
                    <span>-S/ ${parseFloat(discount).toFixed(2)}</span>
                </div>
                ` : ''}
                ${loyaltyPointsDiscount > 0 ? `
                <div class="summary-row">
                    <span>Descuento Puntos</span>
                    <span style="color: #10b981;">-S/ ${loyaltyPointsDiscount.toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="summary-row total">
                    <span>Total</span>
                    <span>S/ ${(parseFloat(cartData.total) - loyaltyPointsDiscount).toFixed(2)}</span>
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
        
        // Si es pago con Stripe, crear payment intent primero
        let paymentIntent = null;
        if (selectedPaymentMethod === 'stripe') {
            try {
                window.notifications.show('Inicializando pago seguro...', 'info');
                
                const stripeResponse = await window.api.createStripePaymentIntent({
                    amount: cartData.total,
                    currency: 'pen'
                });
                
                if (stripeResponse.success) {
                    paymentIntent = stripeResponse.data.client_secret;
                    
                    // Procesar pago con Stripe
                    if (window.stripeCheckout && window.stripeCheckout.processPayment) {
                        await window.stripeCheckout.processPayment(paymentIntent);
                    } else {
                        // Si Stripe no está disponible, usar método simulado
                        window.notifications.show('Procesando pago simulado...', 'info');
                    }
                }
            } catch (error) {
                // Si hay error con Stripe, continuar con pago simulado
                console.log('Error con Stripe:', error.message);
                selectedPaymentMethod = 'cash'; // Cambiar a efectivo
                window.notifications.show('Stripe no está configurado. Continuando con pago simulado.', 'warning');
            }
        }
        
        // Si se usaron puntos, canjearlos primero
        if (loyaltyPointsUsed > 0) {
            try {
                await window.api.redeemLoyaltyPoints(loyaltyPointsUsed);
                window.notifications.success(`${loyaltyPointsUsed} puntos canjeados exitosamente`);
            } catch (error) {
                console.error('Error canjeando puntos:', error);
                window.notifications.error('Error al canjear puntos. El pedido continuará sin descuento de puntos.');
                loyaltyPointsDiscount = 0;
            }
        }

        // Crear pedido
        const finalTotal = parseFloat(cartData.total) - discount - loyaltyPointsDiscount;
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
            shipping_cost: cartData.shipping || 30.00,
            coupon_code: appliedCoupon,
            // Incluir información de puntos (el backend ajustará el total si es necesario)
            loyalty_points_used: loyaltyPointsUsed
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
        const items = cartData.items.map(item => ({
          product_id: item.product_id,
          category_id: item.category_id,
          brand: item.brand
        }));
        
        const response = await window.api.validateCoupon(couponCode, cartData.total, items);
        
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


// Seleccionar método de pago
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    renderStep(2); // Re-renderizar el paso de pago
    
    // Si es Stripe y Stripe está disponible, inicializar card element
    if (method === 'stripe' && window.stripeCheckout && window.stripeCheckout.showCardForm) {
        setTimeout(() => {
            window.stripeCheckout.showCardForm();
        }, 100);
    }
}

// Hacer disponible globalmente
window.selectPaymentMethod = selectPaymentMethod;

// Usar puntos de fidelidad
async function useLoyaltyPoints() {
    if (availableLoyaltyPoints === 0) {
        window.notifications.warning('No tienes puntos disponibles');
        return;
    }

    // Calcular el máximo de puntos que se pueden usar (no más del total)
    const maxDiscount = parseFloat(cartData.total) - discount;
    const maxPointsDiscount = Math.min(availableLoyaltyPoints / 10, maxDiscount);
    const pointsToUse = Math.floor(maxPointsDiscount * 10);

    if (pointsToUse === 0) {
        window.notifications.warning('No puedes usar puntos en este pedido');
        return;
    }

    // Usar todos los puntos disponibles o los necesarios
    loyaltyPointsUsed = Math.min(pointsToUse, availableLoyaltyPoints);
    loyaltyPointsDiscount = loyaltyPointsUsed / 10;

    window.notifications.success(`Usando ${loyaltyPointsUsed} puntos (S/ ${loyaltyPointsDiscount.toFixed(2)} de descuento)`);
    renderOrderSummary();
}

// Remover puntos de fidelidad
function removeLoyaltyPoints() {
    loyaltyPointsUsed = 0;
    loyaltyPointsDiscount = 0;
    window.notifications.info('Puntos removidos');
    renderOrderSummary();
}

// Hacer disponible globalmente
window.useLoyaltyPoints = useLoyaltyPoints;
window.removeLoyaltyPoints = removeLoyaltyPoints;

