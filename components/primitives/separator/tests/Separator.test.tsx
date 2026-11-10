/**
 * The markup contract: WordPress's serializer and React DOM's give the same HTML, and it
 * matches the snapshot. Our blocks save this markup inside theirs, so a change here is a change
 * to every saved block that uses it.
 */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderToString } from '@wordpress/element';

import Separator, { type SeparatorProps } from '../Separator.tsx';

// WHY written here, not the props' defaults: the defaults may change; the markup this checks
// must not.
const cases: Record< string, SeparatorProps > = {
	default: {},
	wide: { variant: 'wide' },
	dots: { variant: 'dots' },
};

describe( 'Separator', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders the same in WordPress and React: ${ name }`, () => {
			const element = <Separator { ...props } />;
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}
} );
