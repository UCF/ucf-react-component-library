/**
 * The Hero's markup contract: WordPress's serializer and React DOM's give the same HTML, and it
 * matches the snapshot. See components/stat/tests/Stat.test.tsx for why.
 */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderToString } from '@wordpress/element';

import Hero, { type HeroProps } from '../Hero.tsx';
import example from '../example.json';

// What `useBlockProps.save()` adds for this block.
// SYNC: the block name in adapters/wp/block.json.
const WP_WRAPPER = { className: 'wp-block-ucf-content-hero alignfull' };

const base = example as HeroProps;

const cases: Record< string, HeroProps > = {
	example: base,
	'full image, scrim, centered': {
		...base,
		layout: 'full image',
		overlay: 'scrim',
		contentAlign: 'center',
	},
	'text only, light, with badges': {
		...base,
		layout: 'text only',
		tone: 'light',
		badges: 'on',
	},
	'image left, flush, no secondary': {
		...base,
		imageSide: 'left',
		imageFill: 'flush',
		secondaryLabel: '',
	},
};

describe( 'Hero', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders the same in WordPress and React: ${ name }`, () => {
			const element = <Hero { ...WP_WRAPPER } { ...props } />;
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}

	// A11Y: WCAG 1.3.2, meaningful sequence. P1 put the image first in the HTML when it was on
	// the left, so a screen reader met it before the headline.
	it( 'keeps the copy before the image in the HTML, whichever side the image is on', () => {
		const html = renderToStaticMarkup(
			<Hero { ...base } imageSide="left" />
		);
		expect( html.indexOf( 'ucf-c-hero__copy' ) ).toBeLessThan(
			html.indexOf( 'ucf-c-hero__media' )
		);
	} );

	it( 'sets the composition its tone names, and Dark over a full image', () => {
		const composition = ( props: Partial< HeroProps > ) =>
			renderToStaticMarkup( <Hero { ...base } { ...props } /> ).match(
				/ucf-composition-([a-z-]+)/
			)?.[ 1 ];

		expect( composition( { tone: 'accent' } ) ).toBe( 'gold' );
		expect( composition( { tone: 'dark' } ) ).toBe( 'dark' );
		expect( composition( { tone: 'light' } ) ).toBe( 'alt' );
		expect( composition( { tone: 'light', layout: 'full image' } ) ).toBe(
			'dark'
		);
	} );

	it( 'shows badges only when they are on', () => {
		expect(
			renderToStaticMarkup( <Hero { ...base } badges="off" /> )
		).not.toContain( 'ucf-c-hero__badges' );
		expect(
			renderToStaticMarkup( <Hero { ...base } badges="on" /> )
		).toContain( 'Founded 1963' );
	} );
} );
