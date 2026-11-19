/**
 * Step 7 · every component · its package entry exports what a site needs to use it without a CMS.
 *
 * `{name}/index.ts`, `@ucf/components/{name}`: the component, and its PARTS and PRESETS when it
 * has them (docs/architecture.md, "What a component exports").
 */
import { describe, expect, it } from 'vitest';

const entries = import.meta.glob< Record< string, unknown > >(
	'../../../components/*/*/index.ts',
	{ eager: true }
);
const files = Object.keys(
	import.meta.glob( '../../../components/*/*/frame/{parts,presets}.ts' )
);

// FIX: a glob that matches nothing skips every parts and presets check below.
it( 'finds the frames’ parts and presets', () => {
	expect( files.length ).toBeGreaterThan( 0 );
} );

// `../../../components/content/card/index.ts` → `card`.
const componentOf = ( file: string ) => file.split( '/' )[ 5 ] ?? file;

// `degree-finder` → `DegreeFinder` and `DEGREE_FINDER`.
const pascal = ( name: string ) =>
	name.replace( /(^|-)(\w)/g, ( _, __, letter: string ) =>
		letter.toUpperCase()
	);
const constant = ( name: string ) => name.toUpperCase().replace( /-/g, '_' );

describe.each(
	Object.entries( entries ).map( ( [ file, module ] ) => [
		componentOf( file ),
		module,
	] )
)( '%s', ( component, module ) => {
	const has = ( suffix: string ) =>
		files.some(
			( file ) =>
				componentOf( file ) === component &&
				file.endsWith( `/frame/${ suffix }.ts` )
		);

	it( 'exports the component by its name', () => {
		expect( typeof module[ pascal( component ) ] ).toBe( 'function' );
	} );

	it.runIf( has( 'parts' ) )( 'exports its parts', () => {
		expect( module[ `${ constant( component ) }_PARTS` ] ).toBeTypeOf(
			'object'
		);
	} );

	it.runIf( has( 'presets' ) )( 'exports its presets', () => {
		expect(
			Array.isArray( module[ `${ constant( component ) }_PRESETS` ] )
		).toBe( true );
	} );
} );
