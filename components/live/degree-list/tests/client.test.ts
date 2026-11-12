/**
 * The Degree List's data client: what it asks the Search Service for, and what it keeps.
 * The fixtures are real `/programs/search/` pages: the College of Sciences, three pages of them.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

import {
	createClient,
	normalizePrograms,
	programsQuery,
	DEFAULT_API_ROOT,
} from '../client.ts';

const here = path.dirname( fileURLToPath( import.meta.url ) );
const PAGES = [ 0, 50, 100 ].map(
	( offset ) =>
		JSON.parse(
			readFileSync(
				path.join( here, `fixtures/sciences-${ offset }.json` ),
				'utf8'
			)
		) as { count: number; results: Record< string, unknown >[] }
);

const BASE =
	'active=True&subplan_code__isnull=True&fields=id,name,primary_profile_url';

describe( 'programsQuery', () => {
	it( 'asks for active programs, no tracks and three fields, with no filters', () => {
		expect( programsQuery( {}, 0 ) ).toBe( `${ BASE }&limit=50&offset=0` );
	} );

	it( 'repeats a filter for each value, and maps program types to levels', () => {
		expect(
			programsQuery(
				{
					colleges: [ 'sciences', 'miller-college-of-business' ],
					departments: [ 'accounting-dixon-schl-of' ],
					programTypes: [ 'bachelors', 'minor' ],
				},
				100
			)
		).toBe(
			`${ BASE }&college_slug=sciences&college_slug=miller-college-of-business&department_slug=accounting-dixon-schl-of&level=1&level=7&limit=50&offset=100`
		);
	} );

	it( 'drops a value that isn’t a slug or a program type, keeping the rest', () => {
		expect(
			programsQuery(
				{
					colleges: [ 'sciences', 'Bad Slug&level=1' ],
					programTypes: [ 'masters', 'associates' ],
				},
				0
			)
		).toBe( `${ BASE }&college_slug=sciences&level=2&limit=50&offset=0` );
	} );

	// FIX guard: a filter whose every value is dropped must match nothing, not everything.
	it( 'matches nothing when a filter has values and none can be sent', () => {
		expect( programsQuery( { colleges: [ 'Not a slug' ] }, 0 ) ).toBeNull();
		expect(
			programsQuery( { programTypes: [ 'associates' ] }, 0 )
		).toBeNull();
		expect(
			programsQuery( { departments: [ 5 as unknown as string ] }, 0 )
		).toBeNull();
	} );
} );

describe( 'normalizePrograms', () => {
	it( 'keeps the real pages’ programs, each profile once, sorted by name', () => {
		const programs = normalizePrograms(
			PAGES.flatMap( ( page ) => page.results )
		);
		const urls = programs.map( ( program ) => program.url );

		expect( programs.length ).toBeGreaterThan( 100 );
		expect( new Set( urls ).size ).toBe( urls.length );
		expect( programs[ 0 ] ).toEqual( {
			id: expect.any( String ),
			name: expect.any( String ),
			url: expect.stringMatching( /^https:\/\/www\.ucf\.edu\// ),
		} );
		const names = programs.map( ( program ) => program.name.toLowerCase() );
		expect( names ).toEqual( [ ...names ].sort() );
	} );

	it( 'trims names, ignores case when sorting, and drops what it can’t link', () => {
		expect(
			normalizePrograms( [
				{
					id: 3,
					name: 'Zoology (BS)',
					primary_profile_url: 'https://www.ucf.edu/z/',
				},
				{
					id: 1,
					name: ' e-Learning Design ',
					primary_profile_url: 'https://www.ucf.edu/e/',
				},
				{
					id: 2,
					name: 'Economics (BS)',
					primary_profile_url: 'https://www.ucf.edu/econ/',
				},
				{
					id: 4,
					name: 'Economics (BS) Online',
					primary_profile_url: 'https://www.ucf.edu/econ/',
				},
				{
					id: 5,
					name: '',
					primary_profile_url: 'https://www.ucf.edu/blank/',
				},
				{
					id: 6,
					name: 'Script',
					primary_profile_url: 'javascript:alert(1)',
				},
				{ id: 7, name: 'No URL' },
				null,
				'not a record',
			] )
		).toEqual( [
			{
				id: '1',
				name: 'e-Learning Design',
				url: 'https://www.ucf.edu/e/',
			},
			{
				id: '2',
				name: 'Economics (BS)',
				url: 'https://www.ucf.edu/econ/',
			},
			{ id: '3', name: 'Zoology (BS)', url: 'https://www.ucf.edu/z/' },
		] );
		expect( normalizePrograms( { results: [] } ) ).toEqual( [] );
	} );
} );

/**
 * A fetch that answers each Sciences page by its offset.
 *
 * @param status The status to answer with.
 */
