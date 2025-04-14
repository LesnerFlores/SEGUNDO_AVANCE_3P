var UrlInsert = 'http://localhost:5007/usuario/InsertarUsuario'
$(document).ready(function () {
    $('#registroForm').submit(function (e) {
        e.preventDefault();

        const usuario = {
            codigo: $('#CodigoUsuario').val(),
            nombre: $('#Nombre').val(),
            apellido: $('#Apellido').val(),
            email: $('#Email').val(),
            password: $('#Password').val(),
            estado: $('#Estado').val(),
            ultimaConexion: null,
            passwordExpira: $('#PasswordExpira').val() === 'true',
            diasCaducidad: parseInt($('#DiasCaducidad').val()),
            rol: $('#Rol').val(),
            intentosIncorrectos: 0,
            fechaRegistro: new Date().toISOString()
        };

        $.ajax({
            url: UrlInsert , 
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(usuario),
            success: function (response) {
                $('#mensaje').html('<div class="alert alert-success">Usuario registrado correctamente.</div>');
                $('#registroForm')[0].reset();
            },
            error: function (err) {
                console.error(err);
                $('#mensaje').html('<div class="alert alert-danger">Error al registrar usuario.</div>');
            }
        });
    });
});