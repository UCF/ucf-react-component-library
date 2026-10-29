<?php
/**
 * Plugin Name: UCF Content Blocks
 * Description: General UCF content blocks, built from the @ucf/components React library.
 * Version: 0.1.0
 * Requires at least: 6.6
 * Requires PHP: 8.1
 * Author: UCF Web Communications
 * License: GPL-2.0-or-later
 * Text Domain: ucf-content
 *
 * @package ucf-content
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/build/shared.php';

ucf_components_register_plugin( __DIR__ . '/build', plugins_url( 'build', __FILE__ ) );
