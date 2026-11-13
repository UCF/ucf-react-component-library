/**
 * The Image's props, in the order Puck shows them. Its Puck fields, its story controls and their
 * defaults are built from these (integrations/schema/props.ts says how).
 *
 * SPEC: named after core Image's attributes, so an editor who knows core's knows ours
 * (docs/architecture.md, "Primitives").
 */
import type { PropDefinitions, PropsOf } from '@/integrations/schema/props';

/**
 * The sample picture: a gray gradient with a gold sun. What a new Image shows in Puck, and the
 * stand-in wherever a component needs a picture before an editor picks one (WordPress's inserter
 * previews, stories). Exported from the package as IMAGE_SAMPLE.
 */
export const SAMPLE = {
	url: 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 1200 800%27%3E%3Cdefs%3E%3ClinearGradient id=%27g%27 x1=%270%27 y1=%270%27 x2=%271%27 y2=%271%27%3E%3Cstop offset=%270%27 stop-color=%27%23444%27/%3E%3Cstop offset=%271%27 stop-color=%27%23000%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%271200%27 height=%27800%27 fill=%27url(%23g)%27/%3E%3Ccircle cx=%27880%27 cy=%27240%27 r=%27140%27 fill=%27%23ffc904%27/%3E%3C/svg%3E',
} as const;

export const PROPS = {
	/** The picture's address. */
	url: {
		type: 'text',
		label: 'Image URL',
		panel: 'Image',
		default: SAMPLE.url,
	},
	/** What it shows, for screen readers; empty when it is decoration. */
	alt: {
		type: 'text',
		label: 'Alt text (empty if decorative)',
		panel: 'Image',
		default: '',
	},
	/** Its shape, cropped to fill; Original keeps the file's own. */
	aspectRatio: {
		type: 'choice',
		label: 'Aspect ratio',
		panel: 'Image',
		control: 'select',
		options: [
			{ value: '', label: 'Original' },
			{ value: '3/2', label: '3:2' },
			{ value: '16/9', label: '16:9' },
			{ value: '4/3', label: '4:3' },
			{ value: '1/1', label: 'Square' },
		],
		default: '3/2',
	},
	/**
	 * Core's "Additional CSS class(es)". A component's template names a part with it (the Highlight's logo), the
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
export type ImageEditableProps = PropsOf< typeof PROPS >;
