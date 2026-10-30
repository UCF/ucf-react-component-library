// @vitest-environment happy-dom
/**
 * CONTEXT: checks that a component's WordPress block and its Puck config stay in step, so a
 * component works the same in both.
 *
 *   - Both hosts exist: a component with a block has a Puck config, and the reverse. And it
 *     has stories, which is where its accessibility is checked.
 *   - Same props: the block's attributes, the Puck fields and the Puck defaults name the same
 *     props. Content stored by one host then loads in the other unchanged.
 *   - Same markup: for a static (content) block, what WordPress saves and what Puck renders
 *     from the same props are the same HTML, apart from the class WordPress adds for the block.
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

const componentOf = ( file: string ) => file.split( '/' )[ 1 ];

// The file every component must have, or a clear failure naming it.
function need< T >( value: T | undefined, file: string ): T {
	if ( value === undefined ) {
		throw new Error( `missing ${ file }` );
	}
	return value;
}
const withBlock = Object.keys( blockJsons ).map( componentOf ).sort();
const withPuck = Object.keys( puckConfigs ).map( componentOf ).sort();

const withStories = Object.keys( import.meta.glob( '../*/*.stories.tsx' ) )
	.map( componentOf )
	.sort();

// WHY: the accessibility checks run against stories (`npm run test:stories`), so a component
// with none is never checked on any composition or width.
test( 'every component has stories', () => {
	expect( withStories ).toEqual( withBlock );
} );

test( 'every component has both a WordPress block and a Puck config', () => {
	expect( withBlock.length ).toBeGreaterThan( 0 );
	expect( withPuck ).toEqual( withBlock );
} );

describe.each( withBlock )( '%s', ( component ) => {
	const json = need(
		blockJsons[ `../${ component }/hosts/wp/block.json` ],
		`${ component }/hosts/wp/block.json`
	);
	const puck = puckConfigs[ `../${ component }/hosts/puck/config.tsx` ];
	const sorted = ( object: object = {} ) => Object.keys( object ).sort();

	test( 'the block attributes and the Puck fields name the same props', () => {
		expect( sorted( puck?.fields ) ).toEqual( sorted( json.attributes ) );
	} );

	test( 'the Puck defaults cover every prop', () => {
		expect( sorted( puck?.defaultProps ) ).toEqual(
			sorted( json.attributes )
		);
	} );

	const example = examples[ `../${ component }/example.json` ];
	test.runIf( ! json.render && example !== undefined )(
		'WordPress saves the same markup Puck renders',
		() => {
			const props = need( example, `${ component }/example.json` );
			const config = need( puck, `${ component }/hosts/puck/config.tsx` );
			// What useBlockProps.save() adds: the block's own class, wp-block-{namespace}-{name}.
			const blockClass = `wp-block-${ json.name.replace( '/', '-' ) }`;
			const saved = getSaveContent( json.name, props )
				.replace( `${ blockClass } `, '' )
				.replace( ` class="${ blockClass }"`, '' );

			// FIX: guards against an empty save, which would match an empty render.
			expect( saved ).toContain( `ucf-c-${ component }` );
			expect( saved ).toBe(
				renderToStaticMarkup( config.render( props ) )
			);
		}
	);
} );
