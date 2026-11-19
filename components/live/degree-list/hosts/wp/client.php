<?php
/**
 * The Degree List's programs, fetched from the UCF Search Service and cached in WordPress.
 *
 * SYNC: client.ts does the same in JavaScript, step for step: the same query, the same paging,
 * the same clean-up and order. tests/DegreeList.php.test.tsx runs both on the same responses and
 * fails when their programs or markup differ.
 * UPSTREAM: `/programs/search/` applies filters (`/programs/` ignores them), and ignores a
 * parameter name it doesn't know, returning every program. Queries are built only from the names
 * in ucf_degrees_degree_list_query().
 *
 * @package ucf-degrees
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'ucf_degrees_degree_list_filter' ) ) {
	/**
	 * One filter's query parameters, or null when it had values and none can be sent.
	 *
	 * SYNC: filterOf() in client.ts. WHY null, not no filter: a list asked for one college must
	 * never show every program. WHY the pattern: a slug goes into the query as it is.
	 *
	 * @param string $name   The parameter.
	 * @param mixed  $values The values asked for.
	 * @return string|null `&name=value` for each, or null.
	 */
	function ucf_degrees_degree_list_filter( $name, $values ) {
		$values = is_array( $values ) ? array_values( $values ) : array();
		$sent   = array_values(
			array_filter(
				$values,
				static function ( $value ) {
					return is_string( $value ) && 1 === preg_match( '/^[a-z0-9-]+$/', $value );
				}
			)
		);
		if ( $values && ! $sent ) {
			return null;
		}
		$query = '';
		foreach ( $sent as $value ) {
			$query .= '&' . $name . '=' . $value;
		}
		return $query;
	}
}

if ( ! function_exists( 'ucf_degrees_degree_list_query' ) ) {
	/**
	 * The query for one page of programs, or null when the filters can match nothing.
	 *
	 * SYNC: programsQuery() in client.ts, parameter for parameter: active programs, no tracks,
	 * three fields, then the filters, then the page.
	 *
	 * @param array<string, mixed> $filters `colleges`, `departments`, `programTypes`.
	 * @param int                  $offset  How many programs to skip.
	 * @return string|null The query string, without `?`, or null.
	 */
	function ucf_degrees_degree_list_query( $filters, $offset ) {
		// SYNC: PROGRAM_TYPES in client.ts: each type's `level` ID in the Search Service.
		$levels = array(
			'bachelors'    => '1',
			'masters'      => '2',
			'certificate'  => '3',
			'doctoral'     => '4',
			'specialist'   => '5',
			'professional' => '6',
			'minor'        => '7',
		);
		$types  = is_array( $filters['programTypes'] ?? null ) ? $filters['programTypes'] : array();
		$asked  = array();
		foreach ( $types as $type ) {
			// WHY '' for a type that isn't one: the filter drops it, as it does a bad slug.
			$asked[] = is_string( $type ) && isset( $levels[ $type ] ) ? $levels[ $type ] : '';
		}

		$parts = array(
			ucf_degrees_degree_list_filter( 'college_slug', $filters['colleges'] ?? array() ),
			ucf_degrees_degree_list_filter( 'department_slug', $filters['departments'] ?? array() ),
			ucf_degrees_degree_list_filter( 'level', $asked ),
		);
		if ( in_array( null, $parts, true ) ) {
			return null;
		}
		return 'active=True&subplan_code__isnull=True&fields=id,name,primary_profile_url' . implode( '', $parts ) . '&limit=50&offset=' . (int) $offset;
	}
}

if ( ! function_exists( 'ucf_degrees_degree_list_page' ) ) {
	/**
	 * One page of programs, or null when the request failed.
	 *
	 * WHY wp_remote_get(), not wp_safe_remote_get(): the API root is a site setting, not an
	 * editor's, so there is no need to refuse an address on UCF's own network.
	 *
	 * @param string               $url      The page's URL.
	 * @param array<string, mixed> $settings `timeout`, from ucf_degrees_degree_list_settings().
	 * @return array<string, mixed>|null The page: `count` and `results`.
	 */
	function ucf_degrees_degree_list_page( $url, $settings ) {
		$response = wp_remote_get(
			$url,
			array(
				'timeout' => (int) $settings['timeout'],
				'headers' => array( 'Accept' => 'application/json' ),
			)
		);
		if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
			return null;
		}
		$page = json_decode( wp_remote_retrieve_body( $response ), true );
		return is_array( $page ) && is_array( $page['results'] ?? null ) ? $page : null;
	}
}

