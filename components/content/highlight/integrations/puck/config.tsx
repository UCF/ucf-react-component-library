/**
 * The Highlight for Puck: its props as fields, with a slot for its content.
 *
 * WHY the slot is passed as `innerAs`: Puck renders a slot as an element of its own. Passed as
 * the Highlight's inner element, Puck's drop zone is that element, so the markup matches what
 * the Highlight renders in Next, with no extra wrapper.
 * The fields and their defaults come from the prop definitions (Highlight.props.ts), so a new
 * Highlight starts the same here as in WordPress.
 */
import Highlight from '../../Highlight.tsx';
import { PARTS } from '../../Highlight.parts.ts';
import { DEFAULT_PRESET, presetNamed } from '../../Highlight.presets.ts';
import { PROPS } from '../../Highlight.props.ts';
import {
	puckFields,
	type PuckComponentConfig,
	type PuckSlot,
} from '../../../../../integrations/puck/config.ts';
import { toPrimitives } from '../../../../../integrations/puck/primitives.mapper.ts';
import { resolveParts } from '../../../../../integrations/schema/parts.ts';
import {
	defaultsIn,
	type PropsIn,
} from '../../../../../integrations/schema/props.ts';

type Props = PropsIn< typeof PROPS, 'puck' > & {
	content: PuckSlot;
};

const config: PuckComponentConfig< Props > = {
	label: 'Highlight',
	fields: { content: { type: 'slot' }, ...puckFields( PROPS ) },
	defaultProps: { ...defaultsIn( PROPS, 'puck' ), content: [] },
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
 * What a new Highlight starts with: the default preset's parts (Highlight.presets.ts) as
 * primitives, as in WordPress. SYNC: named TEMPLATE in every frame's Puck config.
 * WHY the source has no link here: the Paragraph primitive is plain text. In WordPress the
 * source is a core paragraph, which can hold one.
 */
export const TEMPLATE: PuckSlot = toPrimitives(
	resolveParts( PARTS, DEFAULT_PRESET.parts )
);

/**
 * The Highlight, starting with components already in its slot. Opt-in, as the Card's is
 * (components/content/card/integrations/puck/config.tsx says why).
 *
 * @param content The components a new Highlight starts with, in order. TEMPLATE by default.
 */
export function withTemplate(
	content: PuckSlot = TEMPLATE
): PuckComponentConfig< Props > {
	return { ...config, defaultProps: { ...config.defaultProps, content } };
}

/**
 * The Highlight as one of its presets (Highlight.presets.ts), whole: its props, its parts, and
 * its title as the label. Puck has no block variations, so a host registers each preset it
 * wants as its own component (`KeyFigure: withPreset( 'key-figure' )`).
 *
 * @param name A preset's name in Highlight.presets.ts.
 */
export function withPreset( name: string ): PuckComponentConfig< Props > {
	const preset = presetNamed( name );
	return {
		...config,
		label: preset.title,
		defaultProps: {
			...config.defaultProps,
			...preset.props,
			content: toPrimitives( resolveParts( PARTS, preset.parts ) ),
		},
	};
}

/**
 * @deprecated `withPreset( name )` now. Kept because ucf-puck-demo still imports it.
 */
export const withVariation = withPreset;
