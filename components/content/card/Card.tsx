/**
 * CONTEXT: the Card: a frame, a card's box with any content inside. Why it's built this way:
 * README.md.
 * SYNC: WordPress stores this markup in every post that uses the block.
 */
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import Image from '../../primitives/image/Image.tsx';
import { PROPS, type CardEditableProps } from './Card.props.ts';

/** Its props (Card.props.ts), and what a host passes besides. */
export type CardProps = Partial< CardEditableProps > & {
	/** In place of the background image: WordPress's editor passes its picker. */
	media?: ReactNode;
	/** What goes in the card. */
	children?: ReactNode;
	/** The element that holds the content: WordPress's inner blocks, Puck's slot. */
	innerAs?: ElementType;
} & Omit< ComponentPropsWithoutRef< 'div' >, 'children' >;

export default function Card( {
	variant = PROPS.variant.default,
	composition = PROPS.composition.default,
	// WHY no default: no URL means no background.
	imageSrc,
	imageAlt = PROPS.imageAlt.default,
	imageId,
	media,
	overlay = PROPS.overlay.default,
	contentAlign = PROPS.contentAlign.default,
	contentPosition = PROPS.contentPosition.default,
	aspectRatio = PROPS.aspectRatio.default,
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
