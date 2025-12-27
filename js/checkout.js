
/**
 * 💳 CHECKOUT MANAGER V1
 * Use: Handles multi-step checkout flow, validation, and mock payment.
 */
class CheckoutManager {
    constructor() {
        this.currentStep = 1;
        this.steps = document.querySelectorAll('.step');
        this.formContainer = document.getElementById('checkoutContent');
        this.orderSummary = document.getElementById('orderSummary');

        this.data = {
            shipping: {},
            payment: {},
            cart: []
        };

        this.init();
    }

    async init() {
        console.log('💳 CheckoutManager Initialized');

        // 1. Load Cart
        this.loadCart();

        // 2. Render Step 1: Shipping
        this.renderStep(1);

        // 3. Bind Navigation
        this.bindNavigation();
    }

    loadCart() {
        const stored = localStorage.getItem('cart');
        if (stored) {
            this.data.cart = JSON.parse(stored);
        }
        this.renderOrderSummary();
    }

    renderOrderSummary() {
        if (!this.orderSummary) return;

        const total = this.data.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = total > 150 ? 0 : 15;
        const finalTotal = total + shipping;

        this.orderSummary.innerHTML = `
            <div class="summary-card">
                <h3>ORDER SUMMARY</h3>
                <div class="summary-items">
                    ${this.data.cart.map(item => `
                        <div class="summary-item">
                            <img src="${item.image}" alt="${item.name}">
                            <div>
                                <h4>${item.name}</h4>
                                <p>x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="summary-totals">
                    <div class="row"><span>Subtotal</span> <span>$${total.toFixed(2)}</span></div>
                    <div class="row"><span>Shipping</span> <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span></div>
                    <div class="row total"><span>TOTAL</span> <span>$${finalTotal.toFixed(2)}</span></div>
                </div>
            </div>
        `;
    }

    renderStep(step) {
        this.currentStep = step;

        // Update Stepper UI
        this.steps.forEach(s => {
            const sNum = parseInt(s.dataset.step);
            s.classList.toggle('active', sNum === step);
            s.classList.toggle('completed', sNum < step);
        });

        // Render Form Content
        let html = '';
        if (step === 1) { // SHIPPING
            html = `
                <div class="checkout-form-section fade-in">
                    <h2>SHIPPING DETAILS</h2>
                    <form id="shippingForm">
                        <div class="form-row">
                            <div class="form-group half">
                                <label>FIRST NAME</label>
                                <input type="text" name="firstName" required placeholder="JON">
                            </div>
                            <div class="form-group half">
                                <label>LAST NAME</label>
                                <input type="text" name="lastName" required placeholder="DOE">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>ADDRESS</label>
                            <input type="text" name="address" required placeholder="123 SNEAKER ST">
                        </div>
                        <div class="form-row">
                            <div class="form-group half">
                                <label>CITY</label>
                                <input type="text" name="city" required placeholder="NEW YORK">
                            </div>
                            <div class="form-group half">
                                <label>ZIP CODE</label>
                                <input type="text" name="zip" required placeholder="10001">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>PHONE</label>
                            <input type="tel" name="phone" required placeholder="+1 555 000 0000">
                        </div>
                    </form>
                    <div class="checkout-actions">
                        <button class="btn btn-black btn-block" onclick="checkoutManager.nextStep()">CONTINUE TO PAYMENT</button>
                    </div>
                </div>
            `;
        } else if (step === 2) { // PAYMENT
            html = `
                <div class="checkout-form-section fade-in">
                    <h2>PAYMENT METHOD</h2>
                    <div class="payment-tabs">
                        <button class="payment-tab active"><i class="far fa-credit-card"></i> CARD</button>
                        <button class="payment-tab"><i class="fab fa-paypal"></i> PAYPAL</button>
                    </div>
                    <form id="paymentForm">
                        <div class="form-group">
                            <label>CARD NUMBER</label>
                            <input type="text" name="card" class="input-card" placeholder="0000 0000 0000 0000" maxlength="19">
                        </div>
                        <div class="form-row">
                            <div class="form-group half">
                                <label>EXPIRY</label>
                                <input type="text" name="expiry" placeholder="MM/YY" maxlength="5">
                            </div>
                            <div class="form-group half">
                                <label>CVC</label>
                                <input type="text" name="cvc" placeholder="123" maxlength="3">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>CARDHOLDER NAME</label>
                            <input type="text" name="holder" placeholder="JON DOE">
                        </div>
                    </form>
                    <div class="checkout-actions">
                        <button class="btn btn-outline" onclick="checkoutManager.prevStep()">BACK</button>
                        <button class="btn btn-black" onclick="checkoutManager.nextStep()">REVIEW ORDER</button>
                    </div>
                </div>
            `;
        } else if (step === 3) { // REVIEW
            html = `
                <div class="checkout-form-section fade-in">
                    <h2>REVIEW ORDER</h2>
                    <div class="review-block">
                        <h4>SHIPPING TO:</h4>
                        <p>${this.data.shipping.firstName} ${this.data.shipping.lastName}</p>
                        <p>${this.data.shipping.address}</p>
                        <p>${this.data.shipping.city}, ${this.data.shipping.zip}</p>
                    </div>
                    <div class="review-block">
                        <h4>PAYMENT:</h4>
                        <p>Visa ending in ${this.data.payment.card ? this.data.payment.card.slice(-4) : '****'}</p>
                    </div>
                    <div class="checkout-actions">
                         <button class="btn btn-outline" onclick="checkoutManager.prevStep()">BACK</button>
                        <button class="btn btn-green btn-block" onclick="checkoutManager.processOrder()">PLACE ORDER ($${(this.data.cart.reduce((a, b) => a + b.price * b.quantity, 0) + (this.data.cart.reduce((a, b) => a + b.price * b.quantity, 0) > 150 ? 0 : 15)).toFixed(2)})</button>
                    </div>
                </div>
            `;
        } else if (step === 4) { // SUCCESS
            html = `
                <div class="checkout-success fade-in" style="text-align: center; padding: 40px;">
                    <div style="font-size: 5rem; margin-bottom: 20px;">🎉</div>
                    <h1 style="text-transform: uppercase;">Order Confirmed!</h1>
                    <p>Thank you for shopping with Sneakers Shop.</p>
                    <p>Order #ORD-${Math.floor(Math.random() * 100000)}</p>
                    <button class="btn btn-black" onclick="window.location.href='index.html'" style="margin-top: 20px;">RETURN HOME</button>
                </div>
            `;
            // Clear cart
            localStorage.removeItem('cart');
            Components.updateCartCount();
        }

        this.formContainer.innerHTML = html;
        this.bindInputFormatters();
    }

    bindInputFormatters() {
        // Credit Card Formatting logic would go here
        const cardInput = document.querySelector('.input-card');
        if (cardInput) {
            cardInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim();
            });
        }
    }

    nextStep() {
        // Validate before moving
        if (this.currentStep === 1) {
            const form = document.getElementById('shippingForm');
            if (!form.checkValidity()) {
                alert('Please fill in all shipping fields.');
                return;
            }
            // Save data
            const formData = new FormData(form);
            this.data.shipping = Object.fromEntries(formData);
        }

        if (this.currentStep === 2) {
            const form = document.getElementById('paymentForm');
            // Basic mock validation
            const formData = new FormData(form);
            this.data.payment = Object.fromEntries(formData);
            if (this.data.payment.card.length < 10) {
                alert('Invalid Card Number');
                return;
            }
        }

        this.renderStep(this.currentStep + 1);
        window.scrollTo(0, 0);
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.renderStep(this.currentStep - 1);
        }
    }

    async processOrder() {
        const btn = document.querySelector('.btn-green');
        if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESSING...';

        // Simulate API
        setTimeout(() => {
            this.renderStep(4);
        }, 2000);
    }

    bindNavigation() {
        // Global binds if needed
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    window.checkoutManager = new CheckoutManager();
});
