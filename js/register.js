document.addEventListener('DOMContentLoaded', () => {
    // Initialize header and footer
    if (window.Components) {
        const headerContainer = document.getElementById('mainHeader');
        if (headerContainer && !headerContainer.innerHTML.trim()) {
            headerContainer.innerHTML = window.Components.getHeader(true, true);
            if (window.Components.initHeader) window.Components.initHeader();
            if (window.Components.initSearch) window.Components.initSearch();
            if (window.Components.initCartCounter) window.Components.initCartCounter();
        }

        const footerContainer = document.getElementById('mainFooter');
        if (footerContainer && !footerContainer.innerHTML.trim()) {
            footerContainer.innerHTML = window.Components.getFooter();
        }
    }

    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        if (window.FormValidator) {
            window.FormValidator.initRealTime(registerForm);
        }

        // Check for email in URL (from Guest Checkout)
        const params = new URLSearchParams(window.location.search);
        const emailParam = params.get('email');
        if (emailParam) {
            const emailInput = document.getElementById('registerEmail');
            if (emailInput) {
                emailInput.value = emailParam;
                // Add a visual cue
                emailInput.parentElement.classList.add('focused');
                // Focus password to speed up flow
                setTimeout(() => {
                    const passInput = document.getElementById('registerPassword');
                    if (passInput) passInput.focus();
                }, 500);
            }
        }

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validar formulario antes de enviar
            if (window.FormValidator) {
                const validation = window.FormValidator.validateForm(registerForm, {
                    showErrors: true,
                    focusFirstError: true,
                    customValidation: (form) => {
                        // Validar que las contraseñas coincidan si hay campo de confirmación
                        const password = document.getElementById('registerPassword')?.value;
                        const confirmPassword = document.getElementById('registerConfirmPassword')?.value;
                        if (confirmPassword && password !== confirmPassword) {
                            return {
                                valid: false,
                                message: 'Las contraseñas no coinciden'
                            };
                        }
                        return { valid: true };
                    }
                });
                if (!validation.valid) {
                    if (window.notifications) {
                        window.notifications.warning('Formulario Inválido', 'Por favor, corrige los errores en el formulario');
                    }
                    return;
                }
            }

            const firstNameInput = document.getElementById('registerFirstName');
            const lastNameInput = document.getElementById('registerLastName');
            const emailInput = document.getElementById('registerEmail');
            const passwordInput = document.getElementById('registerPassword');

            const first_name = firstNameInput ? firstNameInput.value.trim() : '';
            const last_name = lastNameInput ? lastNameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            // Validaciones adicionales (backup)
            if (!first_name || !last_name || !email || !password) {
                if (window.notifications) window.notifications.error('Error', 'Todos los campos son obligatorios');
                return;
            }

            if (password.length < 6) {
                if (window.notifications) window.notifications.error('Error', 'La contraseña debe tener al menos 6 caracteres');
                return;
            }

            try {
                // MODERN CORE: Use LoadingStates
                if (window.LoadingStates) {
                    window.LoadingStates.show(registerForm, { type: 'spinner', message: 'Creando cuenta...', overlay: true });
                } else {
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> CREANDO CUENTA...';
                }

                const response = await window.api.register({ first_name, last_name, email, password });

                if (response.success || response.token) {
                    if (window.notifications) window.notifications.success('¡Bienvenido!', 'Cuenta creada exitosamente. Verifica tu email para continuar.');

                    if (response.token) {
                        localStorage.setItem('auth_token', response.token);
                        if (response.user) {
                            localStorage.setItem('user', JSON.stringify(response.user));
                        }
                    }

                    // Redirigir a verificación si es necesario, o a profile
                    setTimeout(() => {
                        if (response.requires_verification) {
                            window.location.href = 'verification.html?email=' + encodeURIComponent(email);
                        } else {
                            window.location.href = 'profile.html';
                        }
                    }, 1500);
                } else {
                    throw new Error(response.message || 'Error al registrar');
                }
            } catch (error) {
                if (window.LoadingStates) window.LoadingStates.hide(registerForm);

                // Usar error handler si está disponible
                if (window.ErrorHandler) {
                    window.ErrorHandler.api(error, 'register', 'No se pudo crear la cuenta.');
                } else {
                    if (window.notifications) {
                        const errorMsg = error.message || error.response?.data?.message || 'No se pudo crear la cuenta. Por favor, intenta de nuevo.';
                        window.notifications.error('Error de Registro', errorMsg);
                    }
                }

                if (!window.LoadingStates && btn) {
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                }
            }
        });
    }
});
