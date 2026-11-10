/**
 * The Card's props, in the order editors see them. Each key is a saved block attribute.
 * SYNC: block.json's attributes; integrations/tests/parity.test.tsx checks. Renaming one needs a
 * block deprecation.
 */
import type { PropDefinitions, PropsOf } from '@/integrations/schema/props';
import { COMPOSITIONS } from '@/integrations/schema/compositions';

export const PROPS = {
	// Card

	/** Plain, boxed, or ruled under a heavy top rule. */
	variant: {
		type: 'choice',
		label: 'Look',
		panel: 'Card',
		control: 'radio',
		options: [
			{ value: 'plain', label: 'Plain' },
			{ value: 'boxed', label: 'Boxed' },
			{ value: 'ruled', label: 'Ruled' },
		],
		default: 'plain',
	},
	/** Its own colors, as a Section's. Empty takes the section's. */
	composition: {
		type: 'choice',
		label: 'Colors',
		panel: 'Card',
		control: 'select',
		options: [ { value: '', label: 'From the section' }, ...COMPOSITIONS ],
		default: '',
	},

	// Layout

	/** The content's alignment, across. */
	contentAlign: {
		type: 'choice',
		label: 'Align',
		panel: 'Layout',
		control: 'radio',
		options: [
			{ value: 'start', label: 'Start' },
			{ value: 'center', label: 'Center' },
		],
		default: 'start',
	},
	/** Where the content sits when the card is taller than it. */
	contentPosition: {
		type: 'choice',
		label: 'Position',
		panel: 'Layout',
		control: 'radio',
		options: [
			{ value: 'top', label: 'Top' },
			{ value: 'center', label: 'Center' },
			{ value: 'bottom', label: 'Bottom' },
		],
		default: 'top',
	},
	/** A fixed shape, for tiles; empty fits the content. */
	aspectRatio: {
		type: 'choice',
		label: 'Shape',
		panel: 'Layout',
		control: 'select',
		options: [
			{ value: '', label: 'Fit the content' },
			{ value: '1/1', label: 'Square' },
			{ value: '4/3', label: 'Landscape 4:3' },
			{ value: '3/4', label: 'Portrait 3:4' },
		],
		default: '',
	},

	// Background image

	/** An image behind the content, filling the card. */
	imageSrc: {
		type: 'text',
		label: 'Background image URL',
		panel: 'Background image',
		control: 'media',
		media: { what: 'background image', id: 'imageId', alt: 'imageAlt' },
		default: '',
	},
	/** Usually empty: under a tint or gradient the image is decoration. */
	imageAlt: {
		type: 'text',
		label: 'Background image alt text (usually empty)',
		help: 'Under a tint or gradient the image is decoration.',
		panel: 'Background image',
		default: '',
	},
	/** The media library's ID, for responsive sizes. Set by the picker; WordPress only. */
	imageId: {
		type: 'number',
		hosts: [ 'wp' ],
		default: 0,
	},
	/** Over the image, so the content reads: a tint of the card's color, or a dark gradient. */
	overlay: {
		type: 'choice',
		label: 'Over the image',
		panel: 'Background image',
		control: 'radio',
		options: [
			{ value: 'tint', label: 'Tint' },
			{ value: 'gradient', label: 'Gradient' },
		],
		default: 'tint',
	},
} as const satisfies PropDefinitions;

/** The props above, typed: `variant` is `'plain' | 'boxed' | 'ruled'`, and so on. */
export type CardEditableProps = PropsOf< typeof PROPS >;
