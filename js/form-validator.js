/**
 * ✅ Form Validator - FutureLabs
 * Sistema centralizado de validación de formularios
 */

(function() {
    'use strict';

    /**
     * Valida un campo según su tipo
     * @param {HTMLElement} field - Campo a validar
     * @param {Object} rules - Reglas de validación
     * @returns {Object} - { valid: boolean, message: string }
     */
    function validateField(field, rules = {}) {
        const value = field.value.trim();
        const type = field.type || 'text';
        const name = field.name || field.id || 'campo';
        const required = field.hasAttribute('required') || rules.required;
        const messages = [];

        // Validación de requerido
        if (required && !value) {
            return {
                valid: false,
                message: `El campo ${getFieldLabel(field)} es obligatorio`
            };
        }

        // Si está vacío y no es requerido, es válido
        if (!value && !required) {
            return { valid: true, message: '' };
        }

        // Validaciones según tipo
        switch (type) {
            case 'email':
                if (!isValidEmail(value)) {
                    messages.push('Debe ser un email válido');
                }
                break;

            case 'password':
                if (rules.minLength && value.length < rules.minLength) {
                    messages.push(`Mínimo ${rules.minLength} caracteres`);
                }
                if (rules.maxLength && value.length > rules.maxLength) {
                    messages.push(`Máximo ${rules.maxLength} caracteres`);
                }
                if (rules.requireUppercase && !/[A-Z]/.test(value)) {
                    messages.push('Debe contener al menos una mayúscula');
                }
                if (rules.requireNumber && !/\d/.test(value)) {
                    messages.push('Debe contener al menos un número');
                }
                break;

            case 'tel':
            case 'phone':
                if (!isValidPhone(value)) {
                    messages.push('Debe ser un número de teléfono válido');
                }
                break;

            case 'url':
                if (!isValidURL(value)) {
                    messages.push('Debe ser una URL válida');
                }
                break;

            case 'number':
                const numValue = parseFloat(value);
                if (isNaN(numValue)) {
                    messages.push('Debe ser un número válido');
                } else {
                    if (rules.min !== undefined && numValue < rules.min) {
                        messages.push(`Debe ser mayor o igual a ${rules.min}`);
                    }
                    if (rules.max !== undefined && numValue > rules.max) {
                        messages.push(`Debe ser menor o igual a ${rules.max}`);
                    }
                }
                break;
        }

        // Validaciones personalizadas
        if (rules.pattern && !rules.pattern.test(value)) {
            messages.push(rules.patternMessage || 'Formato inválido');
        }

        if (rules.custom && typeof rules.custom === 'function') {
            const customResult = rules.custom(value, field);
            if (customResult !== true) {
                messages.push(customResult || 'Validación personalizada falló');
            }
        }

        // Validación de longitud
        if (rules.minLength && value.length < rules.minLength) {
            messages.push(`Mínimo ${rules.minLength} caracteres`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
            messages.push(`Máximo ${rules.maxLength} caracteres`);
        }

        return {
            valid: messages.length === 0,
            message: messages.join(', ')
        };
    }

    /**
     * Valida un formulario completo
     * @param {HTMLFormElement} form - Formulario a validar
     * @param {Object} options - Opciones
     * @returns {Object} - { valid: boolean, errors: Array }
     */
    function validateForm(form, options = {}) {
        const {
            showErrors = true,
            focusFirstError = true,
            stopOnFirstError = false
        } = options;

        const errors = [];
        const fields = form.querySelectorAll('input, textarea, select');
        let firstErrorField = null;

        fields.forEach(field => {
            // Obtener reglas del campo
            const rules = getFieldRules(field);
            const result = validateField(field, rules);

            if (!result.valid) {
                errors.push({
                    field: field,
                    message: result.message
                });

                if (showErrors) {
                    showFieldError(field, result.message);
                }

                if (focusFirstError && !firstErrorField) {
                    firstErrorField = field;
                }

                if (stopOnFirstError) {
                    return;
                }
            } else {
                clearFieldError(field);
            }
        });

        // Validaciones de formulario completo (ej: confirmar contraseña)
        if (options.customValidation) {
            const customResult = options.customValidation(form);
            if (!customResult.valid) {
                errors.push({
                    field: null,
                    message: customResult.message
                });
            }
        }

        if (focusFirstError && firstErrorField) {
            firstErrorField.focus();
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Obtiene las reglas de validación de un campo
     * @param {HTMLElement} field - Campo
     * @returns {Object} - Reglas
     */
    function getFieldRules(field) {
        const rules = {};

        // Leer de data attributes
        if (field.dataset.minLength) rules.minLength = parseInt(field.dataset.minLength);
        if (field.dataset.maxLength) rules.maxLength = parseInt(field.dataset.maxLength);
        if (field.dataset.min) rules.min = parseFloat(field.dataset.min);
        if (field.dataset.max) rules.max = parseFloat(field.dataset.max);
        if (field.dataset.pattern) {
            rules.pattern = new RegExp(field.dataset.pattern);
            if (field.dataset.patternMessage) {
                rules.patternMessage = field.dataset.patternMessage;
            }
        }

        // Reglas específicas de password
        if (field.type === 'password') {
            if (field.dataset.requireUppercase === 'true') {
                rules.requireUppercase = true;
            }
            if (field.dataset.requireNumber === 'true') {
                rules.requireNumber = true;
            }
        }

        return rules;
    }

    /**
     * Muestra error en un campo
     * @param {HTMLElement} field - Campo
     * @param {string} message - Mensaje de error
     */
    function showFieldError(field, message) {
        clearFieldError(field);

        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');

        // Crear o actualizar mensaje de error
        let errorElement = field.parentElement.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.setAttribute('role', 'alert');
            field.parentElement.appendChild(errorElement);
        }

        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // Agregar estilo inline si no hay CSS
        if (!document.querySelector('style[data-form-validator]')) {
            const style = document.createElement('style');
            style.setAttribute('data-form-validator', 'true');
            style.textContent = `
                .field-error {
                    color: var(--error, #dc3545);
                    font-size: 0.875rem;
                    margin-top: 0.25rem;
                    font-weight: 600;
                }
                input.error, textarea.error, select.error {
                    border-color: var(--error, #dc3545) !important;
                    border-width: 2px !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Limpia error de un campo
     * @param {HTMLElement} field - Campo
     */
    function clearFieldError(field) {
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');

        const errorElement = field.parentElement.querySelector('.field-error');
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }
    }

    /**
     * Obtiene el label de un campo
     * @param {HTMLElement} field - Campo
     * @returns {string} - Label
     */
    function getFieldLabel(field) {
        const id = field.id;
        if (id) {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) return label.textContent.trim();
        }
        return field.name || field.placeholder || 'campo';
    }

    // Helpers de validación
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
        // Acepta números con o sin espacios, guiones, paréntesis
        const cleaned = phone.replace(/[\s\-\(\)]/g, '');
        return /^\+?[\d]{7,15}$/.test(cleaned);
    }

    function isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Inicializa validación en tiempo real para un formulario
     * @param {HTMLFormElement} form - Formulario
     */
    function initRealTimeValidation(form) {
        const fields = form.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            // Validar al perder foco
            field.addEventListener('blur', () => {
                const rules = getFieldRules(field);
                const result = validateField(field, rules);
                if (!result.valid) {
                    showFieldError(field, result.message);
                } else {
                    clearFieldError(field);
                }
            });

            // Limpiar error al escribir
            field.addEventListener('input', () => {
                if (field.classList.contains('error')) {
                    const rules = getFieldRules(field);
                    const result = validateField(field, rules);
                    if (result.valid) {
                        clearFieldError(field);
                    }
                }
            });
        });
    }

    // Exportar funciones globalmente
    window.FormValidator = {
        validateField: validateField,
        validateForm: validateForm,
        showError: showFieldError,
        clearError: clearFieldError,
        initRealTime: initRealTimeValidation
    };

    if (window.Logger) {
        window.Logger.log('✅ FormValidator inicializado');
    }
})();
