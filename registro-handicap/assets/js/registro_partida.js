(function ($) {
    $(document).ready(function () {
        // Inicializa flatpickr
        function initFlatpickr() {
            flatpickr('#fecha_juego_fecha', {
                clickOpens: true,
                locale: 'es',
                dateFormat: "Y-m-d",
                maxDate: "today",
                closeOnSelect: false,
            });

            flatpickr('#fecha_juego_hora', {
                enableTime: true,
                noCalendar: true,
                dateFormat: "H:i",
                allowInput: true,
            });
        }

        function toggleSubmitButton(enable, text) {
            $('#submit_partida').prop('disabled', !enable).text(text);
        }

        function validarFormulario() {
            const errores = [];
            const club_id = $('#club_id').val();
            const golpes_totales = $('#golpes_totales').val();
            const fecha = $('#fecha_juego_fecha').val();
            const hora = $('#fecha_juego_hora').val();

            if (!club_id) errores.push('Seleccione un club.');
            if (!golpes_totales || golpes_totales <= 0) errores.push('Ingrese un número válido de golpes.');
            if (!fecha) errores.push('Ingrese una fecha válida.');
            if (!hora) errores.push('Ingrese una hora válida.');

            return errores;
        }

        function mostrarErrores(errores) {
            const resultado = $('#resultado');
            resultado.empty();

            if (errores.length > 1) {
                resultado.html(`
                    <div class="error-message" role="alert">
                        Por favor, complete todos los campos correctamente.
                    </div>
                `);
            } else if (errores.length === 1) {
                resultado.html(`
                    <div class="error-message" role="alert">
                        ${errores[0]}
                    </div>
                `);
            }

            $('.error-message').fadeIn(300).focus();
        }
        
        function handleAjaxSuccess(response, golpes_totales) {
            if (response.success && response.data) {
                // Oculta todos los elementos antes de mostrar el mensaje de éxito
                $('#contenedor-seleccion-y-formulario').fadeOut(300, function () {
                    $('#form_partida')[0].reset();
                    $('#club_id').val('');
                    $('#tee-seleccionado').val('').hide();
                    $('#club-info-seleccionado').hide();
                    $('#club-seleccionado').empty();
        
                    // Muestra el mensaje de éxito
                    const mensaje = `
                        <div class="success-message" style="display:none;" tabindex="0" role="alert">
                            <h2>${response.data.success}</h2>
                            <p>Total de golpes registrados: <strong>${golpes_totales}</strong></p>
                        </div>`;
                    $('#resultado').html(mensaje);
        
                    const successMessage = $('#resultado .success-message');
                    successMessage.fadeIn(100, function () {
                        successMessage[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }).focus();
        
                    // Oculta el mensaje después de un tiempo
                    // setTimeout(function () {
                    //     successMessage.fadeOut(500, function () {
                    //         $('#resultado').empty();
                    //     });
                    // }, 5000);
                });
            } else {
                mostrarErrores(response.data?.error || 'Ocurrió un error inesperado al registrar la partida.');
            }
        }
        
        $('#form_partida').on('submit', function (e) {
            e.preventDefault();

            const errores = validarFormulario();
            if (errores.length > 0) {
                mostrarErrores(errores);
                return;
            }

            const club_id = $('#club_id').val();
            const golpes_totales = $('#golpes_totales').val();
            const fecha = $('#fecha_juego_fecha').val();
            const hora = $('#fecha_juego_hora').val();
            const fecha_juego = `${fecha} ${hora}`;

            toggleSubmitButton(false, "Registrando...");

            $.ajax({
                url: registroPartida.ajaxurl,
                type: 'POST',
                data: { action: 'registrar_partida', club_id, golpes_totales, fecha_juego },
                dataType: 'json',
                success: function (response) {
                    handleAjaxSuccess(response, golpes_totales);
                    toggleSubmitButton(true, "Registrar Ronda");
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    const errorMensaje = jqXHR.responseJSON?.message || errorThrown || 'Hubo un problema con la conexión al servidor.';
                    mostrarErrores(errorMensaje);
                    toggleSubmitButton(true, "Registrar Ronda");
                }
            });
        });

        initFlatpickr();
    });
})(jQuery);
