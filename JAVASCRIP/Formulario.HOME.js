document.getElementById("formularioSelect").addEventListener("change", function() {
    const selectedValue = this.value;
    
    switch (selectedValue) {
        case "form1": // RESERVA
            window.open("RESERVA.html", "_blank");
            break;
            case "form2": // VEHICULO
            window.open("Formulario_Vehiculo.html", "_blank");
            break;
        case "form3": // CLIENTE
            window.open("cliente.html", "_blank");
            break;
        default:
            console.log("Formulario no reconocido");
    }
});
// VEHICULO