/**
 * CONTEXT: the Image, a primitive: the one image every component uses
 * (docs/architecture.md, "Primitives").
 *
 * WHY its props are core Image's: `url`, `alt`, `id` and `aspectRatio` are the attribute names
 * of WordPress's `core/image`, so content can move between the two.
 *
 * WHY `wp-image-{id}` when it has an id: WordPress adds `srcset`, `sizes`, `width`, `height`
 * and lazy loading to any `<img>` in a post that carries it, as it renders the page. So an
 * image chosen from the media library gets responsive sizes without this markup saving them.
 * UPSTREAM: wp_filter_content_tags() in WordPress, which reads the class.
 * WHY the ratio as a data attribute, not core's inline `style`: a style saved in every post
 * would need a deprecation to change; the CSS can change freely.
 *
 * Content rules apply: plain React, no runtime imports. In WordPress, editors use
 * `core/image` instead, so it has no block of its own.
 *
 * SYNC: our blocks save this markup inside theirs. Once a site uses them, changing what this
 * returns needs a new version of it and a deprecation in every block that uses it.
 */
import type { ComponentPropsWithoutRef } from 'react';

export type ImageProps = {
	/** The file. */
	url: string;
	/** What the image shows, or '' when it is decoration. A11Y: WCAG 1.1.1. */
	alt: string;
	/** The WordPress media library's attachment ID, when it came from there. */
	id?: number;
	/** Crops to this shape, filling it. None keeps the image's own shape. */
	aspectRatio?: '' | '3/2' | '16/9' | '4/3' | '1/1';
} & Omit< ComponentPropsWithoutRef< 'img' >, 'src' | 'alt' | 'id' >;

export default function Image( {
	url,
	alt,
	id,
	aspectRatio,
	className,
	...props
}: ImageProps ) {
	return (
		<img
			{ ...props }
			className={ [
				className,
				'ucf-c-image',
				id ? `wp-image-${ id }` : null,
			]
				.filter( Boolean )
				.join( ' ' ) }
			src={ url }
			alt={ alt }
			// `3/2` → `3-2`, a value CSS can match without escaping the slash.
			data-ratio={
				aspectRatio ? aspectRatio.replace( '/', '-' ) : undefined
			}
		/>
	);
}
