<?php
/**
 * The Event List's events, fetched and cached in WordPress.
 *
 * SYNC: client.ts and utils/text.ts do the same in JavaScript, step for step: the same date
 * format, the same plain text, the same past-event rule, offset and limit.
 * tests/EventList.php.test.tsx runs both on the same feed and fails when their markup differs.
 * SPEC: the UCF Events plugin's UCF_Events_Feed::get_events(): one cached copy of each feed
 * (3 hours by default), a 5 second timeout.
 *
 * @package ucf-events
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'ucf_events_event_list_feed' ) ) {
	/**
	 * A feed's JSON, parsed: from the cache, or fetched and cached.
	 *
	 * FIX: the old plugin cached a failed request for the full 3 hours, so one slow response
	 * emptied the list for the afternoon. A failure is cached for 5 minutes instead.
	 * WHY wp_safe_remote_get(): the feed URL is an editor's setting, so the request refuses
	 * private addresses (the plugin allows the default feed's host; see ucf-events.php).
	 *
	 * @param string               $feed_url A calendar's JSON feed.
	 * @param array<string, mixed> $settings `cacheHours` and `timeout`, from
	 *                                       ucf_events_event_list_settings().
	 * @return array<int, mixed> The feed's events, or an empty array.
	 */
	function ucf_events_event_list_feed( $feed_url, $settings ) {
		$key    = 'ucf_events_event_list_' . md5( $feed_url );
		$cached = get_transient( $key );
		if ( is_array( $cached ) ) {
			return $cached;
		}

		$response = wp_safe_remote_get(
			$feed_url,
			array(
				'timeout' => (int) $settings['timeout'],
				'headers' => array( 'Accept' => 'application/json' ),
			)
		);
		$feed     = is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response )
			? null
			: json_decode( wp_remote_retrieve_body( $response ), true );

		if ( ! is_array( $feed ) ) {
			set_transient( $key, array(), 5 * MINUTE_IN_SECONDS );
			return array();
		}

		set_transient( $key, $feed, (int) round( max( 0.1, (float) $settings['cacheHours'] ) * HOUR_IN_SECONDS ) );
		return $feed;
	}
}

