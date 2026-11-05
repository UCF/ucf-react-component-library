/**
 * The markup contract: WordPress's serializer and React DOM's produce the same HTML, and it
 * matches the committed snapshot. See components/content/highlight/tests/Highlight.test.tsx for
 * why.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderToString } from '@wordpress/element';

import Card, { type CardProps } from '../Card.tsx';
import { PRESETS } from '../Card.presets.ts';
import { PARTS } from '../Card.parts.ts';

// What `useBlockProps.save()` adds for this block.
// SYNC: the block name in wp/block.json.
const WP_WRAPPER = { className: 'wp-block-ucf-content-card' };

const cases: Record< string, CardProps > = {
	defaults: {},
	// Each preset's props, with a background image where the preset has one.
	...Object.fromEntries(
		PRESETS.map( ( preset ) => [
			`the ${ preset.name } preset`,
			{
				...preset.props,
				imageSrc: preset.background ? '/photo.jpg' : '',
			},
		] )
	),
};

describe( 'Card', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders the same in WordPress and React: ${ name }`, () => {
			const element = (
				<Card { ...WP_WRAPPER } { ...props }>
					<p>Content</p>
				</Card>
			);
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}

	// WHY: WordPress and Puck each edit the content through their own element. If the frame
	// rendered its children anywhere else, blocks dropped in would land outside the box.
	it( 'renders its content in the element a host passes as innerAs', () => {
		const Zone = ( props: object ) => (
			<div data-zone="" { ...props }>
				<p>Dropped in</p>
			</div>
		);
		expect( renderToStaticMarkup( <Card innerAs={ Zone } /> ) ).toContain(
			'<div data-zone="" class="ucf-c-card__content"><p>Dropped in</p></div>'
		);
	} );

	it( 'takes its own composition only when it has one', () => {
		expect( renderToStaticMarkup( <Card /> ) ).not.toContain(
			'ucf-composition-'
		);
		expect( renderToStaticMarkup( <Card composition="dark" /> ) ).toContain(
			'ucf-c ucf-c-card ucf-composition-dark'
		);
	} );

	// WHY: the image and overlay sit under the content. In the HTML they come first and the
	// content last, so a screen reader meets the content as it would without them.
	it( 'puts a background image and its overlay before the content, and nothing without one', () => {
		const html = renderToStaticMarkup(
			<Card imageSrc="/photo.jpg" imageId={ 7 } overlay="gradient" />
		);
		expect( html.indexOf( 'ucf-c-card__background' ) ).toBeLessThan(
			html.indexOf( 'data-overlay="gradient"' )
		);
		expect( html.indexOf( 'data-overlay' ) ).toBeLessThan(
			html.indexOf( 'ucf-c-card__content' )
		);
		expect( html ).toContain( 'wp-image-7' );
		expect( renderToStaticMarkup( <Card /> ) ).not.toContain(
			'ucf-c-card__background'
		);
	} );
} );

// WHY: a part class with no rule does nothing; an editor who picks it sees no change.
it( 'styles every part class', () => {
	const css = readFileSync(
		new URL( '../style.css', import.meta.url ),
		'utf8'
	);
	const looks: { kind: string; className?: string }[] =
		Object.values( PARTS );
	const unstyled = looks
		.map( ( look ) => look.className )
		.filter(
			( className ): className is string =>
				Boolean( className ) && ! css.includes( `.${ className }` )
		);
	expect( unstyled ).toEqual( [] );
} );
