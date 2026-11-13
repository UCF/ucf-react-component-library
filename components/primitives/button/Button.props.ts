/**
 * The Button's props, in the order Puck shows them. Its Puck fields, its story controls and their
 * defaults are built from these (integrations/schema/props.ts says how).
 *
 * SPEC: named after core Button's attributes, so an editor who knows core's knows ours
 * (docs/architecture.md, "Primitives").
 */
import type { PropDefinitions, PropsOf } from '@/integrations/schema/props';

export const PROPS = {
	/** What it says. */
	text: {
		type: 'text',
		label: 'Text',
		panel: 'Button',
		default: 'Apply now',
	},
	/** Where it goes. */
	url: { type: 'text', label: 'Link', panel: 'Button', default: '#' },
	/** `_blank` to open in a new tab, as core stores it; anything else opens in the same tab. */
	linkTarget: {
		type: 'choice',
		label: 'Opens in',
		panel: 'Button',
		control: 'radio',
		options: [
			{ value: '', label: 'Same tab' },
			{ value: '_blank', label: 'New tab' },
		],
		default: '',
	},
	/**
	 * Fill for the main action, Outline for the second, Text for a link-weight action that must
	 * not compete. The first two are core's styles; Text is the UCF theme's.
	 */
	variant: {
		type: 'choice',
		label: 'Style',
		panel: 'Button',
		control: 'radio',
		options: [
			{ value: 'fill', label: 'Fill' },
			{ value: 'outline', label: 'Outline' },
			{ value: 'text', label: 'Text' },
		],
		default: 'fill',
	},
	/**
	 * `small` (44px) or `body` (60px), or none for the standard 52px. Named, and valued, as core's
	 * font-size attribute, which is how the theme sizes its buttons.
	 */
	fontSize: {
		type: 'choice',
		label: 'Size',
		panel: 'Button',
		control: 'radio',
		options: [
			{ value: '', label: 'Default' },
			{ value: 'small', label: 'Small' },
			{ value: 'body', label: 'Large' },
		],
		default: '',
	},
	/**
	 * Core's "Additional CSS class(es)". A component's template names a part with it (the Card's arrow link), the
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
export type ButtonEditableProps = PropsOf< typeof PROPS >;
