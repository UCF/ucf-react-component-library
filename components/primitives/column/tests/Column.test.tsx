/**
 * The Column's markup contract: WordPress's serializer and React DOM's give the same HTML, and it
 * matches the snapshot.
 */
import { renderToString } from '@wordpress/element';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Column from '../Column.tsx';

describe( 'Column', () => {
	it( 'renders the same in WordPress and React', () => {
		const element = (
			<Column>
				<h3>Heading</h3>
				<p>Body copy.</p>
			</Column>
		);
		const html = renderToStaticMarkup( element );

		expect( renderToString( element ) ).toBe( html );
		expect( html ).toMatchSnapshot();
	} );

	it( 'renders its content area as the element a host passes for it', () => {
		const Zone = ( props: object ) => <div data-zone="" { ...props } />;
		expect(
			renderToStaticMarkup(
				<Column.port.Frame areas={ { content: Zone } } />
			)
		).toBe(
			'<div class="ucf-c-column"><div data-zone="" class="ucf-c-column__content"></div></div>'
		);
	} );
} );
