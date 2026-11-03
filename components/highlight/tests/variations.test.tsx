// @vitest-environment happy-dom
/**
 * The highlight designs (variations.ts) reach WordPress whole, and use only the Highlight's own
 * settings. Puck's side is checked in components/_config/puck.test.tsx.
 */
import { getBlockVariations } from '@wordpress/blocks';
import { describe, expect, it } from 'vitest';

import '../adapters/wp/index.tsx';
import { CHOICES, type ChoiceKey } from '../options.ts';
import { VARIATIONS } from '../variations.ts';

const registered = () =>
	getBlockVariations( 'ucf-content/highlight', 'inserter' ) ?? [];

it( 'registers every design as a variation, the statement as the default', () => {
	expect( registered().map( ( variation ) => variation.name ) ).toEqual(
		VARIATIONS.map( ( variation ) => variation.name )
	);
	expect(
		registered().find( ( variation ) => variation.isDefault )?.name
	).toBe( 'statement' );
} );

describe.each( VARIATIONS )( 'the $name design', ( variation ) => {
	it( 'starts with a block for each of its parts', () => {
		const inWordPress = registered().find(
			( item ) => item.name === variation.name
		);
		expect( inWordPress?.innerBlocks ).toHaveLength(
			variation.content.length
		);
	} );

	// WHY: a value that isn't a choice saves, but no rule matches it and the sidebar shows
	// nothing selected.
	it( 'sets only values the Highlight offers', () => {
		for ( const [ key, value ] of Object.entries( variation.settings ) ) {
			const options = CHOICES[ key as ChoiceKey ]?.options ?? [];
			expect( [
				key,
				options.some( ( o ) => o.value === value ),
			] ).toEqual( [ key, true ] );
		}
	} );
} );
