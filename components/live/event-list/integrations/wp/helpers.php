<?php
/**
 * The Event List's helpers for its markup: the date and time as render.php writes them.
 *
 * SYNC: utils/dates.ts, function for function. tests/EventList.php.test.tsx renders both from the
 * same feed and fails when they differ.
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

if ( ! function_exists( 'ucf_events_event_list_date_block' ) ) {
	/**
	 * The date block's month and day: `Nov` and `6`.
	 *
	 * SYNC: dateBlock() in utils/dates.ts.
	 *
	 * @param string $iso As an event's `starts`.
	 * @return array{month: string, day: string} Empty strings when the date can't be read.
	 */
	function ucf_events_event_list_date_block( $iso ) {
		$short_months = array( 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' );
		$parts        = ucf_events_event_list_date_parts( $iso );
		return array(
			'month' => $parts ? $short_months[ $parts['month'] - 1 ] : '',
			'day'   => $parts ? (string) $parts['day'] : '',
		);
	}
}

if ( ! function_exists( 'ucf_events_event_list_when' ) ) {
	/**
	 * When an event starts, in AP style: `Nov. 6, 2026, 11 a.m.`
	 *
	 * SYNC: whenText() in utils/dates.ts.
	 *
	 * @param string $iso As an event's `starts`.
	 * @return string The date and time, or '' when the date can't be read.
	 */
	function ucf_events_event_list_when( $iso ) {
		// SPEC: AP style abbreviates these months and spells out the rest.
		$ap_months = array( 'Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.' );
		$parts     = ucf_events_event_list_date_parts( $iso );
		return $parts
			? $ap_months[ $parts['month'] - 1 ] . ' ' . $parts['day'] . ', ' . $parts['year'] . ', ' . ucf_events_event_list_ap_time( $parts['hour'], $parts['minute'] )
			: '';
	}
}
