//URL DE LAS APIS
var UrlGetAll = 'http://localhost:5007/RESERVA/TodaslasReservas';
var UrlInsertReserva = 'http://localhost:5007/RESERVA/InsertarReserva';
var UrlDeleteReserva ='http://localhost:5007/RESERVA/EliminarReserva';
var UrlUpdateReserva = 'http://localhost:5007/RESERVA/actualizarReserva';
var UrlGetById ='http://localhost:5007/RESERVA/buscarporId';


// ********* FUNCIÓN PARA CARGAR RESERVAS *********
$(document).ready(function() {
    CargarReservas();
});
function CargarReservas() {
  $.ajax({
      url: UrlGetAll,  
      type: 'GET',
      dataType: 'json',
      success: function(response) {
          console.log("Respuesta de la API:", response);

          let tablaHTML = '';
          response.forEach(reserva => {
              console.log("Reserva individual:", reserva);

              tablaHTML += `
              <tr>
                  <td>${reserva.id_reserva || 'N/A'}</td>
                  <td>${reserva.id_cliente || 'N/A'}</td>
                  <td>${reserva.id_vehiculo || 'N/A'}</td>
                  <td>${reserva.fecha_inicio ? new Date(reserva.fecha_inicio).toLocaleDateString() : 'Fecha Inválida'}</td>
                  <td>${reserva.fecha_fin ? new Date(reserva.fecha_fin).toLocaleDateString() : 'Fecha Inválida'}</td>
                  <td>${reserva.estado || 'N/A'}</td>
                  <td>${reserva.precio_total || 'N/A'}</td>
                  <td>
                      <button class="btn btn-warning btn-sm" onclick="CargarReservaParaEditar('${reserva.id_reserva}')">Editar</button>
                      <button class="btn btn-danger btn-sm ms-1" onclick="EliminarReserva('${reserva.id_reserva}')">Eliminar</button>
                  </td>
              </tr>`;
          });

          $('#DataReservas').html(tablaHTML);  
      },
      error: function(xhr, status, error) {
          console.error("Error al cargar reservas:", xhr.status, error);
          alert("Error al cargar reservas. Revisa la consola.");
      }
  });
}


// ********* FUNCIÓN PARA AGREGAR RESERVA *********
function AgregarReserva() {
    const idReservaValue = $('#ID_Reserva').val();
    console.log("Valor original del campo ID_Reserva:", idReservaValue);
    
    if (!idReservaValue || idReservaValue.trim() === '') {
        alert("El ID de Reserva es obligatorio.");
        $('#ID_Reserva').focus();
        return;
    }
    //conversion numero entero
    const idReservaInt = parseInt(idReservaValue);
    console.log("ID_Reserva convertido a entero:", idReservaInt);
    
    if (isNaN(idReservaInt)) {
        alert("El ID de Reserva debe ser un número válido.");
        $('#ID_Reserva').focus();
        return;
    }
    const reserva = {
        ID_Reserva: idReservaInt,
        ID_Cliente: parseInt($('#ID_Cliente').val()) || 0,
        ID_Vehiculo: parseInt($('#ID_Vehiculo').val()) || 0,
        Fecha_Inicio: $('#Fecha_Inicio').val(),
        Fecha_Fin: $('#Fecha_Fin').val(),
        Estado: $('#Estado').val() || "PENDIENTE",
        Precio_Total: parseFloat($('#Precio_Total').val()) || 0.0
    };
    //Validacion de campos
    if (!reserva.ID_Reserva) {
        alert("El ID de Reserva es obligatorio.");
        return;
    }
    
    if (!reserva.ID_Cliente) {
        alert("El ID de Cliente es obligatorio.");
        return;
    }
    
    if (!reserva.ID_Vehiculo) {
        alert("El ID de Vehículo es obligatorio.");
        return;
    }
    
    if (!reserva.Fecha_Inicio) {
        alert("La Fecha de Inicio es obligatoria.");
        return;
    }
    
    if (!reserva.Fecha_Fin) {
        alert("La Fecha de Fin es obligatoria.");
        return;
    }
    
    if (!reserva.Precio_Total) {
        alert("El Precio Total es obligatorio.");
        return;
    }
    console.log("Datos completos a enviar:", reserva);
    console.log("JSON a enviar:", JSON.stringify(reserva));
    
    $.ajax({
        url: UrlInsertReserva,
        type: 'POST',
        data: JSON.stringify(reserva),
        contentType: 'application/json',
        beforeSend: function() {
            console.log("Iniciando solicitud AJAX...");
        },
        success: function(response) {
            console.log("Respuesta exitosa:", response);
            alert('Reserva agregada correctamente');
            CargarReservas();
            ocultarFormulario();
        },
        error: function(xhr, textStatus, error) {
            console.error("Error en la solicitud:");
            console.error("Status:", xhr.status);
            console.error("Texto de estado:", textStatus);
            console.error("Error:", error);
            console.error("Respuesta del servidor:", xhr.responseText);
            
            try {
                const errorObj = JSON.parse(xhr.responseText);
                console.error("Error parseado:", errorObj);
            } catch(e) {
                console.error("No se pudo parsear el error como JSON");
            }
            
            alert(`Error al agregar reserva: ${xhr.status} - ${xhr.responseText}`);
        }
    });
}
function CargarReservaParaEditar(idReserva) {
    mostrarFormularioReserva(); 
    $('.card-title').text('Editar Reserva');
    
    $.ajax({
        url: `${UrlGetById}?ID_Reserva=${idReserva}`, 
        type: 'Post',
        success: function(response) {
            $('#ID_Reserva').val(response.id_reserva).prop('readonly', true);  
            $('#ID_Cliente').val(response.id_cliente);
            $('#ID_Vehiculo').val(response.id_vehiculo);
            $('#Fecha_Inicio').val(response.fecha_inicio.split('T')[0]);
            $('#Fecha_Fin').val(response.fecha_fin.split('T')[0]);
            $('#Estado').val(response.estado);
            $('#Precio_Total').val(response.precio_total);
            
            $('#btnAgregarReserva').hide();
            $('#btnGuardarCambiosReserva').show();
        },
        error: function(xhr, textStatus, error) {
            alert(`Error al cargar reserva: ${xhr.status} - ${error}`);
        }
    });
}

