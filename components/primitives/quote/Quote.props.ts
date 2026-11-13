/**
 * The Quote's props, in the order Puck shows them. Its Puck fields, its story controls and their
 * defaults are built from these (integrations/schema/props.ts says how).
 *
 * SPEC: core Quote's `value` and `citation`, so an editor who knows core's knows ours
 * (docs/architecture.md, "Primitives").
 */
import type { PropDefinitions, PropsOf } from '@/integrations/schema/props';

export const PROPS = {
	/**
	 * What was said, without quotation marks: the theme adds them. A blank line starts a new
	 * paragraph.
	 */
	value: {
		type: 'text',
		label: 'Quote',
		panel: 'Quote',
		control: 'multiline',
		default: "Jim says everyone gets one. I'm on my fourth.",
	},
	/** Who said it, or '' for none. */
	citation: {
		type: 'text',
		label: 'Citation',
		panel: 'Quote',
		default: "Darren Johnson '22",
	},
} as const satisfies PropDefinitions;

/** The props above, typed. */
export type QuoteEditableProps = PropsOf< typeof PROPS >;
