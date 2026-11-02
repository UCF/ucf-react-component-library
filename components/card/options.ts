/**
 * The Card's settings with their editor labels, read by the Puck config and the WordPress
 * sidebar so the two never disagree.
 *
 * SPEC: the looks are the UCF Brand Block Theme's Card patterns; the rest combine into the
 * UCF card designs (variations.ts).
 */
import { COMPOSITIONS } from '../section/compositions.ts';

type Choice = {
	label: string;
	control: 'select' | 'radio';
	options: readonly { value: string; label: string }[];
};

export const CHOICES = {
	variant: {
		label: 'Look',
		control: 'radio',
		options: [
			{ value: 'plain', label: 'Plain' },
			{ value: 'boxed', label: 'Boxed' },
			{ value: 'ruled', label: 'Ruled' },
		],
	},
	composition: {
		label: 'Colors',
		control: 'select',
		options: [ { value: '', label: 'From the section' }, ...COMPOSITIONS ],
	},
	overlay: {
		label: 'Over the image',
		control: 'radio',
		options: [
			{ value: 'tint', label: 'Tint' },
			{ value: 'gradient', label: 'Gradient' },
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
	contentPosition: {
		label: 'Position',
		control: 'radio',
		options: [
			{ value: 'top', label: 'Top' },
			{ value: 'center', label: 'Center' },
			{ value: 'bottom', label: 'Bottom' },
		],
	},
	aspectRatio: {
		label: 'Shape',
		control: 'select',
		options: [
			{ value: '', label: 'Fit the content' },
			{ value: '1/1', label: 'Square' },
			{ value: '4/3', label: 'Landscape 4:3' },
			{ value: '3/4', label: 'Portrait 3:4' },
		],
	},
} as const satisfies Record< string, Choice >;

export type ChoiceKey = keyof typeof CHOICES;
export type Variant = ( typeof CHOICES.variant.options )[ number ][ 'value' ];
