<?php
/**
 * The Event List's markup, in PHP.
 *
 * SYNC: EventList.tsx and utils/dates.ts, element for element and class for class.
 * tests/EventList.php.test.tsx renders both from the same feed and fails when they differ.
 * WHY no whitespace between tags: React writes none, and the two are compared.
 *
 * @package ucf-events
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'ucf_events_event_list_ap_time' ) ) {
	/**
	 * AP style time: `11 a.m.`, `5:30 p.m.`, `noon`, `midnight`.
	 *
	 * SYNC: apTime() in utils/dates.ts.
	 *
	 * @param int $hour   0 to 23.
	 * @param int $minute 0 to 59.
	 * @return string The time.
	 */
	function ucf_events_event_list_ap_time( $hour, $minute ) {
		if ( 0 === $minute && 12 === $hour ) {
			return 'noon';
		}
		if ( 0 === $minute && 0 === $hour ) {
			return 'midnight';
		}
		$clock = $hour % 12;
		$clock = $clock ? $clock : 12;
		return $clock . ( $minute ? sprintf( ':%02d', $minute ) : '' ) . ( $hour < 12 ? ' a.m.' : ' p.m.' );
	}
}

if ( ! function_exists( 'ucf_events_event_list_date_parts' ) ) {
	/**
	 * The wall-clock parts of an ISO 8601 date and time, read from the string.
	 *
	 * SYNC: partsOf() in utils/dates.ts. WHY not DateTime: it would shift the time into the
	 * server's zone.
	 *
	 * @param string $iso As an event's `starts`.
	 * @return array<string, int>|null year, month, day, hour, minute.
	 */
	function ucf_events_event_list_date_parts( $iso ) {
		if ( ! preg_match( '/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/', $iso, $m ) ) {
			return null;
		}
		return array(
			'year'   => (int) $m[1],
			'month'  => (int) $m[2],
			'day'    => (int) $m[3],
			'hour'   => (int) $m[4],
			'minute' => (int) $m[5],
		);
	}
}

if ( ! function_exists( 'ucf_events_event_list_markup' ) ) {
	/**
	 * The list.
	 *
	 * @param array<int, array<string, string>> $events  From ucf_events_event_list_events().
	 * @param array<string, string>             $props   title, columns, size, descriptions,
	 *                                                   emptyMessage.
	 * @param string                            $wrapper The root's attributes, escaped:
	 *                                                   get_block_wrapper_attributes().
	 * @return string Markup.
	 */
	function ucf_events_event_list_markup( $events, $props, $wrapper ) {
		// SPEC: AP style abbreviates these months and spells out the rest. SYNC: utils/dates.ts.
		$ap_months    = array( 'Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.' );
		$short_months = array( 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' );

		$title         = (string) ( $props['title'] ?? '' );
		$show_summary  = 'show' === ( $props['descriptions'] ?? 'hide' );
		$empty_message = (string) ( $props['emptyMessage'] ?? '' );
		// SYNC: data-columns and data-size in EventList.tsx, written only when not the default.
		$columns = '2' === ( $props['columns'] ?? '1' ) ? ' data-columns="2"' : '';
		$size    = 'large' === ( $props['size'] ?? 'standard' ) ? ' data-size="large"' : '';

		$html = '<div ' . $wrapper . $columns . $size . '>';
		if ( '' !== $title ) {
			$html .= '<h2 class="ucf-c-event-list__heading ucf-c ucf-c-heading">' . esc_html( $title ) . '</h2>';
		}

		if ( $events ) {
			$html .= '<ul class="ucf-c-event-list__items">';
			foreach ( $events as $event ) {
				$parts = ucf_events_event_list_date_parts( $event['starts'] );
				$month = $parts ? $short_months[ $parts['month'] - 1 ] : '';
				$day   = $parts ? (string) $parts['day'] : '';
				$when  = $parts
					? $ap_months[ $parts['month'] - 1 ] . ' ' . $parts['day'] . ', ' . $parts['year'] . ', ' . ucf_events_event_list_ap_time( $parts['hour'], $parts['minute'] )
					: '';

				$html .= '<li class="ucf-c-event-list__item">';
				// A11Y: the date block is for the eye; the full date is in the <time> beside it.
				$html .= '<div class="ucf-c-event-list__date" aria-hidden="true">'
					. '<span class="ucf-c-event-list__month">' . esc_html( $month ) . '</span>'
					. '<span class="ucf-c-event-list__day">' . esc_html( $day ) . '</span>'
					. '</div>';
				$html .= '<div class="ucf-c-event-list__body">';
				$html .= '<h3 class="ucf-c-event-list__title ucf-c ucf-c-heading"><a href="' . esc_url( $event['url'] ) . '">' . esc_html( $event['title'] ) . '</a></h3>';
				$html .= '<p class="ucf-c-event-list__meta">'
					. '<time datetime="' . esc_attr( $event['starts'] ) . '">' . esc_html( $when ) . '</time>'
					. ( '' !== $event['location'] ? '<span>' . esc_html( $event['location'] ) . '</span>' : '' )
					. '</p>';
				if ( $show_summary && '' !== $event['summary'] ) {
					$html .= '<p class="ucf-c-event-list__description">' . esc_html( $event['summary'] ) . '</p>';
				}
				$html .= '</div></li>';
			}
			$html .= '</ul>';
		} elseif ( '' !== $empty_message ) {
			$html .= '<p class="ucf-c-event-list__empty">' . esc_html( $empty_message ) . '</p>';
		}

		return $html . '</div>';
	}
}
