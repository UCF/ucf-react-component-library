/**
 * CONTEXT: checks tokens/tokens.json's roles, for every host at once.
 *
 *   Contrast      every pair a composition promises is legible: each text role on the field
 *                 and on a raised panel, each label on its fill, each control edge on the field.
 *   Roles contract every `--ucf-*` role a component's CSS reads is one tokens.json defines.
 *
 * WHY here and not only in the theme: the theme's ratios are written in comments and measured
 * by its accessibility suite on rendered pages. With roles as data, each pair can be computed
 * before anything renders, and a value that moves is caught in every host.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

import {
	compositions,
	loadTokens,
	primitives,
	resolve,
	root,
	treatments,
} from './tokens.mjs';

const tokens = loadTokens();

// A11Y: WCAG 2.2 relative luminance and contrast ratio.
function luminance( hex ) {
	const match = /^#([0-9a-f]{6})$/i.exec( hex );
	if ( ! match ) {
		throw new Error(
			`Contrast needs an opaque #rrggbb color, not ${ hex }.`
		);
	}
	const [ r, g, b ] = [ 0, 2, 4 ].map( ( i ) => {
		const c = parseInt( match[ 1 ].slice( i, i + 2 ), 16 ) / 255;
		return c <= 0.04045 ? c / 12.92 : ( ( c + 0.055 ) / 1.055 ) ** 2.4;
	} );
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrast = ( a, b ) => {
	const [ hi, lo ] = [ luminance( a ), luminance( b ) ].sort(
		( x, y ) => y - x
	);
	return ( hi + 0.05 ) / ( lo + 0.05 );
};

/**
 * Every role's final color in one composition, with its overrides, plus `surface` and `text`.
 *
 * @param {Object} c A composition, from compositions() in tokens.mjs.
 */
function colorsOf( c ) {
	const t = treatments( tokens ).find( ( x ) => x.name === c.treatment );
	const colors = Object.fromEntries(
		t.roles.map( ( r ) => [
			r.role,
			resolve( tokens, r.reference, r.role ),
		] )
	);
	colors.surface = resolve( tokens, c.background, 'background' );
	colors.text = resolve( tokens, c.text, 'text' );
	for ( const [ role, reference ] of Object.entries( c.overrides ) ) {
		colors[ role ] = resolve( tokens, reference, role );
	}
	return colors;
}

// A11Y: 4.5:1 is WCAG 1.4.3 for body-size text; 3:1 is 1.4.11 for control boundaries and
// focus indicators.
const TEXT = [
	'text',
	'body',
	'lead',
	'heading',
	'muted',
	'link',
	'link-hover',
	'accent-text',
];
const PAIRS = [
	...TEXT.flatMap( ( role ) => [
		[ role, 'surface', 4.5 ],
		[ role, 'raised', 4.5 ],
	] ),
	// WHY not links on the field: a field holds controls and choices (cards, inputs, lists),
	// whose text is body, muted or accent-text. A Horizon Blue link sits on the section or a
	// panel, both checked above. Dark's gray-800 field would fail it at 3.21:1.
	...TEXT.filter( ( role ) => ! role.startsWith( 'link' ) ).map( ( role ) => [
		role,
		'field',
		4.5,
	] ),
	[ 'on-accent', 'accent', 4.5 ],
	[ 'button-text', 'button', 4.5 ],
	[ 'button-hover-text', 'button-hover', 4.5 ],
	[ 'button-outline', 'surface', 4.5 ],
	[ 'button-outline-on', 'button-outline', 4.5 ],
	// WHY on the soft ground, not the field: a notice paints its own, and that is what its
	// text sits on (the gold treatment's note in tokens.json).
	[ 'danger', 'danger-soft', 4.5 ],
	[ 'success', 'success-soft', 4.5 ],
	[ 'line-strong', 'surface', 3 ],
	[ 'line-strong', 'raised', 3 ],
	[ 'line-strong', 'field', 3 ],
	[ 'focus', 'surface', 3 ],
	// WHY on raised too: a focus ring can sit on a raised panel, as on the Degree Finder's band.
	[ 'focus', 'raised', 3 ],
	[ 'focus', 'field', 3 ],
	[ 'indicator', 'surface', 3 ],
];

describe( 'contrast', () => {
	const cases = compositions( tokens ).flatMap( ( c ) => {
		const colors = colorsOf( c );
		return PAIRS.map( ( [ fg, bg, min ] ) => ( {
			label: `${ c.name }: ${ fg } on ${ bg }`,
			ratio: contrast( colors[ fg ], colors[ bg ] ),
			min,
		} ) );
	} );

	test.each( cases )( '$label is at least $min:1', ( { ratio, min } ) => {
		expect( ratio ).toBeGreaterThanOrEqual( min );
	} );
} );

