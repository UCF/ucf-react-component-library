/**
 * scripts/elements.mjs: tokens/elements.json as theme.json `styles` (the theme) and as
 * elements.css (React hosts).
 */
import { describe, expect, test } from 'vitest';

import { elementsCss, loadElements, themeStyles } from './elements.mjs';
import { loadTokens } from './tokens.mjs';

const tokens = loadTokens();
const elements = loadElements();

describe( 'theme.json styles', () => {
	const styles = themeStyles( tokens );
	const text = JSON.stringify( styles );

	test( 'resolves every reference to the theme’s presets', () => {
		expect( text ).not.toMatch( /\{[a-z-]+\.[a-z0-9-]+\}/ );
		expect( styles.elements.h2.typography.fontSize ).toBe(
			'var(--wp--preset--font-size--heading-2)'
		);
	} );

	// WHY the Light composition's color: outside any section the theme's page is Light, and
	// theme.json `styles.elements.link` is written this way there.
	test( 'gives a role the Light composition’s color as its fallback', () => {
		expect( styles.elements.link.color.text ).toBe(
			'var(--ucf-link, var(--wp--preset--color--horizon-deep))'
		);
		expect( styles.elements.link[ ':hover' ].color.text ).toBe(
			'var(--ucf-link-hover, var(--wp--preset--color--horizon-deeper))'
		);
	} );

	// FIX: theme.json rejects keys it doesn't know, and `css` is for React hosts only.
	test( 'leaves out what theme.json can’t hold', () => {
		expect( text ).not.toContain( '"css"' );
		expect( text ).not.toContain( '$description' );
		expect( text ).not.toContain( 'thickness' );
	} );

	test( 'has every element elements.json has', () => {
		expect( Object.keys( styles.elements ) ).toEqual(
			Object.keys( elements.elements )
		);
	} );
} );

describe( 'elements.css', () => {
	const css = elementsCss( tokens );

	test( 'reads tokens and roles by their --ucf- names', () => {
		expect( css ).not.toMatch( /\{[a-z-]+\.[a-z0-9-]+\}|--wp--/ );
		expect( css ).toContain( 'font-size: var(--ucf-font-size-heading-2);' );
	} );

	// The link underline is a token, read by the theme's SCSS as well (tokens.json `custom`).
	test( 'underlines links from the link tokens', () => {
		expect( css ).toContain(
			'text-decoration-thickness: var(--ucf-custom-link-underline);'
		);
		expect( css ).toContain(
			'text-underline-offset: var(--ucf-custom-link-underline-offset);'
		);
		expect( css ).toContain(
			'text-decoration-thickness: var(--ucf-custom-link-underline-hover);'
		);
	} );

	test( 'scopes every rule to a Section or .ucf-elements, at zero specificity', () => {
		const selectors = css
			.replace( /\/\*[\s\S]*?\*\//g, '' )
			.split( '}' )
			.map( ( rule ) => rule.split( '{' )[ 0 ].trim() )
			.filter( Boolean );
		expect( selectors.length ).toBeGreaterThan( 10 );
		for ( const selector of selectors ) {
			expect( selector ).toMatch(
				/^:where\(\.ucf-section, \.ucf-elements\)/
			);
		}
	} );
} );

describe( 'a mistake in elements.json fails the build', () => {
	const broken = ( change ) => {
		const copy = structuredClone( elements );
		change( copy );
		return copy;
	};

	test( 'a reference to no token', () => {
		const copy = broken( ( e ) => {
			e.elements.h2.typography.fontSize = '{font-size.heading-9}';
		} );
		expect( () => themeStyles( tokens, copy ) ).toThrow( /elements\.h2/ );
		expect( () => elementsCss( tokens, copy ) ).toThrow( /elements\.h2/ );
	} );

	test( 'a role no treatment has', () => {
		const copy = broken( ( e ) => {
			e.elements.link.color.text = '{role.linky}';
		} );
		expect( () => themeStyles( tokens, copy ) ).toThrow( /role\.linky/ );
	} );

	test( 'a theme.json key with no CSS property', () => {
		const copy = broken( ( e ) => {
			e.elements.h2.typography.fontStretch = 'condensed';
		} );
		expect( () => elementsCss( tokens, copy ) ).toThrow( /fontStretch/ );
	} );
} );
