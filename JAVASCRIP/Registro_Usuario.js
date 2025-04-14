var UrlInsert = 'http://localhost:5007/usuario/InsertarUsuario';

$(document).ready(function () {
    $('#registroForm').submit(function (e) {
        e.preventDefault();

        // Convertir valores de string a tipo adecuado
        const usuario = {
            codigo_usuario: $('#codigo_usuario').val(),
            nombre: $('#nombre').val(),
            apellido: $('#apellido').val(),
            email: $('#email').val(),
            password: $('#password').val(),
            estado: $('#estado').val() === 'true',
            ultima_fecha: null,
            hora_ingreso: null,
            password_expira: $('#password_expira').val() === 'true',
            dias_caducidad_password: parseInt($('#dias_caducidad_password').val()) || 0,
            rol_usuario: $('#rol_usuario').val(),
            numero_intentos: 0,
            fecha_registro: new Date().toISOString()
        };

        $.ajax({
            url: UrlInsert, 
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(usuario),
            success: function (response) {
                $('#mensaje').html('<div class="alert alert-success">✅ Usuario registrado correctamente. Redirigiendo al login...</div>');
                $('#registroForm')[0].reset();

                setTimeout(() => {
                    window.location.href = 'Formulario_login.html'; 
                }, 2000);
            },
            error: function (err) {
                console.error('Error completo:', err);
                let errorMsg = err.responseText ? err.responseText : 'Error desconocido';
                try {
                    const jsonError = JSON.parse(err.responseText);
                    if (jsonError && jsonError.error) {
                        errorMsg = jsonError.error;
                    }
                } catch (e) {
                    // Si no se puede parsear, usamos el texto completo
                }
                $('#mensaje').html('<div class="alert alert-danger">❌ Error al registrar usuario: ' + errorMsg + '</div>');
            }
        });
    });
});