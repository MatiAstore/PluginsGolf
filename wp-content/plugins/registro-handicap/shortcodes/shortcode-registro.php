<?php 
defined('ABSPATH') || exit; 

require_once plugin_dir_path(__FILE__) . '../includes/registro-buscar-clubes.php';
require_once plugin_dir_path(__FILE__) . '../includes/registrar-partida.php';

function cargar_scripts_registro_partida() {
    // Verificar si el shortcode está en la página actual
    if (is_singular() && has_shortcode(get_post()->post_content, 'registro_partida')) {
        wp_enqueue_style(
            'registro_handicap_css',
            plugin_dir_url(__FILE__) . '../assets/css/registro-handicap.css'
        );

        // Encolar Flatpickr
        wp_enqueue_script(
            'flatpickr',
            'https://cdn.jsdelivr.net/npm/flatpickr',
            array(),
            null,
            true
        );
        wp_enqueue_style(
            'flatpickr-css',
            'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css'
        );

        wp_enqueue_script(
            'flatpickr-locale-es',
            'https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/es.js', // Ruta del archivo de idioma
            array('flatpickr'), // Asegúrate de que dependa de flatpickr
            null,
            true
        );

        wp_enqueue_script(
            'registro_partida_js',
            plugin_dir_url(__FILE__) . '../assets/js/registro_partida.js',
            array('jquery', 'flatpickr'),
            null,
            true
        );

        wp_localize_script('registro_partida_js', 'registroPartidaData', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
        ));
    }
}
add_action('wp_enqueue_scripts', 'cargar_scripts_registro_partida');

// Shortcode para mostrar el formulario
function formulario_partida() {
    ob_start();
    // $fecha_actual = current_time('Y-m-d');
    // $hora_actual = current_time('H:i'); // Hora actual en formato 24h
    // $fecha_hora_actual = $fecha_actual . 'T' . $hora_actual; // Formato para datetime-local

    ?>
    <div class="shortcode-registro" id="shortcode-registro">
        <label for="nombre_club">Seleccionar club:</label>
        <input type="text" id="nombre_club" name="nombre_club" placeholder="Buscar club" required>
        
        <div id="resultados_clubes"></div>

        <div id="contenedor-seleccion-y-formulario" style="display: none;">

            <div id="club-seleccionado" class="margin-top: 10px;"></div>
            
            <form id="form_partida" method="POST">
                <input type="hidden" id="club_id" name="club_id" value="">
                
                <label for="golpes_totales">Número de Golpes:</label>
                <input type="number" id="golpes_totales" name="golpes_totales" placeholder="Numero de Golpes" min="1" required>
                
                <label for="fecha_juego">Fecha de la Partida:</label>
                <input type="text" id="fecha_juego_fecha" name="fecha_juego_fecha"  placeholder="Fecha"  required>

                <label for="hora_juego">Hora de la Partida:</label>
                <input type="text" id="fecha_juego_hora" name="fecha_juego_hora" placeholder="Hora"  required>

                <button type="submit" id="submit_partida">Registrar Partida</button>
            </form>
    
        </div>
        
        <div id="resultado" class="margin-top: 10px;"></div>    
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode("registro_partida", "formulario_partida"); 