/**
 * React: a component that takes a preset and content.
 *
 * `<Card preset="pathway" content={ { eyebrow: 'Transfer' } } />`: the preset's props (yours win),
 * its parts in order, each filled by name; `children` replace the parts.
 * WHY a wrapper, not props on the component: the component's markup is what WordPress saves.
 * WHY a part with no content is left out: sample copy must never reach a live page.
 */

import type { ComponentType, ReactElement, ReactNode } from 'react';

import imageExample from '../../components/primitives/image/example.json' with { type: 'json' };
import {
	resolveParts,
	type Kind,
	type PartDefinitions,
	type PartOf,
	type ResolvedPart,
} from '../schema/parts.ts';
import type { ComponentDefinition } from '../schema/definition.ts';
import { findPreset } from '../schema/presets.ts';
import type { PropDefinitions } from '../schema/props.ts';
import { renderParts } from './parts.tsx';

// ── Props ──────────────────────────────────────────────────────────────────────────────────────
//
// What the component takes besides its own.

/** What a site passes for one part, by its kind. */
type ContentFor< KindName extends Kind > = KindName extends 'text' | 'heading'
	? string
	: KindName extends 'link' | 'button'
		? { text: string; url: string }
		: { url: string; alt?: string };

/** The content a site passes for a component's parts, by each part's name in its PARTS. */
export type ContentOf< Parts extends PartDefinitions > = {
	[ PartName in keyof Parts ]?: ContentFor< Parts[ PartName ][ 'kind' ] >;
};

/** The props a wrapped component takes besides its own. */
export type PresetProps< Parts extends PartDefinitions > = {
	/** A preset's name in the component's presets: its props and parts are the start. */
	preset?: string;
	/** Each part's content, by its name in the component's PARTS. */
	content?: ContentOf< Parts >;
	/**
	 * Show the preset's sample text and image for parts with no content, and a sample background image
	 * where the preset has one.
	 */
	sample?: boolean;
};

/**
 * A wrapped component's props: its own, and `preset`, `content` and `sample`.
 * WHY its own `content` left out: every element takes an HTML `content` attribute, which a frame's
 * `<div>` has no use for; ours is the parts' content.
 */
export type WithPresetsProps<
	ComponentProps,
	Parts extends PartDefinitions,
> = Omit< ComponentProps, keyof PresetProps< Parts > > & PresetProps< Parts >;

// ── Filling a preset ───────────────────────────────────────────────────────────────────────────

/**
 * A preset's parts, filled: each part's content from `content`, or its sample (with `sample`), or
 * left out.
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

// ── The component ──────────────────────────────────────────────────────────────────────────────

/**
 * A component that takes `preset`, `content` and `sample` besides its own props.
 *
 * @param Component              Its component (`Card.tsx`'s default export).
 * @param partDefinitions        Its PARTS.
 * @param presets                Its PRESETS.
 * @param options                What else it needs.
 * @param options.backgroundProp The prop a preset's sample background goes in (`imageSrc`).
 */
export function withPresets<
	ComponentProps extends { children?: ReactNode },
	Parts extends PartDefinitions,
>(
	Component: ComponentType< ComponentProps >,
	partDefinitions: Parts,
	presets: readonly {
		name: string;
		props: Partial< ComponentProps >;
		background?: boolean;
		parts: PartOf< Parts >[];
	}[],
	{ backgroundProp = 'imageSrc' }: { backgroundProp?: string } = {}
) {
	function WithPresets( {
		preset: name,
		content = {},
		sample = false,
		...props
	}: WithPresetsProps< ComponentProps, Parts > ): ReactElement {
		if ( ! name ) {
			return <Component { ...( props as unknown as ComponentProps ) } />;
		}
		const preset = findPreset( presets, name );
		const parts = fill(
			resolveParts( partDefinitions, preset.parts ),
			preset.parts.map( ( part ) => part.part ),
			content as Record< string, unknown >,
			sample
		);
		return (
			<Component
				{ ...( preset.props as ComponentProps ) }
				// A sample background, as Puck and the stories show one.
				{ ...( sample &&
					preset.background && {
						[ backgroundProp ]: imageExample.url,
					} ) }
				{ ...( props as unknown as ComponentProps ) }
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
	WithPresets.partDefinitions = partDefinitions;
	return WithPresets;
}

/**
 * A component made by presetComponent(): it renders with `ComponentProps`, and carries its presets and PARTS
 * for a test or a site to list.
 */
export type PresetComponent< RenderProps > = ( (
	props: RenderProps
) => ReactElement ) & {
	displayName: string;
	presets: readonly {
		name: string;
		props: Record< string, unknown >;
		parts: unknown[];
	}[];
	partDefinitions: PartDefinitions;
};

/**
 * The React translator: a component's definition as a component that takes `preset` and `content`
 * besides everything its frame takes.
 *
 * @param definition The component's definition (integrations/schema/definition.ts).
 */
export function presetComponent<
	Props extends PropDefinitions,
	Parts extends PartDefinitions,
	ComponentProps extends { children?: ReactNode },
>(
	definition: ComponentDefinition< Props, Parts, ComponentProps >
): PresetComponent< WithPresetsProps< ComponentProps, Parts > > {
	// UPSTREAM: the presets' props are the definitions' (a subset of the component's), which
	// TypeScript can't relate inside a function for any component.
	return withPresets< ComponentProps, Parts >(
		definition.component,
		definition.parts,
		definition.presets as unknown as Parameters<
			typeof withPresets< ComponentProps, Parts >
		>[ 2 ],
		{ backgroundProp: mediaProps( definition.props )[ 0 ] }
	) as unknown as PresetComponent<
		WithPresetsProps< ComponentProps, Parts >
	>;
}

// ── Helpers ────────────────────────────────────────────────────────────────────────────────────

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
