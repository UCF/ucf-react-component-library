<?php
/**
 * Front-end markup for the Event List block.
 *
 * CONTEXT: a live block. On each request this fetches the feed (cached; client.php) and writes
 * the whole list (markup.php), so the events are in the page with no JavaScript. Nothing is
 * saved in the post but the block's attributes.
 *
 * @package ucf-events
 *
 * @var array $attributes Block attributes.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/client.php';
require_once __DIR__ . '/markup.php';

$ucf_events_settings = ucf_events_event_list_settings();
$ucf_events_feed_url = ! empty( $attributes['feedUrl'] ) ? $attributes['feedUrl'] : $ucf_events_settings['feedUrl'];

$ucf_events_events = ucf_events_event_list_events(
	ucf_events_event_list_feed( $ucf_events_feed_url, $ucf_events_settings ),
	(int) ( $attributes['limit'] ?? 3 ),
	(int) ( $attributes['offset'] ?? 0 ),
	time()
);

// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- markup.php escapes every value it writes, and get_block_wrapper_attributes() escapes each attribute itself.
echo ucf_events_event_list_markup(
	$ucf_events_events,
	$attributes,
	get_block_wrapper_attributes( array( 'class' => 'ucf-c ucf-c-event-list' ) )
);
