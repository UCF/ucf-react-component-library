import { describe, expect, it } from 'vitest';

import { decodeEntities, plainText, summarize } from '../../utils/text.ts';

describe( 'text', () => {
	it( 'decodes numeric and the named entities it knows, and leaves the rest', () => {
		expect(
			decodeEntities( '&#8211; &#x2014; &amp; &rsquo; &copy; &#0;' )
		).toBe( '– — & ’ &copy; &#0;' );
	} );

	it( 'makes one line of plain text', () => {
		expect(
			plainText( '<p>One&nbsp;two</p>\n<ul><li>three</li></ul>' )
		).toBe( 'One two three' );
	} );

	it( 'keeps the first words, with an ellipsis only when it cut', () => {
		expect( summarize( 'a b c', 2 ) ).toBe( 'a b…' );
		expect( summarize( 'a b', 2 ) ).toBe( 'a b' );
		expect( summarize( '' ) ).toBe( '' );
	} );
} );
