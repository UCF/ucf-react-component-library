/**
 * The markup contract: WordPress's serializer and React DOM produce the same HTML, and it
 * matches the committed snapshot. See components/content/highlight/tests/Highlight.test.tsx for
 * why.
 */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderToString } from '@wordpress/element';

import SectionNav, { type SectionNavProps } from '../SectionNav.tsx';

// What `useBlockProps.save()` adds for this block.
// SYNC: the block name in wp/block.json.
const WP_WRAPPER = { className: 'wp-block-ucf-content-section-nav' };

const cases: Record< string, SectionNavProps > = {
	defaults: {},
	links: {
		links: [
			{ label: 'Overview', href: '#overview' },
			{ label: 'Tuition & Aid', href: '#tuition' },
			{ label: 'Apply', href: 'https://www.ucf.edu/apply/' },
		],
	},
};

describe( 'SectionNav', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders the same in WordPress and React: ${ name }`, () => {
			const element = <SectionNav { ...WP_WRAPPER } { ...props } />;
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}

	it( 'is a landmark of its own, which a site may rename', () => {
		expect( renderToStaticMarkup( <SectionNav /> ) ).toContain(
			'aria-label="On this page"'
		);
		expect(
			renderToStaticMarkup( <SectionNav aria-label="In this program" /> )
		).toContain( 'aria-label="In this program"' );
	} );

	// WHY: it holds no content; children passed to it must not land in the bar.
	it( 'renders no children', () => {
		expect(
			renderToStaticMarkup(
				<SectionNav>
					<p>Stray</p>
				</SectionNav>
			)
		).not.toContain( 'Stray' );
	} );
} );
