// @vitest-environment happy-dom
/**
 * The card designs (variations.ts) reach WordPress whole, and use only the Card's own
 * settings. Puck's side is checked in components/_config/puck.test.tsx.
 */
import { getBlockVariations } from '@wordpress/blocks';
import { describe, expect, it } from 'vitest';

import '../adapters/wp/index.tsx';
import { CHOICES, type ChoiceKey } from '../options.ts';
import { VARIATIONS } from '../variations.ts';

const registered = () =>
	getBlockVariations( 'ucf-content/card', 'inserter' ) ?? [];

it( 'registers every design as a variation, the story card as the default', () => {
	expect( registered().map( ( variation ) => variation.name ) ).toEqual(
		VARIATIONS.map( ( variation ) => variation.name )
	);
	expect(
		registered().find( ( variation ) => variation.isDefault )?.name
	).toBe( 'story' );
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

	// WHY: in the inserter, a design's icon and the block's name in its title say which block
	// it is and how it looks (adapters/wp/index.tsx).
	it( 'has its own icon, and a title that starts with the block’s name', () => {
		const inWordPress = registered().find(
			( item ) => item.name === variation.name
		);
		expect( inWordPress?.icon ).toBeTruthy();
		expect( inWordPress?.title ).toMatch( /^Card: / );
	} );

	// WHY: a value that isn't a choice saves, but no rule matches it and the sidebar shows
	// nothing selected.
	it( 'sets only values the Card offers', () => {
		for ( const [ key, value ] of Object.entries( variation.settings ) ) {
			const options = CHOICES[ key as ChoiceKey ]?.options ?? [];
			expect( [
				key,
				options.some( ( o ) => o.value === value ),
			] ).toEqual( [ key, true ] );
		}
	} );
} );
