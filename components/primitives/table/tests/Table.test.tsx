/**
 * The Table's markup contract: WordPress's serializer and React DOM's give the same HTML, and it
 * matches the snapshot. A block that uses it saves this markup inside its own.
 */
import { renderToString } from '@wordpress/element';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Table, { type TableProps } from '../Table.tsx';

// WHY written here, not the props' defaults: the defaults may change; the markup this checks
// must not.
const ROWS = 'Term | Starts\nFall | August 24\nSpring | January 6';
const cases: Record< string, TableProps > = {
	default: { caption: 'Deadlines', rows: ROWS },
	stripes: { variant: 'stripes', caption: 'Deadlines', rows: ROWS },
	compare: { variant: 'compare', caption: 'Deadlines', rows: ROWS },
	'no caption': { rows: ROWS },
	'header only': { caption: 'Deadlines', rows: 'Term | Starts' },
};

describe( 'Table', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders the same in WordPress and React: ${ name }`, () => {
			const element = <Table { ...props } />;
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}

	it( 'fills a short row with empty cells, and skips blank lines', () => {
		const html = renderToStaticMarkup(
			<Table rows={ 'A | B | C\n\nOne\n  \nTwo | Three' } />
		);

		expect( html ).toContain(
			'<tbody><tr><td>One</td><td></td><td></td></tr><tr><td>Two</td><td>Three</td><td></td></tr></tbody>'
		);
	} );

	it( 'is named by its caption, or is a region named "Table" with none', () => {
		const captioned = renderToStaticMarkup( <Table caption="Deadlines" /> );

		expect( captioned ).toContain( 'tabindex="0"' );
		expect( captioned ).not.toMatch( /role=|aria-label=/ );
		expect( renderToStaticMarkup( <Table /> ) ).toContain(
			'tabindex="0" role="region" aria-label="Table"'
		);
	} );

	// WHY: cells are free text. The two serializers escape it differently, both safely
	// (Code.test.tsx says how), so it's compared as text, and neither may hold live markup.
	it( 'shows markup in a cell as text, in WordPress and React', () => {
		const element = (
			<Table
				caption="<b>Title</b>"
				rows={ '<b>Head</b>\n<script>alert( 1 )</script>' }
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
