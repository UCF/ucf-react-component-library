/**
 * CONTEXT: the Puck translator: a component's definition (integrations/schema/definition.ts) as
 * Puck's config. Its props become fields, its presets a Design picker and a field per part
 * (integrations/puck/presets.ts); Puck stores `{ preset, content }` and renders the same
 * component a React site does (integrations/react/with-presets.tsx). The "Open" design is the
 * frame with a slot (`blocks`) instead, for any components.
 *
 *   const { config, withPreset, withTemplate } = puckConfig( card );   // its puck/config.tsx
 *
 * WHY the slot is passed as `innerAs`: Puck renders a slot as an element of its own. Passed as
 * the frame's inner element, Puck's drop zone is that element, with no extra wrapper.
 * WHY Puck starts a component as WordPress does: its defaults, then its default preset's props
 * (WordPress inserts a block as its default variation). integrations/tests/parity.test.tsx
 * checks.
 */
import type { ComponentType } from 'react';

import imageExample from '../../components/primitives/image/example.json' with { type: 'json' };
import { presetComponent, mediaProps } from '../react/with-presets.tsx';
import type { ComponentDefinition } from '../schema/definition.ts';
import { resolveParts, type Looks } from '../schema/parts.ts';
import { findPreset } from '../schema/presets.ts';
import {
	defaultsIn,
	type PropDefinitions,
	type PropsIn,
} from '../schema/props.ts';
import {
	puckFields,
	type PuckComponentConfig,
	type PuckSlot,
} from './config.ts';
import {
	applyPreset,
	presetFields,
	presetFieldsFor,
	type PresetPuckProps,
} from './presets.ts';
import { toPrimitives } from './primitives.mapper.ts';

/** The props a component's Puck config stores: its own (Puck's), and its preset's. */
export type PuckPropsOf<
	Definitions extends PropDefinitions,
	L extends Looks,
> = PropsIn< Definitions, 'puck' > & PresetPuckProps< L >;

/**
 * A component's Puck config, and the variants a host registers.
 *
 * @param definition The component's definition.
 */
export function puckConfig<
	Definitions extends PropDefinitions,
	L extends Looks,
>( definition: ComponentDefinition< Definitions, L > ) {
	type Props = PuckPropsOf< Definitions, L >;
	const {
		component: Frame,
		title,
		props: definitions,
		parts,
		presets,
		defaultPreset,
	} = definition;
	// WHY loosely typed: render passes whatever props Puck stored for this component.
	const WithPresets = presetComponent(
		definition
	) as unknown as ComponentType< Record< string, unknown > >;
	const images = mediaProps( definitions );

	const fields = {
		...presetFields( parts, presets ),
		...puckFields( definitions ),
	} as PuckComponentConfig< Props >[ 'fields' ];

	const config: PuckComponentConfig< Props > = {
		label: title,
		fields,
		defaultProps: {
			...defaultsIn( definitions, 'puck' ),
			...defaultPreset.props,
			preset: defaultPreset.name,
			content: {},
			blocks: [],
		} as Props,
		resolveData: applyPreset< Props >(
			presets as readonly { name: string; props: Partial< Props > }[]
		),
		// UPSTREAM: inside a function for any component, TypeScript can't resolve the fields'
		// exact types; the config returned keeps them.
		resolveFields: presetFieldsFor(
			presets,
			fields as unknown as { content: { objectFields: object } }
		) as unknown as PuckComponentConfig< Props >[ 'resolveFields' ],
		// FIX: only the component's own props; Puck's `id`, `puck` and `editMode` would reach
		// the markup.
		render: ( {
			id,
			puck,
			editMode,
			preset,
			content,
			blocks,
			...props
		} ) =>
			preset ? (
				<WithPresets
					{ ...props }
					// WHY: an empty image field means none, not "override the preset's sample".
					{ ...Object.fromEntries(
						images.map( ( key ) => [
							key,
							( props as Record< string, unknown > )[ key ] ||
								undefined,
						] )
					) }
					preset={ preset }
					content={ content }
					// In the editor, an empty part shows the preset's sample text; published,
					// it is left out.
					sample={ Boolean(
						( puck as { isEditing?: boolean } | undefined )
							?.isEditing
					) }
				/>
			) : (
				<Frame { ...props } innerAs={ blocks } />
			),
	};

	/**
	 * What the open frame's slot starts with in withTemplate(): the default preset's parts as
	 * primitives.
	 */
	const TEMPLATE: PuckSlot = toPrimitives(
		resolveParts( parts, defaultPreset.parts )
	);

	/**
	 * The component as the open frame, starting with components already in its slot.
	 *
	 * WHY opt-in: a slot names its contents by the keys the host registered them under, and a
	 * host that hasn't registered the primitives would get items Puck can't draw. The plain
	 * config needs no primitives: a preset's parts render through the component itself.
	 *
	 * @param blocks The components the slot starts with, in order. TEMPLATE by default; pass
	 *               your own when the host registered the primitives under other keys.
	 */
	const withTemplate = (
		blocks: PuckSlot = TEMPLATE
	): PuckComponentConfig< Props > => ( {
		...config,
		defaultProps: { ...config.defaultProps, preset: '', blocks },
	} );

	/**
	 * The component starting on one of its presets: its props, a sample background image when
	 * it has one, and its title as the label. Puck has no block variations, so a host
	 * registers each preset it wants as its own component
	 * (`PathwayCard: withPreset( 'pathway' )`).
	 *
	 * @param name A preset's name.
	 */
	const withPreset = ( name: string ): PuckComponentConfig< Props > => {
		const preset = findPreset( presets, name );
		return {
			...config,
			label: preset.title,
			defaultProps: {
				...config.defaultProps,
				...preset.props,
				preset: preset.name,
				...Object.fromEntries(
					images
						.slice( 0, 1 )
						.map( ( key ) => [
							key,
							preset.background ? imageExample.url : '',
						] )
				),
			} as Props,
		};
	};

	return { config, TEMPLATE, withTemplate, withPreset };
}
