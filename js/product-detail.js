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
            // 1. API Call
            const response = await window.api.getProduct(productId);
            let product = null;

            // 2. Parsed Response (Handle various API formats)
            if (response && response.success && response.data) {
                product = response.data;
            } else if (response && response.id) {
                product = response;
            } else if (response && response.data && response.data.product) {
                product = response.data.product;
            }

            // 3. Validate Data
            if (product) {
                window.currentProduct = product;

                // Normalizar imágenes
                let galleryImages = [];
                if (Array.isArray(product.images) && product.images.length > 0) {
                    galleryImages = product.images;
                } else if (product.image_url) {
                    galleryImages = [product.image_url, product.image_url, product.image_url, product.image_url];
                } else {
                    galleryImages = ['img/placeholder.jpg'];
                }

                renderProductDetails(product, container, galleryImages);
                return;
            } else {
                throw new Error('Product Not Found in API');
            }

        } catch (error) {
            console.warn('❌ API Error in PDP:', error);

            // 4. Fallback Logic
            const mock = getMockProduct(productId);
            if (mock) {
                window.currentProduct = mock;
                const imgs = [mock.image_url, mock.image_url, mock.image_url, mock.image_url];
                renderProductDetails(mock, container, imgs);
                if (window.notifications) window.notifications.info('OFFLINE MODE', 'Mostrando versión simulada');
            } else {
                renderErrorState(container, 'Producto no encontrado');
            }
        }
    }

    // --- HELPER: RENDER UI ---
    function renderProductDetails(product, container, galleryImages) {
        // ... (Same rendering logic as before, refactored out or kept inline if simple)
        // Note: For minimal diff, I will paste the entire innerHTML block here or assume the user wants me to duplicate the block.
        // BETTER: Let's actually keep the huge innerHTML block in the main flow but just wrap the "Success" part.
        // However, since I can't refactor the whole function easily in one go without a massive diff, I will duplicate the render logic inside the mock block OR 
        // essentially "hijack" the success flow.

        // RE-STRATEGY for minimal diff: 
        // 1. Define getMockProduct at the end.
        // 2. In the catch/else blocks, if mock exists, just assign `response = { success: true, data: { product: mock } }` effectively? 
        // No, let's keep it explicit.

        // SEO ENGINE UPDATE
        if (window.SeoManager) {
            window.SeoManager.updateProductSEO({
                title: product.name,
                description: product.description || `Buy ${product.name} at Sneakers Shop.`,
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
                    <div class="loading-spinner"></div>
            </div>
            
            <!-- Right Column: Product Info -->
            <div class="product-info-detail">
                <div class="product-header-group">
                    <div class="product-meta-header" style="display:flex; justify-content:space-between; align-items:center;">
                        <p class="product-brand" style="font-weight: 800; text-transform: uppercase; color: #666; margin-bottom: 0.5rem; letter-spacing: 0.1em;">${product.brand}</p>
                        <div class="product-rating-detail">
                            <span class="stars-detail">★★★★★</span>
                            <span class="rating-text-detail">(${product.rating_count || 12} reviews)</span>
                        </div>
                    </div>
                    <!-- Mini Trust -->
                    <div class="payment-trust-mini" style="display: flex; gap: 15px; margin-top: 10px; font-size: 0.75rem; color: #666; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                        <span><i class="fas fa-mobile-alt" aria-hidden="true"></i> Yape/Plin</span>
                        <span><i class="fas fa-lock" aria-hidden="true"></i> Compra Segura</span>
                        <span><i class="fas fa-shipping-fast" aria-hidden="true"></i> Envío Inmediato</span>
                    </div>
                </div>
                
                <!-- Stock Urgency Badge -->
                ${product.stock_quantity !== undefined && product.stock_quantity > 0 && product.stock_quantity <= 5 ? `
                <div class="stock-urgency-banner" style="background: #fff3cd; border: 2px solid #ffc107; padding: 15px; margin-bottom: 1.5rem; border-radius: 4px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-exclamation-triangle" style="color: #ff9800; font-size: 1.5rem;" aria-hidden="true"></i>
                        <div>
                            <strong style="color: #d32f2f; text-transform: uppercase; font-weight: 900;">¡ÚLTIMAS UNIDADES!</strong>
                            <p style="margin: 5px 0 0 0; color: #666; font-size: 0.9rem;">Solo quedan ${product.stock_quantity} pares disponibles</p>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <div class="product-description-detail" style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem;">
                    ${product.description || 'La máxima expresión del estilo urbano. Diseñados para destacar y construidos para durar.'}
                </div>
                
                <!-- Key Features -->
                <div class="product-features-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 2rem; padding: 20px; background: #f8f9fa; border-radius: 4px;">
                    <div class="feature-item" style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-check-circle" style="color: #4caf50; font-size: 1.2rem;" aria-hidden="true"></i>
                        <span style="font-size: 0.9rem; font-weight: 600;">100% Auténtico</span>
                    </div>
                    <div class="feature-item" style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-shipping-fast" style="color: #2196f3; font-size: 1.2rem;" aria-hidden="true"></i>
                        <span style="font-size: 0.9rem; font-weight: 600;">Envío Gratis S/150+</span>
                    </div>
                    <div class="feature-item" style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-undo" style="color: #ff9800; font-size: 1.2rem;" aria-hidden="true"></i>
                        <span style="font-size: 0.9rem; font-weight: 600;">30 Días Devolución</span>
                    </div>
                    <div class="feature-item" style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-shield-alt" style="color: #9c27b0; font-size: 1.2rem;" aria-hidden="true"></i>
                        <span style="font-size: 0.9rem; font-weight: 600;">Garantía Oficial</span>
                    </div>
                </div>
                
                <div class="size-selector-container">
                    <div class="size-selector-header">
                        <span class="size-label" style="font-weight: 800; text-transform: uppercase;">SELECCIONA TU TALLA (US)</span>
                        <span class="size-guide-link" onclick="openSizeGuideModal()">
                            <i class="fas fa-ruler-combined"></i> GUÍA DE TALLAS
                        </span>
                    </div>
                    <div class="size-selector-grid size-grid" id="sizeSelectorGrid"></div>
                    <div class="validation-message" id="sizeValidationMsg">
                        <i class="fas fa-exclamation-circle"></i> SELECCIONA UNA TALLA PARA CONTINUAR
                    </div>
                </div>

                <!-- Price Display with Discount -->
                ${product.discount_price && product.discount_price < product.price ? `
                <div class="product-price-display" style="margin-bottom: 1.5rem; padding: 20px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                    <div style="display: flex; align-items: baseline; gap: 15px; margin-bottom: 10px;">
                        <span style="font-size: 2rem; font-weight: 900; color: var(--black);">S/ ${parseFloat(product.discount_price).toFixed(2)}</span>
                        <span style="font-size: 1.2rem; color: #666; text-decoration: line-through;">S/ ${parseFloat(product.price).toFixed(2)}</span>
                        <span style="background: #d32f2f; color: white; padding: 5px 10px; border-radius: 4px; font-weight: 700; font-size: 0.9rem;">
                            -${Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
                        </span>
                    </div>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">
                        <i class="fas fa-tag" aria-hidden="true"></i> Ahorras S/ ${(parseFloat(product.price) - parseFloat(product.discount_price)).toFixed(2)}
                    </p>
                </div>
                ` : `
                <div class="product-price-display" style="margin-bottom: 1.5rem;">
                    <span style="font-size: 2rem; font-weight: 900; color: var(--black);">S/ ${parseFloat(product.price).toFixed(2)}</span>
                </div>
                `}
                
                <!-- Action Buttons -->
                <div class="product-actions-sticky" style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 2rem;">
                    ${product.stock_quantity > 0 || product.stock_quantity === undefined ? `
                    <button type="button" class="btn btn-massive btn-primary" id="buyNowBtn" onclick="buyNow()" style="background: var(--black); color: white; padding: 18px; font-size: 1.1rem; font-weight: 900; text-transform: uppercase; border: none; cursor: pointer; width: 100%;">
                        <i class="fas fa-bolt" aria-hidden="true"></i> COMPRAR AHORA
                    </button>
                    <button type="button" class="btn btn-massive" id="addToCartBtn" onclick="addToCart()" style="background: white; color: var(--black); padding: 18px; font-size: 1.1rem; font-weight: 900; text-transform: uppercase; border: 3px solid var(--black); cursor: pointer; width: 100%;">
                        <i class="fas fa-shopping-cart" aria-hidden="true"></i> AÑADIR AL CARRITO
                    </button>
                    ` : `
                    <button type="button" class="btn btn-massive" disabled style="background: #ccc; color: #666; padding: 18px; font-size: 1.1rem; font-weight: 900; text-transform: uppercase; border: none; cursor: not-allowed; width: 100%;">
                        <i class="fas fa-times-circle" aria-hidden="true"></i> AGOTADO
                    </button>
                    `}
                </div>
                
                <!-- Shipping & Guarantees Section -->
                <div class="product-meta-footer" style="margin-top: 2rem; border-top: 4px solid var(--black); padding-top: 2rem;">
                    <div class="shipping-info-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 1.5rem;">
                        <div class="shipping-item" style="display: flex; gap: 10px; padding: 15px; background: #e3f2fd; border-radius: 4px;">
                            <i class="fas fa-stopwatch" style="font-size: 1.5rem; color: #2196f3;" aria-hidden="true"></i>
                            <div>
                                <strong style="text-transform: uppercase; font-weight: 900; color: var(--black); display: block;">¡LLEGA MAÑANA!</strong>
                                <p style="margin:5px 0 0 0; color: #666; font-size: 0.85rem;">Pide antes de las 5PM</p>
                            </div>
                        </div>
                        <div class="shipping-item" style="display: flex; gap: 10px; padding: 15px; background: #f3e5f5; border-radius: 4px;">
                            <i class="fas fa-truck" style="font-size: 1.5rem; color: #9c27b0;" aria-hidden="true"></i>
                            <div>
                                <strong style="text-transform: uppercase; font-weight: 900; color: var(--black); display: block;">ENVÍO GRATIS</strong>
                                <p style="margin:5px 0 0 0; color: #666; font-size: 0.85rem;">En compras S/150+</p>
                            </div>
                        </div>
                        <div class="shipping-item" style="display: flex; gap: 10px; padding: 15px; background: #e8f5e9; border-radius: 4px;">
                            <i class="fas fa-shield-alt" style="font-size: 1.5rem; color: #4caf50;" aria-hidden="true"></i>
                            <div>
                                <strong style="text-transform: uppercase; font-weight: 900; color: var(--black); display: block;">GARANTÍA</strong>
                                <p style="margin:5px 0 0 0; color: #666; font-size: 0.85rem;">100% Auténtico</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Payment Methods -->
                    <div class="payment-methods-display" style="padding: 15px; background: #f5f5f5; border-radius: 4px; margin-bottom: 1rem;">
                        <p style="margin: 0 0 10px 0; font-weight: 700; text-transform: uppercase; font-size: 0.85rem; color: #666;">Métodos de Pago:</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                            <span style="padding: 5px 10px; background: white; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">VISA</span>
                            <span style="padding: 5px 10px; background: white; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">MASTERCARD</span>
                            <span style="padding: 5px 10px; background: white; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">YAPE</span>
                            <span style="padding: 5px 10px; background: white; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">PLIN</span>
                            <span style="padding: 5px 10px; background: white; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">EFECTIVO</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        // Injected Logic
        if (!document.getElementById('sizeGuideModal')) {
            document.body.insertAdjacentHTML('beforeend', getModalHTML());
        }

        const grid = document.getElementById('sizeSelectorGrid');
        const sizes = ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12', '13'];
        if (grid) {
            grid.innerHTML = sizes.map(size => `
                <button class="size-option" onclick="selectSize('${size}', this)">${size}</button>
             `).join('');
        }

        if (window.productGallery) window.productGallery.render(galleryImages, product);
    }

    function renderErrorState(container, msg) {
        container.innerHTML = `
            <div style="text-align: center; padding: 100px;">
                <i class="fas fa-exclamation-triangle fa-3x" style="color: #e74c3c; margin-bottom: 20px;"></i>
                <h2>Producto no encontrado</h2>
                <p>${msg}</p>
                <a href="index.html" class="btn btn-black" style="margin-top:20px">VOLVER AL HOME</a>
            </div>
        `;
    }

    // --- MOCK DATABASE ---
    function getMockProduct(id) {
        const db = [
            { id: 101, name: 'NIKE DUNK LOW RETRO', price: 110, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', brand: 'Nike', description: 'Real. Leather. Icons. The Dunk Low.' },
            { id: 102, name: 'AIR FORCE 1 07', price: 100, image_url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d', brand: 'Nike' },
            { id: 103, name: 'AIR MAX 90', price: 130, image_url: 'https://images.unsplash.com/photo-1514989940723-e8875ea6ab7d', brand: 'Nike' },
            { id: 104, name: 'BLAZER MID 77', price: 105, image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3', brand: 'Nike' },
            { id: 201, name: 'AIR JORDAN 1 HIGH', price: 180, image_url: 'https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717', brand: 'Jordan' },
            { id: 202, name: 'JORDAN 4 RETRO', price: 210, image_url: 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6', brand: 'Jordan' },
            { id: 203, name: 'JORDAN 1 LOW', price: 140, image_url: 'https://images.unsplash.com/photo-1593081891731-fda0877988da', brand: 'Jordan' },
            { id: 204, name: 'JORDAN 3', price: 200, image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a', brand: 'Jordan' },
            { id: 301, name: 'YEEZY BOOST 350 V2', price: 230, image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5', brand: 'Yeezy' },
            { id: 302, name: 'YEEZY SLIDE', price: 70, image_url: 'https://images.unsplash.com/photo-1605812853380-34ad68a253f3', brand: 'Yeezy' },
            { id: 303, name: 'YEEZY 700', price: 300, image_url: 'https://images.unsplash.com/photo-1565883017726-d249f056dcb5', brand: 'Yeezy' },
            { id: 304, name: 'YEEZY FOAM RNR', price: 90, image_url: 'https://images.unsplash.com/photo-1617267571626-829db2d558d6', brand: 'Yeezy' },
            { id: 401, name: 'ADIDAS FORUM LOW', price: 100, image_url: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f', brand: 'Adidas' },
            { id: 402, name: 'ADIDAS SAMBA', price: 100, image_url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa', brand: 'Adidas' },
            { id: 403, name: 'ULTRABOOST', price: 180, image_url: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1', brand: 'Adidas' },
            { id: 404, name: 'GAZELLE', price: 95, image_url: 'https://images.unsplash.com/photo-1616124619460-c9fa42f7481f', brand: 'Adidas' }
        ];
        return db.find(p => p.id == id);
    }

    function getModalHTML() {
        return `
         <div id="sizeGuideModal" class="modal" style="display: none;">
             <div class="modal-content">
                 <span class="close-modal" onclick="closeSizeGuideModal()">&times;</span>
                 <h2>Guía de Tallas</h2>
                 <p>Standard US Sizing.</p>
             </div>
         </div>`;
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
