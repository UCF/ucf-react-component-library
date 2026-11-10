/**
 * The Highlight's props: every prop an editor sets, with its type, values, default, and field
 * (label, control, WordPress sidebar panel). Highlight.tsx takes its prop types and defaults
 * from here; WordPress's sidebar and block.json attributes, Puck's fields and defaults, and the
 * stories' controls are built from it (integrations/schema/props.ts says how).
 *
 * The content placed inside the Highlight is in Highlight.parts.ts; named combinations of both,
 * in Highlight.presets.ts. What each word means: docs/architecture.md, "A component's folder".
 *
 * SPEC: they combine into the UCF highlight designs (Highlight.presets.ts).
 * SYNC: each prop's key is a block attribute, saved in every post that uses the block.
 * Renaming one needs a block deprecation (docs/architecture.md, "Naming"). block.json lists
 * them too; integrations/tests/parity.test.tsx fails while the two differ.
 */
import type { PropDefinitions, PropsOf } from '@/integrations/schema/props.js';

export const PROPS = {
	/**
	 * The accent rule: across the top (`top`), down the left (`side`), both, as a bracket
	 * (`corner`), a short bar under the first part, centered (`divider`), or none.
	 */
	rule: {
		type: 'choice',
		label: 'Rule',
		panel: 'Highlight',
		control: 'select',
		options: [
			{ value: 'top', label: 'Across the top' },
			{ value: 'side', label: 'Down the side' },
			{ value: 'corner', label: 'Bracket (top and side)' },
			{ value: 'divider', label: 'Short bar under the first part' },
			{ value: 'none', label: 'None' },
		],
		default: 'top',
	},
	/** The content's alignment, across. */
	contentAlign: {
		type: 'choice',
		label: 'Align',
		panel: 'Highlight',
		control: 'radio',
		options: [
			{ value: 'start', label: 'Start' },
			{ value: 'center', label: 'Center' },
		],
		default: 'start',
	},
} as const satisfies PropDefinitions;

/**
 * The props the definitions describe, with their values. HighlightProps (Highlight.tsx) adds
 * what a host passes besides.
 */
export type HighlightEditableProps = PropsOf< typeof PROPS >;
