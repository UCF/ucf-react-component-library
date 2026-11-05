/**
 * CONTEXT: a component with a `preset` prop, for a plain React site: the preset sets the starting
 * props and the parts, and `content` fills each part by name.
 *
 *   <Card
 *     preset="pathway"
 *     content={ { eyebrow: 'Transfer', display: 'I am transferring', link: { text, url } } }
 *   />
 *
 * How the data flows: the preset's props, then the props passed (which win); the preset's parts,
 * in its order, each filled from `content[ part ]`; and the result handed to the component as its
 * children, which it renders in its content area as it would WordPress's inner blocks or Puck's
 * slot. `children`, when passed, replace the parts: a frame stays open.
 *
 * WHY a wrapper, not a prop on the component itself: the component's markup is what WordPress
 * saves in every post. WordPress and Puck import the component directly; only its package entry
 * (`@ucf/components/{name}`) exports this version, so nothing they store changes.
 * WHY a part with no content is left out: so a preset's sample copy can't reach a live page by
 * accident. `sample` shows it, for prototyping.
 * integrations/tests/react.test.tsx checks every wrapped component.
 */
import type { ComponentType, ReactElement, ReactNode } from 'react';

import imageExample from '../../components/primitives/image/example.json' with { type: 'json' };
import {
	resolveParts,
	type Kind,
	type Looks,
	type PartOf,
	type ResolvedPart,
} from '../schema/parts.ts';
import type { ComponentDefinition } from '../schema/definition.ts';
import { findPreset } from '../schema/presets.ts';
import type { PropDefinitions } from '../schema/props.ts';
import { renderParts } from './parts.tsx';

/** What a site passes for one part, by its kind. */
type ContentFor< K extends Kind > = K extends 'text' | 'heading'
	? string
	: K extends 'link' | 'button'
		? { text: string; url: string }
		: { url: string; alt?: string };

/** The content a site passes for a component's parts, by each part's name in its PARTS. */
export type ContentOf< L extends Looks > = {
	[ Name in keyof L ]?: ContentFor< L[ Name ][ 'kind' ] >;
};

/** The props a wrapped component takes besides its own. */
export type PresetProps< L extends Looks > = {
	/** A preset's name in the component's presets: its props and parts are the start. */
	preset?: string;
	/** Each part's content, by its name in the component's PARTS. */
	content?: ContentOf< L >;
	/**
	 * Show the preset's sample text and image for parts with no content, and a sample
	 * background image where the preset has one. For prototyping; never on a live page.
	 */
	sample?: boolean;
};

/**
 * A wrapped component's props: its own, and `preset`, `content` and `sample`.
 * WHY its own `content` left out: every element takes an HTML `content` attribute, which a frame's
 * `<div>` has no use for; ours is the parts' content.
 */
export type WithPresetsProps< Props, L extends Looks > = Omit<
	Props,
	keyof PresetProps< L >
> &
	PresetProps< L >;

/**
 * A preset's parts, filled: each part's content from `content`, or its sample (with `sample`),
 * or left out.
 *
 * @param resolved Its parts, from resolveParts().
 * @param names    Each part's name, in the same order.
 * @param content  The site's content, by part name.
 * @param sample   Whether a part with no content shows the preset's.
 */
function fill(
	resolved: ResolvedPart[],
	names: string[],
	content: Record< string, unknown >,
	sample: boolean
): ResolvedPart[] {
	return resolved.flatMap( ( part, index ): ResolvedPart[] => {
		const given = content[ names[ index ] ?? '' ];
		if ( given === undefined ) {
			if ( ! sample ) {
				return [];
			}
			return [
				part.kind === 'image'
					? { ...part, url: part.url ?? imageExample.url }
					: part,
			];
		}
		// A string is a text or heading part's text; an object, the fields it carries.
		return [
			typeof given === 'string'
				? ( { ...part, text: given } as ResolvedPart )
				: ( { ...part, ...( given as object ) } as ResolvedPart ),
		];
	} );
}

/**
 * A component that takes `preset`, `content` and `sample` besides its own props.
 *
 * @param Component              Its component (`Card.tsx`'s default export).
 * @param looks                  Its PARTS.
 * @param presets                Its PRESETS.
 * @param options                What else it needs.
 * @param options.backgroundProp The prop a preset's sample background goes in (`imageSrc`).
 */
export function withPresets<
	Props extends { children?: ReactNode },
	L extends Looks,
>(
	Component: ComponentType< Props >,
	looks: L,
	presets: readonly {
		name: string;
		props: Partial< Props >;
		background?: boolean;
		parts: PartOf< L >[];
	}[],
	{ backgroundProp = 'imageSrc' }: { backgroundProp?: string } = {}
) {
	function WithPresets( {
		preset: name,
		content = {},
		sample = false,
		...props
	}: WithPresetsProps< Props, L > ): ReactElement {
		if ( ! name ) {
			return <Component { ...( props as unknown as Props ) } />;
		}
		const preset = findPreset( presets, name );
		const parts = fill(
			resolveParts( looks, preset.parts ),
			preset.parts.map( ( part ) => part.part ),
			content as Record< string, unknown >,
			sample
		);
		return (
			<Component
				{ ...( preset.props as Props ) }
				// A sample background, as Puck and the stories show one.
				{ ...( sample &&
					preset.background && {
						[ backgroundProp ]: imageExample.url,
					} ) }
				{ ...( props as unknown as Props ) }
			>
				{ props.children ?? renderParts( parts ) }
			</Component>
		);
	}
	WithPresets.displayName = `withPresets( ${
		Component.displayName ?? Component.name
	} )`;
	/** Its presets, so a test or a site can list them. */
	WithPresets.presets = presets;
	/** Its PARTS. */
	WithPresets.looks = looks;
	return WithPresets;
}

/**
 * A component made by presetComponent(): it renders with `Props`, and carries its presets and
 * PARTS for a test or a site to list.
 */
export type PresetComponent< Props > = ( ( props: Props ) => ReactElement ) & {
	displayName: string;
	presets: readonly {
		name: string;
		props: Record< string, unknown >;
		parts: unknown[];
	}[];
	looks: Looks;
};

/**
 * The React translator: a component's definition as a component that takes `preset` and
 * `content` besides everything its frame takes. What its package entry exports
 * (`@ucf/components/card`'s `Card`).
 *
 * @param definition The component's definition (integrations/schema/definition.ts).
 */
export function presetComponent<
	Definitions extends PropDefinitions,
	L extends Looks,
	ComponentProps extends { children?: ReactNode },
>(
	definition: ComponentDefinition< Definitions, L, ComponentProps >
): PresetComponent< WithPresetsProps< ComponentProps, L > > {
	// UPSTREAM: the presets' props are the definitions' (a subset of the component's), which
	// TypeScript can't relate inside a function for any component.
	return withPresets< ComponentProps, L >(
		definition.component,
		definition.parts,
		definition.presets as unknown as Parameters<
			typeof withPresets< ComponentProps, L >
		>[ 2 ],
		{ backgroundProp: mediaProps( definition.props )[ 0 ] }
	) as unknown as PresetComponent< WithPresetsProps< ComponentProps, L > >;
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
