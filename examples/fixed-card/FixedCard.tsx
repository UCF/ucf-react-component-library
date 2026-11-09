/**
 * CONTEXT: an example, not shipped: the Card as a *fixed* component, kept to show that shape
 * beside the frames (docs/architecture.md, "Frames"). The shipped Card is a frame
 * (components/content/card). This one owns its parts as fields: one linked card with an image, a
 * meta
 * line, a title and a sentence. Every host renders this one file.
 *
 * Not in Storybook, the npm package, a plugin or the Puck demo; its tests keep it working.
 * Its block.json and adapters show a fixed component's, though nothing registers them.
 *
 * SPEC: the UCF Brand Block Theme's Card (patterns/card.php, card-horizontal.php and
 * card-grid.php there; its look in src/scss/_components.scss): one link, a title under about
 * eight words, image and text optional, and three looks: plain, boxed on the raised ground,
 * ruled under a heavy top rule. Horizontal puts the image beside the text from 576px.
 *
 * WHY one link, through the title: the title's link stretches over the whole card, so the card
 * is one click target and a keyboard user meets one tab stop, not three; the focus ring is
 * drawn around the card. A11Y: so a Card has no button of its own; a second action would be a
 * second tab stop competing with the whole card.
 * A11Y: the title comes first in the HTML, then the meta line and the sentence, then the
 * image; CSS shows the image and meta line above it. A screen reader then hears the title
 * before "Research · Sept. 18" (WCAG 1.3.2), and heading navigation lands on what the card is.
 * WHY a heading level setting: level is structure, not size. A card title is an h3 under a
 * section's h2 and looks the same at h2 or h4 (the theme's rule, _text.scss).
 *
 * Built from the Image primitive (components/primitives/image). Content rules apply: plain React,
 * no
 * runtime imports besides primitives. SYNC: WordPress stores this markup, with the Image's,
 * in every post that uses the block.
 */
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import Image from '#primitives/image/Image.js';

export type FixedCardProps = {
	/** The title, under about eight words. */
	title: ReactNode;
	/** Where the card goes. With none, the card is not a link. */
	url?: string;
	/** `_blank` to open in a new tab, as core stores it. */
	linkTarget?: string;
	/** A category, date or both, in the data voice: "Research · Sept. 18, 2026". */
	meta?: ReactNode;
	/** One or two sentences that help someone decide whether to follow the link. */
	description?: ReactNode;
	imageUrl?: string;
	/** What the image shows, or '' when it is decoration. */
	imageAlt?: string;
	/** The media library's attachment ID, for WordPress's responsive sizes. */
	imageId?: number;
	/** Replaces the image built from the props above; WordPress's editor passes its own. */
	media?: ReactNode;
	/** The title's heading level, for the page's outline. It looks the same at every level. */
	headingLevel?: 'h2' | 'h3' | 'h4';
	/** Plain; boxed on the raised ground; or ruled under a heavy top rule. */
	variant?: 'plain' | 'boxed' | 'ruled';
	/** Vertical, or horizontal with the image beside the text from 576px. */
	layout?: 'vertical' | 'horizontal';
} & Omit< ComponentPropsWithoutRef< 'div' >, 'children' | 'title' >;

export default function FixedCard( {
	title,
	url,
	linkTarget,
	meta,
	description,
	imageUrl,
	imageAlt = '',
	imageId,
	media,
	headingLevel: Heading = 'h3',
	variant = 'plain',
	layout = 'vertical',
	className,
	...props
}: FixedCardProps ) {
	const newTab = linkTarget === '_blank';
	const image =
		media ??
		( imageUrl ? (
			<Image
				url={ imageUrl }
				alt={ imageAlt }
				id={ imageId }
				aspectRatio="3/2"
			/>
		) : null );

	return (
		<div
			{ ...props }
			className={ [ className, 'ucf-c', 'ucf-c-fixed-card' ]
				.filter( Boolean )
				.join( ' ' ) }
			data-variant={ variant }
			data-layout={ layout }
			data-linked={ url ? '' : undefined }
		>
			<div className="ucf-c-fixed-card__body">
				<Heading className="ucf-c-fixed-card__title">
					{ url ? (
						<a
							className="ucf-c-fixed-card__link"
							href={ url }
							target={ newTab ? '_blank' : undefined }
							// WHY: the page that opens a new tab can't reach back into this one.
							rel={ newTab ? 'noopener noreferrer' : undefined }
						>
							{ title }
						</a>
					) : (
						title
					) }
				</Heading>
				{ meta ? (
					<p className="ucf-c-fixed-card__meta">{ meta }</p>
				) : null }
				{ description ? (
					<p className="ucf-c-fixed-card__description">
						{ description }
					</p>
				) : null }
			</div>
			{ image ? (
				<div className="ucf-c-fixed-card__media">{ image }</div>
			) : null }
		</div>
	);
}
