/**
 * The Paragraph's props, in the order Puck shows them. Its Puck fields, its story controls and their
 * defaults are built from these (integrations/schema/props.ts says how).
 *
 * SPEC: named after core Paragraph's attributes, so an editor who knows core's knows ours
 * (docs/architecture.md, "Primitives").
 */
import type { PropDefinitions, PropsOf } from '@/integrations/schema/props';

export const PROPS = {
	/** What it says. */
	content: {
		type: 'text',
		label: 'Text',
		panel: 'Paragraph',
		control: 'multiline',
		default:
			'Explore more than 100 bachelor’s programs, taught by faculty who put undergraduate teaching first.',
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
} as const satisfies PropDefinitions;

/** The props above, typed. */
export type ParagraphEditableProps = PropsOf< typeof PROPS >;
