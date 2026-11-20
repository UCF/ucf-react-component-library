/**
 * CONTEXT: the markup contract: WordPress and React render the same HTML, matching the
 * snapshot. Why: components/content/highlight/tests/Highlight.test.tsx.
 */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderToString } from '@wordpress/element';

import type { Tile } from '@/core/hosts/prop-definitions';
import QuickLinks, { type QuickLinksProps } from '../QuickLinks.tsx';

// What `useBlockProps.save()` adds for this block.
// SYNC: the block name in wp/block.json.
const WP_WRAPPER = { className: 'wp-block-ucf-content-quick-links' };

const tile = ( label: string, href = '/admissions/' ): Tile => ( {
	label,
	description: `About ${ label }.`,
	href,
} );

const cases: Record< string, QuickLinksProps > = {
	defaults: {},
	tiles: {
		tiles: [
			tile( 'Can I get in?' ),
			{ label: 'What will it cost?', description: '', href: '/cost/' },
		],
	},
};

const linksIn = ( html: string ) =>
	[ ...html.matchAll( /<a [^>]*>([^<]*)<\/a>/g ) ].map(
		( [ , text ] ) => text
	);

describe( 'QuickLinks', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders the same in WordPress and React: ${ name }`, () => {
			const element = <QuickLinks { ...WP_WRAPPER } { ...props } />;
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}

	// SPEC: the design allows four at most.
	it( 'shows the first four tiles only', () => {
		const html = renderToStaticMarkup(
			<QuickLinks
				tiles={ [ 'A', 'B', 'C', 'D', 'E' ].map( ( l ) => tile( l ) ) }
			/>
		);
		expect( linksIn( html ) ).toEqual( [ 'A', 'B', 'C', 'D' ] );
	} );

	// WHY: a half-filled tile in the sidebar shouldn't publish an empty link.
	it( 'leaves out a tile with no text, and a description that is empty', () => {
		const html = renderToStaticMarkup(
			<QuickLinks
				tiles={ [
					tile( '' ),
					{ label: 'Costs', description: '', href: '/cost/' },
				] }
			/>
		);
		expect( linksIn( html ) ).toEqual( [ 'Costs' ] );
		expect( html ).not.toContain( 'ucf-c-quick-links__description' );
	} );

	// WHY: a `javascript:` or `data:` address would run when clicked.
	it.each( [
		'javascript:alert(1)',
		' DATA:text/html,x',
		// FIX: browsers drop tabs and newlines inside a URL, and control characters at its ends.
		'java\nscript:alert(1)',
		'java\tscript:alert(1)',
		'\u0001javascript:alert(1)',
	] )( 'drops an address that would run script: %j', ( href ) => {
		const html = renderToStaticMarkup(
			<QuickLinks
				tiles={ [
					tile( 'Bad', href ),
					tile( 'Good', 'https://www.ucf.edu/' ),
				] }
			/>
		);
		expect( html.match( /href="[^"]*"/g ) ).toEqual( [
			'href="https://www.ucf.edu/"',
		] );
	} );

	// WHY: it takes no content, so stray children must not render.
	it( 'renders no children', () => {
		expect(
			renderToStaticMarkup(
				<QuickLinks>
					<p>Stray</p>
				</QuickLinks>
			)
		).not.toContain( 'Stray' );
	} );
} );
