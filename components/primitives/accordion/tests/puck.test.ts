/**
 * The Accordion in Puck, as a host uses it (withItems()): only Accordion Items go in, and a new
 * one starts with two.
 */
import { describe, expect, it } from 'vitest';

import { withItems } from '../integrations/puck/config.tsx';

describe( 'withItems()', () => {
	it( 'starts with two Accordion Items, and takes only Accordion Items', () => {
		const accordion = withItems( 'Item' );
		expect(
			(
				accordion.defaultProps.blocks as unknown as { type: string }[]
			 ).map( ( item ) => item.type )
		).toEqual( [ 'Item', 'Item' ] );
		expect( accordion.fields.blocks ).toEqual( {
			type: 'slot',
			allow: [ 'Item' ],
		} );
	} );
} );
