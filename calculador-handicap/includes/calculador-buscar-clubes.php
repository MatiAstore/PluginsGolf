<?php
defined('ABSPATH') || exit;
function calculador_buscar_clubes() {
    global $wpdb;

    // Obtener y sanitizar la entrada
    $nombre_club = isset($_POST['nombre_club']) ? sanitize_text_field($_POST['nombre_club']) : '';

    $pagina = isset($_POST['pagina']) ? intval($_POST['pagina']) : 1;
    $limite = 5;
    $offset = ($pagina - 1) * $limite;

    $append = isset($_POST['append']) && $_POST['append'] === 'true';

    // Consulta para obtener clubes únicos por nombre (usando GROUP BY)
    $clubes = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT MIN(id) as id, club_name, ciudad
             FROM wp_clubs
             WHERE club_name LIKE %s
             GROUP BY club_name, ciudad
             ORDER BY CASE
                        WHEN club_name = %s THEN 1
                        WHEN club_name LIKE %s THEN 2
                        ELSE 3
                     END
             LIMIT %d OFFSET %d",
            '%' . esc_sql($nombre_club) . '%',
            $nombre_club,
            '%' . esc_sql($nombre_club) . '%',
            $limite,
            $offset
        )
    );

    // Total de clubes encontrados
    $total_clubes = $wpdb->get_var(
        $wpdb->prepare(
            "SELECT COUNT(DISTINCT club_name) 
             FROM wp_clubs 
             WHERE club_name LIKE %s",
            '%' . esc_sql($nombre_club) . '%'
        )
    );

    if (!empty($clubes)) {
        $response = [
            'clubes' => [],
            'more_results' => $total_clubes > $pagina * $limite,
        ];

        if (!$append) {
            $response['total_resultados'] = $total_clubes;
        }

        foreach ($clubes as $club) {
            $response['clubes'][] = [
                'club_id' => $club->id, 
                'club_name' => $club->club_name,
                'ciudad' => $club->ciudad,
            ];
        }

        // Respuesta exitosa
        wp_send_json_success($response);
    } else {
        wp_send_json_error(['message' => 'No se encontraron clubes con ese nombre.']);
    }

    wp_die();
}
add_action('wp_ajax_calculador_buscar_clubes', 'calculador_buscar_clubes');
add_action('wp_ajax_nopriv_calculador_buscar_clubes', 'calculador_buscar_clubes');

function calculador_buscar_tees() {
    global $wpdb;

    // Obtener el nombre del club desde la solicitud
    $club_name = isset($_POST['club_name']) ? $_POST['club_name'] : '';  // Evitar la sanitización aquí

    // Validar que no esté vacío
    if (empty($club_name)) {
        wp_send_json_error(['message' => 'El nombre del club no es válido.']);
        wp_die();
    }

    // Escapar el nombre del club para la consulta
    $club_name = esc_sql($club_name);

    // Consulta para obtener los nombres únicos de tees para el club especificado
    $tees = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT DISTINCT id, tee_name, gender, slope_rating 
             FROM wp_clubs 
             WHERE club_name = %s",
            $club_name
        )
    );

    // Validar si no hay tees
    if (empty($tees)) {
        wp_send_json_error(['message' => 'No se encontraron tees para este club.']);
        wp_die();
    }

    // Construir la respuesta con validación adicional
    $response = [
        'tees' => []
    ];

    foreach ($tees as $tee) {
        // Validar que tee_name no sea vacío ni inválido
        if (!empty($tee->tee_name) && trim($tee->tee_name) !== "") {
            $response['tees'][] = [
                'club_id' => $tee->id, // Agregar el ID del club
                'tee_name' => $tee->tee_name,
                'gender' => $tee->gender,
                'rating' => $tee->slope_rating,
            ];
        }
    }

    // Si no se encontraron tees válidos
    if (empty($response['tees'])) {
        wp_send_json_error(['message' => 'No se encontraron tees válidos para este club.']);
        wp_die();
    }

    // Respuesta exitosa
    wp_send_json_success($response);

    wp_die();
}
add_action('wp_ajax_calculador_buscar_tees', 'calculador_buscar_tees');
add_action('wp_ajax_nopriv_calculador_buscar_tees', 'calculador_buscar_tees');

