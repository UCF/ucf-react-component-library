<?php
/**
 * What every UCF component plugin needs: block registration, the token stylesheet, and the
 * UCF inserter category.
 *
 * CONTEXT: the build copies this file into each plugin as build/shared.php, so every plugin
 * ships complete on its own. A site with two of them active loads it twice, and the guard
 * below makes the second load a no-op.
 *
 * WHY functions take the plugin's paths instead of reading __DIR__: one copy serves every
 * plugin that is active, so it cannot assume whose build folder it sits in.
 *
 * SYNC: two plugins built from different versions of this repo share whichever copy loads
 * first. Keep changes here backward compatible, or release every plugin together.
 *
 * @package ucf-components
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( function_exists( 'ucf_components_register_plugin' ) ) {
	return;
}

/**
 * Register every block in a plugin's build folder and load what they share.
 *
 * WHY discovered rather than listed: plugin.json already decides what is in the build, so the
 * PHP registers whatever the build holds.
 *
 * @param string $build_dir Absolute path to the plugin's build/ folder.
 * @param string $build_url URL of the same folder.
 * @return void
 */
function ucf_components_register_plugin( $build_dir, $build_url ) {
	add_action(
		'init',
		static function () use ( $build_dir ) {
			foreach ( (array) glob( $build_dir . '/*/block.json' ) as $manifest ) {
				register_block_type( dirname( $manifest ) );
			}
		}
	);

	add_action(
		'enqueue_block_assets',
		static function () use ( $build_dir, $build_url ) {
			// The library's one stylesheet for WordPress: tokens pointing at the theme's
			// presets, and the component layer (`.ucf-c`, `.ucf-c-panel`), which reads the
			// theme's roles and never sets them.
			// WHY one handle for every plugin: wp_enqueue_style() ignores a second
			// enqueue of the same handle, so it loads once however many plugins are active.
			// UPSTREAM: enqueue_block_assets reaches the editor canvas iframe as well as
			// the front end; wp_enqueue_scripts never reaches the iframe.
			wp_enqueue_style(
				'ucf-components-base',
				$build_url . '/base.css',
				array(),
				(string) filemtime( $build_dir . '/base.css' )
			);
		}
	);

	if ( ! has_filter( 'block_categories_all', 'ucf_components_block_category' ) ) {
		add_filter( 'block_categories_all', 'ucf_components_block_category' );
	}
}

/**
 * Add the UCF inserter category unless something already has.
 *
 * SYNC: the block theme registers the same `ucf` slug (includes/blocks.php there); whichever
 * runs first wins and the other leaves it alone.
 *
 * @param array<int, array<string, mixed>> $categories Registered categories.
 * @return array<int, array<string, mixed>> Categories, with UCF first.
 */
function ucf_components_block_category( $categories ) {
	if ( in_array( 'ucf', array_column( $categories, 'slug' ), true ) ) {
		return $categories;
	}

	array_unshift(
		$categories,
		array(
			'slug'  => 'ucf',
			'title' => __( 'UCF', 'ucf-components' ),
			'icon'  => null,
		)
	);

	return $categories;
}
