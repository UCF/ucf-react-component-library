/**
 * The Hero's props, in the order editors see them. Each key is a saved block attribute.
 * SPEC: the values and labels are P1's (registry item `@p1/hero`), less the layouts this port
 * leaves out (Hero.tsx says which and why).
 * SYNC: block.json's attributes; integrations/tests/parity.test.tsx checks. Renaming one needs a
 * block deprecation.
 */
import type {
	PropDefinitions,
	PropsOf,
} from '../../../integrations/schema/props.ts';

export const PROPS = {
	// Layout

	layout: {
		type: 'choice',
		label: 'Layout',
		panel: 'Layout',
		control: 'select',
		options: [
			{ value: 'split', label: 'Split' },
			{ value: 'full image', label: 'Full image' },
			{ value: 'text only', label: 'Text only' },
		],
		default: 'split',
	},
	/** The band's colors: Bold Gold, Dark or Light Alt. A full image is always Dark. */
	tone: {
		type: 'choice',
		label: 'Tone',
		panel: 'Layout',
		control: 'select',
		options: [
			{ value: 'accent', label: 'Accent (Bold Gold)' },
			{ value: 'dark', label: 'Dark' },
			{ value: 'light', label: 'Light (Light Alt)' },
		],
		default: 'accent',
	},
	height: {
		type: 'choice',
		label: 'Height',
		panel: 'Layout',
		control: 'select',
		options: [
			{ value: 'compact', label: 'Compact' },
			{ value: 'regular', label: 'Regular' },
			{ value: 'tall', label: 'Tall' },
		],
		default: 'regular',
	},
	/** Where the copy sits. P1 calls this `align`; WordPress reserves that name. */
	contentAlign: {
		type: 'choice',
		label: 'Align',
		panel: 'Layout',
		control: 'select',
		options: [
			{ value: 'left', label: 'Left' },
			{ value: 'center', label: 'Center' },
			{ value: 'right', label: 'Right' },
		],
		default: 'left',
	},

	// Image

	imageSrc: {
		type: 'text',
		label: 'Image URL',
		panel: 'Image',
		control: 'media',
		media: { what: 'hero image', id: 'imageId', alt: 'imageAlt' },
		default: '',
	},
	/** What the image shows, or '' when it is decoration. */
	imageAlt: {
		type: 'text',
		label: 'Image description (alt text)',
		panel: 'Image',
		default: '',
	},
	/** The media library's ID, for responsive sizes. Set by the picker; WordPress only. */
	imageId: {
		type: 'number',
		hosts: [ 'wp' ],
		default: 0,
	},
	imageSide: {
		type: 'choice',
		label: 'Image side',
		panel: 'Image',
		control: 'radio',
		options: [
			{ value: 'right', label: 'Right' },
			{ value: 'left', label: 'Left' },
		],
		default: 'right',
	},
	imageFill: {
		type: 'choice',
		label: 'Image fill',
		panel: 'Image',
		control: 'radio',
		options: [
			{ value: 'card', label: 'Card' },
			{ value: 'flush', label: 'Flush' },
		],
		default: 'card',
	},
	splitRatio: {
		type: 'choice',
		label: 'Split ratio',
		panel: 'Image',
		control: 'select',
		options: [
			{ value: 'even', label: 'Even' },
			{ value: 'copy-wide', label: 'Copy-wide' },
			{ value: 'image-wide', label: 'Image-wide' },
		],
		default: 'even',
	},
	/** The shade over a full image, so the copy on it can be read. */
	overlay: {
		type: 'choice',
		label: 'Overlay',
		panel: 'Image',
		control: 'select',
		options: [
			{ value: 'none', label: 'None' },
			{ value: 'scrim', label: 'Scrim' },
			{ value: 'gradient down', label: 'Gradient ↓' },
			{ value: 'gradient right', label: 'Gradient →' },
		],
		default: 'gradient right',
	},
	overlayStrength: {
		type: 'choice',
		label: 'Overlay strength',
		panel: 'Image',
		control: 'select',
		options: [
			{ value: 'light', label: 'Light' },
			{ value: 'medium', label: 'Medium' },
			{ value: 'heavy', label: 'Heavy' },
		],
		default: 'medium',
	},
} as const satisfies PropDefinitions;

/** The props above, typed: `layout` is `'split' | 'full image' | 'text only'`, and so on. */
export type HeroEditableProps = PropsOf< typeof PROPS >;
