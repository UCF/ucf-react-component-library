/**
 * The Columns's markup contract: WordPress's serializer and React DOM's give the same HTML, and it
 * matches the snapshot. How it lays out is checked in the browser
 * (integrations/storybook/Columns.stories.tsx, the Layout story).
 */
import { renderToString } from '@wordpress/element';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Column from '../../column/Column.tsx';
import Columns, { type ColumnsProps } from '../Columns.tsx';

const cases: Record< string, ColumnsProps > = {
	defaults: {},
	'two, left wider': { distribution: '2:1' },
	'two, right wider': { distribution: '1:2' },
	three: { distribution: '1:1:1' },
	four: { distribution: '1:1:1:1' },
	'tight, centered': { gap: 'tight', valign: 'center' },
	'wide, stretched': { gap: 'wide', valign: 'stretch' },
	'with an id and a class': { id: 'facts', className: 'is-featured' },
};

describe( 'Columns', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders the same in WordPress and React: ${ name }`, () => {
			const element = (
				<Columns { ...props }>
					<Column>
						<p>One</p>
					</Column>
					<Column>
						<p>Two</p>
					</Column>
				</Columns>
			);
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}

	// WHY: a Puck slot must be the grid itself, so each Column is a grid item.
	it( 'renders its content area as the element a host passes for it', () => {
		const Zone = ( props: object ) => <div data-zone="" { ...props } />;
		expect(
			renderToStaticMarkup(
				<Columns.port.Frame areas={ { content: Zone } } />
			)
		).toBe(
			'<div class="ucf-c-columns"><div data-zone="" class="ucf-c-columns__grid"></div></div>'
		);
	} );
} );
