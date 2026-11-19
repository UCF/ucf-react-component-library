/**
 * CONTEXT: the Quick Links' props, in editor order. Each key is a saved block attribute.
 * SYNC: block.json (parity.test.tsx checks). Renaming one needs a block deprecation.
 */
import type { PropDefinitions, PropsOf } from '@/core/hosts/prop-definitions';

export const PROPS = {
	/** `{ label, description, href }` in order: the question, where it leads, its address. */
	tiles: {
		type: 'tiles',
		label: 'Links',
		help: 'Two to four, each a question a visitor arrives with.',
		panel: 'Quick Links',
		// SPEC: the design system's quick links: never more than four.
		max: 4,
		default: [],
	},
} as const satisfies PropDefinitions;

/** The props above, typed. */
export type QuickLinksEditableProps = PropsOf< typeof PROPS >;
