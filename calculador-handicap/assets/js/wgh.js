(function ($) {
    let delayTimer;
    let currentRequest = null; // Variable global para mantener la referencia de la solicitud AJAX en curso

    $(document).ready(function () {
        function limpiarResultadosWGH() {
            $('#resultados_clubes').empty();
            $('#club-seleccionado').empty(); 
            $('#club-info-seleccionado').hide(); 
            $('#tee-seleccionado').hide(); 
            $('#contenedor-seleccion-y-formulario').hide(); 
            $('#resultado_wgh').empty();
            $('#club_id').val(''); 

            // También resetear el borde alrededor de resultado
            $('#resultado_wgh').css('border', 'none');
        }

        // Buscar clubes dinámicamente al escribir
        $('#nombre_club').on('input', function () {
            clearTimeout(delayTimer);
            const nombre_club = $(this).val().trim();

            // Llamar a la función de limpieza al iniciar una nueva búsqueda
            limpiarResultadosWGH();

            // Cancelar la solicitud anterior si existe
            if (currentRequest) {
                currentRequest.abort(); // Abortar la solicitud anterior si existe
            }

            // Si el texto tiene al menos 3 caracteres, busca
            if (nombre_club.length >= 3) {
                delayTimer = setTimeout(() => {
                    buscarClubesWGH(nombre_club, 1, false); // Buscar resultados sin paginación inicialmente
                }, 300);
            } else {
                $('#resultados_clubes').empty(); // Limpiar resultados si el texto es demasiado corto
            }
        });

        // Función para buscar clubes
        function buscarClubesWGH(nombre_club, pagina, append) {
            currentRequest = $.ajax({
                url: ajaxWGH.ajaxurl, 
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
                            $('#resultados_clubes').html('');
                            if (data.total_resultados) {
                                $('#resultados_clubes').append(
                                    `<p id="total_resultados">Total de resultados encontrados: ${data.total_resultados}</p>`
                                );
                            }
                            $('#resultados_clubes').append('<ul id="lista_clubes"></ul>');
                        }

                        const listaClubes = document.querySelector('#lista_clubes');
                        data.clubes.forEach(club => {
                            const clubElement = `
                                <li class="nuevo-club-temporal">
                                    <strong>${club.club_name}</strong>
                                    <span>Ciudad: ${club.ciudad}</span>
                                    <button type="button" class="seleccionar-club"
                                            data-name="${club.club_name}"
                                            data-ciudad="${club.ciudad}">
                                        Seleccionar
                                    </button>
                                </li>`;
                            listaClubes.insertAdjacentHTML('beforeend', clubElement);
                            
                            setTimeout(() => {
                                $('.nuevo-club-temporal').removeClass('nuevo-club-temporal')
                            }, 1500)
                        });

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

                        // **Desplazar hacia los nuevos clubes cargados**
                        if(append){
                            listaClubes.scrollTo({
                                top: listaClubes.scrollHeight,
                                behavior: 'smooth'
                            })
                        }
                    } else {
                        $('#resultados_clubes').html('<p>No se encontraron clubes con ese nombre.</p>');
                    }

                    $('#ver_mas_resultados').prop('disabled', false).text('Cargar más');
                },
                error: function (xhr, status, error) {
                    if (status !== 'abort') console.error("Error en la solicitud AJAX: ", status, error);
                }
            });
        }

        // Manejar el botón de "Cargar más resultados"
        $(document).on('click', '#ver_mas_resultados', function () {
            const nombre_club = $(this).data('nombre');
            const pagina = $(this).data('pagina');
            buscarClubesWGH(nombre_club, pagina, true);
        });

        // Seleccionar un club
        $(document).on('click', '.seleccionar-club', function () {
            const club_name = $(this).data('name');
            const ciudad = $(this).data('ciudad');

            if(club_name) {
                // Limpiar cualquier selección anterior de tees
                $('#tee_select').empty();
                $('#club-seleccionado').empty(); // Limpiar información del club
                $('#resultado_wgh').empty(); 
                $('#contenedor-seleccion-y-formulario').hide(); // Ocultar el formulario hasta que se seleccione un tee
                                
                // Mostrar el contenedor para mostrar el club y ciudad seleccionados
                $('#club-info-seleccionado').show();
                $('#club-nombre').text(`${club_name}`);
                $('#club-ciudad').text(`${ciudad}`);

                // Mostrar el contenedor para seleccionar el tee
                $('#tee-seleccionado').show();
                
                // Desplazar al usuario al select del tee
                document.querySelector('#tee-seleccionado').scrollIntoView({ behavior: 'smooth', block:'center'});
                
                // Pasar el club_name a la función mostrarTees
                mostrarTeesWGH(club_name, ciudad, true);
            } else {
                alert('Club no válido.');
            }
        });

        // Función para mostrar tees
        function mostrarTeesWGH(club_name, ciudad, course_rating) {
            const teeSelect = $('#tee_select');

            // Limpia y deshabilita el selector inicialmente
            teeSelect.empty();
            teeSelect.append('<option value="" disabled selected>Selecciona un tee</option>');
            teeSelect.prop('disabled', true);

            // Realiza la solicitud AJAX
            $.ajax({
                url: ajaxWGH.ajaxurl,
                type: 'POST',
                dataType: 'json',
                data: {
                    action: 'calculador_buscar_tees',
                    club_name: club_name, 
                    course_rating: course_rating ? 'true' : 'false' 
                },
                success: function (response) {
                    if (response.success && response.data && response.data.tees.length > 0) {
                        // Si hay tees, habilita el selector y carga las opciones
                        response.data.tees.forEach(tee => {
                            const optionText = `${tee.tee_name} (${tee.gender}) - Rating: ${tee.rating}`;
                            teeSelect.append(
                                `<option value="${tee.club_id}" 
                                        data-club-name="${club_name}" 
                                        data-ciudad="${ciudad}" 
                                        data-gender="${tee.gender}" 
                                        data-rating="${tee.rating}">
                                    ${optionText}
                                </option>`
                            );
                        });
                        teeSelect.prop('disabled', false);
                    } else {
                        alert('No se encontraron tees para este club.');
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Error en la solicitud de tees: ", status, error);
                }
            });
        }

        // Manejar la selección del tee
        $(document).on('change', '#tee_select', function () {
            const selectedOption = $(this).find(':selected');
            const teeName = selectedOption.text();
            const gender = selectedOption.data('gender');
            const rating = selectedOption.data('rating');
            const clubId = selectedOption.val();
            // Mostrar el formulario con la información del club y el tee seleccionado
            $('#club-seleccionado').html(`
                <strong>Tee:</strong> ${teeName} <br>
                <strong>Género:</strong> ${gender} <br>
                <strong>Rating:</strong> ${rating}
            `);
            
            $('#contenedor-seleccion-y-formulario').show();

            $('#club_id').val(clubId);

            $('#resultado_wgh').empty();

            // Desplazar al usuario al formulario
            document.querySelector('#contenedor-seleccion-y-formulario').scrollIntoView({ behavior: 'smooth', block:'center' });
        });

         // Calcular WGH
         $('#form-calcular-wgh').on('submit', function (e) {
            e.preventDefault();
            const club_id = $('#club_id').val();

            const submitButton = $(this).find('button[type="submit"]');
            submitButton.prop('disabled', true).text('Calculando...');

            $.ajax({
                url: ajaxWGH.ajaxurl,
                type: 'POST',
                dataType: 'json', 
                data: {
                    action: 'calcular_wgh',
                    club_id: club_id
                },
                success: function (response) {
                    if (response.success) {
                        $('#resultado_wgh').html(`
                            <p>Tu WGH de juego es:</p>
                            <div class="valor-resultado">${response.data.wgh}</div>
                        `);

                        // Desplazar la vista hasta el resultado del handicap
                        const resultadoHandicap = document.getElementById('resultado_wgh');
                        
                        resultadoHandicap.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        alert(response.data.message || 'Ocurrió un error al calcular el WGH.');
                    }
                },
                error: function (xhr, status, error) {
                    alert('Error al calcular el WGH. Inténtalo de nuevo.');
                },
                complete: function () {
                    submitButton.prop('disabled', false).text('Calcular');
                }
            });
        });
    });
})(jQuery);
