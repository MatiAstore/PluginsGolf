<?php
defined('ABSPATH') || exit;

require_once plugin_dir_path(__FILE__) . '../includes/calculador-buscar-clubes.php';
require_once plugin_dir_path(__FILE__) . '../includes/calcular-handicap.php';

// Cargar el JavaScript y CSS del plugin solo si el shortcode está presente
function cargar_scripts_calcular() {
    if (is_singular() && has_shortcode(get_post()->post_content, 'formulario_handicap')) {
        wp_enqueue_script('handicap-js', plugin_dir_url(__FILE__) . '../assets/js/handicap.js', array('jquery'), null, true);
        wp_enqueue_style('handicap-css', plugin_dir_url(__FILE__) . '../assets/css/handicap.css', array(), null, 'all');
        wp_localize_script('handicap-js', 'ajaxHandicap', array(
            'ajaxurl' => admin_url('admin-ajax.php')
        ));
    }
}
add_action('wp_enqueue_scripts', 'cargar_scripts_calcular');

// Shortcode para mostrar el formulario
function mi_plugin_formulario_handicap() {
    ob_start();
    ?>        
    <div class="shortcode-handicap" id="shortcode-handicap">
        <input type="text" id="nombre_club" placeholder="Buscar club">

        <div id="resultados_clubes"></div>

        <div id="tee-seleccionado" style="display: none;">
            <label for="tee_select">Seleccionar Tee:</label>
            <select id="tee_select" name="tee_select" required>
            </select>
        </div>

        <div id="contenedor-seleccion-y-formulario" style="display: none;">
            <div id="club-seleccionado"></div>

            <form id="form-calcular-handicap">
                <input type="hidden" id="club_id">
                <input type="number" id="index_jugador" placeholder="Índice del jugador" step="any" required>
                <button type="submit">Calcular Handicap</button>
            </form>
            
            <div id="resultado_handicap"></div>
        </div>
    </div>  
    <?php
    return ob_get_clean();
}
add_shortcode('formulario_handicap', 'mi_plugin_formulario_handicap');
