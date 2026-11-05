/**
 * CONTEXT: what a component's prop definitions (`PROPS` in `{Name}.props.ts`) look
 * like. They hold every prop the component's editors can set, once: its type, its values, its
 * default, and its field (how an editor sees it: label, control, panel). Each consumer builds
 * what it needs from them:
 *
 *   - the component: its prop types (`PropsOf`) and defaults (`PROPS.{key}.default`)
 *   - WordPress: block.json's attributes (`blockAttributes()` in integrations/wp/attributes.ts,
 *     checked by integrations/tests/parity.test.tsx) and the sidebar (`FieldControl` in
 *     integrations/wp/inspector.tsx, and `panelsOf()` here)
 *   - Puck: its fields (`puckFields()` in integrations/puck/config.ts) and defaults
 *     (`defaultsIn()` here)
 *   - Storybook: the controls (integrations/storybook/arg-types.ts)
 *
 * WHY one place: the names, values, defaults and labels were written into the component's
 * props, an options file, block.json, and each adapter's own copy of the props type. Nothing
 * tied the prop's values to the editor's options, or the component's defaults to block.json's.
 * WHY plain data with no runtime imports: the content component reads its defaults from here,
 * and a content component may import nothing at runtime but its own files and this folder
 * (docs/architecture.md).
 *
 * A prop's key is its block attribute name, saved in every post that uses the block, so it is
 * permanent once a site uses it (docs/architecture.md, "Naming").
 */

/** A host a prop is edited in. */
export type Host = 'wp' | 'puck';

/** How an editor sees a prop. */
type Field = {
	/** What an editor sees. Required for a prop either host shows. */
	label?: string;
	/** A line under the field. */
	help?: string;
	/**
	 * The WordPress sidebar panel it sits in, by title. Panels appear in the order their first
	 * prop does. A prop with no panel has no field of its own in WordPress (the image ID, which
	 * the media picker sets).
	 */
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
 * Free text. `control: 'media'` marks an image's URL: WordPress shows its media library picker
 * there (integrations/wp/register.tsx draws it, from `media`), Puck a text field.
 */
export type TextProp = Field & {
	type: 'text';
	control?: 'text' | 'media';
	/**
	 * For `control: 'media'`: what the image is for, in the picker's button ("background
	 * image"), and the props the picker sets beside the URL: the media library's ID, and the
	 * alt text it clears.
	 */
	media?: { what: string; id: string; alt: string };
	default: string;
};

/** A number: the media library's attachment ID. */
export type NumberProp = Field & { type: 'number'; default: number };

export type PropDefinition = ChoiceProp | TextProp | NumberProp;

export type PropDefinitions = Record< string, PropDefinition >;

/** A prop's value: one of its options' values, or a string or number. */
type ValueOf< S > = S extends {
	type: 'choice';
	options: readonly ( infer Option )[];
}
	? Option extends { value: infer Value }
		? Value
		: never
	: S extends { type: 'number' }
		? number
		: string;

/**
 * Every prop's value, by key: the props the definitions give a component. WHY a mapped type
 * over the definitions: each prop keeps the doc comment written on its definition.
 */
export type PropsOf< S extends PropDefinitions > = {
	[ Key in keyof S ]: ValueOf< S[ Key ] >;
};

/** The keys of the props a host has. */
type KeysIn< S extends PropDefinitions, H extends Host > = {
	[ Key in keyof S ]: S[ Key ] extends { hosts: readonly ( infer Only )[] }
		? H extends Only
			? Key
			: never
		: Key;
}[ keyof S ];

/** The props a host has: Puck's leave out WordPress's media library ID. */
export type PropsIn< S extends PropDefinitions, H extends Host > = Pick<
	PropsOf< S >,
	KeysIn< S, H >
>;

/**
 * Whether a host has a prop.
 *
 * @param definition The prop's definition.
 * @param host       The host.
 */
export const inHost = ( definition: PropDefinition, host: Host ) =>
	! definition.hosts || definition.hosts.includes( host );

/**
 * Every default a host has, by key: a new component's starting props in that host.
 *
 * @param definitions A component's prop definitions.
 * @param host        The host.
 */
export function defaultsIn< S extends PropDefinitions, H extends Host >(
	definitions: S,
	host: H
): PropsIn< S, H > {
	return Object.fromEntries(
		Object.entries( definitions )
			.filter( ( [ , definition ] ) => inHost( definition, host ) )
			.map( ( [ key, definition ] ) => [ key, definition.default ] )
	) as PropsIn< S, H >;
}

/**
 * The WordPress sidebar's panels: each panel's title and its props' keys, in the order the
 * definitions first name each panel.
 *
 * @param definitions A component's prop definitions.
 */
export function panelsOf< S extends PropDefinitions >(
	definitions: S
): { title: string; keys: ( keyof S & string )[] }[] {
	const panels = new Map< string, ( keyof S & string )[] >();
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
