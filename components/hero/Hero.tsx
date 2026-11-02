/**
 * CONTEXT: the Hero, a trial port of P1's Hero block, to see what bringing a P1 block into this
 * library takes (docs/todo.md, "Primitives to build").
 *
 * Source: Pantheon's P1 component library, registry item `@p1/hero`
 * (https://components.p1.pantheon.io/r/hero.json, read 2026-11-01). P1's license is not stated
 * in its registry files: confirm it before this ships.
 *
 * Kept from P1: the copy (eyebrow, title, description, two links, badges), the split, full
 * image and text-only layouts, image side, fill and ratio, overlays, heights, the prop names
 * and values, and variants as data attributes.
 *
 * Changed for UCF, and why. Each is a question for the P1 decision:
 *   - Tone sets a UCF composition, not fixed colors: accent is Bold Gold, dark is Dark, light
 *     is Light Alt, and a full image is Dark. The Hero is its own band, so it picks its colors
 *     the way a Section does, and ignores the Section around it.
 *   - The buttons are the Button primitive (primitives/button), as P1's blocks share its one
 *     `internal/btn`, so every component's buttons stay the same. SYNC: the Hero saves the
 *     Button's markup inside its own, so a change to the Button's markup needs a deprecation
 *     here too (docs/architecture.md, "Primitives").
 *   - `align` is `contentAlign`. UPSTREAM: WordPress reserves `align` for wide/full alignment.
 *   - `imageAlt` is new. A11Y: P1 writes `alt=""` on every hero image; a split hero's image
 *     often carries meaning, and WCAG 1.1.1 then needs a text alternative.
 *   - The copy comes first in the HTML whichever side the image is on; CSS moves the image.
 *     P1 swaps the elements, so a screen reader met the image before the headline.
 *   - Overlays and split ratios are data attributes and CSS, not inline styles. WHY: in
 *     WordPress inline styles are saved in the post, so changing a gradient would need a
 *     deprecation.
 *   - Left out: P1's `with form` layout (a picture of a form whose fields do nothing), `video
 *     background` (a still image with a pause button that does nothing), `knockout` text, the
 *     image `frame`, and P1's stock fallback image. Rounded corners are square: UCF has no
 *     radius tokens.
 *
 * Content component rules apply (docs/architecture.md, "Two kinds of component").
 * SYNC: WordPress stores this markup in every post with a Hero.
 */
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import Button from '../../primitives/button/Button.tsx';

export type HeroLayout = 'split' | 'full image' | 'text only';
export type HeroTone = 'accent' | 'dark' | 'light';
export type HeroBadge = { text: string };

export type HeroProps = {
	/** A short label above the title. */
	eyebrow?: ReactNode;
	/** The headline. */
	title: ReactNode;
	/** One or two sentences under the title. */
	description?: ReactNode;
	primaryLabel?: ReactNode;
	primaryHref?: string;
	primaryTarget?: '_self' | '_blank';
	secondaryLabel?: ReactNode;
	secondaryHref?: string;
	secondaryTarget?: '_self' | '_blank';
	/**
	 * Replaces the buttons built from the props above. WordPress's editor passes the Button's
	 * editing version here (primitives/button/adapters/wp/edit.tsx).
	 */
	actions?: ReactNode;
	/** The band's colors: Bold Gold, Dark or Light Alt. A full image is always Dark. */
	tone?: HeroTone;
	layout?: HeroLayout;
	imageSrc?: string;
	/** What the image shows, or '' when it is decoration. */
	imageAlt?: string;
	imageSide?: 'right' | 'left';
	imageFill?: 'card' | 'flush';
	splitRatio?: 'even' | 'copy-wide' | 'image-wide';
	/** Where the copy sits. P1 calls this `align`. */
	contentAlign?: 'left' | 'center' | 'right';
	/** The shade over a full image, so the copy on it can be read. */
	overlay?: 'none' | 'scrim' | 'gradient down' | 'gradient right';
	overlayStrength?: 'light' | 'medium' | 'heavy';
	badges?: 'off' | 'on';
	badgeItems?: HeroBadge[];
	height?: 'compact' | 'regular' | 'tall';
} & Omit< ComponentPropsWithoutRef< 'section' >, 'children' | 'title' >;

// SYNC: the composition slugs in components/section/compositions.ts.
const COMPOSITION: Record< HeroTone, string > = {
	accent: 'gold',
	dark: 'dark',
	light: 'alt',
};

// `full image` → `full-image`, for a data attribute CSS can match without quoting a space.
const slug = ( value: string ) => value.replace( / /g, '-' );

export default function Hero( {
	eyebrow,
	title,
	description,
	primaryLabel,
	primaryHref,
	primaryTarget,
	secondaryLabel,
	secondaryHref,
	secondaryTarget,
	actions,
	tone = 'accent',
	layout = 'split',
	imageSrc,
	imageAlt = '',
	imageSide = 'right',
	imageFill = 'card',
	splitRatio = 'even',
	contentAlign = 'left',
	overlay = 'gradient right',
	overlayStrength = 'medium',
	badges = 'off',
	badgeItems,
	height = 'regular',
	className,
	...sectionProps
}: HeroProps ) {
	const overImage = layout === 'full image';
	const composition = overImage ? 'dark' : COMPOSITION[ tone ];
	const showImage = Boolean( imageSrc ) && layout !== 'text only';
	// UPSTREAM: Puck sends null for an emptied list, which a default doesn't catch.
	const badgeList = badges === 'on' ? ( badgeItems ?? [] ) : [];

	const image = showImage ? (
		<div
			className={
				overImage ? 'ucf-c-hero__backdrop' : 'ucf-c-hero__media'
			}
		>
			<img
				className="ucf-c-hero__image"
				src={ imageSrc }
				alt={ overImage ? '' : imageAlt }
			/>
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
				<div className="ucf-c-hero__copy" data-align={ contentAlign }>
					{ eyebrow ? (
						<p className="ucf-c-hero__eyebrow">{ eyebrow }</p>
					) : null }
					<h1 className="ucf-c-hero__title">{ title }</h1>
					{ description ? (
						<p className="ucf-c-hero__description">
							{ description }
						</p>
					) : null }
					{ actions || primaryLabel || secondaryLabel ? (
						<div className="ucf-c-hero__actions">
							{ actions ?? (
								<>
									{ primaryLabel ? (
										<Button
											text={ primaryLabel }
											url={ primaryHref }
											linkTarget={ primaryTarget }
										/>
									) : null }
									{ secondaryLabel ? (
										<Button
											text={ secondaryLabel }
											url={ secondaryHref }
											linkTarget={ secondaryTarget }
											variant="outline"
										/>
									) : null }
								</>
							) }
						</div>
					) : null }
					{ badgeList.length ? (
						<ul className="ucf-c-hero__badges">
							{ badgeList.map( ( badge, index ) => (
								<li key={ index } className="ucf-c-hero__badge">
									{ badge.text }
								</li>
							) ) }
						</ul>
					) : null }
				</div>
				{ overImage ? null : image }
			</div>
		</section>
	);
}
