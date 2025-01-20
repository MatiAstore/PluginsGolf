(function ($) {
    $(document).ready(function () {
        const promedioDesempeñoSpan = $('#promedio-partidas');
        const promedioYardasSpan = $('#promedio-yardas'); 

        function obtenerPromedios() {
            $.ajax({
                url: ajaxView.ajaxurl,
                type: 'POST',
                dataType: 'json',
                data: {
                    action: 'obtener_wgh',
                },
                beforeSend: function () {
                },
                success: function (response) {
                    if (response.success) {
                        const { promedio_desempeño, promedio_length } = response.data;

                        // Validar que los valores sean números
                        if (isNaN(promedio_desempeño) || isNaN(promedio_length)) {
                            $('.shortcode-view').html('<p>Error: Los datos recibidos no son válidos.</p>');
                        } else {
                            // Convertir el promedio a número y mostrarlo
                            const promedioDesempeñoNumerico = parseFloat(promedio_desempeño);
                            promedioDesempeñoSpan.text(promedioDesempeñoNumerico.toFixed(2));

                            // Convertir el promedio a número y mostrarlo
                            const promedioLengthNumerico = parseFloat(promedio_length);
                            promedioYardasSpan.text(promedioLengthNumerico.toFixed(2)); 
                        }
                    } else {
                        $('.shortcode-view').html(`<p>${response.data.message || 'Error al cargar tus datos. Por favor, intenta nuevamente.'}</p>`);
                    }
                },
                error: function () {
                    $('.shortcode-view').html('<p>Error en la solicitud. Inténtalo de nuevo más tarde.</p>');
                },
            });
        }

        // Llamar a la función al cargar la página
        obtenerPromedios();
    });
})(jQuery);
a