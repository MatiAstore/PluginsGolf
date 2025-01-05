<?php 
defined('ABSPATH') || exit; 

require_once plugin_dir_path(__FILE__) . '../includes/calculador-buscar-clubes.php';
require_once plugin_dir_path(__FILE__) . '../includes/calcular-wgh.php';

// Cargar el JavaScript y CSS del plugin
function mi_plugin_enqueue_scripts_wgh() {
    wp_enqueue_script('wgh-js', plugin_dir_url(__FILE__) . '../assets/js/wgh.js', array('jquery'), null, true);
    wp_enqueue_style('handicap-css', plugin_dir_url(__FILE__) . '../assets/css/handicap.css', array(), null, 'all');
    wp_localize_script('wgh-js', 'ajaxWGH', array(
        'ajaxurl' => admin_url('admin-ajax.php')
    ));
}
add_action('wp_enqueue_scripts', 'mi_plugin_enqueue_scripts_wgh');

function mi_plugin_formulario_wgh() {
    ob_start();
    ?>        
    <div class="shortcode-wgh" id="shortcode-wgh">
        <input type="text" id="nombre_club" placeholder="Buscar club">

        <div id="resultados_clubes"></div>

        <div id="contenedor-seleccion-y-formulario" style="display: none;">
            <div id="club-seleccionado"></div>

            <form id="form-calcular-wgh">
                <input type="hidden" id="club_id">
                <button type="submit">Calcular WGH de Juego</button>
            </form>
            
            <div id="resultado_wgh"></div>
        </div>
    </div>  
    <?php
    return ob_get_clean();
}
add_shortcode('formulario_wgh', 'mi_plugin_formulario_wgh');