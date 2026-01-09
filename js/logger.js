/**
 * 🎯 Logger System - FutureLabs
 * Sistema de logging condicional para producción
 * 
 * Uso:
 *   import { log, error, warn, info, debug } from './logger.js';
 *   log('Mensaje normal');
 *   error('Error crítico');
 *   debug('Solo en desarrollo');
 */

(function() {
    'use strict';

    // Detectar entorno (producción vs desarrollo)
    const isProduction = window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1' &&
                        !window.location.hostname.includes('localhost');

    // Configuración de niveles de log
    const LOG_LEVELS = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        NONE: 4
    };

    // Nivel actual (en producción solo ERROR, en desarrollo todo)
    const currentLogLevel = isProduction ? LOG_LEVELS.ERROR : LOG_LEVELS.DEBUG;

    /**
     * Logger base
     */
    function logger(level, method, ...args) {
        if (level >= currentLogLevel) {
            // En producción, solo errores críticos
            // En desarrollo, todo
            if (method === 'error' || !isProduction) {
                console[method](...args);
            }
        }
    }

    /**
     * Log normal (info)
     */
    function log(...args) {
        logger(LOG_LEVELS.INFO, 'log', ...args);
    }

    /**
     * Error crítico (siempre visible)
     */
    function error(...args) {
        logger(LOG_LEVELS.ERROR, 'error', ...args);
    }

    /**
     * Warning (solo en desarrollo)
     */
    function warn(...args) {
        logger(LOG_LEVELS.WARN, 'warn', ...args);
    }

    /**
     * Info (solo en desarrollo)
     */
    function info(...args) {
        logger(LOG_LEVELS.INFO, 'info', ...args);
    }

    /**
     * Debug (solo en desarrollo)
     */
    function debug(...args) {
        logger(LOG_LEVELS.DEBUG, 'debug', ...args);
    }

    /**
     * Log con contexto (útil para debugging)
     */
    function logWithContext(context, ...args) {
        if (!isProduction) {
            console.log(`[${context}]`, ...args);
        }
    }

    /**
     * Log de API calls (solo en desarrollo)
     */
    function logAPI(method, url, data) {
        if (!isProduction) {
            console.log(`🌐 [API] ${method} ${url}`, data || '');
        }
    }

    /**
     * Log de errores de API (siempre visible)
     */
    function logAPIError(method, url, error) {
        console.error(`❌ [API Error] ${method} ${url}`, error);
    }

    // Exportar al scope global
    window.Logger = {
        log,
        error,
        warn,
        info,
        debug,
        logWithContext,
        logAPI,
        logAPIError,
        isProduction
    };

    // También exportar funciones individuales para compatibilidad
    window.log = log;
    window.logError = error;
    window.logWarn = warn;
    window.logInfo = info;
    window.logDebug = debug;
})();
