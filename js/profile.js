/**
 * 👤 PROFILE ENGINE V4 (API Integration + Complete Functionality)
 * Focus: User Data Loading, Orders, Addresses, Wishlist, Loyalty Points
 */

// --- CONSTANTS ---
const LOYALTY_POINTS_TO_CURRENCY_RATE = 100; // 100 puntos = S/ 1.00

const LOYALTY_TIERS = [
    {
        id: 'bronze',
        name: 'Bronce',
        min: 0,
        multiplier: 1,
        gradient: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
        textColor: '#ffffff',
        chipBackground: '#8B4513',
        chipColor: '#ffffff',
        icon: 'fas fa-medal',
        benefits: [
            '1 punto por cada S/ 1.00 gastado',
            'Acceso a ofertas exclusivas',
            'Soporte prioritario'
        ]
    },
    {
        id: 'silver',
        name: 'Plata',
        min: 1000,
        multiplier: 1.5,
        gradient: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)',
        textColor: '#000000',
        chipBackground: '#C0C0C0',
        chipColor: '#000000',
        icon: 'fas fa-medal',
        benefits: [
            '1.5 puntos por cada S/ 1.00 gastado',
            'Ofertas exclusivas de nivel Plata',
            'Envío gratis en compras S/ 200+',
            'Soporte prioritario 24/7'
        ]
    },
    {
        id: 'gold',
        name: 'Oro',
        min: 5000,
        multiplier: 2,
        gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        textColor: '#000000',
        chipBackground: '#FFD700',
        chipColor: '#000000',
        icon: 'fas fa-trophy',
        benefits: [
            '2 puntos por cada S/ 1.00 gastado',
            'Ofertas exclusivas de nivel Oro',
            'Envío gratis en todas las compras',
            'Acceso anticipado a nuevos lanzamientos',
            'Soporte VIP 24/7'
        ]
    }
];

// --- CORE FUNCTIONS ---




async function loadOrders() {
    const container = document.getElementById('ordersList');
    if (!container) return;

    // Show loading state
    // Show loading state
    if (window.LoadingStates) {
        window.LoadingStates.show('ordersList', {
            message: 'Cargando pedidos...',
            type: 'skeleton'
        });
    }

    try {
        if (!window.api) {
            throw new Error('API no disponible');
        }

        const res = await window.api.getOrders();

        // Handle different response formats
        let orders = [];
        if (res && res.success && res.data) {
            orders = res.data.orders || res.data || [];
        } else if (Array.isArray(res)) {
            orders = res;
        } else if (res && res.data && Array.isArray(res.data)) {
            orders = res.data;
        }

        if (window.Logger) window.Logger.log('📦 Orders loaded:', orders);

        // Hide loading state
        if (window.LoadingStates) {
            window.LoadingStates.hide('ordersList');
        }

        setIdText('totalOrders', orders.length);

        const totalSpent = orders.reduce((acc, o) => acc + parseFloat(o.total || 0), 0);
        setIdText('totalSpent', `S/ ${totalSpent.toFixed(2)}`);

        if (orders.length === 0) {
            if (window.LoadingStates) {
                window.LoadingStates.empty('ordersList', {
                    title: 'No hay pedidos',
                    message: 'Asegura tu primer par para empezar a construir tu historial.',
                    icon: 'fas fa-box-open',
                    actionLabel: 'EMPEZAR A COMPRAR',
                    actionUrl: 'products.html'
                });
            } else {
                container.innerHTML = `
                    <div style="padding: 4rem 2rem; border: 2px dashed var(--black); text-align: center; background: var(--gray-100);">
                        <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem; color: var(--gray-400);"></i>
                        <h3 style="font-weight: 900; text-transform: uppercase;">NO HAY PEDIDOS</h3>
                        <p style="margin-bottom: 2rem;">Asegura tu primer par para empezar a construir tu historial.</p>
                        <a href="products.html" class="btn btn-primary">EMPEZAR A COMPRAR</a>
                    </div>`;
            }
            return;
        }

        container.innerHTML = orders.map(order => {
            const statusColors = {
                'pending': '#FFA500',
                'processing': '#0066CC',
                'shipped': '#0066CC',
                'delivered': '#28A745',
                'cancelled': '#DC3545'
            };
            const statusColor = statusColors[order.status?.toLowerCase()] || '#666';
            const total = parseFloat(order.total || order.total_amount || 0);

            // Payment Method Label
            const paymentMethods = {
                'stripe': 'Tarjeta (Stripe)',
                'card': 'Tarjeta',
                'paypal': 'PayPal',
                'yape': 'Yape',
                'plin': 'Plin',
                'cash': 'Efectivo',
                'bank_transfer': 'Transferencia Bancaria'
            };
            const paymentLabel = paymentMethods[order.payment_method] || order.payment_method || 'Desconocido';

            // Discounts Logic (if available in order object)
            // Note: Backend might not return full breakdown in list view, but if it does:
            const couponCode = order.coupon_code ? `<div style="font-size: 0.8rem; color: #28a745;"><i class="fas fa-tag"></i> Cupón: ${order.coupon_code}</div>` : '';
            const pointsUsed = order.loyalty_points_used ? `<div style="font-size: 0.8rem; color: #6f42c1;"><i class="fas fa-star"></i> Puntos canjeados: ${order.loyalty_points_used}</div>` : '';

            return `
                <div class="order-item" style="border: 3px solid var(--black); padding: 1.5rem; margin-bottom: 1rem; background: var(--white);">
                    <div class="order-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <div>
                            <span class="order-id" style="font-weight: 900; font-size: 1.2rem;">#${order.order_number || order.id}</span>
                            <div style="font-size: 0.85rem; color: #666; margin-top: 0.25rem;">${paymentLabel}</div>
                        </div>
                        <span class="order-status" style="padding: 0.5rem 1rem; background: ${statusColor}; color: white; font-weight: 700; text-transform: uppercase; font-size: 0.8rem;">${order.status || 'PENDIENTE'}</span>
                    </div>
                    
                    <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #eee;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                            <span><i class="fas fa-calendar"></i> ${new Date(order.created_at).toLocaleDateString('es-PE')}</span>
                            <span style="font-weight: 800; font-size: 1.1rem;">S/ ${total.toFixed(2)}</span>
                        </div>
                        ${couponCode}
                        ${pointsUsed}
                    </div>

                    <button class="btn-save" style="width: 100%; font-size: 0.9rem; padding: 0.75rem;" onclick="window.location.href='order-success.html?id=${order.id}'">
                        <i class="fas fa-receipt"></i> VER DETALLES COMPLETOS
                    </button>
                </div>
            `;
        }).join('');

    } catch (e) {
        if (window.ErrorHandler) {
            window.ErrorHandler.api(e, 'loadOrders', 'No se pudieron cargar los pedidos. Por favor, intenta de nuevo.');
        } else {
            if (window.Logger) window.Logger.error('Orders API Error:', e);
        }

        if (window.LoadingStates) {
            window.LoadingStates.error('ordersList', {
                title: 'Error al cargar pedidos',
                message: 'La conexión del sistema falló. Por favor, inténtalo de nuevo más tarde.',
                retryLabel: 'REINTENTAR',
                retryCallback: 'loadOrders()'
            });
        }
    }
}

