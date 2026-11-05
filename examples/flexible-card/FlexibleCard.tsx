/**
 * CONTEXT: an example, not shipped: the Card as a *frame*, kept beside examples/fixed-card so
 * the two shapes sit together (docs/architecture.md, "Frames"). A copy of the shipped Card
 * (components/content/card) as of 2026-11-02, renamed so the two never clash; it is a reference and
 * does not follow later changes to the shipped one. Not in Storybook, the npm package, a
 * plugin or the Puck demo; its tests keep it working.
 *
 * The Card as a frame: a card's box with nothing decided
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
 * In WordPress it is the `ucf-content/flexible-card` block with the blocks inside it as inner
 * blocks; in Puck, a slot. Both pass their container in as `innerAs` (as the Section does), so
 * the markup is the same in every host.
 *
 * Content rules apply: plain React, no runtime imports. SYNC: WordPress stores this markup in
 * every post that uses the block.
 */
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

export type FlexibleCardProps = {
	/** Plain; boxed on the raised ground; or ruled under a heavy top rule. As the Card's. */
	variant?: 'plain' | 'boxed' | 'ruled';
	/** What goes in the card. */
	children?: ReactNode;
	/**
	 * The element that holds the content. WordPress passes its inner-blocks element and Puck its
	 * slot, so each host's editing area is this element, with no wrapper of its own.
	 */
	innerAs?: ElementType;
} & Omit< ComponentPropsWithoutRef< 'div' >, 'children' >;

export default function FlexibleCard( {
	variant = 'plain',
	children,
	innerAs: Inner = 'div',
	className,
	...props
}: FlexibleCardProps ) {
	return (
		<div
			{ ...props }
			className={ [ className, 'ucf-c', 'ucf-c-flexible-card' ]
				.filter( Boolean )
				.join( ' ' ) }
			data-variant={ variant }
		>
			<Inner className="ucf-c-flexible-card__content">{ children }</Inner>
		</div>
	);
}
