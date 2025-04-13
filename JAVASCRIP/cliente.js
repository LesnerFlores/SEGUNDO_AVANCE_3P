class ClienteApp {
    constructor() {
        console.log('Inicializando aplicación ClienteApp...');
        this.clienteIdActual = null;
        this.apiUrl = 'http://localhost:5005/api/clientes';
        this.initSelectors();
        this.bindEvents();
        this.setupModalHandlers();
        this.cargarClientes();
    }

    initSelectors() {
        this.$tablaClientes = $('#tablaClientes');
        this.$inputBusqueda = $('#inputBusqueda');
        this.$formCliente = $('#formCliente');
        this.$modalCliente = $('#clienteModal');
        this.$modalConfirmacion = $('#confirmacionModal');
        this.$contadorClientes = $('#contadorClientes');
        this.$alertContainer = $('#alertContainer');
    }

    bindEvents() {
        $('#btnBuscar').click(() => this.buscarClientes());
        $('#btnAgregarCliente').click(() => this.prepararFormulario());
        $('#btnGuardar').click(() => this.guardarCliente());
        $('#btnConfirmarEliminar').click(() => this.eliminarCliente());

        this.$inputBusqueda.keypress((e) => {
            if (e.which === 13) this.buscarClientes();
        });

        this.$tablaClientes.on('click', '.btn-editar', (e) => {
            this.editarCliente($(e.currentTarget).data('id'));
        });

        this.$tablaClientes.on('click', '.btn-eliminar', (e) => {
            this.confirmarEliminacion($(e.currentTarget).data('id'));
        });
    }

    setupModalHandlers() {
        // Manejar el cierre del modal de cliente
        this.$modalCliente.on('hidden.bs.modal', () => {
            this.mostrarLoading(false);
            this.cargarClientes(); // Recargar lista al cancelar
        });

        // Manejar el cierre del modal de confirmación
        this.$modalConfirmacion.on('hidden.bs.modal', () => {
            this.mostrarLoading(false);
            // No recargamos aquí para evitar doble carga
        });
    }

    cargarClientes() {
        this.mostrarLoading(true);
        
        $.ajax({
            url: this.apiUrl,
            method: 'GET',
            dataType: 'json'
        })
        .done((data) => {
            this.mostrarClientes(data);
        })
        .fail((error) => {
            console.error('Error al cargar clientes:', error);
            this.mostrarError('Error al cargar clientes', error);
        })
        .always(() => {
            this.mostrarLoading(false);
        });
    }

    mostrarLoading(mostrar) {
        if (mostrar) {
            this.$tablaClientes.html(`
                <tr>
                    <td colspan="8" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                    </td>
                </tr>
            `);
        } else if (this.$tablaClientes.find('.spinner-border').length) {
            this.$tablaClientes.empty();
        }
    }

    buscarClientes() {
        const termino = this.$inputBusqueda.val().trim();
        if (!termino) {
            this.cargarClientes();
            return;
        }

        this.mostrarLoading(true);
        
        $.ajax({
            url: `${this.apiUrl}?search=${termino}`,
            method: 'GET'
        })
        .done((data) => {
            this.mostrarClientes(data);
        })
        .fail((error) => {
            console.error('Error al buscar clientes:', error);
            this.mostrarError('Error al buscar clientes', error);
        })
        .always(() => {
            this.mostrarLoading(false);
        });
    }

    mostrarClientes(clientes) {
        this.$tablaClientes.empty();
        this.$contadorClientes.text(`${clientes.length} ${clientes.length === 1 ? 'cliente' : 'clientes'}`);

        if (!clientes || clientes.length === 0) {
            this.$tablaClientes.append(
                '<tr><td colspan="8" class="text-center py-4 text-muted">No se encontraron clientes</td></tr>'
            );
            return;
        }

        clientes.forEach(cliente => {
            let genero = cliente.genero;
            if (genero === 'Masculino') genero = 'M';
            if (genero === 'Femenino') genero = 'F';
            
            const fila = `
                <tr data-id="${cliente.ID_CLIENTE}">
                    <td>${cliente.ID_CLIENTE}</td>
                    <td>${cliente.nombre}</td>
                    <td>${cliente.apellidos}</td>
                    <td>${this.formatearFecha(cliente.fecha_nacimiento)}</td>
                    <td>${this.formatearGenero(genero)}</td>
                    <td>${cliente.direccion || '-'}</td>
                    <td>${cliente.telefono || '-'}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-warning btn-editar me-1" data-id="${cliente.ID_CLIENTE}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${cliente.ID_CLIENTE}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            this.$tablaClientes.append(fila);
        });
    }

    prepararFormulario() {
        this.$formCliente.trigger('reset');
        $('#inputId').val('');
        $('#modalTitulo').text('Nuevo Cliente');
        this.$modalCliente.modal('show');
    }

    editarCliente(id) {
        if (!id) return;

        this.mostrarLoading(true);
        
        $.ajax({
            url: `${this.apiUrl}/${id}`,
            method: 'GET'
        })
        .done((cliente) => {
            $('#inputId').val(cliente.ID_CLIENTE);
            $('#inputNombre').val(cliente.nombre);
            $('#inputApellidos').val(cliente.apellidos);
            
            const fechaNac = cliente.fecha_nacimiento ? 
                cliente.fecha_nacimiento.split('T')[0] : 
                '';
            $('#inputFechaNacimiento').val(fechaNac);
            
            let genero = cliente.genero;
            if (genero === 'Masculino') genero = 'M';
            if (genero === 'Femenino') genero = 'F';
            $('#selectGenero').val(genero);
            
            $('#textareaDireccion').val(cliente.direccion || '');
            $('#inputTelefono').val(cliente.telefono || '');
            
            $('#modalTitulo').text('Editar Cliente');
            this.$modalCliente.modal('show');
        })
        .fail((error) => {
            console.error('Error al cargar cliente:', error);
            this.mostrarError('Error al cargar cliente', error);
        })
        .always(() => {
            this.mostrarLoading(false);
        });
    }

    guardarCliente() {
        const id = $('#inputId').val();
        const datos = {
            ID_CLIENTE: id || `CLI-${Math.floor(1000 + Math.random() * 9000)}`,
            nombre: $('#inputNombre').val(),
            apellidos: $('#inputApellidos').val(),
            fecha_nacimiento: $('#inputFechaNacimiento').val(),
            genero: $('#selectGenero').val(),
            direccion: $('#textareaDireccion').val(),
            telefono: $('#inputTelefono').val()
        };

        if (!datos.nombre || !datos.apellidos || !datos.fecha_nacimiento || !datos.genero) {
            this.mostrarAlerta('Por favor complete todos los campos requeridos', 'warning');
            return;
        }

        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${this.apiUrl}/${id}` : this.apiUrl;

        this.mostrarLoading(true);
        
        $.ajax({
            url: url,
            method: metodo,
            contentType: 'application/json',
            data: JSON.stringify(datos)
        })
        .done(() => {
            this.$modalCliente.modal('hide');
            this.cargarClientes();
            this.mostrarAlerta(`Cliente ${id ? 'actualizado' : 'creado'} correctamente`, 'success');
        })
        .fail((error) => {
            console.error('Error al guardar cliente:', error);
            this.mostrarError(`Error al ${id ? 'actualizar' : 'crear'} cliente`, error);
        })
        .always(() => {
            this.mostrarLoading(false);
        });
    }

    confirmarEliminacion(id) {
        if (!id) return;
        this.clienteIdActual = id;
        this.$modalConfirmacion.modal('show');
    }

    eliminarCliente() {
        if (!this.clienteIdActual) return;

        this.mostrarLoading(true);
        
        $.ajax({
            url: `${this.apiUrl}/${this.clienteIdActual}`,
            method: 'DELETE'
        })
        .done(() => {
            this.$modalConfirmacion.modal('hide');
            this.cargarClientes();
            this.mostrarAlerta('Cliente eliminado correctamente', 'success');
            this.clienteIdActual = null;
        })
        .fail((error) => {
            console.error('Error al eliminar cliente:', error);
            this.mostrarError('Error al eliminar cliente', error);
        })
        .always(() => {
            this.mostrarLoading(false);
        });
    }

    formatearFecha(fecha) {
        if (!fecha) return '-';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fecha).toLocaleDateString('es-ES', options);
    }

    formatearGenero(genero) {
        const generos = { 
            'M': 'Masculino', 
            'F': 'Femenino', 
            'O': 'Otro' 
        };
        return generos[genero] || genero || 'No especificado';
    }

    mostrarError(mensaje, error) {
        console.error(mensaje, error);
        let errorMsg = error.responseJSON?.error || error.statusText || 'Error desconocido';
        this.mostrarAlerta(`${mensaje}: ${errorMsg}`, 'danger');
    }

    mostrarAlerta(mensaje, tipo) {
        this.$alertContainer.empty();
        const alerta = $(`
            <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                <strong>${tipo === 'danger' ? 'Error!' : tipo === 'success' ? 'Éxito!' : 'Aviso:'}</strong> ${mensaje}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `);
        this.$alertContainer.append(alerta);
        
        setTimeout(() => {
            alerta.alert('close');
        }, 5000);
    }
}

$(document).ready(() => {
    new ClienteApp();
});