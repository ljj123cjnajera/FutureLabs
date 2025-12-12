// 🎟️ Gestión de Cupones
class AdminCoupons {
    constructor() {
        this.currentCouponId = null;
        this.coupons = [];
    }

    async loadCoupons() {
        const tbody = document.getElementById('couponsTable');
        if (!tbody) return;

        window.loadingState.renderLoading(tbody, 'Cargando cupones...', { className: 'text-center p-5' });

        try {
            const response = await window.api.getCoupons();
            if (response.success) {
                this.coupons = response.data.coupons;
                this.renderTable();
            } else {
                window.loadingState.renderError(tbody, 'Error al cargar cupones');
            }
        } catch (error) {
            console.error('Error loading coupons:', error);
            window.loadingState.renderError(tbody, 'Error de conexión');
        }
    }

    renderTable() {
        const tbody = document.getElementById('couponsTable');
        if (!tbody) return;

        if (this.coupons.length === 0) {
            window.loadingState.renderEmpty(tbody, 'No hay cupones registrados');
            return;
        }

        tbody.innerHTML = this.coupons.map(coupon => `
            <tr>
                <td><span class="badge badge-info">${coupon.code}</span></td>
                <td>${coupon.type === 'percentage' ? coupon.value + '%' : 'S/ ' + parseFloat(coupon.value).toFixed(2)}</td>
                <td>${coupon.type === 'percentage' ? 'Porcentaje' : 'Monto Fijo'}</td>
                <td>${coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Sin expiración'}</td>
                <td>${coupon.usage_count} / ${coupon.max_uses || '∞'}</td>
                <td>${coupon.min_purchase_amount ? 'S/ ' + parseFloat(coupon.min_purchase_amount).toFixed(2) : '-'}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="window.adminCoupons.openModal('${coupon.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="window.adminCoupons.deleteCoupon('${coupon.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    openModal(couponId = null) {
        const modal = document.getElementById('couponModal');
        const form = document.getElementById('couponForm');

        form.reset();
        this.currentCouponId = couponId;

        if (couponId) {
            const coupon = this.coupons.find(c => c.id === couponId);
            if (coupon) {
                document.getElementById('couponModalTitle').textContent = 'Editar Cupón';
                document.getElementById('couponId').value = coupon.id;
                document.getElementById('couponCode').value = coupon.code;
                document.getElementById('couponDescription').value = coupon.description || '';
                document.getElementById('couponType').value = coupon.type;
                document.getElementById('couponValue').value = coupon.value;
                document.getElementById('couponMinPurchase').value = coupon.min_purchase_amount || 0;
                document.getElementById('couponMaxUses').value = coupon.max_uses || '';
                if (coupon.expires_at) {
                    document.getElementById('couponExpiresAt').value = new Date(coupon.expires_at).toISOString().split('T')[0];
                }
            }
        } else {
            document.getElementById('couponModalTitle').textContent = 'Crear Cupón';
            // Set defaults if new
            document.getElementById('couponType').value = 'percentage';
        }

        modal.style.display = 'flex';
    }

    closeModal() {
        document.getElementById('couponModal').style.display = 'none';
        this.currentCouponId = null;
    }

    async saveCoupon(e) {
        e.preventDefault();

        const form = document.getElementById('couponForm');
        const formData = {
            code: document.getElementById('couponCode').value.toUpperCase(),
            description: document.getElementById('couponDescription').value,
            type: document.getElementById('couponType').value,
            value: parseFloat(document.getElementById('couponValue').value),
            min_purchase_amount: parseFloat(document.getElementById('couponMinPurchase').value) || 0,
            max_uses: document.getElementById('couponMaxUses').value ? parseInt(document.getElementById('couponMaxUses').value) : null,
            expires_at: document.getElementById('couponExpiresAt').value || null
        };

        try {
            let response;
            if (this.currentCouponId) {
                response = await window.api.updateCoupon(this.currentCouponId, formData);
            } else {
                response = await window.api.createCoupon(formData);
            }

            if (response.success) {
                window.notifications.success(this.currentCouponId ? 'Cupón actualizado' : 'Cupón creado');
                this.closeModal();
                this.loadCoupons();
            } else {
                window.notifications.error(response.message || 'Error al guardar cupón');
            }
        } catch (error) {
            console.error('Error saving coupon:', error);
            window.notifications.error('Error al guardar cupón');
        }
    }

    async deleteCoupon(id) {
        if (!confirm('¿Estás seguro de eliminar este cupón?')) return;

        try {
            const response = await window.api.deleteCoupon(id);
            if (response.success) {
                window.notifications.success('Cupón eliminado');
                this.loadCoupons();
            } else {
                window.notifications.error(response.message || 'Error al eliminar cupón');
            }
        } catch (error) {
            console.error('Error deleting coupon:', error);
            window.notifications.error('Error al eliminar cupón');
        }
    }
}

// Inicializar y exponer globalmente
window.adminCoupons = new AdminCoupons();

// Event Listener para el formulario
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('couponForm');
    if (form) {
        form.addEventListener('submit', (e) => window.adminCoupons.saveCoupon(e));
    }
});
