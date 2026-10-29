/**
 * CONTEXT: what the REST client requests and what it keeps, with a fake fetch.
 */
import { expect, test } from 'vitest';

import { createClient } from './client.ts';

interface FakeResponse {
	body: unknown;
	totalPages?: number;
	status?: number;
}

/**
 * A fake fetch that answers from a function and records every URL.
 *
 * @param respond Answers one request.
 * @return The fetch, and the URLs it was called with.
 */
function fakeFetch( respond: ( url: URL ) => FakeResponse ) {
	const calls: URL[] = [];
	const fetch = async ( input: string | URL | Request ) => {
		const url = new URL( String( input ) );
		calls.push( url );
		const { body, totalPages = 1, status = 200 } = respond( url );
		return new Response( JSON.stringify( body ), {
			status,
			headers: { 'X-WP-TotalPages': String( totalPages ) },
		} );
	};
	return { fetch: fetch as typeof globalThis.fetch, calls };
}

test( 'getProgramTypes normalizes the tree', async () => {
	const { fetch, calls } = fakeFetch( () => ( {
		body: [
			{
				name: 'Undergraduate Program',
				plural: 'Undergraduate Programs',
				slug: 'undergraduate-program',
				count: 480,
				children: [
					{
						name: 'Bachelor',
						plural: 'Bachelors',
						slug: 'bachelor',
						count: 254,
						children: [],
					},
				],
			},
			{
				name: 'Professional Program',
				slug: 'professional-program',
				count: 1,
			},
		],
	} ) );

	const types = await createClient( {
		apiRoot: 'https://example.edu/wp-json/',
		fetch,
	} ).getProgramTypes();

	expect( calls[ 0 ]?.href ).toBe(
		'https://example.edu/wp-json/ucf-degree-search/v1/program-types'
	);
	expect( types[ 0 ]?.children[ 0 ] ).toEqual( {
		slug: 'bachelor',
		name: 'Bachelor',
		plural: 'Bachelors',
		count: 254,
		children: [],
	} );
	// WHY: the plural falls back to the name when the API leaves it out.
	expect( types[ 1 ]?.plural ).toBe( 'Professional Program' );
	expect( types[ 1 ]?.children ).toEqual( [] );
} );

test( 'getInterests filters by program type and sorts by name', async () => {
	const { fetch, calls } = fakeFetch( () => ( {
		body: [
			{ slug: 'biology', name: 'Biology', display_text: 'Biology' },
			{
				slug: 'arts',
				name: 'Arts',
				display_text: 'Arts &amp; Humanities',
			},
		],
	} ) );

	const interests = await createClient( { fetch } ).getInterests(
		'bachelor'
	);

	expect( calls[ 0 ]?.searchParams.get( 'program_types' ) ).toBe(
		'bachelor'
	);
	expect( interests ).toEqual( [
		{ slug: 'arts', name: 'Arts & Humanities' },
		{ slug: 'biology', name: 'Biology' },
	] );
} );

test( 'getDegrees loads every page, not just the first', async () => {
	const { fetch, calls } = fakeFetch( ( url ) => {
		const page = Number( url.searchParams.get( 'page' ) );
		return {
			totalPages: 3,
			body: [
				{
					id: page,
					title: { rendered: `Degree ${ page }` },
					link: `https://example.edu/degree/${ page }/`,
				},
			],
		};
	} );

	const degrees = await createClient( { fetch } ).getDegrees( 'bachelor', [
		'biology',
	] );

	expect( calls ).toHaveLength( 3 );
	expect( degrees.map( ( d ) => d.id ) ).toEqual( [ 1, 2, 3 ] );
} );

test( 'getDegrees sends several interests as one comma-separated filter', async () => {
	const { fetch, calls } = fakeFetch( () => ( { body: [] } ) );

	await createClient( { fetch } ).getDegrees( 'bachelor', [
		'anthropology',
		'accounting-and-related-services',
	] );

	const params = calls[ 0 ]?.searchParams;
	expect( calls[ 0 ]?.pathname ).toBe( '/wp-json/wp/v2/degrees' );
	expect( params?.get( 'program_types' ) ).toBe( 'bachelor' );
	expect( params?.get( 'interests' ) ).toBe(
		'anthropology,accounting-and-related-services'
	);
	expect( params?.get( 'per_page' ) ).toBe( '100' );
} );

test( 'getDegrees decodes titles and returns normalized records', async () => {
	const { fetch } = fakeFetch( () => ( {
		body: [
			{
				id: 64854,
				title: { rendered: 'Anthropology (BA) &#8211; General Track' },
				link: 'https://www.ucf.edu/degree/anthropology-ba/general-track/',
			},
		],
	} ) );

	const [ degree ] = await createClient( { fetch } ).getDegrees( 'bachelor', [
		'anthropology',
	] );

	expect( degree ).toEqual( {
		id: 64854,
		title: 'Anthropology (BA) – General Track',
		url: 'https://www.ucf.edu/degree/anthropology-ba/general-track/',
	} );
} );

test( 'getDegrees makes no request when no interests are chosen', async () => {
	const { fetch, calls } = fakeFetch( () => ( { body: [] } ) );

	expect(
		await createClient( { fetch } ).getDegrees( 'bachelor', [] )
	).toEqual( [] );
	expect( calls ).toHaveLength( 0 );
} );

test( 'a failed request throws', async () => {
	const { fetch } = fakeFetch( () => ( { status: 404, body: {} } ) );

	await expect( createClient( { fetch } ).getProgramTypes() ).rejects.toThrow(
		/status 404/
	);
} );
