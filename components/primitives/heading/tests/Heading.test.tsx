/**
 * The markup contract: WordPress's serializer and React DOM's give the same HTML, and it
 * matches the snapshot. Our blocks save this markup inside theirs, so a change here is a change
 * to every saved block that uses it.
 */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderToString } from '@wordpress/element';

import Heading, { type HeadingProps } from '../Heading.tsx';
// WHY written here: the sample this snapshot was taken with. The props' defaults may change;
// the markup this checks must not.
const example = {
	content: 'Undergraduate degrees',
	level: 2,
};

const cases: Record< string, HeadingProps > = {
	example: example as HeadingProps,
	'default level': { content: 'No level given' },
	h4: { content: 'Smaller', level: 4 },
};

describe( 'Heading', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders the same in WordPress and React: ${ name }`, () => {
			const element = <Heading { ...props } />;
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}

	// WHY: level is the page's outline. A screen reader's heading list reads the element, not
	// the look, so the level must become the element.
	it( 'renders the element its level names', () => {
		for ( const level of [ 1, 2, 3, 4, 5, 6 ] as const ) {
			expect(
				renderToStaticMarkup( <Heading content="x" level={ level } /> )
			).toMatch( new RegExp( `^<h${ level } ` ) );
		}
	} );
} );
