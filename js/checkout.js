// 🛒 Checkout Mejorado - FutureLabs

// Variables globales
let currentStep = 1;
const totalSteps = 4;
let selectedPaymentMethod = null; // Sin selección por defecto - el usuario debe elegir explícitamente
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
        // Verificar autenticación (Guest Checkout Allowed)
        if (!window.authManager.isAuthenticated()) {
            // Optional: Mostrar banner de login, pero NO bloquear
            console.log('User not authenticated, proceeding as Guest');
        }

        // Obtener carrito
        let cartResponse = { success: false };
        try {
            cartResponse = await window.api.getCart();
        } catch (e) {
            console.warn('⚠️ [Checkout] API Offline, checking local fallback...');
        }

        // Fallback Logic: Check LocalStorage if API failed or empty
        let items = [];
        let total = 0;

        if (cartResponse.success && cartResponse.data.items.length > 0) {
            items = cartResponse.data.items;
            total = cartResponse.data.total;
        } else {
            // Try Brutalist Storage
            const localRaw = localStorage.getItem('brutalist_cart');
            if (localRaw) {
                items = JSON.parse(localRaw);
                total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            }
        }

        if (items.length === 0) {
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

        // Normalize Data Structure
        cartData = {
            items: items,
            total: total,
            subtotal: total,
            shipping: 0
        };
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

        if (window.couponsManager) {
            window.couponsManager.setCartContext(couponItems, baseSubtotal);
            window.couponsManager.context = 'checkout';
        }

        // Renderizar paso 1
        renderStep(1);
        renderOrderSummary();

        // Inicializar Cupones si existe el contenedor (usualmente en renderOrderSummary o un sidebar)
        // En este paso, nos aseguramos que si el OrderSummary tiene el div de cupones, se renderice.
        // Pero renderStep(1) -> renderOrderSummary() -> inyecta el HTML. 
        // ASI QUE debemos llamar a renderCouponInfo() DESPUES de renderOrderSummary()
        setTimeout(() => {
            if (window.renderCouponInfo && document.getElementById('couponSection')) {
                window.renderCouponInfo('couponSection');
            }
        }, 500);


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

    switch (step) {
        case 1:
            container.innerHTML = renderShippingStep();
            initializeShippingStep();
            break;
        case 2:
            container.innerHTML = renderPaymentStep();
            // Inicializar Stripe Elements si es necesario
            if (selectedPaymentMethod === 'stripe') {
                setTimeout(() => {
                    initializeStripeElements();
                }, 300); // Aumentar timeout para dar tiempo al DOM
            }
            // Cargar información de métodos de pago
            if (selectedPaymentMethod === 'yape' || selectedPaymentMethod === 'plin') {
                setTimeout(() => {
                    loadMobilePaymentInfo(selectedPaymentMethod);
                }, 100);
            }
            if (selectedPaymentMethod === 'bank_transfer') {
                setTimeout(() => {
                    loadBankTransferInfo();
                }, 100);
            }
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
    switch (currentStep) {
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

// Renderizar Paso 1: Información de Envío (Brutalist V3)
function renderShippingStep() {
    const selectedOption = shippingOptions[selectedShippingOption] ? selectedShippingOption : 'standard';

    // Brutalist Shipping Cards
    const shippingOptionCards = Object.entries(shippingOptions).map(([key, option]) => `
        <label class="payment-option ${selectedOption === key ? 'selected' : ''}" onclick="selectShippingMethod('${key}')">
            <input type="radio" name="shippingMethod" value="${key}" ${selectedOption === key ? 'checked' : ''} style="display:none;">
            <div style="flex: 1;">
                <div style="display:flex; justify-content:space-between; margin-bottom: 0.5rem;">
                    <span style="font-weight: 800; text-transform: uppercase;">${option.label}</span>
                    <span style="font-weight: 800;">${checkoutCurrencyFormatter.format(option.amount)}</span>
                </div>
                <div style="font-size: 0.85rem; color: #555;">${option.description}</div>
            </div>
        </label>
    `).join('');

    return `
        <div class="checkout-form-section">
            <h2 class="checkout-section-title">SHIPPING ADDRESS</h2>
            
            ${savedAddresses.length > 0 ? `
            <div style="margin-bottom: 2rem; border: 2px dashed #000; padding: 1.5rem;">
                <h3 style="font-weight: 800; text-transform: uppercase; margin-bottom: 1rem;">SAVED ADDRESSES</h3>
                <div class="saved-addresses-grid" style="display: grid; gap: 1rem;">
                    ${savedAddresses.map(addr => `
                        <label class="payment-option ${selectedAddressId === addr.id ? 'selected' : ''}" onclick="window.selectSavedAddress('${addr.id}')">
                            <input type="radio" name="savedAddress" value="${addr.id}" ${selectedAddressId === addr.id ? 'checked' : ''} style="display:none;">
                            <div>
                                <strong>${addr.label || 'ADDRESS'}</strong>
                                <p style="margin: 0; font-size: 0.9rem;">
                                    ${addr.address}, ${addr.city}
                                </p>
                            </div>
                        </label>
                    `).join('')}
                </div>
                <button type="button" class="btn btn-outline" style="margin-top: 1rem; width: 100%;" onclick="window.useNewAddress()">
                    + USE NEW ADDRESS
                </button>
            </div>
            ` : ''}
            
            <div id="shippingFormSection" style="${savedAddresses.length > 0 && selectedAddressId ? 'display: none;' : ''}">
                <div class="form-group">
                    <label class="form-label required">FULL NAME</label>
                    <input type="text" class="form-input" id="fullName" placeholder="JUMPMAN JACK" value="${shippingData.fullName ?? ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label required">ADDRESS</label>
                    <input type="text" class="form-input" id="address" placeholder="123 STREET" value="${shippingData.address ?? ''}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">CITY</label>
                        <input type="text" class="form-input" id="city" placeholder="LIMA" value="${shippingData.city ?? ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">COUNTRY</label>
                        <select class="form-input" id="country" required>
                            <option value="Perú" ${shippingData.country === 'Perú' ? 'selected' : ''}>Perú</option>
                            <option value="Chile" ${shippingData.country === 'Chile' ? 'selected' : ''}>Chile</option>
                            <option value="Colombia" ${shippingData.country === 'Colombia' ? 'selected' : ''}>Colombia</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">ZIP CODE</label>
                        <input type="text" class="form-input" id="postalCode" placeholder="15001" value="${shippingData.postalCode ?? ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label required">PHONE</label>
                        <input type="tel" class="form-input" id="phone" placeholder="+51 987 654 321" value="${shippingData.phone ?? ''}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label required">EMAIL</label>
                    <input type="email" class="form-input" id="email" placeholder="YOU@EMAIL.COM" value="${shippingData.email ?? ''}" required>
                </div>
            </div>

            <div class="shipping-methods" style="margin-top: 3rem;">
                <h3 class="checkout-section-title">DELIVERY METHOD</h3>
                <div class="payment-options">
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

// Renderizar Paso 2: Método de Pago (Brutalist V3)
function renderPaymentStep() {
    const subtotal = Number(cartData.subtotal ?? cartData.total ?? 0);
    const shippingAmount = Number(cartData.shipping ?? shippingOptions[selectedShippingOption]?.amount ?? 0);

    // Apply Discounts
    const discountAmount = window.couponsManager ? window.couponsManager.getDiscount() : (discount || 0);

    // Final Calculation
    const total = Math.max(subtotal + shippingAmount - discountAmount - loyaltyPointsDiscount, 0);

    return `
        <div class="checkout-form-section">
            <h2 class="checkout-section-title">PAYMENT METHOD</h2>
            
            <div class="payment-methods-grid" style="display: grid; gap: 1rem;">
                <!-- CREDIT CARD -->
                <label class="payment-option ${selectedPaymentMethod === 'stripe' ? 'selected' : ''}" onclick="selectPaymentMethod('stripe')">
                    <input type="radio" name="paymentMethod" value="stripe" ${selectedPaymentMethod === 'stripe' ? 'checked' : ''} style="display:none;">
                    <div style="flex: 1;">
                        <div style="display:flex; justify-content:space-between; align-items: center; margin-bottom: 0.5rem;">
                            <span style="font-weight: 800; text-transform: uppercase;">CREDIT / DEBIT CARD</span>
                            <i class="fas fa-credit-card"></i>
                        </div>
                        <div style="font-size: 0.85rem; color: #555;">SECURE PAYMENT VIA STRIPE</div>
                        
                        ${selectedPaymentMethod === 'stripe' ? `
                            <div class="stripe-container" style="margin-top: 1rem; border-top: 2px solid #eee; padding-top: 1rem;">
                                <div id="stripe-card-element" style="border: 2px solid #000; padding: 1rem; background: #fff;"></div>
                                <div id="stripe-card-errors" role="alert" style="color: red; margin-top: 0.5rem; font-size: 0.85rem; font-weight: 700;"></div>
                            </div>
                        ` : ''}
                    </div>
                </label>
                
                <!-- YAPE / PLIN -->
                <label class="payment-option ${selectedPaymentMethod === 'yape' ? 'selected' : ''}" onclick="selectPaymentMethod('yape')">
                    <input type="radio" name="paymentMethod" value="yape" ${selectedPaymentMethod === 'yape' ? 'checked' : ''} style="display:none;">
                    <div style="flex: 1;">
                        <div style="display:flex; justify-content:space-between; align-items: center; margin-bottom: 0.5rem;">
                            <span style="font-weight: 800; text-transform: uppercase;">YAPE</span>
                            <i class="fas fa-mobile-alt"></i>
                        </div>
                        <div style="font-size: 0.85rem; color: #555;">INSTANT MOBILE PAYMENT</div>
                        
                        ${selectedPaymentMethod === 'yape' ? `
                           <div style="margin-top: 1rem;">
                                <label style="display:block; font-weight:700; font-size: 0.8rem; margin-bottom:0.3rem;">PHONE NUMBER</label>
                                <input type="tel" id="mobile-phone" class="form-input" placeholder="999 999 999">
                           </div>
                        ` : ''}
                    </div>
                </label>

                <!-- BANK TRANSFER -->
                <label class="payment-option ${selectedPaymentMethod === 'bank_transfer' ? 'selected' : ''}" onclick="selectPaymentMethod('bank_transfer')">
                    <input type="radio" name="paymentMethod" value="bank_transfer" ${selectedPaymentMethod === 'bank_transfer' ? 'checked' : ''} style="display:none;">
                    <div style="flex: 1;">
                        <div style="display:flex; justify-content:space-between; align-items: center; margin-bottom: 0.5rem;">
                            <span style="font-weight: 800; text-transform: uppercase;">BANK TRANSFER</span>
                            <i class="fas fa-university"></i>
                        </div>
                        <div style="font-size: 0.85rem; color: #555;">DIRECT DEPOSIT (BCP / INTERBANK)</div>
                    </div>
                </label>
            </div>
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
    // Obtener información del método de pago para mostrar mensaje apropiado
    const paymentMethodName = getPaymentMethodName(selectedPaymentMethod);
    let paymentStatusMessage = '';
    let paymentInstructions = '';

    if (selectedPaymentMethod === 'cash') {
        paymentStatusMessage = 'Pago pendiente - Efectivo';
        paymentInstructions = 'Pagarás en efectivo al momento de recibir tu pedido. El repartidor aceptará el pago exacto.';
    } else if (selectedPaymentMethod === 'yape' || selectedPaymentMethod === 'plin') {
        paymentStatusMessage = 'Pago pendiente - ' + (selectedPaymentMethod === 'yape' ? 'Yape' : 'Plin');
        paymentInstructions = 'Realiza el pago desde tu app ' + (selectedPaymentMethod === 'yape' ? 'Yape' : 'Plin') + '. Te enviaremos un email de confirmación cuando recibamos el pago.';
    } else if (selectedPaymentMethod === 'bank_transfer') {
        paymentStatusMessage = 'Pago pendiente - Transferencia Bancaria';
        paymentInstructions = 'Realiza la transferencia bancaria según los datos proporcionados. Envía el comprobante a nuestro correo de soporte. Te contactaremos para confirmar el pago.';
    } else if (selectedPaymentMethod === 'stripe') {
        paymentStatusMessage = 'Pago procesado - Tarjeta';
        paymentInstructions = 'Tu pago ha sido procesado exitosamente. Recibirás un email de confirmación con los detalles.';
    } else {
        paymentStatusMessage = 'Pago pendiente';
        paymentInstructions = 'Te contactaremos para confirmar el pago.';
    }
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
                <div class="confirmation-detail-item">
                    <span>Método de Pago:</span>
                    <strong>${paymentMethodName}</strong>
                </div>
                <div class="confirmation-detail-item">
                    <span>Estado del Pago:</span>
                    <strong style="color: ${selectedPaymentMethod === 'stripe' ? '#22c55e' : '#f59e0b'};">${paymentStatusMessage}</strong>
                </div>
            </div>
            
            <div class="payment-info-box ${selectedPaymentMethod === 'stripe' ? 'success' : 'warning'}">
                <p>
                    <i class="fas fa-info-circle"></i> ${paymentInstructions}
                </p>
            </div>
            
            <p style="color: var(--text-secondary); margin-bottom: var(--spacing-lg);">
                Recibirás un email de confirmación en <strong>${shippingData.email}</strong>
            </p>

            ${!window.authManager?.isAuthenticated() ? `
            <div style="background: #f8f8f8; border: 2px solid #000; padding: 1.5rem; margin-bottom: 2rem; position: relative; overflow: hidden;">
                <div style="position: relative; z-index: 2;">
                    <h3 style="font-weight: 900; text-transform: uppercase; margin-bottom: 0.5rem; font-size: 1.2rem;">Don't Lose Your Order</h3>
                    <p style="margin-bottom: 1rem; font-size: 0.9rem;">Create an account now to track order <strong>#${orderNumber}</strong> in real-time.</p>
                    <button class="btn btn-black" onclick="window.location.href='register.html?email=${encodeURIComponent(shippingData.email)}'" style="width: 100%;">
                        CREATE ACCOUNT FROM ORDER
                    </button>
                </div>
                <!-- Decorative Icon -->
                <i class="fas fa-user-plus" style="position: absolute; right: -20px; bottom: -20px; font-size: 6rem; opacity: 0.05; z-index: 1;"></i>
            </div>
            ` : ''}
            
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

// Seleccionar método de pago (función antigua - reemplazada por la de abajo)
// Esta función ya no se usa, se mantiene por compatibilidad

// Obtener nombre del método de pago
function getPaymentMethodName(method) {
    const methods = {
        'stripe': 'Tarjeta de Crédito/Débito',
        'paypal': 'PayPal',
        'yape': 'Yape',
        'plin': 'Plin',
        'bank_transfer': 'Transferencia Bancaria',
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
    // Validar que se haya seleccionado un método de pago
    if (!selectedPaymentMethod) {
        window.notifications.error('Por favor, selecciona un método de pago');
        return false;
    }

    // Validar según el método seleccionado
    if (selectedPaymentMethod === 'stripe') {
        // Para Stripe, validamos que el elemento de tarjeta esté presente
        // La validación real se hace cuando se crea el payment method
        if (!stripe || !stripeCardElement) {
            window.notifications.error('El sistema de pago con tarjeta no está disponible. Por favor, selecciona otro método.');
            return false;
        }

        // Verificar que el elemento de tarjeta esté montado
        const cardElement = document.getElementById('stripe-card-element');
        if (!cardElement || cardElement.children.length === 0) {
            window.notifications.error('Por favor, completa los datos de tu tarjeta');
            return false;
        }
    } else if (selectedPaymentMethod === 'yape' || selectedPaymentMethod === 'plin') {
        // Validar número de teléfono para Yape/Plin
        const phoneInput = document.getElementById('mobile-phone');
        if (!phoneInput) {
            window.notifications.error('Por favor, ingresa tu número de teléfono');
            return false;
        }

        const phoneNumber = phoneInput.value.trim().replace(/\s+/g, '');
        if (!phoneNumber) {
            window.notifications.error('Por favor, ingresa tu número de teléfono');
            return false;
        }

        // Validar formato de teléfono peruano
        if (!/^9\d{8}$/.test(phoneNumber)) {
            window.notifications.error('Número de teléfono inválido. Debe ser un número peruano de 9 dígitos (ej: 987654321)');
            return false;
        }
    } else if (selectedPaymentMethod === 'bank_transfer') {
        // Transferencia bancaria no requiere validación adicional
        // Los datos se muestran automáticamente
    } else if (selectedPaymentMethod === 'cash') {
        // Efectivo no requiere validación adicional
    }

    return true;
}

// Renderizar resumen del pedido
// Renderizar Resumen del Pedido
// Renderizar Resumen del Pedido
function renderOrderSummary() {
    const container = document.getElementById('orderSummary');
    if (!container) return;

    // Calcular totales
    const subtotal = Number(cartData.subtotal ?? cartData.total ?? 0);
    const shippingPrice = Number(cartData.shipping ?? shippingOptions[selectedShippingOption]?.amount ?? 0);

    // Obtener descuento del gestor de cupones si existe, sino usar variable local
    const discountAmount = window.couponsManager ? window.couponsManager.getDiscount() : (discount || 0);

    // Calcular total final
    const total = Math.max(0, subtotal + shippingPrice - discountAmount - loyaltyPointsDiscount);

    // Actualizar total en cartData para referencias
    cartData.total = total;

    container.innerHTML = `
        <h3>Resumen del Pedido</h3>
        <div class="order-summary-items">
            ${cartData.items.map(item => `
                <div class="summary-item">
                    <img src="${item.image_url || 'https://via.placeholder.com/60'}" alt="${item.name}">
                    <div>
                        <div class="summary-item-title">${item.name}</div>
                        <div class="summary-item-meta">
                            Cant: ${item.quantity} | Talla: ${item.size || 'N/A'}
                        </div>
                        <div class="summary-item-price">
                             S/ ${Number(item.price).toFixed(2)}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="order-summary-totals">
            <div class="summary-row">
                <span>Subtotal</span>
                <span>S/ ${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Envío (${shippingOptions[selectedShippingOption]?.label || 'Estándar'})</span>
                <span>S/ ${shippingPrice.toFixed(2)}</span>
            </div>
            
            ${discountAmount > 0 ? `
            <div class="summary-row discount">
                <span>Descuento (Cupón)</span>
                <span>- S/ ${discountAmount.toFixed(2)}</span>
            </div>
            ` : ''}

            ${loyaltyPointsDiscount > 0 ? `
            <div class="summary-row discount">
                <span>Puntos Canjeados</span>
                <span>- S/ ${loyaltyPointsDiscount.toFixed(2)}</span>
            </div>
            ` : ''}

            <div class="summary-divider"></div>
            <div class="summary-row total">
                <span>Total</span>
                <span>S/ ${total.toFixed(2)}</span>
            </div>
        </div>

        <!-- Puntos de Fidelidad (Solo si hay disponibles) -->
        ${availableLoyaltyPoints > 0 ? `
        <div class="loyalty-points-section">
            <div class="loyalty-points-header">
                <i class="fas fa-star"></i>
                <span>Tienes ${availableLoyaltyPoints} puntos</span>
            </div>
            ${loyaltyPointsUsed > 0 ? `
                <button class="btn btn-outline btn-sm btn-block" onclick="removeLoyaltyPoints()">
                    Dejar de usar mis puntos
                </button>
            ` : `
                <button class="btn btn-outline btn-sm btn-block" onclick="useLoyaltyPoints()">
                    Usar mis puntos
                </button>
            `}
        </div>
        ` : ''}

        <!-- Sección de Cupones -->
        <div id="checkoutCouponSection" style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;"></div>
    `;

    // Montar cupones
    mountCheckoutCoupons();
}

function mountCheckoutCoupons() {
    if (!window.couponsManager) return;

    // Configurar contexto checkout
    window.couponsManager.context = 'checkout';
    window.couponsManager.containerId = 'checkoutCouponSection';

    // Renderizar
    window.couponsManager.renderCouponForm('checkoutCouponSection');

    // Cargar cupones disponibles si no están cargados
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

    if (selectedPaymentMethod === 'bank_transfer') {
        // No requiere validación adicional, solo confirmación
        return { valid: true };
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
            loyalty_points_used: loyaltyPointsUsed,
            // Incluir total esperado para validación
            expected_total: finalTotal
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
                await processMobilePayment(orderId, finalTotal, selectedPaymentMethod);
            } else if (selectedPaymentMethod === 'bank_transfer') {
                await processBankTransfer(orderId);
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

        // Mostrar mensaje según método de pago
        let confirmationMessage = '¡Pedido confirmado exitosamente!';
        if (selectedPaymentMethod === 'cash') {
            confirmationMessage = '¡Pedido confirmado! Pagarás en efectivo al momento de recibir tu pedido.';
        } else if (selectedPaymentMethod === 'yape' || selectedPaymentMethod === 'plin') {
            confirmationMessage = '¡Pedido confirmado! Realiza el pago desde tu app móvil. Te contactaremos para confirmar.';
        } else if (selectedPaymentMethod === 'bank_transfer') {
            confirmationMessage = '¡Pedido confirmado! Realiza la transferencia bancaria y envía el comprobante.';
        } else if (selectedPaymentMethod === 'stripe') {
            confirmationMessage = '¡Pedido y pago confirmados exitosamente!';
        }

        window.notifications.success(confirmationMessage);

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
        const paymentIntentId = intentResponse.data.payment_intent_id;

        // Guardar payment_intent_id en el pedido
        if (paymentIntentId) {
            try {
                await window.api.updateOrderPaymentIntent(orderId, paymentIntentId);
            } catch (error) {
                console.warn('No se pudo guardar payment_intent_id:', error);
                // Continuar de todas formas
            }
        }

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
                    country: shippingData.country || 'PE',
                    postal_code: shippingData.postalCode
                }
            }
        });

        if (pmError) {
            // Mostrar error específico de Stripe
            const errorElement = document.getElementById('stripe-card-errors');
            if (errorElement) {
                errorElement.textContent = pmError.message;
            }
            throw new Error(pmError.message || 'Error al procesar la tarjeta');
        }

        // Limpiar errores previos
        const errorElement = document.getElementById('stripe-card-errors');
        if (errorElement) {
            errorElement.textContent = '';
        }

        // Confirmar pago con el payment method
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: paymentMethod.id
        });

        if (confirmError) {
            // Mostrar error específico
            if (errorElement) {
                errorElement.textContent = confirmError.message;
            }
            throw new Error(confirmError.message || 'Error al confirmar el pago');
        }

        // Verificar que el pago fue exitoso
        if (paymentIntent.status !== 'succeeded') {
            throw new Error(`El pago no fue exitoso.Estado: ${paymentIntent.status} `);
        }

        // Procesar pago en backend para actualizar estado del pedido
        try {
            const paymentResponse = await window.api.processStripePayment(orderId, paymentMethod.id);
            if (!paymentResponse.success) {
                console.warn('Advertencia: El pago fue procesado en Stripe pero hubo un problema actualizando el pedido:', paymentResponse.message);
                // No lanzar error aquí porque el pago ya fue exitoso en Stripe
            }
        } catch (backendError) {
            console.error('Error actualizando pedido en backend:', backendError);
            // No lanzar error porque el pago ya fue exitoso en Stripe
            // El webhook de Stripe actualizará el estado eventualmente
        }

        window.notifications.success('Pago con tarjeta procesado exitosamente');

    } catch (error) {
        console.error('Error procesando pago Stripe:', error);
        throw error;
    }
}

// Procesar pago móvil (Yape/Plin)
async function processMobilePayment(orderId, amount, paymentType = 'yape') {
    try {
        const phoneInput = document.getElementById('mobile-phone');
        const phoneNumber = phoneInput ? phoneInput.value.trim().replace(/\s+/g, '') : '';

        if (!phoneNumber) {
            throw new Error('Número de teléfono requerido');
        }

        // Validar formato de teléfono peruano
        if (!/^9\d{8}$/.test(phoneNumber)) {
            throw new Error('Número de teléfono inválido. Debe ser un número peruano de 9 dígitos (ej: 987654321)');
        }

        window.notifications.show(`Procesando pago con ${paymentType === 'yape' ? 'Yape' : 'Plin'}...`, 'info');

        const paymentResponse = await window.api.processMobilePayment(orderId, phoneNumber, amount, paymentType);

        if (!paymentResponse.success) {
            throw new Error(paymentResponse.message || 'Error al procesar el pago');
        }

        // Mostrar información del pago
        const paymentData = paymentResponse.data;
        const message = paymentData.message || `Pago con ${paymentType === 'yape' ? 'Yape' : 'Plin'} registrado.Realiza el pago a ${paymentData.merchant_phone} y espera la confirmación.`;

        window.notifications.success(message, 10000); // Mostrar por 10 segundos

        return true;

    } catch (error) {
        console.error('Error procesando pago móvil:', error);
        // Para pagos móviles, mostrar advertencia pero continuar
        window.notifications.warning('El pedido fue creado. Por favor, confirma el pago desde tu app móvil.');
        return false;
    }
}

// Procesar transferencia bancaria
async function processBankTransfer(orderId, amount) {
    try {
        window.notifications.show('Registrando transferencia bancaria...', 'info');

        const paymentResponse = await window.api.processBankTransfer(orderId);

        if (!paymentResponse.success) {
            throw new Error(paymentResponse.message || 'Error al procesar transferencia bancaria');
        }

        window.notifications.success(paymentResponse.data?.message || 'Transferencia bancaria registrada. Realiza la transferencia y envía el comprobante.');

        return true;

    } catch (error) {
        console.error('Error procesando transferencia bancaria:', error);
        window.notifications.warning('El pedido fue creado. Por favor, realiza la transferencia y envía el comprobante.');
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

        return true;

    } catch (error) {
        console.error('Error procesando pago en efectivo:', error);
        // Para efectivo, no es crítico si falla, el pedido queda como pendiente
        window.notifications.info('El pedido fue creado. El pago se confirmará al momento de la entrega.');
        return false;
    }
}

// Seleccionar método de pago
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    renderStep(2); // Re-renderizar el paso de pago

    // Inicializar métodos de pago después de que el DOM se actualice
    // Usar un timeout más largo para asegurar que el DOM esté listo
    setTimeout(() => {
        // Inicializar Stripe Elements si es necesario
        if (method === 'stripe') {
            initializeStripeElements();
        }

        // Cargar información bancaria si es transferencia
        if (method === 'bank_transfer') {
            loadBankTransferInfo();
        }

        // Cargar información de cuenta móvil si es Yape/Plin
        if (method === 'yape' || method === 'plin') {
            loadMobilePaymentInfo(method);
        }
    }, 300); // Aumentar timeout para dar tiempo al DOM
}

// Cargar información de cuenta Yape/Plin
async function loadMobilePaymentInfo(paymentType) {
    try {
        const infoResponse = await window.api.getMobilePaymentInfo();
        if (infoResponse.success) {
            const accountInfo = paymentType === 'yape' ? infoResponse.data.yape : infoResponse.data.plin;
            const detailsContainer = document.getElementById('mobile-account-info');
            if (detailsContainer) {
                if (accountInfo.available && accountInfo.phone) {
                    detailsContainer.innerHTML = `
    < p style = "margin: 4px 0; font-size: 14px;" >
        <strong>Realiza el pago a:</strong> ${accountInfo.phone}
                        </p >
    <p style="margin: 4px 0; font-size: 14px; color: #0c4a6e;">
        <i class="fas fa-mobile-alt"></i> Usa este número para realizar la transferencia desde tu app
    </p>
`;
                } else {
                    detailsContainer.innerHTML = '<p style="color: #dc2626; font-size: 14px;">' + (paymentType === 'yape' ? 'Yape' : 'Plin') + ' no configurado. Contacta con soporte.</p>';
                }
            }
        }
    } catch (error) {
        console.error('Error cargando información de pago móvil:', error);
        const detailsContainer = document.getElementById('mobile-account-info');
        if (detailsContainer) {
            detailsContainer.innerHTML = '<p style="color: #dc2626; font-size: 14px;">Error al cargar información de cuenta.</p>';
        }
    }
}

// Cargar información de transferencia bancaria
async function loadBankTransferInfo() {
    try {
        const infoResponse = await window.api.getMobilePaymentInfo();
        if (infoResponse.success && infoResponse.data.bank_transfer.available) {
            const bankInfo = infoResponse.data.bank_transfer;
            const detailsContainer = document.getElementById('bank-account-details');
            if (detailsContainer) {
                detailsContainer.innerHTML = `
    < p style = "margin: 4px 0;" > <strong>Banco:</strong> ${bankInfo.bank}</p >
        <p style="margin: 4px 0;"><strong>Cuenta:</strong> ${bankInfo.account}</p>
                    ${bankInfo.cci ? `<p style="margin: 4px 0;"><strong>CCI:</strong> ${bankInfo.cci}</p>` : ''}
`;
            }
        } else {
            const detailsContainer = document.getElementById('bank-account-details');
            if (detailsContainer) {
                detailsContainer.innerHTML = '<p style="color: #dc2626;">Transferencia bancaria no configurada. Contacta con soporte.</p>';
            }
        }
    } catch (error) {
        console.error('Error cargando información bancaria:', error);
        const detailsContainer = document.getElementById('bank-account-details');
        if (detailsContainer) {
            detailsContainer.innerHTML = '<p style="color: #dc2626;">Error al cargar información bancaria.</p>';
        }
    }
}

// Flag para evitar múltiples inicializaciones simultáneas
let isInitializingStripe = false;

// Inicializar Stripe Elements
async function initializeStripeElements() {
    // Evitar múltiples inicializaciones simultáneas
    if (isInitializingStripe) {
        console.log('Stripe Elements ya se está inicializando, esperando...');
        return;
    }

    try {
        isInitializingStripe = true;

        // Verificar si Stripe.js está cargado
        if (typeof Stripe === 'undefined') {
            console.error('Stripe.js no está cargado');
            window.notifications?.warning('Stripe no está disponible. Por favor, recarga la página.');
            return;
        }

        // Verificar que el contenedor exista
        const cardElementContainer = document.getElementById('stripe-card-element');
        if (!cardElementContainer) {
            console.error('Contenedor stripe-card-element no encontrado');
            // Reintentar después de un breve delay
            setTimeout(() => {
                isInitializingStripe = false;
                initializeStripeElements();
            }, 200);
            return;
        }

        // Si ya hay un elemento montado y funcionando, no hacer nada
        if (stripeCardElement) {
            try {
                // Verificar si el elemento está montado correctamente
                const mountedElement = cardElementContainer.querySelector('.StripeElement');
                if (mountedElement) {
                    console.log('Stripe Elements ya está montado, reutilizando...');
                    isInitializingStripe = false;
                    return;
                }
            } catch (e) {
                // Si hay error verificando, continuar con la inicialización
            }
        }

        // Obtener clave pública de Stripe del backend
        let stripePublicKey = null;

        try {
            const keyResponse = await window.api.getStripePublicKey();
            if (keyResponse.success && keyResponse.data.public_key) {
                stripePublicKey = keyResponse.data.public_key;
            } else {
                throw new Error('No se pudo obtener la clave pública de Stripe');
            }
        } catch (error) {
            console.error('Error obteniendo clave pública de Stripe:', error);
            window.notifications?.warning('Stripe no está configurado. Por favor, usa otro método de pago o contacta con soporte.');
            isInitializingStripe = false;
            return;
        }

        // Inicializar Stripe si no está inicializado
        if (!stripe) {
            stripe = Stripe(stripePublicKey);
        }

        // Crear elementos si no existen
        if (!stripeElements) {
            stripeElements = stripe.elements();
        }

        // Si ya existe un elemento montado, desmontarlo primero
        if (stripeCardElement) {
            try {
                stripeCardElement.unmount();
                stripeCardElement = null;
            } catch (e) {
                console.warn('Error al desmontar elemento anterior:', e);
                // Continuar de todas formas
                stripeCardElement = null;
            }
        }

        // Limpiar contenedor antes de crear nuevo elemento
        cardElementContainer.innerHTML = '';

        // Crear elemento de tarjeta
        try {
            stripeCardElement = stripeElements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#32325d',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        '::placeholder': {
                            color: '#aab7c4',
                        },
                        ':focus': {
                            color: '#32325d',
                        },
                    },
                    invalid: {
                        color: '#dc2626',
                        iconColor: '#dc2626',
                    },
                    complete: {
                        iconColor: '#22c55e',
                    },
                },
                classes: {
                    base: 'stripe-card-input',
                    focus: 'stripe-card-input-focus',
                    invalid: 'stripe-card-input-invalid',
                },
            });

            // Montar elemento
            stripeCardElement.mount('#stripe-card-element');

            // Manejar errores de validación en tiempo real
            stripeCardElement.on('change', (event) => {
                const displayError = document.getElementById('stripe-card-errors');
                if (displayError) {
                    if (event.error) {
                        displayError.textContent = event.error.message;
                    } else {
                        displayError.textContent = '';
                    }
                }
            });

            console.log('Stripe Elements inicializado correctamente');
        } catch (createError) {
            // Si el error es que ya existe un elemento, intentar obtenerlo
            if (createError.message && createError.message.includes('Can only create one Element')) {
                console.warn('Elemento de tarjeta ya existe, intentando reutilizar...');
                // Limpiar y reintentar después de un breve delay
                setTimeout(() => {
                    // Resetear todo y reintentar
                    stripeCardElement = null;
                    stripeElements = null;
                    isInitializingStripe = false;
                    initializeStripeElements();
                }, 500);
                return;
            }
            throw createError;
        }

    } catch (error) {
        console.error('Error inicializando Stripe:', error);

        // Mostrar mensaje de error más específico
        const cardElementContainer = document.getElementById('stripe-card-element');
        if (cardElementContainer) {
            let errorMessage = 'Error al cargar el formulario de pago.';

            if (error.message && error.message.includes('Content blocker')) {
                errorMessage = 'Por favor, desactiva el bloqueador de contenido para este sitio y recarga la página.';
            } else if (error.message && error.message.includes('Can only create one Element')) {
                errorMessage = 'El formulario ya está cargado. Si no lo ves, por favor recarga la página.';
            }

            cardElementContainer.innerHTML = `
    < div style = "padding: 20px; text-align: center; color: #dc2626;" >
                    <i class="fas fa-exclamation-triangle"></i>
                    <p style="margin: 10px 0 0 0;">${errorMessage}</p>
                    <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Recargar Página
                    </button>
                </div >
    `;
        }

        window.notifications?.warning('No se pudo inicializar el formulario de pago. Puedes usar otro método de pago.');
    } finally {
        isInitializingStripe = false;
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

    window.notifications.success(`Usando ${loyaltyPointsUsed} puntos(S / ${loyaltyPointsDiscount.toFixed(2)} de descuento)`);
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

