/**
 * The Image for Puck, where editors place it on its own: Puck has no core blocks.
 *
 * SPEC: the fields are core Image's: the file, its alt text and an aspect ratio.
 */
import Image, { type ImageProps } from '../../Image.tsx';
import example from '../../example.json' with { type: 'json' };
// WHY a type from components/: the one copy of Puck's config shape. Types only; erased at build.
import type { PuckComponentConfig } from '../../../../components/_config/puck.ts';

type Props = {
	url: string;
	alt: string;
	aspectRatio: NonNullable< ImageProps[ 'aspectRatio' ] >;
	className: string;
};

export const ASPECT_RATIOS = [
	{ value: '', label: 'Original' },
	{ value: '3/2', label: '3:2' },
	{ value: '16/9', label: '16:9' },
	{ value: '4/3', label: '4:3' },
	{ value: '1/1', label: 'Square' },
];

const config: PuckComponentConfig< Props > = {
	label: 'Image',
	fields: {
		url: { type: 'text', label: 'Image URL' },
		alt: { type: 'text', label: 'Alt text (empty if decorative)' },
		aspectRatio: {
			type: 'select',
			label: 'Aspect ratio',
			options: ASPECT_RATIOS,
		},
		// WHY: core's "Additional CSS class(es)", as on Heading and Paragraph. A component's
		// template names a part with it (the Highlight's logo).
		className: { type: 'text', label: 'CSS class' },
	},
	defaultProps: {
		...( example as Omit< Props, 'className' > ),
		className: '',
	},
	// FIX: only the Image's own props; Puck's `id`, `puck` and `editMode` would reach the
	// markup, and Puck's `id` would even be read as the attachment ID.
	render: ( { url, alt, aspectRatio, className } ) => (
		<Image
			className={ className || undefined }
			url={ url }
			alt={ alt }
			aspectRatio={ aspectRatio }
		/>
	),
};

export default config;
