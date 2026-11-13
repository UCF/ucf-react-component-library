/**
 * The List's props, in the order Puck shows them. Its Puck fields, its story controls and their
 * defaults are built from these (integrations/schema/props.ts says how).
 *
 * SPEC: core List's ordered setting and the theme's four list styles in one choice, so an editor
 * who knows core's knows ours (docs/architecture.md, "Primitives").
 */
import type { PropDefinitions, PropsOf } from '@/integrations/schema/props';

export const PROPS = {
	/**
	 * Gold square bullets (core's default); numbers; checks for requirements; hairline rows for
	 * links and short facts; tags, a row of short labels; or definitions, a term and its value.
	 */
	variant: {
		type: 'choice',
		label: 'Style',
		panel: 'List',
		control: 'select',
		options: [
			{ value: 'default', label: 'Default' },
			{ value: 'numbered', label: 'Numbered' },
			{ value: 'check', label: 'Checklist' },
			{ value: 'divided', label: 'Divided' },
			{ value: 'tags', label: 'Tags' },
			{ value: 'definitions', label: 'Definitions' },
		],
		default: 'default',
	},
	/**
	 * One item per line. For Definitions, write each as "Term: value"; the text before the first
	 * colon is the term.
	 */
	items: {
		type: 'text',
		label: 'Items',
		help: 'One item per line. Definitions: "Term: value".',
		panel: 'List',
		control: 'multiline',
		default:
			'Apply by the priority deadline\nSend your final transcripts\nSign up for orientation',
	},
} as const satisfies PropDefinitions;

/** The props above, typed. */
export type ListEditableProps = PropsOf< typeof PROPS >;
