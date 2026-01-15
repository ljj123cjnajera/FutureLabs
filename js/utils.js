/**
 * 🛠️ UTILITIES - Funciones de utilidad compartidas
 * Versión: 1.0
 * 
 * Funciones comunes reutilizables en todo el proyecto
 */

(function() {
    'use strict';

    /**
     * Formatea un valor numérico como moneda peruana (S/)
     * @param {number|string} value - Valor a formatear
     * @param {object} options - Opciones de formato
     * @returns {string} Valor formateado (ej: "S/ 99.99")
     */
    function formatCurrency(value, options = {}) {
        const amount = Number(value) || 0;
        const {
            showSymbol = true,
            decimals = 2,
            locale = 'es-PE'
        } = options;

        if (showSymbol) {
            return `S/ ${amount.toFixed(decimals)}`;
        }

        // Usar Intl.NumberFormat para formato más robusto si no se necesita símbolo
        const formatter = new Intl.NumberFormat(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
        return formatter.format(amount);
    }

    /**
     * Formatea un valor numérico como moneda usando Intl.NumberFormat
     * @param {number|string} value - Valor a formatear
     * @param {string} currency - Código de moneda (default: 'PEN')
     * @returns {string} Valor formateado (ej: "S/ 99.99")
     */
    function formatCurrencyIntl(value, currency = 'PEN') {
        const amount = Number(value) || 0;
        const formatter = new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return formatter.format(amount);
    }

    /**
     * Valida si un email es válido
     * @param {string} email - Email a validar
     * @returns {boolean} true si es válido
     */
    function validateEmail(email) {
        if (!email || typeof email !== 'string') return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    /**
     * Valida si un teléfono es válido (formato peruano básico)
     * @param {string} phone - Teléfono a validar
     * @returns {boolean} true si es válido
     */
    function validatePhone(phone) {
        if (!phone || typeof phone !== 'string') return false;
        // Formato peruano: 9 dígitos, puede empezar con 9
        const phoneRegex = /^9\d{8}$/;
        const cleaned = phone.replace(/\D/g, '');
        return phoneRegex.test(cleaned);
    }

    /**
     * Sanitiza un string para prevenir XSS
     * @param {string} str - String a sanitizar
     * @returns {string} String sanitizado
     */
    function sanitizeString(str) {
        if (!str || typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Debounce function - Limita la frecuencia de ejecución de una función
     * @param {Function} func - Función a ejecutar
     * @param {number} wait - Tiempo de espera en ms
     * @returns {Function} Función con debounce
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function - Limita la frecuencia de ejecución de una función
     * @param {Function} func - Función a ejecutar
     * @param {number} limit - Tiempo límite en ms
     * @returns {Function} Función con throttle
     */
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Formatea un número con separadores de miles
     * @param {number|string} value - Valor a formatear
     * @param {string} locale - Locale (default: 'es-PE')
     * @returns {string} Número formateado
     */
    function formatNumber(value, locale = 'es-PE') {
        const num = Number(value) || 0;
        return num.toLocaleString(locale);
    }

    /**
     * Obtiene parámetros de URL
     * @param {string} name - Nombre del parámetro
     * @param {string} url - URL (opcional, usa window.location si no se proporciona)
     * @returns {string|null} Valor del parámetro o null
     */
    function getURLParam(name, url = null) {
        const urlObj = new URL(url || window.location.href);
        return urlObj.searchParams.get(name);
    }

    /**
     * Actualiza parámetros de URL sin recargar la página
     * @param {object} params - Objeto con parámetros a actualizar
     * @param {boolean} replace - Si true, reemplaza la entrada del historial
     */
    function updateURLParams(params, replace = false) {
        const url = new URL(window.location.href);
        Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                url.searchParams.delete(key);
            } else {
                url.searchParams.set(key, value);
            }
        });
        if (replace) {
            window.history.replaceState({}, '', url);
        } else {
            window.history.pushState({}, '', url);
        }
    }

    // Exportar al scope global
    window.Utils = {
        formatCurrency,
        formatCurrencyIntl,
        validateEmail,
        validatePhone,
        sanitizeString,
        debounce,
        throttle,
        formatNumber,
        getURLParam,
        updateURLParams
    };

    // También exportar funciones individuales para compatibilidad
    window.formatCurrency = formatCurrency;
    window.formatCurrencyIntl = formatCurrencyIntl;
    window.validateEmail = validateEmail;
    window.validatePhone = validatePhone;
})();
