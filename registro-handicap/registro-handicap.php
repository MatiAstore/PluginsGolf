<?php
/*
Plugin Name: Registro Handicap Golf
Description: Un plugin para registrar las partidas de un jugador y calcular su handicap
Version: 1.1
Author: Matias Astore 
License: GPLv2 or later
*/

defined('ABSPATH') || exit;

// Definir constantes de rutas para uso en todo el plugin
define('REGISTRO_HANDICAP_PATH', plugin_dir_path(__FILE__));
define('REGISTRO_HANDICAP_URL', plugin_dir_url(__FILE__));

// Incluir los archivos de shortcodes
require_once REGISTRO_HANDICAP_PATH . 'shortcodes/shortcode-registro.php';    
require_once REGISTRO_HANDICAP_PATH . 'shortcodes/shortcode-historial.php';
require_once REGISTRO_HANDICAP_PATH . 'shortcodes/shortcode-view.php';