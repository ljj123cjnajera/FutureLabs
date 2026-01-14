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
        if (!container) return;

        if (!productId) {
            if (window.LoadingStates) {
                window.LoadingStates.empty('productDetailContainer', {
                    title: 'Producto no encontrado',
                    message: 'El producto que buscas no existe',
                    icon: 'fas fa-exclamation-triangle',
                    actionLabel: 'Ver productos',
                    actionUrl: 'products.html'
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
            if (!window.api) {
                throw new Error('API no disponible');
            }

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
            } else if (response && !response.success) {
                throw new Error(response.message || 'Producto no encontrado');
            }

            // 3. Validate Data
            if (product) {
                window.currentProduct = product;

                // Hide loading state
                if (window.LoadingStates) {
                    window.LoadingStates.hide('productDetailContainer');
                }

                // Normalizar imágenes
                let galleryImages = [];
                if (Array.isArray(product.images) && product.images.length > 0) {
                    galleryImages = product.images.filter(img => img && img.trim() !== '');
                } else if (typeof product.images === 'string') {
                    // Si images es un string JSON, parsearlo
                    try {
                        const parsed = JSON.parse(product.images);
                        if (Array.isArray(parsed)) {
                            galleryImages = parsed.filter(img => img && img.trim() !== '');
                        }
                    } catch (e) {
                        // Si no es JSON válido, usar image_url
                    }
                }
                
                // Si no hay imágenes en el array, usar image_url
                if (galleryImages.length === 0 && product.image_url) {
                    galleryImages = [product.image_url];
                }
                
                // Si aún no hay imágenes, usar placeholder
                if (galleryImages.length === 0) {
                    galleryImages = ['assets/images/products/placeholder.jpg'];
                }
                
                // Asegurar que haya al menos 4 imágenes para la galería (duplicar si es necesario)
                while (galleryImages.length < 4 && galleryImages.length > 0) {
                    galleryImages.push(galleryImages[0]);
                }

                renderProductDetails(product, container, galleryImages);
                // Render size options after product details are rendered
                await renderSizeOptions(product);
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
                    retryLabel: 'REINTENTAR',
                    retryCallback: 'location.reload()'
                });
            } else {
                renderErrorState(container, `Error al cargar producto: ${error.message || 'Error de conexión'}`);
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

        // Update live viewers count (simulated for conversion)
        updateLiveViewers(product.id);
        
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

    // --- LIVE VIEWERS SIMULATION (Conversion Optimization) ---
    function updateLiveViewers(productId) {
        const viewerElement = document.getElementById('viewerCount');
        if (!viewerElement) return;
        
        // Simulate realistic viewer count (8-25 people)
        const baseCount = 12;
        const variation = Math.floor(Math.random() * 17) + 1;
        const viewerCount = baseCount + variation;
        
        viewerElement.textContent = viewerCount;
        
        // Update every 15-30 seconds to simulate real activity
        setInterval(() => {
            const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
            const newCount = Math.max(8, Math.min(30, viewerCount + change));
            viewerElement.textContent = newCount;
        }, 20000 + Math.random() * 10000);
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

    async function renderSizeOptions(product) {
        const grid = document.getElementById('sizeSelectorGrid');
        if (!grid) return;

        // Try to get sizes from API (product.variants or product.sizes)
        let availableSizes = [];
        let sizeStockMap = {};
        
        if (product.variants && Array.isArray(product.variants)) {
            // If product has variants with sizes
            availableSizes = product.variants
                .filter(v => v.size && v.stock_quantity > 0)
                .map(v => ({ size: v.size, stock: v.stock_quantity }));
            sizeStockMap = product.variants.reduce((acc, v) => {
                if (v.size) acc[v.size] = v.stock_quantity || 0;
                return acc;
            }, {});
        } else if (product.sizes && Array.isArray(product.sizes)) {
            // If product has sizes array
            availableSizes = product.sizes
                .filter(s => s.stock_quantity > 0)
                .map(s => ({ size: s.size || s.name, stock: s.stock_quantity }));
            sizeStockMap = product.sizes.reduce((acc, s) => {
                const sizeName = s.size || s.name;
                if (sizeName) acc[sizeName] = s.stock_quantity || 0;
                return acc;
            }, {});
        } else if (product.stock_by_size && typeof product.stock_by_size === 'object') {
            // If product has stock_by_size object
            sizeStockMap = product.stock_by_size;
            availableSizes = Object.keys(sizeStockMap)
                .filter(size => sizeStockMap[size] > 0)
                .map(size => ({ size, stock: sizeStockMap[size] }));
        }

        // Fallback to standard sizes if no API data
        const standardSizes = ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12', '13'];
        const sizesToRender = availableSizes.length > 0 
            ? availableSizes.map(s => s.size)
            : standardSizes;

        // Check if product has stock at all
        const hasStock = product.stock_quantity > 0 || availableSizes.length > 0;

        grid.innerHTML = sizesToRender.map(size => {
            const stockForSize = sizeStockMap[size] !== undefined ? sizeStockMap[size] : 
                               (product.stock_quantity !== undefined ? product.stock_quantity : null);
            const isAvailable = stockForSize !== null ? stockForSize > 0 : hasStock;
            const isLowStock = stockForSize !== null && stockForSize > 0 && stockForSize <= 3;
            
            return `
                <button class="size-option ${!isAvailable ? 'disabled' : ''} ${isLowStock ? 'low-stock' : ''}"
                        onclick="selectSize('${size}', this)" 
                        ${!isAvailable ? 'disabled' : ''}
                        data-stock="${stockForSize !== null ? stockForSize : ''}"
                        title="${stockForSize !== null ? `${stockForSize} disponibles` : ''}">
                    ${size}
                    ${isLowStock && isAvailable ? '<span class="low-stock-indicator">!</span>' : ''}
                </button>
            `;
        }).join('');

        // Store size stock map globally for validation
        window.productSizeStock = sizeStockMap;
    }

    window.selectSize = function (size, element) {
        if (element.disabled) return;

        // Remove active class from all
        document.querySelectorAll('.size-option').forEach(el => el.classList.remove('selected'));

        // Add to clicked
        element.classList.add('selected');
        selectedSize = size;
        window.selectedSize = size; // También guardar globalmente

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

        // VALIDACIÓN DE STOCK GENERAL
        const stock = product.stock_quantity;
        if (stock !== undefined && stock === 0) {
            if (window.notifications) {
                window.notifications.warning('Producto Agotado', 'Este producto no está disponible en este momento.');
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

        try {
            // Esperar a que cartEngine esté disponible
            let retries = 0;
            while (!window.cartEngine && retries < 20) {
                await new Promise(resolve => setTimeout(resolve, 100));
                retries++;
            }

            if (!window.cartEngine) {
                throw new Error('CartEngine no disponible. Por favor, recarga la página.');
            }

            // Agregar al carrito
            const success = await window.cartEngine.add(productId, 1, { size: currentSelectedSize });
            
            if (success !== false) {
                // Actualizar contador de carrito
                if (window.Components && window.Components.updateCartCount) {
                    window.Components.updateCartCount();
                }
                
                if (window.notifications) {
                    window.notifications.success('Agregado al Carrito', `Talla US ${currentSelectedSize} agregada correctamente`);
                }
            } else {
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
        }
    }

    // Comprar ahora
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

        // VALIDACIÓN DE STOCK GENERAL
        const stock = product.stock_quantity;
        if (stock !== undefined && stock === 0) {
            if (window.notifications) {
                window.notifications.warning('Producto Agotado', 'Este producto no está disponible en este momento.');
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
            while (!window.cartEngine && retries < 20) {
                await new Promise(resolve => setTimeout(resolve, 100));
                retries++;
            }

            if (!window.cartEngine) {
                throw new Error('CartEngine no disponible. Por favor, recarga la página.');
            }

            // Agregar al carrito
            const success = await window.cartEngine.add(productId, 1, { size: currentSelectedSize });
            
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
