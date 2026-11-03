/**
 * The Highlight's settings with their editor labels, read by the Puck config and the
 * WordPress sidebar so the two never disagree.
 *
 * SPEC: they combine into the UCF highlight designs (variations.ts).
 */
type Choice = {
	label: string;
	control: 'select' | 'radio';
	options: readonly { value: string; label: string }[];
};

export const CHOICES = {
	rule: {
		label: 'Rule',
		control: 'select',
		options: [
			{ value: 'top', label: 'Across the top' },
			{ value: 'side', label: 'Down the side' },
			{ value: 'corner', label: 'Bracket (top and side)' },
			{ value: 'divider', label: 'Short bar under the first part' },
			{ value: 'none', label: 'None' },
		],
	},
	contentAlign: {
		label: 'Align',
		control: 'radio',
		options: [
			{ value: 'start', label: 'Start' },
			{ value: 'center', label: 'Center' },
		],
	},
} as const satisfies Record< string, Choice >;

export type ChoiceKey = keyof typeof CHOICES;
