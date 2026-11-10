/**
 * The Table's props, in the order Puck shows them. Its Puck fields, its story controls and their
 * defaults are built from these (integrations/schema/props.ts says how).
 *
 * SPEC: core Table's caption and Stripes style, and the theme's comparison table, so an editor who
 * knows core's knows ours (docs/architecture.md, "Primitives").
 */
import type { PropDefinitions, PropsOf } from '@/integrations/schema/props';

export const PROPS = {
	/**
	 * Hairline rows under a heavy header rule (default); alternate rows banded; or a comparison
	 * of two to four options, its first column held while the table scrolls on a phone.
	 */
	variant: {
		type: 'choice',
		label: 'Style',
		panel: 'Table',
		control: 'radio',
		options: [
			{ value: 'default', label: 'Default' },
			{ value: 'stripes', label: 'Stripes' },
			{ value: 'compare', label: 'Compare' },
		],
		default: 'default',
	},
	/** What the table shows, as its title; or '' for none. */
	caption: {
		type: 'text',
		label: 'Caption',
		panel: 'Table',
		default: 'Application deadlines',
	},
	/**
	 * One row per line, its cells separated by `|`. The first line is the header.
	 */
	rows: {
		type: 'text',
		label: 'Rows',
		help: 'One row per line, cells separated by |. The first line is the header.',
		panel: 'Table',
		control: 'multiline',
		default:
			'Term | Classes start | Apply by\nFall | August 24 | May 1\nSpring | January 6 | November 1\nSummer | May 11 | March 1',
	},
} as const satisfies PropDefinitions;

/** The props above, typed. */
export type TableEditableProps = PropsOf< typeof PROPS >;
