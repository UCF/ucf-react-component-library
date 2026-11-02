/**
 * CONTEXT: the Card, a content component and a frame: a card's box with nothing decided
 * inside it. Editors fill it with whatever blocks they need; it sets only the look around
 * them and the space between them (docs/architecture.md, "Frames").
 *
 * WHY a frame: a card's content varies (an image and a link, a list, two buttons, a stat). The
 * cost: the result is only as consistent as what each editor puts in it, and nothing else can
 * read its title or link. examples/fixed-card shows the other shape, a Card that owns its
 * image, title and link as fields, for when a listing must read them or the whole card must
 * be one link.
 * WHY no image bleed: the frame doesn't know what its first block is. Reaching into a core
 * Image's markup from here would tie this CSS to core's classes; the fixed example can do it
 * because it owns its image.
 *
 * WHY settings that combine rather than one per design: the five UCF card designs (story,
 * next step, audience tile, pathway, media tile: VARIATIONS in variations.ts) are the same
 * few choices in different mixes. A look, its own composition, a background image under a
 * tint or a gradient, where the content sits, and a shape. A new design is a new mix first.
 * WHY the background image is the Card's, not a block inside: it sits under the content and
 * the overlay, the way the Hero's full image does; a block inside can't.
 *
 * In WordPress it is the `ucf-content/card` block with the blocks inside it as inner
 * blocks; in Puck, a slot. Both pass their container in as `innerAs` (as the Section does), so
 * the markup is the same in every host.
 *
 * Content rules apply: plain React, no runtime imports. SYNC: WordPress stores this markup in
 * every post that uses the block.
 */
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import Image from '../../primitives/image/Image.tsx';
import type { Composition } from '../section/compositions.ts';

/**
 * The classes that style the parts placed inside. The variations set them; an editor can too.
 * SYNC: style.css, and the variations in variations.ts.
 */
export const PARTS = {
	/** A small label pinned to the top corner of a card with a background: "Engineering". */
	tag: 'ucf-c-card__tag',
	/** A short line in the accent above the title: "First-year". */
	eyebrow: 'ucf-c-card__eyebrow',
	/** Category and date in the data voice: "News · Sept. 18, 2026". */
	meta: 'ucf-c-card__meta',
	/** The title in sans bold, sentence case. */
	title: 'ucf-c-card__title',
	/** The title in display type (Oswald capitals), sized for a card: a pathway card's. */
	heading: 'ucf-c-card__heading',
	/** The title in sans bold capitals, for a short audience name: "Freshman". */
	label: 'ucf-c-card__label',
	/** One or two sentences. */
	description: 'ucf-c-card__description',
	/** A text link in the data voice with an arrow: "First-year admission →". */
	link: 'ucf-c-card__link',
} as const;

export type CardProps = {
	/** Plain; boxed on the raised ground; or ruled under a heavy top rule. */
	variant?: 'plain' | 'boxed' | 'ruled';
	/**
	 * The card's own colors, as a Section's: `dark` for a black card on a light band. Empty takes
	 * the colors of what it sits on.
	 */
	composition?: Composition | '';
	/** An image behind the content, filling the card. */
	imageSrc?: string;
	/** What it shows, or '' when it is decoration (it is, behind a tint or gradient). */
	imageAlt?: string;
	/** The media library's attachment ID, for WordPress's responsive sizes (primitives/image). */
	imageId?: number;
	/**
	 * Replaces the background image built from the props above. WordPress's editor passes its
	 * media library picker here.
	 */
	media?: ReactNode;
	/**
	 * Over a background image, so the content on it can be read: the card's own surface color
	 * as a tint, or a dark gradient rising from the bottom.
	 */
	overlay?: 'tint' | 'gradient';
	/** The content's alignment, across. */
	contentAlign?: 'start' | 'center';
	/** Where the content sits, top to bottom, when the card is taller than it. */
	contentPosition?: 'top' | 'center' | 'bottom';
	/** A fixed shape, for tiles; empty fits the content. */
	aspectRatio?: '' | '1/1' | '4/3' | '3/4';
	/** What goes in the card. */
	children?: ReactNode;
	/**
	 * The element that holds the content. WordPress passes its inner-blocks element and Puck its
	 * slot, so each host's editing area is this element, with no wrapper of its own.
	 */
	innerAs?: ElementType;
} & Omit< ComponentPropsWithoutRef< 'div' >, 'children' >;

export default function Card( {
	variant = 'plain',
	composition = '',
	imageSrc,
	imageAlt = '',
	imageId,
	media,
	overlay = 'tint',
	contentAlign = 'start',
	contentPosition = 'top',
	aspectRatio = '',
	children,
	innerAs: Inner = 'div',
	className,
	...props
}: CardProps ) {
	const background = Boolean( imageSrc || media );

	return (
		<div
			{ ...props }
			className={ [
				className,
				'ucf-c',
				'ucf-c-card',
				composition ? `ucf-composition-${ composition }` : null,
			]
				.filter( Boolean )
				.join( ' ' ) }
			data-variant={ variant }
			// WHY its own attribute: a card with its own colors needs padding, as a boxed one does.
			data-composed={ composition ? '' : undefined }
			data-align={ contentAlign === 'start' ? undefined : contentAlign }
			data-position={
				contentPosition === 'top' ? undefined : contentPosition
			}
			// `4/3` → `4-3`, a value CSS can match without escaping the slash.
			data-ratio={
				aspectRatio ? aspectRatio.replace( '/', '-' ) : undefined
			}
		>
			{ background ? (
				<div className="ucf-c-card__background">
					{ media ?? (
						<Image
							className="ucf-c-card__image"
							url={ imageSrc ?? '' }
							alt={ imageAlt }
							id={ imageId }
						/>
					) }
				</div>
			) : null }
			{ background ? (
				<div className="ucf-c-card__overlay" data-overlay={ overlay } />
			) : null }
			<Inner className="ucf-c-card__content">{ children }</Inner>
		</div>
	);
}
