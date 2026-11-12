// @vitest-environment happy-dom
/**
 * The live markup contract: WordPress's PHP and React write the same list from the same Search
 * Service responses.
 *
 * A live block's markup exists twice: DegreeList.tsx (every React host) and
 * integrations/wp/render.php (WordPress, which can't run React on the server), each fed by its
 * own copy of the service rules (client.ts and client.php). This runs the real PHP under plain
 * `php`, with WordPress's few functions stubbed (integrations/tests/live.ts), and compares the
 * queries, the cleaned-up programs and the HTML with JavaScript's.
 *
 * WHY no snapshot here: tests/DegreeList.test.tsx keeps React's; this only says PHP matches it.
 */
import { createHash } from 'node:crypto';
import {
	copyFileSync,
	rmSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterAll, describe, expect, test } from 'vitest';

import {
	hasPhp,
	php,
	phpString,
	sameHtml,
	tempFile,
} from '@/integrations/tests/live';
import DegreeList from '../DegreeList.tsx';
import type { DegreeListEditableProps } from '../DegreeList.props.ts';
import { normalizePrograms, programsQuery } from '../client.ts';
import type { ProgramFilters } from '../types.ts';

const here = path.dirname( fileURLToPath( import.meta.url ) );
const wp = path.join( here, '../integrations/wp' );
const PAGES = [ 0, 50, 100 ].map(
	( offset ) =>
		JSON.parse(
			readFileSync(
				path.join( here, `fixtures/sciences-${ offset }.json` ),
				'utf8'
			)
		) as { count: number; results: unknown[] }
);
const RECORDS = PAGES.flatMap( ( page ) => page.results );

// Records the real pages haven't shown yet, or have in other colleges: a raw `&`, a lowercase
// first letter, a leading space, a shared profile page, a capital and a lowercase name that sort
// together, and records the list can't link.
const ODD = [
	{
		id: 1,
		name: 'Theoretical & Applied Ethics',
		primary_profile_url: 'https://www.ucf.edu/degree/ethics/?a=1&b=2',
	},
	{
		id: 2,
		name: 'e-Learning Design',
		primary_profile_url: 'https://www.ucf.edu/degree/e-learning/',
	},
	{
		id: 3,
		name: ' Systems Verification ',
		primary_profile_url: 'https://www.ucf.edu/degree/systems/',
	},
	{
		id: 4,
		name: 'Criminal Justice (BS)',
		primary_profile_url: 'https://www.ucf.edu/degree/cj-bs/',
	},
	{
		id: 5,
		name: 'Criminal Justice (BS)',
		primary_profile_url: 'https://www.ucf.edu/degree/cj-bs/',
	},
	{ id: 6, name: 'art', primary_profile_url: 'https://www.ucf.edu/b/' },
	{ id: 7, name: 'Art', primary_profile_url: 'https://www.ucf.edu/a/' },
	{ id: 8, name: 'No page', primary_profile_url: '' },
	{ id: 9, name: 'Script', primary_profile_url: 'javascript:alert(1)' },
	{ id: 10, name: 42, primary_profile_url: 'https://www.ucf.edu/n/' },
	'not a record',
];

type Display = Pick<
	DegreeListEditableProps,
	'title' | 'columns' | 'emptyMessage'
>;

const DISPLAY: Display = {
	title: '',
	columns: '1',
	emptyMessage: 'No programs found.',
};

const lists: Record< string, { records: unknown } & Display > = {
	'the College of Sciences, all three pages': {
		records: RECORDS,
		...DISPLAY,
	},
	'odd records, with a heading, in two columns': {
		records: ODD,
		...DISPLAY,
		title: 'Programs “we” offer & more',
		columns: '2',
	},
	'three columns': {
		records: RECORDS.slice( 0, 6 ),
		...DISPLAY,
		columns: '3',
	},
	'a blank heading, which is left out': {
		records: RECORDS.slice( 0, 2 ),
		...DISPLAY,
		title: ' \t ',
	},
	'no programs, with the message': { records: [], ...DISPLAY },
	'no programs and no message, with a heading': {
		records: [],
		...DISPLAY,
		title: 'Programs',
		emptyMessage: '',
	},
	'records that are not a list': {
		records: { error: 'Not found' },
		...DISPLAY,
	},
};

const filters: Record< string, ProgramFilters > = {
	none: {},
	'every kind, several values': {
		colleges: [ 'sciences', 'miller-college-of-business' ],
		departments: [ 'accounting-dixon-schl-of' ],
		programTypes: [ 'bachelors', 'doctoral' ],
	},
	'values that are dropped': {
		colleges: [ 'sciences', 'Not A Slug' ],
		programTypes: [ 'minor', 'associates' ],
	},
	'a college that can’t be sent': { colleges: [ 'Not a slug' ] },
	'a program type that isn’t one': { programTypes: [ 'associates' ] },
	'a value that isn’t text': {
		departments: [ 7 as unknown as string ],
	},
};

