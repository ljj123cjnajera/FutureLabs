// Inicializar header dinámico y cargar producto
document.addEventListener('DOMContentLoaded', async function () {
    // Esperar a que componentes críticos estén disponibles
    let retries = 0;
    while ((!window.Components || !window.api) && retries < 30) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
    }

    // Inicializar header y footer
    if (window.Components) {
        const headerContainer = document.getElementById('mainHeader');
        if (headerContainer && !headerContainer.innerHTML.trim()) {
            try {
                headerContainer.innerHTML = window.Components.getHeader(true, true);
                if (window.Components.initHeader) window.Components.initHeader();
                if (window.Components.initSearch) window.Components.initSearch();
                if (window.Components.initCartCounter) window.Components.initCartCounter();
            } catch (e) {
                if (window.Logger) window.Logger.error('Error initializing header:', e);
            }
        }

        const footerContainer = document.getElementById('mainFooter');
        if (footerContainer && !footerContainer.innerHTML.trim()) {
            try {
                footerContainer.innerHTML = window.Components.getFooter();
            } catch (e) {
                if (window.Logger) window.Logger.error('Error initializing footer:', e);
            }
        }
    }

    // Obtener ID del producto de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    window.currentProductId = productId;

    // Inicializar selectedSize global
    window.selectedSize = null;
    // let selectedSize = null; // Variable removed to prioritize window.selectedSize

    // Cargar producto
    async function loadProduct() {
        const container = document.getElementById('productDetailContainer');
        if (!container) return;

        if (!productId) {
            if (window.LoadingStates) {
                window.LoadingStates.empty('productDetailContainer', {
                    title: 'Producto no encontrado',
                    message: 'El producto que buscas no existe',
                    icon: 'fas fa-exclamation-triangle',
                    actionLabel: 'Ver productos',
                    onAction: () => {
                        window.location.href = 'products.html';
                    }
                });
            } else {
                container.innerHTML = `
                    <div style="text-align: center; padding: 100px;">
                        <i class="fas fa-exclamation-triangle fa-3x" style="color: #e74c3c; margin-bottom: 20px;"></i>
                        <h2>Producto no encontrado</h2>
                        <p>El producto que buscas no existe</p>
                    </div>
                `;
            }
            return;
        }

        // Show loading state
        if (window.LoadingStates) {
            window.LoadingStates.show('productDetailContainer', {
                message: 'Cargando producto...',
                type: 'spinner'
            });
        }

        try {
            // Esperar a que API esté disponible
            if (!window.api) {
                let apiRetries = 0;
                while (!window.api && apiRetries < 30) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    apiRetries++;
                }
                if (!window.api) {
                    throw new Error('API no disponible. Por favor, recarga la página.');
                }
            }

            // 1. API Call
            const response = await window.api.getProduct(productId);
            let product = null;

            // 2. Parsed Response (Handle various API formats)
            // Fix: Prioritize deep checking for 'product' property to avoid setting product to a wrapper object
            if (response && response.data && response.data.product) {
                product = response.data.product;
            } else if (response && response.success && response.data) {
                product = response.data;
            } else if (response && response.id) {
                product = response;
            } else if (response && !response.success) {
                throw new Error(response.message || 'Producto no encontrado en la API');
            }

            // 3. Validate Data
            if (product) {
                window.currentProduct = product;

                // Hide loading state
                if (window.LoadingStates) {
                    window.LoadingStates.hide('productDetailContainer');
                }

                // Normalizar y validar imágenes usando utilidad compartida
                let galleryImages = [];

                // 1. Intentar normalizar product.images
                if (product.images) {
                    galleryImages = window.Utils?.normalizeImageUrls?.(product.images, '') || [];
                }

                // 2. Fallback a image_url si no hay imágenes válidas
                if (galleryImages.length === 0 && product.image_url) {
                    const imageUrl = window.Utils?.isValidImageUrl?.(product.image_url) ? product.image_url : '';
                    if (imageUrl) {
                        galleryImages = [imageUrl];
                    }
                }

                // 3. Fallback final a placeholder SVG (ya que placeholder.jpg no existe)
                if (galleryImages.length === 0) {
                    galleryImages = ["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3Ctext fill='%236b7280' font-family='system-ui, -apple-system, sans-serif' font-size='28' font-weight='900' x='50%25' y='45%25' text-anchor='middle'%3ESNEAKERS%3C/text%3E%3Ctext fill='%236b7280' font-family='system-ui, -apple-system, sans-serif' font-size='28' font-weight='900' x='50%25' y='60%25' text-anchor='middle'%3ESHOP%3C/text%3E%3C/svg%3E"];
                }

                renderProductDetails(product, container, galleryImages);
                return;
            } else {
                throw new Error('Producto no encontrado en la API');
            }

        } catch (error) {
            if (window.ErrorHandler) {
                window.ErrorHandler.api(error, 'loadProduct', 'No se pudo cargar el producto. Por favor, intenta de nuevo.');
            } else {
                if (window.Logger) window.Logger.error('❌ API Error in PDP:', error);
            }

            // Hide loading state
            if (window.LoadingStates) {
                window.LoadingStates.hide('productDetailContainer');
            }

            // Show error state
            if (window.LoadingStates) {
                window.LoadingStates.error('productDetailContainer', {
                    title: 'Error al cargar producto',
                    message: error.message || 'No se pudo cargar el producto. Por favor, intenta de nuevo.',
                    actionLabel: 'REINTENTAR',
                    onAction: () => {
                        loadProduct();
                    }
                });
            } else {
                container.innerHTML = `
                    <div style="text-align: center; padding: 100px;">
                        <i class="fas fa-exclamation-triangle fa-3x" style="color: #e74c3c; margin-bottom: 20px;"></i>
                        <h2>Error al cargar producto</h2>
                        <p>${error.message || 'No se pudo cargar el producto. Por favor, intenta de nuevo.'}</p>
                        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #000; color: #fff; border: none; cursor: pointer;">REINTENTAR</button>
                    </div>
                `;
            }
        }
    }

    // --- HELPER: RENDER UI ---
    function renderProductDetails(product, container, galleryImages) {
        // Update live viewers count (simulated for conversion)
        updateLiveViewers(product.id);

        // SEO ENGINE UPDATE
        if (window.SeoManager) {
            window.SeoManager.updateProductSEO({
                title: product.name,
                description: product.description || `Compra ${product.name} en Sneakers Shop.`,
                image: product.image_url,
                url: window.location.href,
                price: product.price,
                currency: 'PEN'
            });
        }

        // Parse size stock if available
        window.productSizeStock = {};
        if (product.size_stock && typeof product.size_stock === 'string') {
            try {
                window.productSizeStock = JSON.parse(product.size_stock);
            } catch (e) {
                // Ignore parse errors
            }
        } else if (product.size_stock && typeof product.size_stock === 'object') {
            window.productSizeStock = product.size_stock;
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
                    <div class="product-meta-header">
                        <p class="product-brand">${product.brand || 'MARCA'}</p>
                        <div class="product-rating-detail">
                            <span class="stars-detail">★★★★★</span>
                            <span class="rating-text-detail">(${product.rating_count || 12} reviews)</span>
                        </div>
                    </div>
                    <!-- Mini Trust -->
                    <div class="payment-trust-mini">
                        <span><i class="fas fa-mobile-alt" aria-hidden="true"></i> Yape/Plin</span>
                        <span><i class="fas fa-lock" aria-hidden="true"></i> Compra Segura</span>
                        <span><i class="fas fa-shipping-fast" aria-hidden="true"></i> Envío Inmediato</span>
                    </div>
                </div>
                
                <!-- Stock Urgency Badge -->
                ${product.stock_quantity !== undefined && product.stock_quantity > 0 && product.stock_quantity <= 5 ? `
                <div class="stock-urgency-banner">
                    <div>
                        <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
                        <div>
                            <strong>¡ÚLTIMAS UNIDADES!</strong>
                            <p>Solo quedan ${product.stock_quantity} pares disponibles</p>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <div class="product-description-detail">
                    ${product.description || 'La máxima expresión del estilo urbano. Diseñados para destacar y construidos para durar.'}
                </div>
                
                <!-- Key Features -->
                <div class="product-features-grid">
                    <div class="feature-item">
                        <i class="fas fa-check-circle" aria-hidden="true"></i>
                        <span>100% Auténtico</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-shipping-fast" aria-hidden="true"></i>
                        <span>Envío Gratis S/150+</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-undo" aria-hidden="true"></i>
                        <span>30 Días Devolución</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-shield-alt" aria-hidden="true"></i>
                        <span>Garantía Oficial</span>
                    </div>
                </div>
                
                <div class="size-selector-container">
                    <div class="size-selector-header">
                        <span class="size-label">SELECCIONA TU TALLA (US)</span>
                        <span class="size-guide-link" onclick="openSizeGuideModal()">
                            <i class="fas fa-ruler-combined"></i> GUÍA DE TALLAS
                        </span>
                    </div>
                    <div class="size-selector-grid size-grid" id="sizeSelectorGrid"></div>
                    <div class="validation-message" id="sizeValidationMsg">
                        <i class="fas fa-exclamation-circle"></i> SELECCIONA UNA TALLA PARA CONTINUAR
                    </div>
                </div>
                
                <div class="product-actions-detail">
                    <button class="btn-add-cart-detail" onclick="window.addToCart()" id="addToCartBtn">
                        <i class="fas fa-shopping-cart"></i> AGREGAR AL CARRITO
                    </button>
                    <button class="btn-buy-now-detail" onclick="window.buyNow()" id="buyNowBtn">
                        <i class="fas fa-bolt"></i> COMPRAR AHORA
                    </button>
                    <button class="btn-wishlist-detail" onclick="window.toggleWishlist()" id="wishlistBtn">
                        <i class="far fa-heart" id="wishlistIcon"></i>
                    </button>
                </div>
                
                <div class="product-price-detail">
                    ${product.discount_price && product.discount_price < product.price ? `
                        <div>
                            <span class="price-original">S/ ${parseFloat(product.price).toFixed(2)}</span>
                            <span class="price-discount">S/ ${parseFloat(product.discount_price).toFixed(2)}</span>
                            <span class="discount-badge">
                                ${Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
                            </span>
                        </div>
                    ` : `
                        <span class="price-current">S/ ${parseFloat(product.price || 0).toFixed(2)}</span>
                    `}
                </div>
            </div>
        </div>
        `;

        // Initialize gallery - Wait a bit for product-gallery.js to load
        setTimeout(() => {
            const galleryContainer = document.getElementById('productGallery');
            if (!galleryContainer || galleryImages.length === 0) return;

            // Try using existing productGallery instance
            if (window.productGallery && typeof window.productGallery.render === 'function') {
                window.productGallery.render(galleryImages, product);
            }
            // Try creating new ProductGallery instance
            else if (window.ProductGallery && typeof window.ProductGallery === 'function') {
                try {
                    window.productGallery = new window.ProductGallery('productGallery');
                    if (window.productGallery && typeof window.productGallery.render === 'function') {
                        window.productGallery.render(galleryImages, product);
                    }
                } catch (e) {
                    if (window.Logger) window.Logger.warn('Error initializing ProductGallery:', e);
                }
            }

            // Fallback: simple gallery HTML if ProductGallery not available
            if (!window.productGallery || typeof window.productGallery.render !== 'function') {
                if (window.Logger) window.Logger.warn('ProductGallery not available, using fallback');
                const svgPlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3Ctext fill='%236b7280' font-family='system-ui, -apple-system, sans-serif' font-size='28' font-weight='900' x='50%25' y='45%25' text-anchor='middle'%3ESNEAKERS%3C/text%3E%3Ctext fill='%236b7280' font-family='system-ui, -apple-system, sans-serif' font-size='28' font-weight='900' x='50%25' y='60%25' text-anchor='middle'%3ESHOP%3C/text%3E%3C/svg%3E";
                const validImages = galleryImages.filter(img => img && typeof img === 'string' && img.trim() !== '' && !img.includes('undefined') && !img.includes('null'));
                const displayImages = validImages.length > 0 ? validImages : [svgPlaceholder];
                const productName = product?.name || 'Producto';

                const fallbackHTML = displayImages.map((img, index) => `
                    <div class="gallery-image-wrapper">
                        <img src="${img}" 
                             alt="${productName} - Vista ${index + 1}" 
                             class="gallery-image" 
                             loading="${index === 0 ? 'eager' : 'lazy'}"
                             onerror="this.src='${svgPlaceholder}'">
                    </div>
                `).join('');
                if (galleryContainer) {
                    galleryContainer.innerHTML = fallbackHTML;
                }
            }
        }, 150);

        // Render size selector
        renderSizeSelector(product);

        // Update wishlist button state
        setTimeout(() => updateWishlistButton(), 500);

        // Add to recently viewed
        if (window.recentlyViewed) {
            window.recentlyViewed.add(product);
            // Render recently viewed after adding product
            setTimeout(() => {
                window.recentlyViewed.render('recentlyViewedGrid', { limit: 6, hideWhenEmpty: true });
            }, 200);
        }

        // Load related products after product loads
        if (window.relatedProducts) {
            setTimeout(() => {
                window.relatedProducts.loadRelatedProducts();
            }, 1000);
        }
    }

    // --- 4. GLOBAL HELPER FUNCTIONS (Refactored to Top Level) ---
    window.selectSize = selectSize;

    function selectSize(size) {
        // Update variables
        window.selectedSize = size;
        // selectedSize = size; // Remove local reference

        // Update UI logic - Force reflow and strict class adding
        const allBtns = document.querySelectorAll('.size-option');
        allBtns.forEach(btn => {
            // Remove from all
            btn.classList.remove('selected');
            btn.style.background = ''; // Clear inline styles if any
            btn.style.color = '';
            btn.style.borderColor = '';

            // Add to target
            if (btn.dataset.size === size) {
                btn.classList.add('selected');
                // Force inline styles as fallback "Nuclear" option
                btn.style.background = '#000000';
                btn.style.color = '#ffffff';
                btn.style.borderColor = '#000000';
            }
        });

        // Hide validation message
        const errorMsg = document.getElementById('sizeValidationMsg');
        if (errorMsg) errorMsg.classList.remove('visible');

        if (window.Logger) window.Logger.log('📏 Talla seleccionada (Global):', size);
    }

    function renderSizeSelector(product) {
        const grid = document.getElementById('sizeSelectorGrid');
        if (!grid) return;

        // Common US sizes for sneakers
        const sizes = ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13'];

        grid.innerHTML = sizes.map(size => {
            const stock = window.productSizeStock && window.productSizeStock[size] !== undefined
                ? window.productSizeStock[size]
                : (product.stock_quantity !== undefined ? product.stock_quantity : 10);
            const isAvailable = stock > 0;
            const isLowStock = stock > 0 && stock <= 3;

            return `
            <button 
                class="size-option ${!isAvailable ? 'out-of-stock' : ''} ${isLowStock ? 'low-stock' : ''}" 
                data-size="${size}"
                ${!isAvailable ? 'disabled' : ''}
                type="button"
                onclick="window.selectSize('${size}')"
            >
                ${size}
                ${isLowStock ? '<span class="stock-badge">¡Últimas!</span>' : ''}
            </button>
        `;
        }).join('');
    }

    // Agregar al carrito - Asegurar que esté disponible globalmente
    window.addToCart = async function () {
        if (window.Logger) window.Logger.log('🛒 addToCart llamado');

        const product = window.currentProduct;
        if (!product) {
            if (window.Logger) window.Logger.error('❌ Producto no disponible en window.currentProduct');
            if (window.notifications) {
                window.notifications.error('Error', 'Producto no disponible');
            }
            return;
        }

        if (window.Logger) window.Logger.log('✅ Producto encontrado:', product.id || product.product_id);

        const productId = product.id || product.product_id;
        if (!productId) {
            if (window.notifications) {
                window.notifications.error('Error', 'ID de producto no encontrado');
            }
            return;
        }

        // VALIDACIÓN DE STOCK GENERAL
        const stock = product.stock_quantity;
        if (stock !== undefined && stock === 0) {
            if (window.notifications) {
                window.notifications.warning('Producto Agotado', 'Este producto no está disponible en este momento.');
            }
            return;
        }

        // Obtener talla seleccionada (puede ser local o global)
        const currentSelectedSize = window.selectedSize || null;

        // VALIDACIÓN DE TALLA
        if (!currentSelectedSize) {
            const errorMsg = document.getElementById('sizeValidationMsg');
            const container = document.querySelector('.size-selector-container');

            if (errorMsg) errorMsg.classList.add('visible');
            if (container) {
                container.classList.remove('shake-animation');
                void container.offsetWidth; // trigger reflow
                container.classList.add('shake-animation');
            }
            if (window.notifications) {
                window.notifications.warning('Selecciona una Talla', 'Por favor, selecciona una talla antes de agregar al carrito.');
            }
            return;
        }

        // VALIDACIÓN DE STOCK POR TALLA
        if (window.productSizeStock && window.productSizeStock[currentSelectedSize] !== undefined) {
            const sizeStock = window.productSizeStock[currentSelectedSize];
            if (sizeStock === 0) {
                if (window.notifications) {
                    window.notifications.warning('Talla Agotada', `La talla US ${currentSelectedSize} no está disponible en este momento.`);
                }
                return;
            }
            if (sizeStock < 1) {
                if (window.notifications) {
                    window.notifications.warning('Stock Insuficiente', `Solo hay ${sizeStock} unidades disponibles en talla US ${currentSelectedSize}.`);
                }
                return;
            }
        }

        // UI Feedback - Loading State
        const btn = document.getElementById('addToCartBtn');
        const originalText = btn ? btn.innerHTML : '';
        if (btn) {
            btn.innerHTML = '<div class="loading-spinner-sm"></div> AGREGANDO...';
            btn.disabled = true;
            btn.style.opacity = '0.8';
        }

        try {
            // Esperar a que cartEngine esté disponible (con más tiempo)
            let retries = 0;
            const maxRetries = 50; // 5 segundos
            while (!window.cartEngine && !window.cartManager && retries < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 100));
                retries++;
            }

            // Usar cartManager como alias si cartEngine no está disponible
            let cart = window.cartEngine || window.cartManager;

            if (!cart) {
                // Intentar inicializar manualmente si no está disponible
                if (window.CartEngine) {
                    if (window.Logger) window.Logger.log('🔧 Inicializando CartEngine manualmente...');
                    window.cartEngine = new window.CartEngine();
                    window.cartManager = window.cartEngine;
                    // Esperar un poco más para que se inicialice
                    await new Promise(resolve => setTimeout(resolve, 500));
                    cart = window.cartEngine || window.cartManager;
                }

                if (!cart) {
                    throw new Error('CartEngine no disponible. Por favor, recarga la página.');
                }
            }

            if (window.Logger) window.Logger.log('✅ CartEngine disponible, agregando producto...', { productId, size: currentSelectedSize });

            // Agregar al carrito con size
            console.log("🚀 [DEBUG] Calling cart.add with:", { productId, qty: 1, size: currentSelectedSize });
            const success = await cart.add(productId, 1, { size: currentSelectedSize });
            console.log("🏁 [DEBUG] cart.add result:", success);

            if (success === true) {
                // Éxito - la notificación ya se muestra en cartEngine.add()
                // Opcional: Feedback visual adicional en el botón
                if (btn) {
                    btn.innerHTML = '<i class="fas fa-check"></i> ¡AGREGADO!';
                    btn.style.background = '#4CAF50';
                    btn.style.borderColor = '#4CAF50';
                    setTimeout(() => {
                        if (btn) {
                            btn.innerHTML = originalText || '<i class="fas fa-shopping-cart"></i> AGREGAR AL CARRITO';
                            btn.style.background = '';
                            btn.style.borderColor = '';
                            btn.disabled = false;
                            btn.style.opacity = '1';
                        }
                    }, 2000);
                }
                return;
            } else if (success === false) {
                // Error manejado en cartEngine.add()
                // Restaurar botón inmediatamente
            } else {
                // Caso inesperado
                if (window.notifications) {
                    window.notifications.warning('Error', 'No se pudo agregar el producto al carrito.');
                }
            }
        } catch (e) {
            if (window.Logger) window.Logger.error('Error adding to cart:', e);
            if (window.notifications) {
                const errorMsg = e.message || 'No se pudo agregar el producto. Por favor, intenta de nuevo.';
                window.notifications.error('Error', errorMsg);
            }
        } finally {
            // Restaurar botón si no fue éxito (el éxito tiene su propio timeout)
            if (btn && btn.disabled && btn.innerHTML.includes('AGREGANDO')) {
                btn.innerHTML = originalText || '<i class="fas fa-shopping-cart"></i> AGREGAR AL CARRITO';
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        }
    }

    window.buyNow = async function () {
        const product = window.currentProduct;
        if (!product) {
            if (window.notifications) {
                window.notifications.error('Error', 'Producto no disponible');
            }
            return;
        }

        const productId = product.id || product.product_id;
        if (!productId) {
            if (window.notifications) {
                window.notifications.error('Error', 'ID de producto no encontrado');
            }
            return;
        }

        // Obtener talla seleccionada (puede ser local o global)
        const currentSelectedSize = selectedSize || window.selectedSize || null;

        // VALIDACIÓN DE TALLA
        if (!currentSelectedSize) {
            const errorMsg = document.getElementById('sizeValidationMsg');
            const container = document.querySelector('.size-selector-container');

            if (errorMsg) errorMsg.classList.add('visible');
            if (container) {
                container.classList.remove('shake-animation');
                void container.offsetWidth; // trigger reflow
                container.classList.add('shake-animation');
            }
            if (window.notifications) {
                window.notifications.warning('Selecciona una Talla', 'Por favor, selecciona una talla antes de comprar.');
            }
            return;
        }

        // VALIDACIÓN DE STOCK POR TALLA
        if (window.productSizeStock && window.productSizeStock[currentSelectedSize] !== undefined) {
            const sizeStock = window.productSizeStock[currentSelectedSize];
            if (sizeStock === 0) {
                if (window.notifications) {
                    window.notifications.warning('Talla Agotada', `La talla US ${currentSelectedSize} no está disponible en este momento.`);
                }
                return;
            }
            if (sizeStock < 1) {
                if (window.notifications) {
                    window.notifications.warning('Stock Insuficiente', `Solo hay ${sizeStock} unidades disponibles en talla US ${currentSelectedSize}.`);
                }
                return;
            }
        }

        try {
            // Esperar a que cartEngine esté disponible
            let retries = 0;
            const maxRetries = 50;
            while (!window.cartEngine && !window.cartManager && retries < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 100));
                retries++;
            }

            // Usar cartManager como alias si cartEngine no está disponible
            let cart = window.cartEngine || window.cartManager;

            if (!cart) {
                if (window.CartEngine) {
                    if (window.Logger) window.Logger.log('🔧 Inicializando CartEngine manualmente para buyNow...');
                    window.cartEngine = new window.CartEngine();
                    window.cartManager = window.cartEngine;
                    await new Promise(resolve => setTimeout(resolve, 500));
                    cart = window.cartEngine || window.cartManager;
                }

                if (!cart) {
                    throw new Error('CartEngine no disponible. Por favor, recarga la página.');
                }
            }

            if (window.Logger) window.Logger.log('✅ CartEngine disponible para buyNow, agregando producto...');

            // Agregar al carrito
            const success = await cart.add(productId, 1, { size: currentSelectedSize });

            if (success !== false) {
                // Actualizar contador de carrito
                if (window.Components && window.Components.updateCartCount) {
                    window.Components.updateCartCount();
                }

                if (window.notifications) {
                    window.notifications.success('Redirigiendo al checkout...', 'El producto se agregó al carrito');
                }
                setTimeout(() => {
                    window.location.href = 'checkout.html';
                }, 1000);
            } else {
                if (window.notifications) {
                    window.notifications.warning('Error', 'No se pudo agregar el producto al carrito.');
                }
            }
        } catch (e) {
            if (window.Logger) window.Logger.error('Error in buyNow:', e);
            if (window.notifications) {
                const errorMsg = e.message || 'No se pudo agregar el producto. Por favor, intenta de nuevo.';
                window.notifications.error('Error', errorMsg);
            }
        }
    }

    function updateLiveViewers(productId) {
        // Simulated live viewers count
        const viewersEl = document.querySelector('.live-viewers-count');
        if (viewersEl) {
            const count = Math.floor(Math.random() * 20) + 5;
            viewersEl.textContent = `${count} personas viendo este producto`;
        }
    }

    function openSizeGuideModal() {
        if (window.notifications) {
            window.notifications.info('Guía de Tallas', 'Selecciona tu talla según tu medida en centímetros. Si tienes dudas, contáctanos.');
        }
    }

    window.openSizeGuideModal = openSizeGuideModal;

    // Wishlist toggle function
    window.toggleWishlist = async function () {
        const product = window.currentProduct;
        if (!product) {
            if (window.notifications) {
                window.notifications.error('Error', 'Producto no disponible');
            }
            return;
        }

        const productId = product.id || product.product_id;
        if (!productId) {
            if (window.notifications) {
                window.notifications.error('Error', 'ID de producto no encontrado');
            }
            return;
        }

        try {
            // Wait for wishlistManager if not available
            if (!window.wishlistManager) {
                let retries = 0;
                while (!window.wishlistManager && retries < 20) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    retries++;
                }
            }

            // Initialize wishlistManager if needed (works for both authenticated and guest users)
            if (window.wishlistManager && (!window.wishlistManager.lists || window.wishlistManager.lists.length === 0)) {
                try {
                    await window.wishlistManager.init();
                } catch (e) {
                    if (window.Logger) window.Logger.warn('Error initializing wishlist:', e);
                }
            }

            if (window.wishlistManager) {
                // Check state BEFORE toggle (sync, not async for localStorage)
                const wasInWishlist = window.wishlistManager.isInWishlist(productId);

                // Perform toggle
                const success = await window.wishlistManager.toggle(productId);

                if (success) {
                    // After toggle, the state is opposite of what it was before
                    const isNowInWishlist = !wasInWishlist;

                    // Update button icon based on NEW state
                    const icon = document.getElementById('wishlistIcon');
                    const btn = document.getElementById('wishlistBtn');
                    if (icon && btn) {
                        if (isNowInWishlist) {
                            // Now in wishlist - show filled heart
                            icon.className = 'fas fa-heart';
                            btn.classList.add('active');
                        } else {
                            // Now removed - show empty heart
                            icon.className = 'far fa-heart';
                            btn.classList.remove('active');
                        }
                    }

                    // Update wishlist count if available
                    if (window.wishlistManager.updateWishlistCount) {
                        window.wishlistManager.updateWishlistCount();
                    }

                    // Sync toggle buttons
                    if (window.wishlistManager.syncToggleButtons) {
                        window.wishlistManager.syncToggleButtons();
                    }
                } else {
                    // Toggle failed - revert button state
                    await updateWishlistButton();
                }
            } else {
                if (window.notifications) {
                    window.notifications.warning('Wishlist no disponible', 'Por favor, recarga la página.');
                }
            }
        } catch (e) {
            if (window.Logger) window.Logger.error('Error toggling wishlist:', e);
            if (window.notifications) {
                window.notifications.error('Error', 'No se pudo actualizar la wishlist.');
            }
        }
    };

    // Update wishlist button state when product loads
    async function updateWishlistButton() {
        const product = window.currentProduct;
        if (!product) return;

        const productId = product.id || product.product_id;
        if (!productId) return;

        // Wait for wishlistManager if not available
        if (!window.wishlistManager) {
            let retries = 0;
            while (!window.wishlistManager && retries < 20) {
                await new Promise(resolve => setTimeout(resolve, 100));
                retries++;
            }
        }

        // Initialize wishlistManager if needed
        if (window.wishlistManager && !window.wishlistManager.lists || window.wishlistManager.lists.length === 0) {
            try {
                await window.wishlistManager.init();
            } catch (e) {
                if (window.Logger) window.Logger.warn('Error initializing wishlist:', e);
            }
        }

        if (!window.wishlistManager) return;

        try {
            const isInWishlist = window.wishlistManager.isInWishlist(productId);
            const icon = document.getElementById('wishlistIcon');
            const btn = document.getElementById('wishlistBtn');

            if (icon && btn) {
                if (isInWishlist) {
                    icon.className = 'fas fa-heart';
                    btn.classList.add('active');
                } else {
                    icon.className = 'far fa-heart';
                    btn.classList.remove('active');
                }
            }
        } catch (e) {
            if (window.Logger) window.Logger.error('Error checking wishlist:', e);
        }
    }

    // Recently viewed functionality - initialize after product loads
    const clearRecentlyViewedBtn = document.getElementById('clearRecentlyViewedBtn');
    if (clearRecentlyViewedBtn) {
        clearRecentlyViewedBtn.addEventListener('click', () => {
            if (window.recentlyViewed) {
                window.recentlyViewed.clear();
                window.recentlyViewed.render('recentlyViewedGrid', { limit: 6, hideWhenEmpty: true });
            }
        });
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

    // Initialize reviews after product loads
    if (productId) {
        // Wait for reviewsManager if not available
        if (!window.reviewsManager) {
            let retries = 0;
            while (!window.reviewsManager && retries < 20) {
                await new Promise(resolve => setTimeout(resolve, 100));
                retries++;
            }
        }

        if (window.reviewsManager) {
            try {
                await window.reviewsManager.init(productId, {
                    statsContainerId: 'reviewsStats',
                    listContainerId: 'reviewsList',
                    formContainerId: 'reviewFormContainer',
                    filterContainerId: 'reviewsFilterButtons',
                    sortSelectId: 'reviewsSortSelect',
                    writeButtonId: 'writeReviewBtn'
                });
            } catch (e) {
                if (window.Logger) window.Logger.error('Error initializing reviews:', e);
            }
        }
    }
});
