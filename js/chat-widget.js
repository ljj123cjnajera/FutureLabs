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
                        <span>SNEAKERS SHOP SUPPORT</span>
                        <button id="chatClose" class="chat-close"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="chat-body">
                        <div class="chat-message system">
                            <strong>SYSTEM:</strong>
                            <p>WELCOME TO SNEAKERS SHOP. HOW CAN WE HELP?</p>
                        </div>
                        <div class="chat-options">
                            <button class="chat-option" data-action="track">TRACK ORDER</button>
                            <button class="chat-option" data-action="shipping">SHIPPING INFO</button>
                            <button class="chat-option" data-action="human">TALK TO HUMAN</button>
                        </div>
                    </div>
                    <div class="chat-footer">
                        <input type="text" placeholder="TYPE HERE..." disabled style="cursor: not-allowed; background: #eee;">
                        <button disabled><i class="fas fa-arrow-right"></i></button>
                    </div>
                </div>
            </div>

            <style>
                .chat-widget {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    z-index: 9999;
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

        toggle.addEventListener('click', () => {
            windowEl.classList.toggle('active');
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
    }

    handleAction(action) {
        const body = document.querySelector('.chat-body');
        let response = '';

        if (action === 'track') {
            response = "TO TRACK AN ORDER, PLEASE GO TO 'MY PROFILE' > 'HISTORY'.";
        } else if (action === 'shipping') {
            response = "WE SHIP VIA OLVA COURIER. LIMA: 24-48H. PROVINCES: 48-72H.";
        } else if (action === 'human') {
            response = "ALL AGENTS ARE CURRENTLY BUSY. LEAVE A MESSAGE AT CONTACT@SNEAKERSHOP.PE";
        }

        const msgHTML = `
            <div class="chat-message system" style="margin-top: 1rem; border-top: 1px dashed #ccc; padding-top: 0.5rem;">
                <strong>SYSTEM:</strong>
                <p>${response}</p>
            </div>
        `;
        body.insertAdjacentHTML('beforeend', msgHTML);
    }
}

// Global initialization
window.ChatWidget = ChatWidget;
