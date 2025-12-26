// 📱 Progressive Web App (PWA)
class PWA {
  constructor() {
    this.init();
  }

  init() {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        this.registerServiceWorker();
      });
    }

    // Detectar instalación
    this.detectInstallation();
  }

  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado:', registration);
      
      // Actualizar Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.showUpdateNotification();
          }
        });
      });
    } catch (error) {
      console.error('Error al registrar Service Worker:', error);
    }
  }

  detectInstallation() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      this.showInstallButton();
    });

    // Botón de instalación
    window.installPWA = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('PWA instalada');
        }
        
        deferredPrompt = null;
        this.hideInstallButton();
      }
    };
  }

  showInstallButton() {
    const installButton = document.getElementById('installPWA');
    if (installButton) {
      installButton.style.display = 'block';
    }
  }

  hideInstallButton() {
    const installButton = document.getElementById('installPWA');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }

  showUpdateNotification() {
    if (window.notifications) {
      window.notifications.info('Nueva versión disponible. Recarga la página para actualizar.');
    }
  }

  // Sincronización en background
  async syncCart() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-cart');
    }
  }

  // Notificaciones push
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Compartir
  async share(data) {
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch (error) {
        console.error('Error al compartir:', error);
      }
    }
  }

  // Copiar al portapapeles
  async copyToClipboard(text) {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        console.error('Error al copiar:', error);
        return false;
      }
    }
    return false;
  }
}

// Inicializar PWA
const pwa = new PWA();

// Hacer disponible globalmente
window.pwa = pwa;