function fakeFetch( status = 200 ) {
	return vi.fn( async ( url: string | URL | Request ) => {
		const offset = Number( /offset=(\d+)/.exec( String( url ) )?.[ 1 ] );
		const page = PAGES[ offset / 50 ] ?? { count: 123, results: [] };
		return new Response( JSON.stringify( page ), { status } );
	} );
}

describe( 'createClient', () => {
	it( 'reads every page the count says there are, from the live service', async () => {
		const fetch = fakeFetch();
		const programs = await createClient( { fetch } ).getPrograms( {
			colleges: [ 'sciences' ],
		} );

		expect( fetch.mock.calls.map( ( [ url ] ) => String( url ) ) ).toEqual(
			[ 0, 50, 100 ].map(
				( offset ) =>
					`${ DEFAULT_API_ROOT }programs/search/?${ BASE }&college_slug=sciences&limit=50&offset=${ offset }`
			)
		);
		expect( programs ).toEqual(
			normalizePrograms( PAGES.flatMap( ( page ) => page.results ) )
		);
	} );

	it( 'uses the API root it is given', async () => {
		const fetch = fakeFetch();
		await createClient( {
			apiRoot: 'https://search.test/api',
			fetch,
		} ).getPrograms( {} );
		expect( String( fetch.mock.calls[ 0 ]?.[ 0 ] ) ).toMatch(
			/^https:\/\/search\.test\/api\/programs\/search\/\?/
		);
	} );

	it( 'asks for nothing when the filters can match nothing', async () => {
		const fetch = fakeFetch();
		await expect(
			createClient( { fetch } ).getPrograms( {
				colleges: [ 'Bad slug' ],
			} )
		).resolves.toEqual( [] );
		expect( fetch ).not.toHaveBeenCalled();
	} );

	it( 'stops at 40 pages, whatever the count says', async () => {
		const fetch = vi.fn(
			async () =>
				new Response(
					JSON.stringify( { count: 1_000_000, results: [] } )
				)
		);
		await createClient( { fetch } ).getPrograms( {} );
		expect( fetch ).toHaveBeenCalledTimes( 40 );
	} );

	it( 'fails loudly on an error response', async () => {
		await expect(
			createClient( { fetch: fakeFetch( 400 ) } ).getPrograms( {} )
		).rejects.toThrow( /400/ );
	} );

	it( 'gives colleges and departments as an editor’s options, by name', async () => {
		const fetch = vi.fn(
			async ( url: string | URL | Request ) =>
				new Response(
					JSON.stringify( {
						results: String( url ).includes( 'departments' )
							? [
									{
										slug: 'statistics',
										full_name: 'Statistics',
									},
									{
										slug: 'accounting',
										full_name: 'Accounting',
									},
								]
							: [
									{
										slug: 'sciences',
										full_name: 'College of Sciences',
									},
									{ slug: 'bad' },
								],
					} )
				)
		);
		const client = createClient( { fetch } );

		await expect( client.getColleges() ).resolves.toEqual( [
			{ value: 'sciences', label: 'College of Sciences' },
		] );
		await expect( client.getDepartments() ).resolves.toEqual( [
			{ value: 'accounting', label: 'Accounting' },
			{ value: 'statistics', label: 'Statistics' },
		] );
		// UPSTREAM: departments come 100 a page by default; there are 113.
		expect( String( fetch.mock.calls[ 1 ]?.[ 0 ] ) ).toBe(
			`${ DEFAULT_API_ROOT }departments/?limit=500`
		);
	} );
} );
