// PROFILE ENGINE V3 (Brutalist)
console.log('⚫ [PROFILE] Brutalist Engine Loaded');

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Init Header
    if (document.getElementById('mainHeader') && window.Components) {
        document.getElementById('mainHeader').innerHTML = window.Components.getHeader(true, true);
        window.Components.initHeader();
        window.Components.initCartCounter();
    }

    // 2. Auth Check
    if (window.authManager && !window.authManager.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // 3. Load Data
    await loadProfileData();
    await loadOrders();
});

// --- CORE FUNCTIONS ---

async function loadProfileData() {
    try {
        const user = window.authManager.currentUser || (await window.api.getProfile()).data.user;

        if (user) {
            // Sidebar Info
            setIdText('profileName', `${user.first_name} ${user.last_name}`);
            setIdText('profileEmail', user.email);

            // Dashboard Stats
            // (Mocking stats if API doesn't provide them directly in user object)
            // In a real app, these might come from a specific dashboard endpoint
            setIdText('loyaltyPointsValue', user.points || 0);

            // Settings Form
            setIdValue('firstName', `${user.first_name} ${user.last_name}`); // Just mapping one field for now
            setIdValue('email', user.email);
        }
    } catch (e) {
        console.error('Profile Load Error:', e);
    }
}

async function loadOrders() {
    const container = document.getElementById('ordersList');
    if (!container) return;

    try {
        const res = await window.api.getOrders();
        const orders = res.data?.orders || [];

        setIdText('totalOrders', orders.length);

        const totalSpent = orders.reduce((acc, o) => acc + parseFloat(o.total), 0);
        setIdText('totalSpent', `S/ ${totalSpent.toFixed(2)}`);

        if (orders.length === 0) {
            container.innerHTML = `<div style="padding: 2rem; border: 2px dashed #000; text-align: center; font-weight: 700;">NO ORDERS FOUND</div>`;
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <span class="order-id">#${order.id}</span>
                    <span class="order-status">${order.status}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                    <span>${new Date(order.created_at).toLocaleDateString()}</span>
                    <span style="font-weight: 800;">S/ ${parseFloat(order.total).toFixed(2)}</span>
                </div>
                <button class="btn-save" style="margin-top: 1rem; font-size: 0.8rem; padding: 0.5rem 1rem;" onclick="alert('View Details Not Implemented')">VIEW DETAILS</button>
            </div>
        `).join('');

    } catch (e) {
        // Mock fallback for demo
        console.warn('Orders API Error, using mock:', e);
        const mockOrders = [
            { id: 'ORD-9921', status: 'SHIPPED', total: 450.00, created_at: new Date().toISOString() },
            { id: 'ORD-8812', status: 'PROCESSING', total: 1200.00, created_at: new Date(Date.now() - 86400000).toISOString() }
        ];

        container.innerHTML = mockOrders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <span class="order-id">#${order.id}</span>
                    <span class="order-status" style="${order.status === 'SHIPPED' ? 'background:var(--accent); color:black' : ''}">${order.status}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem; font-family: monospace;">
                    <span>${new Date(order.created_at).toLocaleDateString()}</span>
                    <span style="font-weight: 800;">S/ ${parseFloat(order.total).toFixed(2)}</span>
                </div>
                <button class="btn-save" style="margin-top: 1rem; width:100%; font-size: 0.8rem; padding: 0.5rem;" onclick="alert('Tracking ID: TRK-992123')">TRACK PACKAGE</button>
            </div>
        `).join('');
    }
}

