/**
 * The Card's markup contract: WordPress's serializer and React DOM's give the same HTML, and it
 * matches the snapshot. See components/stat/tests/Stat.test.tsx for why. Then the rules that
 * make the card accessible, which a snapshot alone wouldn't explain if one broke.
 */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderToString } from '@wordpress/element';

import FixedCard, { type FixedCardProps } from '../FixedCard.tsx';
import example from '../example.json';

// What `useBlockProps.save()` adds for this block.
// SYNC: the block name in adapters/wp/block.json.
const WP_WRAPPER = { className: 'wp-block-ucf-content-fixed-card' };

const base = example as FixedCardProps;
const image = 'https://www.ucf.edu/files/2026/01/students.jpg';

const cases: Record< string, FixedCardProps > = {
	example: base,
	'boxed, horizontal, from the media library': {
		...base,
		variant: 'boxed',
		layout: 'horizontal',
		imageUrl: image,
		imageAlt: 'Students outside the Student Union',
		imageId: 1234,
	},
	'ruled, no image, an h2, new tab': {
		...base,
		variant: 'ruled',
		imageUrl: '',
		headingLevel: 'h2',
		linkTarget: '_blank',
	},
	// SYNC: block attributes default to '' and 0, so a saved block passes those.
	'title only, no link': {
		title: 'Bachelor’s degrees',
		url: '',
		meta: '',
		description: '',
		imageUrl: '',
		imageAlt: '',
		imageId: 0,
	},
};

const render = ( props: Partial< FixedCardProps > ) =>
	renderToStaticMarkup( <FixedCard { ...base } { ...props } /> );

describe( 'FixedCard', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders the same in WordPress and React: ${ name }`, () => {
			const element = <FixedCard { ...WP_WRAPPER } { ...props } />;
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}

	// A11Y: one link, so a keyboard user meets one tab stop per card.
	it( 'has exactly one link, through its title', () => {
		const html = render( {} );
		expect( html.match( /<a /g ) ).toHaveLength( 1 );
		expect( html ).toMatch( /<h3 class="ucf-c-fixed-card__title"><a / );
	} );

	it( 'is not a link at all without a URL', () => {
		const html = render( { url: '' } );
		expect( html ).not.toContain( '<a ' );
		expect( html ).not.toContain( 'data-linked' );
	} );

	// A11Y: WCAG 1.3.2. The title is read before the meta line and the image, whatever the
	// CSS shows first.
	it( 'puts the title first in the HTML', () => {
		const html = render( {} );
		expect( html.indexOf( 'ucf-c-fixed-card__title' ) ).toBeLessThan(
			html.indexOf( 'ucf-c-fixed-card__meta' )
		);
		expect( html.indexOf( 'ucf-c-fixed-card__title' ) ).toBeLessThan(
			html.indexOf( 'ucf-c-fixed-card__media' )
		);
	} );

	it( 'uses the heading level it is given', () => {
		expect( render( { headingLevel: 'h2' } ) ).toContain(
			'<h2 class="ucf-c-fixed-card__title">'
		);
		expect( render( { headingLevel: 'h4' } ) ).toContain(
			'<h4 class="ucf-c-fixed-card__title">'
		);
	} );

	// UPSTREAM: WordPress adds responsive sizes only to an <img> with wp-image-{id}.
	it( 'passes the media library ID to its image', () => {
		expect( render( { imageUrl: image, imageId: 1234 } ) ).toContain(
			'wp-image-1234'
		);
	} );
} );
