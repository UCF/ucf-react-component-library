/**
 * Step 5 · content · frame(): joins your markup to its parts and presets, and gives back the
 * component.
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

import type { ReactElement, ReactNode } from 'react';

import { SAMPLE as IMAGE_SAMPLE } from '@/components/primitives/image/Image.props';
import { mediaProps } from '../hosts/read-props.ts';
import type { PropDefinitions } from '../hosts/prop-definitions.ts';
import { resolveParts, findPreset } from './read-parts.ts';
import { renderParts } from './render-parts.tsx';
import type {
	Area,
	Areas,
	ComponentDefinition,
	FrameProps,
	HostAttributes,
	OwnProps,
	PartDefinitions,
	Port,
	PresetProps,
	PresetsOf,
	ResolvedPart,
} from './types.ts';

/** A type printed as one flat list, so a hover shows each prop and its values. */
type Flat< T > = { -readonly [ Key in keyof T ]: T[ Key ] } & {};

/**
 * A content component, from the component you write and what it is.
 *
 * @param Markup     Your component: its props and `area` in, its markup out.
 * @param definition What it is: slug, title, kind, props, parts, presets (types.ts).
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
						[ backgroundProp ]: IMAGE_SAMPLE.url,
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
					? { ...part, url: part.url ?? IMAGE_SAMPLE.url }
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
