/**
 * The Card: a box with any content inside. Why it's built this way: README.md.
 *
 * `<Card preset="pathway" content={ { eyebrow: 'Transfer' } } />`, or any children. Hosts read
 * `Card.port` (integrations/react/frame.tsx).
 * SYNC: WordPress stores this markup in every post that uses the block.
 */
import {
	frame,
	type FrameProps,
	type OwnProps,
	type PresetProps,
} from '#integrations/react/frame.js';
import Image from '#primitives/image/Image.js';
import { PARTS } from './Card.parts.ts';
import { DEFAULT_PRESET, PRESETS } from './Card.presets.ts';
import { PROPS } from './Card.props.ts';

/** Everything the Card takes: its props (Card.props.ts), `preset`, `content`, and any HTML attribute. */
export type CardProps = OwnProps< typeof PROPS > &
	PresetProps< typeof PARTS, typeof PRESETS >;

function CardMarkup( {
	variant = PROPS.variant.default,
	composition = PROPS.composition.default,
	// WHY no default: no URL means no background.
	imageSrc,
	imageAlt = PROPS.imageAlt.default,
	imageId,
	overlay = PROPS.overlay.default,
	contentAlign = PROPS.contentAlign.default,
	contentPosition = PROPS.contentPosition.default,
	aspectRatio = PROPS.aspectRatio.default,
	children,
	className,
	area,
	...props
}: FrameProps< typeof PROPS > ) {
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
			{ imageSrc ? (
				<div className="ucf-c-card__background">
					<Image
						className="ucf-c-card__image"
						url={ imageSrc }
						alt={ imageAlt }
						id={ imageId }
					/>
				</div>
			) : null }
			{ imageSrc ? (
				<div className="ucf-c-card__overlay" data-overlay={ overlay } />
			) : null }
			{ area(
				'content',
				{ className: 'ucf-c-card__content' },
				children
			) }
		</div>
	);
}

/**
 * A box with any content inside. Start from a preset and fill its parts, or pass any children:
 *
 *   <Card preset="pathway" content={ { eyebrow: 'Transfer', display: 'Your path to UCF' } } />
 *   <Card variant="boxed">…</Card>
 *
 * Its props, presets and parts: Card.props.ts, Card.presets.ts, Card.parts.ts.
 */
const Card = frame( CardMarkup, {
	// Who it is
	slug: 'card',
	title: 'Card', // SYNC: block.json's title
	kind: 'content',

	// What it takes
	props: PROPS,
	parts: PARTS,
	presets: PRESETS,
	defaultPreset: DEFAULT_PRESET,

	// WordPress only
	wpIcon: 'postFeaturedImage',
} );

export default Card;
