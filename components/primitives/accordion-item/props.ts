/**
 * The Accordion Item's props, in the order Puck shows them. Its Puck fields, its story controls
 * and their defaults are built from these (core/hosts/read-props.ts says how).
 *
 * SPEC: named after core Accordion Heading's attributes (`title`, `level`), so an editor who
 * knows core's knows ours (docs/architecture.md, "Primitives").
 * WHY the level is a string: a choice's values are strings, as Puck's options are.
 */
import type { PropDefinitions, PropsOf } from '@/core/hosts/prop-definitions';

export const PROPS = {
	/** The question: the button that opens the answer. */
	title: {
		type: 'text',
		label: 'Question',
		panel: 'Accordion Item',
		default: 'Question',
	},
	/** h2 to h6: where the question sits in the page's outline, not how big it looks. */
	level: {
		type: 'choice',
		label: 'Heading level',
		panel: 'Accordion Item',
		control: 'select',
		options: [ '2', '3', '4', '5', '6' ].map( ( value ) => ( {
			value,
			label: `H${ value }`,
		} ) ) as readonly {
			value: '2' | '3' | '4' | '5' | '6';
			label: string;
		}[],
		// SPEC: core Accordion's default heading level.
		default: '3',
	},
} as const satisfies PropDefinitions;

/** The props above, typed. */
export type AccordionItemEditableProps = PropsOf< typeof PROPS >;
