/**
 * The Section Nav's props, in the order editors see them. Each key is a saved block attribute.
 * SYNC: block.json's attributes; integrations/tests/parity.test.tsx checks. Renaming one needs a
 * block deprecation.
 */
import type { PropDefinitions, PropsOf } from '@/integrations/schema/props';

export const PROPS = {
	/**
	 * The links, in order: `{ label: 'Apply', href: '#apply' }`. In WordPress a new Section Nav
	 * fills them from the page's Sections that have an HTML anchor (integrations/wp/edit.tsx).
	 */
	links: {
		type: 'links',
		label: 'Links',
		help: 'Each Section with an HTML anchor (Advanced) can be linked as #anchor.',
		panel: 'Section Nav',
		default: [],
	},
} as const satisfies PropDefinitions;

/** The props above, typed. */
export type SectionNavEditableProps = PropsOf< typeof PROPS >;
