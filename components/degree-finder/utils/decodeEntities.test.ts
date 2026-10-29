import { expect, test } from 'vitest';

import { decodeEntities } from './decodeEntities.ts';

test( 'decodes the entities WordPress uses in titles', () => {
	expect( decodeEntities( 'Art &#8211; Studio' ) ).toBe( 'Art – Studio' );
	expect( decodeEntities( 'Arts &#038; Sciences' ) ).toBe(
		'Arts & Sciences'
	);
	expect( decodeEntities( 'Women&#8217;s Studies' ) ).toBe(
		'Women’s Studies'
	);
	expect( decodeEntities( 'Tom &amp; Jerry' ) ).toBe( 'Tom & Jerry' );
	expect( decodeEntities( '&#x41;' ) ).toBe( 'A' );
} );

test( 'leaves unknown entities and plain text alone', () => {
	expect( decodeEntities( '&unknown; text' ) ).toBe( '&unknown; text' );
	expect( decodeEntities( 'No entities' ) ).toBe( 'No entities' );
	expect( decodeEntities( undefined ) ).toBe( '' );
} );
