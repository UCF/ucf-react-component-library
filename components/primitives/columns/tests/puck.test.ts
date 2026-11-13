/**
 * The Columns and Column in Puck, as a host uses them (withColumns(), inColumns()): picking a
 * distribution adds the Columns it names, and a Column can't go in a Column.
 */
import { describe, expect, it } from 'vitest';

import { inColumns } from '@/components/primitives/column/integrations/puck/config';
import { withColumns } from '../integrations/puck/config.tsx';

const columns = withColumns( 'Column' );

type Item = { type: string; props: { id?: string } };
const column = ( id: string ): Item => ( {
	type: 'Column',
	props: { id, blocks: [] } as never,
} );

/**
 * The Columns after a field changes.
 *
 * @param blocks       The Columns it holds.
 * @param distribution The distribution picked.
 * @param changed      Which field changed.
 */
const resolve = (
	blocks: Item[],
	distribution: string,
	changed: Record< string, boolean > = { distribution: true }
) =>
	columns.resolveData!(
		{
			props: {
				...columns.defaultProps,
				distribution,
				blocks,
			} as typeof columns.defaultProps,
		},
		{ changed }
	).props.blocks as unknown as Item[];

describe( 'withColumns()', () => {
	it( 'starts with two Columns, and takes only Columns', () => {
		expect(
			( columns.defaultProps.blocks as unknown as Item[] ).map(
				( item ) => item.type
			)
		).toEqual( [ 'Column', 'Column' ] );
		expect( columns.fields.blocks ).toEqual( {
			type: 'slot',
			allow: [ 'Column' ],
		} );
	} );

	it( 'adds empty Columns up to the count the distribution names', () => {
		const blocks = resolve( [ column( 'a' ), column( 'b' ) ], '1:1:1:1' );
		expect( blocks.map( ( item ) => item.type ) ).toEqual( [
			'Column',
			'Column',
			'Column',
			'Column',
		] );
		// The two already there come first, unchanged; the two added have ids of their own.
		expect( blocks.slice( 0, 2 ).map( ( item ) => item.props.id ) ).toEqual(
			[ 'a', 'b' ]
		);
		const added = blocks.slice( 2 ).map( ( item ) => item.props.id );
		expect( added[ 0 ] ).toMatch( /^Column-/ );
		expect( new Set( added ).size ).toBe( 2 );
	} );

	// WHY: a Column's content would go with it.
	it( 'never removes a Column', () => {
		const four = [ 'a', 'b', 'c', 'd' ].map( column );
		expect( resolve( four, '1:1' ) ).toEqual( four );
	} );

	it( 'changes nothing when another field changed', () => {
		const two = [ column( 'a' ), column( 'b' ) ];
		expect( resolve( two, '1:1:1:1', { gap: true } ) ).toEqual( two );
	} );
} );

describe( 'inColumns()', () => {
	it( 'holds anything but another Column', () => {
		expect( inColumns( 'Column' ).fields.blocks ).toEqual( {
			type: 'slot',
			disallow: [ 'Column' ],
		} );
	} );
} );
