/**
 * Puck: the shape of a Puck config, without depending on Puck.
 *
 * UPSTREAM: follows `@puckeditor/core`'s `ComponentConfig` (0.24); tests/puck.test.tsx checks every
 * config against the real types.
 */

import type { ElementType, ReactElement } from 'react';

// ── Fields ─────────────────────────────────────────────────────────────────────────────────────

type Option = { label: string; value: string };

/** A field for a string: free text, or one of a list. */
export type PuckScalarField =
	| { type: 'text' | 'textarea'; label?: string }
	| { type: 'select' | 'radio'; label?: string; options: Option[] };

// ── Slots and render ───────────────────────────────────────────────────────────────────────────

/** A slot: the components placed inside. */
export type PuckSlotField = { type: 'slot'; label?: string; allow?: string[] };

/**
 * A group of fields stored as one object: a card's content, a link's text and address.
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
 * A list of items, each with its own fields: the Hero's badges.
 * UPSTREAM: Puck types `arrayFields` and `defaultItemProps` by the item's own shape, so this does
 * too, or no config would fit Puck's `ComponentConfig`.
 */
export type PuckArrayField< Item > = {
	type: 'array';
	label?: string;
	arrayFields: { [ Key in keyof Item ]: PuckField };
	defaultItemProps?: Item;
};

/**
 * A slot prop as Puck stores it: the components dropped into it.
 * SYNC: `Slot` in `@puckeditor/core`.
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
 * WHY listed: `render` must not hand these to the component.
 */
export type PuckRenderProps = {
	id?: string;
	puck?: unknown;
	editMode?: boolean;
};

// ── The config ─────────────────────────────────────────────────────────────────────────────────

export type PuckComponentConfig< Props > = {
	label?: string;
	fields: {
		[ Key in keyof Props ]: PuckFieldFor< Props[ Key ] >;
	};
	defaultProps: Props;
	render: (
		props: PuckRenderInput< Props > & PuckRenderProps
	) => ReactElement;
	/** Called when a field changes: returns props to store. */
	resolveData?: (
		data: { props: Props },
		params: { changed: Partial< Record< keyof Props, boolean > > }
	) => { props: Partial< Props > };
	/** Called when a field changes: returns the fields to show. */
	resolveFields?: (
		data: { props: Props },
		// UPSTREAM: Puck passes its own field types here, wider than ours; this config's are in
		// `fields` above.
		params: { fields: Record< string, unknown > }
	) => PuckComponentConfig< Props >[ 'fields' ];
};
