// 📝 Sistema de Logging Condicional - FutureLabs
// Permite desactivar logs en producción

(function() {
  'use strict';

  // Detectar si estamos en desarrollo o producción
  const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('localhost') ||
                        window.location.protocol === 'file:';

  // Configuración de logging
  const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  };

  const currentLogLevel = isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;

  // Función helper para formatear mensajes
  function formatMessage(level, emoji, message, ...args) {
    const timestamp = isDevelopment ? `[${new Date().toLocaleTimeString()}]` : '';
    return `${timestamp} ${emoji} ${message}`;
  }

  // Logger principal
  window.Logger = {
    error: function(message, ...args) {
      if (currentLogLevel >= LOG_LEVELS.ERROR) {
        console.error(formatMessage('ERROR', '❌', message), ...args);
      }
    },

    warn: function(message, ...args) {
      if (currentLogLevel >= LOG_LEVELS.WARN) {
        console.warn(formatMessage('WARN', '⚠️', message), ...args);
      }
    },

    info: function(message, ...args) {
      if (currentLogLevel >= LOG_LEVELS.INFO) {
        console.log(formatMessage('INFO', 'ℹ️', message), ...args);
      }
    },

    debug: function(message, ...args) {
      if (currentLogLevel >= LOG_LEVELS.DEBUG) {
        console.log(formatMessage('DEBUG', '🔍', message), ...args);
      }
    },

    success: function(message, ...args) {
      if (currentLogLevel >= LOG_LEVELS.INFO) {
        console.log(formatMessage('SUCCESS', '✅', message), ...args);
      }
    },

    // Método para verificar si estamos en desarrollo
    isDevelopment: function() {
      return isDevelopment;
    }
  };

  // Exponer configuración
  if (isDevelopment) {
    console.log('🔧 Logger inicializado en modo DESARROLLO');
  }
})();

