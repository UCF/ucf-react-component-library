/**
 * Frame: how a content component is built.
 *
 * Write the component as a plain React component, then pass it to frame() with what it is:
 *
 *   function CardMarkup( { variant, children, area, ...props }: FrameProps< typeof PROPS > ) { … }
 *   const Card = frame( CardMarkup, { slug: 'card', title: 'Card', props: PROPS, … } );
 *
 * That gives back two things:
 *
 *   Card         a React component, presets and all: `<Card preset="pathway" content={ … } />`
 *   Card.port    what a host reads: the props, parts and presets, and `Frame`, the same markup
 *                with its areas open for the host to fill (inner blocks, a Puck slot)
 *
 * The component's markup is written once: React sites, the editors and saved posts all come from
 * it. An area is where content goes: `area( 'content', { className }, children )` renders a
 * `<div>`, or the element a host passes for it.
 * WHY a part with no content is left out: sample copy must never reach a live page.
 * WHY no hooks in the component: WordPress saves its markup, so it must render the same every time.
 */

import type {
	ComponentPropsWithoutRef,
	ElementType,
	ReactElement,
	ReactNode,
} from 'react';

import imageExample from '../../components/primitives/image/example.json' with { type: 'json' };
import type { ComponentDefinition } from '../schema/definition.ts';
import {
	resolveParts,
	type Kind,
	type PartDefinitions,
	type PartOf,
	type ResolvedPart,
} from '../schema/parts.ts';
import { findPreset, type Preset } from '../schema/presets.ts';
import {
	mediaProps,
	type PropDefinitions,
	type PropsOf,
} from '../schema/props.ts';
import { renderParts } from './parts.tsx';

// ── Props ──────────────────────────────────────────────────────────────────────────────────────
//
// What a framed component takes, on a React site and in a host.

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

/**
 * The HTML attributes a site may pass: a class, an id, style, `aria-*` and `data-*`.
 * WHY not every `<div>` attribute: there are about 270, and they buried the component's own props
 * in the editor's suggestions. Hosts need the rest (WordPress adds its own), so `Frame` takes them.
 */
type SiteAttributes = Pick<
	ComponentPropsWithoutRef< 'div' >,
	'className' | 'id' | 'style'
> & {
	[ attribute: `aria-${ string }` ]: string | number | boolean | undefined;
	[ attribute: `data-${ string }` ]: string | number | boolean | undefined;
};

/** Every `<div>` attribute. WHY HTML's `content` left out: ours is the parts' content. */
type HostAttributes = Omit<
	ComponentPropsWithoutRef< 'div' >,
	'children' | 'content'
>;

/** A component's own props, its children, and the HTML attributes a site may pass. */
export type OwnProps< Props extends PropDefinitions > = Partial<
	PropsOf< Props >
> &
	SiteAttributes & {
		/** What goes in the content area. */
		children?: ReactNode;
	};

/** What the component you write gets: its own props, any HTML attribute, and `area`. */
export type FrameProps< Props extends PropDefinitions > = OwnProps< Props > &
	HostAttributes & {
		/** Where content goes: `area( 'content', { className }, children )`. */
		area: Area;
	};

/** Any component's presets, for a component with props `Props` and parts `Parts`. */
type PresetsOf<
	Props extends PropDefinitions,
	Parts extends PartDefinitions,
> = readonly Preset< PropsOf< Props >, PartOf< Parts > >[];

/** The names of the parts a preset holds: `pathway` → `'eyebrow' | 'display' | …`. */
type PartsIn< Presets extends readonly { name: string }[], Name > =
	Extract< Presets[ number ], { name: Name } > extends {
		parts: readonly ( infer Part )[];
	}
		? Part extends { part: infer PartName }
			? PartName
			: never
		: never;

/**
 * What the component takes besides its props: a preset to start from, and its parts' content.
 * `Name` is the preset passed, so `content` takes only the parts that preset holds.
 */
export type PresetProps<
	Parts extends PartDefinitions,
	Presets extends readonly { name: string }[] = readonly { name: string }[],
	Name extends string = Presets[ number ][ 'name' ],
> = {
	/** A preset's name in the component's presets: its props and parts are the start. */
	preset?: Name;
	/**
	 * Each of the preset's parts' content, by name. A part left out isn't shown.
	 * WHY nothing without a preset: there are no parts to fill; pass `children`.
	 */
	content?: [ Name ] extends [ never ]
		? undefined
		: ContentOf< Pick< Parts, PartsIn< Presets, Name > & keyof Parts > >;
	/**
	 * Show the preset's sample text and image for parts with no content, and a sample background image
	 * where it has one.
	 */
	sample?: boolean;
};

/** The elements a host fills a component's areas with, by area name. */
export type Areas = Partial< Record< string, ElementType > >;

