/** CONTEXT: a tiles prop's fields: the WordPress sidebar (wordpress/controls/tiles-control.tsx) and Puck. */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import type { Tile, TilesProp } from '../../hosts/prop-definitions.ts';
import { puckFields } from '../../hosts/puck/props-to-fields.ts';
import { TilesControl } from '../../hosts/wordpress/controls/tiles-control.tsx';

const DEFINITION: TilesProp = {
	type: 'tiles',
	label: 'Links',
	max: 2,
	default: [],
};
const TILE: Tile = {
	label: 'Can I get in?',
	description: 'Requirements and deadlines.',
	href: '/admissions/',
};

const render = ( value: readonly Tile[] ) =>
	renderToStaticMarkup(
		<TilesControl
			definition={ DEFINITION }
			value={ value }
			onChange={ () => {} }
		/>
	);

// The "Add link" button's markup.
const addButton = ( html: string ) =>
	html.match( /<button[^>]*>Add link<\/button>/ )?.[ 0 ] ?? '';

describe( 'TilesControl', () => {
	it( 'gives each tile its text, description and address', () => {
		const html = render( [ TILE ] );
		expect( html ).toContain( 'Text' );
		expect( html ).toContain( 'Description' );
		expect( html ).toContain( 'Address' );
		expect( html ).toContain( 'value="/admissions/"' );
		expect( html ).toContain( 'Requirements and deadlines.' );
	} );

	// SPEC: the design allows a set number; the sidebar stops adding at it.
	it( 'stops adding tiles at the prop’s max', () => {
		expect( addButton( render( [ TILE ] ) ) ).not.toContain( 'disabled' );
		expect( addButton( render( [ TILE, TILE ] ) ) ).toContain( 'disabled' );
	} );

	// SPEC: a bare `www.ucf.edu` links relative to the page, so both editors say how to write each kind.
	it( 'says how to write a path on this site and another site’s address, in WordPress and Puck', () => {
		const html = render( [ TILE ] );
		expect( html ).toContain(
			'A page on this site: its path, like /admissions/.'
		);
		expect( html ).toContain(
			'Another site: the full address, starting with https://'
		);
		expect( html ).toContain( 'placeholder="/admissions/ or https://"' );

		const field = puckFields( { tiles: DEFINITION } ).tiles;
		expect( field ).toMatchObject( {
			arrayFields: {
				href: {
					label: 'Address (/path on this site, or https://…)',
					placeholder: '/admissions/ or https://',
				},
			},
		} );
	} );

	// SPEC: Puck stops adding at the same max as WordPress, a zero one included.
	it( 'gives Puck the prop’s max, even zero', () => {
		const maxOf = ( max?: number ) =>
			(
				puckFields( { tiles: { ...DEFINITION, max } } ).tiles as {
					max?: number;
				}
			 ).max;
		expect( maxOf( 2 ) ).toBe( 2 );
		expect( maxOf( 0 ) ).toBe( 0 );
		expect( maxOf( undefined ) ).toBeUndefined();
	} );
} );
