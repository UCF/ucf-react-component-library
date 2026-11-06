<?php
/**
 * What every UCF component plugin needs: block registration, the token stylesheet, and the
 * UCF inserter category.
 *
 * CONTEXT: the build copies this file into each plugin as build/shared.php, so every plugin
 * ships complete on its own. A site with two of them active loads it twice; each function is
 * declared only if no copy has declared it yet, so the second load declares nothing.
 *
 * FIX: each function sits inside its own `function_exists()` check. An early `return` when the
 * function existed did not work: PHP declares a file's top-level functions as it compiles the
 * file, before any line runs, so activating a second plugin was a fatal error ("Cannot
 * redeclare ucf_components_register_plugin()"). scripts/shared-php.test.mjs loads two copies.
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

if ( ! function_exists( 'ucf_components_register_plugin' ) ) {
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

				// Our blocks' text fields, made to look like the text they edit. Editor only.
				// WHY is_admin(): this hook also runs on the front end, which has no fields.
				if ( is_admin() ) {
					wp_enqueue_style(
						'ucf-components-editor',
						$build_url . '/editor.css',
						array(),
						(string) filemtime( $build_dir . '/editor.css' )
					);
				}
			}
		);

		if ( ! has_filter( 'block_categories_all', 'ucf_components_block_category' ) ) {
			add_filter( 'block_categories_all', 'ucf_components_block_category' );
		}
	}
}

if ( ! function_exists( 'ucf_components_block_category' ) ) {
	/**
	 * Add the UCF inserter categories, one per kind of block, as Storybook groups them: UCF
	 * Content (content components) and UCF Interactive (interactive ones). Each is added unless
	 * something already has, and both go first.
	 *
	 * SYNC: the kinds in docs/architecture.md, "Two kinds of component", and Storybook's groups
	 * (.storybook/preview.ts). blocks.test.tsx checks each block is in its kind's category.
	 * WHY not the theme's `ucf` category: the theme fills it with its patterns; our blocks are
	 * easier to find grouped by kind on their own.
	 *
	 * @param array<int, array<string, mixed>> $categories Registered categories.
	 * @return array<int, array<string, mixed>> Categories, with UCF's first.
	 */
	function ucf_components_block_category( $categories ) {
		$slugs = array_column( $categories, 'slug' );
		$ours  = array();
		foreach (
			array(
				'ucf-content'     => __( 'UCF Content', 'ucf-components' ),
				'ucf-interactive' => __( 'UCF Interactive', 'ucf-components' ),
			) as $slug => $title
		) {
			if ( ! in_array( $slug, $slugs, true ) ) {
				$ours[] = array(
					'slug'  => $slug,
					'title' => $title,
					'icon'  => null,
				);
			}
		}

		return array_merge( $ours, $categories );
	}
}