async function loadWishlist() {
    const container = document.getElementById('wishlistGrid');
    if (!container) return;

    // Show loading state
    // Show loading state
    if (window.LoadingStates) {
        window.LoadingStates.show('wishlistGrid', {
            message: 'Cargando favoritos...',
            type: 'skeleton'
        });
    }

    // Real Wishlist Load
    try {
        let items = [];

        // Si está autenticado, cargar desde API
        if (window.authManager?.isAuthenticated() && window.api) {
            const res = await window.api.getWishlist();

            // Handle different response formats
            if (res && res.success && res.data) {
                if (Array.isArray(res.data)) {
                    items = res.data;
                } else if (res.data.items) {
                    items = res.data.items;
                } else if (res.data.lists && Array.isArray(res.data.lists)) {
                    // Flatten lists
                    items = res.data.lists.flatMap(list => list.items || []);
                }
            } else if (Array.isArray(res)) {
                items = res;
            }
        } else {
            // Si no está autenticado, cargar desde localStorage
            const localWishlist = JSON.parse(localStorage.getItem('brutalist_wishlist') || '[]');

            // Cargar información de productos desde localStorage o mostrar IDs
            if (localWishlist.length > 0) {
                // Intentar cargar productos desde API si está disponible
                if (window.api) {
                    try {
                        const products = await Promise.all(
                            localWishlist.map(id =>
                                window.api.getProduct(id).catch(() => null)
                            )
                        );
                        items = products
                            .filter(p => p && p.success && p.data)
                            .map(p => ({ product: p.data }));
                    } catch (e) {
                        // Si falla, usar IDs directamente
                        items = localWishlist.map(id => ({ product: { id, name: `Producto ${id}`, price: 0 } }));
                    }
                } else {
                    items = localWishlist.map(id => ({ product: { id, name: `Producto ${id}`, price: 0 } }));
                }
            }
        }

        // Hide loading state
        if (window.LoadingStates) {
            window.LoadingStates.hide('wishlistGrid');
        }

        if (items.length > 0) {
            container.innerHTML = items.map(item => {
                const product = item.product || item;
                const image = product.image_url || product.image || 'assets/images/products/placeholder.jpg';
                const name = product.name || 'Producto';
                const price = parseFloat(product.discount_price || product.price || 0);
                const productId = product.id || product.product_id;

                return `
                    <div class="stat-box" style="padding:0; border:3px solid var(--black); position:relative; background: var(--white); cursor: pointer;" onclick="window.location.href='product-detail.html?id=${productId}'">
                        <div style="height:200px; overflow:hidden; border-bottom:3px solid var(--black); background: var(--gray-100);">
                            <img src="${image}" 
                                 alt="${name}" 
                                 style="width:100%; height:100%; object-fit:cover;"
                                 loading="lazy"
                                 onerror="this.src='assets/images/products/placeholder.jpg'">
                        </div>
                        <div style="padding:1rem;">
                            <h4 style="font-weight:900; font-size:0.9rem; margin-bottom:0.5rem; text-transform: uppercase;">${name}</h4>
                            <span style="font-weight:800; font-size:1.1rem;">S/ ${price.toFixed(2)}</span>
                        </div>
                    </div>
                `;
            }).join('');
            return;
        }
    } catch (e) {
        if (window.Logger) window.Logger.warn("Wishlist load failed", e);
    }

    // Default Empty State
    if (!container.innerHTML) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 4rem 2rem; border: 2px dashed var(--black); text-align: center; background: var(--gray-100);">
                <i class="far fa-heart" style="font-size: 3rem; margin-bottom: 1rem; color: var(--gray-400);"></i>
                <h3 style="font-weight: 900; text-transform: uppercase;">TU LISTA DE DESEOS ESTÁ VACÍA</h3>
                <p style="margin-bottom: 2rem;">Guarda artículos aquí para seguir caídas de precio y reabastecimientos.</p>
                <a href="products.html" class="btn btn-primary">EXPLORAR CATÁLOGO</a>
            </div>
        `;
        return;
    }

    // End of loadWishlist
}

// --- UTILS ---

function setIdText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function setIdValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

// Global Tab Switcher (Backup if inline fails)
window.switchTab = function (tabId) {
    document.querySelectorAll('.account-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.account-nav-btn').forEach(el => el.classList.remove('active'));

    document.getElementById(tabId)?.classList.add('active');

    // Highlight button based on click (dirty but works for simple pages)
    // Ideally passed by 'this' in onclick
};

const currencyFormatter = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

const loyaltyState = {
    points: 0,
    tier: LOYALTY_TIERS[0]
};

function setupLoyaltyButtons() {
    const redeemBtn = document.getElementById('loyaltyRedeemButton');
    if (redeemBtn && !redeemBtn.dataset.listenerAttached) {
        redeemBtn.addEventListener('click', handleLoyaltyRedeem);
        redeemBtn.dataset.listenerAttached = 'true';
    }

    const learnMoreBtn = document.getElementById('loyaltyLearnMoreButton');
    if (learnMoreBtn && !learnMoreBtn.dataset.listenerAttached) {
        learnMoreBtn.addEventListener('click', handleLoyaltyLearnMore);
        learnMoreBtn.dataset.listenerAttached = 'true';
    }
}

function handleLoyaltyRedeem() {
    const equivalent = loyaltyState.points / LOYALTY_POINTS_TO_CURRENCY_RATE;
    if (loyaltyState.points < 100) {
        window.notifications?.info?.(`Necesitas al menos 100 puntos para canjear. Actualmente tienes ${loyaltyState.points.toLocaleString('es-PE')} puntos disponibles.`);
        return;
    }

    window.notifications?.success?.(`Podrás canjear hasta ${currencyFormatter.format(equivalent)} de descuento usando tus ${loyaltyState.points.toLocaleString('es-PE')} puntos en el proceso de checkout.`);
}

function handleLoyaltyLearnMore() {
    window.notifications?.info?.('Muy pronto activaremos una sección con todos los beneficios y reglas del programa. Por ahora, revisa este resumen en tu perfil.');
}

function getLoyaltyTier(points) {
    let currentTier = LOYALTY_TIERS[0];
    for (const tier of LOYALTY_TIERS) {
        if (points >= tier.min) {
            currentTier = tier;
        }
    }
    return currentTier;
}

function getNextTier(currentTier) {
    const index = LOYALTY_TIERS.findIndex(tier => tier.id === currentTier.id);
    if (index === -1 || index === LOYALTY_TIERS.length - 1) {
        return null;
    }
    return LOYALTY_TIERS[index + 1];
}

function updateLoyaltyUI(points) {
    loyaltyState.points = Math.max(0, Number(points || 0));
    const tier = getLoyaltyTier(loyaltyState.points);
    const nextTier = getNextTier(tier);
    loyaltyState.tier = tier;
    loyaltyState.nextTier = nextTier;

    const loyaltyCard = document.querySelector('.loyalty-points-card');
    if (loyaltyCard) {
        loyaltyCard.style.setProperty('--loyalty-gradient', tier.gradient);
        loyaltyCard.style.setProperty('--loyalty-text-color', tier.textColor || '#ffffff');
    }

    const tierChip = document.getElementById('loyaltyTierChip');
    if (tierChip) {
        tierChip.style.background = tier.chipBackground;
        tierChip.style.color = tier.chipColor;
        const icon = tierChip.querySelector('i');
        if (icon) {
            icon.className = tier.icon;
        }
        const tierName = document.getElementById('loyaltyTierName');
        if (tierName) {
            tierName.textContent = `Nivel ${tier.name}`;
        }
    }

    const pointsValueEl = document.getElementById('loyaltyPointsValue');
    if (pointsValueEl) {
        animateCounter(pointsValueEl, loyaltyState.points, {
            formatter: value => Math.round(value).toLocaleString('es-PE')
        });
    }

    const equivalentEl = document.getElementById('loyaltyPointsEquivalent');
    if (equivalentEl) {
        equivalentEl.textContent = currencyFormatter.format(loyaltyState.points / LOYALTY_POINTS_TO_CURRENCY_RATE);
    }

    const multiplierEl = document.getElementById('loyaltyPointsMultiplier');
    if (multiplierEl) {
        const multiplierText = tier.multiplier % 1 === 0 ? `${tier.multiplier}x` : `${tier.multiplier.toFixed(2)}x`;
        multiplierEl.textContent = multiplierText;
    }

    const benefitsList = document.getElementById('loyaltyBenefitsList');
    if (benefitsList) {
        benefitsList.innerHTML = tier.benefits.map(benefit => `
            <li><i class="fas fa-check-circle"></i> ${benefit}</li>
        `).join('');
    }

    const progressFill = document.getElementById('loyaltyProgressFill');
    const progressPercentEl = document.getElementById('loyaltyProgressPercent');
    const progressLabelEl = document.getElementById('loyaltyProgressLabel');
    const nextTierMessageEl = document.getElementById('loyaltyNextTierMessage');

    let progress = 1;
    let progressLabel = `¡Eres ${tier.name}! Disfruta de todos los beneficios.`;

    if (nextTier) {
        const range = nextTier.min - tier.min;
        progress = range > 0 ? (loyaltyState.points - tier.min) / range : 0;
        progress = Math.max(0, Math.min(progress, 1));
        const remaining = Math.max(nextTier.min - loyaltyState.points, 0);
        progressLabel = remaining === 0
            ? `¡Listo para subir a ${nextTier.name}!`
            : `Te faltan ${remaining} puntos para alcanzar el nivel ${nextTier.name}`;

        if (nextTierMessageEl) {
            nextTierMessageEl.textContent = remaining === 0
                ? `Una compra más te permitirá desbloquear el nivel ${nextTier.name}.`
                : `Suma ${remaining} puntos adicionales para desbloquear el nivel ${nextTier.name}.`;
        }
    } else if (nextTierMessageEl) {
        nextTierMessageEl.textContent = 'Has alcanzado el nivel máximo. Mantén tus compras para conservarlo.';
    }

    if (progressFill) {
        progressFill.style.width = `${(progress * 100).toFixed(0)}%`;
    }
    if (progressPercentEl) {
        progressPercentEl.textContent = `${Math.round(progress * 100)}%`;
    }
    if (progressLabelEl) {
        progressLabelEl.textContent = progressLabel;
    }
}

function animateCounter(element, endValue, options = {}) {
    const { duration = 800, formatter = value => Math.round(value).toLocaleString('es-PE') } = options;
    const startValue = Number(element?.dataset?.currentValue || 0);
    const targetValue = Number(endValue || 0);
    const startTime = performance.now();

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (targetValue - startValue) * easedProgress;
        element.textContent = formatter(currentValue);

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            element.textContent = formatter(targetValue);
            element.dataset.currentValue = targetValue;
        }
    }

    requestAnimationFrame(step);
}

// Esperar a que todo se cargue
document.addEventListener('DOMContentLoaded', async function () {

    // Inicializar header y footer
    const headerContainer = document.getElementById('mainHeader');
    const footerContainer = document.getElementById('mainFooter');

    // const footerContainer = document.getElementById('mainFooter'); // REMOVED DUPLICATE

    if (headerContainer && window.Components) {
        headerContainer.innerHTML = window.Components.getHeader(true, true);
        // initHeader() ya inicializa: CartDrawer, SearchOverlay, CartCounter
        window.Components.initHeader();
        // Solo initSearch() necesita llamarse explícitamente si no se llamó desde initHeader
        if (window.Components.initSearch && !window.searchInitialized) {
            window.Components.initSearch();
        }
    }

    if (footerContainer && window.Components) {
        footerContainer.innerHTML = window.Components.getFooter();
    }

    // Verificar si se está accediendo solo a favoritos (permitido para invitados)
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    const isWishlistOnly = tabParam === 'wishlist';

    // Esperar a que API esté lista
    const waitForAPI = async () => {
        let attempts = 0;
        while (!window.api && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        return !!window.api;
    };

    // Inicializar perfil
    waitForAPI().then(async (apiReady) => {
        if (!apiReady) {
            if (window.notifications) {
                window.notifications.error('Error', 'No se pudo conectar con el servidor. Por favor, recarga la página.');
            }
            return;
        }

        // Si solo se está accediendo a favoritos, permitir invitados
        if (isWishlistOnly) {
            // Inicializar solo favoritos para invitados
            const wishlistTab = document.getElementById('wishlist');
            if (wishlistTab) {
                // Ocultar otras secciones que requieren autenticación
                document.querySelectorAll('.account-section').forEach(section => {
                    if (section.id !== 'wishlist') {
                        section.style.display = 'none';
                    }
                });
                // Mostrar solo favoritos
                wishlistTab.classList.add('active');
                wishlistTab.style.display = 'block';
                // Cargar wishlist (funciona para invitados)
                await loadWishlist();
            }
            return;
        }

        // Para otras secciones, requerir autenticación
        const token = localStorage.getItem('auth_token');
        if (!token) {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
            return;
        }

        // Verificar autenticación con API
        try {
            const isAuth = window.authManager?.isAuthenticated?.() || false;
            if (!isAuth) {
                // Intentar verificar con API
                try {
                    await window.api.getCurrentUser();
                } catch (e) {
                    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
                    return;
                }
            }

            // Inicializar perfil completo
            await initializeProfile();
        } catch (error) {
            if (window.Logger) window.Logger.error('Error initializing profile:', error);
            if (window.ErrorHandler) {
                window.ErrorHandler.api(error, 'initializeProfile', 'No se pudo cargar el perfil. Por favor, intenta de nuevo.');
            }
        }
    });

    setupLoyaltyButtons();
    updateLoyaltyUI(0);

    // Inicializar tabs
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            // Obtener tabId del onclick o del texto del botón
            const onclick = this.getAttribute('onclick');
            let tabId = null;
            if (onclick) {
                const match = onclick.match(/switchTab\(['"]([^'"]+)['"]\)/);
                if (match) tabId = match[1];
            }
            if (tabId) {
                switchTab(tabId);
            }
        });

        // Navegación por teclado (Arrow keys)
        tab.addEventListener('keydown', function (e) {
            const tabs = Array.from(document.querySelectorAll('.profile-tab'));
            const currentIndex = tabs.indexOf(this);

            let targetIndex = currentIndex;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                targetIndex = (currentIndex + 1) % tabs.length;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            } else if (e.key === 'Home') {
                e.preventDefault();
                targetIndex = 0;
            } else if (e.key === 'End') {
                e.preventDefault();
                targetIndex = tabs.length - 1;
            }

            if (targetIndex !== currentIndex) {
                tabs[targetIndex].focus();
                const tabId = tabs[targetIndex].getAttribute('data-tab');
                switchTab(tabId);
            }
        });
    });
});

// Cambiar de tab
window.switchTab = function (tabId) {
    // Actualizar botones de navegación
    document.querySelectorAll('.account-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Encontrar el botón activo por su onclick
    document.querySelectorAll('.account-nav-btn').forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (onclick && onclick.includes(`switchTab('${tabId}')`)) {
            btn.classList.add('active');
        }
    });

    // Actualizar secciones (account-section en lugar de profile-section)
    document.querySelectorAll('.account-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    const activeSection = document.getElementById(tabId);
    if (activeSection) {
        activeSection.classList.add('active');
        activeSection.style.display = 'block';
    }

    // Cargar datos específicos de la sección
    if (tabId === 'addresses') {
        loadAddresses();
    } else if (tabId === 'loyalty' || tabId === 'points') {
        loadLoyaltyPoints();
        loadLoyaltyTransactions();
    } else if (tabId === 'wishlist') {
        loadWishlist();
    } else if (tabId === 'orders') {
        loadOrders();
    } else if (tabId === 'overview') {
        loadStats();
    }
}

// Inicializar perfil
async function initializeProfile() {
    if (window.Logger) window.Logger.log('🔵 Inicializando perfil...');

    // Cargar datos en paralelo pero con manejo de errores individual
    const promises = [
        loadUserData().catch(e => { if (window.Logger) window.Logger.error('Error loading user data:', e); }),
        loadStats().catch(e => { if (window.Logger) window.Logger.error('Error loading stats:', e); }),
        loadAddresses().catch(e => { if (window.Logger) window.Logger.error('Error loading addresses:', e); }),
        loadOrders().catch(e => { if (window.Logger) window.Logger.error('Error loading orders:', e); }),
        loadLoyaltyPoints().catch(e => { if (window.Logger) window.Logger.error('Error loading loyalty points:', e); })
    ];

    await Promise.allSettled(promises);
    if (window.Logger) window.Logger.log('✅ Perfil inicializado');
}

// Cargar datos del usuario
async function loadUserData() {
    const nameEl = document.getElementById('profileName');
    const emailEl = document.getElementById('profileEmail');

    if (nameEl) nameEl.textContent = 'Cargando...';
    if (emailEl) emailEl.textContent = '...';

    try {
        if (!window.api) {
            throw new Error('API no disponible');
        }

        const response = await window.api.getProfile();

        let user = null;

        // Handle different response formats
        if (response && response.success && response.data) {
            user = response.data.user || response.data;
        } else if (response && response.id) {
            user = response;
        } else if (response && response.data && response.data.id) {
            user = response.data;
        } else if (response && !response.success) {
            throw new Error(response.message || 'Error al cargar perfil');
        }

        if (user) {
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
            const displayName = fullName || user.name || user.email || 'Usuario';

            // Update sidebar
            if (nameEl) nameEl.textContent = displayName;
            if (emailEl) emailEl.textContent = user.email || '';

            // Update settings form if exists
            const firstNameInput = document.getElementById('firstName');
            const lastNameInput = document.getElementById('lastName');
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone');

            if (firstNameInput) firstNameInput.value = user.first_name || '';
            if (lastNameInput) lastNameInput.value = user.last_name || '';
            if (emailInput) emailInput.value = user.email || '';
            if (phoneInput) phoneInput.value = user.phone || '';
        } else {
            throw new Error('No se recibieron datos del usuario');
        }
    } catch (error) {
        if (window.Logger) window.Logger.error('Error loading user data:', error);
        if (window.ErrorHandler) {
            window.ErrorHandler.api(error, 'loadUserData', 'No se pudieron cargar los datos del perfil. Por favor, intenta de nuevo.');
        }
        if (nameEl) nameEl.textContent = 'Error';
        if (emailEl) emailEl.textContent = '';
    }
}

// Cargar estadísticas
async function loadStats() {
    try {
        // Cargar pedidos
        const ordersResponse = await window.api.getOrders();
        let orders = [];
        if (ordersResponse && ordersResponse.success && ordersResponse.data) {
            orders = ordersResponse.data.orders || ordersResponse.data || [];
        } else if (Array.isArray(ordersResponse)) {
            orders = ordersResponse;
        } else if (ordersResponse && ordersResponse.data && Array.isArray(ordersResponse.data)) {
            orders = ordersResponse.data;
        }

        const totalOrdersEl = document.getElementById('totalOrders');
        if (totalOrdersEl) {
            totalOrdersEl.textContent = orders.length;
        }

        const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
        const totalSpentEl = document.getElementById('totalSpent');
        if (totalSpentEl) {
            totalSpentEl.textContent = `S/ ${totalSpent.toFixed(2)}`;
        }

        // Cargar wishlist (opcional, si existe el elemento)
        try {
            const wishlistResponse = await window.api.getWishlist();
            let wishlistTotal = 0;

            if (wishlistResponse && wishlistResponse.success && wishlistResponse.data) {
                const lists = wishlistResponse.data.lists || wishlistResponse.data || [];
                wishlistTotal = lists.reduce((sum, list) => sum + (list.items?.length || 0), 0);
            } else if (Array.isArray(wishlistResponse)) {
                wishlistTotal = wishlistResponse.length;
            }

            const wishlistCountEl = document.getElementById('wishlistCount');
            if (wishlistCountEl) {
                wishlistCountEl.textContent = wishlistTotal;
            }
        } catch (e) {
            // Silent fail for wishlist
        }
    } catch (error) {
        if (window.Logger) window.Logger.error('Error loading stats:', error);
    }
}

// Cargar direcciones
async function loadAddresses() {
    const container = document.getElementById('addressList');
    if (!container) {
        if (window.Logger) window.Logger.warn('⚠️ addressList container not found');
        return;
    }

    // Show loading state
    if (window.LoadingStates) {
        window.LoadingStates.show('addressList', {
            message: 'Cargando direcciones...',
            type: 'spinner'
        });
    } else {
        container.innerHTML = '<div class="loading-brutalist">CARGANDO DIRECCIONES...</div>';
    }

    try {
        if (!window.api) {
            throw new Error('API no disponible');
        }

        const response = await window.api.getAddresses();

        // Hide loading state
        if (window.LoadingStates) {
            window.LoadingStates.hide('addressList');
        }

        let addresses = [];
        if (response && response.success) {
            addresses = response.data?.addresses || response.data || [];
        } else if (Array.isArray(response)) {
            addresses = response;
        } else if (response && response.data) {
            addresses = Array.isArray(response.data) ? response.data : response.data.addresses || [];
        }

        if (addresses.length === 0) {
            if (window.LoadingStates) {
                window.LoadingStates.empty('addressList', {
                    title: 'No hay direcciones guardadas',
                    message: 'Agrega una dirección para facilitar tus compras.',
                    icon: 'fas fa-map-marker-alt',
                    actionLabel: 'AGREGAR DIRECCIÓN',
                    actionCallback: 'toggleAddressForm()'
                });
            } else {
                container.innerHTML = `
                    <div style="grid-column: 1/-1; padding: 4rem 2rem; border: 2px dashed var(--black); text-align: center; background: var(--gray-100);">
                        <i class="fas fa-map-marker-alt" style="font-size: 3rem; margin-bottom: 1rem; color: var(--gray-400);"></i>
                        <h3 style="font-weight: 900; text-transform: uppercase; margin-bottom: 1rem;">NO HAY DIRECCIONES GUARDADAS</h3>
                        <p style="margin-bottom: 2rem;">Agrega una dirección para facilitar tus compras.</p>
                        <button class="btn btn-primary" onclick="toggleAddressForm()">
                            <i class="fas fa-plus"></i> AGREGAR DIRECCIÓN
                        </button>
                    </div>
                `;
            }
            return;
        }

        container.innerHTML = addresses.map(addr => {
            const street = addr.street || addr.street_address || '';
            const city = addr.city || '';
            const region = addr.region || '';
            const postal = addr.postal_code || '';
            const country = addr.country || 'Perú';
            const name = `${addr.first_name || ''} ${addr.last_name || ''}`.trim() || 'Dirección';
            const phone = addr.phone_number || addr.phone || '';

            return `
                <div class="address-card" style="border: 3px solid var(--black); padding: 1.5rem; position: relative; background: var(--white);">
                    ${addr.is_default ? '<span class="badge" style="position: absolute; top: 10px; right: 10px; background: var(--black); color: white; padding: 4px 8px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">PREDETERMINADA</span>' : ''}
                    <div style="font-weight: 900; margin-bottom: 0.5rem; text-transform: uppercase; font-size: 1.1rem;">${name}</div>
                    <div style="margin-bottom: 0.5rem;">${street}</div>
                    <div style="margin-bottom: 0.5rem;">${city}${region ? ', ' + region : ''}</div>
                    <div style="margin-bottom: 0.5rem;">${postal} ${country}</div>
                    ${phone ? `<div style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;"><i class="fas fa-phone"></i> ${phone}</div>` : ''}
                    
                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <button onclick="editAddress(${addr.id})" style="flex: 1; padding: 0.5rem; background: var(--white); border: 2px solid var(--black); font-weight: 700; cursor: pointer; text-transform: uppercase; font-size: 0.8rem;">
                            <i class="fas fa-edit"></i> EDITAR
                        </button>
                        <button onclick="deleteAddress(${addr.id})" style="flex: 1; padding: 0.5rem; background: var(--white); border: 2px solid #dc3545; color: #dc3545; font-weight: 700; cursor: pointer; text-transform: uppercase; font-size: 0.8rem;">
                            <i class="fas fa-trash"></i> ELIMINAR
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        if (window.ErrorHandler) {
            window.ErrorHandler.api(error, 'loadAddresses', 'No se pudieron cargar las direcciones. Por favor, intenta de nuevo.');
        } else {
            if (window.Logger) window.Logger.error('Addresses API Error:', error);
        }

        if (window.LoadingStates) {
            window.LoadingStates.error('addressList', {
                title: 'Error al cargar direcciones',
                message: 'No se pudieron cargar las direcciones. Verifica tu conexión.',
                retryLabel: 'REINTENTAR',
                retryCallback: 'loadAddresses()'
            });
        } else {
            container.innerHTML = `
                <div style="grid-column: 1/-1; padding: 2rem; border: 2px dashed #dc3545; text-align: center; color: #dc3545;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <h3>ERROR AL CARGAR DIRECCIONES</h3>
                    <p>No se pudieron cargar las direcciones. Verifica tu conexión.</p>
                    <button onclick="loadAddresses()" class="btn btn-outline" style="margin-top: 1rem; border-color: #dc3545; color: #dc3545;">REINTENTAR</button>
                </div>
            `;
        }
    }
}

