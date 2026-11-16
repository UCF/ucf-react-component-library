/**
 * CONTEXT: the Section Nav's props, in editor order. Each key is a saved block attribute.
 * SYNC: block.json (parity.test.tsx checks). Renaming one needs a block deprecation.
 */
import type { PropDefinitions, PropsOf } from '@/integrations/schema/props';

export const PROPS = {
	/** `{ label, href }` in order. New ones fill from Sections with an HTML anchor. */
	links: {
		type: 'links',
		label: 'Links',
		help: 'Each Section with an HTML anchor (Advanced) can be linked as #anchor.',
		panel: 'Section Nav',
		default: [],
	},
	/**
	 * SPEC: the Section Menus `layout`: default (left) or `justify-between` (spread).
	 * WHY not named `layout`: WordPress reserves that attribute.
	 */
	linkLayout: {
		type: 'choice',
		label: 'Layout',
		panel: 'Section Nav',
		control: 'radio',
		options: [
			{ value: 'left', label: 'Left' },
			{ value: 'spread', label: 'Spread across' },
		],
		default: 'left',
	},
} as const satisfies PropDefinitions;

/** The props above, typed. */
export type SectionNavEditableProps = PropsOf< typeof PROPS >;
