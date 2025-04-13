// URLs de las APIs
const UrlGetAll = 'http://localhost:5007/vehiculo/TodoslosVehiculos';
const UrlInsertVehiculo = 'http://localhost:5007/vehiculo/InsertarVehiculo';
const UrlDeleteVehiculo = 'http://localhost:5007/vehiculo/EliminarVehiculo';
const UrlGetById = 'http://localhost:5007/vehiculo/buscarporId';
const UrlUpdateVehiculo = 'http://localhost:5007/vehiculo/actualizarVehiculo';

// ********* FUNCIONES PARA MOSTRAR/OCULTAR FORMULARIO *********
// ********* FUNCIONES PARA MOSTRAR/OCULTAR FORMULARIO *********
function mostrarFormulario() {
    $('#formularioVehiculo').show();
    $('#btnMostrarFormulario').hide();
    limpiarFormulario();
}

function ocultarFormulario() {
    $('#formularioVehiculo').hide();
    $('#btnMostrarFormulario').show();
    limpiarFormulario();
}

// ********* FUNCIÓN PARA CARGAR VEHÍCULOS *********
function CargarVehiculos() {
    $.ajax({
        url: UrlGetAll,
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            const vehiculos = response;
            let tablaHTML = '';
            
            vehiculos.forEach(vehiculo => {
                tablaHTML += `
                <tr>
                    <td>${vehiculo.id_vehiculo}</td>
                    <td>${vehiculo.marca}</td>
                    <td>${vehiculo.modelo}</td>
                    <td>${vehiculo.anio}</td>
                    <td>${new Date(vehiculo.fecha_matricula).toLocaleDateString()}</td>
                    <td>${vehiculo.numero_placa}</td>
                    <td>${vehiculo.estado}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="CargarVehiculoParaEditar('${vehiculo.id_vehiculo}')">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button class="btn btn-danger btn-sm ms-1" onclick="EliminarVehiculo('${vehiculo.id_vehiculo}')">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </td>
                </tr>`;
            });
            
            $('#DataVehiculos').html(tablaHTML);
        },
        error: function(xhr, status, error) {
            console.error("Error al cargar vehículos:", error);
            alert("Error al cargar vehículos. Ver consola para más detalles.");
        }
    });
}

// ********* FUNCIÓN PARA AGREGAR VEHÍCULO *********
function AgregarVehiculo() {
    const vehiculo = {
        id_vehiculo: $('#ID_VEHICULO').val(),
        marca: $('#MARCA').val(),
        modelo: $('#MODELO').val(),
        anio: $('#ANIO').val(),
        fecha_matricula: $('#FECHA_MATRICULA').val(),
        numero_placa: $('#NUMERO_PLACA').val(),
        estado: $('#ESTADO').val().toUpperCase()
    };

    if (!validarVehiculo(vehiculo)) return;

    $.ajax({
        url: UrlInsertVehiculo,
        type: 'POST',
        data: JSON.stringify(vehiculo),
        contentType: 'application/json',
        success: function() {
            alert('Vehículo agregado correctamente');
            CargarVehiculos();
            ocultarFormulario();
        },
        error: function(xhr, textStatus, error) {
            alert(`Error al agregar vehículo: ${xhr.status} - ${error}`);
        }
    });
}

// ********* FUNCIÓN PARA CARGAR VEHÍCULO PARA EDITAR *********
function CargarVehiculoParaEditar(idVehiculo) {
    mostrarFormulario();
    $('.card-title').text('Editar Vehículo');
    
    $.ajax({
        url: UrlGetById,
        type: 'POST',
        data: JSON.stringify({ id_vehiculo: idVehiculo }),
        contentType: 'application/json',
        success: function(response) {
            $('#ID_VEHICULO').val(response.id_vehiculo).prop('readonly', true);
            $('#ID_VEHICULO').val(response.id_vehiculo).prop('readonly', true).prop('disabled', true);
            $('#MARCA').val(response.marca);
            $('#MODELO').val(response.modelo);
            $('#ANIO').val(response.anio);
            $('#FECHA_MATRICULA').val(response.fecha_matricula.split('T')[0]);
            $('#NUMERO_PLACA').val(response.numero_placa);
            $('#ESTADO').val(response.estado);
            
            $('#btnagregar').hide();
            $('#btnGuardarCambios').show();
        },
        error: function(xhr, textStatus, error) {
            alert(`Error al cargar vehículo: ${xhr.status} - ${error}`);
        }
    });
}

// ********* FUNCIÓN PARA ACTUALIZAR VEHÍCULO *********
function ActualizarVehiculo() {
    const vehiculo = {
        id_vehiculo: $('#ID_VEHICULO').val(),
        marca: $('#MARCA').val(),
        modelo: $('#MODELO').val(),
        anio: $('#ANIO').val(),
        fecha_matricula: $('#FECHA_MATRICULA').val(),
        numero_placa: $('#NUMERO_PLACA').val(),
        estado: $('#ESTADO').val().toUpperCase()
    };

    if (!validarVehiculo(vehiculo)) return;

    $.ajax({
        url: UrlUpdateVehiculo,
        type: 'PUT',
        data: JSON.stringify(vehiculo),
        contentType: 'application/json',
        success: function() {
            alert('Vehículo actualizado correctamente');
            CargarVehiculos();
            ocultarFormulario();
        },
        error: function(xhr, textStatus, error) {
            alert(`Error al actualizar vehículo: ${xhr.status} - ${error}`);
        }
    });
}

// ********* FUNCIÓN PARA ELIMINAR VEHÍCULO *********
function EliminarVehiculo(idVehiculo) {
    if (!confirm('¿Está seguro que desea eliminar este vehículo?')) return;
    
    $.ajax({
        url: UrlDeleteVehiculo,
        type: 'DELETE',
        data: JSON.stringify({ id_vehiculo: idVehiculo }),
        contentType: 'application/json',
        success: function() {
            alert('Vehículo eliminado correctamente');
            CargarVehiculos();
        },
        error: function(xhr, textStatus, error) {
            alert(`Error al eliminar vehículo: ${xhr.status} - ${error}`);
        }
    });
}

// ********* FUNCIÓN PARA LIMPIAR FORMULARIO *********
function limpiarFormulario() {
    $("#FormVehiculo")[0].reset();
    $('#ID_VEHICULO').prop('readonly', false);
    $('#ID_VEHICULO').prop('readonly', false).prop('disabled', false);
    $('.card-title').text('Agregar Vehículo');
    $('#btnagregar').show();
    $('#btnGuardarCambios').hide();
}

// ********* FUNCIÓN PARA VALIDAR DATOS *********
function validarVehiculo(vehiculo) {
    if (!vehiculo.id_vehiculo || !vehiculo.marca || !vehiculo.modelo || !vehiculo.anio || 
        !vehiculo.fecha_matricula || !vehiculo.numero_placa || !vehiculo.estado) {
        alert('Todos los campos son obligatorios');
        return false;
    }
    
    if (isNaN(vehiculo.anio) || vehiculo.anio.length !== 4) {
        alert('El año debe ser un número de 4 dígitos');
        return false;
    }
    
    return true;
}

// ********* INICIALIZACIÓN *********
$(document).ready(function() {
    $('#btnMostrarFormulario').click(mostrarFormulario);
    CargarVehiculos();
});