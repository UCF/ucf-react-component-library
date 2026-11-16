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
	/**
	 * Where the links sit in the bar: packed at the left, or spread across it.
	 * SPEC: the Section Menus shortcode's `layout`: its default, and Main-Site-Theme's
	 * `justify-between` (the ucf.edu home page and /robotics/; /faculty/ is the default).
	 * WHY not `layout`: WordPress's own layout support stores an object under that name.
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
