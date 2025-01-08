<?php 
defined('ABSPATH') || exit; 

function obtener_wgh(){
    if (!is_user_logged_in()) {
        wp_send_json_error(['message' => 'Debes estar logueado para ver tus partidas.']);
        wp_die();
    }

    global $wpdb; 

    $user_id = get_current_user_id(); 

    // Obtener el promedio de la tabla 'users_promedio'
    $tabla_promedios = $wpdb->prefix . 'users_promedio'; 

    $promedio_desempeño = $wpdb->get_var(
        $wpdb->prepare("SELECT promedio_desempeño FROM $tabla_promedios WHERE user_id = %d", $user_id)
    );

    $promedio_length = $wpdb->get_var(
        $wpdb->prepare("SELECT promedio_length FROM $tabla_promedios WHERE user_id = %d", $user_id)
    ); 

    $promedio_desempeño = $promedio_desempeño !== null ? (float) $promedio_desempeño : 0.0;
    $promedio_length = $promedio_length !== null ? (float) $promedio_length : 0.0;

    // Asegurar que los valores no sean nulos y enviar respuesta
    wp_send_json_success([
        'promedio_desempeño' => (float) $promedio_desempeño,
        'promedio_length' => (float) $promedio_length,
    ]);
}
add_action('wp_ajax_obtener_wgh', 'obtener_wgh');
add_action('wp_ajax_nopriv_obtener_wgh', 'obtener_wgh');
