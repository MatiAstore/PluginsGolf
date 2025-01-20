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
    $tabla_historial_partidas = $wpdb ->prefix . 'historial_partidas'; 
    $tabla_clubs = $wpdb->prefix . 'clubs'; 

    $promedio_desempeño = $wpdb->get_var(
        $wpdb->prepare("SELECT promedio_desempeño FROM $tabla_promedios WHERE user_id = %d", $user_id)
    );

    $promedio_length = $wpdb->get_var(
        $wpdb->prepare("SELECT promedio_length FROM $tabla_promedios WHERE user_id = %d", $user_id)
    );
    
    $total_rondas = $wpdb->get_var(
        $wpdb->prepare("SELECT COUNT(*) FROM $tabla_historial_partidas WHERE user_id = %d", $user_id)
    );    

    $campos_diferentes = $wpdb->get_var(
        $wpdb->prepare(
            "SELECT COUNT(DISTINCT c.club_name) 
             FROM $tabla_historial_partidas hp 
             INNER JOIN $tabla_clubs c 
             ON hp.club_id = c.id 
             WHERE hp.user_id = %d", 
            $user_id
        )
    );
    
    $promedio_desempeño = $promedio_desempeño !== null ? (float) $promedio_desempeño : 0.0;
    $promedio_length = $promedio_length !== null ? (float) $promedio_length : 0.0;
    $total_rondas = $total_rondas !== null ? IntVal($total_rondas) : 0; 
    $campos_diferentes = $campos_diferentes !== null ? IntVal($campos_diferentes) : 0; 

    // Asegurar que los valores no sean nulos y enviar respuesta
    wp_send_json_success([
        'promedio_desempeño' => $promedio_desempeño,
        'promedio_length' => $promedio_length,
        'total_rondas' => $total_rondas,
        'campos_diferentes' => $campos_diferentes,
    ]);
}
add_action('wp_ajax_obtener_wgh', 'obtener_wgh');
add_action('wp_ajax_nopriv_obtener_wgh', 'obtener_wgh');
