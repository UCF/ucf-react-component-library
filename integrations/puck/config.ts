/**
 * CONTEXT: the shape of a Puck component config, written out here so the library does not
 * depend on Puck.
 *
 * A Puck site imports a component's config (`@ucf/components/highlight/puck`) and adds it to its
 * own `config.components`. Puck stores the props as JSON and calls `render` on every request,
 * so a Puck host has none of WordPress's saved-markup limits.
 *
 * UPSTREAM: follows `@puckeditor/core`'s `ComponentConfig` (0.24) for the parts used here.
 * Puck needs a field for every prop and complete `defaultProps`.
 * integrations/tests/puck.test.tsx checks every config against the real Puck types, so a change
 * in Puck fails `npm run typecheck`.
 */
import type { ElementType, ReactElement } from 'react';

import { inHost, type PropDefinitions, type PropsIn } from '../schema/props.ts';

type Option = { label: string; value: string };

/** A field for a string: free text, or one of a list. */
export type PuckScalarField =
	| { type: 'text' | 'textarea'; label?: string }
	| { type: 'select' | 'radio'; label?: string; options: Option[] };

/** A slot: the components placed inside. */
export type PuckSlotField = { type: 'slot'; label?: string; allow?: string[] };

/**
 * A group of fields stored as one object: a card's content, a link's text and address.
 *
 * UPSTREAM: Puck types `objectFields` by the object's own shape, so this does too.
 */
export type PuckObjectField< Value > = {
	type: 'object';
	label?: string;
	objectFields: {
		[ Key in keyof Value ]-?: PuckFieldFor< NonNullable< Value[ Key ] > >;
	};
};

/** The field Puck takes for a prop of type `Value`. */
export type PuckFieldFor< Value > = [ Value ] extends [ PuckSlot ]
	? PuckSlotField
	: Value extends readonly ( infer Item )[]
		? PuckArrayField< Item >
		: Value extends object
			? PuckObjectField< Value >
			: PuckScalarField;

/** Any field. */
export type PuckField =
	| PuckScalarField
	| PuckSlotField
	| PuckObjectField< Record< string, unknown > >;

/**
 * A list of items, each with its own fields: the Hero's badges. Only a prop that holds a list
 * (and isn't a slot) may use it.
 *
 * UPSTREAM: Puck types `arrayFields` and `defaultItemProps` by the item's own shape, so this
 * does too, or no config would fit Puck's `ComponentConfig`.
 */
export type PuckArrayField< Item > = {
	type: 'array';
	label?: string;
	arrayFields: { [ Key in keyof Item ]: PuckField };
	defaultItemProps?: Item;
};

/**
 * A slot prop as Puck stores it: the components dropped into it. `render` receives a
 * component that draws them instead (PuckRenderInput).
 *
 * SYNC: `Slot` in `@puckeditor/core`. Puck turns a prop into a slot only when its type matches
 * Puck's own, which integrations/tests/puck.test.tsx checks.
 */
export type PuckSlot = {
	type: string;
	props: { id?: string; [ key: string ]: unknown };
}[];

/** The props `render` gets: each slot prop arrives as a component that draws its contents. */
export type PuckRenderInput< Props > = {
	[ Key in keyof Props ]: Props[ Key ] extends PuckSlot
		? ElementType
		: Props[ Key ];
};

/**
 * What Puck passes to `render` besides the component's own props.
 *
 * WHY listed: `render` must not hand these to the component. A component that spreads its
 * other props onto its root element (Highlight does) would put them in the markup.
 */
export type PuckRenderProps = {
	id?: string;
	puck?: unknown;
	editMode?: boolean;
};

export type PuckComponentConfig< Props > = {
	label?: string;
	fields: {
		[ Key in keyof Props ]: PuckFieldFor< Props[ Key ] >;
	};
	defaultProps: Props;
	render: (
		props: PuckRenderInput< Props > & PuckRenderProps
	) => ReactElement;
	/**
	 * Called when a field changes: returns props to store. A component with presets applies
	 * the preset's props when the editor picks one (integrations/puck/presets.ts).
	 */
	resolveData?: (
		data: { props: Props },
		params: { changed: Partial< Record< keyof Props, boolean > > }
	) => { props: Partial< Props > };
	/**
	 * Called when a field changes: returns the fields to show. A component with presets shows
	 * only the current preset's parts.
	 */
	resolveFields?: (
		data: { props: Props },
		// UPSTREAM: Puck passes its own field types here, wider than ours; this config's are in
		// `fields` above.
		params: { fields: Record< string, unknown > }
	) => PuckComponentConfig< Props >[ 'fields' ];
};

/**
 * Prop definitions as Puck fields: radio buttons or a select for a choice, a text field
 * otherwise, for every prop Puck has.
 *
 * @param definitions A component's prop definitions.
 */
export function puckFields< S extends PropDefinitions >(
	definitions: S
): Record< keyof PropsIn< S, 'puck' >, PuckScalarField > {
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
					: { type: 'text', label: definition.label },
			] )
	) as Record< keyof PropsIn< S, 'puck' >, PuckScalarField >;
}
