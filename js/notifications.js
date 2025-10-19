// 🔔 Sistema de Notificaciones
class NotificationManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // Crear contenedor de notificaciones
    this.container = document.createElement('div');
    this.container.className = 'notifications-container';
    document.body.appendChild(this.container);
  }

  show(message, type = 'info', duration = 5000) {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Icono según el tipo
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    
    notification.innerHTML = `
      <div class="notification-icon">${icons[type] || icons.info}</div>
      <div class="notification-message">${message}</div>
      <button class="notification-close">&times;</button>
    `;
    
    // Agregar al contenedor
    this.container.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Botón de cerrar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => this.remove(notification));
    
    // Auto-remover después de la duración
    if (duration > 0) {
      setTimeout(() => this.remove(notification), duration);
    }
    
    return notification;
  }

  remove(notification) {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }

  success(message, duration = 5000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 7000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 6000) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 5000) {
    return this.show(message, 'info', duration);
  }
}

// Crear instancia global
window.notifications = new NotificationManager();

// Función global para compatibilidad
window.showNotification = function(message, type = 'info') {
  window.notifications.show(message, type);
};

