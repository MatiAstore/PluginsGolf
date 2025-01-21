<?php 
defined('ABSPATH') || exit;

function obtener_partidas() {
    // Verificar si el usuario está logueado
    if (!is_user_logged_in()) {
        wp_send_json_error(['message' => 'Debes estar logueado para ver tus partidas.']);
        wp_die();
    }

    global $wpdb;

    // Obtener el ID del usuario actual logueado
    $user_id = get_current_user_id();
    // $pagina = isset($_POST['pagina']) ? intval($_POST['pagina']) : 1; 
    // $limite = 10; 
    // $offset = ($pagina - 1) * $limite;

    // Consulta para obtener las partidas
    $partidas = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT hp.*, 
            (SELECT c.club_name FROM wp_clubs c WHERE c.id = hp.club_id) AS club_name,
            (SELECT c.tee_name FROM wp_clubs c WHERE c.id = hp.club_id) AS tee_name,
            (SELECT c.gender FROM wp_clubs c WHERE c.id = hp.club_id) AS gender
            FROM wp_historial_partidas hp
            WHERE hp.user_id = %d
            ORDER BY hp.fecha_juego DESC", 
            $user_id
        ),
        ARRAY_A
    );

    // Obtener el número total de partidas
    // $total_partidas = $wpdb->get_var(
    //     $wpdb->prepare("SELECT COUNT(*) FROM wp_historial_partidas WHERE user_id = %d", $user_id)
    // );

    // Verificar si hay resultados
    if (empty($partidas)) {
        wp_send_json_success([
            'partidas' => [],
            'promedio_desempeño' => 0,
            'promedio_length' => 0,
            'total_partidas' => 0,
        ]);
        wp_die();
    }

    // Obtener los promedios de la tabla 'users_promedio'
    $tabla_promedios = $wpdb->prefix . 'users_promedio'; 

    $promedio_desempeño = $wpdb->get_var(
        $wpdb->prepare("SELECT promedio_desempeño FROM $tabla_promedios WHERE user_id = %d", $user_id)
    );

    $promedio_length = $wpdb->get_var(
        $wpdb->prepare("SELECT promedio_length FROM $tabla_promedios WHERE user_id = %d", $user_id)
    ); 

    $promedio_desempeño = $promedio_desempeño ?? 0;
    $promedio_length = $promedio_length ?? 0;
   
    wp_send_json_success([
        'partidas' => $partidas,
        'promedio_desempeño' => $promedio_desempeño,
        'promedio_length' => $promedio_length,
        'total_partidas' => count($partidas),
    ]);

    wp_die();
}
add_action('wp_ajax_obtener_partidas', 'obtener_partidas');
add_action('wp_ajax_nopriv_obtener_partidas', 'obtener_partidas');
