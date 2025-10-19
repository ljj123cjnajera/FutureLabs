// 💝 Wishlist Manager - FutureLabs

class WishlistManager {
    constructor() {
        this.wishlistItems = [];
        this.isLoading = false;
    }

    // Inicializar wishlist
    async init() {
        if (!window.authManager.isAuthenticated()) {
            console.log('⏳ Usuario no autenticado, wishlist no disponible');
            return;
        }

        try {
            this.isLoading = true;
            const response = await window.api.getWishlist();
            
            if (response.success) {
                this.wishlistItems = response.data.items || [];
                console.log('✅ Wishlist cargada:', this.wishlistItems.length, 'items');
                this.updateWishlistCount();
            }
        } catch (error) {
            console.error('❌ Error al cargar wishlist:', error);
        } finally {
            this.isLoading = false;
        }
    }

    // Agregar a wishlist
    async add(productId) {
        if (!window.authManager.isAuthenticated()) {
            window.notifications.warning('Inicia sesión para agregar a tu wishlist');
            return false;
        }

        try {
            const response = await window.api.addToWishlist(productId);
            
            if (response.success) {
                this.wishlistItems.push({ product_id: productId });
                this.updateWishlistCount();
                window.notifications.success('Agregado a tu wishlist');
                return true;
            } else {
                throw new Error(response.message || 'Error al agregar a wishlist');
            }
        } catch (error) {
            console.error('❌ Error al agregar a wishlist:', error);
            window.notifications.error(error.message || 'Error al agregar a wishlist');
            return false;
        }
    }

    // Remover de wishlist
    async remove(productId) {
        try {
            const response = await window.api.removeFromWishlist(productId);
            
            if (response.success) {
                this.wishlistItems = this.wishlistItems.filter(item => item.product_id !== productId);
                this.updateWishlistCount();
                window.notifications.success('Eliminado de tu wishlist');
                return true;
            } else {
                throw new Error(response.message || 'Error al eliminar de wishlist');
            }
        } catch (error) {
            console.error('❌ Error al eliminar de wishlist:', error);
            window.notifications.error(error.message || 'Error al eliminar de wishlist');
            return false;
        }
    }

    // Verificar si está en wishlist
    isInWishlist(productId) {
        return this.wishlistItems.some(item => item.product_id === productId);
    }

    // Actualizar contador en header
    updateWishlistCount() {
        const wishlistCount = document.getElementById('wishlistCount');
        if (wishlistCount) {
            wishlistCount.textContent = this.wishlistItems.length;
        }
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('wishlistUpdated', {
            detail: { count: this.wishlistItems.length }
        }));
    }

    // Alternar wishlist (agregar/quitar)
    async toggle(productId) {
        if (this.isInWishlist(productId)) {
            return await this.remove(productId);
        } else {
            return await this.add(productId);
        }
    }

    // Limpiar wishlist
    async clear() {
        try {
            const response = await window.api.clearWishlist();
            
            if (response.success) {
                this.wishlistItems = [];
                this.updateWishlistCount();
                window.notifications.success('Wishlist limpiada');
                return true;
            } else {
                throw new Error(response.message || 'Error al limpiar wishlist');
            }
        } catch (error) {
            console.error('❌ Error al limpiar wishlist:', error);
            window.notifications.error(error.message || 'Error al limpiar wishlist');
            return false;
        }
    }

    // Mover de wishlist a carrito
    async moveToCart(productId, quantity = 1) {
        try {
            // Agregar al carrito
            const cartResponse = await window.api.addToCart(productId, quantity);
            
            if (cartResponse.success) {
                // Remover de wishlist
                await this.remove(productId);
                window.notifications.success('Producto agregado al carrito');
                return true;
            } else {
                throw new Error(cartResponse.message || 'Error al agregar al carrito');
            }
        } catch (error) {
            console.error('❌ Error al mover a carrito:', error);
            window.notifications.error(error.message || 'Error al mover a carrito');
            return false;
        }
    }

    // Obtener wishlist
    getWishlist() {
        return this.wishlistItems;
    }

    // Obtener cantidad
    getCount() {
        return this.wishlistItems.length;
    }
}

// Crear instancia global
window.wishlistManager = new WishlistManager();

// Inicializar wishlist cuando el authManager esté listo
if (window.authManager) {
    window.authManager.addEventListener('authStateChanged', () => {
        if (window.authManager.isAuthenticated()) {
            window.wishlistManager.init();
        }
    });
}

// Inicializar inmediatamente si ya está autenticado
if (window.authManager && window.authManager.isAuthenticated()) {
    window.wishlistManager.init();
}


