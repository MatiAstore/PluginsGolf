<?php 
/**
 * Plugin Name: Calcular Handicap Golf
 * Description: Un plugin para calcular el handicap de un jugador de golf.
 * Version: 1.0
 * Author: Matias Astore
*/

defined('ABSPATH') || exit;

// Definir constantes de rutas para uso en todo el plugin
define('CALCULADOR_HANDICAP_PATH', plugin_dir_path(__FILE__));
define('CALCULADOR_HANDICAP_URL', plugin_dir_url(__FILE__));

// Incluir los archivos de shortcodes
require_once CALCULADOR_HANDICAP_PATH . 'shortcodes/calculador-handicap.php';
require_once CALCULADOR_HANDICAP_PATH . 'shortcodes/calculador-wgh.php';
