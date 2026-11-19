/**
 * Step 2 · every component · the types you describe props with, in props.ts.
 *
 * This is our contract with every host; for Puck's own config shape, see puck/types.ts.
 *
 * Each setting says what kind of value it holds (a choice, text, a number or a list), its default,
 * and how an editor shows it. WordPress, Puck and Storybook each build their own controls from this
 * one description, so you describe a setting once.
 * SYNC: each setting's key is a saved block attribute, permanent once a site uses it.
 *
 * Types only: nothing here runs. How the hosts read them is in read-props.ts, beside this file.
 */

// ── What a setting can be ──────────────────────────────────────────────────────────────────────

/** An environment that edits props. */
export type Host = 'wp' | 'puck';

/** How an editor sees a prop. */
type Field = {
	label?: string;
	/** A line under the field. */
	help?: string;
	/** Its WordPress sidebar panel. None: no field of its own (set by another, as an image ID). */
	panel?: string;
	/** Only these hosts have it. Both when left out. */
	hosts?: readonly Host[];
};

/** One of a list of values, shown as radio buttons or a select. */
export type ChoiceProp = Field & {
	type: 'choice';
	control: 'radio' | 'select';
	options: readonly { readonly value: string; readonly label: string }[];
	default: string;
};

/**
 * Free text. `control: 'multiline'`: a box for a paragraph or more. `control: 'media'`: an image's
 * URL, which WordPress picks from its media library.
 */
export type TextProp = Field & {
	type: 'text';
	control?: 'text' | 'multiline' | 'media';
	/** For a media control: what the image is for, and the ID and alt props it also sets. */
	media?: { what: string; id: string; alt: string };
	default: string;
};

/** A number: a media library ID. */
export type NumberProp = Field & { type: 'number'; default: number };

/** One value a prop may take, and what an editor sees for it. */
export type Option = { readonly value: string; readonly label: string };

/**
 * Loads a list's options when an editor opens its field: options that change without a release
 * (the Search Service's colleges). core/hosts/list-options.ts runs each loader once a page.
 */
export type OptionsLoader = (
	signal?: AbortSignal
) => Promise< readonly Option[] >;

/**
 * Any number of values from a list, stored as their values in the order chosen: the colleges a
 * Degree List shows. `options` are fixed, or loaded (OptionsLoader).
 * WHY values, not labels: a value is what an API filters by, and a label can be reworded.
 */
export type ListProp = Field & {
	type: 'list';
	options: readonly Option[] | OptionsLoader;
	default: readonly string[];
};

export type PropDefinition = ChoiceProp | TextProp | NumberProp | ListProp;

export type PropDefinitions = Record< string, PropDefinition >;

// ── What your markup gets ──────────────────────────────────────────────────────────────────────
//
// The props a component receives, typed from its PROPS: a choice's values, a number, text or a list.

type ValueOf< Definition > = Definition extends {
	type: 'choice';
	options: readonly ( infer Choice )[];
}
	? Choice extends { value: infer Value }
		? Value
		: never
	: Definition extends { type: 'number' }
		? number
		: Definition extends { type: 'list' }
			? readonly string[]
			: string;

/** The props, typed. WHY a mapped type: each prop keeps the doc comment on its definition. */
export type PropsOf< Props extends PropDefinitions > = {
	[ Key in keyof Props ]: ValueOf< Props[ Key ] >;
};
