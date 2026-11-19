/**
 * Step 6 · every host · how the hosts read a component's props: which props each host has, their
 * defaults, WordPress's sidebar panels and the image props.
 *
 * A component's PROPS are written with prop-definitions.ts, beside this file.
 *
 * A component's own host files call some of these too: its Puck config and stories use
 * defaultsIn(), and a live block's hand-written edit.tsx uses panelsOf().
 */

import type {
	Host,
	PropDefinition,
	PropDefinitions,
	PropsOf,
} from './prop-definitions.ts';

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
