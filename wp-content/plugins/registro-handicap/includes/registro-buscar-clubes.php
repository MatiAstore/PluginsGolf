<?php
defined('ABSPATH') || exit;

function registro_buscar_clubes() {
    global $wpdb;

    // Sanitizar la entrada
    $nombre_club = isset($_POST['nombre_club']) ? sanitize_text_field($_POST['nombre_club']) : '';
    $pagina = isset($_POST['pagina']) ? intval($_POST['pagina']) : 1;
    $limite = 5;
    $offset = ($pagina - 1) * $limite;

    $append = isset($_POST['append']) && $_POST['append'] === 'true';

    // Consulta para obtener clubes
    $clubes = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT id, club_name, ciudad, tee_name, gender, slope_rating
             FROM wp_clubs
             WHERE club_name LIKE %s
             ORDER BY CASE
                        WHEN club_name = %s THEN 1
                        WHEN club_name LIKE %s THEN 2
                        ELSE 3
                      END
             LIMIT %d OFFSET %d",
            '%' . $nombre_club . '%',
            $nombre_club,
            '%' . $nombre_club . '%',
            $limite,
            $offset
        )
    );

    // Total de clubes encontrados
    $total_clubes = $wpdb->get_var(
        $wpdb->prepare(
            "SELECT COUNT(*) 
             FROM wp_clubs 
             WHERE club_name LIKE %s",
            '%' . $nombre_club . '%'
        )
    );

    if (!empty($clubes)) {
        $response = [
            'clubes' => [],
            'more_results' => $total_clubes > $pagina * $limite,
        ];

        // Solo incluir total si no es una solicitud de "append"
        if (!$append) {
            $response['total_resultados'] = $total_clubes;
        }

        foreach ($clubes as $club) {
            $response['clubes'][] = [
                'id' => $club->id,
                'club_name' => $club->club_name,
                'ciudad' => $club->ciudad,
                'tee_name' => $club->tee_name,
                'gender' => $club->gender,
                'rating' => $club->slope_rating,
            ];
        }

        // Respuesta exitosa
        wp_send_json_success($response);
    } else {
        wp_send_json_error(['message' => 'No se encontraron clubes con ese nombre.']);
    }

    wp_die();
}

// Registrar las acciones AJAX para usuarios logueados y no logueados
add_action('wp_ajax_registro_buscar_clubes', 'registro_buscar_clubes');
