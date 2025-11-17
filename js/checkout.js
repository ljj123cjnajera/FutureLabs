// 🛒 Checkout Mejorado - FutureLabs

// Variables globales
let currentStep = 1;
const totalSteps = 4;
let selectedPaymentMethod = 'cash'; // Por defecto efectivo (más seguro si Stripe no está configurado)
const shippingOptions = {
    standard: {
        label: 'Envío Estándar',
        description: 'Entrega en 3-5 días hábiles',
        eta: 'Llegaría entre 3 y 5 días hábiles',
        amount: 20.0
    },
    express: {
        label: 'Envío Exprés',
        description: 'Entrega en 24-48 horas hábiles',
        eta: 'Llegaría en las próximas 24-48 horas',
        amount: 45.0
    },
    pickup: {
        label: 'Recojo en tienda',
        description: 'Recojo sin costo en nuestra sede principal',
        eta: 'Retira en el mismo día desde nuestras oficinas',
        amount: 0.0
    }
};
let selectedShippingOption = 'standard';
let cartData = null;
let appliedCoupon = null;
let discount = 0;
let loyaltyPointsUsed = 0;
let loyaltyPointsDiscount = 0;
let availableLoyaltyPoints = 0;
let savedAddresses = [];
let selectedAddressId = null;
let shippingData = { shippingMethod: selectedShippingOption };
let paymentData = {};
let orderNumber = null;
const checkoutCurrencyFormatter = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2
});

window.addEventListener('couponUpdated', handleCouponUpdate);

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
        const baseSubtotal = Number(cartData.subtotal ?? cartData.total ?? 0);
        cartData.subtotal = baseSubtotal;
        if (!shippingOptions[selectedShippingOption]) {
            selectedShippingOption = 'standard';
        }
        updateCartShippingAmount();
        const couponItems = cartData.items.map(item => ({
            product_id: item.product_id,
            category_id: item.category_id,
            brand: item.brand
        }));

        if (window.couponsManager) {
            window.couponsManager.setCartContext(couponItems, baseSubtotal);
            window.couponsManager.context = 'checkout';
        }
        
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
            initializeShippingStep();
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
        step.removeAttribute('aria-current');
        
        if (stepNumber < currentStep) {
            step.classList.add('completed');
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
            step.setAttribute('aria-current', 'step');
        }
    });
}