// ********* FUNCION PARA ACTUALIZAR UNA RESERVA *********
function ActualizarReserva() {
  const reserva = {
      id_reserva: parseInt($('#ID_Reserva').val()),
      id_cliente: parseInt($('#ID_Cliente').val()),
      id_vehiculo: parseInt($('#ID_Vehiculo').val()),
      fecha_inicio: $('#Fecha_Inicio').val(),
      fecha_fin: $('#Fecha_Fin').val(),
      estado: $('#Estado').val().toUpperCase(),
      precio_total: parseFloat($('#Precio_Total').val())
  };

  console.log('Datos de la reserva a actualizar:', reserva);

  // Validaciones básicas
  if (!reserva.id_reserva || isNaN(reserva.id_reserva)) {
      alert("El ID de Reserva debe ser un número válido.");
      return;
  }
  
  if (!reserva.id_cliente || isNaN(reserva.id_cliente)) {
      alert("El ID de Cliente debe ser un número válido.");
      return;
  }
  
  if (!reserva.id_vehiculo || isNaN(reserva.id_vehiculo)) {
      alert("El ID de Vehículo debe ser un número válido.");
      return;
  }
  
  if (!reserva.fecha_inicio) {
      alert("La Fecha de Inicio es obligatoria.");
      return;
  }
  
  if (!reserva.fecha_fin) {
      alert("La Fecha de Fin es obligatoria.");
      return;
  }
  
  if (!reserva.precio_total || isNaN(reserva.precio_total)) {
      alert("El Precio Total debe ser un número válido.");
      return;
  }

  $.ajax({
      url: UrlUpdateReserva,
      type: 'PUT',
      data: JSON.stringify(reserva),
      contentType: 'application/json',
      success: function(response) {
          alert('Reserva actualizada correctamente');
          CargarReservas(); // Corregido para usar el nombre correcto
          ocultarFormularioReserva();
      },
      error: function(xhr, textStatus, error) {
          console.error('Error en la solicitud AJAX:', xhr, textStatus, error);
          alert(`Error al actualizar reserva: ${xhr.status} - ${error}`);
      }
  });
}

// ********* FUNCION PARA ELIMINAR UNA RESERVA *********
function EliminarReserva(idReserva) {
  if (!confirm('¿Está seguro que desea eliminar esta reserva?')) return;
  
  $.ajax({
      url: UrlDeleteReserva,
      type: 'DELETE',
      data: JSON.stringify({ ID_Reserva: parseInt(idReserva) }),
      contentType: 'application/json',
      success: function(response) {
          console.log("Reserva eliminada:", response);
          alert('Reserva eliminada correctamente');
          CargarReservas(); // Corregido para usar el nombre correcto
      },
      error: function(xhr, textStatus, error) {
          alert(`Error al eliminar reserva: ${xhr.status} - ${error}`);
      }
  });
}

// Función para limpiar el formulario de reserva 
function limpiarFormularioReserva() {
    $("#F_Reservas")[0].reset(); 
}
function mostrarFormularioReserva() {
  $('.Formulario').show();
}

function mostrarFormularioReserva() {
  // Muestra el formulario de edición
  $('#formularioReserva').show();
}

// Agregar función para ocultar el formulario de reserva
function ocultarFormularioReserva() {
  // Oculta el formulario y limpia los campos
  $('#formularioReserva').hide();
  limpiarFormularioReserva();
  $('#ID_Reserva').prop('readonly', false);
  $('#btnAgregarReserva').show();
  $('#btnGuardarCambiosReserva').hide();
}