if ( ! function_exists( 'ucf_degrees_degree_list_fetch' ) ) {
	/**
	 * Every page's program records for a list's filters: from the cache, or fetched and cached.
	 *
	 * SYNC: getPrograms() in client.ts: the first page gives the count, then the rest, at most
	 * 40 pages (MAX_PAGES).
	 * FIX: the Event List caches a failure as an empty list for 5 minutes. Here a failure keeps
	 * showing the last list that loaded (kept in an option, which never expires), so a Search
	 * Service outage doesn't empty a college's degree page. It is retried after 5 minutes.
	 *
	 * @param array<string, mixed> $filters  `colleges`, `departments`, `programTypes`.
	 * @param array<string, mixed> $settings `apiRoot`, `cacheHours` and `timeout`, from
	 *                                       ucf_degrees_degree_list_settings().
	 * @return array<int, mixed> The records, in page order.
	 */
	function ucf_degrees_degree_list_fetch( $filters, $settings ) {
		$first = ucf_degrees_degree_list_query( $filters, 0 );
		if ( null === $first ) {
			return array();
		}

		$root   = rtrim( (string) $settings['apiRoot'], '/' ) . '/programs/search/?';
		$key    = 'ucf_degrees_degree_list_' . md5( $root . $first );
		$cached = get_transient( $key );
		if ( is_array( $cached ) ) {
			return $cached;
		}

		$page    = ucf_degrees_degree_list_page( $root . $first, $settings );
		$records = null;
		if ( null !== $page ) {
			$records = $page['results'];
			$count   = min( max( 0, (int) ( $page['count'] ?? 0 ) ), 40 * 50 );
			for ( $offset = 50; $offset < $count && null !== $records; $offset += 50 ) {
				$next    = ucf_degrees_degree_list_page( $root . ucf_degrees_degree_list_query( $filters, $offset ), $settings );
				$records = null === $next ? null : array_merge( $records, $next['results'] );
			}
		}

		if ( null === $records ) {
			$last = get_option( $key );
			$last = is_array( $last ) ? $last : array();
			set_transient( $key, $last, 5 * MINUTE_IN_SECONDS );
			return $last;
		}

		set_transient( $key, $records, (int) round( max( 0.1, (float) $settings['cacheHours'] ) * HOUR_IN_SECONDS ) );
		update_option( $key, $records, false );
		return $records;
	}
}

if ( ! function_exists( 'ucf_degrees_degree_list_compare' ) ) {
	/**
	 * Two programs in the list's order: by name, ignoring case, then by name as written, then
	 * by URL.
	 *
	 * SYNC: compareProgramsByName() in client.ts. WHY strtr(), not strtolower(): before PHP 8.2
	 * strtolower() follows the server's locale; this lowers A to Z only, as client.ts does.
	 *
	 * @param array<string, string> $a A program.
	 * @param array<string, string> $b Another.
	 * @return int Less than, equal to or more than 0.
	 */
	function ucf_degrees_degree_list_compare( $a, $b ) {
		$upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		$lower = 'abcdefghijklmnopqrstuvwxyz';
		$order = strcmp( strtr( $a['name'], $upper, $lower ), strtr( $b['name'], $upper, $lower ) );
		$order = 0 !== $order ? $order : strcmp( $a['name'], $b['name'] );
		return 0 !== $order ? $order : strcmp( $a['url'], $b['url'] );
	}
}

if ( ! function_exists( 'ucf_degrees_degree_list_programs' ) ) {
	/**
	 * The service's program records as the list shows them: each with a name and an http(s)
	 * profile URL, trimmed, each profile once, sorted by name.
	 *
	 * SYNC: normalizePrograms() in client.ts. WHY each profile once: a program offered on campus
	 * and online is two records, and most share one profile page.
	 *
	 * @param mixed $records The records of every page, in order.
	 * @return array<int, array<string, string>> Programs: id, name, url.
	 */
	function ucf_degrees_degree_list_programs( $records ) {
		if ( ! is_array( $records ) || ! array_is_list( $records ) ) {
			return array();
		}
		$seen     = array();
		$programs = array();
		foreach ( $records as $record ) {
			if ( ! is_array( $record ) ) {
				continue;
			}
			// SYNC: trimmed() in client.ts trims the same four characters.
			$name = is_string( $record['name'] ?? null ) ? trim( $record['name'], " \t\n\r" ) : '';
			$url  = is_string( $record['primary_profile_url'] ?? null ) ? $record['primary_profile_url'] : '';
			if ( '' === $name || 1 !== preg_match( '/^https?:\/\//i', $url ) || isset( $seen[ $url ] ) ) {
				continue;
			}
			$seen[ $url ] = true;
			$programs[]   = array(
				'id'   => (string) ( $record['id'] ?? '' ),
				'name' => $name,
				'url'  => $url,
			);
		}
		usort( $programs, 'ucf_degrees_degree_list_compare' );
		return $programs;
	}
}
