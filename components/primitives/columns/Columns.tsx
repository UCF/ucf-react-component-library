/**
 * The Columns: two to four Column primitives side by side on a 12-column grid, one under another
 * on a narrow screen. Why it's built this way: docs/architecture.md, "Built with frame()".
 *
 * WHY frame() for a primitive: its content area is where a host puts the Columns (a Puck slot),
 * and the slot must be the grid itself, so each Column is a grid item. A plain component can't
 * hand its grid element to the host.
 * WHY a Columns and a Column, as core has: WordPress editors place core Columns and Column in a
 * Section, and the two shapes match, so a layout moves between Puck and WordPress.
 */
import {
	frame,
	type FrameProps,
	type OwnProps,
	type PresetProps,
} from '@/integrations/react/frame';
import { PARTS } from './Columns.parts.ts';
import { DEFAULT_PRESET, PRESETS } from './Columns.presets.ts';
import { PROPS } from './Columns.props.ts';

/** Everything the Columns takes: its props, its Column children, and a site's HTML attributes. */
export type ColumnsProps = OwnProps< typeof PROPS > &
	PresetProps< typeof PARTS, typeof PRESETS >;

function ColumnsMarkup( {
	distribution = PROPS.distribution.default,
	gap = PROPS.gap.default,
	valign = PROPS.valign.default,
	children,
	className,
	area,
	...props
}: FrameProps< typeof PROPS > ) {
	return (
		<div
			{ ...props }
			className={ [ className, 'ucf-c-columns' ]
				.filter( Boolean )
				.join( ' ' ) }
			// WHY only when not the default: the base rules are the default.
			data-distribution={
				distribution === PROPS.distribution.default
					? undefined
					: distribution
			}
			data-gap={ gap === PROPS.gap.default ? undefined : gap }
			data-valign={ valign === PROPS.valign.default ? undefined : valign }
		>
			{ area(
				'content',
				{ className: 'ucf-c-columns__grid' },
				children
			) }
		</div>
	);
}

/**
 * Columns side by side on a 12-column grid; each child is a Column:
 *
 *   <Columns distribution="2:1">
 *     <Column>…</Column>
 *     <Column>…</Column>
 *   </Columns>
 *
 * Its props: Columns.props.ts.
 */
const Columns = frame( ColumnsMarkup, {
	// Who it is
	slug: 'columns',
	title: 'Columns',
	kind: 'primitive',

	// What it takes
	props: PROPS,
	parts: PARTS,
	presets: PRESETS,
	defaultPreset: DEFAULT_PRESET,

	// WordPress only: none. It has no block; WordPress editors place core Columns.
	wpIcon: 'columns',
} );

export default Columns;
