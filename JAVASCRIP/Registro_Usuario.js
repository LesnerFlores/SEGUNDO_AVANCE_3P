var UrlInsert = 'http://localhost:5007/usuario/InsertarUsuario';

$(document).ready(function () {
   $('#registroForm').submit(function (e) {
       e.preventDefault();

       const usuario = {
        codigo_usuario: $('#codigo_usuario').val(),
        nombre: $('#nombre').val(),
        apellido: $('#apellido').val(),
        email: $('#email').val(),
        password: $('#password').val(),
        estado: $('#estado').val() === 'true',
        password_expira: $('#password_expira').val() === 'true',
        dias_caducidad_password: parseInt($('#dias_caducidad_password').val()) || 30,
        rol_usuario: $('#rol_usuario').val(),
        numero_intentos: 0,
        ultima_fecha: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        hora_ingreso: new Date().toTimeString().split(' ')[0], // HH:MM:SS
        fecha_registro: new Date().toISOString().split('T')[0]
    };
    

       console.log('Datos a enviar:', JSON.stringify(usuario, null, 2));

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
               let errorMsg = 'Error desconocido';
               
               if (err.responseText) {
                   try {
                       const jsonError = JSON.parse(err.responseText);
                       if (jsonError && jsonError.error) {
                           errorMsg = jsonError.error;
                           if (jsonError.details) {
                               errorMsg += ': ' + jsonError.details;
                           }
                       } else {
                           errorMsg = err.responseText;
                       }
                   } catch (e) {
                       errorMsg = err.responseText;
                   }
               }
               
               $('#mensaje').html('<div class="alert alert-danger">❌ Error al registrar usuario: ' + errorMsg + '</div>');
           }
       });
   });
});