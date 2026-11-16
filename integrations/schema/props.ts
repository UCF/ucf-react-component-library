/**
 * Props: what a component's PROPS may hold.
 *
 * Each prop's type, values and default, and how an editor sees it. Each environment builds its own
 * fields from them (docs/architecture.md, "One definition, one translator per environment").
 * SYNC: each key is a saved block attribute, permanent once a site uses it.
 */

// ── Shapes ─────────────────────────────────────────────────────────────────────────────────────
//
// What a prop can be: its type, values and default, and how an editor sees it.

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
 * (the Search Service's colleges). integrations/react/options.ts runs each loader once a page.
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

/** One link: its text, and where it goes (`#apply` on the same page, or any address). */
export type Link = { readonly label: string; readonly href: string };

/**
 * Any number of links, in order, each typed in or set by the block: a Section Nav's.
 * WHY its own type, not a list: a list's values come from fixed options, and a link's text and
 * address are an editor's own.
 */
export type LinksProp = Field & {
	type: 'links';
	default: readonly Link[];
};

export type PropDefinition =
	ChoiceProp | TextProp | NumberProp | ListProp | LinksProp;

export type PropDefinitions = Record< string, PropDefinition >;

// ── Types ──────────────────────────────────────────────────────────────────────────────────────
//
// The props a component gets from its PROPS.

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
			: Definition extends { type: 'links' }
				? // UPSTREAM: Puck's array field takes a mutable array only.
					Link[]
				: string;

/** The props, typed. WHY a mapped type: each prop keeps the doc comment on its definition. */
export type PropsOf< Props extends PropDefinitions > = {
	[ Key in keyof Props ]: ValueOf< Props[ Key ] >;
};

type KeysIn< Props extends PropDefinitions, InHost extends Host > = {
	[ Key in keyof Props ]: Props[ Key ] extends {
		hosts: readonly ( infer Hosts )[];
	}
		? InHost extends Hosts
			? Key
			: never
		: Key;
}[ keyof Props ];

/** The props one host has. */
export type PropsIn<
	Props extends PropDefinitions,
	InHost extends Host,
> = Pick< PropsOf< Props >, KeysIn< Props, InHost > >;

// ── Reading props ──────────────────────────────────────────────────────────────────────────────
//
// What the components and environments call.

/**
 * Whether a host has a prop.
 *
 * @param definition A prop.
 * @param host       A host.
 */
export const inHost = ( definition: PropDefinition, host: Host ) =>
	! definition.hosts || definition.hosts.includes( host );

/**
 * A new component's starting props, in one host.
 *
 * @param definitions A component's PROPS.
 * @param host        A host.
 */
export function defaultsIn<
	Props extends PropDefinitions,
	InHost extends Host,
>( definitions: Props, host: InHost ): PropsIn< Props, InHost > {
	return Object.fromEntries(
		Object.entries( definitions )
			.filter( ( [ , definition ] ) => inHost( definition, host ) )
			.map( ( [ key, definition ] ) => [ key, definition.default ] )
	) as PropsIn< Props, InHost >;
}

/**
 * The WordPress sidebar's panels and their props, in order.
 *
 * @param definitions A component's PROPS.
 */
export function panelsOf< Props extends PropDefinitions >(
	definitions: Props
): { title: string; keys: ( keyof Props & string )[] }[] {
	const panels = new Map< string, ( keyof Props & string )[] >();
	for ( const [ key, definition ] of Object.entries( definitions ) ) {
		if ( definition.panel && inHost( definition, 'wp' ) ) {
			panels.set( definition.panel, [
				...( panels.get( definition.panel ) ?? [] ),
				key,
			] );
		}
	}
	return [ ...panels ].map( ( [ title, keys ] ) => ( { title, keys } ) );
}

/**
 * The props that hold an image's URL (`control: 'media'`), in order.
 *
 * @param definitions A component's prop definitions.
 */
export const mediaProps = ( definitions: PropDefinitions ) =>
	Object.entries( definitions )
		.filter(
			( [ , definition ] ) =>
				'control' in definition && definition.control === 'media'
		)
		.map( ( [ key ] ) => key );
