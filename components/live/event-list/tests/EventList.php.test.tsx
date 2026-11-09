// @vitest-environment happy-dom
/**
 * The live markup contract: WordPress's PHP and React write the same list from the same feed.
 *
 * A live block's markup exists twice: EventList.tsx (every React host) and
 * integrations/wp/render.php (WordPress, which can't run React on the server), each fed by its own
 * copy of the feed rules (client.ts and client.php). This runs the real PHP under plain `php`,
 * with WordPress's few functions stubbed (integrations/tests/live.ts), and for each case
 * compares the cleaned-up events with JavaScript's, and render.php's HTML with React's, as a
 * browser reads them.
 *
 * WHY no snapshot here: tests/EventList.test.tsx keeps React's; this only says PHP matches it.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';

import {
	hasPhp,
	php,
	phpString,
	sameHtml,
	tempFile,
} from '#integrations/tests/live.js';
import EventList from '../EventList.tsx';
import type { EventListEditableProps } from '../EventList.props.ts';
import { normalizeEvents } from '../client.ts';
import { plainText } from '../utils/text.ts';

const here = path.dirname( fileURLToPath( import.meta.url ) );
const wp = path.join( here, '../integrations/wp' );
const fixture = JSON.parse(
	readFileSync( path.join( here, 'fixtures/feed.json' ), 'utf8' )
) as Record< string, unknown >[];

type Props = Pick<
	EventListEditableProps,
	'title' | 'columns' | 'dates' | 'descriptions' | 'emptyMessage'
>;

const DISPLAY: Props = {
	title: '',
	columns: '1',
	dates: 'show',
	descriptions: 'hide',
	emptyMessage: 'There are no upcoming events.',
};

/**
 * What React renders for a feed.
 *
 * @param feed    The feed's JSON.
 * @param options Limit, offset, now, and the display props.
 */
function react(
	feed: unknown,
	options: { limit: number; offset: number; now: Date } & Props
) {
	const { limit, offset, now, ...display } = options;
	return renderToStaticMarkup(
		<EventList
			events={ normalizeEvents( feed, { limit, offset, now } ) }
			{ ...display }
		/>
	);
}

// Edge cases the real feed hasn't shown yet: entities and tags in a title, a missing end, a date
// in another format, noon and midnight, a long description with non-breaking spaces.
const EDGES = [
	{
		id: 'e1',
		title: 'Q&amp;A &#8211; &ldquo;Night&rdquo; <b>Live</b>',
		url: 'https://events.ucf.edu/event/1/?a=1&b=2',
		starts: 'Sat, 07 Nov 2026 12:00:00 -0500',
		ends: null,
		location: 'Student Union &amp; <i>Garden</i>',
		description: `<p>${ 'Word&nbsp;and more '.repeat( 30 ) }</p>`,
	},
	{
		id: 'e2',
		title: 'Midnight run',
		url: 'https://events.ucf.edu/event/2/',
		starts: 'Sun, 08 Nov 2026 00:00:00 -0500',
		ends: 'Sun, 08 Nov 2026 01:00:00 -0500',
		location: '',
		description: '',
	},
	{ id: 'e3', title: 'Wrong date format', starts: '2026-11-08 10:00' },
	{ id: 'e4', title: '', starts: 'Sun, 08 Nov 2026 10:00:00 -0500' },
	'not an event',
];

const MORNING = new Date( '2026-11-06T00:00:00-05:00' );
const AFTERNOON = new Date( '2026-11-06T13:30:00-05:00' );

const cases: Record<
	string,
	{ feed: unknown; limit: number; offset: number; now: Date } & Props
> = {
	'the defaults': {
		feed: fixture,
		limit: 3,
		offset: 0,
		now: MORNING,
		...DISPLAY,
	},
	'every event, with a heading and descriptions': {
		feed: fixture,
		limit: 12,
		offset: 0,
		now: MORNING,
		...DISPLAY,
		title: 'Upcoming “events” & more',
		columns: '2',
		descriptions: 'show',
	},
	'a blank heading, which falls back to the default': {
		feed: fixture,
		limit: 1,
		offset: 0,
		now: MORNING,
		...DISPLAY,
		title: '  ',
	},
	'no date blocks': {
		feed: fixture,
		limit: 3,
		offset: 0,
		now: MORNING,
		...DISPLAY,
		dates: 'hide',
	},
	'an offset': {
		feed: fixture,
		limit: 2,
		offset: 2,
		now: MORNING,
		...DISPLAY,
	},
	'events already over dropped': {
		feed: fixture,
		limit: 12,
		offset: 0,
		now: AFTERNOON,
		...DISPLAY,
	},
	'odd events': {
		feed: EDGES,
		limit: 12,
		offset: 0,
		now: MORNING,
		...DISPLAY,
		descriptions: 'show',
	},
	'no events, with the message': {
		feed: [],
		limit: 3,
		offset: 0,
		now: MORNING,
		...DISPLAY,
	},
	'no events and no message, with a heading': {
		feed: [],
		limit: 3,
		offset: 0,
		now: MORNING,
		...DISPLAY,
		title: 'Events',
		emptyMessage: '',
	},
	'a feed that is not a list': {
		feed: { error: 'Not found' },
		limit: 3,
		offset: 0,
		now: MORNING,
		...DISPLAY,
	},
};

