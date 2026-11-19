/**
 * The Image as our blocks edit it, with core Image's tool: the media library. With no image
 * yet it shows a button to choose one; with one, clicking the image replaces it. A block's
 * edit() renders this where its save() renders the plain Image. The alt text belongs in the
 * block's sidebar, as core Image's does.
 *
 * WHY no block of its own: WordPress editors use `core/image`.
 */
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { Button as WPButton } from '@wordpress/components';

import Image, { type ImageProps } from '../../Image.tsx';

export type ImageValue = { id: number; url: string; alt: string };

// The parts of a media library item this reads. UPSTREAM: wp.media's attachment model.
type Media = { id: number; url: string; alt?: string };

export type ImageEditProps = Partial< ImageValue > & {
	aspectRatio?: ImageProps[ 'aspectRatio' ];
	/** A class for the image, as the plain Image takes, so the block's CSS sizes both alike. */
	className?: string;
	/** Receives the chosen image. */
	onChange: ( value: ImageValue ) => void;
	/** What the image is for, e.g. "card image", in the button's label. */
	label: string;
};

/**
 * @param props             The image's value and how to change it.
 * @param props.id          Its attachment ID.
 * @param props.url         Its file.
 * @param props.alt         Its alt text.
 * @param props.aspectRatio The shape it crops to.
 * @param props.className   A class for the image.
 * @param props.onChange    Receives the chosen image.
 * @param props.label       What the image is for.
 */
export default function ImageEdit( {
	id,
	url,
	alt = '',
	aspectRatio,
	className,
	onChange,
	label,
}: ImageEditProps ) {
	const image = url ? (
		<Image
			className={ className }
			url={ url }
			alt={ alt }
			id={ id }
			aspectRatio={ aspectRatio }
		/>
	) : null;

	return (
		// UPSTREAM: MediaUploadCheck shows its children only to users allowed to upload.
		<MediaUploadCheck fallback={ image }>
			<MediaUpload< Media >
				allowedTypes={ [ 'image' ] }
				value={ id || undefined }
				onSelect={ ( media ) =>
					onChange( {
						id: media.id,
						url: media.url,
						alt: media.alt ?? '',
					} )
				}
				render={ ( { open } ) =>
					image ? (
						// A11Y: a real button, so replacing works from the keyboard too.
						<button
							type="button"
							onClick={ open }
							aria-label={ `Replace ${ label }` }
							// WHY the full height: a block that sizes its image to its container (the
							// Hero's backdrop) would otherwise size it to this button instead.
							style={ {
								border: 0,
								display: 'block',
								height: '100%',
								padding: 0,
								width: '100%',
							} }
						>
							{ image }
						</button>
					) : (
						<WPButton variant="secondary" onClick={ open }>
							{ `Choose ${ label }` }
						</WPButton>
					)
				}
			/>
		</MediaUploadCheck>
	);
}
