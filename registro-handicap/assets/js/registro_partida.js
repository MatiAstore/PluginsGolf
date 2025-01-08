(function ($) {
    $(document).ready(function () {
        // Inicializa flatpickr para fecha y hora
        flatpickr('#fecha_juego_fecha', {
            clickOpens: true,
            locale: 'es',
            dateFormat: "Y-m-d",
            closeOnSelect: false, // No cerrar el calendario al seleccionar una fecha
        });

        flatpickr('#fecha_juego_hora', {
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            allowInput: true,  // Permite la entrada manual
        });

        // Función para limpiar el formulario y otros elementos
        function resetFormulario() {
            $('#form_partida')[0].reset(); // Limpiar los campos del formulario
            $('#club-seleccionado').empty(); // Limpiar la selección del club
            $('#club_id').val(''); // Resetear el ID del club
            $('#resultado').empty(); // Limpiar el resultado
            $('#contenedor-seleccion-y-formulario').fadeOut(300); // Ocultar el formulario
        }

        // Evento para manejar el envío del formulario
        $('#form_partida').on('submit', function (e) {
            e.preventDefault();

            // Obtener los datos de los campos
            const club_id = $('#club_id').val();
            const golpes_totales = $('#golpes_totales').val();
            const fecha = $('#fecha_juego_fecha').val();
            const hora = $('#fecha_juego_hora').val();

            if (!club_id || !golpes_totales || !fecha || !hora) {
                alert("Por favor complete todos los campos");
                return;
            }

            const fecha_juego = `${fecha} ${hora}`;

            // Deshabilitar el botón de envío y cambiar el texto
            $('#submit_partida').prop('disabled', true).text("Registrando...");

            // Enviar datos al servidor mediante AJAX
            $.ajax({
                url: registroPartida.ajaxurl,
                type: 'POST',
                data: {
                    action: 'registrar_partida',
                    club_id: club_id,
                    golpes_totales: golpes_totales,
                    fecha_juego: fecha_juego
                },
                dataType: 'json',
                success: function (response) {
                    if (response.success) {
                        const mensaje = `
                            <div class="success-message" style="display:none;">
                                <h2>Su ronda fue cargada con éxito</h2>
                                <p>Total de golpes registrados: <strong>${golpes_totales}</strong></p>
                            </div>
                        `;
                        $('#resultado').html(mensaje);

                        // Ocultar el select de tee inmediatamente después de enviar el formulario
                        $('#tee-seleccionado').val('').hide();

                        // Ocultar el formulario con una animación
                        $('#contenedor-seleccion-y-formulario').fadeOut(300, function() {
                            // Después de ocultar el formulario, mostrar el mensaje de éxito
                            $('#resultado .success-message').fadeIn(500);

                            // Desplazamiento hacia el mensaje de éxito
                            $('#resultado .success-message')[0].scrollIntoView({
                                behavior: 'smooth',
                                block: 'center' // Esto asegura que el mensaje se alinee en el centro de la vista
                            });

                            // Desvanecer el mensaje con transición
                            setTimeout(function () {
                                $('#resultado .success-message').fadeOut(500, function() {
                                    // Limpiar el contenido después de que se haya desvanecido
                                    resetFormulario(); 
                                });
                            }, 6000); // Desaparece después de 6 segundos
                        });

                    } else {
                        $('#resultado').html('<span class="error">' + (response.data?.error || 'Error al registrar.') + '</span>');
                    }

                    // Volver a habilitar el botón después de que la respuesta se haya procesado
                    $('#submit_partida').prop('disabled', false).text('Registrar Partida');
                },
                error: function () {
                    alert('Hubo un error al registrar la partida.');
                    $('#submit_partida').prop('disabled', false).text('Registrar Partida');
                }
            });
        });
    });
})(jQuery);
