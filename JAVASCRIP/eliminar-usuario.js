document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const usuariosTable = document.getElementById('usuariosTable');
    const usuariosBody = document.getElementById('usuariosBody');
    const loadingElement = document.getElementById('loading');
    const userCountElement = document.getElementById('userCount');
    const alertSuccess = document.getElementById('alertSuccess');
    const alertError = document.getElementById('alertError');
  
    // Cargar los usuarios al iniciar la página
    cargarUsuarios();
  
    // Función para mostrar alerta
    function mostrarAlerta(elemento, mensaje) {
        elemento.textContent = mensaje;
        elemento.style.display = 'block';
        setTimeout(() => {
            elemento.style.display = 'none';
        }, 3000);
    }
  
    // Función para cargar todos los usuarios
    function cargarUsuarios() {
        loadingElement.style.display = 'block';
        usuariosTable.style.display = 'none';
  
        fetch('/api/usuario/TodoslosUsuarios')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar usuarios');
                }
                return response.json();
            })
            .then(usuarios => {
                mostrarUsuarios(usuarios);
                userCountElement.textContent = `Total de usuarios: ${usuarios.length}`;
                loadingElement.style.display = 'none';
                usuariosTable.style.display = 'table';
            })
            .catch(error => {
                mostrarAlerta(alertError, `Error: ${error.message}`);
                loadingElement.style.display = 'none';
            });
    }
  
    // Función para mostrar los usuarios en la tabla
    function mostrarUsuarios(usuarios) {
        // Limpiar la tabla
        usuariosBody.innerHTML = '';
  
        // Agregar cada usuario a la tabla
        usuarios.forEach(usuario => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${usuario.codigo_usuario}</td>
                <td>${usuario.nombre}</td>
                <td>${usuario.apellido}</td>
                <td>${usuario.email}</td>
                <td>${usuario.estado ? 'Activo' : 'Inactivo'}</td>
                <td>${usuario.rol_usuario}</td>
                <td>
                    <button class="btn btn-danger" data-id="${usuario.codigo_usuario}">Eliminar</button>
                </td>
            `;
            
            usuariosBody.appendChild(row);
        });
  
        // Agregar eventos a los botones de eliminar
        document.querySelectorAll('.btn-danger').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                eliminarUsuario(id);
            });
        });
    }
  
    // Función para eliminar un usuario
    function eliminarUsuario(codigoUsuario) {
        if (confirm(`¿Está seguro que desea eliminar el usuario con código ${codigoUsuario}?`)) {
            fetch(`/api/usuario/EliminarUsuario/${codigoUsuario}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al eliminar usuario');
                }
                return response.text();
            })
            .then(data => {
                mostrarAlerta(alertSuccess, 'Usuario eliminado correctamente');
                cargarUsuarios(); // Recargar la lista de usuarios
            })
            .catch(error => {
                mostrarAlerta(alertError, `Error: ${error.message}`);
            });
        }
    }
  });