// 🔔 Sistema de Notificaciones Mejorado V2
class NotificationManager {
  constructor() {
    this.container = null;
    this.notifications = [];
    this.maxNotifications = 5;
    this.init();
  }

  init() {
    // Crear contenedor de notificaciones con mejor estructura
    this.container = document.createElement('div');
    this.container.className = 'notifications-container';
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', 'Notificaciones');
    this.container.setAttribute('aria-live', 'polite');
    document.body.appendChild(this.container);
  }

  show(message, type = 'info', duration = 5000, options = {}) {
    // Limpiar notificaciones antiguas si hay demasiadas
    if (this.notifications.length >= this.maxNotifications) {
      const oldest = this.notifications.shift();
      this.remove(oldest);
    }

    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    
    // Iconos mejorados con Font Awesome
    const icons = {
      success: '<i class="fas fa-check-circle" aria-hidden="true"></i>',
      error: '<i class="fas fa-exclamation-circle" aria-hidden="true"></i>',
      warning: '<i class="fas fa-exclamation-triangle" aria-hidden="true"></i>',
      info: '<i class="fas fa-info-circle" aria-hidden="true"></i>'
    };
    
    // Soporte para título y mensaje separados
    const title = options.title ? `<div class="notification-title">${options.title}</div>` : '';
    const messageContent = `<div class="notification-message">${message}</div>`;
    
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">${icons[type] || icons.info}</div>
        <div class="notification-text">
          ${title}
          ${messageContent}
        </div>
      </div>
      <button class="notification-close" aria-label="Cerrar notificación">&times;</button>
    `;
    
    // Agregar al contenedor y al array
    this.container.appendChild(notification);
    this.notifications.push(notification);
    
    // Animar entrada con mejor timing
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });
    
    // Botón de cerrar con mejor manejo
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => this.remove(notification));
    
    // Auto-remover después de la duración
    if (duration > 0) {
      const timeoutId = setTimeout(() => this.remove(notification), duration);
      notification.dataset.timeoutId = timeoutId;
    }
    
    return notification;
  }

  remove(notification) {
    // Limpiar timeout si existe
    if (notification.dataset.timeoutId) {
      clearTimeout(parseInt(notification.dataset.timeoutId));
    }
    
    // Remover del array
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
    
    // Animar salida
    notification.classList.remove('show');
    notification.classList.add('hide');
    
    setTimeout(() => {
      notification.remove();
    }, 300);
  }

  // Métodos de conveniencia mejorados con soporte para títulos
  success(title, message, duration = 5000) {
    // Soporte para formato antiguo (solo mensaje)
    if (typeof message === 'number' || !message) {
      return this.show(title, 'success', message || 5000);
    }
    return this.show(message, 'success', duration, { title });
  }

  error(title, message, duration = 7000) {
    if (typeof message === 'number' || !message) {
      return this.show(title, 'error', message || 7000);
    }
    return this.show(message, 'error', duration, { title });
  }

  warning(title, message, duration = 6000) {
    if (typeof message === 'number' || !message) {
      return this.show(title, 'warning', message || 6000);
    }
    return this.show(message, 'warning', duration, { title });
  }

  info(title, message, duration = 5000) {
    if (typeof message === 'number' || !message) {
      return this.show(title, 'info', message || 5000);
    }
    return this.show(message, 'info', duration, { title });
  }

  // Limpiar todas las notificaciones
  clear() {
    this.notifications.forEach(notification => this.remove(notification));
  }
}

// Crear instancia global
window.notifications = new NotificationManager();

// Función global para compatibilidad (mejorada)
window.showNotification = function(message, type = 'info', duration = 5000) {
  window.notifications.show(message, type, duration);
};