describe.runIf( hasPhp )( 'the Degree List in PHP', () => {
	test.each( Object.entries( filters ) )(
		'builds the query JavaScript does: %s',
		( _, given ) => {
			const query = JSON.parse(
				php( `
require ${ phpString( path.join( wp, 'client.php' ) ) };
$filters = json_decode( ${ phpString( JSON.stringify( given ) ) }, true );
echo json_encode( array( ucf_degrees_degree_list_query( $filters, 0 ), ucf_degrees_degree_list_query( $filters, 100 ) ) );
` )
			);
			expect( query ).toEqual( [
				programsQuery( given, 0 ),
				programsQuery( given, 100 ),
			] );
		}
	);

	test.each( Object.entries( lists ) )(
		'cleans up the records as JavaScript does: %s',
		( _, { records } ) => {
			const programs = JSON.parse(
				php( `
require ${ phpString( path.join( wp, 'client.php' ) ) };
echo json_encode( ucf_degrees_degree_list_programs( json_decode( file_get_contents( ${ phpString(
					tempFile( JSON.stringify( records ) )
				) } ), true ) ) );
` )
			);
			expect( programs ).toEqual( normalizePrograms( records ) );
		}
	);

	/**
	 * Run render.php as WordPress would, with the Search Service stubbed: each request is
	 * answered by `answer`, PHP that sets `$response`, given `$url`.
	 *
	 * @param attributes The block's attributes.
	 * @param answer     PHP that sets `$response` for `$url`.
	 * @param setup      PHP to run first, as a saved last-good list.
	 */
	const run = ( attributes: object, answer: string, setup = '' ) =>
		JSON.parse(
			php( `
function ucf_degrees_degree_list_settings() {
	return array( 'apiRoot' => 'https://search.cm.ucf.edu/api/v1/', 'cacheHours' => 1, 'timeout' => 5 );
}
$GLOBALS['ucf_test']['options'] = array();
function get_option( $key ) { return $GLOBALS['ucf_test']['options'][ $key ] ?? false; }
function update_option( $key, $value, $autoload ) { $GLOBALS['ucf_test']['options'][ $key ] = $value; $GLOBALS['ucf_test']['saved'][] = array( $key, count( $value ), $autoload ); return true; }
function wp_remote_get( $url, $args ) {
	$GLOBALS['ucf_test']['requests'][] = array( $url, $args['timeout'] );
	${ answer }
	return $response;
}
${ setup }
$attributes = json_decode( ${ phpString( JSON.stringify( attributes ) ) }, true );
ob_start();
require ${ phpString( path.join( wp, 'render.php' ) ) };
echo json_encode( array( 'html' => ob_get_clean() ) + $GLOBALS['ucf_test'] );
` )
		) as {
			html: string;
			requests: [ string, number ][];
			cached: [ string, number, number ][];
			saved?: [ string, number, boolean ][];
		};

	/**
	 * PHP answering with the Sciences page at each offset, or another response.
	 *
	 * @param status The status for every page.
	 */
	const sciences = ( status = 200 ) => {
		const files = PAGES.map( ( page ) =>
			phpString( tempFile( JSON.stringify( page ) ) )
		);
		return `
preg_match( '/offset=(\\d+)/', $url, $m );
$files = array( ${ files.join( ', ' ) } );
$response = array( 'body' => file_get_contents( $files[ (int) $m[1] / 50 ] ), 'response' => array( 'code' => ${ status } ) );
`;
	};

	/**
	 * PHP answering every request with the same records, one page.
	 *
	 * @param records The page's results.
	 */
	const onePage = ( records: unknown ) =>
		`$response = array( 'body' => file_get_contents( ${ phpString(
			tempFile(
				JSON.stringify( {
					count: Array.isArray( records ) ? records.length : 0,
					results: records,
				} )
			)
		) } ), 'response' => array( 'code' => 200 ) );`;

	test.each( Object.entries( lists ) )(
		'writes the markup React does: %s',
		( _, { records, ...display } ) => {
			const { html } = run( display, onePage( records ) );
			const expected = renderToStaticMarkup(
				<DegreeList
					programs={ normalizePrograms(
						Array.isArray( records ) ? records : []
					) }
					{ ...display }
				/>
			);

			// FIX: guards against two empty outputs matching.
			expect( expected ).toContain( 'ucf-c-degree-list' );
			expect( sameHtml( html ) ).toBe( sameHtml( expected ) );
		}
	);

	// The glue: render.php reads the attributes and settings, reads every page once and caches.
	describe( 'render.php', () => {
		const KEY_QUERY = programsQuery( { colleges: [ 'sciences' ] }, 0 );
		const KEY = `ucf_degrees_degree_list_${ md5(
			`https://search.cm.ucf.edu/api/v1/programs/search/?${ KEY_QUERY }`
		) }`;

		test( 'reads every page, caches the list for the setting’s hours, and keeps it as the last good list', () => {
			const result = run( { colleges: [ 'sciences' ] }, sciences() );

			expect( result.requests ).toEqual(
				[ 0, 50, 100 ].map( ( offset ) => [
					`https://search.cm.ucf.edu/api/v1/programs/search/?${ programsQuery(
						{ colleges: [ 'sciences' ] },
						offset
					) }`,
					5,
				] )
			);
			expect( result.cached ).toEqual( [
				[ KEY, RECORDS.length, 3600 ],
			] );
			expect( result.saved ).toEqual( [
				[ KEY, RECORDS.length, false ],
			] );
			expect( sameHtml( result.html ) ).toBe(
				sameHtml(
					renderToStaticMarkup(
						<DegreeList
							programs={ normalizePrograms( RECORDS ) }
							emptyMessage="No programs found."
						/>
					)
				)
			);
		} );

		test( 'shows the last good list when the service fails, and tries again in 5 minutes', () => {
			const last = RECORDS.slice( 0, 3 );
			const result = run(
				{ colleges: [ 'sciences' ], emptyMessage: 'Nothing here.' },
				'$response = new WP_Error();',
				`$GLOBALS['ucf_test']['options'][ ${ phpString(
					KEY
				) } ] = json_decode( ${ phpString(
					JSON.stringify( last )
				) }, true );`
			);

			expect( result.cached ).toEqual( [ [ KEY, 3, 300 ] ] );
			expect( result.saved ).toBeUndefined();
			expect( sameHtml( result.html ) ).toBe(
				sameHtml(
					renderToStaticMarkup(
						<DegreeList
							programs={ normalizePrograms( last ) }
							emptyMessage="Nothing here."
						/>
					)
				)
			);
		} );

		test( 'counts a failed later page as a failure, not a shorter list', () => {
			const result = run(
				{ colleges: [ 'sciences' ], emptyMessage: 'Nothing here.' },
				`${ sciences() } if ( str_contains( $url, 'offset=100' ) ) { $response['response']['code'] = 500; }`
			);
			expect( result.cached ).toEqual( [ [ KEY, 0, 300 ] ] );
			expect( result.html ).toContain( 'Nothing here.' );
		} );

		test( 'asks the service nothing when the filters can match nothing', () => {
			const result = run(
				{ colleges: [ 'Not a slug' ], emptyMessage: 'Nothing here.' },
				sciences()
			);
			expect( result.requests ).toEqual( [] );
			expect( result.html ).toContain( 'Nothing here.' );
		} );
	} );
} );

describe.runIf( hasPhp )( 'the Degree List’s settings in PHP', () => {
	// The plugin's main file, beside a stand-in for its build folder (generated, so absent in a
	// fresh checkout).
	const plugin = mkdtempSync( path.join( os.tmpdir(), 'ucf-degrees-' ) );
	mkdirSync( path.join( plugin, 'build' ) );
	writeFileSync(
		path.join( plugin, 'build/shared.php' ),
		'<?php function ucf_components_register_plugin( $dir, $url ) {}'
	);
	copyFileSync(
		path.join( here, '../../../../plugins/ucf-degrees/ucf-degrees.php' ),
		path.join( plugin, 'ucf-degrees.php' )
	);
	afterAll( () => rmSync( plugin, { recursive: true, force: true } ) );

	/**
	 * The settings, and the editor's, with the site's filter returning `filtered`.
	 * WHY display_errors: a PHP warning then breaks the JSON, so the test fails on one.
	 *
	 * @param filtered What the `ucf_degrees_degree_list_settings` filter returns.
	 */
	const settingsWith = ( filtered: unknown ) =>
		JSON.parse(
			php( `
