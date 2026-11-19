/** CONTEXT: the WordPress sidebar field for a tiles prop (core/hosts/wordpress/controls/tiles-control.tsx). */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import type { Tile, TilesProp } from '../../hosts/prop-definitions.ts';
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
} );
