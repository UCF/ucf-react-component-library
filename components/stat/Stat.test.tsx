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

import Stat, { type StatProps } from './Stat.tsx';
import example from './example.json';

// What `useBlockProps.save()` adds for this block.
// SYNC: the block name in hosts/wp/block.json.
const WP_WRAPPER = { className: 'wp-block-ucf-content-stat' };

const cases: Record< string, StatProps > = {
	example,
	'statement only': {
		statement: 'Two million square feet of research space',
	},
	// SYNC: block attributes default to '', so a saved block passes empty strings, not undefined.
	'source without link or date': {
		statement: 'Two million square feet of research space',
		detail: '',
		source: 'UCF Research',
		sourceUrl: '',
		asOf: '',
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
} );
