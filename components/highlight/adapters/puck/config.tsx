/**
 * The Highlight for Puck: the frame's settings as fields, with a slot for its content.
 *
 * WHY the slot is passed as `innerAs`: Puck renders a slot as an element of its own. Passed as
 * the Highlight's inner element, Puck's drop zone is that element, so the markup matches what
 * the Highlight renders in Next, with no extra wrapper.
 */
import imageExample from '../../../../primitives/image/example.json' with { type: 'json' };
import Highlight, { PARTS, type HighlightProps } from '../../Highlight.tsx';
import example from '../../example.json' with { type: 'json' };
import { CHOICES, type ChoiceKey } from '../../options.ts';
import { VARIATIONS, type Part } from '../../variations.ts';
import type {
	PuckComponentConfig,
	PuckField,
	PuckSlot,
} from '../../../_config/puck.ts';

type Props = {
	[ Key in ChoiceKey ]: NonNullable< HighlightProps[ Key ] >;
} & { content: PuckSlot };

const choice = ( key: ChoiceKey ): PuckField => {
	const { label, control, options } = CHOICES[ key ];
	return {
		type: control,
		label,
		options: options.map( ( option ) => ( { ...option } ) ),
	};
};

const config: PuckComponentConfig< Props > = {
	label: 'Highlight',
	fields: {
		content: { type: 'slot' },
		rule: choice( 'rule' ),
		contentAlign: choice( 'contentAlign' ),
	},
	defaultProps: { ...( example as Omit< Props, 'content' > ), content: [] },
	// FIX: only the Highlight's own props; Puck's `id`, `puck` and `editMode` would reach the
	// markup.
	render: ( { rule, contentAlign, content } ) => (
		<Highlight
			rule={ rule }
			contentAlign={ contentAlign }
			innerAs={ content }
		/>
	),
};

export default config;

/**
 * A design's parts (variations.ts) as the library's primitives.
 *
 * SYNC: each `type` is the key a host registers the primitive under (README: `Image`,
 * `Paragraph`). Every item sets every prop its primitive has: Puck doesn't merge a template
 * item with the component's defaults.
 * WHY the source has no link here: the Paragraph primitive is plain text. In WordPress the
 * source is a core paragraph, which can hold one.
 *
 * @param parts A design's parts.
 */
export function toPrimitives( parts: Part[] ): PuckSlot {
	return parts.map( ( part ) =>
		part.kind === 'logo'
			? {
					type: 'Image',
					props: {
						url: imageExample.url,
						alt: part.alt,
						aspectRatio: '',
						className: PARTS.logo,
					},
				}
			: {
					type: 'Paragraph',
					props: {
						content: part.text,
						className: PARTS[ part.part ],
					},
				}
	);
}

/** What a new Highlight starts with: the statement's parts, as in WordPress. */
export const TEMPLATE: PuckSlot = toPrimitives(
	VARIATIONS[ 0 ]?.content ?? []
);

/**
 * The Highlight, starting with components already in its slot. Opt-in, as the Card's is
 * (components/card/adapters/puck/config.tsx says why).
 *
 * @param content The components a new Highlight starts with, in order. TEMPLATE by default.
 */
export function withTemplate(
	content: PuckSlot = TEMPLATE
): PuckComponentConfig< Props > {
	return { ...config, defaultProps: { ...config.defaultProps, content } };
}

/**
 * The Highlight as one of the UCF highlight designs (variations.ts). Puck has no block
 * variations; a host registers each design it wants as its own component
 * (`KeyFigure: withVariation( 'key-figure' )`).
 *
 * @param name A design's name in variations.ts.
 */
export function withVariation( name: string ): PuckComponentConfig< Props > {
	const variation = VARIATIONS.find( ( item ) => item.name === name );
	if ( ! variation ) {
		throw new Error( `There is no highlight design "${ name }".` );
	}
	return {
		...config,
		label: variation.title,
		defaultProps: {
			...config.defaultProps,
			...( variation.settings as Partial< Props > ),
			content: toPrimitives( variation.content ),
		},
	};
}
