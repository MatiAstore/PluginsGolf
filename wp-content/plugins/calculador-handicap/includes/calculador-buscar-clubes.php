<?php
defined('ABSPATH') || exit;
function calculador_buscar_clubes() {
    global $wpdb;

    $nombre_club = sanitize_text_field($_POST['nombre_club']);
    $pagina = isset($_POST['pagina']) ? intval($_POST['pagina']) : 1;
    $limite = 5;
    $offset = ($pagina - 1) * $limite;

    $append = isset($_POST['append']) && $_POST['append'] === 'true';

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
            '%' . $nombre_club . '%', $nombre_club, '%' . $nombre_club . '%', $limite, $offset
        )
    );

    $total_clubes = $wpdb->get_var(
        $wpdb->prepare("SELECT COUNT(*) FROM wp_clubs WHERE club_name LIKE %s", '%' . $nombre_club . '%')
    );

    if ($clubes) {
        $response = [];
        if (!$append) {
            $response['total_resultados'] = $total_clubes;
        }

        $response['clubes'] = [];
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

        $response['more_results'] = $total_clubes > $pagina * $limite;
        wp_send_json_success($response);
    } else {
        wp_send_json_error(['message' => 'No se encontraron clubes con ese nombre.']);
    }
    wp_die();
}
add_action('wp_ajax_calculador_buscar_clubes', 'calculador_buscar_clubes');
add_action('wp_ajax_nopriv_calculador_buscar_clubes', 'calculador_buscar_clubes');
