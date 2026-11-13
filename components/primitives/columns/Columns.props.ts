/**
 * The Columns's props, in the order editors see them.
 *
 * SPEC: P1's Columns (distribution, gap, valign), so a layout moves between P1 and here unchanged.
 * WHY not core Columns' names (a width per column, verticalAlignment): a Columns is laid out on a
 * 12-column grid with five named distributions, not free widths, so every page lines up. In
 * WordPress, editors place core Columns, which the theme styles (docs/architecture.md,
 * "Primitives").
 */
import type { PropDefinitions, PropsOf } from '@/integrations/schema/props';

export const PROPS = {
	/**
	 * How the columns share the width, on a 12-column grid: halves (6 + 6), two-thirds and a
	 * third (8 + 4, either way round), thirds (4 + 4 + 4) or quarters (3 + 3 + 3 + 3). More
	 * columns than it names start a new row, in the same pattern.
	 */
	distribution: {
		type: 'choice',
		label: 'Columns',
		panel: 'Columns',
		control: 'select',
		options: [
			{ value: '1:1', label: 'Two, even' },
			{ value: '2:1', label: 'Two, left wider' },
			{ value: '1:2', label: 'Two, right wider' },
			{ value: '1:1:1', label: 'Three' },
			{ value: '1:1:1:1', label: 'Four' },
		],
		default: '1:1',
	},
	/** The space between columns, from the spacing tokens. */
	gap: {
		type: 'choice',
		label: 'Gap',
		panel: 'Columns',
		control: 'radio',
		options: [
			{ value: 'tight', label: 'Tight' },
			{ value: 'regular', label: 'Regular' },
			{ value: 'wide', label: 'Wide' },
		],
		default: 'regular',
	},
	/** How columns of different heights line up. */
	valign: {
		type: 'choice',
		label: 'Vertical alignment',
		panel: 'Columns',
		control: 'radio',
		options: [
			{ value: 'top', label: 'Top' },
			{ value: 'center', label: 'Center' },
			{ value: 'stretch', label: 'Stretch' },
		],
		default: 'top',
	},
} as const satisfies PropDefinitions;

/** The props above, typed: `distribution` is `'1:1' | '2:1' | …`, and so on. */
export type ColumnsEditableProps = PropsOf< typeof PROPS >;
