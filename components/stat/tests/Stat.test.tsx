/**
 * The markup contract.
 *
 * Two checks per case:
 *   1. WordPress's serializer (what `save()` stores and validates against) and React DOM's
 *      (what every other React host renders) produce the same HTML. If they ever differ, the
 *      hosts no longer show the same thing.
 *   2. That HTML matches the committed snapshot. A change here is a change to every saved
 *      post: update the snapshot only alongside a major version and a block deprecation.
 *
 * The snapshot is also the markup a non-React host copies to render a stat itself.
 */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderToString } from '@wordpress/element';

import Stat, { PARTS, type StatProps } from '../Stat.tsx';

// What `useBlockProps.save()` adds for this block.
// SYNC: the block name in adapters/wp/block.json.
const WP_WRAPPER = { className: 'wp-block-ucf-content-stat' };

const cases: Record< string, StatProps > = {
	empty: {},
	'the template’s parts': {
		children: (
			<>
				<p className={ PARTS.statement }>
					Two million square feet of research space
				</p>
				<p className={ PARTS.source }>Source: UCF Research</p>
			</>
		),
	},
};

describe( 'Stat', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders the same in WordPress and React: ${ name }`, () => {
			const element = <Stat { ...WP_WRAPPER } { ...props } />;
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}

	// WHY: WordPress and Puck each edit the content through their own element. If the Stat
	// rendered its children anywhere else, blocks dropped in would land outside the frame.
	it( 'renders its content in the element a host passes as innerAs', () => {
		const Zone = ( props: object ) => (
			<div data-zone="" { ...props }>
				<p>Dropped in</p>
			</div>
		);
		expect( renderToStaticMarkup( <Stat innerAs={ Zone } /> ) ).toContain(
			'<div data-zone="" class="ucf-c-stat__content"><p>Dropped in</p></div>'
		);
	} );
} );