// Cargar puntos de lealtad
async function loadLoyaltyPoints() {
    try {
        const response = await window.api.getLoyaltyPoints();
        if (response.success && response.data.points !== undefined) {
            const points = Number(response.data.points || 0);
            updateLoyaltyUI(points);

            // Actualizar también en la sección de loyalty
            const balanceEl = document.getElementById('loyaltyBalance');
            if (balanceEl) {
                balanceEl.textContent = `${points.toLocaleString('es-PE')} PTS`;
            }

            // Calcular puntos ganados en total (suma de transacciones positivas)
            const transactionsResponse = await window.api.getLoyaltyTransactions(100);
            if (transactionsResponse.success && transactionsResponse.data.transactions) {
                const lifetimeEarned = transactionsResponse.data.transactions
                    .filter(t => t.points_change > 0)
                    .reduce((sum, t) => sum + t.points_change, 0);

                const lifetimeEl = document.getElementById('loyaltyLifetime');
                if (lifetimeEl) {
                    lifetimeEl.textContent = `${lifetimeEarned.toLocaleString('es-PE')} PTS`;
                }
            }
        }
    } catch (error) {
        if (window.Logger) window.Logger.error('Error loading loyalty points:', error);
    }
}

// Cargar transacciones de lealtad
async function loadLoyaltyTransactions() {
    const container = document.getElementById('loyaltyHistory');
    if (!container) {
        // Fallback al ID alternativo
        const altContainer = document.getElementById('loyaltyTransactions');
        if (altContainer) {
            return loadLoyaltyTransactionsInContainer(altContainer);
        }
        return;
    }
    return loadLoyaltyTransactionsInContainer(container);
}

