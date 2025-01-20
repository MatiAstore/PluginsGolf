jQuery(document).ready(function ($) {
    const tablaPartidas = $('#tabla-partidas');
    const promedioDesempeñoSpan = $('#promedio-partidas');
    const promedioYardasSpan = $('#promedio-yardas');
    const botonCargarMas = $('#boton-cargar-mas'); // Botón para cargar más partidas

    let paginaActual = 1;
    let promediosCargados = false; 
    let totalPartidas = 0; 

    function cargarPartidas(pagina, append = false) {
        $.ajax({
            url: ajaxHistorial.ajaxurl,
            type: 'POST',
            data: {
                action: 'obtener_partidas',
                pagina: pagina,
            },
            dataType: 'json',
            beforeSend: function () {
                if (!append) tablaPartidas.empty();
                botonCargarMas.prop('disabled', true).text('Cargando...');
            },
            success: function (response) {
                console.log(response); 
                if (response.success) {
                    const { partidas, promedio_desempeño, promedio_length, total_partidas } = response.data;
    
                    // Almacenamos el total de partidas
                    totalPartidas = total_partidas;
    
                    // Mostrar promedios solo la primera vez
                    if (!promediosCargados) {
                        promedioDesempeñoSpan.text(parseFloat(promedio_desempeño).toFixed(2));
                        promedioYardasSpan.text(parseFloat(promedio_length).toFixed(2));
                        promediosCargados = true; // Marcar que los promedios ya fueron cargados
                    }
    
                    // Añadir partidas a la tabla
                    if (partidas.length > 0) {
                        partidas.forEach(partida => {
                            tablaPartidas.append(`
                                <tr>
                                    <td data-label="fecha">${partida.fecha_juego}</td>
                                    <td data-label="club">${partida.club_name}</td>
                                    <td data-label="tee">${partida.tee_name}</td>
                                    <td data-label="genero">${partida.gender}</td>
                                    <td data-label="par">${partida.par}</td>
                                    <td data-label="rating">${partida.course_rating}</td>
                                    <td data-label="yardas">${partida.length}</td>
                                    <td data-label="golpes totales">${partida.golpes_totales}</td>
                                    <td data-label="neto">${partida.total_neto > 0 ? `+${partida.total_neto}` : partida.total_neto}</td>
                                    <td data-label="desempeño objetivo">${partida.desempeño_objetivo}</td>
                                </tr>
                            `);
                        });
    
                        // Mostrar u ocultar el botón "Cargar más"
                        if (tablaPartidas.find('tr').length < totalPartidas) {
                            botonCargarMas.show().prop('disabled', false).text('Cargar más');
                        } else {
                            botonCargarMas.hide(); // Ocultar el botón si no hay más partidas
                        }
                    } else if (!append) {
                        tablaPartidas.append('<tr><td colspan="10">No se encontraron partidas.</td></tr>');
                        botonCargarMas.hide();
                    }
                } else {
                    alert(response.data.message || 'Ocurrió un error al cargar las partidas.');
                }
            }
        });
    }

    // Inicialmente cargar la primera página
    cargarPartidas(paginaActual);

    // Manejar el clic del botón "Cargar más"
    botonCargarMas.on('click', function () {
        paginaActual++;
        cargarPartidas(paginaActual, true);
    });
});