// Actualizar botones de navegación
function updateNavigationButtons() {
    const btnPrevious = document.getElementById('btnPrevious');
    const btnNext = document.getElementById('btnNext');
    
    if (!btnPrevious || !btnNext) return;
    
    // Botón Atrás
    if (currentStep === 1) {
        btnPrevious.style.display = 'none';
    } else {
        btnPrevious.style.display = 'flex';
    }
    
    // Botón Siguiente/Completar
    if (currentStep === 3) {
        // Paso 3 (Revisar): Aquí se procesa el pedido y pago
        btnNext.innerHTML = '<i class="fas fa-check"></i> Confirmar y Pagar';
        btnNext.onclick = processOrder;
        btnNext.disabled = false;
    } else if (currentStep === 4) {
        // Paso 4 (Confirmación): Ya no hay botón de acción
        btnNext.style.display = 'none';
        btnPrevious.style.display = 'none';
    } else {
        btnNext.innerHTML = 'Continuar <i class="fas fa-arrow-right"></i>';
        btnNext.onclick = nextStep;
        btnNext.disabled = false;
        btnNext.style.display = 'flex';
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
    const selectedOption = shippingOptions[selectedShippingOption] ? selectedShippingOption : 'standard';
    const shippingOptionCards = Object.entries(shippingOptions).map(([key, option]) => `
        <article class="shipping-method-card ${selectedOption === key ? 'is-selected' : ''}" data-shipping-option="${key}">
            <div class="shipping-method-card-header">
                <div>
                    <span class="shipping-method-title">${option.label}</span>
                    <p class="shipping-method-description">${option.description}</p>
                </div>
                <div class="shipping-method-price">${checkoutCurrencyFormatter.format(option.amount)}</div>
            </div>
            <div class="shipping-method-meta">
                <i class="fas fa-shipping-fast"></i>
                <span>${option.eta}</span>
            </div>
        </article>
    `).join('');

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
                <input type="text" class="form-input" id="fullName" placeholder="Juan Pérez" value="${shippingData.fullName ?? ''}" required>
            </div>
            
            <div class="form-group">
                <label class="form-label required">Dirección</label>
                <input type="text" class="form-input" id="address" placeholder="Av. Principal 123" value="${shippingData.address ?? ''}" required>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label required">Ciudad</label>
                    <input type="text" class="form-input" id="city" placeholder="Lima" value="${shippingData.city ?? ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label required">País</label>
                    <select class="form-select" id="country" required>
                        <option value="Perú" ${shippingData.country === 'Perú' ? 'selected' : ''}>Perú</option>
                        <option value="Chile" ${shippingData.country === 'Chile' ? 'selected' : ''}>Chile</option>
                        <option value="Colombia" ${shippingData.country === 'Colombia' ? 'selected' : ''}>Colombia</option>
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Código Postal</label>
                    <input type="text" class="form-input" id="postalCode" placeholder="15001" value="${shippingData.postalCode ?? ''}">
                </div>
                <div class="form-group">
                    <label class="form-label required">Teléfono</label>
                    <input type="tel" class="form-input" id="phone" placeholder="+51 987 654 321" value="${shippingData.phone ?? ''}" required>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label required">Email</label>
                <input type="email" class="form-input" id="email" placeholder="juan@example.com" value="${shippingData.email ?? ''}" required>
            </div>
            </div>

            <div class="shipping-methods">
                <h3>Opciones de entrega</h3>
                <div class="shipping-methods-grid">
                    ${shippingOptionCards}
                </div>
            </div>
        </div>
    `;
}

function initializeShippingStep() {
    if (shippingData?.shippingMethod && shippingOptions[shippingData.shippingMethod]) {
        selectedShippingOption = shippingData.shippingMethod;
        updateCartShippingAmount();
        renderOrderSummary();
    }

    const optionCards = document.querySelectorAll('[data-shipping-option]');
    optionCards.forEach(card => {
        card.addEventListener('click', () => selectShippingMethod(card.dataset.shippingOption));
    });
    highlightShippingSelection();

    const savedAddressInputs = document.querySelectorAll('input[name="savedAddress"]');
    savedAddressInputs.forEach(input => {
        input.checked = input.value === selectedAddressId;
    });

    const formSection = document.getElementById('shippingFormSection');
    if (formSection) {
        formSection.style.display = selectedAddressId ? 'none' : 'block';
    }
}

function selectShippingMethod(optionKey) {
    if (!shippingOptions[optionKey]) {
        return;
    }

    selectedShippingOption = optionKey;
    updateCartShippingAmount();
    highlightShippingSelection();
    renderOrderSummary();
}

function highlightShippingSelection() {
    const optionCards = document.querySelectorAll('[data-shipping-option]');
    optionCards.forEach(card => {
        card.classList.toggle('is-selected', card.dataset.shippingOption === selectedShippingOption);
    });
}

function updateCartShippingAmount() {
    const option = shippingOptions[selectedShippingOption];
    if (!option) return;

    if (!shippingData) {
        shippingData = {};
    }

    shippingData.shippingMethod = selectedShippingOption;
    shippingData.shippingMethodLabel = option.label;
    shippingData.shippingMethodAmount = option.amount;

    if (cartData) {
        cartData.shipping = option.amount;
    }
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
        email: address.email || '',
        shippingMethod: shippingData.shippingMethod || selectedShippingOption
    };
}

// Hacer funciones globales
window.selectSavedAddress = selectSavedAddress;
window.useNewAddress = useNewAddress;

// Variables para Stripe
let stripe = null;
let stripeElements = null;
let stripeCardElement = null;

// Renderizar Paso 2: Método de Pago
function renderPaymentStep() {
    const subtotal = Number(cartData.subtotal ?? cartData.total ?? 0);
    const shippingAmount = Number(cartData.shipping ?? shippingOptions[selectedShippingOption]?.amount ?? 0);
    const total = Math.max(subtotal + shippingAmount - discount - loyaltyPointsDiscount, 0);
    
    return `
        <div class="checkout-form-section">
            <h2><i class="fas fa-credit-card"></i> Método de Pago</h2>
            
            <div class="payment-methods-grid">
                <div class="payment-method-card ${selectedPaymentMethod === 'stripe' ? 'selected' : ''}" onclick="selectPaymentMethod('stripe')">
                    <i class="fab fa-cc-visa"></i>
                    <div class="method-name">Tarjeta</div>
                    <div class="method-desc">Visa, Mastercard, Amex</div>
                </div>
                
                <div class="payment-method-card ${selectedPaymentMethod === 'yape' ? 'selected' : ''}" onclick="selectPaymentMethod('yape')">
                    <i class="fas fa-mobile-alt"></i>
                    <div class="method-name">Yape</div>
                    <div class="method-desc">Pago móvil rápido</div>
                </div>
                
                <div class="payment-method-card ${selectedPaymentMethod === 'plin' ? 'selected' : ''}" onclick="selectPaymentMethod('plin')">
                    <i class="fas fa-mobile-alt"></i>
                    <div class="method-name">Plin</div>
                    <div class="method-desc">Pago móvil rápido</div>
                </div>
                
                <div class="payment-method-card ${selectedPaymentMethod === 'cash' ? 'selected' : ''}" onclick="selectPaymentMethod('cash')">
                    <i class="fas fa-money-bill-wave"></i>
                    <div class="method-name">Efectivo</div>
                    <div class="method-desc">Pago contra entrega</div>
                </div>
            </div>
            
            ${selectedPaymentMethod === 'stripe' ? `
                <div class="payment-details active" id="stripe-payment-details">
                    <h3>Detalles de la Tarjeta</h3>
                    <div id="stripe-card-element" style="border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin: 20px 0; background: white;"></div>
                    <div id="stripe-card-errors" role="alert" style="color: #dc2626; font-size: 14px; margin-top: 10px;"></div>
                    <p style="color: #666; font-size: 14px; margin-top: 10px;">
                        <i class="fas fa-lock"></i> Tu información está protegida por Stripe
                    </p>
                </div>
            ` : ''}
            
            ${selectedPaymentMethod === 'yape' || selectedPaymentMethod === 'plin' ? `
                <div class="payment-details active" id="mobile-payment-details">
                    <h3>Información de Pago ${selectedPaymentMethod === 'yape' ? 'Yape' : 'Plin'}</h3>
                    <div class="form-group">
                        <label for="mobile-phone">Número de teléfono *</label>
                        <input type="tel" id="mobile-phone" class="form-control" placeholder="Ej: 987654321" required>
                        <small class="form-text">Ingresa el número asociado a tu ${selectedPaymentMethod === 'yape' ? 'Yape' : 'Plin'}</small>
                    </div>
                    <div class="payment-info-box" style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-top: 16px;">
                        <p style="margin: 0; color: #0c4a6e;">
                            <strong>Total a pagar:</strong> ${checkoutCurrencyFormatter.format(total)}
                        </p>
                        <p style="margin: 8px 0 0 0; color: #0c4a6e; font-size: 14px;">
                            Realiza el pago desde tu app y confirma el pedido. Te enviaremos un email con las instrucciones.
                        </p>
                    </div>
                </div>
            ` : ''}
            
            ${selectedPaymentMethod === 'cash' ? `
                <div class="payment-details active" id="cash-payment-details">
                    <h3>Pago en Efectivo</h3>
                    <div class="payment-info-box" style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 16px; margin-top: 16px;">
                        <p style="margin: 0; color: #166534;">
                            <strong>Total a pagar:</strong> ${checkoutCurrencyFormatter.format(total)}
                        </p>
                        <p style="margin: 8px 0 0 0; color: #166534; font-size: 14px;">
                            Pagarás en efectivo al momento de recibir tu pedido. El repartidor aceptará el pago exacto.
                        </p>
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
                <span class="review-info-label">Método de envío:</span>
                <span class="review-info-value">
                    ${shippingOptions[shippingData.shippingMethod || selectedShippingOption]?.label || shippingOptions.standard.label}
                    (${checkoutCurrencyFormatter.format(shippingOptions[shippingData.shippingMethod || selectedShippingOption]?.amount ?? shippingOptions.standard.amount)})
                </span>
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
                ${selectedPaymentMethod === 'yape' || selectedPaymentMethod === 'plin' ? `
                <div class="review-info-item">
                    <span class="review-info-label">Teléfono:</span>
                    <span class="review-info-value">${document.getElementById('mobile-phone')?.value || 'No especificado'}</span>
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
        'plin': 'Plin',
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
    if (!cartData) return;

    const subtotal = Number(cartData.subtotal ?? cartData.total ?? 0);
    const selectedOption = shippingOptions[selectedShippingOption] || shippingOptions.standard;
    const shippingAmount = Number(cartData.shipping ?? selectedOption.amount ?? 0);
    const couponDiscount = Number(discount || 0);
    const pointsDiscount = Number(loyaltyPointsDiscount || 0);
    const totalBeforePoints = Math.max(subtotal + shippingAmount - couponDiscount, 0);
    const totalDue = Math.max(totalBeforePoints - pointsDiscount, 0);

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
            <div id="checkoutCouponSection"></div>
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
                ${pointsDiscount > 0 ? `
                <div class="summary-row" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                    <span>Descuento por Puntos</span>
                    <span style="color: #10b981;">-S/ ${pointsDiscount.toFixed(2)}</span>
                </div>
                ` : ''}
            </div>
            ` : ''}
            <div class="summary-totals">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>${checkoutCurrencyFormatter.format(subtotal)}</span>
                </div>
                <div class="summary-row">
                    <span>Envío (${selectedOption.label})</span>
                    <span>${checkoutCurrencyFormatter.format(shippingAmount)}</span>
                </div>
                ${couponDiscount > 0 ? `
                <div class="summary-row">
                    <span>Descuento Cupón</span>
                    <span>- ${checkoutCurrencyFormatter.format(couponDiscount)}</span>
                </div>
                ` : ''}
                ${pointsDiscount > 0 ? `
                <div class="summary-row">
                    <span>Descuento Puntos</span>
                    <span style="color: #10b981;">- ${checkoutCurrencyFormatter.format(pointsDiscount)}</span>
                </div>
                ` : ''}
                <div class="summary-row total">
                    <span>Total</span>
                    <span>${checkoutCurrencyFormatter.format(totalDue)}</span>
                </div>
            </div>
        </div>
    `;

    const summaryContainer = document.getElementById('orderSummary');
    if (!summaryContainer) return;
    summaryContainer.innerHTML = summaryHTML;
    mountCheckoutCoupons();
}

function mountCheckoutCoupons() {
    if (!window.couponsManager) return;
    window.couponsManager.context = 'checkout';
    window.couponsManager.containerId = 'checkoutCouponSection';
    window.couponsManager.renderCouponForm('checkoutCouponSection');

    if (!window.couponsManager.availableCouponsLoaded && !window.couponsManager.availableCouponsLoading) {
        window.couponsManager.loadAvailableCoupons();
    } else {
        window.couponsManager.renderAvailableCouponsList();
    }
}

function handleCouponUpdate(event) {
    if (!cartData) return;
    if (!document.getElementById('orderSummary')) return;

    const detail = event.detail || {};
    discount = Number(detail.discount || 0);
    appliedCoupon = detail.applied && detail.coupon ? detail.coupon.code : null;
    cartData.coupon = detail.coupon || null;
    cartData.totalWithDiscount = detail.totalWithDiscount
        ? Number(detail.totalWithDiscount)
        : Math.max((cartData.subtotal ?? cartData.total ?? 0) - discount, 0);

    renderOrderSummary();
}

// Validar datos de envío
function validateShippingData() {
    if (!shippingData.fullName || !shippingData.address || !shippingData.city || 
        !shippingData.country || !shippingData.phone || !shippingData.email) {
        return { valid: false, message: 'Por favor completa todos los campos de envío' };
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingData.email)) {
        return { valid: false, message: 'Por favor ingresa un email válido' };
    }
    
    return { valid: true };
}

// Validar método de pago
function validatePaymentMethod() {
    if (selectedPaymentMethod === 'yape' || selectedPaymentMethod === 'plin') {
        const phoneInput = document.getElementById('mobile-phone');
        if (!phoneInput || !phoneInput.value.trim()) {
            return { valid: false, message: 'Por favor ingresa tu número de teléfono' };
        }
        
        const phone = phoneInput.value.trim();
        if (phone.length < 9) {
            return { valid: false, message: 'Por favor ingresa un número de teléfono válido' };
        }
    }
    
    if (selectedPaymentMethod === 'stripe') {
        if (!stripeCardElement) {
            return { valid: false, message: 'Por favor completa los datos de la tarjeta' };
        }
    }
    
    return { valid: true };
}

// Procesar pedido
async function processOrder() {
    const btnNext = document.getElementById('btnNext');
    const btnPrevious = document.getElementById('btnPrevious');
    
    try {
        // Deshabilitar botones durante el procesamiento
        if (btnNext) {
            btnNext.disabled = true;
            btnNext.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        }
        if (btnPrevious) {
            btnPrevious.disabled = true;
        }
        
        // Validar datos de envío
        const shippingValidation = validateShippingData();
        if (!shippingValidation.valid) {
            window.notifications.error(shippingValidation.message);
            currentStep = 1;
            renderStep(1);
            if (btnNext) btnNext.disabled = false;
            if (btnPrevious) btnPrevious.disabled = false;
            return;
        }
        
        // Validar método de pago
        const paymentValidation = validatePaymentMethod();
        if (!paymentValidation.valid) {
            window.notifications.error(paymentValidation.message);
            currentStep = 2;
            renderStep(2);
            if (selectedPaymentMethod === 'stripe') {
                setTimeout(() => initializeStripeElements(), 100);
            }
            if (btnNext) btnNext.disabled = false;
            if (btnPrevious) btnPrevious.disabled = false;
            return;
        }
        
        // Mostrar loading
        window.notifications.show('Procesando pedido...', 'info');
        
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

        // Crear pedido primero
        const subtotal = Number(cartData.subtotal ?? cartData.total ?? 0);
        const shippingOption = shippingOptions[selectedShippingOption] || shippingOptions.standard;
        const shippingAmount = Number(cartData.shipping ?? shippingOption.amount ?? 0);
        const finalTotal = Math.max(subtotal + shippingAmount - discount - loyaltyPointsDiscount, 0);
        
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
            shipping_method: selectedShippingOption,
            shipping_option_label: shippingOption.label,
            shipping_cost: shippingAmount,
            coupon_code: appliedCoupon,
            // Incluir información de puntos (el backend ajustará el total si es necesario)
            loyalty_points_used: loyaltyPointsUsed
        };
        
        window.notifications.show('Creando pedido...', 'info');
        const orderResponse = await window.api.createOrder(orderData);
        
        if (!orderResponse.success) {
            throw new Error(orderResponse.message || 'Error al crear el pedido');
        }
        
        // Obtener orderId y orderNumber del response
        // El backend devuelve: { success: true, data: { order } }
        const order = orderResponse.data.order || orderResponse.data;
        if (!order) {
            throw new Error('No se recibió información del pedido');
        }
        
        const orderId = order.id;
        orderNumber = order.order_number || order.orderNumber;
        
        if (!orderId) {
            throw new Error('No se pudo obtener el ID del pedido');
        }
        
        console.log('Pedido creado:', { orderId, orderNumber, order });
        
        // Procesar pago según el método seleccionado
        try {
            if (selectedPaymentMethod === 'stripe') {
                await processStripePayment(orderId, finalTotal);
            } else if (selectedPaymentMethod === 'yape' || selectedPaymentMethod === 'plin') {
                await processMobilePayment(orderId, finalTotal);
            } else if (selectedPaymentMethod === 'cash') {
                await processCashPayment(orderId);
            } else {
                // Si no hay método de pago válido, marcar como pendiente
                console.warn('Método de pago no reconocido, marcando como pendiente');
            }
        } catch (paymentError) {
            console.error('Error procesando pago:', paymentError);
            // El pedido ya fue creado, pero el pago falló
            // Mostrar mensaje pero continuar con la confirmación
            window.notifications.warning('El pedido fue creado pero hubo un problema con el pago. Contacta con soporte.');
        }
        
        // Limpiar carrito
        try {
            await window.api.clearCart();
        } catch (error) {
            console.error('Error limpiando carrito:', error);
            // No es crítico, continuar
        }
        
        // Ir a confirmación
        currentStep = 4;
        renderStep(4);
        updateNavigationButtons();
        updateProgressIndicator();
        
        // Ocultar navegación
        const navElement = document.getElementById('checkoutNavigation');
        if (navElement) {
            navElement.style.display = 'none';
        }
        
        window.notifications.success('¡Pedido confirmado exitosamente!');
        
    } catch (error) {
        console.error('Error al procesar pedido:', error);
        window.notifications.error(error.message || 'Error al procesar el pedido. Por favor, intenta nuevamente.');
        
        // Re-habilitar botones
        if (btnNext) {
            btnNext.disabled = false;
            btnNext.innerHTML = '<i class="fas fa-check"></i> Confirmar y Pagar';
        }
        if (btnPrevious) {
            btnPrevious.disabled = false;
        }
    }
}