async function loadWishlist() {
    const container = document.getElementById('wishlistGrid');
    if (!container) return;

    // Mock Wishlist Data
    const mockWishlist = [
        { name: 'Air Jordan 1 Lost & Found', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=600', price: 450 },
        { name: 'Yeezy Slide Pure', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600', price: 180 },
        { name: 'Nike Dunk Low Panda', image: 'https://images.unsplash.com/photo-1637844527273-218ba489995a?auto=format&fit=crop&q=80&w=600', price: 220 }
    ];

    container.innerHTML = mockWishlist.map(item => `
        <div class="stat-box" style="padding:0; border:2px solid black; position:relative;">
            <div style="height:150px; overflow:hidden; border-bottom:2px solid black;">
                <img src="${item.image}" style="width:100%; height:100%; object-fit:cover; filter:grayscale(100%); transition:filter 0.3s;" onmouseover="this.style.filter='grayscale(0%)'" onmouseout="this.style.filter='grayscale(100%)'">
            </div>
            <div style="padding:1rem;">
                <h4 style="font-weight:900; font-size:0.9rem; text-transform:uppercase; margin-bottom:0.5rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</h4>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:mono;">S/ ${item.price}</span>
                    <button style="background:black; color:white; border:none; padding:5px 10px; cursor:pointer;" onclick="window.quickAdd(123, '${item.name}')">+</button>
                </div>
            </div>
        </div>
    `).join('');
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
    console.log('🔵 [PROFILE] DOMContentLoaded ejecutado');

    // Inicializar header y footer
    const headerContainer = document.getElementById('mainHeader');
    const footerContainer = document.getElementById('mainFooter');

    console.log('🔵 [PROFILE] headerContainer:', headerContainer);
    console.log('🔵 [PROFILE] window.Components:', window.Components);

    if (headerContainer && window.Components) {
        console.log('🔵 [PROFILE] Renderizando header...');
        headerContainer.innerHTML = window.Components.getHeader(true, true);
        console.log('🔵 [PROFILE] Header renderizado, llamando initHeader()...');
        window.Components.initHeader();
        window.Components.initSearch();
        window.Components.initCartCounter();
        console.log('🔵 [PROFILE] initHeader() ejecutado');
    }

    if (footerContainer && window.Components) {
        footerContainer.innerHTML = window.Components.getFooter();
    }

    // Verificar autenticación con retry
    let retries = 0;
    const maxRetries = 5;

    const checkAuth = setInterval(() => {
        retries++;
        if (window.authManager && window.authManager.isAuthenticated()) {
            clearInterval(checkAuth);
            console.log('✅ Usuario autenticado, cargando perfil');
            initializeProfile();
        } else if (retries >= maxRetries) {
            clearInterval(checkAuth);
            console.log('❌ Usuario no autenticado, redirigiendo');
            window.location.href = 'index.html';
        }
    }, 200);

    setupLoyaltyButtons();
    updateLoyaltyUI(0);

    // Inicializar tabs
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            const tabId = this.dataset.tab;
            switchTab(tabId);
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
function switchTab(tabId) {
    // Actualizar tabs
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');
    });

    const activeTab = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
        activeTab.setAttribute('aria-selected', 'true');
        activeTab.setAttribute('tabindex', '0');
    }

    // Actualizar secciones
    document.querySelectorAll('.profile-section').forEach(section => {
        section.classList.remove('active');
        section.setAttribute('hidden', '');
    });

    const activeSection = document.getElementById(tabId);
    if (activeSection) {
        activeSection.classList.add('active');
        activeSection.removeAttribute('hidden');
    }

    // Cargar datos específicos de la sección
    if (tabId === 'addresses') {
        loadAddresses();
    } else if (tabId === 'points') {
        loadLoyaltyTransactions();
    } else if (tabId === 'wishlist') {
        loadWishlist();
    }
}

// Inicializar perfil
async function initializeProfile() {
    await Promise.all([
        loadUserData(),
        loadStats(),
        loadAddresses(),
        loadLoyaltyPoints()
    ]);
}

// Cargar datos del usuario
async function loadUserData() {
    try {
        const response = await window.api.getProfile();

        if (response.success && response.data.user) {
            const user = response.data.user;

            // Actualizar header
            document.getElementById('profileName').textContent =
                `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Usuario';
            document.getElementById('profileEmail').textContent = user.email || '';

            // Actualizar avatar
            const avatar = document.getElementById('profileAvatar');
            const initials = `${(user.first_name || 'U')[0]}${(user.last_name || '')[0]}`.toUpperCase() || 'U';
            avatar.textContent = initials;

            // Llenar formulario
            document.getElementById('firstName').value = user.first_name || '';
            document.getElementById('lastName').value = user.last_name || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('phone').value = user.phone || '';
        } else {
            window.notifications.error('Error al cargar datos del perfil');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        window.notifications.error('Error al cargar datos del perfil');
    }
}

// Cargar estadísticas
async function loadStats() {
    try {
        // Cargar pedidos
        const ordersResponse = await window.api.getOrders();
        if (ordersResponse.success) {
            const orders = ordersResponse.data.orders || [];
            const totalOrdersEl = document.getElementById('totalOrders');
            if (totalOrdersEl) {
                animateCounter(totalOrdersEl, orders.length);
            }

            const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
            const totalSpentEl = document.getElementById('totalSpent');
            if (totalSpentEl) {
                animateCounter(totalSpentEl, totalSpent, {
                    formatter: value => currencyFormatter.format(value)
                });
            }
        }

        // Cargar wishlist
        const wishlistResponse = await window.api.getWishlist();
        if (wishlistResponse.success) {
            const lists = wishlistResponse.data.lists || [];
            const wishlistTotal = lists.reduce((sum, list) => sum + (list.items?.length || 0), 0);
            const wishlistCountEl = document.getElementById('wishlistCount');
            if (wishlistCountEl) {
                animateCounter(wishlistCountEl, wishlistTotal);
            }
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Cargar direcciones
async function loadAddresses() {
    const container = document.getElementById('addressesList');
    if (!container) return;

    window.loadingState.renderLoading(container, 'Cargando direcciones...');

    try {
        const response = await window.api.getAddresses();

        if (response.success && response.data.addresses) {
            const addresses = response.data.addresses;

            if (addresses.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-map-marker-alt"></i>
                        <h3>No tienes direcciones guardadas</h3>
                        <p>Agrega una dirección para facilitar tus compras</p>
                        <button class="btn btn-primary" onclick="openAddressModal()">
                            <i class="fas fa-plus"></i> Agregar Dirección
                        </button>
                    </div>
                `;
                return;
            }

            container.innerHTML = addresses.map(addr => `
                <div class="address-item ${addr.is_default ? 'default' : ''}">
                    <div class="address-item-header">
                        <div class="address-item-title">
                            <i class="fas fa-${addr.type === 'home' ? 'home' : addr.type === 'work' ? 'briefcase' : 'map-marker-alt'}"></i>
                            <span>${addr.type === 'home' ? 'Casa' : addr.type === 'work' ? 'Trabajo' : 'Otra'}</span>
                            ${addr.is_default ? '<span class="default-badge"><i class="fas fa-check"></i> Predeterminada</span>' : ''}
                        </div>
                        <div class="address-item-actions">
                            <button class="btn btn-sm btn-ghost" onclick="editAddress('${addr.id}')">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-error" onclick="deleteAddress('${addr.id}')">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                    <div class="address-item-content">
                        ${addr.street}<br>
                        ${addr.city}, ${addr.region}<br>
                        ${addr.postal_code || ''} ${addr.country}
                    </div>
                </div>
            `).join('');
        } else {
            window.loadingState.renderError(container, response.message || 'Error al cargar direcciones', {
                className: 'loading-state loading-state-error',
                spinner: false
            });
        }
    } catch (error) {
        window.loadingState.renderError(container, error.message || 'Error al cargar direcciones', {
            className: 'loading-state loading-state-error',
            spinner: false
        });
    }
}

