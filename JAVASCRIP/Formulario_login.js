// usuario_login.js - Versión optimizada con navegación a registro
(() => {
    'use strict';
    
    // Configuración
    const CONFIG = {
        URL_API: 'http://localhost:5007/usuario/buscarporEmail',
        SELECTORS: {
            FORM: '#formulario_login',
            EMAIL: '#correo',
            PASSWORD: '#clave',
            SUBMIT_BTN: '#formulario_login button[type="submit"]',
            TOGGLE_PW: '#togglePassword',
            REGISTER_LINK: '.enlace_registro a' // Nuevo selector
        },
        STORAGE_KEYS: {
            USER: 'usuario'
        },
        PAGES: {
            REGISTER: 'Registro_Usuario.html', // Ruta al formulario de registro
            HOME: 'Formulario_HOME.html'
        }
    };

    // Verificación de jQuery
    if (typeof $ === 'undefined') {
        alert('Error: jQuery no está cargado. Recarga la página.');
        return;
    }

    // Cache de elementos DOM
    const DOM = {
        form: $(CONFIG.SELECTORS.FORM),
        email: $(CONFIG.SELECTORS.EMAIL),
        password: $(CONFIG.SELECTORS.PASSWORD),
        submitBtn: $(CONFIG.SELECTORS.SUBMIT_BTN),
        togglePw: $(CONFIG.SELECTORS.TOGGLE_PW),
        registerLink: $(CONFIG.SELECTORS.REGISTER_LINK) // Nuevo elemento cacheado
    };

    // Expresión regular precompilada
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Inicialización
    function init() {
        DOM.form.on('submit', handleSubmit);
        setupPasswordToggle();
        setupRegisterLink();
    }

    // Configuración del toggle de contraseña
    function setupPasswordToggle() {
        if (DOM.togglePw.length) {
            DOM.togglePw.on('click', function() {
                const isPassword = DOM.password.attr('type') === 'password';
                DOM.password.attr('type', isPassword ? 'text' : 'password');
                $(this)
                    .toggleClass('fa-eye fa-eye-slash')
                    .attr('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
            }).attr('aria-label', 'Mostrar contraseña');
        }
    }

    // Configuración del enlace de registro - NUEVA FUNCIÓN
    function setupRegisterLink() {
        if (DOM.registerLink.length) {
            DOM.registerLink.on('click', function(e) {
                e.preventDefault();
                window.location.href = CONFIG.PAGES.REGISTER;
            });
        }
    }

    // Función principal
    function handleSubmit(e) {
        e.preventDefault();
        
        const credentials = {
            email: DOM.email.val().trim(),
            password: DOM.password.val().trim()
        };

        if (!validateInputs(credentials)) return;
        
        authenticateUser(credentials);
    }

    // Validación de campos
    function validateInputs({ email, password }) {
        if (!email || !password) {
            showError('Todos los campos son obligatorios');
            return false;
        }

        if (!EMAIL_REGEX.test(email)) {
            showError('Por favor ingrese un correo electrónico válido');
            DOM.email.focus();
            return false;
        }

        return true;
    }

    // Autenticación con el servidor
    async function authenticateUser({ email, password }) {
        try {
            toggleLoading(true);
            
            const user = await $.ajax({
                url: CONFIG.URL_API,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ email })
            });

            if (!user || typeof user !== 'object') {
                throw new Error('Respuesta del servidor inválida');
            }

            if (user.error) {
                throw new Error(user.error);
            }

            if (user.password !== password) {
                showError('Contraseña incorrecta');
                return;
            }

            saveUserSession(user);
            redirectToHome();
            
        } catch (error) {
            console.error('Error en autenticación:', error);
            showError(error.message.includes('servidor') 
                ? 'Error en el servidor' 
                : error.message);
        } finally {
            toggleLoading(false);
        }
    }

    // Helpers
    function toggleLoading(show) {
        DOM.submitBtn.html(show 
            ? '<i class="fa fa-spinner fa-spin"></i> Verificando...' 
            : 'Ingresar');
    }

    function showError(message) {
        $('.error-message').remove();
        DOM.form.append(
            `<div class="error-message" style="color:red; margin-top:10px;">${message}</div>`
        );
        DOM.password.val('').focus();
    }

    function saveUserSession(user) {
        sessionStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify({
            nombre: user.nombre,
            email: user.email,
            rol: user.rol_usuario,
            codigo: user.codigo_usuario
        }));
    }

    function redirectToHome() {
        window.location.href = CONFIG.PAGES.HOME;
    }

    // Iniciar la aplicación
    init();
})();