describe( 'bar', () => {
	// WHY: a bar uses another composition's roles, whose own pairs are checked above. The one
	// pair a bar adds is a disabled control's label (muted) on its fill (line), as on the
	// Degree Finder's disabled button.
	const byName = Object.fromEntries(
		compositions( tokens ).map( ( c ) => [ c.name, c ] )
	);
	const cases = compositions( tokens )
		.filter( ( c ) => c.bar )
		.map( ( c ) => {
			const bar = byName[ c.bar ];
			const colors = bar && colorsOf( bar );
			return {
				label: `${ c.name }'s bar (${ c.bar }): muted on line`,
				bar,
				ratio: colors && contrast( colors.muted, colors.line ),
			};
		} );

	test( 'every composition names a bar', () => {
		expect( cases ).toHaveLength( compositions( tokens ).length );
	} );

	test.each( cases )( '$label is at least 4.5:1', ( { bar, ratio } ) => {
		expect( bar ).toBeDefined();
		expect( ratio ).toBeGreaterThanOrEqual( 4.5 );
	} );
} );

describe( 'roles contract', () => {
	const primitiveNames = new Set(
		primitives( tokens ).map( ( t ) => `${ t.group }-${ t.slug }` )
	);
	const roles = [
		...treatments( tokens )[ 0 ].roles.map( ( r ) => r.role ),
		'surface',
	];
	// WHY the twins: build-tokens.mjs writes --ucf-panel-{role} and --ucf-bar-{role}
	// (a composition's rule), and --ucf-c-{role} and --ucf-c-bar-{role} (the component
	// layer) for every role.
	const roleNames = new Set( [
		...roles,
		...roles.map( ( role ) => `panel-${ role }` ),
		...roles.map( ( role ) => `c-${ role }` ),
		...roles.map( ( role ) => `bar-${ role }` ),
		...roles.map( ( role ) => `c-bar-${ role }` ),
	] );

	const cssFiles = readdirSync( path.join( root, 'components' ), {
		recursive: true,
	} )
		.filter( ( file ) => file.endsWith( '.css' ) )
		.map( ( file ) => path.join( 'components', file ) );

	const read = cssFiles.flatMap( ( file ) =>
		[
			...readFileSync( path.join( root, file ), 'utf8' ).matchAll(
				/var\(\s*--ucf-([a-z0-9-]+)/g
			),
		]
			.map( ( m ) => m[ 1 ] )
			.filter( ( name ) => ! primitiveNames.has( name ) )
			.map( ( name ) => ( { file, name } ) )
	);

	test( 'finds the roles components read', () => {
		// FIX: guards the test itself. A path or pattern that matches nothing would pass
		// every case below by checking none.
		expect( read.length ).toBeGreaterThan( 0 );
	} );

	test.each( read )(
		'$file reads --ucf-$name, a defined role',
		( { name } ) => {
			expect( roleNames ).toContain( name );
		}
	);
} );

describe( 'component layer', () => {
	// FIX: `--ucf-c-*` is set only on an element with `ucf-c` or `ucf-c-panel`. A component that
	// reads it without carrying either class gets unset values and loses its colors silently.
	const componentsDir = path.join( root, 'components' );
	const users = readdirSync( componentsDir ).filter( ( name ) => {
		const css = path.join( componentsDir, name, 'style.css' );
		try {
			return /var\(\s*--ucf-c-/.test( readFileSync( css, 'utf8' ) );
		} catch {
			return false;
		}
	} );

	test( 'finds the components that read it', () => {
		expect( users.length ).toBeGreaterThan( 0 );
	} );

	test.each( users )(
		'components/%s puts ucf-c or ucf-c-panel on an element',
		( name ) => {
			const source = readdirSync( path.join( componentsDir, name ), {
				recursive: true,
			} )
				.filter(
					( file ) =>
						file.endsWith( '.tsx' ) &&
						! file.includes( 'stories' ) &&
						! file.includes( 'test' ) &&
						! file.includes( 'hosts' )
				)
				.map( ( file ) =>
					readFileSync(
						path.join( componentsDir, name, file ),
						'utf8'
					)
				)
				.join( '\n' );
			expect( source ).toMatch( /['"`\s]ucf-c(-panel)?['"`\s]/ );
		}
	);
} );
