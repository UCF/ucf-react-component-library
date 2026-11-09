<?php
/**
 * Plugin Name: UCF Event Blocks
 * Description: UCF event blocks, built from the @ucf/components React library.
 * Version: 0.1.0
 * Requires at least: 6.6
 * Requires PHP: 8.1
 * Author: UCF Web Communications
 * License: GPL-3.0-or-later
 * Text Domain: ucf-events
 *
 * WHY every function is `ucf_events_event_list_*`: the UCF Events Plugin (the `[ucf-events]`
 * shortcode) uses `ucf_events_*` and declares each function only if the name is free, so a
 * shared name would silently replace one plugin's function with the other's. Both can be active.
 *
 * @package ucf-events
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/build/shared.php';

ucf_components_register_plugin( __DIR__ . '/build', plugins_url( 'build', __FILE__ ) );

/**
 * Site-wide settings for the Event List.
 *
 * WHY the old plugin's option: a site that set a default feed under Settings > UCF Events
 * keeps it when it moves to the block.
 *
 * @return array{feedUrl: string, cacheHours: float, timeout: int}
 */
function ucf_events_event_list_settings() {
	$old_feed = get_option( 'ucf_events_feed_url' );

	/**
	 * Filters the Event List's settings.
	 *
	 * @param array $settings `feedUrl` (the feed a block with no Feed URL shows), `cacheHours`
	 *                        (how long a feed is kept before it is fetched again) and
	 *                        `timeout` (seconds to wait for the feed).
	 */
	return apply_filters(
		'ucf_events_event_list_settings',
		array(
			// SYNC: DEFAULT_FEED_URL in components/live/event-list/client.ts.
			'feedUrl'    => is_string( $old_feed ) && '' !== $old_feed ? $old_feed : 'https://events.ucf.edu/upcoming/feed.json',
			// SPEC: the UCF Events plugin's defaults.
			'cacheHours' => 3,
			'timeout'    => 5,
		)
	);
}

/**
 * Let the default feed's host through wp_safe_remote_get().
 *
 * WHY: on UCF's network, events.ucf.edu can resolve to a private address, which
 * wp_safe_remote_get() refuses. SPEC: the UCF Events plugin's ucf_events_whitelist_host().
 *
 * @param bool   $external Whether WordPress treats the host as external.
 * @param string $host     The host requested.
 * @return bool Whether to allow it.
 */
function ucf_events_event_list_allow_host( $external, $host ) {
	$default = wp_parse_url( ucf_events_event_list_settings()['feedUrl'], PHP_URL_HOST );
	return $default === $host ? true : $external;
}
add_filter( 'http_request_host_is_external', 'ucf_events_event_list_allow_host', 10, 2 );

/**
 * Give the editor's preview the site's default feed.
 *
 * WHY: priority 20 runs after shared.php has registered the blocks on the default priority,
 * so their editor script handles exist.
 * SYNC: the window name is declared in components/live/event-list/integrations/wp/settings.ts.
 *
 * @return void
 */
function ucf_events_event_list_editor_settings() {
	$block = WP_Block_Type_Registry::get_instance()->get_registered( 'ucf-events/event-list' );
	if ( ! $block ) {
		return;
	}

	$settings = array( 'feedUrl' => ucf_events_event_list_settings()['feedUrl'] );
	foreach ( $block->editor_script_handles as $handle ) {
		wp_add_inline_script( $handle, 'window.ucfEventListSettings = ' . wp_json_encode( $settings ) . ';', 'before' );
	}
}
add_action( 'init', 'ucf_events_event_list_editor_settings', 20 );
