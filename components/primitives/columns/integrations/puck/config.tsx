/**
 * The Columns in Puck, from its port (integrations/puck/config.tsx): its props and a slot, which
 * renders as the grid, so each Column dropped in is a grid item.
 *
 * `config` as it ships names no other component. `withColumns()` is how a host uses it: only
 * Columns go in, a new one starts with two, and picking a distribution adds empty Columns up to
 * its count. WHY opt-in: those name the Column by the key the host registered it under, which the
 * library can't know (as withTemplate() does).
 */
import { puckConfig } from '@/integrations/puck/config';
import type { PuckComponentConfig } from '@/integrations/puck/types';
import Columns from '../../Columns.tsx';

const { config, withTemplate } = puckConfig( Columns );

type Stored = typeof config.defaultProps;
type Item = { type: string; props: { id?: string; blocks: [] } };

/**
 * The Columns with its Columns managed, as core Columns and P1's are: only Columns go in, a new
 * one starts with two, and picking a distribution adds empty Columns up to its count.
 * FIX: dropping a Column into a full row was the only way to add one. When the row had no empty
 * space (Four, two to a row on a narrow canvas), every drop landed inside a Column instead.
 * WHY it never removes a Column: content would go with it. Extra Columns start a new row;
 * delete one in Puck.
 *
 * @param column The key the host registered the Column under.
 */
const withColumns = ( column = 'Column' ): PuckComponentConfig< Stored > => {
	// WHY no id in the template: Puck gives each inserted item its own. One here would be
	// shared by every Columns placed.
	const empty = (): Item => ( { type: column, props: { blocks: [] } } );
	const start = withTemplate( [ empty(), empty() ] );
	return {
		...start,
		fields: {
			...start.fields,
			blocks: { type: 'slot', allow: [ column ] },
		} as PuckComponentConfig< Stored >[ 'fields' ],
		resolveData: ( { props }, { changed } ) => {
			const blocks = ( props.blocks ?? [] ) as unknown as Item[];
			// `1:1:1` names three columns.
			const count = String( props.distribution ).split( ':' ).length;
			if ( ! changed.distribution || blocks.length >= count ) {
				return { props };
			}
			// UPSTREAM: an item added here needs its own id, as Puck's are: `{type}-{uuid}`.
			const added = Array.from(
				{ length: count - blocks.length },
				() => ( {
					type: column,
					props: {
						id: `${ column }-${ crypto.randomUUID() }`,
						blocks: [],
					},
				} )
			);
			return {
				props: {
					...props,
					blocks: [
						...blocks,
						...added,
					] as unknown as Stored[ 'blocks' ],
				},
			};
		},
	};
};

export default config;
export { withTemplate, withColumns };
