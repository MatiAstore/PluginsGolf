jQuery(document).ready(function ($) {
    const tablaPartidas = $('#tabla-partidas');
    const tarjetasPartidas = $('#tarjetas-partidas'); 
    const promedioDesempeñoSpan = $('#promedio-partidas');
    const promedioYardasSpan = $('#promedio-yardas');
    const botonCargarMas = $('#boton-cargar-mas'); 

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

                    // Añadir partidas a la tabla y tarjetas
                    if (partidas.length > 0) {
                        
                        // Ocultar el mensaje "Cargando partidas..." antes de agregar contenido
                        tarjetasPartidas.find('.mensaje-cargando').remove();

                        partidas.forEach(partida => {
                            // Mostrar tarjetas en dispositivos móviles
                            tarjetasPartidas.append(`
                                <div class="tarjeta-partida">
                                    <div class="first-row">
                                        <p id="club-name">${partida.club_name}</p>
                                        <p id="fecha-juego">${partida.fecha_juego}</p> 
                                    </div>
                                    <div class="second-row">
                                        <div class="golpes-par-container"> 
                                            <p id="golpes-totales">${partida.golpes_totales}</p>
                                            <p id="par">${partida.par}</p>
                                        </div>
                                        <p id="desempeño-objetivo">${partida.desempeño_objetivo}</p>
                                    </div>

                                    <button class="btn-ver-detalles">Ver mas detalles</button>

                                    <!-- Contenedor para los detalles adicionales -->
                                    <div class="detalles-adicionales" style="display: none;">
                                        <p><strong>Course Rating:</strong> ${partida.course_rating}</p>
                                        <p><strong>Tee:</strong> ${partida.tee_name}</p>
                                        <p><strong>Género:</strong> ${partida.gender}</p>
                                        <p><strong>Yardas:</strong> ${partida.length}</p>
                                        <p><strong>Gross:</strong> ${partida.total_neto > 0 ? `+${partida.total_neto}` : partida.total_neto}</p>
                                    </div>

                                </div>
                            `);
                       
                            // Mostrar tabla en dispositivos de escritorio
                            tablaPartidas.append(`
                                <tr>
                                    <td>${partida.fecha_juego}</td>
                                    <td>${partida.club_name}</td>
                                    <td>${partida.tee_name}</td>
                                    <td>${partida.gender}</td>
                                    <td>${partida.par}</td>
                                    <td>${partida.course_rating}</td>
                                    <td>${partida.length}</td>
                                    <td>${partida.golpes_totales}</td>
                                    <td>${partida.total_neto > 0 ? `+${partida.total_neto}` : partida.total_neto}</td>
                                    <td>${partida.desempeño_objetivo}</td>
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
                        tarjetasPartidas.append('<div class="mensaje-no-encontrado">No se encontraron partidas.</div>');
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

    //Manejar el click del boton 'Ver Detalles" 
    tarjetasPartidas.on('click', '.btn-ver-detalles', function () {
        const tarjeta = $(this).closest('.tarjeta-partida'); // Encontrar la tarjeta contenedora
        const detalles = tarjeta.find('.detalles-adicionales'); // Encontrar el contenedor de detalles adicionales
    
        // Verificar el estado del display y alternar
        if (detalles.css('display') === 'none') {
            detalles.slideDown(); // Mostrar el contenedor con animación
            $(this).text('Ocultar detalles'); // Cambiar el texto del botón
            $(this).addClass("btn-activo"); 
        } else {
            detalles.slideUp(); // Ocultar el contenedor con animación
            $(this).text('Ver más detalles'); // Cambiar el texto del botón
            $(this).removeClass("btn-activo");
        }
    });


});
