<?php 
defined('ABSPATH') || exit; 
function registrar_partida(){
    global $wpdb; 

    // Validar si el usuario está logueado
    if (!is_user_logged_in()) {
        wp_send_json_error(['error' => 'Debes iniciar sesión para registrar una partida.']); 
    }

    // Recibir y validar los datos de la petición AJAX
    $club_id = isset($_POST["club_id"]) ? intval($_POST['club_id']) : 0; 
    $golpes_totales = isset($_POST["golpes_totales"]) ? intval($_POST["golpes_totales"]) : 0; 
    $fecha_juego = isset($_POST['fecha_juego']) ? sanitize_text_field($_POST['fecha_juego']) : '';

    if (!$club_id || !$golpes_totales) {
        wp_send_json_error(['error' => "Faltan datos obligatorios: Club y Golpes Totales"]);
    }

    if (!strtotime($fecha_juego) || !$fecha_juego) {
        wp_send_json_error(['error' => 'La fecha es obligatoria y debe tener un formato válido.']); 
    }

    // Tomar datos del club elegido 
    $club = $wpdb->get_row($wpdb->prepare(
        "SELECT id, par, course_rating, length FROM wp_clubs WHERE id = %d", 
        $club_id
    )); 

    // Checar si el club existe 
    if (!$club) {
        wp_send_json_error(['error' => 'No se ha encontrado el club proporcionado.']);
    }

    $tabla_historial = $wpdb->prefix . 'historial_partidas';
    
    // Calcular desempeño
    $desempeño_objetivo = ($golpes_totales - $club->course_rating);  
    $desempeño_objetivo = round($desempeño_objetivo, 2); 

    //Calcular total neto
    $total_neto = ($golpes_totales - $club->par); 

    // Guardar registro en base de datos
    $partida = array(
        'user_id' => get_current_user_id(),
        'club_id' => $club_id,
        'par'=> $club->par, 
        'course_rating'=> $club->course_rating,
        'length'=> $club->length, 
        'golpes_totales' => $golpes_totales, 
        'fecha_juego' => $fecha_juego, 
        'total_neto' => $total_neto, 
        'desempeño_objetivo' => $desempeño_objetivo,
    ); 

    $inserted = $wpdb->insert($tabla_historial, $partida);

    if ($inserted) {
        $user_id = get_current_user_id(); 

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

        $tabla_promedios = $wpdb->prefix . 'users_promedio'; 

        // Actualizar o insertar los promedios en la tabla
        $wpdb->replace($tabla_promedios, 
            [
                'user_id' => $user_id, 
                'promedio_desempeño' => $promedio_desempeño, 
                'promedio_length' => $promedio_length
            ],
            ['%d', '%f', '%f']
        ); 

        wp_send_json_success(['success' => 'Su ronda fue cargada con éxito']); 
    } else {
        wp_send_json_error(['error' => 'Hubo un error al registrar la partida. Por favor, inténtalo más tarde.']);
    }
    wp_die(); 
}
add_action('wp_ajax_registrar_partida', 'registrar_partida'); // Para usuarios autenticados