error_reporting( E_ALL );
ini_set( 'display_errors', '1' );
function plugins_url( $path, $file ) { return ''; }
function add_action( ...$args ) {}
function add_filter( ...$args ) {}
function apply_filters( $name, $value ) { return json_decode( ${ phpString(
				JSON.stringify( filtered )
			) }, true ); }
require ${ phpString( path.join( plugin, 'ucf-degrees.php' ) ) };
echo json_encode( array( ucf_degrees_degree_list_settings(), ucf_degrees_degree_list_editor_settings() ) );
` )
		);

	const DEFAULTS = {
		apiRoot: 'https://search.cm.ucf.edu/api/v1/',
		cacheHours: 1,
		timeout: 5,
	};

	test( 'keeps what a filter sets', () => {
		expect(
			settingsWith( {
				apiRoot: 'https://search.test/api/',
				cacheHours: 3,
				timeout: 10,
			} )
		).toEqual( [
			{ apiRoot: 'https://search.test/api/', cacheHours: 3, timeout: 10 },
			{ apiRoot: 'https://search.test/api/' },
		] );
	} );

	test( 'fills in what a filter leaves out', () => {
		expect( settingsWith( { timeout: 10 } ) ).toEqual( [
			{ ...DEFAULTS, timeout: 10 },
			{ apiRoot: DEFAULTS.apiRoot },
		] );
	} );

	test.each( [ 'not settings', null, 7 ] )(
		'uses the defaults when a filter returns something other than an array: %s',
		( filtered ) => {
			expect( settingsWith( filtered ) ).toEqual( [
				DEFAULTS,
				{ apiRoot: DEFAULTS.apiRoot },
			] );
		}
	);
} );

/**
 * An md5 hash, as PHP's md5() writes it: the cache key.
 *
 * @param text Text.
 */
function md5( text: string ): string {
	return createHash( 'md5' ).update( text ).digest( 'hex' );
}
