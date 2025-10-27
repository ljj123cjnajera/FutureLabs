// 🔐 Modales de Login y Registro
class ModalManager {
  constructor() {
    this.init();
  }

  init() {
    // Crear modal de login
    this.createLoginModal();
    // Crear modal de registro
    this.createRegisterModal();
  }

  createLoginModal() {
    const modal = document.createElement('div');
    modal.id = 'loginModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Iniciar Sesión</h2>
          <button class="modal-close" onclick="window.modalManager.closeLogin()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="loginForm">
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="loginEmail" placeholder="tu@email.com" required>
            </div>
            <div class="form-group">
              <label>Contraseña</label>
              <input type="password" id="loginPassword" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn-primary">
              <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
            </button>
          </form>
          <div class="modal-footer">
            <p>¿No tienes cuenta? <a href="javascript:void(0)" onclick="window.modalManager.showRegister()">Regístrate aquí</a></p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Manejar submit del formulario
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin();
    });
    
    // Prevenir que los enlaces recarguen la página
    const registerLink = modal.querySelector('.modal-footer a');
    if (registerLink) {
      registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showRegister();
      });
    }
  }

  createRegisterModal() {
    const modal = document.createElement('div');
    modal.id = 'registerModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Crear Cuenta</h2>
          <button class="modal-close" onclick="window.modalManager.closeRegister()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="registerForm">
            <div class="form-row">
              <div class="form-group">
                <label>Nombre</label>
                <input type="text" id="registerFirstName" placeholder="Juan" required>
              </div>
              <div class="form-group">
                <label>Apellido</label>
                <input type="text" id="registerLastName" placeholder="Pérez" required>
              </div>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="registerEmail" placeholder="tu@email.com" required>
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input type="tel" id="registerPhone" placeholder="+51 987 654 321">
            </div>
            <div class="form-group">
              <label>Contraseña</label>
              <input type="password" id="registerPassword" placeholder="••••••••" required minlength="6">
            </div>
            <div class="form-group">
              <label>Confirmar Contraseña</label>
              <input type="password" id="registerPasswordConfirm" placeholder="••••••••" required minlength="6">
            </div>
            <button type="submit" class="btn-primary">
              <i class="fas fa-user-plus"></i> Crear Cuenta
            </button>
          </form>
          <div class="modal-footer">
            <p>¿Ya tienes cuenta? <a href="javascript:void(0)" onclick="window.modalManager.showLogin()">Inicia sesión aquí</a></p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Manejar submit del formulario
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleRegister();
    });
    
    // Prevenir que los enlaces recarguen la página
    const loginLink = modal.querySelector('.modal-footer a');
    if (loginLink) {
      loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showLogin();
      });
    }
  }

  showLogin() {
    this.closeRegister();
    const modal = document.getElementById('loginModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Cerrar modal al hacer click en el overlay
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeLogin();
      }
    });
    
    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', this.handleEscapeKey);
  }

  closeLogin() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    // Remover listener de tecla ESC
    document.removeEventListener('keydown', this.handleEscapeKey);
  }

  showRegister() {
    this.closeLogin();
    const modal = document.getElementById('registerModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Cerrar modal al hacer click en el overlay
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeRegister();
      }
    });
    
    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', this.handleEscapeKey);
  }

  closeRegister() {
    const modal = document.getElementById('registerModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    // Remover listener de tecla ESC
    document.removeEventListener('keydown', this.handleEscapeKey);
  }

  hideRegisterModal() {
    this.closeRegister();
  }

  showLoginModal() {
    this.showLogin();
  }

  handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      this.closeLogin();
      this.closeRegister();
    }
  }

  async handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const success = await window.authManager.login(email, password);
      
      if (success) {
        this.closeLogin();
        // Recargar página para actualizar UI
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      }
    } catch (error) {
      console.error('Error en login:', error);
    }
  }

  async handleRegister() {
    const firstName = document.getElementById('registerFirstName').value;
    const lastName = document.getElementById('registerLastName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

    // Validar contraseñas
    if (password !== passwordConfirm) {
      window.notifications.error('Las contraseñas no coinciden');
      return;
    }

    // Deshabilitar botón de submit para evitar doble click
    const submitBtn = document.querySelector('#registerForm button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Creando cuenta...';
    }

    try {
      const success = await window.authManager.register({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password
      });
      
      if (success) {
        // El modal se cerrará automáticamente desde auth.js si requiere verificación
        // Solo recargar si NO requiere verificación
        if (!window.authManager.currentUser) {
          // Si no hay usuario, significa que requiere verificación
          // El modal de verificación se mostrará automáticamente
          console.log('Registro exitoso, mostrando modal de verificación...');
          
          // Restaurar botón después de mostrar modal de verificación
          const submitBtn = document.querySelector('#registerForm button[type="submit"]');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Crear Cuenta';
          }
        } else {
          // Si ya hay usuario, significa que el registro fue exitoso sin verificación
          this.closeRegister();
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 500);
        }
      } else {
        // Si success es false, restaurar botón
        const submitBtn = document.querySelector('#registerForm button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Crear Cuenta';
        }
      }
    } catch (error) {
      console.error('Error en registro:', error);
      this.showError('Error al registrarse: ' + (error.message || 'Error desconocido'));
      
      // Rehabilitar botón en caso de error
      const submitBtn = document.querySelector('#registerForm button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Crear Cuenta';
      }
    }
  }

  showError(message) {
    if (window.notifications && window.notifications.error) {
      window.notifications.error(message);
    } else {
      alert(message);
    }
  }
}

// Crear instancia global
window.modalManager = new ModalManager();

// Exponer métodos globalmente para compatibilidad
window.modals = {
  showLoginModal: () => window.modalManager.showLogin(),
  showRegisterModal: () => window.modalManager.showRegister(),
  hideLoginModal: () => window.modalManager.closeLogin(),
  hideRegisterModal: () => window.modalManager.closeRegister()
};

// Agregar estilos
const modalStyles = document.createElement('style');
modalStyles.textContent = `
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  }

  .modal-overlay.active {
    display: flex;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideDown 0.3s ease;
  }

  @keyframes slideDown {
    from {
      transform: translateY(-50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 24px;
    color: #333;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 28px;
    color: #999;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
  }

  .modal-close:hover {
    background: #f5f5f5;
    color: #333;
  }

  .modal-body {
    padding: 30px;
  }

  .modal-body .form-group {
    margin-bottom: 20px;
  }

  .modal-body .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }

  .modal-body label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
  }

  .modal-body input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s ease;
  }

  .modal-body input:focus {
    outline: none;
    border-color: #3498db;
  }

  .modal-body .btn-primary {
    width: 100%;
    background: #3498db;
    color: white;
    border: none;
    padding: 14px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .modal-body .btn-primary:hover {
    background: #2980b9;
    transform: translateY(-2px);
  }

  .modal-footer {
    margin-top: 20px;
    text-align: center;
    color: #666;
  }

  .modal-footer a {
    color: #3498db;
    text-decoration: none;
    font-weight: 600;
  }

  .modal-footer a:hover {
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    .modal-body .form-row {
      grid-template-columns: 1fr;
    }
  }
`;
document.head.appendChild(modalStyles);