// Procesar pago con Stripe
async function processStripePayment(orderId, amount) {
    try {
        window.notifications.show('Procesando pago con tarjeta...', 'info');
        
        // Crear payment intent
        const intentResponse = await window.api.createStripePaymentIntent({
            order_id: orderId,
            amount: amount,
            currency: 'pen'
        });
        
        if (!intentResponse.success) {
            throw new Error(intentResponse.message || 'Error al crear intención de pago');
        }
        
        const clientSecret = intentResponse.data.client_secret;
        
        // Confirmar pago con Stripe
        if (!stripe || !stripeCardElement) {
            throw new Error('Stripe no está inicializado correctamente');
        }
        
        // Crear payment method primero
        const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: stripeCardElement,
            billing_details: {
                name: shippingData.fullName,
                email: shippingData.email,
                phone: shippingData.phone,
                address: {
                    line1: shippingData.address,
                    city: shippingData.city,
                    country: shippingData.country,
                    postal_code: shippingData.postalCode
                }
            }
        });
        
        if (pmError) {
            throw new Error(pmError.message || 'Error al crear método de pago');
        }
        
        // Confirmar pago con el payment method
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: paymentMethod.id
        });
        
        if (error) {
            throw new Error(error.message || 'Error al procesar el pago');
        }
        
        // Procesar pago en el backend
        const paymentResponse = await window.api.processStripePayment(orderId, paymentMethod.id);
        
        if (!paymentResponse.success) {
            throw new Error(paymentResponse.message || 'Error al confirmar el pago');
        }
        
        window.notifications.success('Pago procesado exitosamente');
        
    } catch (error) {
        console.error('Error procesando pago Stripe:', error);
        throw error;
    }
}

