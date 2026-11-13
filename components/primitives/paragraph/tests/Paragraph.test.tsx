/**
 * The markup contract: WordPress's serializer and React DOM's give the same HTML, and it
 * matches the snapshot. Our blocks save this markup inside theirs, so a change here is a change
 * to every saved block that uses it.
 */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderToString } from '@wordpress/element';

import Paragraph, { type ParagraphProps } from '../Paragraph.tsx';
// WHY written here: the sample this snapshot was taken with. The props' defaults may change;
// the markup this checks must not.
const example = {
	content:
		'Explore more than 100 bachelor’s programs, taught by faculty who put undergraduate teaching first.',
};

const cases: Record< string, ParagraphProps > = {
	example,
	'with a class': { content: 'Lead-in', className: 'is-lead' },
};

describe( 'Paragraph', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders the same in WordPress and React: ${ name }`, () => {
			const element = <Paragraph { ...props } />;
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}
} );
