(function ($) {
    let delayTimer;
    let currentRequest = null; // Controlador para la solicitud actual

    $(document).ready(function () {

        // Función para limpiar y ocultar todos los contenedores relacionados
        function limpiarResultados() {
            $('#resultados_clubes').empty(); // Limpiar los resultados de la búsqueda
            $('#club-seleccionado').empty(); // Vaciar la selección del club
            $('#contenedor-seleccion-y-formulario').hide(); // Ocultar el formulario
            $('#resultado_handicap').empty(); // Vaciar el resultado del cálculo
            $('#club_id').val(''); // Reiniciar el valor del ID del club
        }

        // Buscar clubes dinámicamente al escribir
        $('#nombre_club').on('input', function () {
            clearTimeout(delayTimer);
            const nombre_club = $(this).val().trim();

            limpiarResultados(); 

            // Cancelar la solicitud anterior si existe
            if (currentRequest) {
                currentRequest.abort();
            }

            // Si el texto tiene al menos 3 caracteres, busca
            if (nombre_club.length >= 3) {
                delayTimer = setTimeout(() => {
                    buscarClubes(nombre_club, 1, false); // Buscar resultados sin paginación inicialmente
                }, 300);
            } else {
                $('#resultados_clubes').empty(); // Limpiar resultados si el texto es demasiado corto
            }
        });

        // Función para buscar clubes
        function buscarClubes(nombre_club, pagina, append) {
            currentRequest = $.ajax({
                url: ajaxData.ajaxurl,
                type: 'POST',
                dataType: 'json', 
                data: {
                    action: 'calculador_buscar_clubes',
                    nombre_club: nombre_club,
                    pagina: pagina,
                    append: append ? 'true' : 'false'
                },
                beforeSend: function () {
                    if (!append) {
                        $('#resultados_clubes').html('<p>Cargando...</p>');
                    }
                    $('#ver_mas_resultados').prop('disabled', true).text('Cargando...');
                },
                success: function (response) {
                    if (response.success && response.data) {
                        const data = response.data;
                
                        if (!append) {
                            // Limpia los resultados y muestra el total
                            $('#resultados_clubes').html('');
                            if (data.total_resultados) {
                                $('#resultados_clubes').append(
                                    `<p id="total_resultados">Total de resultados encontrados: ${data.total_resultados}</p>`
                                );
                            }
                            $('#resultados_clubes').append('<ul id="lista_clubes"></ul>');
                        }
                
                        // Añadir los clubes al listado
                        const listaClubes = document.querySelector('#lista_clubes');
                        data.clubes.forEach(club => {
                            const clubElement = `
                                <li>
                                    <strong>${club.club_name}</strong>
                                    <span>Ciudad: ${club.ciudad}, Tee Name: ${club.tee_name}, Gender: ${club.gender}, Rating: ${club.rating}</span>
                                    <button type="button" class="seleccionar-club"
                                            data-id="${club.id}" 
                                            data-name="${club.club_name}" 
                                            data-ciudad="${club.ciudad}" 
                                            data-tee="${club.tee_name}" 
                                            data-gender="${club.gender}"
                                            data-rating="${club.rating}">
                                        Seleccionar
                                    </button>
                                </li>`;
                            listaClubes.insertAdjacentHTML('beforeend', clubElement);
                        });
                
                        // Actualizar el botón "Cargar más"
                        const viejoBoton = document.querySelector('#ver_mas_resultados');
                        if (data.more_results) {
                            const nuevoBoton = `
                                <button id="ver_mas_resultados" 
                                        data-nombre="${nombre_club}" 
                                        data-pagina="${pagina + 1}">
                                    Cargar más
                                </button>`;
                            if (viejoBoton) {
                                viejoBoton.outerHTML = nuevoBoton;
                            } else {
                                listaClubes.insertAdjacentHTML('afterend', nuevoBoton);
                            }
                        } else if (viejoBoton) {
                            viejoBoton.remove();
                        }
                    } else {
                        // Mostrar error solo si no se encuentran datos
                        $('#resultados_clubes').html('<p>No se encontraron clubes con ese nombre.</p>');
                    }

                    // Habilitar nuevamente el botón "Cargar más"
                    $('#ver_mas_resultados').prop('disabled', false).text('Cargar más');
                },
                error: function (xhr, status, error) {
                    if (status !== 'abort') console.error("Error en la solicitud AJAX: ", status, error);
                    $('#resultados_clubes').html('<p>Error al cargar los clubes. Inténtalo de nuevo.</p>');
                }, 
                complete: function () {
                    $('#ver_mas_resultados').prop('disabled', false).text('Cargar más resultados');
                }
            });
        }        

        // Manejar el botón de "Cargar más resultados"
        $(document).on('click', '#ver_mas_resultados', function () {
            const nombre_club = $(this).data('nombre');
            const pagina = $(this).data('pagina');
            buscarClubes(nombre_club, pagina, true);
        });

        // Seleccionar un club
        $(document).on('click', '.seleccionar-club', function () {
            const club_id = $(this).data('id');
            const club_name = $(this).data('name');
            const ciudad = $(this).data('ciudad');
            const tee_name = $(this).data('tee');
            const gender = $(this).data('gender');
            const rating = $(this).data('rating');

            if (club_id) {
                $('#club_id').val(club_id);

                // Limpiar el resultado anterior
                $('#resultado_handicap').empty();


                $('#club-seleccionado').html(
                    `<strong>Club seleccionado:</strong> ${club_name}
                    <br><strong>Ciudad:</strong> ${ciudad}
                    <br><strong>Tee:</strong> ${tee_name}
                    <br><strong>Género:</strong> ${gender}
                    <br><strong>Rating:</strong> ${rating}`
                );
                $('#contenedor-seleccion-y-formulario').show(); // Mostrar el contenedor con el formulario

                const formulario = document.getElementById('contenedor-seleccion-y-formulario'); 
                formulario.scrollIntoView({behavior: 'smooth', block:'center'}); 
            } else {
                alert('Club no válido.');
            }
        });


        // Calcular handicap
        $('#form-calcular-handicap').on('submit', function (e) {
            e.preventDefault();
            const club_id = $('#club_id').val();
            const index_jugador = $('#index_jugador').val();

            const submitButton = $(this).find('button[type="submit"]');
            submitButton.prop('disabled', true).text('Calculando...');

            $.ajax({
                url: ajaxData.ajaxurl,
                type: 'POST',
                dataType: 'json', // Asegurarse de procesar respuesta JSON
                data: {
                    action: 'calcular_handicap',
                    club_id: club_id,
                    index_jugador: index_jugador
                },
                success: function (response) {
                    if (response.success) {
                        // Mostrar el handicap calculado
                        $('#resultado_handicap').html(`
                            <p>WGH de juego:</p>
                            <div class="valor-resultado">${response.data.handicap}</div>
                        `);

                         // Desplazar la vista hasta el resultado del handicap
                        const resultadoHandicap = document.getElementById('resultado_handicap');
                        resultadoHandicap.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        // Mostrar mensaje de error del backend
                        alert(response.data.message || 'Ocurrió un error al calcular el handicap.');
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Error en la solicitud AJAX: ", status, error);
                    alert('Error al calcular el handicap. Inténtalo de nuevo.');
                },
                complete: function () {
                    submitButton.prop('disabled', false).text('Calcular');
                }
            });
        });
    });
})(jQuery);