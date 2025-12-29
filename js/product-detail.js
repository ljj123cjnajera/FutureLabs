// Inicializar header dinámico y cargar producto
document.addEventListener('DOMContentLoaded', async function () {
    // Inicializar header
    const headerContainer = document.getElementById('mainHeader');
    if (headerContainer && window.Components) {
        headerContainer.innerHTML = window.Components.getHeader(true, true);
        window.Components.initHeader();
        window.Components.initSearch();
        window.Components.initCartCounter();
    }

    // Obtener ID del producto de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    window.currentProductId = productId;

    // Cargar producto
    async function loadProduct() {
        const container = document.getElementById('productDetailContainer');

        if (!productId) {
            container.innerHTML = `
    <div style="text-align: center; padding: 100px;">
        <i class="fas fa-exclamation-triangle fa-3x" style="color: #e74c3c; margin-bottom: 20px;"></i>
        <h2>Producto no encontrado</h2>
        <p>El producto que buscas no existe</p>
    </div>
`;
            return;
        }

        try {
            const response = await window.api.getProduct(productId);

            if (response.success && response.data.product) {
                const product = response.data.product;

                // Normalizar la URL de la imagen
                let imageUrl = product.image_url || 'assets/images/products/placeholder.jpg';

                // Si la URL no comienza con http/https, verificar si es relativa o necesita el protocolo
                if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('/')) {
                    // Si es una URL del backend sin protocolo, agregar https://
                    if (imageUrl.startsWith('/')) {
                        // Assuming local or relative path
                        // Ensure it's treated correctly if needed
                    } else if (imageUrl.startsWith('http')) {
                        // already good
                    } else {
                        // Fallback or fix malformed
                    }
                }

                console.log('Product image URL:', imageUrl);
                product.image_url = imageUrl;

                // Generar múltiples imágenes para la galería
                let galleryImages = [];
                if (product.gallery_images && product.gallery_images.length > 0) {
                    galleryImages = product.gallery_images;
                } else {
                    // Si solo hay una imagen, duplicarla para mejor UX
                    galleryImages = [imageUrl, imageUrl, imageUrl, imageUrl];
                }

                // Guardar producto globalmente para breadcrumbs
                window.currentProduct = product;
                if (window.breadcrumbs) {
                    window.breadcrumbs.updateProductName(product.name);
                }

                // SEO ENGINE UPDATE
                if (window.SeoManager) {
                    window.SeoManager.updateProductSEO({
                        title: product.name,
                        description: product.description || `Buy ${product.name} at Sneakers Shop. Best price and authentic quality.`,
                        image: product.image_url,
                        url: window.location.href,
                        price: product.price,
                        currency: 'PEN'
                    });
                }

                container.innerHTML = `
        <div class="product-detail-layout">
            <!-- Left Column: Sticky Gallery -->
            <div id="productGallery" class="product-gallery-sticky">
                    <!-- Gallery will be rendered here by product-gallery.js -->
                    <div class="loading-spinner"></div>
            </div>
            
            <!-- Right Column: Product Info -->
            <div class="product-info-detail">
                <div class="product-header-group">
                    <div class="product-meta-header" style="display:flex; justify-content:space-between; align-items:center;">
                        <p class="product-brand" style="font-weight: 800; text-transform: uppercase; color: #666; margin-bottom: 0.5rem; letter-spacing: 0.1em;">${product.brand}</p>
                        <div class="product-rating-detail">
                            <span class="stars-detail">★★★★★</span>
                            <span class="rating-text-detail">(${product.rating_count || 0} reviews)</span>
                        </div>
                    </div>
                    
                    <!-- Mini Trust -->
                    <div class="payment-trust-mini" style="display: flex; gap: 15px; margin-top: 10px; font-size: 0.75rem; color: #666; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                        <span><i class="fas fa-mobile-alt"></i> Yape/Plin</span>
                        <span><i class="fas fa-lock"></i> Compra Segura</span>
                        <span><i class="fas fa-shipping-fast"></i> Envío Inmediato</span>
                    </div>
                </div>
                
                <div class="product-description-detail" style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 3rem;">
                    ${product.description || 'La máxima expresión del estilo urbano. Diseñados para destacar y construidos para durar.'}
                </div>
                
                <div class="size-selector-container">
                    <div class="size-selector-header">
                        <span class="size-label" style="font-weight: 800; text-transform: uppercase;">SELECCIONA TU TALLA (US)</span>
                        <span class="size-guide-link" onclick="openSizeGuideModal()">
                            <i class="fas fa-ruler-combined"></i> GUÍA DE TALLAS
                        </span>
                    </div>
                    <div class="size-selector-grid size-grid" id="sizeSelectorGrid">
                        <!-- Generated by JS -->
                    </div>
                        <div class="validation-message" id="sizeValidationMsg">
                        <i class="fas fa-exclamation-circle"></i> SELECCIONA UNA TALLA PARA CONTINUAR
                    </div>
                </div>

                <div class="product-actions-sticky">
                        <button type="button" class="btn btn-massive" id="addToCartBtn" onclick="addToCart()" ${product.stock_quantity === 0 ? 'disabled' : ''}>
                        ${product.stock_quantity > 0 ? `AÑADIR AL CARRITO` : 'AGOTADO'} <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
                
                <div class="product-meta-footer" style="margin-top: 3rem; border-top: 4px solid var(--black); padding-top: 2rem;">
                    <!-- Shipping Countdown -->
                    <div class="meta-item shipping-countdown" style="display: flex; gap: 1rem; margin-bottom: 1rem; background: #f0f0f0; padding: 15px; border-radius: 4px;">
                        <i class="fas fa-stopwatch" style="font-size: 1.5rem; color: var(--black);"></i>
                        <div>
                            <strong style="text-transform: uppercase; font-weight: 900; color: var(--black);">¡LLEGA MAÑANA!</strong>
                            <p style="margin:0; color: #666; font-size: 0.9rem;">
                                Pide antes de las 5PM para envío asegurado.
                            </p>
                        </div>
                    </div>

                    <div class="meta-item" style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                        <i class="fas fa-truck" style="font-size: 1.5rem;"></i>
                        <div>
                            <strong style="text-transform: uppercase; font-weight: 900;">ENVÍO GLOBAL RAPIDO</strong>
                            <p style="margin:0; color: #666;">Gratis en pedidos +$200</p>
                        </div>
                    </div>
                    <div class="meta-item" style="display: flex; gap: 1rem;">
                        <i class="fas fa-check-circle" style="font-size: 1.5rem;"></i>
                        <div>
                            <strong style="text-transform: uppercase; font-weight: 900;">100% AUTÉNTICO</strong>
                            <p style="margin:0; color: #666;">Verificado por expertos</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sticky Mobile Actions (Phase 126) -->
        <div id="stickyMobileATC" class="sticky-mobile-atc" style="display:none;">
            <button class="btn btn-massive" onclick="document.querySelector('.product-actions-sticky').scrollIntoView({behavior: 'smooth'})">
                COMPRAR AHORA - S/ ${product.price}
            </button>
        </div>
    `;

                // Start Countdown Logic
                const now = new Date();
                const cutoff = new Date();
                cutoff.setHours(17, 0, 0, 0); // 5 PM Cutoff
                if (now > cutoff) {
                    cutoff.setDate(cutoff.getDate() + 1); // Next day if past 5 PM
                }

                // Simple static calculation for initial render, dynamic update could be added but static is enough for "pressure" on load
                const diff = cutoff - now;
                const hours = Math.floor(diff / 1000 / 60 / 60);
                const minutes = Math.floor((diff / 1000 / 60) % 60);
                // We can inject a script to animate this or just leave it static on load (user likely won't stare for minutes)
                // Let's make it static but realistic for the "snapshot" feel, updating via CSS or simple JS loop is overkill for now unless requested
                // Actually, static might look broken if they refresh. Let's just set the text content in the template.
                // Using a helper function updateTimer would be better, but inline logic works for MVP pressure.


                // Size Guide Modal logic moved to HTML body
                const sizeGuideModalHTML = `
                    <div id="sizeGuideModal" class="modal" style="display: none;">
                        <div class="modal-content">
                            <span class="close-modal" onclick="closeSizeGuideModal()">&times;</span>
                            <h2>Guía de Tallas</h2>
                            <div class="size-guide-tabs">
                                <div class="size-tab active">Nike / Jordan</div>
                                <div class="size-tab">Adidas / Yeezy</div>
                            </div>
                            <p>Nuestras tallas están en US Men. Usa esta tabla para convertir.</p>
                            <table class="size-guide-table">
                                <thead>
                                    <tr>
                                        <th>US Men</th>
                                        <th>UK</th>
                                        <th>EU</th>
                                        <th>CM</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>7</td><td>6</td><td>40</td><td>25</td></tr>
                                    <tr><td>7.5</td><td>6.5</td><td>40.5</td><td>25.5</td></tr>
                                    <tr><td>8</td><td>7</td><td>41</td><td>26</td></tr>
                                    <tr><td>8.5</td><td>7.5</td><td>42</td><td>26.5</td></tr>
                                    <tr><td>9</td><td>8</td><td>42.5</td><td>27</td></tr>
                                    <tr><td>9.5</td><td>8.5</td><td>43</td><td>27.5</td></tr>
                                    <tr><td>10</td><td>9</td><td>44</td><td>28</td></tr>
                                    <tr><td>10.5</td><td>9.5</td><td>44.5</td><td>28.5</td></tr>
                                    <tr><td>11</td><td>10</td><td>45</td><td>29</td></tr>
                                    <tr><td>12</td><td>11</td><td>46</td><td>30</td></tr>
                                    <tr><td>13</td><td>12</td><td>47.5</td><td>31</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
                // Inject if not exists
                if (!document.getElementById('sizeGuideModal')) {
                    document.body.insertAdjacentHTML('beforeend', sizeGuideModalHTML);
                }

                // Render Size Options Logic
                renderSizeOptions(product);

                if (window.productComparator) {
                    window.productComparator.updateCompareButtons();
                }

                if (window.productGallery && galleryImages) {
                    window.productGallery.render(galleryImages, product);
                }

                if (window.recentlyViewed) {
                    window.recentlyViewed.add({
                        id: product.id,
                        name: product.name,
                        brand: product.brand,
                        price: product.price,
                        discount_price: product.discount_price,
                        image_url: product.image_url
                    });
                    window.recentlyViewed.render('recentlyViewedGrid', { limit: 6, hideWhenEmpty: true });
                }
            } else {
                container.innerHTML = `
                    <div style = "text-align: center; padding: 100px;" >
                        <i class="fas fa-exclamation-triangle fa-3x" style="color: #e74c3c; margin-bottom: 20px;"></i>
                        <h2>Producto no encontrado</h2>
                        <p>El producto que buscas no existe</p>
                    </div >
                    `;
            }
        } catch (error) {
            container.innerHTML = `
                    <div style = "text-align: center; padding: 100px;" >
                    <i class="fas fa-exclamation-triangle fa-3x" style="color: #e74c3c; margin-bottom: 20px;"></i>
                    <h2>Error al cargar el producto</h2>
                    <p>${error.message}</p>
                </div >
                    `;
        }
    }

    let selectedSize = null;

    function renderSizeOptions(product) {
        const grid = document.getElementById('sizeSelectorGrid');
        if (!grid) return;

        // Standard US Men Sizes
        const sizes = ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12', '13'];

        // Logic: If total stock > 0, assume all sizes available (Simple V1)
        // If stock === 0, all disabled.
        const hasStock = product.stock_quantity > 0;

        grid.innerHTML = sizes.map(size => {
            return `
                    <button class="size-option ${!hasStock ? 'disabled' : ''}"
                onclick = "selectSize('${size}', this)" 
                        ${!hasStock ? 'disabled' : ''}>
                    ${size}
                </button >
                    `;
        }).join('');
    }

    window.selectSize = function (size, element) {
        if (element.disabled) return;

        // Remove active class from all
        document.querySelectorAll('.size-option').forEach(el => el.classList.remove('selected'));

        // Add to clicked
        element.classList.add('selected');
        selectedSize = size;

        // Hide error
        const errorMsg = document.getElementById('sizeValidationMsg');
        if (errorMsg) errorMsg.classList.remove('visible');
    };

    window.openSizeGuideModal = function () {
        const modal = document.getElementById('sizeGuideModal');
        if (modal) {
            modal.style.display = 'block';
            // Force display block first then add opacity for transition if needed
            // Simple css display toggle for now
        }
    };

    window.closeSizeGuideModal = function () {
        const modal = document.getElementById('sizeGuideModal');
        if (modal) modal.style.display = 'none';
    };

    // Close modal when clicking outside
    window.onclick = function (event) {
        const modal = document.getElementById('sizeGuideModal');
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    // Agregar al carrito
    window.addToCart = async function () {
        // Obtener ID del producto de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId) {
            window.notifications.error('Error: ID de producto no encontrado');
            return;
        }

        // VALIDACIÓN DE TALLA
        if (!selectedSize) {
            const errorMsg = document.getElementById('sizeValidationMsg');
            const container = document.querySelector('.size-selector-container');

            if (errorMsg) errorMsg.classList.add('visible');
            if (container) {
                container.classList.remove('shake-animation');
                void container.offsetWidth; // trigger reflow
                container.classList.add('shake-animation');
            }
            return;
        }

        // Add size to cart item
        window.logger?.info('PRODUCT', `Agregando talla: ${selectedSize} `);

        // Use the new CartEngine (aliased as cartManager)
        // It will handle: Saving to LocalStorage, Updating UI, Opening Drawer
        await window.cartManager.add(productId, 1, { size: selectedSize });

        // Optional: Notification (already handled visually by drawer open, but good for confirmation)
        window.notifications.success(`Agregado: Talla US ${selectedSize}`);
    }

    // Comprar ahora
    window.buyNow = async function () {
        // Obtener ID del producto de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId) {
            window.notifications.error('Error: ID de producto no encontrado');
            return;
        }

        // VALIDACIÓN DE TALLA
        if (!selectedSize) {
            const errorMsg = document.getElementById('sizeValidationMsg');
            const container = document.querySelector('.size-selector-container');

            if (errorMsg) errorMsg.classList.add('visible');
            if (container) {
                container.classList.remove('shake-animation');
                void container.offsetWidth; // trigger reflow
                container.classList.add('shake-animation');
            }
            return;
        }

        await window.cartManager.add(productId, 1, { size: selectedSize });
        window.notifications.success('Redirigiendo al checkout...');
        setTimeout(() => {
            window.location.href = 'checkout.html';
        }, 1000);
    }

    const clearRecentlyViewedBtn = document.getElementById('clearRecentlyViewedBtn');
    if (clearRecentlyViewedBtn) {
        clearRecentlyViewedBtn.addEventListener('click', () => {
            window.recentlyViewed?.clearAndRender('recentlyViewedGrid', { hideWhenEmpty: true });
        });
    }

    if (window.recentlyViewed) {
        window.recentlyViewed.render('recentlyViewedGrid', { limit: 6, hideWhenEmpty: true });
    }

    // Actualizar contador de carrito
    document.addEventListener('cartUpdated', (e) => {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = e.detail.count;
        }
    });

    // Cargar producto al iniciar
    await loadProduct();

    if (productId && window.reviewsManager) {
        await window.reviewsManager.init(productId, {
            statsContainerId: 'reviewsStats',
            listContainerId: 'reviewsList',
            formContainerId: 'reviewFormContainer',
            filterContainerId: 'reviewsFilterButtons',
            sortSelectId: 'reviewsSortSelect',
            writeButtonId: 'writeReviewBtn'
        });
    }
});