async function loadLoyaltyTransactionsInContainer(container) {
    if (!container) {
        if (window.Logger) window.Logger.warn('⚠️ Loyalty history container not found');
        return;
    }

    // Show loading state
    container.innerHTML = '<div class="loading-brutalist">CARGANDO TRANSACCIONES...</div>';

    try {
        if (!window.api) {
            throw new Error('API no disponible');
        }

        const response = await window.api.getLoyaltyTransactions();

        if (response.success && response.data.transactions) {
            const transactions = response.data.transactions;

            if (transactions.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-star"></i>
                        <h3>No hay transacciones de puntos</h3>
                        <p>Comienza a comprar para ganar puntos</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = transactions.map(trans => `
                <div class="loyalty-transaction" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--gray-200);">
                    <div>
                        <div style="font-weight: 600; margin-bottom: 0.25rem;">${trans.description || trans.type === 'earned' ? 'Puntos ganados' : 'Canje de puntos'}</div>
                        <div style="font-size: 0.875rem; color: var(--gray-500);">
                            ${new Date(trans.created_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                    <div style="font-weight: 800; font-size: 1.1rem; color: ${trans.points_change > 0 ? 'var(--success)' : 'var(--error)'};">
                        ${trans.points_change > 0 ? '+' : ''}${trans.points_change}
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: #dc3545;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${response.message || 'Error al cargar transacciones'}</p>
                    <button onclick="loadLoyaltyTransactions()" class="btn btn-outline" style="margin-top: 1rem;">REINTENTAR</button>
                </div>
            `;
        }
    } catch (error) {
        if (window.Logger) window.Logger.error('Error loading loyalty transactions:', error);
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: #dc3545;">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar transacciones. Por favor, intenta de nuevo.</p>
                <button onclick="loadLoyaltyTransactions()" class="btn btn-outline" style="margin-top: 1rem;">REINTENTAR</button>
            </div>
        `;
    }
}

// Guardar datos personales (si el formulario existe)
// Esperar a que el DOM esté listo
let personalDataForm = null;
let profileForm = null;

document.addEventListener('DOMContentLoaded', () => {
    personalDataForm = document.getElementById('personalDataForm');
    profileForm = document.getElementById('profileForm');

    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
});

async function handleProfileUpdate(e) {
    e.preventDefault();

    const data = {
        first_name: document.getElementById('firstName')?.value || '',
        last_name: document.getElementById('lastName')?.value || '',
        email: document.getElementById('email')?.value || '',
        phone: document.getElementById('phone')?.value || ''
    };

    try {
        const response = await window.api?.updateProfile(data);

        if (response && response.success) {
            if (window.notifications) {
                window.notifications.success('Perfil Actualizado', 'Tu perfil se actualizó correctamente');
            }
            await loadUserData();
        } else {
            if (window.notifications) {
                window.notifications.error('Error', response?.message || 'Error al actualizar perfil');
            }
        }
    } catch (error) {
        if (window.Logger) window.Logger.error('Error updating profile:', error);
        if (window.notifications) {
            window.notifications.error('Error', 'No se pudo actualizar el perfil. Por favor, intenta de nuevo.');
        }
    }
}

if (personalDataForm) {
    personalDataForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const data = {
            first_name: document.getElementById('firstName')?.value || '',
            last_name: document.getElementById('lastName')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || ''
        };

        try {
            const response = await window.api.updateProfile(data);

            if (response && response.success) {
                if (window.notifications) {
                    window.notifications.success('Perfil Actualizado', 'Tu perfil se actualizó correctamente');
                }
                await loadUserData();
            } else {
                if (window.notifications) {
                    window.notifications.error('Error', response?.message || 'Error al actualizar perfil');
                }
            }
        } catch (error) {
            if (window.Logger) window.Logger.error('Error updating profile:', error);
            if (window.notifications) {
                window.notifications.error('Error', 'No se pudo actualizar el perfil. Por favor, intenta de nuevo.');
            }
        }
    });
}

// Cambiar contraseña (si el formulario existe)
const changePasswordForm = document.getElementById('changePasswordForm');
if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword')?.value;
        const newPassword = document.getElementById('newPassword')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;

        if (newPassword !== confirmPassword) {
            if (window.notifications) {
                window.notifications.error('Error', 'Las contraseñas no coinciden');
            }
            return;
        }

        try {
            const response = await window.api.changePassword({
                current_password: currentPassword,
                new_password: newPassword
            });

            if (response && response.success) {
                if (window.notifications) {
                    window.notifications.success('Contraseña Cambiada', 'Tu contraseña se cambió correctamente');
                }
                changePasswordForm.reset();
            } else {
                if (window.notifications) {
                    window.notifications.error('Error', response?.message || 'Error al cambiar contraseña');
                }
            }
        } catch (error) {
            if (window.Logger) window.Logger.error('Error changing password:', error);
            if (window.notifications) {
                window.notifications.error('Error', 'No se pudo cambiar la contraseña. Por favor, intenta de nuevo.');
            }
        }
    });
}

// Gestión de direcciones
async function openAddressModal(addressId = null) {
    const modal = document.getElementById('addressModal');
    const form = document.getElementById('addressForm');
    const title = document.getElementById('addressModalTitle');

    if (addressId) {
        title.textContent = 'Editar Dirección';
        // Datos cargados asíncronamente por editAddress()
    } else {
        title.textContent = 'Nueva Dirección';
        form.reset();
    }

    modal.classList.add('active');
}

function closeAddressModal() {
    const modal = document.getElementById('addressModal');
    modal.classList.remove('active');
    document.getElementById('addressForm').reset();
}

document.getElementById('addressForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const data = {
        type: document.getElementById('addressType').value,
        street: document.getElementById('addressStreet').value,
        city: document.getElementById('addressCity').value,
        region: document.getElementById('addressRegion').value,
        postal_code: document.getElementById('addressPostalCode').value,
        country: document.getElementById('addressCountry').value,
        is_default: document.getElementById('addressIsDefault').checked
    };

    const addressId = document.getElementById('addressId').value;

    try {
        let response;
        if (addressId) {
            response = await window.api.updateAddress(addressId, data);
        } else {
            response = await window.api.createAddress(data);
        }

        if (response.success) {
            window.notifications.success(addressId ? 'Dirección actualizada' : 'Dirección creada');
            closeAddressModal();
            await loadAddresses();
        } else {
            window.notifications.error(response.message || 'Error al guardar dirección');
        }
    } catch (error) {
        window.notifications.error('Error al guardar dirección');
    }
});

async function editAddress(addressId) {
    openAddressModal(addressId);
    // Cargar datos de la dirección
    try {
        const response = await window.api.getAddress(addressId);
        if (response.success && response.data) {
            const addr = response.data;
            document.getElementById('addressId').value = addr.id;
            document.getElementById('addressType').value = addr.type;
            document.getElementById('addressStreet').value = addr.street;
            document.getElementById('addressCity').value = addr.city;
            document.getElementById('addressRegion').value = addr.region || '';
            document.getElementById('addressPostalCode').value = addr.postal_code || '';
            document.getElementById('addressCountry').value = addr.country || 'Perú';
            document.getElementById('addressIsDefault').checked = addr.is_default;
        } else {
            if (window.Logger) window.Logger.error('Error fetching address:', response.message);
            window.notifications.error('No se pudo cargar la dirección.');
        }
    } catch (error) {
        if (window.Logger) window.Logger.error('Error loading address details:', error);
        window.notifications.error('Error de conexión al cargar dirección.');
    }
}

async function deleteAddress(addressId) {
    if (!confirm('¿Estás seguro de eliminar esta dirección?')) return;

    try {
        const response = await window.api.deleteAddress(addressId);

        if (response.success) {
            window.notifications.success('Dirección eliminada');
            await loadAddresses();
        } else {
            window.notifications.error('Error al eliminar dirección');
        }
    } catch (error) {
        window.notifications.error('Error al eliminar dirección');
    }
}

function cancelEdit(section) {
    // Recargar datos para descartar cambios
    if (section === 'personal') {
        loadUserData();
    }
}

// Cerrar modal al hacer click fuera
document.getElementById('addressModal')?.addEventListener('click', function (e) {
    if (e.target === this) {
        closeAddressModal();
    }
});

// Logout Button
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', async function () {
        // Usar notificación en lugar de confirm nativo
        const confirmed = await new Promise((resolve) => {
            if (window.notifications) {
                // Crear modal de confirmación personalizado
                const modal = document.createElement('div');
                modal.className = 'confirmation-modal';
                modal.innerHTML = `
                    <div class="confirmation-content">
                        <h3>¿Cerrar sesión?</h3>
                        <p>¿Estás seguro de que quieres cerrar sesión?</p>
                        <div class="confirmation-buttons">
                            <button class="btn btn-black" onclick="this.closest('.confirmation-modal').dataset.result='true'; this.closest('.confirmation-modal').remove(); resolve(true);">SÍ</button>
                            <button class="btn btn-outline" onclick="this.closest('.confirmation-modal').remove(); resolve(false);">NO</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                modal.dataset.result = 'false';
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.remove();
                        resolve(false);
                    }
                });
            } else {
                // Fallback a confirm nativo si no hay sistema de notificaciones
                resolve(confirm('¿Estás seguro de que quieres cerrar sesión?'));
            }
        });

        if (confirmed) {
            try {
                if (window.Logger) window.Logger.log('🔴 [PROFILE] Cerrando sesión...');

                // Llamar a logout de authManager
                if (window.authManager) {
                    await window.authManager.logout();
                }

                // Limpiar cualquier dato local adicional
                localStorage.removeItem('token');
                sessionStorage.clear();

                // Mostrar notificación
                if (window.notifications) {
                    window.notifications.success('Sesión cerrada exitosamente');
                }

                // Esperar un momento para que se vea la notificación
                setTimeout(() => {
                    // Redirigir a la página principal
                    window.location.href = 'index.html';
                }, 500);

            } catch (error) {
                if (window.Logger) window.Logger.error('Error al cerrar sesión:', error);
                if (window.notifications) {
                    window.notifications.error('Error al cerrar sesión');
                }
                // Redirigir de todas formas
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
            }
        }
    });
}

