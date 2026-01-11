/**
 * 🛡️ Error Handler - FutureLabs
 * Sistema centralizado para manejo de errores consistente
 */

(function() {
    'use strict';

    /**
     * Maneja errores de forma consistente
     * @param {Error|Object} error - El error a manejar
     * @param {Object} options - Opciones de manejo
     * @param {string} options.context - Contexto donde ocurrió el error
     * @param {string} options.userMessage - Mensaje amigable para el usuario
     * @param {Function} options.onError - Callback opcional para manejo personalizado
     * @param {boolean} options.showNotification - Si mostrar notificación al usuario (default: true)
     * @param {boolean} options.logError - Si registrar el error (default: true)
     */
    function handleError(error, options = {}) {
        const {
            context = 'Unknown',
            userMessage = null,
            onError = null,
            showNotification = true,
            logError = true
        } = options;

        // Extraer mensaje del error
        let errorMessage = 'Ha ocurrido un error';
        let errorDetails = null;

        if (error instanceof Error) {
            errorMessage = error.message || errorMessage;
            errorDetails = {
                name: error.name,
                stack: error.stack,
                message: error.message
            };
        } else if (typeof error === 'string') {
            errorMessage = error;
        } else if (error && error.message) {
            errorMessage = error.message;
            errorDetails = error;
        } else if (error && error.data && error.data.message) {
            errorMessage = error.data.message;
            errorDetails = error.data;
        }

        // Log del error
        if (logError && window.Logger) {
            window.Logger.error(`[${context}]`, errorMessage, errorDetails || error);
        }

        // Mensaje para el usuario
        const finalUserMessage = userMessage || errorMessage || 'Ha ocurrido un error. Por favor, intenta de nuevo.';

        // Mostrar notificación
        if (showNotification && window.notifications) {
            // Determinar tipo de notificación basado en el error
            let notificationType = 'error';
            
            // Errores de red
            if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
                window.notifications.error('Error de Conexión', 'No se pudo conectar con el servidor. Verifica tu conexión a internet.');
            }
            // Errores de autenticación
            else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('token')) {
                window.notifications.warning('Sesión Expirada', 'Por favor, inicia sesión nuevamente.');
                // Opcional: redirigir a login después de un delay
                setTimeout(() => {
                    if (window.location.pathname !== '/login.html' && window.location.pathname !== '/admin-login.html') {
                        window.location.href = 'login.html';
                    }
                }, 2000);
            }
            // Errores de permisos
            else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
                window.notifications.error('Acceso Denegado', 'No tienes permisos para realizar esta acción.');
            }
            // Errores de validación
            else if (errorMessage.includes('400') || errorMessage.includes('validation') || errorMessage.includes('invalid')) {
                window.notifications.warning('Datos Inválidos', finalUserMessage);
            }
            // Errores del servidor
            else if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
                window.notifications.error('Error del Servidor', 'El servidor está experimentando problemas. Por favor, intenta más tarde.');
            }
            // Error genérico
            else {
                window.notifications.error('Error', finalUserMessage);
            }
        }

        // Callback personalizado
        if (onError && typeof onError === 'function') {
            try {
                onError(error, errorMessage, errorDetails);
            } catch (callbackError) {
                if (window.Logger) {
                    window.Logger.error('[ErrorHandler] Error en callback personalizado:', callbackError);
                }
            }
        }

        // Retornar información del error para uso adicional
        return {
            message: errorMessage,
            details: errorDetails,
            context: context
        };
    }

    /**
     * Maneja errores de API de forma consistente
     * @param {Error|Object} error - Error de la API
     * @param {string} context - Contexto de la operación
     * @param {string} userMessage - Mensaje amigable opcional
     */
    function handleAPIError(error, context, userMessage = null) {
        return handleError(error, {
            context: `API:${context}`,
            userMessage: userMessage,
            showNotification: true,
            logError: true
        });
    }

    /**
     * Maneja errores de validación
     * @param {string|Error} error - Error de validación
     * @param {string} field - Campo que falló la validación
     */
    function handleValidationError(error, field = null) {
        const message = field 
            ? `El campo "${field}" no es válido: ${error instanceof Error ? error.message : error}`
            : (error instanceof Error ? error.message : error);

        return handleError(error, {
            context: 'Validation',
            userMessage: message,
            showNotification: true,
            logError: false // Los errores de validación no necesitan log
        });
    }

    /**
     * Wrapper para funciones async con manejo de errores automático
     * @param {Function} asyncFn - Función async a ejecutar
     * @param {Object} options - Opciones de manejo de errores
     */
    async function safeAsync(asyncFn, options = {}) {
        try {
            return await asyncFn();
        } catch (error) {
            return handleError(error, {
                context: options.context || 'AsyncOperation',
                userMessage: options.userMessage,
                showNotification: options.showNotification !== false,
                logError: options.logError !== false,
                onError: options.onError
            });
        }
    }

    // Exportar funciones globalmente
    window.ErrorHandler = {
        handle: handleError,
        api: handleAPIError,
        validation: handleValidationError,
        safe: safeAsync
    };

    if (window.Logger) {
        window.Logger.log('✅ ErrorHandler inicializado');
    }
})();
