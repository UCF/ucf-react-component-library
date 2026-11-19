/** CONTEXT: the WordPress sidebar field for a links prop (core/hosts/wordpress/controls/links-control.tsx). */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import type { LinksProp } from '../../hosts/prop-definitions.ts';
import {
	LinksControl,
	LinkTargets,
} from '../../hosts/wordpress/controls/links-control.tsx';

const DEFINITION: LinksProp = { type: 'links', label: 'Links', default: [] };
const SECTIONS = [
	{ label: 'Overview', href: '#overview' },
	{ label: 'Tuition and Aid', href: '#tuition' },
];

const optionsIn = ( html: string ) =>
	[ ...html.matchAll( /<option[^>]*value="([^"]*)"[^>]*>([^<]*)</g ) ].map(
		( [ , value, label ] ) => ( { value, label } )
	);

describe( 'LinksControl', () => {
	it( 'picks each link’s target from the page’s Sections, with no address to type', () => {
		const html = renderToStaticMarkup(
			<LinkTargets.Provider value={ SECTIONS }>
				<LinksControl
					definition={ DEFINITION }
					value={ [ { label: 'Costs', href: '#tuition' } ] }
					onChange={ () => {} }
				/>
			</LinkTargets.Provider>
		);

		expect( optionsIn( html ) ).toEqual( [
			{ value: '', label: 'Choose a section' },
			{ value: '#overview', label: 'Overview (#overview)' },
			{ value: '#tuition', label: 'Tuition and Aid (#tuition)' },
		] );
		expect( html ).not.toContain( 'Address' );
	} );

	it( 'keeps a saved target that is no longer on the page, marked as missing', () => {
		const html = renderToStaticMarkup(
			<LinkTargets.Provider value={ SECTIONS }>
				<LinksControl
					definition={ DEFINITION }
					value={ [ { label: 'Gone', href: '#old' } ] }
					onChange={ () => {} }
				/>
			</LinkTargets.Provider>
		);

		expect( optionsIn( html ) ).toContainEqual( {
			value: '#old',
			label: '#old (not on this page)',
		} );
	} );
} );