if ( ! function_exists( 'ucf_events_event_list_iso_date' ) ) {
	/**
	 * A feed date as ISO 8601, in the same zone: `2026-11-06T11:00:00-05:00`.
	 *
	 * SYNC: isoDate() in client.ts. WHY a pattern, not DateTime: DateTime accepts more than
	 * isoDate() does, and the two must agree on what counts as a date.
	 *
	 * @param mixed $value The feed's date: `Fri, 06 Nov 2026 11:00:00 -0500`.
	 * @return string The date, or '' when it isn't one.
	 */
	function ucf_events_event_list_iso_date( $value ) {
		$months = array( 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' );
		if ( ! is_string( $value ) || ! preg_match( '/^[A-Za-z]{3}, (\d{2}) ([A-Za-z]{3}) (\d{4}) (\d{2}):(\d{2}):(\d{2}) ([+-])(\d{2})(\d{2})$/', $value, $m ) ) {
			return '';
		}
		$month = array_search( $m[2], $months, true );
		if ( false === $month ) {
			return '';
		}
		return sprintf( '%s-%02d-%sT%s:%s:%s%s%s:%s', $m[3], $month + 1, $m[1], $m[4], $m[5], $m[6], $m[7], $m[8], $m[9] );
	}
}

if ( ! function_exists( 'ucf_events_event_list_utf8' ) ) {
	/**
	 * One Unicode code point as UTF-8.
	 *
	 * FIX: not mb_chr(). mbstring is an optional extension this plugin doesn't require, and
	 * without it a numeric entity in the feed was a fatal error while the page rendered.
	 * The caller checks the point is a valid scalar value (1 to 0x10FFFF, not a surrogate).
	 *
	 * @param int $point The code point.
	 * @return string Its UTF-8 bytes.
	 */
	function ucf_events_event_list_utf8( $point ) {
		if ( $point < 0x80 ) {
			return chr( $point );
		}
		if ( $point < 0x800 ) {
			return chr( 0xC0 | ( $point >> 6 ) ) . chr( 0x80 | ( $point & 0x3F ) );
		}
		if ( $point < 0x10000 ) {
			return chr( 0xE0 | ( $point >> 12 ) ) . chr( 0x80 | ( ( $point >> 6 ) & 0x3F ) ) . chr( 0x80 | ( $point & 0x3F ) );
		}
		return chr( 0xF0 | ( $point >> 18 ) ) . chr( 0x80 | ( ( $point >> 12 ) & 0x3F ) ) . chr( 0x80 | ( ( $point >> 6 ) & 0x3F ) ) . chr( 0x80 | ( $point & 0x3F ) );
	}
}

if ( ! function_exists( 'ucf_events_event_list_plain_text' ) ) {
	/**
	 * One line of plain text: tags removed, entities decoded, runs of space made one.
	 *
	 * SYNC: plainText() and decodeEntities() in utils/text.ts, entity for entity.
	 *
	 * @param mixed $html The feed's text, which may hold HTML.
	 * @return string Plain text.
	 */
	function ucf_events_event_list_plain_text( $html ) {
		$named = array(
			'amp'    => '&',
			'lt'     => '<',
			'gt'     => '>',
			'quot'   => '"',
			'apos'   => "'",
			'nbsp'   => ' ',
			'ndash'  => "\u{2013}",
			'mdash'  => "\u{2014}",
			'hellip' => "\u{2026}",
			'lsquo'  => "\u{2018}",
			'rsquo'  => "\u{2019}",
			'ldquo'  => "\u{201C}",
			'rdquo'  => "\u{201D}",
		);

		$text = preg_replace( '/<[^>]*>/', ' ', (string) $html );
		$text = preg_replace_callback(
			'/&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z]+);/',
			static function ( $m ) use ( $named ) {
				$code = $m[1];
				if ( '#' === $code[0] ) {
					$point = ( 'x' === $code[1] || 'X' === $code[1] ) ? hexdec( substr( $code, 2 ) ) : (int) substr( $code, 1 );
					$valid = $point > 0 && $point <= 0x10FFFF && ( $point < 0xD800 || $point > 0xDFFF );
					return $valid ? ucf_events_event_list_utf8( (int) $point ) : $m[0];
				}
				return $named[ $code ] ?? $m[0];
			},
			$text
		);

		return trim( preg_replace( '/[\t\n\x0B\f\r \x{00A0}]+/u', ' ', $text ), ' ' );
	}
}

if ( ! function_exists( 'ucf_events_event_list_summary' ) ) {
	/**
	 * The first 40 words of a description, with an ellipsis when there were more.
	 *
	 * SYNC: summarize() and SUMMARY_WORDS in utils/text.ts.
	 *
	 * @param mixed $html The description, as the feed's HTML.
	 * @return string Plain text.
	 */
	function ucf_events_event_list_summary( $html ) {
		$words = array_values( array_filter( explode( ' ', ucf_events_event_list_plain_text( $html ) ), 'strlen' ) );
		return count( $words ) > 40
			? implode( ' ', array_slice( $words, 0, 40 ) ) . "\u{2026}"
			: implode( ' ', $words );
	}
}

if ( ! function_exists( 'ucf_events_event_list_events' ) ) {
	/**
	 * The feed's events as the list shows them: each cleaned up, those already over dropped,
	 * then the offset and the limit applied.
	 *
	 * SYNC: normalizeEvents() in client.ts.
	 *
	 * @param mixed $feed   The feed's JSON, parsed to arrays.
	 * @param int   $limit  How many to show.
	 * @param int   $offset How many upcoming events to skip first.
	 * @param int   $now    What counts as now, as a Unix timestamp.
	 * @return array<int, array<string, string>> Events: id, title, url, starts, ends, location,
	 *                                          summary.
	 */
	function ucf_events_event_list_events( $feed, $limit, $offset, $now ) {
		if ( ! is_array( $feed ) || ! array_is_list( $feed ) ) {
			return array();
		}

		$events = array();
		foreach ( $feed as $event ) {
			if ( ! is_array( $event ) ) {
				continue;
			}
			$starts = ucf_events_event_list_iso_date( $event['starts'] ?? null );
			$title  = ucf_events_event_list_plain_text( $event['title'] ?? '' );
			if ( '' === $starts || '' === $title ) {
				continue;
			}
			$ends = ucf_events_event_list_iso_date( $event['ends'] ?? null );
			if ( strtotime( '' !== $ends ? $ends : $starts ) < $now ) {
				continue;
			}
			$events[] = array(
				'id'       => (string) ( $event['id'] ?? '' ),
				'title'    => $title,
				'url'      => (string) ( $event['url'] ?? '' ),
				'starts'   => $starts,
				'ends'     => $ends,
				'location' => ucf_events_event_list_plain_text( $event['location'] ?? '' ),
				'summary'  => ucf_events_event_list_summary( $event['description'] ?? '' ),
			);
		}

		return array_slice( $events, max( 0, (int) $offset ), max( 0, (int) $limit ) );
	}
}
