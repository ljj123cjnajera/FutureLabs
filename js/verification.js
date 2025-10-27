// ✉️ Sistema de Verificación de Email

class VerificationManager {
  constructor() {
    this.currentEmail = null;
    this.verificationModal = null;
    this.init();
  }

  init() {
    // Crear modal de verificación si no existe
    this.createVerificationModal();
    
    // Escuchar eventos de verificación
    document.addEventListener('authStateChanged', () => {
      // Actualizar UI según estado de autenticación
    });
  }

  createVerificationModal() {
    // Verificar si el modal ya existe
    if (document.getElementById('verificationModal')) {
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'verificationModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content verification-modal">
        <span class="close">&times;</span>
        <div class="modal-header">
          <h2>✉️ Verifica tu Email</h2>
        </div>
        <div class="modal-body">
          <p>Hemos enviado un código de verificación a:</p>
          <p id="verificationEmail" style="font-weight: bold; color: #667eea;"></p>
          <p style="margin: 20px 0;">Ingresa el código de 6 dígitos que recibiste:</p>
          
          <form id="verificationForm">
            <div class="form-group">
              <input 
                type="text" 
                id="verificationCode" 
                class="form-control" 
                placeholder="000000"
                maxlength="6"
                pattern="[0-9]{6}"
                required
              />
            </div>
            <button type="submit" class="btn btn-primary btn-block">
              Verificar Email
            </button>
          </form>
          
          <div id="verificationError" class="error-message" style="display: none;"></div>
          <div id="verificationSuccess" class="success-message" style="display: none;"></div>
          
          <p style="margin-top: 20px; font-size: 14px; color: #666;">
            ¿No recibiste el código?
            <a href="#" id="resendCodeLink" style="color: #667eea;">Reenviar código</a>
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.verificationModal = modal;

    // Configurar eventos
    this.setupEvents();
  }

  setupEvents() {
    // Cerrar modal
    const closeBtn = document.querySelector('#verificationModal .close');
    closeBtn.addEventListener('click', () => {
      this.hideModal();
    });

    // Click fuera del modal
    this.verificationModal.addEventListener('click', (e) => {
      if (e.target === this.verificationModal) {
        this.hideModal();
      }
    });

    // Enviar formulario de verificación
    const form = document.getElementById('verificationForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.verifyCode();
    });

    // Reenviar código
    const resendLink = document.getElementById('resendCodeLink');
    resendLink.addEventListener('click', async (e) => {
      e.preventDefault();
      await this.resendCode();
    });

    // Auto-focus y formatear input de código
    const codeInput = document.getElementById('verificationCode');
    codeInput.addEventListener('input', (e) => {
      // Solo permitir números
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  }

  async showModal(email) {
    this.currentEmail = email;
    const emailElement = document.getElementById('verificationEmail');
    emailElement.textContent = email;
    
    this.verificationModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus en el input
    const codeInput = document.getElementById('verificationCode');
    codeInput.focus();
  }

  hideModal() {
    this.verificationModal.classList.remove('active');
    document.body.style.overflow = '';
    this.currentEmail = null;
    
    // Limpiar formulario
    const form = document.getElementById('verificationForm');
    form.reset();
    
    // Limpiar mensajes
    this.showError('');
    this.showSuccess('');
  }

  async verifyCode() {
    const codeInput = document.getElementById('verificationCode');
    const code = codeInput.value.trim();

    // Validar código
    if (code.length !== 6) {
      this.showError('El código debe tener 6 dígitos');
      return;
    }

    try {
      // Deshabilitar botón
      const submitBtn = document.querySelector('#verificationForm button');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Verificando...';

      // Enviar código
      const response = await window.api.verifyEmail(this.currentEmail, code);

      if (response.success) {
        this.showSuccess('¡Email verificado exitosamente!');
        
        // Cerrar modal después de 1 segundo
        setTimeout(() => {
          this.hideModal();
          // Mostrar modal de login para que el usuario inicie sesión
          if (window.modals && window.modals.showLoginModal) {
            window.modals.showLoginModal();
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error verificando código:', error);
      this.showError(error.message || 'Código inválido o expirado');
    } finally {
      // Rehabilitar botón
      const submitBtn = document.querySelector('#verificationForm button');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Verificar Email';
    }
  }

  async resendCode() {
    try {
      const resendLink = document.getElementById('resendCodeLink');
      const originalText = resendLink.textContent;
      resendLink.textContent = 'Enviando...';
      resendLink.style.pointerEvents = 'none';

      await window.api.resendVerificationCode(this.currentEmail);
      
      this.showSuccess('¡Código reenviado! Revisa tu email.');
      
      setTimeout(() => {
        this.showSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error reenviando código:', error);
      this.showError('Error al reenviar código. Intenta nuevamente.');
    } finally {
      const resendLink = document.getElementById('resendCodeLink');
      resendLink.textContent = 'Reenviar código';
      resendLink.style.pointerEvents = 'auto';
    }
  }

  showError(message) {
    const errorElement = document.getElementById('verificationError');
    if (message) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    } else {
      errorElement.style.display = 'none';
    }
  }

  showSuccess(message) {
    const successElement = document.getElementById('verificationSuccess');
    if (message) {
      successElement.textContent = message;
      successElement.style.display = 'block';
    } else {
      successElement.style.display = 'none';
    }
  }
}

// Crear instancia global
window.verificationManager = new VerificationManager();

