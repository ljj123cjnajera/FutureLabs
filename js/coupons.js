// 🎟️ Sistema de Cupones - FutureLabs

class CouponsManager {
    constructor() {
        this.appliedCoupon = null;
        this.discount = 0;
        this.originalTotal = 0;
    }

    // Aplicar cupón
    async applyCoupon(code, total) {
        try {
            const response = await window.api.validateCoupon(code, total);
            
            if (response.success) {
                this.appliedCoupon = response.data.coupon;
                this.discount = parseFloat(response.data.discount);
                this.originalTotal = total;
                
                window.notifications.success(`Cupón "${code}" aplicado exitosamente`);
                return {
                    success: true,
                    coupon: this.appliedCoupon,
                    discount: this.discount,
                    newTotal: total - this.discount
                };
            } else {
                throw new Error(response.message || 'Cupón inválido');
            }
        } catch (error) {
            console.error('Error al aplicar cupón:', error);
            window.notifications.error(error.message || 'Error al aplicar cupón');
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Remover cupón
    removeCoupon() {
        this.appliedCoupon = null;
        this.discount = 0;
        this.originalTotal = 0;
        window.notifications.info('Cupón removido');
    }

    // Calcular nuevo total
    calculateNewTotal(total) {
        if (!this.appliedCoupon) {
            return total;
        }
        
        return Math.max(0, total - this.discount);
    }

    // Verificar si hay cupón aplicado
    hasCoupon() {
        return this.appliedCoupon !== null;
    }

    // Obtener cupón aplicado
    getAppliedCoupon() {
        return this.appliedCoupon;
    }

    // Obtener descuento
    getDiscount() {
        return this.discount;
    }

    // Renderizar cupón aplicado
    renderAppliedCoupon(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!this.appliedCoupon) {
            container.innerHTML = '';
            return;
        }
        
        container.innerHTML = `
            <div class="applied-coupon">
                <div class="coupon-info">
                    <i class="fas fa-tag"></i>
                    <div class="coupon-details">
                        <div class="coupon-code">${this.appliedCoupon.code}</div>
                        <div class="coupon-description">${this.appliedCoupon.description || 'Descuento aplicado'}</div>
                    </div>
                </div>
                <div class="coupon-discount">
                    -S/ ${this.discount.toFixed(2)}
                </div>
                <button class="btn btn-ghost btn-sm" onclick="removeCoupon()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    // Renderizar formulario de cupón
    renderCouponForm(containerId, onApply) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (this.appliedCoupon) {
            this.renderAppliedCoupon(containerId);
            return;
        }
        
        container.innerHTML = `
            <div class="coupon-form">
                <h4><i class="fas fa-tag"></i> ¿Tienes un cupón?</h4>
                <div class="coupon-input-group">
                    <input type="text" class="form-input" id="couponCode" placeholder="Ingresa tu código de cupón">
                    <button class="btn btn-primary" onclick="applyCoupon()">
                        <i class="fas fa-check"></i> Aplicar
                    </button>
                </div>
                <div id="couponMessage"></div>
            </div>
        `;
    }
}

// Crear instancia global
window.couponsManager = new CouponsManager();

// Funciones globales para el HTML
async function applyCoupon() {
    const codeInput = document.getElementById('couponCode');
    const code = codeInput.value.trim();
    
    if (!code) {
        window.notifications.warning('Ingresa un código de cupón');
        return;
    }
    
    // Obtener total actual del carrito
    const cartResponse = await window.api.getCart();
    if (!cartResponse.success) {
        window.notifications.error('Error al obtener el carrito');
        return;
    }
    
    const total = cartResponse.data.total;
    const result = await window.couponsManager.applyCoupon(code, total);
    
    if (result.success) {
        codeInput.value = '';
        renderCouponInfo();
        updateCartTotals();
    }
}

function removeCoupon() {
    window.couponsManager.removeCoupon();
    renderCouponInfo();
    updateCartTotals();
}

function renderCouponInfo() {
    const container = document.getElementById('couponSection');
    if (container) {
        window.couponsManager.renderCouponForm('couponSection');
    }
}

function updateCartTotals() {
    // Disparar evento para actualizar totales
    window.dispatchEvent(new CustomEvent('couponUpdated', {
        detail: {
            applied: window.couponsManager.hasCoupon(),
            discount: window.couponsManager.getDiscount(),
            coupon: window.couponsManager.getAppliedCoupon()
        }
    }));
}


