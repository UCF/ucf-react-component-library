/**
 * The Card's choice settings with their editor labels, read by the Puck config and the
 * WordPress sidebar so the two never disagree.
 *
 * SPEC: the looks and layouts are the UCF Brand Block Theme's Card patterns.
 */
export const CHOICES = {
	variant: {
		label: 'Look',
		options: [
			{ value: 'plain', label: 'Plain' },
			{ value: 'boxed', label: 'Boxed' },
			{ value: 'ruled', label: 'Ruled' },
		],
	},
	layout: {
		label: 'Layout',
		options: [
			{ value: 'vertical', label: 'Vertical' },
			{ value: 'horizontal', label: 'Horizontal' },
		],
	},
	headingLevel: {
		label: 'Title heading level',
		options: [
			{ value: 'h2', label: 'H2' },
			{ value: 'h3', label: 'H3' },
			{ value: 'h4', label: 'H4' },
		],
	},
	linkTarget: {
		label: 'Opens in',
		options: [
			{ value: '', label: 'Same tab' },
			{ value: '_blank', label: 'New tab' },
		],
	},
} as const;

export type ChoiceKey = keyof typeof CHOICES;
