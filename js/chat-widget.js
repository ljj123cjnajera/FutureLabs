// 💬 Brutalist Chat Widget (Connected to Backend)
class BrutalistChat {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        if (document.getElementById('brutalistChat')) return; // Prevent double init

        this.renderWidget();
        this.attachListeners();
        this.checkUnread();
    }

    renderWidget() {
        const widget = document.createElement('div');
        widget.id = 'brutalistChat';
        widget.className = 'brutalist-chat-container';
        widget.innerHTML = `
            <button id="chatToggle" class="chat-toggle-btn">
                <i class="fas fa-comment-alt"></i>
                <span id="chatUnread" class="chat-unread-badge" style="display:none">0</span>
            </button>

            <div id="chatWindow" class="chat-window">
                <div class="chat-header">
                    <h3><i class="fas fa-terminal"></i> LIVE SUPPORT</h3>
                    <button id="chatClose"><i class="fas fa-times"></i></button>
                </div>
                
                <div id="chatMessages" class="chat-messages">
                    <div class="chat-welcome">
                        <p>Welcome to FutureLabs Support.</p>
                        <p>We are usually online 9am - 6pm.</p>
                    </div>
                </div>

                <form id="chatForm" class="chat-input-area">
                    <input type="text" id="chatInput" placeholder="TYPE MESSAGE..." autocomplete="off">
                    <button type="submit"><i class="fas fa-arrow-right"></i></button>
                </form>
            </div>
            
            <style>
                .brutalist-chat-container {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    z-index: 9999;
                    font-family: 'Inter', sans-serif;
                }
                .chat-toggle-btn {
                    width: 60px;
                    height: 60px;
                    background: var(--black, #000);
                    color: var(--white, #fff);
                    border: 2px solid var(--white, #fff);
                    border-radius: 0;
                    cursor: pointer;
                    font-size: 1.5rem;
                    box-shadow: 6px 6px 0 rgba(0,0,0,0.2);
                    transition: transform 0.2s;
                    position: relative;
                }
                .chat-toggle-btn:hover {
                    transform: translate(-2px, -2px);
                    box-shadow: 8px 8px 0 rgba(0,0,0,0.3);
                }
                .chat-unread-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: red;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                }
                .chat-window {
                    display: none;
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    width: 350px;
                    height: 500px;
                    background: var(--white, #fff);
                    border: 4px solid var(--black, #000);
                    box-shadow: 12px 12px 0 rgba(0,0,0,0.2);
                    flex-direction: column;
                }
                .chat-window.active {
                    display: flex;
                }
                .chat-header {
                    background: var(--black, #000);
                    color: var(--white, #fff);
                    padding: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: 800;
                    border-bottom: 2px solid var(--black, #000);
                }
                .chat-messages {
                    flex: 1;
                    padding: 1rem;
                    overflow-y: auto;
                    background: #f4f4f4;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .chat-message {
                    max-width: 80%;
                    padding: 0.8rem;
                    font-size: 0.9rem;
                    line-height: 1.4;
                    word-wrap: break-word;
                }
                .chat-message.user {
                    align-self: flex-end;
                    background: var(--black, #000);
                    color: var(--white, #fff);
                    border: 1px solid var(--black, #000);
                }
                .chat-message.admin {
                    align-self: flex-start;
                    background: var(--white, #fff);
                    color: var(--black, #000);
                    border: 2px solid var(--black, #000);
                }
                .chat-input-area {
                    display: flex;
                    border-top: 4px solid var(--black, #000);
                }
                .chat-input-area input {
                    flex: 1;
                    padding: 1rem;
                    border: none;
                    font-family: inherit;
                    font-weight: 600;
                    outline: none;
                }
                .chat-input-area button {
                    background: var(--accent, #ff3e00);
                    color: white;
                    border: none;
                    border-left: 2px solid var(--black, #000);
                    width: 60px;
                    cursor: pointer;
                    font-size: 1.2rem;
                }
                .chat-input-area button:hover {
                    background: black;
                }
            </style>
        `;
        document.body.appendChild(widget);
    }

    attachListeners() {
        document.getElementById('chatToggle').addEventListener('click', () => this.toggle());
        document.getElementById('chatClose').addEventListener('click', () => this.toggle());
        document.getElementById('chatForm').addEventListener('submit', (e) => this.sendMessage(e));
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chatWindow');
        if (this.isOpen) {
            window.classList.add('active');
            this.loadMessages();
            document.getElementById('chatUnread').style.display = 'none';
        } else {
            window.classList.remove('active');
        }
    }

    async loadMessages() {
        if (!window.authManager.isAuthenticated()) return;

        try {
            const res = await window.api.request('/chat/messages');
            if (res.success) {
                this.messages = res.data.messages;
                this.renderMessages();
            }
        } catch (e) {
            console.error('Chat load error:', e);
        }
    }

    renderMessages() {
        const container = document.getElementById('chatMessages');
        container.innerHTML = '<div class="chat-welcome"><p>Welcome to FutureLabs Support.</p></div>';

        this.messages.forEach(msg => {
            const div = document.createElement('div');
            div.className = `chat-message ${msg.sender_type === 'user' ? 'user' : 'admin'}`;
            div.textContent = msg.message;
            container.appendChild(div);
        });

        container.scrollTop = container.scrollHeight;
    }

    async sendMessage(e) {
        e.preventDefault();
        const input = document.getElementById('chatInput');
        const text = input.value.trim();

        if (!text) return;

        // Optimistic UI
        const tempMsg = { message: text, sender_type: 'user' };
        this.messages.push(tempMsg);
        this.renderMessages();
        input.value = '';

        try {
            let payload = { message: text };

            if (window.authManager.isAuthenticated()) {
                const user = window.authManager.currentUser;
                payload.user_id = user.id;
            } else {
                // Guest Chat not fully implemented yet in this widget version without prompting name
                // For now, allow logged in only or generic guest
                payload.visitor_name = 'Guest';
                payload.visitor_email = 'guest@example.com';
            }

            await window.api.request('/chat/send', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

        } catch (e) {
            console.error('Send error:', e);
        }
    }

    async checkUnread() {
        if (!window.authManager.isAuthenticated()) return;
        try {
            const res = await window.api.request('/chat/unread-count');
            const count = res.data?.count || 0;
            const badge = document.getElementById('chatUnread');
            if (count > 0) {
                badge.style.display = 'flex';
                badge.textContent = count;
            }
        } catch (e) { }
    }
}

// Auto-init
if (!window.BrutalistChat) {
    window.BrutalistChat = new BrutalistChat();
}
