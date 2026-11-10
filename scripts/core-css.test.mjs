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

	test( 'an @-rule', () => {
		expect( () =>
			coreCss(
				tokens,
				'button',
				'@media (min-width: 1px) { .ucf-c-button { color: red; } }'
			)
		).toThrow( /@-rule/ );
	} );
} );
