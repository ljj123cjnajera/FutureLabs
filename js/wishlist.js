// 💝 Wishlist Manager - FutureLabs

class WishlistManager {
    constructor() {
        this.lists = [];
        this.activeListId = null;
        this.stats = { total_items: 0, total_lists: 0 };
        this.isLoading = false;
        this.selectedItems = new Set();
    }

    async init() {
        if (!window.authManager?.isAuthenticated()) {
            console.log('⏳ Usuario no autenticado, wishlist no disponible');
            return;
        }

        await this.load();
    }

    async load() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            const response = await window.api.getWishlist();

            if (response.success) {
                this.lists = response.data.lists || [];
                this.stats = response.data.stats || { total_items: 0, total_lists: 0 };

                if (!this.activeListId || !this.lists.find(list => list.id === this.activeListId)) {
                    const defaultList = this.lists.find(list => list.is_default);
                    this.activeListId = defaultList ? defaultList.id : this.lists[0]?.id || null;
                }

                this.updateWishlistCount();
                this.emitUpdate();
            }
        } catch (error) {
            console.error('❌ Error al cargar wishlist:', error);
        } finally {
            this.isLoading = false;
        }
    }

    emitUpdate() {
        window.dispatchEvent(new CustomEvent('wishlistUpdated', {
            detail: {
                count: this.stats.total_items,
                lists: this.lists,
                activeListId: this.activeListId,
                stats: this.stats
            }
        }));
    }

    get totalItems() {
        return this.stats.total_items || 0;
    }

    getActiveList() {
        return this.lists.find(list => list.id === this.activeListId) || null;
    }

    getDefaultList() {
        return this.lists.find(list => list.is_default) || null;
    }

    getListById(listId) {
        return this.lists.find(list => list.id === listId) || null;
    }

    getItem(productId, listId = null) {
        if (listId) {
            const list = this.getListById(listId);
            return list?.items?.find(item => item.product_id === productId) || null;
        }

        for (const list of this.lists) {
            const item = list.items?.find(i => i.product_id === productId);
            if (item) return item;
        }

        return null;
    }

    async setActiveList(listId) {
        if (this.activeListId === listId) {
            return;
        }
        this.activeListId = listId;
        this.clearSelection();
        this.emitUpdate();
    }

    async add(productId, { listId = null } = {}) {
        if (!window.authManager?.isAuthenticated()) {
            window.notifications?.warning?.('Inicia sesión para guardar productos en tu wishlist');
            return false;
        }

        const targetListId = listId || this.activeListId || this.getDefaultList()?.id;

        try {
            await window.api.addToWishlist(productId, targetListId);
            await this.load();
            window.notifications?.success?.('Producto agregado a tu wishlist');
            return true;
        } catch (error) {
            console.error('❌ Error al agregar a wishlist:', error);
            window.notifications?.error?.(error.message || 'Error al agregar a tu wishlist');
            return false;
        }
    }

    async remove(productId, { listId = null } = {}) {
        try {
            let targetListId = listId;

            if (!targetListId) {
                const item = this.getItem(productId);
                targetListId = item?.list_id;
            }

            await window.api.removeFromWishlist(productId, targetListId);
            await this.load();
            window.notifications?.success?.('Producto eliminado de tu wishlist');
            return true;
        } catch (error) {
            console.error('❌ Error al eliminar de wishlist:', error);
            window.notifications?.error?.(error.message || 'Error al eliminar de tu wishlist');
            return false;
        }
    }

    isInWishlist(productId, listId = null) {
        return !!this.getItem(productId, listId);
    }

    async toggle(productId, options = {}) {
        if (this.isInWishlist(productId, options.listId)) {
            return this.remove(productId, options);
        }

        return this.add(productId, options);
    }

    async clear(listId = null) {
        try {
            await window.api.clearWishlist(listId);
            await this.load();
            window.notifications?.success?.(
                listId ? 'Lista limpiada correctamente' : 'Tu wishlist está vacía'
            );
            return true;
        } catch (error) {
            console.error('❌ Error al limpiar wishlist:', error);
            window.notifications?.error?.(error.message || 'Error al limpiar wishlist');
            return false;
        }
    }

    async moveToCart(productId, { quantity = 1, listId = null } = {}) {
        try {
            const cartResponse = await window.api.addToCart(productId, quantity);

            if (!cartResponse.success) {
                throw new Error(cartResponse.message || 'No se pudo agregar al carrito');
            }

            await this.remove(productId, { listId });
            window.notifications?.success?.('Producto agregado al carrito');
            return true;
        } catch (error) {
            console.error('❌ Error al mover a carrito:', error);
            window.notifications?.error?.(error.message || 'Error al mover al carrito');
            return false;
        }
    }

    async createList(name, description) {
        try {
            const response = await window.api.createWishlistList({ name, description });

            if (response.success) {
                await this.load();
                window.notifications?.success?.('Lista creada correctamente');
                return response.data.list;
            }

            throw new Error(response.message || 'Error al crear la lista');
        } catch (error) {
            console.error('❌ Error al crear lista:', error);
            window.notifications?.error?.(error.message || 'No se pudo crear la lista');
            throw error;
        }
    }

    async renameList(listId, payload) {
        try {
            const response = await window.api.updateWishlistList(listId, payload);

            if (response.success) {
                await this.load();
                window.notifications?.success?.('Lista actualizada');
                return response.data.list;
            }

            throw new Error(response.message || 'Error al actualizar la lista');
        } catch (error) {
            console.error('❌ Error al renombrar lista:', error);
            window.notifications?.error?.(error.message || 'No se pudo actualizar la lista');
            throw error;
        }
    }

    async deleteList(listId, { deleteItems = false } = {}) {
        try {
            await window.api.deleteWishlistList(listId, { deleteItems });
            if (this.activeListId === listId) {
                this.activeListId = null;
            }
            await this.load();
            window.notifications?.success?.('Lista eliminada correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error al eliminar lista:', error);
            window.notifications?.error?.(error.message || 'No se pudo eliminar la lista');
            return false;
        }
    }

    async setDefaultList(listId) {
        try {
            await window.api.setDefaultWishlistList(listId);
            await this.load();
            window.notifications?.success?.('Lista establecida como predeterminada');
            return true;
        } catch (error) {
            console.error('❌ Error al establecer lista predeterminada:', error);
            window.notifications?.error?.(error.message || 'No se pudo actualizar la lista');
            return false;
        }
    }

    async moveProductToList(productId, toListId, fromListId = null) {
        try {
            await window.api.moveWishlistItem(productId, fromListId, toListId);
            await this.load();
            window.notifications?.success?.('Producto movido a la otra lista');
            return true;
        } catch (error) {
            console.error('❌ Error al mover producto de lista:', error);
            window.notifications?.error?.(error.message || 'No se pudo mover el producto');
            return false;
        }
    }

    updateWishlistCount() {
        const wishlistCountElement = document.getElementById('wishlistCount');

        if (wishlistCountElement) {
            wishlistCountElement.textContent = this.totalItems;
        }
    }

    selectItem(productId) {
        this.selectedItems.add(productId);
        this.emitSelectionChange();
    }

    deselectItem(productId) {
        this.selectedItems.delete(productId);
        this.emitSelectionChange();
    }

    toggleSelection(productId) {
        if (this.selectedItems.has(productId)) {
            this.selectedItems.delete(productId);
        } else {
            this.selectedItems.add(productId);
        }
        this.emitSelectionChange();
    }

    selectAllCurrentList() {
        const activeList = this.getActiveList();
        if (!activeList) return;

        activeList.items.forEach(item => this.selectedItems.add(item.product_id));
        this.emitSelectionChange();
    }

    clearSelection() {
        if (this.selectedItems.size === 0) return;
        this.selectedItems.clear();
        this.emitSelectionChange();
    }

    emitSelectionChange() {
        window.dispatchEvent(new CustomEvent('wishlistSelectionChanged', {
            detail: {
                selected: Array.from(this.selectedItems),
                totalSelected: this.selectedItems.size
            }
        }));
    }
}

window.wishlistManager = new WishlistManager();

if (window.authManager) {
    window.authManager.addEventListener('authStateChanged', () => {
        if (window.authManager.isAuthenticated()) {
            window.wishlistManager.init();
        }
    });
}

if (window.authManager && window.authManager.isAuthenticated()) {
    window.wishlistManager.init();
}
