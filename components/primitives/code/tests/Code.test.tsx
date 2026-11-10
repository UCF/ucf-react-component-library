/**
 * The markup contract: WordPress's serializer and React DOM's give the same HTML, and it
 * matches the snapshot. Our blocks save this markup inside theirs, so a change here is a change
 * to every saved block that uses it.
 */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderToString } from '@wordpress/element';

import Code, { type CodeProps } from '../Code.tsx';

// WHY written here, not the props' defaults: the defaults may change; the markup this checks
// must not.
const cases: Record< string, CodeProps > = {
	sample: { content: 'const credits = 120;\nconsole.log( credits );' },
};

describe( 'Code', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders the same in WordPress and React: ${ name }`, () => {
			const element = <Code { ...props } />;
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}

	// WHY its own test: the two serializers escape text differently, both safely. React escapes
	// `>` and quotes; WordPress only `<` and `&`, which is all text needs. A browser reads both
	// the same, so they're compared as text, and neither may hold live markup.
	it( 'shows markup in the code as text, in WordPress and React', () => {
		const element = (
			<Code content={ '<script>alert( 1 )</script> & "q"' } />
		);
		const text = ( html: string ) =>
			html
				.replace( /&gt;/g, '>' )
				.replace( /&quot;/g, '"' )
				.replace( /&#x27;/g, "'" );
		const react = renderToStaticMarkup( element );
		const wordpress = renderToString( element );

		expect( react ).not.toContain( '<script' );
		expect( wordpress ).not.toContain( '<script' );
		expect( text( wordpress ) ).toBe( text( react ) );
	} );
} );
