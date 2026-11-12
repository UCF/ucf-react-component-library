<?php
/**
 * Plugin Name: UCF Degree Blocks
 * Description: UCF degree and program blocks, built from the @ucf/components React library.
 * Version: 0.1.0
 * Requires at least: 6.6
 * Requires PHP: 8.1
 * Author: UCF Web Communications
 * License: GPL-3.0-or-later
 * Text Domain: ucf-degrees
 *
 * @package ucf-degrees
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/build/shared.php';

ucf_components_register_plugin( __DIR__ . '/build', plugins_url( 'build', __FILE__ ) );

/**
 * Site-wide settings for the Degree Finder, passed to the component as props.
 *
 * WHY only overrides: the component's own defaults (components/interactive/degree-finder/defaults.ts)
 * apply to anything this leaves out, so the default API address lives in one place. The one
 * exception is the search page, which render.php also needs for its no-JavaScript link.
 *
 * @return array{searchUrl: string, apiRoot?: string}
 */
function ucf_degrees_degree_finder_settings() {
	/**
	 * Filters the Degree Finder's settings.
	 *
	 * @param array $settings `searchUrl`, and optionally `apiRoot` (a WordPress REST API root
	 *                        serving the UCF Degree Search plugin's endpoints).
	 */
	return apply_filters(
		'ucf_degrees_degree_finder_settings',
		array(
			// SYNC: DEFAULTS.searchUrl in components/interactive/degree-finder/defaults.ts.
			'searchUrl' => 'https://www.ucf.edu/degree-search/',
		)
	);
}

/**
 * Site-wide settings for the Degree List.
 *
 * @return array{apiRoot: string, cacheHours: float, timeout: int}
 */
function ucf_degrees_degree_list_settings() {
	$defaults = array(
		// SYNC: DEFAULT_API_ROOT in components/live/degree-list/client.ts.
		'apiRoot'    => 'https://search.cm.ucf.edu/api/v1/',
		'cacheHours' => 1,
		'timeout'    => 5,
	);

	/**
	 * Filters the Degree List's settings.
	 *
	 * @param array $settings `apiRoot` (the UCF Search Service's API), `cacheHours` (how long a
	 *                        list's programs are kept before they are fetched again) and
	 *                        `timeout` (seconds to wait for each page).
	 */
	$settings = apply_filters( 'ucf_degrees_degree_list_settings', $defaults );

	// WHY over the defaults: render.php, client.php and the editor read every key directly, so
	// a filter that leaves one out, or returns something other than an array, still gets the
	// default for what it didn't set.
	return array_merge( $defaults, is_array( $settings ) ? $settings : array() );
}

/**
 * The Degree List's settings its editor preview needs: only where the service is.
 *
 * @return array{apiRoot: string}
 */
function ucf_degrees_degree_list_editor_settings() {
	return array( 'apiRoot' => ucf_degrees_degree_list_settings()['apiRoot'] );
}

/**
 * Give each block's editor preview the same settings its front end gets.
 *
 * WHY: priority 20 runs after shared.php has registered the blocks on the default priority,
 * so their editor script handles exist.
 * SYNC: each window name is declared in that component's integrations/wp/settings.ts.
 *
 * @return void
 */
function ucf_degrees_editor_settings() {
	$blocks = array(
		'ucf-degrees/degree-finder' => array( 'ucfDegreeFinderSettings', 'ucf_degrees_degree_finder_settings' ),
		'ucf-degrees/degree-list'   => array( 'ucfDegreeListSettings', 'ucf_degrees_degree_list_editor_settings' ),
	);

	foreach ( $blocks as $name => list( $global, $settings ) ) {
		$block = WP_Block_Type_Registry::get_instance()->get_registered( $name );
		if ( ! $block ) {
			continue;
		}

		foreach ( $block->editor_script_handles as $handle ) {
			wp_add_inline_script(
				$handle,
				'window.' . $global . ' = ' . wp_json_encode( call_user_func( $settings ) ) . ';',
				'before'
			);
		}
	}
}
add_action( 'init', 'ucf_degrees_editor_settings', 20 );
