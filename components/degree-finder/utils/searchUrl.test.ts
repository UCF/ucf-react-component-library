import { expect, test } from 'vitest';

import { buildSearchUrl } from './searchUrl.ts';

test( 'links to degree search when nothing is chosen', () => {
	expect( buildSearchUrl() ).toBe( 'https://www.ucf.edu/degree-search/' );
} );

test( 'adds the program type as a path segment', () => {
	expect( buildSearchUrl( { programType: 'bachelor' } ) ).toBe(
		'https://www.ucf.edu/degree-search/bachelor/'
	);
} );

test( 'accepts a base URL with or without a trailing slash', () => {
	expect(
		buildSearchUrl( {
			baseUrl: 'https://example.edu/search',
			programType: 'minor',
		} )
	).toBe( 'https://example.edu/search/minor/' );
} );

test( 'ignores interests until degree search can filter on them', () => {
	expect(
		buildSearchUrl( { programType: 'bachelor', interests: [ 'biology' ] } )
	).toBe( 'https://www.ucf.edu/degree-search/bachelor/' );
} );
