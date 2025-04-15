(() => {
    'use strict';
    
    // Elementos del formulario
    const formulario = document.getElementById('formulario_login');
    const inputCorreo = document.getElementById('correo');
    const inputClave = document.getElementById('clave');
    const botonIngresar = document.querySelector('.boton_acceso');
    const toggleClave = document.getElementById('alternar_clave');
    const enlaceRegistro = document.querySelector('.enlace_registro a');

    // Expresión regular para email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Inicialización
    function init() {
        // Eventos
        formulario.addEventListener('submit', handleSubmit);
        
        if (toggleClave) {
            toggleClave.addEventListener('click', togglePasswordVisibility);
        }
        
        if (enlaceRegistro) {
            enlaceRegistro.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'Registro_Usuario.html';
            });
        }
    }

    // Mostrar/ocultar contraseña
    function togglePasswordVisibility() {
        const esPassword = inputClave.type === 'password';
        inputClave.type = esPassword ? 'text' : 'password';
        this.classList.toggle('fa-eye-slash');
    }

    // Manejar envío del formulario
    async function handleSubmit(e) {
        e.preventDefault();
        
        const correo = inputCorreo.value.trim();
        const clave = inputClave.value.trim();

        if (!validarInputs(correo, clave)) return;
        
        await autenticarUsuario(correo, clave);
    }

    // Validar campos
    function validarInputs(correo, clave) {
        if (!correo || !clave) {
            mostrarError('Todos los campos son obligatorios');
            return false;
        }

        if (!emailRegex.test(correo)) {
            mostrarError('Por favor ingrese un correo electrónico válido');
            inputCorreo.focus();
            return false;
        }

        return true;
    }

    // Autenticar usuario
    async function autenticarUsuario(correo, clave) {
        try {
            toggleCargando(true);
            
            const respuesta = await fetch('http://localhost:5007/usuario/buscarporEmail', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email: correo })
            });

            if (!respuesta.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            
            const usuario = await respuesta.json();

            if (usuario.error) {
                throw new Error(usuario.error);
            }

            // Comparación de contraseña 
            if (usuario.password !== clave) {
                mostrarError('Contraseña incorrecta');
                return;
            }

            guardarSesionUsuario(usuario);
            redirigirAHome();
            
        } catch (error) {
            console.error('Error en autenticación:', error);
            mostrarError(error.message.includes('servidor') 
                ? 'Error en el servidor' 
                : error.message);
        } finally {
            toggleCargando(false);
        }
    }

    // Mostrar estado de carga
    function toggleCargando(mostrar) {
        if (mostrar) {
            botonIngresar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
            botonIngresar.disabled = true;
        } else {
            botonIngresar.innerHTML = 'Ingresar';
            botonIngresar.disabled = false;
        }
    }

    // Mostrar mensaje de error
    function mostrarError(mensaje) {
        const errorExistente = document.querySelector('.error-message');
        if (errorExistente) {
            errorExistente.remove();
        }
        
        const divError = document.createElement('div');
        divError.className = 'error-message';
        divError.style.color = 'red';
        divError.style.marginTop = '10px';
        divError.textContent = mensaje;
        
        formulario.appendChild(divError);
        inputClave.value = '';
        inputClave.focus();
    }

    // Guardar datos de usuario
    function guardarSesionUsuario(usuario) {
        sessionStorage.setItem('usuario', JSON.stringify({
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol_usuario,
            codigo: usuario.codigo_usuario
        }));
    }

    // Redirigir a HOME
    function redirigirAHome() {
        window.location.href = 'Formulario_HOME.html';
    }

    // Iniciar
    init();
})();