/**
 * An area: where content goes in the markup. A host's element takes the same props.
 *
 * @param name     Its name. Hosts fill the one named `content` with their editable content.
 * @param props    Its element's props: `className`, and `as`, the element on a React site (a
 *                 `<div>` by default; the Hero's image area is an `<Image>`).
 * @param children What a React site puts there.
 */
export type Area = ( (
	name: string,
	props: { as?: ElementType; className?: string; [ prop: string ]: unknown },
	children?: ReactNode
) => ReactElement ) & {
	/**
	 * Whether a host fills the area: the Hero shows its image frame while WordPress's picker is
	 * in it, before an image is chosen.
	 *
	 * @param name The area's name.
	 */
	hosted: ( name: string ) => boolean;
};

// ── Building one ───────────────────────────────────────────────────────────────────────────────

/** What a host reads: the definition, and the markup with its areas open. */
export type Port<
	Props extends PropDefinitions,
	Parts extends PartDefinitions,
	Presets extends PresetsOf< Props, Parts > = PresetsOf< Props, Parts >,
> = ComponentDefinition< Props, Parts, Presets > & {
	Frame: (
		props: OwnProps< Props > & HostAttributes & { areas?: Areas }
	) => ReactElement;
};

/** A type printed as one flat list, so a hover shows each prop and its values. */
type Flat< T > = { -readonly [ Key in keyof T ]: T[ Key ] } & {};

/** Anything with a port: what the translators take (wp/block.tsx, puck/config.tsx). */
export type Ported<
	Props extends PropDefinitions,
	Parts extends PartDefinitions,
> = { port: Port< Props, Parts > };

/**
 * A content component, from the component you write and what it is.
 *
 * @param Markup     Your component: its props and `area` in, its markup out.
 * @param definition What it is: slug, title, kind, props, parts, presets (schema/definition.ts).
 */
export function frame<
	Props extends PropDefinitions,
	Parts extends PartDefinitions,
	const Presets extends PresetsOf< Props, Parts >,
>(
	Markup: ( props: FrameProps< Props > ) => ReactElement,
	definition: ComponentDefinition< Props, Parts, Presets >
): {
	// WHY written out, not a named type: a hover on the component then lists its props.
	// WHY generic: TypeScript reads the preset passed (`preset="pathway"`) and narrows `content`.
	// WHY `preset` first: a hover is cut short, and the preset is what a site picks first.
	< PresetName extends Presets[ number ][ 'name' ] = never >(
		props: Flat<
			Pick< PresetProps< Parts, Presets, PresetName >, 'preset' > &
				OwnProps< Props > &
				Omit< PresetProps< Parts, Presets, PresetName >, 'preset' >
		>
	): ReactElement;
	displayName: string;
	port: Port< Props, Parts, Presets >;
} {
	// The prop a preset's sample background goes in: the first image prop (`imageSrc`).
	const backgroundProp = mediaProps( definition.props )[ 0 ];

	function Frame( {
		areas = {},
		...props
	}: OwnProps< Props > & HostAttributes & { areas?: Areas } ) {
		const area: Area = Object.assign(
			(
				name: string,
				{ as = 'div', ...areaProps }: Parameters< Area >[ 1 ],
				children?: ReactNode
			) => {
				const Element = areas[ name ] ?? as;
				return <Element { ...areaProps }>{ children }</Element>;
			},
			{ hosted: ( name: string ) => Boolean( areas[ name ] ) }
		);
		return <Markup { ...( props as FrameProps< Props > ) } area={ area } />;
	}
	Frame.displayName = `${ definition.title }.port.Frame`;

	function Component( {
		preset: name,
		content = {},
		sample = false,
		...props
	}: OwnProps< Props > & PresetProps< Parts, Presets > ) {
		if ( ! name ) {
			return <Frame { ...( props as OwnProps< Props > ) } />;
		}
		const preset = findPreset( definition.presets, name );
		const parts = fill(
			resolveParts( definition.parts, preset.parts ),
			preset.parts.map( ( part ) => part.part ),
			content as Record< string, unknown >,
			sample
		);
		return (
			<Frame
				{ ...( preset.props as OwnProps< Props > ) }
				// A sample background, as Puck and the stories show one.
				{ ...( sample &&
					preset.background &&
					backgroundProp && {
						[ backgroundProp ]: imageExample.url,
					} ) }
				{ ...( props as OwnProps< Props > ) }
			>
				{ props.children ?? renderParts( parts ) }
			</Frame>
		);
	}
	Component.displayName = definition.title;
	Component.port = { ...definition, Frame };
	// UPSTREAM: TypeScript can't check a function against a generic signature it narrows by.
	return Component as never;
}

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
