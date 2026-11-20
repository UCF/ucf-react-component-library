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
		// SPEC: a new block starts with the block theme pattern's first three, addresses blank.
		default: [
			{
				label: 'Can I get in?',
				description:
					'Requirements, deadlines and the admitted class profile.',
				href: '',
			},
			{
				label: 'What will it cost?',
				description: 'Tuition, aid and the net price calculator.',
				href: '',
			},
			{
				label: 'What do graduates do?',
				description:
					'Outcomes by program, from the people who track them.',
				href: '',
			},
		],
	},
} as const satisfies PropDefinitions;

/** The props above, typed. */
export type QuickLinksEditableProps = PropsOf< typeof PROPS >;
