<?php 
defined('ABSPATH') || exit;


// Funcion para obtener partidas usuario 
function obtener_partidas() {
    // Verificar si el usuario está logueado
    if (!is_user_logged_in()) {
        wp_send_json_error(['message' => 'Debes estar logueado para ver tus partidas.']);
        wp_die();
    }

    global $wpdb;

    $user_id = get_current_user_id();

    // Consulta para obtener las partidas
    $partidas = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT hp.*, c.club_name, c.tee_name, c.gender
            FROM {$wpdb->prefix}historial_partidas hp
            LEFT JOIN {$wpdb->prefix}clubs c ON c.id = hp.club_id
            WHERE hp.user_id = %d
            ORDER BY hp.fecha_juego DESC",
            $user_id
        ),
        ARRAY_A
    );

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

// Funcion para eliminar partida
function eliminar_partida(){

    if(!is_user_logged_in()){
        wp_send_json_error(["message" => "Debes estar logueado para eliminar una partida"]);
        wp_die(); 
    }

    global $wpdb; 

    $user_id = get_current_user_id();
    $partida_id = isset($_POST['partida_id']) ? intval($_POST['partida_id']) : 0; 
 
    if ($partida_id === 0) {
        wp_send_json_error(['message' => 'ID de partida inválido.']);
        wp_die();
    }

    $eliminado = $wpdb->delete(
        $wpdb->prefix . 'historial_partidas',
        ['id' => $partida_id, 'user_id' => $user_id],
        ['%d', '%d']
    );

    if($eliminado === false){
        wp_send_json_error(['message'=> "Error al intentar eliminar la partida"]); 
        wp_die(); 
    }

    // Obtener las últimas 20 partidas ordenadas por fecha_juego y las 10 mejores
    $mejores_partidas = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT desempeño_objetivo, length 
                FROM (
                    SELECT desempeño_objetivo, length
                    FROM {$wpdb->prefix}historial_partidas
                    WHERE user_id = %d
                    ORDER BY fecha_juego DESC LIMIT 20
                ) AS ultimas_partidas
                ORDER BY desempeño_objetivo ASC LIMIT 10",
            $user_id
        ),
        ARRAY_A
    );    

    $promedio_desempeño = !empty($mejores_partidas)
    ? array_sum(array_column($mejores_partidas, 'desempeño_objetivo')) / count($mejores_partidas)
    : 0;

    $promedio_length = !empty($mejores_partidas)
    ? array_sum(array_column($mejores_partidas, 'length')) / count($mejores_partidas)
    : 0;

    // Actualizar la tabla wp_users_promedio
    $tabla_promedios = $wpdb->prefix . 'users_promedio';
    $actualizado = $wpdb->update(
        $tabla_promedios,
        [
            'promedio_desempeño' => $promedio_desempeño,
            'promedio_length' => $promedio_length,
        ],
        ['user_id' => $user_id],
        ['%f', '%f'],
        ['%d']
    );

    if($actualizado === false){
        wp_send_json_error(['message' => 'Error al intentar actualizar los promedios.']);
        wp_die();
    }

    // Respuesta JSON
    wp_send_json_success([
        'message' => 'Partida eliminada y promedios actualizados.',
        'promedio_desempeño' => $promedio_desempeño,
        'promedio_length' => $promedio_length,
    ]);

}
add_action('wp_ajax_eliminar_partida', 'eliminar_partida');