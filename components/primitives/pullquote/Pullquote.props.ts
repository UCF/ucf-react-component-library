/**
 * The Pullquote's props, in the order Puck shows them. Its Puck fields, its story controls and
 * their defaults are built from these (integrations/schema/props.ts says how).
 *
 * SPEC: core Pullquote's `value` and `citation`, so an editor who knows core's knows ours
 * (docs/architecture.md, "Primitives").
 */
import type { PropDefinitions, PropsOf } from '@/integrations/schema/props';

export const PROPS = {
	/**
	 * The line to pull out, without quotation marks: the theme adds them. A blank line starts a
	 * new paragraph.
	 */
	value: {
		type: 'text',
		label: 'Quote',
		panel: 'Pullquote',
		control: 'multiline',
		default: 'Florida’s largest university, by design.',
	},
	/** Who said it, or '' for none. */
	citation: {
		type: 'text',
		label: 'Citation',
		panel: 'Pullquote',
		default: 'UCF Admissions',
	},
} as const satisfies PropDefinitions;

/** The props above, typed. */
export type PullquoteEditableProps = PropsOf< typeof PROPS >;
