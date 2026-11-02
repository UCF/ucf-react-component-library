/**
 * The markup contract: WordPress's serializer and React DOM's produce the same HTML, and it
 * matches the committed snapshot. See components/stat/tests/Stat.test.tsx for why.
 */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderToString } from '@wordpress/element';

import Card, { type CardProps } from '../Card.tsx';
import example from '../example.json';
import type { Variant } from '../options.ts';

// What `useBlockProps.save()` adds for this block.
// SYNC: the block name in adapters/wp/block.json.
const WP_WRAPPER = { className: 'wp-block-ucf-content-card' };

const cases: Record< string, CardProps > = {
	example: example as CardProps,
	defaults: {},
	ruled: { variant: 'ruled' as Variant },
};

describe( 'Card', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders the same in WordPress and React: ${ name }`, () => {
			const element = (
				<Card { ...WP_WRAPPER } { ...props }>
					<p>Content</p>
				</Card>
			);
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}

	// WHY: WordPress and Puck each edit the content through their own element. If the frame
	// rendered its children anywhere else, blocks dropped in would land outside the box.
	it( 'renders its content in the element a host passes as innerAs', () => {
		const Zone = ( props: object ) => (
			<div data-zone="" { ...props }>
				<p>Dropped in</p>
			</div>
		);
		expect( renderToStaticMarkup( <Card innerAs={ Zone } /> ) ).toContain(
			'<div data-zone="" class="ucf-c-card__content"><p>Dropped in</p></div>'
		);
	} );
} );
