// 🔐 Sistema de Autenticación
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isInitializing = true; // Estado de inicialización
    // Esperar a que el DOM esté listo antes de inicializar
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  async init() {
    console.log('🔧 AuthManager init() - Iniciando...');
    this.isInitializing = true;

    // Verificar si hay token guardado
    const token = localStorage.getItem('auth_token');
    console.log('🔑 Token en localStorage:', token ? token.substring(0, 20) + '...' : 'No hay token');

    if (token) {
      try {
        // Esperar a que window.api esté disponible
        if (!window.api) {
          console.log('⏳ Esperando a que window.api esté disponible...');
          await new Promise(resolve => {
            const checkApi = setInterval(() => {
              if (window.api) {
                clearInterval(checkApi);
                resolve();
              }
            }, 100);
          });
        }

        console.log('✅ window.api está disponible');
        // Actualizar token en el API client
        window.api.setToken(token);
        console.log('💾 Token actualizado en API client');

        const user = await this.getCurrentUser();
        if (user) {
          this.currentUser = user;
          console.log('✅ Usuario cargado:', this.currentUser.email);
          // Disparar evento de cambio de estado
          document.dispatchEvent(new Event('authStateChanged'));
          console.log('🎉 Evento authStateChanged disparado');
        } else {
          // No se obtuvo usuario pero no hubo error explícito
          console.warn('⚠️ No se pudo obtener el usuario actual, manteniendo el token para reintentar.');
          this.currentUser = null;
          document.dispatchEvent(new Event('authStateChanged'));
        }
      } catch (error) {
        console.error('❌ Error al cargar usuario:', error);
        this.currentUser = null;

        if (error.status === 401 || error.status === 403) {
          console.log('❌ Token inválido/expirado, limpiando credenciales');
          window.api.setToken(null);
          localStorage.removeItem('auth_token');
        } else {
          console.warn('⚠️ Manteniendo token para reintentar más tarde');
        }

        // Disparar evento de cambio de estado
        document.dispatchEvent(new Event('authStateChanged'));
      }
    } else {
      console.log('ℹ️ No hay token, modo invitado');
      this.currentUser = null;
      // Disparar evento de cambio de estado
      document.dispatchEvent(new Event('authStateChanged'));
    }

    // Marcar como inicializado
    this.isInitializing = false;
    console.log('✅ AuthManager inicializado completamente');
  }

  async login(email, password) {
    try {
      console.log('🔐 AuthManager.login() - Iniciando con:', email);

      // 🛡️ Form Guards
      if (!email || !password) {
        throw new Error('Por favor, completa todos los campos.');
      }
      if (!email.includes('@')) {
        throw new Error('Ingresa un correo electrónico válido.');
      }
      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.');
      }

      const response = await window.api.login(email, password);
      console.log('📥 Respuesta del servidor:', response);

      if (response.success) {
        this.currentUser = response.data.user;
        console.log('✅ Usuario autenticado:', this.currentUser.email);

        // Guardar token usando el método del API client
        window.api.setToken(response.data.token);
        console.log('💾 Token guardado en API client');

        // Verificar que el token se guardó correctamente
        const savedToken = localStorage.getItem('auth_token');
        console.log('🔍 Token verificado en localStorage:', savedToken ? savedToken.substring(0, 20) + '...' : 'NO ENCONTRADO');

        // Disparar evento de cambio de estado
        document.dispatchEvent(new Event('authStateChanged'));
        console.log('🎉 Evento authStateChanged disparado');

        this.showNotification('Login exitoso', 'success');
        console.log('✅ Login completado exitosamente');
        return true;
      }

      console.log('❌ Login fallido:', response.message);
      return false;
    } catch (error) {
      console.error('❌ Error en login:', error);

      // Verificar si el error es porque el email no está verificado
      if (error.message && error.message.includes('verifica tu email')) {
        this.showNotification(error.message + ' Por favor, ingresa el código de verificación.', 'warning');

        // Mostrar modal de verificación
        if (window.verificationManager) {
          window.verificationManager.showModal(email);
        }
      } else {
        this.showNotification('Error al iniciar sesión: ' + error.message, 'error');
      }

      return false;
    }
  }

  async register(userData) {
    try {
      console.log('📝 AuthManager.register() - Iniciando con:', userData.email);
      const response = await window.api.register(userData);
      console.log('📥 Respuesta del servidor:', response);

      if (response.success) {
        console.log('✅ Usuario registrado:', userData.email);

        // Si requiere verificación de email, mostrar modal
        if (response.data.requires_verification) {
          console.log('✉️ Usuario necesita verificar email');

          // Cerrar modal de registro
          if (window.modals && window.modals.hideRegisterModal) {
            window.modals.hideRegisterModal();
          }

          // Mostrar modal de verificación directamente
          // (Ya no mostramos el código en alert, el modal tiene su propio input)
          if (window.verificationManager) {
            await window.verificationManager.showModal(userData.email);
          }

          this.showNotification(response.message, 'success');
          return true;
        }

        // Si no requiere verificación (login antiguo)
        this.currentUser = response.data.user;
        window.api.setToken(response.data.token);

        const savedToken = localStorage.getItem('auth_token');
        console.log('🔍 Token verificado en localStorage:', savedToken ? savedToken.substring(0, 20) + '...' : 'NO ENCONTRADO');

        document.dispatchEvent(new Event('authStateChanged'));
        console.log('🎉 Evento authStateChanged disparado');

        this.showNotification('Registro exitoso', 'success');
        console.log('✅ Registro completado exitosamente');
        return true;
      }

      console.log('❌ Registro fallido:', response.message);
      return false;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      this.showNotification('Error al registrarse: ' + error.message, 'error');
      return false;
    }
  }

  async logout() {
    try {
      console.log('🔐 AuthManager.logout() - Iniciando...');

      // Llamar al backend para cerrar sesión
      if (window.api && window.api.token) {
        console.log('📤 Enviando petición de logout al backend...');
        await window.api.logout();
        console.log('✅ Respuesta del backend recibida');
      }

      // Limpiar estado local
      this.currentUser = null;
      console.log('🧹 currentUser limpiado');

      // Eliminar token usando el método del API client
      if (window.api) {
        window.api.setToken(null);
        console.log('🧹 Token eliminado del API client');
      }

      // Eliminar token de localStorage directamente
      localStorage.removeItem('auth_token');
      console.log('🧹 Token eliminado de localStorage');

      // Disparar evento de cambio de estado
      document.dispatchEvent(new Event('authStateChanged'));
      console.log('🎉 Evento authStateChanged disparado');

      this.showNotification('Sesión cerrada', 'info');
      console.log('✅ Logout completado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error en logout:', error);
      // Aún así, limpiar el estado local
      this.currentUser = null;
      if (window.api) {
        window.api.setToken(null);
      }
      localStorage.removeItem('auth_token');
      document.dispatchEvent(new Event('authStateChanged'));
      this.showNotification('Sesión cerrada', 'info');
      return true; // Retornar true para que no bloquee el flujo
    }
  }

  async getCurrentUser() {
    try {
      console.log('🔍 Llamando a getCurrentUser...');
      console.log('🔑 Token actual:', window.api.token ? window.api.token.substring(0, 20) + '...' : 'No hay token');

      const response = await window.api.getCurrentUser();
      console.log('📥 Respuesta de getCurrentUser:', response);

      if (response.success) {
        this.currentUser = response.data.user;
        console.log('✅ Usuario obtenido:', this.currentUser.email);
        return this.currentUser;
      }

      console.log('❌ getCurrentUser falló:', response.message);
      return null;
    } catch (error) {
      console.error('❌ Error en getCurrentUser:', error);
      throw error;
    }
  }

  isAuthenticated() {
    // No permitir autenticación mientras está inicializando
    if (this.isInitializing) {
      console.log('⏳ isAuthenticated: Inicializando, retornando false');
      return false;
    }

    const authenticated = this.currentUser !== null;
    console.log('🔍 isAuthenticated:', authenticated, 'currentUser:', this.currentUser);
    return authenticated;
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  }

  showNotification(message, type = 'info') {
    if (typeof window.notifications !== 'undefined') {
      window.notifications.show(message, type);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification(message, type);
    } else {
      window.alert(message);
    }
  }
}

// Crear instancia global
window.authManager = new AuthManager();

