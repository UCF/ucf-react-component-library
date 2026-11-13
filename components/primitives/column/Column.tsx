/**
 * The Column: one track of a Columns, holding anything. Why it's built this way:
 * docs/architecture.md, "Built with frame()", and Columns.tsx.
 */
import {
	frame,
	type FrameProps,
	type OwnProps,
	type PresetProps,
} from '@/integrations/react/frame';
import { PARTS } from './Column.parts.ts';
import { DEFAULT_PRESET, PRESETS } from './Column.presets.ts';
import { PROPS } from './Column.props.ts';

/** Everything the Column takes: its children, and a site's HTML attributes. */
export type ColumnProps = OwnProps< typeof PROPS > &
	PresetProps< typeof PARTS, typeof PRESETS >;

function ColumnMarkup( {
	children,
	className,
	area,
	...props
}: FrameProps< typeof PROPS > ) {
	return (
		<div
			{ ...props }
			className={ [ className, 'ucf-c-column' ]
				.filter( Boolean )
				.join( ' ' ) }
		>
			{ area(
				'content',
				{ className: 'ucf-c-column__content' },
				children
			) }
		</div>
	);
}

/**
 * One column of a Columns; anything goes inside:
 *
 *   <Column><h3>…</h3><p>…</p></Column>
 */
const Column = frame( ColumnMarkup, {
	// Who it is
	slug: 'column',
	title: 'Column',
	kind: 'primitive',

	// What it takes
	props: PROPS,
	parts: PARTS,
	presets: PRESETS,
	defaultPreset: DEFAULT_PRESET,

	// WordPress only: none. It has no block; WordPress editors place core Column.
	wpIcon: 'column',
} );

export default Column;
