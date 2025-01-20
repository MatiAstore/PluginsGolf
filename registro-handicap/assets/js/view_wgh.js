(function ($) {
    $(document).ready(function () {
        const promedioDesempeñoSpan = $('#promedio-partidas');
        const promedioYardasSpan = $('#promedio-yardas'); 
        const totalRondasSpan = $('#total-rondas'); 
        const camposSpan = $('#campos'); 

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
                        const { promedio_desempeño, promedio_length, total_rondas, campos_diferentes } = response.data;

                        // Validar que los valores sean números
                        // Validar que los valores sean números
                        if (
                            isNaN(promedio_desempeño) || 
                            isNaN(promedio_length) || 
                            isNaN(total_rondas) || 
                            isNaN(campos_diferentes)
                        ) {
                            $('.shortcode-view').html('<p>Error: Los datos recibidos no son válidos.</p>');
                        } else {
                            // Mostrar el promedio de desempeño
                            promedioDesempeñoSpan.text(parseFloat(promedio_desempeño).toFixed(2));

                            // Mostrar el promedio de yardas
                            promedioYardasSpan.text(parseFloat(promedio_length).toFixed(2)); 

                            // Mostrar el total de rondas
                            totalRondasSpan.text(parseInt(total_rondas, 10)); 

                            // Mostrar los campos diferentes
                            camposSpan.text(parseInt(campos_diferentes, 10)); 
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