class AuthenticationPortal {
    constructor() {
        this.currentForm = 'login';
        this.isLoading = false;
        this.passwordStrength = 0;
        this.particles = [];
        this.magicTrails = [];
        this.animationFrame;
        this.initializeElements();
        this.bindEvents();
        this.initializeAnimations();
        this.handleResponsiveLayout();
        this.setupTouchSupport();
        this.preventZoomOnIOS();
        this.initCursorEffects();
        this.initParticleSystem();
        this.initMagicEffects();
        this.initFormValidation();
    }
    initializeElements() {
        this.loginToggle = document.getElementById('loginToggle');
        this.registerToggle = document.getElementById('registerToggle');
        this.toggleIndicator = document.querySelector('.toggle-indicator');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.loginFormElement = document.getElementById('loginFormElement');
        this.registerFormElement = document.getElementById('registerFormElement');
        this.notification = document.getElementById('notification');
        this.notificationIcon = document.querySelector('.notification-icon');
        this.notificationMessage = document.querySelector('.notification-message');
        this.passwordToggles = document.querySelectorAll('.toggle-password');
        this.registerPassword = document.getElementById('registerPassword');
        this.confirmPassword = document.getElementById('confirmPassword');
        this.strengthBars = document.querySelectorAll('.strength-bar');
        this.strengthText = document.querySelector('.strength-text');
        this.allInputs = document.querySelectorAll('input');
    }
    bindEvents() {
        this.loginToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchForm('login');
        });
        this.registerToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchForm('register');
        });
        this.loginFormElement.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerFormElement.addEventListener('submit', (e) => this.handleRegister(e));
        this.passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.togglePasswordVisibility(e);
            });
        });
        if (this.registerPassword) {
            this.registerPassword.addEventListener('input', () => this.checkPasswordStrength());
            this.registerPassword.addEventListener('keyup', () => this.checkPasswordStrength());
        }
        if (this.confirmPassword) {
            this.confirmPassword.addEventListener('input', () => this.validatePasswordMatch());
            this.confirmPassword.addEventListener('blur', () => this.validatePasswordMatch());
        }
        this.addInputFocusEffects();
        this.addRealTimeValidation();
        this.addSocialButtonEvents();
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => this.handleOrientationChange());
    }
    initFormValidation() {
        this.allInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateInput(input));
            input.addEventListener('input', () => this.clearInputError(input));
        });
    }
    validateInput(input) {
        const wrapper = input.closest('.input-wrapper');
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';
        wrapper.classList.remove('error', 'success');
        if (!value && !input.required) return;
        switch (input.type) {
            case 'email':
                if (!this.validateEmail(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'tel':
                if (!this.validatePhone(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                break;
            case 'password':
                if (input.id === 'registerPassword' && value.length < 8) {
                    isValid = false;
                    errorMessage = 'Password must be at least 8 characters';
                } else if (input.id === 'loginPassword' && value.length < 6) {
                    isValid = false;
                    errorMessage = 'Password must be at least 6 characters';
                } else if (input.id === 'confirmPassword') {
                    const mainPassword = this.registerPassword.value;
                    if (value !== mainPassword) {
                        isValid = false;
                        errorMessage = 'Passwords do not match';
                    }
                }
                break;
            default:
                if (input.required && !value) {
                    isValid = false;
                    errorMessage = 'This field is required';
                }
        }
        if (isValid && value) {
            wrapper.classList.add('success');
        } else if (!isValid) {
            wrapper.classList.add('error');
            this.showFieldError(input, errorMessage);
        }
        return isValid;
    }
    clearInputError(input) {
        const wrapper = input.closest('.input-wrapper');
        wrapper.classList.remove('error');
        this.hideFieldError(input);
    }
    showFieldError(input, message) {
        this.hideFieldError(input);
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: var(--error-color);
            font-size: 0.8rem;
            margin-top: 5px;
            animation: slideDown 0.3s ease;
        `;
        const wrapper = input.closest('.input-wrapper');
        wrapper.parentNode.insertBefore(errorElement, wrapper.nextSibling);
    }
    hideFieldError(input) {
        const wrapper = input.closest('.input-wrapper');
        const errorElement = wrapper.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }
    switchForm(formType) {
        if (this.isLoading) return;
        this.clearAllErrors();
        this.currentForm = formType;
        this.loginToggle.classList.toggle('active', formType === 'login');
        this.registerToggle.classList.toggle('active', formType === 'register');
        this.toggleIndicator.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        this.toggleIndicator.classList.toggle('register', formType === 'register');
        const currentFormEl = formType === 'login' ? this.registerForm : this.loginForm;
        const newFormEl = formType === 'login' ? this.loginForm : this.registerForm;
        currentFormEl.style.animation = 'fadeOut 0.3s ease-in-out forwards';
        setTimeout(() => {
            currentFormEl.classList.remove('active');
            newFormEl.classList.add('active');
            newFormEl.style.animation = 'fadeIn 0.3s ease-in-out forwards';
            const firstInput = newFormEl.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }, 150);
    }
    clearAllErrors() {
        document.querySelectorAll('.input-wrapper').forEach(wrapper => {
            wrapper.classList.remove('error', 'success');
        });
        document.querySelectorAll('.field-error').forEach(error => {
            error.remove();
        });
    }
    async handleLogin(e) {
        e.preventDefault();
        if (this.isLoading) return;
        const formData = new FormData(e.target);
        const email = formData.get('email') || document.getElementById('loginEmail').value;
        const password = formData.get('password') || document.getElementById('loginPassword').value;
        let isValid = true;
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        if (!this.validateInput(emailInput)) isValid = false;
        if (!this.validateInput(passwordInput)) isValid = false;
        if (!isValid) {
            this.showNotification('Please fix the errors above', 'error');
            return;
        }
        this.setLoadingState(true);
        try {
            await this.simulateApiCall(2000);
            if (email === 'test@example.com' && password === 'password123') {
                this.showNotification('Login successful! Welcome back.', 'success');
                setTimeout(() => {
                    window.location.href = '#dashboard';
                }, 1500);
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            this.showNotification('Invalid email or password. Try test@example.com / password123', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }
    async handleRegister(e) {
        e.preventDefault();
        if (this.isLoading) return;
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const phone = document.getElementById('phoneNumber').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        let isValid = true;
        const inputs = [
            document.getElementById('firstName'),
            document.getElementById('lastName'),
            document.getElementById('registerEmail'),
            document.getElementById('phoneNumber'),
            document.getElementById('registerPassword'),
            document.getElementById('confirmPassword')
        ];
        inputs.forEach(input => {
            if (!this.validateInput(input)) isValid = false;
        });
        if (!agreeTerms) {
            this.showNotification('Please agree to the terms and conditions', 'error');
            isValid = false;
        }
        if (this.passwordStrength < 3) {
            this.showNotification('Please choose a stronger password', 'error');
            isValid = false;
        }
        if (!isValid) {
            this.showNotification('Please fix the errors in the form', 'error');
            return;
        }
        this.setLoadingState(true);
        try {
            await this.simulateApiCall(3000);
            this.showNotification('Account created successfully! Welcome aboard.', 'success');
            setTimeout(() => {
                this.registerFormElement.reset();
                this.clearAllErrors();
                this.resetPasswordStrength();
                this.switchForm('login');
            }, 1500);
        } catch (error) {
            this.showNotification('Registration failed. Please try again.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }
    checkPasswordStrength() {
        const password = this.registerPassword.value;
        let strength = 0;
        let strengthText = 'Very Weak';
        this.strengthBars.forEach(bar => {
            bar.classList.remove('active', 'weak', 'medium', 'strong');
        });
        if (!password) {
            this.strengthText.textContent = 'Password Strength';
            this.passwordStrength = 0;
            return;
        }
        const criteria = [
            password.length >= 8,
            password.length >= 12,
            /[a-z]/.test(password),
            /[A-Z]/.test(password),
            /[0-9]/.test(password),
            /[^A-Za-z0-9]/.test(password)
        ];
        strength = criteria.filter(Boolean).length;
        let strengthClass = 'weak';
        if (strength >= 4) strengthClass = 'medium';
        if (strength >= 5) strengthClass = 'strong';
        const barsToFill = Math.ceil((strength / 6) * 4);
        for (let i = 0; i < barsToFill; i++) {
            this.strengthBars[i].classList.add('active', strengthClass);
        }
        if (strength <= 2) strengthText = 'Weak';
        else if (strength <= 3) strengthText = 'Fair';
        else if (strength <= 4) strengthText = 'Good';
        else if (strength <= 5) strengthText = 'Strong';
        else strengthText = 'Very Strong';
        this.strengthText.textContent = strengthText;
        this.passwordStrength = strength;
    }
    resetPasswordStrength() {
        this.strengthBars.forEach(bar => {
            bar.classList.remove('active', 'weak', 'medium', 'strong');
        });
        this.strengthText.textContent = 'Password Strength';
        this.passwordStrength = 0;
    }
    validatePasswordMatch() {
        if (!this.confirmPassword.value) return;
        const password = this.registerPassword.value;
        const confirmPassword = this.confirmPassword.value;
        const wrapper = this.confirmPassword.closest('.input-wrapper');
        wrapper.classList.remove('error', 'success');
        if (password !== confirmPassword) {
            wrapper.classList.add('error');
        } else if (confirmPassword) {
            wrapper.classList.add('success');
        }
    }
    togglePasswordVisibility(e) {
        const button = e.currentTarget;
        const input = button.parentNode.querySelector('input[type="password"], input[type="text"]');
        const icon = button.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
        button.style.transform = 'scale(0.9)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);
    }
    addSocialButtonEvents() {
        const socialBtns = document.querySelectorAll('.social-btn');
        socialBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = btn.classList.contains('google') ? 'Google' :
                               btn.classList.contains('facebook') ? 'Facebook' : 'Twitter';
                this.showNotification(`${platform} login is not implemented yet`, 'error');
            });
        });
        const termsLinks = document.querySelectorAll('a[href="terms.html"], .terms-link');
        termsLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.openTermsPage();
            });
        });
        const privacyLinks = document.querySelectorAll('a[href="privacy.html"], .privacy-link');
        privacyLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.openPrivacyPage();
            });
        });
    }
    openTermsPage() {
        const formContainer = document.querySelector('.form-container');
        formContainer.style.animation = 'slideOutLeft 0.5s ease-in-out';
        setTimeout(() => {
            window.location.href = 'terms.html';
        }, 500);
    }
    openPrivacyPage() {
        const formContainer = document.querySelector('.form-container');
        formContainer.style.animation = 'slideOutRight 0.5s ease-in-out';
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, var(--success-color), var(--primary-color));
            z-index: 10000;
            opacity: 0;
            animation: privacyPageTransition 0.8s ease-in-out;
        `;
        document.body.appendChild(overlay);
        setTimeout(() => {
            window.location.href = 'privacy.html';
        }, 500);
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideOutRight {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(50px);
                }
            }
            @keyframes privacyPageTransition {
                0% {
                    opacity: 0;
                    transform: scale(0);
                }
                50% {
                    opacity: 0.8;
                    transform: scale(1.1);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                }
            }
        `;
        document.head.appendChild(style);
    }
    setLoadingState(loading) {
        this.isLoading = loading;
        const formContainer = document.querySelector('.form-container');
        const submitBtns = document.querySelectorAll('.submit-btn');
        formContainer.classList.toggle('loading', loading);
        submitBtns.forEach(btn => {
            btn.classList.toggle('loading', loading);
            btn.disabled = loading;
        });
        this.allInputs.forEach(input => {
            input.disabled = loading;
        });
    }
    simulateApiCall(duration = 2000) {
        return new Promise((resolve) => {
            setTimeout(resolve, duration);
        });
    }
}
const formAnimations = document.createElement('style');
formAnimations.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(-20px); }
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(formAnimations);
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    @keyframes iconDance {
        0%, 100% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.2) rotate(5deg); }
        50% { transform: scale(1.3) rotate(0deg); }
        75% { transform: scale(1.2) rotate(-5deg); }
    }
`;
document.head.appendChild(shakeStyle);
document.addEventListener('mousemove', (e) => {
    const floatingElements = document.querySelectorAll('.floating-element');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    floatingElements.forEach((element, index) => {
        const speed = (index + 1) * 0.5;
        const x = mouseX * speed;
        const y = mouseY * speed;
        element.style.transform = `translate(${x}px, ${y}px)`;
    });
});
document.addEventListener('DOMContentLoaded', () => {
    new AuthenticationPortal();
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});