// Cargar puntos de lealtad
async function loadLoyaltyPoints() {
    try {
        const response = await window.api.getLoyaltyPoints();
        if (response.success && response.data.points !== undefined) {
            updateLoyaltyUI(Number(response.data.points || 0));
        }
    } catch (error) {
        console.error('Error loading loyalty points:', error);
    }
}

// Cargar transacciones de lealtad
async function loadLoyaltyTransactions() {
    const container = document.getElementById('loyaltyTransactions');
    if (!container) return;

    window.loadingState.renderLoading(container, 'Cargando transacciones de puntos...');

    try {
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
                <div class="loyalty-transaction">
                    <div>
                        <div class="loyalty-transaction-type">${trans.description || 'Transacción'}</div>
                        <div style="font-size: 0.875rem; color: var(--gray-500); margin-top: 4px;">
                            ${new Date(trans.created_at).toLocaleDateString('es-PE')}
                        </div>
                    </div>
                    <div class="loyalty-transaction-amount ${trans.points > 0 ? 'positive' : 'negative'}">
                        ${trans.points > 0 ? '+' : ''}${trans.points}
                    </div>
                </div>
            `).join('');
        } else {
            window.loadingState.renderError(container, response.message || 'Error al cargar transacciones', {
                className: 'loading-state loading-state-error',
                spinner: false
            });
        }
    } catch (error) {
        window.loadingState.renderError(container, error.message || 'Error al cargar transacciones', {
            className: 'loading-state loading-state-error',
            spinner: false
        });
    }
}

// Guardar datos personales
document.getElementById('personalDataForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const data = {
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };

    try {
        const response = await window.api.updateProfile(data);

        if (response.success) {
            window.notifications.success('Perfil actualizado correctamente');
            await loadUserData();
        } else {
            window.notifications.error(response.message || 'Error al actualizar perfil');
        }
    } catch (error) {
        window.notifications.error('Error al actualizar perfil');
    }
});

// Cambiar contraseña
document.getElementById('changePasswordForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        window.notifications.error('Las contraseñas no coinciden');
        return;
    }

    try {
        const response = await window.api.changePassword({
            current_password: currentPassword,
            new_password: newPassword
        });

        if (response.success) {
            window.notifications.success('Contraseña cambiada correctamente');
            document.getElementById('changePasswordForm').reset();
        } else {
            window.notifications.error(response.message || 'Error al cambiar contraseña');
        }
    } catch (error) {
        window.notifications.error('Error al cambiar contraseña');
    }
});

// Gestión de direcciones
function openAddressModal(addressId = null) {
    const modal = document.getElementById('addressModal');
    const form = document.getElementById('addressForm');
    const title = document.getElementById('addressModalTitle');

    if (addressId) {
        title.textContent = 'Editar Dirección';
        // Cargar datos de la dirección
        // TODO: Implementar carga de datos
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

function editAddress(addressId) {
    openAddressModal(addressId);
    // TODO: Cargar datos de la dirección
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
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            try {
                console.log('🔴 [PROFILE] Cerrando sesión...');

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
                console.error('Error al cerrar sesión:', error);
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