window.scrollToSection = function (sectionId) {
    const target = document.querySelector(`[data-profile-section='${sectionId}']`) || document.getElementById(sectionId);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// --- ADDRESS MANAGER (Consolidated) ---
// loadAddresses() is already defined above, this duplicate is removed

window.toggleAddressForm = function () {
    const el = document.getElementById('addressFormContainer');
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

window.handleSaveAddress = async function (e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'GUARDANDO...';
    btn.disabled = true;

    try {
        const formData = new FormData(e.target);
        const data = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            street_address: formData.get('street_address'),
            city: formData.get('city'),
            postal_code: formData.get('postal_code'),
            country: formData.get('country') || 'Perú',
            phone_number: formData.get('phone_number')
        };

        const response = await window.api.createAddress(data);

        if (response && response.success) {
            if (window.notifications) {
                window.notifications.success('Dirección Guardada', 'La dirección fue agregada correctamente');
            }
            e.target.reset();
            toggleAddressForm();
            await loadAddresses();
        } else {
            throw new Error(response?.message || 'Error al guardar dirección');
        }
    } catch (err) {
        if (window.Logger) window.Logger.error('Error saving address:', err);
        if (window.notifications) {
            window.notifications.error('Error', err.message || 'No se pudo guardar la dirección');
        }
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
};

window.deleteAddress = async function (id) {
    if (!confirm('¿Estás seguro de eliminar esta dirección?')) return;

    try {
        const response = await window.api.deleteAddress(id);
        if (response && response.success) {
            if (window.notifications) {
                window.notifications.success('Dirección Eliminada', 'La dirección fue eliminada correctamente');
            }
            await loadAddresses();
        } else {
            if (window.notifications) {
                window.notifications.error('Error', 'No se pudo eliminar la dirección');
            }
        }
    } catch (e) {
        if (window.Logger) window.Logger.error('Error deleting address:', e);
        if (window.notifications) {
            window.notifications.error('Error', 'No se pudo eliminar la dirección. Por favor, intenta de nuevo.');
        }
    }
};
