/**
 * CONTEXT: the markup contract: WordPress and React render the same HTML, matching the
 * snapshot. Why: components/content/highlight/tests/Highlight.test.tsx.
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
			{ label: 'Apply', href: '#apply' },
		],
	},
	spread: {
		linkLayout: 'spread',
		links: [ { label: 'Overview', href: '#overview' } ],
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

	// SPEC: Section Menus' default (left) and `justify-between` (spread) layouts.
	it( 'marks the spread layout with a class, and the left one with none', () => {
		expect(
			renderToStaticMarkup( <SectionNav linkLayout="spread" /> )
		).toContain( 'ucf-c-section-nav--spread' );
		expect(
			renderToStaticMarkup( <SectionNav linkLayout="left" /> )
		).not.toContain( 'ucf-c-section-nav--' );
	} );

	// WHY: it takes no content, so stray children must not render.
	it( 'renders no children', () => {
		expect(
			renderToStaticMarkup(
				<SectionNav>
					<p>Stray</p>
				</SectionNav>
			)
		).not.toContain( 'Stray' );
	} );

	// WHY: it only jumps within the page; anything else (a URL, `javascript:`) is left out.
	it( 'renders only links to an anchor on the page, in WordPress and React', () => {
		const element = (
			<SectionNav
				links={ [
					'#apply',
					'#',
					'https://www.ucf.edu/',
					'/admissions/',
					'javascript:alert(1)',
					' #tuition',
				].map( ( href ) => ( { label: 'x', href } ) ) }
			/>
		);
		const html = renderToStaticMarkup( element );

		expect( renderToString( element ) ).toBe( html );
		expect(
			[ ...html.matchAll( / href="([^"]*)"/g ) ].map(
				( [ , href ] ) => href
			)
		).toEqual( [ '#apply' ] );
	} );
} );
