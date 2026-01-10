// 🔐 Sistema de Autenticación
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isInitializing = true;
    this.token = localStorage.getItem('auth_token');

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  async init() {
    this.isInitializing = true;
    const token = localStorage.getItem('auth_token');

    if (token) {
      try {
        if (!window.api) {
          await new Promise(resolve => {
            const checkApi = setInterval(() => {
              if (window.api) {
                clearInterval(checkApi);
                resolve();
              }
            }, 100);
          });
        }

        window.api.setToken(token);
        const user = await this.getCurrentUser();

        if (user) {
          this.currentUser = user;
          document.dispatchEvent(new Event('authStateChanged'));
        } else {
          this.currentUser = null;
          document.dispatchEvent(new Event('authStateChanged'));
        }
      } catch (error) {
        if (window.Logger) window.Logger.error('Auth Error:', error.message);
        this.currentUser = null;

        if (error.status === 401 || error.status === 403) {
          window.api.setToken(null);
          localStorage.removeItem('auth_token');
        }
        document.dispatchEvent(new Event('authStateChanged'));
      }
    } else {
      this.currentUser = null;
      document.dispatchEvent(new Event('authStateChanged'));
    }

    this.isInitializing = false;
  }

  async login(email, password) {
    try {
      if (!email || !password) throw new Error('Completa todos los campos.');

      const response = await window.api.login(email, password);

      if (response.success) {
        this.currentUser = response.data.user;
        window.api.setToken(response.data.token);
        document.dispatchEvent(new Event('authStateChanged'));
        this.showNotification('Login exitoso', 'success');
        return true;
      }
      return false;
    } catch (error) {
      if (window.Logger) window.Logger.error('Login Error:', error);
      if (error.message && error.message.includes('verifica tu email')) {
        if (window.verificationManager) {
          window.verificationManager.showModal(email);
        }
      } else {
        this.showNotification(error.message, 'error');
      }
      return false;
    }
  }

  async register(userData) {
    try {
      const response = await window.api.register(userData);

      if (response.success) {
        if (response.data.requires_verification) {
          if (window.modals && window.modals.hideRegisterModal) {
            window.modals.hideRegisterModal();
          }
          if (window.verificationManager) {
            await window.verificationManager.showModal(userData.email);
          }
          this.showNotification(response.message, 'success');
          return true;
        }

        this.currentUser = response.data.user;
        window.api.setToken(response.data.token);
        document.dispatchEvent(new Event('authStateChanged'));
        this.showNotification('Registro exitoso', 'success');
        return true;
      }
      return false;
    } catch (error) {
      if (window.Logger) window.Logger.error('Register Error:', error);
      this.showNotification(error.message, 'error');
      return false;
    }
  }

  async logout() {
    try {
      if (window.api && window.api.token) {
        await window.api.logout();
      }
      this.currentUser = null;
      if (window.api) window.api.setToken(null);
      localStorage.removeItem('auth_token');
      document.dispatchEvent(new Event('authStateChanged'));
      this.showNotification('Sesión cerrada', 'info');
      return true;
    } catch (error) {
      if (window.Logger) window.Logger.error('Logout Error:', error);
      this.currentUser = null;
      localStorage.removeItem('auth_token');
      document.dispatchEvent(new Event('authStateChanged'));
      return true;
    }
  }

  async getCurrentUser() {
    try {
      const response = await window.api.getCurrentUser();
      if (response.success) {
        this.currentUser = response.data.user;
        return this.currentUser;
      }
      return null;
    } catch (error) {
      // Silent fail for expected guest states
      throw error;
    }
  }

  isAuthenticated() {
    if (this.token) return true;
    return this.currentUser !== null;
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  }

  showNotification(message, type = 'info') {
    if (typeof window.notifications !== 'undefined') {
      window.notifications.show(message, type);
    } else {
      if (window.Logger) window.Logger.log(`[${type.toUpperCase()}] ${message}`);
    }
  }
}

window.authManager = new AuthManager();
