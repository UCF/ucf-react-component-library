/**
 * The Pullquote's markup contract: WordPress's serializer and React DOM's give the same HTML, and it
 * matches the snapshot. A block that uses it saves this markup inside its own.
 */
import { renderToString } from '@wordpress/element';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Pullquote, { type PullquoteProps } from '../Pullquote.tsx';

// WHY written here, not the props' defaults: the defaults may change; the markup this checks
// must not.
const cases: Record< string, PullquoteProps > = {
	sample: {
		value: 'Florida’s largest university, by design.',
		citation: 'UCF Admissions',
	},
	'two paragraphs': {
		value: 'The first paragraph.\n\nThe second, after a blank line.',
		citation: 'UCF Admissions',
	},
	'no citation': { value: 'Florida’s largest university, by design.' },
};

describe( 'Pullquote', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders the same in WordPress and React: ${ name }`, () => {
			const element = <Pullquote { ...props } />;
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}

	// WHY: a quote is free text. The two serializers escape it differently, both safely
	// (Code.test.tsx says how), so it's compared as text, and neither may hold live markup.
	it( 'shows markup in the quote as text, in WordPress and React', () => {
		const element = (
			<Pullquote
				value="<script>alert( 1 )</script>"
				citation="<b>Name</b>"
			/>
		);
		const text = ( html: string ) =>
			html
				.replace( /&gt;/g, '>' )
				.replace( /&quot;/g, '"' )
				.replace( /&#x27;/g, "'" );
		const react = renderToStaticMarkup( element );
		const wordpress = renderToString( element );

		expect( react ).not.toMatch( /<script|<b>/ );
		expect( wordpress ).not.toMatch( /<script|<b>/ );
		expect( text( wordpress ) ).toBe( text( react ) );
	} );
} );
