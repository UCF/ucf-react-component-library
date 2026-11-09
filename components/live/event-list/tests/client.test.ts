import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

import {
	DEFAULT_FEED_URL,
	createClient,
	isoDate,
	normalizeEvents,
} from '../client.ts';

const feed: unknown = JSON.parse(
	readFileSync( new URL( './fixtures/feed.json', import.meta.url ), 'utf8' )
);
const MORNING = new Date( '2026-11-06T00:00:00-05:00' );

describe( 'isoDate', () => {
	it( 'keeps the feed’s own time zone', () => {
		expect( isoDate( 'Fri, 06 Nov 2026 11:00:00 -0500' ) ).toBe(
			'2026-11-06T11:00:00-05:00'
		);
		expect( isoDate( 'Sun, 01 Mar 2026 23:30:00 +0130' ) ).toBe(
			'2026-03-01T23:30:00+01:30'
		);
	} );

	it( 'gives nothing for anything else', () => {
		expect( isoDate( '2026-11-06 11:00' ) ).toBe( '' );
		expect( isoDate( 'Fri, 06 Foo 2026 11:00:00 -0500' ) ).toBe( '' );
		expect( isoDate( null ) ).toBe( '' );
	} );
} );

describe( 'normalizeEvents', () => {
	it( 'reads the real feed', () => {
		const [ first ] = normalizeEvents( feed, { limit: 1, now: MORNING } );
		expect( first ).toEqual( {
			id: '4223708',
			title: 'PAWS-a-tively Stress Free',
			url: 'https://events.ucf.edu/event/4223708/paws-a-tively-stress-free/',
			starts: '2026-11-06T11:00:00-05:00',
			ends: '2026-11-06T13:00:00-05:00',
			location: 'Counseling and Psychological Services',
			summary:
				'Need a stress break as we head into the last few weeks of the semester? Stop by CAPS and meet our therapy dog friends. The dogs will be at CAPS from 11:00 am to 1:00 pm and ready for snuggles.',
		} );
	} );

	it( 'applies the offset, then the limit', () => {
		const ids = ( offset: number, limit: number ) =>
			normalizeEvents( feed, { limit, offset, now: MORNING } ).map(
				( event ) => event.id
			);
		expect( ids( 0, 6 ) ).toHaveLength( 6 );
		expect( ids( 2, 2 ) ).toEqual( ids( 0, 6 ).slice( 2, 4 ) );
	} );

	it( 'drops events that are already over, by their end', () => {
		// The first event ends at 1 p.m.; the second, a masterclass, is still on at 1:30.
		const titles = normalizeEvents( feed, {
			limit: 12,
			now: new Date( '2026-11-06T13:30:00-05:00' ),
		} ).map( ( event ) => event.title );
		expect( titles ).not.toContain( 'PAWS-a-tively Stress Free' );
		expect( titles ).toContain( "UCF Men's Basketball vs. Yale" );
	} );

	it( 'cuts a long description to 40 words, entities decoded', () => {
		const { summary } = normalizeEvents( feed, {
			limit: 12,
			now: MORNING,
		} ).find( ( event ) => event.title === 'Virtual Career Drop-In' )!;
		expect( summary.split( ' ' ) ).toHaveLength( 40 );
		expect( summary ).toMatch( /Aug\. 31–Nov\. 20/ );
		expect( summary.endsWith( '…' ) ).toBe( true );
	} );

	it( 'skips what it can’t list, and anything that isn’t a list', () => {
		expect(
			normalizeEvents(
				[
					null,
					{ title: 'No date' },
					{ title: '', starts: 'Fri, 06 Nov 2026 11:00:00 -0500' },
				],
				{ limit: 3, now: MORNING }
			)
		).toEqual( [] );
		expect( normalizeEvents( { error: 'nope' }, { limit: 3 } ) ).toEqual(
			[]
		);
	} );
} );

describe( 'createClient', () => {
	it( 'fetches the default feed when given none', async () => {
		const fetch = vi.fn( async () => Response.json( feed ) );
		const events = await createClient( { fetch } ).getEvents( {
			limit: 2,
			now: MORNING,
		} );
		expect( fetch ).toHaveBeenCalledWith(
			DEFAULT_FEED_URL,
			expect.objectContaining( {
				headers: { Accept: 'application/json' },
			} )
		);
		expect( events ).toHaveLength( 2 );
	} );

	it( 'fails loudly on an error response, naming the feed', async () => {
		const fetch = vi.fn(
			async () => new Response( 'Not found', { status: 404 } )
		);
		await expect(
			createClient( {
				feedUrl: 'https://events.ucf.edu/calendar/9/feed.json',
				fetch,
			} ).getEvents( { limit: 3 } )
		).rejects.toThrow( /404: https:\/\/events\.ucf\.edu\/calendar\/9/ );
	} );
} );
