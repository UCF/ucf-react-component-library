<?php
/**
 * The Event List on the page.
 *
 * CONTEXT: a live block. On each request this fetches the feed (cached; client.php) and writes
 * the whole list, so the events are in the page with no JavaScript. Nothing is saved in the post
 * but the block's attributes.
 *
 * SYNC: EventList.tsx, element for element and class for class. tests/EventList.php.test.tsx
 * runs this file and fails when its HTML differs from React's. Whitespace between tags doesn't
 * count: each sits between block, flex or grid items, where browsers don't show it.
 *
 * @package ucf-events
 *
 * @var array $attributes Block attributes.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/client.php';
require_once __DIR__ . '/helpers.php';

$ucf_events_settings = ucf_events_event_list_settings();
$ucf_events_feed_url = ! empty( $attributes['feedUrl'] ) ? $attributes['feedUrl'] : $ucf_events_settings['feedUrl'];

$ucf_events_events = ucf_events_event_list_events(
	ucf_events_event_list_feed( $ucf_events_feed_url, $ucf_events_settings ),
	(int) ( $attributes['limit'] ?? 3 ),
	(int) ( $attributes['offset'] ?? 0 ),
	time()
);

// A11Y: every list has a heading; an empty or blank one shows the default.
// SYNC: headingOf() and PROPS.title.default in EventList.tsx and EventList.props.ts.
$ucf_events_title = trim( (string) ( $attributes['title'] ?? '' ), " \t\n\r" );
$ucf_events_title = '' === $ucf_events_title ? 'Upcoming events' : $ucf_events_title;

$ucf_events_show_dates   = 'hide' !== ( $attributes['dates'] ?? 'show' );
$ucf_events_show_summary = 'show' === ( $attributes['descriptions'] ?? 'hide' );
$ucf_events_empty        = (string) ( $attributes['emptyMessage'] ?? '' );

// SYNC: data-columns and data-dates in EventList.tsx, written only when not the default.
$ucf_events_wrapper = array( 'class' => 'ucf-c ucf-c-event-list' );
if ( '2' === ( $attributes['columns'] ?? '1' ) ) {
	$ucf_events_wrapper['data-columns'] = '2';
}
if ( ! $ucf_events_show_dates ) {
	$ucf_events_wrapper['data-dates'] = 'hide';
}
?>
<div <?php echo get_block_wrapper_attributes( $ucf_events_wrapper ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- WordPress escapes each attribute. ?>>
	<h2 class="ucf-c-event-list__heading ucf-c ucf-c-heading"><?php echo esc_html( $ucf_events_title ); ?></h2>
	<?php if ( $ucf_events_events ) : ?>
		<ul class="ucf-c-event-list__items">
			<?php foreach ( $ucf_events_events as $ucf_events_event ) : ?>
				<li class="ucf-c-event-list__item">
					<?php if ( $ucf_events_show_dates ) : ?>
						<?php $ucf_events_date = ucf_events_event_list_date_block( $ucf_events_event['starts'] ); ?>
						<?php // A11Y: the date block is for the eye; the full date is in the <time> beside it. ?>
						<div class="ucf-c-event-list__date" aria-hidden="true">
							<span class="ucf-c-event-list__month"><?php echo esc_html( $ucf_events_date['month'] ); ?></span>
							<span class="ucf-c-event-list__day"><?php echo esc_html( $ucf_events_date['day'] ); ?></span>
						</div>
					<?php endif; ?>
					<div class="ucf-c-event-list__body">
						<h3 class="ucf-c-event-list__title ucf-c ucf-c-heading"><a href="<?php echo esc_url( $ucf_events_event['url'] ); ?>"><?php echo esc_html( $ucf_events_event['title'] ); ?></a></h3>
						<p class="ucf-c-event-list__meta">
							<time datetime="<?php echo esc_attr( $ucf_events_event['starts'] ); ?>"><?php echo esc_html( ucf_events_event_list_when( $ucf_events_event['starts'] ) ); ?></time>
							<?php if ( '' !== $ucf_events_event['location'] ) : ?>
								<span><?php echo esc_html( $ucf_events_event['location'] ); ?></span>
							<?php endif; ?>
						</p>
						<?php if ( $ucf_events_show_summary && '' !== $ucf_events_event['summary'] ) : ?>
							<p class="ucf-c-event-list__description"><?php echo esc_html( $ucf_events_event['summary'] ); ?></p>
						<?php endif; ?>
					</div>
				</li>
			<?php endforeach; ?>
		</ul>
	<?php elseif ( '' !== $ucf_events_empty ) : ?>
		<p class="ucf-c-event-list__empty"><?php echo esc_html( $ucf_events_empty ); ?></p>
	<?php endif; ?>
</div>
