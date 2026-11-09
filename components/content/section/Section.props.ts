/**
 * The Section's props, in the order editors see them. Each key is a saved block attribute.
 * SYNC: block.json's attributes; integrations/tests/parity.test.tsx checks. Renaming one needs a
 * block deprecation.
 */
import type {
	PropDefinitions,
	PropsOf,
} from '../../../integrations/schema/props.ts';
import { COMPOSITIONS } from '../../../integrations/schema/compositions.ts';

export const PROPS = {
	/** The band's background, and so the colors of everything inside it. */
	composition: {
		type: 'choice',
		label: 'Composition',
		help: 'The background, and so the colors of everything inside.',
		panel: 'Section',
		control: 'select',
		options: COMPOSITIONS,
		default: 'light',
	},
	/**
	 * How wide the content runs: the theme's wide layout (1240px, as most bands are), the reading
	 * width for a band of text (720px), or edge to edge.
	 */
	width: {
		type: 'choice',
		label: 'Content width',
		panel: 'Section',
		control: 'radio',
		options: [
			{ value: 'default', label: 'Default' },
			{ value: 'constrained', label: 'Constrained' },
			{ value: 'wide', label: 'Wide' },
		],
		default: 'default',
	},
	/**
	 * Space above and below, from the most to the least: `cozy` and `compact` for a band that
	 * continues the one above rather than starting a new subject.
	 */
	spacing: {
		type: 'choice',
		label: 'Spacing',
		panel: 'Section',
		control: 'radio',
		options: [
			{ value: 'default', label: 'Default' },
			{ value: 'cozy', label: 'Cozy' },
			{ value: 'compact', label: 'Compact' },
		],
		default: 'default',
	},
} as const satisfies PropDefinitions;

/** The props above, typed: `width` is `'default' | 'constrained' | 'wide'`, and so on. */
export type SectionEditableProps = PropsOf< typeof PROPS >;
