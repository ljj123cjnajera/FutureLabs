/**
 * ⏳ Loading States Manager - FutureLabs
 * Sistema centralizado para estados de carga consistentes
 */

(function() {
    'use strict';

    /**
     * Muestra un estado de carga
     * @param {HTMLElement|string} container - Contenedor donde mostrar el loading
     * @param {Object} options - Opciones de configuración
     */
    function showLoading(container, options = {}) {
        const {
            message = 'Cargando...',
            type = 'spinner', // 'spinner', 'skeleton', 'dots', 'pulse'
            fullScreen = false,
            overlay = false
        } = options;

        const target = typeof container === 'string' 
            ? document.getElementById(container) || document.querySelector(container)
            : container;

        if (!target) {
            if (window.Logger) window.Logger.warn('[LoadingStates] Container not found:', container);
            return null;
        }

        // Guardar contenido original si no está guardado
        if (!target.dataset.originalContent) {
            target.dataset.originalContent = target.innerHTML;
        }

        let loadingHTML = '';

        switch (type) {
            case 'skeleton':
                loadingHTML = getSkeletonHTML(target);
                break;
            case 'dots':
                loadingHTML = getDotsHTML(message);
                break;
            case 'pulse':
                loadingHTML = getPulseHTML(message);
                break;
            case 'spinner':
            default:
                loadingHTML = getSpinnerHTML(message);
                break;
        }

        if (overlay) {
            target.style.position = 'relative';
            const overlayEl = document.createElement('div');
            overlayEl.className = 'loading-overlay';
            overlayEl.innerHTML = loadingHTML;
            overlayEl.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            `;
            target.appendChild(overlayEl);
            return overlayEl;
        } else {
            target.innerHTML = loadingHTML;
            return target;
        }
    }

    /**
     * Oculta el estado de carga y restaura el contenido original
     * @param {HTMLElement|string} container - Contenedor
     * @param {boolean} restoreContent - Si restaurar contenido original
     */
    function hideLoading(container, restoreContent = true) {
        const target = typeof container === 'string' 
            ? document.getElementById(container) || document.querySelector(container)
            : container;

        if (!target) return;

        // Remover overlay si existe
        const overlay = target.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
            return;
        }

        // Restaurar contenido original si está guardado
        if (restoreContent && target.dataset.originalContent) {
            target.innerHTML = target.dataset.originalContent;
            delete target.dataset.originalContent;
        }
    }

    /**
     * Muestra un estado vacío
     * @param {HTMLElement|string} container - Contenedor
     * @param {Object} options - Opciones
     */
    function showEmpty(container, options = {}) {
        const {
            icon = 'fas fa-box-open',
            title = 'Sin resultados',
            message = 'No se encontraron elementos',
            actionLabel = null,
            actionUrl = null,
            actionCallback = null
        } = options;

        const target = typeof container === 'string' 
            ? document.getElementById(container) || document.querySelector(container)
            : container;

        if (!target) return;

        let actionHTML = '';
        if (actionLabel) {
            if (actionUrl) {
                actionHTML = `<a href="${actionUrl}" class="btn btn-primary" style="margin-top: 1rem;">${actionLabel}</a>`;
            } else if (actionCallback) {
                actionHTML = `<button onclick="${actionCallback}" class="btn btn-primary" style="margin-top: 1rem;">${actionLabel}</button>`;
            }
        }

        target.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 4rem 2rem;">
                <i class="${icon}" style="font-size: 4rem; color: var(--gray-400, #999); margin-bottom: 1.5rem;"></i>
                <h3 style="font-weight: 900; text-transform: uppercase; margin-bottom: 0.5rem; color: var(--black, #000);">${title}</h3>
                <p style="color: var(--gray-600, #666); margin-bottom: 1rem;">${message}</p>
                ${actionHTML}
            </div>
        `;
    }

    /**
     * Muestra un estado de error
     * @param {HTMLElement|string} container - Contenedor
     * @param {Object} options - Opciones
     */
    function showError(container, options = {}) {
        const {
            title = 'Error al cargar',
            message = 'Ocurrió un error. Por favor, intenta de nuevo.',
            retryLabel = 'Reintentar',
            retryCallback = null
        } = options;

        const target = typeof container === 'string' 
            ? document.getElementById(container) || document.querySelector(container)
            : container;

        if (!target) return;

        let retryHTML = '';
        if (retryCallback) {
            retryHTML = `<button onclick="${retryCallback}" class="btn btn-outline" style="margin-top: 1rem;">${retryLabel}</button>`;
        }

        target.innerHTML = `
            <div class="error-state" style="text-align: center; padding: 4rem 2rem; border: 2px dashed var(--error, #dc3545);">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: var(--error, #dc3545); margin-bottom: 1.5rem;"></i>
                <h3 style="font-weight: 900; text-transform: uppercase; margin-bottom: 0.5rem; color: var(--error, #dc3545);">${title}</h3>
                <p style="color: var(--gray-600, #666); margin-bottom: 1rem;">${message}</p>
                ${retryHTML}
            </div>
        `;
    }

    // Helpers para diferentes tipos de loading
    function getSpinnerHTML(message) {
        return `
            <div class="loading-state" style="text-align: center; padding: 4rem 2rem;">
                <div class="spinner" style="
                    width: 50px;
                    height: 50px;
                    border: 4px solid var(--gray-200, #e0e0e0);
                    border-top-color: var(--black, #000);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                "></div>
                <p style="font-weight: 600; color: var(--gray-600, #666);">${message}</p>
            </div>
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
    }

    function getDotsHTML(message) {
        return `
            <div class="loading-state" style="text-align: center; padding: 4rem 2rem;">
                <div class="loading-dots" style="display: flex; justify-content: center; gap: 8px; margin-bottom: 1rem;">
                    <div style="width: 12px; height: 12px; background: var(--black, #000); border-radius: 50%; animation: dot-bounce 1.4s infinite ease-in-out both;"></div>
                    <div style="width: 12px; height: 12px; background: var(--black, #000); border-radius: 50%; animation: dot-bounce 1.4s infinite ease-in-out both; animation-delay: 0.2s;"></div>
                    <div style="width: 12px; height: 12px; background: var(--black, #000); border-radius: 50%; animation: dot-bounce 1.4s infinite ease-in-out both; animation-delay: 0.4s;"></div>
                </div>
                <p style="font-weight: 600; color: var(--gray-600, #666);">${message}</p>
            </div>
            <style>
                @keyframes dot-bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
            </style>
        `;
    }

    function getPulseHTML(message) {
        return `
            <div class="loading-state" style="text-align: center; padding: 4rem 2rem;">
                <div class="pulse-loader" style="
                    width: 60px;
                    height: 60px;
                    background: var(--black, #000);
                    border-radius: 50%;
                    margin: 0 auto 1rem;
                    animation: pulse 1.5s ease-in-out infinite;
                "></div>
                <p style="font-weight: 600; color: var(--gray-600, #666);">${message}</p>
            </div>
            <style>
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.7; }
                }
            </style>
        `;
    }

    function getSkeletonHTML(container) {
        // Detectar tipo de contenedor y generar skeleton apropiado
        const isGrid = container.classList.contains('grid') || container.classList.contains('product-grid');
        const isList = container.classList.contains('list') || container.tagName === 'UL';
        
        if (isGrid) {
            return Array.from({ length: 6 }, () => `
                <div class="skeleton-product-card">
                    <div class="skeleton skeleton-image"></div>
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text" style="width: 60%;"></div>
                    <div class="skeleton skeleton-button" style="margin-top: 1rem;"></div>
                </div>
            `).join('');
        }
        
        // Default skeleton
        return Array.from({ length: 3 }, () => `
            <div class="skeleton skeleton-text"></div>
        `).join('');
    }

    // Exportar funciones globalmente
    window.LoadingStates = {
        show: showLoading,
        hide: hideLoading,
        empty: showEmpty,
        error: showError
    };

    if (window.Logger) {
        window.Logger.log('✅ LoadingStates inicializado');
    }
})();
