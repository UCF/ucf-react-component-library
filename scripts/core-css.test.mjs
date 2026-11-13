/**
 * scripts/core-css.mjs: a primitive's CSS, rewritten for the core block the theme styles.
 */
import { describe, expect, test } from 'vitest';

import { coreCss } from './core-css.mjs';
import { loadTokens } from './tokens.mjs';

const tokens = loadTokens();
const button = coreCss( tokens, 'button' );

describe( 'the Button as core Button', () => {
	test( 'maps every rule of the primitive’s CSS', () => {
		expect( button ).toContain(
			'.wp-block-button > .wp-block-button__link {'
		);
		expect( button ).not.toContain( 'ucf-c-button' );
		expect( button ).not.toContain( '[data-' );
	} );

	test( 'puts each variant on core’s style class, and each size on core’s font-size class', () => {
		expect( button ).toContain(
			'.wp-block-button.is-style-outline > .wp-block-button__link:not(.has-background):hover'
		);
		expect( button ).toContain(
			'.wp-block-button.is-style-text > .wp-block-button__link {'
		);
		expect( button ).toContain(
			'.wp-block-button:not(.is-style-outline):not(.is-style-text) > .wp-block-button__link:not(.has-background) {'
		);
		expect( button ).toContain(
			'.wp-block-button > .wp-block-button__link.has-small-font-size {'
		);
	} );

	test( 'reads the theme’s roles and tokens, with the Light colors as fallbacks', () => {
		expect( button ).toContain(
			'background-color: var(--ucf-button, var(--wp--preset--color--gold));'
		);
		expect( button ).toContain(
			'min-height: var(--wp--custom--button-min-height);'
		);
		expect( button ).not.toMatch( /--ucf-c-|--ucf-custom-|--ucf-font-/ );
	} );

	// WHY: an editor's own colors win, as they do on core's own styles.
	test( 'leaves an editor’s own colors alone', () => {
		expect( button ).toMatch(
			/is-style-outline > \.wp-block-button__link:not\(\.has-text-color\) \{\n\tborder-color: currentcolor;\n\tcolor:/
		);
		expect( button ).not.toMatch(
			/:not\(\.has-text-color\) \{[^}]*background-color/
		);
	} );

	// WHY: core's Width control sets the link's width; the primitive's fit-content would win.
	test( 'leaves width to core', () => {
		expect( button ).not.toContain( 'fit-content' );
	} );
} );

describe( 'a rule the map doesn’t know fails the build', () => {
	test( 'a selector', () => {
		expect( () =>
			coreCss( tokens, 'button', '.ucf-c-button > span { color: red; }' )
		).toThrow( /no core selector/ );
	} );

	test( 'an attribute', () => {
		expect( () =>
			coreCss(
				tokens,
				'button',
				'.ucf-c-button[data-tone="dark"] { color: red; }'
			)
		).toThrow( /no core class for \[data-tone="dark"\]/ );
	} );

	test( 'a token tokens.json doesn’t have', () => {
		expect( () =>
			coreCss(
				tokens,
				'button',
				'.ucf-c-button { min-height: var(--ucf-custom-nope); }'
			)
		).toThrow();
	} );

	test( 'an @-rule other than @media', () => {
		expect( () =>
			coreCss(
				tokens,
				'list',
				'@supports (display: grid) { .ucf-c-list { color: red; } }'
			)
		).toThrow( /@media only/ );
	} );

	test( 'a margin on the block it can’t split', () => {
		expect( () =>
			coreCss( tokens, 'list', '.ucf-c-list { margin: 1rem 0; }' )
		).toThrow( /write its sides apart/ );
	} );
} );

describe( 'the text primitives as core blocks', () => {
	const list = coreCss( tokens, 'list' );
	const table = coreCss( tokens, 'table' );

	test( 'maps every primitive, leaving none of our classes or attributes', () => {
		for ( const name of [
			'list',
			'table',
			'quote',
			'pullquote',
			'separator',
			'code',
		] ) {
			const css = coreCss( tokens, name );
			expect( css ).toContain( `.wp-block-${ name }` );
			expect( css ).not.toMatch( /ucf-c-|\[data-|--ucf-c-|--ucf-font-/ );
		}
	} );

	test( 'keeps what follows our class, and the element before it', () => {
		expect( list ).toContain( 'ol.wp-block-list > li::marker {' );
		expect( list ).toContain(
			'.wp-block-list.is-style-check > li::before {'
		);
		expect( table ).toContain(
			'.wp-block-table.wp-block-table.is-style-stripes:not(.has-background) tbody tr:nth-child(odd) {'
		);
		expect( table ).toContain(
			'.wp-block-table.wp-block-table.ucf-compare > table {'
		);
	} );

	test( 'carries a media query over', () => {
		expect( list ).toMatch(
			/@media \(min-width: 64rem\) \{\n\t\.wp-block-list\.is-style-definitions > li \{\n\t\tgrid-template-columns/
		);
	} );

	// WHY: in WordPress the layout spaces blocks; our margin reset would remove the space.
	test( 'drops a block’s own top and bottom margins, keeping its sides', () => {
		expect( list ).not.toMatch( /\.wp-block-list \{[^}]*margin-block/ );
		expect(
			coreCss( tokens, 'quote', '.ucf-c-quote { margin: 0; }' )
		).toContain( 'margin-inline: 0;' );
		// Inside the block, margins are the block's own.
		expect( list ).toMatch( /> li \+ li \{\n\tmargin-top:/ );
	} );

	// WHY: core's CSS for these blocks loads after the theme's, as specific as ours.
	test( 'outranks core’s own CSS where it competes, and not on List', () => {
		expect( table ).toContain( '.wp-block-table.wp-block-table th,' );
		expect( coreCss( tokens, 'quote' ) ).toContain(
			'.wp-block-quote.wp-block-quote > cite {'
		);
		expect( list ).not.toContain( '.wp-block-list.wp-block-list' );
	} );

	test( 'reads `surface` as the Light background', () => {
		expect( table ).toContain(
			'background-color: var(--ucf-surface, var(--wp--preset--color--white));'
		);
	} );
} );
