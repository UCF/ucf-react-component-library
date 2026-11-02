/**
 * The Hero's choice settings with their editor labels, read by the Puck config and the
 * WordPress sidebar so the two never disagree.
 *
 * SPEC: the values and labels are P1's (registry item `@p1/hero`), less the layouts this port
 * leaves out (Hero.tsx says which and why). `control` is the field P1 shows for each.
 */
type Choice = {
	label: string;
	control: 'select' | 'radio';
	options: readonly { value: string; label: string }[];
};

const TARGETS = [
	{ value: '_self', label: 'Same tab' },
	{ value: '_blank', label: 'New tab' },
] as const;

export const CHOICES = {
	layout: {
		label: 'Layout',
		control: 'select',
		options: [
			{ value: 'split', label: 'Split' },
			{ value: 'full image', label: 'Full image' },
			{ value: 'text only', label: 'Text only' },
		],
	},
	tone: {
		label: 'Tone',
		control: 'select',
		options: [
			{ value: 'accent', label: 'Accent (Bold Gold)' },
			{ value: 'dark', label: 'Dark' },
			{ value: 'light', label: 'Light (Light Alt)' },
		],
	},
	height: {
		label: 'Height',
		control: 'select',
		options: [
			{ value: 'compact', label: 'Compact' },
			{ value: 'regular', label: 'Regular' },
			{ value: 'tall', label: 'Tall' },
		],
	},
	contentAlign: {
		label: 'Align',
		control: 'select',
		options: [
			{ value: 'left', label: 'Left' },
			{ value: 'center', label: 'Center' },
			{ value: 'right', label: 'Right' },
		],
	},
	imageSide: {
		label: 'Image side',
		control: 'radio',
		options: [
			{ value: 'right', label: 'Right' },
			{ value: 'left', label: 'Left' },
		],
	},
	imageFill: {
		label: 'Image fill',
		control: 'radio',
		options: [
			{ value: 'card', label: 'Card' },
			{ value: 'flush', label: 'Flush' },
		],
	},
	splitRatio: {
		label: 'Split ratio',
		control: 'select',
		options: [
			{ value: 'even', label: 'Even' },
			{ value: 'copy-wide', label: 'Copy-wide' },
			{ value: 'image-wide', label: 'Image-wide' },
		],
	},
	overlay: {
		label: 'Overlay',
		control: 'select',
		options: [
			{ value: 'none', label: 'None' },
			{ value: 'scrim', label: 'Scrim' },
			{ value: 'gradient down', label: 'Gradient ↓' },
			{ value: 'gradient right', label: 'Gradient →' },
		],
	},
	overlayStrength: {
		label: 'Overlay strength',
		control: 'select',
		options: [
			{ value: 'light', label: 'Light' },
			{ value: 'medium', label: 'Medium' },
			{ value: 'heavy', label: 'Heavy' },
		],
	},
	primaryTarget: {
		label: 'Primary opens in',
		control: 'radio',
		options: TARGETS,
	},
	secondaryTarget: {
		label: 'Secondary opens in',
		control: 'radio',
		options: TARGETS,
	},
	badges: {
		label: 'Badges',
		control: 'radio',
		options: [
			{ value: 'off', label: 'Off' },
			{ value: 'on', label: 'On' },
		],
	},
} as const satisfies Record< string, Choice >;

export type ChoiceKey = keyof typeof CHOICES;

/** The free-text settings, with their editor labels. */
export const TEXTS = {
	eyebrow: 'Eyebrow',
	title: 'Title',
	description: 'Description',
	primaryLabel: 'Primary label',
	primaryHref: 'Primary link',
	secondaryLabel: 'Secondary label',
	secondaryHref: 'Secondary link',
	imageSrc: 'Image URL',
	imageAlt: 'Image description (alt text)',
} as const;

export type TextKey = keyof typeof TEXTS;