// Procesar pago móvil (Yape/Plin)
async function processMobilePayment(orderId, amount) {
    try {
        const phoneInput = document.getElementById('mobile-phone');
        const phoneNumber = phoneInput ? phoneInput.value.trim() : '';
        
        if (!phoneNumber) {
            throw new Error('Número de teléfono requerido');
        }
        
        window.notifications.show(`Procesando pago con ${selectedPaymentMethod === 'yape' ? 'Yape' : 'Plin'}...`, 'info');
        
        const paymentResponse = await window.api.processMobilePayment(orderId, phoneNumber, amount);
        
        if (!paymentResponse.success) {
            throw new Error(paymentResponse.message || 'Error al procesar el pago');
        }
        
        window.notifications.success(`Pago con ${selectedPaymentMethod === 'yape' ? 'Yape' : 'Plin'} registrado. Te enviaremos un email de confirmación.`);
        
        return true;
        
    } catch (error) {
        console.error('Error procesando pago móvil:', error);
        // Para pagos móviles, mostrar advertencia pero continuar
        window.notifications.warning('El pedido fue creado. Por favor, confirma el pago desde tu app móvil.');
        return false;
    }
}

// Procesar pago en efectivo
async function processCashPayment(orderId) {
    try {
        window.notifications.show('Registrando pago en efectivo...', 'info');
        
        const paymentResponse = await window.api.processCashPayment(orderId);
        
        if (!paymentResponse.success) {
            throw new Error(paymentResponse.message || 'Error al registrar el pago');
        }
        
        window.notifications.success('Pago en efectivo registrado. Pagarás al momento de recibir tu pedido.');
        
    } catch (error) {
        console.error('Error procesando pago en efectivo:', error);
        throw error;
    }
}

