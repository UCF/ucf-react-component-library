/**
 * The Heading's props, in the order Puck shows them. Its Puck fields, its story controls and their
 * defaults are built from these (integrations/schema/props.ts says how).
 *
 * SPEC: named after core Heading's attributes, so an editor who knows core's knows ours
 * (docs/architecture.md, "Primitives").
 * WHY the level is a string: a choice's values are strings, as Puck's options are. The Heading
 * takes a number; each host converts.
 */
import type { PropDefinitions, PropsOf } from '@/integrations/schema/props';

export const PROPS = {
	/** What it says. */
	content: {
		type: 'text',
		label: 'Text',
		panel: 'Heading',
		default: 'Heading',
	},
	/**
	 * Core's "Additional CSS class(es)". A component's template names a part with it (the Highlight's statement, the Hero's title), the
	 * same class WordPress's template sets, so the part looks the same in both hosts.
	 */
	className: {
		type: 'text',
		label: 'CSS class',
		panel: 'Advanced',
		default: '',
	},
	/** h1 to h6: where it sits in the page's outline, not how big it looks. */
	level: {
		type: 'choice',
		label: 'Level',
		panel: 'Heading',
		control: 'select',
		options: [ '1', '2', '3', '4', '5', '6' ].map( ( value ) => ( {
			value,
			label: `H${ value }`,
		} ) ) as readonly {
			value: '1' | '2' | '3' | '4' | '5' | '6';
			label: string;
		}[],
		default: '2',
	},
} as const satisfies PropDefinitions;

/** The props above, typed. */
export type HeadingEditableProps = PropsOf< typeof PROPS >;
