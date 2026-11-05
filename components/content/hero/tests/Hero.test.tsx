/**
 * The Hero's markup contract: WordPress's serializer and React DOM's give the same HTML, and it
 * matches the snapshot. See components/content/highlight/tests/Highlight.test.tsx for why.
 */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderToString } from '@wordpress/element';

import Hero, { type HeroProps } from '../Hero.tsx';
import { PARTS } from '../Hero.parts.ts';

// What `useBlockProps.save()` adds for this block.
// SYNC: the block name in wp/block.json.
const WP_WRAPPER = { className: 'wp-block-ucf-content-hero alignfull' };

// The props the markup snapshots were taken with: the defaults, and a small drawn image.
const base: HeroProps = {
	tone: 'accent',
	layout: 'split',
	imageSrc:
		'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 1200 900%27%3E%3Cdefs%3E%3ClinearGradient id=%27g%27 x1=%270%27 y1=%270%27 x2=%271%27 y2=%271%27%3E%3Cstop offset=%270%27 stop-color=%27%23444%27/%3E%3Cstop offset=%271%27 stop-color=%27%23000%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%271200%27 height=%27900%27 fill=%27url(%23g)%27/%3E%3Ccircle cx=%27880%27 cy=%27260%27 r=%27150%27 fill=%27%23ffc904%27/%3E%3C/svg%3E',
	imageAlt: '',
	imageSide: 'right',
	imageFill: 'card',
	splitRatio: 'even',
	contentAlign: 'left',
	overlay: 'gradient right',
	overlayStrength: 'medium',
	height: 'regular',
};
const copy = <h1 className={ PARTS.title.className }>Reach for the stars</h1>;

const cases: Record< string, HeroProps > = {
	example: base,
	'full image, scrim, centered': {
		...base,
		layout: 'full image',
		overlay: 'scrim',
		contentAlign: 'center',
	},
	'text only, light': { ...base, layout: 'text only', tone: 'light' },
	'image left, flush': { ...base, imageSide: 'left', imageFill: 'flush' },
};

describe( 'Hero', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders the same in WordPress and React: ${ name }`, () => {
			const element = (
				<Hero { ...WP_WRAPPER } { ...props }>
					{ copy }
				</Hero>
			);
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}

	// A11Y: WCAG 1.3.2, meaningful sequence. P1 put the image first in the HTML when it was on
	// the left, so a screen reader met it before the headline.
	it( 'keeps the copy before the image in the HTML, whichever side the image is on', () => {
		const html = renderToStaticMarkup(
			<Hero { ...base } imageSide="left">
				{ copy }
			</Hero>
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

	// WHY: WordPress and Puck each edit the copy through their own element. If the Hero rendered
	// its children anywhere else, blocks dropped in would land outside the copy, and the copy's
	// alignment would not reach them.
	it( 'renders its copy area as the element a host passes for it, with its alignment', () => {
		const Zone = ( props: object ) => (
			<div data-zone="" { ...props }>
				<p>Dropped in</p>
			</div>
		);
		expect(
			renderToStaticMarkup(
				<Hero.port.Frame
					{ ...base }
					contentAlign="center"
					areas={ { content: Zone } }
				/>
			)
		).toContain(
			'<div data-zone="" class="ucf-c-hero__copy" data-align="center"><p>Dropped in</p></div>'
		);
	} );

	// WHY: the attachment ID is how WordPress finds the image's other sizes. It reads
	// `wp-image-{id}` on the saved <img> and adds srcset (components/primitives/image/Image.tsx).
	it( 'saves a media library image with its attachment ID, for responsive sizes', () => {
		const html = renderToStaticMarkup(
			<Hero { ...base } imageId={ 42 } />
		);
		expect( html ).toMatch( /<img class="[^"]*\bwp-image-42\b[^"]*"/ );
	} );

	// WHY: WordPress's editor puts its picker in the image area, which must show in the image's
	// frame even before an image is chosen, or there is nothing to click.
	it( 'shows the host’s image area in the image frame, even with no image yet', () => {
		const Choose = () => <button>Choose</button>;
		const html = renderToStaticMarkup(
			<Hero.port.Frame
				{ ...base }
				imageSrc=""
				areas={ { media: Choose } }
			/>
		);
		expect( html ).toContain(
			'<div class="ucf-c-hero__media"><button>Choose</button></div>'
		);
	} );
} );
