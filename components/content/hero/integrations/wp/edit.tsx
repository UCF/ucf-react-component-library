/**
 * The Hero's editor view: its sidebar and its copy, from its port, and the image's own picker on
 * the canvas.
 * WHY the image is picked in two places: on the block, the image itself opens the media library
 * (as core Image's does); in the sidebar, the same picker as a thumbnail. A full-image Hero's
 * backdrop sits under its overlay and copy, so the sidebar is the only way to it there.
 */
import { __ } from '@wordpress/i18n';

import ImageEdit, {
	type ImageValue,
} from '@/components/primitives/image/integrations/wp/edit.js';
import { blockEdit, useBlock } from '@/integrations/wp/block.js';
import Hero from '../../Hero.tsx';

/**
 * The image area's picker: the same props as the Image it stands in for.
 *
 * @param props           What the Hero passes its image area.
 * @param props.className The image's class.
 */
function ImagePicker( { className }: { className?: string } ) {
	const { attributes, setAttributes } = useBlock();
	const alt = attributes.imageAlt as string;
	return (
		<ImageEdit
			className={ className }
			id={ attributes.imageId as number }
			url={ attributes.imageSrc as string }
			alt={ alt }
			label={ __( 'hero image', 'ucf-content' ) }
			onChange={ ( image: ImageValue ) =>
				setAttributes( {
					imageId: image.id,
					imageSrc: image.url,
					// WHY keep a typed alt: the library's alt describes the file, not this use.
					imageAlt: alt || image.alt,
				} )
			}
		/>
	);
}

export default blockEdit( Hero, { areas: { media: ImagePicker } } );
