/**
 * The List's markup contract: WordPress's serializer and React DOM's give the same HTML, and it
 * matches the snapshot. A block that uses it saves this markup inside its own.
 */
import { renderToString } from '@wordpress/element';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import List, { type ListProps } from '../List.tsx';

// WHY written here, not the props' defaults: the defaults may change; the markup this checks
// must not.
const ITEMS = 'First item\nSecond item';
const cases: Record< string, ListProps > = {
	default: { items: ITEMS },
	numbered: { variant: 'numbered', items: ITEMS },
	check: { variant: 'check', items: ITEMS },
	divided: { variant: 'divided', items: ITEMS },
	tags: { variant: 'tags', items: ITEMS },
	definitions: {
		variant: 'definitions',
		items: 'Phone: 407-823-3000\nHours: 8 a.m. to 5 p.m.',
	},
	'blank lines skipped': { items: '\nFirst item\n\n  \nSecond item\n' },
};

describe( 'List', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders the same in WordPress and React: ${ name }`, () => {
			const element = <List { ...props } />;
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}

	it( 'splits a definition at its first colon only', () => {
		const html = renderToStaticMarkup(
			<List variant="definitions" items="Hours: 8:00 to 5:00" />
		);

		expect( html ).toContain(
			'<li><strong>Hours</strong> 8:00 to 5:00</li>'
		);
	} );

	it( 'leaves an item with no term as plain text', () => {
		const html = renderToStaticMarkup(
			<List variant="definitions" items={ ': no term\nNo colon' } />
		);

		expect( html ).not.toContain( '<strong>' );
		expect( html ).toContain( '<li>: no term</li><li>No colon</li>' );
	} );

	it( 'keeps colons in other styles', () => {
		const html = renderToStaticMarkup( <List items="Note: bring ID" /> );

		expect( html ).toContain( '<li>Note: bring ID</li>' );
	} );

	// WHY: items are free text. The two serializers escape it differently, both safely
	// (Code.test.tsx says how), so it's compared as text, and neither may hold live markup.
	it( 'shows markup in an item as text, in WordPress and React', () => {
		const element = (
			<List
				variant="definitions"
				items={ '<b>Term</b>: <script>alert( 1 )</script>' }
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
