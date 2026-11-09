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
 * inside (the eyebrow, title, description and buttons P1 has as fields). A new Hero starts with
 * those (DEFAULT_PRESET in Hero.presets.ts), each with the class that styles it (Hero.parts.ts).
 * It has two areas: `content`, the copy, and `media`, the image, where WordPress's editor puts
 * its picker (integrations/wp/edit.tsx). The cost: nothing makes a Hero have a title, and nothing
 * else can read it as a field.
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
 * SYNC: WordPress stores this markup in every post that uses the block.
 */
import {
	frame,
	type FrameProps,
	type OwnProps,
	type PresetProps,
} from '#integrations/react/frame.js';
import Image from '#primitives/image/Image.js';
import { PARTS } from './Hero.parts.ts';
import { DEFAULT_PRESET, PRESETS } from './Hero.presets.ts';
import { PROPS, type HeroEditableProps } from './Hero.props.ts';

/** Everything the Hero takes: its props, its copy as children, and a site's HTML attributes. */
export type HeroProps = OwnProps< typeof PROPS > &
	PresetProps< typeof PARTS, typeof PRESETS >;
export type HeroLayout = HeroEditableProps[ 'layout' ];
export type HeroTone = HeroEditableProps[ 'tone' ];

// SYNC: the composition slugs in integrations/schema/compositions.ts.
const COMPOSITION: Record< HeroTone, string > = {
	accent: 'gold',
	dark: 'dark',
	light: 'alt',
};

// `full image` → `full-image`, for a data attribute CSS can match without quoting a space.
const slug = ( value: string ) => value.replace( / /g, '-' );

function HeroMarkup( {
	tone = PROPS.tone.default,
	layout = PROPS.layout.default,
	imageSrc,
	imageAlt = PROPS.imageAlt.default,
	imageId,
	imageSide = PROPS.imageSide.default,
	imageFill = PROPS.imageFill.default,
	splitRatio = PROPS.splitRatio.default,
	contentAlign = PROPS.contentAlign.default,
	overlay = PROPS.overlay.default,
	overlayStrength = PROPS.overlayStrength.default,
	height = PROPS.height.default,
	children,
	className,
	area,
	...props
}: FrameProps< typeof PROPS > ) {
	const overImage = layout === 'full image';
	const composition = overImage ? 'dark' : COMPOSITION[ tone ];
	// WHY `hosted`: WordPress's picker shows in the image's frame before an image is chosen.
	const showImage =
		Boolean( imageSrc || area.hosted( 'media' ) ) && layout !== 'text only';

	const image = showImage ? (
		<div
			className={
				overImage ? 'ucf-c-hero__backdrop' : 'ucf-c-hero__media'
			}
		>
			{ area( 'media', {
				as: Image,
				className: 'ucf-c-hero__image',
				url: imageSrc ?? '',
				// A11Y: behind the copy, the image is backdrop, so it is decoration.
				alt: overImage ? '' : imageAlt,
				id: imageId,
			} ) }
		</div>
	) : null;

	return (
		<section
			{ ...props }
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
				{ area(
					'content',
					{
						className: 'ucf-c-hero__copy',
						'data-align': contentAlign,
					},
					children
				) }
				{ overImage ? null : image }
			</div>
		</section>
	);
}

/**
 * A page-opening band: an image, and its copy and buttons placed inside.
 *
 *   <Hero layout="full image" imageSrc="/campus.jpg">…</Hero>
 *
 * Its props and parts: Hero.props.ts, Hero.parts.ts.
 */
const Hero = frame( HeroMarkup, {
	// Who it is
	slug: 'hero',
	title: 'Hero', // SYNC: block.json's title
	kind: 'content',

	// What it takes
	props: PROPS,
	parts: PARTS,
	presets: PRESETS,
	defaultPreset: DEFAULT_PRESET,

	// WordPress only
	wpIcon: 'cover',
} );

export default Hero;
