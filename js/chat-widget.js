/**
 * CHAT WIDGET COMPONENT (Brutalist V3)
 * A stark, high-contrast chat bubble and window.
 */
class ChatWidget {
    constructor() {
        this.init();
    }

    init() {
        if (document.getElementById('brutalistChat')) return; // Prevent double init
        this.render();
        this.bindEvents();
    }

    render() {
        const chatHTML = `
            <div id="brutalistChat" class="chat-widget">
                <!-- Toggle Button -->
                <button id="chatToggle" class="chat-toggle" aria-label="Abrir chat">
                    <i class="fas fa-comment-alt"></i>
                </button>

                <!-- Chat Window -->
                <div id="chatWindow" class="chat-window hidden">
                    <div class="chat-header">
                        <span>SOPORTE SNEAKERS SHOP</span>
                        <button id="chatClose" class="chat-close" aria-label="Cerrar chat"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="chat-body">
                        <div class="chat-message system">
                            <strong>SISTEMA:</strong>
                            <p>BIENVENIDO A SNEAKERS SHOP. ¿CÓMO PODEMOS AYUDARTE?</p>
                        </div>
                        <div class="chat-options">
                            <button class="chat-option" data-action="track">RASTREAR PEDIDO</button>
                            <button class="chat-option" data-action="shipping">INFO DE ENVÍO</button>
                            <button class="chat-option" data-action="returns">DEVOLUCIONES</button>
                            <button class="chat-option" data-action="human">HABLAR CON PERSONA</button>
                        </div>
                    </div>
                    <div class="chat-footer">
                        <form id="chatForm" style="display: flex; gap: 5px;">
                            <input type="text" id="chatInput" placeholder="ESCRIBE AQUÍ..." autocomplete="off" aria-label="Escribe tu mensaje">
                            <button type="submit" id="chatSend" aria-label="Enviar mensaje"><i class="fas fa-arrow-right"></i></button>
                        </form>
                    </div>
                </div>
            </div>

            <style>
                .chat-widget {
                    position: fixed;
                    bottom: 100px; /* Elevated further to strictly clear Sticky Footer & Close Button */
                    right: 25px;
                    z-index: var(--z-chat-widget, 4000); /* Ensure above footer */
                    font-family: 'Courier New', monospace;
                }

                .chat-toggle {
                    width: 60px;
                    height: 60px;
                    background: var(--black, #000);
                    color: var(--white, #fff);
                    border: none;
                    border-radius: 50%;
                    font-size: 1.5rem;
                    cursor: pointer;
                    box-shadow: 4px 4px 0px rgba(0,0,0,0.2);
                    transition: transform 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .chat-toggle:hover {
                    transform: translate(-2px, -2px);
                    box-shadow: 6px 6px 0px rgba(0,0,0,0.3);
                }

                .chat-toggle:active {
                    transform: translate(0, 0);
                    box-shadow: 2px 2px 0px rgba(0,0,0,0.2);
                }

                .chat-window {
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    width: 300px;
                    background: var(--white, #fff);
                    border: 3px solid var(--black, #000);
                    box-shadow: 8px 8px 0px var(--black, #000);
                    display: flex;
                    flex-direction: column;
                    opacity: 0;
                    transform: translateY(20px);
                    pointer-events: none;
                    transition: opacity 0.3s, transform 0.3s;
                }

                .chat-window.active {
                    opacity: 1;
                    transform: translateY(0);
                    pointer-events: all;
                }

                .chat-header {
                    background: var(--black, #000);
                    color: var(--white, #fff);
                    padding: 0.5rem 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: 900;
                    letter-spacing: 1px;
                }

                .chat-close {
                    background: transparent;
                    border: none;
                    color: var(--white, #fff);
                    cursor: pointer;
                    font-size: 1.2rem;
                }

                .chat-body {
                    padding: 1rem;
                    min-height: 200px;
                    background: #fff;
                }

                .chat-message.system p {
                    margin: 0.2rem 0 1rem;
                    font-size: 0.9rem;
                    line-height: 1.4;
                }

                .chat-options {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .chat-option {
                    background: transparent;
                    border: 2px solid var(--black, #000);
                    padding: 0.5rem;
                    text-align: left;
                    font-family: inherit;
                    font-weight: bold;
                    cursor: pointer;
                    transition: background 0.2s, color 0.2s;
                    text-transform: uppercase;
                    font-size: 0.8rem;
                }

                .chat-option:hover {
                    background: var(--black, #000);
                    color: var(--white, #fff);
                }

                .chat-footer {
                    display: flex;
                    border-top: 3px solid var(--black, #000);
                }

                .chat-footer input {
                    flex: 1;
                    padding: 0.8rem;
                    border: none;
                    outline: none;
                    font-family: inherit;
                    font-size: 0.9rem;
                }

                .chat-footer button {
                    background: var(--black, #000);
                    color: var(--white, #fff);
                    border: none;
                    padding: 0 1rem;
                }
            </style>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
    }

    bindEvents() {
        const toggle = document.getElementById('chatToggle');
        const close = document.getElementById('chatClose');
        const windowEl = document.getElementById('chatWindow');
        const options = document.querySelectorAll('.chat-option');
        const chatForm = document.getElementById('chatForm');
        const chatInput = document.getElementById('chatInput');

        toggle.addEventListener('click', () => {
            windowEl.classList.toggle('active');
            if (windowEl.classList.contains('active')) {
                chatInput.focus();
            }
        });

        close.addEventListener('click', () => {
            windowEl.classList.remove('active');
        });

        options.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleAction(action);
            });
        });

        // Enviar mensaje
        if (chatForm) {
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const message = chatInput.value.trim();
                if (message) {
                    this.sendMessage(message);
                    chatInput.value = '';
                }
            });
        }

        // Enter para enviar
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    chatForm.dispatchEvent(new Event('submit'));
                }
            });
        }
    }

    handleAction(action) {
        const body = document.querySelector('.chat-body');
        let response = '';

        if (action === 'track') {
            response = "Para rastrear un pedido, ve a 'MI PERFIL' > 'PEDIDOS'.";
        } else if (action === 'shipping') {
            response = "Enviamos vía OLVA COURIER. Lima: 24-48h. Provincias: 48-72h. Envío gratis en compras mayores a S/ 200.";
        } else if (action === 'returns') {
            response = "Tienes 30 días para devolver productos sin usar. Ve a 'DEVOLUCIONES' en el footer para más información.";
        } else if (action === 'human') {
            response = "Todos nuestros agentes están ocupados. Deja un mensaje en contacto@sneakersshop.pe o WhatsApp: +51 987 654 321";
        }

        const msgHTML = `
            <div class="chat-message system" style="margin-top: 1rem; border-top: 1px dashed #ccc; padding-top: 0.5rem;">
                <strong>SISTEMA:</strong>
                <p>${response}</p>
            </div>
        `;
        body.insertAdjacentHTML('beforeend', msgHTML);
        this.scrollToBottom();
    }

    async sendMessage(message) {
        const body = document.querySelector('.chat-body');
        
        // Mostrar mensaje del usuario
        const userMsgHTML = `
            <div class="chat-message user" style="margin-top: 1rem; text-align: right;">
                <strong>TÚ:</strong>
                <p style="background: #f0f0f0; padding: 0.5rem; display: inline-block; border: 1px solid #000;">${this.escapeHtml(message)}</p>
            </div>
        `;
        body.insertAdjacentHTML('beforeend', userMsgHTML);
        this.scrollToBottom();

        // Intentar enviar al backend si está disponible
        try {
            if (window.api && window.api.sendChatMessage) {
                const user = window.authManager?.getUser();
                const response = await window.api.sendChatMessage({
                    message,
                    user_id: user?.id || null,
                    visitor_name: user ? null : 'Visitante',
                    visitor_email: user ? null : null
                });

                if (response.success) {
                    const systemMsgHTML = `
                        <div class="chat-message system" style="margin-top: 1rem; border-top: 1px dashed #ccc; padding-top: 0.5rem;">
                            <strong>SISTEMA:</strong>
                            <p>Mensaje recibido. Te responderemos pronto.</p>
                        </div>
                    `;
                    body.insertAdjacentHTML('beforeend', systemMsgHTML);
                }
            } else {
                // Respuesta automática básica
                this.handleAutoResponse(message);
            }
        } catch (error) {
            if (window.Logger) window.Logger.error('Error sending chat message:', error);
            // Respuesta automática en caso de error
            this.handleAutoResponse(message);
        }

        this.scrollToBottom();
    }

    handleAutoResponse(message) {
        const body = document.querySelector('.chat-body');
        const lowerMessage = message.toLowerCase();
        let response = '';

        if (lowerMessage.includes('pedido') || lowerMessage.includes('orden') || lowerMessage.includes('compra')) {
            response = "Para ver tus pedidos, ve a 'MI PERFIL' > 'PEDIDOS'. Si necesitas ayuda específica, escríbenos a contacto@sneakersshop.pe";
        } else if (lowerMessage.includes('envío') || lowerMessage.includes('envio') || lowerMessage.includes('entrega')) {
            response = "Enviamos vía OLVA COURIER. Lima Metropolitana: 24-48h. Provincias: 48-72h. Envío gratis en compras mayores a S/ 200.";
        } else if (lowerMessage.includes('devolución') || lowerMessage.includes('devolucion') || lowerMessage.includes('cambio')) {
            response = "Tienes 30 días para devolver productos sin usar. Ve a nuestra página de 'DEVOLUCIONES' para más información.";
        } else if (lowerMessage.includes('precio') || lowerMessage.includes('costo') || lowerMessage.includes('cuanto')) {
            response = "Los precios están disponibles en cada producto. También tenemos ofertas especiales y cupones de descuento.";
        } else {
            response = "Gracias por tu mensaje. Para atención personalizada, escríbenos a contacto@sneakersshop.pe o WhatsApp: +51 987 654 321";
        }

        const systemMsgHTML = `
            <div class="chat-message system" style="margin-top: 1rem; border-top: 1px dashed #ccc; padding-top: 0.5rem;">
                <strong>SISTEMA:</strong>
                <p>${response}</p>
            </div>
        `;
        body.insertAdjacentHTML('beforeend', systemMsgHTML);
    }

    scrollToBottom() {
        const body = document.querySelector('.chat-body');
        if (body) {
            body.scrollTop = body.scrollHeight;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global initialization
window.ChatWidget = ChatWidget;
