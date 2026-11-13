/**
 * The Separator's props, in the order Puck shows them. Its Puck fields, its story controls and
 * their defaults are built from these (integrations/schema/props.ts says how).
 *
 * SPEC: core Separator's three styles, so an editor who knows core's knows ours
 * (docs/architecture.md, "Primitives").
 */
import type { PropDefinitions, PropsOf } from '@/integrations/schema/props';

export const PROPS = {
	/** A short rule, centered (core's default); the full width; or three dots. */
	variant: {
		type: 'choice',
		label: 'Style',
		panel: 'Separator',
		control: 'radio',
		options: [
			{ value: 'default', label: 'Default' },
			{ value: 'wide', label: 'Wide line' },
			{ value: 'dots', label: 'Dots' },
		],
		default: 'default',
	},
} as const satisfies PropDefinitions;

/** The props above, typed. */
export type SeparatorEditableProps = PropsOf< typeof PROPS >;