// Seleccionar método de pago
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    renderStep(2); // Re-renderizar el paso de pago
    
    // Inicializar Stripe Elements si es necesario
    if (method === 'stripe') {
        setTimeout(() => {
            initializeStripeElements();
        }, 100);
    }
}

// Inicializar Stripe Elements
async function initializeStripeElements() {
    try {
        // Verificar si Stripe.js está cargado
        if (typeof Stripe === 'undefined') {
            window.notifications?.warning('Stripe no está disponible. Por favor, recarga la página.');
            return;
        }

        // Obtener o crear instancia de Stripe
        // Nota: En producción, deberías obtener la clave pública del backend
        const stripePublicKey = 'pk_test_placeholder'; // Reemplazar con clave real del backend
        
        if (!stripe) {
            stripe = Stripe(stripePublicKey);
        }

        // Crear elementos
        if (!stripeElements) {
            stripeElements = stripe.elements();
        }

        // Crear elemento de tarjeta
        const cardElementContainer = document.getElementById('stripe-card-element');
        if (!cardElementContainer) return;

        // Limpiar contenedor
        cardElementContainer.innerHTML = '';

        // Crear elemento de tarjeta
        stripeCardElement = stripeElements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
                invalid: {
                    color: '#9e2146',
                },
            },
        });

        // Montar elemento
        stripeCardElement.mount('#stripe-card-element');

        // Manejar errores
        stripeCardElement.on('change', (event) => {
            const displayError = document.getElementById('stripe-card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });

    } catch (error) {
        console.error('Error inicializando Stripe:', error);
        window.notifications?.warning('No se pudo inicializar el formulario de pago. Puedes usar otro método de pago.');
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
    const subtotal = Number(cartData.subtotal ?? cartData.total ?? 0);
    const shippingAmount = Number(cartData.shipping ?? 30.0);
    const maxDiscount = Math.max(subtotal + shippingAmount - discount, 0);
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

