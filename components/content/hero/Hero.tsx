/**
 * CONTEXT: the Hero, a trial port of P1's Hero block, to see what bringing a P1 block into this
 * library takes (docs/todo.md, "Primitives to build").
 *
 * Source: Pantheon's P1 component library, registry item `@p1/hero`
 * (https://components.p1.pantheon.io/r/hero.json, read 2026-11-01). P1's license is not stated
 * in its registry files: confirm it before this ships.
 *
 * Kept from P1: the split, full image and text-only layouts, image side, fill and ratio,
 * overlays, heights, the prop names and values, and variants as data attributes.
 *
 * A frame: the Hero draws the band, the image and the layout; its copy is open content placed
 * inside (the eyebrow, title, description and buttons P1 has as fields). A new Hero starts
 * with those as a template (wp/edit.tsx, puck/config.tsx), each with the
 * class that styles it (PARTS). In WordPress the buttons are core Buttons; in Puck, the Button
 * primitive. The cost: nothing makes a Hero have a title, and nothing else can read it as a
 * field.
 *
 * Changed for UCF, and why. Each is a question for the P1 decision:
 *   - Tone sets a UCF composition, not fixed colors: accent is Bold Gold, dark is Dark, light
 *     is Light Alt, and a full image is Dark. The Hero is its own band, so it picks its colors
 *     the way a Section does, and ignores the Section around it.
 *   - `align` is `contentAlign`. UPSTREAM: WordPress reserves `align` for wide/full alignment.
 *   - The image is the Image primitive, chosen from the media library in WordPress (its
 *     attachment ID gives it responsive sizes); P1's is a URL, which Puck keeps.
 *   - `imageAlt` is new. A11Y: P1 writes `alt=""` on every hero image; a split hero's image
 *     often carries meaning, and WCAG 1.1.1 then needs a text alternative.
 *   - The copy comes first in the HTML whichever side the image is on; CSS moves the image.
 *     P1 swaps the elements, so a screen reader met the image before the headline.
 *   - Overlays and split ratios are data attributes and CSS, not inline styles. WHY: in
 *     WordPress inline styles are saved in the post, so changing a gradient would need a
 *     deprecation.
 *   - Left out: P1's badges (a list placed inside does the same), its `with form` layout (a
 *     picture of a form whose fields do nothing), `video background` (a still image with a
 *     pause button that does nothing), `knockout` text, the image `frame`, and P1's stock
 *     fallback image. Rounded corners are square: UCF has no radius tokens.
 *
 * Content component rules apply (docs/architecture.md, "Two kinds of component").
 * SYNC: WordPress stores this markup in every post with a Hero.
 */
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import Image from '../../primitives/image/Image.tsx';

export type HeroLayout = 'split' | 'full image' | 'text only';
export type HeroTone = 'accent' | 'dark' | 'light';

/**
 * The classes that style the copy's parts. The templates set them; an editor can too.
 * SYNC: style.css, and the templates in wp/edit.tsx and puck/config.tsx.
 */
export const PARTS = {
	eyebrow: 'ucf-c-hero__eyebrow',
	title: 'ucf-c-hero__title',
	description: 'ucf-c-hero__description',
} as const;

export type HeroProps = {
	/** The copy: eyebrow, title, description and buttons, or whatever an editor placed. */
	children?: ReactNode;
	/**
	 * The element that holds the copy. WordPress passes its inner-blocks element and Puck its
	 * slot, so each host's editing area is this element, with no wrapper of its own.
	 */
	innerAs?: ElementType;
	/** The band's colors: Bold Gold, Dark or Light Alt. A full image is always Dark. */
	tone?: HeroTone;
	layout?: HeroLayout;
	imageSrc?: string;
	/** What the image shows, or '' when it is decoration. */
	imageAlt?: string;
	/** The media library's attachment ID, for WordPress's responsive sizes (components/primitives/image). */
	imageId?: number;
	/**
	 * Replaces the image built from the props above, inside its frame. WordPress's editor passes
	 * the media library picker here (components/primitives/image/integrations/wp/edit.tsx), so the
	 * frame shows
	 * even before an image is chosen.
	 */
	media?: ReactNode;
	imageSide?: 'right' | 'left';
	imageFill?: 'card' | 'flush';
	splitRatio?: 'even' | 'copy-wide' | 'image-wide';
	/** Where the copy sits. P1 calls this `align`. */
	contentAlign?: 'left' | 'center' | 'right';
	/** The shade over a full image, so the copy on it can be read. */
	overlay?: 'none' | 'scrim' | 'gradient down' | 'gradient right';
	overlayStrength?: 'light' | 'medium' | 'heavy';
	height?: 'compact' | 'regular' | 'tall';
} & Omit< ComponentPropsWithoutRef< 'section' >, 'children' >;

// SYNC: the composition slugs in integrations/schema/compositions.ts.
const COMPOSITION: Record< HeroTone, string > = {
	accent: 'gold',
	dark: 'dark',
	light: 'alt',
};

// `full image` → `full-image`, for a data attribute CSS can match without quoting a space.
const slug = ( value: string ) => value.replace( / /g, '-' );

export default function Hero( {
	children,
	innerAs: Inner = 'div',
	tone = 'accent',
	layout = 'split',
	imageSrc,
	imageAlt = '',
	imageId,
	media,
	imageSide = 'right',
	imageFill = 'card',
	splitRatio = 'even',
	contentAlign = 'left',
	overlay = 'gradient right',
	overlayStrength = 'medium',
	height = 'regular',
	className,
	...sectionProps
}: HeroProps ) {
	const overImage = layout === 'full image';
	const composition = overImage ? 'dark' : COMPOSITION[ tone ];
	const showImage = Boolean( imageSrc || media ) && layout !== 'text only';

	const image = showImage ? (
		<div
			className={
				overImage ? 'ucf-c-hero__backdrop' : 'ucf-c-hero__media'
			}
		>
			{ media ?? (
				<Image
					className="ucf-c-hero__image"
					url={ imageSrc ?? '' }
					// A11Y: behind the copy, the image is backdrop, so it is decoration.
					alt={ overImage ? '' : imageAlt }
					id={ imageId }
				/>
			) }
		</div>
	) : null;

	return (
		<section
			{ ...sectionProps }
			className={ [
				className,
				'ucf-c',
				'ucf-c-hero',
				`ucf-composition-${ composition }`,
			]
				.filter( Boolean )
				.join( ' ' ) }
			data-layout={ slug( layout ) }
			data-height={ height }
			data-image-side={ showImage && ! overImage ? imageSide : undefined }
			data-image-fill={ showImage && ! overImage ? imageFill : undefined }
			data-split-ratio={
				showImage && ! overImage ? splitRatio : undefined
			}
		>
			{ overImage ? image : null }
			{ overImage && showImage && overlay !== 'none' ? (
				<div
					className="ucf-c-hero__overlay"
					data-overlay={ slug( overlay ) }
					data-strength={ overlayStrength }
				/>
			) : null }
			<div className="ucf-c-hero__inner">
				<Inner className="ucf-c-hero__copy" data-align={ contentAlign }>
					{ children }
				</Inner>
				{ overImage ? null : image }
			</div>
		</section>
	);
}
