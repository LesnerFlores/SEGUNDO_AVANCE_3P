(() => {
    'use strict';
    
    // Elementos del formulario
    const formulario = document.getElementById('formulario_login');
    const inputCorreo = document.getElementById('correo');
    const inputClave = document.getElementById('clave');
    const botonIngresar = document.querySelector('.boton_acceso');
    const toggleClave = document.getElementById('togglePassword');
    const enlaceRegistro = document.querySelector('.enlace_registro a');

    // Expresión regular para email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Inicialización
    function init() {
        if (!formulario) {
            console.error('No se encontró el formulario con ID formulario_login');
            return;
        }

        // Eventos
        formulario.addEventListener('submit', handleSubmit);
        
        if (toggleClave) {
            toggleClave.addEventListener('click', togglePasswordVisibility);
        } else {
            console.warn('Elemento togglePassword no encontrado');
        }
        
        if (enlaceRegistro) {
            enlaceRegistro.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'Registro_Usuarios.html';
            });
        } else {
            console.warn('Enlace de registro no encontrado');
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
        limpiarErrores();
        
        if (!correo || !clave) {
            mostrarError('Todos los campos son obligatorios');
            return false;
        }

        if (!emailRegex.test(correo)) {
            mostrarError('Por favor ingrese un correo electrónico válido', inputCorreo);
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
                body: JSON.stringify({ email: correo, password: clave })
            });

            const data = await respuesta.json();
            
            if (!respuesta.ok) {
                throw new Error(data.message || 'Error en la autenticación');
            }

            if (!data || data.error) {
                throw new Error(data.error || 'Credenciales incorrectas');
            }

            // Verificación adicional de contraseña (seguridad redundante)
            if (data.password && data.password !== clave) {
                throw new Error('Contraseña incorrecta');
            }

            guardarSesionUsuario(data);
            redirigirAHome();
            
        } catch (error) {
            console.error('Error en autenticación:', error);
            mostrarError(error.message, inputClave);
        } finally {
            toggleCargando(false);
        }
    }

    // Limpiar errores anteriores
    function limpiarErrores() {
        const errores = document.querySelectorAll('.error-message');
        errores.forEach(error => error.remove());
    }

    // Mostrar mensaje de error
    function mostrarError(mensaje, elemento = null) {
        limpiarErrores();
        
        const divError = document.createElement('div');
        divError.className = 'error-message';
        divError.style.color = 'red';
        divError.style.marginTop = '10px';
        divError.textContent = mensaje;
        
        formulario.appendChild(divError);
        
        if (elemento) {
            elemento.focus();
            if (elemento === inputClave) {
                elemento.value = '';
            }
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

    // Iniciar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', init);
})();