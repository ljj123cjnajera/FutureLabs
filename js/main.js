// Main JavaScript for FutureLabs
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initStickyHeader();
    initSearchFunctionality();
    initCartFunctionality();
    initSmoothScrolling();
    initPlaceholderInteractions();
    initSubscriptionBanner();
    initChatButton();
    
    // Cargar productos destacados
    loadFeaturedProducts();
    
    console.log('FutureLabs - Tu portal al futuro está listo!');
});

// Sticky Header
function initStickyHeader() {
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Hide header on scroll down, show on scroll up
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollY = window.scrollY;
    });
}

// Search Functionality
function initSearchFunctionality() {
    const searchInput = document.querySelector('.search-bar input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (!searchInput || !searchBtn) {
        console.log('⚠️ Search elements not found, skipping search initialization');
        return;
    }
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    function performSearch() {
        const query = searchInput.value.trim();
        if (query) {
            alert(`Buscando: ${query}`);
            // Aquí iría la lógica real de búsqueda
            searchInput.value = '';
        }
    }
}

// Cart Functionality
function initCartFunctionality() {
    const cartIcon = document.querySelector('.cart-icon');
    const cartCount = document.querySelector('.cart-count');
    
    // Escuchar evento de actualización del carrito
    document.addEventListener('cartUpdated', (e) => {
        if (cartCount) {
            cartCount.textContent = e.detail.count;
            cartCount.style.animation = 'bounce 0.5s';
            
            setTimeout(() => {
                cartCount.style.animation = '';
            }, 500);
        }
    });
    
    cartIcon.addEventListener('click', function(e) {
        e.preventDefault();
        if (parseInt(cartCount.textContent) > 0) {
            window.location.href = 'cart.html';
        } else {
            if (typeof window.notifications !== 'undefined') {
                window.notifications.warning('Tu carrito está vacío');
            } else {
                alert('Tu carrito está vacío');
            }
        }
    });
}

// Smooth Scrolling
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Placeholder Interactions
function initPlaceholderInteractions() {
    // Simular interacciones con elementos placeholder
    const placeholders = document.querySelectorAll('.flash-offers-message, .carousel-message');
    
    placeholders.forEach(placeholder => {
        placeholder.style.cursor = 'pointer';
        placeholder.addEventListener('click', function() {
            showNotification('¡Pronto tendremos contenido aquí!');
        });
    });
    
    // Efectos hover para tarjetas de categorías
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const categoryName = this.querySelector('h3').textContent;
            showNotification(`Explorando: ${categoryName}`);
        });
    });
}

// Subscription Banner
function initSubscriptionBanner() {
    const subscribeBtn = document.querySelector('.sticky-footer .cta-button');
    
    subscribeBtn.addEventListener('click', function() {
        const email = prompt('Ingresa tu email para suscribirte:');
        if (email) {
            showNotification(`¡Te has suscrito con: ${email}! Pronto recibirás tu código de descuento.`);
            // Aquí normalmente se enviaría el email a un servidor
        }
    });
}

// Chat Button
function initChatButton() {
    const chatBtn = document.querySelector('.chat-button');
    
    chatBtn.addEventListener('click', function() {
        showNotification('¡El servicio de chat estará disponible pronto!');
        // Aquí se integraría con un servicio de chat real
    });
}

// Utility Functions
function showNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success);
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Animación para el contador del carrito
const cartCounterStyles = document.createElement('style');
cartCounterStyles.textContent = `
    @keyframes bounce {
        0%, 20%, 60%, 100% {
            transform: scale(1);
        }
        40% {
            transform: scale(1.2);
        }
        80% {
            transform: scale(1.1);
        }
    }
    
    .header.scrolled {
        box-shadow: 0 2px 20px rgba(0,0,0,0.1);
    }
    
    .header {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
`;
document.head.appendChild(cartCounterStyles);

// Megamenú Functionality
function initMegaMenu() {
    const menuTrigger = document.querySelector('.all-categories');
    const megaMenu = document.getElementById('megaMenu');
    const overlay = document.getElementById('megaMenuOverlay');
    const closeMenu = document.getElementById('closeMenu');
    const categoryItems = document.querySelectorAll('.category-item');
    const categoryContents = document.querySelectorAll('.category-content');

    // Abrir menú
    menuTrigger.addEventListener('click', function(e) {
        e.preventDefault();
        openMegaMenu();
    });

    // Cerrar menú
    closeMenu.addEventListener('click', closeMegaMenu);
    overlay.addEventListener('click', closeMegaMenu);

    // Cerrar con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && megaMenu.classList.contains('active')) {
            closeMegaMenu();
        }
    });

    // Navegación entre categorías
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Remover active de todos
            categoryItems.forEach(i => i.classList.remove('active'));
            categoryContents.forEach(c => c.classList.remove('active'));
            
            // Agregar active al seleccionado
            this.classList.add('active');
            document.querySelector(`.category-content[data-category="${category}"]`).classList.add('active');
        });
    });

    // Hover para desktop
    if (window.innerWidth > 768) {
        categoryItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                const category = this.getAttribute('data-category');
                
                // Solo cambiar si no está activo
                if (!this.classList.contains('active')) {
                    categoryItems.forEach(i => i.classList.remove('active'));
                    categoryContents.forEach(c => c.classList.remove('active'));
                    
                    this.classList.add('active');
                    document.querySelector(`.category-content[data-category="${category}"]`).classList.add('active');
                }
            });
        });
    }

    function openMegaMenu() {
        megaMenu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMegaMenu() {
        megaMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Cargar productos destacados
async function loadFeaturedProducts() {
    try {
        const response = await window.api.getFeaturedProducts(8);
        
        if (response.success && response.data.products.length > 0) {
            console.log('✅ Productos destacados cargados:', response.data.products.length);
            
            // Aquí puedes renderizar los productos en el HTML
            // Por ejemplo, en un contenedor específico
        }
    } catch (error) {
        console.error('Error cargando productos destacados:', error);
    }
}
