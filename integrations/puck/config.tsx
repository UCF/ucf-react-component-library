/**
 * Puck: a framed component as a Puck config, read through its port.
 *
 * `puckConfig( Card )` in a component's puck/config.tsx. Its props become fields, its presets a
 * Design picker; it renders the same component a React site does. "Open" fills its content area
 * with a slot instead.
 */

import type { ComponentType } from 'react';

import type { Ported } from '../react/frame.tsx';
import { resolveParts, type PartDefinitions } from '../schema/parts.ts';
import { findPreset } from '../schema/presets.ts';
import {
	defaultsIn,
	inHost,
	mediaProps,
	type PropDefinitions,
	type PropsIn,
} from '../schema/props.ts';
import {
	type PuckScalarField,
	type PuckComponentConfig,
	type PuckSlot,
} from './types.ts';
import {
	applyPreset,
	presetFields,
	presetFieldsFor,
	type PresetPuckProps,
} from './presets.ts';
import { toPrimitives } from './parts.ts';

// ── Fields ─────────────────────────────────────────────────────────────────────────────────────

/**
 * Prop definitions as Puck fields: radio buttons or a select for a choice, a text field otherwise,
 * for every prop Puck has.
 *
 * @param definitions A component's prop definitions.
 */
export function puckFields< Props extends PropDefinitions >(
	definitions: Props
): Record< keyof PropsIn< Props, 'puck' >, PuckScalarField > {
	return Object.fromEntries(
		Object.entries( definitions )
			.filter( ( [ , definition ] ) => inHost( definition, 'puck' ) )
			.map( ( [ key, definition ] ): [ string, PuckScalarField ] => [
				key,
				definition.type === 'choice'
					? {
							type: definition.control,
							label: definition.label,
							options: definition.options.map( ( option ) => ( {
								...option,
							} ) ),
						}
					: {
							type:
								'control' in definition &&
								definition.control === 'multiline'
									? 'textarea'
									: 'text',
							label: definition.label,
						},
			] )
	) as Record< keyof PropsIn< Props, 'puck' >, PuckScalarField >;
}

// ── The config ─────────────────────────────────────────────────────────────────────────────────

/** The props a component's Puck config stores: its own (Puck's), and its preset's. */
export type PuckPropsOf<
	Props extends PropDefinitions,
	Parts extends PartDefinitions,
> = PropsIn< Props, 'puck' > & PresetPuckProps< Parts >;

/**
 * A component's Puck config, and the variants a host registers.
 *
 * @param component The component, from frame().
 */
export function puckConfig<
	Props extends PropDefinitions,
	Parts extends PartDefinitions,
>( component: Ported< Props, Parts > ) {
	type StoredProps = PuckPropsOf< Props, Parts >;
	const {
		title,
		props: definitions,
		parts,
		presets,
		defaultPreset,
	} = component.port;
	// WHY loosely typed: render passes whatever props Puck stored for this component.
	const Component = component as unknown as ComponentType<
		Record< string, unknown >
	>;
	const Frame = component.port.Frame as unknown as ComponentType<
		Record< string, unknown >
	>;
	const images = mediaProps( definitions );
	// WHY: a component with no presets (the Section) is always open: its props, and a slot.
	const hasPresets = presets.length > 0;

	const fields = (
		hasPresets
			? {
					...presetFields( parts, presets ),
					...puckFields( definitions ),
				}
			: { blocks: { type: 'slot' }, ...puckFields( definitions ) }
	) as PuckComponentConfig< StoredProps >[ 'fields' ];

	const presetConfig = {
		defaultProps: {
			...defaultsIn( definitions, 'puck' ),
			...defaultPreset.props,
			preset: defaultPreset.name,
			content: {},
			blocks: [],
		} as StoredProps,
		resolveData: applyPreset< StoredProps >(
			presets as readonly {
				name: string;
				props: Partial< StoredProps >;
			}[]
		),
		// UPSTREAM: inside a function for any component, TypeScript can't resolve the fields'
		// exact types; the config returned keeps them.
		resolveFields: presetFieldsFor(
			presets,
			fields as unknown as { content: { objectFields: object } }
		) as unknown as PuckComponentConfig< StoredProps >[ 'resolveFields' ],
	};

	const openConfig = {
		defaultProps: {
			...defaultsIn( definitions, 'puck' ),
			...defaultPreset.props,
			blocks: [],
		} as unknown as StoredProps,
	};

	const config: PuckComponentConfig< StoredProps > = {
		label: title,
		fields,
		...( hasPresets ? presetConfig : openConfig ),
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
				<Component
					// WHY empty image fields left out: so the preset's sample background shows in
					// the editor (`sample`), and none is published.
					{ ...Object.fromEntries(
						Object.entries( props ).filter(
							( [ key, value ] ) =>
								value || ! images.includes( key )
						)
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
				<Frame { ...props } areas={ { content: blocks } } />
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
	 * WHY opt-in: a slot names its contents by the keys the host registered them under, and a host
	 * that hasn't registered the primitives would get items Puck can't draw.
	 *
	 * @param blocks The components the slot starts with, in order.
	 */
	const withTemplate = (
		blocks: PuckSlot = TEMPLATE
	): PuckComponentConfig< StoredProps > => ( {
		...config,
		defaultProps: {
			...config.defaultProps,
			...( hasPresets && { preset: '' } ),
			blocks,
		},
	} );

	/**
	 * The component starting on one of its presets: its props, and its title as the label.
	 * FIX: no sample background in its props. Puck saves defaults into the page, so a sample there
	 * was published; render() shows one in the editor only.
	 *
	 * @param name A preset's name.
	 */
	const withPreset = ( name: string ): PuckComponentConfig< StoredProps > => {
		const preset = findPreset( presets, name );
		return {
			...config,
			label: preset.title,
			defaultProps: {
				...config.defaultProps,
				...preset.props,
				preset: preset.name,
			} as StoredProps,
		};
	};

	return { config, TEMPLATE, withTemplate, withPreset };
}
