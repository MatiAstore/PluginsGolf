jQuery(document).ready(function ($) {
    const tablaPartidas = $('#tabla-partidas');
    const tarjetasPartidas = $('#tarjetas-partidas');
    const promedioDesempeñoSpan = $('#promedio-partidas');
    const promedioYardasSpan = $('#promedio-yardas');
    const botonCargarMas = $('#boton-cargar-mas');

    let partidas = []; 
    let paginaActual = 1;
    let limitePagina = 10; 

    function renderizarPartidas(pagina) {
        const inicio = (pagina - 1) * limitePagina;
        const fin = inicio + limitePagina;
        const partidasPagina = partidas.slice(inicio, fin);

        // Limpiar las tablas y tarjetas si es la primera página
        if (pagina === 1) {
            tablaPartidas.empty();
            tarjetasPartidas.empty();
        }

        if(partidasPagina.length === 0){
            tablaPartidas.append(`
                <tr>
                   <td colspan="10">No hay partidas disponibles</td> 
                </tr>
            `)

            tarjetasPartidas.append(`
                <p class="mensaje-no-encontrado">No hay partidas disponibles.</p>
            `);
            
            botonCargarMas.hide(); 
            return;
        }

        // Agregar partidas a las tarjetas y tablas
        partidasPagina.forEach(partida => {
            // Tarjetas (móviles)
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

                    <button class="btn-ver-detalles">Ver más detalles</button>
                    <button class="btn-eliminar" data-partida-id="${partida.id}">Eliminar</button>

                    <div class="detalles-adicionales" style="display: none;">
                        <p><strong>Course Rating:</strong> ${partida.course_rating}</p>
                        <p><strong>Tee:</strong> ${partida.tee_name}</p>
                        <p><strong>Género:</strong> ${partida.gender}</p>
                        <p><strong>Yardas:</strong> ${partida.length}</p>
                        <p><strong>Gross:</strong> ${partida.total_neto > 0 ? `+${partida.total_neto}` : partida.total_neto}</p>
                    </div>
                </div>
            `);

            // Tabla (escritorio)
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
                    <td><span class="btn-eliminar-x" data-partida-id="${partida.id}"><i class="fas fa-trash-alt"></i></span></td>

                </tr>
            `);
        });

        // Mostrar u ocultar botón "Cargar más"
        if (partidas.length > fin) {
            botonCargarMas.show().prop('disabled', false).text('Cargar más');
        } else {
            botonCargarMas.hide();
        }
    }

    function cargarPartidas() {
        $.ajax({
            url: ajaxHistorial.ajaxurl,
            type: 'POST',
            data: {
                action: 'obtener_partidas',
            },
            dataType: 'json',
            beforeSend: function () {
                tablaPartidas.empty();
                tarjetasPartidas.empty();
                botonCargarMas.prop('disabled', true).text('Cargando...');
            },
            success: function (response) {
                if (response.success) {
                    const { partidas: dataPartidas, promedio_desempeño, promedio_length } = response.data;

                    // Guardar partidas
                    partidas = dataPartidas;

                    promedioDesempeñoSpan.text(parseFloat(promedio_desempeño).toFixed(2));
                    promedioYardasSpan.text(parseFloat(promedio_length).toFixed(2));                

                    // Renderizar la primera página
                    renderizarPartidas(paginaActual);
                } else {
                    alert(response.data.message || 'Ocurrió un error al cargar las partidas.');
                    tablaPartidas.html('<tr><td colspan="10">No hay partidas disponibles.</td></tr>');
                    tarjetasPartidas.html('<p class="mensaje-no-partidas">No hay partidas disponibles.</p>');
                    botonCargarMas.hide();
                }
            }
        });
    }

    // Inicializar la carga
    cargarPartidas();

    function eliminarPartida(partidaId) {
        // Confirmar la eliminación de la partida
        const confirmacion = confirm("¿Estás seguro de que deseas eliminar esta partida?");
        if (!confirmacion) {
            return; 
        }
    
        // Si el usuario confirma, proceder con la eliminación
        $.ajax({
            url: ajaxHistorial.ajaxurl,
            type: 'POST',
            data: {
                action: 'eliminar_partida',
                partida_id: partidaId,
            },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    // Mostrar el mensaje de éxito
                    $('#mensaje-eliminacion').text('Partida eliminada y promedios actualizados.').addClass('success').removeClass('error').fadeIn();
    
                    // Actualizar los valores de los promedios en el DOM
                    promedioDesempeñoSpan.text(
                        isNaN(response.promedio_desempeño) || response.promedio_desempeño === null
                            ? '0.00'
                            : parseFloat(response.promedio_desempeño).toFixed(2)
                    );
    
                    promedioYardasSpan.text(
                        isNaN(response.promedio_length) || response.promedio_length === null
                            ? '0.00'
                            : parseFloat(response.promedio_length).toFixed(2)
                    );
    
                    cargarPartidas();
                } else {
                    // Mostrar el mensaje de error
                    $('#mensaje-eliminacion').text('Ocurrió un error al eliminar la partida.').addClass('error').removeClass('success').fadeIn();
                }

                setTimeout(() => {
                    $('#mensaje-eliminacion').fadeOut();
                }, 5000);
            },
            error: function () {
                // Manejar errores de la solicitud AJAX
                $('#mensaje-eliminacion').text('Ocurrió un error de red al intentar eliminar la partida.').addClass('error').removeClass('success').fadeIn();

                setTimeout(() => {
                    $('mensaje-eliminacion').fadeOut();
                }, 5000);
            }
        });
    }
    

    // Manejar clic en el botón "Eliminar" de la tabla
    tablaPartidas.on('click', '.btn-eliminar-x', function () {
        const partidaId = $(this).data('partida-id');
        eliminarPartida(partidaId);
    });

    // Manejar clic en el botón "Eliminar" de las tarjetas
    tarjetasPartidas.on('click', '.btn-eliminar', function () {
        const partidaId = $(this).data('partida-id');
        eliminarPartida(partidaId);
    });

    // Manejar clic en "Cargar más"
    botonCargarMas.on('click', function () {
        paginaActual++;
        renderizarPartidas(paginaActual);
    });

    // Manejar el clic del botón "Ver Detalles"
    tarjetasPartidas.on('click', '.btn-ver-detalles', function () {
        const tarjeta = $(this).closest('.tarjeta-partida');
        const detalles = tarjeta.find('.detalles-adicionales');

        if (detalles.css('display') === 'none') {
            detalles.slideDown();
            $(this).text('Ocultar detalles').addClass("btn-activo");
        } else {
            detalles.slideUp();
            $(this).text('Ver más detalles').removeClass("btn-activo");
        }
    });
});
