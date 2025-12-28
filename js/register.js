document.addEventListener('DOMContentLoaded', () => {
    if (window.Components) window.Components.loadHeader();
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Simulate login
            localStorage.setItem('user_token', 'mock_token_123');
            window.location.href = 'profile.html';
        });
    }
});
