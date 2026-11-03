/**
 * The Card for Puck: the frame's settings as fields, with a slot for its content.
 *
 * WHY the slot is passed as `innerAs`: Puck renders a slot as an element of its own. Passed as
 * the frame's inner element, Puck's drop zone is that element, so the markup matches what the
 * frame renders in Next, with no extra wrapper.
 * WHY no image ID field: it is the WordPress media library's; Puck sites choose images by URL
 * (`WORDPRESS_ONLY` in components/_config/parity.test.tsx).
 */
import imageExample from '../../../../primitives/image/example.json' with { type: 'json' };
import Card, { PARTS, type CardProps } from '../../Card.tsx';
import example from '../../example.json' with { type: 'json' };
import { CHOICES, type ChoiceKey } from '../../options.ts';
import { VARIATIONS, type Part } from '../../variations.ts';
import type {
	PuckComponentConfig,
	PuckField,
	PuckSlot,
} from '../../../_config/puck.ts';

type Props = {
	[ Key in ChoiceKey ]: NonNullable< CardProps[ Key ] >;
} & { imageSrc: string; imageAlt: string; content: PuckSlot };

const choice = ( key: ChoiceKey ): PuckField => {
	const { label, control, options } = CHOICES[ key ];
	return {
		type: control,
		label,
		options: options.map( ( option ) => ( { ...option } ) ),
	};
};

const config: PuckComponentConfig< Props > = {
	label: 'Card',
	fields: {
		content: { type: 'slot' },
		variant: choice( 'variant' ),
		composition: choice( 'composition' ),
		contentAlign: choice( 'contentAlign' ),
		contentPosition: choice( 'contentPosition' ),
		aspectRatio: choice( 'aspectRatio' ),
		imageSrc: { type: 'text', label: 'Background image URL' },
		imageAlt: {
			type: 'text',
			label: 'Background image alt text (usually empty)',
		},
		overlay: choice( 'overlay' ),
	},
	defaultProps: { ...( example as Omit< Props, 'content' > ), content: [] },
	// FIX: only the frame's own props; Puck's `id`, `puck` and `editMode` would reach the markup.
	render: ( { id, puck, editMode, content, ...props } ) => (
		<Card { ...( props as CardProps ) } innerAs={ content } />
	),
};

export default config;

/**
 * A design's parts (variations.ts) as the library's primitives.
 *
 * SYNC: each `type` is the key a host registers the primitive under (README: `Image`,
 * `Heading`, `Paragraph`, `Button`). Every item sets every prop its primitive has: Puck doesn't
 * merge a template item with the component's defaults.
 *
 * @param parts A design's parts.
 */
export function toPrimitives( parts: Part[] ): PuckSlot {
	return parts.map( ( part ) => {
		switch ( part.kind ) {
			case 'image':
				return {
					type: 'Image',
					props: {
						url: imageExample.url,
						alt: '',
						aspectRatio: part.aspectRatio,
						className: '',
					},
				};
			case 'heading':
				return {
					type: 'Heading',
					props: {
						content: part.text,
						level: String( part.level ),
						className: part.part ? PARTS[ part.part ] : '',
					},
				};
			case 'text':
				return {
					type: 'Paragraph',
					props: {
						content: part.text,
						className: part.part ? PARTS[ part.part ] : '',
					},
				};
			// 'link' and 'button': both the Button primitive.
			default:
				return {
					type: 'Button',
					props: {
						text: part.text,
						url: part.url,
						linkTarget: '',
						variant: part.kind === 'link' ? 'text' : 'fill',
						fontSize: '',
						className: part.kind === 'link' ? PARTS.link : '',
					},
				};
		}
	} );
}

/** What a Card starts with: the story card's parts, as in WordPress. */
export const TEMPLATE: PuckSlot = toPrimitives(
	VARIATIONS[ 0 ]?.content ?? []
);

/**
 * The Card, starting with components already in its slot.
 *
 * WHY the plain config starts empty and this is opt-in: a slot names its contents by the keys
 * the host registered them under, and a host that hasn't registered the primitives would get
 * items Puck can't draw. Puck gives each item an id when the frame is inserted, so the
 * template needs none.
 * WHY a starting point, not a lock: as in WordPress, editors may change, move or remove it.
 *
 * @param content The components a new Card starts with, in order. TEMPLATE by default.
 */
export function withTemplate(
	content: PuckSlot = TEMPLATE
): PuckComponentConfig< Props > {
	return { ...config, defaultProps: { ...config.defaultProps, content } };
}

/**
 * The Card as one of the UCF card designs (variations.ts): its settings, a sample background
 * image when it has one, and its parts. Puck has no block variations; a host registers each
 * design it wants as its own component (`PathwayCard: withVariation( 'pathway' )`).
 *
 * @param name A design's name in variations.ts.
 */
export function withVariation( name: string ): PuckComponentConfig< Props > {
	const variation = VARIATIONS.find( ( item ) => item.name === name );
	if ( ! variation ) {
		throw new Error( `There is no card design "${ name }".` );
	}
	return {
		...config,
		label: variation.title,
		defaultProps: {
			...config.defaultProps,
			...( variation.settings as Partial< Props > ),
			imageSrc: variation.background ? imageExample.url : '',
			content: toPrimitives( variation.content ),
		},
	};
}
