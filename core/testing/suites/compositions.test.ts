/**
 * Step 7 · every component · the compositions a component offers (core/design/compositions.ts) are
 * the ones tokens.json defines.
 */
import { expect, it } from 'vitest';

import tokens from '../../../tokens/tokens.json';
import { COMPOSITIONS } from '../../design/compositions.ts';

// SYNC: compositions.ts copies this list, because the package can't read tokens.json.
it( 'offers exactly the compositions tokens.json defines, with their names', () => {
	const fromTokens = Object.entries( tokens.composition )
		.filter( ( [ key ] ) => ! key.startsWith( '$' ) )
		.map( ( [ value, composition ] ) => ( {
			value,
			label: (
				composition as { $extensions: { 'edu.ucf': { name: string } } }
			 ).$extensions[ 'edu.ucf' ].name,
		} ) );

	expect( COMPOSITIONS ).toEqual( fromTokens );
} );
