// @vitest-environment happy-dom
/**
 * CONTEXT: checks that a component's WordPress block and its Puck config stay in step, so a
 * component works the same in both.
 *
 *   - Both hosts exist: every component has a Puck config and a block. And it has stories,
 *     which is where its accessibility is checked.
 *   - Same props: the block's attributes, the Puck fields and the Puck defaults name the same
 *     props (less a Puck slot, which WordPress keeps as inner blocks, and WORDPRESS_ONLY).
 *     Content stored by one host then loads in the other unchanged.
 *   - Same markup: for a static (content) block, what WordPress saves and what Puck renders
 *     from the same props are the same HTML, for every choice of every select and radio
 *     field, apart from the classes WordPress adds for the block.
 *
 * Interactive blocks are left out of the markup check: WordPress renders them with render.php
 * and mounts the component in the browser, so there is no saved markup to compare.
 */
import { getSaveContent } from '@wordpress/blocks';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';

import type { PuckComponentConfig } from './puck.ts';

import.meta.glob( '../*/hosts/wp/index.tsx', { eager: true } );

type BlockJson = {
	name: string;
	render?: string;
	attributes: Record< string, unknown >;
};

const blockJsons = import.meta.glob< BlockJson >( '../*/hosts/wp/block.json', {
	eager: true,
	import: 'default',
} );
const puckConfigs = import.meta.glob<
	PuckComponentConfig< Record< string, string > >
>( '../*/hosts/puck/config.tsx', { eager: true, import: 'default' } );
const examples = import.meta.glob< Record< string, string > >(
	'../*/example.json',
	{ eager: true, import: 'default' }
);

// `../stat/hosts/wp/block.json` → `stat`.
const componentOf = ( file: string ) => file.split( '/' )[ 1 ] ?? file;

// The file every component must have, or a clear failure naming it.
function need< T >( value: T | undefined, file: string ): T {
	if ( value === undefined ) {
		throw new Error( `missing ${ file }` );
	}
	return value;
}
/**
 * WordPress's own layout attribute, which Puck has no counterpart for: the Section sets
 * `align: full` so it spans the page in a theme's constrained layout.
 */
const WORDPRESS_ONLY = new Set( [ 'align' ] );

// Every component: each folder with a core the package exports.
const components = Object.keys( import.meta.glob( '../*/index.ts' ) )
	.map( componentOf )
	.sort();
const withBlock = Object.keys( blockJsons ).map( componentOf ).sort();
const withPuck = Object.keys( puckConfigs ).map( componentOf ).sort();
const withStories = Object.keys( import.meta.glob( '../*/*.stories.tsx' ) )
	.map( componentOf )
	.sort();

test( 'finds every component', () => {
	expect( components ).toEqual( [ 'degree-finder', 'section', 'stat' ] );
} );

// WHY: the accessibility checks run against stories (`npm run test:stories`), so a component
// with none is never checked on any composition or width.
test( 'every component has stories', () => {
	expect( withStories ).toEqual( components );
} );

test( 'every component has a Puck config', () => {
	expect( withPuck ).toEqual( components );
} );

test( 'every component has a WordPress block', () => {
	expect( withBlock ).toEqual( components );
} );

describe.each( withBlock )( '%s', ( component ) => {
	const json = need(
		blockJsons[ `../${ component }/hosts/wp/block.json` ],
		`${ component }/hosts/wp/block.json`
	);
	const puck = puckConfigs[ `../${ component }/hosts/puck/config.tsx` ];
	const sorted = ( object: object = {} ) => Object.keys( object ).sort();
	// WHY slots left out: a Puck slot holds the components placed inside, which WordPress keeps
	// as inner blocks rather than as an attribute. blocks.test.tsx checks those round-trip.
	const slots = new Set(
		Object.entries( puck?.fields ?? {} )
			.filter( ( [ , field ] ) => field.type === 'slot' )
			.map( ( [ key ] ) => key )
	);
	const puckProps = ( object: object = {} ) =>
		sorted( object ).filter( ( key ) => ! slots.has( key ) );
	const blockProps = sorted( json.attributes ).filter(
		( key ) => ! WORDPRESS_ONLY.has( key )
	);

	test( 'the block attributes and the Puck fields name the same props', () => {
		expect( puckProps( puck?.fields ) ).toEqual( blockProps );
	} );

	test( 'the Puck defaults cover every prop', () => {
		expect( puckProps( puck?.defaultProps ) ).toEqual( blockProps );
	} );

	const example = examples[ `../${ component }/example.json` ];

	// The example, then the example with each choice of each select or radio field in turn.
	// WHY every choice: a host that ignores one value (a width it never passes on) still
	// matches on the example's own value.
	const propSets = (): [ string, Record< string, string > ][] => {
		const base = need( example, `${ component }/example.json` );
		const choices = Object.entries( puck?.fields ?? {} ).flatMap(
			( [ key, field ] ) =>
				'options' in field
					? field.options.map(
							(
								option
							): [ string, Record< string, string > ] => [
								`${ key }: ${ option.value || '(empty)' }`,
								{ ...base, [ key ]: option.value },
							]
						)
					: []
		);
		return [ [ 'example', base ], ...choices ];
	};

	test.runIf( ! json.render && example !== undefined )(
		'WordPress saves the same markup Puck renders, for every choice',
		() => {
			const config = need( puck, `${ component }/hosts/puck/config.tsx` );
			// What useBlockProps.save() adds: the block's own class, wp-block-{namespace}-{name},
			// and `alignfull` for a block that spans the page.
			const blockClass = `wp-block-${ json.name.replace( '/', '-' ) }`;
			// UPSTREAM: Puck hands `render` a component for each slot; with nothing placed in
			// it, the WordPress side has no inner blocks either.
			const Slot = ( slotProps: object ) => <div { ...slotProps } />;

			for ( const [ name, props ] of propSets() ) {
				const saved = getSaveContent( json.name, props )
					.replace( / ?alignfull/, '' )
					.replace( `${ blockClass } `, '' )
					.replace( ` class="${ blockClass }"`, '' );
				const rendered = renderToStaticMarkup(
					config.render( {
						...props,
						...Object.fromEntries(
							[ ...slots ].map( ( key ) => [ key, Slot ] )
						),
					} as never )
				);

				// FIX: guards against an empty save, which would match an empty render.
				expect( saved ).toMatch(
					new RegExp( `ucf-(c-)?${ component }\\b` )
				);
				// The choice's name in the compared value, so a failure says which one broke.
				expect( { choice: name, markup: saved } ).toEqual( {
					choice: name,
					markup: rendered,
				} );
			}
		}
	);
} );