describe.runIf( hasPhp )( 'the Event List in PHP', () => {
	/**
	 * Run render.php as WordPress would, with the fetch stubbed.
	 *
	 * @param attributes The block's attributes.
	 * @param response   What wp_safe_remote_get() returns, as PHP.
	 */
	const run = ( attributes: object, response: string ) =>
		JSON.parse(
			php( `
function ucf_events_event_list_settings() {
	return array( 'feedUrl' => 'https://events.ucf.edu/upcoming/feed.json', 'cacheHours' => 3, 'timeout' => 5 );
}
function wp_safe_remote_get( $url, $args ) {
	$GLOBALS['ucf_test']['requests'][] = array( $url, $args['timeout'] );
	return ${ response };
}
$attributes = json_decode( ${ phpString( JSON.stringify( attributes ) ) }, true );
ob_start();
require ${ phpString( path.join( wp, 'render.php' ) ) };
echo json_encode( array( 'html' => ob_get_clean() ) + $GLOBALS['ucf_test'] );
` )
		) as {
			html: string;
			requests: [ string, number ][];
			cached: [ string, number, number ][];
		};

	/**
	 * A feed as a 200 response, its dates moved to 2099.
	 * WHY 2099: render.php reads the real clock, so the events stay upcoming whenever this runs.
	 * Which events "now" drops is checked with a fixed clock, in the test above the markup's.
	 *
	 * @param feed The feed's JSON.
	 */
	const future = ( feed: unknown ) =>
		JSON.stringify( feed ).replace( / 2026 /g, ' 2099 ' );
	const ok = ( body: string ) =>
		`array( 'body' => file_get_contents( ${ phpString(
			tempFile( body )
		) } ), 'response' => array( 'code' => 200 ) )`;

	test.each( Object.entries( cases ) )(
		'cleans up the feed as JavaScript does: %s',
		( _, { feed, limit, offset, now } ) => {
			const feedFile = tempFile( JSON.stringify( feed ) );
			const events = JSON.parse(
				php( `
require ${ phpString( path.join( wp, 'client.php' ) ) };
$feed = json_decode( file_get_contents( ${ phpString( feedFile ) } ), true );
echo json_encode( ucf_events_event_list_events( $feed, ${ limit }, ${ offset }, ${ Math.floor(
					now.getTime() / 1000
				) } ) );
` )
			);
			expect( events ).toEqual(
				JSON.parse(
					JSON.stringify(
						normalizeEvents( feed, { limit, offset, now } )
					)
				)
			);
		}
	);

	test.each( Object.entries( cases ) )(
		'writes the markup React does: %s',
		( _, { feed, limit, offset, ...display } ) => {
			const body = future( feed );
			const { html } = run(
				{
					limit: String( limit ),
					offset: String( offset ),
					...display,
				},
				ok( body )
			);
			const expected = react( JSON.parse( body ), {
				limit,
				offset,
				...display,
				now: new Date(),
			} );

			// FIX: guards against two empty outputs matching.
			expect( expected ).toContain( 'ucf-c-event-list' );
			expect( sameHtml( html ) ).toBe( sameHtml( expected ) );
		}
	);

	// FIX: mbstring is optional in PHP, and the plugin doesn't require it. Every numeric entity
	// length (1 to 4 bytes of UTF-8), and the invalid ones left as written, without it.
	test( 'decodes numeric entities without mbstring, as JavaScript does', () => {
		const mbstring = JSON.parse(
			php(
				`echo json_encode( extension_loaded( 'mbstring' ) ? get_extension_funcs( 'mbstring' ) : array() );`
			)
		) as string[];
		const text =
			'&#65;&#xE9;&#8211;&#x1F393; &#0;&#xD800;&#x110000;&#99999999999999999999; &#X10FFFF;';
		const decoded = php(
			`
require ${ phpString( path.join( wp, 'client.php' ) ) };
echo ucf_events_event_list_plain_text( ${ phpString( text ) } );
`,
			{ disable: mbstring }
		);

		expect( decoded ).toBe( plainText( text ) );
		expect( decoded ).toContain( 'Aé–🎓' );
	} );

	// The glue: render.php reads the attributes and settings, fetches once and caches.
	describe( 'render.php', () => {
		test( 'writes the list from the site’s default feed, and caches it for the setting’s hours', () => {
			const result = run(
				{ limit: '2', offset: '1', descriptions: 'show' },
				ok( future( fixture ) )
			);

			expect( result.requests ).toEqual( [
				[ 'https://events.ucf.edu/upcoming/feed.json', 5 ],
			] );
			expect( result.cached ).toEqual( [
				[
					`ucf_events_event_list_${ md5(
						'https://events.ucf.edu/upcoming/feed.json'
					) }`,
					fixture.length,
					3 * 3600,
				],
			] );
			expect( sameHtml( result.html ) ).toBe(
				sameHtml(
					react( JSON.parse( future( fixture ) ), {
						limit: 2,
						offset: 1,
						now: new Date(),
						...DISPLAY,
						descriptions: 'show',
					} )
				)
			);
		} );

		test( 'uses the block’s own feed when it has one', () => {
			const result = run(
				{ feedUrl: 'https://events.ucf.edu/calendar/1/feed.json' },
				`array( 'body' => '[]', 'response' => array( 'code' => 200 ) )`
			);
			expect( result.requests[ 0 ]?.[ 0 ] ).toBe(
				'https://events.ucf.edu/calendar/1/feed.json'
			);
		} );

		test( 'shows the message, and caches the failure for 5 minutes only, when the feed fails', () => {
			const result = run(
				{ emptyMessage: 'Nothing on the calendar.' },
				'new WP_Error()'
			);
			expect(
				result.cached.map( ( [ , count, seconds ] ) => [
					count,
					seconds,
				] )
			).toEqual( [ [ 0, 300 ] ] );
			expect( result.html ).toContain( 'Nothing on the calendar.' );
		} );
	} );
} );

/**
 * An md5 hash, as PHP's md5() writes it: the cache key.
 *
 * @param text Text.
 */
function md5( text: string ): string {
	return createHash( 'md5' ).update( text ).digest( 'hex' );
}
